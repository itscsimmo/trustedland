import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

// DELETE - Remove a nominated professional (PRIVATE - only project owner/admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; assignmentId: string }> }
) {
  try {
    const { projectId, assignmentId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if assignment exists and get project info
    const assignment = await prisma.projectProfessional.findUnique({
      where: { id: assignmentId },
      include: {
        project: {
          include: {
            developer: {
              include: {
                users: {
                  where: { id: userId },
                },
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Verify assignment belongs to the specified project
    if (assignment.projectId !== projectId) {
      return NextResponse.json(
        { error: "Assignment does not belong to this project" },
        { status: 400 }
      );
    }

    // Only project owner's org members or admins can remove
    const isProjectMember = assignment.project.developer.users.length > 0;
    const isAdmin = userRole === "ADMIN";

    if (!isProjectMember && !isAdmin) {
      return NextResponse.json(
        { error: "You don't have permission to remove professionals from this project" },
        { status: 403 }
      );
    }

    // Delete the assignment
    await prisma.projectProfessional.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json(
      { message: "Professional removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing professional:", error);
    return NextResponse.json(
      { error: "Failed to remove professional" },
      { status: 500 }
    );
  }
}
