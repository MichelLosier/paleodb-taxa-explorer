import React from 'react';

import PaleodbClientService from '../../services/paleodbClient.service';

import SearchBar from '../search-bar/search-bar.component';
import TaxonomyTree from '../taxonomy-tree/taxonomy-tree.component';

import {Taxa, taxaFactory} from '../../models/taxa';

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
    

    createHierarchicalGraph = (root, nodes) => {
        console.log(root)
        let _root = Object.assign({}, root);
        const _nodes = [...nodes];

        _root = this.findChildren(_root, _nodes);
        return _root;
    }

    findChildren = (root, nodes) => {
        root.children=[];
        for (let i = 0; i < nodes.length; i++) {
            let node = Object.assign({},nodes[i]);
            node.children = []
            if (node.parent == root._id && node._id != root._id){
                let child = this.findChildren(node, nodes);
                root.children.push(child)
            }
        }
        return root;
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
                        selectedNode={selectedNode}
                        graph={this.createHierarchicalGraph(selectedNode, nodes)}
                    />
                </div>
            </div>
        )
    }
}

export default Main;