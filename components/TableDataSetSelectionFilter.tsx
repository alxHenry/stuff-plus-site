import { ArrowDownIcon } from "@chakra-ui/icons";
import { Select } from "@chakra-ui/react";
import { FC } from "react";
import { PlayerDataSet } from "../pages";

interface Props {
  readonly playerDataSets: PlayerDataSet[];
  readonly onSelection: (selectedIndex: number) => void;
}

const TableDataSetSelectionFilter: FC<Props> = ({ playerDataSets, onSelection }) => {
  const selectOptions = playerDataSets.map((dataSet, index) => {
    return (
      <option key={index} value={index}>
        {dataSet.title}
      </option>
    );
  });

  return (
    <Select
      icon={<ArrowDownIcon />}
      onChange={(selection) => {
        const selectedIndex = parseInt(selection.currentTarget.value as string, 10);
        onSelection(selectedIndex);
      }}
    >
      {selectOptions}
    </Select>
  );
};

export default TableDataSetSelectionFilter;
