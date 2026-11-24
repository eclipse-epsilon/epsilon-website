# Managing Profiled UML Models in Epsilon

This article shows how to create and query profiled [Eclipse UML](https://wiki.eclipse.org/MDT-UML2) models using Epsilon's core language ([EOL](../../eol.md)). For our example we will use [a profile](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.eol.uml.profiled/activityfunctions.uml) called `ActivityFunctions` which contains a single `Function` stereotype that applies to UML activities, and has a single `body` String property.

## Creating a Profiled UML Model

In the run configuration of our EOL program we need to add two models of type UML

- `UML`: The profiled model we wish to create. This model should not be read on load but should be stored on disposal (i.e. when the EOL program finishes).
- `ActivityFunctionsProfile`: The model containing the `ActivityFunctions` profile that we wish to apply to the `UML` model. This model should be read on load but not stored on disposal (since we don't really want to make any changes to it).

The EOL program that creates and populates our `UML` model looks as follows.

```eol
// Get hold of the ActivityFunctions profile
// that contains the Function stereotype
var profile = ActivityFunctionsProfile!Profile.all.first();

// Get hold of the Function stereotype
var functionStereotype = profile.getPackagedElement("Function");

// Create a new plain UML Model element
var newModel : new UML!Model(name="NewModel");
// Apply the ActivityFunctions profile to it
newModel.applyProfile(profile);

// Create a new plain UML Activity element
var newActivity : new UML!Activity(name="NewActivity");
// ... add it as a child of the Model created above
newModel.packagedElement.add(newActivity);

// ... and apply the Function stereotype to it
var newFunction = newActivity.applyStereotype(functionStereotype);
// Set the value of the body property of the Function stereotype
newFunction.body = "return 42;";
```

At this point, if we try to query `Function.all`, the call will fail as the `UML` model is unaware of the `Function` type. To remedy this, we need to get hold of the `EPackage` representation of the `ActivityProfile` and add it to the package registry of the `UML` model as follows.

```eol
// Get hold of the EPackage representation of the ActivityProfile
var profileEPackage = newModel.profileApplications.first().appliedDefinition;
// ... and add it to the package registry of our UML model
UML.resource.resourceSet.packageRegistry.
	put(profileEPackage.nsURI, profileEPackage);
```

Once we have done this, we can query use all the stereotypes in the profile (i.e. `Function` in this case) as regular types, as shown below.

```eol
// Gets hold of the Function stereotype
// application we created above
newFunction = UML!Function.all.first();
newFunction.body.println();

// The function and its underlying activity are still
// two separate elements in the model, linked via
// the function's base_Activity reference
newFunction.base_Activity.name.println();
```

## Querying a Profiled UML Model

Querying a profiled UML model (such as the one we created using the program above) is much simpler as the `EPackage` representations of its applied profiles are automatically put in the package registry of the model during loading. As such we, can query the model as follows.

```eol
var func = Function.all.first();
func.body.println();
var activity = func.base_Activity;
activity.name.println();
```

## Plugin-Based Profiles

In our example, the profile we wish to apply to our model is located in a file that resides in the same workspace as our `UML` model. If we need to use a profile contributed by a plugin instead (e.g. the built-in UML Ecore profile), this can be achieved as follows.

```eol
var umlTool : new Native("org.eclipse.epsilon.emc.uml.dt.UMLTool");
var ecoreProfile = umlTool.getProfile
	("http://www.eclipse.org/uml2/schemas/Ecore/5");
// or 
// var ecoreProfile = umlTool.getProfileFromPathmapUri
//	("pathmap://UML_PROFILES/Ecore.profile.uml").println();

```

## Profiled UML Models in Rule-Based Epsilon Languages

In rule-based languages such as ETL and EVL, any required profiles must be applied in a `pre` block, before any of the rules (e.g. transformation rules, validation constraints) that refer to types in the profile are executed.

## Resources

The complete source code for this example is available in [Epsilon's Git repository](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.eol.uml.profiled).