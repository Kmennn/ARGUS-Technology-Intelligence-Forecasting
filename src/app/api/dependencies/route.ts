import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'dependencies.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const dependencyData = JSON.parse(fileContents);
    return NextResponse.json(dependencyData);
  } catch (error) {
    console.error('Failed to load dependency data:', error);
    return NextResponse.json({ error: 'Failed to load dependency data' }, { status: 500 });
  }
}
