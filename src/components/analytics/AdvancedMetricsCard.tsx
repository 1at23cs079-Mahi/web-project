import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Player } from '@/data/players';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Activity, 
  Crosshair, 
  Shield,
  Gauge,
  Flame,
  Award
} from 'lucide-react';

interface AdvancedMetricsCardProps {
  player: Player;
}

// Calculate advanced batting metrics
const calculateBattingMetrics = (player: Player) => {
  const batting = player.advancedBatting;
  if (!batting || batting.ballsFaced === 0) {
    return null;
  }

  // Impact per Ball = Total Runs / Balls Faced (higher is better, shows run scoring efficiency)
  const impactPerBall = player.totalRuns / batting.ballsFaced;

  // Boundary Dependency % = (Runs from boundaries / Total Runs) * 100
  const boundaryRuns = (player.fours * 4) + (player.sixes * 6);
  const boundaryDependency = (boundaryRuns / player.totalRuns) * 100;

  // Pressure Strike Rate = (Runs in Pressure / Balls in Pressure) * 100
  const pressureStrikeRate = batting.ballsInPressure > 0 
    ? (batting.runsInPressure / batting.ballsInPressure) * 100 
    : 0;

  // Dot Ball % = (Dot Balls / Total Balls) * 100 (lower is better)
  const dotBallPercentage = (batting.dotBallsPlayed / batting.ballsFaced) * 100;

  // Boundary % = (Boundary Balls / Total Balls) * 100
  const boundaryPercentage = (batting.boundaryBalls / batting.ballsFaced) * 100;

  // Phase-wise distribution
  const totalPhaseRuns = batting.powerplayRuns + batting.middleOversRuns + batting.deathOversRuns;
  const powerplayShare = totalPhaseRuns > 0 ? (batting.powerplayRuns / totalPhaseRuns) * 100 : 0;
  const middleOversShare = totalPhaseRuns > 0 ? (batting.middleOversRuns / totalPhaseRuns) * 100 : 0;
  const deathOversShare = totalPhaseRuns > 0 ? (batting.deathOversRuns / totalPhaseRuns) * 100 : 0;

  return {
    impactPerBall: impactPerBall.toFixed(2),
    boundaryDependency: boundaryDependency.toFixed(1),
    pressureStrikeRate: pressureStrikeRate.toFixed(1),
    dotBallPercentage: dotBallPercentage.toFixed(1),
    boundaryPercentage: boundaryPercentage.toFixed(1),
    powerplayShare: powerplayShare.toFixed(1),
    middleOversShare: middleOversShare.toFixed(1),
    deathOversShare: deathOversShare.toFixed(1),
  };
};

// Calculate advanced bowling metrics
const calculateBowlingMetrics = (player: Player) => {
  const bowling = player.advancedBowling;
  if (!bowling || bowling.ballsBowled === 0) {
    return null;
  }

  // Death Over Economy = (Death Overs Runs / Death Overs Bowled) * 6
  const deathOverEconomy = bowling.deathOversBowled > 0 
    ? (bowling.deathOversRuns / bowling.deathOversBowled) * 6 
    : 0;

  // Wicket Impact Score = (Match Turning Wickets / Total Wickets) * 100 + (Wickets / Matches) * 10
  const wicketImpactScore = player.wickets > 0 
    ? ((bowling.matchTurningWickets / player.wickets) * 100) + (player.wickets / player.matchesPlayed) * 10
    : 0;

  // Match Turning Overs = Match Turning Wickets per match
  const matchTurningOversRate = bowling.matchTurningWickets / player.matchesPlayed;

  // Dot Ball % = (Dot Balls Bowled / Total Balls) * 100 (higher is better for bowlers)
  const dotBallPercentage = (bowling.dotBallsBowled / bowling.ballsBowled) * 100;

  // Boundary Concession Rate per over
  const boundaryRate = (bowling.boundariesConceded / (bowling.ballsBowled / 6));

  // Wickets per phase
  const totalWickets = bowling.powerplayWickets + bowling.middleOversWickets + bowling.deathOversWickets;
  const powerplayWicketsShare = totalWickets > 0 ? (bowling.powerplayWickets / totalWickets) * 100 : 0;
  const middleOversWicketsShare = totalWickets > 0 ? (bowling.middleOversWickets / totalWickets) * 100 : 0;
  const deathOversWicketsShare = totalWickets > 0 ? (bowling.deathOversWickets / totalWickets) * 100 : 0;

  return {
    deathOverEconomy: deathOverEconomy.toFixed(2),
    wicketImpactScore: wicketImpactScore.toFixed(1),
    matchTurningOversRate: matchTurningOversRate.toFixed(2),
    dotBallPercentage: dotBallPercentage.toFixed(1),
    boundaryRate: boundaryRate.toFixed(2),
    powerplayWicketsShare: powerplayWicketsShare.toFixed(1),
    middleOversWicketsShare: middleOversWicketsShare.toFixed(1),
    deathOversWicketsShare: deathOversWicketsShare.toFixed(1),
  };
};

// Calculate advanced fielding metrics
const calculateFieldingMetrics = (player: Player) => {
  const fielding = player.advancedFielding;
  if (!fielding || fielding.catchAttempts === 0) {
    return null;
  }

  // Catch Efficiency = (Catches Taken / Catch Attempts) * 100
  const catchEfficiency = (fielding.catchesTaken / fielding.catchAttempts) * 100;

  // Direct Hit Success = (Direct Hits / Run Out Attempts) * 100
  const directHitSuccess = fielding.runOutAttempts > 0 
    ? (fielding.directHits / fielding.runOutAttempts) * 100 
    : 0;

  // Run-Saving Index = Runs Saved / Ground Fielding Actions
  const runSavingIndex = fielding.groundFieldingActions > 0 
    ? fielding.runsSaved / fielding.groundFieldingActions 
    : 0;

  // Misfield Rate = (Misfields / Ground Fielding Actions) * 100
  const misfieldRate = fielding.groundFieldingActions > 0 
    ? (fielding.misfields / fielding.groundFieldingActions) * 100 
    : 0;

  // Fielding Impact Score (composite)
  const fieldingImpactScore = 
    (catchEfficiency * 0.4) + 
    (directHitSuccess * 0.3) + 
    ((100 - misfieldRate) * 0.2) +
    (runSavingIndex * 10 * 0.1);

  return {
    catchEfficiency: catchEfficiency.toFixed(1),
    directHitSuccess: directHitSuccess.toFixed(1),
    runSavingIndex: runSavingIndex.toFixed(3),
    misfieldRate: misfieldRate.toFixed(1),
    fieldingImpactScore: Math.min(100, fieldingImpactScore).toFixed(1),
    totalCatches: fielding.catchesTaken,
    directHits: fielding.directHits,
    runsSaved: fielding.runsSaved,
  };
};

const MetricItem = ({ 
  icon: Icon, 
  label, 
  value, 
  unit = '', 
  description,
  color = 'cyan',
  showProgress = false,
  progressValue = 0,
}: { 
  icon: React.ElementType;
  label: string; 
  value: string | number; 
  unit?: string;
  description?: string;
  color?: 'cyan' | 'purple' | 'pink' | 'blue' | 'green' | 'yellow' | 'red';
  showProgress?: boolean;
  progressValue?: number;
}) => {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400/60 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_hsl(185_94%_48%/0.3)]',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:border-purple-400/60 hover:bg-purple-500/20 hover:shadow-[0_0_20px_hsl(270_91%_65%/0.3)]',
    pink: 'text-pink-400 border-pink-500/30 bg-pink-500/10 hover:border-pink-400/60 hover:bg-pink-500/20 hover:shadow-[0_0_20px_hsl(330_90%_60%/0.3)]',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:border-blue-400/60 hover:bg-blue-500/20 hover:shadow-[0_0_20px_hsl(210_100%_50%/0.3)]',
    green: 'text-green-400 border-green-500/30 bg-green-500/10 hover:border-green-400/60 hover:bg-green-500/20 hover:shadow-[0_0_20px_hsl(150_100%_50%/0.3)]',
    yellow: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400/60 hover:bg-yellow-500/20 hover:shadow-[0_0_20px_hsl(45_100%_50%/0.3)]',
    red: 'text-red-400 border-red-500/30 bg-red-500/10 hover:border-red-400/60 hover:bg-red-500/20 hover:shadow-[0_0_20px_hsl(0_100%_50%/0.3)]',
  };

  const iconColor = {
    cyan: 'text-cyan-400 group-hover:drop-shadow-[0_0_8px_hsl(185_94%_48%/0.8)]',
    purple: 'text-purple-400 group-hover:drop-shadow-[0_0_8px_hsl(270_91%_65%/0.8)]',
    pink: 'text-pink-400 group-hover:drop-shadow-[0_0_8px_hsl(330_90%_60%/0.8)]',
    blue: 'text-blue-400 group-hover:drop-shadow-[0_0_8px_hsl(210_100%_50%/0.8)]',
    green: 'text-green-400 group-hover:drop-shadow-[0_0_8px_hsl(150_100%_50%/0.8)]',
    yellow: 'text-yellow-400 group-hover:drop-shadow-[0_0_8px_hsl(45_100%_50%/0.8)]',
    red: 'text-red-400 group-hover:drop-shadow-[0_0_8px_hsl(0_100%_50%/0.8)]',
  };

  return (
    <div className={`group p-4 rounded-lg border ${colorClasses[color]} transition-all duration-300 cursor-pointer hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 transition-all duration-300 ${iconColor[color]}`} />
        <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors">{description}</p>
      )}
      {showProgress && (
        <Progress value={progressValue} className="mt-2 h-1.5" />
      )}
    </div>
  );
};

const PhaseDistribution = ({ 
  label,
  powerplay, 
  middleOvers, 
  deathOvers 
}: { 
  label: string;
  powerplay: string; 
  middleOvers: string; 
  deathOvers: string;
}) => (
  <div className="group p-4 rounded-lg border border-gray-700 bg-gray-800/50 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/70 hover:shadow-[0_0_25px_hsl(230_50%_30%/0.3)]">
    <h4 className="text-sm font-medium text-gray-400 mb-3 group-hover:text-gray-300 transition-colors">{label}</h4>
    <div className="space-y-3">
      <div className="flex items-center gap-3 group/bar">
        <span className="text-xs text-gray-500 w-20 group-hover/bar:text-cyan-400 transition-colors">Powerplay</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-2 rounded-full transition-all duration-500 group-hover/bar:shadow-[0_0_10px_hsl(185_94%_48%/0.5)]"
            style={{ width: `${Math.min(100, parseFloat(powerplay))}%` }}
          />
        </div>
        <span className="text-xs font-medium text-cyan-400 w-12 text-right group-hover/bar:drop-shadow-[0_0_5px_hsl(185_94%_48%/0.8)]">{powerplay}%</span>
      </div>
      <div className="flex items-center gap-3 group/bar">
        <span className="text-xs text-gray-500 w-20 group-hover/bar:text-purple-400 transition-colors">Middle</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-500 group-hover/bar:shadow-[0_0_10px_hsl(270_91%_65%/0.5)]"
            style={{ width: `${Math.min(100, parseFloat(middleOvers))}%` }}
          />
        </div>
        <span className="text-xs font-medium text-purple-400 w-12 text-right group-hover/bar:drop-shadow-[0_0_5px_hsl(270_91%_65%/0.8)]">{middleOvers}%</span>
      </div>
      <div className="flex items-center gap-3 group/bar">
        <span className="text-xs text-gray-500 w-20 group-hover/bar:text-pink-400 transition-colors">Death</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-pink-600 to-pink-400 h-2 rounded-full transition-all duration-500 group-hover/bar:shadow-[0_0_10px_hsl(330_90%_60%/0.5)]"
            style={{ width: `${Math.min(100, parseFloat(deathOvers))}%` }}
          />
        </div>
        <span className="text-xs font-medium text-pink-400 w-12 text-right group-hover/bar:drop-shadow-[0_0_5px_hsl(330_90%_60%/0.8)]">{deathOvers}%</span>
      </div>
    </div>
  </div>
);

const AdvancedMetricsCard = ({ player }: AdvancedMetricsCardProps) => {
  const battingMetrics = calculateBattingMetrics(player);
  const bowlingMetrics = calculateBowlingMetrics(player);
  const fieldingMetrics = calculateFieldingMetrics(player);

  const hasAdvancedMetrics = battingMetrics || bowlingMetrics || fieldingMetrics;

  if (!hasAdvancedMetrics) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-gray-500">No advanced metrics available for this player</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700 overflow-hidden">
      <CardHeader className="border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              Pro-Level Analytics
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Advanced performance metrics for {player.name}
            </CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className="border-cyan-500/50 text-cyan-400"
          >
            {player.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="w-full bg-gray-800/50 rounded-none border-b border-gray-700/50 p-0 h-auto">
            <TabsTrigger 
              value="batting" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-b-2 data-[state=active]:border-cyan-500"
            >
              Batting
            </TabsTrigger>
            <TabsTrigger 
              value="bowling" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              Bowling
            </TabsTrigger>
            <TabsTrigger 
              value="fielding" 
              className="flex-1 py-3 rounded-none data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border-b-2 data-[state=active]:border-pink-500"
            >
              Fielding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batting" className="p-4 space-y-4">
            {battingMetrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricItem
                    icon={Zap}
                    label="Impact per Ball"
                    value={battingMetrics.impactPerBall}
                    description="Runs scored per ball faced"
                    color="cyan"
                    showProgress
                    progressValue={parseFloat(battingMetrics.impactPerBall) * 50}
                  />
                  <MetricItem
                    icon={Target}
                    label="Boundary Dependency"
                    value={battingMetrics.boundaryDependency}
                    unit="%"
                    description="% of runs from boundaries"
                    color="purple"
                    showProgress
                    progressValue={parseFloat(battingMetrics.boundaryDependency)}
                  />
                  <MetricItem
                    icon={Flame}
                    label="Pressure Strike Rate"
                    value={battingMetrics.pressureStrikeRate}
                    description="SR in pressure situations"
                    color="pink"
                    showProgress
                    progressValue={parseFloat(battingMetrics.pressureStrikeRate) / 2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricItem
                    icon={Activity}
                    label="Dot Ball %"
                    value={battingMetrics.dotBallPercentage}
                    unit="%"
                    description="Lower is better"
                    color="yellow"
                    showProgress
                    progressValue={100 - parseFloat(battingMetrics.dotBallPercentage)}
                  />
                  <MetricItem
                    icon={Crosshair}
                    label="Boundary %"
                    value={battingMetrics.boundaryPercentage}
                    unit="%"
                    description="% of balls hit for boundary"
                    color="green"
                    showProgress
                    progressValue={parseFloat(battingMetrics.boundaryPercentage) * 2.5}
                  />
                </div>

                <PhaseDistribution
                  label="Runs Distribution by Phase"
                  powerplay={battingMetrics.powerplayShare}
                  middleOvers={battingMetrics.middleOversShare}
                  deathOvers={battingMetrics.deathOversShare}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Limited batting data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bowling" className="p-4 space-y-4">
            {bowlingMetrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricItem
                    icon={Gauge}
                    label="Death Over Economy"
                    value={bowlingMetrics.deathOverEconomy}
                    description="Economy in death overs"
                    color="purple"
                    showProgress
                    progressValue={Math.max(0, 100 - parseFloat(bowlingMetrics.deathOverEconomy) * 8)}
                  />
                  <MetricItem
                    icon={Award}
                    label="Wicket Impact Score"
                    value={bowlingMetrics.wicketImpactScore}
                    description="Quality of wickets taken"
                    color="cyan"
                    showProgress
                    progressValue={parseFloat(bowlingMetrics.wicketImpactScore)}
                  />
                  <MetricItem
                    icon={TrendingUp}
                    label="Match Turning Rate"
                    value={bowlingMetrics.matchTurningOversRate}
                    unit="/match"
                    description="Key wickets per match"
                    color="pink"
                    showProgress
                    progressValue={parseFloat(bowlingMetrics.matchTurningOversRate) * 100}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricItem
                    icon={Target}
                    label="Dot Ball %"
                    value={bowlingMetrics.dotBallPercentage}
                    unit="%"
                    description="Higher is better"
                    color="green"
                    showProgress
                    progressValue={parseFloat(bowlingMetrics.dotBallPercentage)}
                  />
                  <MetricItem
                    icon={Crosshair}
                    label="Boundaries/Over"
                    value={bowlingMetrics.boundaryRate}
                    description="Boundaries conceded per over"
                    color="red"
                    showProgress
                    progressValue={Math.max(0, 100 - parseFloat(bowlingMetrics.boundaryRate) * 20)}
                  />
                </div>

                <PhaseDistribution
                  label="Wickets Distribution by Phase"
                  powerplay={bowlingMetrics.powerplayWicketsShare}
                  middleOvers={bowlingMetrics.middleOversWicketsShare}
                  deathOvers={bowlingMetrics.deathOversWicketsShare}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Limited bowling data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fielding" className="p-4 space-y-4">
            {fieldingMetrics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricItem
                    icon={Target}
                    label="Catch Efficiency"
                    value={fieldingMetrics.catchEfficiency}
                    unit="%"
                    description={`${fieldingMetrics.totalCatches} catches taken`}
                    color="pink"
                    showProgress
                    progressValue={parseFloat(fieldingMetrics.catchEfficiency)}
                  />
                  <MetricItem
                    icon={Crosshair}
                    label="Direct Hit Success"
                    value={fieldingMetrics.directHitSuccess}
                    unit="%"
                    description={`${fieldingMetrics.directHits} direct hits`}
                    color="cyan"
                    showProgress
                    progressValue={parseFloat(fieldingMetrics.directHitSuccess)}
                  />
                  <MetricItem
                    icon={Shield}
                    label="Run-Saving Index"
                    value={fieldingMetrics.runSavingIndex}
                    description={`${fieldingMetrics.runsSaved} runs saved`}
                    color="purple"
                    showProgress
                    progressValue={parseFloat(fieldingMetrics.runSavingIndex) * 100}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricItem
                    icon={Activity}
                    label="Misfield Rate"
                    value={fieldingMetrics.misfieldRate}
                    unit="%"
                    description="Lower is better"
                    color="yellow"
                    showProgress
                    progressValue={100 - parseFloat(fieldingMetrics.misfieldRate) * 10}
                  />
                  <MetricItem
                    icon={Award}
                    label="Fielding Impact Score"
                    value={fieldingMetrics.fieldingImpactScore}
                    unit="/100"
                    description="Overall fielding quality"
                    color="green"
                    showProgress
                    progressValue={parseFloat(fieldingMetrics.fieldingImpactScore)}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Limited fielding data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedMetricsCard;
