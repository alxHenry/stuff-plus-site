import type { NextPage } from "next";

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import Head from "next/head";
import { useState } from "react";
import PlayerTableBody from "../components/PlayerTableBody";
import {
  Box,
  Center,
  Heading,
  Link as ChakraLink,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import styles from "../styles/Table.module.css";
import TableMinimumPitchesFilter from "../components/TableMinimumPitchesFilter";
import StuffPlusInfoModal from "../components/StuffPlusInfoModal";
import TableDataSetSelectionFilter from "../components/TableDataSetSelectionFilter";

export interface PlayerData {
  name: string;
  mlbId: string;
  hand: Hand;
  pitchCount: number;
  stuffPlus: number;
  locationPlus: number;
  pitchingPlus: number;
}

export interface PlayerDataSet {
  title: string;
  data: PlayerData[];
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
  readonly playerDataSets: PlayerDataSet[];
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

const Home: NextPage<Props> = ({ playerDataSets: originalPlayerDataSets }) => {
  const [selectedDataSetIndex, setSelectedDataSetIndex] = useState(0);
  const [filteredAndSortedPlayerData, setFilteredAndSortedPlayerData] = useState(originalPlayerDataSets[0].data);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [sortedColumn, setSortedColumn] = useState<PlayerColumn>();
  const [sortDirection, setSortDirection] = useState<SortDirection>();

  const currentTitle = originalPlayerDataSets[selectedDataSetIndex].title;

  const switchDataSet = (selectedDataSetIndex: number) => {
    setSelectedDataSetIndex(selectedDataSetIndex);
    setFilteredAndSortedPlayerData(originalPlayerDataSets[selectedDataSetIndex].data);
  };

  const openInfoModal = () => {
    setIsInfoModalOpen(true);
  };
  const closeInfoModal = () => {
    setIsInfoModalOpen(false);
  };

  const sortColumn = (columnName: PlayerColumn) => {
    let shouldReverse = false;
    if (sortedColumn === columnName && sortDirection === "ascending") {
      shouldReverse = true;
    }

    const copyToSort = [...filteredAndSortedPlayerData];
    const comparator = columnToSortComparatorMap[columnName];
    copyToSort.sort(comparator);

    if (shouldReverse) {
      copyToSort.reverse();
      setSortDirection("descending");
    } else {
      setSortDirection("ascending");
    }

    setSortedColumn(columnName);
    setFilteredAndSortedPlayerData(copyToSort);
  };

  const filterByPitchMinimum = (selectedOption: MinimumPitchFilterOptions | undefined) => {
    const copyToFilter = [...originalPlayerDataSets[selectedDataSetIndex].data];
    if (selectedOption == null) {
      setFilteredAndSortedPlayerData(copyToFilter);
      return;
    }

    const filtered = copyToFilter.reduce<PlayerData[]>((filteredPlayers, player) => {
      if (player.pitchCount >= selectedOption) {
        filteredPlayers.push(player);
      }
      return filteredPlayers;
    }, []);

    setFilteredAndSortedPlayerData(filtered);
  };

  return (
    <>
      <Head>
        <title>Stuff+ Pitching Metric</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <StuffPlusInfoModal closeModal={closeInfoModal} isOpen={isInfoModalOpen} />
      <Stack spacing={4}>
        <Box backgroundColor="teal.500" padding={2}>
          <ChakraLink onClick={openInfoModal} color="white">
            <Text fontWeight={600} size="lg">
              What is Stuff+
            </Text>
          </ChakraLink>
        </Box>
        <Center>
          <Heading as="h1" size="lg" isTruncated>
            {currentTitle}
          </Heading>
        </Center>
        <Center>
          <Box>
            <TableDataSetSelectionFilter onSelection={switchDataSet} playerDataSets={originalPlayerDataSets} />
            <TableMinimumPitchesFilter onSelection={filterByPitchMinimum} />
          </Box>
        </Center>
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
              <PlayerTableBody sortedPlayerData={filteredAndSortedPlayerData} />
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
  const lastSeasonSheet = doc.sheetsByTitle["End of Season Stuff+/Location+"];
  const currentSheet = doc.sheetsByIndex[0];

  const [currentRows, lastSeasonRows] = await Promise.all([
    currentSheet.getRows({ limit: 600, offset: 0 }),
    lastSeasonSheet.getRows({ limit: 600, offset: 0 }),
  ]);

  const currentPlayerData = currentRows.map(sheetRowToPlayerData);
  const lastSeasonPlayerData = lastSeasonRows.map(sheetRowToPlayerData);

  return {
    playerDataSets: [
      { title: currentSheet.title, data: currentPlayerData },
      { title: lastSeasonSheet.title, data: lastSeasonPlayerData },
    ],
  };
};

const sheetRowToPlayerData = (row: GoogleSpreadsheetRow): PlayerData => {
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

export const getStaticProps = async () => {
  const sheetData = await fetchStuffPlusGoogleDocData();

  return {
    props: sheetData,
  };
};

export default Home;
