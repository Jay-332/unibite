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

  const menuItems = await db.menuItem.findMany({
    where: { canteenId },
    orderBy: { category: "asc" },
  });

  return NextResponse.json(menuItems);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CANTEEN_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canteenId = (session.user as any).managedCanteenId;
  const data = await req.json();

  const newItem = await db.menuItem.create({
    data: {
      ...data,
      canteenId,
    },
  });

  return NextResponse.json(newItem);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "CANTEEN_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...data } = await req.json();

  const item = await db.menuItem.findUnique({ where: { id } });

  if (!item || item.canteenId !== (session.user as any).managedCanteenId) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updatedItem = await db.menuItem.update({
    where: { id },
    data,
  });

  return NextResponse.json(updatedItem);
}
