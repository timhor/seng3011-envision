let apiData;

window.onload = function() {
    updateAPIQuery();
    document.getElementById('loadingSpinner').hidden = true;
};

function getData(){
    let instrumentID = document.getElementById('instrument_id').value;
    let dateOfInterest = document.getElementById('date_of_interest').value;
    let lowerWindow = document.getElementById('lower_window').value;
    let upperWindow = document.getElementById('upper_window').value;

    let listOfVar = getListOfVars();

    document.getElementById('queryResultsCard').scrollIntoView({block: 'start', behavior: 'smooth'});

    document.getElementById('queryResults').hidden = true;
    document.getElementById('loadingSpinner').hidden = false;

    if (getListOfVars != '') {
        $.getJSON(`api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, (data) => {
            apiData = data;
            let dataString = JSON.stringify(data, null, 3);
            document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
            document.getElementById('loadingSpinner').hidden = true;
            document.getElementById('queryResults').hidden = false;
            drawGraphs();
        })
    } else {
        $.getJSON(`api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, (data) => {
            apiData = data;
            let dataString = JSON.stringify(data, null, 3);
            document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
            document.getElementById('loadingSpinner').hidden = true;
            document.getElementById('queryResults').hidden = false;
            drawGraphs();
        })
    }
};

function drawGraphs() {

    var graphOptions = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    };

    // Convert API Data to Array

    var returnData = new Array();
    var returnPctData = new Array();
    var cmReturnData = new Array();
    var cmReturnPctData = new Array();
    var avReturnData = new Array();
    var avReturnPctData = new Array();
    var dailySpreadData = new Array();
    var volumeData = new Array();
    var volumePctData = new Array();

    var dates = new Array();

    // console.log(apiData.Company_Returns[0].Data);
    apiData.Company_Returns[0].Data.forEach(rec => {
        if (rec.Return !== 'undefined') returnData.push(rec.Return);
        if (rec.Return_pct !== 'undefined') returnPctData.push(rec.Return_pct*100);
        if (rec.CM_Return !== 'undefined') cmReturnData.push(rec.CM_Return);
        if (rec.CM_Return_pct !== 'undefined') cmReturnPctData.push(rec.CM_Return_pct*100);
        if (rec.AV_Return !== 'undefined') avReturnData.push(rec.AV_Return);
        if (rec.AV_Return_pct !== 'undefined') avReturnPctData.push(rec.AV_Return_pct*100);
        if (rec.Daily_Spread !== 'undefined') dailySpreadData.push(rec.Daily_Spread);
        if (rec.Volume !== 'undefined') volumeData.push(rec.Volume);
        if (rec.Volume_pct !== 'undefined') volumePctData.push(rec.Volume_pct*100);

        let mydate = new Date(rec.Date);
        let formattedDate = mydate.toLocaleDateString();
        dates.push(formattedDate);
    });

    // Build Graph
    if (apiData.Company_Returns[0].Data.Return !== 'undefined') {
        document.getElementById('return_graph').hidden = false;
        let ctx = document.getElementById('return_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Return',
                        data: returnData,
                        fill: false,
                        borderColor : "rgb(75, 192, 192)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('return_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.Return_pct !== 'undefined') {
        document.getElementById('return_pct_graph').hidden = false;
        let ctx = document.getElementById('return_pct_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Return Percentage',
                        data: returnPctData,
                        fill: false,
                        borderColor : "rgb(75, 192, 192)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('return_pct_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.CM_Return !== 'undefined') {
        document.getElementById('cm_return_graph').hidden = false;
        let ctx = document.getElementById('cm_return_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Cumulative Return',
                        data: cmReturnData,
                        fill: false,
                        borderColor : "rgb(0, 100, 100)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('cm_return_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.CM_Return_pct !== 'undefined') {
        document.getElementById('cm_return_pct_graph').hidden = false;
        let ctx = document.getElementById('cm_return_pct_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Cumulative Return Percentage',
                        data: cmReturnPctData,
                        fill: false,
                        borderColor : "rgb(0, 100, 100)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('cm_return_pct_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.AV_Return !== 'undefined') {
        document.getElementById('av_return_graph').hidden = false;
        let ctx = document.getElementById('av_return_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Average Return',
                        data: avReturnData,
                        fill: false,
                        borderColor : "rgb(100, 0, 100)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('av_return_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.AV_Return_pct !== 'undefined') {
        document.getElementById('av_return_pct_graph').hidden = false;
        let ctx = document.getElementById('av_return_pct_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Average Return Percentage',
                        data: avReturnPctData,
                        fill: false,
                        borderColor : "rgb(100, 0, 100)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('av_return_pct_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.Daily_Spread !== 'undefined') {
        document.getElementById('daily_spread_graph').hidden = false;
        let ctx = document.getElementById('daily_spread_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Daily Spread',
                        data: dailySpreadData,
                        fill: false,
                        borderColor : "rgb(125, 125, 125)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('daily_spread_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.Volume !== 'undefined') {
        document.getElementById('volume_graph').hidden = false;
        let ctx = document.getElementById('volume_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Volume',
                        data: volumeData,
                        fill: false,
                        borderColor : "rgb(10, 10, 10)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('volume_graph').hidden = true;
    }
    if (apiData.Company_Returns[0].Data.Volume_pct !== 'undefined') {
        document.getElementById('volume_pct_graph').hidden = false;
        let ctx = document.getElementById('volume_pct_graph').getContext('2d');
        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Volume Percentage',
                        data: volumePctData,
                        fill: false,
                        borderColor : "rgb(10, 10, 10)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    } else {
        document.getElementById('volume_pct_graph').hidden = true;
    }
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let colourClass = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                colourClass = 'key';
            } else {
                colourClass = 'string';
            }
        } else if (/true|false/.test(match)) {
            colourClass = 'boolean';
        } else if (/null/.test(match)) {
            colourClass = 'null';
        }
        return '<span class="' + colourClass + '">' + match + '</span>';
    });
}

function updateAPIQuery(){
    let instrumentID = document.getElementById('instrument_id').value;
    let dateOfInterest = document.getElementById('date_of_interest').value;
    let lowerWindow = document.getElementById('lower_window').value;
    let upperWindow = document.getElementById('upper_window').value;

    let listOfVar = getListOfVars();

    if (listOfVar != '') {
        var apiQuery = window.location.protocol + '//' + window.location.host + `/api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    } else {
        var apiQuery = window.location.protocol + '//' + window.location.host + `/api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    }
    document.getElementById('apiQuery').innerText = apiQuery;
}

function copyToClipboard() {
    let copyText = document.getElementById("apiQuery");
    copyText.select();
    document.execCommand("Copy");

    let tooltip = document.getElementById("copyBtnTooltip");
    tooltip.innerHTML = "Copied!";
}

function copied() {
    let tooltip = document.getElementById("copyBtnTooltip");
    tooltip.innerHTML = "Copy to Clipboard";
}
