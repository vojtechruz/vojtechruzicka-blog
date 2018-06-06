import React from "react";

import {rhythm} from "../utils/typography";
import docsearch from "docsearch.js";

class Bio extends React.Component {

    render() {

        return (
            <div>
                THIS IS SEARCH
                <input className="search-box">
                </input>
            </div>
        );
    }

    componentDidMount() {
        docsearch({
            apiKey: '467e44d2366ac0de7f99703feb47c8b6',
            indexName: 'vojtechruzicka',
            inputSelector: '.search-box',
            debug: true
        });
    }
}

export default Bio;
