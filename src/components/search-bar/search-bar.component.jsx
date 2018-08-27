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
        this.setSearchResults([]);
        this.props.onNodeSelect(oid);
    }

    searchForTaxa = (term) => {
        pdbClient.getTaxaByNameMatch(term).then((results)=>{
            this.setSearchResults(results);
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
            }, 2000)
        })
    }

    handleChange = (evt) => {
        clearTimeout(this.state.timeout);
        this.searchTimeout(evt.target.value);
    }

    render(){
        return(
            <div class="search-bar">
                <input
                    //value={this.state.value}
                    onChange={this.handleChange}
                />
                <SearchResults
                    results={this.state.searchResults.records}
                    onRecordSelect={this.handleRecordSelection}
                />
            </div>
        )
    }
}

export default SearchBar;