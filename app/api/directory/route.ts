import { NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const professionals = await prisma.professionalProfile.findMany({
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        qualifications: {
          select: {
            id: true,
            title: true,
            authority: true,
          },
        },
        portfolio: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
      orderBy: {
        ratingAverage: "desc",
      },
    });

    return NextResponse.json({ professionals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching professionals:", error);
    return NextResponse.json(
      { error: "Failed to fetch professionals" },
      { status: 500 }
    );
  }
}
