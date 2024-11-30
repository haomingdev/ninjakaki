import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const NavigationCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Navigation</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between">
        <Link href="/screens/professionalism">
          <Button>Professionalism</Button>
        </Link>
        <Link href="/screens/stability">
          <Button>Stability</Button>
        </Link>
        <Link href="/screens/financial-habits">
          <Button>Habit</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default NavigationCard
