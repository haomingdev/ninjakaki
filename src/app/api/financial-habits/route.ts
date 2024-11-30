import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper function to normalize a value between 0 and 100
function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ic = searchParams.get('ic')

  if (!ic) {
    return NextResponse.json(
      { error: 'IC number is required' },
      { status: 400 }
    )
  }

  try {
    // Get financial metrics
    const metrics = await prisma.financialMetrics.findFirst({
      where: { ic },
      select: {
        impulsivePurchaseRate: true,
        expenseToIncomeRatio: true,
        regularSaving: true,
        emergencyFundAvailability: true,
        consistentSpending: true
      }
    })

    if (!metrics) {
      return NextResponse.json(
        { error: 'No metrics found for this IC' },
        { status: 404 }
      )
    }

    // Get recent transactions to calculate luxury-to-necessity ratio
    const transactions = await prisma.transaction.findMany({
      where: { 
        ic,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        necessitiesOrNonEssential: true,
        spendingAmount: true
      }
    })

    // Calculate luxury to necessity ratio from transactions
    const totalSpending = transactions.reduce((sum, t) => sum + t.spendingAmount, 0)
    const necessitySpending = transactions
      .filter(t => t.necessitiesOrNonEssential)
      .reduce((sum, t) => sum + t.spendingAmount, 0)
    
    const luxuryToNecessityRatio = totalSpending > 0 
      ? (necessitySpending / totalSpending) * 100 
      : 0

    // Calculate other expenses management (regular saving, emergency fund, consistent spending)
    const otherExpensesScore = (
      (metrics.regularSaving ? 100 : 0) +
      (metrics.emergencyFundAvailability ? 100 : 0) +
      (metrics.consistentSpending ? 100 : 0)
    ) / 3

    // Calculate impulsive purchase ratio components
    const impulsivePurchaseScore = normalizeScore(
      (luxuryToNecessityRatio * 0.20) + // 20%
      (otherExpensesScore * 0.15) // 15%
    )

    // Calculate individual components
    const historicalSpendingScore = normalizeScore((1 - metrics.impulsivePurchaseRate) * 100)
    const expenseToIncomeScore = normalizeScore((1 - metrics.expenseToIncomeRatio) * 100)
    const consistentRepaymentScore = metrics.consistentSpending ? 100 : 0

    // Calculate weighted financial habits score (30% of total)
    const financialHabitsScore = normalizeScore(
      (historicalSpendingScore * 0.35) + // 35%
      (impulsivePurchaseScore * 0.35) + // 35%
      (consistentRepaymentScore * 0.20) + // 20%
      (expenseToIncomeScore * 0.10) // 10%
    ) // 30% of total behavioral score

    console.log('Financial Habits Score Calculation:', {
      historicalSpending: historicalSpendingScore,
      impulsivePurchase: impulsivePurchaseScore,
      consistentRepayment: consistentRepaymentScore,
      expenseToIncome: expenseToIncomeScore,
      finalScore: financialHabitsScore
    })

    return NextResponse.json({
      score: Number(financialHabitsScore.toFixed(2)),
      components: {
        historicalSpending: Number(historicalSpendingScore.toFixed(2)),
        impulsivePurchase: Number(impulsivePurchaseScore.toFixed(2)),
        consistentRepayment: Number(consistentRepaymentScore.toFixed(2)),
        expenseToIncome: Number(expenseToIncomeScore.toFixed(2))
      }
    })

  } catch (error) {
    console.error('Error calculating financial habits score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate financial habits score' },
      { status: 500 }
    )
  }
}
