'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FinancialHabitsScore {
  score: number
  components: {
    historicalSpending: number
    impulsivePurchase: number
    consistentRepayment: number
    expenseToIncome: number
  }
}

export default function FinancialHabitsScreen() {
  const searchParams = useSearchParams()
  const ic = searchParams.get('ic')
  const [score, setScore] = useState<FinancialHabitsScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ic) {
      setError('IC number is required')
      setLoading(false)
      return
    }

    fetch(`/api/financial-habits?ic=${ic}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setScore(data)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [ic])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!score) return <div>No data available</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Financial Habits Score</h1>
      
      {/* Overall Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Financial Habits</CardTitle>
          <CardDescription>Your financial behavior assessment (30% of total score)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={Math.min(100, score.score)} className="w-full" />
            <p className="text-sm text-gray-500">{score.score}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Component Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historical Spending</CardTitle>
            <CardDescription>Based on past spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.historicalSpending} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.historicalSpending}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impulsive Purchase</CardTitle>
            <CardDescription>Measure of spending control</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.impulsivePurchase} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.impulsivePurchase}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consistent Repayment</CardTitle>
            <CardDescription>History of repayment behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.consistentRepayment} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.consistentRepayment}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense to Income Ratio</CardTitle>
            <CardDescription>Monthly expenses vs income</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.expenseToIncome} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.expenseToIncome}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
