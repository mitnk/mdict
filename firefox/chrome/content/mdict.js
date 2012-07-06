var mitnk_mdict = {
    create_main_div: function(doc, div_id) {
        var main_div = doc.getElementById(div_id);
        if (main_div == null) {
            main_div = doc.body.appendChild(doc.createElement("div"));
            main_div.setAttribute("id", div_id);
            main_div.setAttribute("style",
                "position: fixed; z-index:9999; top: 100px; left: 100px; width: 20em;"
                + "border: 2px outset orange; background-color: cornsilk;");
            main_div.setAttribute("onclick", "document.body.removeChild(this)");
        }
        return main_div;
    },

    create_word_div: function(doc, div_id) {
        var word_div = doc.getElementById(div_id);
        if (word_div == null) {
            word_div = doc.body.appendChild(doc.createElement("div"));
            word_div.setAttribute("id", div_id);
            word_div.style.color = "black";
            word_div.style.fontSize = "16px";
            word_div.style.padding = "8px";
            word_div.style.zIndex = "9999";
            word_div.style.textAlign = "left";
        }
        return word_div;
    },

    get_selected_word: function(wind) {
        var word = wind.getSelection().toString();
        word = word.replace(/^\s+|\s+$/g, '');
        word = word.split(/\W+/)[0].toLowerCase();
        return word;
    },

    request_define: function(url, target_div) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.status != 200) {
                target_div.innerHTML = 'Lookup Error.';
            }
            else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var result = eval('(' + xmlhttp.responseText + ')');
                if (result.status == "ok") {
                    var define = result.result;
                    target_div.innerHTML = '<span style="color:red">' + define.word
                        + '</span> [<span style="color:green">' + define.pron
                        + '</span>] ' + define.pos + ' <span style="color:blue">'
                        + define.acceptation + "</span><br><br>" + define.gloss;
                }
                else {
                    target_div.innerHTML = result.key + ' Not Found.';
                }
            }
        }
        xmlhttp.open("GET", url, true);
        xmlhttp.send(null);
    },

    lookup_word: function(doc, wind) {
        var word = this.get_selected_word(wind);
        if (word != "") {
            var MAIN_DIV = "main-div-mdict-mitnk";
            var WORD_DIV = 'word-div-mdict-mitnk';
            var main_div = this.create_main_div(doc, MAIN_DIV);
            var word_div = this.create_word_div(doc, WORD_DIV);
            word_div.innerHTML = 'Loading';
            main_div.appendChild(word_div);

            var url = 'http://mitnk.com/dict/' + word + '/?api=1';
            this.request_define(url, word_div);

            var code = "if (document.getElementById('" + MAIN_DIV + "') != null){" + "document.body.removeChild(document.getElementById('" + MAIN_DIV + "'))}"
            if (doc.body.getAttribute("onclick") == undefined) {
                doc.body.setAttribute(
                    "onclick",
                    code
                );
            }
        }
    },

    main: function() {
        this.lookup_word(content.document, content.window);
    }
};
