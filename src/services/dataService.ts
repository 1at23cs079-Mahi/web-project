import { Player, initialPlayers } from '@/data/players';

const STORAGE_KEY = 'athleteEdge_players';
const SETTINGS_KEY = 'athleteEdge_settings';
const HISTORY_KEY = 'athleteEdge_history';

export interface AppSettings {
  theme: 'dark' | 'light' | 'neon';
  autoSave: boolean;
  analyticsRefreshRate: number;
  showPredictions: boolean;
  defaultView: 'coach' | 'player' | 'analytics';
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: 'add' | 'update' | 'delete';
  playerId: string;
  playerName: string;
  details: string;
}

export interface DataServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class DataService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  // Helper to sync player images from initialPlayers
  private syncPlayerImages(players: Player[]): Player[] {
    return players.map(player => {
      // Always get the correct image from initialPlayers based on ID or name
      const initialPlayer = initialPlayers.find(p => p.id === player.id || p.name === player.name);
      if (initialPlayer?.image) {
        return { ...player, image: initialPlayer.image };
      }
      return player;
    });
  }

  // ==================== PLAYER OPERATIONS ====================

  async getAllPlayers(): Promise<DataServiceResponse<Player[]>> {
    try {
      const cached = this.getFromCache<Player[]>(STORAGE_KEY);
      if (cached) {
        // Always sync images from initialPlayers to ensure correct mapping
        const playersWithImages = this.syncPlayerImages(cached);
        return { success: true, data: playersWithImages };
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const players = JSON.parse(stored) as Player[];
        // Always sync images from initialPlayers to ensure correct mapping
        const playersWithImages = this.syncPlayerImages(players);
        this.setCache(STORAGE_KEY, playersWithImages);
        // Also update localStorage with correct images
        localStorage.setItem(STORAGE_KEY, JSON.stringify(playersWithImages));
        return { success: true, data: playersWithImages };
      }

      // Initialize with default players
      await this.savePlayers(initialPlayers);
      return { success: true, data: initialPlayers };
    } catch (error) {
      return { success: false, error: 'Failed to load players' };
    }
  }

  async savePlayers(players: Player[]): Promise<DataServiceResponse<void>> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      this.setCache(STORAGE_KEY, players);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save players' };
    }
  }

  async addPlayer(playerData: Omit<Player, 'id'>): Promise<DataServiceResponse<Player>> {
    try {
      const validation = this.validatePlayer(playerData);
      if (!validation.success) return { success: false, error: validation.error };

      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      const newPlayer: Player = {
        ...playerData,
        id: this.generateId(),
      };

      const updatedPlayers = [...response.data, newPlayer];
      await this.savePlayers(updatedPlayers);
      
      await this.addHistoryEntry({
        action: 'add',
        playerId: newPlayer.id,
        playerName: newPlayer.name,
        details: `Added ${newPlayer.role} to squad`,
      });

      return { success: true, data: newPlayer };
    } catch (error) {
      return { success: false, error: 'Failed to add player' };
    }
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<DataServiceResponse<Player>> {
    try {
      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      const playerIndex = response.data.findIndex(p => p.id === id);
      if (playerIndex === -1) {
        return { success: false, error: 'Player not found' };
      }

      const updatedPlayer = { ...response.data[playerIndex], ...updates };
      const validation = this.validatePlayer(updatedPlayer);
      if (!validation.success) return { success: false, error: validation.error };

      const updatedPlayers = [...response.data];
      updatedPlayers[playerIndex] = updatedPlayer;
      await this.savePlayers(updatedPlayers);

      await this.addHistoryEntry({
        action: 'update',
        playerId: id,
        playerName: updatedPlayer.name,
        details: `Updated player stats`,
      });

      return { success: true, data: updatedPlayer };
    } catch (error) {
      return { success: false, error: 'Failed to update player' };
    }
  }

  async deletePlayer(id: string): Promise<DataServiceResponse<void>> {
    try {
      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      const player = response.data.find(p => p.id === id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      const updatedPlayers = response.data.filter(p => p.id !== id);
      await this.savePlayers(updatedPlayers);

      await this.addHistoryEntry({
        action: 'delete',
        playerId: id,
        playerName: player.name,
        details: `Removed from squad`,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete player' };
    }
  }

  async getPlayerById(id: string): Promise<DataServiceResponse<Player>> {
    try {
      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      const player = response.data.find(p => p.id === id);
      if (!player) {
        return { success: false, error: 'Player not found' };
      }

      return { success: true, data: player };
    } catch (error) {
      return { success: false, error: 'Failed to get player' };
    }
  }

  // ==================== PLAYER STATISTICS ====================

  async updatePlayerStats(
    playerId: string, 
    matchStats: { runs: number; wickets: number }
  ): Promise<DataServiceResponse<Player>> {
    try {
      const playerResponse = await this.getPlayerById(playerId);
      if (!playerResponse.success || !playerResponse.data) {
        return { success: false, error: 'Player not found' };
      }

      const player = playerResponse.data;
      const updatedPlayer: Partial<Player> = {
        totalRuns: player.totalRuns + matchStats.runs,
        wickets: player.wickets + matchStats.wickets,
        matchesPlayed: player.matchesPlayed + 1,
        runsPerMatch: [...player.runsPerMatch.slice(-9), matchStats.runs],
        wicketsPerMatch: [...player.wicketsPerMatch.slice(-9), matchStats.wickets],
        battingAverage: this.recalculateBattingAverage(player, matchStats.runs),
      };

      return await this.updatePlayer(playerId, updatedPlayer);
    } catch (error) {
      return { success: false, error: 'Failed to update player stats' };
    }
  }

  private recalculateBattingAverage(player: Player, newRuns: number): number {
    const totalRuns = player.totalRuns + newRuns;
    const matches = player.matchesPlayed + 1;
    return Math.round((totalRuns / matches) * 100) / 100;
  }

  // ==================== SETTINGS ====================

  async getSettings(): Promise<DataServiceResponse<AppSettings>> {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { success: true, data: JSON.parse(stored) };
      }

      const defaultSettings: AppSettings = {
        theme: 'neon',
        autoSave: true,
        analyticsRefreshRate: 30,
        showPredictions: true,
        defaultView: 'analytics',
      };

      await this.saveSettings(defaultSettings);
      return { success: true, data: defaultSettings };
    } catch (error) {
      return { success: false, error: 'Failed to load settings' };
    }
  }

  async saveSettings(settings: AppSettings): Promise<DataServiceResponse<void>> {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to save settings' };
    }
  }

  // ==================== HISTORY ====================

  async getHistory(limit?: number): Promise<DataServiceResponse<HistoryEntry[]>> {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        let history = JSON.parse(stored) as HistoryEntry[];
        if (limit) history = history.slice(-limit);
        return { success: true, data: history };
      }
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: 'Failed to load history' };
    }
  }

  private async addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const response = await this.getHistory();
      const history = response.data || [];

      const newEntry: HistoryEntry = {
        ...entry,
        id: this.generateId(),
        timestamp: Date.now(),
      };

      // Keep only last 100 entries
      const updatedHistory = [...history.slice(-99), newEntry];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to add history entry:', error);
    }
  }

  async clearHistory(): Promise<DataServiceResponse<void>> {
    try {
      localStorage.removeItem(HISTORY_KEY);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to clear history' };
    }
  }

  // ==================== DATA EXPORT/IMPORT ====================

  async exportData(): Promise<DataServiceResponse<string>> {
    try {
      const players = await this.getAllPlayers();
      const settings = await this.getSettings();
      const history = await this.getHistory();

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        players: players.data,
        settings: settings.data,
        history: history.data,
      };

      return { success: true, data: JSON.stringify(exportData, null, 2) };
    } catch (error) {
      return { success: false, error: 'Failed to export data' };
    }
  }

  async importData(jsonData: string): Promise<DataServiceResponse<void>> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.version || !data.players) {
        return { success: false, error: 'Invalid data format' };
      }

      // Validate all players before importing
      for (const player of data.players) {
        const validation = this.validatePlayer(player);
        if (!validation.success) {
          return { success: false, error: `Invalid player data: ${validation.error}` };
        }
      }

      await this.savePlayers(data.players);
      if (data.settings) await this.saveSettings(data.settings);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to import data' };
    }
  }

  async resetToDefaults(): Promise<DataServiceResponse<void>> {
    try {
      await this.savePlayers(initialPlayers);
      this.clearCache();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to reset data' };
    }
  }

  // ==================== SEARCH & FILTER ====================

  async searchPlayers(query: string): Promise<DataServiceResponse<Player[]>> {
    try {
      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      const lowercaseQuery = query.toLowerCase();
      const filtered = response.data.filter(player =>
        player.name.toLowerCase().includes(lowercaseQuery) ||
        player.role.toLowerCase().includes(lowercaseQuery)
      );

      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: 'Failed to search players' };
    }
  }

  async filterPlayers(filters: {
    role?: Player['role'];
    minBattingAverage?: number;
    maxBowlingEconomy?: number;
    minFitnessScore?: number;
  }): Promise<DataServiceResponse<Player[]>> {
    try {
      const response = await this.getAllPlayers();
      if (!response.success || !response.data) {
        return { success: false, error: 'Failed to fetch players' };
      }

      let filtered = response.data;

      if (filters.role) {
        filtered = filtered.filter(p => p.role === filters.role);
      }
      if (filters.minBattingAverage !== undefined) {
        filtered = filtered.filter(p => p.battingAverage >= filters.minBattingAverage!);
      }
      if (filters.maxBowlingEconomy !== undefined) {
        filtered = filtered.filter(p => p.bowlingEconomy <= filters.maxBowlingEconomy!);
      }
      if (filters.minFitnessScore !== undefined) {
        filtered = filtered.filter(p => p.fitnessScore >= filters.minFitnessScore!);
      }

      return { success: true, data: filtered };
    } catch (error) {
      return { success: false, error: 'Failed to filter players' };
    }
  }

  // ==================== VALIDATION ====================

  private validatePlayer(player: Partial<Player>): DataServiceResponse<void> {
    if (!player.name || player.name.trim().length < 2) {
      return { success: false, error: 'Player name must be at least 2 characters' };
    }

    if (!player.role || !['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].includes(player.role)) {
      return { success: false, error: 'Invalid player role' };
    }

    if (player.battingAverage !== undefined && (player.battingAverage < 0 || player.battingAverage > 100)) {
      return { success: false, error: 'Batting average must be between 0 and 100' };
    }

    if (player.strikeRate !== undefined && (player.strikeRate < 0 || player.strikeRate > 300)) {
      return { success: false, error: 'Strike rate must be between 0 and 300' };
    }

    if (player.bowlingEconomy !== undefined && (player.bowlingEconomy < 0 || player.bowlingEconomy > 20)) {
      return { success: false, error: 'Bowling economy must be between 0 and 20' };
    }

    if (player.fitnessScore !== undefined && (player.fitnessScore < 0 || player.fitnessScore > 100)) {
      return { success: false, error: 'Fitness score must be between 0 and 100' };
    }

    return { success: true };
  }

  // ==================== CACHE MANAGEMENT ====================

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ==================== UTILITIES ====================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const dataService = new DataService();
