import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount <= 0) return new NextResponse("Invalid amount", { status: 400 });

  const userId = (session.user as any).id;

  const user = await db.user.update({
    where: { id: userId },
    data: { tokenBalance: { increment: amount } },
  });

  await db.transaction.create({
    data: {
      userId,
      type: "DEPOSIT",
      amount,
      description: `Wallet top-up of ₹${amount}`,
      balanceAfter: user.tokenBalance,
    },
  });

  return NextResponse.json({ success: true, newBalance: user.tokenBalance });
}
