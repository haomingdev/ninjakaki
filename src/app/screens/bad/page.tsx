"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/BackButton"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"

interface Insight {
  message: string;
  severity: number;
}

export default function BadPage() {
  const searchParams = useSearchParams();
  const ic = searchParams.get('ic') || '990606065820'; // Default IC for testing
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        console.log('Starting to fetch insights...');
        
        // First update the metrics
        console.log('Updating metrics...');
        const updateResponse = await fetch('/api/update-metrics');
        console.log('Update metrics response:', updateResponse.status);
        
        // Then fetch behavioral score
        console.log('Fetching behavioral score...');
        const response = await fetch(`/api/behavioural-score?ic=${ic}`);
        console.log('Behavioral score response status:', response.status);
        
        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));

        // Check if we have the metrics we need
        const metrics = data.metrics || {};
        console.log('Metrics received:', {
          cancellationRate: metrics.cancellationRate,
          fluctuationRate: metrics.fluctuationRate,
          expenseToIncomeRatio: metrics.expenseToIncomeRatio,
          impulsivePurchaseRate: metrics.impulsivePurchaseRate,
          typeOfGig: metrics.typeOfGig,
          recurringExpenseConsistency: metrics.recurringExpenseConsistency
        });

        const allInsights: Insight[] = [];

        const calculateSeverity = (metric: string, value: number | string) => {
          // For gig type, low value = 100 severity, high value = 0 severity
          if (metric === 'typeOfGig') {
            return value === 'low_value' ? 100 : 0
          }

          // For these metrics, higher is better (100 - value = severity)
          const higherIsBetter = [
            'fulfillingRate',
            'rating',
            'responsiveness',
            'influx',
            'permanentEmployment',
            'yearsOfEmployment',
            'historicalSpending',
            'impulsivePurchase',
            'consistentRepayment',
          ]

          // For these metrics, lower is better (value = severity)
          const lowerIsBetter = [
            'cancellationRate',
            'minMaxDiff',
            'fluctuationRate',
            'expenseRatio',
            'luxuryToNecessityRatio'
          ]

          const numericValue = typeof value === 'string' ? 
            (value === 'Yes' ? 100 : 0) : // Convert Yes/No to 100/0
            value

          if (higherIsBetter.includes(metric)) {
            return Math.max(0, Math.min(100, 100 - numericValue))
          }
          
          if (lowerIsBetter.includes(metric)) {
            return Math.max(0, Math.min(100, numericValue))
          }

          // Default case - treat as higher is better
          return Math.max(0, Math.min(100, 100 - numericValue))
        }

        // Fulfilling Rate (Higher is better)
        const fulfillingRate = calculateSeverity('fulfillingRate', (10 - (metrics.cancellationRate || 0)) * 10);
        console.log('Calculated fulfilling rate:', fulfillingRate);
        if (fulfillingRate > 20) {
          allInsights.push({
            message: "Focus on accepting manageable gigs and maintaining consistent communication to improve gig completion rates.",
            severity: fulfillingRate
          });
        }

        // Income Fluctuation (Lower is better)
        const fluctuationRate = calculateSeverity('fluctuationRate', (metrics.fluctuationRate || 0) * 10);
        console.log('Calculated fluctuation rate:', fluctuationRate);
        if (fluctuationRate > 20) {
          allInsights.push({
            message: "Save at least 20% of high-income months to build a buffer for low-earning periods.",
            severity: fluctuationRate
          });
        }

        // Expense-to-Income Ratio (Lower is better)
        const expenseRatio = calculateSeverity('expenseRatio', (metrics.expenseToIncomeRatio || 0) * 100);
        console.log('Calculated expense ratio:', expenseRatio);
        if (expenseRatio > 30) {
          allInsights.push({
            message: "Cut unnecessary spending (subscriptions, dining out) and aim to keep expenses below 70% of monthly income.",
            severity: expenseRatio
          });
        }

        // Impulsive Purchase Flag (Lower is better)
        const impulsiveRate = calculateSeverity('impulsivePurchase', metrics.impulsivePurchaseRate || 0);
        console.log('Calculated impulsive rate:', impulsiveRate);
        if (impulsiveRate > 50) {
          allInsights.push({
            message: "Set a discretionary spending limit and implement a 24-hour delay for non-essential purchases.",
            severity: impulsiveRate
          });
        }

        // Low-Value Gigs
        const gigType = calculateSeverity('typeOfGig', metrics.typeOfGig);
        console.log('Gig type:', gigType);
        if (gigType > 50) {
          allInsights.push({
            message: "Upskill or seek certifications to qualify for higher-paying gigs and diversify income sources.",
            severity: gigType
          });
        }

        // Late Repayments
        const repaymentScore = calculateSeverity('consistentRepayment', (metrics.recurringExpenseConsistency || 0) * 100);
        console.log('Calculated repayment score:', repaymentScore);
        if (repaymentScore < 90) {
          allInsights.push({
            message: "Set up auto-pay for recurring bills or use reminders for repayment due dates to ensure timely payments.",
            severity: 100 - repaymentScore
          });
        }

        console.log('Generated insights:', allInsights);

        // If no insights were generated, add a default one
        if (allInsights.length === 0) {
          console.log('No insights generated, adding default');
          allInsights.push({
            message: "Your financial metrics are looking good! Keep maintaining your current financial habits.",
            severity: 0
          });
        }

        // Sort by severity and take top 3
        const topInsights = allInsights
          .sort((a, b) => b.severity - a.severity)
          .slice(0, 3);

        console.log('Final insights to display:', topInsights);
        setInsights(topInsights);
      } catch (error) {
        console.error('Error in fetchInsights:', error);
        setInsights([{
          message: "Unable to load personalized insights at the moment. Please try again later.",
          severity: 0
        }]);
      }
    };

    fetchInsights();
  }, []);

  const educationalVideos = [
    {
      title: "How to Improve Your Credit Score",
      videoId: "Vn9ounAgG3w",
      description: "Learn practical steps to improve your credit score and maintain good financial health."
    },
    {
      title: "Building Your Emergency Fund",
      videoId: "fVToMS2Q3XQ",
      description: "Expert advice on building and maintaining an emergency fund for financial stability."
    },
    {
      title: "Smart Budgeting Tips",
      videoId: "HQzoZfc3GwQ",
      description: "Practical tips for creating and sticking to a budget to optimize your expenses."
    }
  ];

  const exercises = [
    {
      title: "Monthly Budgeting Exercise",
      description: "Review and optimize your monthly expenses.",
      buttonText: "Start Now"
    },
    {
      title: "Credit Score Improvement Exercise",
      description: "Learn practical steps to improve your credit score.",
      buttonText: "Start Now"
    },
    {
      title: "Emergency Fund Exercise",
      description: "Build and maintain an emergency fund for financial stability.",
      buttonText: "Start Now"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="space-y-8">
          {/* Actionable Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Top Priority Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-decimal list-inside space-y-4">
                {insights.map((insight, index) => (
                  <li key={index} className="text-muted-foreground">
                    {insight.message}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Educational Videos Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Educational Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {educationalVideos.map((video, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <YouTubeEmbed videoId={video.videoId} title={video.title} />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {video.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Exercises Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 mt-6">Featured Exercises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {exercises.map((exercise, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{exercise.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{exercise.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">{exercise.buttonText}</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <BackButton />
          </div>
        </div>
      </main>
    </div>
  );
}