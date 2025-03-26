# Scripting XML documents that conform to an XSD schema using Epsilon

In this article we demonstrate how you can create, query and modify XML documents backed by an XSD schema in Epsilon.

## Querying an XML document
 
We use the following `library.xml` as a base for demonstrating the EOL syntax for querying XML documents.

```xml
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/library.xml") }}}
```

The XSD schema `library.xsd` that backs the `library.xml` file is the following.

```xml
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/library.xsd") }}}
```

## Querying XML documents in EOL
 
The XML driver uses a predefined naming convention to allow developers to programmatically access complex types in XML documents. 
 
### How can I query by element type?
The word `Type` should be appended at the end of the name of the tag that is used to represent a type. In addition, the first letter of the tag should be capitalised (no matter if it is in lowercase in the schema/xml file). For instance, `BookType.all()` can be used to get all elements tagged as `<book>` in the document. Also, if `b` is an element with a `<book>` tag, then `b.isTypeOf(BookType)` shall return true.

```eol
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/query-by-type.eol") }}}
```

### How can I get/set the attributes of an element?
 
You can use the attribute name as a property of the element object. For example, if `b` is the first book of `library.xml`, `b.title` will return `EMF Eclipse Modeling Framework`. Attribute properties are read/write.

In this example, `b.pages` will return `744` as an integer. Thus, the following program will return the total number of pages of all the books in the library. 

```eol
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/get-attributes.eol") }}}
```

### How can I set the text of an element?
 
You can use the property name and the assignment symbol `=` for this.

```eol
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/set-element-text.eol") }}}
```

### How do I create an element and add it to an existing element?
 
You can use the `new` operator for this. 

```eol
{{{ example("org.eclipse.epsilon.examples.xsdxml/library/create-element.eol") }}}
```

## Running this example from Java

You can use the driver's API as shown below to load the library XML document and XSD schema and run the EOL snippets above from Java. The complete Maven project is [here](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.xsdxml).

```java
{{{ example("org.eclipse.epsilon.examples.xsdxml/src/main/java/org/eclipse/epsilon/examples/xsdxml/LibraryExample.java") }}}
```

## Adding an XML document to your launch configuration
 
To add an XML document to your Epsilon launch configuration, you need to select "XML document backed by XSD (EMF)" from the list of available model types.

![](select.png)

Then you can configure the details of your document (name, file etc.) in the screen that pops up. If you are making changes to the XML document, remember to tick the "Store on disposal" check box to save the changes in your document. 

![](configure.png)