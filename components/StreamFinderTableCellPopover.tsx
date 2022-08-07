import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Link,
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { FC, ReactElement } from "react";
import { generic100NormalizedColorizerConfig } from "../util/mlb";
import { pitchScoreToColorGradient } from "../util/playerTableUtils";
import { PitcherMatchupScoreData, PitcherQualityScoreData } from "../util/statistics";

function isQualityBreakdown(
  breakdown: PitcherQualityScoreData | PitcherMatchupScoreData
): breakdown is PitcherQualityScoreData {
  return (breakdown as PitcherQualityScoreData).fip !== undefined;
}

interface Props {
  breakdown: PitcherQualityScoreData | PitcherMatchupScoreData | null;
  children: ReactElement;
}

const StreamFinderTableCellPopover: FC<Props> = ({ breakdown, children }) => {
  if (breakdown == null) {
    return children;
  }

  const tableHead = (
    <Thead>
      <Tr>
        <Th color="white">Metric</Th>
        <Th color="white">Value</Th>
        <Th color="white">Score</Th>
      </Tr>
    </Thead>
  );
  let bodyContent;

  if (isQualityBreakdown(breakdown)) {
    bodyContent = (
      <TableContainer>
        <Table>
          {tableHead}
          <Tbody>
            <Tr>
              <Td>FIP</Td>
              <Td>{breakdown.fip.value}</Td>
              <Td color={pitchScoreToColorGradient(breakdown.fip.score, generic100NormalizedColorizerConfig)}>
                {breakdown.fip.score}
              </Td>
            </Tr>
            <Tr>
              <Td>SIERA</Td>
              <Td>{breakdown.siera.value}</Td>
              <Td color={pitchScoreToColorGradient(breakdown.siera.score, generic100NormalizedColorizerConfig)}>
                {breakdown.siera.score}
              </Td>
            </Tr>
            <Tr>
              <Td>Pitching+</Td>
              <Td>{breakdown.pitchingPlus.score}</Td>
              <Td color={pitchScoreToColorGradient(breakdown.pitchingPlus.score, generic100NormalizedColorizerConfig)}>
                {breakdown.pitchingPlus.score}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    );
  } else {
    bodyContent = (
      <TableContainer>
        <Table>
          {tableHead}
          <Tbody>
            <Tr>
              <Td>wOBA</Td>
              <Td>{breakdown.wOBAAgainstHandSplit.value}</Td>
              <Td
                color={pitchScoreToColorGradient(
                  breakdown.wOBAAgainstHandSplit.score,
                  generic100NormalizedColorizerConfig
                )}
              >
                {breakdown.wOBAAgainstHandSplit.score}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    );
  }

  const content = (
    <PopoverContent color="white">
      <PopoverHeader fontWeight="semibold" backgroundColor="teal.800">
        Breakdown
      </PopoverHeader>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverBody backgroundColor="teal.900">{bodyContent}</PopoverBody>
    </PopoverContent>
  );

  return (
    <Popover closeOnBlur={true} trigger="hover" preventOverflow={true}>
      <PopoverTrigger>
        <Link fontWeight="semibold">{children}</Link>
      </PopoverTrigger>
      {content}
    </Popover>
  );
};

export default StreamFinderTableCellPopover;
