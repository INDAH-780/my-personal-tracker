import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [totalOpps, statusCounts, categoryCounts, fundingCounts, regionCounts, recentOpps, upcomingDeadlines, diaryCount, diaryTypeCounts, courseCount, scholarshipCount] = await Promise.all([
    prisma.opportunity.count({ where: { userId: user.id } }),
    prisma.opportunity.groupBy({ by: ["status"], where: { userId: user.id }, _count: true }),
    prisma.opportunity.groupBy({ by: ["category"], where: { userId: user.id }, _count: true }),
    prisma.opportunity.groupBy({ by: ["funding"], where: { userId: user.id }, _count: true }),
    prisma.opportunity.groupBy({ by: ["region"], where: { userId: user.id }, _count: true }),
    prisma.opportunity.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.opportunity.findMany({ where: { userId: user.id, deadline: { gte: new Date() } }, orderBy: { deadline: "asc" }, take: 5 }),
    prisma.diaryEntry.count({ where: { userId: user.id } }),
    prisma.diaryEntry.groupBy({ by: ["type"], where: { userId: user.id }, _count: true }),
    prisma.course.count({ where: { userId: user.id } }),
    prisma.scholarship.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    totalOpps,
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count })),
    categoryCounts: categoryCounts.map((c) => ({ category: c.category, count: c._count })),
    fundingCounts: fundingCounts.map((f) => ({ funding: f.funding, count: f._count })),
    regionCounts: regionCounts.map((r) => ({ region: r.region, count: r._count })),
    recentOpps,
    upcomingDeadlines,
    diaryCount,
    diaryTypeCounts: diaryTypeCounts.map((d) => ({ type: d.type, count: d._count })),
    courseCount,
    scholarshipCount,
  });
}
