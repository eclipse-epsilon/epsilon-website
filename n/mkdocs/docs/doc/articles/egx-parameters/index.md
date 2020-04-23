# Co-ordinating EGL template execution with EGX
Suppose you're using Epsilon to make a compiler for a domain-specific language (DSL). Specifically, for every Library in the DSL, you want to generate a separate XML file with all of the properties of the Library and its Books. With EGX, you can parameterize your EGL templates to achieve this, like so:

```egx
pre {
	var outDirLib : String = "../libraries/";
	var extension : String = ".xml";
	var specialBook : String = "Art of War";
	var bigLibThreshold : Integer = 9000;
}

rule Libraries transform lib : Library {
	parameters : Map {
		"library" = lib,
		"name" = lib.name,
		"books" = lib.books,
		"hasSpecialBook" = lib.books.exists(book | book.title == specialBook),
		"isBigLibrary" = lib.books.size() > bigLibThreshold
	}
	template: "/path/to/Lib2XML.egl"
	target: outDirLib+lib.name+extension
}
```

In this example, the Lib2XML EGL template will be invoked for every Library instance in the model, and the output will be written to the file specified in the "target". The Lib2XML template will receive all of the parameters put in the "params" variable in the parameters block of the rule. The variable is a mapping from variable name (that the EGL template will use to refer to it) and variable value. For reference, the Lib2XML template is shown below.

!!! info "Note"

	There is no limit on the number of rules you can declare in an EGX program.

```egl
<?xml version="1.0" encoding="UTF-8"?>
<library id=[%=lib.id%] name="[%=name%]" isBigLibrary="[%=isBigLibrary.asString()%]">
[% for (book in books) {%]
	<book>
		<title>[%=book.title%]</title>
		<isbn>[%=book.isbn%]</isbn>
		<pages>[%=book.pages.asString()%]</pages>
		<authors>
		[% for (author in book.authors) {%]
			<author name="[%=author.name%]"/>
		[%}%]
		</authors>
	</book>
[%}%]
</library>
```