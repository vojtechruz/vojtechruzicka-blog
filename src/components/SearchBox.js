const React = require("react");

class Bio extends React.Component {

    render() {

        return (
            <span className="search-box-container">
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="search-icon" onClick={this.handleSearchIconClick.bind(this)}><g><path
                    d="m34.8 30.2c0.3 0.3 0.3 0.8 0 1.1l-3.4 3.5c-0.1 0.1-0.4 0.2-0.6 0.2s-0.4-0.1-0.6-0.2l-6.5-6.8c-2 1.2-4.1 1.8-6.3 1.8-6.8 0-12.4-5.5-12.4-12.4s5.6-12.4 12.4-12.4 12.4 5.5 12.4 12.4c0 2.1-0.6 4.2-1.7 6.1z m-17.4-20.4c-4.1 0-7.6 3.4-7.6 7.6s3.5 7.6 7.6 7.6 7.5-3.4 7.5-7.6-3.3-7.6-7.5-7.6z"></path></g></svg>
                <input className="search-box" placeholder="Search" ref={(input) => { this.searchInput = input;}}>
                </input>
            </span>
        );
    }

    componentDidMount() {
        if(window) {
            const docsearch = require("docsearch.js");
            docsearch({
                apiKey: '467e44d2366ac0de7f99703feb47c8b6',
                indexName: 'vojtechruzicka',
                inputSelector: '.search-box',
                debug: false,
            });
        }
    }

    handleSearchIconClick() {
        this.searchInput.focus();
    }
}

export default Bio;
