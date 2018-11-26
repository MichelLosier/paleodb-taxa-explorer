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
       const _node = this.restructureNodes(node);
       this.fetchChildNodes(_node).then((children) => {
            const _children = this.restructureNodes(children);
            const graph = this.createGraph(_node, _children);
            this.setState({
                graph: graph,
                selectedNode: node
            });
       })
    }

    fetchChildNodes = (parent) => {
        return pdbClient.getTaxaAllChildren(parent.id, 2).then((data) => {
            const records = data.records;
            const parentIndex = records.findIndex(r => r.oid == parent.oid);
            
            records.splice(parentIndex, 1);
            return records;
        })
    }

    restructureNodes = (records) => {
        const imgURL = `https://training.paleobiodb.org/data1.2/taxa/thumb.png?id=`
        if (Array.isArray(records)) {
            return records.map((record) => {
                return ({
                    id: record.oid,
                    name: record.nam,
                    rank: record.rnk,
                    parent: record.par,
                    children: [],
                    img: `${imgURL}${record.img.split(':')[1]}`
                })
            })
        } else if (records.id){
            return records
        } else {
            return ({
                id: records.oid,
                name: records.nam,
                rank: records.rnk,
                parent: records.par,
                children: [],
                img: `${imgURL}${records.img.split(':')[1]}`
            })
        }
    }

    createGraph = (root, records) => {
        const graph = root;
        if (records.length < 1){
            return graph;
        }

        //else we have more work to do. Find children of this node
        for (let i = 0; i < records.length; i++) {
            let record = records[i];

            if (record.parent == root.id){
                graph.children.push(record) 
                records.splice(i,1); //reduce search field
                record = this.createGraph(record, records);
            }
            
        }

        return graph;
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
                <div>
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