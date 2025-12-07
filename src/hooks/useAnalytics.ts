import { useMemo, useCallback, useState } from 'react';
import { usePlayers } from '@/context/PlayerContext';
import { Player } from '@/data/players';
import { 
  PerformanceMetrics, 
  FormAnalysis, 
  PlayerPrediction,
  PlayerComparison 
} from '@/services/analyticsEngine';

// Hook for individual player analytics
export function usePlayerAnalytics(playerId: string | null) {
  const { 
    players, 
    getPlayerMetrics, 
    getPlayerForm, 
    getPlayerPrediction,
    analytics 
  } = usePlayers();

  const player = useMemo(() => {
    if (!playerId) return null;
    return players.find(p => p.id === playerId) || null;
  }, [playerId, players]);

  const metrics = useMemo(() => {
    if (!playerId) return null;
    return getPlayerMetrics(playerId);
  }, [playerId, getPlayerMetrics]);

  const form = useMemo(() => {
    if (!playerId) return null;
    return getPlayerForm(playerId);
  }, [playerId, getPlayerForm]);

  const prediction = useMemo(() => {
    if (!playerId) return null;
    return getPlayerPrediction(playerId);
  }, [playerId, getPlayerPrediction]);

  const ranking = useMemo(() => {
    if (!player || !analytics) return null;
    
    const allMetrics = players.map(p => ({
      player: p,
      metrics: analytics.calculatePerformanceMetrics(p)
    })).sort((a, b) => b.metrics.overallRating - a.metrics.overallRating);

    const rank = allMetrics.findIndex(m => m.player.id === playerId) + 1;
    return {
      overall: rank,
      total: players.length,
      percentile: Math.round((1 - (rank - 1) / players.length) * 100)
    };
  }, [player, playerId, players, analytics]);

  const recentPerformance = useMemo(() => {
    if (!player) return null;
    
    const last5Runs = player.runsPerMatch.slice(-5);
    const last5Wickets = player.wicketsPerMatch.slice(-5);
    
    return {
      runs: last5Runs,
      wickets: last5Wickets,
      avgRuns: last5Runs.length > 0 ? last5Runs.reduce((a, b) => a + b, 0) / last5Runs.length : 0,
      avgWickets: last5Wickets.length > 0 ? last5Wickets.reduce((a, b) => a + b, 0) / last5Wickets.length : 0,
      highScore: Math.max(...last5Runs, 0),
      bestBowling: Math.max(...last5Wickets, 0),
    };
  }, [player]);

  return {
    player,
    metrics,
    form,
    prediction,
    ranking,
    recentPerformance,
    isLoading: !player && !!playerId,
  };
}

// Hook for team statistics and analytics
export function useTeamStats() {
  const { 
    players, 
    teamAnalytics, 
    matchPrediction,
    topBatsmen,
    topBowlers,
    topAllRounders,
    playersInForm,
    playersOutOfForm,
    simulateMatch,
  } = usePlayers();

  const squadComposition = useMemo(() => {
    const batsmen = players.filter(p => p.role === 'Batsman');
    const bowlers = players.filter(p => p.role === 'Bowler');
    const allRounders = players.filter(p => p.role === 'All-Rounder');
    const keepers = players.filter(p => p.role === 'Wicket-Keeper');

    return {
      total: players.length,
      batsmen: batsmen.length,
      bowlers: bowlers.length,
      allRounders: allRounders.length,
      keepers: keepers.length,
      distribution: [
        { name: 'Batsmen', value: batsmen.length, color: 'hsl(190, 100%, 50%)' },
        { name: 'Bowlers', value: bowlers.length, color: 'hsl(270, 91%, 65%)' },
        { name: 'All-Rounders', value: allRounders.length, color: 'hsl(330, 90%, 60%)' },
        { name: 'Wicket-Keepers', value: keepers.length, color: 'hsl(67, 94%, 48%)' },
      ]
    };
  }, [players]);

  const aggregateStats = useMemo(() => {
    const totalRuns = players.reduce((sum, p) => sum + p.totalRuns, 0);
    const totalWickets = players.reduce((sum, p) => sum + p.wickets, 0);
    const avgBattingAverage = players.reduce((sum, p) => sum + p.battingAverage, 0) / players.length;
    const avgStrikeRate = players.reduce((sum, p) => sum + p.strikeRate, 0) / players.length;
    const avgFitness = players.reduce((sum, p) => sum + p.fitnessScore, 0) / players.length;
    const avgFielding = players.reduce((sum, p) => sum + p.fieldingRating, 0) / players.length;
    const totalMatches = players.reduce((sum, p) => sum + p.matchesPlayed, 0);
    const totalBoundaries = players.reduce((sum, p) => sum + p.fours + p.sixes, 0);

    return {
      totalRuns,
      totalWickets,
      avgBattingAverage: Math.round(avgBattingAverage * 10) / 10,
      avgStrikeRate: Math.round(avgStrikeRate * 10) / 10,
      avgFitness: Math.round(avgFitness * 10) / 10,
      avgFielding: Math.round(avgFielding * 10) / 10,
      totalMatches,
      totalBoundaries,
      runsPerMatch: Math.round(totalRuns / (totalMatches || 1)),
      wicketsPerMatch: Math.round((totalWickets / (totalMatches || 1)) * 100) / 100,
    };
  }, [players]);

  const matchTrends = useMemo(() => {
    const matchCount = 10;
    const runsTrend = Array.from({ length: matchCount }, (_, i) => ({
      match: `M${i + 1}`,
      runs: players.reduce((sum, p) => sum + (p.runsPerMatch[i] || 0), 0),
    }));

    const wicketsTrend = Array.from({ length: matchCount }, (_, i) => ({
      match: `M${i + 1}`,
      wickets: players.reduce((sum, p) => sum + (p.wicketsPerMatch[i] || 0), 0),
    }));

    return { runsTrend, wicketsTrend };
  }, [players]);

  const runMatchSimulation = useCallback((opponentStrength?: number) => {
    return simulateMatch(opponentStrength);
  }, [simulateMatch]);

  return {
    players,
    teamAnalytics,
    matchPrediction,
    squadComposition,
    aggregateStats,
    matchTrends,
    topBatsmen,
    topBowlers,
    topAllRounders,
    playersInForm,
    playersOutOfForm,
    runMatchSimulation,
  };
}

// Hook for player comparison
export function usePlayerComparison() {
  const { players, comparePlayersList, analytics } = usePlayers();
  const [player1Id, setPlayer1Id] = useState<string | null>(null);
  const [player2Id, setPlayer2Id] = useState<string | null>(null);

  const comparison = useMemo(() => {
    if (!player1Id || !player2Id) return null;
    return comparePlayersList(player1Id, player2Id);
  }, [player1Id, player2Id, comparePlayersList]);

  const player1Metrics = useMemo(() => {
    if (!player1Id || !analytics) return null;
    const player = players.find(p => p.id === player1Id);
    return player ? analytics.calculatePerformanceMetrics(player) : null;
  }, [player1Id, players, analytics]);

  const player2Metrics = useMemo(() => {
    if (!player2Id || !analytics) return null;
    const player = players.find(p => p.id === player2Id);
    return player ? analytics.calculatePerformanceMetrics(player) : null;
  }, [player2Id, players, analytics]);

  const selectPlayer1 = useCallback((id: string) => {
    setPlayer1Id(id);
  }, []);

  const selectPlayer2 = useCallback((id: string) => {
    setPlayer2Id(id);
  }, []);

  const reset = useCallback(() => {
    setPlayer1Id(null);
    setPlayer2Id(null);
  }, []);

  return {
    player1Id,
    player2Id,
    comparison,
    player1Metrics,
    player2Metrics,
    selectPlayer1,
    selectPlayer2,
    reset,
    availablePlayers: players,
  };
}

// Hook for performance predictions
export function usePerformancePredictions() {
  const { players, analytics, getPlayerPrediction } = usePlayers();

  const allPredictions = useMemo(() => {
    if (!analytics) return [];
    
    return players.map(player => ({
      player,
      prediction: analytics.predictPlayerPerformance(player),
      metrics: analytics.calculatePerformanceMetrics(player),
      form: analytics.analyzeForm(player),
    }));
  }, [players, analytics]);

  const risingStar = useMemo(() => {
    return allPredictions
      .filter(p => p.prediction.careerTrajectory === 'ascending')
      .sort((a, b) => b.metrics.potentialRating - a.metrics.potentialRating)[0] || null;
  }, [allPredictions]);

  const peakPerformers = useMemo(() => {
    return allPredictions
      .filter(p => p.prediction.careerTrajectory === 'peak')
      .sort((a, b) => b.metrics.overallRating - a.metrics.overallRating);
  }, [allPredictions]);

  const watchList = useMemo(() => {
    return allPredictions
      .filter(p => p.form.currentForm === 'Poor' || p.form.currentForm === 'Critical')
      .map(p => p.player);
  }, [allPredictions]);

  const seasonProjections = useMemo(() => {
    const totalProjectedRuns = allPredictions.reduce(
      (sum, p) => sum + p.prediction.seasonProjection.totalRuns, 0
    );
    const totalProjectedWickets = allPredictions.reduce(
      (sum, p) => sum + p.prediction.seasonProjection.totalWickets, 0
    );

    return {
      totalRuns: totalProjectedRuns,
      totalWickets: totalProjectedWickets,
      topRunScorer: allPredictions.sort(
        (a, b) => b.prediction.seasonProjection.totalRuns - a.prediction.seasonProjection.totalRuns
      )[0]?.player || null,
      topWicketTaker: allPredictions.sort(
        (a, b) => b.prediction.seasonProjection.totalWickets - a.prediction.seasonProjection.totalWickets
      )[0]?.player || null,
    };
  }, [allPredictions]);

  return {
    allPredictions,
    risingStar,
    peakPerformers,
    watchList,
    seasonProjections,
    getPrediction: getPlayerPrediction,
  };
}

// Hook for filtering and sorting players
export function usePlayerFilters() {
  const { players, searchPlayers, filterByRole, sortPlayers } = usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Player['role'] | 'all'>('all');
  const [sortKey, setSortKey] = useState<keyof Player>('battingAverage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredPlayers = useMemo(() => {
    let result = players;

    // Apply search
    if (searchQuery) {
      result = searchPlayers(searchQuery);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(p => p.role === roleFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });

    return result;
  }, [players, searchQuery, roleFilter, sortKey, sortDirection, searchPlayers]);

  const toggleSort = useCallback((key: keyof Player) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  }, [sortKey]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setRoleFilter('all');
    setSortKey('battingAverage');
    setSortDirection('desc');
  }, []);

  return {
    filteredPlayers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    sortKey,
    sortDirection,
    toggleSort,
    resetFilters,
    totalCount: players.length,
    filteredCount: filteredPlayers.length,
  };
}

// Hook for data management
export function useDataManagement() {
  const { 
    exportData, 
    importData, 
    resetToDefaults, 
    refreshData, 
    history,
    loading,
    error 
  } = usePlayers();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `athleteedge-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [exportData]);

  const handleImport = useCallback(async (file: File): Promise<boolean> => {
    setIsImporting(true);
    try {
      const text = await file.text();
      const success = await importData(text);
      return success;
    } catch (error) {
      return false;
    } finally {
      setIsImporting(false);
    }
  }, [importData]);

  const handleReset = useCallback(async () => {
    return await resetToDefaults();
  }, [resetToDefaults]);

  return {
    handleExport,
    handleImport,
    handleReset,
    refreshData,
    history,
    loading,
    error,
    isExporting,
    isImporting,
  };
}
