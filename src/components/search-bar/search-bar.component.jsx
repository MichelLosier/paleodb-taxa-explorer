import React from 'react';

import SearchResults from '../search-results/search-results.component';

import PaleodbClientService from '../../services/paleodbClient.service';

const pdbClient = new PaleodbClientService();

class SearchBar extends React.Component {
    constructor(){
        super();
        this.state = {
            value: '',
            searchResults:[],
            timeout: null
        }
    }
    
    handleRecordSelection = (oid) => {
        this.setState({
            value: '',
            searchResults:[]
        })
        this.props.onNodeSelect(oid);
    }

    searchForTaxa = (term) => {
        pdbClient.getTaxaByNameMatch(term).then((results)=>{
            this.setSearchResults(results.records);
        })
    }

    setSearchResults = (results) => {
        this.setState({
            searchResults: results
        })
    }

    searchTimeout = (term) => {
        this.setState({
            timeout: setTimeout(()=>{
                this.searchForTaxa(term);
            }, 1000)
        })
    }

    handleChange = (evt) => {
        this.setState({value: evt.target.value})
        clearTimeout(this.state.timeout);
        this.searchTimeout(evt.target.value);
    }

    render(){
        const {searchResults, value} = this.state;
        return(
            <div className="search-bar">
                <input
                    value={value}
                    onChange={this.handleChange}
                />
                {(searchResults.length > 0) ?
                    (<SearchResults
                        results={this.state.searchResults}
                        onRecordSelect={this.handleRecordSelection}
                    />) : null
                }

            </div>
        )
    }
}

export default SearchBar;