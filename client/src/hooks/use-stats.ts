import { useStore } from "@/lib/store";
import { useMemo } from "react";

export interface PlayerStats {
  id: string;
  name: string;
  avatar: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number; // Just in case, though FIFA usually no draws
  winRate: number;
  streak: number; // Positive for win streak, negative for loss streak
  streakType: 'W' | 'L';
  goalsScored: number;
  goalsConceded: number;
}

export function useStats() {
  const { players, matches } = useStore();

  const stats = useMemo(() => {
    const playerStats: Record<string, PlayerStats> = {};

    // Initialize
    players.forEach(p => {
      playerStats[p.id] = {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        streak: 0,
        streakType: 'W',
        goalsScored: 0,
        goalsConceded: 0
      };
    });

    // Process matches (assuming matches are ordered most recent first? Store adds them to front, so index 0 is newest)
    // We need chronological order for streak, so we reverse a copy
    const chronoMatches = [...matches].reverse();

    chronoMatches.forEach(m => {
      const p1 = playerStats[m.player1Id];
      const p2 = playerStats[m.player2Id];

      if (!p1 || !p2) return;

      p1.matchesPlayed++;
      p2.matchesPlayed++;

      p1.goalsScored += m.score1;
      p1.goalsConceded += m.score2;
      p2.goalsScored += m.score2;
      p2.goalsConceded += m.score1;

      if (m.score1 > m.score2) {
        p1.wins++;
        p2.losses++;
        // Streak logic
        p1.streak = p1.streak >= 0 ? p1.streak + 1 : 1;
        p2.streak = p2.streak <= 0 ? p2.streak - 1 : -1;
      } else if (m.score2 > m.score1) {
        p2.wins++;
        p1.losses++;
         // Streak logic
        p2.streak = p2.streak >= 0 ? p2.streak + 1 : 1;
        p1.streak = p1.streak <= 0 ? p1.streak - 1 : -1;
      } else {
        p1.draws++;
        p2.draws++;
        p1.streak = 0;
        p2.streak = 0;
      }
    });

    // Calculate percentages
    return Object.values(playerStats).map(p => ({
      ...p,
      winRate: p.matchesPlayed > 0 ? Math.round((p.wins / p.matchesPlayed) * 100) : 0,
      streakType: p.streak > 0 ? 'W' : 'L',
      streak: Math.abs(p.streak)
    })).sort((a, b) => {
      // Sort by Win Rate (min 3 matches), then Wins
      const aQualifies = a.matchesPlayed >= 3;
      const bQualifies = b.matchesPlayed >= 3;

      if (aQualifies && !bQualifies) return -1;
      if (!aQualifies && bQualifies) return 1;

      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });

  }, [players, matches]);

  return stats;
}
