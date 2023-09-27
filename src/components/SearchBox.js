import React from "react";
import { DocSearch } from "@docsearch/react";

class SearchBox extends React.Component {
  inputClass = "search-box";

  render() {
    if (this.props.inputClass) {
      this.inputClass = this.props.inputClass;
    }

    return (
      <span className="search-box-container">
        <DocSearch
          appId={process.env.DOCSEARCH_APP_ID}
          indexName={process.env.DOCSEARCH_INDEX_NAME}
          apiKey={process.env.DOCSEARCH_API_KEY}
        />
      </span>
    );
  }
}

export default SearchBox;
