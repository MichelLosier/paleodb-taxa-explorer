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
        const labelBoxWidth = 204
        const labelBoxHeight = 54;


        //reset tree on component update
        d3.selectAll("g.node").remove()
        d3.selectAll("path.link").remove()

        //create d3 graph model from graph data
        const {graph} = this.props;
        const root = hierarchy(graph)
        
        //create references links and nodes
        const nodeData = root.descendants();
        const linkData = root.links();

        const maxNodeDepth = this.findMaxOfProperty('depth', nodeData)
        const maxNodeChildren = this.findMaxOfProperty('children', nodeData)
        console.log(`maxNodeDepth: ${maxNodeDepth}\nmaxNodeChildren: ${maxNodeChildren}`)
        //generate tree
        const treeLayout = tree()
            .size([maxNodeChildren * 150, maxNodeDepth * 500]);
        treeLayout(root);
        console.log(nodeData)
        console.log(linkData)

        //nodes
        const nodes = d3.select("g.nodes")          
            .selectAll("g.node")
            .data(nodeData)
        const nodeEnter = nodes.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y},${d.x})`)
        
        //circle for node
        // nodeEnter.append("circle")
        //     .attr("r", 5)
        nodeEnter.append("rect")
        .attr("class", "img-box")

        nodeEnter.append("image")
        .attr("class", "thumbnail")
        .attr("xlink:href", d => d.data.img)
        
        nodeEnter.append("rect")
            .attr("class", "label-box")

        // nodeEnter.append("text")
        //     .attr("class", "name")
        //     .text(d => `${d.data.name}`);

        nodeEnter.append("foreignObject")
            .attr("class", "label-svg-container")
            .append("xhtml:div")
            .attr("class", "label")
            .attr("xmlns","http://www.w3.org/1999/xhtml")
        
        nodeEnter.select("div.label")
            .append("xhtml:div")
            .attr("class", "name")
            .attr("xmlns","http://www.w3.org/1999/xhtml")
            .text(d => `${d.data.name}`);
        
        nodeEnter.select("div.label")
            .append("xhtml:div")
            .attr("class", "rank")
            .attr("xmlns","http://www.w3.org/1999/xhtml")
            .text(d => `${taxaRanks[d.data.rank]}`);
            
        // nodeEnter.append("text")
        //     .attr("class", "rank")
        //     .text(d => `${taxaRanks[d.data.rank]}`);


        
        //lines connecting nodes
        d3.select("g.links")
            .selectAll("path.link")
            .data(linkData)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", linkHorizontal()
                .x(d => d.y)
                .y(d => d.x)
                .source(d => ({x: d.source.x, y: d.source.y + labelBoxWidth}))//label offset
            );

    }

    findMaxOfProperty(key, objArray){
        let maxValue = 0;
        objArray.forEach((obj) => {
            let value = (Array.isArray(obj[key])) ? obj[key].length : obj[key]
            if (value > maxValue){
                maxValue = value
            }
        })
        return maxValue;
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