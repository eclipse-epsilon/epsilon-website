# The Epsilon Transformation Language (ETL)

The aim of ETL is to contribute model-to-model transformation capabilities to Epsilon. More specifically, ETL can be used to transform an arbitrary number of input models into an arbitrary number of output models of different modelling languages and technologies in a rule-based and modular manner.

!!! tip "Try ETL online"
    You can run and fiddle with an ETL transformation that transforms a tree model to a graph model in the [online Epsilon Playground](../playground/index.html?etl).

## Abstract Syntax

As illustrated in the figure below, ETL transformations are organized in modules (`EtlModule`). A module can contain a number of transformation rules (`TransformRule`). Each rule has a unique name (in the context of the module) and also specifies one `source` and many `target` parameters. Since 2.9, target parameters can optionally have a `targetInitializer` expression: if not specified, they will be initialized to a new instance of their type.

A transformation rule can also `extend` a number of other transformation rules and be declared as `abstract`, `primary` and/or `lazy`[^1]. To limit its applicability to a subset of elements that conform to the type of the `source` parameter, a rule can optionally define a guard which is either an EOL expression or a block of EOL statements. Finally, each rule defines a block of EOL statements (`body`) where the logic for populating the property values of the target model elements is specified.

Besides transformation rules, an ETL module can also optionally contain a number of `pre` and `post` named blocks of EOL statements which, as discussed later, are executed before and after the transformation rules respectively. These should not be confused with the pre-/post-condition annotations available for EOL user-defined operations.

```mermaid
classDiagram
class TransformRule {
    -name: String
    -abstract: Boolean
    -lazy: Boolean
    -primary: Boolean
    -greedy: Boolean
    -type: EolModelElementType
    -guard: ExecutableBlock&lt;Boolean&gt;
    -body: ExecutableBlock&lt;Void&gt;
    -targetInitializers: Optional&lt;ExecutableBlock&lt;Object&gt;&gt;[*]
}
class Parameter {
    -name: String
    -type: EolType 
}
class NamedStatementBlockRule {
    -name: String
    -body: StatementBlock
}
EolModule <|-- ErlModule
EtlModule --|> ErlModule
Pre --|> NamedStatementBlockRule
Post --|> NamedStatementBlockRule
ErlModule -- Pre: pre *
ErlModule -- Post: post *
EtlModule -- TransformRule: rules *
TransformRule -- Parameter: source
TransformRule -- Parameter: targets *
TransformRule -- TransformRule: extends *
```

## Concrete Syntax

The concrete syntax of a transformation rule is displayed in the listing below. The optional `abstract`, `lazy` and `primary` attributes of the rule are specified using respective annotations. The name of the rule follows the `rule` keyword and the `source` and `target` parameters are defined after the `transform` and `to` keywords. Since 2.9, `target` parameters can take an initializer expression to set their initial value (e.g. to create an instance of a specific subtype based on information in the source model).

A rule can define an optional comma-separated list of rules it extends after the `extends` keyword. Inside the curly braces ({}), the rule can optionally specify its `guard` either as an EOL expression following a colon (:) (for simple guards) or as a block of statements in curly braces (for more complex guards). Finally, the `body` of the rule is specified as a sequence of EOL statements.

```
(@abstract)?
(@lazy)?
(@primary)?
rule <name>
    transform <sourceParameterName>:<sourceParameterType>
    to <targetParameterName>:<targetParameterType>
        (= <initializerExpression> )?
        (,<targetParameterName>:<targetParameterType>
          (= <initializerExpression> )? )*
    (extends <ruleName> (, <ruleName>*)? {
    
    (guard (:expression)|({statementBlock}))?
    
    statement+
}
```

`Pre` and `post` blocks have a simple syntax that, as presented the listing below, consists of the identifier (`pre` or `post`), an optional name and the set of statements to be executed enclosed in curly braces.

```
(pre|post) <name> {
    statement+
}
```

##Execution Semantics


### Rule and Block Overriding

Similarly to EOL, an ETL module can import a number of other ETL modules. In this case, the importing ETL module inherits all the rules and pre/post blocks specified in the modules it imports (recursively). If the module specifies a rule or a pre/post block with the same name, the local rule/block overrides the imported one respectively.

### Rule Execution Scheduling

When an ETL module is executed, the `pre` blocks of the module are executed first in the order in which they have been specified.

Following that, each non-abstract and non-lazy rule is executed for all the elements on which it is applicable. To be applicable on a particular element, the element must have a type-of relationship with the type defined in the rule's `sourceParameter` (or a kind-of relationship if the rule is annotated as `@greedy`) and must also satisfy the `guard` of the rule (and all the rules it extends).

When a rule is executed on an applicable element, the target elements are initially created by either using their initializer expressions, or by instantiating the `targetParameters` of the rules in their absence, and then their contents are populated using the EOL statements of the `body` of the rule.

Finally, when all rules have been executed, the `post` blocks of the module are executed in the order in which they have been declared.

### Source Elements Resolution

Resolving target elements that have been (or can be) transformed from source elements by other rules is a frequent task in the body of a transformation rule. To automate this task and reduce coupling between rules, ETL contributes the `equivalents()` and `equivalent()` built-in operations that automatically resolve source elements to their transformed counterparts in the target models.

The `equivalents()` operation can be invoked on both single source elements and on collections of source elements:

* On a single source element, it inspects the established transformation trace (displayed in the figure below) and invokes the applicable rules (if necessary) to calculate the counterparts of the element in the target model.

* On a collection, it returns a `Bag` containing `Bag`s that in turn contain the counterparts of the source elements contained in the collection. 

The `equivalents()` operation can be also invoked with an arbitrary number of rule names as parameters, to invoke and return only the equivalents created by specific rules. Unlike the main execution scheduling scheme discussed above, the `equivalents()` operation invokes both lazy and non-lazy rules. It is worth noting that lazy rules are computationally expensive and should be used with caution as they can significantly degrade the performance of the overall transformation.

With regard to the ordering of the results of the `equivalents()` operations, the returned elements appear in the respective order of the rules that have created them. An exception to this occurs when one of the rules is declared as `primary`, in which case its results precede the results of all other rules.

```mermaid-80
classDiagram

class Transformation {
    -source: Object
    -targets: Object[*]
}

class ITransformationStrategy {
    +transformModels(context : EtlContext)
}

EolContext <|-- EtlContext
EtlContext -- TransformationTrace
EtlContext -- ITransformationStrategy: strategy
TransformationTrace -- Transformation: transformations *
Transformation -- TransformRule: rule
```

ETL also provides the convenient `equivalent()` operation:

* When applied to a single element, `equivalent()` returns only the first element of the respective result that would have been returned by the `equivalents()` operation discussed above.
* When applied to a collection, the `equivalent()` operation returns a flattened version (i.e. a `Bag` of model elements) of the `Bag` of `Bags` that `equivalents()` would have returned.

As with the `equivalents()` operation, the `equivalent()` operation can also be invoked with or without parameters.

The semantics of the `equivalent()` operation are further illustrated through a simple example. In this example, we need to transform a model that conforms to the Tree metamodel displayed below into a model that conforms to the Graph metamodel, also displayed below.

```mermaid-70
classDiagram
class Node {
    +label: String
    +incoming: Edge[*]
    +outgoing: Edge[*]
}
class Edge {
    +source: Node
    +target: Node
}
class Tree {
    +name: String
    +parent: Tree
    +children: Tree[*]
}
Tree -- Tree
Node -- Edge
Edge -- Node
```

More specifically, we need to transform each `Tree` element to a `Node`, and an `Edge` that connects it with the `Node` that is equivalent to the tree's `parent`. This is achieved using the rule below.

```etl
rule Tree2Node
    transform t : Tree!Tree
    to n : Graph!Node {
    
    n.label = t.label;
    
    if (t.parent.isDefined()) {
        var edge = new Graph!Edge;
        edge.source = n;
        edge.target = t.parent.equivalent();
    }
}
```

In lines 1--3, the `Tree2Node` rule specifies that it can transform elements of the `Tree` type in the `Tree` model into elements of the `Node` type in the `Graph` model. In line 5 it specifies that the label of the created Node should be the same as the label of the source Tree. If the parent of the source `Tree` is defined (line 7), the rule creates a new `Edge` (line 8) and sets its `source` property to the created `Node` (line 9) and its `target` property to the `equivalent` `Node` of the source `Tree`'s `parent` (line 10).

The Epsilon Playground includes a [more comprehensive version of this example](../../playground/?tree2graph-equivalent), providing comparisons between the various ways to use the `equivalent()` and `equivalents()` operations.

#### Persisting the transformation trace

ETL does not provide built-in support for persisting the transformation trace, however, you can access it through `System.context.transformationTrace` and persist (parts of) it in a format of your choice (e.g. in a `post` block of your transformation).

### Overriding the semantics of the EOL Special Assignment Operator

As discussed above, resolving the equivalent(s) or source model elements in the target model is a recurring task in model transformation. Furthermore, in most cases resolving the equivalent of a model element is immediately followed by assigning/adding the obtained target model elements to the value(s) of a property of another target model element. For example, in line 10 of the listing above, the `equivalent` obtained is immediately assigned to the `target` property of the generated `Edge`. To make transformation specifications more readable, ETL overrides the semantics of the `SpecialAssignmentStatement` (`::=` in terms of concrete syntax), to set its left-hand side, not to the element its right-hand side evaluates to, but to its `equivalent` as calculated using the `equivalent()` operation discussed above. Using this feature, line 10 of the `Tree2Node` rule can be rewritten as shown below.

```
edge.target ::= t.parent;
```

### Interactive Transformations

Using the user interaction facilities of EOL, an ETL transformation can become interactive by prompting the user for input during its execution. For example in the listing below, we modify the `Tree2Node` rule by adding a `guard` part that uses the user-input facilities of EOL (more specifically the `UserInput.confirm(String,Boolean)` operation) to enable the user select manually at runtime which of the Tree elements need to be transformed to respective Node elements in the target model and which not.

```etl
rule Tree2Node
    transform t : Tree!Tree
    to n : Graph!Node {
    
    guard : UserInput.confirm
        ("Transform tree " + t.label + "?", true)
    
    n.label = t.label;
    var target : Graph!Node ::= t.parent;
    if (target.isDefined()) {
        var edge = new Graph!Edge;
        edge.source = n;
        edge.target = target;
    }
}
```

## Additional Resources

Additional resources about ETL are available [here](../articles/#epsilon-transformation-language).

[^1]: The concept of lazy rules was first introduced in ATL
