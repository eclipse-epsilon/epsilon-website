import * as monaco from 'monaco-editor'

class MonacoSetup {

    do() {
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
        this.registerConsoleOutputLanguage();
        this.registerConsoleErrorLanguage();
        this.registerPlaygroundTheme();
    }

    registerPlaygroundTheme() {
        monaco.editor.defineTheme('playground', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: { "editor.background": "#ffffff" }
            });
    }

    registerConsoleOutputLanguage() {
        monaco.languages.register({ id: 'out' });
        monaco.languages.setMonarchTokensProvider('out', {
            defaultToken: '',
            tokenizer: {
                root: []
            }
        });
    }

    registerConsoleErrorLanguage() {
        monaco.languages.register({ id: 'err' });
        monaco.languages.setMonarchTokensProvider('err', {
            defaultToken: 'constant',
            tokenizer: {
                root: []
            }
        });
        monaco.languages.registerLinkProvider({ language: 'err', exclusive: true }, {
            provideLinks: function(model, token) {
                const regex = /\b([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)@(\d+):(\d+)-(\d+):(\d+)\b/g;
                const text = model.getValue();
                let match;
                let links = [];
        
                while ((match = regex.exec(text)) !== null) {
                    const range = new monaco.Range(
                        model.getPositionAt(match.index).lineNumber,
                        model.getPositionAt(match.index).column,
                        model.getPositionAt(match.index + match[0].length).lineNumber,
                        model.getPositionAt(match.index + match[0].length).column
                    );
                    
                    links.push({
                        range: range,
                        file: match[1],
                        extension: match[2],
                        startLine: parseInt(match[3], 10),
                        startColumn: parseInt(match[4], 10) + 1,
                        endLine: parseInt(match[5], 10),
                        endColumn: parseInt(match[6], 10) + 1,
                        tooltip: `Navigate to ${match[1]}.${match[2]} from ${match[3]}:${match[4]} to ${match[5]}:${match[6]}`
                    });
                }
        
                return { links: links };
            },
            resolveLink: function(link) {

                var panel = language === "egx" && link.extension === "egl"
                || language === "eml" && link.extension === "ecl"
                ? secondProgramPanel
                : programPanel;

                const editor = panel.getEditor();

                if (editor) {
                    const selectionRange = new monaco.Range(
                        link.startLine, link.startColumn,
                        link.endLine, link.endColumn
                    );

                    editor.setSelection(selectionRange);
                    editor.revealRange(selectionRange, monaco.editor.ScrollType.Smooth);
                }
            }
        });
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
                    defaultToken: 'string',
                    tokenPostfix: '',

                    tokenizer: {
                        root: [
                            [/\[%(=)?/, { token: '@rematch', switchTo: '@egl.root' }],
                            [/\[\*/, 'comment', '@comment'],
                        ],
                        
                        comment: [
                            [/\*\]/, 'comment', '@pop'],
                            [/./, 'comment']
                        ],

                        egl: [
                            [/%\]/, { token: 'delimiter', switchTo: '@$S2.$S3' }],
                            { include: 'eglRoot' }
                        ],
                
                        eglRoot: [
                            [
                                /[a-zA-Z_]\w*/,
                                {
                                    cases: {
                                        '@keywords': { token: 'keyword' },
                                        '@constants': { token: 'constant' },
                                        '@types': { token: 'type' },
                                        '@default': 'identifier'
                                    }
                                }
                            ],
                            
                            // brackets
                            [/[{}]/, 'delimiter.bracket'],
                            [/[\[\]]/, 'delimiter.array'],
                            [/[()]/, 'delimiter.parenthesis'],
                
                            // whitespace
                            [/[ \t\r\n]+/],
                
                            // comments
                            [/(#|\/\/)$/, 'comment'],
                            [/(#|\/\/)/, 'comment', '@eolLineComment'],
                
                            // block comments
                            [/\/\*/, 'comment', '@eolComment'],
                
                            // strings
                            [/"/, 'string', '@doubleQuoteString'],
                            [/'/, 'string', '@singleQuoteString'],
                
                            // delimiters
                            [/[\+\-\*\%\&\|\^\~\!\=\<\>\/\?\;\:\.\,\@]/, 'delimiter'],
                
                            // numbers
                            [/\d*\d+[eE]([\-+]?\d+)?/, 'number.float'],
                            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                            [/0[xX][0-9a-fA-F']*[0-9a-fA-F]/, 'number.hex'],
                            [/0[0-7']*[0-7]/, 'number.octal'],
                            [/0[bB][0-1']*[0-1]/, 'number.binary'],
                            [/\d[\d']*/, 'number'],
                            [/\d/, 'number']
                        ],
                
                        eolComment: [
                            [/\*\//, 'comment', '@pop'],
                            [/[^*]+/, 'comment'],
                            [/./, 'comment']
                        ],
                
                        eolLineComment: [
                            [/\?>/, { token: '@rematch', next: '@pop' }],
                            [/.$/, 'comment', '@pop'],
                            [/[^?]+$/, 'comment', '@pop'],
                            [/[^?]+/, 'comment'],
                            [/./, 'comment']
                        ],
                
                        doubleQuoteString: [
                            [/[^\\"]+/, 'string'],
                            [/@escapes/, 'string.escape'],
                            [/\\./, 'string.escape.invalid'],
                            [/"/, 'string', '@pop']
                        ],
                
                        singleQuoteString: [
                            [/[^\\']+/, 'string'],
                            [/@escapes/, 'string.escape'],
                            [/\\./, 'string.escape.invalid'],
                            [/'/, 'string', '@pop']
                        ]
                    },
                    
                    keywords: [
                        'import', 'driver', 'alias', 'if', 'switch', 'case', 'default', 'operation', 'function', 'new', 
                        'else', 'for', 'var', 'return', 'async', 'break', 'breakAll', 'and', 'or', 'not', 'xor', 'implies', 
                        'ext', 'in', 'continue', 'while', 'throw', 'delete', 'transaction', 'abort', 'model', 'group', 'as'
                    ],
                    
                    constants: [
                        'true', 'false', 'self', 'loopCount', 'hasMore'
                    ],
        
                    types: [
                        'String', 'Boolean', 'Integer', 'Real', 'Any', 'Map', 'Collection', 'Bag', 'Sequence', 'Set', 'OrderedSet', 'Native', 'List', 'Tuple', 'ConcurrentSet', 'ConcurrentBag', 'ConcurrentMap'
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

export {MonacoSetup};