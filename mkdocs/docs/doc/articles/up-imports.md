# Up Imports in EOL

!!! tip "Available from Epsilon 2.9 onwards"

In larger Epsilon codebases, we may manage trees of Epsilon scripts which import each other.
Using relative paths can be error-prone and fragile when reorganising the codebase: Epsilon 2.9 adds `up://` import URI to help with this.

## Running example

For example, imagine that our program has an `epsilon` directory with the following structure inside it:

- epsilon
    - framework
        - formatting.eol
        - model.eol
        - utils.eol
    - generators
        - epub
            - epub-helpers.eol
            - generate.eol
        - print
            - pdf
                - generate.eol
                - pdf-helpers.eol

If `epsilon/generators/print/pdf/generate.eol` wished to import the `epsilon/framework/utils.eol` script, it would normally need to use the appropriate relative path:

```eol
import "../../../framework/utils.eol";
```

Conversely, `epsilon/generators/epub/generate.eol` would instead need to import `epsilon/framework/utils.eol` script like this:

```eol
import "../../framework/utils.eol";
```

This use of relative paths is error-prone, and will immediately break if we try to reorganise the files in the `generators` directory.

## Basic usage

The basic syntax of an `up://` import is:

```eol
import "up://BASE_DIR/PATH";
```

It is resolved by navigating parent directories of the file containing the import until reaching a directory named `BASE_DIR`, and then finding a file accessible via `PATH` from that base directory.

Using `up://` imports, both of the above examples can be simplified into:

```eol
import "up://epsilon/framework/utils.eol";
```

## Subpath matching

`up://` imports can also match a trailing subpath instead of a full path, but only from certain module URIs:

- `file://`
- `jar:`
- `platform:/resource/`

When available, this feature would allow further simplifying the above import into:

```eol
import "up://epsilon/utils.eol";
```

Note that if there were multiple `utils.eol` files within the `epsilon` directory, the import would fail due to ambiguity, and list the various candidates.
In this case, you would need to enter a longer trailing subpath to break the ambiguity.