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

    returnDatasets = new Array();
    returnPercentageDatasets = new Array();

    // Fill up data arrays
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

    // Build Returns Graph
    let rtn = document.getElementById('return_graph').getContext('2d');
    let rtnChart = new Chart(rtn, {
        type: 'line',
        data: {
            labels: dates,
            datasets: returnDatasets
        },
        options: graphOptions
    });


    // Build Returns Percentage Graph
    let rtnPct = document.getElementById('return_percentage_graph').getContext('2d');
    let rtnPctChart = new Chart(rtnPct, {
        type: 'line',
        data: {
            labels: dates,
            datasets: returnPercentageDatasets
        },
        options: graphOptions
    });


    if (volumeData.length > 0) {
        let vol = document.getElementById('volume_graph').getContext('2d');
        let volChart = new Chart(vol, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Volume Traded',
                        data: volumeData,
                        fill: false,
                        borderColor : "rgb(107, 76, 154)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    }

    if (volumePctData.length > 0) {
        document.getElementById('volume_pct_graph').hidden = false;
        let volPct = document.getElementById('volume_pct_graph').getContext('2d');
        let volPctChart = new Chart(volPct, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Volume Traded Percentage',
                        data: volumePctData,
                        fill: false,
                        borderColor : "rgb(107, 76, 154)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
    }

    if (dailySpreadData.length > 0) {
        document.getElementById('daily_spread_graph').hidden = false;
        let spread = document.getElementById('daily_spread_graph').getContext('2d');
        let spreadChart = new Chart(spread, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Daily Spread',
                        data: dailySpreadData,
                        fill: false,
                        borderColor : "rgb(148, 139, 61)",
                        lineTension :0.1,
                    }
                ]
            },
            options: graphOptions
        });
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
