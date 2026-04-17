import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const transactions = await db.transaction.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return NextResponse.json({ transactions });
}
