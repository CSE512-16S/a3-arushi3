
function MDScalculate(data,state) {
    var _data = data;
    // Find range of values to scale
    var ranges = [];
    for (i=0;i<_data[0].length;i++){ // for all columns, even the first time column
        var min = 10000000;
        var max = -1000000;
        for (j=0;j<_data.length;j++) {
            min = Math.min(min,_data[j][i]);
            max = Math.max(max,_data[j][i]);
        }
        ranges.push([min,max,Math.abs(max-min)]);
    }
    var bins = 5;
    var binsize =[];
    for (i=0;i<_data[0].length;i++) { // for all columns, even time
        binsize.push(ranges[i][2] * 1.2 / bins);
        ranges[i][0] = ranges[i][0] - 0.1*ranges[i][2];
        ranges[i][0] = ranges[i][1] + 0.1*ranges[i][2];
    }
    // Calculating the distance or similarity matrix for 1 column of data
    var distances = []; // calculating it for the Gyration and Energy
    for (i=0; i< _data.length; i++) {
        var arr = [];
        for (j=0; j< _data.length; j++) {
            var dist = 0;
            for (k=1;k<_data[0].length;k++) {
                if (state[k-1] == 1) {
                    //dist = dist + Math.pow((_data[i][k] - _data[j][k])/ranges[k][2],4);
                    dist = dist + Math.pow(Math.floor((_data[i][k]-ranges[k][0])/binsize[k]) - Math.floor((_data[j][k]-ranges[k][0])/binsize[k]),2);
                }
            }

            arr.push(Math.sqrt(dist));
        }
        distances.push(arr);
    }

    // Conducting multi dimensional scaling (MDS) for this distance matrix
    // This is the classic or simplest version of MDS. We are attempting to recreate the points
    // in 2 dimensions only
    var dimensions = 2;

    // square distances
    var M = numeric.mul(-.5, numeric.pow(distances, 2));

    // double centre the rows/columns
    function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
    var rowMeans = mean(M),
        colMeans = mean(numeric.transpose(M)),
        totalMean = mean(rowMeans);

    for (var i = 0; i < M.length; ++i) {
        for (var j = 0; j < M[0].length; ++j) {
            M[i][j] += totalMean - rowMeans[i] - colMeans[j];
        }
    }

    // take the SVD of the double centred matrix, and return the
    // points from it
    var ret = numeric.svd(M),
        eigenValues = numeric.sqrt(ret.S);
    MDS = ret.U.map(function(row) {
        return numeric.mul(row, eigenValues).splice(0, dimensions);
    });

    // Rotating matrix
    var Rz = [[Math.cos(0.25*22/7),Math.sin(0.25*22/7)],[-1*Math.sin(0.25*22/7),Math.cos(0.25*22/7)]];

    MDS = numeric.dot(MDS,Rz);
    return MDS;
}

function plotd3(MDSdata,orig,state) {
    function getRange(MDSdata) {
        var xmin = +1000000;
        var xmax = -10000000;
        var ymin = +1000000;
        var ymax = -1000000;
        for (i = 0; i < MDSdata.length; i++) {
            xmin = Math.min(MDSdata[i][0], xmin);
            ymin = Math.min(MDSdata[i][1], ymin);
            xmax = Math.max(MDSdata[i][0], xmax);
            ymax = Math.max(MDSdata[i][1], ymax);
        }
        return [xmin,xmax,ymin,ymax];
    }
    var range = getRange(MDSdata);
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    var x = d3.scale.linear() // is a function that takes the value of a varibale and returns the position that it
        .range([0, width]) // should occupy on that axis
        .domain([range[0], range[1]]);

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([range[2], range[3]]);
    //removing overlap in points
    var count = 400;
    var radius = 5;
    var min_dist = 2 * radius;
    while (count >0) {
        for (i = 0; i < MDSdata.length; i++) {
            for (j = 0; j < MDSdata.length; j++) {
                // detect overlap
                var dx = (x(MDSdata[i][0]) - x(MDSdata[j][0]));
                var dy = (y(MDSdata[i][1]) - y(MDSdata[j][1]));
                var dist = numeric.sqrt([dx * dx + dy * dy])[0];
                if (min_dist > dist) {
                    // for all overlaps
                    // generate a random angle where the point may be moved
                    var angle = numeric.random([1,1])*3.14*2;
                    MDSdata[j][0] = x.invert(x(MDSdata[i][0]) + 2*radius*numeric.cos([angle])[0]);
                    MDSdata[j][1] = y.invert(y(MDSdata[i][1]) + 2*radius*numeric.sin([angle])[0]);

                }
            }
            count = count - 1;
        }
    }
    range = getRange(MDSdata);
    var scale = height/Math.max(x(range[1])-x(range[0]),y(range[3])-y(range[2]));
    MDSdata = numeric.mul(MDSdata,scale);
    range = getRange(MDSdata);
    x.domain([range[0]-0.1*Math.abs(range[1]-range[0]),range[1]+0.1*Math.abs(range[1]-range[0])]);
    y.domain([range[2]-0.1*Math.abs(range[3]-range[2]),range[3]+0.1*Math.abs(range[3]-range[2])]);
    // Get min and max values

// Size and numbers for the x and y axis

    var zoom = d3.behavior.zoom()
        .scaleExtent([1,30])
        .center([width/2,height/2])
        .on("zoom", zoomed);
    function zoomed() {
        svg.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
// Color scale for use
    var color = d3.scale.category10();

// Total size of SVG
    var svg = d3.select("#wrap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
    var rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "white")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .style("pointer-events", "all");
// Input data - does not work with Chrome
// Define the div for the tooltip
    var tooltip = d3.select("body")
        .append("div")
        .data(orig)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("stroke", "black");


// Making an array that has the new and old points
    var finaldata = [];
    for (i=0;i<MDSdata.length;i++) {
        finaldata.push([MDSdata[i][0],MDSdata[i][1],orig[i]]);
    }
    function getColor(data) {
        var ranges = calcRanges(orig, 5);
        var sum=0;
        for (k=0;k<state.length;k++) {
            if (state[k] == 1) {
                sum += Math.pow(Math.floor( Math.abs(data[k+1]-ranges[k+1][0])/ranges[k+1][2]),2);
            }
        }
        return Math.sqrt(sum);
    }

    var colorline = d3.scale.linear().domain([0,finaldata.length]).range(["white","black"]);
// Put data in circles
    svg.selectAll(".dot")
        .data(finaldata)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 10)
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); })
        .style("fill",function(d) {
            return color(getColor(d[2])); })
        .on("mouseover", function (d,i) {
            d3.select(this).attr("r", 20).attr("stroke","black").attr("stroke-width",2);
            return tooltip.style("visibility", "visible").style("color", "white").style("background-color", "lightsteelblue").style("padding","2px")
                .html( "Time (ps)= " + d[2][0] +"</br>  Energy= "+d[2][1] + "</br>  CMMT= "+d[2][2]+"</br>  " +"SS Total= "+d[2][3]+
                    "</br>  D<sub>12</sub></sub>,D<sub>13</sub></sub>,D<sub>14</sub></sub>= "+d[2][4]+","+d[2][5]+","+d[2][6]+
                        "</br>  D<sub>23</sub></sub>,D<sub>24</sub></sub>,D<sub>34</sub></sub>="+d[2][7]+","+d[2][8]+","+d[2][9]+
                        "</br>  Radius of Gyration 1,2,3,4"+d[2][10]+","+d[2][11]+","+d[2][12]+","+d[2][13]
                );
        })
        .on("mousemove", function () {
            return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("r", 10).attr("stroke-width",0);
            return tooltip.style("visibility", "hidden");
        });

    // Making markers
    defs = svg.append("defs");

    defs.append("marker")
        .attr({
            "id":"arrow",
            "viewBox":"0 -5 10 10",
            "refX":5,
            "refY":0,
            "markerWidth":4,
            "markerHeight":4,
            "orient":"auto",
            "fill" : "red"
        })
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class","arrowHead");


// Make every path different using a loop
    for (k=0; k<finaldata.length;k++){
        var line = d3.svg.line()
            .x(function (d) { return x(d[0]);})
            .y(function (d) { return y(d[1]);})
            .defined(function (d,i) { return i== k || i == k+1; })
            .interpolate("cardinal");

        svg.append("path")
            .attr("d",line(finaldata))
            .attr("stroke", function (d){ return colorline(k);})
            .attr("stroke-width",2)
            .attr("opacity",0.05)
            .attr("opacity",1)
            .attr("fill","none")
            .on("mouseover",function (d) {
                d3.select(this).attr({
                    "class":"arrow",
                    "marker-end":"url(#arrow)",
                    "x1":width/2,
                    "y1":height/2,
                    "x2":margin + Math.random()*(width-margin*2),
                    "y2":margin + Math.random()*(height-margin*2)
                }).attr("stroke-width",6).attr("opacity",1);
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("marker-end","none")
                    .attr("stroke-width",2).attr("opacity",0.05);
            });
    }

}
function updatePlotd3(MDSdata,orig,state) {
    d3.select("svg").remove();
    plotd3(MDSdata,orig,state);

}

function calcRanges(data,bins) {
    var ranges = [];
    for (i=0;i<data[0].length;i++){ // for all columns, even the first time column
        var min = 10000000;
        var max = -1000000;
        for (j=0;j<data.length;j++) {
            min = Math.min(min,data[j][i]);
            max = Math.max(max,data[j][i]);
        }
        ranges.push([min,max,Math.abs(max-min)]);
    }
    var output =[];
    for (i=0;i<data[0].length;i++) { // for all columns, even time
        ranges[i][0] = ranges[i][0] - 0.1*ranges[i][2];
        ranges[i][0] = ranges[i][1] + 0.1*ranges[i][2];
        output.push([ranges[i][0],ranges[i][1],ranges[i][2] * 1.2 / bins]);
    }
    return output;
}