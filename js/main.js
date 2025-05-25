let lexisChart, barChart, scatterPlot;
let originalData = new Set();
let selectedLeaders = new Set();
let selectedGenders = new Set();


/**
 * Load data from CSV file asynchronously and render charts
 */
d3.csv('data/leaderlist.csv').then(data => {
  	// Convert columns to numerical values
  	data.forEach(d => {
    		Object.keys(d).forEach(attr => {
      			if (attr === 'pcgdp') {
        			d[attr] = (d[attr] === 'NA') ? null : +d[attr];
      			} else if (attr !== 'country' && attr !== 'leader' && attr !== 'gender') {
        			d[attr] = +d[attr];
      			}
    		});
  	});

  	data.sort((a, b) => a.label - b.label);
	originalData = data;

  	const filteredData = filterData('oecd');

  	lexisChart = new LexisChart({ parentElement: '#lexis' }, filteredData, selectedLeaders, selectedGenders);
  	barChart = new BarChart({ parentElement: '#bar' }, filteredData, selectedGenders);
  	scatterPlot = new ScatterPlot({ parentElement: '#scatter' }, filteredData, selectedLeaders, selectedGenders);

  	lexisChart.updateVis();
  	barChart.updateVis();
  	scatterPlot.updateVis();

  	d3.select('#country-selector').on('change', function () {
  		const group = this.value;
  		const newData = filterData(group);

  		lexisChart.data = newData;
  		barChart.data = newData;
  		scatterPlot.data = newData;

  		lexisChart.updateVis();
  		barChart.updateVis();
  		scatterPlot.updateVis();
	});
});

function filterData(group) {
  	return originalData.filter(d => d.duration > 0 && d[group] === 1);
}

