# XML to EMF Transformation with ETL

This example shows how to transform an XML document into an EMF model using the [Epsilon Transformation Language](../etl.md) and Epsilon's [XML driver](plain-xml/index.md). We start with our source XML file (`tree.xml`), which is shown below:

```xml
<?xml version="1.0"?>
<tree name="t1">
	<tree name="t2"/>
	<tree name="t3">
		<tree name="t4"/>
	</tree>
</tree>
```

The Ecore metamodel (expressed in [Emfatic](http://eclipse.org/emfatic)) to which our target EMF model will conform to is shown below:

```emf
package tree;

class Tree {
	attr String label;
	ref Tree#children parent;
	val Tree[*]#parent children;
}
```

Finally, our ETL transformation (`xml2emf.etl`) is in the listing below:

```etl
rule XmlTree2EmfTree
	transform s : Xml!t_tree
	to t : Emf!Tree {
	
	t.label = s.a_name;
	t.children ::= s.c_tree;
	
}
```

The transformation consists of one rule which transforms every tree element in the XML document (`Xml!t_tree`) into an instance of the Tree class of our Ecore metamodel above. The rule sets the `label` of the latter to the `name` of the former, and the `children` of the latter, to the equivalent model elements produced by the `tree` child elements of the former.

To run the transformation:

- Right-click on `tree.emf` or `tree.ecore` and select `Register EPackages`
- Right-click on `xml2emf.launch` and select `Run As` --> `xml2emf`

Once the transformation has executed you can open `tree.model` to inspect the EMF model it has produced with the reflective tree-based editor. The complete source code of the example is available [here](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.etl.xml2emf).
