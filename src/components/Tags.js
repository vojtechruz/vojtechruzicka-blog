import React from "react";
import { Link } from "gatsby";
import _ from "lodash";

class Tags extends React.Component {
  render() {
    if (!this.props.tags) {
      return null;
    }

    return (
      <div className="post-tags">
        <ul>
          {this.props.tags.map((tag, index) => {
            return (
              <li key={index}>
                <Link to={"/tags/" + _.kebabCase(tag)}>#{tag}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Tags;
