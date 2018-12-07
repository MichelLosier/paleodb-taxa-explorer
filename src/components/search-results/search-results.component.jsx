import React from 'react';
import PropTypes from 'prop-types';

import SearchResult from '../search-result/search-result.component';

class SearchResults extends React.Component {
    constructor(){
        super();
    }

    handleClick = (record) => {
        this.props.onRecordSelect(record);
    }

    results = () => {
        const {results} = this.props;
        let count = -1;
        const recordList = results.map((record)=>{
            count++
            return(
                <li 
                    id={record.oid}
                    key={record.oid + "-" + count}
                    onClick={()=>{this.handleClick(record)}}
                >
                    <SearchResult
                        record={record}
                    />
                </li>   
            )

        })
        return(
            <ul>
                {recordList}
            </ul>
        )
    }

    render(){
        return(
            <div className="search-results">
                {this.props.results&&this.results()}
            </div>
        )
    }
}

SearchResults.propTypes = {
    //handle selection of record
    onRecordSelect: PropTypes.func,
    //array of records from search query
    results: PropTypes.array
}


export default SearchResults;