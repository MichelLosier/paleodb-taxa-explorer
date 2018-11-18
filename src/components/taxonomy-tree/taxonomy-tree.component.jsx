import React from 'react';
import PropTypes from 'prop-types';

import d3 from 'd3-hierarchy';



class TaxonomyTree extends React.Component {
    constructor(){
        super();
    }

    static defaultProps = {
        graph: null
    }

    componentDidMount(){
        this.createTree();
    }

    componentDidUpdate(){
        this.createTree()
    }

    createTree = () => {
        return null
    }

    render(){
        return(
            <div className="taxonomy-tree-container">
                {/*This exposes the node ref to the class as this.node */}
                <svg ref={node => this.node = node}> 
                </svg>
            </div>
        )
    }
}


TaxonomyTree.propTypes = {
    //graph of nodes
    graph: PropTypes.object,
    //handler for when a node is clicked
    onNodeClick: PropTypes.func,
    //handler to expand tree from node
    onNodeExpand: PropTypes.func,
    //selected node
    selectedNode: PropTypes.object
}

export default TaxonomyTree;