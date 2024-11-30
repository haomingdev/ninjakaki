"use client";

import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/BackButton"
import { YouTubeEmbed } from "@/components/YouTubeEmbed"

export default function MediumPage() {
  const insights = [
    "Your credit score is in the medium range, indicating moderate financial health.",
    "Consider increasing your emergency fund to improve financial stability.",
    "Look into opportunities for additional income streams.",
    "Review and optimize your monthly expenses.",
    "Consider financial education resources to improve your knowledge."
  ];

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="space-y-8">
          {/* Actionable Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Actionable Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-decimal list-inside space-y-2">
                {insights.map((insight, index) => (
                  <li key={index} className="text-muted-foreground">
                    {insight}
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

        </div>
      </main>
    </div>
  )
}