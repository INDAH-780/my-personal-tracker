import { createHash } from "crypto";

export type SearchResult = {
  title: string;
  url: string;
  content: string;
};

export type DiscoveredScholarship = {
  name: string;
  organization: string;
  url: string;
  amount: string | null;
  studyLevel: string | null;
  fields: string[];
  deadline: string | null;
  eligibilityCriteria: string | null;
  requirements: string | null;
  description: string | null;
  region: string | null;
  confidence: number;
};

export async function searchScholarships(): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

  const maxQueries = positiveInt(process.env.SCHOLARSHIP_SEARCH_MAX_QUERIES, 20);
  const maxResults = positiveInt(process.env.SCHOLARSHIP_SEARCH_RESULTS_PER_QUERY, 12);
  const searchQueries = scholarshipSearchQueries();
  const responses = await Promise.all(
    searchQueries.slice(0, maxQueries).map(async (query) => {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          max_results: maxResults,
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily search failed with status ${response.status}`);
      }

      const data = (await response.json()) as { results?: SearchResult[] };
      return data.results || [];
    }),
  );

  const unique = new Map<string, SearchResult>();
  for (const result of responses.flat()) {
    const url = canonicalUrl(result.url);
    if (url && !unique.has(url)) unique.set(url, { ...result, url });
  }
  return Array.from(unique.values());
}

function scholarshipSearchQueries(): string[] {
  const nextCycle = new Date().getUTCFullYear() + 1;
  return [
    `fully funded master's scholarship computer engineering electrical engineering international students Cameroon ${nextCycle}`,
    `Mastercard Foundation Scholars Program master's engineering computer science AI partner universities ${nextCycle}`,
    `site:mastercardfdn.org "Master's" Scholars Program engineering technology university partners ${nextCycle}`,
    `DAAD scholarship master's STEM engineering computer science Cameroon ${nextCycle}`,
    `DAAD EPOS master's artificial intelligence computer engineering Cameroon ${nextCycle}`,
    `Fulbright Foreign Student Cameroon master's computer engineering artificial intelligence ${nextCycle}`,
    `MEXT scholarship master's research student computer engineering AI Cameroon ${nextCycle}`,
    `Chinese Government Scholarship CSC master's artificial intelligence electrical engineering Cameroon ${nextCycle}`,
    `site:fens.sabanciuniv.edu master's scholarship computer science engineering international students ${nextCycle}`,
    `Schwarzman Scholars master's scholarship Cameroon ${nextCycle}`,
    `Erasmus Mundus joint master's scholarship artificial intelligence robotics embedded systems ${nextCycle}`,
    `Türkiye Scholarships master's computer engineering artificial intelligence Cameroon ${nextCycle}`,
    `Stipendium Hungaricum master's computer engineering AI Cameroon ${nextCycle}`,
    `Swedish Institute scholarship master's AI engineering Cameroon ${nextCycle}`,
    `Eiffel Excellence scholarship master's artificial intelligence engineering Cameroon ${nextCycle}`,
    `Commonwealth master's scholarship Cameroon computer engineering AI ${nextCycle}`,
    `site:ubc.ca Mastercard Foundation master's scholarship engineering computer science ${nextCycle}`,
    `site:berkeley.edu Mastercard Foundation master's scholarship engineering computer science ${nextCycle}`,
    `site:nycu.edu.tw international master's scholarship electrical engineering computer science Cameroon ${nextCycle}`,
    `site:ashesi.edu.gh Mastercard Foundation master's engineering technology scholarship ${nextCycle}`,
  ];
}

export async function extractScholarships(results: SearchResult[]): Promise<DiscoveredScholarship[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (results.length === 0) return [];
  const applicantCountry = process.env.SCHOLARSHIP_APPLICANT_COUNTRY || "Cameroon";

  const batches = chunk(results, 30);
  const extractedBatches = await mapWithConcurrency(batches, 1, async (batch) => {
    const model = process.env.GEMINI_EXTRACTION_MODEL || "gemini-3.6-flash";
    const response = await fetchGeminiWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `Extract genuine MASTER'S-LEVEL funding opportunities for an applicant from ${applicantCountry}. Do not return PhD, doctoral, undergraduate, postdoctoral, or PhD-only opportunities. A scheme that funds multiple levels may be returned only when the source verifies an eligible Master's route; set studyLevel to "Master's". Keep Master's scholarships, fellowships, grants, tuition awards, funded programmes, and MBA scholarships relevant to computer engineering, electrical engineering, robotics, AI, machine learning, embedded systems, TinyML, closely related ML systems, or technology leadership. Verify that applicants from ${applicantCountry} are eligible; reject awards restricted to other nationalities or regions. Include official university, government, programme, graduate-school, department, and financial-aid pages when they identify a real Master's funding route for international applicants. For umbrella schemes such as Mastercard Foundation, DAAD, Fulbright, MEXT, CSC, or Erasmus Mundus, prefer a programme-specific record. For Mastercard, identify a participating university, verify that its covered Master's programme aligns with the target fields, and create a separate record named 'Mastercard Foundation Scholars Program – [University] – [Programme]'. Never assume every programme at a partner university is covered. Use official or primary application URLs wherever possible. Reject news articles, expired opportunities, unsupported listicles, undergraduate-only awards, loans, unfunded admission pages, and any page without a credible primary source. Never invent a deadline, coverage, programme fit, or eligibility fact. Return JSON with a scholarships array. Each item must contain name, organization, url, amount, studyLevel (always "Master's"), fields (array), deadline (YYYY-MM-DD or null), eligibilityCriteria, requirements, description, region, and confidence (0 to 1).`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(batch) }],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini extraction failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return [];

    const parsed = JSON.parse(content) as { scholarships?: DiscoveredScholarship[] };
    const extracted: DiscoveredScholarship[] = [];
    for (const scholarship of parsed.scholarships || []) {
      const normalized = normalizeScholarship(scholarship);
      if (normalized && normalized.confidence >= 0.65 && isMastersOpportunity(normalized)) {
        extracted.push({ ...normalized, studyLevel: "Master's" });
      }
    }
    return extracted;
  });

  return deduplicateScholarships(extractedBatches.flat());
}

function isMastersOpportunity(scholarship: DiscoveredScholarship): boolean {
  const level = scholarship.studyLevel?.toLowerCase() || "";
  return /master|\bmsc\b|\bm\.sc\b|\bmeng\b|\bmba\b/.test(level);
}

export function scholarshipFingerprint(scholarship: DiscoveredScholarship): string {
  const identity = `${scholarship.name}|${scholarship.organization}|${canonicalUrl(scholarship.url)}`.toLowerCase();
  return createHash("sha256").update(identity).digest("hex");
}

function normalizeScholarship(value: DiscoveredScholarship): DiscoveredScholarship | null {
  if (!value?.name?.trim() || !value?.organization?.trim() || !value?.url) return null;
  const url = canonicalUrl(value.url);
  if (!url) return null;

  return {
    name: value.name.trim(),
    organization: value.organization.trim(),
    url,
    amount: cleanOptional(value.amount),
    studyLevel: cleanOptional(value.studyLevel),
    fields: Array.isArray(value.fields) ? value.fields.map(String).map((item) => item.trim()).filter(Boolean) : [],
    deadline: validDate(value.deadline),
    eligibilityCriteria: cleanOptional(value.eligibilityCriteria),
    requirements: cleanOptional(value.requirements),
    description: cleanOptional(value.description),
    region: cleanOptional(value.region),
    confidence: Number.isFinite(Number(value.confidence)) ? Number(value.confidence) : 0,
  };
}

function deduplicateScholarships(values: DiscoveredScholarship[]): DiscoveredScholarship[] {
  const unique = new Map<string, DiscoveredScholarship>();
  for (const value of values) {
    const key = scholarshipFingerprint(value);
    const existing = unique.get(key);
    if (!existing || value.confidence > existing.confidence) unique.set(key, value);
  }
  return Array.from(unique.values());
}

function canonicalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (key.startsWith("utm_") || ["gclid", "fbclid"].includes(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function cleanOptional(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : value;
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function chunk<T>(values: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < values.length; index += size) batches.push(values.slice(index, index + size));
  return batches;
}

async function fetchGeminiWithRetry(url: string, init: RequestInit): Promise<Response> {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(url, init);
    if (response.status !== 429 || attempt === maxAttempts - 1) return response;

    const retryAfter = Number.parseInt(response.headers.get("retry-after") || "", 10);
    const delayMs = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : 10_000 * 2 ** attempt;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Gemini retry attempts exhausted");
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}
