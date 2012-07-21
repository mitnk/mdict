window.addEventListener("load", mitnk_mdict_init_layout, false);

function mitnk_mdict_json_to_dom(xml, doc, nodes) {
    function is_array(obj) {
        return obj instanceof Array;
    }

    function namespace(name) {
        var m = /^(?:(.*):)?(.*)$/.exec(name);
        return [mitnk_mdict_json_to_dom.namespaces[m[1]], m[2]];
    }

    function tag(name, attr) {
        if (is_array(name)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function (arg) {
                if (!is_array(arg[0]))
                    frag.appendChild(tag.apply(null, arg));
                else
                    arg.forEach(function (arg) {
                        frag.appendChild(tag.apply(null, arg));
                    });
            });
            return frag;
        }

        var args = Array.slice(arguments, 2);
        var vals = namespace(name);
        var elem = doc.createElementNS(vals[0] || mitnk_mdict_json_to_dom.defaultNamespace,
                                       vals[1]);

        for (var key in attr) {
            var val = attr[key];
            if (nodes && key == "key")
                nodes[val] = elem;

            vals = namespace(key);
            if (typeof val == "function")
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            else
                elem.setAttributeNS(vals[0] || "", vals[1], val);
        }
        args.forEach(function(e) {
            elem.appendChild(typeof e == "object" ? tag.apply(null, e) :
                             e instanceof Node    ? e : doc.createTextNode(e));
        });
        return elem;
    }
    return tag.apply(null, xml);
}
mitnk_mdict_json_to_dom.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
};
mitnk_mdict_json_to_dom.defaultNamespace = mitnk_mdict_json_to_dom.namespaces.html;

var mitnk_mdict = {
    create_main_div: function(doc, div_id) {
        var main_div = doc.getElementById(div_id);
        if (main_div == null) {
            main_div = doc.body.appendChild(doc.createElement("div"));
            this.clickify(main_div, div_id);
        }
        return main_div;
    },

    clickify: function(elem, div_id) {
        elem.setAttribute("id", div_id);
        elem.addEventListener("click", function(event){
                content.document.body.removeChild(this);
            }, false);
        elem.style.color = "black";
        elem.style.backgroundColor = "cornsilk";
        elem.style.position = "fixed";
        elem.style.border = "2px outset orange";
        elem.style.top = "100px";
        elem.style.left = "100px";
        elem.style.padding = "10px";
        elem.style.width = "20em";
        elem.style.zIndex = "9999";
        elem.style.fontSize = "16px";
    },

    clickify_body: function(elem, div_id) {
        if (elem.getAttribute("onclick") == undefined) {
            elem.addEventListener("click", function() {
                    var target = content.document.getElementById("mitnk-mdict-main-div");
                    if (target != null) {
                        content.document.body.removeChild(target);
                    }
                }, false);
        }
    },

    get_selected_word: function(wind) {
        var word = wind.getSelection().toString();
        word = word.replace(/^\s+|\s+$/g, '');
        word = word.split(/\W+/)[0].toLowerCase();
        return word;
    },

    set_div_text: function(target_div, text, doc) {
        while (target_div.hasChildNodes()) {
            target_div.removeChild(target_div.lastChild);
        }
        var elem = mitnk_mdict_json_to_dom(["span", {}, text], doc, {});
        target_div.appendChild(elem);
    },

    set_word_define: function(target_div, define, doc) {
        while (target_div.hasChildNodes()) {
            target_div.removeChild(target_div.lastChild);
        }
        var elem = mitnk_mdict_json_to_dom(["div", {},
                ["span", {style: "color:red"}, define.word],
                ["span", {}, " ["],
                ["span", {style: "color:green"}, define.pron],
                ["span", {}, "] "],
                ["span", {}, define.pos + " "],
                ["span", {style: "color:blue"}, define.acceptation],
                ["br"],
                ["br"],
                ["span", {}, define.gloss],
            ], doc, {});
        target_div.appendChild(elem);
    },

    request_define: function(url, target_div, doc) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.status == 200) {
                if (xmlhttp.readyState == 4) {
                    var result = JSON.parse(xmlhttp.responseText);
                    if (result.status == "ok") {
                        var define = result.result;
                        mitnk_mdict.set_word_define(target_div, define, doc);
                    }
                    else {
                        mitnk_mdict.set_div_text(target_div, "Not Found " + result.key, doc);
                    }
                }
            }
            else {
                mitnk_mdict.set_div_text(target_div, "Lookup Error.", doc);
            }
        }
        xmlhttp.open("GET", url, true);
        this.set_div_text(target_div, "Looking Up ...", doc);
        xmlhttp.send(null);
    },

    lookup_word: function(doc, wind) {
        var word = this.get_selected_word(wind);
        if (word != "") {
            var MAIN_DIV = "mitnk-mdict-main-div";
            var main_div = this.create_main_div(doc, MAIN_DIV);
            var url = 'http://mitnk.com/dict/' + encodeURIComponent(word) + '/?api=1';
            this.request_define(url, main_div, doc);
            this.clickify_body(doc.body, MAIN_DIV);
        }
    },

    main: function() {
        this.lookup_word(content.document, content.window);
    }
};

function mitnk_mdict_context_popup_showing() {
    gContextMenu.showItem("mitnk-mdict", gContextMenu.isTextSelected);
}

function mitnk_mdict_init_layout() {
  var menu = document.getElementById("contentAreaContextMenu");
  menu.addEventListener("popupshowing", mitnk_mdict_context_popup_showing, false);
}
