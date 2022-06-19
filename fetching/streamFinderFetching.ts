import * as cheerio from "cheerio";
import axios from "axios";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { PlayerData } from "../pages";
import { StreamFinderDay, StreamFinderPitcherData, StreamFinderBasePitcherData } from "../pages/streamFinder";
import {
  ProbableStarterData,
  ProbableStarter,
  WOBASplitsData,
  NameToFangraphsPitcherData,
} from "../types/streamFinder";
import { LEAGUE_AVG_FIP, LEAGUE_AVG_SIERA, mlbTeamNameToAbbrev } from "../util/mlb";
import { generatePitcherMatchupScore, generatePitcherQualityScore, generateStreamScore } from "../util/statistics";
import { sheetRowToPlayerData } from "../util/stuffPlusOriginSheetUtils";

export const fetchStreamFinderData = async (): Promise<StreamFinderDay[]> => {
  const [stuffPlusData, wOBASplits, probableStarters, fangraphsDataMap] = await Promise.all([
    fetchStuffPlusGoogleDocCurrentSeasonData(),
    fetchBaseballSavantWOBASplits(),
    fetchProbableStarters(),
    fetchFangraphsPitchingStats(),
  ]);

  const today = combineStreamFinderData(stuffPlusData, wOBASplits, probableStarters[0], fangraphsDataMap);
  const tomorrow = combineStreamFinderData(stuffPlusData, wOBASplits, probableStarters[1], fangraphsDataMap);

  return [today, tomorrow];
};

export const fetchProbableStarters = async (): Promise<ProbableStarterData[]> => {
  const mlbProbableStartersUrl = "https://www.mlb.com/probable-pitchers";

  const today = new Date();
  const todayHeadlineDate = formatHeadlineDate(today);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowHeadlineDate = formatHeadlineDate(tomorrow);

  const todayStartersUrl = `${mlbProbableStartersUrl}/${formatMlbRouteParamDate(today)}`;
  const tomorrowStartersUrl = `${mlbProbableStartersUrl}/${formatMlbRouteParamDate(tomorrow)}`;

  const requests = await Promise.all([axios.get<string>(todayStartersUrl), axios.get<string>(tomorrowStartersUrl)]);

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

export const combineStreamFinderData = (
  stuffPlusData: PlayerData[],
  wOBASplits: WOBASplitsData,
  probableStarters: ProbableStarterData,
  fangraphsDataMap: NameToFangraphsPitcherData
): StreamFinderDay => {
  const starters = probableStarters.starters.reduce<Record<string, StreamFinderPitcherData>>(
    (results, probableStarter) => {
      // TODO: Convert the stuff data to a map so we can lookup isntead of iterating
      const pitcherStuffData = stuffPlusData.find((data) => data.name === probableStarter.name);
      if (pitcherStuffData?.pitchingPlus == null || pitcherStuffData?.handedness == null) {
        return results;
      }

      const fangraphsData = fangraphsDataMap[probableStarter.name] ?? { fip: LEAGUE_AVG_FIP, siera: LEAGUE_AVG_SIERA };
      const { fip, siera } = fangraphsData;

      const opposingTeamAbbrev = mlbTeamNameToAbbrev[probableStarter.opposingTeam];
      const teamSplits = wOBASplits[opposingTeamAbbrev];
      const wOBAAgainstHandSplit = pitcherStuffData.handedness === "R" ? teamSplits.vsR : teamSplits.vsL;

      const qualityData = { pitchingPlus: pitcherStuffData.pitchingPlus, fip, siera };
      const matchupData = { wOBAAgainstHandSplit };

      const quality = generatePitcherQualityScore(qualityData);
      const matchup = generatePitcherMatchupScore(matchupData);

      results[probableStarter.name] = {
        name: probableStarter.name,
        qualityBreakdown: quality.breakdown,
        qualityScore: roundToTwoDecimalPlaces(quality.score),
        matchupBreakdown: matchup.breakdown,
        matchupScore: roundToTwoDecimalPlaces(matchup.score),
        streamScore: roundToTwoDecimalPlaces(
          generateStreamScore({
            ...qualityData,
            ...matchupData,
          }).score
        ),
      };
      return results;
    },
    {}
  );

  return { data: starters, dateHeadline: probableStarters.headlineDate };
};

const roundToTwoDecimalPlaces = (num: number) => Math.round(num * 100 + Number.EPSILON) / 100;

export const fetchStuffPlusGoogleDocCurrentSeasonData = async (): Promise<PlayerData[]> => {
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

export const fetchBaseballSavantWOBASplits = async (): Promise<WOBASplitsData> => {
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

export const fetchFangraphsPitchingStats = async (): Promise<NameToFangraphsPitcherData> => {
  const fangraphsPitchingStatsUrl =
    "https://www.fangraphs.com/leaders.aspx?pos=all&stats=pit&lg=all&qual=30&type=1&season=2022&month=0&season1=2022&ind=0&team=0&rost=0&age=0&filter=&players=0&startdate=2022-01-01&enddate=2022-12-31&page=1_700";
  const response = await axios.get<string>(fangraphsPitchingStatsUrl);
  const nameToFangraphsPitcherData: NameToFangraphsPitcherData = {};

  const $fangraphs = cheerio.load(response.data);
  $fangraphs("div#LeaderBoard1_dg1 tbody tr.rgRow").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const cells = $("td");

    const playerName = cells.eq(1).text().trim();
    const siera = cells.eq(-1).text().trim();
    const fip = cells.eq(-4).text().trim();

    nameToFangraphsPitcherData[playerName] = {
      fip: parseFloat(fip),
      siera: parseFloat(siera),
    };
  });

  return nameToFangraphsPitcherData;
};

const formatHeadlineDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;

const formatMlbRouteParamDate = (date: Date) => {
  return date
    .toLocaleDateString("zh-Hans-CN", {
      // this locale does the proper ordering for mlb.com route param
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-"); // ex: 2022-06-15
};
