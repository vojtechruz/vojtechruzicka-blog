import React from "react";

import profilePic from "./profile.jpg";
import { rhythm } from "../utils/typography";
import Link from "gatsby-link";

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: "flex",
          marginBottom: rhythm(1.0),
          marginTop: rhythm(0.5)
        }}
      >
        <img
          src={profilePic}
          alt={`Vojtech Ruzicka`}
          style={{
            borderRadius: 50,
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2)
          }}
        />
        <div style={{ paddingTop: 0.5 + "rem" }}>
          Written by
          <strong>
            <Link to="/about">Vojtech Ruzicka</Link>
          </strong>
        </div>
      </div>
    );
  }
}

export default Bio;
