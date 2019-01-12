import React from "react";

import profilePic from "./profile.jpg";
import { Link } from "gatsby";
import SearchBox from "./SearchBox";

class Navigation extends React.Component {
  render() {
    return (
      <div className="main-navigation">
        <Link className="logo" to="/">
          <img src={profilePic} alt={`Vojtech Ruzicka`} />
        </Link>
        <div className="navigation">
          <div className="blog-name">
            <Link to="/">Vojtech Ruzicka's Programming Blog</Link>
          </div>
          <div className="menu-items">
            <Link to="/">Home</Link>
            <Link to="/archives/">Archives</Link>
            <Link to="/about/">About me</Link>
            <SearchBox/>
          </div>

        </div>
      </div>
    );
  }
}

export default Navigation;
