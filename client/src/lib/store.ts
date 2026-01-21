import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Player {
  id: string;
  name: string;
  avatar: string; // Initials or generated
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
  timestamp: string; // ISO string
}

interface MatchStore {
  players: Player[];
  matches: Match[];
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  addPlayer: (name: string) => void;
  deletePlayer: (id: string) => void;
  addMatch: (player1Id: string, player2Id: string, score1: number, score2: number) => void;
  deleteMatch: (id: string) => void;
}

// Mock Data
const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'Alex', avatar: 'AX' },
  { id: '2', name: 'Sam', avatar: 'SM' },
  { id: '3', name: 'Jordan', avatar: 'JD' },
  { id: '4', name: 'Taylor', avatar: 'TY' },
];

const INITIAL_MATCHES: Match[] = [
  { id: 'm1', player1Id: '1', player2Id: '2', score1: 3, score2: 1, timestamp: new Date(Date.now() - 10000000).toISOString() },
  { id: 'm2', player1Id: '3', player2Id: '4', score1: 2, score2: 4, timestamp: new Date(Date.now() - 8000000).toISOString() },
  { id: 'm3', player1Id: '1', player2Id: '3', score1: 1, score2: 2, timestamp: new Date(Date.now() - 6000000).toISOString() },
  { id: 'm4', player1Id: '2', player2Id: '4', score1: 5, score2: 4, timestamp: new Date(Date.now() - 4000000).toISOString() },
  { id: 'm5', player1Id: '1', player2Id: '4', score1: 2, score2: 0, timestamp: new Date(Date.now() - 2000000).toISOString() },
];

export const useStore = create<MatchStore>()(
  persist(
    (set) => ({
      players: INITIAL_PLAYERS,
      matches: INITIAL_MATCHES,
      isAdmin: false,

      login: () => set({ isAdmin: true }),
      logout: () => set({ isAdmin: false }),

      addPlayer: (name) =>
        set((state) => ({
          players: [
            ...state.players,
            {
              id: Math.random().toString(36).substr(2, 9),
              name,
              avatar: name.substring(0, 2).toUpperCase(),
            },
          ],
        })),

      deletePlayer: (id) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== id),
        })),

      addMatch: (player1Id, player2Id, score1, score2) =>
        set((state) => ({
          matches: [
            {
              id: Math.random().toString(36).substr(2, 9),
              player1Id,
              player2Id,
              score1,
              score2,
              timestamp: new Date().toISOString(),
            },
            ...state.matches,
          ],
        })),

      deleteMatch: (id) =>
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'fc26-tracker-storage',
    }
  )
);
