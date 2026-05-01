# Scripting XML documents using Epsilon
 
In this article we demonstrate how you can create, query and modify plain standalone XML documents (i.e. no XSD/DTD needed) in Epsilon programs using the PlainXML driver added in version 0.8.9. All the examples in this article demonstrate using EOL to script XML documents. However, it's worth stressing that XML documents are supported throughout Epsilon. Therefore, you can use Epsilon to (cross-)validate, transform (to other models - XML or EMF-based -, or to text), compare and merge your XML documents.

<iframe width="90%" height="494" src="https://www.youtube.com/embed/GV1Wyx4SiQQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Querying an XML document
 
We use the following `library.xml` as a base for demonstrating the EOL syntax for querying XML documents.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<library>
	<book title="EMF Eclipse Modeling Framework" pages="744">
		<author>Dave Steinberg</author>
		<author>Frank Budinsky</author>
		<author>Marcelo Paternostro</author>
		<author>Ed Merks</author>
		<published>2009</published>
	</book>
	<book title="Eclipse Modeling Project: A Domain-Specific Language (DSL) Toolkit" pages="736">
		<author>Richard Gronback</author>
		<published>2009</published>
	</book>
	<book title="Official Eclipse 3.0 FAQs" pages="432">
		<author>John Arthorne</author>
		<author>Chris Laffra</author>
		<published>2004</published>
	</book>
</library>
```

## Querying/modifying XML documents in EOL
 
The PlainXML driver uses predefined naming conventions to allow developers to programmatically access and modify XML documents in a concise way. This section outlines the supported conventions in the form of questions and answers followed by relevant examples.

### How can I access elements by tag name? 
 
The `t_` prefix in front of the name of the tag is used to represent a type, instances of which are all the elements with that tag. For instance, `t_book.all` can be used to get all elements tagged as `<book>` in the document, `t_author.all` to retrieve all `<author>` elements etc. Also, if `b` is an element with a `<book>` tag, then `b.isTypeOf(t_book)` shall return true. If the tag name contains hyphens, underscores, and/or periods, you must escape the complete type name inside back ticks: `` `t_first-name` `` 

```eol
// Get all <book> elements
var books = t_book.all;

// Get a random book
var b = books.random();

// Check if b is a book
// Prints 'true'
b.isTypeOf(t_book).println();

// Check if b is a library
// Prints 'false'
b.isTypeOf(t_library).println();
```

### How can I get the tag name of an element?
 
You can use the `.name` property for this purpose. For instance, if `b` is an element tagged as `<book>`, `b.name` shall return `book`. The `name` property is read-only.

```eol
// Get a random <book> element
var b = t_book.all.random();

// Print its tag
// Prints 'book'
b.name.println();
```
!!! warning "tagName property is deprecated"
    Previously the `tagName` property was suggested for getting the tag name of an element. Due to the introduction of modules in Java 9 accessing this property is deprecated and future use can result in run time exceptions.


### How can I get/set the attributes of an element?
 
You can use the attribute name as a property of the element object, prefixed by `a_`. For example, if `b` is the first book of `library.xml`, `b.a_title` will return `EMF Eclipse Modeling Framework`. Attribute properties are read/write.

In this example, `b.a_pages` will return `744` as a string. For `744` to be returned as an integer instead, the `i_` prefix should be used instead (i.e. `b.i_pages`. The driver also supports the following prefixes: `b_` for boolean, `s_` for string (alias of `a_`) and `r_` for real values. 

```eol
// Print all the titles of the books in the library
for (b in t_book.all) {
	b.a_title.println();
}

// Print the total number of pages of all books
var total = 0;
for (b in t_book.all) {
	total = total + b.i_pages;
}
total.print();

// ... the same using collect() and sum() 
// instead of a for loop
t_book.all.collect(b|b.i_pages).sum();
```

### How can I get/set the text of an element?
 
You can use the `.text` read-write property for this.

```eol
for (author in t_author.all) {
	author.text.println();
}
```

### How do I get the parent of an element?
 
You can use the `.parentNode` read-only property for this.

```eol
// Get a random book
var b = t_book.all.random();

// Print the tag of its parent node
// Prints 'library'
b.parentNode.name.println();
```

### How do I get the children of an element?
 
You can use the `.children` read-only property for this.

```eol
// Get the <library> element
var lib = t_library.all.first();

// Iterate through its children
for (b in lib.children) {
	// Print the title of each child
	b.a_title.println();
}
```

### How do I get child elements with a specific tag name?
 
Using what you've learned so far, you can do this using a combination of the `.children` property and the `select()`/`selectOne()` operations. However, the driver also supports `e_` and `c_`-prefixed shorthand properties for accessing one or a collection of elements with the specified name respectively. `e_` and `c_` properties are read-only.

```eol
// Get a random book
var b = t_book.all.random();

// Get its <author> children using the 
// .children property
var authors = b.children.select(a|a.name = "author");

// Do the same using the shorthand
authors = b.c_author;

// Get its <published> child and print
// its text using the
// .children property
b.children.selectOne(p|p.name = "published").text.println();

// Do the same using the shorthand
// (e_ instead of c_ this time as 
// we only want one element, 
// not a collection of them)
b.e_published.text.println();
```

### How do I create an element?
 
You can use the `new` operator for this. 

```eol
// Check how many <books> are in the library
// Prints '3'
t_book.all.size().println();

// Creates a new book element
var b = new t_book;

// Check again
// Prints '4'
t_book.all.size().println();
```

### How can I add a child to an existing element?

You can use the `.appendChild(child)` operation for this.

```eol
// Create a new book
var b = new t_book;

// Get the library element
var lib = t_library.all.first();

// Add the book to the library
lib.appendChild(b);
```

### How can I set the root element of an XML document?

You can use the `.root` property for this.

```eol
XMLDoc.root = new t_library;
```

!!! warning "Root element is required"
    When writing scripts that create new XML documents, e.g. ETL, the root element must be set on the output model. This can be done in a `pre` block (e.g. if the root is not created by a transformation rule) or in a rule/operation/other. For the Library example above (where `lib` is the model name): 
    ```etl
    pre {
        var root = new t_library;
        lib.root = root;
    }
    ```
    If a root element is not assigned, then the output file will be empty.

### Using XML attributes as references

The XML model type allows XML attributes to be used as references by using the attribute value as a "key" of another element. For example, we could extend the library example to include an author and editor reference on each book, and move authors to the root:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<library>
	<book title="EMF Eclipse Modeling Framework" pages="744" authors="DS,FB,MP,EM" editor="EG">
		
		<published>2009</published>
	</book>
	<book title="Eclipse Modeling Project: A Domain-Specific Language (DSL) Toolkit" pages="736" authors="RG">
		<published>2009</published>
	</book>
	<book title="Official Eclipse 3.0 FAQs" pages="432">
		<author>John Arthorne</author>
		<author>Chris Laffra</author>
		<published>2004</published>
	</book>
	<author id="DS">Dave Steinberg</author>
	<author id="FB">Frank Budinsky</author>
	<author id="MP">Marcelo Paternostro</author>
	<author id="EM">Ed Merks</author>
	<author id="RG">Richard Gronback</author>
	<editor id="EG">Erich Gamma</editor>
</library>
```

Note that the attributes used for references must be a comma-separated list of "keys".

For enabling the references, we need to add the desired bindings to the model. The `bind` method has the following signature: `bind(String sourceTag, String sourceAttribute, String targetTag, String targetAttribute, boolean many)`. Thus, for the library example, in EOL this can be done like this:

```eol
model.bind("book", "authors", "author", "id", true);
model.bind("book", "editor", "editor", "name", false);
```

where `model` is the name of the model (as specified in the run configuration). These statements should be at the top of the EOL file so the bindings are added before any other code executes. For rule-based languages, this could be done in a `pre` block. If invoking from [Java](#loading-an-xml-document-through-java-code) the `bind` method can be called on the model variable.

After the bindings are in place, we can use them:

```eol
var lib = t_library.all.first();
// Prints 4
lib.c_book.first().authors.size().println();
// Prints Frank Budinsky
lib.c_book.first().authors.second().text.println();
```

## Adding an XML document to your launch configuration
 
To add an XML document to your Epsilon launch configuration, you need to select "Plain XML document" from the list of available model types.

![](select.png)

Then you can configure the details of your document (name, file etc.) in the screen that pops up. To load an XML document that is not in the Eclipse workspace, untick the "Workspace file" check box and provide a full URI for your document (e.g. `http://api.twitter.com/1/statuses/followers/epsilonews.xml` or `file:/c:/myxml.xml`).

![](configure.png)

## Loading an XML document in your ANT buildfile
 
The following ANT build file demonstrates how you can use ANT to load/store and process XML documents with Epsilon.

```xml
<project default="main">
	<target name="main">
		
		<epsilon.xml.loadModel name="XMLDoc" file="library.xml"
			read="true" store="false"/>
		</epsilon.xml.loadModel>
		
		<epsilon.eol src="my.eol">
			<model ref="XMLDoc"/>
		</epsilon.eol>
		
	</target>
</project>
```
 
## Loading an XML document through Java code
 
The following excerpt demonstrates using XML models using Epsilon's Java API.

```java
EolModule module = new EolModule();
module.parse(new File("..."));

PlainXmlModel model = new PlainXmlModel();
model.setName("M");
model.setFile(new File("..."));
model.load();

module.getContext().getModelRepository().addModel(model);
module.getContext().setModule(module);
module.execute();
```
 
## Additional resources
 
* [http://java.sun.com/javase/6/docs/api/org/w3c/dom/Element.html](http://java.sun.com/javase/6/docs/api/org/w3c/dom/Element.html): Complete list of the operations that are applicable to XML elements