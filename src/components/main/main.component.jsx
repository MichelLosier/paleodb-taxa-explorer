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

    handleNodeSelect = (node) => {
       const _node = taxaFactory(node);
       this.fetchChildNodes(_node).then((children) => {
            const _children = this.prepareChildNodes(_node, children)
            const nodes = [..._children, _node];
            this.setState({
                nodes: nodes,
                selectedNode: _node
            });
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
    fetchChildNodes = (parent) => {
        return pdbClient.getTaxaAllChildren(parent._id, 2).then((data) => {
            const records = data.records;
            //filter out parent which is already known
            const parentIndex = records.findIndex(r => r.oid == parent._id);        
            records.splice(parentIndex, 1);
            return records;
        })
    }

    //create Taxa objects out of records and hide children that are
    prepareChildNodes = (parent, children) => {
        const _children = taxaFactory(children);
        return _children.map((child) => {
            if (child.parent == parent._id){
                child.show = true;
                return child;
            } else {
                child.show = false;
                return child;
            }
        })
    }
    //duplication happening somewhere
    _createHierarchicalGraph = (root, nodes) => {
        if (nodes.length < 1){
            return root
        }

        //else we have more work to do. Find children of this node
        for (let i = 0; i < nodes.length; i++) {
            let node = Object.assign({},nodes[i]);
            // if (node._id == root._id){
            //     continue;
            // }
            if (node.parent == root._id){
                nodes.splice(i,1);
                let child = this.createHierarchicalGraph(node, nodes);
                root.children.push(child);
                console.log(`nodes length: ${nodes.length}`)
                console.log(`root: ${root._id} ${root.name} added child: ${child._id} ${child.name}`)
            } 
        }
        return this.createHierarchicalGraph(root, nodes);
    }

    createHierarchicalGraph = (root, nodes) => {
       
        root = this.findChildren(root, nodes);
        return root;
    }

    findChildren = (root, nodes) => {
        root.children=[];
        for (let i = 0; i < nodes.length; i++) {
            let node = Object.assign({},nodes[i]);

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