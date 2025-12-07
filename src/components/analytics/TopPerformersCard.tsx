import { Player } from '@/data/players';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '@/context/PlayerContext';

interface TopPerformersCardProps {
  title: string;
  players: Player[];
  statKey: string;
  getStatValue: (player: Player) => number;
  color: 'blue' | 'purple' | 'pink';
}

const medals = ['🥇', '🥈', '🥉'];
const medalClasses = ['medal-gold', 'medal-silver', 'medal-bronze'];

export const TopPerformersCard = ({
  title,
  players,
  statKey,
  getStatValue,
  color,
}: TopPerformersCardProps) => {
  const navigate = useNavigate();
  const { setSelectedPlayer } = usePlayers();
  
  const borderClass = color === 'blue' ? 'neon-border' : color === 'purple' ? 'neon-border-purple' : 'neon-border-pink';
  const textClass = color === 'blue' ? 'text-primary neon-text' : color === 'purple' ? 'text-secondary neon-text-purple' : 'text-accent neon-text-pink';
  const hoverGlow = color === 'blue' ? 'hover:shadow-[0_0_20px_hsl(190_100%_50%/0.4)]' : color === 'purple' ? 'hover:shadow-[0_0_20px_hsl(270_91%_65%/0.4)]' : 'hover:shadow-[0_0_20px_hsl(330_90%_60%/0.4)]';

  // Handle player click
  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    navigate('/player');
  };

  // Format stat display based on type
  const formatStat = (player: Player) => {
    if (title === 'Top Batsmen') {
      // Show runs as whole number
      return `${player.totalRuns} runs`;
    } else if (title === 'Top Bowlers') {
      // Show wickets as whole number
      return `${player.wickets} wkts`;
    } else if (title === 'Top All-Rounders') {
      // Show both runs and wickets
      return (
        <div className="flex flex-col items-end text-sm">
          <span className="text-primary">{player.totalRuns} runs</span>
          <span className="text-secondary">{player.wickets} wkts</span>
        </div>
      );
    }
    return getStatValue(player).toFixed(1);
  };

  return (
    <div className={cn('neon-card', borderClass)}>
      <div className="flex items-center gap-3 mb-4">
        <Trophy className={cn('h-5 w-5', textClass)} />
        <h3 className={cn('font-display font-bold text-lg', textClass)}>{title}</h3>
      </div>

      <div className="space-y-3">
        {players.slice(0, 3).map((player, index) => (
          <div
            key={player.id}
            onClick={() => handlePlayerClick(player)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer group',
              'hover:scale-[1.03] active:scale-[0.98]',
              hoverGlow,
              index === 0 && 'bg-neon-gold/10 border border-neon-gold/30 hover:bg-neon-gold/20 hover:border-neon-gold/50',
              index === 1 && 'bg-neon-silver/10 border border-neon-silver/30 hover:bg-neon-silver/20 hover:border-neon-silver/50',
              index === 2 && 'bg-neon-bronze/10 border border-neon-bronze/30 hover:bg-neon-bronze/20 hover:border-neon-bronze/50'
            )}
          >
            <span className={cn('text-2xl transition-transform duration-300 group-hover:scale-125', medalClasses[index])}>{medals[index]}</span>
            {player.image ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_10px_hsl(190_100%_50%/0.2)] transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_15px_hsl(190_100%_50%/0.4)] group-hover:scale-110">
                <img 
                  src={player.image} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-display font-bold text-sm text-primary transition-all duration-300 group-hover:scale-110">
                {player.avatar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate transition-colors duration-300 group-hover:text-primary">{player.name}</p>
              <p className="text-xs text-muted-foreground">{player.role}</p>
            </div>
            <div className={cn('font-display font-bold transition-transform duration-300 group-hover:scale-110', medalClasses[index])}>
              {formatStat(player)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
