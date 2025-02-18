import mermaid from 'mermaid';
import 'highlight.js/styles/nnfx-light.css';
import hljs from 'highlight.js';
import java from 'highlight.js/lib/languages/java';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('java', java);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

// TODO: Add built-in types to EOL
var eol = function(hljs) {
    return {
      case_insensitive: false,
      contains: [
        {
          className: 'comment',
          begin: '/\\*', end: '\\*/',
          contains: [
            {
              className: 'doctag',
              begin: '@', end: '$'
            }
          ]
        },
        {
          className: 'comment',
          begin: '//', end: '$'
        },
        {
          className: 'doctag',
          begin: '@', end: '$'
        },
        {
          className: 'variable',
          begin: '\\b(true|false|self|loopCount|hasMore)\\b'
        },
        {
          className: 'number',
          begin: '\\b\\d+(\\.\\d+)?\\b'
        },
        {
          className: 'keyword',
          begin: '\\b(import|driver|alias|if|switch|case|default|operation|function|new|else|for|var|return|async|break|breakAll|and|or|not|xor|implies|ext|in|continue|while|throw|delete|transaction|abort|model|group|as)\\b'
        },
        {
          className: 'operator',
          begin: '[!<>:]?=|<>|<|>|\\+|(?<!\\.)\\*|-|(?<!^)/|@@|\\|\\|'
        },
        {
          className: 'string',
          begin: '"', end: '"'
        },
        {
          className: 'identifier',
          begin: '`', end: '`'
        }
      ]
    };
};

//TODO: Add EWL (not currently supported on the website)
hljs.registerLanguage('eol', eol);
hljs.registerLanguage('eunit', eol);

hljs.registerLanguage('egl', function(hljs) {
    return {
      case_insensitive: false,
      contains: [
        {
          className: 'comment',
          begin: '\\[\\*', end: '\\*\\]',
          relevance: 10
        },
        {
          className: 'identifier',
          begin: '\\[%', end: '%\\]',
          relevance: 10,
          subLanguage: 'eol'
        }
      ]
    };
});

hljs.registerLanguage('egx', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'transform rule guard pre post target extends parameters template overwrite protectRegions merge append patch'
      }
    });
});

hljs.registerLanguage('etl', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'transform auto guard pre post to extends rule abstract'
      }
    });
});

hljs.registerLanguage('evl', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'context constraint guard pre post assumes critique message title do check fix typeOf kindOf high medium low'
      }
    });
});

hljs.registerLanguage('mig', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'delete retype to migrate when ignoring package pre post',
        variable: 'original migrated'
      }
    });
});

hljs.registerLanguage('ecl', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'match auto do compare guard pre post with extends rule abstract',
        variable: 'matchTrace autoCompare matchInfo'
      }
    });
});

hljs.registerLanguage('eml', function(hljs) {
    var etl = hljs.getLanguage('etl');
  
    return hljs.inherit(etl, {
      keywords: {
        keyword: 'merge mid with into',
        variable: 'matchTrace mergeTrace'
      }
    });
});

var epl = function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'pre post pattern match guard do onmatch nomatch from no optional active',
      }
    });
}

hljs.registerLanguage('epl', epl);
hljs.registerLanguage('emg', epl);

hljs.registerLanguage('eml', function(hljs) {
    var etl = hljs.getLanguage('etl');
  
    return hljs.inherit(etl, {
      keywords: {
        keyword: 'merge mid with into',
        variable: 'matchTrace mergeTrace'
      }
    });
});

hljs.registerLanguage('pinset', function(hljs) {
    var eol = hljs.getLanguage('eol');
  
    return hljs.inherit(eol, {
      keywords: {
        keyword: 'pre post dataset over from guard properties reference column grid keys header body as'
      }
    });
});

hljs.registerLanguage('emf', function(hljs) {
    return {
      case_insensitive: false,
      contains: [
        {
          className: 'comment',
          begin: '/\\*', end: '\\*/'
        },
        {
          className: 'comment',
          begin: '//', end: '$'
        },
        {
            className: 'comment',
            begin: '@\\w+', end: '(?=\\()|$'
          },
        {
          className: 'number',
          begin: '\\b\\d+(\\.\\d+)?\\b'
        },
        {
          className: 'keyword',
          begin: '\\b(abstract|attr|class|enum|extends|import|package|ref|val|op|readonly|volatile|transient|unsettable|derived|unique|ordered|resolve|id)\\b'
        },
        {
          className: 'string',
          begin: '\'', end: '\''
        },
        {
          className: 'string',
          begin: '"', end: '"'
        },
        {
          className: 'type',
          begin: '\\b(boolean|Boolean|byte|Byte|char|Character|double|Double|float|Float|int|Integer|long|Long|short|Short|Date|String|Object|Class|EObject|EClass)\\b'
        }
      ]
    };
});

document$.subscribe(() => {
    console.log("Highlighting!");
    hljs.highlightAll();
    mermaid.initialize();
})