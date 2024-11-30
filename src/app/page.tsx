'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  const [ic, setIc] = useState('')
  const router = useRouter()

  const viewScores = (type: string) => {
    if (!ic) {
      alert('Please enter an IC number')
      return
    }
    router.push(`/screens/${type}?ic=${ic}`)
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Financial Risk Assessment</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter IC Number</CardTitle>
          <CardDescription>View detailed financial assessment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="text"
              value={ic}
              onChange={(e) => setIc(e.target.value)}
              placeholder="Enter IC number"
              className="w-full p-2 border rounded"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overall Behavioral Score */}
              <button
                onClick={() => viewScores('behavioural-score')}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 md:col-span-2"
              >
                View Overall Behavioral Score
              </button>

              {/* Individual Component Scores */}
              <button
                onClick={() => viewScores('financial-habits')}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Financial Habits
              </button>

              <button
                onClick={() => viewScores('stability')}
                className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                View Stability Score
              </button>

              <button
                onClick={() => viewScores('professionalism')}
                className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 md:col-span-2"
              >
                View Professionalism Score
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
