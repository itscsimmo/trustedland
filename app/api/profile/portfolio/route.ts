import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const portfolioSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  units: z.number().int().positive().optional(),
  coverImageUrl: z.string().optional(), // Base64 encoded image
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Only professionals can add portfolio items" },
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

    const body = await request.json();
    const data = portfolioSchema.parse(body);

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        profileId: user.professional.id,
        title: data.title,
        description: data.description || null,
        location: data.location || null,
        units: data.units || null,
        coverImageUrl: data.coverImageUrl || null,
      },
    });

    return NextResponse.json({ portfolioItem }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to add portfolio item" },
      { status: 500 }
    );
  }
}
