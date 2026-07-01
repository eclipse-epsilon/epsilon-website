from pygments.lexer import RegexLexer
from pygments.token import *

class EolLexer(RegexLexer):
    name = 'Epsilon Object Language'
    aliases = ['eol', 'EOL']
    filenames = ['*.eol']

    eol_root_tokens = [
        (r'[^/]+', Text),
        (r'/\*', Comment.Multiline, 'comment'),
        (r'//.*?$', Comment.Singleline),
        (r'/', Text),
        (r'@|\$', Comment.Preproc),
        (r'(if|else|for|while|in|case|default|switch|break|continue|operation|function|import|transaction|driver|alias|new|var|return|async|breakAll|ext|throw|delete|transaction|abort|model|group|as|from)', Keyword),
        (r'not|xor|implies|or|and', Operator.Word),
        (r'new|var', Keyword.Declaration),
        (r'import', Keyword.Namespace),
        (r'true|false', Keyword.Constant),
        (r'\'.*\'', Literal.String.Single),
        (r'".*"', Literal.String.Double),
        (r'`\w+`', Literal.String.Backtick),
        (r'[0-9]+', Literal.Number.Integer),
        (r'[0-9]+\.[0-9]+', Literal.Number.Float),
        (r'[0-9]+(l|L)', Literal.Number.Integer.Long),
        (r'null', Name.Builtin),
        (r'self|hasMore|loopCount', Name.Builtin.Pseudo),
        (r'Any|String|Integer|Real|Boolean|Native|Bag|Set|List|Sequence|Map|Tuple|OrderedSet|Collection|ConcurrentBag|ConcurrentMap|ConcurrentSet', Name.Class),
        (r'select|collect|exists|selectOne|one|forAll|reject|mapBy|aggregate|closure|sortBy|selectFirst|rejectOne|count|nMatch|atLeastNMatch|atMostNMatch|func|runnable|supplier|consumer', Name.Function),
        (r'func|runnable|supplier|consumer', Name.Function.Magic),
        (r'\.|\+|-|/|\*|=|==|<>|>=|<=|>|<|/\*|\+=|\*=|-=|/=|--|\+\+|=>|\||\?|->|#', Operator),
        (r',|;|:|(|)|\.\.|{|}|\[|\]|!', Punctuation)
    ]

    eol_comment_tokens = [
        (r'[^*/]', Comment.Multiline),
        (r'/\*', Comment.Multiline, '#push'),
        (r'\*/', Comment.Multiline, '#pop'),
        (r'[*/]', Comment.Multiline)
    ]

    tokens = {
        'root': eol_root_tokens,
        'comment': eol_comment_tokens
    }

class ErlLexer(EolLexer):
    name = 'Epsilon Rule Language'
    aliases = ['erl', 'ERL']
    filenames = ['*.erl']

    erl_root_tokens = EolLexer.eol_root_tokens + [
        (r'pre|post|guard|extends', Keyword)
    ]

    tokens = {
        'root': erl_root_tokens,
        'comment': EolLexer.eol_comment_tokens
    }
