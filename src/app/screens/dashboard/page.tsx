'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import UserInfo from '@/components/UserInfo'
import NavigationCard from '@/components/NavigationCard'

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: "",
    creditScore: 0,
    riskLevel: "",
    learningScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Just fetch without an IC - the API will use the most recent one
        const response = await fetch('/api/dashboard');
        
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

    fetchData();
  }, []);

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
          <NavigationCard />
        </div>
      </main>
    </div>
  )
}
