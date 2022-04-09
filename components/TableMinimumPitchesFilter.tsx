import { Select } from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { FunctionComponent } from "react";
import { MinimumPitchFilterOptions } from "../pages";

interface Props {
  readonly onSelection: (minPitchesFilter: MinimumPitchFilterOptions | undefined) => void;
}

const TableMinimumPitchesFilter: FunctionComponent<Props> = ({ onSelection }) => {
  return (
    <Select
      icon={<ArrowDownIcon />}
      placeholder="Select minimum pitch count"
      onChange={(selection) => {
        if (selection.currentTarget.value === "") {
          onSelection(undefined);
        }

        onSelection(selection.currentTarget.value as unknown as MinimumPitchFilterOptions);
      }}
    >
      <option value={MinimumPitchFilterOptions.TwentyFive}>{MinimumPitchFilterOptions.TwentyFive}</option>
      <option value={MinimumPitchFilterOptions.Fifty}>{MinimumPitchFilterOptions.Fifty}</option>
      <option value={MinimumPitchFilterOptions.OneHundred}>{MinimumPitchFilterOptions.OneHundred}</option>
      <option value={MinimumPitchFilterOptions.TwoHundred}>{MinimumPitchFilterOptions.TwoHundred}</option>
      <option value={MinimumPitchFilterOptions.ThreeHundred}>{MinimumPitchFilterOptions.ThreeHundred}</option>
    </Select>
  );
};

export default TableMinimumPitchesFilter;
