"use client";

import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/BackButton"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';

interface Insight {
  message: string;
  severity: number;
}

interface Metric {
  cancellationRate?: number;
  fluctuationRate?: number;
  expenseToIncomeRatio?: number;
  impulsivePurchaseRate?: number;
  typeOfGig?: string;
  recurringExpenseConsistency?: number;
}

interface Breakdown {
  professionalism: {
    score: number;
    components: {
      fulfillingRate: number;
      rating: number;
      responsiveness: number;
      minMaxDiff: number;
      influx: number;
    };
  };
  stability: {
    score: number;
    components: {
      gigType: number;
      permanentEmployment: number;
      yearsOfEmployment: number;
      fluctuationRate: number;
    };
  };
  financialHabits: {
    score: number;
    components: {
      historicalSpending: number;
      impulsivePurchase: number;
      consistentRepayment: number;
      expenseRatio: number;
      details: {
        luxuryToNecessityRatio: number;
        otherExpensesManagement: number;
      };
    };
  };
}

export default function MediumPage() {
  const searchParams = useSearchParams();
  const ic = searchParams.get('ic') || '990606065820'; // Medium risk IC
  const [score, setScore] = useState<number>(0);
  const [metrics, setMetrics] = useState<Metric>({});
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/behavioural-score?ic=${ic}`);
      const data = await response.json();
      console.log('Received response:', data);

      if (data.success) {
        setScore(data.finalScore);
        setMetrics(data.metrics);
        setBreakdown(data.breakdown);

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
        if (fulfillingRate > 15) { // Lower threshold for medium risk
          allInsights.push({
            message: "Your gig completion rate is decent but could be improved. Consider being more selective with gig acceptance.",
            severity: fulfillingRate
          });
        }

        // Income Fluctuation (Lower is better)
        const fluctuationRate = calculateSeverity('fluctuationRate', (metrics.fluctuationRate || 0) * 10);
        console.log('Calculated fluctuation rate:', fluctuationRate);
        if (fluctuationRate > 15) { // Lower threshold for medium risk
          allInsights.push({
            message: "Your income shows some variability. Consider diversifying your gig sources for more stability.",
            severity: fluctuationRate
          });
        }

        // Expense Ratio (Lower is better)
        const expenseRatio = calculateSeverity('expenseRatio', (metrics.expenseToIncomeRatio || 0) * 100);
        console.log('Calculated expense ratio:', expenseRatio);
        if (expenseRatio > 25) { // Lower threshold for medium risk
          allInsights.push({
            message: "Your expense management is reasonable but could be optimized. Review monthly expenses for potential savings.",
            severity: expenseRatio
          });
        }

        // Impulsive Purchase Rate (Lower is better)
        const impulsiveRate = calculateSeverity('impulsivePurchase', metrics.impulsivePurchaseRate || 0);
        console.log('Calculated impulsive rate:', impulsiveRate);
        if (impulsiveRate > 40) { // Lower threshold for medium risk
          allInsights.push({
            message: "Consider tracking non-essential purchases more carefully to improve financial discipline.",
            severity: impulsiveRate
          });
        }

        // Gig Type (High value is better)
        const gigType = calculateSeverity('typeOfGig', metrics.typeOfGig || 'low_value');
        console.log('Gig type:', gigType);
        if (gigType > 30) { // Lower threshold for medium risk
          allInsights.push({
            message: "You're in a good gig category. Consider upskilling to access even higher-value opportunities.",
            severity: gigType
          });
        }

        // Recurring Expense Consistency (Higher is better)
        const repaymentScore = calculateSeverity('consistentRepayment', (metrics.recurringExpenseConsistency || 0) * 100);
        console.log('Calculated repayment score:', repaymentScore);
        if (repaymentScore < 95) { // Higher threshold for medium risk
          allInsights.push({
            message: "Your bill payment consistency is good but could be better. Set up auto-payments for key expenses.",
            severity: 100 - repaymentScore
          });
        }

        // Sort insights by severity
        allInsights.sort((a, b) => b.severity - a.severity);
        setInsights(allInsights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const educationalVideos = [
    {
      title: "How to Improve Your Credit Score",
      videoId: "Vn9ounAgG3w",  // Dave Ramsey: How to Improve Your Credit Score
      description: "Learn practical steps to improve your credit score and maintain good financial health."
    },
    {
      title: "Building Your Emergency Fund",
      videoId: "fVToMS2Q3XQ",  // Dave Ramsey: How to Build an Emergency Fund
      description: "Expert advice on building and maintaining an emergency fund for financial stability."
    },
    {
      title: "Smart Budgeting Tips",
      videoId: "HQzoZfc3GwQ",  // The 50-30-20 Budgeting Rule
      description: "Practical tips for creating and sticking to a budget to optimize your expenses."
    }
  ]

  const products = [
    {
      title: "Personal Loan",
      details: "Loan amount: RM 5,000 - RM 50,000\nInterest: 5.99% - 15.99%\nTenure: 12-60 months",
      buttonText: "Apply Now"
    },
    {
      title: "Home Loan",
      details: "Loan amount: RM 50,000 - RM 500,000\nInterest: 3.99% - 7.99%\nTenure: 15-30 years",
      buttonText: "Apply Now"
    },
    {
      title: "Business Loan",
      details: "Loan amount: RM 10,000 - RM 100,000\nInterest: 6.99% - 18.99%\nTenure: 12-84 months",
      buttonText: "Apply Now"
    }
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Medium Risk Assessment</h1>
        <div className="bg-yellow-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Risk Level: Medium</h2>
          <p className="text-gray-700 mb-4">
            Your financial behavior shows moderate risk factors. While there are some positive aspects,
            there's room for improvement in certain areas.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Consider building an emergency fund</li>
              <li>Review and optimize your monthly budget</li>
              <li>Look into debt consolidation options if applicable</li>
              <li>Start tracking your expenses more closely</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set up automatic savings transfers</li>
              <li>Create a debt repayment plan</li>
              <li>Review your credit report regularly</li>
              <li>Consider financial counseling services</li>
            </ul>
          </div>
        </div>

        {/* Actionable Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Actionable Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal list-inside space-y-2">
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

        {/* Featured Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 mt-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {products.map((product, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <pre className="whitespace-pre-line text-sm text-muted-foreground">
                    {product.details}
                  </pre>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    {product.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <BackButton />
        </div>

      </main>
    </div>
  )
}