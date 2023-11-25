import React from "react";

class CodePen extends React.Component {
  render() {
    return (
      <iframe
        title={this.props.title}
        height="400"
        scrolling="no"
        src={this.props.url + "?height=400&amp;&amp;default-tab=result"}
        frameBorder="no"
        allowtransparency="true"
        allowFullScreen={true}
        style={{ width: "100%" }}
      ></iframe>
    );
  }
}

export default CodePen;
