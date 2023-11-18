import React from "react";

class SeriesTableOfContents extends React.Component {
  render(props) {
    return (<div className="series-table-of-content">
      <div>All posts in the {this.props.seriesInfo.series} series</div>
      <ol>
        {
          this.props.seriesInfo.posts.map(p => {
            if(p.isCurrent) {
              return <li className="series-current">{p.title}</li>
            }
            return <li><a href={p.path}>{p.title}</a></li>
          })
        }
      </ol>
    </div>);
  }
}

export default SeriesTableOfContents;
