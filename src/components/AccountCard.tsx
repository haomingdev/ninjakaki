'use client'

import { Account } from '@prisma/client'

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{account.accountHolderFullName}</h3>
          <p className="text-gray-600">{account.accountNumber}</p>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
          {account.accountType}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Product Type</p>
          <p className="font-medium">{account.productType}</p>
        </div>
        <div>
          <p className="text-gray-500">Currency</p>
          <p className="font-medium">{account.accountCurrency}</p>
        </div>
        <div>
          <p className="text-gray-500">ID Type</p>
          <p className="font-medium">{account.idType}</p>
        </div>
        <div>
          <p className="text-gray-500">ID Value</p>
          <p className="font-medium">{account.idValue}</p>
        </div>
      </div>
    </div>
  )
}
