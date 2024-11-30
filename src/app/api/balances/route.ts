import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const BalanceSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  currency: z.string(),
  lastUpdated: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    // Validate accountId if provided
    if (accountId) {
      const account = await prisma.account.findUnique({
        where: { id: parseInt(accountId) },
      })
      if (!account) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        )
      }
    }

    const balances = await prisma.balance.findMany({
      where: accountId ? { accountId } : undefined,
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountHolderFullName: true,
            accountType: true,
            accountCurrency: true,
          },
        },
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: balances,
      count: balances.length,
    })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch balances',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    
    // Validate input data
    const validatedData = BalanceSchema.parse(json)

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: validatedData.accountId },
    })

    if (!account) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account not found' 
        },
        { status: 404 }
      )
    }

    // Ensure currency matches account currency
    if (validatedData.currency !== account.accountCurrency) {
      return NextResponse.json(
        {
          success: false,
          error: 'Currency mismatch with account currency'
        },
        { status: 400 }
      )
    }

    const balance = await prisma.balance.create({
      data: {
        ...validatedData,
        lastUpdated: validatedData.lastUpdated || new Date().toISOString(),
      },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountHolderFullName: true,
            accountType: true,
            accountCurrency: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: balance,
    })
  } catch (error) {
    console.error('Error creating balance:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create balance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
