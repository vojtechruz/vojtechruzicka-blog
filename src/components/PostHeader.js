import React from "react";
import { Link } from "gatsby";
import { rhythm } from "../utils/typography";
import Tags from "./Tags";
import { GatsbyImage } from "gatsby-plugin-image";

class PostHeader extends React.Component {
  render() {
    return (
      <div>
        <GatsbyImage
          image={
            this.props.frontmatter.featuredImage.childImageSharp.gatsbyImageData
          }
          title={this.props.frontmatter.title}
          alt={this.props.frontmatter.title}
        />
        <div>{this.props.frontmatter.excerpt}</div>
      </div>
    );
  }
}

export default PostHeader;
