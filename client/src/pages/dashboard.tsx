import { useStats } from "@/hooks/use-stats";
import { PlayerStatCard } from "@/components/player-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/api-store";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, History, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const stats = useStats();
  const { matches, players, isAdmin, deleteMatch } = useStore();
  const { toast } = useToast();
  const top3 = stats.slice(0, 3);

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || "Unknown";

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
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="text-primary w-5 h-5" />
          Current Leaders
        </h2>
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
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="standings" className="font-display tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary">STANDINGS</TabsTrigger>
          <TabsTrigger value="history" className="font-display tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary">RECENT MATCHES</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings" className="mt-4">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-muted-foreground">
                  <thead className="text-xs uppercase bg-muted/50 text-foreground font-display">
                    <tr>
                      <th scope="col" className="px-4 py-3 rounded-tl-lg">Rank</th>
                      <th scope="col" className="px-4 py-3">Player</th>
                      <th scope="col" className="px-4 py-3 text-center">W-L</th>
                      <th scope="col" className="px-4 py-3 text-right">Rate</th>
                      <th scope="col" className="px-4 py-3 text-right rounded-tr-lg">Strk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, index) => (
                      <tr key={stat.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">#{index + 1}</td>
                        <td className="px-4 py-3 font-bold dark:text-white text-foreground">{stat.name}</td>
                        <td className="px-4 py-3 text-center">{stat.wins}-{stat.losses}</td>
                        <td className="px-4 py-3 text-right text-primary font-mono">{stat.winRate}%</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            stat.streakType === 'W' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          )}>
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
        
        <TabsContent value="history" className="mt-4">
           <Card className="bg-card/30 border-border/50">
             <CardHeader className="pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <History className="w-4 h-4" /> Match History
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <div className="divide-y divide-border/50">
                 {matches.map((match) => (
                   <div key={match.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                     <div className="flex flex-col gap-1 w-full">
                       <div className="flex items-center justify-between w-full">
                          <div className={cn("flex items-center gap-2", match.score1 > match.score2 ? "text-primary font-bold" : "text-muted-foreground")}>
                            <span className="w-6 text-right font-mono text-lg">{match.score1}</span>
                            <span className="text-sm">{getPlayerName(match.player1Id)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground/50 font-mono">VS</span>
                          <div className={cn("flex items-center gap-2 flex-row-reverse", match.score2 > match.score1 ? "text-primary font-bold" : "text-muted-foreground")}>
                            <span className="w-6 font-mono text-lg">{match.score2}</span>
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
                             className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
