/* global $:true document:true d3:true mapboxgl: true window: true _:true event: true */


$(document).ready(() => {
  // custom scripting goes here

  const sortedData = [];


  function displayTooltip(event, data, id) {
    const tooltip = d3.select(id);
    const ttWidth = $(id).outerWidth();
    tooltip.select('.tt-season').text(data.season);
    tooltip.select('.tt-opponent').text(data.opp);
    tooltip.select('.tt-week').text(data.week);
    tooltip.select('.tt-quarter').text(data.quarter);
    tooltip.select('.tt-time').text(data.time);
    tooltip.select('.tt-detail').text(data.detail);

    const w = $(window).width();
    let xPos = 0;
    if (event.clientX > w / 2.1) {
      xPos = event.clientX - (ttWidth + 15);
      tooltip.attr('class', 'tooltip left');
    } else {
      xPos = event.clientX + 20;
      tooltip.attr('class', 'tooltip right');
    }

    // const xPos = event.clientX > (w / 2) ? event.clientX - 160 : event.clientX + 20;
    const yPos = event.clientY - 10;

    tooltip.attr('style', `left: ${xPos}px; top: ${yPos}px`);
  }

  /* ///////////////////////////////////////////////////////////////////////////
  // DRAWING THE ARC GRAPHIC
  /////////////////////////////////////////////////////////////////////////// */
  function drawPassGraphic(data) {
    console.log(data);

    const margin = {
      top: 0,
      right: 50,
      bottom: 40,
      left: 50,
    };

    // getting the width and potential height
    const width = $('#graphic').width();
    const potentialHeight = width / 3;

    // using the lesser of potentialHeight and 400 as the height of the graphic
    const height = potentialHeight > 400 ? 400 : potentialHeight;

    // the arc modifier is a factor of the height of the graphic
    const arcMod = (height / 100) * 1.5;

    // setting our x and y scales
    const x = d3.scaleLinear().range([0, width - margin.left - margin.right]);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain([0, 100]);
    y.domain([height, 0]);

    // setting our x-axis and ticks. Ticks are in the format of football field
    // yards lines, so any tick over 50 is convered back to a 0-50 range
    const xAxis = d3.axisBottom().scale(x)
      .tickValues([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
      .tickFormat((d, i) => {
        if (i < 6) {
          return d;
        }
        return d - ((i - 5) * 20);
      });

    // creating our svg canvas
    const svg = d3.select('#graphic')
      .data(data)
      .append('svg')
        .attr('width', width)
        .attr('height', height + margin.top + margin.bottom);

    // creating our curved line accesssor function. lines starting spots are based
    // on the starting spot of the play on a football field. ending spots are based
    // on the length of the play. arcs, and curve points are based on length of play
    // and height of graphic
    const line = (d) => {
      const x1 = x(d.spot).toString();
      const x2 = x(d.spot + (+d.yards)).toString();
      const y1 = y(height).toString();
      const offset = y(height - ((+d.yards / 1.25) * arcMod)).toString();
      const offsetX1 = x(d.spot + (+d.yards / 4)).toString();
      const offsetX2 = x((d.spot + (+d.yards)) - (+d.yards / 4)).toString();

      return (`M ${x1},${y1} C ${offsetX1}, ${offset} ${offsetX2}, ${offset} ${x2}, ${y1}`);
    };

    // creating the group to hold our passing marks
    const passes = svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('transform', `translate( ${margin.left}, ${margin.top} )`);

    // appending the passing arcs
    passes.selectAll('path')
      .data(d => d.plays)
      .enter()
      .append('path')
      .attr('class', (d) => {
        if (d.touchdown === true) {
          return `pass touchdown yr-${d.season}`;
        }
        return `pass yr-${d.season}`;
      })
      .attr('d', d => line(d));

    // appending the base group that will hold our baseline
    const base = svg.append('g');

    base.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height)
      .attr('y2', height);

    // appending axis and labels
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(${margin.left}, ${height})`)
      .call(xAxis);

    svg.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', (x(50) + margin.left))
      .attr('y', height + 35)
      .attr('class', 'axis-label')
      .text('Cowboys moving left to right');
  }

  /* ///////////////////////////////////////////////////////////////////////////
  // DRAWING THE ATTEMPTS GRAPHIC
  /////////////////////////////////////////////////////////////////////////// */

  function drawAttempts(data) {
    const color = d3.scaleLinear().domain([-10, 100])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#e9f4fd'), d3.rgb('#0b3f65')]);

    const attContainer = d3.select('#att-graphic')
      .data(data);

    const seasons = attContainer.selectAll('div')
      .data(data)
      .enter()
      .append('div')
      .attr('class', d => `season season-${d.season_year} clearfix`);

    seasons.append('span')
      .attr('class', 'season-label')
      .text((d) => {
        console.log(d);
        return (d.season_year);
      });

    seasons.selectAll('attempt')
      .data(d => d.plays)
      .enter()
      .append('span')
      .attr('style', d => `background-color: ${color(+d.yards)}`)
      .attr('class', (d) => {
        if (d.interception) {
          return 'attempt interception';
        } else if (d.touchdown) {
          return 'attempt touchdown';
        } else if (d.result === 'incomplete') {
          return 'attempt incomplete';
        }
        return 'attempt';
      })
      .text((d) => {
        if (d.interception) {
          return 'I';
        } return '';
      })
      .on('mousemove', d => displayTooltip(event, d, '#att-tooltip'))
      .on('mouseout', () => d3.select('#att-tooltip').attr('class', 'tooltip noshow'));
  }

  $.getJSON('../js/data.json', (data) => {
    // sorts data by week, quarter and time
    data.forEach((value) => {
      const tempYear = value;
      tempYear.plays = _.orderBy(value.plays, ['week', 'quarter', 'sort_time'], ['asc', 'asc', 'desc']);
      sortedData.push(tempYear);
    });

    // passes off sorted data to arc drawing function
    drawPassGraphic(sortedData);
    drawAttempts(sortedData);
  });

  let active = [];

  $('.chatter li').click(function () {
    if ($(this).hasClass('active') === true) {
      $(this).removeClass('active');
    } else {
      $(this).addClass('active');
    }


    active = [];
    for (let i = 0; i < $('.active').length; i += 1) {
      active.push($('.active').eq(i).text());
    }

    $('.pass').addClass('no-show');

    for (let i = 0; i < active.length; i += 1) {
      $(`.yr-${active[i]}`).removeClass('no-show');
    }

    if ($(this).attr('id') === 'view-all') {
      $(this).siblings().removeClass('active');
      $(this).addClass('active');
      $('.pass').removeClass('no-show');
    } else {
      $('#view-all').removeClass('active');
    }
  });
});
