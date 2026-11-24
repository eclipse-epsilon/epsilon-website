# Scripting JSON documents using Epsilon

This article discusses how to create, query and modify JSON documents in Epsilon programs using the JSON driver. The examples will only cover some of the Epsilon languages, but the JSON driver supports all the languages in Epsilon.

As of Epsilon 2.5.0, the JSON driver can:

* Read and write local JSON files.
* Read JSON documents accessible via a URI (e.g. `http(s)://`, `file:/`, `jar:/`).

## Querying a JSON document

For this first example, we will query the [GitHub REST API](https://docs.github.com/en/rest) via HTTP, asking it about the [Eclipse Epsilon project](https://api.github.com/repos/eclipse/epsilon), parse its JSON response, and produce a short text report in Markdown.
This example is available from the [Epsilon GitHub repository](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.emc.json.example).

Here is an excerpt of the JSON document (omitted parts are in `...`):

```json
{
  ...
  "description": "Epsilon is a family of Java-based scripting languages for automating common model-based software engineering tasks, such as code generation, model-to-model transformation and model validation, that work out of the box with EMF (including Xtext and Sirius), UML (including Cameo/MagicDraw), Simulink, XML and other types of models.",
  ...
  "ssh_url": "git@github.com:eclipse/epsilon.git",
  "clone_url": "https://github.com/eclipse-epsilon/epsilon.git",
  ...
  "stargazers_count": 27,
  "watchers_count": 27,
  ...
  "forks_count": 8,
  ...
  "license": {
    "key": "epl-2.0",
    "name": "Eclipse Public License 2.0",
    "spdx_id": "EPL-2.0",
    "url": "https://api.github.com/licenses/epl-2.0",
    "node_id": "MDc6TGljZW5zZTMy"
  },
  ...
  "topics": [
    "domain-specific-languages",
    "model-based-software-engineering",
    "model-driven-engineering"
  ],
  ...
}
```

### Basic types in JSON-based models

The JSON driver implements two types for its models: `JSONObject`s and `JSONArray`s.
A `JSONObject` is a Java [Map](https://docs.oracle.com/javase/8/docs/api/java/util/Map.html), and a `JSONArray` is a Java [List](https://docs.oracle.com/javase/8/docs/api/java/util/List.html).
You can use all their methods as usual (e.g. `Map#keySet`, or `List#size`), as well as the [EOL methods for collections and maps](../../eol.md#collections-and-maps).
In addition, you can refer to the `x` property of a `JSONObject` object `o` with the usual syntax `o.x`, both for reading and setting it.

A JSON model has one root element, which most of the time will be a `JSONObject` or a `JSONArray` (although it could be a simple scalar, like an integer).
If the name of the model is `M`, its root element can be accessed via `M.root`.

### Example queries

Here are some queries we can run on the above document:

* Reading the description: `M.root.description`
* Reading the SSH URL: `M.root.ssh_url`
* Reading the license URL: `M.root.license.url`
* Counting the number of topics: `M.root.topics.size()`

### Example EGL template

Suppose we have this EGL template:

```egl
# Eclipse Epsilon

([%=M.root.stargazers_count%] stars, [%=M.root.watchers_count%] watchers, [%=M.root.forks_count%] forks)

[%=M.root.description%]

* Clone via HTTPS: [%=M.root.clone_url%]
* Clone via SSH: [%=M.root.ssh_url%]

## License

Epsilon is licensed under the [[%=M.root.license.name%]]([%=M.root.license.url%]).

## Topics

[% for (topic in M.root.topics) {%]
* [%=topic.ftuc()%]
[% } %]
```

With the above JSON document, it will produce this output:

```
# Eclipse Epsilon

(27 stars, 27 watchers, 8 forks)

Epsilon is a family of Java-based scripting languages for automating common model-based software engineering tasks, such as code generation, model-to-model transformation and model validation, that work out of the box with EMF (including Xtext and Sirius), UML (including Cameo/MagicDraw), Simulink, XML and other types of models.

* Clone via HTTPS: https://github.com/eclipse-epsilon/epsilon.git
* Clone via SSH: git@github.com:eclipse/epsilon.git

## License

Epsilon is licensed under the [Eclipse Public License 2.0](https://api.github.com/licenses/epl-2.0).

## Topics

* Domain-specific-languages
* Model-based-software-engineering
* Model-driven-engineering
```

### Disambiguation between Java methods and JSON properties

In some cases, the name of the property may clash with one of the Java `Map` / `List` methods.
For instance, consider this JSON document:

```json
{"keySet": [1, 2, 3]}
```

In this case, `Model.root.keySet()` would invoke the Map `keySet` method (returning a set containing the `"keySet"` string), rather than refer to the value of the `keySet` property in the root object.

To resolve such clashes, the JSON driver supports adding a `p_` prefix to refer to the original JSON property: `Model.root.p_keySet` would return the `JSONArray` containing the three integers shown in the document (1, 2, and 3).

## Creating and modifying JSON documents

Modifying the contents of a JSON model can be done through regular assignments in EOL, using `Model.root` and `object.property` as usual.

### Initial example: author JSON document

For instance, suppose we run this EOL script with a JSON model called `M`:

```eol
M.root = new JSONObject;
M.root.name = 'Author Name';
M.root.email = 'author@example.com';
M.root.id = 1234;

M.root.accounts = Sequence { 123, 456 };
```

This will produce the following JSON document:

```json
{
  "name": "Author Name",
  "email": "author@example.com",
  "id": 1234,
  "accounts": [123, 456]
}
```

The first line set up the root object of the JSON document, and the remaining lines set various fields on the object.
The last line assigned a `Sequence` to the accounts of the root object: this is OK because it did not contain any JSON arrays or objects.
Otherwise, we would need to use a `JSONArray` instead, because the JSON driver needs to keep track of the JSON model that owns each `JSONArray` and `JSONObject`, and only `JSONArray` and `JSONObject` instances can track this information.

### Author JSON document with detailed accounts

Suppose that we want `M.root.accounts` to contain not just account IDs, but rather entire objects with their own fields.
In that case, we need to use a `JSONArray` as mentioned before:

```eol
M.root = new JSONObject;
M.root.name = 'Author Name';
M.root.email = 'author@example.com';
M.root.id = 1234;

M.root.accounts = new JSONArray;

var firstAccount = new JSONObject;
firstAccount.id = 123;
firstAccount.followers = 10;

var secondAccount = new JSONObject;
secondAccount.id = 456;
secondAccount.followers = 20;

M.root.accounts.add(firstAccount);
M.root.accounts.add(secondAccount);
```

The above EOL program would produce this JSON document:

```json
{
  "name": "Author Name",
  "email": "author@example.com",
  "id": 1234,
  "accounts": [
    {"id": 123, "followers": 10},
    {"id": 456, "followers": 20}
  ]
}
```

As noted above, the only difference for JSON documents is that we need to create `JSONArray`s when we want to store a collection of JSON arrays or objects.

### Reuse of objects in JSON documents

One important detail when creating JSON documents is that the same JSON object or array could be referenced from multiple locations.
Changing that object or array would affect every location in the JSON document which references it.

As an example, consider this EOL script:

```eol
M.root = new JSONObject;
M.root.x = new JSONObject;
M.root.y = M.root.x;

// This new key will also be visible from M.root.y.a
M.root.x.a = 1;
```

The above EOL script will produce this JSON document:

```json
{
  "x": {"a": 1},
  "y": {"a": 1}
}
```

Since both `M.root.x` and `M.root.y` referenced the same JSON object, the last line of the EOL script affected both locations in the produced JSON file.

If this is undesirable, JSON models provide a `deepClone` method which can produce a standalone clone of any `JSONObject` or `JSONArray`.
As an example, here is an EOL script which sets `M.root.y` to a deep clone of `M.root.x`:

```json
M.root = new JSONObject;
M.root.x = new JSONObject;
M.root.y = M.deepClone(M.root.x);

// This new key will NOT be visible from M.root.y
M.root.x.a = 1;
```

Since `M.root.y` is not the same object anymore, the last line only affects `M.root.x`, and the script produces this JSON document:

```json
{
  "x": {"a": 1},
  "y": {}
}
```

### Managing the model root in declarative Epsilon scripts

When writing Epsilon scripts that create JSON objects and arrays using declarative strategies (e.g. ETL), it will be necessary to set the root of the JSON model in a `post` block. This is because in a JSON model, creating a `JSONObject` or a `JSONArray` will not automatically add it to the contents of the model.

As an example, here is an ETL script which transforms EMF models that conform to a `Tree` metamodel into JSON documents:

```etl
post {
  var sourceRoots = Source.getResource().contents; 
  Target.root = sourceRoots.get(0).equivalent();
}

rule TreeToObject transform t: Source!Tree to o: Target!JSONObject {
   o.label = t.label;
   o.children = new Target!JSONArray;
   o.children.addAll(t.children.equivalent());
}
```

If we did not include the `post` block, the `JSONObject`s would be created but `Target.root` would never be set, so we would end up with just `null` in the JSON document.

The above script will first transform every `Tree` to a `JSONObject`, then assign their labels and children, and finally run the `post` block which will assign the `JSONObject` equivalent to the root `Tree` as the root of the `Target` JSON document.
