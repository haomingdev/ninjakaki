'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'
import { Button } from "@/components/ui/button"

const Sidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ic = searchParams.get('ic');
  const [riskLevel, setRiskLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiskLevel = async () => {
      if (!ic) return;

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

        const avgScore = (
          behavioral.score +
          financial.score +
          stability.score +
          professionalism.score
        ) / 4;

        if (avgScore >= 75) setRiskLevel('good');
        else if (avgScore >= 50) setRiskLevel('medium');
        else setRiskLevel('bad');
      } catch (error) {
        console.error('Error fetching risk level:', error);
      }
    };

    fetchRiskLevel();
  }, [ic]);

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">CreditKaki</h2>
      <nav className="space-y-2">
        <Link href={`/screens/dashboard?ic=${ic}`}>
          <Button variant="ghost" className="w-full justify-start">
            Analysis
          </Button>
        </Link>
        
        {riskLevel && (
          <Link href={`/screens/${riskLevel}?ic=${ic}`}>
            <Button variant="ghost" className="w-full justify-start">
              Education
            </Button>
          </Link>
        )}

        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            Logout
          </Button>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar
