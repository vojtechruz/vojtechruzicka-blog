import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";

class PostHeader extends React.Component {
  render() {
    return (
      <div>
        <GatsbyImage
          className="post-header-featured-image"
          image={
            this.props.frontmatter.featuredImage.childImageSharp.gatsbyImageData
          }
          title={this.props.frontmatter.title}
          alt={this.props.frontmatter.title}
        />
        <div>{this.props.frontmatter.excerpt}</div>
        <hr className="post-header-divider" />
      </div>
    );
  }
}

export default PostHeader;
