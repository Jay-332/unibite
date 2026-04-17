import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: (session.user as any).id },
    include: {
      canteen: { select: { name: true, location: true } },
      items: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
