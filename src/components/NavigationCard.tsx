import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NavigationCardProps {
  ic: string;
}

const NavigationCard = ({ ic }: NavigationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Navigation</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Link href={`/screens/behavioural-score?ic=${ic}`}>
          <Button className="w-full">Behavioral Score</Button>
        </Link>
        <Link href={`/screens/professionalism?ic=${ic}`}>
          <Button className="w-full">Professionalism</Button>
        </Link>
        <Link href={`/screens/stability?ic=${ic}`}>
          <Button className="w-full">Stability</Button>
        </Link>
        <Link href={`/screens/financial-habits?ic=${ic}`}>
          <Button className="w-full">Financial Habits</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default NavigationCard
