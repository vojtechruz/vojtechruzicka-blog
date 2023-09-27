import React from "react";

import { rhythm } from "../utils/typography";
import { Link } from "gatsby";

class Bio extends React.Component {
  render() {
    const { name, bio, avatar, homepage } = this.props.author;
    let link;
    if (homepage.startsWith("http")) {
      link = (
        <a href={homepage} target="_blank" rel="noreferrer">
          {name}
        </a>
      );
    } else {
      link = <Link to={homepage}>{name}</Link>;
    }
    let biography;
    if (bio) {
      biography = <div>{bio}</div>;
    }

    return (
      <div
        className="bio"
        style={{
          display: "flex",
          marginBottom: rhythm(1.0),
          marginTop: rhythm(1),
          alignItems: "center",
        }}
      >
        <img
          src={`/authors/${avatar}`}
          alt={"Author: " + name}
          style={{
            borderRadius: 50,
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
          }}
          title={"Author: " + name}
        />
        <div>
          <div>
            <strong>{link}</strong>
          </div>
          {biography}
        </div>
      </div>
    );
  }
}

export default Bio;
