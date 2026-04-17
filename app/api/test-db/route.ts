import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Database connection test - please configure DATABASE_URL in .env.local and run npx prisma db push' });
}
