import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const profileSchema = z.object({
  companyName: z.string().optional(),
  bio: z.string().optional(),
  availabilityNote: z.string().optional(),
});

// GET /api/profile - Get professional profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional: {
          include: {
            qualifications: true,
            expertise: {
              include: {
                tag: true,
              },
            },
            portfolio: {
              include: {
                media: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: user.professional });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update professional profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Only professionals can update profiles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    // Find or create professional profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let profile;
    if (user.professional) {
      profile = await prisma.professionalProfile.update({
        where: { id: user.professional.id },
        data: {
          companyName: data.companyName || null,
          bio: data.bio || null,
          availabilityNote: data.availabilityNote || null,
        },
        include: {
          qualifications: true,
          expertise: {
            include: {
              tag: true,
            },
          },
          portfolio: true,
        },
      });
    } else {
      profile = await prisma.professionalProfile.create({
        data: {
          userId: userId,
          companyName: data.companyName || null,
          bio: data.bio || null,
          availabilityNote: data.availabilityNote || null,
        },
        include: {
          qualifications: true,
          expertise: {
            include: {
              tag: true,
            },
          },
          portfolio: true,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
