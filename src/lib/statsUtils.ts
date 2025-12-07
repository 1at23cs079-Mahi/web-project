import { Player } from '@/data/players';

// ==================== STATISTICAL FUNCTIONS ====================

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(calculateMean(squaredDiffs));
}

export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  return calculateMean(values.map(val => Math.pow(val - mean, 2)));
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
}

export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ==================== CRICKET-SPECIFIC CALCULATIONS ====================

export function calculateBattingIndex(player: Player): number {
  const avgWeight = 0.4;
  const srWeight = 0.3;
  const consistencyWeight = 0.2;
  const experienceWeight = 0.1;

  const avgScore = Math.min(player.battingAverage / 60, 1) * 100;
  const srScore = Math.min(player.strikeRate / 180, 1) * 100;
  
  const consistency = calculateConsistencyScore(player.runsPerMatch);
  const experience = Math.min(player.matchesPlayed / 200, 1) * 100;

  return avgScore * avgWeight + srScore * srWeight + consistency * consistencyWeight + experience * experienceWeight;
}

export function calculateBowlingIndex(player: Player): number {
  if (player.wickets === 0) return 0;

  const economyWeight = 0.35;
  const wicketsWeight = 0.35;
  const consistencyWeight = 0.2;
  const experienceWeight = 0.1;

  const economyScore = Math.max(0, (10 - player.bowlingEconomy) / 10) * 100;
  const wicketsScore = Math.min(player.wickets / player.matchesPlayed * 20, 100);
  const consistency = calculateConsistencyScore(player.wicketsPerMatch);
  const experience = Math.min(player.matchesPlayed / 150, 1) * 100;

  return economyScore * economyWeight + wicketsScore * wicketsWeight + consistency * consistencyWeight + experience * experienceWeight;
}

export function calculateConsistencyScore(values: number[]): number {
  if (values.length < 2) return 50;
  
  const mean = calculateMean(values);
  if (mean === 0) return 50;
  
  const stdDev = calculateStandardDeviation(values);
  const coefficientOfVariation = (stdDev / mean) * 100;
  
  // Lower CV = more consistent = higher score
  return clamp(100 - coefficientOfVariation, 0, 100);
}

export function calculateStrikeRotation(player: Player): number {
  // Percentage of runs from singles/doubles vs boundaries
  const boundaryRuns = (player.fours * 4) + (player.sixes * 6);
  const nonBoundaryRuns = player.totalRuns - boundaryRuns;
  
  if (player.totalRuns === 0) return 0;
  return (nonBoundaryRuns / player.totalRuns) * 100;
}

export function calculateBoundaryPercentage(player: Player): number {
  if (player.totalRuns === 0) return 0;
  const boundaryRuns = (player.fours * 4) + (player.sixes * 6);
  return (boundaryRuns / player.totalRuns) * 100;
}

export function calculateSixToFourRatio(player: Player): number {
  if (player.fours === 0) return player.sixes > 0 ? Infinity : 0;
  return player.sixes / player.fours;
}

export function calculateRunsPerMatch(player: Player): number {
  if (player.matchesPlayed === 0) return 0;
  return player.totalRuns / player.matchesPlayed;
}

export function calculateWicketsPerMatch(player: Player): number {
  if (player.matchesPlayed === 0) return 0;
  return player.wickets / player.matchesPlayed;
}

// ==================== FORM & TREND ANALYSIS ====================

export function calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 4) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = calculateMean(firstHalf);
  const secondAvg = calculateMean(secondHalf);
  
  const change = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  
  if (change > 10) return 'up';
  if (change < -10) return 'down';
  return 'stable';
}

export function calculateMovingAverage(values: number[], window: number = 3): number[] {
  if (values.length < window) return values;
  
  const result: number[] = [];
  for (let i = window - 1; i < values.length; i++) {
    const windowValues = values.slice(i - window + 1, i + 1);
    result.push(calculateMean(windowValues));
  }
  return result;
}

export function calculateExponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];
  
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

export function predictNextValue(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  
  const ema = calculateExponentialMovingAverage(values, 0.4);
  const lastEma = ema[ema.length - 1];
  const trend = calculateTrendDirection(values);
  
  const trendMultiplier = trend === 'up' ? 1.05 : trend === 'down' ? 0.95 : 1;
  return lastEma * trendMultiplier;
}

// ==================== DATA TRANSFORMATION ====================

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

export function getRoleIcon(role: Player['role']): string {
  switch (role) {
    case 'Batsman': return '🏏';
    case 'Bowler': return '🎯';
    case 'All-Rounder': return '⚡';
    case 'Wicket-Keeper': return '🧤';
    default: return '🏏';
  }
}

export function getRoleColor(role: Player['role']): string {
  switch (role) {
    case 'Batsman': return 'hsl(190, 100%, 50%)';
    case 'Bowler': return 'hsl(270, 91%, 65%)';
    case 'All-Rounder': return 'hsl(330, 90%, 60%)';
    case 'Wicket-Keeper': return 'hsl(67, 94%, 48%)';
    default: return 'hsl(190, 100%, 50%)';
  }
}

export function getFormColor(form: string): string {
  switch (form) {
    case 'Excellent': return 'hsl(150, 100%, 50%)';
    case 'Good': return 'hsl(190, 100%, 50%)';
    case 'Average': return 'hsl(45, 100%, 50%)';
    case 'Poor': return 'hsl(30, 100%, 50%)';
    case 'Critical': return 'hsl(0, 84%, 60%)';
    default: return 'hsl(200, 20%, 70%)';
  }
}

export function getTrajectoryIcon(trajectory: string): string {
  switch (trajectory) {
    case 'ascending': return '📈';
    case 'peak': return '⭐';
    case 'declining': return '📉';
    case 'stable': return '➡️';
    default: return '➡️';
  }
}

// ==================== COMPARISON UTILITIES ====================

export function compareValues(a: number, b: number): 'higher' | 'lower' | 'equal' {
  if (Math.abs(a - b) < 0.01) return 'equal';
  return a > b ? 'higher' : 'lower';
}

export function calculatePercentageDifference(a: number, b: number): number {
  if (b === 0) return a > 0 ? 100 : 0;
  return ((a - b) / b) * 100;
}

export function rankPlayers(players: Player[], key: keyof Player, ascending: boolean = false): Player[] {
  return [...players].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });
}

export function getTopN<T>(items: T[], n: number, scorer: (item: T) => number): T[] {
  return [...items]
    .map(item => ({ item, score: scorer(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ item }) => item);
}

// ==================== CHART DATA HELPERS ====================

export function generateChartData(
  players: Player[],
  xKey: keyof Player,
  yKey: keyof Player
): { x: number | string; y: number; name: string }[] {
  return players.map(player => ({
    x: player[xKey] as number | string,
    y: player[yKey] as number,
    name: player.name,
  }));
}

export function generateRadarData(player: Player): { attribute: string; value: number; fullMark: number }[] {
  return [
    { attribute: 'Batting', value: Math.min(player.battingAverage * 1.5, 100), fullMark: 100 },
    { attribute: 'Strike Rate', value: Math.min(player.strikeRate / 2, 100), fullMark: 100 },
    { attribute: 'Bowling', value: player.wickets > 0 ? Math.max(100 - player.bowlingEconomy * 10, 0) : 0, fullMark: 100 },
    { attribute: 'Wickets', value: Math.min(player.wickets / 3, 100), fullMark: 100 },
    { attribute: 'Fielding', value: player.fieldingRating, fullMark: 100 },
    { attribute: 'Fitness', value: player.fitnessScore, fullMark: 100 },
  ];
}

export function generateTimeSeriesData(
  values: number[],
  labelPrefix: string = 'M'
): { label: string; value: number }[] {
  return values.map((value, index) => ({
    label: `${labelPrefix}${index + 1}`,
    value,
  }));
}

// ==================== VALIDATION UTILITIES ====================

export function isValidPlayerData(data: Partial<Player>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.role || !['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].includes(data.role)) {
    errors.push('Invalid role');
  }

  if (data.battingAverage !== undefined && (data.battingAverage < 0 || data.battingAverage > 100)) {
    errors.push('Batting average must be between 0 and 100');
  }

  if (data.strikeRate !== undefined && (data.strikeRate < 0 || data.strikeRate > 300)) {
    errors.push('Strike rate must be between 0 and 300');
  }

  if (data.fitnessScore !== undefined && (data.fitnessScore < 0 || data.fitnessScore > 100)) {
    errors.push('Fitness score must be between 0 and 100');
  }

  return { valid: errors.length === 0, errors };
}

// ==================== DATE/TIME UTILITIES ====================

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
