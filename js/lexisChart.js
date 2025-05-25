class LexisChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, data, selectedLeaders, selectedGenders) {
    	this.config = {
     		parentElement: _config.parentElement,
      		containerWidth: 1400,
      		containerHeight: 380,
      		margin: {
        		top: 15,
        		right: 15,
        		bottom: 20,
        		left: 25
      		}
      	// Todo: Add or remove attributes from config as needed
    	}
	this.data = data;
	this.selectedLeaders = selectedLeaders;
	this.selectedGenders = selectedGenders;
    	this.initVis();
  }

  	initVis() {
    	let vis = this;

    	// Calculate inner chart size. Margin specifies the space around the actual chart.
    	vis.config.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    	vis.config.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    	// Define size of SVG drawing area
    	vis.svg = d3.select(vis.config.parentElement).append('svg')
      		.attr('width', vis.config.containerWidth)
      		.attr('height', vis.config.containerHeight);

    	// Append group element that will contain our actual chart
    	// and position it according to the given margin config
    	vis.chartArea = vis.svg.append('g')
      		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    	// Apply clipping mask to 'vis.chart' to clip arrows
    	vis.chart = vis.chartArea.append('g')
      		.attr('clip-path', 'url(#chart-mask)');

    	// Initialize clipping mask that covers the whole chart
    	vis.chart.append('defs')
      		.append('clipPath')
      		.attr('id', 'chart-mask')
      		.append('rect')
      		.attr('width', vis.config.width + 5)
      		.attr('y', -vis.config.margin.top)
      		.attr('height', vis.config.height);

    	// Helper function to create the arrows and styles for our various arrow heads
    	vis.createMarkerEnds();

    	// Todo: initialize scales, axes, static elements, etc.
	
	vis.xScale = d3.scaleLinear()
		.domain([1950, 2021])
		.range([0, vis.config.width]);
    	vis.yScale = d3.scaleLinear()
		.domain([25, 95])
		.range([vis.config.height, 0]);

    	vis.xAxis = d3.axisBottom(vis.xScale)
		.ticks(8);
    	vis.yAxis = d3.axisLeft(vis.yScale)
		.ticks(7);

    	vis.xAxisGroup = vis.chartArea.append('g')
      		.attr('class', 'x-axis')
      		.attr('transform', `translate(0,${vis.config.height})`);

    	vis.yAxisGroup = vis.chartArea.append('g')
      		.attr('class', 'y-axis');

    	vis.chartArea.append('text')
      		.attr('class', 'axis-label')
      		.attr('x', 0)
      		.attr('y', -5)
      		.attr('text-anchor', 'start')
      		.text('Age');
  }


  updateVis() {
    	let vis = this;
    	// Todo: prepare data
	
	vis.filteredData = vis.data.filter(d =>
    		d.duration > 0 &&
    		(vis.selectedGenders.size === 0 || vis.selectedGenders.has(d.gender))
	);


	vis.renderVis();
  }


  renderVis() {
   	let vis = this;

  	const arrows = vis.chart.selectAll('.arrow')
    		.data(vis.filteredData, d => d.leader);

  	const arrowsEnter = arrows.enter().append('line')
    		.attr('class', 'arrow')
    		.attr('stroke', '#ddd')
    		.attr('stroke-width', 1.5)
    		.attr('marker-end', 'url(#arrow-head)');

  	const arrowsMerge = arrowsEnter.merge(arrows)
    		.attr('x1', d => vis.xScale(d.start_year))
    		.attr('x2', d => vis.xScale(d.end_year))
    		.attr('y1', d => vis.yScale(d.start_age))
    		.attr('y2', d => vis.yScale(d.end_age))
		.attr('class', d => {
  			const base = 'arrow';
  			if (vis.selectedLeaders.has(d.leader)) return base + ' selected';
  			if (d.label === 1) return base + ' highlight';
  			return base;
		})
    		.on('mouseover', (event, d) => {
      			vis.tooltip
        		.style('visibility', 'visible')
        		.html(`
          		<strong>${d.leader}</strong><br/>
          		${d.country}<br/>
          		Start: ${d.start_year} &nbsp;&nbsp; End: ${d.end_year}<br/>
          		Age: ${d.start_age}<br/>
          		Duration: ${d.duration} years<br/>
          		${d.pcgdp !== null ? `GDP: $${d.pcgdp.toLocaleString()}` : ''}
        		`);
    		})
    		.on('mousemove', (event) => {
      			vis.tooltip
        		.style('top', (event.pageY - 28) + 'px')
        		.style('left', (event.pageX + 10) + 'px');
    		})
    		.on('mouseleave', () => {
      			vis.tooltip.style('visibility', 'hidden');
    		})
	  	.on('click', (event, d) => {
  			if (vis.selectedLeaders.has(d.leader)) {
    				vis.selectedLeaders.delete(d.leader);
  			} else {
    				vis.selectedLeaders.add(d.leader);
  			}
  			vis.renderVis();

			scatterPlot.selectedLeaders = vis.selectedLeaders;
    			scatterPlot.updateVis();
		});

  		arrows.exit().remove();

	  	const labels = vis.chart.selectAll('.arrow-label')
  			.data(vis.filteredData.filter(d => vis.selectedLeaders.has(d.leader)), d => d.leader);

		labels.enter()
  			.append('text')
  			.attr('class', 'arrow-label')
  			.attr('x', d => vis.xScale(d.end_year))
  			.attr('y', d => vis.yScale(d.end_age))
  			.text(d => d.leader)
  			.attr('transform', d => `rotate(-20, ${vis.xScale(d.end_year)}, ${vis.yScale(d.end_age)})`)
  			.style('font-size', '10px')
  			.style('fill', '#333')
  			.merge(labels)
  			.attr('x', d => vis.xScale(d.end_year))
  			.attr('y', d => vis.yScale(d.end_age));

		labels.exit().remove();

  		vis.xAxisGroup.call(vis.xAxis);
  		vis.yAxisGroup.call(vis.yAxis);

  		if (!vis.tooltip) {
    			vis.tooltip = d3.select('body').append('div')
      				.attr('class', 'tooltip')
      				.style('position', 'absolute')
      				.style('visibility', 'hidden')
      				.style('background', 'white')
      				.style('border', '1px solid #ccc')
      				.style('padding', '5px')
      				.style('font-size', '12px')
      				.style('border-radius', '4px')
      				.style('pointer-events', 'none')
      				.style('box-shadow', '2px 2px 5px rgba(0,0,0,0.1)');
  		}
  }

  /**
   * Create all of the different arrow heads.
   * Styles: default, hover, highlight, highlight-selected
   * To switch between these styles you can switch between the CSS class.
   * We populated an example css class with how to use the marker-end attribute.
   * See link for more info.
   * https://observablehq.com/@stvkas/interacting-with-marker-ends
   */
  createMarkerEnds() {
    let vis = this;
    // Default arrow head
    // id: arrow-head
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#ddd')
      .attr('fill', 'none');

    // Hovered arrow head
    // id: arrow-head-hovered
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-hovered')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#888')
      .attr('fill', 'none');

    // Highlight arrow head
    // id: arrow-head-highlighted
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#aeaeca')
      .attr('fill', 'none');

    // Highlighted-selected arrow head
    // id: arrow-head-highlighted-selected
    vis.chart.append('defs').append('marker')
      .attr('id', 'arrow-head-highlighted-selected')
      .attr('markerUnits', 'strokeWidth')
      .attr('refX', '2')
      .attr('refY', '2')
      .attr('markerWidth', '10')
      .attr('markerHeight', '10')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,0 L2,2 L 0,4')
      .attr('stroke', '#e89f03')
      .attr('fill', 'none');
  }
}
