import { prisma } from '@/lib/prisma'

async function getSchemes() {
  const schemes = await prisma.accountScheme.findMany({
    include: {
      accounts: true,
    },
  })
  return schemes
}

export default async function SchemesScreen() {
  const schemes = await getSchemes()

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Schemes</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {scheme.schemeName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {scheme.schemeType}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {scheme.description}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Linked Accounts</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {scheme.accounts.length}
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
