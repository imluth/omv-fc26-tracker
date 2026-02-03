import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface PlayerStatCardProps {
  rank: number;
  name: string;
  initials: string;
  winRate: number;
  matches: number;
  className?: string;
}

export function PlayerStatCard({ rank, name, initials, winRate, matches, className }: PlayerStatCardProps) {
  // Tier ring colors based on win rate
  const getTierRingClass = () => {
    if (winRate >= 70) return "border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    if (winRate >= 50) return "border-gray-300 shadow-[0_0_8px_rgba(209,213,219,0.4)]";
    if (winRate >= 30) return "border-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.4)]";
    return "border-border";
  };

  return (
    <Card className={cn("bg-card/50 border-border/50 overflow-hidden group hover:border-primary/50 transition-colors", className)}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative">
          <Avatar className={cn("h-12 w-12 border-2 transition-all", getTierRingClass())}>
            <AvatarFallback className="bg-secondary text-secondary-foreground font-display font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold border border-background",
            rank === 1 ? "bg-yellow-500 text-black" :
            rank === 2 ? "bg-gray-300 text-black" :
            rank === 3 ? "bg-amber-700 text-white" : "bg-secondary text-secondary-foreground"
          )}>
            {rank}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold truncate dark:text-white text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground">{matches} Matches</p>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold font-mono text-primary text-glow">
            {winRate}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Rate</div>
        </div>
      </CardContent>
    </Card>
  );
}
