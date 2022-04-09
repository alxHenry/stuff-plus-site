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

type PlayerColumn = "name" | "hand" | "pitchCount" | "stuffPlus" | "locationPlus" | "pitchingPlus";
type SortDirection = "ascending" | "descending";
type PlayerComparator = (playerA: PlayerData, playerB: PlayerData) => number;

interface Props {
  players: PlayerData[];
  sheetTitle: string;
}

const nameComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerA.name.localeCompare(playerB.name);
};
const handComparator = (playerA: PlayerData, playerB: PlayerData) => {
  return playerA.hand.localeCompare(playerB.hand);
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

const columnToSortComparatorMap: Record<PlayerColumn, PlayerComparator> = {
  name: nameComparator,
  hand: handComparator,
  pitchCount: pitchCountComparator,
  stuffPlus: stuffPlusComparator,
  locationPlus: locationPlusComparator,
  pitchingPlus: pitchingPlusComparator,
};

const Home: NextPage<Props> = ({ players }) => {
  const [playerData, setPlayerData] = useState(players);
  const [sortedColumn, setSortedColumn] = useState<PlayerColumn>();
  const [sortDirection, setSortDirection] = useState<SortDirection>();

  const sortColumn = (columnName: PlayerColumn) => {
    let shouldReverse = false;
    if (sortedColumn === columnName && sortDirection === "ascending") {
      shouldReverse = true;
    }

    const copyToSort = [...players];
    const comparator = columnToSortComparatorMap[columnName];
    copyToSort.sort(comparator);

    if (shouldReverse) {
      copyToSort.reverse();
      setSortDirection("descending");
    } else {
      setSortDirection("ascending");
    }

    setSortedColumn(columnName);
    setPlayerData(copyToSort);
  };

  const sortByName = () => {
    let shouldReverse = false;
    if (sortedColumn === "name" && sortDirection === "ascending") {
      shouldReverse = true;
    }

    const copyToSort = [...players];
    copyToSort.sort((playerA, playerB) => {
      return playerA.name.localeCompare(playerB.name);
    });

    if (shouldReverse) {
      copyToSort.reverse();
      setSortDirection("descending");
    } else {
      setSortDirection("ascending");
    }

    setSortedColumn("name");
    setPlayerData(copyToSort);
  };

  return (
    <table>
      <thead>
        <tr>
          <th
            onClick={() => {
              sortColumn("name");
            }}
          >
            Name
          </th>
          <th
            onClick={() => {
              sortColumn("hand");
            }}
          >
            Throws
          </th>
          <th
            onClick={() => {
              sortColumn("pitchCount");
            }}
          >
            Pitches
          </th>
          <th
            onClick={() => {
              sortColumn("stuffPlus");
            }}
          >
            Stuff+
          </th>
          <th
            onClick={() => {
              sortColumn("locationPlus");
            }}
          >
            Location+
          </th>
          <th
            onClick={() => {
              sortColumn("pitchingPlus");
            }}
          >
            Pitching+
          </th>
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
