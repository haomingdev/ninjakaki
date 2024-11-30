"use client";

import Sidebar from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/BackButton"

export default function GoodPage() {
  const insights = [
    "Complete your profile to unlock better loan offers",
    "Your credit score qualifies you for premium rates",
    "Review your loan options in the featured products below"
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

          {/* Featured Products Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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