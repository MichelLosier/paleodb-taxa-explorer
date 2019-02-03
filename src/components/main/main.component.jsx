import React from 'react';

import PaleodbClientService from '../../services/paleodbClient.service';

import SearchBar from '../search-bar/search-bar.component';
import TaxonomyTree from '../taxonomy-tree/taxonomy-tree.component';

import {Taxa, taxaFactory} from '../../models/taxa';
import {deepCopy} from '../../helpers';

const pdbClient = new PaleodbClientService();

class Main extends React.Component {
    constructor(){
        super();
        this.state = {
            selectedNode:{},
            nodes: []
        }
    }

    handleNodeSelect = (node, resetNodes) => {
        const {selectedNode} = this.state;
        const _node = taxaFactory(node);

        this.fetchChildNodes(_node).then((children) => {
                const _children = this.prepareChildNodes(_node, children)
                let nodes = [..._children, _node];

                this.setState((prevState) => {
                    if(!resetNodes){
                        const nodesDeduplicated = nodes.filter((childNode) => {
                            return (childNode.parent != selectedNode._id ) && (childNode._id != selectedNode._id)
                        })
                        nodes = [...nodesDeduplicated, ...prevState.nodes]
                    }
                    return {
                        nodes: nodes,
                        selectedNode: _node
                    }
                });
        })
    }

    handleNewRoot = (node) => {
        pdbClient.getTaxaByOID(node.parent).then((data) => {
            const parent = data.records[0]
            this.handleNodeSelect(parent)
        })
    }

    handleShowChildren = (parent) => {
       this.fetchChildNodes(parent).then((children) => {
           const _children = this.prepareChildNodes(parent, children)
            this.setState((prevState) => {
                const updatedNodes = [...prevState.nodes];
                const updatedNodesDeduplicated = updatedNodes.filter((node) => {
                    return node.parent != parent._id
                })
                const nodes = [...updatedNodesDeduplicated, ..._children];
                return {nodes: nodes}
            })
       })
    }

    handleHideChildren = (parent) => {
        //console.log('handleHideChildrenCalled with Parent:' + JSON.stringify(parent))
        this.setState((prevState) => {
            const _nodes = [...prevState.nodes];
            this.hideAllDecendants(parent, _nodes);
            return {nodes: _nodes}
        })
    }

    hideAllDecendants = (parent, nodes) => {
       nodes.forEach((node, i, arr) => {
            if (node.parent == parent._id) {
                node.show = false
                arr[i] = node;
                this.hideAllDecendants(node, nodes)
            }
        })
    }

    //grab 1 extra child depth that will be hidden
    fetchChildNodes = (parent, depth) => {
        return pdbClient.getTaxaAllChildren(parent._id, 2).then((data) => {
            const records = data.records;
            //filter out parent which is already known
            const parentIndex = records.findIndex(r => r.oid == parent._id);        
            records.splice(parentIndex, 1);
            const _records = records.filter((record) => { //filter out subjective synonyms
                return !record.tdf
            })
            return _records;
        })
    }

    //create Taxa objects out of records and hide children that are
    prepareChildNodes = (parent, children) => {
        const {selectedNode} = this.state
        const _children = taxaFactory(children);
        return _children.map((child) => {
            if (child.parent == parent._id || child._id == selectedNode._id || child.parent == selectedNode._id){
                child.show = true;
                return child;
            } else {
                child.show = false;
                return child;
            }
        })
    }
    


    render(){
        const {nodes, selectedNode} = this.state;
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
                        onNewRoot={this.handleNewRoot}
                        onShowChildren={this.handleShowChildren}
                        onHideChildren={this.handleHideChildren}
                        selectedNode={deepCopy(selectedNode)}
                        graph={deepCopy(nodes)}
                    />
                </div>
            </div>
        )
    }
}

export default Main;