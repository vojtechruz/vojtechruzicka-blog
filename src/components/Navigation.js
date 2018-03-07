import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'

import {rhythm} from '../utils/typography'
import Link from "gatsby-link";

class Bio extends React.Component {
    render() {
        return (<div>
                    <h1 className="blog-name"><Link to="/">Vojtech Ruzicka's Programming blog</Link></h1>
                    <div className="menu-items">
                        <Link to="/">Home</Link>
                        <Link to="/tags">Archives</Link>
                        <Link to="/about">About me</Link>
                        <hr/>
                    </div>
            </div>
        )
    }
}

export default Bio
