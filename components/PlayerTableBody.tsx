import { FunctionComponent } from "react";
import { PlayerData } from "../pages";

interface Props {
  sortedPlayerData: PlayerData[];
}

const PlayerTableBody: FunctionComponent<Props> = ({ sortedPlayerData }) => {
  const playerRows = sortedPlayerData.map((player) => {
    return (
      <tr key={player.mlbId}>
        <td>{player.name}</td>
        <td>{player.hand}</td>
        <td>{player.pitchCount}</td>
        <td>{player.stuffPlus}</td>
        <td>{player.locationPlus}</td>
        <td>{player.pitchingPlus}</td>
      </tr>
    );
  });

  return <>{playerRows}</>;
};

export default PlayerTableBody;
