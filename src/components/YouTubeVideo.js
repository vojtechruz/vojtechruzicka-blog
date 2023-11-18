import React from "react";

class YouTubeVideo extends React.Component {
  render() {
    return (<div className="responsive-video">
      <iframe width="560" height="349" src={"https://www.youtube.com/embed/"+this.props.code} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen></iframe>
    </div>)
  }
}

export default YouTubeVideo;
