window.onload = function() {
    updateAPIQuery();
    document.getElementById('loadingSpinner').hidden = true;
};

function getData(){
    var instrumentID = document.getElementById('instrument_id').value;
    var dateOfInterest = document.getElementById('date_of_interest').value;
    var listOfVar = document.getElementById('list_of_var').value;
    var lowerWindow = document.getElementById('lower_window').value;
    var upperWindow = document.getElementById('upper_window').value;

    document.getElementById('queryResults').hidden = true;
    document.getElementById('loadingSpinner').hidden = false;

    $.getJSON(`api?instrument_id=${instrumentID}&date_of_interest=${dateOfInterest}&list_of_var=${listOfVar}&lower_window=${lowerWindow}&upper_window=${upperWindow}`, function(data){
        var dataString = JSON.stringify(data, null, 3);
        document.getElementById('queryResults').innerHTML = `<pre><code>` + syntaxHighlight(dataString) + `</code></pre>`;
        document.getElementById('loadingSpinner').hidden = true;
        document.getElementById('queryResults').hidden = false;
    })
};
 
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var colourClass = 'number';
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
