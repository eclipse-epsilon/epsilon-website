import {define} from "ace-builds";

define("ace/mode/pinset_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var pinsetHighlightRules = function() {

        var keywords = (
            "|dataset|over|from|column|properties|reference|grid|keys|header|body|guard|pre|post|not|delete|import|for|while|in|and|or|operation|return|var|throw|if|new|else|transaction|abort|break|continue|assert|assertError|not|function|default|switch|case|as|ext|driver|alias|model|breakAll|async|group|nor|xor|implies|extends"
        );

        var builtinConstants = (
            "true|false|self"
        );

        var builtinFunctions = (
            ""
        );

        var dataTypes = (
            "Any|String|Integer|Real|Boolean|Native|Bag|Set|List|Sequence|Map|OrderedSet|Collection|Tuple|ConcurrentBag|ConcurrentMap|ConcurrentSet"
        );

        var keywordMapper = this.createKeywordMapper({
            "support.function": builtinFunctions,
            "keyword": keywords,
            "constant.language": builtinConstants,
            "storage.type": dataTypes
        }, "identifier", false);

        this.$rules = {
            "start" : [ {
                token : "comment",
                regex : "//.*$"
            },  {
                token : "comment",
                start : "/\\*",
                end : "\\*/"
            }, {
                token : "string",           // " string
                regex : '".*?"'
            }, {
                token : "string",           // ' string
                regex : "'.*?'"
            }, {
                token : "string",           // ` string (apache drill)
                regex : "`.*?`"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token : keywordMapper,
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "text",
                regex : "\\s+"
            } ]
        };
        this.normalizeRules();
    };

    oop.inherits(pinsetHighlightRules, TextHighlightRules);

    exports.pinsetHighlightRules = pinsetHighlightRules;
    });

    define("ace/mode/pinset",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/pinset_highlight_rules"], function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var pinsetHighlightRules = require("./pinset_highlight_rules").pinsetHighlightRules;

    var Mode = function() {
        this.HighlightRules = pinsetHighlightRules;
        this.$behaviour = this.$defaultBehaviour;
    };
    oop.inherits(Mode, TextMode);

    (function() {
        this.$id = "ace/mode/pinset";
        this.snippetFileId = "ace/snippets/pinset";
    }).call(Mode.prototype);

    exports.Mode = Mode;

    });
