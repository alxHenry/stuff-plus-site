import { PlayerColumn, PlayerData } from "../pages";

const MAX_RGB_VALUE = 255;
const MAX_GRADIENT_SCORE_VALUE = 150;
const MIN_GRADIENT_SCORE_VALUE = 50;
const BASELINE = 100;

const POSITIVE_GRADIENT_RANGE_MULTIPLE = MAX_GRADIENT_SCORE_VALUE - BASELINE;
const NEGATIVE_GRADIENT_RANGE_MULTIPLE = BASELINE - MIN_GRADIENT_SCORE_VALUE;

export const pitchScoreToColorGradient = (score: number): string => {
  const isPositive = score >= BASELINE;

  return isPositive ? positiveScoreToColor(score) : negativeScoreToColor(score);
};

const positiveScoreToColor = (score: number): string => {
  const amountAboveBaseline = score - BASELINE;
  const redAndBlueValue = MAX_RGB_VALUE - amountAboveBaseline * (MAX_RGB_VALUE / POSITIVE_GRADIENT_RANGE_MULTIPLE);

  return `rgb(${redAndBlueValue}, ${MAX_RGB_VALUE}, ${redAndBlueValue})`;
};

const negativeScoreToColor = (score: number): string => {
  const amountBelowBaseline = BASELINE - score;
  const greenAndBlueValue = MAX_RGB_VALUE - amountBelowBaseline * (MAX_RGB_VALUE / NEGATIVE_GRADIENT_RANGE_MULTIPLE);

  return `rgb(${MAX_RGB_VALUE}, ${greenAndBlueValue}, ${greenAndBlueValue})`;
};

const nameComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerA.name.localeCompare(playerB.name);
};
const pitchCountComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerB.pitchCount - playerA.pitchCount;
};
const stuffPlusComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerB.stuffPlus - playerA.stuffPlus;
};
const locationPlusComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerB.locationPlus - playerA.locationPlus;
};
const pitchingPlusComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerB.pitchingPlus - playerA.pitchingPlus;
};

export type PlayerComparator = (playerA: PlayerData, playerB: PlayerData) => number;

export const columnToSortComparatorMap: Record<PlayerColumn, PlayerComparator> = {
  name: nameComparator,
  pitchCount: pitchCountComparator,
  stuffPlus: stuffPlusComparator,
  locationPlus: locationPlusComparator,
  pitchingPlus: pitchingPlusComparator,
};
