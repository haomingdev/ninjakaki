import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import React from 'react'

export default async function Home() {
  const accounts = await prisma.account.findMany({
    include: {
      scheme: true,
    },
  })

  const screens = [
    {
      name: 'Get Accounts',
      description: 'View and manage all bank accounts',
      path: '/screens/getAccounts',
      color: 'blue',
    },
    {
      name: 'Transactions',
      description: 'View all account transactions',
      path: '/screens/transactions',
      color: 'green',
    },
    {
      name: 'Balances',
      description: 'Check current account balances',
      path: '/screens/balances',
      color: 'yellow',
    },
    {
      name: 'Schemes',
      description: 'Manage account schemes and types',
      path: '/screens/schemes',
      color: 'purple',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">PayHack 2024</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {screens.map((screen) => (
            <Link
              key={screen.path}
              href={screen.path}
              className="block hover:transform hover:scale-105 transition-all"
            >
              <div className={`bg-white overflow-hidden shadow rounded-lg p-6 border-l-4 border-${screen.color}-500`}>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {screen.name}
                </h2>
                <p className="text-gray-500">{screen.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Accounts</h2>
          <div className="grid gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium">{account.accountHolderFullName}</h3>
                <p className="text-gray-600">{account.accountNumber}</p>
                <p className="text-sm text-gray-500">{account.accountType}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
