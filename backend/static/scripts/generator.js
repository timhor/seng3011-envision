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
            console.log(apiData);
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
            console.log(apiData);
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

    let dates = new Array();

    returnDatasets = {};
    cmReturnDatasets = {};
    avReturnDatasets = {};
    returnPercentageDatasets = {};
    cmReturnPercentageDatasets = {};
    avReturnPercentageDatasets = {};
    volumeDatasets = {};
    volumePercentageDatasets = {};
    dailySpreadDatasets = {};

    var shouldDrawReturns = false;
    var shouldDrawCMReturns = false;
    var shouldDrawAVReturns = false;
    var shouldDrawReturnsPct = false;
    var shouldDrawCMReturnsPct = false;
    var shouldDrawAVReturnsPct = false;
    var shouldDrawVolume = false;
    var shouldDrawVolumePct = false;
    var shouldDrawSpread = false;

    // Populate data arrays
    apiData.Company_Returns.forEach(instrument => {
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

        instrument.Data.forEach(rec => {
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
            if ($.inArray(formattedDate, dates) === -1){
                dates.push(formattedDate);
            }
        });

        // Add datasets for just returns graph
        if (returnData.length > 0) {
            // console.log("Return data for "+instrument.InstrumentID+" is:" + returnData);
            returnDatasets[instrument.InstrumentID] = new Array();
            returnDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: returnData,
                    fill: false,
                    borderColor: 'rgb(57, 106, 177)',
                    lineTension: 0.1,
                }
            );
            shouldDrawReturns = true;
        }
        if (cmReturnData.length > 0) {
            cmReturnDatasets[instrument.InstrumentID] = new Array();
            cmReturnDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: cmReturnData,
                    fill: false,
                    borderColor: 'rgb(218, 124, 48)',
                    lineTension: 0.1,
                }
            );
            shouldDrawCMReturns = true;
        }
        if (avReturnData.length > 0) {
            avReturnDatasets[instrument.InstrumentID] = new Array();
            avReturnDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: avReturnData,
                    fill: false,
                    borderColor: 'rgb(62, 150, 81)',
                    lineTension: 0.1,
                }
            );
            shouldDrawAVReturns = true;
        }

        // Add datasets for percentage returns graph
        if (returnPctData.length > 0) {
            returnPercentageDatasets[instrument.InstrumentID] = new Array();
            returnPercentageDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: returnPctData,
                    fill: false,
                    borderColor: 'rgb(57, 106, 177)',
                    lineTension: 0.1,
                }
            );
            shouldDrawReturnsPct = true;
        }
        if (cmReturnPctData.length > 0) {
            cmReturnPercentageDatasets[instrument.InstrumentID] = new Array();
            cmReturnPercentageDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: cmReturnPctData,
                    fill: false,
                    borderColor: 'rgb(218, 124, 48)',
                    lineTension: 0.1,
                }
            );
            shouldDrawCMReturnsPct = true;
        }
        if (avReturnPctData.length > 0) {
            avReturnPercentageDatasets[instrument.InstrumentID] = new Array();
            avReturnPercentageDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: avReturnPctData,
                    fill: false,
                    borderColor: 'rgb(62, 150, 81)',
                    lineTension: 0.1,
                }
            );
            shouldDrawAVReturnsPct = true;
        }

        // Add datasets for volume graph
        if (volumeData.length > 0) {
            volumeDatasets[instrument.InstrumentID] = new Array();
            volumeDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
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
            volumePercentageDatasets[instrument.InstrumentID] = new Array();
            volumePercentageDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
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
            dailySpreadDatasets[instrument.InstrumentID] = new Array();
            dailySpreadDatasets[instrument.InstrumentID].push(
                {
                    label: instrument.InstrumentID,
                    data: dailySpreadData,
                    fill: false,
                    borderColor: 'rgb(148, 139, 61)',
                    lineTension: 0.1,
                }
            );
            shouldDrawSpread = true;
        }
    })

    // Build returns graph
    if (shouldDrawReturns) {
        let rtnChart = new Chart(
            getCanvas('return_graph'),
            buildGraphData(dates, returnDatasets, buildGraphOptions('Returns', 'Returns ($)'))
        );
    }

    // Build returns percentage graph
    if (shouldDrawReturnsPct) {
        let rtnPctChart = new Chart(
            getCanvas('return_percentage_graph'),
            buildGraphData(dates, returnPercentageDatasets, buildGraphOptions('Returns Percentage', 'Returns (%)'))
        );
    }

    // Build CM returns graph
    if (shouldDrawCMReturns) {
        let cmRtnChart = new Chart(
            getCanvas('cm_return_graph'),
            buildGraphData(dates, cmReturnDatasets, buildGraphOptions('Cumulative Returns', 'Returns ($)'))
        );
    }

    // Build CM returns percentage graph
    if (shouldDrawCMReturnsPct) {
        let cmRtnPctChart = new Chart(
            getCanvas('cm_return_percentage_graph'),
            buildGraphData(dates, cmReturnPercentageDatasets, buildGraphOptions('Cumulative Returns Percentage', 'Returns (%)'))
        );
    }

    // Build AV returns graph
    if (shouldDrawAVReturns) {
        let avRtnChart = new Chart(
            getCanvas('av_return_graph'),
            buildGraphData(dates, avReturnDatasets, buildGraphOptions('Average Returns', 'Returns ($)'))
        );
    }

    // Build AV returns percentage graph
    if (shouldDrawAVReturnsPct) {
        let avRtnPctChart = new Chart(
            getCanvas('av_return_percentage_graph'),
            buildGraphData(dates, avReturnPercentageDatasets, buildGraphOptions('Average Returns Percentage', 'Returns (%)'))
        );
    }

    // Build volume graph
    if (shouldDrawVolume) {
        let volChart = new Chart(
            getCanvas('volume_graph'),
            buildGraphData(dates, volumeDatasets, buildGraphOptions('Volume Traded', 'Volume ($)'))
        );
    }

    // Build volume percentage graph
    if (shouldDrawVolumePct) {
        let volPctChart = new Chart(
            getCanvas('volume_percentage_graph'),
            buildGraphData(dates, volumePercentageDatasets, buildGraphOptions('Volume Traded Percentage', 'Volume (%)'))
        );
    }

    // Build daily spread graph
    if (shouldDrawSpread) {
        let spreadChart = new Chart(
            getCanvas('daily_spread_graph'),
            buildGraphData(dates, dailySpreadDatasets, buildGraphOptions('Daily Spread', 'Spread ($)'))
        );
    }

    document.getElementById('graphSeparator').hidden = false;
    document.getElementById('graphs').hidden = false;
}

function getCanvas(name) {
    const graphHtml = '<div class="mdl-cell mdl-cell--6-col"><canvas id="' + name + '"></canvas></div>';
    document.getElementById('graphs').insertAdjacentHTML('beforeend', graphHtml);
    return document.getElementById(name).getContext('2d');
}

function buildGraphData(dates, datasets, graphOptions) {
    let dataArray = new Array();
    jQuery.each(datasets, (i,val) => {
        dataArray.push(val[0]);
    });
    return {
        type: 'line',
        data: {
            labels: dates,
            datasets: dataArray
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
