import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Crown,
  Target,
  Award,
  Zap,
  Flame,
  Snowflake,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  criteria: string;
}

function BadgeItem({ icon, title, description, criteria }: BadgeItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        <p className="text-[10px] text-primary mt-1 font-mono">{criteria}</p>
      </div>
    </div>
  );
}

interface TierRingPreviewProps {
  color: string;
  label: string;
  range: string;
}

function TierRingPreview({ color, label, range }: TierRingPreviewProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-6 h-6 rounded-full border-2", color)} />
      <div>
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground ml-1">({range})</span>
      </div>
    </div>
  );
}

export function BadgeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Badge Guide"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Trophy className="w-5 h-5 text-primary" />
            Badge & Icons Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Medal Badges Section */}
          <section>
            <h3 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              Rank Medals
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Displayed on top 3 player avatars. Requires minimum 3 matches to qualify.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold text-sm medal-gold">
                  1
                </div>
                <span className="text-[10px] text-muted-foreground">Gold</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black font-bold text-sm medal-silver">
                  2
                </div>
                <span className="text-[10px] text-muted-foreground">Silver</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm medal-bronze">
                  3
                </div>
                <span className="text-[10px] text-muted-foreground">Bronze</span>
              </div>
            </div>
          </section>

          {/* Achievement Badges Section */}
          <section>
            <h3 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              Achievement Badges
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Shown next to player names in the standings table.
            </p>
            <div className="space-y-2">
              <BadgeItem
                icon={<Crown className="w-4 h-4 text-yellow-500" />}
                title="Champion"
                description="Currently ranked #1 in standings"
                criteria="Rank #1 + 3 matches minimum"
              />
              <BadgeItem
                icon={<Target className="w-4 h-4 text-primary" />}
                title="Top Scorer"
                description="Leading in total goals scored"
                criteria="Most goals + at least 1 goal"
              />
              <BadgeItem
                icon={<Award className="w-4 h-4 text-purple-500" />}
                title="Veteran"
                description="Experienced player with many matches"
                criteria="20+ matches played"
              />
              <BadgeItem
                icon={<Zap className="w-4 h-4 text-amber-500" />}
                title="Elite"
                description="Consistently high performance"
                criteria="70%+ win rate + 5 matches minimum"
              />
            </div>
          </section>

          {/* Streak Indicators Section */}
          <section>
            <h3 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              Streak Indicators
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Shown in the "Strk" column when a player has 3+ consecutive results.
            </p>
            <div className="space-y-2">
              <BadgeItem
                icon={<Flame className="w-4 h-4 text-primary animate-pulse" />}
                title="Hot Streak"
                description="Player is on fire with consecutive wins"
                criteria="3+ wins in a row"
              />
              <BadgeItem
                icon={<Snowflake className="w-4 h-4 text-destructive animate-pulse" />}
                title="Cold Streak"
                description="Player experiencing consecutive losses"
                criteria="3+ losses in a row"
              />
            </div>
          </section>

          {/* Win Rate Tiers Section */}
          <section>
            <h3 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              Win Rate Tier Rings
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Avatar border color indicates performance tier on leader cards.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <TierRingPreview
                color="border-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]"
                label="Gold"
                range="70%+"
              />
              <TierRingPreview
                color="border-gray-300 shadow-[0_0_6px_rgba(209,213,219,0.4)]"
                label="Silver"
                range="50-69%"
              />
              <TierRingPreview
                color="border-amber-700 shadow-[0_0_6px_rgba(180,83,9,0.4)]"
                label="Bronze"
                range="30-49%"
              />
              <TierRingPreview
                color="border-border"
                label="Default"
                range="0-29%"
              />
            </div>
          </section>

          {/* Ranking Info */}
          <section className="border-t border-border/50 pt-4">
            <h3 className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">
              How Rankings Work
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>1. Players need 3+ matches to qualify for top ranks</li>
              <li>2. Primary sort: Total wins (most wins first)</li>
              <li>3. Secondary sort: Win rate percentage</li>
              <li>4. Tiebreaker: Goal difference (scored - conceded)</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
