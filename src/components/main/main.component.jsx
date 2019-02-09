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
            //selected root
            selectedNode:{},
            nodes: []
        }
    }

    //Handle when a node is being set as the root
    //@resetNodes<boolean> should the graph be completely reset
    handleNodeSelect = (node, resetNodes) => {
        const {selectedNode} = this.state;
        //normalize the node to taxa model
        const _node = taxaFactory(node);

        //get children of node
        this.fetchChildNodes(_node, 2).then((children) => {
                //normalize children to taxa model
                const _children = this.prepareChildNodes(_node, children)
                let nodes = [..._children, _node];

                this.setState((prevState) => {
                    if(!resetNodes){
                        //if not resetting tree remove duplications of children of original
                        //root / selected node
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

    //Sets a node's parent as the new root for the graph
    //Fetches parent node from DB and pass to handleNodeSelect
    handleSetParentAsRoot = (node) => {
        pdbClient.getTaxaByOID(node.parent).then((data) => {
            const parent = data.records[0]
            this.handleNodeSelect(parent, false)
        })
    }

    //handle when tree is expanded at node
    //fetch children of this node again at an additional depth
    handleShowChildren = (parent) => {
       this.fetchChildNodes(parent, 2).then((children) => {
           //normalize children to taxa object
           const _children = this.prepareChildNodes(parent, children)

            this.setState((prevState) => {
                const updatedNodes = [...prevState.nodes];

                //since we fetched child nodes twice
                //remove old references to child nodes in collection to avoid duplication
                const updatedNodesDeduplicated = updatedNodes.filter((node) => {
                    return node.parent != parent._id
                })

                //merge all nodes with new children
                const nodes = [...updatedNodesDeduplicated, ..._children];
                return {nodes: nodes}
            })
       })
    }

    //handle when we want to collapse tree at node
    //hide immediate children so we know they exist
    //but remove non-immediates so our graph doesn't grow out of control
    handleHideChildren = (parent) => {    
        this.setState((prevState) => {
            const _nodes = [...prevState.nodes];
            this.hideImmediateChildrenAndRemoveDecendants(parent, _nodes);
            return {nodes: _nodes}
        })
    }

    //remove from node collection all nodes that have @parent as parent
    removeChildNodes = (parent, nodes) => {
        nodes.forEach((node, i, arr) => {
            if (node.parent == parent._id) {
                arr.splice(i,1)
            }
        })
    }

    //set each  child node of the parent to a hidden state
    //for each immediate child remove their child nodes
    hideImmediateChildrenAndRemoveDecendants = (parent, nodes) => {
       nodes.forEach((node, i, arr) => {
            if (node.parent == parent._id) {
                node.show = false
                arr[i] = node;
                this.removeChildNodes(node, nodes)
            }
        })
    }

    //fetch all children nodes up to a certain depth
    fetchChildNodes = (parent, depth) => {
        return pdbClient.getTaxaAllChildren(parent._id, depth).then((data) => {
            const records = data.records;
            
            //filter out parent which is already known
            const parentIndex = records.findIndex(r => r.oid == parent._id);        
            records.splice(parentIndex, 1);

            //filter out subjective synonyms 
            //this controls for duplication of records based on synonyms
            const _records = records.filter((record) => { 
                return !record.tdf
            })
            return _records;
        })
    }

    //normalize child nodes as taxa objects
    //immediate children of @parent have default show state of true
    //non-immediate children of @parent are hidden by default
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
                        onNewRoot={this.handleSetParentAsRoot}
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