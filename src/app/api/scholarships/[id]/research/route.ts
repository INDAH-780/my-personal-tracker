import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

  const research = await prisma.scholarshipResearch.findMany({
    where: { scholarshipId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(research);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  const body = await req.json();
  const research = await prisma.scholarshipResearch.create({
    data: {
      scholarshipId: params.id,
      category: body.category || "GENERAL",
      title: body.title,
      content: body.content,
      links: body.links || null,
    },
  });

  return NextResponse.json(research, { status: 201 });
}
