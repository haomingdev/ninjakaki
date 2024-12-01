import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all financial metrics
    const metrics = await prisma.financialMetrics.findMany({
      include: {
        transactions: true,
      },
    })

    // Update each user's metrics
    for (const metric of metrics) {
      const transactions = metric.transactions
      const incomeTransactions = transactions.filter(t => t.spendingAmount > 0)
      const expenseTransactions = transactions.filter(t => t.spendingAmount < 0)

      // Calculate fluctuation rate (0-10 scale)
      let fluctuationRate = 5 // Default to medium if no transactions
      let fluctuationExplanation = 'Not enough income transactions, using default medium (5)'
      
      if (incomeTransactions.length > 1) {
        const incomes = incomeTransactions.map(t => t.spendingAmount)
        const maxIncome = Math.max(...incomes)
        const minIncome = Math.min(...incomes)
        const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length
        
        // Calculate fluctuation as percentage of average income, scale to 0-10
        const rawFluctuation = avgIncome > 0 
          ? ((maxIncome - minIncome) / avgIncome) * 5
          : 10
          
        fluctuationRate = Number(Math.min(rawFluctuation, 10).toFixed(2))
        fluctuationExplanation = `Calculated from income variation: max=${maxIncome}, min=${minIncome}, avg=${avgIncome}, raw=${rawFluctuation}`
      }

      // Calculate expense ratio
      const totalExpenses = expenseTransactions
        .reduce((sum, t) => sum + Math.abs(t.spendingAmount), 0)
      
      // Calculate monthly income - try different sources
      let monthlyIncome = 0
      let incomeSource = 'none'
      
      // First try stored income values
      if (metric.netIncome && metric.netIncome > 0) {
        monthlyIncome = metric.netIncome
        incomeSource = 'net_income'
      } else if (metric.grossIncome && metric.grossIncome > 0) {
        monthlyIncome = metric.grossIncome
        incomeSource = 'gross_income'
      }
      // If no stored income, calculate from transactions
      else if (incomeTransactions.length > 0) {
        const totalIncome = incomeTransactions
          .reduce((sum, t) => sum + t.spendingAmount, 0)
        monthlyIncome = totalIncome / 3 // Assume transactions are from last 3 months
        incomeSource = 'transactions'
      }
      
      // Calculate expense ratio as percentage
      let expenseRatio = 150 // Default high if no income data
      let expenseExplanation = 'No monthly income data available'
      
      if (monthlyIncome > 0) {
        // If we have expenses, calculate ratio
        if (totalExpenses > 0) {
          expenseRatio = Number((totalExpenses / monthlyIncome * 100).toFixed(2))
          expenseExplanation = `${totalExpenses.toFixed(2)} / ${monthlyIncome.toFixed(2)} * 100`
        } 
        // If no expenses but we have income data, this is suspicious - use high ratio
        else {
          expenseRatio = 150
          expenseExplanation = 'No expense transactions found despite having income - suspicious'
        }
      } else if (totalExpenses > 0) {
        // If we have expenses but no income, that's bad
        expenseRatio = 200
        expenseExplanation = 'Has expenses but no income data'
      } else {
        // No income and no expenses - probably missing data
        expenseRatio = 150
        expenseExplanation = 'No income or expense data available'
      }

      console.log('Updating metrics for user:', metric.ic, {
        transactions: {
          income: {
            count: incomeTransactions.length,
            amounts: incomeTransactions.map(t => t.spendingAmount),
            total: incomeTransactions.reduce((sum, t) => sum + t.spendingAmount, 0)
          },
          expense: {
            count: expenseTransactions.length,
            amounts: expenseTransactions.map(t => t.spendingAmount),
            total: totalExpenses
          }
        },
        income: {
          source: incomeSource,
          stored: {
            net: metric.netIncome,
            gross: metric.grossIncome
          },
          monthly: monthlyIncome
        },
        calculations: {
          fluctuationRate: {
            value: fluctuationRate + '/10',
            explanation: fluctuationExplanation
          },
          expenseRatio: {
            value: expenseRatio + '%',
            explanation: expenseExplanation,
            details: {
              expenses: totalExpenses,
              monthlyIncome: monthlyIncome,
              hasExpenses: totalExpenses > 0,
              hasIncome: monthlyIncome > 0
            }
          }
        }
      })

      // Update the metrics
      await prisma.financialMetrics.update({
        where: { id: metric.id },
        data: {
          fluctuationRate: fluctuationRate,
          expenseToIncomeRatio: expenseRatio
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Metrics updated successfully' 
    })
  } catch (error) {
    console.error('Error updating metrics:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update metrics' 
    }, { status: 500 })
  }
}
