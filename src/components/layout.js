import React from "react";

import { rhythm } from "../utils/typography";
import "../styles/index.scss";
import Navigation from "../components/Navigation";
import FollowMe from "../components/FollowMe";

class Template extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="content-root"
        style={{
          maxWidth: rhythm(32),
          padding: `${rhythm(1.5)} ${rhythm(1.5)}`
        }}
      >
        <Navigation />
        {children}
        <FollowMe />
      </div>
    );
  }
}

export default Template;
