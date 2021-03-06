window.onload = function() {
    styleReadme();
}

function styleReadme() {
    let readme = document.getElementById('readmeMarkdown').innerHTML;
    readme = readme.replace(/\<h2\>(.*?)\<\/h2\>/g, function(a, b) {
        return cardTitle(b);
    });
    readme = readme.replace(/\<h3\>(.*?)\<\/h3\>/g, function(a, b) {
        return cardSubtitle(b);
    });
    readme = readme.replace(/\<p\>(.*?)\<\/p\>/g, function(a, b) {
        return supportTextInstruction(b);
    });
    readme = readme.replace(/\<p\>(.*?)\<\/p\>/sg, function(a, b) {
        return supportText(b);
    });
    readme = readme.replace(/\<ul\>(.*?)\<\/ul\>/sg, function(a, b) {
        return supportText(b);
    });
    readme = readme.replace(/<code>(\r\n|\n|\r)/g, "<code>");
    document.getElementById('readmeMarkdown').innerHTML = readme;
}

function cardTitle(title) {
    let html =
    `<div class="mdl-card__title" id="cardTitle">
        <h2 class="mdl-card__title-text mdl-typography--font-bold">`+ title + `</h2>
    </div>`;
    return html;
}

function cardSubtitle(title) {
    let html =
    `<div class="card-subtitle mdl-card__title">
        <h2 class="mdl-card__subtitle-text mdl-typography--font-bold">`+ title + `</h2>
    </div>`;
    return html;
}

function supportText(text) {
    let html =
    `<hr><div class="mdl-card__supporting-text" align="left">` + text + `</div><hr>`
    return html;
}

function supportTextInstruction(text) {
    let html =
    `<div class="support-text-instruction mdl-card__supporting-text" align="left">` + text + `</div>`
    return html;
}
