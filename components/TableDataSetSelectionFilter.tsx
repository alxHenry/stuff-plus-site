import { ChevronDownIcon } from "@chakra-ui/icons";
import { HStack, Select, Text } from "@chakra-ui/react";
import { FC } from "react";
import { PlayerDataSet } from "../fetching/googleDocFetching";

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
    <HStack>
      <Text textAlign="right" minWidth="80px">
        Data set:
      </Text>
      <Select
        icon={<ChevronDownIcon />}
        onChange={(selection) => {
          const selectedIndex = parseInt(selection.currentTarget.value as string, 10);
          onSelection(selectedIndex);
        }}
      >
        {selectOptions}
      </Select>
    </HStack>
  );
};

export default TableDataSetSelectionFilter;
