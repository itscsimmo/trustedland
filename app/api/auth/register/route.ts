import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@/app/generated/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  role: z.enum(["DEVELOPER", "PROFESSIONAL"]),
  // Optional fields for developers
  orgName: z.string().optional(),
  // Optional fields for professionals
  companyName: z.string().optional(),
  profession: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with role-specific data
    if (data.role === "DEVELOPER") {
      // Create developer org if orgName provided
      if (data.orgName) {
        const user = await prisma.user.create({
          data: {
            email: data.email,
            hashedPassword,
            fullName: data.fullName,
            role: UserRole.DEVELOPER,
            developerOrg: {
              create: {
                name: data.orgName,
              },
            },
          },
          include: {
            developerOrg: true,
          },
        });

        return NextResponse.json(
          {
            message: "Developer account created successfully",
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
            },
          },
          { status: 201 }
        );
      } else {
        const user = await prisma.user.create({
          data: {
            email: data.email,
            hashedPassword,
            fullName: data.fullName,
            role: UserRole.DEVELOPER,
          },
        });

        return NextResponse.json(
          {
            message: "Developer account created successfully",
            user: {
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
            },
          },
          { status: 201 }
        );
      }
    } else {
      // Create professional profile
      const user = await prisma.user.create({
        data: {
          email: data.email,
          hashedPassword,
          fullName: data.fullName,
          role: UserRole.PROFESSIONAL,
          professional: {
            create: {
              companyName: data.companyName || null,
              profession: data.profession || null,
            },
          },
        },
        include: {
          professional: true,
        },
      });

      return NextResponse.json(
        {
          message: "Professional account created successfully",
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
