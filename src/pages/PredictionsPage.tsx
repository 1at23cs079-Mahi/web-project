import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePlayers } from '@/context/PlayerContext';
import { usePerformancePredictions, usePlayerAnalytics } from '@/hooks/useAnalytics';
import { NeonCircularProgress } from '@/components/ui/NeonCircularProgress';
import { 
  TrendingUp, 
  TrendingDown,
  Star,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const NEON_COLORS = {
  blue: 'hsl(190, 100%, 50%)',
  purple: 'hsl(270, 91%, 65%)',
  pink: 'hsl(330, 90%, 60%)',
  cyan: 'hsl(67, 94%, 48%)',
  lime: 'hsl(150, 100%, 50%)',
};

const PredictionsPage = () => {
  const { players } = usePlayers();
  const { 
    allPredictions, 
    risingStar, 
    peakPerformers, 
    watchList, 
    seasonProjections 
  } = usePerformancePredictions();
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const { player, metrics, form, prediction, ranking, recentPerformance } = usePlayerAnalytics(selectedPlayerId);

  const selectedPrediction = useMemo(() => {
    return allPredictions.find(p => p.player.id === selectedPlayerId);
  }, [allPredictions, selectedPlayerId]);

  const getFormColor = (formStatus: string) => {
    switch (formStatus) {
      case 'Excellent': return 'text-lime-400 bg-lime-400/10';
      case 'Good': return 'text-cyan-400 bg-cyan-400/10';
      case 'Average': return 'text-yellow-400 bg-yellow-400/10';
      case 'Poor': return 'text-orange-400 bg-orange-400/10';
      case 'Critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Rising': return <ArrowUpRight className="h-4 w-4 text-lime-400" />;
      case 'Declining': return <ArrowDownRight className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getTrajectoryInfo = (trajectory: string) => {
    switch (trajectory) {
      case 'ascending': return { icon: '📈', label: 'Rising Star', color: 'text-lime-400' };
      case 'peak': return { icon: '⭐', label: 'At Peak', color: 'text-yellow-400' };
      case 'declining': return { icon: '📉', label: 'Declining', color: 'text-orange-400' };
      default: return { icon: '➡️', label: 'Stable', color: 'text-cyan-400' };
    }
  };

  // Chart data for runs prediction
  const runsPredictionData = useMemo(() => {
    if (!prediction || !recentPerformance) return [];
    return [
      ...recentPerformance.runs.map((runs, i) => ({
        match: `M${i + 1}`,
        runs,
        type: 'actual'
      })),
      {
        match: 'Next',
        runs: prediction.nextMatchRuns.expected,
        min: prediction.nextMatchRuns.min,
        max: prediction.nextMatchRuns.max,
        type: 'predicted'
      }
    ];
  }, [prediction, recentPerformance]);

  // Radar data for player skills
  const radarData = useMemo(() => {
    if (!metrics) return [];
    return [
      { attribute: 'Batting', value: metrics.battingRating },
      { attribute: 'Bowling', value: metrics.bowlingRating },
      { attribute: 'Fielding', value: metrics.fieldingRating },
      { attribute: 'Consistency', value: metrics.consistencyScore },
      { attribute: 'Impact', value: metrics.impactScore },
      { attribute: 'Form', value: metrics.formIndex },
    ];
  }, [metrics]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary neon-text">
              Performance Predictions
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered forecasts and form analysis
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {risingStar && (
            <div className="neon-card">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Rising Star</span>
              </div>
              <p className="font-display font-bold text-lg text-foreground">{risingStar.player.name}</p>
              <p className="text-xs text-yellow-400">{risingStar.player.role}</p>
            </div>
          )}
          <div className="neon-card">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-lime-400" />
              <span className="text-sm text-muted-foreground">In Form</span>
            </div>
            <p className="font-display font-bold text-2xl text-lime-400">
              {allPredictions.filter(p => p.form.currentForm === 'Excellent' || p.form.currentForm === 'Good').length}
            </p>
            <p className="text-xs text-muted-foreground">players</p>
          </div>
          <div className="neon-card">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <span className="text-sm text-muted-foreground">Watch List</span>
            </div>
            <p className="font-display font-bold text-2xl text-orange-400">{watchList.length}</p>
            <p className="text-xs text-muted-foreground">out of form</p>
          </div>
          <div className="neon-card">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-muted-foreground">Peak Performers</span>
            </div>
            <p className="font-display font-bold text-2xl text-purple-400">{peakPerformers.length}</p>
            <p className="text-xs text-muted-foreground">at their best</p>
          </div>
        </div>

        {/* Player Selection */}
        <div className="neon-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Individual Player Analysis
          </h3>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="neon-input max-w-md">
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              {players.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} - {p.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Player Prediction Details */}
        {player && metrics && form && prediction && (
          <>
            {/* Player Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Player Info */}
              <div className="neon-card">
                <div className="flex items-center gap-4 mb-4">
                  {player.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_hsl(190_100%_50%/0.3)] transition-all duration-300 hover:shadow-[0_0_25px_hsl(190_100%_50%/0.5)] hover:scale-105">
                      <img 
                        src={player.image} 
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center font-display font-bold text-2xl text-primary">
                      {player.avatar}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl font-bold">{player.name}</h3>
                    <p className="text-sm text-primary">{player.role}</p>
                    {ranking && (
                      <p className="text-xs text-muted-foreground">
                        Rank #{ranking.overall} of {ranking.total} (Top {ranking.percentile}%)
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Overall Rating</span>
                    <span className="font-bold text-primary">{metrics.overallRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Potential</span>
                    <span className="font-bold text-secondary">{metrics.potentialRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Form Status */}
              <div className="neon-card">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  Current Form
                </h4>
                <div className="text-center mb-4">
                  <div className={`inline-block px-4 py-2 rounded-lg font-display font-bold text-lg ${getFormColor(form.currentForm)}`}>
                    {form.currentForm}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trend</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(form.formTrend)}
                      <span className="text-sm">{form.formTrend}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last 5 Avg</span>
                    <span className="font-bold">{form.last5MatchesAvg.toFixed(1)} runs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <span className={`font-bold ${form.streak.type === 'positive' ? 'text-lime-400' : form.streak.type === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
                      {form.streak.count} {form.streak.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Career Trajectory */}
              <div className="neon-card">
                <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Career Trajectory
                </h4>
                <div className="text-center mb-4">
                  <span className="text-4xl">{getTrajectoryInfo(prediction.careerTrajectory).icon}</span>
                  <p className={`font-display font-bold text-lg ${getTrajectoryInfo(prediction.careerTrajectory).color}`}>
                    {getTrajectoryInfo(prediction.careerTrajectory).label}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Peak Age</span>
                    <span className="font-bold">{prediction.peakPerformanceAge} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Matches Played</span>
                    <span className="font-bold">{player.matchesPlayed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Match Prediction */}
            <div className="neon-card">
              <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Next Match Prediction
              </h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm text-muted-foreground mb-2">Expected Runs</h5>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-4xl font-bold text-primary">
                      {prediction.nextMatchRuns.expected}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Range: {prediction.nextMatchRuns.min} - {prediction.nextMatchRuns.max}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${Math.min(prediction.nextMatchRuns.expected, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <h5 className="text-sm text-muted-foreground mb-2">Expected Wickets</h5>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-4xl font-bold text-secondary">
                      {prediction.nextMatchWickets.expected}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Range: {prediction.nextMatchWickets.min} - {prediction.nextMatchWickets.max}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-background/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-accent"
                      style={{ width: `${Math.min(prediction.nextMatchWickets.expected * 20, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trend Chart */}
            <div className="neon-card">
              <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Recent Performance & Prediction
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={runsPredictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 30%, 15%)" />
                    <XAxis dataKey="match" tick={{ fill: 'hsl(200, 30%, 60%)' }} />
                    <YAxis tick={{ fill: 'hsl(200, 30%, 60%)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(230, 50%, 6%)', 
                        border: '1px solid hsl(230, 30%, 20%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="runs" 
                      stroke={NEON_COLORS.blue} 
                      fill={NEON_COLORS.blue}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills Radar */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Skills Profile
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(230, 30%, 20%)" />
                      <PolarAngleAxis 
                        dataKey="attribute" 
                        tick={{ fill: 'hsl(200, 30%, 60%)', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: 'hsl(200, 30%, 60%)', fontSize: 10 }}
                      />
                      <Radar
                        name="Skills"
                        dataKey="value"
                        stroke={NEON_COLORS.purple}
                        fill={NEON_COLORS.purple}
                        fillOpacity={0.4}
                      />
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

              {/* Season Projection */}
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Season Projection
                </h4>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Projected Runs</span>
                      <span className="font-display font-bold text-2xl text-primary">
                        {prediction.seasonProjection.totalRuns}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(prediction.seasonProjection.totalRuns / 10, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">Projected Wickets</span>
                      <span className="font-display font-bold text-2xl text-secondary">
                        {prediction.seasonProjection.totalWickets}
                      </span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary"
                        style={{ width: `${Math.min(prediction.seasonProjection.totalWickets * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Projected Average</span>
                      <span className="font-display font-bold text-2xl text-accent">
                        {prediction.seasonProjection.average}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* All Players Form Overview */}
        <div className="neon-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Squad Form Overview
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPredictions.map(({ player, form, metrics }) => (
              <div 
                key={player.id} 
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                  player.id === selectedPlayerId 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border/30 bg-background/50'
                }`}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {player.image ? (
                      <div className="w-8 h-8 rounded overflow-hidden border border-primary/30">
                        <img 
                          src={player.image} 
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-display font-bold text-xs text-primary">
                        {player.avatar}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-0.5 rounded ${getFormColor(form.currentForm)}`}>
                      {form.currentForm}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics.overallRating.toFixed(0)} pts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PredictionsPage;
