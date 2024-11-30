import { prisma } from '@/lib/prisma'
import { Account, AccountScheme } from '@prisma/client'
import React from 'react'

type AccountWithScheme = Account & {
  scheme: AccountScheme
}

export default async function GetAccountsScreen() {
  const accounts = await prisma.account.findMany({
    include: {
      scheme: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bank Accounts</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {account.accountHolderFullName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {account.accountType}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {account.accountNumber}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {account.accountCurrency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Product Type</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {account.productType}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <div className="text-sm">
                  <p className="text-gray-500">Scheme</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {account.scheme.schemeName}
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
