import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { PlayerData } from "../fetching/googleDocFetching";

export const sheetRowToPlayerData = (row: GoogleSpreadsheetRow): PlayerData => {
  return {
    name: (row.player_name as string) || (row.Player as string),
    handedness: (row.P_THROWS as string) || "",
    mlbId: (row.MLBAMID as string) || (row.Player as string),
    pitchCount: parseInt(row.Pitches, 10),
    stuffPlus: parseFloat(row.STUFFplus) || parseFloat(row["Stuff+"]),
    locationPlus: parseFloat(row.LOCATIONplus) || parseFloat(row["Location+"]),
    pitchingPlus: parseFloat(row.PITCHINGplus) || parseFloat(row["Pitching+"]),
  };
};
