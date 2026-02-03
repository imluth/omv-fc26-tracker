import { useState } from "react";
import { useStore } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Players() {
  const { players, addPlayer, deletePlayer, isAdmin, isLoading } = useStore();
  const { toast } = useToast();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [_, setLocation] = useLocation();

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

  const handleDelete = async (id: string) => {
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
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-card/30 border border-border/50 rounded-lg hover:border-primary/30 hover:scale-[1.01] transition-all group animate-in fade-in slide-in-from-right-2"
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
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(player.id)} className="opacity-60 hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
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
