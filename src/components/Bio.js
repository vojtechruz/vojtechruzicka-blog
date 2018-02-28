import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import profilePic from './profile.jpg'
import { rhythm } from '../utils/typography'

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          marginBottom: rhythm(2.5),
        }}
      >
        <img
          src={profilePic}
          alt={`Vojtech Ruzicka`}
          style={{
              borderRadius:50,
              marginRight: rhythm(1 / 2),
              marginBottom: 0,
              width: rhythm(2),
              height: rhythm(2),
          }}
        />
        <div>
            <div>Written by <strong>Vojtech Ruzicka</strong></div>
          <a href="https://twitter.com/vojtechruzicka">
            Follow me on Twitter
          </a>
        </div>
      </div>
    )
  }
}

export default Bio
