import { Td, Tr } from "@chakra-ui/react";
import { FunctionComponent } from "react";
import { PlayerData } from "../fetching/googleDocFetching";
import { stuffPlusColorizerConfig } from "../util/mlb";
import { pitchScoreToColorGradient } from "../util/playerTableUtils";

interface Props {
  sortedPlayerData: PlayerData[];
}

const PlayerTableBody: FunctionComponent<Props> = ({ sortedPlayerData }) => {
  const playerRows = sortedPlayerData.map((player) => {
    return (
      <Tr key={player.mlbId}>
        <Td>
          {player.name}, {player.handedness}
        </Td>
        <Td>{player.pitchCount}</Td>
        <Td backgroundColor={pitchScoreToColorGradient(player.stuffPlus, stuffPlusColorizerConfig)}>
          {player.stuffPlus}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(player.locationPlus, stuffPlusColorizerConfig)}>
          {player.locationPlus}
        </Td>
        <Td backgroundColor={pitchScoreToColorGradient(player.pitchingPlus, stuffPlusColorizerConfig)}>
          {player.pitchingPlus}
        </Td>
      </Tr>
    );
  });

  return <>{playerRows}</>;
};

export default PlayerTableBody;
