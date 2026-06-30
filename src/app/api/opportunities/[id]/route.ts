import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, userId: user.id },
    include: { statusHistory: { orderBy: { changedAt: "asc" } }, diaryEntries: { orderBy: { date: "desc" } } },
  });

  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(opportunity);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.opportunity.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, category, organization, websiteUrl, applicationUrl, status, deadline, startDate, endDate, region, tags, funding, description, personalNotes, programStatus, dropReason, certificateUrl, certificateName } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (category !== undefined) data.category = category;
  if (organization !== undefined) data.organization = organization;
  if (websiteUrl !== undefined) data.websiteUrl = websiteUrl;
  if (applicationUrl !== undefined) data.applicationUrl = applicationUrl;
  if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
  if (region !== undefined) data.region = region;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.join(",") : tags;
  if (funding !== undefined) data.funding = funding;
  if (description !== undefined) data.description = description;
  if (personalNotes !== undefined) data.personalNotes = personalNotes;
  if (programStatus !== undefined) data.programStatus = programStatus;
  if (dropReason !== undefined) data.dropReason = dropReason;
  if (certificateUrl !== undefined) data.certificateUrl = certificateUrl;
  if (certificateName !== undefined) data.certificateName = certificateName;

  if (status !== undefined && status !== existing.status) {
    data.status = status;
    await prisma.statusHistory.create({
      data: { opportunityId: params.id, fromStatus: existing.status, toStatus: status },
    });
  }

  const updated = await prisma.opportunity.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.opportunity.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.opportunity.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
