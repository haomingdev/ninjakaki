import { prisma } from '@/lib/prisma'
import { FinancialMetrics, Transaction } from '@prisma/client'
import React from 'react'

type FinancialMetricsWithTransactions = FinancialMetrics & {
  transactions: Transaction[]
}

interface GetAccountScreenProps {
  metrics: FinancialMetricsWithTransactions[]
}

async function getFinancialMetrics() {
  const metrics = await prisma.financialMetrics.findMany({
    include: {
      transactions: true,
    },
  })
  return metrics
}

export function GetAccountScreen({ metrics }: GetAccountScreenProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Financial Metrics</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {metric.fullName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {metric.typeOfGig}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">IC Number</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {metric.ic}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Net Income</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ${metric.netIncome.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gross Income</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      ${metric.grossIncome.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Employment Status</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {metric.permanentEmployment} ({metric.yearsOfEmployment} years)
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Financial Health Indicators</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Expense Ratio</p>
                      <p className="font-medium">{(metric.expenseToIncomeRatio * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Regular Savings</p>
                      <p className="font-medium">{metric.regularSaving ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emergency Fund</p>
                      <p className="font-medium">{metric.emergencyFundAvailability ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Portfolio Risk</p>
                      <p className="font-medium">{metric.portfolioDiversificationRisk.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Transactions</h4>
                <div className="space-y-2">
                  {metric.transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between text-sm">
                      <span className="text-gray-500">{transaction.receipientCategory}</span>
                      <span className="font-medium">${transaction.spendingAmount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
