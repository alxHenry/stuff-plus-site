import axios from "axios";
import * as cheerio from "cheerio";
import { TeamNameToParkFactor } from "../types/streamFinder";

export const fetchParkFactors = async (): Promise<TeamNameToParkFactor> => {
  const fantasyProsParkFactorsUrl = "https://www.fantasypros.com/mlb/park-factors.php";
  const response = await axios.get<string>(fantasyProsParkFactorsUrl);
  const teamNameToParkFactor: TeamNameToParkFactor = {};

  const $fangraphs = cheerio.load(response.data);
  $fangraphs("table#data-table tbody tr.A").each((_index, elem) => {
    const $ = cheerio.load(elem);
    const teamNameTag = $("td small");
    const cells = $("td");

    const teamName = teamNameTag.text().trim().slice(1, -1); // Trim off the parens
    const runsParkFactor = cells.eq(1).text().trim();

    teamNameToParkFactor[teamName] = parseFloat(runsParkFactor);
  });

  return teamNameToParkFactor;
};
