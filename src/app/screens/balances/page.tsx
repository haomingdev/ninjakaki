import { prisma } from '@/lib/prisma'

async function getBalances() {
  const balances = await prisma.balance.findMany({
    include: {
      account: true,
    },
  })
  return balances
}

export default async function BalancesScreen() {
  const balances = await getBalances()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Balances</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {balances.map((balance) => (
            <div
              key={balance.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {balance.account.accountHolderFullName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {balance.amount.toFixed(2)} {balance.currency}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {balance.account.accountNumber}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(balance.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
