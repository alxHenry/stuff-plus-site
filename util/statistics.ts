import { roundToNDecimalPlaces } from "../fetching/streamFinderFetching";
import { LEAGUE_AVG_FIP, LEAGUE_AVG_SIERA, stuffPlusColorizerConfig, wOBAColorizerConfig } from "./mlb";

const QUALITY_WEIGHT = 0.6;
const MATCHUP_WEIGHT = 0.4;

export interface StreamScoreData extends PitcherQualityScoreInput, PitcherMatchupScoreInput {}

export const generateStreamScore = ({
  fip,
  siera,
  pitchingPlus,
  wOBAAgainstHandSplit,
}: StreamScoreData): {
  score: number;
  qualityBreakdown: PitcherQualityScoreData;
  matchupBreakdown: PitcherMatchupScoreData;
} => {
  const { score: qualityScore, breakdown: qualityBreakdown } = generatePitcherQualityScore({
    fip,
    siera,
    pitchingPlus,
  });
  const { score: matchupScore, breakdown: matchupBreakdown } = generatePitcherMatchupScore({ wOBAAgainstHandSplit });

  return { score: qualityScore * QUALITY_WEIGHT + matchupScore * MATCHUP_WEIGHT, qualityBreakdown, matchupBreakdown };
};

export interface PitcherQualityScoreInput {
  fip: number;
  pitchingPlus: number;
  siera: number;
}
export interface PitcherQualityScoreData {
  fip: { value: number; score: number };
  pitchingPlus: { score: number };
  siera: { value: number; score: number };
}

// 50% Pitching+, 20% FIP, 30% SIERA = 100% quality
export const generatePitcherQualityScore = ({
  pitchingPlus,
  fip,
  siera,
}: PitcherQualityScoreInput): { score: number; breakdown: PitcherQualityScoreData } => {
  const baseline = stuffPlusColorizerConfig.baseline;
  const pitchingPlusRating = (pitchingPlus / baseline) * 100;

  const fipRating = ((LEAGUE_AVG_FIP - fip + LEAGUE_AVG_FIP) / LEAGUE_AVG_FIP) * 100;
  const sieraRating = ((LEAGUE_AVG_SIERA - siera + LEAGUE_AVG_SIERA) / LEAGUE_AVG_SIERA) * 100;

  const pitcherQualityRating = pitchingPlusRating * 0.5 + fipRating * 0.2 + sieraRating * 0.3;

  return {
    score: pitcherQualityRating,
    breakdown: {
      fip: { value: roundToNDecimalPlaces(fip, 2), score: roundToNDecimalPlaces(fipRating, 2) },
      siera: { value: roundToNDecimalPlaces(siera, 2), score: roundToNDecimalPlaces(sieraRating, 2) },
      pitchingPlus: { score: roundToNDecimalPlaces(pitchingPlusRating, 1) },
    },
  };
};

export interface PitcherMatchupScoreInput {
  readonly wOBAAgainstHandSplit: number;
}
export interface PitcherMatchupScoreData {
  readonly wOBAAgainstHandSplit: { value: number; score: number };
}
// 100% wOBA of opponent vs handedness of pitcher
export const generatePitcherMatchupScore = ({
  wOBAAgainstHandSplit,
}: PitcherMatchupScoreInput): { score: number; breakdown: PitcherMatchupScoreData } => {
  const { baseline } = wOBAColorizerConfig;
  const pitcherMatchupRating = ((baseline - wOBAAgainstHandSplit + baseline) / baseline) * 100;

  return {
    score: pitcherMatchupRating,
    breakdown: {
      wOBAAgainstHandSplit: {
        value: roundToNDecimalPlaces(wOBAAgainstHandSplit, 3),
        score: roundToNDecimalPlaces(pitcherMatchupRating, 2),
      },
    },
  };
};
