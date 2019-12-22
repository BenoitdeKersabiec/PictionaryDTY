import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter as Router, Route} from "react-router-dom";

// import components
import Login from "./components/login.component";
import Register from "./components/register.component";
import Welcome from "./components/welcome.component";
import DashBoard from "./components/dashboard.component";
import Lobby from "./components/lobby.component";
import Ingame from "./components/Ingame/Ingame";
import Words from "./components/words.component";
import {UserData} from "./Context";

function App() {
  return (
    <Router>
      <UserData>
        <div className="container">
          <Route path="/" exact component={Welcome}/>
          <Route path="/users/register" exact component={Register}/>
          <Route path="/users/login" exact component={Login} />
          <Route path="/dashboard" exact component={DashBoard} />
          <Route path="/lobby" exact component={Lobby}/>
          <Route path="/ingame/" component={Ingame}/>
          <Route path="/words/" component={Words}/>
        </div>
      </UserData>
    </Router>

  );
}

export default App;
