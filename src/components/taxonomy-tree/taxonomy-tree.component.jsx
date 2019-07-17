import React from 'react';
import PropTypes from 'prop-types';

import {linkHorizontal} from 'd3-shape';
import {tree, hierarchy} from 'd3-hierarchy';
import * as d3 from 'd3';

import {deepCopy} from '../../helpers';
import {taxaRanks} from '../../constants/taxaRank.constants';

class TaxonomyTree extends React.Component {
    constructor(){
        super();
    }

    static defaultProps = {
        graph: null
    }


    componentDidUpdate(){
        if (this.props.graph.length > 0) {
            const {selectedNode, graph} = this.props;
            const hierarchicalGraph = this.createHierarchicalGraph(selectedNode, graph);
            this.createTree(hierarchicalGraph);
        }
    }


    createHierarchicalGraph = (root, nodes) => {
        let _root = deepCopy(root);
        const _nodes = deepCopy(nodes);

        _root = this.findChildren(_root, _nodes);
        return _root;
    }

    findChildren = (root, nodes) => {
        root.children=[];
        for (let i = 0; i < nodes.length; i++) {
            let node = deepCopy(nodes[i]);
            node.children = [];
            node.hiddenChildren = [];
            if (node.parent == root._id && node._id != root._id){
                let child = this.findChildren(node, nodes);
                if (child.show){
                    root.children.push(child)
                } else {
                    root.hiddenChildren.push(child)
                }
                
            }
        }
        return root;
    }



    nodeHasHiddenChildren(node){
        return node.data.hiddenChildren.length > 0
    }

    nodeHasVisibleChildren(node){
        return node.data.children.length > 0
    }

    nodeIsRootAndHasParent = (node) => {
        return node.data.parent && (node.data._id == this.props.selectedNode._id)
    }

    createTree = (graph) => {
        const labelBoxWidth = 204
        const labelBoxHeight = 54;


        //reset tree on component update
        d3.selectAll("g.node").remove()
        d3.selectAll("path.link").remove()

        //create d3 graph model from graph data
        console.log(graph)
 
        const root = hierarchy(graph);
        //create references links and nodes
        const nodeData = root.descendants()
            .filter((node) => {
            return node.data.show
        });
    
        const linkData = root.links()
            .filter((link) => {
            return link.target.data.show
        });

        console.log(root);
        const maxNodeDepth = this.findMaxOfProperty('depth', root.descendants())
        const maxNodeChildren = this.findMaxOfProperty('children', root.descendants())
        console.log(`maxNodeDepth: ${maxNodeDepth}\nmaxNodeChildren: ${maxNodeChildren}`)
        //generate tree
        const treeLayout = tree()
            .size([root.descendants().length * 80, maxNodeDepth * 600])
            console.log(`nodeData.length: ${root.descendants().length}, maxNodeDepth: ${maxNodeDepth}`)
            //.nodeSize([64, 250])
        treeLayout(root);

        d3.select('div.taxonomy-tree-container')
            .attr('style', `width:${(maxNodeDepth * 800) + 400}px;height:${(root.descendants().length * 175) + 100}px;`)
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

        //append expand children button

        const nodesWithHiddenChildren = nodeEnter.filter(this.nodeHasHiddenChildren);

        
        nodesWithHiddenChildren.append('circle')
            .attr("r", "15")
            .attr("class", "show-button show-children")
            .on("click", (d) => {
                this.props.onShowChildren(d.data)
            })
        
        nodesWithHiddenChildren
            .append('text')
            .attr('class', 'show-text show-children')
            .text('+')
        
        const nodesWithVisibleChildren = nodeEnter.filter(this.nodeHasVisibleChildren)

        nodesWithVisibleChildren.append('circle')
        .attr("r", "15")
        .attr("class", "show-button show-children")
        .on("click", (d) => {
            this.props.onHideChildren(d.data)
        })
    
        nodesWithVisibleChildren
            .append('text')
            .attr('class', 'show-text hide-children')
            .text('-')

        //append expand parent button

        const rootNodeWithParent = nodeEnter.filter(this.nodeIsRootAndHasParent)

        rootNodeWithParent
            .append('circle')
            .attr("r", "15")
            .attr("class", "show-button show-parent")
            .on("click", (d) => {
                this.props.onNewRoot(d.data)
            })
        
        rootNodeWithParent
            .append('text')
            .attr('class', "show-text show-parent")
            .text('+')

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
        let maxValue = 1;//we dont want to return 0 values
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