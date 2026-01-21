import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const { login } = useStore();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock Password Check - in real app this would be server side
    if (password === "admin" || password === "fifa") {
      login();
      toast({ title: "Welcome back, Admin" });
      setLocation("/");
    } else {
      toast({ title: "Access Denied", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-6 animate-in zoom-in-95 duration-500">
      <div className="bg-primary/10 p-6 rounded-full">
        <ShieldCheck className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-display font-bold tracking-widest uppercase">Admin Access</h2>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <Input
          type="password"
          placeholder="Enter Admin Password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-center tracking-widest h-12 text-lg"
        />
        <Button type="submit" className="w-full h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
          UNLOCK SYSTEM
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">Hint: Try 'admin'</p>
    </div>
  );
}
