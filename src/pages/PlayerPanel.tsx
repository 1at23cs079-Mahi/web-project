import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { usePlayers } from '@/context/PlayerContext';
import { Player } from '@/data/players';
import { NeonCircularProgress } from '@/components/ui/NeonCircularProgress';
import AdvancedMetricsCard from '@/components/analytics/AdvancedMetricsCard';
import { User, GitCompare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const NEON_COLORS = {
  blue: 'hsl(190, 100%, 50%)',
  purple: 'hsl(270, 91%, 65%)',
  pink: 'hsl(330, 90%, 60%)',
  cyan: 'hsl(67, 94%, 48%)',
  lime: 'hsl(150, 100%, 50%)',
};

const PlayerPanel = () => {
  const navigate = useNavigate();
  const { players, selectedPlayer, setSelectedPlayer } = usePlayers();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(
    selectedPlayer || players[0] || null
  );

  const handlePlayerChange = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      setCurrentPlayer(player);
      setSelectedPlayer(player);
    }
  };

  const handleCompareClick = () => {
    navigate('/compare');
  };

  if (!currentPlayer) {
    return (
      <Layout>
        <div className="neon-card text-center py-12">
          <p className="text-muted-foreground">No players available</p>
        </div>
      </Layout>
    );
  }

  // Chart data
  const runsData = currentPlayer.runsPerMatch.map((runs, i) => ({
    match: `M${i + 1}`,
    runs,
  }));

  const wicketsData = currentPlayer.wicketsPerMatch.map((wickets, i) => ({
    match: `M${i + 1}`,
    wickets,
  }));

  const skillDistribution = [
    { name: 'Batting', value: currentPlayer.battingAverage },
    { name: 'Bowling', value: currentPlayer.bowlingEconomy > 0 ? (10 - currentPlayer.bowlingEconomy) * 10 : 0 },
    { name: 'Fielding', value: currentPlayer.fieldingRating },
    { name: 'Fitness', value: currentPlayer.fitnessScore },
  ];

  const radarData = [
    { attribute: 'Batting', value: Math.min(currentPlayer.battingAverage * 1.5, 100), fullMark: 100 },
    { attribute: 'Strike Rate', value: Math.min(currentPlayer.strikeRate / 2, 100), fullMark: 100 },
    { attribute: 'Bowling', value: currentPlayer.bowlingEconomy > 0 ? Math.max(100 - currentPlayer.bowlingEconomy * 10, 0) : 0, fullMark: 100 },
    { attribute: 'Wickets', value: Math.min(currentPlayer.wickets / 3, 100), fullMark: 100 },
    { attribute: 'Fielding', value: currentPlayer.fieldingRating, fullMark: 100 },
    { attribute: 'Fitness', value: currentPlayer.fitnessScore, fullMark: 100 },
  ];

  const PIE_COLORS = [NEON_COLORS.blue, NEON_COLORS.purple, NEON_COLORS.pink, NEON_COLORS.cyan];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <User className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary neon-text-purple">
                Player Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Individual performance analysis
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Select value={currentPlayer.id} onValueChange={handlePlayerChange}>
              <SelectTrigger className="neon-input w-72">
                <div className="flex items-center gap-3">
                  {players.find(p => p.id === currentPlayer.id)?.image ? (
                    <img 
                      src={players.find(p => p.id === currentPlayer.id)?.image} 
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {currentPlayer.avatar}
                    </div>
                  )}
                  <span>{currentPlayer.name} - {currentPlayer.role}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id} className="py-2">
                    <div className="flex items-center gap-3">
                      {player.image ? (
                        <img 
                          src={player.image} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover border border-primary/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {player.avatar}
                        </div>
                      )}
                      <span>{player.name} - {player.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Compare Button - Navigates to Compare Page */}
            <button
              onClick={handleCompareClick}
              className="flex items-center gap-2 px-5 py-3 rounded-lg transition-all duration-300 bg-muted/30 text-muted-foreground border border-muted/30 hover:border-secondary hover:text-secondary hover:bg-secondary/20 hover:shadow-[0_0_25px_hsl(270_91%_65%/0.5)] hover:scale-105 active:scale-95"
            >
              <GitCompare className="w-5 h-5" />
              <span className="text-base font-medium">Compare</span>
            </button>
          </div>
        </div>

        {/* Player Info Card */}
        <div className="neon-card">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {currentPlayer.image ? (
              <div 
                onClick={() => navigate('/analytics')}
                className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/50 shadow-[0_0_30px_hsl(190_100%_50%/0.4)] transition-all duration-300 hover:shadow-[0_0_50px_hsl(190_100%_50%/0.8)] hover:scale-110 hover:border-primary relative group cursor-pointer"
              >
                <img 
                  src={currentPlayer.image} 
                  alt={currentPlayer.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center font-display font-bold text-4xl text-primary bg-gradient-to-br from-primary/20 to-secondary/20">${currentPlayer.avatar}</div>`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <span className="text-xs text-white font-medium">View Analytics</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => navigate('/analytics')}
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center font-display font-bold text-4xl text-primary animate-pulse-neon shadow-[0_0_30px_hsl(190_100%_50%/0.3)] cursor-pointer hover:scale-110 hover:shadow-[0_0_50px_hsl(190_100%_50%/0.8)] hover:border-primary transition-all duration-300"
              >
                {currentPlayer.avatar}
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h2 
                onClick={() => navigate('/analytics')}
                className="font-display text-3xl font-bold text-foreground cursor-pointer hover:text-primary transition-all duration-300 hover:drop-shadow-[0_0_10px_hsl(190_100%_50%/0.8)]"
              >
                {currentPlayer.name}
              </h2>
              <p className="text-secondary text-lg">{currentPlayer.role}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3">
                <span className="text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{currentPlayer.matchesPlayed}</span> Matches
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="text-secondary font-bold">{currentPlayer.totalRuns}</span> Runs
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="text-accent font-bold">{currentPlayer.wickets}</span> Wickets
                </span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex gap-6">
              <NeonCircularProgress value={currentPlayer.fitnessScore} color="cyan" label="Fitness" />
              <NeonCircularProgress value={currentPlayer.fieldingRating} color="purple" label="Fielding" />
              <NeonCircularProgress value={Math.min(currentPlayer.battingAverage * 1.5, 100)} color="pink" label="Form" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Runs Bar Chart */}
          <div className="neon-card">
            <h3 className="font-display text-lg font-bold text-primary mb-4">Runs Per Match</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                  <XAxis dataKey="match" stroke="hsl(200 30% 60%)" fontSize={12} />
                  <YAxis stroke="hsl(200 30% 60%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(190 100% 50% / 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="runs" fill={NEON_COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wickets Bar Chart */}
          <div className="neon-card">
            <h3 className="font-display text-lg font-bold text-secondary mb-4">Wickets Per Match</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wicketsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                  <XAxis type="number" stroke="hsl(200 30% 60%)" fontSize={12} />
                  <YAxis dataKey="match" type="category" stroke="hsl(200 30% 60%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(270 91% 65% / 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="wickets" fill={NEON_COLORS.purple} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="neon-card">
            <h3 className="font-display text-lg font-bold text-accent mb-4">Attribute Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(230 30% 20%)" />
                  <PolarAngleAxis 
                    dataKey="attribute" 
                    tick={{ fill: 'hsl(210 40% 90%)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    tick={{ fill: 'hsl(200 30% 70%)', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(230 30% 25%)' }}
                  />
                  <Radar
                    name="Stats"
                    dataKey="value"
                    stroke={NEON_COLORS.pink}
                    fill={NEON_COLORS.pink}
                    fillOpacity={0.3}
                    dot={{ fill: NEON_COLORS.pink, r: 4 }}
                    activeDot={{ 
                      r: 8, 
                      fill: NEON_COLORS.pink,
                      style: { filter: `drop-shadow(0 0 8px ${NEON_COLORS.pink})` }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: `1px solid ${NEON_COLORS.pink}40`,
                      borderRadius: '8px',
                      color: 'hsl(210 40% 98%)',
                    }}
                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    itemStyle={{ color: NEON_COLORS.pink }}
                    formatter={(value: number) => [value.toFixed(1), 'Value']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="neon-card">
            <h3 className="font-display text-lg font-bold text-neon-cyan mb-4">Skill Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
                    labelLine={false}
                    activeShape={(props: any) => {
                      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                      return (
                        <g>
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius - 4}
                            outerRadius={outerRadius + 8}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                            style={{ filter: `drop-shadow(0 0 12px ${fill})` }}
                          />
                        </g>
                      );
                    }}
                  >
                    {skillDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(185 94% 48% / 0.3)',
                      borderRadius: '8px',
                      color: 'hsl(210 40% 98%)',
                    }}
                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    itemStyle={{ color: 'hsl(210 40% 98%)' }}
                    formatter={(value: number) => [value.toFixed(1), 'Score']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {skillDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: PIE_COLORS[index] }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Pro-Level Metrics */}
          <div className="lg:col-span-2">
            <AdvancedMetricsCard player={currentPlayer} />
          </div>

          {/* Performance Trend */}
          <div className="neon-card lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-neon-lime mb-4">Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={runsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                  <XAxis dataKey="match" stroke="hsl(200 30% 60%)" fontSize={12} />
                  <YAxis stroke="hsl(200 30% 60%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(150 100% 50% / 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="runs"
                    stroke={NEON_COLORS.lime}
                    strokeWidth={3}
                    dot={{ fill: NEON_COLORS.lime, strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: NEON_COLORS.lime }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerPanel;
