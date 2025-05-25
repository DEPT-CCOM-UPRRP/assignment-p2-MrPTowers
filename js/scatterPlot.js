class ScatterPlot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, data, selectedLeaders, selectedGenders) {
    	this.config = {
		parentElement: _config.parentElement,
		containerWidth: 1000,
		containerHeight: 260,
		margin: {
			top: 30,
			right: 15,
			bottom: 20,
			left: 30
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
    	// Todo: Create SVG area, chart, initialize scales and axes, add titles, etc
	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    	vis.svg = d3.select(vis.config.parentElement).append('svg')
      		.attr('width', vis.config.containerWidth)
      		.attr('height', vis.config.containerHeight);

    	vis.chartArea = vis.svg.append('g')
      		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    	vis.xScale = d3.scaleLinear()
      		.range([0, vis.width]);

    	vis.yScale = d3.scaleLinear()
      		.domain([25, 95])
      		.range([vis.height, 0]);

    	vis.xAxis = vis.chartArea.append('g')
      		.attr('class', 'x-axis')
      		.attr('transform', `translate(0, ${vis.height})`);

    	vis.yAxis = vis.chartArea.append('g')
      		.attr('class', 'y-axis');

    	vis.chartArea.append('text')
      		.attr('class', 'axis-label')
      		.attr('x', vis.width)
      		.attr('y', vis.height + 35)
      		.attr('text-anchor', 'end')
      		.text('GDP per Capita (US$)');

    	vis.chartArea.append('text')
      		.attr('class', 'axis-label')
      		.attr('x', -10)
      		.attr('y', -10)
      		.attr('text-anchor', 'start')
      		.text('Age');

	vis.chartArea.append('rect')
    		.attr('class', 'background')
    		.attr('width', vis.width)
    		.attr('height', vis.height)
    		.attr('fill', 'transparent')
    		.on('click', () => {
        		vis.selectedLeaders.clear();
        		vis.renderVis();

        	lexisChart.selectedLeaders = vis.selectedLeaders;
        	lexisChart.updateVis();
    		});
  }

  updateVis() {
    	let vis = this;
    	// Todo: Prepare data and scales
	
	vis.filteredData = vis.data.filter(d =>
    		d.pcgdp !== null &&
    		(vis.selectedGenders.size === 0 || vis.selectedGenders.has(d.gender))
	);

	vis.xScale.domain([0, d3.max(vis.filteredData, d => d.pcgdp)]);

    	vis.renderVis();
  }

  renderVis() {
  	let vis = this;

  	const points = vis.chartArea.selectAll('.point')
    		.data(vis.filteredData, d => d.name);

  	const pointsEnter = points.enter().append('circle')
    		.attr('class', 'point')
    		.attr('r', 5)
    		.attr('fill', 'steelblue')
    		.attr('fill-opacity', 0.7);

  	const pointsMerge = pointsEnter.merge(points)
    		.attr('cx', d => vis.xScale(d.pcgdp))
    		.attr('cy', d => vis.yScale(d.start_age))
		.attr('class', d => {
  			const base = 'point';
  			if (vis.selectedLeaders.has(d.leader)) return base + ' selected';
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
					Gender: ${d.gender}<br/>
				  	Duration: ${d.duration} years<br/>
				  	GDP: $${d.pcgdp.toLocaleString()}
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

			lexisChart.selectedLeaders = vis.selectedLeaders;
    			lexisChart.updateVis();
		});

  		points.exit().remove();

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

  	vis.xAxis.call(d3.axisBottom(vis.xScale).ticks(10));
  	vis.yAxis.call(d3.axisLeft(vis.yScale).ticks(5));


	vis.chartArea.selectAll('.grid-line-y').remove();

	vis.chartArea.selectAll('.grid-line-y')
  		.data(vis.yScale.ticks(5))
  		.enter()
  		.append('line')
  		.attr('class', 'grid-line-y')
  		.attr('x1', 0)
  		.attr('x2', vis.width)
  		.attr('y1', d => vis.yScale(d))
  		.attr('y2', d => vis.yScale(d))
  		.attr('stroke', '#ccc')
  		.attr('stroke-opacity', 0.5)
  		.attr('shape-rendering', 'crispEdges');

	const xTickValues = vis.xAxis.selectAll('.tick').data();

	vis.chartArea.selectAll('.grid-line-x').remove();

	vis.chartArea.selectAll('.grid-line-x')
	  	.data(xTickValues)
	  	.enter()
	  	.append('line')
	  	.attr('class', 'grid-line-x')
	  	.attr('x1', d => vis.xScale(d))
	  	.attr('x2', d => vis.xScale(d))
	  	.attr('y1', 0)
	  	.attr('y2', vis.height)
	  	.attr('stroke', '#ccc')
	  	.attr('stroke-opacity', 0.3)
	  	.attr('shape-rendering', 'crispEdges');

  }
}
