//sortable heatmap codebase created by ianyfchang http://bl.ocks.org/ianyfchang/8119685//

var margin = {top: 114, right: 2, bottom: 2, left: 98},
  cellSize = 29;
  col_number = 16;
  row_number = 9;
  width = cellSize * col_number, 
  height = cellSize * row_number,
  colors = ['#ffffff','#ff2700'];
  hcrow = [1,2,3,4,5,6,7,8,9],
  hccol = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
  insignificant = '#dddddd'

  rowLabel = ['HOU @ DAL','ARZ @ DEN','BUF @ DET','BAL @ IND','PIT @ JAC','CIN @ NE','NYJ @ SD','KC @ SF','CLE @ TEN'], 
  colLabel = ['BUF','NE','MIA','NYJ','CIN','BAL','PIT','CLE','SD','DEN','KC','OAK','IND','HOU','TEN','JAC'];

d3.tsv('./data/data_heatmap.tsv', function(d) {

  return {
    row: +d.row_idx,
    col: +d.col_idx,
    col_name: d.col_name,
    game: d.row_name,
    value: +d.diff,
    home: d.home,
    away: d.away,
    initial_chances: +d.initial_chances,
    if_home: +d.if_home,
    if_away: +d.if_away,
    sig: +d.sig

  };
},

function(error, data) {

  var colorScale = d3.scale.linear()
    .domain([0,.15])
    .range(colors),

  svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),

  rowSortOrder = true,
  colSortOrder = true,
  row_value = '',
  col_value = '',
  text_value = '',
  initial_chances = '',
  homegap = '',
  awaygap = '',
  swing = '';

  var rowLabels = svg.append('g')
    .selectAll('.rowLabelg')
    .data(rowLabel)
    .enter()
    .append('text')
    .text(function (d) {return d;})
    .attr('x', 0)
    .attr('y', function (d, i) {
      return (hcrow.indexOf(i+1)) * cellSize;
    })
    .style('text-anchor', 'end')
    .attr('transform', 'translate(-10,' + cellSize / 1.5 + ')')
    .attr('class', function (d,i) {
      return 'rowLabel mono r'+i;
    }) 
    .on('mouseover', function(d) {
      d3.select(this).classed('text-hover',true);
    })
    .on('mouseout' , function(d) {
      d3.select(this).classed('text-hover',false);
    })
    .on('click', function(d,i) {
      sortbylabel('r',i)
    });

  var colLabels = svg.append('g')
    .selectAll('.colLabelg')
    .data(colLabel)
    .enter()
    .append('text')
    .text(function (d) {return d;})
    .attr('y', 0)
    .attr('x', function (d, i) {
      return hccol.indexOf(i + 1) * cellSize;
    })
    .style('text-anchor', 'middle')
    .attr('transform', 'translate('+cellSize / 2 + ',-12)')
    .attr('class',  function (d,i) {
      return 'colLabel mono c' + i;
    })
    .on('mouseover', function(d) {
      d3.select(this).classed('text-hover',true);
    })
    .on('mouseout' , function(d) {
      d3.select(this).classed('text-hover',false);
    })
    .on('click', function(d,i) {
      sortbylabel('c',i)
    });


  var heatMap = svg.append('g').attr('class','g3')
      .selectAll('.cellg')
      .data(data,function(d) {
        return d.row + ':' + d.col;
      })
      .enter()
      .append('rect')
      .attr('x', function(d) {
        return hccol.indexOf(d.col) * cellSize;
      })
      .attr('y', function(d) {
        return hcrow.indexOf(d.row) * cellSize;
      })
      .attr('class', function(d) {
        return 'cell cell-border cr'+(d.row - 1)+' cc'+(d.col - 1);
      })
      .attr('width', cellSize)
      .attr('height', cellSize)
      .style('fill', function(d) { 
        if(d.sig === 0){
          d.value = -1;
          return insignificant;
        } 
        else {
            return colorScale(d.value)
        }
      })
      .on('mouseover', function(d,i) {

        row_value = '.cr'+(d.row - 1);
        col_value = '.cc'+(d.col - 1);

        //set cell class to hover
        d3.select(this)
          .classed('cell-hover',true)
          .style('fill','#3c3c3c')

        //set row and column label classes and fade out non-selected
        d3.selectAll('.rowLabel').classed('text-highlight',function(r,ri) {
          return ri === (d.row - 1);
        });
        d3.selectAll('.colLabel').classed('text-highlight',function(c,ci) {
          return ci === (d.col - 1);
        });
        d3.selectAll('.cell').style('opacity','0.3');
        d3.selectAll(row_value).style('opacity','1');
        d3.selectAll(col_value).style('opacity','1');

        //make text white
        d3.selectAll('.celllabel')
        .filter(row_value)
        .filter(col_value)
        .style("fill", '#ffffff');

        //change explanation text at bottom

        if (d.sig === 1) {

          initial_chances = parseFloat((d.initial_chances * 100).toString()).toFixed(1);
          homegap = parseFloat(((d.if_home-d.initial_chances) * 100).toString()).toFixed(1);
          awaygap = parseFloat(((d.if_away-d.initial_chances) * 100).toString()).toFixed(1);
          swing = parseFloat(Math.abs(d.value * 100).toString()).toFixed(1);


          if(d.if_home-d.initial_chances > 0) {
            homegap = '+' + homegap;
            document.getElementById('homechances').setAttribute('style','color: #60BD68')
          }
          else if(d.if_home-d.initial_chances < 0) {
            document.getElementById('homechances').setAttribute('style','color: #ff2700')
          }


          if(d.if_away-d.initial_chances > 0) {
            awaygap = '+' + awaygap;
            document.getElementById('awaychances').setAttribute('style','color: #60BD68')
          }
          else if(d.if_away-d.initial_chances < 0) {
            document.getElementById('awaychances').setAttribute('style','color: #ff2700')
          }


          if(initial_chances === '0.0') {
           initial_chances = '<0.1';
          }

          if(homegap === '0.0') {
            homegap = '~0.0';
          }

          if(awaygap === '0.0') {
            awaygap = '~0.0';
          }

          if(swing === '0.0') {
            swing = '<0.1';
          }

          document.getElementById('game').innerHTML = d.game;
          document.getElementById('selectedteam').innerHTML = d.col_name;
          document.getElementById('initial_chances').innerHTML = initial_chances+'%';
          document.getElementById('homechances').innerHTML = homegap;
          document.getElementById('hometeam').innerHTML = d.home;
          document.getElementById('awaychances').innerHTML = awaygap;
          document.getElementById('awayteam').innerHTML = d.away;
          document.getElementById('gap').innerHTML = swing;
          document.getElementById('explanation').setAttribute('style','display: block')

        };
      })
      .on('mouseout', function() {

        d3.select(this)
          .classed('cell-hover',false)
          .style('fill', function(d) { 
            if(d.sig === 0) {
              return insignificant;
            }
            else {
              return colorScale(d.value);
            }
          });
             
        d3.selectAll('.rowLabel').classed('text-highlight',false);
        d3.selectAll('.colLabel').classed('text-highlight',false);
        d3.selectAll('.cell').style('opacity','1');

        d3.selectAll('.celllabel')
        .filter(row_value)
        .filter(col_value)
        .style('fill',function(d) {
          if(d.value>.09999) {
            return '#ffffff'
          }
          else {
            return '#737373'
          }
        })

      });


  var heatlabels = svg.append('g').attr('class','g3')
      .selectAll('.textg')
      .data(data,function(d) {
        return d.row + ':' + d.col;
      })
      .enter()
      .append('text')
      .text(function(d) {
        if(d.sig === 1) {
          return Math.round(d.value*100)
        }
      })
      .style('text-anchor','middle')
      .style('fill',function(d) {
        if(d.value>.09999) {
          return '#ffffff'
        }
        else {
          return '#737373'
        }
      })
      .attr('x', function(d) {
        return hccol.indexOf(d.col) * cellSize + cellSize / 2;
      })
      .attr('y', function(d) {
        return hcrow.indexOf(d.row) * cellSize + cellSize / 1.49;
      })
      .attr('class', function(d) {
        return 'celllabel cr'+(d.row - 1)+' cc'+(d.col - 1);
      })


// Change ordering of cells

  function sortbylabel(rORc,i){
    var t = svg.transition().duration(350),
    diffs = [],
    sorted; // sorted is zero-based index

    d3.selectAll('.c' + rORc + i) 
      .filter(function(ce) {
        diffs.push(ce.value);
      });

    if(rORc === 'r') { // sort row

      document.getElementById('divisionnames').setAttribute('style','opacity: 0')

      sorted=d3.range(col_number).sort(function(a,b){return diffs[b]-diffs[a];});

      t.selectAll('.cell')
        .attr('x', function(d) {;
          return sorted.indexOf(d.col - 1) * cellSize;
        });

      t.selectAll('.celllabel')
        .attr('x', function(d) { 
          return sorted.indexOf(d.col - 1) * cellSize + cellSize / 2; 
        });

      t.selectAll('.colLabel')
        .attr('x', function (d, i) { 
          return sorted.indexOf(i) * cellSize;
        });
    } 

    else { // sort column

      sorted = d3.range(row_number).sort(function(a,b) {
        return diffs[b] - diffs[a];
        });

      t.selectAll('.cell')
        .attr('y', function(d) {
          return sorted.indexOf(d.row - 1) * cellSize; 
        });
      t.selectAll('.celllabel')
        .attr('y', function(d) {
          return sorted.indexOf(d.row - 1) * cellSize + cellSize / 1.49;
        });

      t.selectAll('.rowLabel')
        .attr('y', function (d, i) {
          return sorted.indexOf(i) * cellSize;
        });
    }
  }

});