export interface WOBASplitData {
  readonly vsL: number;
  readonly vsR: number;
}
export type WOBASplitsData = Record<string, WOBASplitData>;

export interface ProbableStarterData {
  readonly headlineDate: string;
  readonly starters: ProbableStarter[];
}

export interface ProbableStarter {
  name: string;
  team: string;
  opposingTeam: string;
}

export type NameToFangraphsPitcherData = Record<string, FangraphsPitcherData>;
export interface FangraphsPitcherData {
  siera: number;
  fip: number;
  kBB: number;
}
