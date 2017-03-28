import React from 'react';
import * as d3 from 'd3';
import { has as _has } from 'lodash';

import CONST from './const';
import graphMock from '../../mock';

export default class Graph extends React.Component {
    constructor(props) {
        super(props);

        // State needs to be designed
        this.state = {
            focusNode: undefined,
            highlightNode: undefined,
            forceStop: false
        };

        this.linkedByIndex = {};
    }

    render() {
        // Helper functions -----------------------------------
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        const tick = () => {
            node.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
            text.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

            link.attr('x1', function(d) {
                return d.source.x;
            }).attr('y1', function(d) {
                return d.source.y;
            }).attr('x2', function(d) {
                return d.target.x;
            }).attr('y2', function(d) {
                return d.target.y;
            });

            node.attr('cx', function(d) {
                return d.x;
            }).attr('cy', function(d) {
                return d.y;
            });
        };

        // START - Drag & Drop ----------------------------------------
        const dragstart = (d, i) => {
            force.stop()
        };

        const dragmove = (d, i) => {
            d.px += d3.event.dx;
            d.py += d3.event.dy;
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            tick();
        };

        const dragend = (d, i) => {
            d.fixed = true;
            tick();
            // This line will automatically make nodes rearrange when we drag and drop some node
            // force.resume();
        };
        // END - Drag & Drop ----------------------------------------
        // ----------------------------------------------------

        console.log(d3);
        let color = d3.scaleLinear().domain([CONST.MIN_SCORE, (CONST.MIN_SCORE + CONST.MAX_SCORE) / 2, CONST.MAX_SCORE]).range(['lime', 'yellow', 'red']);
        let size = d3.scalePow().exponent(1).domain([1, 100]).range([8, 24]);
        // New force API since d3 4.0.0 ...
        // let force = d3.force().gravity(.05).linkDistance(100).charge(-100).size([CONST.WIDTH, CONST.HEIGHT]);
        // @TODO: Missing width and height on svg
        let svg = d3.select('body').append('svg');
        let zoom = d3.zoom().scaleExtent([CONST.MIN_ZOOM, CONST.MAX_ZOOM]);

        svg.style('cursor', 'move');
        svg.style('width', CONST.WIDTH);
        svg.style('height', CONST.HEIGHT);
        let g = svg.append('g');

        let graph = graphMock && graphMock.graph;
        let circle;
        let text;
        let link;
        let node;
        let tocolor = 'fill';
        let towhite = 'stroke';

        let linkedByIndex = {};
        if (_has(graph, 'links')) {
            for (let d of graph.links) {
                linkedByIndex[`${d.source},${d.target}`] = true
            }
        }

        // @TODO: Not working. Force is not yet created with the correct parameters
        var force = d3.forceSimulation(graph.nodes)
                    .force('charge', d3.forceManyBody())
                    .force('link', d3.forceLink(graph.links))
                    .force('center', d3.forceCenter());

        function strokeStyle(d) {
            return isNumber(d.score) && d.score >= 0 ? color(d.score) : CONST.DEFAULT_LINK_COLOR;
        }

        link = g.selectAll('.link')
                .data(graph.links)
                .enter()
                .append('line').attr('class', 'link').style('stroke-width', CONST.STROKE_THICKNESS).style('stroke', strokeStyle);

        const customNodeDrag = d3.drag()
                                .on('start', dragstart)
                                .on('drag', dragmove)
                                .on('end', dragend);

        node = g.selectAll('.node').data(graph.nodes).enter().append('g').attr('class', 'node').call(customNodeDrag);

        if (CONST.OUTLINE) {
            tocolor = 'stroke';
            towhite = 'fill';
        }

        // @TODO: Missing shape type (shape) attribute on d3.symbol
        circle = node
            .append('path')
            .attr('d', d3.symbol().size((d) => {
                    return Math.PI * Math.pow(size(d.size) || CONST.DEFAULT_NODE_SIZE, 2);
            }))
            .style(tocolor, (d) => {
                if (d && d.color) {
                    return d.color;
                }
                return isNumber(d.score) && d.score >= 0 ? color(d.score) : CONST.DEFAULT_NODE_COLOR;
            })
            .style('stroke-width', CONST.STROKE_THICKNESS).style(towhite, 'white');

        text = g.selectAll('.text').data(graph.nodes).enter().append('text').attr('dy', '.35em').style('font-size', CONST.DEFAULT_TEXT_SIZE + 'px');

        if (CONST.TEXT_CENTER) {
            text.text((d) => {
                return d.id;
            }).style('text-anchor', 'middle');
        } else {
            text.attr('dx', (d) => {
                return ( size(d.size) || CONST.DEFAULT_NODE_SIZE) ;
            }).text((d) => {
                return d[CONST.LABEL_PROPERTY] ? '\u2002' + d[CONST.LABEL_PROPERTY] : '\u2002' + d.id;
            });
        }

        return (
            <div>
                <h4>An svg graph is rendered below</h4>
                <g />
            </div>
        );
    }
}