import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper function to normalize a value between 0 and 100
function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

async function calculateProfessionalismScore(metrics: any) {
  // Normalize input values first
  const cancellationRate = Math.max(0, Math.min(1, metrics.cancellationRate || 0))
  const ratings = Math.max(0, Math.min(1, metrics.ratings || 0))
  const responsiveness = Math.max(0, Math.min(1, metrics.responsivenessToTask || 0))
  const minMaxDiff = Math.max(0, Math.min(1, metrics.minMaxDiffPast6Months || 0))
  const ratingsInflux = Math.max(0, Math.min(1, metrics.ratingsInflux || 0))

  // Calculate individual components (0-100%)
  const fulfillingRate = normalizeScore((1 - cancellationRate) * 100)
  const ratingScore = normalizeScore(ratings * 100)
  const responsivenessScore = normalizeScore(responsiveness * 100)
  const minMaxDiffScore = normalizeScore(minMaxDiff * 100)
  const influxScore = normalizeScore(ratingsInflux * 100)

  // Calculate weighted score (max 30%)
  const professionalismScore = (
    (fulfillingRate * 0.25) +
    (ratingScore * 0.20) +
    (responsivenessScore * 0.15) +
    (minMaxDiffScore * 0.20) +
    (influxScore * 0.20)
  ) * 0.3  // 30% of total score

  return {
    score: professionalismScore,
    components: {
      fulfillingRate,
      rating: ratingScore,
      responsiveness: responsivenessScore,
      minMaxDiff: minMaxDiffScore,
      influx: influxScore
    }
  }
}

async function calculateStabilityScore(metrics: any) {
  const HIGH_VALUE_GIGS = ['Software Development', 'Medical', 'Legal', 'Financial Services']
  
  // Calculate individual components (0-100%)
  const gigValue = HIGH_VALUE_GIGS.includes(metrics.typeOfGig) ? 100 : 50
  const permanentEmploymentValue = metrics.permanentEmployment === 'Yes' ? 100 : 50
  const yearsOfEmploymentValue = normalizeScore((Math.min(metrics.yearsOfEmployment || 0, 10) / 10) * 100)
  
  // Fluctuation rate should be inverse - higher fluctuation means lower score
  const rawFluctuationRate = metrics.fluctuationRate ?? 0
  console.log('Fluctuation rate calculation:', {
    raw: rawFluctuationRate,
    normalized: (1 - rawFluctuationRate) * 100
  })
  const fluctuationValue = normalizeScore((1 - rawFluctuationRate) * 100)

  // Calculate weighted score (max 40%)
  const stabilityScore = (
    (gigValue * 0.25) +
    (permanentEmploymentValue * 0.30) +
    (yearsOfEmploymentValue * 0.25) +
    (fluctuationValue * 0.20)
  ) * 0.4  // 40% of total score

  return {
    score: stabilityScore,
    components: {
      gigType: gigValue,
      permanentEmployment: permanentEmploymentValue,
      yearsOfEmployment: yearsOfEmploymentValue,
      fluctuationRate: fluctuationValue
    }
  }
}

async function calculateFinancialHabitsScore(metrics: any, transactions: any[]) {
  // Calculate base scores (0-100%)
  const regularSavingScore = metrics.regularSaving ? 100 : 0
  const emergencyFundScore = metrics.emergencyFundAvailability ? 100 : 0
  const consistentSpendingScore = metrics.consistentSpending ? 100 : 0
  
  const otherExpensesScore = normalizeScore(
    ((regularSavingScore + emergencyFundScore + consistentSpendingScore) / 3)
  )

  // Calculate luxury ratio (0-100%)
  const totalTransactions = transactions.length
  const luxuryCount = transactions.filter(tx => tx.necessitiesOrNonEssential === false).length

  const luxuryToNecessityRatio = totalTransactions > 0 
    ? normalizeScore((luxuryCount / totalTransactions) * 100)
    : 0

  console.log('Luxury calculation:', {
    totalTransactions,
    luxuryCount,
    ratio: luxuryToNecessityRatio,
    transactions: transactions.slice(0, 3).map(t => ({ 
      id: t.id, 
      necessity: t.necessitiesOrNonEssential
    }))
  })

  // Calculate expense ratio (0-100%)
  const rawExpenseRatio = metrics.expenseToIncomeRatio ?? 0
  console.log('Expense ratio calculation:', {
    raw: rawExpenseRatio,
    normalized: (1 - rawExpenseRatio) * 100
  })
  const expenseRatioScore = normalizeScore((1 - rawExpenseRatio) * 100)

  // Calculate individual components (0-100%)
  const historicalSpendingScore = normalizeScore(metrics.consistentSpending ? 100 : 50)
  const impulsivePurchaseScore = normalizeScore(100 - luxuryToNecessityRatio)
  const consistentRepaymentScore = normalizeScore(metrics.recurringExpenseConsistency * 100 || 0)

  // Calculate weighted score (max 30%)
  const financialHabitsScore = (
    (historicalSpendingScore * 0.35) +
    (impulsivePurchaseScore * 0.35) +
    (consistentRepaymentScore * 0.20) +
    (expenseRatioScore * 0.10)
  ) * 0.3  // 30% of total score

  return {
    score: financialHabitsScore,
    components: {
      historicalSpending: historicalSpendingScore,
      impulsivePurchase: impulsivePurchaseScore,
      consistentRepayment: consistentRepaymentScore,
      expenseRatio: expenseRatioScore,
      details: {
        luxuryToNecessityRatio,
        otherExpensesManagement: otherExpensesScore
      }
    }
  }
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
    // First get the metrics
    const metrics = await prisma.financialMetrics.findFirst({
      where: { ic },
      select: {
        cancellationRate: true,
        ratings: true,
        responsivenessToTask: true,
        minMaxDiffPast6Months: true,
        ratingsInflux: true,
        typeOfGig: true,
        permanentEmployment: true,
        yearsOfEmployment: true,
        fluctuationRate: true,
        expenseToIncomeRatio: true,
        regularSaving: true,
        emergencyFundAvailability: true,
        consistentSpending: true,
        recurringExpenseConsistency: true
      }
    })

    if (!metrics) {
      return NextResponse.json(
        { error: 'No metrics found for this IC' },
        { status: 404 }
      )
    }

    // Separately fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: { ic },
      select: {
        id: true,
        necessitiesOrNonEssential: true,
        spendingAmount: true
      }
    })

    console.log('Data fetched:', {
      metrics: {
        fluctuationRate: metrics.fluctuationRate,
        expenseToIncomeRatio: metrics.expenseToIncomeRatio,
        typeOfGig: metrics.typeOfGig,
        permanentEmployment: metrics.permanentEmployment
      },
      transactionCount: transactions.length,
      sampleTransactions: transactions.slice(0, 3)
    })

    // Calculate all component scores
    const [professionalismData, stabilityData, financialHabitsData] = await Promise.all([
      calculateProfessionalismScore(metrics),
      calculateStabilityScore(metrics),
      calculateFinancialHabitsScore(metrics, transactions)
    ])

    // Calculate final score (sum of all weighted scores)
    const finalScore = normalizeScore(
      (professionalismData.score) + 
      (stabilityData.score) + 
      (financialHabitsData.score)
    )

    // Determine risk category
    let riskCategory
    if (finalScore >= 80) {
      riskCategory = 'Low Risk'
    } else if (finalScore >= 60) {
      riskCategory = 'Medium Risk'
    } else {
      riskCategory = 'High Risk'
    }

    return NextResponse.json({
      finalScore,
      riskCategory,
      breakdown: {
        professionalism: {
          score: normalizeScore(professionalismData.score), // Convert back to 100% scale
          weight: 0.30,
          weightedScore: professionalismData.score,
          components: professionalismData.components
        },
        stability: {
          score: normalizeScore(stabilityData.score), // Convert back to 100% scale
          weight: 0.40,
          weightedScore: stabilityData.score,
          components: stabilityData.components
        },
        financialHabits: {
          score: normalizeScore(financialHabitsData.score), // Convert back to 100% scale
          weight: 0.30,
          weightedScore: financialHabitsData.score,
          components: financialHabitsData.components
        }
      }
    })
  } catch (error) {
    console.error('Error calculating behavioral score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate behavioral score' },
      { status: 500 }
    )
  }
}
