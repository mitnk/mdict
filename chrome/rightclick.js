chrome.contextMenus.create({
    title: "Lookup '%s' in MDict",
    contexts:["selection"],
    onclick: function(info, tab) {
        chrome.tabs.executeScript(null, {file: "mdict.js"});
    }
});
