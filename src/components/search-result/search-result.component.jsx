import React from 'react';
import {taxaRanks} from '../../constants/taxaRank.constants';

class SearchResult extends React.Component {
    constructor(){
        super();
    }

    render(){
        const {record} = this.props;
        return(
            <div className="search-result">
                <div className="name">
                    {record.nam}
                </div>
                <div className="taxa-rank">
                    {taxaRanks[record.rnk]}
                </div>
            </div>
        )
    }
}

export default SearchResult;