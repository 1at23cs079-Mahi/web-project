import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePlayers } from '@/context/PlayerContext';
import { usePlayerComparison } from '@/hooks/useAnalytics';
import { NeonCircularProgress } from '@/components/ui/NeonCircularProgress';
import { Users, ArrowLeftRight, Trophy, Target, Zap, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const NEON_COLORS = {
  blue: 'hsl(190, 100%, 50%)',
  purple: 'hsl(270, 91%, 65%)',
  pink: 'hsl(330, 90%, 60%)',
  cyan: 'hsl(67, 94%, 48%)',
  lime: 'hsl(150, 100%, 50%)',
};

const ComparisonPage = () => {
  const { players, analytics } = usePlayers();
  const {
    player1Id,
    player2Id,
    comparison,
    player1Metrics,
    player2Metrics,
    selectPlayer1,
    selectPlayer2,
  } = usePlayerComparison();

  const player1 = useMemo(() => players.find(p => p.id === player1Id), [players, player1Id]);
  const player2 = useMemo(() => players.find(p => p.id === player2Id), [players, player2Id]);

  const player1Form = useMemo(() => {
    if (!player1 || !analytics) return null;
    return analytics.analyzeForm(player1);
  }, [player1, analytics]);

  const player2Form = useMemo(() => {
    if (!player2 || !analytics) return null;
    return analytics.analyzeForm(player2);
  }, [player2, analytics]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!player1Metrics || !player2Metrics) return [];
    return [
      { attribute: 'Batting', player1: player1Metrics.battingRating, player2: player2Metrics.battingRating },
      { attribute: 'Bowling', player1: player1Metrics.bowlingRating, player2: player2Metrics.bowlingRating },
      { attribute: 'Fielding', player1: player1Metrics.fieldingRating, player2: player2Metrics.fieldingRating },
      { attribute: 'Consistency', player1: player1Metrics.consistencyScore, player2: player2Metrics.consistencyScore },
      { attribute: 'Impact', player1: player1Metrics.impactScore, player2: player2Metrics.impactScore },
      { attribute: 'Form', player1: player1Metrics.formIndex, player2: player2Metrics.formIndex },
    ];
  }, [player1Metrics, player2Metrics]);

  // Bar chart data for stats comparison
  const statsBarData = useMemo(() => {
    if (!player1 || !player2) return [];
    return [
      { stat: 'Batting Avg', player1: player1.battingAverage, player2: player2.battingAverage },
      { stat: 'Strike Rate', player1: player1.strikeRate / 2, player2: player2.strikeRate / 2 },
      { stat: 'Wickets', player1: player1.wickets / 3, player2: player2.wickets / 3 },
      { stat: 'Fitness', player1: player1.fitnessScore, player2: player2.fitnessScore },
      { stat: 'Fielding', player1: player1.fieldingRating, player2: player2.fieldingRating },
    ];
  }, [player1, player2]);

  const getFormColor = (form: string) => {
    switch (form) {
      case 'Excellent': return 'text-lime-400';
      case 'Good': return 'text-cyan-400';
      case 'Average': return 'text-yellow-400';
      case 'Poor': return 'text-orange-400';
      case 'Critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-secondary/10">
            <ArrowLeftRight className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-secondary neon-text-purple">
              Player Comparison
            </h1>
            <p className="text-sm text-muted-foreground">
              Head-to-head performance analysis
            </p>
          </div>
        </div>

        {/* Player Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Player 1 Selector */}
          <div className="neon-card">
            <h3 className="text-lg font-display font-semibold text-primary mb-4">Player 1</h3>
            <Select value={player1Id || ''} onValueChange={selectPlayer1}>
              <SelectTrigger className="neon-input">
                <SelectValue placeholder="Select first player" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id} disabled={player.id === player2Id}>
                    {player.name} - {player.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {player1 && player1Metrics && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  {player1.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_hsl(190_100%_50%/0.3)] transition-all duration-300 hover:shadow-[0_0_25px_hsl(190_100%_50%/0.5)] hover:scale-105">
                      <img 
                        src={player1.image} 
                        alt={player1.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center font-display font-bold text-xl text-primary">
                      {player1.avatar}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display text-xl font-bold">{player1.name}</h4>
                    <p className="text-sm text-primary">{player1.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Overall</span>
                    <p className="font-bold text-primary">{player1Metrics.overallRating.toFixed(1)}</p>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Form</span>
                    <p className={`font-bold ${getFormColor(player1Form?.currentForm || '')}`}>
                      {player1Form?.currentForm || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player 2 Selector */}
          <div className="neon-card">
            <h3 className="text-lg font-display font-semibold text-accent mb-4">Player 2</h3>
            <Select value={player2Id || ''} onValueChange={selectPlayer2}>
              <SelectTrigger className="neon-input">
                <SelectValue placeholder="Select second player" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id} disabled={player.id === player1Id}>
                    {player.name} - {player.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {player2 && player2Metrics && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  {player2.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-accent/50 shadow-[0_0_15px_hsl(330_90%_60%/0.3)] transition-all duration-300 hover:shadow-[0_0_25px_hsl(330_90%_60%/0.5)] hover:scale-105">
                      <img 
                        src={player2.image} 
                        alt={player2.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 flex items-center justify-center font-display font-bold text-xl text-accent">
                      {player2.avatar}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display text-xl font-bold">{player2.name}</h4>
                    <p className="text-sm text-accent">{player2.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Overall</span>
                    <p className="font-bold text-accent">{player2Metrics.overallRating.toFixed(1)}</p>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Form</span>
                    <p className={`font-bold ${getFormColor(player2Form?.currentForm || '')}`}>
                      {player2Form?.currentForm || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {comparison && player1 && player2 && (
          <>
            {/* Winner Banner */}
            <div className="neon-card bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
              <div className="flex items-center justify-center gap-4">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Edge</p>
                  <h2 className="font-display text-2xl font-bold text-yellow-400">
                    {comparison.overallEdge}
                  </h2>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </div>

            {/* Radar Chart Comparison */}
            <div className="neon-card">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skills Radar
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(230, 30%, 20%)" />
                    <PolarAngleAxis 
                      dataKey="attribute" 
                      tick={{ fill: 'hsl(200, 30%, 60%)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: 'hsl(200, 30%, 60%)', fontSize: 10 }}
                    />
                    <Radar
                      name={player1.name}
                      dataKey="player1"
                      stroke={NEON_COLORS.blue}
                      fill={NEON_COLORS.blue}
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={player2.name}
                      dataKey="player2"
                      stroke={NEON_COLORS.pink}
                      fill={NEON_COLORS.pink}
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(230, 50%, 6%)', 
                        border: '1px solid hsl(230, 30%, 20%)',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Bar Chart */}
            <div className="neon-card">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                Statistics Comparison
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 30%, 15%)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(200, 30%, 60%)' }} />
                    <YAxis dataKey="stat" type="category" tick={{ fill: 'hsl(200, 30%, 60%)', fontSize: 12 }} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(230, 50%, 6%)', 
                        border: '1px solid hsl(230, 30%, 20%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="player1" name={player1.name} fill={NEON_COLORS.blue} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="player2" name={player2.name} fill={NEON_COLORS.pink} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Head-to-Head Metrics */}
            <div className="neon-card">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Head-to-Head Breakdown
              </h3>
              <div className="space-y-3">
                {comparison.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className="flex-1 text-right">
                      <span className={`font-bold ${metric.winner === 'player1' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {metric.player1Value.toFixed(1)}
                      </span>
                      {metric.winner === 'player1' && <span className="ml-2 text-xs text-primary">✓</span>}
                    </div>
                    <div className="w-32 text-center">
                      <span className="text-sm font-medium text-foreground">{metric.category}</span>
                    </div>
                    <div className="flex-1">
                      {metric.winner === 'player2' && <span className="mr-2 text-xs text-accent">✓</span>}
                      <span className={`font-bold ${metric.winner === 'player2' ? 'text-accent' : 'text-muted-foreground'}`}>
                        {metric.player2Value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="neon-card text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Batting Edge</p>
                <p className="font-display font-bold text-lg text-primary">{comparison.battingEdge}</p>
              </div>
              <div className="neon-card text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <p className="text-sm text-muted-foreground">Bowling Edge</p>
                <p className="font-display font-bold text-lg text-secondary">{comparison.bowlingEdge}</p>
              </div>
              <div className="neon-card text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">Fielding Edge</p>
                <p className="font-display font-bold text-lg text-accent">{comparison.fieldingEdge}</p>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {(!player1Id || !player2Id) && (
          <div className="neon-card text-center py-12">
            <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-display text-xl font-semibold text-muted-foreground mb-2">
              Select Two Players
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose two players above to see a detailed head-to-head comparison
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ComparisonPage;
