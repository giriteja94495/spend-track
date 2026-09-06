import { useEffect, useState } from 'react';
import { formatCurrency, parseDate } from '../../utils/helpers';
import { Sparkles, Zap, Target, TrendingUp, Shield, Lightbulb } from 'lucide-react';

const colorMap = {
  green: 'bg-green-100 text-green-700',
  pink: 'bg-pink-100 text-pink-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
};

export const InsightCard = ({ title, text, icon: Icon, color }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border border-dark-100 bg-white hover:shadow-lg transition-all duration-300">
    <span className={`${colorMap[color]} p-2 rounded-lg flex-shrink-0`}>
      <Icon className="w-4 h-4" />
    </span>
    <div>
      <h4 className="text-sm font-semibold text-dark-900">{title}</h4>
      <p className="text-sm text-dark-600 mt-0.5">{text}</p>
    </div>
  </div>
);

export const Insights = ({ transactions }) => {
  const insights = [];

  const monthly = {};
  transactions.forEach(t => {
    const d = parseDate(t.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!monthly[key]) monthly[key] = { spent: 0, saved: 0, wants: 0, needs: 0 };
    if (t.type === 'Saving') monthly[key].saved += t.amount;
    else if (t.type === 'Want') { monthly[key].spent += t.amount; monthly[key].wants += t.amount; }
    else if (t.type === 'Need' || t.type === 'Debt Payment') { monthly[key].spent += t.amount; monthly[key].needs += t.amount; }
  });

  const months = Object.keys(monthly).sort();

  if (months.length >= 2) {
    const cur = monthly[months[months.length - 1]];
    const prev = monthly[months[months.length - 2]];
    const curSavingsRate = cur.spent + cur.saved > 0 ? (cur.saved / (cur.spent + cur.saved)) * 100 : 0;
    const prevSavingsRate = prev.spent + prev.saved > 0 ? (prev.saved / (prev.spent + prev.saved)) * 100 : 0;
    const delta = curSavingsRate - prevSavingsRate;

    insights.push({
      title: delta >= 0 ? 'Savings rate improved!' : 'Savings rate dipped',
      text: `${Math.abs(delta).toFixed(1)}% ${delta >= 0 ? 'higher' : 'lower'} than last month. ${cur.saved > 0 ? `You saved ${formatCurrency(cur.saved)} this month.` : ''}`,
      icon: delta >= 0 ? TrendingUp : Zap,
      color: delta >= 0 ? 'green' : 'amber',
    });
  }

  const wants = transactions.filter(t => t.type === 'Want').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter(t => t.type !== 'Saving' && t.type !== 'Income').reduce((s, t) => s + t.amount, 0);
  const wantsRatio = spent > 0 ? (wants / spent) * 100 : 0;

  if (wantsRatio > 40) {
    insights.push({
      title: 'High "Want" spending',
      text: `${wantsRatio.toFixed(0)}% of your spending goes to wants. Great to enjoy, but trimming 10% could boost savings.`,
      icon: Lightbulb,
      color: 'purple',
    });
  } else {
    insights.push({
      title: 'Balanced spending',
      text: `Only ${wantsRatio.toFixed(0)}% of spending is on wants. You're doing great at prioritizing essentials.`,
      icon: Sparkles,
      color: 'green',
    });
  }

  const saved = transactions.filter(t => t.type === 'Saving').reduce((s, t) => s + t.amount, 0);
  const total = spent + saved;
  const savingsRate = total > 0 ? (saved / total) * 100 : 0;

  insights.push({
    title: `Savings rate: ${savingsRate.toFixed(1)}%`,
    text: `You've saved ${formatCurrency(saved)} out of ${formatCurrency(total)} total outflow. ${savingsRate >= 30 ? 'Excellent discipline!' : 'Aim for 30% to build strong wealth.'}`,
    icon: Target,
    color: savingsRate >= 30 ? 'green' : 'blue',
  });

  const categories = {};
  transactions.filter(t => t.type !== 'Saving' && t.type !== 'Income').forEach(t => {
    if (!categories[t.category]) categories[t.category] = 0;
    categories[t.category] += t.amount;
  });
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  if (topCategory) {
    const catSpent = topCategory[1];
    const share = spent > 0 ? (catSpent / spent) * 100 : 0;
    insights.push({
      title: `Largest spend: ${topCategory[0]}`,
      text: `${formatCurrency(catSpent)} (${share.toFixed(0)}%) went to ${topCategory[0]}. Check if this aligns with your goals.`,
      icon: Lightbulb,
      color: 'pink',
    });
  }

  const savingsCats = {};
  transactions.filter(t => t.type === 'Saving').forEach(t => {
    if (!savingsCats[t.category]) savingsCats[t.category] = 0;
    savingsCats[t.category] += t.amount;
  });
  const topSaving = Object.entries(savingsCats).sort((a, b) => b[1] - a[1])[0];
  if (topSaving) {
    insights.push({
      title: 'Strongest saving: ' + topSaving[0],
      text: `You've invested ${formatCurrency(topSaving[1])} into ${topSaving[0]}. Building your future!`,
      icon: Shield,
      color: 'blue',
    });
  }

  return (
    <div className="space-y-3">
      {insights.slice(0, 5).map((insight, i) => (
        <InsightCard key={i} {...insight} />
      ))}
    </div>
  );
};