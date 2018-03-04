import React from 'react'
import get from 'lodash/get'
import Helmet from 'react-helmet'

import { rhythm } from '../../utils/typography'

class AboutPage extends React.Component {
    render() {
        const siteTitle = get(this, 'props.data.site.siteMetadata.title')

        return (
            <div className="about-page">
                <Helmet title={siteTitle} />
                <h1>About</h1>
                <strong>Get notified about the newest posts</strong>
                <ul>
                    <li><a href="https://twitter.com/vojtechruzicka">Follow @vojtechruzicka</a></li>
                    <li><a href="http://eepurl.com/bZ0waf">Receive new posts by email</a></li>
                    <li><a href="http://vojtechruzicka.com/feed/">Subscribe to RSS Feed</a></li>
                    <li><a href="http://google.com/+Vojtechruzickablog">Follow +Vojtechruzickablog</a></li>
                </ul>

                <strong>Contact me</strong>
                <ul>
                    <li><a href="mailto:vojtech.ruz@gmail.com">vojtech.ruz@gmail.com</a></li>
                </ul>

                <strong>Additional links</strong>
                <ul>
                    <li><a href="https://www.linkedin.com/in/vojtechruzicka">LinkedIn profile</a></li>
                    <li><a href="https://github.com/vojtechruz">GitHub profile</a></li>
                    <li><a href="http://stackoverflow.com/users/4560142/vojtech-ruzicka">Stack Overflow profile</a></li>
                </ul>
            </div>
        )
    }
}

export default AboutPage

export const pageQuery = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
