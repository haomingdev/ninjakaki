import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to normalize a value between 0 and 100
function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

async function calculateProfessionalismScore(metrics: any) {
  // Normalize input values first
  const cancellationRate = Math.max(0, Math.min(1, metrics.cancellationRate || 0))
  const ratings = Math.max(0, Math.min(1, metrics.ratings || 0))
  const responsiveness = Math.max(0, Math.min(1, metrics.responsivenessToTask || 0))
  const minMaxDiff = Math.max(0, Math.min(1, metrics.minMaxDiffPast6Months || 0))
  const ratingsInflux = Math.max(0, Math.min(1, metrics.ratingsInflux || 0))

  // Calculate individual components (0-100%)
  const fulfillingRate = normalizeScore((1 - cancellationRate) * 100)
  const ratingScore = normalizeScore(ratings * 100)
  const responsivenessScore = normalizeScore(responsiveness * 100)
  const minMaxDiffScore = normalizeScore(minMaxDiff * 100)
  const influxScore = normalizeScore(ratingsInflux * 100)

  // Calculate weighted score (max 30%)
  const professionalismScore = (
    (fulfillingRate * 0.25) +
    (ratingScore * 0.20) +
    (responsivenessScore * 0.15) +
    (minMaxDiffScore * 0.20) +
    (influxScore * 0.20)
  ) * 0.3  // 30% of total score

  return professionalismScore
}

async function calculateStabilityScore(metrics: any) {
  const HIGH_VALUE_GIGS = ['Software Development', 'Medical', 'Legal', 'Financial Services']
  
  // Calculate individual components (0-100%)
  const gigValue = HIGH_VALUE_GIGS.includes(metrics.typeOfGig) ? 100 : 50
  const permanentEmploymentValue = metrics.permanentEmployment === 'Yes' ? 100 : 50
  const yearsOfEmploymentValue = normalizeScore((Math.min(metrics.yearsOfEmployment || 0, 10) / 10) * 100)
  
  // Fluctuation rate should be inverse - higher fluctuation means lower score
  const rawFluctuationRate = metrics.fluctuationRate ?? 0
  const fluctuationValue = normalizeScore((1 - rawFluctuationRate) * 100)

  // Calculate weighted score (max 40%)
  const stabilityScore = (
    (gigValue * 0.25) +
    (permanentEmploymentValue * 0.30) +
    (yearsOfEmploymentValue * 0.25) +
    (fluctuationValue * 0.20)
  ) * 0.4  // 40% of total score

  return stabilityScore
}

async function calculateFinancialHabitsScore(metrics: any, transactions: any[]) {
  // Calculate luxury ratio (0-100%)
  const totalTransactions = transactions.length
  const luxuryCount = transactions.filter(tx => tx.necessitiesOrNonEssential === false).length
  const luxuryToNecessityRatio = totalTransactions > 0 
    ? normalizeScore((luxuryCount / totalTransactions) * 100)
    : 0

  // Calculate expense ratio (0-100%)
  const rawExpenseRatio = metrics.expenseToIncomeRatio ?? 0
  const expenseRatioScore = normalizeScore((1 - rawExpenseRatio) * 100)

  // Calculate individual components (0-100%)
  const historicalSpendingScore = normalizeScore(metrics.consistentSpending ? 100 : 50)
  const impulsivePurchaseScore = normalizeScore(100 - luxuryToNecessityRatio)
  const consistentRepaymentScore = normalizeScore(metrics.recurringExpenseConsistency * 100 || 0)

  // Calculate weighted score (max 30%)
  const financialHabitsScore = (
    (historicalSpendingScore * 0.35) +
    (impulsivePurchaseScore * 0.35) +
    (consistentRepaymentScore * 0.20) +
    (expenseRatioScore * 0.10)
  ) * 0.3  // 30% of total score

  return financialHabitsScore
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ic = searchParams.get("ic");

    console.log("Dashboard API - Received IC:", ic);

    // First, let's check what ICs we have in the database
    const allMetrics = await prisma.financialMetrics.findMany({
      select: {
        ic: true,
        fullName: true,
        timestamp: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log("Available ICs in database:", allMetrics.map(m => ({ ic: m.ic, name: m.fullName })));

    let targetIC = ic;
    if (!targetIC && allMetrics.length > 0) {
      targetIC = allMetrics[0].ic;
      console.log("No IC provided, using most recent:", targetIC);
    }

    if (!targetIC) {
      console.log("Dashboard API - Error: No data in database");
      return NextResponse.json(
        { error: "No data in database" },
        { status: 404 }
      );
    }

    // Fetch full metrics
    const userMetrics = await prisma.financialMetrics.findFirst({
      where: { ic: targetIC },
      orderBy: { timestamp: 'desc' }
    });

    if (!userMetrics) {
      console.log("Dashboard API - Error: User not found");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: { ic: targetIC },
      select: {
        id: true,
        necessitiesOrNonEssential: true,
        spendingAmount: true
      }
    });

    // Calculate all component scores
    const [professionalismScore, stabilityScore, financialHabitsScore] = await Promise.all([
      calculateProfessionalismScore(userMetrics),
      calculateStabilityScore(userMetrics),
      calculateFinancialHabitsScore(userMetrics, transactions)
    ]);

    // Calculate final score (sum of all weighted scores)
    const creditScore = normalizeScore(
      (professionalismScore) + 
      (stabilityScore) + 
      (financialHabitsScore)
    );

    // Determine risk level
    let riskLevel;
    if (creditScore >= 80) {
      riskLevel = "Low Risk";
    } else if (creditScore >= 60) {
      riskLevel = "Medium Risk";
    } else {
      riskLevel = "High Risk";
    }

    console.log("Dashboard API - Returning data for user:", userMetrics.fullName);
    return NextResponse.json({
      name: userMetrics.fullName,
      creditScore: Number(creditScore.toFixed(2)),  
      riskLevel,
      learningScore: 85, 
      rawMetrics: userMetrics,
      breakdown: {
        professionalism: Number(normalizeScore(professionalismScore).toFixed(2)),
        stability: Number(normalizeScore(stabilityScore).toFixed(2)),
        financialHabits: Number(normalizeScore(financialHabitsScore).toFixed(2))
      }
    });

  } catch (error) {
    console.error("Dashboard API - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
