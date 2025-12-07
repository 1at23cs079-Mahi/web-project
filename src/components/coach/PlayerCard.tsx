import { Player, getRoleColor } from '@/data/players';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
  onView: (player: Player) => void;
}

export const PlayerCard = ({ player, onEdit, onDelete, onView }: PlayerCardProps) => {
  const roleColor = getRoleColor(player.role);

  return (
    <div className="neon-card group hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      {/* Header with Photo and Name */}
      <div className="flex flex-col items-center text-center mb-4">
        {/* Player Photo */}
        {player.image ? (
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all duration-300 group-hover:shadow-[0_0_35px_hsl(var(--primary)/0.6)] group-hover:scale-110 group-hover:border-primary mb-3">
            <img 
              src={player.image} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center font-display font-bold text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">${player.avatar}</div>`;
              }}
            />
          </div>
        ) : (
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-2xl mb-3',
              'bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30'
            )}
            style={{
              boxShadow: `0 0 25px hsl(var(--${roleColor}) / 0.4)`,
            }}
          >
            {player.avatar}
          </div>
        )}

        {/* Player Name */}
        <h3 className="font-display font-semibold text-foreground text-lg">
          {player.name}
        </h3>
        
        {/* Role Badge */}
        <span
          className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-medium mt-1',
            roleColor === 'neon-blue' && 'bg-primary/20 text-primary',
            roleColor === 'neon-purple' && 'bg-secondary/20 text-secondary',
            roleColor === 'neon-pink' && 'bg-accent/20 text-accent',
            roleColor === 'neon-cyan' && 'bg-neon-cyan/20 text-neon-cyan'
          )}
        >
          {player.role}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onView(player)}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          title="View Stats"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(player)}
          className="p-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors"
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(player.id)}
          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 pt-4 border-t border-primary/10">
        <div className="text-center">
          <div className="text-lg font-display font-bold text-primary">{player.battingAverage.toFixed(1)}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Avg</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-display font-bold text-secondary">{player.totalRuns}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Runs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-display font-bold text-accent">{player.wickets}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Wkts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-display font-bold text-neon-cyan">{player.fitnessScore}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Fit</div>
        </div>
      </div>
    </div>
  );
};
