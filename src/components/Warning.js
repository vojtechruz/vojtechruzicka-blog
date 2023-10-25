import React from "react";

class Warning extends React.Component {
  render() {
    return <div className="msg-warn">{this.props.children}</div>;
  }
}

export default Warning;
