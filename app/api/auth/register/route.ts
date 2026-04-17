import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, phoneNumber, password, role, monthlyAllowance } = await req.json();

    if (!name || !email || !password || monthlyAllowance === undefined) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const parsedMonthlyAllowance = Number(monthlyAllowance);
    if (!Number.isFinite(parsedMonthlyAllowance) || parsedMonthlyAllowance <= 0) {
      return new NextResponse("Monthly allowance must be a valid number", { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure role is uppercase to match schema (STUDENT or CANTEEN_ADMIN)
    const userRole = role === "vendor" ? "CANTEEN_ADMIN" : "STUDENT";
    const savingsGoal = Math.max(500, Math.round(parsedMonthlyAllowance * 0.2));
    const dailyBudget = Math.max(
      10,
      Math.round((parsedMonthlyAllowance - savingsGoal) / 30)
    );

    const user = await db.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        role: userRole,
        tokenBalance: 0,
        dailyBudget,
        savingsGoal,
      }
    });

    return NextResponse.json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
