import { useState } from "react";
import { useStore, type Player } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Trash2, Loader2, ArrowLeft, ChevronRight, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Players() {
  const { players, playerMatches, addPlayer, deletePlayer, fetchPlayerMatches, isAdmin, isLoading } = useStore();
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [_, setLocation] = useLocation();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || "Unknown";

  const handleSelectPlayer = async (player: Player) => {
    setSelectedPlayer(player);
    await fetchPlayerMatches(player.id);
  };

  const handleBack = () => {
    setSelectedPlayer(null);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({ title: "Unauthorized", variant: "destructive" });
      return;
    }
    if (newPlayerName.trim().length < 2) {
      toast({ title: "Name too short", variant: "destructive" });
      return;
    }

    const success = await addPlayer(newPlayerName.trim());
    if (success) {
      setNewPlayerName("");
      toast({ title: "Player added" });
    } else {
      toast({ title: "Failed to add player", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (window.confirm("Are you sure? This will hide the player but keep stats.")) {
      const success = await deletePlayer(id);
      if (success) {
        toast({ title: "Player removed" });
      } else {
        toast({ title: "Failed to remove player", variant: "destructive" });
      }
    }
  };

  // Match history view for selected player
  if (selectedPlayer) {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="min-h-[44px] min-w-[44px]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {selectedPlayer.name}
          </h2>
        </div>

        <Card className="bg-card/30 border-border/50">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <History className="w-4 h-4" /> Match History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading matches...
              </div>
            ) : playerMatches.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No matches recorded yet for {selectedPlayer.name}.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {playerMatches.map((match, index) => (
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
                      <div className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-1">
                        {formatDistanceToNow(new Date(match.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Player list view
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="text-primary" /> Roster
        </h2>
      </div>

      {isAdmin && (
        <Card className="bg-card/50 border-primary/20">
          <CardContent className="pt-6">
            <form onSubmit={handleAddPlayer} className="flex gap-2">
              <Input
                placeholder="New Player Name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="bg-background/50 border-primary/20 focus-visible:ring-primary"
              />
              <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {players.map((player, index) => (
          <button
            key={player.id}
            onClick={() => handleSelectPlayer(player)}
            className="flex items-center justify-between p-3 bg-card/30 border border-border/50 rounded-lg hover:border-primary/30 hover:scale-[1.01] transition-all group animate-in fade-in slide-in-from-right-2 w-full text-left"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-3">
              <Avatar className="border border-border/50">
                <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                  {player.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-lg dark:text-white text-foreground">{player.name}</span>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(player.id, e)} className="opacity-60 hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </button>
        ))}
        {players.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
            No players found.
          </div>
        )}
      </div>

      {!isAdmin && (
        <div className="text-center text-sm text-muted-foreground mt-8">
          <Button variant="link" onClick={() => setLocation("/admin")}>Log in to manage players</Button>
        </div>
      )}
    </div>
  );
}
