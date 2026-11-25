# Eugenia: Automated Invocation with Ant
Eugenia can be called from Ant, using the `<epsilon.eugenia>` Ant task. This way, the creation of the GMF editors can be easily automated by using a standard Ant Builder. Additionally, the Ant task has several features which are not currently available through the regular graphical user interface.

In this article, we will show how to invoke the Eugenia Ant task and offer some recommendations on how to adopt it.

## Basic usage
The Eugenia Ant task only requires specifying the source Emfatic description or Ecore model through the `src` attribute:

```xml
<!-- Generate myfile.ecore from myfile.emf and then proceed -->
<epsilon.eugenia src="myfile.emf"/>

<!-- Start directly from the Ecore model -->
<epsilon.eugenia src="myfile.ecore"/>
```

!!! warning Important

	The Eugenia Ant task requires that the Ant buildfile is run from the same JRE as the workspace. Please check the [Workflow](../../workflow.md) documentation for instructions on how to do it.

## Limiting the steps to be run
Normally, Eugenia runs all these steps:

- Clean the models from the previous run (the `clean` step)
- If `src` is an Emfatic source file (with the `.emf` extension), generate the Ecore model from it (`ecore`)
- Generate the EMF GenModel from the Ecore model and polish it with `Ecore2GenModel.eol` if available (`genmodel`)
- Generate the GmfGraph, GmfTool and GmfMap models and polish them with `Ecore2GMF.eol` if available (`gmf`)
- Generate the GmfGen model and polish it with `FixGMFGen.eol` if available (`gmfgen`)
- Generate the EMF code from the EMF GenModel model (`emfcode`)
- Generate the GMF code from the GMFGen model (`gmfcode`)
Optionally, the Ant task can run only some of these steps. The `firstStep` attribute can be used to specify the first step to be run, and the `lastStep` can be used to specify the last step to be run. For example:

```xml
<!-- Skips the clean, ecore and genmodel steps -->
<epsilon.eugenia src="myfile.ecore" firstStep="gmf"/>

<!-- Does not run the emfcode and gmfcode steps -->
<epsilon.eugenia src="myfile.emf" lastStep="gmfgen"/>

<!-- Only runs the gmf and gmfgen steps -->
<epsilon.eugenia src="myfile.ecore" firstStep="gmf" lastStep="gmfgen"/>
```

## Using extra models for polishing
Additional models to be used in a polishing transformation can be specified through the `<model>` nested element. `<model>` has three attributes:

* `ref` (mandatory) is the name with which the model was loaded into the model repository of the Ant project, using the Epsilon model loading Ant tasks.
* `as` (optional) is the name to be used for the model inside the polishing transformation.
* `step` (mandatory) is the identifier of the Eugenia step to which we will add the model reference.
As an example, consider the following fragment:

```xml
<epsilon.emf.loadModel name="Labels"
  modelfile="my.model" metamodeluri="mymetamodelURI"
  read="true" store="false"/>

<epsilon.eugenia src="myfile.emf">
  <model ref="Labels" step="gmf"/>
</epsilon.eugenia>
```

This example will make the Labels model available to the `Ecore2GMF.eol` polishing transformation, which is part of the `gmf` step.
