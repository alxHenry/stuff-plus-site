import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { PlayerColumn, PlayerData, SortDirection } from "../pages";

const MAX_RGB_VALUE = 255;

export interface ColorizerConfig {
  max: number;
  baseline: number;
  min: number;
  higherIsBetter?: boolean;
}

export const pitchScoreToColorGradient = (score: number, config: ColorizerConfig): string => {
  const isPositive = score >= config.baseline;

  return isPositive ? positiveScoreToColor(score, config) : negativeScoreToColor(score, config);
};

const positiveScoreToColor = (score: number, { baseline, max, higherIsBetter = true }: ColorizerConfig): string => {
  const amountAboveBaseline = score - baseline;
  const positiveGradientRangeMultiple = max - baseline;

  const nonPrimaryColorValues = MAX_RGB_VALUE - amountAboveBaseline * (MAX_RGB_VALUE / positiveGradientRangeMultiple);

  return higherIsBetter
    ? `rgb(${nonPrimaryColorValues}, ${MAX_RGB_VALUE}, ${nonPrimaryColorValues})`
    : `rgb(${MAX_RGB_VALUE}, ${nonPrimaryColorValues}, ${nonPrimaryColorValues})`;
};

const negativeScoreToColor = (score: number, { baseline, min, higherIsBetter = true }: ColorizerConfig): string => {
  const amountBelowBaseline = baseline - score;
  const negativeGradientRangeMultiple = baseline - min;

  const nonPrimaryColorValues = MAX_RGB_VALUE - amountBelowBaseline * (MAX_RGB_VALUE / negativeGradientRangeMultiple);

  return higherIsBetter
    ? `rgb(${MAX_RGB_VALUE}, ${nonPrimaryColorValues}, ${nonPrimaryColorValues})`
    : `rgb(${nonPrimaryColorValues},${MAX_RGB_VALUE}, ${nonPrimaryColorValues})`;
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
