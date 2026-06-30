import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const linkedOppId = searchParams.get("linkedOppId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const search = searchParams.get("search");

  const where: any = { userId: user.id };
  if (type) where.type = { in: type.split(",") };
  if (linkedOppId) where.linkedOppId = linkedOppId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }
  if (dateFrom || dateTo) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    where.date = dateFilter;
  }

  const entries = await prisma.diaryEntry.findMany({
    where,
    orderBy: { date: "desc" },
    include: { opportunity: { select: { id: true, name: true } } },
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const { title, date, type, content, linkedOppId, mood, tags } = body;

  if (!title || !type || !content) {
    return NextResponse.json({ error: "Title, type, and content are required" }, { status: 400 });
  }

  const entry = await prisma.diaryEntry.create({
    data: {
      userId: user.id,
      title,
      date: date ? new Date(date) : new Date(),
      type,
      content,
      linkedOppId: linkedOppId || null,
      mood: mood || null,
      tags: tags ? (Array.isArray(tags) ? tags.join(",") : tags) : null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
