import * as monaco from 'monaco-editor'

class SyntaxHighlighter {

    setup() {
        this.registerEmfatic();
        this.registerEolBasedLanguage("eol");
        this.registerEolBasedLanguage("evl", ['context', 'constraint', 'guard', 'pre', 'post', 'assumes', 'critique', 'message', 'title', 'do', 'check', 'fix', 'typeOf', 'kindOf', 'high', 'medium', 'low'], ['constraintTrace', 'extras']);
        
        var etlKeywords = ['transform', 'auto', 'guard', 'pre', 'post', 'to', 'extends', 'rule', 'abstract'];
        var etlConstants = ['transTrace'];
        this.registerEolBasedLanguage("etl", etlKeywords, etlConstants);
        
        this.registerEolBasedLanguage("egx", ['transform', 'rule', 'guard', 'pre', 'post', 'target', 'extends', 'parameters', 'template', 'overwrite', 'protectRegions', 'merge', 'append', 'patch'], ['generated']);
        this.registerEolBasedLanguage("flock", ['delete', 'retype', 'to', 'migrate', 'when', 'ignoring', 'package', 'pre', 'post'], ['original', 'migrated']);
        this.registerEolBasedLanguage("ecl", ['match', 'auto', 'do', 'compare', 'guard', 'pre', 'post', 'with', 'extends', 'rule', 'abstract'], ['matchTrace', 'autoCompare', 'matchInfo']);
        this.registerEolBasedLanguage("eml", etlKeywords.concat(['merge', 'mid', 'with', 'into']), etlConstants.concat(['matchTrace', 'mergeTrace']));
        
        ["epl", "emg"].forEach(l => { this.registerEolBasedLanguage(l, ['pre', 'post', 'pattern', 'match', 'guard', 'do', 'onmatch', 'nomatch', 'from', 'no', 'optional', 'active']); });

        this.registerEolBasedLanguage("pinset", etlKeywords.concat(['pre', 'post', 'dataset', 'over', 'from', 'guard', 'properties', 'reference', 'column', 'grid', 'keys', 'header', 'body', 'as']));
        this.registerEgl();
    }

    registerEolBasedLanguage(language, extraKeywords = [], extraConstants = []) {
        monaco.languages.register({ id: language });
        monaco.languages.setMonarchTokensProvider(language, {
            defaultToken: '',
            tokenPostfix: '.' + language,
            
            keywords: [
                'import', 'driver', 'alias', 'if', 'switch', 'case', 'default', 'operation', 'function', 'new', 
                'else', 'for', 'var', 'return', 'async', 'break', 'breakAll', 'and', 'or', 'not', 'xor', 'implies', 
                'ext', 'in', 'continue', 'while', 'throw', 'delete', 'transaction', 'abort', 'model', 'group', 'as'
            ].concat(extraKeywords),

            constants: [
                'true', 'false', 'self', 'loopCount', 'hasMore'
            ].concat(extraConstants),

            types: [
                'String', 'Boolean', 'Integer', 'Real', 'Any', 'Map', 'Collection', 'Bag', 'Sequence', 'Set', 'OrderedSet', 'Native', 'List', 'Tuple', 'ConcurrentSet', 'ConcurrentBag', 'ConcurrentMap'
            ],

            operators: [
                '=', '>', '<', '!', '~', '?', ':',
                '==', '<=', '>=', '!=', '&&', '||', '++', '--',
                '+', '-', '*', '/', '&', '|', '^', '%', '<<',
                '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
                '^=', '%='
            ],
        
            // we include these common regular expressions
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            digits: /\d+(_+\d+)*/,
            octaldigits: /[0-7]+(_+[0-7]+)*/,
            binarydigits: /[0-1]+(_+[0-1]+)*/,
            hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
        
            // The main tokenizer for our languages
            tokenizer: {
                root: [
                    // identifiers and keywords
                    [/[a-zA-Z_$][\w$]*/, {
                        cases: {
                            '@keywords': { token: 'keyword.$0' },
                            '@types': { token: 'type' },
                            '@constants': { token: 'constant' },
                            '@default': 'identifier'
                        }
                    }],
        
                    // whitespace
                    { include: '@whitespace' },
        
                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'delimiter',
                            '@default': ''
                        }
                    }],
                    
                    // TODO: Annotations need fixing
                    // @ annotations.
                    [/^@.*$/, 'annotation'],

                    //TODO: Not sure why $ annotations don't work

                    // numbers
                    [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
                    [/0(@octaldigits)[Ll]?/, 'number.octal'],
                    [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
                    [/(@digits)[fFdD]/, 'number.float'],
                    [/(@digits)[lL]?/, 'number'],
        
                    // delimiter: after number because of .\d floats
                    [/[;,.]/, 'delimiter'],
        
                    // strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                    [/"/, 'string', '@string'],
        
                    // characters
                    [/'[^\\']'/, 'string'],
                    [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                    [/'/, 'string.invalid']
                ],
        
                whitespace: [
                    [/[ \t\r\n]+/, ''],
                    [/\/\*\*(?!\/)/, 'comment.doc'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
        
                comment: [
                    [/[^\/*]+/, 'comment'],
                    // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
                    // [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],
        
                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, 'string', '@pop']
                ],
            },
        });
    }

    registerEgl() {
            monaco.languages.register({ id: 'egl' });
            monaco.languages.setMonarchTokensProvider('egl', {
                    defaultToken: 'type',
                    tokenPostfix: '',
                    // ignoreCase: true,
                
                    // The main tokenizer for our languages
                    tokenizer: {
                        root: [
                            [/\[%(=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.root' }],
                            [/\[\*/, 'comment.html', '@comment'],
                            /*
                            [/<!DOCTYPE/, 'metatag.html', '@doctype'],
                            [/(<)(\w+)(\/>)/, ['delimiter.html', 'tag.html', 'delimiter.html']],
                            [/(<)(script)/, ['delimiter.html', { token: 'tag.html', next: '@script' }]],
                            [/(<)(style)/, ['delimiter.html', { token: 'tag.html', next: '@style' }]],
                            [/(<)([:\w]+)/, ['delimiter.html', { token: 'tag.html', next: '@otherTag' }]],
                            [/(<\/)(\w+)/, ['delimiter.html', { token: 'tag.html', next: '@otherTag' }]],
                            [/</, 'delimiter.html'],
                            [/[^<]+/] // text*/
                        ],
                        
                        /*
                        doctype: [
                            [/<\[%(=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.comment' }],
                            [/[^>]+/, 'metatag.content.html'],
                            [/>/, 'metatag.html', '@pop']
                        ],*/
                        
                        
                        comment: [
                            //[/\[%(=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.comment' }],
                            [/\*\]/, 'comment.html', '@pop'],
                            //[/[^-]+/, 'comment.content.html'],
                            [/./, 'comment.html']
                        ],
                        
                        /*
                        otherTag: [
                            [/\[%(=)?/, { token: '@rematch', switchTo: '@phpInSimpleState.otherTag' }],
                            [/\%\]/, 'delimiter.html', '@pop'],
                            [/"([^"]*)"/, 'attribute.value'],
                            [/'([^']*)'/, 'attribute.value'],
                            [/[\w\-]+/, 'attribute.name'],
                            [/=/, 'delimiter'],
                            [/[ \t\r\n]+/] // whitespace
                        ],*/

                        phpInSimpleState: [
                            //[/<\[%(=)?/, 'metatag.php'],
                            [/%\]/, { token: 'delimiter', switchTo: '@$S2.$S3' }],
                            { include: 'phpRoot' }
                        ],
                        
                        /*
                        phpInEmbeddedState: [
                            [/<\[%(=)?/, 'metatag.php'],
                            [
                                /%\]/,
                                {
                                    token: 'metatag.php',
                                    switchTo: '@$S2.$S3',
                                    nextEmbedded: '$S3'
                                }
                            ],
                            { include: 'phpRoot' }
                        ],*/
                
                        phpRoot: [
                            [
                                /[a-zA-Z_]\w*/,
                                {
                                    cases: {
                                        '@phpKeywords': { token: 'keyword.php' },
                                        '@phpCompileTimeConstants': { token: 'constant.php' },
                                        '@default': 'identifier.php'
                                    }
                                }
                            ],
                            [
                                /[$a-zA-Z_]\w*/,
                                {
                                    cases: {
                                        '@phpPreDefinedVariables': {
                                            token: 'variable.predefined.php'
                                        },
                                        '@default': 'variable.php'
                                    }
                                }
                            ],
                
                            // brackets
                            [/[{}]/, 'delimiter.bracket.php'],
                            [/[\[\]]/, 'delimiter.array.php'],
                            [/[()]/, 'delimiter.parenthesis.php'],
                
                            // whitespace
                            [/[ \t\r\n]+/],
                
                            // comments
                            [/(#|\/\/)$/, 'comment.php'],
                            [/(#|\/\/)/, 'comment.php', '@phpLineComment'],
                
                            // block comments
                            [/\/\*/, 'comment.php', '@phpComment'],
                
                            // strings
                            [/"/, 'string.php', '@phpDoubleQuoteString'],
                            [/'/, 'string.php', '@phpSingleQuoteString'],
                
                            // delimiters
                            [/[\+\-\*\%\&\|\^\~\!\=\<\>\/\?\;\:\.\,\@]/, 'delimiter.php'],
                
                            // numbers
                            [/\d*\d+[eE]([\-+]?\d+)?/, 'number.float.php'],
                            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float.php'],
                            [/0[xX][0-9a-fA-F']*[0-9a-fA-F]/, 'number.hex.php'],
                            [/0[0-7']*[0-7]/, 'number.octal.php'],
                            [/0[bB][0-1']*[0-1]/, 'number.binary.php'],
                            [/\d[\d']*/, 'number.php'],
                            [/\d/, 'number.php']
                        ],
                
                        phpComment: [
                            [/\*\//, 'comment.php', '@pop'],
                            [/[^*]+/, 'comment.php'],
                            [/./, 'comment.php']
                        ],
                
                        phpLineComment: [
                            [/\?>/, { token: '@rematch', next: '@pop' }],
                            [/.$/, 'comment.php', '@pop'],
                            [/[^?]+$/, 'comment.php', '@pop'],
                            [/[^?]+/, 'comment.php'],
                            [/./, 'comment.php']
                        ],
                
                        phpDoubleQuoteString: [
                            [/[^\\"]+/, 'string.php'],
                            [/@escapes/, 'string.escape.php'],
                            [/\\./, 'string.escape.invalid.php'],
                            [/"/, 'string.php', '@pop']
                        ],
                
                        phpSingleQuoteString: [
                            [/[^\\']+/, 'string.php'],
                            [/@escapes/, 'string.escape.php'],
                            [/\\./, 'string.escape.invalid.php'],
                            [/'/, 'string.php', '@pop']
                        ]
                    },
                
                    phpKeywords: [
                        'import', 'driver', 'alias', 'if', 'switch', 'case', 'default', 'operation', 'function', 'new', 
                        'else', 'for', 'var', 'return', 'async', 'break', 'breakAll', 'and', 'or', 'not', 'xor', 'implies', 
                        'ext', 'in', 'continue', 'while', 'throw', 'delete', 'transaction', 'abort', 'model', 'group', 'as'
                    ],
                
                    phpCompileTimeConstants: [
                        '__CLASS__',
                        '__DIR__',
                        '__FILE__',
                        '__LINE__',
                        '__NAMESPACE__',
                        '__METHOD__',
                        '__FUNCTION__',
                        '__TRAIT__'
                    ],
                
                    phpPreDefinedVariables: [
                        '$GLOBALS',
                        '$_SERVER',
                        '$_GET',
                        '$_POST',
                        '$_FILES',
                        '$_REQUEST',
                        '$_SESSION',
                        '$_ENV',
                        '$_COOKIE',
                        '$php_errormsg',
                        '$HTTP_RAW_POST_DATA',
                        '$http_response_header',
                        '$argc',
                        '$argv'
                    ],
                
                    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/
                });
    }

    registerEmfatic() {
        monaco.languages.register({ id: "emf" });
        monaco.languages.setMonarchTokensProvider("emf", {
            defaultToken: '',
            tokenPostfix: '.emf',
            
            keywords: [
                'abstract', 'attr', 'class', 'enum', 'mapentry', 'extends', 'import', 'package', 'ref', 'val', 'op', 'readonly', 'volatile', 'transient', 'unsettable', 'derived', 'unique', 'ordered', 'resolve', 'id'
            ],

            constants: [
                'true', 'false', 'self', 'loopCount', 'hasMore'
            ],

            types: [
                'boolean', 'Boolean', 'byte', 'Byte', 'char', 'Character', 'double', 'Double', 'float', 'Float', 'int', 'Integer', 'long', 'Long', 'short', 'Short', 'Date', 'String', 'Object', 'Class', 'EObject', 'EClass'
            ],

            operators: [
                '=', '~'
            ],
        
            // we include these common regular expressions
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
            digits: /\d+(_+\d+)*/,
            octaldigits: /[0-7]+(_+[0-7]+)*/,
            binarydigits: /[0-1]+(_+[0-1]+)*/,
            hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
        
            // The main tokenizer for our languages
            tokenizer: {
                root: [
                    // identifiers and keywords
                    [/[a-zA-Z_$][\w$]*/, {
                        cases: {
                            '@keywords': { token: 'keyword.$0' },
                            '@types': { token: 'type' },
                            '@constants': { token: 'constant' },
                            '@default': 'identifier'
                        }
                    }],
        
                    // whitespace
                    { include: '@whitespace' },
        
                    // delimiters and operators
                    [/[{}()\[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'delimiter',
                            '@default': ''
                        }
                    }],
        
                    // @ annotations.
                    [/@[^(]*/, 'annotation'],

                    //TODO: Not sure why $ annotations don't work

                    // numbers
                    [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
                    [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
                    [/0(@octaldigits)[Ll]?/, 'number.octal'],
                    [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
                    [/(@digits)[fFdD]/, 'number.float'],
                    [/(@digits)[lL]?/, 'number'],
        
                    // delimiter: after number because of .\d floats
                    [/[;,.]/, 'delimiter'],
        
                    // strings
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                    [/"/, 'string', '@string'],
        
                    // characters
                    [/'[^\\']'/, 'string'],
                    [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                    [/'/, 'string.invalid']
                ],
        
                whitespace: [
                    [/[ \t\r\n]+/, ''],
                    [/\/\*\*(?!\/)/, 'comment.doc'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
        
                comment: [
                    [/[^\/*]+/, 'comment'],
                    // [/\/\*/, 'comment', '@push' ],    // nested comment not allowed :-(
                    // [/\/\*/,    'comment.invalid' ],    // this breaks block comments in the shape of /* //*/
                    [/\*\//, 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],
        
                string: [
                    [/[^\\"]+/, 'string'],
                    [/@escapes/, 'string.escape'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, 'string', '@pop']
                ],
            },
        });
    }

}

export {SyntaxHighlighter};