import React from 'react';
import PropTypes from 'prop-types';

import {tree, hierarchy} from 'd3-hierarchy';
import * as d3 from 'd3';



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
        d3.selectAll("g#tree-group").remove()

        const {graph} = this.props;
        console.log(`received graph ${JSON.stringify(graph)}`)
        const graphNode = hierarchy(graph, (d) => {
            return d.children
        })

        const treeChart = tree();
        treeChart.size([500,500]);

        const treeData = treeChart(graphNode).descendants();

        d3.select("svg#taxonomy-tree")
            .append("g")
            .attr("id", "tree-group")
            .selectAll("g")
            .data(treeData)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`);
        
        d3.selectAll("g.node")
            .append("circle")
            .attr("r", 10)
            .style("fill", "white")
            .style("stroke", "black")

        d3.selectAll("g.node")
            .append("text")
            .style("text-anchor", "start")
            .style("fill", "black")
            .text(d => d.data.name);

        d3.select("#tree-group").selectAll("line")
            .data(treeData.filter(d =>{ return d.parent}))
            .enter().insert("line", "g")
            .attr("x1", d => d.parent.y)
            .attr("y1", d => d.parent.x)
            .attr("x2", d => d.y)
            .attr("y2", d => d.x)
            .style("stroke", "black")
            
    }

    render(){
        return(
            <div className="taxonomy-tree-container">
                {/*This exposes the node ref to the class as this.node */}
                <svg id="taxonomy-tree" ref={node => this.node = node}>
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