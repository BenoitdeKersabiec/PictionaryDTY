import React from "react";

const PlayerList = ({playerList}) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">
                    Player:
          </th>
          <th scope="col">
                    Score:
          </th>
        </tr>
      </thead>
      <tbody>
        {playerList.map((player, index) =>(
          <tr>
            <td >{player.name}</td>
            <td >{player.score}</td>
          </tr>

        ))}
      </tbody>
    </table>

  );
};

export default PlayerList;
