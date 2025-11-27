import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient, TaskStatus, RIBAStage } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  ribaStage: z
    .enum([
      "STAGE_0",
      "STAGE_1",
      "STAGE_2",
      "STAGE_3",
      "STAGE_4",
      "STAGE_5",
      "STAGE_6",
      "STAGE_7",
    ])
    .optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

// GET /api/projects/[projectId]/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: projectId },
      include: {
        assignee: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: "asc" }, { orderIndex: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = taskSchema.parse(body);

    // Get the highest orderIndex for the status
    const lastTask = await prisma.task.findFirst({
      where: {
        projectId: projectId,
        status: (data.status as TaskStatus) || TaskStatus.BACKLOG,
      },
      orderBy: { orderIndex: "desc" },
    });

    const orderIndex = lastTask ? lastTask.orderIndex + 1 : 0;

    const task = await prisma.task.create({
      data: {
        projectId: projectId,
        title: data.title,
        description: data.description || null,
        status: (data.status as TaskStatus) || TaskStatus.BACKLOG,
        ribaStage: data.ribaStage ? (data.ribaStage as RIBAStage) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
        orderIndex,
      },
      include: {
        assignee: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/tasks - Update task status/order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, status, orderIndex } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status as TaskStatus;
    if (typeof orderIndex === "number") updateData.orderIndex = orderIndex;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
