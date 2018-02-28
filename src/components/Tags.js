import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import profilePic from './profile.jpg'
import { rhythm } from '../utils/typography'

class Tags extends React.Component {

  render() {
if(!this.props.tags) {
    return null;
}

return (
    <div>
        <p>Tagged with:</p>
        <ul>
            {
                this.props.tags.map((tag, index) => {
                    return <li key={index}>{tag}</li>;
                })
            }
        </ul>
    </div>);
  }
}

export default Tags
