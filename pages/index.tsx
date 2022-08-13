import type { NextPage } from "next";

import Head from "next/head";
import { useState } from "react";
import PlayerTableBody from "../components/PlayerTableBody";
import { Center, Heading, Stack, Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import styles from "../styles/Table.module.css";
import TableMinimumPitchesFilter from "../components/TableMinimumPitchesFilter";
import TableDataSetSelectionFilter from "../components/TableDataSetSelectionFilter";
import { columnToSortComparatorMap, getSortIcon } from "../util/playerTableUtils";
import { fetchStuffPlusGoogleDocData, PlayerData, PlayerDataSet } from "../fetching/googleDocFetching";

export const TWELVE_HOURS_IN_SECONDS = 43200;

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
  const [sortedColumn, setSortedColumn] = useState<PlayerColumn>();
  const [sortDirection, setSortDirection] = useState<SortDirection>();

  const currentTitle = originalPlayerDataSets[selectedDataSetIndex].title;

  const switchDataSet = (selectedDataSetIndex: number) => {
    setSortedColumn(undefined);
    setSortDirection(undefined);

    setSelectedDataSetIndex(selectedDataSetIndex);
    setFilteredAndSortedPlayerData(originalPlayerDataSets[selectedDataSetIndex].data);
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

export const getStaticProps = async () => {
  const data = await fetchStuffPlusGoogleDocData([
    "8/9",
    "Spring Training 2022 (thru 4/5)",
    "End of Season Stuff+/Location+",
  ]);

  return {
    props: { playerDataSets: data },
    revalidate: TWELVE_HOURS_IN_SECONDS, // Check for source sheet updates every 12 hours when requests come in
  };
};

export default Home;
