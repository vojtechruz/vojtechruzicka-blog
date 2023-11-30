import React from "react";
import Warning from "./Warning";

class Video extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      showControls: false,
    };
  }

  render() {
    return (
      <div className="responsive-video" title={this.props.title}>
        <video
          loop
          muted
          autoPlay
          onMouseEnter={() =>
            this.setState(() => ({
              showControls: true,
            }))
          }
          onMouseLeave={() =>
            this.setState(() => ({
              showControls: false,
            }))
          }
          controls={this.state.showControls}
        >
          <source src={`/videos/${this.props.src}.webm`} type="video/webm" />
          <source src={`/videos/${this.props.src}.mp4`} type="video/mp4" />
          <Warning>Your browser does not support video.</Warning>
        </video>
      </div>
    );
  }
}

export default Video;
