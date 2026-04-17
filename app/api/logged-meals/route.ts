import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'logged-meals.json');

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// GET - Fetch logged meals for a specific user
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) return NextResponse.json([]);

        ensureDataDir();
        if (fs.existsSync(DATA_FILE)) {
            const allData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
            return NextResponse.json(allData[userId] || []);
        }
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error reading logged meals:', error);
        return NextResponse.json([]);
    }
}

// POST - Save logged meals for a specific user
export async function POST(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');
        if (!userId) return NextResponse.json({ success: false, error: 'No userId provided' }, { status: 400 });

        ensureDataDir();
        const meals = await request.json();

        let allData: Record<string, any> = {};
        if (fs.existsSync(DATA_FILE)) {
            allData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }

        allData[userId] = meals;
        fs.writeFileSync(DATA_FILE, JSON.stringify(allData, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving logged meals:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
