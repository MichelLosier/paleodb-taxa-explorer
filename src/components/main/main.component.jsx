import React from 'react';

import SearchBar from '../search-bar/search-bar.component';

class Main extends React.Component {
    constructor(){
        super();
        this.state = {
            selectedNode:'',
            nodes:[]
        }
    }

    handleNodeSelect= (nodeId) => {
       this.setState({
           selectedNode: nodeId
       });
    }

    render(){
        return(
            <div className="main">
                <div className="layout-container header">
                    <h1>Paleobio DB Taxonomy Explorer</h1>
                </div>
                <div className="layout-container">
                    <SearchBar
                        onNodeSelect={this.handleNodeSelect}
                    />
                </div>
            </div>
        )
    }
}

export default Main;