import { NextResponse } from 'next/server';
import { modules } from '@/data/education-modules';
import type { EducationModule } from '@/data/education-modules';


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.json();
  const index = modules.findIndex(m => m.id === id);
  if (index > -1) {
    modules[index] = { ...modules[index], ...body };
    return NextResponse.json(modules[index]);
  }
  return new NextResponse('Module not found', { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const index = modules.findIndex(m => m.id === id);
  if (index > -1) {
    modules.splice(index, 1);
    return new NextResponse(null, { status: 204 });
  }
  return new NextResponse('Module not found', { status: 404 });
}
