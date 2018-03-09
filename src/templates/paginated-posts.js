import React from 'react'
import Link from 'gatsby-link'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import Img from 'gatsby-image'

import { rhythm } from '../utils/typography'
import Tags from "../components/Tags";
import PostPreview from "./post-preview";

const _ = require('lodash')

class PaginatedPosts extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const posts = get(this, 'props.pathContext.pagePosts')

    return (
      <div>
        <Helmet title={siteTitle} />
        {
            posts.map(post => {
              return <PostPreview key={post} slug={post}/>
            })
        }
      </div>
    )
  }
}

export default PaginatedPosts
