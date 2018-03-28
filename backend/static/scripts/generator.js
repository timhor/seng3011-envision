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
        $.getJSON(`api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, (data) => {
            let dataString = JSON.stringify(data, null, 3);
            document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
            document.getElementById('loadingSpinner').hidden = true;
            document.getElementById('queryResults').hidden = false;
        })
    } else {
        $.getJSON(`api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, (data) => {
            let dataString = JSON.stringify(data, null, 3);
            document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
            document.getElementById('loadingSpinner').hidden = true;
            document.getElementById('queryResults').hidden = false;
        })
    }
};

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
        var apiQuery = window.location.protocol + '//' + window.location.host + `/api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    } else {
        var apiQuery = window.location.protocol + '//' + window.location.host + `/api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
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
