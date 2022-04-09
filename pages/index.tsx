import type { NextPage } from "next";

import { GoogleSpreadsheet } from "google-spreadsheet";

type Hand = "R" | "L";

interface PlayerData {
  name: string;
  mlbId: string;
  hand: Hand;
  pitchCount: number;
  stuffPlus: number;
  locationPlus: number;
  pitchingPlus: number;
}

interface Props {
  players: PlayerData[];
}

const Home: NextPage<Props> = ({ players }) => {
  return <div>{players[0].name}</div>;
};

const fetchStuffPlusGoogleDocData = async (): Promise<PlayerData[]> => {
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
  const firstSheet = doc.sheetsByIndex[0];
  const rows = await firstSheet.getRows({ limit: 600, offset: 0 });

  return rows.map((row) => {
    return {
      name: row.player_name as string,
      mlbId: row.MLBAMID as string,
      hand: row.P_THROWS as Hand,
      pitchCount: parseInt(row.Pitches, 10),
      stuffPlus: parseFloat(row.STUFFplus),
      locationPlus: parseFloat(row.LOCATIONplus),
      pitchingPlus: parseFloat(row.PITCHINGplus),
    };
  });
};

export const getStaticProps = async () => {
  const playerData = await fetchStuffPlusGoogleDocData();

  return {
    props: {
      players: playerData,
    },
  };
};

export default Home;
