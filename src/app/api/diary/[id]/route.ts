import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const entry = await prisma.diaryEntry.findFirst({
    where: { id: params.id, userId: user.id },
    include: { opportunity: { select: { id: true, name: true } } },
  });

  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.diaryEntry.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, date, type, content, linkedOppId, mood, tags } = body;

  const data: any = {};
  if (title !== undefined) data.title = title;
  if (date !== undefined) data.date = new Date(date);
  if (type !== undefined) data.type = type;
  if (content !== undefined) data.content = content;
  if (linkedOppId !== undefined) data.linkedOppId = linkedOppId || null;
  if (mood !== undefined) data.mood = mood || null;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.join(",") : tags;

  const updated = await prisma.diaryEntry.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.diaryEntry.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.diaryEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
