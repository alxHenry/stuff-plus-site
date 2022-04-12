import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { Hand, PlayerData } from "../pages";

export const sheetRowToPlayerData = (row: GoogleSpreadsheetRow): PlayerData => {
  return {
    name: (row.player_name as string) || (row.Player as string),
    mlbId: (row.MLBAMID as string) || (row.Player as string),
    hand: (row.P_THROWS as Hand) || "",
    pitchCount: parseInt(row.Pitches, 10),
    stuffPlus: parseFloat(row.STUFFplus) || parseFloat(row["Stuff+"]),
    locationPlus: parseFloat(row.LOCATIONplus) || parseFloat(row["Location+"]),
    pitchingPlus: parseFloat(row.PITCHINGplus) || parseFloat(row["Pitching+"]),
  };
};