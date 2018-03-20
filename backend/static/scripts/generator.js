function getData(){
    var instrumentID = document.getElementById('instrument_id').value;
    var dateOfInterest = document.getElementById('date_of_interest').value;
    var listOfVar = document.getElementById('list_of_var').value;
    var lowerWindow = document.getElementById('lower_window').value;
    var upperWindow = document.getElementById('upper_window').value;

    document.getElementById('queryResults').innerText = "Fetching Data...";

    $.getJSON(`api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, function(data){
        var dataString = JSON.stringify(data, null, 3);
        document.getElementById('queryResults').innerHTML = syntaxHighlight(dataString);
    })
};
 
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

window.onload = function() {
    updateAPIQuery();
};

function updateAPIQuery(){
    var instrumentID = document.getElementById('instrument_id').value;
    var dateOfInterest = document.getElementById('date_of_interest').value;
    var listOfVar = document.getElementById('list_of_var').value;
    var lowerWindow = document.getElementById('lower_window').value;
    var upperWindow = document.getElementById('upper_window').value;

    var apiQuery = window.location.protocol + '//' + window.location.host + `/api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`;
    document.getElementById('apiQuery').innerText = apiQuery;
}

function copyToClipboard() {
    var copyText = document.getElementById("apiQuery");
    copyText.select();
    document.execCommand("Copy");
    
    var tooltip = document.getElementById("copyBtnTooltip");
    tooltip.innerHTML = "Copied!";
  }
  
  function copied() {
    var tooltip = document.getElementById("copyBtnTooltip");
    tooltip.innerHTML = "Copy to Clipboard";
  }