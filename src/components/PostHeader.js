import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import SeriesTableOfContents from "./SeriesTableOfContents";

class PostHeader extends React.Component {
  render() {
    let toc;
    if(this.props.series && this.props.series.series) {
      console.log("XXX")
      toc = <SeriesTableOfContents seriesInfo={this.props.series}></SeriesTableOfContents>
    }

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
        {toc}
      </div>
    );
  }
}

export default PostHeader;
