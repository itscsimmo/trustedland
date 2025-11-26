import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { professionalId: string } }
) {
  try {
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: params.professionalId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        qualifications: {
          orderBy: {
            issuedAt: "desc",
          },
        },
        portfolio: {
          include: {
            media: true,
          },
          orderBy: {
            endDate: "desc",
          },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ professional }, { status: 200 });
  } catch (error) {
    console.error("Error fetching professional:", error);
    return NextResponse.json(
      { error: "Failed to fetch professional" },
      { status: 500 }
    );
  }
}
