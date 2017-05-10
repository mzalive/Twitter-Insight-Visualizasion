var api = {
    "sentiment"     : "http://115.146.93.125:5000/views/city_average_sentiment?callback=?",
    "sentiment_hr"  : "http://115.146.93.125:5000/views/hours_average_sentiment?callback=?",
    "sentiment_wk"  : "http://115.146.93.125:5000/views/weekday_average_sentiment?callback=?",
    "language"      : "http://115.146.93.125:5000/views/tweets_city_eng_noneng?callback=?",
    "emoji"         : "http://115.146.93.125:5000/views/emoji_contains_smile?callback=?",
    "salary"        : "http://115.146.93.125:5000/views/person_earn_2000_vic?callback=?",
    "population"    : "http://115.146.93.125:5000/views/aurin_city_eng_noneng?callback=?"
};

var color_range = colorbrewer.RdYlBu[11].reverse();
    active = d3.select(null);
    stroke_width = 2;
    label_size = 10;

//Width and height
var w = 850;
    h = 700;

//Define map projection
var projection = d3.geo.mercator()
    .center([ 134, -28 ])
    .translate([ w/2, h/2 ])
    .scale(1000);


//Define path generator
var path = d3.geo.path()
    .projection(projection);

var color = d3.scale.ordinal()
//.range(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9']);
    .range(['#EEEEEE']);

var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip")
    .style("opacity",0.0);

//purge current view
function purgeView() {
    $('#svganchor').empty();
    var extraContainer = $('#extraContainer');
    var extrasvg = extraContainer.find('#extrasvg').empty();
    var extraHeading = extraContainer.find('#extraHeading').empty();
}

//render base map
function renderMap() {
    purgeView();
    //Create SVG
    var svg = d3.select("#svganchor")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.append("rect")
        .attr("class", "backgroud")
        .attr("width", w)
        .attr("height", h)
        .on("click", resetMapView);

    var mashGroup = svg.append("g");
    var baseGroup = svg.append("g");

    var mashMap = mashGroup.append("g").classed("mashMap",true)
        .style("stroke-width", stroke_width)
        .style("fill", "#CCCCCC");

    var baseMap = baseGroup.append("g").classed("baseMap",true)
        .style("stroke-width", stroke_width)
        .style("stroke", "#555")
        .style("fill-opacity", 0);

    var mashLabel = mashGroup.append("g").classed("mashLabel", true)
        .style("font-size", label_size)
        .style("fill-opacity", 0);

    var baseLabel = baseGroup.append("g").classed("baseLabel", true)
        .style("font-size", label_size);

    baseMap.selectAll("path")
        .data(GCCSA_DATA.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "featureBlock")
        .attr("gcc_name", function (d) {
            return d.properties.GCC_NAME16;
        })
        .on("click", enlargeMapView);

    baseLabel.selectAll("text")
        .data(GCCSA_DATA.features)
        .enter()
        .append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.properties.GCC_NAME16;
        });


//render mash map
    mashMap.selectAll("path")
        .data(SA3_DATA.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "feature")
        .attr("sa3_name", function (d) {
            return d.properties.SA3_NAME16;
        });

    mashLabel.selectAll("text")
        .data(SA3_DATA.features)
        .enter()
        .append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d.properties.SA3_NAME16;
        });


    function enlargeMapView(d) {
        if (active.node() === this) return resetMapView();
        active.classed("active", false);
        active.transition().delay(750).style("display", "");

        active = d3.select(this).classed("active", true);
        active.transition().delay(750).style("display", "none");

        var bounds = path.bounds(d),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = .9 / Math.max(dx / w, dy / h),
            translate = [w / 2 - scale * x, h / 2 - scale * y];

        baseMap.transition()
            .duration(750)
            .style("stroke-width", stroke_width / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
            .style("fill-opacity", 0.6);
        baseLabel.transition()
            .duration(750)
            .style("font-size", label_size / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
            .style("fill-opacity", 0);
        mashMap.transition()
            .duration(750)
            .style("stroke-width", stroke_width / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
        mashLabel.transition()
            .duration(750)
            .style("font-size", label_size / scale + "px")
            .attr("transform", "translate(" + translate + ")scale(" + scale + ")")
            .style("fill-opacity", 1);
    }

    function resetMapView() {
        active.classed("active", false);
        active.transition().delay(750).style("display", "");
        active = d3.select(null);

        baseMap.transition()
            .duration(750)
            .style("stroke-width", stroke_width)
            .attr("transform", "")
            .style("fill-opacity", 0);
        baseLabel.transition()
            .duration(750)
            .style("font-size", label_size)
            .attr("transform", "")
            .style("fill-opacity", 1);
        mashMap.transition()
            .duration(750)
            .style("stroke-width", stroke_width)
            .attr("transform", "");
        mashLabel.transition()
            .duration(750)
            .style("font-size", label_size)
            .attr("transform", "")
            .style("fill-opacity", 0);

        $('#extraContainer').hide(750);
    }
}


function drawLegend(label_less, lable_more, pattern) {
    var color_scale = d3.scale.quantile().domain([0, 10]).range(pattern===undefined?color_range:pattern);
    var legendDiv = $('#heatLegend');
    legendDiv.find('.more').text(lable_more);
    legendDiv.find('.less').text(label_less);
    legendDiv.find('li').each(function(i, d){
        $(d).css("background", color_scale(i))
    });
}

function navRouter(action) {
    console.log(action);
    var nav  = $('.nav-senario');
    var active = nav.find('#'+action);
    if (!active.hasClass('active')) {
        nav.find('li').removeClass("active");
        active.addClass("active");
    }
    if (action === 'sentiment') renderSentiment();
    else if (action === 'language') renderLanguage();
    else if (action === 'emoji') renderEmoji();
}

function navDataRouter(action) {
    console.log(action);
    var nav  = $('.nav-data');
    var active = nav.find('#'+action);
    if (!active.hasClass('active')) {
        nav.find('li').removeClass("active");
        active.addClass("active");
    }
    if (action === 'sentiment') renderSentiment();
    else if (action === 'language') renderLanguage();
    else if (action === 'salary') renderSalary();
    else if (action === 'population') renderPopulation();
}


function renderSentiment() {
    $('.progress').show();
    renderMap();
    drawLegend('more negative', 'more positive');

    var subNav = $('.nav-data').empty();
    $("<li id='sentiment' class='active'><a href='javascript:void(0)' onclick='navDataRouter(\"sentiment\")'>Sentiment of Australia (Tweets)</a></li>").appendTo(subNav);
    $("<li id='salary'><a href='javascript:void(0)' onclick='navDataRouter(\"salary\")'>Average Salary VIC (AURIN)</a></li>").appendTo(subNav);

    $.when (
        $.getJSON(api.sentiment),
        $.getJSON(api.sentiment_hr),
        $.getJSON(api.sentiment_wk)
    ).done (function(city, hour, week) {
        city = city[0]; hour = hour[0]; week = week[0];
        console.log(city, hour, week);
        $('.progress').hide();

        // var max_value = d3.max(result, function(d){return d.value;});

        var color_scale = d3.scale.quantile().domain([0.3, 0.7]).range(color_range);

        $.each(city, function (i, field) {
            target = $("[sa3_name='" + field.name + "']");
            if (target.length === 1) {
                d3.select(target[0]).style("fill", color_scale(field.value))
                    .on("click", function () {
                        getDetailedSentiment(week, hour, field.name)
                    })
                    .on("mouseover",function(d){
                        tooltip.html(field.name + "<br/>" +field.value)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                    })
                    .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
                    .on("mouseout",function(d){ tooltip.style("opacity",0.0); });
            }
            else console.log(target.length)

        });
    });

    function getDetailedSentiment(week, hour, name) {

        var extraContainer = $('#extraContainer');
        var extrasvg = extraContainer.find('#extrasvg').empty();
        var extraHeading = extraContainer.find('#extraHeading').empty();
        $('<h2></h2>').text(name).appendTo(extraHeading);

        var height = 300;
        var width = 400;

        var wk;
        var hr;

        var color_scale = d3.scale.quantile().domain([0.3, 0.7]).range(color_range);

        for (i = 0; i<week.length; ++i) {
            if (week[i].name === name) {
                wk = week[i].weekday;
                break;
            }
        }
        for (i = 0; i<hour.length; ++i) {
            if (hour[i].name === name) {
                hr = hour[i]["24h_sentiments"];
                break;
            }
        }

        var week_day_name = ["Sun", "Mon", "Tus", "Wed", "Thu", "Fri", "Sat"];
        var week_day_value = [];
        $.each(week_day_name, function (i, name) {
            week_day_value[i] = (wk[name] === undefined) ? 0.5 : wk[name];
        });
        var hour_name = [];
        var hour_value = [];
        for (i = 0; i<24; ++i) {
            hour_name[i] = i<10?'0'+i:''+i;
        }
        $.each(hour_name, function (i, name) {
            hour_value[i] = (hr[name] === undefined) ? 0.5 : hr[name];
        });

        var wksvg = d3.select(extrasvg[0])
            .append('div').append('svg')
            .attr("height", height)
            .attr("width", width);

        var hrsvg = d3.select(extrasvg[0])
            .append('div').append('svg')
            .attr("height", height)
            .attr("width", width);


        var x = d3.scale.linear()
            .range([0, width-40]);

        var yw = d3.scale.ordinal()
            .rangeRoundBands([0, height-40], 0.1);

        var yh = d3.scale.ordinal()
            .rangeRoundBands([0, height-40], 0.1);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var ywAxis = d3.svg.axis()
            .scale(yw)
            .orient("left")
            .tickSize(0)
            .tickPadding(6);

        var yhAxis = d3.svg.axis()
            .scale(yh)
            .orient("left")
            .tickSize(0)
            .tickPadding(6);

        x.domain([0.3, 0.7]);
        yw.domain(week_day_name);
        yh.domain(hour_name);

        wksvg.selectAll(".bar")
            .data(week_day_value)
            .enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d < 0.5 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0.5, d)); })
            .attr("y", function(d, i) { return yw(week_day_name[i]); })
            .attr("width", function(d) { return Math.abs(x(d) - x(0.5)); })
            .attr("height", yw.rangeBand())
            .attr("fill", function (d) { return color_scale(d) })
            .attr('stroke', 'black')
            .on("mouseover",function(d){
                tooltip.html(d)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0);
            })
            .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
            .on("mouseout",function(d){ tooltip.style("opacity",0.0); });

        hrsvg.selectAll(".bar")
            .data(hour_value)
            .enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d < 0.5 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0.5, d)); })
            .attr("y", function(d, i) { return yh(hour_name[i]); })
            .attr("width", function(d) { return Math.abs(x(d) - x(0.5)); })
            .attr("height", yh.rangeBand())
            .attr("fill", function (d) { return color_scale(d) })
            .attr('stroke', 'black')
            .on("mouseover",function(d){
                tooltip.html(d)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0);
            })
            .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
            .on("mouseout",function(d){ tooltip.style("opacity",0.0); });

        wksvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height-40) + ")")
            .call(xAxis);

        hrsvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height-40) + ")")
            .call(xAxis);

        wksvg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0.5) + ",0)")
            .call(ywAxis);

        hrsvg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0.5) + ",0)")
            .call(yhAxis);

        extraContainer.show(750);
        $("html,body").animate({scrollTop: extraContainer.offset().top}, 500);

    }
}

function renderLanguage() {
    $('.progress').show();
    renderMap();

    var subNav = $('.nav-data').empty();
    $("<li id='language' class='active'><a href='javascript:void(0)' onclick='navRouter(\"language\")'>English Usage of Australia (Tweets)</a></li>").appendTo(subNav);
    $("<li id='population'><a href='javascript:void(0)' onclick='navDataRouter(\"population\")'>Native Language (AURIN)</a></li>").appendTo(subNav);

    $.when(
        $.getJSON(api.language)
    ).done (function(lang) {
        // lang = lang[0];
        console.log(lang);
        $('.progress').hide();

        var min_value = d3.min(lang, function(d){return d.language['en']/(d.language['en']+d.language['non-en']); });
        var max_value = d3.max(lang, function(d){return d.language['en']/(d.language['en']+d.language['non-en']); });
        var color_scale = d3.scale.quantile().domain([min_value, max_value]).range(color_range);
        drawLegend('more non-eng ('+min_value.toFixed(2)+')', 'more english ('+max_value.toFixed(2)+')');

        $.each(lang, function (i, field) {
            target = $("[sa3_name='" + field.name + "']");
            if (target.length === 1) {
                d3.select(target[0])
                    .style("fill", color_scale(field.language.en/(field.language['en']+field.language['non-en'])))
                    .on("mouseover",function(d){
                        tooltip.html(field.name + "<br/>Tweets in English: " +field.language['en'] + "<br/>Tweets in Other Language(s): " + field.language['non-en'])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                    })
                    .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
                    .on("mouseout",function(d){ tooltip.style("opacity",0.0); });
            }
            else console.log(field.name, target.length)

        });
    });
}

function renderEmoji() {
    $('.progress').show();
    renderMap();

    var subNav = $('.nav-data').empty();

    $.when(
        $.getJSON(api.emoji)
    ).done (function(emoji) {
        // lang = lang[0];
        console.log(emoji);
        $('.progress').hide();

        var min_value = d3.min(emoji, function(d){return d.value; });
        var max_value = d3.max(emoji, function(d){return d.value; });
        var color_range = colorbrewer.Reds[9];
        var color_scale = d3.scale.quantile().domain([min_value, max_value]).range(color_range);
        drawLegend('less 😀 ('+ min_value.toFixed(2) +')', 'more 😀 ('+ max_value.toFixed(2) +')', color_range);

        $.each(emoji, function (i, field) {
            target = $("[sa3_name='" + field.name + "']");
            if (target.length === 1) {
                d3.select(target[0])
                    .style("fill", color_scale(field.value))
                    .on("mouseover",function(d){
                        tooltip.html(field.name + "<br/>" +field.value)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                    })
                    .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
                    .on("mouseout",function(d){ tooltip.style("opacity",0.0); });
                }
            else console.log(field.name, target.length)

        });
    });
}

function renderSalary() {
    $('.progress').show();
    renderMap();
    $.when(
        $.getJSON(api.salary)
    ).done (function(salary) {
        // lang = lang[0];
        console.log(salary);
        $('.progress').hide();

        var min_value = d3.min(salary, function(d){return d.number; });
        // var max_value = d3.max(salary, function(d){return d.number; });
        var max_value = 10000;
        var color_range = colorbrewer.Reds[9];
        var color_scale = d3.scale.quantile().domain([min_value, max_value]).range(color_range);
        drawLegend('less income ('+ min_value +')', 'more income ('+ max_value +')', color_range);

        $.each(salary, function (i, field) {
            target = $("[sa3_name='" + field.name + "']");
            if (target.length === 1) {
                d3.select(target[0])
                    .style("fill", color_scale(field.number))
                    .on("mouseover",function(d){
                        tooltip.html(field.name + "<br/>" +field.number)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                    })
                    .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
                    .on("mouseout",function(d){ tooltip.style("opacity",0.0); });
            }
            else console.log(field.name, target.length)

        });

        jQuery.fn.d3Click = function () {
            this.each(function (i, e) {
                var evt = new MouseEvent("click");
                e.dispatchEvent(evt);
            });
        };
        $("[gcc_name='Rest of Vic.']").d3Click(); // focus

    });
}

function renderPopulation() {
    $('.progress').show();
    renderMap();
    $.when(
        $.getJSON(api.population)
    ).done (function(population) {
        // lang = lang[0];
        console.log(population);
        $('.progress').hide();

        var min_value = d3.min(population, function(d){return d['non-en']/(d['en']+d['non-en']); });
        var max_value = d3.max(population, function(d){return d['non-en']/(d['en']+d['non-en']); });
        var color_scale = d3.scale.quantile().domain([min_value, max_value]).range(color_range);
        drawLegend('more non-eng ('+min_value.toFixed(2)+')', 'more english ('+max_value.toFixed(2)+')');

        $.each(population, function (i, field) {
            target = $("[sa3_name='" + field.name + "']");
            if (target.length === 1) {
                d3.select(target[0])
                    .style("fill", color_scale(field['non-en']/(field['en']+field['non-en'])))
                    .on("mouseover",function(d){
                        tooltip.html(field.name + "<br/>Speaking Only English: " +field['non-en'] + "<br/>Speaking Other Language(s): " +field['en'])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px")
                            .style("opacity",1.0);
                    })
                    .on("mousemove",function(d){ tooltip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY + 20) + "px"); })
                    .on("mouseout",function(d){ tooltip.style("opacity",0.0); });
            }
            else console.log(field.name, target.length)

        });
    });
}

//render sentiment data
$(document).ready(function() {
    renderSentiment();
});