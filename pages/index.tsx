import type { NextPage } from "next";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { useState } from "react";
import PlayerTableBody from "../components/PlayerTableBody";

type Hand = "R" | "L";

export interface PlayerData {
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
  sheetTitle: string;
}

const Home: NextPage<Props> = ({ players }) => {
  const [playerData, setPlayerData] = useState(players);
  const [sortedRow, setSortedRow] = useState<string>();
  const [sortDirection, setSortDirection] = useState<string>();

  const sortByName = () => {
    let shouldReverse = false;
    if (sortedRow === "name" && sortDirection === "asc") {
      shouldReverse = true;
    }

    const copyToSort = [...players];
    copyToSort.sort((playerA, playerB) => {
      return playerA.name.localeCompare(playerB.name);
    });

    if (shouldReverse) {
      copyToSort.reverse();
      setSortDirection("desc");
    } else {
      setSortDirection("asc");
    }

    setSortedRow("name");
    setPlayerData(copyToSort);
  };

  return (
    <table>
      <thead>
        <tr>
          <th onClick={sortByName}>Name</th>
          <th>Throws</th>
          <th>Pitches</th>
          <th>Stuff+</th>
          <th>Location+</th>
          <th>Pitching+</th>
        </tr>
      </thead>
      <tbody>
        <PlayerTableBody sortedPlayerData={playerData} />
      </tbody>
    </table>
  );
};

const fetchStuffPlusGoogleDocData = async (): Promise<Props> => {
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

  const playerData = rows.map((row) => {
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

  return {
    players: playerData,
    sheetTitle: firstSheet.title,
  };
};

export const getStaticProps = async () => {
  const sheetData = await fetchStuffPlusGoogleDocData();

  return {
    props: sheetData,
  };
};

export default Home;
