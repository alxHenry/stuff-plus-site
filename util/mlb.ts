import type { ColorizerConfig } from "./playerTableUtils";

// TODO: Calculate these
export const LEAGUE_AVG_FIP = 3.99;
export const LEAGUE_AVG_SIERA = 3.89;
export const LEAGUE_AVG_K_BB = 13.9;

export const mlbTeamNameToAbbrev: Record<string, string> = {
  Angels: "LAA",
  Astros: "HOU",
  Athletics: "OAK",
  "Blue Jays": "TOR",
  Braves: "ATL",
  Brewers: "MIL",
  Cardinals: "STL",
  Cubs: "CHC",
  "D-backs": "ARI",
  Dodgers: "LAD",
  Giants: "SF",
  Guardians: "CLE",
  Mariners: "SEA",
  Marlins: "MIA",
  Mets: "NYM",
  Nationals: "WSH",
  Orioles: "BAL",
  Padres: "SD",
  Phillies: "PHI",
  Pirates: "PIT",
  Rangers: "TEX",
  "Red Sox": "BOS",
  Rays: "TB",
  Reds: "CIN",
  Rockies: "COL",
  Royals: "KC",
  Tigers: "DET",
  Twins: "MIN",
  "White Sox": "CWS",
  Yankees: "NYY",
};

export const stuffPlusColorizerConfig: ColorizerConfig = {
  baseline: 100,
  max: 150,
  min: 50,
};

export const streamScoreColorizerConfig: ColorizerConfig = {
  baseline: 100,
  max: 110,
  min: 90,
};

export const wOBAColorizerConfig: ColorizerConfig = {
  baseline: 0.31,
  max: 0.365,
  min: 0.255,
  higherIsBetter: false,
};

export const kBBColorizerConfig: ColorizerConfig = {
  baseline: LEAGUE_AVG_K_BB,
  max: 45,
  min: 5,
};

export const generic100NormalizedColorizerConfig: ColorizerConfig = {
  baseline: 100,
  max: 120,
  min: 80,
};
