import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Player, initialPlayers } from '@/data/players';
import { dataService, HistoryEntry, AppSettings } from '@/services/dataService';
import { 
  AnalyticsEngine, 
  getAnalyticsEngine, 
  PerformanceMetrics, 
  FormAnalysis, 
  TeamAnalytics,
  PlayerComparison,
  MatchPrediction,
  PlayerPrediction
} from '@/services/analyticsEngine';

interface PlayerContextType {
  // Player State
  players: Player[];
  loading: boolean;
  error: string | null;
  
  // Player CRUD Operations
  addPlayer: (player: Omit<Player, 'id'>) => Promise<boolean>;
  updatePlayer: (id: string, player: Partial<Player>) => Promise<boolean>;
  deletePlayer: (id: string) => Promise<boolean>;
  getPlayer: (id: string) => Player | undefined;
  
  // Player Selection
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  
  // Search & Filter
  searchPlayers: (query: string) => Player[];
  filterByRole: (role: Player['role'] | 'all') => Player[];
  sortPlayers: (key: keyof Player, direction: 'asc' | 'desc') => Player[];
  
  // Analytics Engine Integration
  analytics: AnalyticsEngine | null;
  getPlayerMetrics: (playerId: string) => PerformanceMetrics | null;
  getPlayerForm: (playerId: string) => FormAnalysis | null;
  getPlayerPrediction: (playerId: string) => PlayerPrediction | null;
  comparePlayersList: (player1Id: string, player2Id: string) => PlayerComparison | null;
  
  // Team Analytics
  teamAnalytics: TeamAnalytics | null;
  matchPrediction: MatchPrediction | null;
  simulateMatch: (opponentStrength?: number) => MatchPrediction | null;
  
  // Top Performers
  topBatsmen: Player[];
  topBowlers: Player[];
  topAllRounders: Player[];
  playersInForm: Player[];
  playersOutOfForm: Player[];
  
  // Stats & Match Data
  updateMatchStats: (playerId: string, runs: number, wickets: number) => Promise<boolean>;
  
  // Data Management
  refreshData: () => Promise<void>;
  exportData: () => Promise<string | null>;
  importData: (jsonData: string) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  
  // History
  history: HistoryEntry[];
  
  // Settings
  settings: AppSettings | null;
  updateSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Initialize analytics engine
  const analytics = useMemo(() => {
    return getAnalyticsEngine(players);
  }, [players]);

  // Computed analytics
  const teamAnalytics = useMemo(() => {
    return analytics?.analyzeTeam() || null;
  }, [analytics, players]);

  const matchPrediction = useMemo(() => {
    return analytics?.simulateMatch() || null;
  }, [analytics, players]);

  // Top performers - memoized
  const topBatsmen = useMemo(() => {
    return analytics?.getTopPerformers('batting', 5) || [];
  }, [analytics, players]);

  const topBowlers = useMemo(() => {
    return analytics?.getTopPerformers('bowling', 5) || [];
  }, [analytics, players]);

  const topAllRounders = useMemo(() => {
    return analytics?.getTopPerformers('overall', 5) || [];
  }, [analytics, players]);

  const playersInForm = useMemo(() => {
    return analytics?.getPlayersInForm() || [];
  }, [analytics, players]);

  const playersOutOfForm = useMemo(() => {
    return analytics?.getPlayersOutOfForm() || [];
  }, [analytics, players]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [playersResponse, settingsResponse, historyResponse] = await Promise.all([
          dataService.getAllPlayers(),
          dataService.getSettings(),
          dataService.getHistory(50),
        ]);

        if (playersResponse.success && playersResponse.data) {
          setPlayers(playersResponse.data);
        }
        if (settingsResponse.success && settingsResponse.data) {
          setSettings(settingsResponse.data);
        }
        if (historyResponse.success && historyResponse.data) {
          setHistory(historyResponse.data);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save when players change
  useEffect(() => {
    if (!loading && settings?.autoSave) {
      dataService.savePlayers(players);
    }
  }, [players, loading, settings?.autoSave]);

  // CRUD Operations
  const addPlayer = useCallback(async (playerData: Omit<Player, 'id'>): Promise<boolean> => {
    const response = await dataService.addPlayer(playerData);
    if (response.success && response.data) {
      setPlayers(prev => [...prev, response.data!]);
      const historyRes = await dataService.getHistory(50);
      if (historyRes.success && historyRes.data) setHistory(historyRes.data);
      return true;
    }
    setError(response.error || 'Failed to add player');
    return false;
  }, []);

  const updatePlayer = useCallback(async (id: string, updates: Partial<Player>): Promise<boolean> => {
    const response = await dataService.updatePlayer(id, updates);
    if (response.success && response.data) {
      setPlayers(prev => prev.map(p => p.id === id ? response.data! : p));
      const historyRes = await dataService.getHistory(50);
      if (historyRes.success && historyRes.data) setHistory(historyRes.data);
      return true;
    }
    setError(response.error || 'Failed to update player');
    return false;
  }, []);

  const deletePlayer = useCallback(async (id: string): Promise<boolean> => {
    const response = await dataService.deletePlayer(id);
    if (response.success) {
      setPlayers(prev => prev.filter(p => p.id !== id));
      if (selectedPlayer?.id === id) setSelectedPlayer(null);
      const historyRes = await dataService.getHistory(50);
      if (historyRes.success && historyRes.data) setHistory(historyRes.data);
      return true;
    }
    setError(response.error || 'Failed to delete player');
    return false;
  }, [selectedPlayer]);

  const getPlayer = useCallback((id: string) => {
    return players.find(player => player.id === id);
  }, [players]);

  // Search & Filter
  const searchPlayers = useCallback((query: string): Player[] => {
    const lowercaseQuery = query.toLowerCase();
    return players.filter(player =>
      player.name.toLowerCase().includes(lowercaseQuery) ||
      player.role.toLowerCase().includes(lowercaseQuery)
    );
  }, [players]);

  const filterByRole = useCallback((role: Player['role'] | 'all'): Player[] => {
    if (role === 'all') return players;
    return players.filter(player => player.role === role);
  }, [players]);

  const sortPlayers = useCallback((key: keyof Player, direction: 'asc' | 'desc'): Player[] => {
    return [...players].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'desc' ? bVal - aVal : aVal - bVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return 0;
    });
  }, [players]);

  // Analytics Methods
  const getPlayerMetrics = useCallback((playerId: string): PerformanceMetrics | null => {
    const player = players.find(p => p.id === playerId);
    if (!player || !analytics) return null;
    return analytics.calculatePerformanceMetrics(player);
  }, [players, analytics]);

  const getPlayerForm = useCallback((playerId: string): FormAnalysis | null => {
    const player = players.find(p => p.id === playerId);
    if (!player || !analytics) return null;
    return analytics.analyzeForm(player);
  }, [players, analytics]);

  const getPlayerPrediction = useCallback((playerId: string): PlayerPrediction | null => {
    const player = players.find(p => p.id === playerId);
    if (!player || !analytics) return null;
    return analytics.predictPlayerPerformance(player);
  }, [players, analytics]);

  const comparePlayersList = useCallback((player1Id: string, player2Id: string): PlayerComparison | null => {
    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);
    if (!player1 || !player2 || !analytics) return null;
    return analytics.comparePlayer(player1, player2);
  }, [players, analytics]);

  const simulateMatch = useCallback((opponentStrength?: number): MatchPrediction | null => {
    if (!analytics) return null;
    return analytics.simulateMatch(opponentStrength);
  }, [analytics]);

  // Match Stats
  const updateMatchStats = useCallback(async (playerId: string, runs: number, wickets: number): Promise<boolean> => {
    const response = await dataService.updatePlayerStats(playerId, { runs, wickets });
    if (response.success && response.data) {
      setPlayers(prev => prev.map(p => p.id === playerId ? response.data! : p));
      return true;
    }
    return false;
  }, []);

  // Data Management
  const refreshData = useCallback(async (): Promise<void> => {
    setLoading(true);
    const response = await dataService.getAllPlayers();
    if (response.success && response.data) {
      setPlayers(response.data);
    }
    setLoading(false);
  }, []);

  const exportData = useCallback(async (): Promise<string | null> => {
    const response = await dataService.exportData();
    return response.success ? response.data || null : null;
  }, []);

  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    const response = await dataService.importData(jsonData);
    if (response.success) {
      await refreshData();
      return true;
    }
    setError(response.error || 'Failed to import data');
    return false;
  }, [refreshData]);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    const response = await dataService.resetToDefaults();
    if (response.success) {
      setPlayers(initialPlayers);
      return true;
    }
    return false;
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>): Promise<boolean> => {
    if (!settings) return false;
    const updatedSettings = { ...settings, ...newSettings };
    const response = await dataService.saveSettings(updatedSettings);
    if (response.success) {
      setSettings(updatedSettings);
      return true;
    }
    return false;
  }, [settings]);

  const value: PlayerContextType = {
    // Player State
    players,
    loading,
    error,
    
    // Player CRUD
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayer,
    
    // Selection
    selectedPlayer,
    setSelectedPlayer,
    
    // Search & Filter
    searchPlayers,
    filterByRole,
    sortPlayers,
    
    // Analytics
    analytics,
    getPlayerMetrics,
    getPlayerForm,
    getPlayerPrediction,
    comparePlayersList,
    
    // Team Analytics
    teamAnalytics,
    matchPrediction,
    simulateMatch,
    
    // Top Performers
    topBatsmen,
    topBowlers,
    topAllRounders,
    playersInForm,
    playersOutOfForm,
    
    // Stats
    updateMatchStats,
    
    // Data Management
    refreshData,
    exportData,
    importData,
    resetToDefaults,
    
    // History & Settings
    history,
    settings,
    updateSettings,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayers must be used within a PlayerProvider');
  }
  return context;
};
