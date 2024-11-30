import Link from 'next/link'
import { Button } from "@/components/ui/button"

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <nav className="space-y-2">
        <Link href="/analysis">
          <Button variant="ghost" className="w-full justify-start">
            Analysis
          </Button>
        </Link>
        <Link href="/education">
          <Button variant="ghost" className="w-full justify-start">
            Education
          </Button>
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar
