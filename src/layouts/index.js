import React from 'react'
import Link from 'gatsby-link'
import { Container } from 'react-responsive-grid'
require("prismjs/themes/prism-coy.css");

import { rhythm, scale } from '../utils/typography'
import './index.scss';

class Template extends React.Component {
  render() {
    const { location, children } = this.props
    let header

    let rootPath = `/`
    if (typeof __PREFIX_PATHS__ !== `undefined` && __PREFIX_PATHS__) {
      rootPath = __PATH_PREFIX__ + `/`
    }

    if (location.pathname === rootPath) {
      header = (
          <p>HO HO HO</p>
      )
    }
    return (
      <Container
        style={{
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        {header}
        {children()}
      </Container>
    )
  }
}

export default Template
