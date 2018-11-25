import React from 'react';
import PropTypes from 'prop-types';

import {linkHorizontal} from 'd3-shape';
import {tree, hierarchy} from 'd3-hierarchy';
import * as d3 from 'd3';

import {taxaRanks} from '../../constants/taxaRank.constants';

class TaxonomyTree extends React.Component {
    constructor(){
        super();
    }

    static defaultProps = {
        graph: null
    }

    componentDidMount(){
        if (this.props.graph != null) {
            this.createTree();
        }
        
    }

    componentDidUpdate(){
        if (this.props.graph != null) {
            this.createTree();
        }
    }

    createTree = () => {
        d3.selectAll("g.node").remove()
        d3.selectAll("path.link").remove()

        const {graph} = this.props;
        const root = hierarchy(graph)
        
        const nodes = root.descendants();
        const links = root.links();
        console.log(nodes)
        const treeLayout = tree()
            .size([500,500]);
        treeLayout(root);
 


        //nodes
        d3.select("g.nodes")          
            .selectAll("g.node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .append("circle")
            .attr("r", 5)

        //node name
        d3.selectAll("g.node")
            .append("text")
            .attr("class", "name")
            .attr("dx", "12px")
            .attr("dy", "5px")
            .text(d => `${d.data.name} (${taxaRanks[d.data.rank]})`);

        //node rank
        // d3.selectAll("g.node")
        //     .append("text")
        //     .attr("class", "rank")
        //     .text(d => taxaRanks[d.data.rank])

        //line connecting nodes
        d3.select("g.links")
            .selectAll("path.link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
            );

    }

    render(){
        return(
            <div className="taxonomy-tree-container">
                {/*This exposes the node ref to the class as this.node */}
                <svg id="taxonomy-tree" ref={node => this.node = node}>
                    <g id="tree-group">
                        <g className="links"></g>
                        <g className="nodes"></g>
                    </g>
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