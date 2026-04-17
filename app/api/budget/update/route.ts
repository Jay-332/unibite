import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { dailyBudget, savingsGoal } = await req.json();

  const updated = await db.user.update({
    where: { id: (session.user as any).id },
    data: {
      ...(dailyBudget !== undefined ? { dailyBudget } : {}),
      ...(savingsGoal !== undefined ? { savingsGoal } : {}),
    },
    select: { dailyBudget: true, savingsGoal: true },
  });

  return NextResponse.json(updated);
}
