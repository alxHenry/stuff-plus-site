import axios from "axios";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextPage } from "next/types";
import { PlayerData } from ".";
import { sheetRowToPlayerData } from "../util/stuffPlusOriginSheetUtils";
import * as cheerio from "cheerio";
import { IconButton, Box, Heading } from "@chakra-ui/react";
import { mlbTeamNameToAbbrev } from "../util/mlb";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import StreamFinderTable from "../components/StreamFinderTable";
import { useState } from "react";
import Head from "next/head";
import { generateStreamScore } from "../util/statistics";

export const ONE_HOUR_IN_SECONDS = 3600;

export interface Props {
  readonly streamFinderData: StreamFinderDay[];
}

interface WOBASplitData {
  readonly vsL: number;
  readonly vsR: number;
}
type WOBASplitsData = Record<string, WOBASplitData>;

interface ProbableStarterData {
  readonly headlineDate: string;
  readonly starters: ProbableStarter[];
}

interface ProbableStarter {
  name: string;
  team: string;
  opposingTeam: string;
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

const fetchStuffPlusGoogleDocCurrentSeasonData = async (): Promise<PlayerData[]> => {
  if (!process.env.GOOGLE_API_CLIENT_EMAIL || !process.env.GOOGLE_API_PRIVATE_KEY) {
    throw new Error("Issue loading auth credentials from env!");
  }

  const stuffPlusSheetId = "1AE1dNnudwRS6aLhWA1SArp1GoviUeHNcASXxtm3Le9I";
  const doc = new GoogleSpreadsheet(stuffPlusSheetId);

  const key = process.env.GOOGLE_API_PRIVATE_KEY.replace(/\\n/g, "\n");
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_API_CLIENT_EMAIL,
    private_key: key,
  });

  await doc.loadInfo();
  const currentSheet = doc.sheetsByIndex[0];

  const currentRows = await currentSheet.getRows({ limit: 600, offset: 0 });
  const currentPlayerData = currentRows.map(sheetRowToPlayerData);

  return currentPlayerData;
};

const fetchBaseballSavantWOBASplits = async (): Promise<WOBASplitsData> => {
  const baseballSavantWOBASplitsLeftUrl = `https://baseballsavant.mlb.com/statcast_search?hfPT=&hfAB=&hfGT=R%7C&hfPR=&hfZ=&stadium=&hfBBL=&hfNewZones=&hfPull=&hfC=&hfSea=2022%7C&hfSit=&player_type=batter&hfOuts=&opponent=&pitcher_throws=L&batter_stands=&hfSA=&game_date_gt=&game_date_lt=&hfInfield=&team=&position=&hfOutfield=&hfRO=&home_road=&hfFlag=&hfBBT=&metric_1=&hfInn=&min_pitches=0&min_results=0&group_by=team&sort_col=wOBA&player_event_sort=api_p_release_speed&sort_order=desc&min_pas=0&chk_stats_woba=on`;
  const baseballSavantWOBASplitsRightUrl = `https://baseballsavant.mlb.com/statcast_search?hfPT=&hfAB=&hfGT=R%7C&hfPR=&hfZ=&stadium=&hfBBL=&hfNewZones=&hfPull=&hfC=&hfSea=2022%7C&hfSit=&player_type=batter&hfOuts=&opponent=&pitcher_throws=R&batter_stands=&hfSA=&game_date_gt=&game_date_lt=&hfInfield=&team=&position=&hfOutfield=&hfRO=&home_road=&hfFlag=&hfBBT=&metric_1=&hfInn=&min_pitches=0&min_results=0&group_by=team&sort_col=wOBA&player_event_sort=api_p_release_speed&sort_order=desc&min_pas=0&chk_stats_woba=on`;

  const fetchPromises = [
    axios.get<string>(baseballSavantWOBASplitsLeftUrl),
    axios.get<string>(baseballSavantWOBASplitsRightUrl),
  ];
  const [leftResponse, rightResponse] = await Promise.all(fetchPromises);

  const wOBASplitsLeft: Record<string, number> = {};
  const $left = cheerio.load(leftResponse.data);
  $left("#search_results tbody .search_row").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const teamName = $(".player_name").text().trim();
    const wOBA = $("td:nth-child(7)").text().trim();

    wOBASplitsLeft[teamName] = parseFloat(wOBA);
  });

  const wOBASplitsRight: Record<string, number> = {};
  const $right = cheerio.load(rightResponse.data);
  $right("#search_results tbody .search_row").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const teamName = $(".player_name").text().trim();
    const wOBA = $("td:nth-child(7)").text().trim();

    wOBASplitsRight[teamName] = parseFloat(wOBA);
  });

  return Object.keys(wOBASplitsLeft).reduce<WOBASplitsData>((wOBAData, teamName) => {
    wOBAData[teamName] = {
      vsL: wOBASplitsLeft[teamName],
      vsR: wOBASplitsRight[teamName],
    };

    return wOBAData;
  }, {});
};

const formatHeadlineDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

const fetchProbableStarters = async (): Promise<ProbableStarterData[]> => {
  let tomorrow = new Date();
  const todayHeadlineDate = formatHeadlineDate(tomorrow);

  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow
    .toLocaleDateString("zh-Hans-CN", {
      // this locale does the proper ordering for mlb.com route param
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll("/", "-"); // ex: 2022-06-15
  const tomorrowHeadlineDate = formatHeadlineDate(tomorrow);

  const mlbProbableStartersUrl = "https://www.mlb.com/probable-pitchers";
  const tomorrowFormatedDateString = tomorrow.toISOString().split("T")[0]; // ex: 2022-06-16
  const tomorrowStartersUrl = `${mlbProbableStartersUrl}/${tomorrowFormatedDateString}`;

  const requests = await Promise.all([
    axios.get<string>(mlbProbableStartersUrl),
    axios.get<string>(tomorrowStartersUrl),
  ]);

  const todayProbableStarters = parseProbableStarters(requests[0].data);
  const tomorrowProbableStarters = parseProbableStarters(requests[1].data);

  return [
    { headlineDate: todayHeadlineDate, starters: todayProbableStarters },
    { headlineDate: tomorrowHeadlineDate, starters: tomorrowProbableStarters },
  ];
};

const parseProbableStarters = (html: string) => {
  const probableStarters: ProbableStarter[] = [];
  const $mlb = cheerio.load(html);
  $mlb(".probable-pitchers__matchup").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const awayTeamName = $(".probable-pitchers__team-name--away").text().trim();
    const homeTeamName = $(".probable-pitchers__team-name--home").text().trim();

    const $pitcherNames = $(".probable-pitchers__pitcher-name-link");
    const awayPitcherName = $pitcherNames.eq(0).text().trim();
    const homePitcherName = $pitcherNames.eq(1).text().trim();

    probableStarters.push(
      { name: awayPitcherName, team: awayTeamName, opposingTeam: homeTeamName },
      { name: homePitcherName, team: homeTeamName, opposingTeam: awayTeamName }
    );
  });

  return probableStarters;
};

interface StreamFinderDay {
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

export const fetchStreamFinderData = async (): Promise<StreamFinderDay[]> => {
  const [stuffPlusData, wOBASplits, probableStarters] = await Promise.all([
    fetchStuffPlusGoogleDocCurrentSeasonData(),
    fetchBaseballSavantWOBASplits(),
    fetchProbableStarters(),
  ]);

  const today = combineStreamFinderData(stuffPlusData, wOBASplits, probableStarters[0]);
  const tomorrow = combineStreamFinderData(stuffPlusData, wOBASplits, probableStarters[1]);

  return [today, tomorrow];
};

const combineStreamFinderData = (
  stuffPlusData: PlayerData[],
  wOBASplits: WOBASplitsData,
  probableStarters: ProbableStarterData
): StreamFinderDay => {
  const starters = probableStarters.starters.reduce<StreamFinderPitcherData[]>((results, probableStarter) => {
    // TODO: Convert the stuff data to a map so we can lookup isntead of iterating
    const pitcherStuffData = stuffPlusData.find((data) => data.name === probableStarter.name);
    if (pitcherStuffData?.pitchingPlus == null || pitcherStuffData?.handedness == null) {
      return results;
    }

    const opposingTeamAbbrev = mlbTeamNameToAbbrev[probableStarter.opposingTeam];
    const teamSplits = wOBASplits[opposingTeamAbbrev];
    const wOBAAgainstHandSplit = pitcherStuffData.handedness === "R" ? teamSplits.vsR : teamSplits.vsL;

    const baseData: StreamFinderBasePitcherData = {
      name: probableStarter.name,
      pitchingPlus: pitcherStuffData.pitchingPlus,
      wOBAAgainstHandSplit,
    };

    results.push({
      ...baseData,
      streamScore: generateStreamScore(baseData),
    });

    return results;
  }, []);

  return { data: starters, dateHeadline: probableStarters.headlineDate };
};

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
