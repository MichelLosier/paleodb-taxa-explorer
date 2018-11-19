import React from 'react';

import PaleodbClientService from '../../services/paleodbClient.service';

import SearchBar from '../search-bar/search-bar.component';
import TaxonomyTree from '../taxonomy-tree/taxonomy-tree.component';

const pdbClient = new PaleodbClientService();

class Main extends React.Component {
    constructor(){
        super();
        this.state = {
            selectedNode:{},
            graph:null
        }
    }

    handleNodeSelect = (node) => {
       this.createGraph(node).then((graph) => {
            this.setState({
                graph: graph,
                selectedNode: node
            });
       })

    }

    createGraph = (node) => {
        const graph = {
            id: node.oid,
            name: node.nam,
            rank: node.rnk,
            children: [],
        }
        return pdbClient.getTaxaAllChildren(node.oid, 1).then((data) => {
            graph.children = data.records.map((r) => {
                return {
                    id: r.oid,
                    name: r.nam,
                    rank: r.rnk,
                    children:[],
                }
            })
        }).then(() =>{
            console.log(`create graph ${JSON.stringify(graph)}`)
            return graph;
        })
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