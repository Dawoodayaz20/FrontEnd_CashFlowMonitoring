import type { FinancialData, MonthlyForecast, RiskLevel } from '../types';

export const calculateForecast = (data: FinancialData): MonthlyForecast[] => {
  const forecast: MonthlyForecast[] = [];
  let balance = data.currentSavings;
  const totalExpenses = data.fixedExpenses + data.variableExpenses;

  for (let i = 0; i < data.forecastPeriod; i++) {
    balance += data.monthlyIncome - totalExpenses;
    forecast.push({
      month: `Month ${i + 1}`,
      balance: Math.round(balance),
      income: data.monthlyIncome,
      expenses: totalExpenses
    });
  }
  return forecast;
};

export const getRiskLevel = (data: FinancialData, forecast: MonthlyForecast[]): RiskLevel => {
  const totalExpenses = data.fixedExpenses + data.variableExpenses;
  const netMonthly = data.monthlyIncome - totalExpenses;
  const hasNegativeBalance = forecast.some(f => f.balance < 0);
  const expenseRatio = totalExpenses / data.monthlyIncome;

  if (hasNegativeBalance || netMonthly < 0) {
    return { status: 'high-risk', label: 'High Risk', icon: '❌' };
  }
  if (expenseRatio > 0.8 || data.currentSavings < totalExpenses * 2) {
    return { status: 'tight', label: 'Tight', icon: '⚠️' };
  }
  return { status: 'safe', label: 'Safe', icon: '✅' };
};

export const calculateSurvivalMonths = (savings: number, expenses: number): number => {
  return expenses > 0 ? Math.floor(savings / expenses) : Infinity;
};