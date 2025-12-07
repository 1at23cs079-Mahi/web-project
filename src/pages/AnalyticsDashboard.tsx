import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { usePlayers } from '@/context/PlayerContext';
import { TopPerformersCard } from '@/components/analytics/TopPerformersCard';
import { NeonCircularProgress } from '@/components/ui/NeonCircularProgress';
import { BarChart3, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  AreaChart,
  Area,
} from 'recharts';

const NEON_COLORS = {
  blue: 'hsl(190, 100%, 50%)',
  purple: 'hsl(270, 91%, 65%)',
  pink: 'hsl(330, 90%, 60%)',
  cyan: 'hsl(67, 94%, 48%)',
  lime: 'hsl(150, 100%, 50%)',
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { players, setSelectedPlayer } = usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string>('battingAverage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Handle player click - navigate to player panel
  const handlePlayerClick = (player: typeof players[0]) => {
    setSelectedPlayer(player);
    navigate('/player');
  };

  // Calculate team stats
  const teamStats = {
    totalRuns: players.reduce((sum, p) => sum + p.totalRuns, 0),
    totalWickets: players.reduce((sum, p) => sum + p.wickets, 0),
    avgFitness: players.reduce((sum, p) => sum + p.fitnessScore, 0) / players.length,
    avgFielding: players.reduce((sum, p) => sum + p.fieldingRating, 0) / players.length,
  };

  // Top performers
  const topBatsmen = [...players].sort((a, b) => {
    const scoreA = a.battingAverage * 0.4 + a.strikeRate * 0.3 + (a.totalRuns / 100) * 0.3;
    const scoreB = b.battingAverage * 0.4 + b.strikeRate * 0.3 + (b.totalRuns / 100) * 0.3;
    return scoreB - scoreA;
  });

  const topBowlers = [...players]
    .filter((p) => p.wickets > 0)
    .sort((a, b) => {
      const scoreA = a.wickets * 0.5 + (10 - a.bowlingEconomy) * 0.5;
      const scoreB = b.wickets * 0.5 + (10 - b.bowlingEconomy) * 0.5;
      return scoreB - scoreA;
    });

  const topAllRounders = [...players].sort((a, b) => {
    const scoreA = a.battingAverage * 0.25 + (a.wickets / 3) * 0.25 + a.fitnessScore * 0.25 + a.fieldingRating * 0.25;
    const scoreB = b.battingAverage * 0.25 + (b.wickets / 3) * 0.25 + b.fitnessScore * 0.25 + b.fieldingRating * 0.25;
    return scoreB - scoreA;
  });

  // Team runs trend
  const teamRunsTrend = Array.from({ length: 10 }, (_, i) => ({
    match: `M${i + 1}`,
    runs: players.reduce((sum, p) => sum + (p.runsPerMatch[i] || 0), 0),
  }));

  // Team wickets trend
  const teamWicketsTrend = Array.from({ length: 10 }, (_, i) => ({
    match: `M${i + 1}`,
    wickets: players.reduce((sum, p) => sum + (p.wicketsPerMatch[i] || 0), 0),
  }));

  // Skill distribution
  const skillDistribution = [
    { name: 'Batsmen', value: players.filter((p) => p.role === 'Batsman').length },
    { name: 'Bowlers', value: players.filter((p) => p.role === 'Bowler').length },
    { name: 'All-Rounders', value: players.filter((p) => p.role === 'All-Rounder').length },
    { name: 'Keepers', value: players.filter((p) => p.role === 'Wicket-Keeper').length },
  ];

  const PIE_COLORS = [NEON_COLORS.blue, NEON_COLORS.purple, NEON_COLORS.pink, NEON_COLORS.cyan];

  // Team strength radar
  const teamRadar = [
    { attribute: 'Batting', value: players.reduce((sum, p) => sum + p.battingAverage, 0) / players.length * 1.5 },
    { attribute: 'Bowling', value: players.filter(p => p.wickets > 0).length > 0 ? players.reduce((sum, p) => sum + Math.max(100 - p.bowlingEconomy * 10, 0), 0) / players.filter(p => p.wickets > 0).length : 0 },
    { attribute: 'Fielding', value: teamStats.avgFielding },
    { attribute: 'Fitness', value: teamStats.avgFitness },
    { attribute: 'Experience', value: Math.min(players.reduce((sum, p) => sum + p.matchesPlayed, 0) / players.length / 2, 100) },
  ];

  // Contribution data
  const contributionData = players.slice(0, 6).map((p) => ({
    name: p.name.split(' ')[0],
    runs: p.totalRuns,
    wickets: p.wickets * 50,
  }));

  // Filtered and sorted players
  const filteredPlayers = players
    .filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a] as number;
      const bVal = b[sortKey as keyof typeof b] as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <BarChart3 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-accent neon-text-pink">
              Team Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive performance insights
            </p>
          </div>
        </div>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="neon-card flex flex-col items-center">
            <NeonCircularProgress value={teamStats.avgFitness} color="cyan" size={100} />
            <p className="text-sm text-muted-foreground mt-2">Avg Fitness</p>
          </div>
          <div className="neon-card flex flex-col items-center">
            <NeonCircularProgress value={teamStats.avgFielding} color="purple" size={100} />
            <p className="text-sm text-muted-foreground mt-2">Avg Fielding</p>
          </div>
          <div className="neon-card text-center flex flex-col items-center justify-center">
            <div className="font-display text-5xl font-bold text-primary neon-text">
              {teamStats.totalRuns.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total Runs</p>
          </div>
          <div className="neon-card text-center flex flex-col items-center justify-center">
            <div className="font-display text-5xl font-bold text-secondary neon-text-purple">
              {teamStats.totalWickets}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Total Wickets</p>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid md:grid-cols-3 gap-6">
          <TopPerformersCard
            title="Top Batsmen"
            players={topBatsmen}
            statKey="battingAverage"
            getStatValue={(p) => p.battingAverage}
            color="blue"
          />
          <TopPerformersCard
            title="Top Bowlers"
            players={topBowlers}
            statKey="wickets"
            getStatValue={(p) => p.wickets}
            color="purple"
          />
          <TopPerformersCard
            title="Top All-Rounders"
            players={topAllRounders}
            statKey="overall"
            getStatValue={(p) =>
              p.battingAverage * 0.25 + (p.wickets / 3) * 0.25 + p.fitnessScore * 0.25 + p.fieldingRating * 0.25
            }
            color="pink"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Team Runs Trend */}
          <div className="neon-card">
            <h3 className="font-display text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 from-0% via-purple-500 via-50% to-pink-500 to-100% bg-clip-text text-transparent">Team Runs Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={teamRunsTrend}>
                  <defs>
                    <linearGradient id="runsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON_COLORS.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={NEON_COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="runs"
                    stroke={NEON_COLORS.cyan}
                    strokeWidth={2}
                    fill="url(#runsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Wickets Trend */}
          <div className="neon-card">
            <h3 className="font-display text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 from-5% via-purple-500 via-45% to-pink-500 to-95% bg-clip-text text-transparent">Team Wickets Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamWicketsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                  <XAxis dataKey="match" stroke="hsl(200 30% 60%)" fontSize={12} />
                  <YAxis stroke="hsl(200 30% 60%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(270 91% 65% / 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="wickets" fill={NEON_COLORS.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Composition Pie */}
          <div className="neon-card">
            <h3 className="font-display text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 from-0% via-purple-500 via-55% to-pink-500 to-100% bg-clip-text text-transparent">Team Composition</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
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
                      border: '1px solid hsl(330 90% 60% / 0.3)',
                      borderRadius: '8px',
                      color: 'hsl(210 40% 98%)',
                    }}
                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    itemStyle={{ color: 'hsl(210 40% 98%)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team Strength Radar */}
          <div className="neon-card">
            <h3 className="font-display text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 from-0% via-purple-500 via-40% to-pink-500 to-100% bg-clip-text text-transparent">Team Strength</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={teamRadar}>
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
                    name="Team"
                    dataKey="value"
                    stroke={NEON_COLORS.blue}
                    fill={NEON_COLORS.blue}
                    fillOpacity={0.3}
                    dot={{ fill: NEON_COLORS.blue, r: 4 }}
                    activeDot={{ 
                      r: 8, 
                      fill: NEON_COLORS.blue,
                      style: { filter: `drop-shadow(0 0 8px ${NEON_COLORS.blue})` }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: `1px solid ${NEON_COLORS.blue}40`,
                      borderRadius: '8px',
                      color: 'hsl(210 40% 98%)',
                    }}
                    labelStyle={{ color: 'hsl(210 40% 98%)' }}
                    itemStyle={{ color: NEON_COLORS.blue }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Contributor Chart */}
          <div className="neon-card">
            <h3 className="font-display text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 from-0% via-purple-500 via-45% to-pink-500 to-100% bg-clip-text text-transparent">Top Contributors</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 30% 20%)" />
                  <XAxis type="number" stroke="hsl(200 30% 60%)" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="hsl(200 30% 60%)" fontSize={10} width={50} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(230 50% 6%)',
                      border: '1px solid hsl(150 100% 50% / 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="runs" fill={NEON_COLORS.blue} stackId="a" />
                  <Bar dataKey="wickets" fill={NEON_COLORS.pink} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Full Player Table */}
        <div className="neon-card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-cyan-400 from-0% via-purple-500 via-50% to-pink-500 to-100% bg-clip-text text-transparent">
              Full Player Database
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neon-input pl-10 bg-background/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-primary/20">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
                  <th className="text-left px-4 py-4 text-sm font-bold text-primary uppercase tracking-wider border-b border-primary/30">Player</th>
                  <th className="text-left px-4 py-4 text-sm font-bold text-secondary uppercase tracking-wider border-b border-primary/30">Role</th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-primary uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleSort('battingAverage')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Avg <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-secondary uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-secondary/20 transition-colors"
                    onClick={() => toggleSort('strikeRate')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      SR <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-cyan-500/20 transition-colors"
                    onClick={() => toggleSort('totalRuns')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Runs <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-accent uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-accent/20 transition-colors"
                    onClick={() => toggleSort('wickets')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Wkts <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-orange-400 uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-orange-500/20 transition-colors"
                    onClick={() => toggleSort('bowlingEconomy')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Econ <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-lime-400 uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-lime-500/20 transition-colors"
                    onClick={() => toggleSort('fitnessScore')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Fit <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                  <th
                    className="text-center px-3 py-4 text-sm font-bold text-purple-400 uppercase tracking-wider border-b border-primary/30 cursor-pointer hover:bg-purple-500/20 transition-colors"
                    onClick={() => toggleSort('fieldingRating')}
                  >
                    <span className="flex items-center justify-center gap-1">
                      Field <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <tr 
                    key={player.id} 
                    onClick={() => handlePlayerClick(player)}
                    className={`
                      cursor-pointer transition-all duration-300 
                      hover:bg-primary/15 hover:shadow-[inset_0_0_30px_hsl(190_100%_50%/0.15)] hover:scale-[1.01]
                      ${index % 2 === 0 ? 'bg-background/30' : 'bg-muted/10'}
                      border-b border-primary/10 last:border-b-0
                      group
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {player.image ? (
                          <img 
                            src={player.image} 
                            alt={player.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/30 shadow-[0_0_10px_hsl(190_100%_50%/0.3)] group-hover:border-primary group-hover:shadow-[0_0_20px_hsl(190_100%_50%/0.5)] group-hover:scale-110 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary group-hover:scale-110 transition-all duration-300">
                            {player.avatar}
                          </div>
                        )}
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`
                        text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300
                        ${player.role === 'Batsman' ? 'bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary/30 group-hover:shadow-[0_0_10px_hsl(190_100%_50%/0.3)]' : ''}
                        ${player.role === 'Bowler' ? 'bg-accent/20 text-accent border border-accent/30 group-hover:bg-accent/30 group-hover:shadow-[0_0_10px_hsl(330_90%_60%/0.3)]' : ''}
                        ${player.role === 'All-Rounder' ? 'bg-secondary/20 text-secondary border border-secondary/30 group-hover:bg-secondary/30 group-hover:shadow-[0_0_10px_hsl(270_91%_65%/0.3)]' : ''}
                        ${player.role === 'Wicket-Keeper' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500/30 group-hover:shadow-[0_0_10px_hsl(185_94%_48%/0.3)]' : ''}
                      `}>
                        {player.role}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {player.battingAverage.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono font-medium text-secondary">
                        {player.strikeRate.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-mono font-bold text-cyan-400">
                        {player.totalRuns.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={`font-mono font-bold ${player.wickets > 100 ? 'text-accent' : player.wickets > 0 ? 'text-accent/70' : 'text-muted-foreground'}`}>
                        {player.wickets}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={`font-mono ${player.bowlingEconomy > 0 && player.bowlingEconomy < 5 ? 'text-lime-400 font-bold' : player.bowlingEconomy > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                        {player.bowlingEconomy > 0 ? player.bowlingEconomy.toFixed(1) : '-'}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-lime-500 to-lime-400 rounded-full transition-all"
                            style={{ width: `${player.fitnessScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm text-lime-400">{player.fitnessScore}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all"
                            style={{ width: `${player.fieldingRating}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm text-purple-400">{player.fieldingRating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredPlayers.length} of {players.length} players</span>
            <span className="text-xs">Click column headers to sort</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
