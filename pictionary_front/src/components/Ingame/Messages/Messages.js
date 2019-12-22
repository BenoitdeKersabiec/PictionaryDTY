import React from "react";
import "./Message.css";

const Messages = ({messages}) => {
  return (
    <ul>
      {messages.map((message, index) =>(
        <li className="list-group-item" key={index}>{message}</li>
      ))}
    </ul>
  );
};

export default Messages;
