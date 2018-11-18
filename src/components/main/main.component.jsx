import React from 'react';

import SearchBar from '../search-bar/search-bar.component';
import TaxonomyTree from '../taxonomy-tree/taxonomy-tree.component';

class Main extends React.Component {
    constructor(){
        super();
        this.state = {
            selectedNode:{},
            graph:{}
        }
    }

    handleNodeSelect = (nodeId) => {
       this.setState({
           selectedNode: nodeId
       });
    }

    createGraph = (root) => {

    }

    render(){
        const {graph, selectedNode} = this.state;
        return(
            <div className="main">
                <div className="layout-container header">
                    <h1>Paleobio DB Taxonomy Explorer</h1>
                </div>
                <div className="layout-container">
                    <SearchBar
                        onRecordSelect={this.handleNodeSelect}
                    />
                </div>
                <div className="layout-container">
                    <TaxonomyTree
                        onNodeClick={this.handleNodeSelect}
                        selectedNode={selectedNode}
                        graph={graph}
                    />
                </div>
            </div>
        )
    }
}

export default Main;