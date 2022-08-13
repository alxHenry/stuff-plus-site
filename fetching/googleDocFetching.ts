import { GoogleSpreadsheet } from "google-spreadsheet";
import { sheetRowToPlayerData } from "../util/stuffPlusOriginSheetUtils";

export interface PlayerData {
  name: string;
  handedness: string;
  mlbId: string;
  pitchCount: number;
  stuffPlus: number;
  locationPlus: number;
  pitchingPlus: number;
}

export interface PlayerDataSet {
  title: string;
  data: PlayerData[];
}

const SHEET_FETCH_CONFIG = { limit: 1000, offset: 0 };

export const fetchStuffPlusGoogleDocData = async (sheetNamesToFetch: string[]): Promise<PlayerDataSet[]> => {
  if (!process.env.GOOGLE_API_CLIENT_EMAIL || !process.env.GOOGLE_API_PRIVATE_KEY) {
    throw new Error("Issue loading auth credentials from env!");
  }

  const stuffPlusSheetId = "1AE1dNnudwRS6aLhWA1SArp1GoviUeHNcASXxtm3Le9I";
  const doc = new GoogleSpreadsheet(stuffPlusSheetId);

  const key = process.env.GOOGLE_API_PRIVATE_KEY.replace(/\\n/g, "\n");
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
    private_key: key,
  });

  await doc.loadInfo();

  const sheets = sheetNamesToFetch.map((sheetName) => doc.sheetsByTitle[sheetName]);
  const sheetRowPromises = sheets.map((sheet) => sheet.getRows(SHEET_FETCH_CONFIG));
  const rawSheetsRows = await Promise.all(sheetRowPromises);
  const sheetsRows = rawSheetsRows.map((rows) => rows.map(sheetRowToPlayerData));

  return sheetsRows.map((sheetRows, index) => ({ title: sheets[index].title, data: sheetRows }));
};
