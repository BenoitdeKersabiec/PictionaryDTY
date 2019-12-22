import React from "react";

const style = {
  textAlign: "center",
  padding: "0px",
  position: "fixed",
  bottom: "0%",
  height: "60px",
};

const phantom = {
  display: "block",
  padding: "20px",
  height: "60px",
  width: "100%",
};

function Footer({children}) {
  return (
    <div>
      <div style={phantom} />
      <div style={style}>
        { children }
      </div>
    </div>
  );
}

export default Footer;
