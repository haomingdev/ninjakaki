import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const schemes = await prisma.accountScheme.findMany()
    return NextResponse.json(schemes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const scheme = await prisma.accountScheme.create({
      data: json,
    })
    return NextResponse.json(scheme)
  } catch (error) {
    console.error('Error creating scheme:', error)
    return NextResponse.json(
      { error: 'Failed to create scheme' },
      { status: 500 }
    )
  }
}
