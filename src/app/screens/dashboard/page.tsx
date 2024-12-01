'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from '@/components/Sidebar'
import UserInfo from '@/components/UserInfo'
import NavigationCard from '@/components/NavigationCard'

interface Metrics {
  behavioralScore: number;
  financialHabitsScore: number;
  stabilityScore: number;
  professionalismScore: number;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ic = searchParams.get('ic');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    creditScore: 0,
    riskLevel: "",
    learningScore: 0
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ic) {
      router.push('/');
      return;
    }

    const fetchMetrics = async () => {
      try {
        const [behavioralRes, financialRes, stabilityRes, professionalismRes] = await Promise.all([
          fetch(`/api/behavioural-score?ic=${ic}`),
          fetch(`/api/financial-habits?ic=${ic}`),
          fetch(`/api/stability?ic=${ic}`),
          fetch(`/api/professionalism?ic=${ic}`)
        ]);

        const behavioral = await behavioralRes.json();
        const financial = await financialRes.json();
        const stability = await stabilityRes.json();
        const professionalism = await professionalismRes.json();

        console.log('Behavioral response:', behavioral);

        setMetrics({
          behavioralScore: behavioral.finalScore,
          financialHabitsScore: financial.score,
          stabilityScore: stability.score,
          professionalismScore: professionalism.score
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard?ic=${ic}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load user data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    fetchData();
  }, [ic, router]);

  const handlePersonalizedSummary = () => {
    const riskLevelMap: { [key: string]: string } = {
      'High Risk': 'bad',
      'Medium Risk': 'medium',
      'Low Risk': 'good'
    };
    
    const route = riskLevelMap[userData.riskLevel] || 'medium';
    router.push(`/screens/${route}?ic=${ic}`);
  };

  const getRiskLevel = () => {
    if (!metrics) return null;
    const avgScore = (
      metrics.behavioralScore +
      metrics.financialHabitsScore +
      metrics.stabilityScore +
      metrics.professionalismScore
    ) / 4;

    if (avgScore >= 75) return 'good';
    if (avgScore >= 50) return 'medium';
    return 'bad';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {userData.name}</h1>
        <div className="space-y-6">
          <UserInfo {...userData} />
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics?.behavioralScore?.toFixed(2) || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Habits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics?.financialHabitsScore?.toFixed(2) || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stability Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics?.stabilityScore?.toFixed(2) || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professionalism Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics?.professionalismScore?.toFixed(2) || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handlePersonalizedSummary}
                className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
              >
                View Personalized Summary
              </button>
            </div>
          </div>
          <NavigationCard ic={ic || ''} />
        </div>
      </main>
    </div>
  )
}
