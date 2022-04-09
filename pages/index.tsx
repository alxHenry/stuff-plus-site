import type { NextPage } from "next";

import { GoogleSpreadsheet } from "google-spreadsheet";
import Head from "next/head";
import { useState } from "react";
import PlayerTableBody from "../components/PlayerTableBody";
import { Center, Heading, Stack, Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import styles from "../styles/Table.module.css";
import TableMinimumPitchesFilter from "../components/TableMinimumPitchesFilter";

const TWELVE_HOURS_IN_SECONDS = 43200;

export interface PlayerData {
  name: string;
  mlbId: string;
  hand: Hand;
  pitchCount: number;
  stuffPlus: number;
  locationPlus: number;
  pitchingPlus: number;
}

type Hand = "R" | "L";
type PlayerColumn = "name" | "hand" | "pitchCount" | "stuffPlus" | "locationPlus" | "pitchingPlus";
type SortDirection = "ascending" | "descending";
type PlayerComparator = (playerA: PlayerData, playerB: PlayerData) => number;

export enum MinimumPitchFilterOptions {
  TwentyFive = 25,
  Fifty = 50,
  OneHundred = 100,
  TwoHundred = 200,
  ThreeHundred = 300,
}
interface Props {
  readonly originalPlayerData: PlayerData[];
  readonly sheetTitle: string;
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

const Home: NextPage<Props> = ({ originalPlayerData, sheetTitle }) => {
  const [playerData, setPlayerData] = useState(originalPlayerData);
  const [sortedColumn, setSortedColumn] = useState<PlayerColumn>();
  const [sortDirection, setSortDirection] = useState<SortDirection>();

  const sortColumn = (columnName: PlayerColumn) => {
    let shouldReverse = false;
    if (sortedColumn === columnName && sortDirection === "ascending") {
      shouldReverse = true;
    }

    const copyToSort = [...playerData];
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

  const filterByPitchMinimum = (selectedOption: MinimumPitchFilterOptions | undefined) => {
    const copyToFilter = [...originalPlayerData];
    if (selectedOption == null) {
      setPlayerData(copyToFilter);
      return;
    }

    const filtered = copyToFilter.reduce<PlayerData[]>((filteredPlayers, player) => {
      if (player.pitchCount >= selectedOption) {
        filteredPlayers.push(player);
      }
      return filteredPlayers;
    }, []);

    setPlayerData(filtered);
  };

  return (
    <>
      <Head>
        <title>Stuff+ Pitching Metric</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Stack spacing={4}>
        <Center>
          <Heading as="h1" size="lg" isTruncated>
            {sheetTitle}
          </Heading>
        </Center>
        <TableMinimumPitchesFilter onSelection={filterByPitchMinimum} />
        <TableContainer>
          <Table variant="striped">
            <Thead>
              <Tr>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("name");
                  }}
                >
                  Name
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("hand");
                  }}
                >
                  Throws
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("pitchCount");
                  }}
                >
                  Pitches
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("stuffPlus");
                  }}
                >
                  Stuff+
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("locationPlus");
                  }}
                >
                  Location+
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("pitchingPlus");
                  }}
                >
                  Pitching+
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <PlayerTableBody sortedPlayerData={playerData} />
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    </>
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
    originalPlayerData: playerData,
    sheetTitle: firstSheet.title,
  };
};

export const getStaticProps = async () => {
  const sheetData = await fetchStuffPlusGoogleDocData();

  return {
    props: sheetData,
    revalidate: TWELVE_HOURS_IN_SECONDS,
  };
};

export default Home;
