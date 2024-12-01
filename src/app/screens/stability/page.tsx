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

interface StabilityScore {
  score: number
  components: {
    gigType: number
    permanentEmployment: number
    yearsOfEmployment: number
    fluctuationRate: number
  }
}

export default function StabilityScreen() {
  const searchParams = useSearchParams()
  const ic = searchParams.get('ic')
  const [score, setScore] = useState<StabilityScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ic) {
      setError('IC number is required')
      setLoading(false)
      return
    }

    fetch(`/api/stability?ic=${ic}`)
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
  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Stability Analysis</h1>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    </div>
  )
  if (!score) return <div>No data available</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Stability Analysis</h1>
      
      {/* Overall Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Stability</CardTitle>
          <CardDescription>Your employment and income stability assessment (40% of total score)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={Math.min(100, score.score)} className="w-full" />
            <p className="text-sm text-gray-500">{score.score.toFixed(2)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Component Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gig Type Value</CardTitle>
            <CardDescription>Assessment of your work category</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.gigType} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.gigType.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Status</CardTitle>
            <CardDescription>Permanent vs Contract Employment</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.permanentEmployment} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.permanentEmployment.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Years of Employment</CardTitle>
            <CardDescription>Work experience duration</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.yearsOfEmployment} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.yearsOfEmployment.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Stability</CardTitle>
            <CardDescription>Income fluctuation assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.fluctuationRate} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.fluctuationRate.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
  )
}
