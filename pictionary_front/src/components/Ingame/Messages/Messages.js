// eslint-disable-next-line
import React from "react";
import "./Message.css";

const Messages = ({messages}) => {
  return (
    <ul>
      {messages.map((message, index) =>(
        <li className={`list-group-item list-group-item-${message.type}`} key={index}>{message.msg}</li>
      ))}
    </ul>
  );
};

export default Messages;
