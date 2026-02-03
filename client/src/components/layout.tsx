import { Link, useLocation } from "wouter";
import { Trophy, Users, PlusCircle, LogOut, Shield } from "lucide-react";
import { useStore } from "@/lib/api-store";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/mode-toggle";
import bgImage from "@assets/generated_images/dark_abstract_soccer_background.png";
import logoIcon from "@assets/generated_images/fc26_tracker_logo_icon.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, logout } = useStore();

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { href: "/", icon: Trophy, label: "Leaderboard" },
    { href: "/record", icon: PlusCircle, label: "Record" },
    { href: "/players", icon: Users, label: "Players" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground relative transition-colors duration-300">
      {/* Background Image Layer (Dark Only) */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/90 to-background pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto border-x border-border/40 shadow-2xl bg-background/50 backdrop-blur-sm transition-colors duration-300">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="FC26" className="w-8 h-8 rounded-sm" />
            <h1 className="text-xl font-bold tracking-wider dark:text-white text-foreground">
              OMV FC26 <span className="text-primary text-glow">TRACKER</span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <ModeToggle />
            {isAdmin ? (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
               <Link href="/admin">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Shield className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-20 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Fixed to viewport */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card/95 backdrop-blur-lg border-t border-x border-border/40 p-2 z-50 safe-area-bottom">
        <ul className="flex justify-around items-center relative">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href} className="relative">
                <Link href={item.href}>
                  <div
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary scale-110"
                        : "text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
                    }`}
                  >
                    <div className="relative">
                      <item.icon
                        className={`w-6 h-6 transition-all duration-300 ${isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" : ""}`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Toaster />
    </div>
  );
}
