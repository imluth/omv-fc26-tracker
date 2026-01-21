import { useState } from "react";
import { useStore } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useStore();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(username, password);

    if (success) {
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
      <h2 className="text-2xl font-display font-bold tracking-widest">got root?</h2>
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-center tracking-widest h-12 text-lg"
          disabled={isLoading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-center tracking-widest h-12 text-lg"
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="w-full h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AUTHENTICATING...
            </>
          ) : (
            "UNLOCK SYSTEM"
          )}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Crafted by{" "}
        <a
          href="https://www.looth.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          @im_root
        </a>
      </p>
    </div>
  );
}
