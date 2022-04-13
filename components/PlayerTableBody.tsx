import { Td, Tr } from "@chakra-ui/react";
import { FunctionComponent } from "react";
import { PlayerData } from "../pages";

interface Props {
  sortedPlayerData: PlayerData[];
}

const PlayerTableBody: FunctionComponent<Props> = ({ sortedPlayerData }) => {
  const playerRows = sortedPlayerData.map((player) => {
    return (
      <Tr key={player.mlbId}>
        <Td>{player.name}</Td>
        <Td>{player.pitchCount}</Td>
        <Td>{player.stuffPlus}</Td>
        <Td>{player.locationPlus}</Td>
        <Td>{player.pitchingPlus}</Td>
      </Tr>
    );
  });

  return <>{playerRows}</>;
};

export default PlayerTableBody;
