import React, {useState, createContext} from "react";

export const contextUserData = createContext();

export const UserData = (props) => {
  const [token, setToken] = useState("");
  const [gameID, setGameID] = useState("");
  const [flashMsg, setFlashMsg] = useState({})
  return (
    <contextUserData.Provider value={{token, setToken, gameID, setGameID, flashMsg, setFlashMsg}}>
      {props.children}
    </contextUserData.Provider>
  );
};
