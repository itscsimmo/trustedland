import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient, RIBAStage } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  siteAddress: z.string().optional(),
  localAuthority: z.string().optional(),
  unitsPlanned: z.number().int().positive().optional(),
  budgetEstimate: z.number().int().positive().optional(),
  currentStage: z.enum([
    "STAGE_0",
    "STAGE_1",
    "STAGE_2",
    "STAGE_3",
    "STAGE_4",
    "STAGE_5",
    "STAGE_6",
    "STAGE_7",
  ]).optional(),
});

// GET /api/projects - List projects or get single project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Check if requesting a single project
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (projectId) {
      // Fetch single project
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          developer: true,
          _count: {
            select: {
              tasks: true,
              documents: true,
              bids: true,
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ projects: [project] });
    }

    // Get user with their developer org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerOrg: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Developers see their org's projects
    if (userRole === "DEVELOPER" && user.developerOrgId) {
      const projects = await prisma.project.findMany({
        where: { developerId: user.developerOrgId },
        include: {
          developer: true,
          _count: {
            select: {
              tasks: true,
              documents: true,
              bids: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ projects });
    }

    // Professionals see all projects (for bidding)
    if (userRole === "PROFESSIONAL") {
      const projects = await prisma.project.findMany({
        include: {
          developer: true,
          _count: {
            select: {
              tasks: true,
              documents: true,
              bids: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ projects });
    }

    return NextResponse.json({ projects: [] });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== "DEVELOPER") {
      return NextResponse.json(
        { error: "Only developers can create projects" },
        { status: 403 }
      );
    }

    // Get user with their developer org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { developerOrg: true },
    });

    if (!user || !user.developerOrgId) {
      return NextResponse.json(
        { error: "Developer organization not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        developerId: user.developerOrgId,
        title: data.title,
        description: data.description || null,
        siteAddress: data.siteAddress || null,
        localAuthority: data.localAuthority || null,
        unitsPlanned: data.unitsPlanned || null,
        budgetEstimate: data.budgetEstimate || null,
        currentStage: (data.currentStage as RIBAStage) || RIBAStage.STAGE_0,
      },
      include: {
        developer: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
