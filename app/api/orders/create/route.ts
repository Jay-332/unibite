import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;
  const { canteenId, items, specialInstructions, pickupTime } = await req.json();

  if (!canteenId || !items?.length) {
    return new NextResponse("Invalid order data", { status: 400 });
  }

  // Fetch menu items to validate prices
  const menuItemIds = items.map((i: any) => i.menuItemId);
  const menuItems = await db.menuItem.findMany({ where: { id: { in: menuItemIds } } });
  const menuMap = Object.fromEntries(menuItems.map((m: { id: string; price: number; name: string; isAvailable: boolean }) => [m.id, m]));

  let totalAmount = 0;
  for (const item of items) {
    const mi = menuMap[item.menuItemId];
    if (!mi || !mi.isAvailable) return new NextResponse(`Item ${item.menuItemId} not available`, { status: 400 });
    totalAmount += mi.price * item.quantity;
  }

  // Check balance
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.tokenBalance < totalAmount) {
    return new NextResponse("Insufficient balance", { status: 402 });
  }

  // Deduct balance
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { tokenBalance: { decrement: totalAmount } },
  });

  // Create order
  const order = await db.order.create({
    data: {
      userId,
      canteenId,
      totalAmount,
      specialInstructions,
      pickupTime: pickupTime ? new Date(pickupTime) : null,
      items: {
        create: items.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: menuMap[item.menuItemId].price,
        })),
      },
    },
    include: { items: true },
  });

  // Create transaction record
  await db.transaction.create({
    data: {
      userId,
      type: "PAYMENT",
      amount: totalAmount,
      description: `Order #${order.id.slice(-6).toUpperCase()} placed`,
      orderId: order.id,
      balanceAfter: updatedUser.tokenBalance,
    },
  });

  // Update daily spending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await db.dailySpending.findUnique({ where: { userId_date: { userId, date: today } } });

  const newTotalSpent = (existing?.totalSpent || 0) + totalAmount;
  await db.dailySpending.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, totalSpent: totalAmount, orderCount: 1, isOverBudget: totalAmount > updatedUser.dailyBudget },
    update: { totalSpent: { increment: totalAmount }, orderCount: { increment: 1 }, isOverBudget: newTotalSpent > updatedUser.dailyBudget },
  });

  return NextResponse.json({ success: true, orderId: order.id });
}
