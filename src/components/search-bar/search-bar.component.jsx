import React from 'react';
import PropTypes from 'prop-types';

import SearchResults from '../search-results/search-results.component';

import PaleodbClientService from '../../services/paleodbClient.service';
import {debounce} from '../../services/clientHelpers';

const pdbClient = new PaleodbClientService();


class SearchBar extends React.Component {
    constructor(){
        super();
        this.state = {
            value: '',
            searchResults:[],
        }
        this.searchForTaxa = debounce(this.searchForTaxa, 1000);
    }

    searchForTaxa = (term) => {
        pdbClient.getTaxaByNameMatch(term, 20).then((results)=>{
            if (this.state.value == term){
                this.setSearchResults(results.records);
            }       
        })
    }
    
    handleRecordSelection = (record) => {
        this.setState({
            value: '',
            searchResults:[]
        })
        this.props.onRecordSelect(record, true);
    }



    setSearchResults = (results) => {
        this.setState({
            searchResults: results
        })
    }


    handleChange = (evt) => {
        this.setState({value: evt.target.value}, () => {
            if(this.state.value != ""){
                this.searchForTaxa(this.state.value)
            }
        });
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

SearchBar.propTypes = {
    //handler for selection of record
    onRecordSelect: PropTypes.func
}

export default SearchBar;