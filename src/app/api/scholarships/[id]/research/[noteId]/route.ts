import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scholarship = await prisma.scholarship.findUnique({ where: { id: params.id } });
  if (!scholarship) {
    return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || scholarship.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.scholarshipResearch.findUnique({ where: { id: params.noteId } });
  if (!note || note.scholarshipId !== params.id) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scholarship = await prisma.scholarship.findUnique({ where: { id: params.id } });
  if (!scholarship) {
    return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || scholarship.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.scholarshipResearch.findUnique({ where: { id: params.noteId } });
  if (!note || note.scholarshipId !== params.id) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.scholarshipResearch.update({
    where: { id: params.noteId },
    data: {
      category: body.category,
      title: body.title,
      content: body.content,
      links: body.links || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; noteId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scholarship = await prisma.scholarship.findUnique({ where: { id: params.id } });
  if (!scholarship) {
    return NextResponse.json({ error: "Scholarship not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || scholarship.userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = await prisma.scholarshipResearch.findUnique({ where: { id: params.noteId } });
  if (!note || note.scholarshipId !== params.id) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await prisma.scholarshipResearch.delete({ where: { id: params.noteId } });
  return NextResponse.json({ success: true });
}
