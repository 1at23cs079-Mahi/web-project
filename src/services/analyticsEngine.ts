import { Player } from '@/data/players';

// Types for analytics
export interface PerformanceMetrics {
  overallRating: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  consistencyScore: number;
  impactScore: number;
  formIndex: number;
  potentialRating: number;
}

export interface FormAnalysis {
  currentForm: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Critical';
  formTrend: 'Rising' | 'Stable' | 'Declining';
  last5MatchesAvg: number;
  formScore: number;
  streak: { type: 'positive' | 'negative' | 'neutral'; count: number };
}

export interface PlayerComparison {
  player1: Player;
  player2: Player;
  battingEdge: string;
  bowlingEdge: string;
  fieldingEdge: string;
  overallEdge: string;
  metrics: {
    category: string;
    player1Value: number;
    player2Value: number;
    winner: 'player1' | 'player2' | 'tie';
  }[];
}

export interface MatchPrediction {
  winProbability: number;
  expectedRuns: number;
  expectedWickets: number;
  keyPlayers: Player[];
  riskFactors: string[];
  recommendations: string[];
}

export interface TeamAnalytics {
  teamStrength: number;
  battingDepth: number;
  bowlingStrength: number;
  fieldingEfficiency: number;
  balanceScore: number;
  weaknesses: string[];
  strengths: string[];
}

export interface PlayerPrediction {
  nextMatchRuns: { min: number; max: number; expected: number };
  nextMatchWickets: { min: number; max: number; expected: number };
  seasonProjection: {
    totalRuns: number;
    totalWickets: number;
    average: number;
  };
  peakPerformanceAge: number;
  careerTrajectory: 'ascending' | 'peak' | 'declining' | 'stable';
}

// Analytics Engine Class
export class AnalyticsEngine {
  private players: Player[];

  constructor(players: Player[]) {
    this.players = players;
  }

  updatePlayers(players: Player[]) {
    this.players = players;
  }

  // ==================== PERFORMANCE METRICS ====================
  
  calculatePerformanceMetrics(player: Player): PerformanceMetrics {
    const battingRating = this.calculateBattingRating(player);
    const bowlingRating = this.calculateBowlingRating(player);
    const fieldingRating = player.fieldingRating;
    const consistencyScore = this.calculateConsistency(player);
    const impactScore = this.calculateImpactScore(player);
    const formIndex = this.calculateFormIndex(player);
    const potentialRating = this.calculatePotential(player);

    const overallRating = this.weightedAverage([
      { value: battingRating, weight: player.role === 'Bowler' ? 0.15 : 0.35 },
      { value: bowlingRating, weight: player.role === 'Batsman' ? 0.1 : 0.3 },
      { value: fieldingRating, weight: 0.15 },
      { value: consistencyScore, weight: 0.15 },
      { value: impactScore, weight: 0.15 },
      { value: player.fitnessScore, weight: 0.1 },
    ]);

    return {
      overallRating: Math.round(overallRating * 10) / 10,
      battingRating: Math.round(battingRating * 10) / 10,
      bowlingRating: Math.round(bowlingRating * 10) / 10,
      fieldingRating,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      impactScore: Math.round(impactScore * 10) / 10,
      formIndex: Math.round(formIndex * 10) / 10,
      potentialRating: Math.round(potentialRating * 10) / 10,
    };
  }

  private calculateBattingRating(player: Player): number {
    const avgScore = Math.min(player.battingAverage * 1.5, 100);
    const srScore = Math.min(player.strikeRate / 2, 50);
    const boundaryScore = ((player.fours + player.sixes * 1.5) / player.matchesPlayed) * 2;
    
    return Math.min((avgScore * 0.5 + srScore * 0.3 + boundaryScore * 0.2), 100);
  }

  private calculateBowlingRating(player: Player): number {
    if (player.wickets === 0) return 0;
    
    const economyScore = Math.max(100 - player.bowlingEconomy * 10, 0);
    const wicketRate = (player.wickets / player.matchesPlayed) * 25;
    
    return Math.min((economyScore * 0.5 + wicketRate * 0.5), 100);
  }

  private calculateConsistency(player: Player): number {
    const runs = player.runsPerMatch;
    if (runs.length === 0) return 50;

    const mean = runs.reduce((a, b) => a + b, 0) / runs.length;
    const variance = runs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / runs.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) * 100 : 100;

    // Lower CV = more consistent = higher score
    return Math.max(100 - cv, 0);
  }

  private calculateImpactScore(player: Player): number {
    const runs = player.runsPerMatch;
    const highImpactMatches = runs.filter(r => r >= 50).length;
    const matchWinningPotential = runs.filter(r => r >= 75).length;
    
    const wickets = player.wicketsPerMatch;
    const impactfulBowling = wickets.filter(w => w >= 3).length;
    
    const impactRatio = (highImpactMatches * 2 + matchWinningPotential * 3 + impactfulBowling * 2) / (runs.length || 1);
    
    return Math.min(impactRatio * 20, 100);
  }

  private calculateFormIndex(player: Player): number {
    const recentRuns = player.runsPerMatch.slice(-5);
    const recentWickets = player.wicketsPerMatch.slice(-5);
    
    if (recentRuns.length === 0) return 50;

    const avgRecentRuns = recentRuns.reduce((a, b) => a + b, 0) / recentRuns.length;
    const avgRecentWickets = recentWickets.reduce((a, b) => a + b, 0) / recentWickets.length;
    
    const overallAvgRuns = player.runsPerMatch.reduce((a, b) => a + b, 0) / player.runsPerMatch.length;
    
    const formMultiplier = overallAvgRuns > 0 ? avgRecentRuns / overallAvgRuns : 1;
    
    let formScore = 50 * formMultiplier;
    formScore += avgRecentWickets * 10;
    
    return Math.min(Math.max(formScore, 0), 100);
  }

  private calculatePotential(player: Player): number {
    // Based on current stats and trajectory
    const recentImprovement = this.calculateRecentImprovement(player);
    const fitnessBonus = player.fitnessScore > 85 ? 10 : 0;
    const experienceFactor = Math.min(player.matchesPlayed / 200, 1) * 20;
    
    return Math.min(70 + recentImprovement + fitnessBonus - experienceFactor, 100);
  }

  private calculateRecentImprovement(player: Player): number {
    const runs = player.runsPerMatch;
    if (runs.length < 6) return 0;

    const firstHalf = runs.slice(0, Math.floor(runs.length / 2));
    const secondHalf = runs.slice(Math.floor(runs.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 50 : 0;
  }

  // ==================== FORM ANALYSIS ====================

  analyzeForm(player: Player): FormAnalysis {
    const runs = player.runsPerMatch;
    const last5 = runs.slice(-5);
    const last5Avg = last5.length > 0 ? last5.reduce((a, b) => a + b, 0) / last5.length : 0;
    
    const overallAvg = runs.length > 0 ? runs.reduce((a, b) => a + b, 0) / runs.length : 0;
    const formScore = this.calculateFormIndex(player);
    
    let currentForm: FormAnalysis['currentForm'];
    if (formScore >= 80) currentForm = 'Excellent';
    else if (formScore >= 60) currentForm = 'Good';
    else if (formScore >= 40) currentForm = 'Average';
    else if (formScore >= 20) currentForm = 'Poor';
    else currentForm = 'Critical';

    const formTrend = this.determineFormTrend(runs);
    const streak = this.calculateStreak(runs);

    return {
      currentForm,
      formTrend,
      last5MatchesAvg: Math.round(last5Avg * 10) / 10,
      formScore: Math.round(formScore * 10) / 10,
      streak,
    };
  }

  private determineFormTrend(runs: number[]): FormAnalysis['formTrend'] {
    if (runs.length < 6) return 'Stable';

    const recent3 = runs.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previous3 = runs.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    
    const change = previous3 > 0 ? ((recent3 - previous3) / previous3) * 100 : 0;
    
    if (change > 15) return 'Rising';
    if (change < -15) return 'Declining';
    return 'Stable';
  }

  private calculateStreak(runs: number[]): FormAnalysis['streak'] {
    if (runs.length === 0) return { type: 'neutral', count: 0 };

    const threshold = 30; // Runs threshold for positive performance
    let count = 0;
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';

    for (let i = runs.length - 1; i >= 0; i--) {
      const isPositive = runs[i] >= threshold;
      const isNegative = runs[i] < threshold / 2;

      if (count === 0) {
        type = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
        count = 1;
      } else if ((type === 'positive' && isPositive) || (type === 'negative' && isNegative)) {
        count++;
      } else {
        break;
      }
    }

    return { type, count };
  }

  // ==================== PLAYER COMPARISON ====================

  comparePlayer(player1: Player, player2: Player): PlayerComparison {
    const metrics: PlayerComparison['metrics'] = [
      {
        category: 'Batting Average',
        player1Value: player1.battingAverage,
        player2Value: player2.battingAverage,
        winner: this.getWinner(player1.battingAverage, player2.battingAverage),
      },
      {
        category: 'Strike Rate',
        player1Value: player1.strikeRate,
        player2Value: player2.strikeRate,
        winner: this.getWinner(player1.strikeRate, player2.strikeRate),
      },
      {
        category: 'Total Runs',
        player1Value: player1.totalRuns,
        player2Value: player2.totalRuns,
        winner: this.getWinner(player1.totalRuns, player2.totalRuns),
      },
      {
        category: 'Wickets',
        player1Value: player1.wickets,
        player2Value: player2.wickets,
        winner: this.getWinner(player1.wickets, player2.wickets),
      },
      {
        category: 'Economy Rate',
        player1Value: player1.bowlingEconomy,
        player2Value: player2.bowlingEconomy,
        winner: this.getWinner(player2.bowlingEconomy, player1.bowlingEconomy), // Lower is better
      },
      {
        category: 'Fielding Rating',
        player1Value: player1.fieldingRating,
        player2Value: player2.fieldingRating,
        winner: this.getWinner(player1.fieldingRating, player2.fieldingRating),
      },
      {
        category: 'Fitness Score',
        player1Value: player1.fitnessScore,
        player2Value: player2.fitnessScore,
        winner: this.getWinner(player1.fitnessScore, player2.fitnessScore),
      },
    ];

    const p1Metrics = this.calculatePerformanceMetrics(player1);
    const p2Metrics = this.calculatePerformanceMetrics(player2);

    return {
      player1,
      player2,
      battingEdge: p1Metrics.battingRating > p2Metrics.battingRating ? player1.name : player2.name,
      bowlingEdge: p1Metrics.bowlingRating > p2Metrics.bowlingRating ? player1.name : player2.name,
      fieldingEdge: player1.fieldingRating > player2.fieldingRating ? player1.name : player2.name,
      overallEdge: p1Metrics.overallRating > p2Metrics.overallRating ? player1.name : player2.name,
      metrics,
    };
  }

  private getWinner(val1: number, val2: number): 'player1' | 'player2' | 'tie' {
    if (Math.abs(val1 - val2) < 0.01) return 'tie';
    return val1 > val2 ? 'player1' : 'player2';
  }

  // ==================== PREDICTIONS ====================

  predictPlayerPerformance(player: Player): PlayerPrediction {
    const runs = player.runsPerMatch;
    const wickets = player.wicketsPerMatch;
    
    const avgRuns = runs.length > 0 ? runs.reduce((a, b) => a + b, 0) / runs.length : 0;
    const avgWickets = wickets.length > 0 ? wickets.reduce((a, b) => a + b, 0) / wickets.length : 0;
    
    const stdDevRuns = this.calculateStdDev(runs);
    const stdDevWickets = this.calculateStdDev(wickets);
    
    const formAnalysis = this.analyzeForm(player);
    const formMultiplier = formAnalysis.formTrend === 'Rising' ? 1.1 : 
                          formAnalysis.formTrend === 'Declining' ? 0.9 : 1;

    const trajectory = this.determineCareerTrajectory(player);

    return {
      nextMatchRuns: {
        min: Math.max(0, Math.round(avgRuns - stdDevRuns)),
        max: Math.round(avgRuns + stdDevRuns * 1.5),
        expected: Math.round(avgRuns * formMultiplier),
      },
      nextMatchWickets: {
        min: Math.max(0, Math.round(avgWickets - stdDevWickets)),
        max: Math.round(avgWickets + stdDevWickets),
        expected: Math.round(avgWickets * formMultiplier),
      },
      seasonProjection: {
        totalRuns: Math.round(avgRuns * 15 * formMultiplier), // Assuming 15 matches per season
        totalWickets: Math.round(avgWickets * 15 * formMultiplier),
        average: Math.round(player.battingAverage * formMultiplier * 10) / 10,
      },
      peakPerformanceAge: this.estimatePeakAge(player),
      careerTrajectory: trajectory,
    };
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private determineCareerTrajectory(player: Player): PlayerPrediction['careerTrajectory'] {
    const experience = player.matchesPlayed;
    const formAnalysis = this.analyzeForm(player);
    
    if (experience < 50) {
      return formAnalysis.formTrend === 'Rising' ? 'ascending' : 'stable';
    } else if (experience < 150) {
      return formAnalysis.currentForm === 'Excellent' || formAnalysis.currentForm === 'Good' 
        ? 'peak' 
        : 'stable';
    } else {
      return formAnalysis.formTrend === 'Declining' ? 'declining' : 'stable';
    }
  }

  private estimatePeakAge(player: Player): number {
    // Cricket players typically peak between 28-32
    const baseAge = player.role === 'Batsman' ? 32 : player.role === 'Bowler' ? 29 : 30;
    return baseAge;
  }

  // ==================== TEAM ANALYTICS ====================

  analyzeTeam(): TeamAnalytics {
    const batsmen = this.players.filter(p => p.role === 'Batsman');
    const bowlers = this.players.filter(p => p.role === 'Bowler');
    const allRounders = this.players.filter(p => p.role === 'All-Rounder');
    const keepers = this.players.filter(p => p.role === 'Wicket-Keeper');

    const battingDepth = this.calculateBattingDepth();
    const bowlingStrength = this.calculateBowlingStrength();
    const fieldingEfficiency = this.calculateFieldingEfficiency();
    const balanceScore = this.calculateTeamBalance();

    const teamStrength = (battingDepth + bowlingStrength + fieldingEfficiency + balanceScore) / 4;

    const weaknesses = this.identifyWeaknesses(batsmen, bowlers, allRounders, keepers);
    const strengths = this.identifyStrengths(batsmen, bowlers, allRounders, keepers);

    return {
      teamStrength: Math.round(teamStrength * 10) / 10,
      battingDepth: Math.round(battingDepth * 10) / 10,
      bowlingStrength: Math.round(bowlingStrength * 10) / 10,
      fieldingEfficiency: Math.round(fieldingEfficiency * 10) / 10,
      balanceScore: Math.round(balanceScore * 10) / 10,
      weaknesses,
      strengths,
    };
  }

  private calculateBattingDepth(): number {
    const battingPlayers = this.players.filter(p => p.battingAverage > 20);
    const avgBattingAverage = battingPlayers.reduce((sum, p) => sum + p.battingAverage, 0) / battingPlayers.length;
    const depthScore = (battingPlayers.length / 7) * 50; // Ideal: 7 batsmen
    const qualityScore = Math.min(avgBattingAverage * 1.5, 50);
    
    return depthScore + qualityScore;
  }

  private calculateBowlingStrength(): number {
    const bowlingPlayers = this.players.filter(p => p.wickets > 10);
    const avgEconomy = bowlingPlayers.length > 0 
      ? bowlingPlayers.reduce((sum, p) => sum + p.bowlingEconomy, 0) / bowlingPlayers.length
      : 10;
    
    const varietyScore = (bowlingPlayers.length / 5) * 40; // Ideal: 5 bowlers
    const economyScore = Math.max(60 - avgEconomy * 6, 0);
    
    return varietyScore + economyScore;
  }

  private calculateFieldingEfficiency(): number {
    const avgFielding = this.players.reduce((sum, p) => sum + p.fieldingRating, 0) / this.players.length;
    const catchRate = this.players.reduce((sum, p) => sum + p.catches, 0) / this.players.length / 10;
    
    return Math.min(avgFielding * 0.7 + catchRate * 30, 100);
  }

  private calculateTeamBalance(): number {
    const roles = {
      Batsman: this.players.filter(p => p.role === 'Batsman').length,
      Bowler: this.players.filter(p => p.role === 'Bowler').length,
      'All-Rounder': this.players.filter(p => p.role === 'All-Rounder').length,
      'Wicket-Keeper': this.players.filter(p => p.role === 'Wicket-Keeper').length,
    };

    // Ideal composition: 4-5 batsmen, 4-5 bowlers, 2-3 all-rounders, 1-2 keepers
    let score = 100;
    
    if (roles.Batsman < 3 || roles.Batsman > 6) score -= 20;
    if (roles.Bowler < 3 || roles.Bowler > 6) score -= 20;
    if (roles['All-Rounder'] < 1 || roles['All-Rounder'] > 4) score -= 15;
    if (roles['Wicket-Keeper'] < 1 || roles['Wicket-Keeper'] > 2) score -= 10;

    return Math.max(score, 0);
  }

  private identifyWeaknesses(batsmen: Player[], bowlers: Player[], allRounders: Player[], keepers: Player[]): string[] {
    const weaknesses: string[] = [];

    if (batsmen.length < 4) weaknesses.push('Insufficient batting depth');
    if (bowlers.length < 4) weaknesses.push('Limited bowling options');
    if (allRounders.length < 2) weaknesses.push('Lack of all-rounders');
    if (keepers.length < 1) weaknesses.push('No dedicated wicket-keeper');

    const avgFitness = this.players.reduce((sum, p) => sum + p.fitnessScore, 0) / this.players.length;
    if (avgFitness < 80) weaknesses.push('Overall team fitness below optimal');

    const poorFormPlayers = this.players.filter(p => this.analyzeForm(p).currentForm === 'Poor' || this.analyzeForm(p).currentForm === 'Critical');
    if (poorFormPlayers.length >= 3) weaknesses.push('Multiple players out of form');

    return weaknesses;
  }

  private identifyStrengths(batsmen: Player[], bowlers: Player[], allRounders: Player[], keepers: Player[]): string[] {
    const strengths: string[] = [];

    const topBatsmen = batsmen.filter(p => p.battingAverage > 45);
    if (topBatsmen.length >= 2) strengths.push('Strong top-order batting');

    const topBowlers = bowlers.filter(p => p.bowlingEconomy < 5);
    if (topBowlers.length >= 2) strengths.push('Economical bowling attack');

    const avgFielding = this.players.reduce((sum, p) => sum + p.fieldingRating, 0) / this.players.length;
    if (avgFielding > 80) strengths.push('Excellent fielding unit');

    if (allRounders.length >= 3) strengths.push('Deep all-round capability');

    const inFormPlayers = this.players.filter(p => this.analyzeForm(p).currentForm === 'Excellent' || this.analyzeForm(p).currentForm === 'Good');
    if (inFormPlayers.length >= this.players.length * 0.6) strengths.push('Majority of squad in good form');

    return strengths;
  }

  // ==================== MATCH SIMULATION ====================

  simulateMatch(opponentStrength: number = 75): MatchPrediction {
    const teamAnalytics = this.analyzeTeam();
    const strengthDiff = teamAnalytics.teamStrength - opponentStrength;
    
    const winProbability = Math.min(Math.max(50 + strengthDiff * 0.5, 10), 90);
    
    const avgTeamRuns = this.players.reduce((sum, p) => {
      const avgRuns = p.runsPerMatch.reduce((a, b) => a + b, 0) / p.runsPerMatch.length;
      return sum + avgRuns;
    }, 0);
    
    const avgTeamWickets = this.players.reduce((sum, p) => {
      const avgWickets = p.wicketsPerMatch.reduce((a, b) => a + b, 0) / p.wicketsPerMatch.length;
      return sum + avgWickets;
    }, 0);

    const keyPlayers = this.identifyKeyPlayers();
    const riskFactors = this.identifyRiskFactors();
    const recommendations = this.generateRecommendations();

    return {
      winProbability: Math.round(winProbability),
      expectedRuns: Math.round(avgTeamRuns),
      expectedWickets: Math.round(avgTeamWickets),
      keyPlayers,
      riskFactors,
      recommendations,
    };
  }

  private identifyKeyPlayers(): Player[] {
    return this.players
      .map(p => ({ player: p, score: this.calculatePerformanceMetrics(p).overallRating }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.player);
  }

  private identifyRiskFactors(): string[] {
    const risks: string[] = [];
    
    const lowFitness = this.players.filter(p => p.fitnessScore < 75);
    if (lowFitness.length > 0) {
      risks.push(`${lowFitness.length} player(s) with fitness concerns`);
    }

    const outOfForm = this.players.filter(p => {
      const form = this.analyzeForm(p);
      return form.currentForm === 'Poor' || form.currentForm === 'Critical';
    });
    if (outOfForm.length > 0) {
      risks.push(`${outOfForm.length} player(s) out of form`);
    }

    const inexperienced = this.players.filter(p => p.matchesPlayed < 30);
    if (inexperienced.length >= 3) {
      risks.push('Several inexperienced players in squad');
    }

    return risks;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const teamAnalytics = this.analyzeTeam();

    if (teamAnalytics.battingDepth < 70) {
      recommendations.push('Consider promoting an all-rounder up the order');
    }

    if (teamAnalytics.bowlingStrength < 70) {
      recommendations.push('May need additional bowling support');
    }

    const topPerformers = this.identifyKeyPlayers();
    recommendations.push(`Rely on key players: ${topPerformers.map(p => p.name).join(', ')}`);

    return recommendations;
  }

  // ==================== UTILITY METHODS ====================

  getTopPerformers(category: 'batting' | 'bowling' | 'fielding' | 'overall', count: number = 5): Player[] {
    return [...this.players]
      .map(p => {
        const metrics = this.calculatePerformanceMetrics(p);
        let score: number;
        switch (category) {
          case 'batting': score = metrics.battingRating; break;
          case 'bowling': score = metrics.bowlingRating; break;
          case 'fielding': score = metrics.fieldingRating; break;
          default: score = metrics.overallRating;
        }
        return { player: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.player);
  }

  getPlayersInForm(): Player[] {
    return this.players.filter(p => {
      const form = this.analyzeForm(p);
      return form.currentForm === 'Excellent' || form.currentForm === 'Good';
    });
  }

  getPlayersOutOfForm(): Player[] {
    return this.players.filter(p => {
      const form = this.analyzeForm(p);
      return form.currentForm === 'Poor' || form.currentForm === 'Critical';
    });
  }

  private weightedAverage(items: { value: number; weight: number }[]): number {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = items.reduce((sum, item) => sum + item.value * item.weight, 0);
    return weightedSum / totalWeight;
  }
}

// Singleton instance
let analyticsEngineInstance: AnalyticsEngine | null = null;

export const getAnalyticsEngine = (players: Player[]): AnalyticsEngine => {
  if (!analyticsEngineInstance) {
    analyticsEngineInstance = new AnalyticsEngine(players);
  } else {
    analyticsEngineInstance.updatePlayers(players);
  }
  return analyticsEngineInstance;
};
