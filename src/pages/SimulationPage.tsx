import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePlayers } from '@/context/PlayerContext';
import { useTeamStats, usePerformancePredictions } from '@/hooks/useAnalytics';
import { NeonCircularProgress } from '@/components/ui/NeonCircularProgress';
import { 
  Swords, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  Zap,
  Shield,
  Activity,
  Star,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const NEON_COLORS = {
  blue: 'hsl(190, 100%, 50%)',
  purple: 'hsl(270, 91%, 65%)',
  pink: 'hsl(330, 90%, 60%)',
  cyan: 'hsl(67, 94%, 48%)',
  lime: 'hsl(150, 100%, 50%)',
  red: 'hsl(0, 84%, 60%)',
  orange: 'hsl(30, 100%, 50%)',
};

const SimulationPage = () => {
  const { simulateMatch, teamAnalytics } = usePlayers();
  const { aggregateStats, squadComposition, topBatsmen, topBowlers } = useTeamStats();
  const { seasonProjections, watchList, peakPerformers } = usePerformancePredictions();
  
  const [opponentStrength, setOpponentStrength] = useState([75]);
  const [matchResult, setMatchResult] = useState(simulateMatch(75));

  const handleSimulate = () => {
    const result = simulateMatch(opponentStrength[0]);
    setMatchResult(result);
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 90) return 'World Class';
    if (strength >= 80) return 'Strong';
    if (strength >= 70) return 'Competitive';
    if (strength >= 60) return 'Average';
    if (strength >= 50) return 'Weak';
    return 'Very Weak';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-lime-400';
    if (probability >= 50) return 'text-cyan-400';
    if (probability >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10">
            <Swords className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-accent neon-text-pink">
              Match Simulation
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered match predictions and analysis
            </p>
          </div>
        </div>

        {/* Team Strength Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="neon-card text-center">
            <Gauge className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Team Strength</p>
            <p className="font-display font-bold text-2xl text-primary">
              {teamAnalytics?.teamStrength.toFixed(0) || 0}
            </p>
          </div>
          <div className="neon-card text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="text-sm text-muted-foreground">Batting Depth</p>
            <p className="font-display font-bold text-2xl text-secondary">
              {teamAnalytics?.battingDepth.toFixed(0) || 0}
            </p>
          </div>
          <div className="neon-card text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground">Bowling Power</p>
            <p className="font-display font-bold text-2xl text-accent">
              {teamAnalytics?.bowlingStrength.toFixed(0) || 0}
            </p>
          </div>
          <div className="neon-card text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
            <p className="text-sm text-muted-foreground">Balance Score</p>
            <p className="font-display font-bold text-2xl text-cyan-400">
              {teamAnalytics?.balanceScore.toFixed(0) || 0}
            </p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="neon-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Opponent Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Opponent Strength</span>
                <span className="text-sm font-bold text-primary">
                  {opponentStrength[0]} - {getStrengthLabel(opponentStrength[0])}
                </span>
              </div>
              <Slider
                value={opponentStrength}
                onValueChange={setOpponentStrength}
                max={100}
                min={30}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Weak (30)</span>
                <span>Average (65)</span>
                <span>World Class (100)</span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              className="neon-button w-full rounded-lg flex items-center justify-center gap-2 py-3"
            >
              <Swords className="h-5 w-5" />
              Run Simulation
            </button>
          </div>
        </div>

        {/* Simulation Results */}
        {matchResult && (
          <>
            {/* Win Probability */}
            <div className="neon-card bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Match Prediction
                  </h3>
                  <p className="text-muted-foreground">
                    Against a {getStrengthLabel(opponentStrength[0]).toLowerCase()} opponent
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <NeonCircularProgress 
                      value={matchResult.winProbability} 
                      size={120}
                      strokeWidth={10}
                      color="cyan"
                    />
                    <p className={`font-display text-3xl font-bold mt-2 ${getProbabilityColor(matchResult.winProbability)}`}>
                      {matchResult.winProbability}%
                    </p>
                    <p className="text-sm text-muted-foreground">Win Probability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Performance */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Expected Runs
                </h4>
                <p className="font-display text-4xl font-bold text-primary mb-2">
                  {matchResult.expectedRuns}
                </p>
                <p className="text-sm text-muted-foreground">
                  Projected team total based on current form
                </p>
              </div>
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  Expected Wickets
                </h4>
                <p className="font-display text-4xl font-bold text-secondary mb-2">
                  {matchResult.expectedWickets}
                </p>
                <p className="text-sm text-muted-foreground">
                  Projected wickets by bowling attack
                </p>
              </div>
            </div>

            {/* Key Players */}
            <div className="neon-card">
              <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Key Players for This Match
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {matchResult.keyPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 flex items-center justify-center font-display font-bold text-yellow-400">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors & Recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Risk Factors */}
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Risk Factors
                </h4>
                <div className="space-y-2">
                  {matchResult.riskFactors.length > 0 ? (
                    matchResult.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-orange-400/10">
                        <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{risk}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded bg-lime-400/10">
                      <CheckCircle className="h-4 w-4 text-lime-400" />
                      <span className="text-sm text-foreground">No significant risks identified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="neon-card">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-lime-400" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {matchResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded bg-primary/10">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Season Projections */}
        <div className="neon-card">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Season Projections
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-3xl font-display font-bold text-primary">
                {seasonProjections.totalRuns.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Projected Total Runs</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-3xl font-display font-bold text-secondary">
                {seasonProjections.totalWickets}
              </p>
              <p className="text-sm text-muted-foreground">Projected Wickets</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-lg font-display font-bold text-accent">
                {seasonProjections.topRunScorer?.name || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Top Run Scorer</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <p className="text-lg font-display font-bold text-cyan-400">
                {seasonProjections.topWicketTaker?.name || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Top Wicket Taker</p>
            </div>
          </div>
        </div>

        {/* Team Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="neon-card">
            <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-lime-400" />
              Team Strengths
            </h4>
            <div className="space-y-2">
              {teamAnalytics?.strengths.length ? (
                teamAnalytics.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-lime-400/10">
                    <CheckCircle className="h-4 w-4 text-lime-400" />
                    <span className="text-sm text-foreground">{strength}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No specific strengths identified</p>
              )}
            </div>
          </div>
          <div className="neon-card">
            <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Team Weaknesses
            </h4>
            <div className="space-y-2">
              {teamAnalytics?.weaknesses.length ? (
                teamAnalytics.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-orange-400/10">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-foreground">{weakness}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No significant weaknesses identified</p>
              )}
            </div>
          </div>
        </div>

        {/* Watch List */}
        {watchList.length > 0 && (
          <div className="neon-card border-orange-400/30">
            <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Players to Watch (Out of Form)
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              {watchList.map(player => (
                <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-orange-400/10">
                  <div className="w-10 h-10 rounded-lg bg-orange-400/20 border border-orange-400/30 flex items-center justify-center font-display font-bold text-sm text-orange-400">
                    {player.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{player.name}</p>
                    <p className="text-xs text-orange-400">{player.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SimulationPage;
