import { NextResponse } from 'next/server';
import { modules } from '@/data/education-modules';
import type { EducationModule } from '@/data/education-modules';

export async function GET() {
  return NextResponse.json(modules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newModule: EducationModule = { ...body, id: `mod-${Date.now()}` };
  modules.push(newModule);
  return NextResponse.json(newModule, { status: 201 });
}
