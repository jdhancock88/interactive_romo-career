/* global $:true document:true d3:true mapboxgl: true window: true*/


$(document).ready(() => {
  // custom scripting goes here


  function drawPassGraphic(data) {
    console.log(data);
    const margin = {
      top: 0,
      right: 50,
      bottom: 40,
      left: 50,
    };

    const width = $('#graphic').width();
    const height = 400;

    const x = d3.scaleLinear().range([0, width - margin.left - margin.right]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain([0, 100]);
    y.domain([height, 0]);

    const xAxis = d3.axisBottom().scale(x);

    const svg = d3.select('#graphic')
      .data(data)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const line = (d) => {
      const x1 = x(d.spot).toString();
      const x2 = x(d.spot + (+d.yards)).toString();
      const y1 = y(height).toString();
      const offset = y(height - ((+d.yards / 1.25) * 7)).toString();
      const offsetX1 = x(d.spot + (+d.yards / 4)).toString();
      const offsetX2 = x(d.spot + (+d.yards) - (+d.yards / 4)).toString();

      return (`M ${x1},${y1} C ${offsetX1}, ${offset} ${offsetX2}, ${offset} ${x2}, ${y1}`);
    };

    const passes = svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', `translate( ${margin.left}, ${margin.top} )`);

    passes.selectAll('path')
      .data((d) => {
        console.log(d);
        return d.plays;
      })
      .enter()
      .append('path')
      .attr('class', (d) => {
        if (d.touchdown === true) {
          return 'pass touchdown';
        }
        return 'pass';
      })
      .attr('d', d => line(d));

    const base = svg.append('g');

    base.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height)
      .attr('y2', height);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(${margin.left}, ${height})`)
      .call(xAxis);
  }


  $.getJSON('../js/data.json', (data) => {
    drawPassGraphic(data);
  });
});
