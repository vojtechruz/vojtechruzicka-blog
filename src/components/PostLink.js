import React from "react";
import { Link } from "gatsby";
import { rhythm } from "../utils/typography";
import Tags from "./Tags";
import { GatsbyImage } from "gatsby-plugin-image";

class PostLink extends React.Component {
  render(props) {
    const node = this.props.node;

    return (
      <div>
        <div className="linked-article" key={node.frontmatter.path}>
          <h4
            className="front-post-title"
            style={{
              marginBottom: rhythm(1 / 4),
            }}
          >
            <Link style={{ boxShadow: "none" }} to={node.frontmatter.path}>
              {node.frontmatter.title}
            </Link>
          </h4>
          <small className="front-post-info">
            <span className="front-post-info-date">
              {node.frontmatter.date}
            </span>
            <Tags tags={node.frontmatter.tags} />
          </small>
          <div>
            <Link to={node.frontmatter.path} className="front-post-image">
              <GatsbyImage
                image={
                  node.frontmatter.featuredImage.childImageSharp.gatsbyImageData
                }
                title={node.frontmatter.title}
                alt={node.frontmatter.title}
              />
            </Link>
            <span
              className="front-post-excerpt"
              dangerouslySetInnerHTML={{ __html: node.frontmatter.excerpt }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PostLink;
