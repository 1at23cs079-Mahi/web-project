import { NavLink } from '@/components/NavLink';
import { Users, BarChart3, User, Zap, Swords, TrendingUp } from 'lucide-react';

export const Navigation = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-6 group">
            <div className="relative">
              <Zap className="h-16 w-16 text-primary animate-pulse-neon group-hover:drop-shadow-[0_0_12px_hsl(190_100%_50%/0.8)] transition-all duration-300" />
              <div className="absolute inset-0 blur-md bg-primary/30 rounded-full group-hover:bg-primary/50 transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-3xl text-foreground neon-text group-hover:drop-shadow-[0_0_15px_hsl(190_100%_50%/0.6)] transition-all duration-300">
                ATHLETEEDGE
              </span>
              <span className="text-[18px] text-muted-foreground tracking-widest uppercase">
                Peak Performance
              </span>
            </div>
          </NavLink>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/coach"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(190_100%_50%/0.2)] transition-all duration-300 active:scale-95"
              activeClassName="text-primary bg-primary/10 neon-border shadow-[0_0_20px_hsl(190_100%_50%/0.3)]"
            >
              <Users className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_hsl(190_100%_50%/0.8)] transition-all duration-300" />
              <span className="font-medium text-lg tracking-wide hidden md:inline">Coach</span>
            </NavLink>
            <NavLink
              to="/player"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/10 hover:shadow-[0_0_15px_hsl(270_91%_65%/0.2)] transition-all duration-300 active:scale-95"
              activeClassName="text-secondary bg-secondary/10 neon-border-purple shadow-[0_0_20px_hsl(270_91%_65%/0.3)]"
            >
              <User className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_hsl(270_91%_65%/0.8)] transition-all duration-300" />
              <span className="font-medium text-lg tracking-wide hidden md:inline">Player</span>
            </NavLink>
            <NavLink
              to="/analytics"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:shadow-[0_0_15px_hsl(330_90%_60%/0.2)] transition-all duration-300 active:scale-95"
              activeClassName="text-accent bg-accent/10 neon-border-pink shadow-[0_0_20px_hsl(330_90%_60%/0.3)]"
            >
              <BarChart3 className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_hsl(330_90%_60%/0.8)] transition-all duration-300" />
              <span className="font-medium text-lg tracking-wide hidden md:inline">Analytics</span>
            </NavLink>
            <NavLink
              to="/simulation"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-orange-500/10 hover:shadow-[0_0_15px_hsl(30_100%_50%/0.2)] transition-all duration-300 active:scale-95"
              activeClassName="text-orange-400 bg-orange-500/10 shadow-[0_0_20px_hsl(30_100%_50%/0.3)] border border-orange-500/30"
            >
              <Swords className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_hsl(30_100%_50%/0.8)] transition-all duration-300" />
              <span className="font-medium text-lg tracking-wide hidden md:inline">Simulate</span>
            </NavLink>
            <NavLink
              to="/predictions"
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-lime-500/10 hover:shadow-[0_0_15px_hsl(150_100%_50%/0.2)] transition-all duration-300 active:scale-95"
              activeClassName="text-lime-400 bg-lime-500/10 shadow-[0_0_20px_hsl(150_100%_50%/0.3)] border border-lime-500/30"
            >
              <TrendingUp className="h-6 w-6 group-hover:drop-shadow-[0_0_8px_hsl(150_100%_50%/0.8)] transition-all duration-300" />
              <span className="font-medium text-lg tracking-wide hidden md:inline">Predict</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
