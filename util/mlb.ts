import type { ColorizerConfig } from "./playerTableUtils";

export const mlbTeamNameToAbbrev: Record<string, string> = {
  Angels: "LAA",
  Astros: "HOU",
  Athletics: "OAK",
  "Blue Jays": "TOR",
  Braves: "ATL",
  Brewrs: "MIL",
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

export const wOBAColorizerConfig: ColorizerConfig = {
  baseline: 0.31,
  max: 0.365,
  min: 0.255,
};
