# Examples 

!!! tip "Looking for in-depth articles?"
	This page contains links to a selection of example projects in Epsilon's Git repository. If you are looking for more in-depth articles describing different features of Epsilon, please visit the [articles](doc/articles/index.md) section of the website.

!!! info "Online Playground"

	If you prefer not to download/install anything just quite yet, you can fiddle with EMF models and metamodels, and with some of the Epsilon languages in the online [Epsilon Playground](../playground).

Each example in this page comes in the form of an Eclipse project, which is stored under the [examples](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/) dirctory of Epsilon's Git repository. To run an example, you need to:

1. Clone the repository
2. Import the project in question into your Eclipse workspace
3. Register any Ecore metamodels in it
4. Right click the `.launch` file in it
5. Select `Run as...` and click the first item in the menu that pops up

!!! warning
    To avoid copying the same metamodels across different example projects, some projects reuse Ecore metamodels stored in the [org.eclipse.epsilon.examples.metamodels](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.metamodels) project.

If you are unable to run any of the examples below, please [give us a shout](../forum).

## Epsilon Object Language

- [Create an OO model with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.buildooinstance): In this example we use EOL to programmatically construct a model that conforms to an object-oriented metamodel.
- [Modify a Tree model with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.modelmodification): In this example we use EOL to programmatically modify a model that conforms to a Tree metamodel and store the modified version as a new model.
- [Call Java code from Epsilon](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.calljava): In this example, we create a JFrame from EOL. The aim of this example is to show how to call Java code from within Epsilon languages.
- [Creating custom Java tools for Epsilon](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.tools): In this example, we create a custom tool for Epsilon.
- [Building and querying plain XML documents with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.plainxml): In this example, we use the plain XML driver of Epsilon to build and query an XML document that is not backed by a XSD/DTD.
- [Cloning and copying XML elements across documents with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.plainxml.copyfromtemplate): In this example, we use the plain XML driver of Epsilon to clone and copy XML elements across different documents with EOL.
- [Cloning EMF model elements with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.clone): In this example, we demonstrate how the EmfTool built-in tool can be used to perform deep-copy (cloning) of EMF model elements using EOL.
- [Profiling and caching in EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.profiling): This example demonstrates the caching capabilities and the profiling tools provided by Epsilon.
- [Manage XSD-backed XML files with EOL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.xsdxml): In this example we demonstrate using EOL to query an XSD-backed XML file.
- [Manage Matlab Simulink/Stateflow blocks from Epsilon](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.emc.simulink.examples): In this example we show how to manage Matlab Simulink/Stateflow blocks with EOL.
## Epsilon Transformation Language

- [Transform a Tree model to a Graph model with ETL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.tree2graph): In this example, we use ETL to transform a model that conforms to a Tree metamodel to a model that conforms to a Graph metamodel.
- [Transform an RSS feed to an Atom feed using ETL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.rss2atom): In this example, we use ETL and the plain XML driver to transform an RSS feed to an Atom feed.
- [Experiment with the different types of transformation rule in ETL using a Flowchart-to-HTML transformation.](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.etl.flowchart2html): In this example, we show the different types of transformation rule that are provided by ETL, including plain, abstract, lazy, primary and greedy rules. We also explore rule inheritance and rules that generate more than model element. We transform from a Flowchart model to an HTML model.
- [Transform an OO model to a DB model with ETL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.oo2db): In this example, we use ETL to transform a model that conforms to an Object-Oriented metamodel to a model that conforms to the Database metamodel.
## Epsilon Generation Language

- [Experiment with the different features of EGL using a Flowchart-to-HTML transformation.](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.egl.flowchart): In this example, we explore the main features of EGL by generating HTML text from an EMF model of a flowchart. We demonstrate the EGX coordination language, code formatters, preserving hand-written text with protected regions and generating a fine-grained trace model.
- [Generating HTML pages from an XML document](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.egl.library): In this example, we use the plain XML driver of Epsilon in the context of an EGL model-to-text transformation.
- [Generate HTML documentation from an Ecore metamodel with EGL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.egldoc): In this example, we demonstrate how EGL can be used to generate HTML documentation from an Ecore metamodel.
## Epsilon Validation Language

- [Validate an OO model with EVL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.validateoo): In this example, we use EVL, to express constraints for models that conform to an Object-Oriented metamodel.
- [Validate an OO model against a DB model with EVL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.evl.intermodel): In this example, we use EVL to expressing inter-model constraints.
- [Dijkstra's shortest path algorithm with EOL/EVL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.shortestpath): In this example, we use EOL and EVL to implement Dijkstra's shortest path algorithm.
## Epsilon Merging Language

- [Heterogeneous Model Merging with ECL/EML](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.mergeentitywithvocabulary): In this example, we demonstrate merging heterogeneous models using ECL and EML.
## Epsilon Flock

- [Migrate Petri net models with Epsilon Flock](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.flock.petrinets): In this example we demonstrate how to migrate a model in response to metamodel changes with Epsilon Flock.
## Epsilon Model Generation Language

- [Generate PetriNet models using EMG](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.emg.petrinet): In this example we demonstrate how to generate PetriNet elements and how to define relations between them.
## Epsilon Pattern Language

- [Find pattern matches in railway models using EPL](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.epl): In this example we demonstrate how to find matches of the patterns in the Train Benchmark models with EPL.
## Combining the Epsilon Languages

- [Use Epsilon in standalone Java applications](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.standalone): In this example, we demonstrate how Epsilon languages can be used in standalone, non-Eclipse-based Java applications.
- [MDD-TIF complete case study](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.mddtif): In this example, we demonstrate how different languages in Epsilon (EVL, EGL, EML, ETL and ECL) can be combined to implement more complex operations.
- [Compare, validate and merge OO models](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.oomerging): In this example, we use ECL to compare two OO models, then use EVL to check the identified matches for consistency and finally EML to merge them.
- [Construct a workflow to orchestrate several Epsilon programs with Ant](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.workflow.flowchart): In this example we demonstrate how to use the built-in Epsilon Ant tasks to define a workflow by combining several Epsilon programs. Here, we validate, transform and generate HTML from a flowchart model.
- [Provide custom/extended tasks for the workflow](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.workflow.extension.example): In this example we demonstrate how you can define your own ANT tasks that extend the Epsilon workflow tasks.
- [Use model transactions in a workflow](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.workflow.transactions): In this example we demonstrate using the ant-contrib try/catch tasks and the Epsilon model transactions tasks to conditionally rollback changes in models modified in a workflow.
## Eugenia

- [Implement a GMF editor with image nodes using Eugenia](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eugenia.examples.friends): In this example we use Eugenia to implement a GMF editor with images instead of shapes for nodes.
- [Implement a GMF editor with end labels in connections using Eugenia](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eugenia.examples.endlabels): In this example we use Eugenia to implement a GMF editor with end labels in connections.
- [Implement a flowchart GMF editor using Eugenia](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eugenia.examples.flowchart): In this example we use Eugenia to implement a flowchart GMF editor, and EOL to polish its appearance.
## EUnit

- [Test EOL scripts with EUnit](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eunit.examples.eol): In this example we show the basic structure of an EUnit test, some useful assertions for the basic types and how to test for errors and define our own assertions.
- [Reuse EUnit tests with model and data bindings](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eunit.examples.bindings): In this example we show how the same EUnit test can be reused for several models, and how EUnit supports several levels of parametric tests.
- [Test a model validation script with EUnit](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eunit.examples.evl): In this example we show how a model validation script written in EVL can be tested with EUnit, using the exportAsModel attribute of the EVL workflow task.
- [Test a model-to-text transformation with EUnit](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eunit.examples.egl.files): In this example we show how a model-to-text transformation written in EGL can be tested with EUnit and HUTN.
- [Integrate EUnit into a standard JUnit plug-in test](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eunit.examples.junit): In this example we show how to write an EUnit/JUnit plug-in test of an ETL transformation.


## Even more examples

More examples are available in the [examples](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/) folder of the Git repository.
