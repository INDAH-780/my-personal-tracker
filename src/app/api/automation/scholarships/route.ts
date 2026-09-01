import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractScholarships,
  scholarshipFingerprint,
  searchScholarships,
} from "@/lib/scholarship-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = process.env.AUTOMATION_USER_EMAIL;
  if (!userEmail) {
    return NextResponse.json({ error: "AUTOMATION_USER_EMAIL is not configured" }, { status: 500 });
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return NextResponse.json({ error: "Automation user was not found" }, { status: 404 });
  }

  try {
    const searchResults = await searchScholarships();
    const discovered = await extractScholarships(searchResults);
    const now = new Date();
    let created = 0;
    let updated = 0;

    for (const item of discovered) {
      const discoveryFingerprint = scholarshipFingerprint(item);
      const existing = await prisma.scholarship.findUnique({
        where: {
          userId_discoveryFingerprint: {
            userId: user.id,
            discoveryFingerprint,
          },
        },
        select: { id: true },
      });

      const data = {
        name: item.name,
        organization: item.organization,
        url: item.url,
        amount: item.amount,
        major: item.fields.join(", ") || null,
        minor: item.studyLevel,
        deadline: item.deadline ? new Date(`${item.deadline}T00:00:00.000Z`) : null,
        eligibilityCriteria: item.eligibilityCriteria,
        requirements: item.requirements,
        description: item.description,
        tags: [item.region, ...item.fields, item.studyLevel].filter(Boolean).join(", "),
        discoverySource: "Tavily + Gemini",
        discoveryFingerprint,
        lastVerifiedAt: now,
      };

      if (existing) {
        const updateData = Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== null && value !== ""),
        );
        await prisma.scholarship.update({ where: { id: existing.id }, data: updateData });
        updated += 1;
      } else {
        await prisma.scholarship.create({
          data: {
            ...data,
            userId: user.id,
            status: "WISHLIST",
            discoveredAt: now,
          },
        });
        created += 1;
      }
    }

    return NextResponse.json({
      success: true,
      searchedResults: searchResults.length,
      qualifiedScholarships: discovered.length,
      created,
      updated,
      completedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Scholarship discovery failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scholarship discovery failed" },
      { status: 500 },
    );
  }
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
