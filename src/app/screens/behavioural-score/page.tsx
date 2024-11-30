'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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

export default function BehaviouralScoreScreen() {
  const [ic, setIc] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setScoreData(null)

    try {
      const response = await fetch(`/api/behavioural-score?ic=${ic}`)
      if (!response.ok) {
        throw new Error('Failed to fetch score')
      }
      const data = await response.json()
      setScoreData(data)
    } catch (err) {
      setError('Failed to fetch behavioural score. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Behavioural Score Analysis
        </h1>

        <div className="max-w-md mx-auto mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="ic"
                className="block text-sm font-medium text-gray-700"
              >
                IC Number
              </label>
              <input
                type="text"
                id="ic"
                value={ic}
                onChange={(e) => setIc(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter IC number"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Loading...' : 'Get Score'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>

        {scoreData && (
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
              {renderComponentBreakdown(
                scoreData.breakdown.professionalism.components
              )}

              {renderComponentBreakdown(
                scoreData.breakdown.stability.components
              )}

              {renderComponentBreakdown(
                {
                  historicalSpending: scoreData.breakdown.financialHabits.components.historicalSpending,
                  impulsivePurchase: scoreData.breakdown.financialHabits.components.impulsivePurchase,
                  consistentRepayment: scoreData.breakdown.financialHabits.components.consistentRepayment,
                  expenseRatio: scoreData.breakdown.financialHabits.components.expenseRatio
                }
              )}
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
        )}
      </div>
    </div>
  )
}
