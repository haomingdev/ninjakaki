'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface ScoreData {
  finalScore: number
  riskCategory: string
  breakdown: {
    professionalism: {
      score: number
      weight: number
      weightedScore: number
      components: {
        fulfillingRate: number
        rating: number
        responsiveness: number
        minMaxDiff: number
        influx: number
      }
    }
    stability: {
      score: number
      weight: number
      weightedScore: number
      components: {
        gigType: number
        permanentEmployment: number
        yearsOfEmployment: number
        fluctuationRate: number
      }
    }
    financialHabits: {
      score: number
      weight: number
      weightedScore: number
      components: {
        historicalSpending: number
        impulsivePurchase: number
        consistentRepayment: number
        expenseRatio: number
        details: {
          luxuryToNecessityRatio: number
          otherExpensesManagement: number
        }
      }
    }
  }
}

export default function BehavioralScoreScreen() {
  const searchParams = useSearchParams()
  const ic = searchParams.get('ic')
  const [isLoading, setIsLoading] = useState(true)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ic) {
      setError('IC number is required')
      setIsLoading(false)
      return
    }

    fetch(`/api/behavioural-score?ic=${ic}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setScoreData(data)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [ic])

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">Loading...</div>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    </div>
  )

  if (!scoreData) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">No data available</div>
      </div>
    </div>
  )

  const renderScoreCard = ({ title, score, color }: { title: string; score: number | null | undefined; color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${color}`}>
        {typeof score === 'number' ? score.toFixed(2) : '--'}%
      </div>
    </div>
  )

  const renderComponentBreakdown = (components: { [key: string]: number | Record<string, number> }) => (
    <div className="mt-4 space-y-4">
      {Object.entries(components).map(([key, value]) => {
        if (typeof value === 'number') {
          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm font-medium">{value?.toFixed(2) ?? '--'}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${value ?? 0}%` }}
                />
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Behavioral Score Analysis
        </h1>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderScoreCard({
              title: 'Final Score',
              score: scoreData?.finalScore,
              color: 'text-blue-600'
            })}
            {renderScoreCard({
              title: 'Professionalism',
              score: scoreData?.breakdown?.professionalism?.score,
              color: 'text-green-600'
            })}
            {renderScoreCard({
              title: 'Stability',
              score: scoreData?.breakdown?.stability?.score,
              color: 'text-purple-600'
            })}
            {renderScoreCard({
              title: 'Financial Habits',
              score: scoreData?.breakdown?.financialHabits?.score,
              color: 'text-orange-600'
            })}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-2">Risk Category</h3>
            <div
              className={`text-2xl font-bold ${
                scoreData.riskCategory === 'Low Risk'
                  ? 'text-green-600'
                  : scoreData.riskCategory === 'Medium Risk'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {scoreData.riskCategory}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Professionalism Breakdown</h3>
              {renderComponentBreakdown(
                scoreData.breakdown.professionalism.components
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Stability Breakdown</h3>
              {renderComponentBreakdown(
                scoreData.breakdown.stability.components
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Financial Habits Breakdown</h3>
              {renderComponentBreakdown(
                {
                  historicalSpending: scoreData.breakdown.financialHabits.components.historicalSpending,
                  impulsivePurchase: scoreData.breakdown.financialHabits.components.impulsivePurchase,
                  consistentRepayment: scoreData.breakdown.financialHabits.components.consistentRepayment,
                  expenseRatio: scoreData.breakdown.financialHabits.components.expenseRatio
                }
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
              Financial Habits Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderComponentBreakdown(
                scoreData.breakdown.financialHabits.components.details
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
