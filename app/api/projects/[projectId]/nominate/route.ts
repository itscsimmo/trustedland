import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const nominateSchema = z.object({
  professionalId: z.string().min(1),
  roleDescription: z.string().min(1),
});

// POST - Nominate a professional for a project (PRIVATE - only project owner/admin)
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

    // Check if project exists and user has permission
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        developer: {
          include: {
            users: {
              where: { id: userId },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only project owner's org members or admins can nominate
    const isProjectMember = project.developer.users.length > 0;
    const isAdmin = userRole === "ADMIN";

    if (!isProjectMember && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to nominate professionals for this project" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = nominateSchema.parse(body);

    // Check if professional exists
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: data.professionalId },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Check if already nominated
    const existing = await prisma.projectProfessional.findFirst({
      where: {
        projectId: params.projectId,
        professionalId: data.professionalId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This professional is already nominated for this project" },
        { status: 400 }
      );
    }

    // Create nomination
    const nomination = await prisma.projectProfessional.create({
      data: {
        projectId: params.projectId,
        professionalId: data.professionalId,
        roleDescription: data.roleDescription,
        appointedAt: new Date(),
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ nomination }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error nominating professional:", error);
    return NextResponse.json(
      { error: "Failed to nominate professional" },
      { status: 500 }
    );
  }
}
