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

interface ProfessionalismScore {
  score: number
  components: {
    fulfillingRate: number
    rating: number
    responsiveness: number
    minMaxDiff: number
    influx: number
  }
}

export default function ProfessionalismScreen() {
  const searchParams = useSearchParams()
  const ic = searchParams.get('ic')
  const [score, setScore] = useState<ProfessionalismScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ic) {
      setError('IC number is required')
      setLoading(false)
      return
    }

    fetch(`/api/professionalism?ic=${ic}`)
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
      <h1 className="text-2xl font-bold mb-6">Professionalism Score</h1>
      
      {/* Overall Score */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Professionalism</CardTitle>
          <CardDescription>Your work ethic and professional conduct assessment (30% of total score)</CardDescription>
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
            <CardTitle>Task Fulfillment</CardTitle>
            <CardDescription>Rate of completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.fulfillingRate} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.fulfillingRate.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Ratings</CardTitle>
            <CardDescription>Average client satisfaction</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.rating} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.rating.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsiveness</CardTitle>
            <CardDescription>Task response time assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.responsiveness} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.responsiveness.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Consistency</CardTitle>
            <CardDescription>Based on min-max rating difference</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.minMaxDiff} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.minMaxDiff.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
            <CardDescription>Recent rating improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={score.components.influx} className="mb-2" />
            <p className="text-sm text-gray-500">{score.components.influx.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
