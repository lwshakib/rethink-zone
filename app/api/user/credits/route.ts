import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user and check for credit reset
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Lazy Credit Reset Logic
    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);

    // Check if lastReset was before today at 12:00 AM
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    if (lastReset < todayMidnight) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: 10,
          lastCreditReset: now,
        },
      });
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
