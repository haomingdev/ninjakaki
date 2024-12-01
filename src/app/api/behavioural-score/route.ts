import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper function to normalize a value between 0 and 100
function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

async function calculateProfessionalismScore(metrics: any) {
  // Calculate fulfilling rate (ranges from 0-10)
  const fulfillingRate = 10 - (metrics.cancellationRate || 0)
  console.log('Professionalism - Fulfilling Rate:', {
    cancellationRate: metrics.cancellationRate,
    fulfillingRate: fulfillingRate,
    normalized: (fulfillingRate / 10) * 100
  })

  // Convert fulfilling rate to percentage (0-100%)
  const fulfillingRateScore = (fulfillingRate / 10) * 100

  // Other components (0-100%)
  const ratingScore = normalizeScore(metrics.ratings * 20) // Assuming ratings are 0-5
  const responsivenessScore = normalizeScore(metrics.responsivenessToTask * 100)
  const minMaxDiffScore = normalizeScore((1 - metrics.minMaxDiffPast6Months) * 100)
  const influxScore = normalizeScore(metrics.ratingsInflux * 100)

  // Calculate weighted score (max 30%)
  const professionalismScore = (
    (fulfillingRateScore * 0.25) +
    (ratingScore * 0.20) +
    (responsivenessScore * 0.15) +
    (minMaxDiffScore * 0.20) +
    (influxScore * 0.20)
  ) * 0.3  // 30% of total score

  return {
    score: professionalismScore,
    components: {
      fulfillingRate: fulfillingRateScore,
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
  
  // Calculate fluctuation rate score (0-10 scale)
  const rawFluctuationRate = metrics.fluctuationRate ?? 5 // Default to medium if missing
  // Convert to score (0 = 100%, 10 = 0%)
  const fluctuationValue = rawFluctuationRate === 0 
    ? 100 // Perfect score if no fluctuation
    : normalizeScore(Math.max(0, 100 - (rawFluctuationRate * 10)))
  
  console.log('Stability Score Components:', {
    gig: {
      type: metrics.typeOfGig,
      score: gigValue
    },
    employment: {
      permanent: metrics.permanentEmployment,
      years: metrics.yearsOfEmployment,
      permanentScore: permanentEmploymentValue,
      yearsScore: yearsOfEmploymentValue
    },
    fluctuation: {
      raw: rawFluctuationRate + '/10',
      calculation: rawFluctuationRate === 0 
        ? 'Perfect score - no fluctuation'
        : `100 - (${rawFluctuationRate} * 10) = ${100 - (rawFluctuationRate * 10)}`,
      score: fluctuationValue + '%'
    }
  })

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

  // Calculate expense ratio score (input is percentage)
  const rawExpenseRatio = metrics.expenseToIncomeRatio ?? 150 // Default to high if missing
  // Convert to score (higher ratio = lower score)
  const expenseRatioScore = rawExpenseRatio === 0 
    ? 100 // Perfect score if no expenses
    : normalizeScore(Math.max(0, 100 - (rawExpenseRatio / 1.5)))

  console.log('Financial Habits Components:', {
    savings: {
      regular: metrics.regularSaving,
      emergency: metrics.emergencyFundAvailability,
      consistent: metrics.consistentSpending,
      score: otherExpensesScore + '%'
    },
    luxury: {
      total: totalTransactions,
      luxuryCount,
      ratio: luxuryToNecessityRatio + '%'
    },
    expenseRatio: {
      raw: rawExpenseRatio + '%',
      calculation: rawExpenseRatio === 0
        ? 'Perfect score - no expenses'
        : `100 - (${rawExpenseRatio} / 1.5) = ${100 - (rawExpenseRatio / 1.5)}`,
      score: expenseRatioScore + '%'
    }
  })

  // Calculate individual components (0-100%)
  const historicalSpendingScore = normalizeScore(metrics.consistentSpending ? 100 : 50)
  const impulsivePurchaseScore = normalizeScore(100 - (metrics.impulsivePurchaseRate || 0))
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

  console.log('Received request for IC:', ic);

  if (!ic) {
    console.log('No IC provided');
    return NextResponse.json(
      { success: false, error: 'IC number is required' },
      { status: 400 }
    )
  }

  try {
    // First get the metrics
    const metrics = await prisma.financialMetrics.findFirst({
      where: {
        ic: ic
      },
      select: {
        ic: true,
        fullName: true,
        cancellationRate: true,
        ratings: true,
        responsivenessToTask: true,
        minMaxDiffPast6Months: true,
        ratingsInflux: true,
        typeOfGig: true,
        permanentEmployment: true,
        yearsOfEmployment: true,
        fluctuationRate: true,
        grossIncome: true,
        netIncome: true,
        impulsivePurchaseRate: true,
        recurringExpenseConsistency: true,
        expenseToIncomeRatio: true,
        regularSaving: true,
        emergencyFundAvailability: true,
        consistentSpending: true
      }
    })

    console.log('Retrieved metrics:', metrics);

    if (!metrics) {
      console.log('No metrics found for IC:', ic);
      return NextResponse.json(
        { success: false, error: 'No metrics found for this IC' },
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

    console.log('Retrieved transactions count:', transactions.length);

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

    const response = {
      success: true,
      metrics: {
        cancellationRate: metrics.cancellationRate || 0,
        fluctuationRate: metrics.fluctuationRate || 0,
        expenseToIncomeRatio: metrics.expenseToIncomeRatio || 0,
        impulsivePurchaseRate: metrics.impulsivePurchaseRate || 0,
        typeOfGig: metrics.typeOfGig || '',
        recurringExpenseConsistency: metrics.recurringExpenseConsistency || 0
      },
      finalScore,
      riskCategory,
      breakdown: {
        professionalism: {
          score: normalizeScore(professionalismData.score),
          weight: 0.30,
          weightedScore: professionalismData.score,
          components: professionalismData.components
        },
        stability: {
          score: normalizeScore(stabilityData.score),
          weight: 0.40,
          weightedScore: stabilityData.score,
          components: stabilityData.components
        },
        financialHabits: {
          score: normalizeScore(financialHabitsData.score),
          weight: 0.30,
          weightedScore: financialHabitsData.score,
          components: financialHabitsData.components
        }
      }
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating behavioral score:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate behavioral score' },
      { status: 500 }
    )
  }
}
