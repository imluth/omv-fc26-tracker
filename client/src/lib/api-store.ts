import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  timestamp: string;
}

interface MatchStore {
  players: Player[];
  matches: Match[];
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  // Data fetching
  fetchPlayers: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Auth actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Player actions
  addPlayer: (name: string) => Promise<boolean>;
  deletePlayer: (id: string) => Promise<boolean>;

  // Match actions
  addMatch: (player1Id: string, player2Id: string, score1: number, score2: number) => Promise<boolean>;
  deleteMatch: (id: string) => Promise<boolean>;
}

export const useStore = create<MatchStore>((set, get) => ({
  players: [],
  matches: [],
  isAdmin: false,
  isLoading: false,
  error: null,

  fetchPlayers: async () => {
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const players = await response.json();
      set({ players });
    } catch (error) {
      console.error('Failed to fetch players:', error);
      set({ error: 'Failed to fetch players' });
    }
  },

  fetchMatches: async () => {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const matches = await response.json();
      set({ matches });
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      set({ error: 'Failed to fetch matches' });
    }
  },

  checkAuth: async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to check auth');
      const data = await response.json();
      set({ isAdmin: data.isAdmin });
    } catch (error) {
      console.error('Failed to check auth:', error);
      set({ isAdmin: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        set({ error: data.message || 'Login failed', isLoading: false });
        return false;
      }

      set({ isAdmin: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({ error: 'Login failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ isAdmin: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  addPlayer: async (name: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        set({ error: data.message || 'Failed to add player', isLoading: false });
        return false;
      }

      const newPlayer = await response.json();
      set((state) => ({
        players: [...state.players, newPlayer],
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Add player error:', error);
      set({ error: 'Failed to add player', isLoading: false });
      return false;
    }
  },

  deletePlayer: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        set({ error: data.message || 'Failed to delete player', isLoading: false });
        return false;
      }

      set((state) => ({
        players: state.players.filter((p) => p.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Delete player error:', error);
      set({ error: 'Failed to delete player', isLoading: false });
      return false;
    }
  },

  addMatch: async (player1Id: string, player2Id: string, score1: number, score2: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1Id, player2Id, score1, score2 }),
      });

      if (!response.ok) {
        const data = await response.json();
        set({ error: data.message || 'Failed to add match', isLoading: false });
        return false;
      }

      const newMatch = await response.json();
      set((state) => ({
        matches: [newMatch, ...state.matches],
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Add match error:', error);
      set({ error: 'Failed to add match', isLoading: false });
      return false;
    }
  },

  deleteMatch: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        set({ error: data.message || 'Failed to delete match', isLoading: false });
        return false;
      }

      set((state) => ({
        matches: state.matches.filter((m) => m.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Delete match error:', error);
      set({ error: 'Failed to delete match', isLoading: false });
      return false;
    }
  },
}));
