import {
  Button,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { FunctionComponent } from "react";

interface Props {
  closeModal: () => void;
  isOpen: boolean;
}

const StuffPlusInfoModal: FunctionComponent<Props> = ({ closeModal, isOpen }) => {
  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>What is Stuff+?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Text>
              Stuff+ is a metric for baseball pitchers created by The Athletic&apos;s{" "}
              <Link href="https://theathletic.com/author/eno-sarris/" passHref={true}>
                <ChakraLink isExternal color="teal.500">
                  Eno Sarris
                </ChakraLink>
              </Link>
              . Stuff+ measures the quality of a pitcher&apos;s arsenal and is used along with its related metric,
              Location+. The combination of the two creates the Pitching+ metric. Eno has a good article about why
              Stuff+ is useful{" "}
              <Link
                href="https://theathletic.com/2798395/2021/08/31/command-stuff-report-why-should-anyone-care-about-stuff/"
                passHref={true}
              >
                <ChakraLink isExternal color="teal.500">
                  here
                </ChakraLink>
              </Link>
              .
            </Text>
            <Text>
              This site is merely a UI for the original sheet available{" "}
              <Link
                href="https://docs.google.com/spreadsheets/d/1AE1dNnudwRS6aLhWA1SArp1GoviUeHNcASXxtm3Le9I/edit#gid=718147038"
                passHref={true}
              >
                <ChakraLink isExternal color="teal.500">
                  here
                </ChakraLink>
              </Link>
              .
            </Text>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={closeModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StuffPlusInfoModal;
