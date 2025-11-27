import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient, BidStatus } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const applicationSchema = z.object({
  proposalText: z.string().min(1),
  feeProposal: z.string().min(1),
  methodology: z.string().min(1),
  timeline: z.string().min(1),
  qualificationIds: z.array(z.string()).optional(),
  portfolioIds: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Only professionals can submit applications" },
        { status: 403 }
      );
    }

    // Get professional profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user || !user.professional) {
      return NextResponse.json(
        { error: "Professional profile not found" },
        { status: 404 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingBid = await prisma.bid.findUnique({
      where: {
        projectId_professionalId: {
          projectId: params.projectId,
          professionalId: user.professional.id,
        },
      },
    });

    if (existingBid) {
      return NextResponse.json(
        { error: "You have already submitted an application for this project" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = applicationSchema.parse(body);

    // Create the application/bid with full proposal details
    const fullProposal = `
${data.proposalText}

--- FEE PROPOSAL ---
${data.feeProposal}

--- METHODOLOGY & APPROACH ---
${data.methodology}

--- PROPOSED TIMELINE ---
${data.timeline}

--- SELECTED QUALIFICATIONS ---
${data.qualificationIds?.length ?
  (await prisma.qualification.findMany({
    where: { id: { in: data.qualificationIds } },
    select: { title: true, authority: true }
  })).map(q => `- ${q.title}${q.authority ? ` (${q.authority})` : ''}`).join('\n')
  : 'None selected'}

--- SELECTED PORTFOLIO ITEMS ---
${data.portfolioIds?.length ?
  (await prisma.portfolioItem.findMany({
    where: { id: { in: data.portfolioIds } },
    select: { title: true, description: true, location: true, units: true }
  })).map(p => `- ${p.title}${p.location ? ` (${p.location})` : ''}${p.units ? `, ${p.units} units` : ''}`).join('\n')
  : 'None selected'}
    `.trim();

    const application = await prisma.bid.create({
      data: {
        projectId: params.projectId,
        professionalId: user.professional.id,
        status: BidStatus.SUBMITTED,
        proposalText: fullProposal,
        submittedAt: new Date(),
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
