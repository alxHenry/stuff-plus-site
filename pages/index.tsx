import type { NextPage } from "next";

import { GoogleSpreadsheet } from "google-spreadsheet";
import Head from "next/head";
import { useState } from "react";
import PlayerTableBody from "../components/PlayerTableBody";
import { Center, Heading, Stack, Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import styles from "../styles/Table.module.css";
import TableMinimumPitchesFilter from "../components/TableMinimumPitchesFilter";
import StuffPlusInfoModal from "../components/StuffPlusInfoModal";
import TableDataSetSelectionFilter from "../components/TableDataSetSelectionFilter";
import { sheetRowToPlayerData } from "../util/stuffPlusOriginSheetUtils";
import { columnToSortComparatorMap, getSortIcon } from "../util/playerTableUtils";

export const TWELVE_HOURS_IN_SECONDS = 43200;

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

export type PlayerColumn = "name" | "pitchCount" | "stuffPlus" | "locationPlus" | "pitchingPlus";
export type SortDirection = "ascending" | "descending";

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

const Home: NextPage<Props> = ({ playerDataSets: originalPlayerDataSets }) => {
  const [selectedDataSetIndex, setSelectedDataSetIndex] = useState(0);
  const [filteredAndSortedPlayerData, setFilteredAndSortedPlayerData] = useState(originalPlayerDataSets[0].data);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [sortedColumn, setSortedColumn] = useState<PlayerColumn>();
  const [sortDirection, setSortDirection] = useState<SortDirection>();

  const currentTitle = originalPlayerDataSets[selectedDataSetIndex].title;

  const switchDataSet = (selectedDataSetIndex: number) => {
    setSortedColumn(undefined);
    setSortDirection(undefined);

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
      setSortedColumn(undefined);
      setSortDirection(undefined);
      return;
    }

    const filtered = copyToFilter.reduce<PlayerData[]>((filteredPlayers, player) => {
      if (player.pitchCount >= selectedOption) {
        filteredPlayers.push(player);
      }
      return filteredPlayers;
    }, []);

    setFilteredAndSortedPlayerData(filtered);
    setSortedColumn(undefined);
    setSortDirection(undefined);
  };

  return (
    <>
      <Head>
        <title>Stuff+ Pitching Metric</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <StuffPlusInfoModal closeModal={closeInfoModal} isOpen={isInfoModalOpen} />
      <Stack marginTop={4} spacing={4}>
        <Center>
          <Heading as="h1" size="lg">
            {currentTitle}
          </Heading>
        </Center>
        <Center>
          <Stack>
            <TableDataSetSelectionFilter onSelection={switchDataSet} playerDataSets={originalPlayerDataSets} />
            <TableMinimumPitchesFilter onSelection={filterByPitchMinimum} />
          </Stack>
        </Center>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("name");
                  }}
                >
                  Name {getSortIcon("name", sortedColumn, sortDirection)}
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("pitchCount");
                  }}
                >
                  Pitches {getSortIcon("pitchCount", sortedColumn, sortDirection)}
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("stuffPlus");
                  }}
                >
                  Stuff+ {getSortIcon("stuffPlus", sortedColumn, sortDirection)}
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("locationPlus");
                  }}
                >
                  Location+ {getSortIcon("locationPlus", sortedColumn, sortDirection)}
                </Th>
                <Th
                  className={styles.sortableHeader}
                  onClick={() => {
                    sortColumn("pitchingPlus");
                  }}
                >
                  Pitching+ {getSortIcon("pitchingPlus", sortedColumn, sortDirection)}
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
  const springTrainingSheet = doc.sheetsByTitle["Spring Training 2022 (thru 4/5)"];
  const currentSheet = doc.sheetsByTitle["7/24"];

  const [currentRows, springTrainingRows, lastSeasonRows] = await Promise.all([
    currentSheet.getRows({ limit: 1000, offset: 0 }),
    springTrainingSheet.getRows({ limit: 1000, offset: 0 }),
    lastSeasonSheet.getRows({ limit: 1000, offset: 0 }),
  ]);

  const currentPlayerData = currentRows.map(sheetRowToPlayerData);
  const sptringTrainingData = springTrainingRows.map(sheetRowToPlayerData);
  const lastSeasonPlayerData = lastSeasonRows.map(sheetRowToPlayerData);

  return {
    playerDataSets: [
      { title: currentSheet.title, data: currentPlayerData },
      { title: springTrainingSheet.title, data: sptringTrainingData },
      { title: lastSeasonSheet.title, data: lastSeasonPlayerData },
    ],
  };
};

export const getStaticProps = async () => {
  const sheetData = await fetchStuffPlusGoogleDocData();

  return {
    props: sheetData,
    revalidate: TWELVE_HOURS_IN_SECONDS, // Check for source sheet updates every 12 hours when requests come in
  };
};

export default Home;
