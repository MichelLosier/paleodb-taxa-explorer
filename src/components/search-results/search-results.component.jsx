import React from 'react';

class SearchResults extends React.Component {
    constructor(){
        super();
    }

    handleClick = (oid) => {
        this.props.onRecordSelect(oid);
    }

    results = () => {
        const {results} = this.props;
        const recordList = results.map((record)=>{
            return(
                <li 
                    id={record.oid}
                    key={record.oid}
                    onClick={()=>{this.handleClick(record.oid)}}
                >
                    {record.nam}
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

export default SearchResults;