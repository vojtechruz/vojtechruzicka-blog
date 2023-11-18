import React from "react";

class CodePen extends React.Component {
  render() {
    return <iframe height="400" scrolling="no" src={this.props.url+"?height=400&amp;&amp;default-tab=result"} frameborder="no" allowtransparency="true" allowfullscreen="true" style={{width: '100%'}}></iframe>;
  }
}

export default CodePen;
