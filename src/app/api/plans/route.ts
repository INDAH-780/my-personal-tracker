import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const where: any = { userId: user.id };
  if (type) where.type = type;

  const plans = await prisma.plan.findMany({
    where,
    include: { goals: { orderBy: { createdAt: "asc" } } },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan = await prisma.plan.create({
    data: {
      userId: user.id,
      title: body.title,
      type: body.type,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      vision: body.vision || null,
    },
    include: { goals: true },
  });

  return NextResponse.json(plan, { status: 201 });
}
