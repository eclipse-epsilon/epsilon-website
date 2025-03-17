# Articles

This page links to more than **80 articles** on various aspects of Epsilon. Should you find that an article is outdated, please [let us know](https://www.eclipse.org/epsilon/forum).

## Epsilon Object Language

- [EOL syntax updates](eol-syntax-updates/index.md): This article summarizes changes in the EOL concrete syntax over time.
- [Extended Properties](extended-properties/index.md): This article demonstrates the extended properties mechanism in EOL (and by inheritance, in all languages in Epsilon).
- [Call Java from Epsilon](call-java-from-epsilon/index.md): This article demonstrates how to create Java objects, access their properties and call their methods from Epsilon languages.
- [Running Epsilon from Java](run-epsilon-from-java.md): This article demonstrates how to parse and execute Epsilon programs and load models from headless Java applications.
- [Running Epsilon Programs on POJOs](epsilon-pojos.md): This article demonstrates how to run EOL programs and EGL templates on plain-old Java objects (POJOs).
- [Call Java functional interfaces from Epsilon](lambda-expressions/index.md): This article demonstrates how to call native methods which take functions as their parameter, using lambdas and streams directly from Epsilon using EOL syntax.
- [Profiling Epsilon Programs](profiling/index.md): This article demonstrates how to profile Epsilon programs using the platform's built-in profiling tools.
- [EOL Interpreter View](eol-interpreter-view/index.md): This article demonstrates an Eclipse view for running EOL scripts against selected model elements in EMF-based editors.
- [Epsilon Debugger](debugger.md): Demonstrates how to use the Eclipse-based step-by-step debugging support in the Epsilon languages.
- [Type Relationships in Epsilon](type-relationships-in-epsilon.md): Discusses the `kind-of` and `type-of` relationships between objects and types in Epsilon programs.

## Epsilon Validation Language

- [EVL-GMF Integration](evl-gmf-integration/index.md): This article demonstrates evaluating EVL constraints from within a GMF-based editor.
- [EVL-EMF Validation Integration](evl-emf-integration.md): This article demonstrates contributing EVL constraints to EMF's validation framework.
- [Parallel Execution](parallel-execution/index.md): This article explains how to use the parallel module implementations for EOL and rule-based languages like EVL.

## Epsilon Generation Language

- [Code Generation Tutorial with EGL](code-generation-tutorial-egl/index.md): This article demonstrates using EGL templates to generate HTML files from an XML document.
- [Running Epsilon Programs on POJOs](epsilon-pojos.md): This article demonstrates how to run EOL programs and EGL templates on plain-old Java objects (POJOs).
- [Using template operations in EGL](egl-template-operations/index.md): This article demonstrates template operations for writing re-usable code in EGL (the model-to-text language of Epsilon).
- [EGL as a server-side language](egl-server-side/index.md): This article demonstrates using EGL (the model-to-text language of Epsilon) in Tomcat to produce HTML pages from EMF models on the fly.
- [Co-ordinating EGL templates with EGX](egx-parameters/index.md): This article demonstrates how to parameterize EGL templates and execute them multiple times to produce multiple files.
- [Re-using EGL templates](egl-invoke-egl/index.md): This article demonstrates how to invoke other EGL templates and direct their output to calling EGL template.
- [EGL Patch Templates](egl-patch.md): This article demonstrates how to patch existing files with EGL.

## Epsilon Transformation Language

- [XML to EMF Transformation](xml-to-emf.md): This article shows how to transform an XML document into an EMF model using the Epsilon Transformation Language and Epsilon's XML driver

## Epsilon and EMF models

- [Emfatic language reference](https://www.eclipse.org/emfatic/): Emfatic is a language designed to represent EMF Ecore models in a textual form.  This article details the syntax of Emfatic and the mapping between Emfatic declarations and the corresponding Ecore constructs.
- [Reflective EMF tutorial](reflective-emf-tutorial/index.md): This tutorial demonstrates how to create an EMF Ecore metamodel and a sample model that conforms to it reflectively (i.e. without generating any code).
- [Epsilon and EMF](epsilon-emf/index.md): Frequently-asked questions related to querying and modifying EMF-based models with Epsilon.
- [Epsilon and Capella](epsilon-and-capella/index.md): This article demonstrates how to use Epsilon to query, validate and transform models in the Capella workbench.
- [Epsilon and Sirius](epsilon-and-sirius/index.md): This article discusses how to use Epsilon with models developed using Sirius-based graphical editors.
- [The EMF EPackage Registry View](epackage-registry-view/index.md): This article demonstrates the EPackage Registry view which allows developers to inspect the contents of the registered EMF EPackages.
- [Exeed annotation reference](../exeed/index.md): This article lists the annotations you can use on your metamodels to customize the look of the Exeed model editor.
- [Inspecting EMF models with Exeed](inspect-models-exeed/index.md): This article demonstrates how you can use Exeed to inspect the structure of your EMF models.
- [Working with custom EMF resources](in-memory-emf-model/index.md): This article demonstrates how you can work with custom EMF resources in Epsilon.
- [Parsing XML documents as EMF models with Flexmi](../flexmi/index.md): This article demonstrates how you can use Flexmi to parse XML documents in a fuzzy manner as instances of Ecore metamodels.
- [Modularity Mechanisms in Flexmi](modular-flexmi/modular-flexmi.pdf): This article demonstrates how you can break down Flexmi models over multiple files and use templates to capture complex reusable structures in your models.
- [Connecting to CDO repositories](cdo-emc.md): This article shows how to connect to an Eclipse Connected Data Objects model repository from Epsilon.
- [Using Epsilon for Ecore Validation, Setting and Invocation Delegation](epsilon-in-ecore/index.md): This shows how to use Epsilon in an Ecore model to provide Invocation and Setting delegation with EOL and Validation Delegation with EVL.

## Epsilon and UML models

- [Managing Profiled UML Models in Epsilon](profiled-uml-models/index.md): This article shows how to create and query profiled Eclipse UML models using Epsilon's core language.

## Epsilon and Simulink models

- [Scripting Simulink models using Epsilon](simulink/index.md): In this article we demonstrate how you can query and modify Simulink models in Epsilon.
- [Managing Matlab Simulink/Stateflow models from Epsilon](simulink-stateflow/index.md): This tutorial shows you how to manipulate Simulink and Stateflow blocks from within Epsilon.

## Epsilon and other types of models

- [Scripting XML documents using Epsilon](plain-xml/index.md): In this article we demonstrate how you can create, query and modify plain standalone XML documents (i.e. no XSD/DTD needed) in Epsilon programs using the PlainXML driver.
- [Scripting XML documents that conform to an XSD schema using Epsilon](xsd-xml): In this article we demonstrate how you can create, query and modify XML documents backed by an XSD schema in Epsilon.
- [Scripting YAML documents using Epsilon](yaml-emc/index.md): This article demonstrates how you can query and modify YAML documents with Epsilon programs using the YAML driver.
- [Scripting JSON documents using Epsilon](json-emc/index.md): This article shows how you can create, query and modify JSON documents with Epsilon programs using the JSON driver.
- [Scripting CSV files using Epsilon](csv-emc/index.md): This article demonstrates how you can query CSV files with Epsilon programs using the CSV driver.
- [Scripting Excel spreadsheets using Epsilon](excel/index.md): In this article we demonstrate how you can create, query and modify Excel spreadsheets in Epsilon programs.
- [Scripting HTML documents using Epsilon](html/index.md): In this article we demonstrate how you can create, query and modify HTML documents in Epsilon programs using the HTML driver.
- [Scripting BibTeX files using Epsilon](bibtex/index.md): In this article we demonstrate how you can query a list of references stored in BibTeX files with Epsilon programs using the BibTeX driver.
- [Treating Java code as a model in Epsilon](jdt/index.md): In this article we demonstrate how Epsilon languages can query Java code as if it were a model, using a driver that builds on the Eclipse Java Development Tools.

## Eugenia

### Fundamentals

- [Eugenia GMF Tutorial](../eugenia/index.md): This article provides a guide to using Eugenia for developing GMF editors, as well as its complete list of features and supported annotations.
- [Customizing an editor generated with Eugenia](eugenia-polishing/index.md): This article demonstrates Eugenia's polishing transformations, which can be used to customize GMF editors in a systematic and reproducible way.
- [Applying source code patches to an editor generated with Eugenia](eugenia-patching/index.md): This article demonstrates Eugenia's patch generation and application functionality, which can be used to customize the Java source code generated by GMF in a systematic and reproducible way.
- [Eugenia: Automated Invocation with Ant](eugenia-ant/index.md): This article demonstrates how to run Eugenia from Ant, and some of the additional features offered through the Ant task.

### Recipes

- [Eugenia: Nodes with images instead of shapes](eugenia-nodes-with-images/index.md): This article shows how to create nodes in your GMF editor that are represented with images (png, jpg etc.) instead of the standard GMF shapes (rectangle, ellipse etc.)
- [Eugenia: Nodes with images defined at run-time](eugenia-nodes-with-runtime-images/index.md): This article addresses the case where the end-user needs to set an image for each node at runtime.
- [Eugenia: Nodes with a centred layout](eugenia-nodes-with-centred-layout/index.md): This article shows how to create nodes in your GMF editor whose contents are centred both vertically and horizontally.
- [Eugenia: Phantom nodes in GMF editors](eugenia-phantom-nodes/index.md): This article demonstrates how to define GMF phantom nodes in Eugenia.


## Picto

- [Visualising Models with Picto](../picto/index.md): Picto is an Eclipse view for visualising models via model-to-text transformation to SVG/HTML. The article introduces Picto and shows the tool in action.
- [Drill-Down Sequence Diagrams with Picto](picto-sequence-diagrams/index.md): This article demonstrates using Picto and its PlantUML integration to generate drill-down sequence diagrams from models conforming to a minimal EMF-based sequence diagram language.
- [Visualising Models with Picto and Sirius](visualising-models-with-picto-and-sirius/index.md): This article demonstrates using Picto to produce dynamic web-based views (pie and bar charts) from Sirius-based models.
- [Visualising Xtext models with Picto](picto-xtext/index.md): This article shows how Picto can be used to produce graphical views from Xtext-based models.
- [Table visualisations with Picto and Pinset](picto-tables/index.md): This article shows how to create table views in Picto that render static CSV files or those generated with a Pinset transformation.
- [Embedding Picto views in static Markdown or HTML documents](picto-embedded-views/index.md): This article shows how to embed Picto views to create Markdown or HTML-based model reports.

## Workflow (ANT Tasks)

- [Running Epsilon's ANT Tasks from Command Line](running-epsilon-ant-tasks-from-command-line/index.md): This article shows how to run Epsilon's ANT tasks from command line or in the context of a CI build.

## Development Environments

- [VS Code](vscode/index.md): This article provides an overview of how you can edit and run Epsilon programs in the VS Code IDE.
- [Sublime](https://github.com/epsilonlabs/sublime): This repository provides a package that adds Epsilon syntax highlighting capabilities to the [Sublime](https://www.sublimetext.com) editor.
<!--TODO: Add a section about development environments? -->

## Human-Usable Textual Notation

- [Using the Human-Usable Textual Notation (HUTN) in Epsilon](hutn-basic/index.md): This article demonstrates how to specify models using a textual notation.
- [Customising Epsilon HUTN documents with configuration](hutn-configuration/index.md): This article demonstrates how to customise Epsilon HUTN documents with a configuration model.
- [Compliance of Epsilon HUTN to the OMG HUTN Standard](hutn-compliance/index.md): This article summarises the similarities and differences between the Epsilon HUTN implementation and the OMG HUTN standard.

## Teaching Material

- [MDE Exercises](exercises/index.md): This article provides a number of exercises which enable you to test your knowledge on MDE, EMF and Epsilon.
- [Epsilon Playground](playground): The Epsilon Playground is a web application for fiddling with metamodelling, modelling and automated model management using Emfatic, Flexmi and Epsilon's languages.

## Technical Support

- [Troubleshooting](troubleshooting/index.md): A list of common issues that (particularly new) users of Epsilon tend to run into.
- [Constructing a helpful minimal example](minimal-examples/index.md): From time to time, you may run into a problem when using Epsilon or find a bug. This article describes how to construct a minimal example that we can use to reproduce the problem on our machine.

## Extending Epsilon

- [Developing a new Epsilon Language](developing-a-new-language/index.md): This article demonstrates how to develop a new language on top of Epsilon.
- [Developing a new EMC Driver](developing-a-new-emc-driver/index.md): This article demonstrates how to develop a new driver for Epsilon's Model Connectivity layer (EMC).
- [Monitoring and Instrumenting Epsilon Programs](monitoring-and-instrumenting-epsilon-programs/index.md): This article demonstrates how Epsilon interpreters provide support for hooking into the execution of model management programs.

## Installation

- [Working with Epsilon 1.x](epsilon-1.x/index.md): This article contains instructions for installing legacy versions of Epsilon prior to 2.0.
- [Setting up Eclipse for Epsilon development](dev-setup/index.md): This article explains how to easily set up and configure an Eclipse IDE for contributing to Epsilon.

## Epsilon Developers

- [Running Epsilon from source](running-from-source/index.md): This article demonstrates how to run Epsilon from source in your machine.
- [Call for User Stories](call-for-user-stories/index.md): This is a kind request to all Epsilon Users.
- [Manage the Epsilon website locally](manage-the-epsilon-website-locally/index.md): This article demonstrates how to manage the Epsilon website in your machine.
- [Epsilon development principles](development-principles/index.md): These are the guiding principles used by the developers of Epsilon.
- [Managing the target platform](target-platform/index.md): This article outlines how to manage the target platform that Epsilon is built against.
- [Adding new plugins](adding-new-plugins/index.md): This article outlines the process of adding new plugins to the main Epsilon repository.
- [Preparing the macOS distribution](preparing-the-macosx-distribution/index.md): This article outlines the process of signing the Eclipse macOS distribution. <!--TODO: Delete as we no longer produce distributions -->
- [Publishing to the EpsilonLabs Updatesite](labsupdatesite/index.md): This article outlines the process for publishing a plugin (EMC driver/language/tool) from the EpsilonLabs Github organisation to the EpsilonLabs updatesite.
- [Releasing a new version of Epsilon](release-tasks/index.md): This article lists all the tasks required for releasing a version of Epsilon.
- [Releasing a new version to Maven Central](maven-release/index.md): This article outlines how to release a new version of the Epsilon standalone artifacts to Maven Central.
