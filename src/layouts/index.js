import React from 'react'
import { Container } from 'react-responsive-grid'

import { rhythm, scale } from '../utils/typography'
import './index.scss';
import Navigation from "../components/Navigation";
import FollowMe from "../components/FollowMe";
import {Helmet} from "react-helmet";

class Template extends React.Component {
  render() {
    const { location, children } = this.props

    let rootPath = `/`;
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`
    }

    return (
      <Container
        style={{
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <Helmet>
          <link rel="icon" type="image/png" href="favicon.png" />
        </Helmet>
        <Navigation/>
        {children()}
        <FollowMe/>
      </Container>
    )
  }
}

export default Template
