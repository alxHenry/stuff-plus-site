import { NextPage } from "next/types";
import { Box, Heading, Flex, Spacer, Button, HStack, Link as ChakraLink, Text, Stack } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import StreamFinderTable from "../components/StreamFinderTable";
import { useState } from "react";
import Head from "next/head";
import { fetchStreamFinderData } from "../fetching/streamFinderFetching";
import { PitcherMatchupScoreData, PitcherQualityScoreData } from "../util/statistics";
import Link from "next/link";

export const ONE_HOUR_IN_SECONDS = 3600;

export interface Props {
  readonly streamFinderData: StreamFinderDay[];
}

const StreamFinder: NextPage<Props> = ({ streamFinderData }) => {
  const [showingToday, setShowingToday] = useState(true);

  const todayData = streamFinderData[0].data;
  const tomorrowData = streamFinderData[1].data;
  const todayTable = <StreamFinderTable streamFinderData={todayData} />;
  const tomorrowTable = <StreamFinderTable streamFinderData={tomorrowData} />;
  const table = showingToday ? todayTable : tomorrowTable;

  return (
    <>
      <Head>
        <title>Stream Finder</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Stack spacing={2}>
        <Box backgroundColor="teal.500" padding={2}>
          <HStack>
            <Link href="/" passHref>
              <ChakraLink color="white">
                <Text fontWeight={600} size="lg">
                  Stuff+
                </Text>
              </ChakraLink>
            </Link>
          </HStack>
        </Box>
        <Box>
          <Flex justifyContent="middle">
            <Heading marginBottom={3}>
              {showingToday ? streamFinderData[0].dateHeadline : streamFinderData[1].dateHeadline}
            </Heading>
            <Spacer />
            <Button
              colorScheme="teal"
              rightIcon={showingToday ? <ArrowRightIcon /> : <ArrowLeftIcon />}
              onClick={() => {
                setShowingToday((prev) => !prev);
              }}
              margin={3}
            >
              {showingToday ? "Show tomorrow" : "Show yesterday"}
            </Button>
          </Flex>
          {table}
        </Box>
      </Stack>
    </>
  );
};

export interface StreamFinderDay {
  readonly data: Record<string, StreamFinderPitcherData>;
  readonly dateHeadline: string;
}

export interface StreamFinderBasePitcherData {
  readonly fip: number;
  readonly name: string;
  readonly pitchingPlus: number;
  readonly siera: number;
  readonly wOBAAgainstHandSplit: number;
}

export interface StreamFinderPitcherData {
  readonly name: string;
  readonly handedness: string;
  readonly matchupBreakdown: PitcherMatchupScoreData;
  readonly matchupScore: number;
  readonly qualityBreakdown: PitcherQualityScoreData;
  readonly qualityScore: number;
  readonly streamScore: number;
}

export const getStaticProps = async () => {
  const streamFinderData = await fetchStreamFinderData();

  return {
    props: {
      streamFinderData,
    },
    revalidate: ONE_HOUR_IN_SECONDS,
  };
};

export default StreamFinder;
