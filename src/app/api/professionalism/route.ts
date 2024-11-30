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
    const metrics = await prisma.financialMetrics.findFirst({
      where: { ic },
      select: {
        cancellationRate: true,
        ratings: true,
        responsivenessToTask: true,
        minMaxDiffPast6Months: true,
        ratingsInflux: true
      }
    })

    if (!metrics) {
      return NextResponse.json(
        { error: 'No metrics found for this IC' },
        { status: 404 }
      )
    }

    // Calculate individual components
    const fulfillingRate = (1 - metrics.cancellationRate) * 100
    const rating = metrics.ratings * 20 // Convert 0-5 scale to percentage
    const responsiveness = metrics.responsivenessToTask * 100
    const minMaxDiff = (1 - metrics.minMaxDiffPast6Months) * 100 // Lower difference is better
    const influx = ((metrics.ratingsInflux + 1) / 2) * 100 // Convert -1 to 1 range to 0-100

    // Calculate weighted professionalism score (30% of total)
    const professionalismScore = (
      (fulfillingRate * 0.25) + // 25%
      (rating * 0.20) + // 20%
      (responsiveness * 0.15) + // 15%
      (minMaxDiff * 0.20) + // 20%
      (influx * 0.20) // 20%
    ) // 30% of total behavioral score

    return NextResponse.json({
      score: professionalismScore,
      components: {
        fulfillingRate: Math.round(fulfillingRate),
        rating: Math.round(rating),
        responsiveness: Math.round(responsiveness),
        minMaxDiff: Math.round(minMaxDiff),
        influx: Math.round(influx)
      }
    })

  } catch (error) {
    console.error('Error calculating professionalism score:', error)
    return NextResponse.json(
      { error: 'Failed to calculate professionalism score' },
      { status: 500 }
    )
  }
}
