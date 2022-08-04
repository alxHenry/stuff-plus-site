import { roundToTwoDecimalPlaces } from "../fetching/streamFinderFetching";
import { StreamFinderBasePitcherData } from "../pages/streamFinder";
import {
  LEAGUE_AVG_FIP,
  LEAGUE_AVG_K_BB,
  LEAGUE_AVG_SIERA,
  stuffPlusColorizerConfig,
  wOBAColorizerConfig,
} from "./mlb";

const QUALITY_WEIGHT = 0.6;
const MATCHUP_WEIGHT = 0.4;

export interface StreamScoreData extends PitcherQualityScoreData, PitcherMatchupScoreData {}

export const generateStreamScore = ({
  fip,
  kBB,
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
    kBB,
    siera,
    pitchingPlus,
  });
  const { score: matchupScore, breakdown: matchupBreakdown } = generatePitcherMatchupScore({ wOBAAgainstHandSplit });

  return { score: qualityScore * QUALITY_WEIGHT + matchupScore * MATCHUP_WEIGHT, qualityBreakdown, matchupBreakdown };
};

export interface PitcherQualityScoreData {
  fip: number;
  kBB: number;
  pitchingPlus: number;
  siera: number;
}

// 50% Pitching+, 25% FIP, 25% SIERA = 100% quality
export const generatePitcherQualityScore = ({
  pitchingPlus,
  fip,
  kBB,
  siera,
}: PitcherQualityScoreData): { score: number; breakdown: PitcherQualityScoreData } => {
  const baseline = stuffPlusColorizerConfig.baseline;
  const pitchingPlusRating = (pitchingPlus / baseline) * 100;

  const fipRating = ((LEAGUE_AVG_FIP - fip + LEAGUE_AVG_FIP) / LEAGUE_AVG_FIP) * 100;
  const sieraRating = ((LEAGUE_AVG_SIERA - siera + LEAGUE_AVG_SIERA) / LEAGUE_AVG_SIERA) * 100;
  const kBBRating = (kBB / LEAGUE_AVG_K_BB) * 100;

  const pitcherQualityRating = pitchingPlusRating * 0.4 + fipRating * 0.15 + kBBRating * 0.45;

  return {
    score: pitcherQualityRating,
    breakdown: {
      fip: roundToTwoDecimalPlaces(fipRating),
      kBB: roundToTwoDecimalPlaces(kBBRating),
      siera: roundToTwoDecimalPlaces(sieraRating),
      pitchingPlus: roundToTwoDecimalPlaces(pitchingPlusRating),
    },
  };
};

export interface PitcherMatchupScoreData {
  wOBAAgainstHandSplit: number;
}
// 100% wOBA of opponent vs handedness of pitcher
export const generatePitcherMatchupScore = ({
  wOBAAgainstHandSplit,
}: PitcherMatchupScoreData): { score: number; breakdown: PitcherMatchupScoreData } => {
  const { baseline } = wOBAColorizerConfig;
  const pitcherMatchupRating = ((baseline - wOBAAgainstHandSplit + baseline) / baseline) * 100;

  return {
    score: pitcherMatchupRating,
    breakdown: {
      wOBAAgainstHandSplit: roundToTwoDecimalPlaces(pitcherMatchupRating),
    },
  };
};
