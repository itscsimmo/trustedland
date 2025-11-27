import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@/app/generated/prisma";
import { z } from "zod";

const prisma = new PrismaClient();

const qualificationSchema = z.object({
  title: z.string().min(1),
  authority: z.string().optional(),
  credentialId: z.string().optional(),
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
        { error: "Only professionals can add qualifications" },
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
    const data = qualificationSchema.parse(body);

    const qualification = await prisma.qualification.create({
      data: {
        profileId: user.professional.id,
        title: data.title,
        authority: data.authority || null,
        credentialId: data.credentialId || null,
      },
    });

    return NextResponse.json({ qualification }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding qualification:", error);
    return NextResponse.json(
      { error: "Failed to add qualification" },
      { status: 500 }
    );
  }
}
