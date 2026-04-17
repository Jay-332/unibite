import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const canteen = await db.canteen.findUnique({
    where: { id: id },
    include: { _count: { select: { menuItems: true } } },
  });

  if (!canteen) return new NextResponse("Canteen not found", { status: 404 });
  return NextResponse.json({ canteen });
}
