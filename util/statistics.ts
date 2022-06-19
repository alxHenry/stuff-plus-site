import { StreamFinderBasePitcherData } from "../pages/streamFinder";
import { LEAGUE_AVG_FIP, LEAGUE_AVG_SIERA, stuffPlusColorizerConfig, wOBAColorizerConfig } from "./mlb";

const QUALITY_WEIGHT = 0.6;
const MATCHUP_WEIGHT = 0.4;

export const generateStreamScore = (pitcherData: StreamFinderBasePitcherData) => {
  const qualityScore = generatePitcherQualityScore(pitcherData);
  const matchupScore = generatePitcherMatchupScore(pitcherData);

  return qualityScore * QUALITY_WEIGHT + matchupScore * MATCHUP_WEIGHT;
};

export interface PitcherQualityScoreData {
  fip: number;
  pitchingPlus: number;
  siera: number;
}

// 50% Pitching+, 25% FIP, 25% SIERA = 100% quality
export const generatePitcherQualityScore = ({ pitchingPlus, fip, siera }: PitcherQualityScoreData) => {
  const baseline = stuffPlusColorizerConfig.baseline;
  const pitchingPlusRating = (pitchingPlus / baseline) * 100;

  const fipRating = ((LEAGUE_AVG_FIP - fip + LEAGUE_AVG_FIP) / LEAGUE_AVG_FIP) * 100;
  const sieraRating = ((LEAGUE_AVG_SIERA - siera + LEAGUE_AVG_SIERA) / LEAGUE_AVG_SIERA) * 100;

  const pitcherQualityRating = pitchingPlusRating * 0.5 + fipRating * 0.25 + sieraRating * 0.25;

  return pitcherQualityRating;
};

const generatePitcherMatchupScore = (pitcherData: StreamFinderBasePitcherData) => {
  const { baseline } = wOBAColorizerConfig;
  const pitcherMatchupRating = ((baseline - pitcherData.wOBAAgainstHandSplit + baseline) / baseline) * 100;

  return pitcherMatchupRating;
};
