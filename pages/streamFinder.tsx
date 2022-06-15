import { NextPage } from "next/types";
import { IconButton, Box, Heading } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import StreamFinderTable from "../components/StreamFinderTable";
import { useState } from "react";
import Head from "next/head";
import { fetchStreamFinderData } from "../fetching/streamFinderFetching";

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
      <Box>
        <IconButton
          aria-label={showingToday ? "Show tomorrow data" : "Show yesterday data"}
          icon={showingToday ? <ArrowRightIcon /> : <ArrowLeftIcon />}
          onClick={() => {
            setShowingToday((prev) => !prev);
          }}
        />
        <Heading>{showingToday ? streamFinderData[0].dateHeadline : streamFinderData[1].dateHeadline}</Heading>
        {table}
      </Box>
    </>
  );
};

export interface StreamFinderDay {
  readonly data: StreamFinderPitcherData[];
  readonly dateHeadline: string;
}

export interface StreamFinderBasePitcherData {
  readonly name: string;
  readonly wOBAAgainstHandSplit: number;
  readonly pitchingPlus: number;
}

export interface StreamFinderPitcherData extends StreamFinderBasePitcherData {
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
