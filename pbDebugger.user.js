// ==UserScript==
// @name       PB Debugger
// @namespace  http://forum.sz-ex.com
// @version    0.0.1a
// @description  Used to help debug ProBoards v5 modules on any forum.
// @match      http://*.proboards.com/*
// @match      http://*.freemessageboards.com/*
// @match      http://*.boards.net/*
// @match      http://*.freeforums.net/*
// @match      http://forum.sz-ex.com/*
// @copyright  2012+, Chris Dessonville
// ==/UserScript==


/*
PLANNED FEATURE LIST
1) Ability to inline edit plugin key values that we're rendering (if perms allow)
2) Hide/show the box in the upper right
3) "id" list for all HTML items with IDs.... show them in color (with an overlay div) when 
hovering over item in list
4) Show list of plugins (by ID) that are installed
5) Maybe show those plugins' settings (or a way to display this info in a popup)
*/

var objectDeepList = function(obj, filterFunc, renderFunc, prefix){
    // Returns a flattened list of all obj properties

    prefix = prefix || "";
    filterFunc = filterFunc || function(obj, i){ return true; };
    renderFunc = renderFunc || function(prefix, obj, i, childData){
        // childData is only set when working on an object
        // returns a list of things to merge
        if(childData){
            return [
                prefix + i + ": " + (childData.length == 0?"[empty]":"")
            ].concat(childData);
        } else {
            return [ prefix + i + ": " + obj[i] ];
        }
    };

    var res = [];

    for(var i in obj){
        if(filterFunc(obj, i) == false){
            continue;
        }

        var childData = false;

        if(typeof(obj[i]) == "object"){
            childData = objectDeepList(obj[i], filterFunc, renderFunc, "&nbsp;&nbsp;&nbsp;&nbsp;" + prefix + i + ".");
        }

        res = res.concat(renderFunc(prefix, obj, i, childData));
    }

    return res;
};

var pbDebugger = (function(){
    return {
        box_style: "background-color: #FFFFFF; color: #000000; border: 1px #000000 solid; padding: 4px;",

        init: function(){
            if(!location.href.match(/admin/) && unsafeWindow.proboards){
                // Don't show on ACP and also make sure we won't crash stupidly
                this.dataSidebar();
            }
        },

        dataSidebar: function(){
            // Start by adding the proboards.data() info
            var res = ["<b>ProBoards Data</b>"].concat(this.getData());

            // Ok, now show all the plugin keys!
            res = res.concat(["", "<b>Plugin Keys</b>"], this.getPluginKeys());

            // Compact
            res = res.join("<br />");

            // Render it
            unsafeWindow.
            $("<div style='"+this.box_style+" position: absolute; top: 0; right: 0; z-index: 9999' />").
            html(res).
            prependTo(document.body);

        },

        getData: function(){
            // There is concern that dataHash may not be public down the road
            return objectDeepList(unsafeWindow.proboards.dataHash);
        },

        getPluginKeys: function(){
            var renderFunc = function(prefix, obj, i, childData){
                return prefix + i + ": " + unsafeWindow.proboards.plugin.key(i).get();
            };
            var filterFunc = function(obj, i){
                return typeof(obj[i]) != "function" && i != "";
            };
            return objectDeepList(unsafeWindow.proboards.plugin._keys, filterFunc, renderFunc);
        }
    };
})();

pbDebugger.init();