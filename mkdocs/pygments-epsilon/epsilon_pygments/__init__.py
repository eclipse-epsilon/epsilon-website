"""Pygments lexers for the Epsilon languages and Emfatic.

These are registered through the ``pygments.lexers`` entry point (see
pyproject.toml), so once this package is installed, fenced code blocks such as
```eol or ```egl are highlighted by mkdocs-material / pymdownx.highlight.
"""

from pygments.lexer import RegexLexer, bygroups, using, words
from pygments.token import (Comment, Keyword, Name, Number, Operator,
                            Punctuation, String, Text, Whitespace)

__all__ = [
    'EolLexer', 'EtlLexer', 'EvlLexer', 'EclLexer', 'EmlLexer', 'EplLexer',
    'EgxLexer', 'EwlLexer', 'FlockLexer', 'PinsetLexer', 'EglLexer',
    'EmfaticLexer',
]

EOL_KEYWORDS = (
    'import', 'driver', 'alias', 'if', 'switch', 'case', 'default', 'operation',
    'function', 'new', 'else', 'for', 'var', 'return', 'async', 'break',
    'breakAll', 'ext', 'in', 'continue', 'while', 'throw', 'delete',
    'transaction', 'abort', 'model', 'group', 'as',
)

EOL_OPERATOR_WORDS = ('and', 'or', 'not', 'xor', 'implies')

EOL_CONSTANTS = ('true', 'false', 'null')

EOL_VARIABLES = ('self', 'loopCount', 'hasMore')

EOL_TYPES = (
    'String', 'Boolean', 'Integer', 'Real', 'Any', 'Map', 'Collection', 'Bag',
    'Sequence', 'Set', 'OrderedSet', 'Native', 'List', 'Tuple', 'ConcurrentSet',
    'ConcurrentBag', 'ConcurrentMap', 'EolSelf', 'EolSelfContentType',
    'EolSelfExpressionType', 'EolSelfCollectionType',
)


def _words(items):
    # Sort longest first so that e.g. 'breakAll' wins over 'break'
    return words(sorted(set(items), key=len, reverse=True), prefix=r'\b', suffix=r'\b')


def eol_tokens(keywords=(), variables=()):
    """Token definitions for EOL, extended with language-specific keywords/variables."""
    return {
        'root': [
            (r'\s+', Whitespace),
            (r'/\*', Comment.Multiline, 'comment'),
            (r'//.*?$', Comment.Single),
            (r'[@$]\w+.*?$', Comment.Preproc),
            (r'"(\\\\|\\[^\\]|[^"\\])*"', String.Double),
            (r"'(\\\\|\\[^\\]|[^'\\])*'", String.Single),
            (r'`[^`]*`', Name),
            (r'\d+\.\d+([eE][+-]?\d+)?[dDfF]?', Number.Float),
            (r'\d+[lL]?', Number.Integer),
            (_words(EOL_CONSTANTS), Keyword.Constant),
            (_words(EOL_VARIABLES + tuple(variables)), Name.Builtin.Pseudo),
            (_words(EOL_TYPES), Keyword.Type),
            (_words(EOL_OPERATOR_WORDS), Operator.Word),
            (_words(EOL_KEYWORDS + tuple(keywords)), Keyword),
            (r'[A-Za-z_]\w*', Name),
            (r'::=|:=|==|<>|>=|<=|\+=|-=|\*=|/=|\+\+|--|->|=>|\?\.|\?:|\|\|'
             r'|[-+*/=<>!?:|#.%&^~]', Operator),
            (r'[,;()\[\]{}]', Punctuation),
            (r'.', Text),
        ],
        'comment': [
            (r'[^*/]+', Comment.Multiline),
            (r'/\*', Comment.Multiline, '#push'),
            (r'\*/', Comment.Multiline, '#pop'),
            (r'[*/]', Comment.Multiline),
        ],
    }


class EolLexer(RegexLexer):
    name = 'Epsilon Object Language'
    aliases = ['eol', 'eunit']
    filenames = ['*.eol']
    tokens = eol_tokens()


class EtlLexer(RegexLexer):
    name = 'Epsilon Transformation Language'
    aliases = ['etl']
    filenames = ['*.etl']
    tokens = eol_tokens(
        keywords=('transform', 'auto', 'guard', 'pre', 'post', 'to', 'extends',
                  'rule', 'abstract', 'lazy', 'primary', 'greedy'))


class EvlLexer(RegexLexer):
    name = 'Epsilon Validation Language'
    aliases = ['evl']
    filenames = ['*.evl']
    tokens = eol_tokens(
        keywords=('context', 'constraint', 'critique', 'guard', 'pre', 'post',
                  'assumes', 'message', 'title', 'do', 'check', 'fix'),
        variables=('extras',))


class EclLexer(RegexLexer):
    name = 'Epsilon Comparison Language'
    aliases = ['epsilon-ecl']
    filenames = ['*.ecl']
    tokens = eol_tokens(
        keywords=('match', 'auto', 'do', 'compare', 'guard', 'pre', 'post',
                  'with', 'extends', 'rule', 'abstract', 'from', 'lazy',
                  'primary', 'greedy'),
        variables=('matchTrace', 'autoCompare', 'matchInfo'))


class EmlLexer(RegexLexer):
    name = 'Epsilon Merging Language'
    aliases = ['epsilon-eml']
    filenames = ['*.eml']
    tokens = eol_tokens(
        keywords=('transform', 'auto', 'guard', 'pre', 'post', 'to', 'extends',
                  'rule', 'abstract', 'lazy', 'primary', 'greedy',
                  'merge', 'mid', 'with', 'into'),
        variables=('matchTrace', 'mergeTrace'))


class EplLexer(RegexLexer):
    name = 'Epsilon Pattern Language'
    aliases = ['epl', 'emg']
    filenames = ['*.epl', '*.emg']
    tokens = eol_tokens(
        keywords=('pre', 'post', 'pattern', 'match', 'guard', 'do', 'onmatch',
                  'nomatch', 'from', 'no', 'optional', 'active'))


class EgxLexer(RegexLexer):
    name = 'EGL Co-ordination Language'
    aliases = ['egx']
    filenames = ['*.egx']
    tokens = eol_tokens(
        keywords=('transform', 'rule', 'guard', 'pre', 'post', 'target',
                  'extends', 'parameters', 'template', 'overwrite',
                  'protectRegions', 'merge', 'append', 'patch'))


class EwlLexer(RegexLexer):
    name = 'Epsilon Wizard Language'
    aliases = ['ewl']
    filenames = ['*.ewl']
    tokens = eol_tokens(keywords=('wizard', 'guard', 'do', 'title'))


class FlockLexer(RegexLexer):
    name = 'Epsilon Flock'
    aliases = ['mig', 'flock']
    filenames = ['*.mig']
    tokens = eol_tokens(
        keywords=('delete', 'retype', 'to', 'migrate', 'when', 'ignoring',
                  'package', 'pre', 'post'),
        variables=('original', 'migrated'))


class PinsetLexer(RegexLexer):
    name = 'Pinset'
    aliases = ['pinset']
    filenames = ['*.pinset']
    tokens = eol_tokens(
        keywords=('pre', 'post', 'dataset', 'over', 'from', 'guard',
                  'properties', 'reference', 'column', 'grid', 'keys', 'header',
                  'body', 'as'))


class EglLexer(RegexLexer):
    """EGL templates: static text with [% EOL %] sections and [* comments *]."""
    name = 'Epsilon Generation Language'
    aliases = ['egl']
    filenames = ['*.egl']

    tokens = {
        'root': [
            (r'\[\*[\s\S]*?\*\]', Comment.Multiline),
            (r'(\[%=?)([\s\S]*?)(%\])',
             bygroups(Comment.Preproc, using(EolLexer), Comment.Preproc)),
            (r'[^\[]+', Text),
            (r'\[', Text),
        ],
    }


class EmfaticLexer(RegexLexer):
    name = 'Emfatic'
    aliases = ['emf', 'emfatic']
    filenames = ['*.emf']

    tokens = {
        'root': [
            (r'\s+', Whitespace),
            (r'/\*[\s\S]*?\*/', Comment.Multiline),
            (r'//.*?$', Comment.Single),
            (r'@[\w.]+', Name.Decorator),
            (r'"(\\\\|\\[^\\]|[^"\\])*"', String.Double),
            (r"'(\\\\|\\[^\\]|[^'\\])*'", String.Single),
            (r'\d+(\.\d+)?', Number),
            (_words(('abstract', 'attr', 'class', 'interface', 'enum',
                     'extends', 'import', 'package', 'ref', 'val', 'op',
                     'readonly', 'volatile', 'transient', 'unsettable',
                     'derived', 'unique', 'ordered', 'resolve', 'id',
                     'datatype', 'mapentry', 'super', 'throws', 'void',
                     'true', 'false', 'null')), Keyword),
            (_words(('boolean', 'Boolean', 'byte', 'Byte', 'char', 'Character',
                     'double', 'Double', 'float', 'Float', 'int', 'Integer',
                     'long', 'Long', 'short', 'Short', 'Date', 'String',
                     'Object', 'Class', 'EObject', 'EClass')), Keyword.Type),
            (r'[A-Za-z_]\w*', Name),
            (r'[-+*?#=:.<>!~&]', Operator),
            (r'[,;()\[\]{}]', Punctuation),
            (r'.', Text),
        ],
    }
