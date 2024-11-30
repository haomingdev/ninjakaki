import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause = {}

    if (accountId) {
      whereClause = {
        ...whereClause,
        accountId: accountId,
      }
    }

    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        bookingDatetime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        scheme: true,
      },
      orderBy: {
        bookingDatetime: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const transaction = await prisma.transaction.create({
      data: json,
      include: {
        account: true,
        scheme: true,
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
