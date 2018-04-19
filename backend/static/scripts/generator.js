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
    // Clear previous graphs
    document.getElementById('graphs').innerHTML = ``;

    // Convert API Data to Array
    let returnData = new Array();
    let returnPctData = new Array();
    let cmReturnData = new Array();
    let cmReturnPctData = new Array();
    let avReturnData = new Array();
    let avReturnPctData = new Array();
    let dailySpreadData = new Array();
    let volumeData = new Array();
    let volumePctData = new Array();

    let dates = new Array();

    returnDatasets = new Array();
    returnPercentageDatasets = new Array();
    volumeDatasets = new Array();
    volumePercentageDatasets = new Array();
    dailySpreadDatasets = new Array();

    var shouldDrawReturns = false;
    var shouldDrawReturnsPct = false;
    var shouldDrawVolume = false;
    var shouldDrawVolumePct = false;
    var shouldDrawSpread = false;

    // Populate data arrays
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
                borderColor: 'rgb(57, 106, 177)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturns = true;
    }
    if (cmReturnData.length > 0) {
        returnDatasets.push(
            {
                label: 'Cumulative Return',
                data: cmReturnData,
                fill: false,
                borderColor: 'rgb(218, 124, 48)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturns = true;
    }
    if (avReturnData.length > 0) {
        returnDatasets.push(
            {
                label: 'Average Return',
                data: avReturnData,
                fill: false,
                borderColor: 'rgb(62, 150, 81)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturns = true;
    }

    // Add datasets for percentage returns graph
    if (returnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Return Percentage',
                data: returnPctData,
                fill: false,
                borderColor: 'rgb(57, 106, 177)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturnsPct = true;
    }
    if (cmReturnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Cumulative Return Percentage',
                data: cmReturnPctData,
                fill: false,
                borderColor: 'rgb(218, 124, 48)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturnsPct = true;
    }
    if (avReturnPctData.length > 0) {
        returnPercentageDatasets.push(
            {
                label: 'Average Return Percentage',
                data: avReturnPctData,
                fill: false,
                borderColor: 'rgb(62, 150, 81)',
                lineTension: 0.1,
            }
        );
        shouldDrawReturnsPct = true;
    }

    // Add datasets for volume graph
    if (volumeData.length > 0) {
        volumeDatasets.push(
            {
                label: 'Volume Traded',
                data: volumeData,
                fill: false,
                borderColor: 'rgb(107, 76, 154)',
                lineTension: 0.1,
            }
        );
        shouldDrawVolume = true;
    }

    // Add datasets for volume percentage graph
    if (volumePctData.length > 0) {
        volumePercentageDatasets.push(
            {
                label: 'Volume Traded Percentage',
                data: volumePctData,
                fill: false,
                borderColor: 'rgb(107, 76, 154)',
                lineTension: 0.1,
            }
        );
        shouldDrawVolumePct = true;
    }

    // Add datasets for daily spread graph
    if (dailySpreadData.length > 0) {
        dailySpreadDatasets.push(
            {
                label: 'Daily Spread',
                data: dailySpreadData,
                fill: false,
                borderColor: 'rgb(148, 139, 61)',
                lineTension: 0.1,
            }
        );
        shouldDrawSpread = true;
    }


    // Build returns graph
    if (shouldDrawReturns) {
        document.getElementById('graphs').insertAdjacentHTML('beforeend', '<div class="mdl-cell mdl-cell--6-col"><canvas id="return_graph"></canvas></div>');
        let rtn = document.getElementById('return_graph').getContext('2d');
        let rtnChart = new Chart(rtn, buildGraphData(dates, returnDatasets, buildGraphOptions('Returns', 'Returns ($)')));
    }


    // Build returns percentage graph
    if (shouldDrawReturnsPct) {
        document.getElementById('graphs').insertAdjacentHTML('beforeend', '<div class="mdl-cell mdl-cell--6-col"><canvas id="return_percentage_graph"></canvas></div>');
        let rtnPct = document.getElementById('return_percentage_graph').getContext('2d');
        let rtnPctChart = new Chart(rtnPct, buildGraphData(dates, returnPercentageDatasets, buildGraphOptions('Returns Percentage', 'Returns (%)')));
    }


    // Build volume graph
    if (shouldDrawVolume) {
        document.getElementById('graphs').insertAdjacentHTML('beforeend', '<div class="mdl-cell mdl-cell--6-col"><canvas id="volume_graph"></canvas></div>');
        let vol = document.getElementById('volume_graph').getContext('2d');
        let volChart = new Chart(vol, buildGraphData(dates, volumeDatasets, buildGraphOptions('Volume Traded', 'Volume ($)')));
    }


    // Build volume percentage graph
    if (shouldDrawVolumePct) {
        document.getElementById('graphs').insertAdjacentHTML('beforeend', '<div class="mdl-cell mdl-cell--6-col"><canvas id="volume_percentage_graph"></canvas></div>');
        let volPct = document.getElementById('volume_percentage_graph').getContext('2d');
        let volPctChart = new Chart(volPct, buildGraphData(dates, volumePercentageDatasets, buildGraphOptions('Volume Traded Percentage', 'Volume (%)')));
    }


    // Build daily spread graph
    if (shouldDrawSpread) {
        document.getElementById('graphs').insertAdjacentHTML('beforeend', '<div class="mdl-cell mdl-cell--6-col"><canvas id="daily_spread_graph"></canvas></div>');
        let spread = document.getElementById('daily_spread_graph').getContext('2d');
        let spreadChart = new Chart(spread, buildGraphData(dates, dailySpreadDatasets, buildGraphOptions('Daily Spread', 'Spread ($)')));
    }

    document.getElementById('graphSeparator').hidden = false;
    document.getElementById('graphs').hidden = false;
}

function buildGraphData(dates, datasets, graphOptions) {
    return {
        type: 'line',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: graphOptions
    };
}

function buildGraphOptions(name, yLabel){
    return ({
        responsive: true,
        title:{
            display: true,
            text: name
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Days'
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: yLabel
                }
            }]
        },
        pan: {
            enabled: true,
            mode: 'x'
        },
        zoom: {
            enabled: true,
            mode: 'x',
            sensitivity: 3,
        }
    });
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
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

function updateAPIQuery() {
    let instrumentID = document.getElementById('instrument_id').value;
    let dateOfInterest = document.getElementById('date_of_interest').value;
    let lowerWindow = document.getElementById('lower_window').value;
    let upperWindow = document.getElementById('upper_window').value;

    let listOfVar = getListOfVars();

    let apiQuery;
    if (listOfVar != '') {
        apiQuery = window.location.protocol + '//' + window.location.host + `/api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    } else {
        apiQuery = window.location.protocol + '//' + window.location.host + `/api/v1.0?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    }
    document.getElementById('apiQuery').innerText = apiQuery;
}

function copyToClipboard() {
    let copyText = document.getElementById('apiQuery');
    copyText.select();
    document.execCommand('Copy');

    let tooltip = document.getElementById('copyBtnTooltip');
    tooltip.innerHTML = 'Copied!';
}

function copied() {
    let tooltip = document.getElementById('copyBtnTooltip');
    tooltip.innerHTML = 'Copy to Clipboard';
}
