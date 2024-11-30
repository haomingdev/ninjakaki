import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'

async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        account: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    })
    return { transactions, error: null }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return { 
      transactions: [], 
      error: 'Failed to fetch transactions' 
    }
  }
}

function TransactionsList({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    )
  }

  return (
    <ul role="list" className="divide-y divide-gray-200">
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description || 'Unnamed Transaction'}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.account?.accountNumber || 'Unknown Account'}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p
                  className={`text-sm font-semibold ${
                    (transaction.amount || 0) > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {(transaction.amount || 0).toFixed(2)} {transaction.currency || 'USD'}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction.transactionDate 
                    ? new Date(transaction.transactionDate).toLocaleDateString()
                    : 'Unknown Date'}
                </p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function LoadingState() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-4 border-b border-gray-200">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function TransactionsScreen() {
  const { transactions, error } = await getTransactions()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transactions</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : (
            <Suspense fallback={<LoadingState />}>
              <TransactionsList transactions={transactions} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}
