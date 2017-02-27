/*
global $:true document:true d3:true mapboxgl: true window: true _:true event: true Modernizr: true
*/


$(document).ready(() => {
  // custom scripting goes here

  if (Modernizr.touchevents) {
    $('body').addClass('touch');
  }

  const sortedData = [];
  const romoComps = 2943;
  const romoTDs = 256;
  const romoYds = 35499;

  let desiredRec = [];
  let receivers;

  const romoCareer = [
    { season: '2006', comps: 237, atts: 366, yds: '3,092', tds: 20 },
    { season: '2007', comps: 353, atts: 556, yds: '4,412', tds: 37 },
    { season: '2008', comps: 276, atts: 450, yds: '3,448', tds: 26 },
    { season: '2009', comps: 392, atts: 620, yds: '4,925', tds: 28 },
    { season: '2010', comps: 148, atts: 213, yds: '1,605', tds: 11 },
    { season: '2011', comps: 346, atts: 522, yds: '4,184', tds: 31 },
    { season: '2012', comps: 425, atts: 648, yds: '4,903', tds: 28 },
    { season: '2013', comps: 342, atts: 535, yds: '3,828', tds: 31 },
    { season: '2014', comps: 338, atts: 485, yds: '4,189', tds: 38 },
    { season: '2015', comps: 83, atts: 121, yds: '884', tds: 5 },
    { season: '2016', comps: 3, atts: 4, yds: '29', tds: 1 },
  ];

  /*
  ///////////////////////////////////////////////////////////////////////////
  DISPLAYING THE TOOLTIP
  ///////////////////////////////////////////////////////////////////////////
  */

  function displayTooltip(event, data, id) {
    const tooltip = d3.select(id);
    const ttWidth = $(id).outerWidth();

    // populating the tooltip info with data from the point hovered over
    tooltip.select('.tt-season').text(data.season);
    tooltip.select('.tt-opponent').text(data.opp);
    tooltip.select('.tt-week').text(data.week);
    tooltip.select('.tt-quarter').text(data.quarter);
    tooltip.select('.tt-time').text(data.time);
    tooltip.select('.tt-detail').text(data.detail);

    // use the clientX position in relation to the window width to position the
    // tooltip to the left or right of the point hovered over.
    const w = $(window).width();
    let xPos = 0;
    if (event.clientX > w / 2.1) {
      xPos = event.clientX - (ttWidth - 10);
      tooltip.attr('class', 'tooltip');
    } else {
      xPos = event.clientX - 10;
      tooltip.attr('class', 'tooltip');
    }

    const yPos = event.clientY + 15;

    tooltip.attr('style', `left: ${xPos}px; top: ${yPos}px`);
  }

  /* ///////////////////////////////////////////////////////////////////////////
  // DRAWING THE ARC GRAPHIC
  /////////////////////////////////////////////////////////////////////////// */

  function drawPassGraphic(data, target) {
    const margin = {
      top: 0,
      right: 10,
      bottom: 40,
      left: 10,
    };

    // getting the width and potential height
    const width = $(target).width();

    const potentialHeight = width / 2;

    // using the lesser of potentialHeight and 400 as the height of the graphic
    let height = potentialHeight > 400 ? 400 : potentialHeight;

    // the arc modifier is a factor of the height of the graphic
    let arcMod = (height / 100) * 1.5;

    if (target !== '#arc-graphic') {
      height = 198;
      arcMod = (height / 100) * 1.7;
      margin.bottom = 35;
    }


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
    const svg = d3.select(target)
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
      let offset = y(height - ((+d.yards / 1.25) * arcMod)).toString();
      const offsetX1 = x(d.spot + (+d.yards / 4)).toString();
      const offsetX2 = x((d.spot + (+d.yards)) - (+d.yards / 4)).toString();

      if (+d.yards === 0 && d.result === 'complete') {
        offset = y(height - 25);
      }

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
          return `pass touchdown yr-${d.season} ${d.opp}`;
        }
        return `pass yr-${d.season} ${d.opp}`;
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

  /*
  ///////////////////////////////////////////////////////////////////////////
  // DRAWING THE ATTEMPTS GRAPHIC
  ///////////////////////////////////////////////////////////////////////////
  */

  function drawAttempts(data) {
    // creating a color scale to measure yardage against
    const color = d3.scaleLinear().domain([-10, 100])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#deebf7'), d3.rgb('#08306b')]);

    const attContainer = d3.select('#att-graphic')
      .data(data);

    // append a .season div for each season in the data
    const seasons = attContainer.selectAll('div')
      .data(data)
      .enter()
      .append('div')
      .attr('class', d => `season season-${d.season_year} clearfix`);

    // append a season year label to each .season div
    seasons.append('span')
      .attr('class', 'season-label')
      .html((d, i) => (`<strong>${d.season_year}:</strong> ${romoCareer[i].comps}-for-${romoCareer[i].atts}, ${romoCareer[i].yds} yards, ${romoCareer[i].tds} TDs`));

    // append a span for each attempt in a season
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
      .on('mousemove', d => displayTooltip(event, d, '#att-tooltip'))
      .on('mouseout', () => d3.select('#att-tooltip').attr('class', 'tooltip no-show'));
  }

  /*
  ///////////////////////////////////////////////////////////////////////////
  // CONTROLLING WHICH SEASONS GET DISPLAYED IN THE COMPLETION CHART
  ///////////////////////////////////////////////////////////////////////////
  */

  let selSeason = 'all';
  let selOpp = 'all';

  function viewComps() {
    $('#graphic .pass').addClass('no-show');

    if (selSeason !== 'all' && selOpp !== 'all') {
      $(`#graphic .yr-${selSeason}.${selOpp}`).removeClass('no-show');
    } else if (selSeason === 'all' && selOpp !== 'all') {
      $(`#graphic .${selOpp}`).removeClass('no-show');
    } else if (selOpp === 'all' && selSeason !== 'all') {
      $(`#graphic .yr-${selSeason}`).removeClass('no-show');
    } else {
      $('#graphic .pass').removeClass('no-show');
    }
  }

  $('#comp-season').change(() => {
    selSeason = $('#comp-season option:selected').attr('value');
    viewComps();
  });

  $('#comp-opp').change(() => {
    selOpp = $('#comp-opp option:selected').attr('value');
    viewComps();
  });


  /*
  ///////////////////////////////////////////////////////////////////////////
  // CONTROLLING WHICH SEASONS GET DISPLAYED IN THE ATTEMPTS CHART
  ///////////////////////////////////////////////////////////////////////////
  */

  $('#att-season').change(() => {
    const selectedSeason = $('#att-season option:selected').attr('value');
    if (selectedSeason !== 'all') {
      $('.season').addClass('no-show');
      $(`.season-${selectedSeason}`).removeClass('no-show');
    } else {
      $('.season').removeClass('no-show');
    }
  });


  /*
  ///////////////////////////////////////////////////////////////////////////
  // DRAWING THE BARS FOR THE RECEIVERS
  ///////////////////////////////////////////////////////////////////////////
  */

  function drawPassBars(receiver) {
    const target = _.find(receivers, ['receiver', receiver]);

    let recPer = parseFloat(((target.catches / romoComps) * 100).toFixed(1));
    let ydsPer = parseFloat(((target.yards / romoYds) * 100).toFixed(1));
    let tdsPer = parseFloat(((target.touchdowns / romoTDs) * 100).toFixed(1));

    recPer = recPer > 0 ? recPer : 0;
    ydsPer = ydsPer > 0 ? ydsPer : 0;
    tdsPer = tdsPer > 0 ? tdsPer : 0;

    $('#player-recs').css('width', `${recPer}%`);
    $('#player-yds').css('width', `${ydsPer}%`);
    $('#player-tds').css('width', `${tdsPer}%`);

    $('#rec-per').text(`${recPer}%`).css('left', `${recPer}%`);
    $('#yds-per').text(`${ydsPer}%`).css('left', `${ydsPer}%`);
    $('#tds-per').text(`${tdsPer}%`).css('left', `${tdsPer}%`);

    let ydsString = target.yards.toFixed(0);

    if (ydsString.length >= 4) {
      const yds1 = ydsString.slice(0, (ydsString.length - 3));
      const yds2 = ydsString.slice(-3);
      ydsString = `${yds1},${yds2}`;
    }

    $('#rec-data').html(target.catches);
    $('#yds-data').html(ydsString);
    $('#tds-data').html(target.touchdowns);


    let recImage = target.receiver.split(' ').join('');
    recImage = `_${recImage}.jpg`;

    $('#receiver-head-block img').attr('src', `images/${recImage}`).attr('alt', target.receiver);
    $('#receiver-pos').text(`${target.pos}, ${target.years}`);
  }

  /*
  ///////////////////////////////////////////////////////////////////////////
  // FILTERING THE DATA DOWN TO A SELECTED RECEIVER
  ///////////////////////////////////////////////////////////////////////////
  */

  function filterReceivers(selected) {
    // clear the desiredRec array and the div that holds the receiver arc chart
    desiredRec = [];
    $('#receiver-arcs').html('');

    // iterate over the original data, creating a new season object and pushing
    // it to the desiredRec array
    for (let i = 0; i < sortedData.length; i += 1) {
      const season = {
        season_year: sortedData[i].season_year,
        plays: [],
      };
      $.each(sortedData[i].plays, (k, v) => {
        if (v.target === selected) {
          season.plays.push(v);
        }
      });

      desiredRec.push(season);
    }

    $('#receiver-name').text(selected);

    // hand off the filtered data to the arc drawing function
    drawPassGraphic(desiredRec, '#receiver-arcs');
    drawPassBars(selected);
  }


  /*
  ///////////////////////////////////////////////////////////////////////////
  // CHANGING THE RECEIVER CHART
  ///////////////////////////////////////////////////////////////////////////
  */

  // when the dropdown is changed, grab the value of the selected option and
  // hand it off to the filterReceivers function
  $('#catchers').change(() => {
    const selectedRec = $('#catchers option:selected').attr('value');
    filterReceivers(selectedRec);
  });

  /*
  ///////////////////////////////////////////////////////////////////////////
  // CLOSING THE TOOLTIP
  ///////////////////////////////////////////////////////////////////////////
  */

  $('.tooltip button').click(() => $('.tooltip').addClass('no-show'));

  /*
  ///////////////////////////////////////////////////////////////////////////
  // GETTING OUR DATA
  ///////////////////////////////////////////////////////////////////////////
  */

  $.getJSON('js/data.json', (data) => {
    // sorts data by week, quarter and time
    data.forEach((value) => {
      const tempYear = value;
      tempYear.plays = _.orderBy(value.plays, ['week', 'quarter', 'sort_time'], ['asc', 'asc', 'desc']);
      sortedData.push(tempYear);
    });

    // passes off sorted data to arc drawing function
    drawPassGraphic(sortedData, '#arc-graphic');
    drawAttempts(sortedData);

    $.getJSON('js/rec-data.json', (receiverData) => {
      receivers = receiverData;
      // do an inital filter for Jason Witten to draw the first receiver chart
      filterReceivers('Jason Witten');
    });
  });
});
