import { ArrowRightIcon } from "@chakra-ui/icons";
import { Tr, Td, TableContainer, IconButton, Table, Thead, Th, Tbody } from "@chakra-ui/react";
import { FC } from "react";
import { StreamFinderPitcherData } from "../pages/streamFinder";
import { wOBAColorizerConfig, stuffPlusColorizerConfig, streamScoreColorizerConfig } from "../util/mlb";
import { pitchScoreToColorGradient } from "../util/playerTableUtils";

interface Props {
  streamFinderData: StreamFinderPitcherData[];
}

const StreamFinderTable: FC<Props> = ({ streamFinderData }) => {
  const bodyElements = streamFinderData.map((data) => {
    return (
      <Tr key={`${data.name},${data.pitchingPlus}`}>
        <Td>{data.name}</Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.wOBAAgainstHandSplit, wOBAColorizerConfig)}>
          {data.wOBAAgainstHandSplit.toFixed(3)}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.pitchingPlus, stuffPlusColorizerConfig)}>
          {data.pitchingPlus}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.streamScore, streamScoreColorizerConfig)}>
          {data.streamScore.toFixed(2)}
        </Td>
      </Tr>
    );
  });

  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>wOBA vs Hand</Th>
            <Th>Pitching+</Th>
            <Th>Stream Score</Th>
          </Tr>
        </Thead>
        <Tbody>{bodyElements}</Tbody>
      </Table>
    </TableContainer>
  );
};

export default StreamFinderTable;
