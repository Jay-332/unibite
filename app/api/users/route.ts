import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function ensureUsersFile() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, '[]', 'utf-8');
    }
}

export async function GET() {
    ensureUsersFile();
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
    ensureUsersFile();
    const user = await request.json();
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    // Check for duplicate email
    if (users.some((u: any) => u.email === user.email)) {
        return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return NextResponse.json({ success: true, user });
}
