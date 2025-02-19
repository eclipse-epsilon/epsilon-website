# Running Epsilon from Java

While Epsilon's development tools are based on Eclipse, its runtime is not, and can be used from any (headless) Java application. For example, the back-end of the [Epsilon Playground](../../playground/index.html) is a headless, server-less Java application that runs on Google's Cloud Platform.

!!! info "Did you know that ..."
    Contrary to popular belief, EMF is **not** tightly coupled to the Eclipse IDE either, and can also be embedded in any Java application by importing a couple of dependencies from [Maven Central](https://mvnrepository.com/artifact/org.eclipse.emf).

## Dependencies

Epsilon libraries are available on [MavenCentral](https://mvnrepository.com/artifact/org.eclipse.epsilon). Below is a fragment of a Maven `pom.xml` file, where we declare dependencies to the execution engine of Epsilon's [core expression language](../eol.md) and on Epsilon's driver for EMF-based models. As the EMF driver has a dependency on EMF, we don't need to declare a dependency to the EMF libraries on MavenCentral; Maven will fetch these automatically for us.

```xml
<dependencies>
	<dependency>
		<groupId>org.eclipse.epsilon</groupId>
		<artifactId>org.eclipse.epsilon.emc.emf</artifactId>
		<version>2.2.0</version>
	</dependency>
	<dependency>
		<groupId>org.eclipse.epsilon</groupId>
		<artifactId>org.eclipse.epsilon.eol.engine</artifactId>
		<version>2.2.0</version>
	</dependency>
	...
</dependencies>
```

## Parsing and Executing Epsilon Programs

Having declared a dependency to the EOL engine, parsing and executing an EOL program is as simple as that.

```java
EolModule module = new EolModule();
module.parse(new File("program.eol"));
module.execute();
```

!!! tip
    By replacing `EolModule` with `EtlModule`, `EvlModule` etc. you can parse and execute [ETL transformations](../etl.md), [EVL validation constraints](../evl.md) etc. [EGL](../egl.md) deviates from this pattern and if you wish to execute a single template you should use the `EglTemplateFactoryModuleAdapter` class.

## Loading Models

Most of your Epsilon programs will need to run against models of some sort. To run an EOL program against a model (`model.xmi`) that conforms to a file-based Ecore metamodel (`metamodel.ecore`), you can extend the code above as follows.

```java
// Loads the EMF model
EmfModel model = new EmfModel();
model.setMetamodelFile("metamodel.ecore");
model.setModelFile("model.xmi");
// Set the name by which the model will be
// referred to in the program. Useful if
// the program manages more than one models
model.setName("M");
// Read the contents of the model from disk
// when the model is loaded. Set to false
// to ignore existing model contents (e.g.
// if the model is the target of a 
// model-to-text transformation)
model.setReadOnLoad(true);
// Save any changes made to the model
// when it is disposed
model.setStoredOnDisposal(true);
model.load();

// Parses and executes the EOL program
EolModule module = new EolModule();
module.parse(new File("program.eol"));
// Makes the model accessible from the program
module.getContext().getModelRepository().addModel(model);
module.execute();

// Saves any changes to the model
// and unloads it from memory
// Use model.getContext().
//   getModelRepository().dispose() 
// instead if multiple models are involved
model.dispose();
```

## Adding Variables

You can add variables to your Epsilon program and provide their values from Java as shown below.

```java
EolModule module = new EolModule();
module.parse("s.println();");
module.getContext().getFrameStack().put(Variable.
	createReadOnlyVariable("s", "Hello World"));
module.execute();
``` 

## Using Tools Contributed by Plugins

To use [tools](call-java-from-epsilon/index.md) contributed by other plugins in a standalone Java setup within Eclipse you'll need to add the following line of code.

```java
context.getNativeTypeDelegates().
  add(new ExtensionPointToolNativeTypeDelegate());
```


## Analysing Epsilon Programs

Epsilon programs do not have an Ecore-based metamodel, but you can query and analyse them through Epsilon's Java API as shown below.

```java
// Parse an ETL transformation
EtlModule m = new EtlModule();
m.parse("rule A2B transform a : In!A to b : Out!B { b.name = a.name; }");

// Get the first rule of the transformation
TransformationRule a2b = m.getTransformationRules().get(0);
// Print its name
System.out.println(a2b.getName());

// Get the body of the A2B rule
StatementBlock body = (StatementBlock) a2b.getBody().getBody();
// Print the number of statements it contains
System.out.println(body.getStatements().size());
```

As of version 2.3, Epsilon programs can also be analysed using [visitors](https://en.wikipedia.org/wiki/Visitor_pattern). As an example, see the `EolUnparser` class which recursively visits the contents of an `EolModule` and pretty-prints it. To implement your own analyser, you will need to implement the `IEolVisitor` interface for EOL, or the respective `IE*lVisitor` interfaces for other Epsilon-based languages. Using a combination of `E*lUnparser` and your custom visitor, you can easily rewrite Epsilon programs too.

```java
EolModule module = new EolModule();
module.parse("'Hello world'.println();");

EolUnparser unparser = new EolUnparser();
// Prints "Hello world".println();
System.out.println(unparser.unparse(module));
```

## Debugging Epsilon Programs

To debug Epsilon programs being executed from a Java program, read [these instructions](debugger.md#debugging-epsilon-scripts-embedded-in-java-programs).

## More Examples

In Epsilon's Git repository, there are two example projects that show how to run [Epsilon from Java](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.standalone), and the [ANT Epsilon tasks in a headless environment](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.workflow.standalone) (i.e. from command line).
