import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const funding = searchParams.get("funding");
  const region = searchParams.get("region");
  const tags = searchParams.get("tags");
  const search = searchParams.get("search");
  const dateType = searchParams.get("dateType");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sort = searchParams.get("sort") || "deadline";
  const order = searchParams.get("order") || "asc";

  const where: any = { userId: user.id };

  if (category) where.category = { in: category.split(",") };
  if (status) where.status = { in: status.split(",") };
  if (funding) where.funding = { in: funding.split(",") };
  if (region) where.region = { in: region.split(",") };
  if (tags) where.tags = { contains: tags.split(",")[0] };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { organization: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (dateFrom || dateTo) {
    const dateField = dateType === "startDate" ? "startDate" : dateType === "endDate" ? "endDate" : dateType === "dateAdded" ? "createdAt" : "deadline";
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    where[dateField] = dateFilter;
  }

  const orderBy: Record<string, string> = {};
  if (sort === "name") orderBy.name = order;
  else if (sort === "createdAt") orderBy.createdAt = order;
  else if (sort === "status") orderBy.status = order;
  else orderBy.deadline = order;

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy,
    include: { statusHistory: { orderBy: { changedAt: "desc" }, take: 1 } },
  });

  return NextResponse.json(opportunities);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { name, category, organization, websiteUrl, applicationUrl, status, deadline, startDate, endDate, region, tags, funding, description, personalNotes } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      userId: user.id,
      name,
      category,
      organization: organization || "",
      websiteUrl,
      applicationUrl,
      status: status || "WISHLIST",
      deadline: deadline ? new Date(deadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      region,
      tags: tags ? (Array.isArray(tags) ? tags.join(",") : tags) : null,
      funding,
      description,
      personalNotes,
    },
  });

  await prisma.statusHistory.create({
    data: {
      opportunityId: opportunity.id,
      toStatus: opportunity.status,
      note: "Created",
    },
  });

  return NextResponse.json(opportunity, { status: 201 });
}
