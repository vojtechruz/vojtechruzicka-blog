import React from "react";
import { Container } from "react-responsive-grid";

import { rhythm } from "../utils/typography";
import "./index.scss";
import Navigation from "../components/Navigation";
import FollowMe from "../components/FollowMe";
import { Helmet } from "react-helmet";
import SearchBox from "../components/SearchBox";

class Template extends React.Component {
  render() {
    const { location, children } = this.props;

    let rootPath = `/`;
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`;
    }

    return (
      <Container className="content-root"
        style={{
          maxWidth: rhythm(28),
          padding: `${rhythm(1.5)} ${rhythm(1.5)}`
        }}
      >
        <Helmet>
          <html lang="en" />
          <link rel="icon" type="image/png" href="/favicon.png" />
        </Helmet>
        <Navigation />
        <SearchBox/>
        {children()}
        <FollowMe />
      </Container>
    );
  }
}

export default Template;
