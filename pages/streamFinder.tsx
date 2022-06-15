import axios from "axios";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { NextPage } from "next/types";
import { PlayerData } from ".";
import { sheetRowToPlayerData } from "../util/stuffPlusOriginSheetUtils";
import * as cheerio from "cheerio";
import { TableContainer, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import {
  cityStateToAbbrev,
  mlbTeamNameToAbbrev,
  parkFactorColorizerConfig,
  stuffPlusColorizerConfig,
  wOBAColorizerConfig,
} from "../util/mlb";
import { pitchScoreToColorGradient } from "../util/playerTableUtils";

export const ONE_HOUR_IN_SECONDS = 3600;

interface Props {
  readonly streamFinderData: StreamFinderPitcherData[];
}

interface WOBASplitData {
  readonly vsL: number;
  readonly vsR: number;
}
type WOBASplitsData = Record<string, WOBASplitData>;

interface ProbableStarter {
  homeTeamName: string;
  name: string;
  team: string;
  opposingTeam: string;
}

const StreamFinder: NextPage<Props> = ({ streamFinderData }) => {
  const bodyElements = streamFinderData.map((data) => {
    return (
      <Tr key={`${data.name},${data.pitchingPlus}`}>
        <Td>{data.name}</Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.wOBAAgainstHandSplit, wOBAColorizerConfig)}>
          {data.wOBAAgainstHandSplit}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.pitchingPlus, stuffPlusColorizerConfig)}>
          {data.pitchingPlus}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(data.pitchingPlus, parkFactorColorizerConfig)}>
          {data.parkFactor}
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
            <Th>Park Factor</Th>
          </Tr>
        </Thead>
        <Tbody>{bodyElements}</Tbody>
      </Table>
    </TableContainer>
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

const fetchProbableStarters = async (): Promise<ProbableStarter[]> => {
  const mlbProbableStartersUrl = "https://www.mlb.com/probable-pitchers";
  const request = await axios.get<string>(mlbProbableStartersUrl);

  const probableStarters: ProbableStarter[] = [];
  const $mlb = cheerio.load(request.data);
  $mlb(".probable-pitchers__matchup").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const awayTeamName = $(".probable-pitchers__team-name--away").text().trim();
    const homeTeamName = $(".probable-pitchers__team-name--home").text().trim();

    const $pitcherNames = $(".probable-pitchers__pitcher-name-link");
    const awayPitcherName = $pitcherNames.eq(0).text().trim();
    const homePitcherName = $pitcherNames.eq(1).text().trim();

    probableStarters.push(
      { name: awayPitcherName, team: awayTeamName, opposingTeam: homeTeamName, homeTeamName: homeTeamName },
      { name: homePitcherName, team: homeTeamName, opposingTeam: awayTeamName, homeTeamName: homeTeamName }
    );
  });

  return probableStarters;
};

type ParkFactors = Record<string, number>;
const textInsideParenRegExp = /\(([^)]+)\)/;

const fetchParkFactors = async (): Promise<ParkFactors> => {
  const evAnalyticsParkFactors = "https://evanalytics.com/admin/model/datatableQuery.php";
  const request = await axios.get<string>(evAnalyticsParkFactors);
  debugger;
  const data = JSON.parse(request.data);
  const $mlb = cheerio.load(request.data);

  const parkFactors: ParkFactors = {};
  $mlb("#data-table tr.A").each((_index, elem) => {
    const $row = cheerio.load(elem);
    const $cells = $row("td");

    const cityStateStringWithParens = $cells.eq(1).text().trim(); // ex: null(Cincinnati, Ohio)
    const matches = textInsideParenRegExp.exec(cityStateStringWithParens);
    if (matches == null) {
      return;
    }
    const cityState = matches[1];

    const parkFactor = $cells.eq(2).text().trim(); // ex: 1.470
    const teamAbbrev = cityStateToAbbrev[cityState];

    parkFactors[teamAbbrev] = parseInt(parkFactor, 10);
  });

  return parkFactors;
};

interface StreamFinderPitcherData {
  readonly name: string;
  readonly parkFactor: number;
  readonly wOBAAgainstHandSplit: number;
  readonly pitchingPlus: number;
}

export const getStaticProps = async () => {
  const [stuffPlusData, wOBASplits, probableStarters, parkFactors] = await Promise.all([
    fetchStuffPlusGoogleDocCurrentSeasonData(),
    fetchBaseballSavantWOBASplits(),
    fetchProbableStarters(),
    fetchParkFactors(),
  ]);

  const streamFinderData = probableStarters.reduce<StreamFinderPitcherData[]>((results, probableStarter) => {
    // TODO: Convert the stuff data to a map so we can lookup isntead of iterating
    const pitcherStuffData = stuffPlusData.find((data) => data.name === probableStarter.name);
    if (pitcherStuffData?.pitchingPlus == null || pitcherStuffData?.handedness == null) {
      return results;
    }

    const opposingTeamAbbrev = mlbTeamNameToAbbrev[probableStarter.opposingTeam];
    const homeTeamAbbrev = mlbTeamNameToAbbrev[probableStarter.homeTeamName];
    const teamSplits = wOBASplits[opposingTeamAbbrev];
    const wOBAAgainstHandSplit = pitcherStuffData.handedness === "R" ? teamSplits.vsR : teamSplits.vsL;
    const parkFactor = parkFactors[homeTeamAbbrev];

    results.push({
      name: probableStarter.name,
      parkFactor,
      pitchingPlus: pitcherStuffData.pitchingPlus,
      wOBAAgainstHandSplit,
    });
    return results;
  }, []);

  return {
    props: {
      streamFinderData,
    },
    revalidate: ONE_HOUR_IN_SECONDS, // Check for source sheet updates every 12 hours when requests come in
  };
};

export default StreamFinder;
