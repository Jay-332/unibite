import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [user, daily] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { dailyBudget: true, savingsGoal: true, tokenBalance: true } }),
    db.dailySpending.findUnique({ where: { userId_date: { userId, date: today } } }),
  ]);

  return NextResponse.json({
    dailyBudget: user?.dailyBudget || 0,
    savingsGoal: user?.savingsGoal || 0,
    tokenBalance: user?.tokenBalance || 0,
    totalSpent: daily?.totalSpent || 0,
    orderCount: daily?.orderCount || 0,
    isOverBudget: daily?.isOverBudget || false,
    remaining: (user?.dailyBudget || 0) - (daily?.totalSpent || 0),
  });
}
