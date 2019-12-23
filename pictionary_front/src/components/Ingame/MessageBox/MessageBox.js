// eslint-disable-next-line
import React, {useState} from "react";
import "./MessageBox.css";

const MessageBox = ({onSendMessage: pushSendMessage}) => {
  const [message, setMessage] = useState("");


  return (
    <div>
      <div className="card text-white bg-primary footer" >
        <div className="card-header">Take a guess</div>
        <div className="card-body">
          <input
            className="form-control width100"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                pushSendMessage(message);
                setMessage("");
              }
            }}/>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
