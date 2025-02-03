import * as monaco from 'monaco-editor'

class SyntaxHighlighter {

    setup() {
        this.registerEolBasedLanguage("eol", []);
        this.registerEolBasedLanguage("evl", 
            [
                'context', 'constraint', 'guard', 'pre', 'post', 'assumes', 'critique', 'message', 
                'title', 'do', 'check', 'fix', 'typeOf', 'kindOf', 'high', 'medium', 'low'
            ]);
        
    }

    registerEolBasedLanguage(language, extraKeywords) {
        monaco.languages.register({ id: language });
        monaco.languages.setMonarchTokensProvider(language, {
            defaultToken: '',
            tokenPostfix: '.' + language,
            
            keywords: [
                'import', 'driver', 'alias', 'if', 'switch', 'case', 'default', 'operation', 'function', 'new', 
                'else', 'for', 'var', 'return', 'async', 'break', 'breakAll', 'and', 'or', 'not', 'xor', 'implies', 
                'ext', 'in', 'continue', 'while', 'throw', 'delete', 'transaction', 'abort', 'model', 'group', 'as'
            ].concat(extraKeywords),
            
            operators: [
                '=', '>', '<', '!', '~', '?', ':',
                '==', '<=', '>=', '!=', '&&', '||', '++', '--',
                '+', '-', '*', '/', '&', '|', '^', '%', '<<',
                '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
                '^=', '%=', '<<=', '>>=', '>>>='
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
                    [/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],
        
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
                    [/\/\*\*(?!\/)/, 'comment.doc', '@javadoc'],
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
                //Identical copy of comment above, except for the addition of .doc
                javadoc: [
                    [/[^\/*]+/, 'comment.doc'],
                    // [/\/\*/, 'comment.doc', '@push' ],    // nested comment not allowed :-(
                    [/\/\*/, 'comment.doc.invalid'],
                    [/\*\//, 'comment.doc', '@pop'],
                    [/[\/*]/, 'comment.doc']
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