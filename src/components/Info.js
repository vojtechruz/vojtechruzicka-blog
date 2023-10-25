import React from "react";

class Info extends React.Component {
  render() {
    return <div className="msg-info">{this.props.children}</div>;
  }
}

export default Info;
