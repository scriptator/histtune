/**
 * Created by johannesvass on 20.01.17.
 */

function initCharts(temperamentDict) {

    var series = prepareChartSeries(temperamentDict);

    Highcharts.chart('container', {
        title: {
            text: 'Comparison of temperaments',
            x: -20 //center
        },
        xAxis: {
            categories: ['E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'H', 'F♯', 'C♯', 'G♯']
        },
        yAxis: {
            title: {
                text: 'Deviation from Equal Temperament in Cents'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' cents'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: series
    });
}

function prepareChartSeries(temperamtentsDict) {
    var series = [];
    for (key in temperamtentsDict) {
        var data = temperamtentsDict[key];
        series.push({
            name: data.name,
            data: data.getDeviationsInCircleOfFifths(3)
        });
    }

    return series;
}
