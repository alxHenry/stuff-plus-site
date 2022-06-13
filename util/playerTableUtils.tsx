import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PlayerColumn, PlayerData, SortDirection } from "../pages";

const MAX_RGB_VALUE = 255;

export interface ColorizerConfig {
  max: number;
  baseline: number;
  min: number;
}

export const pitchScoreToColorGradient = (score: number, config: ColorizerConfig): string => {
  const isPositive = score >= config.baseline;

  return isPositive ? positiveScoreToColor(score, config) : negativeScoreToColor(score, config);
};

const positiveScoreToColor = (score: number, config: ColorizerConfig): string => {
  const amountAboveBaseline = score - config.baseline;
  const positiveGradientRangeMultiple = config.max - config.baseline;

  const redAndBlueValue = MAX_RGB_VALUE - amountAboveBaseline * (MAX_RGB_VALUE / positiveGradientRangeMultiple);

  return `rgb(${redAndBlueValue}, ${MAX_RGB_VALUE}, ${redAndBlueValue})`;
};

const negativeScoreToColor = (score: number, config: ColorizerConfig): string => {
  const amountBelowBaseline = config.baseline - score;
  const negativeGradientRangeMultiple = config.baseline - config.min;

  const greenAndBlueValue = MAX_RGB_VALUE - amountBelowBaseline * (MAX_RGB_VALUE / negativeGradientRangeMultiple);

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

export const getSortIcon = (
  column: PlayerColumn,
  currentSortedColumn: PlayerColumn | undefined,
  sortDirection: SortDirection | undefined
) => {
  if (currentSortedColumn !== column) {
    return null;
  }

  return sortDirection === "ascending" ? <ChevronUpIcon /> : <ChevronDownIcon />;
};
