import { StreamFinderBasePitcherData } from "../pages/streamFinder";
import { stuffPlusColorizerConfig, wOBAColorizerConfig } from "./mlb";

const QUALITY_WEIGHT = 0.7;
const MATCHUP_WEIGHT = 0.3;

export const generateStreamScore = (pitcherData: StreamFinderBasePitcherData) => {
  const qualityScore = generatePitcherQualityScore(pitcherData);
  const matchupScore = generatePitcherMatchupScore(pitcherData);

  return qualityScore + matchupScore;
};

const generatePitcherQualityScore = (pitcherData: StreamFinderBasePitcherData) => {
  const baseline = stuffPlusColorizerConfig.baseline;
  const pitcherQualityRating = (pitcherData.pitchingPlus / baseline) * 100;

  return pitcherQualityRating * QUALITY_WEIGHT;
};

const generatePitcherMatchupScore = (pitcherData: StreamFinderBasePitcherData) => {
  const { baseline } = wOBAColorizerConfig;
  const pitcherMatchupRating = ((baseline - pitcherData.wOBAAgainstHandSplit + baseline) / baseline) * 100;

  return pitcherMatchupRating * MATCHUP_WEIGHT;
};
