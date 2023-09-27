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
          appId={process.env.GATSBY_DOCSEARCH_APP_ID}
          indexName={process.env.GATSBY_DOCSEARCH_INDEX_NAME}
          apiKey={process.env.GATSBY_DOCSEARCH_API_KEY}
        />
      </span>
    );
  }
}

export default SearchBox;
