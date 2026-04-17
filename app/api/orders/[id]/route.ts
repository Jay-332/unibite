import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const order = await db.order.findUnique({
    where: { id: id },
    include: {
      canteen: true,
      items: { include: { menuItem: true } },
    },
  });

  if (!order || order.userId !== (session.user as any).id)
    return new NextResponse("Not found", { status: 404 });

  return NextResponse.json({ order });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const { status } = await req.json();
  const userId = (session.user as any).id;

  const order = await db.order.findUnique({ where: { id: id } });
  if (!order || order.userId !== userId) return new NextResponse("Not found", { status: 404 });

  let updated;
  if (status === "CANCELLED" && order.status !== "CANCELLED") {
    const existingRefund = await db.transaction.findFirst({
      where: { userId, orderId: order.id, type: "REFUND" },
    });

    updated = await db.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id: id },
        data: { status: "CANCELLED" },
      });

      if (!existingRefund) {
        const refundedUser = await tx.user.update({
          where: { id: userId },
          data: { tokenBalance: { increment: order.totalAmount } },
        });

        await tx.transaction.create({
          data: {
            userId,
            type: "REFUND",
            amount: order.totalAmount,
            description: `Refund for cancelled order #${order.id.slice(-6).toUpperCase()}`,
            orderId: order.id,
            balanceAfter: refundedUser.tokenBalance,
          },
        });
      }

      return cancelledOrder;
    });
  } else {
    updated = await db.order.update({
      where: { id: id },
      data: {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });
  }

  return NextResponse.json({ order: updated });
}
