import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// GET - Fetch all reviews
export async function GET() {
    try {
        ensureDataDir();
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return NextResponse.json(JSON.parse(data));
        }
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error reading reviews:', error);
        return NextResponse.json([]);
    }
}

// POST - Save all reviews
export async function POST(request: NextRequest) {
    try {
        ensureDataDir();
        const reviews = await request.json();
        fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving reviews:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
