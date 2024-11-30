import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserInfoProps {
  name: string
  creditScore: number
  riskLevel: string
  learningScore: number
}

const UserInfo = ({ name, creditScore, riskLevel, learningScore }: UserInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-lg">{name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Credit Score</p>
            <p className="text-lg">{creditScore.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Risk Level</p>
            <p className="text-lg">{riskLevel}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Learning Score</p>
            <p className="text-lg">{learningScore}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserInfo
