import {
  Box,
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  ButtonGroup,
  Link,
  Text,
} from "@chakra-ui/react";
import { FC, ReactElement, useState } from "react";
import { generic100NormalizedColorizerConfig } from "../util/mlb";
import { pitchScoreToColorGradient } from "../util/playerTableUtils";
import { PitcherMatchupScoreData, PitcherQualityScoreData } from "../util/statistics";

interface Props {
  breakdown: PitcherQualityScoreData | PitcherMatchupScoreData | null;
  children: ReactElement;
}

const StreamFinderTableCellPopover: FC<Props> = ({ breakdown, children }) => {
  // const [isOpen, setIsOpen] = useState(false);
  // const toggleOpen = () => {
  //   setIsOpen((prev) => !prev);
  // };

  if (breakdown == null) {
    return children;
  }

  const contentRows = Object.entries(breakdown).map(([key, value]) => {
    return (
      <Box key={key}>
        <Text display="inline">{key}: </Text>
        <Text
          display="inline"
          color={pitchScoreToColorGradient(value, generic100NormalizedColorizerConfig)}
          fontWeight="bold"
        >
          {value}
        </Text>
      </Box>
    );
  });

  const content = (
    <PopoverContent color="white">
      <PopoverHeader fontWeight="semibold" backgroundColor="teal.800">
        Breakdown
      </PopoverHeader>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverBody backgroundColor="teal.900">{contentRows}</PopoverBody>
    </PopoverContent>
  );

  return (
    <Popover placement="right" closeOnBlur={true} trigger="hover">
      <PopoverTrigger>
        <Link fontWeight="semibold">{children}</Link>
      </PopoverTrigger>
      {content}
    </Popover>
  );
};

export default StreamFinderTableCellPopover;
