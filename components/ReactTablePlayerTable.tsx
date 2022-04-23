import { TableContainer, Table, Thead, Tr, Th, Tbody, Td } from "@chakra-ui/react";
import { FC } from "react";
import { Column, useSortBy, useTable } from "react-table";
import { PlayerData } from "../pages";
import { getCellColorStyling } from "../util/playerTableUtils";

interface Props {
  readonly playersData: PlayerData[];
}

const columnsDefinition: Column<PlayerData>[] = [
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Pitch Count",
    accessor: "pitchCount",
  },
  {
    Header: "Stuff+",
    accessor: "stuffPlus",
  },
  {
    Header: "Location+",
    accessor: "locationPlus",
  },
  {
    Header: "Pitching+",
    accessor: "pitchingPlus",
  },
];

const ReactTablePlayerTable: FC<Props> = ({ playersData }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: columnsDefinition,
      data: playersData,
    },
    useSortBy
  );

  return (
    <TableContainer>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                // eslint-disable-next-line react/jsx-key
                <Th {...column.getHeaderProps((column as unknown as any).getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {(column as unknown as any).isSorted
                      ? (column as unknown as any).isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <Td
                      {...cell.getCellProps()}
                      {...getCellColorStyling({ columnId: cell.column.id, value: cell.value })}
                    >
                      {cell.render("Cell")}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default ReactTablePlayerTable;
