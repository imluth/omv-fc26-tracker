import { Link, useLocation } from "wouter";
import { Trophy, Users, PlusCircle, LogOut, Shield } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import bgImage from "@assets/generated_images/dark_abstract_soccer_background.png";
import logoIcon from "@assets/generated_images/fc26_tracker_logo_icon.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, logout } = useStore();

  const navItems = [
    { href: "/", icon: Trophy, label: "Leaderboard" },
    { href: "/record", icon: PlusCircle, label: "Record" },
    { href: "/players", icon: Users, label: "Players" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground relative overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
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
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto border-x border-border/40 shadow-2xl bg-background/50 backdrop-blur-sm">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="FC26" className="w-8 h-8 rounded-sm" />
            <h1 className="text-xl font-bold tracking-wider text-white">
              OMV FC26 <span className="text-primary text-glow">TRACKER</span>
            </h1>
          </div>
          {isAdmin ? (
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
             <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Shield className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24 overflow-y-auto scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation (Mobile First) */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-lg border-t border-border/40 p-2 z-50">
          <ul className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div 
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                        isActive 
                          ? "text-primary scale-110" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon 
                        className={`w-6 h-6 ${isActive ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" : ""}`} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}
