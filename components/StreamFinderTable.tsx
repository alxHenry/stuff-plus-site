import { Tr, Td, TableContainer, Table, Thead, Th, Tbody } from "@chakra-ui/react";
import { FC, useMemo } from "react";
import { StreamFinderPitcherData } from "../pages/streamFinder";
import { streamScoreColorizerConfig, generic100NormalizedColorizerConfig } from "../util/mlb";
import { ColorizerConfig, pitchScoreToColorGradient } from "../util/playerTableUtils";
import { useSortBy, useTable } from "react-table";
import StreamFinderTableCellPopover from "./StreamFinderTableCellPopover";
import { PitcherMatchupScoreData, PitcherQualityScoreData } from "../util/statistics";

interface Props {
  streamFinderData: Record<string, StreamFinderPitcherData>;
}

const tableKeyToColorizerConfig: Record<string, ColorizerConfig | null> = {
  name: null,
  qualityScore: generic100NormalizedColorizerConfig,
  streamScore: streamScoreColorizerConfig,
  matchupScore: generic100NormalizedColorizerConfig,
};

type TableKey = "name" | "matchupScore" | "qualityScore" | "streamScore";
const reactTableColumnDefinitions: { Header: string; accessor: TableKey }[] = [
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Matchup",
    accessor: "matchupScore",
  },
  {
    Header: "Quality",
    accessor: "qualityScore",
  },
  {
    Header: "Stream Score",
    accessor: "streamScore",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as unknown as any;

// react-table types are missing sortBy and most initialState keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reactTableInitialState = { sortBy: [{ id: "streamScore", desc: true }] } as unknown as any;

const StreamFinderTable: FC<Props> = ({ streamFinderData }) => {
  const tableRows = useMemo(() => Object.values(streamFinderData), [streamFinderData]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: reactTableColumnDefinitions,
      data: tableRows,
      initialState: reactTableInitialState,
    },
    useSortBy
  );

  const headerContent = headerGroups.map((headerGroup) => {
    return (
      // eslint-disable-next-line react/jsx-key
      <Tr {...headerGroup.getHeaderGroupProps()}>
        {headerGroup.headers.map((column) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const untypedColumn = column as unknown as any; // The definitely typed does not support sorting

          return (
            // eslint-disable-next-line react/jsx-key
            <Th {...column.getHeaderProps(untypedColumn.getSortByToggleProps())}>
              {column.render("Header")}
              <span>{untypedColumn.isSorted ? (untypedColumn.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
            </Th>
          );
        })}
      </Tr>
    );
  });

  const bodyContent = rows.map((row) => {
    const pitcherName: string = row.values["name"];
    const pitcherData = streamFinderData[pitcherName];
    const breakdowns: Record<TableKey, PitcherMatchupScoreData | PitcherQualityScoreData | null> = {
      name: null,
      matchupScore: pitcherData.matchupBreakdown,
      qualityScore: pitcherData.qualityBreakdown,
      streamScore: null,
    };

    prepareRow(row);

    return (
      // eslint-disable-next-line react/jsx-key
      <Tr {...row.getRowProps()}>
        {row.cells.map((cell) => {
          const colorizerConfig = tableKeyToColorizerConfig[cell.column.id];
          const breakdown = breakdowns[cell.column.id as TableKey];

          let handednessAppend = "";
          if ((cell.column.id as TableKey) === "name") {
            handednessAppend = `, ${streamFinderData[cell.value].handedness}`;
          }

          return (
            // eslint-disable-next-line react/jsx-key
            <Td
              {...cell.getCellProps()}
              backgroundColor={colorizerConfig ? pitchScoreToColorGradient(cell.value, colorizerConfig) : undefined}
            >
              <StreamFinderTableCellPopover breakdown={breakdown}>
                <>
                  {cell.render("Cell")}
                  {handednessAppend}
                </>
              </StreamFinderTableCellPopover>
            </Td>
          );
        })}
      </Tr>
    );
  });

  return (
    <TableContainer>
      <Table {...getTableProps}>
        <Thead>{headerContent}</Thead>
        <Tbody {...getTableBodyProps}>{bodyContent}</Tbody>
      </Table>
    </TableContainer>
  );
};

export default StreamFinderTable;
