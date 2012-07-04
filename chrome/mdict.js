var div = document.body.appendChild(document.createElement("div"));
div.setAttribute("style",
    "position: fixed; z-index:9999; top: 100px; left: 100px; width: 20em;"
    + "border: 2px outset orange; background-color: cornsilk;");

var word_div = document.body.appendChild(document.createElement("div"));
word_div.style.color = "black";
word_div.style.fontSize = "16px";
word_div.style.padding = "8px";
word_div.style.zIndex = "9999";
word_div.style.textAlign = "left";
word_div.innerHTML = 'Loading';
word_div.setAttribute("onclick", "document.body.removeChild(this.parentNode)");
div.appendChild(word_div);


var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.status != 200) {
        word_div.innerHTML = 'Lookup Error.';
    }
    else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var result = eval('(' + xmlhttp.responseText + ')');
        if (result.status == "ok") {
            var define = result.result;
            word_div.innerHTML = '<span style="color:red">' + define.word
                + '</span> [<span style="color:green">' + define.pron
                + '</span>] ' + define.pos + ' <span style="color:blue">'
                + define.acceptation + "</span><br><br>" + define.gloss;
        }
        else {
            word_div.innerHTML = result.key + ' Not Found.';
        }
    }
}

var word = window.getSelection().toString();
word = word.split(/\W+/)[0];
word = word.replace(/^\s+|\s+$/g, '').toLowerCase();

var url = 'http://mitnk.com/dict/' + word + '/?api=1';
xmlhttp.open("GET", url, true);
xmlhttp.send(null);
