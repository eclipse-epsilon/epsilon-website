# Native lambda expressions

Whilst EOL has many useful declarative operations built in, some applications and developers may benefit from using alternative implementations, such as the [Java Streams API](https://docs.oracle.com/javase/8/docs/api/java/util/stream/package-summary.html).

Epsilon now allows you to invoke functional interfaces using EOL first-order operation syntax. Provided that the method being invoked takes one or more [functional interface](https://docs.oracle.com/javase/8/docs/api/java/lang/FunctionalInterface.html)s as a parameter and the correct number of parameters are supplied to each interface, this integration should work seamlessly as with regular first-order operation call expressions. For lambda expressions which do not require a parameter, you can either omit the parameter, use `null` or `_` in place of the parameter, like so:

```eol
  var optional = Native("java.util.stream.IntStream")
    .range(0, 16)
    .filter(i | i / 4 >= 2)
    .findFirst();
  
  optional.orElse(64/4);  // No lambda - literal value always calculated even if not present.
  optional.orElseGet(null | someIntensiveCalculation());  // Evaluation only occurs if no value is present.
  optional.orElseThrow(| new Native("org.eclipse.epsilon.eol.exceptions.EolRuntimeException"));
```

Here is an example of how one could use Java Streams and the equivalent approach using EOL (i.e. without native delegation):

```eol
  var Collectors = Native("java.util.stream.Collectors");

  var testData = Sequence{-1024..1024};
  
  var positiveOddsSquaredEol = testData
    .select(i | i >= 0 and i.mod(2) > 0)
    .collect(i | i * i)
    .asSet();
  
  var positiveOddsSquaredJava = testData.stream()
    .filter(i | i >= 0 and i.mod(2) > 0)
    .map(i | i * i)
    .collect(Collectors.toSet());
    
  assertEquals(positiveOddsSquaredEol, positiveOddsSquaredJava);
```

One benefits of using Streams is lazy evaluation, which allows you to chain a series of operations without executing the entire pipeline on all elements. This can be more efficient since streams are not materialised in intermediate operations, unlike EOL first-order operations which always return a collection and are thus evaluated eagerly. As with built-in EOL operations, Streams also support parallel execution, although this must be explicitly specified with the `.parallel()` property on the stream.

Currently EOL does not support operations which require a simple variable and non-functional interface as a parameter, such as the [iterate](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html#iterate-T-java.util.function.UnaryOperator-) operation. To work around this, you can assign lambda expressions to variables, deriving them by calling a built-in operation to obtain the desired type.

```eol
  // UnaryOperator
  var doubler = unary(i | i * 2);
  assertEquals(16, doubler.apply(8));
  
  // Predicate
  var isEvenTester = predicate(i | i.mod(2) == 0);
  assertFalse(predicate.test(3));
  
  // Function
  var hasher = func(x | x.hashCode());
  assertEquals(-1007761232, hasher.apply("a string"));
  
  // Consumer
  var printer = consumer(x | x.println());
  printer.accept("Testing...");
  
  // Supplier
  var threadSafeCollectionMaker = supplier( | new Native("java.util.concurrent.ConcurrentLinkedDeque"));
  var deque = threadSafeCollectionMaker.get();
  
  // Runnable
  var sayHi = runnable( | "Hello, World!".println());
  sayHi.run();
```

### Streams vs EOL cheat sheet

Aside from the fact that streams are lazy and Epsilon operations are eager, there is some inevitable overlap in their functionality. This section provides an equivalence mapping from Epsilon to Java Streams to help you migrate from one to the other.

-   `select` =\> `filter`
-   `collect` =\> `map`
-   `forAll` =\> `allMatch`
-   `exists` =\> `anyMatch`
-   `none` =\> `noneMatch`
-   `nMatch` =\> No efficient short-circuiting equivalent, but result
    can be achieved using `filter` followed by `.count() == n`
-   `count` =\> `count`
-   `one` =\> Same as `nMatch` with n = 1
-   `selectOne` =\> `filter` followed by `.findAny()` / `.findFirst()`
    then `.orElse(null)` if the desired absence of a result is null
-   `reject` =\> same as `select` with negated predicate
-   `sortBy` =\> `sorted`
-   `mapBy` =\> `.collect(Collectors.groupingBy)`
-   `aggregate` =\> `.collect(Collectors.toMap)`

In addition, non-first-order operations on Epsilon collection types can be simulated as follows for streams:

-   `flatten` =\> `.flatMap(c | c.stream())` \-- please note that
    `flatten` is recursive whilst `flatMap` is not
-   `sum` =\> `.filter(e | e.isInteger()).mapToInt(i | i).sum()` \--
    replace Int/Integer with appropriate type (Long, Double etc.)
-   `min / max` =\> Same as sum but replace the last call with min or
    max as required
-   `product` =\> Same as `sum` but replace the last call with
    `.reduce(i1, i2 | i1 * i2).getAsLong()` \-- replace Long with
    appropriate type
-   `asBag` =\> `.collect(Collectors.toCollection(| new Bag))`
-   `asSequence` / `asSet` / `asOrderedSet` =\> Same as `asBag` but
    replace Bag with desired type

Please note that streams are one-shot and the pipeline cannot be re-used once a terminal operation is invoked (see the API for details).