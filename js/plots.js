/**
 * Created by Johannes Vass, 2017
 */

var seriesLookup = {};

function initCharts(temperamentDict) {

    var series = prepareChartSeries(temperamentDict);

    chart = Highcharts.chart('chartsContainer', {
        title: {
            text: '',
            x: -20 //center
        },
        xAxis: {
            categories: ['E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'H', 'F♯', 'C♯', 'G♯']
        },
        yAxis: {
            title: {
                text: 'Abweichungen von der gleichstufigen Stimmung in Cent'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' Cent',
            split: true,
            distance: 30,
            padding: 5,
            valueDecimals: 1
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0
        },
        series: series
    });
}

function prepareChartSeries(temperamtentsDict) {
    var series = [];
    var i=0;
    for (var key in temperamtentsDict) {
        seriesLookup[key] = i++;
        var data = temperamtentsDict[key];
        series.push({
            name: data.name,
            data: data.getDeviationsInCircleOfFifths(-3)
        });
    }
    return series;
}

function updateSeries(temperament) {
    var temperamentSeries = chart.series[seriesLookup[temperament.identifier]];

    temperamentSeries.setData(temperament.getDeviationsInCircleOfFifths(-3));
}
