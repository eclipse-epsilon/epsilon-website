# Articles

This page contains an index of articles presenting a range of tools and languages in Epsilon. Should you find that an article contains errors or is inconsistent with the current release of Epsilon, please [let us know](https://www.eclipse.org/epsilon/forum).


## Epsilon Object Language

- [EOL syntax updates](eol-syntax-updates): This article summarizes changes in the EOL concrete syntax over time.
- [Extended Properties](extended-properties): This article demonstrates the extended properties mechanism in EOL (and by inheritance, in all languages in Epsilon).
- [Call Java from Epsilon](call-java-from-epsilon): This article demonstrates how to create Java objects, access their properties and call their methods from Epsilon languages.
- [Call Java functional interfaces from Epsilon](lambda-expressions): This article demonstrates how to call native methods which take functions as their parameter, using lambdas and streams directly from Epsilon using EOL syntax.
- [Profiling Epsilon Programs](profiling): This article demonstrates how to profile Epsilon programs using the platform's built-in profiling tools.

## Epsilon Validation Language

- [EVL-GMF Integration](evl-gmf-integration): This article demonstrates evaluating EVL constraints from within a GMF-based editor.
- [Parallel Execution](parallel-execution): This article explains how to use the parallel module implementations for EOL and rule-based languages like EVL.

## Epsilon Generation Language

- [Code Generation Tutorial with EGL](code-generation-tutorial-egl): This article demonstrates using EGL templates to generate HTML files from an XML document.
- [Using template operations in EGL](egl-template-operations): This article demonstrates template operations for writing re-usable code in EGL (the model-to-text language of Epsilon).
- [EGL as a server-side language](egl-server-side): This article demonstrates using EGL (the model-to-text language of Epsilon) in Tomcat to produce HTML pages from EMF models on the fly.
- [Co-ordinating EGL templates with EGX](egx-parameters): This article demonstrates how to parameterize EGL templates and execute them multiple times to produce multiple files.
- [Re-using EGL templates](egl-invoke-egl): This article demonstrates how to invoke other EGL templates and direct their output to calling EGL template.

## Epsilon and EMF models

- [Emfatic language reference](https://www.eclipse.org/emfatic/): Emfatic is a language designed to represent EMF Ecore models in a textual form.  This article details the syntax of Emfatic and the mapping between Emfatic declarations and the corresponding Ecore constructs.
- [Reflective EMF tutorial](reflective-emf-tutorial): This tutorial demonstrates how to create an EMF Ecore metamodel and a sample model that conforms to it reflectively (i.e. without generating any code).
- [Epsilon and EMF](epsilon-emf): Frequently-asked questions related to querying and modifying EMF-based models with Epsilon.
- [The EMF EPackage Registry View](epackage-registry-view): This article demonstrates the EPackage Registry view which allows developers to inspect the contents of the registered EMF EPackages.
- [Exeed annotation reference](../exeed): This article lists the annotations you can use on your metamodels to customize the look of the Exeed model editor.
- [Inspecting EMF models with Exeed](inspect-models-exeed): This article demonstrates how you can use Exeed to inspect the structure of your EMF models.
- [Working with custom EMF resources](in-memory-emf-model): This article demonstrates how you can work with custom EMF resources in Epsilon.
- [Parsing XML documents as EMF models with Flexmi](../flexmi): This article demonstrates how you can use Flexmi to parse XML documents in a fuzzy manner as instances of Ecore metamodels.
- [Modularity Mechanisms in Flexmi](modular-flexmi): This article demonstrates how you can break down Flexmi models over multiple files and use templates to capture complex reusable structures in your models.

## Epsilon and Simulink models

- [Scripting Simulink models using Epsilon](simulink): In this article we demonstrate how you can query and modify Simulink models in Epsilon.
- [Managing Matlab Simulink/Stateflow models from Epsilon](simulink-stateflow): This tutorial shows you how to manipulate Simulink and Stateflow blocks from within Epsilon.

## Epsilon and other types of models

- [Scripting XML documents using Epsilon](plain-xml): In this article we demonstrate how you can create, query and modify plain standalone XML documents (i.e. no XSD/DTD needed)  in Epsilon programs using the  PlainXML driver.
- [Scripting CSV files using Epsilon](csv-emc): This article demonstrates how you can query CSV files with Epsilon programs using the CSV driver.
- [Scripting BibTeX files using Epsilon](bibtex): In this article we demonstrate how you can query a list of references stored in BibTeX files with Epsilon programs using the BibTeX driver.

## EuGENia

### Fundamentals

- [EuGENia GMF Tutorial](../eugenia): This article provides a guide to using EuGENia for developing GMF editors, as well as its complete list of features and supported annotations.
- [Customizing an editor generated with EuGENia](eugenia-polishing): This article demonstrates EuGENia's polishing transformations, which can be used to customize GMF editors in a systematic and reproducible way.
- [Applying source code patches to an editor generated with EuGENia](eugenia-patching): This article demonstrates EuGENia's patch generation and application functionality, which can be used to customize the Java source code generated by GMF in a systematic and reproducible way.
- [EuGENia: Automated Invocation with Ant](eugenia-ant): This article demonstrates how to run Eugenia from Ant, and some of the additional features offered through the Ant task.

### Recipes

- [EuGENia: Nodes with images instead of shapes](eugenia-nodes-with-images): This article shows how to create nodes in your GMF editor that are represented with images (png, jpg etc.) instead of the standard GMF shapes (rectangle, ellipse etc.)
- [EuGENia: Nodes with images defined at run-time](eugenia-nodes-with-runtime-images): This article addresses the case where the end-user needs to set an image for each node at runtime.
- [EuGENia: Nodes with a centred layout](eugenia-nodes-with-centred-layout): This article shows how to create nodes in your GMF editor whose contents are centred both vertically and horizontally.
- [EuGENia: Phantom nodes in GMF editors](eugenia-phantom-nodes): This article demonstrates how to define GMF phantom nodes in EuGENia.


## Picto

- [Visualising Models with Picto](../picto): Picto is an Eclipse view for visualising models via model-to-text transformation to SVG/HTML. The article introduces Picto and shows the tool in action.

## Human-Usable Textual Notation

- [Using the Human-Usable Textual Notation (HUTN) in Epsilon](hutn-basic): This article demonstrates how to specify models using a textual notation.
- [Customising Epsilon HUTN documents with configuration](hutn-configuration): This article demonstrates how to customise Epsilon HUTN documents with a configuration model.
- [Compliance of Epsilon HUTN to the OMG HUTN Standard](hutn-compliance): This article summarises the similarities and differences between the Epsilon HUTN implementation and the OMG HUTN standard.

## Concordance

- [Using Concordance to manage and reconcile cross-model references](concordance-cross-references): This article demonstrates how to use Concordance to automatically maintain the integrity of cross-model references.

## Teaching Material

- [MDE Exercises](exercises): This article provides a number of exercises which enable you to test your knowledge on MDE, EMF and Epsilon.

## Technical Support

- [Constructing a helpful minimal example](minimal-examples): From time to time, you may run into a problem when using Epsilon or find a bug. This article describes how to construct a minimal example that we can use to reproduce the problem on our machine.

## Extending Epsilon

- [Developing a new Epsilon Language](developing-a-new-language): This article demonstrates how to develop a new language on top of Epsilon.
- [Developing a new EMC Driver](developing-a-new-emc-driver): This article demonstrates how to develop a new driver for Epsilon's Model Connectivity layer (EMC).

## Installation

- [Working with Epsilon 1.x](epsilon-1.x): This article contains instructions for installing legacy versions of Epsilon prior to 2.0.

## Epsilon Developers

- [Running Epsilon from source](running-from-source): This article demonstrates how to run Epsilon from source  in your machine.
- [Call for User Stories](call-for-user-stories): This is a kind request to all Epsilon Users.
- [Manage the Epsilon website locally](manage-the-epsilon-website-locally): This article demonstrates how to manage the Epsilon website in your machine.
- [Epsilon development principles](development-principles): These are the guiding principles used by the developers of Epsilon.
- [Resolved bugs](resolved-bugs): This article discusses the different types of resolved bugs in Epsilon.
- [Managing the target platform](target-platform): This article outlines how to manage the target platform that Epsilon is built against.
- [Adding new plugins](adding-new-plugins): This article outlines the process of adding new plugins to the main Epsilon repository.
- [Preparing the MacOSX distribution](preparing-the-macosx-distribution): This article outlines the process of signing the Eclipse MacOSX distribution.
- [Forking Epsilon as a non-committer with Git](git-fork-epsilon): This article shows how to branch Epsilon into a different remote repository whilst still getting updates from the main project.
- [Publishing to the EpsilonLabs Updatesite](labsupdatesite): This article outlines the process for publishing a plugin (EMC driver/language/tool) from the EpsilonLabs Github organisation to the EpsilonLabs updatesite.
- [Releasing a new version to Maven Central](maven-release): This article outlines how to release a new version of the Epsilon standalone artifacts to Maven Central.

