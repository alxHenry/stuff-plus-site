import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  ButtonGroup,
  Link,
  Text,
} from "@chakra-ui/react";
import { FC, ReactElement, useState } from "react";
import { PitcherMatchupScoreData, PitcherQualityScoreData } from "../util/statistics";

interface Props {
  breakdown: PitcherQualityScoreData | PitcherMatchupScoreData | null;
  children: ReactElement;
}

const StreamFinderTableCellPopover: FC<Props> = ({ breakdown, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  if (breakdown == null) {
    return children;
  }

  const contentRows = Object.entries(breakdown).map(([key, value]) => {
    return (
      <Text key={key}>
        {key}: {value}
      </Text>
    );
  });

  const content = (
    <PopoverContent>
      <PopoverHeader fontWeight="semibold">Breakdown</PopoverHeader>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverBody>{contentRows}</PopoverBody>
    </PopoverContent>
  );

  return (
    <Popover isOpen={isOpen} placement="right" closeOnBlur={true}>
      <PopoverTrigger>
        <Link onClick={toggleOpen} fontWeight="semibold">
          {children}
        </Link>
      </PopoverTrigger>
      {content}
    </Popover>
  );
};

export default StreamFinderTableCellPopover;
