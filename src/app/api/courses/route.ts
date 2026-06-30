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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: any = { userId: user.id };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { platform: { contains: search, mode: "insensitive" } },
      { instructor: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = { in: status.split(",") };
  }

  if (platform) {
    where.platform = { in: platform.split(",") };
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { [sort]: order },
  });

  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const course = await prisma.course.create({
    data: {
      ...body,
      userId: user.id,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      deadline: body.deadline ? new Date(body.deadline) : null,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
