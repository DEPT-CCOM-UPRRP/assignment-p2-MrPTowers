class BarChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   */
  // Todo: Add or remove parameters from the constructor as needed
  constructor(_config, data, selectedGenders) {
	this.config = {
		parentElement: _config.parentElement,
		containerWidth: 400,
	      	containerHeight: 260,
	      	margin: {
			top: 30,
			right: 5,
			bottom: 20,
			left: 30
	      	}
	      	// Todo: Add or remove attributes from config as needed
	}
	this.selectedGenders = selectedGenders;
	this.data = data;
	this.initVis();
  }

  initVis() {
	const vis = this;

	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

	vis.svg = d3.select(vis.config.parentElement).append('svg')
		.attr('width', vis.config.containerWidth)
		.attr('height', vis.config.containerHeight);

	vis.chartArea = vis.svg.append('g')
		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

	vis.xScale = d3.scaleBand() //Domain defined in update
	      	.padding(0.2)
	      	.range([0, vis.width]);

	vis.yScale = d3.scaleLinear() //Domain defined in update
	      	.range([vis.height, 0]);

	vis.xAxis = vis.chartArea.append('g')
		.attr('class', 'x-axis')
	      	.attr('transform', `translate(0, ${vis.height})`);

	vis.yAxis = vis.chartArea.append('g')
	      	.attr('class', 'y-axis');

	vis.chartArea.append('text')
	      	.attr('class', 'axis-label')
	      	.attr('x', -30)
	      	.attr('y', -10)
	      	.text('Gender');
  }

  updateVis() {
    	let vis = this;
    	// Todo: Prepare data and scales
	
	vis.aggregatedData = d3.rollups(
      		vis.data,
      		v => v.length,
      		d => d.gender
    	);

    	vis.xScale.domain(vis.aggregatedData.map(d => d[0]));
    	vis.yScale.domain([0, d3.max(vis.aggregatedData, d => d[1])]);

	vis.renderVis();
  }

  renderVis() {
    	let vis = this;
    	// Todo: Bind data to visual elements, update axes
	
	const bars = vis.chartArea.selectAll('.bar')
      		.data(vis.aggregatedData, d => d[0]);

    	bars.enter().append('rect')
      		.attr('class', 'bar')
      		.merge(bars)
      		.attr('x', d => vis.xScale(d[0]))
      		.attr('y', d => vis.yScale(d[1]))
      		.attr('width', vis.xScale.bandwidth())
      		.attr('height', d => vis.height - vis.yScale(d[1]))
      		.attr('fill', 'steelblue')
		.attr('class', d => {
  			const base = 'bar';
  			if (vis.selectedGenders.has(d[0])) return base + ' selected';
  			return base;
		})
	  	.on('click', (event, d) => {
    			if (vis.selectedGenders.has(d[0])) {
        			vis.selectedGenders.delete(d[0]);
    			} else {
        			vis.selectedGenders.add(d[0]);
    			}
			vis.renderVis();

    			scatterPlot.selectedGenders = vis.selectedGenders;
    			scatterPlot.updateVis();

    			lexisChart.selectedGenders = vis.selectedGenders;
    			lexisChart.updateVis();
		});

    	bars.exit().remove();

    	vis.xAxis.call(d3.axisBottom(vis.xScale));
    	vis.yAxis.call(d3.axisLeft(vis.yScale).ticks(5));

	vis.chartArea.selectAll('.grid-line').remove();

	vis.chartArea.selectAll('.grid-line')
  		.data(vis.yScale.ticks(5))
  		.enter()
  		.append('line')
  		.attr('class', 'grid-line')
  		.attr('x1', 0)
  		.attr('x2', vis.width)
  		.attr('y1', d => vis.yScale(d))
  		.attr('y2', d => vis.yScale(d))
  		.attr('stroke', '#ccc')
  		.attr('stroke-opacity', 0.5)
  		.attr('shape-rendering', 'crispEdges');
  }
}
