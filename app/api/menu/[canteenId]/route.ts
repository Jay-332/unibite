import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ canteenId: string }> }) {
  const { canteenId } = await params;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const menuItems = await db.menuItem.findMany({
    where: {
      canteenId: canteenId,
      ...(category && category !== "all" ? { category } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ menuItems });
}
