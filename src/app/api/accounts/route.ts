import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        scheme: true,
      },
    })
    return NextResponse.json(accounts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const account = await prisma.account.create({
      data: json,
      include: {
        scheme: true,
      },
    })
    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
