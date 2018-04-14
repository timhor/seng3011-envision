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

    document.getElementById('scrollToGraphsBtn').hidden = true;
    document.getElementById('graphSeparator').hidden = true;
    document.getElementById('graphs').hidden = true;
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
            document.getElementById('scrollToGraphsBtn').hidden = false;
        })
    } else {
        $.getJSON(`api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, (data) => {
            apiData = data;
            let dataString = JSON.stringify(data, null, 3);
            document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
            document.getElementById('loadingSpinner').hidden = true;
            document.getElementById('queryResults').hidden = false;
            drawGraphs();
            document.getElementById('scrollToGraphsBtn').hidden = false;
        })
    }
};

function scrollToGraphs() {
    document.getElementById('graphs').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

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

    returnDatasets = new Array();
    returnPercentageDatasets = new Array();
    volumeDatasets = new Array();
    volumePercentageDatasets = new Array();
    dailySpreadDatasets = new Array();

    // Fill up data arrays
    apiData.Company_Returns[0].Data.forEach(rec => {

        if (rec.Return !== undefined) {returnData.push(Number((rec.Return).toFixed(4)));}
        if (rec.Return_pct !== undefined) {returnPctData.push(Number((rec.Return_pct*100).toFixed(4)));}
        if (rec.CM_Return !== undefined) {cmReturnData.push(Number((rec.CM_Return).toFixed(4)));}
        if (rec.CM_Return_pct !== undefined) {cmReturnPctData.push(Number((rec.CM_Return_pct*100).toFixed(4)));}
        if (rec.AV_Return !== undefined) {avReturnData.push(Number((rec.AV_Return).toFixed(4)));}
        if (rec.AV_Return_pct !== undefined) {avReturnPctData.push(Number((rec.AV_Return_pct*100).toFixed(4)));}
        if (rec.Daily_Spread !== undefined) {dailySpreadData.push(Number((rec.Daily_Spread).toFixed(2)));}
        if (rec.Volume !== undefined) {volumeData.push(Number((rec.Volume).toFixed(4)));}
        if (rec.Volume_pct !== undefined) {volumePctData.push(Number((rec.Volume_pct*100).toFixed(4)));}

        let mydate = new Date(rec.Date);
        let formattedDate = mydate.toLocaleDateString();
        dates.push(formattedDate);
    });

    // Add datasets for just returns graph
    if (returnData.length > 0) {
        returnDatasets.push(
            {
                label: 'Return',
                data: returnData,
                fill: false,
                borderColor : "rgb(57, 106, 177)",
                lineTension :0.1,
            }
        );
    }
    if (cmReturnData.length > 0) {
        returnDatasets.push(
            {
                label: 'Cumulative Return',
                data: cmReturnData,
                fill: false,
                borderColor : "rgb(218, 124, 48)",
                lineTension :0.1,
            }
        );
    }
    if (avReturnData.length > 0) {
        returnDatasets.push(
            {
                label: 'Average Return',
                data: avReturnData,
                fill: false,
                borderColor : "rgb(62, 150, 81)",
                lineTension :0.1,
            }
        );
    }

    // Add datasets for percentage returns graph
    if (returnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Return Percentage',
                data: returnPctData,
                fill: false,
                borderColor : "rgb(57, 106, 177)",
                lineTension :0.1,
            }
        );
    }
    if (cmReturnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Cumulative Return Percentage',
                data: cmReturnPctData,
                fill: false,
                borderColor : "rgb(218, 124, 48)",
                lineTension :0.1,
            }
        );
    }
    if (avReturnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Average Return Percentage',
                data: avReturnPctData,
                fill: false,
                borderColor : "rgb(62, 150, 81)",
                lineTension :0.1,
            }
        );
    }

    // Add datasets for volume graph
    if (volumeData.length > 0) {
        volumeDatasets.push(
            {
                label: 'Volume Traded',
                data: volumeData,
                fill: false,
                borderColor : "rgb(107, 76, 154)",
                lineTension :0.1,
            }
        );
    }

    // Add datasets for volume percentage graph
    if (volumePctData.length > 0) {
        volumePercentageDatasets.push(
            {
                label: 'Volume Traded Percentage',
                data: volumePctData,
                fill: false,
                borderColor : "rgb(107, 76, 154)",
                lineTension :0.1,
            }
        );
    }

    // Add datasets for daily spread graph
    if (dailySpreadData.length > 0) {
        dailySpreadDatasets.push(
            {
                label: 'Daily Spread',
                data: dailySpreadData,
                fill: false,
                borderColor : "rgb(148, 139, 61)",
                lineTension :0.1,
            }
        );
    }

    // Build Returns Graph
    let rtn = document.getElementById('return_graph').getContext('2d');
    let rtnChart = new Chart(rtn, buildGraphData(dates, returnDatasets, graphOptions));


    // Build Returns Percentage Graph
    let rtnPct = document.getElementById('return_percentage_graph').getContext('2d');
    let rtnPctChart = new Chart(rtnPct, buildGraphData(dates, returnPercentageDatasets, graphOptions));


    // Build Volume Graph
    let vol = document.getElementById('volume_graph').getContext('2d');
    let volChart = new Chart(vol, buildGraphData(dates, volumeDatasets, graphOptions));


    // Build Volume Percentage Graph
    let volPct = document.getElementById('volume_percentage_graph').getContext('2d');
    let volPctChart = new Chart(volPct, buildGraphData(dates, volumePercentageDatasets, graphOptions));


    // Build Daily Spread Graph
    let spread = document.getElementById('daily_spread_graph').getContext('2d');
    let spreadChart = new Chart(spread, buildGraphData(dates, dailySpreadDatasets, graphOptions));

    document.getElementById('graphSeparator').hidden = false;
    document.getElementById('graphs').hidden = false;
}

function buildGraphData(dates, datasets, graphOptions) {
    var formatOutput = {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: graphOptions
    }
    return formatOutput;
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
