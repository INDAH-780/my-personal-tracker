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
    `fully funded international master's PhD scholarship computer engineering electrical engineering ${nextCycle}`,
    `fully funded international scholarship artificial intelligence machine learning master's PhD ${nextCycle}`,
    `fully funded robotics embedded systems TinyML scholarship master's PhD ${nextCycle}`,
    `Africa scholarship master's PhD AI engineering international students ${nextCycle}`,
    `Europe scholarship master's PhD AI robotics embedded systems international students ${nextCycle}`,
    `Australia scholarship master's PhD computer engineering machine learning international students ${nextCycle}`,
    `Asia scholarship master's PhD electrical engineering artificial intelligence international students ${nextCycle}`,
    `Americas scholarship master's PhD computer engineering AI international students ${nextCycle}`,
    `MBA artificial intelligence scholarship international students ${nextCycle}`,
    `Mastercard Foundation Scholars Program partner universities master's computer engineering electrical engineering AI robotics ${nextCycle}`,
    `"Mastercard Foundation Scholars Program" master's artificial intelligence machine learning embedded systems ${nextCycle}`,
    `site:mastercardfdn.org scholars program university partners graduate engineering technology ${nextCycle}`,
    `university "Mastercard Foundation Scholars Program" postgraduate engineering computer science ${nextCycle}`,
    `site:harvard.edu graduate scholarship fellowship international students computer science engineering ${nextCycle}`,
    `site:yale.edu graduate scholarship fellowship international students computer science engineering ${nextCycle}`,
    `site:princeton.edu graduate funding fellowship international students computer science engineering ${nextCycle}`,
    `site:columbia.edu graduate scholarship fellowship international students computer engineering AI ${nextCycle}`,
    `site:upenn.edu graduate scholarship fellowship international students engineering AI ${nextCycle}`,
    `site:brown.edu graduate scholarship fellowship international students computer science engineering ${nextCycle}`,
    `site:dartmouth.edu graduate scholarship fellowship international students engineering computer science ${nextCycle}`,
    `site:cornell.edu graduate scholarship fellowship international students engineering AI ${nextCycle}`,
    `university graduate school funded master's PhD international students AI machine learning ${nextCycle}`,
    `computer science engineering department fellowship assistantship international graduate students ${nextCycle}`,
    `funded PhD studentship robotics embedded systems international applicants ${nextCycle}`,
  ];
}

export async function extractScholarships(results: SearchResult[]): Promise<DiscoveredScholarship[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  if (results.length === 0) return [];

  const batches = chunk(results, 10);
  const extractedBatches = await mapWithConcurrency(batches, 3, async (batch) => {
    const model = process.env.GEMINI_EXTRACTION_MODEL || "gemini-2.5-flash-lite";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "Extract genuine graduate funding opportunities from search results. Keep Master's, PhD, or AI-focused MBA scholarships, fellowships, grants, tuition awards, funded studentships, and clearly funded graduate programmes relevant to computer engineering, electrical engineering, robotics, AI, machine learning, embedded systems, TinyML, or closely related ML systems. Include official university, graduate-school, department, and financial-aid pages when they identify a real funding route for international graduate applicants, even if the funding is embedded within admission rather than branded as a scholarship. For umbrella schemes such as the Mastercard Foundation Scholars Program, do not create one generic record. First identify a participating university, then verify that university offers an eligible Master's programme aligned with the target fields, and only then create a separate record for that university/programme combination. Format its name as 'Mastercard Foundation Scholars Program – [University] – [Programme]', set organization to the university, use the university's official scholarship or application URL, and describe both the programme fit and Mastercard funding. Do not return a Mastercard partner whose covered programmes do not align with the target fields. Reject news articles, expired opportunities, unsupported listicles, undergraduate-only awards, loans, and pages without a credible official or primary source. Never invent missing facts or infer that a programme is funded merely because its university is a partner. Return JSON with a scholarships array. Each item must contain name, organization, url, amount, studyLevel, fields (array), deadline (YYYY-MM-DD or null), eligibilityCriteria, requirements, description, region, and confidence (0 to 1).",
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
      if (normalized && normalized.confidence >= 0.65) extracted.push(normalized);
    }
    return extracted;
  });

  return deduplicateScholarships(extractedBatches.flat());
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
