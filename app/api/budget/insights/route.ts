import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); sevenDaysAgo.setHours(0, 0, 0, 0);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const [weeklySpending, monthSpending, user] = await Promise.all([
    db.dailySpending.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    }),
    db.dailySpending.findMany({
      where: { userId, date: { gte: monthStart } },
      orderBy: { date: "asc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { dailyBudget: true },
    }),
  ]);

  const totalThisWeek = weeklySpending.reduce((s: number, d: { totalSpent: number }) => s + d.totalSpent, 0);
  const avgDaily = weeklySpending.length ? totalThisWeek / weeklySpending.length : 0;
  const daysUnderBudget = weeklySpending.filter((d: { isOverBudget: boolean }) => !d.isOverBudget).length;
  const daysOverBudget = weeklySpending.filter((d: { isOverBudget: boolean }) => d.isOverBudget).length;
  const totalThisMonth = monthSpending.reduce((s: number, d: { totalSpent: number }) => s + d.totalSpent, 0);
  const dayOfMonth = new Date().getDate();
  const plannedTillToday = (user?.dailyBudget || 0) * dayOfMonth;
  const extraSavings = Math.max(plannedTillToday - totalThisMonth, 0);
  const aiInsight = extraSavings > 0
    ? `AI insight: You have saved an extra ₹${extraSavings.toFixed(0)} this month by spending below your daily budget. You can use this as extra spending for non-food items.`
    : "AI insight: You are currently using most of your daily budget. Try one low-cost meal swap to build extra spending savings.";

  return NextResponse.json({
    weeklySpending,
    totalThisWeek,
    avgDaily,
    daysUnderBudget,
    daysOverBudget,
    totalThisMonth,
    plannedTillToday,
    extraSavings,
    aiInsight,
  });
}
