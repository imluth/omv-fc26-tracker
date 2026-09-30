import { useMemo } from "react";
import { useStats } from "@/hooks/use-stats";
import { PlayerStatCard } from "@/components/player-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/api-store";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, History, Trash2, Flame, Snowflake, Crown, Target, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BadgeGuideModal } from "@/components/badge-guide-modal";

export default function Dashboard() {
  const stats = useStats();
  const { matches, players, isAdmin, deleteMatch } = useStore();
  const { toast } = useToast();
  const top3 = stats.slice(0, 3);

  // Top scorers sorted by goals scored (descending), then by matches played (descending) as tiebreaker
  const topScorers = useMemo(() => {
    return [...stats].sort((a, b) => {
      if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored;
      return b.matchesPlayed - a.matchesPlayed;
    });
  }, [stats]);

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || "Unknown";

  // Get achievement badges for a player
  const getAchievements = (playerId: string, playerIndex: number) => {
    const badges = [];
    const player = stats.find(s => s.id === playerId);
    if (!player) return badges;

    // Crown: #1 in standings
    if (playerIndex === 0 && player.matchesPlayed >= 3) {
      badges.push({ icon: Crown, color: "text-yellow-500", title: "Champion" });
    }
    // Target: Top scorer
    if (topScorers[0]?.id === playerId && player.goalsScored > 0) {
      badges.push({ icon: Target, color: "text-primary", title: "Top Scorer" });
    }
    // Award: Veteran (20+ matches)
    if (player.matchesPlayed >= 20) {
      badges.push({ icon: Award, color: "text-purple-500", title: "Veteran" });
    }
    // Zap: High win rate (70%+) with min 5 matches
    if (player.winRate >= 70 && player.matchesPlayed >= 5) {
      badges.push({ icon: Zap, color: "text-amber-500", title: "Elite" });
    }

    return badges;
  };

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm("Delete this match record?")) {
      const success = await deleteMatch(id);
      if (success) {
        toast({ title: "Match deleted" });
      } else {
        toast({ title: "Failed to delete match", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Top 3 Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" />
            Current Leaders
          </h2>
          <BadgeGuideModal />
        </div>
        <div className="grid gap-3">
          {top3.map((stat, index) => (
            <PlayerStatCard
              key={stat.id}
              rank={index + 1}
              name={stat.name}
              initials={stat.avatar}
              winRate={stat.winRate}
              matches={stat.matchesPlayed}
            />
          ))}
          {top3.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
              No matches recorded yet.
            </div>
          )}
        </div>
      </section>

      {/* Tabs for Table / History */}
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="standings" className="font-display tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary">STANDINGS</TabsTrigger>
          <TabsTrigger value="topscores" className="font-display tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary">TOP SCORES</TabsTrigger>
          <TabsTrigger value="history" className="font-display tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary">RECENT MATCHES</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings" className="mt-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-muted-foreground">
                  <thead className="text-xs uppercase bg-muted/50 text-foreground font-display">
                    <tr>
                      <th scope="col" className="px-2 py-2 rounded-tl-lg">#</th>
                      <th scope="col" className="px-2 py-2">Player</th>
                      <th scope="col" className="px-2 py-2 text-center">W-L</th>
                      <th scope="col" className="px-2 py-2 text-right">Rate</th>
                      <th scope="col" className="px-2 py-2 text-right rounded-tr-lg">Strk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, index) => (
                      <tr
                        key={stat.id}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                      >
                        <td className="px-2 py-2 font-medium text-foreground">{index + 1}</td>
                        <td className="px-2 py-2 font-bold dark:text-white text-foreground">
                          <div className="flex items-center gap-1">
                            <span className="truncate">{stat.name}</span>
                            {getAchievements(stat.id, index).map((badge, i) => (
                              <badge.icon
                                key={i}
                                className={cn("w-3 h-3 flex-shrink-0", badge.color)}
                                title={badge.title}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">{stat.wins}-{stat.losses}</td>
                        <td className="px-2 py-2 text-right text-primary font-mono">{stat.winRate}%</td>
                        <td className="px-2 py-2 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1",
                            stat.streakType === 'W' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          )}>
                            {stat.streakType === 'W' && stat.streak >= 3 && (
                              <Flame className="w-3 h-3 animate-pulse" />
                            )}
                            {stat.streakType === 'L' && stat.streak >= 3 && (
                              <Snowflake className="w-3 h-3 animate-pulse" />
                            )}
                            {stat.streakType}{stat.streak}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {stats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No stats available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topscores" className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-muted-foreground">
                  <thead className="text-xs uppercase bg-muted/50 text-foreground font-display">
                    <tr>
                      <th scope="col" className="px-2 py-2 rounded-tl-lg">#</th>
                      <th scope="col" className="px-2 py-2">Player</th>
                      <th scope="col" className="px-2 py-2 text-center">Goals</th>
                      <th scope="col" className="px-2 py-2 text-right rounded-tr-lg">Matches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((stat, index) => (
                      <tr
                        key={stat.id}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                      >
                        <td className="px-2 py-2 font-medium text-foreground">{index + 1}</td>
                        <td className="px-2 py-2 font-bold dark:text-white text-foreground">{stat.name}</td>
                        <td className="px-2 py-2 text-center">
                          <span className="text-primary font-mono font-bold">{stat.goalsScored}</span>
                        </td>
                        <td className="px-2 py-2 text-right text-muted-foreground">{stat.matchesPlayed}</td>
                      </tr>
                    ))}
                    {topScorers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">No stats available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
           <Card className="bg-card/30 border-border/50">
             <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" /> Match History
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-border/50">
                 {matches.map((match, index) => (
                   <div
                     key={match.id}
                     className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group animate-in fade-in slide-in-from-right-2"
                     style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                   >
                     <div className="flex flex-col gap-1 w-full">
                       <div className="flex items-center justify-between w-full">
                          <div className={cn("flex items-center gap-2", match.score1 > match.score2 ? "text-primary font-bold" : "text-muted-foreground")}>
                            <span className={cn("w-6 text-right font-mono text-xl", match.score1 > match.score2 && "score-glow")}>{match.score1}</span>
                            <span className="text-sm">{getPlayerName(match.player1Id)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/50 font-mono">VS</span>
                          <div className={cn("flex items-center gap-2 flex-row-reverse", match.score2 > match.score1 ? "text-primary font-bold" : "text-muted-foreground")}>
                            <span className={cn("w-6 font-mono text-xl", match.score2 > match.score1 && "score-glow")}>{match.score2}</span>
                            <span className="text-sm">{getPlayerName(match.player2Id)}</span>
                          </div>
                       </div>
                       <div className="flex items-center justify-between mt-1">
                         <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                           {formatDistanceToNow(new Date(match.timestamp), { addSuffix: true })}
                         </div>
                         {isAdmin && (
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6 text-destructive opacity-60 hover:opacity-100 hover:bg-destructive/10 transition-all"
                             onClick={() => handleDeleteMatch(match.id)}
                           >
                             <Trash2 className="w-3 h-3" />
                           </Button>
                         )}
                       </div>
                     </div>
                   </div>
                 ))}
                 {matches.length === 0 && (
                   <div className="p-8 text-center text-sm text-muted-foreground">No matches recorded yet.</div>
                 )}
               </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
