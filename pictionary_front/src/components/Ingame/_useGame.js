import {useEffect, useRef, useState} from "react";
import socketIOClient from "socket.io-client";

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const socketRef = useRef();
  const token = localStorage.getItem("token");
  const partyID = localStorage.getItem("partyID");
  const [x, y]=[100, 100];
  const DrawingData = [(x, y)];

  useEffect(() => {
    socketRef.current = socketIOClient("http://localhost:7001");

    socketRef.current.emit("new-user", {partyID, token});

    socketRef.current.on("newChatMessage", ({message})=> {
      setMessages((messages) => [message, ...messages]);
    });

    socketRef.current.on("playerList", (playerList)=> {
      setPlayers(playerList);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token, partyID]);

  const sendMessage = ({message}) => {
    console.log(message);
    console.log(partyID);
    socketRef.current.emit("newChatMessage", {message, token, partyID});
  };
  console.log(players);
  return {messages, sendMessage, players, DrawingData};
};

export default useChat;
