import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Helper function to normalize a value between 0 and 100
function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

const HIGH_VALUE_GIGS = ['Software Development', 'Medical', 'Legal', 'Financial Services']

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
    // Get current metrics and historical income data
    const metrics = await prisma.financialMetrics.findFirst({
      where: { ic },
      select: {
        typeOfGig: true,
        permanentEmployment: true,
        yearsOfEmployment: true,
        grossIncome: true
      }
    })

    if (!metrics) {
      return NextResponse.json(
        { error: 'No metrics found for this IC' },
        { status: 404 }
      )
    }

    // Get historical income data for fluctuation calculation
    const historicalMetrics = await prisma.financialMetrics.findMany({
      where: { ic },
      select: { grossIncome: true },
      orderBy: { timestamp: 'desc' },
      take: 6 // Last 6 months
    })

    // Calculate income fluctuation rate
    const incomes = historicalMetrics.map(m => m.grossIncome)
    const maxIncome = Math.max(...incomes)
    const minIncome = Math.min(...incomes)
    const meanIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length
    const fluctuationRate = meanIncome > 0 ? ((maxIncome - minIncome) / meanIncome) : 1

    // Calculate individual components
    const gigTypeScore = HIGH_VALUE_GIGS.includes(metrics.typeOfGig) ? 100 : 50
    const permanentEmploymentScore = metrics.permanentEmployment === 'Yes' ? 100 : 50
    const yearsOfEmploymentScore = Math.min(metrics.yearsOfEmployment / 5, 1) * 100 // Cap at 5 years
    const fluctuationScore = (1 - fluctuationRate) * 100 // Lower fluctuation is better

    // Calculate weighted stability score (40% of total)
    const stabilityScore = normalizeScore(
      (gigTypeScore * 0.25) + // 25%
      (permanentEmploymentScore * 0.30) + // 30%
      (yearsOfEmploymentScore * 0.25) + // 25%
      (fluctuationScore * 0.20) // 20%
    ) // 40% of total behavioral score

    return NextResponse.json({
      score: Number(stabilityScore.toFixed(2)),
      components: {
        gigType: Number(gigTypeScore.toFixed(2)),
        permanentEmployment: Number(permanentEmploymentScore.toFixed(2)),
        yearsOfEmployment: Number(yearsOfEmploymentScore.toFixed(2)),
        fluctuationRate: Number(fluctuationScore.toFixed(2))
      }
    })

  } catch (error) {
    console.error('Error calculating stability score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate stability score' },
      { status: 500 }
    )
  }
}
