import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { id: (session.user as any).id },
    select: { tokenBalance: true, dailyBudget: true, savingsGoal: true },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  return NextResponse.json({ balance: user.tokenBalance, dailyBudget: user.dailyBudget, savingsGoal: user.savingsGoal });
}
