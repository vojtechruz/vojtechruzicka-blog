import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-merriweather'
import profilePic from './profile.jpg'
import {rhythm} from '../utils/typography'
import Link from "gatsby-link";

class Navigation extends React.Component {
    render() {
        return (<div className="main-navigation">
                        <Link className="logo" to="/"><img
                            src={profilePic}
                            alt={`Vojtech Ruzicka`}/>
                        </Link>
                    <div className="navigation">
                        <div className="blog-name"><Link to="/">Vojtech Ruzicka's Programming blog</Link></div>
                        <div className="menu-items">
                            <Link to="/">Home</Link>
                            <Link to="/tags">Archives</Link>
                            <Link to="/about">About me</Link>
                        </div>
                    </div>
            </div>
        )
    }
}

export default Navigation
