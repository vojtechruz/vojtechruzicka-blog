import React from "react";
import { DocSearch } from '@docsearch/react';

class SearchBox extends React.Component {

    inputClass = "search-box";

    render() {
        if (this.props.inputClass) {
            this.inputClass = this.props.inputClass;
        }

        return (
            <span className="search-box-container">
               <DocSearch
                    appId="IHPA5BP385"
                    indexName="vojtechruzicka"
                    apiKey="47434b43ba56485815226da96e4de27a"

                />
            </span>
        );
    }
}

export default SearchBox;
