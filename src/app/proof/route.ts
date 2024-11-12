import { NextResponse } from 'next/server';

let requestData: JSON | null = null; // 临时存储请求数据（重启后会清除）

export async function POST(req: Request) {
  const body = await req.json();
  requestData = body;
  return NextResponse.json({ status: 'Data received' });
}

export function GET() {
    if (requestData) return NextResponse.json({ data: requestData });
    return NextResponse.json({ });
}