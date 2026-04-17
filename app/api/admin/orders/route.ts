import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CANTEEN_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canteenId = (session.user as any).managedCanteenId;

  if (!canteenId) {
    return NextResponse.json({ error: "No canteen managed" }, { status: 400 });
  }

  const orders = await db.order.findMany({
    where: { canteenId },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CANTEEN_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order || order.canteenId !== (session.user as any).managedCanteenId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: { 
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  return NextResponse.json(updatedOrder);
}
