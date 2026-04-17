import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const canteens = await db.canteen.findMany({
    include: {
      _count: { select: { menuItems: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ canteens });
}
