import React from "react";
import AppContainer from "./route/routers";

class App extends React.Component {
  render() {
    return (
      <div className="Layout-App">
        <AppContainer />
      </div>
    );
  }
}

export default App;