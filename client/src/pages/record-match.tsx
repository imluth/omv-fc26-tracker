import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

const formSchema = z.object({
  player1: z.string().min(1, "Player 1 is required"),
  player2: z.string().min(1, "Player 2 is required"),
  score1: z.coerce.number().min(0).max(99),
  score2: z.coerce.number().min(0).max(99),
}).refine((data) => data.player1 !== data.player2, {
  message: "Players must be different",
  path: ["player2"],
}).refine((data) => data.score1 !== data.score2, {
  message: "Match cannot end in a draw",
  path: ["score2"],
});

export default function RecordMatch() {
  const { players, addMatch, isAdmin } = useStore();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      player1: "",
      player2: "",
      score1: 0,
      score2: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to record matches.",
        variant: "destructive",
      });
      return;
    }
    
    addMatch(values.player1, values.player2, values.score1, values.score2);
    toast({
      title: "Match Recorded!",
      description: "The leaderboard has been updated.",
    });
    setLocation("/");
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <Swords className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Admin Access Required</h2>
        <p className="text-muted-foreground max-w-xs">You need to log in as an admin to record official match results.</p>
        <Button onClick={() => setLocation("/admin")} variant="outline">Login as Admin</Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl uppercase">
            <Swords className="text-primary" /> Record Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Player 1 */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="player1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Player 1 (Home)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {players.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="score1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="text-center text-3xl font-mono h-16 bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* VS Divider */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/20 font-display text-6xl font-black pointer-events-none italic z-0">
                  VS
                </div>

                {/* Player 2 */}
                <div className="space-y-4 z-10">
                  <FormField
                    control={form.control}
                    name="player2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-400 font-bold">Player 2 (Away)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {players.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="score2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Score</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="text-center text-3xl font-mono h-16 bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-bold font-display tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-all">
                CONFIRM RESULT
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
