# EVL-EMF Validation Integration

The Eclipse Modeling Framework (EMF) provides an extensible model validation service via the [EValidator](https://download.eclipse.org/modeling/emf/emf/javadoc/2.4.3/org/eclipse/emf/ecore/EValidator.html) API. The API allows contributing additional validators for Ecore metamodels via the `EValidator.Registry` class. In this way, you can provide additional validation constraints for metamodels that will be invoked when models conforming to these metamodels are validated by EMF (e.g. through the `Model` --> `Right-click` --> `Validate` menu in EMF's built-in reflective).

## The EvlValidator Class

Epsilon provides an implementation of EMF's `EValidator` interface ([`EvlValidator`](https://archive.eclipse.org/epsilon/2.2/javadoc/org/eclipse/epsilon/evl/emf/validation/EvlValidator.html)) that can execute EVL constraints against EMF models.

## Registering EVL Constraints

There are two ways to register your EVL constraints for an Ecore metamodel (`EPackage`): programmatically or via an extension point.

### Programmatically

For this you need to create a new instance of an `EvlValidator` and then add it to the `EValidatorRegistry`. Note that if there are existing validators registered for the metamodel, you should not remove/overwrite them; instead you should combine them in a `CompositeEValidator`.

The following snippet outlines the general idea (you need to make your own provisions if you need to validate multiple `EPackages` with the same validator (e.g. use the `EvlValidator#addAdditionalPackage` method)).

```java
// Assuming you have generated the metamodel code
EPackage ePackage = YourPackage.eINSTANCE;

// Pass a model name if your script uses it
// Pass a valid bundle ID as it used for reporting (if not in a plugin use your project name or similar)
EvlValidator evlValidator = new EvlValidator(
    evlScriptURI, modelName, ePackage.nsUri(), bundleId);

EValidator existingValidator = EValidator.Registry.INSTANCE.getEValidator(ePackage);
if (existingValidator instanceof CompositeEValidator) {
    ((CompositeEValidator) existingValidator).getDelegates().add(evlValidator);
} else {
    if (existingValidator == null) {
        existingValidator = EObjectValidator.INSTANCE;
    }
    CompositeEValidator newValidator = new CompositeEValidator();
    newValidator.getDelegates().add(existingValidator);
    newValidator.getDelegates().add(evlValidator);
    EValidator.Registry.INSTANCE.put(ePackage, newValidator);
}
```

### Via the Extension Point

Epsilon provides the `org.eclipse.epsilon.evl.emf.validation` extension point for registering EVL constraints against `EPackages` in Eclipse. The extension point will handle the `EvlValidator` instantiation and registration for you.

```xml
<plugin>
   ...
   <extension
         point="org.eclipse.epsilon.evl.emf.validation">
      <constraintsBinding
            compose="true"
            constraints="src/test.evl"
            namespaceURI="http://your.package.uri"
            validator="my.project.evl.EvlExtendedValidator">
            <additionalNamespaceURI
               namespaceURI="http://some.other.pacakge.uri">
         </additionalNamespaceURI>
      </constraintsBinding>
   </extension>
</plugin>
```

We recommend setting the `compose` attribute to `true`, else you will overwrite existing validators. You can also specify additional metamodels to be accessed by this validator using the `additionalNamespaceURI` entries. Note that you can also provide your own validator implementation. If omitted, the default `EvlValidator` will be used (should be sufficient for most cases).

In order to display quick fixes, you will also need to make sure that the appropriate marker resolution generator extension has been registered against our `EvlMarkerResolutionGenerator`.
For example, for the markers added by the EMF Validation framework and by the EMF [EcoreTools](https://eclipse.dev/ecoretools/).

```xml
<plugin>
   <extension
         point="org.eclipse.ui.ide.markerResolution">
      <markerResolutionGenerator
            class="org.eclipse.epsilon.evl.emf.validation.EvlMarkerResolutionGenerator"
            markerType="org.eclipse.emf.ecore.diagnostic">
      </markerResolutionGenerator>
      <markerResolutionGenerator
            class="org.eclipse.epsilon.evl.emf.validation.EvlMarkerResolutionGenerator"
            markerType="org.eclipse.emf.ecoretools.diagram.diagnostic">
      </markerResolutionGenerator>
   </extension>  
</plugin>
```

There should be exactly one such extension among the active plugins for each `markerType`: otherwise, multiple copies of the same fixes would be shown to the user.

## Runtime Adjustments

!!! note
    The following adjustments are only possible if you control invocation of the validation, i.e. you are calling it programatically and not via the EMF/Eclipse right-click menu.

There are three important runtime aspects to be taken into consideration when using the EVL-EMF integration.

### Error Dialogs

Within Eclipse, Epsilon reports errors via Eclipse's JFace `MessageDialog` API. This is appropriate when checking constraints via the `Model` --> `Right-click` --> `Validate` menu in EMF's built-in tree-based editor, but can be cumbersome when the validation is integrated into other parts of your UI. To disable error reporting via message dialogs you can use use the [EvlValidator#setShowErrorDialog](https://archive.eclipse.org/epsilon/2.2/javadoc/org/eclipse/epsilon/evl/emf/validation/EvlValidator.html#setShowErrorDialog(boolean)) function. You can either call this on you instance or override the `isShowErrorDialog()` if you extend the `EvlValidator` class.

### Logging

Epsilon logs errors in the console. As with the dialogs, this can be enabled/disabled. For this, you can use use the [EvlValidator#setLogErrors](https://archive.eclipse.org/epsilon/2.2/javadoc/org/eclipse/epsilon/evl/emf/validation/EvlValidator.html#setLogErrors(boolean)) method. Similarly, the `isLogErrors()` can be overridden.

!!! tip
    The dialogs are part of the logging, so disabling logging will disable the dialogs too.

### Validation progress and cancellation


Within Eclipse it is important to allow uses to cancel a running validation. To do so, we need to pass an `IProgressMonitor` to the EvlValidator. For this, you need to provide your own [Diagnostician](https://download.eclipse.org/modeling/emf/emf/javadoc/2.4.3/org/eclipse/emf/ecore/util/Diagnostician.html).

```java
public class MyDiagnostician extends Diagnostician {

	public Diagnostic validate(EObject eObject, IProgressMonitor monitor) {
		BasicDiagnostic diagnostics = createDefaultDiagnostic(eObject);
		validate(eObject, diagnostics, createDefaultContext(monitor), monitor);
		return diagnostics;
	}

    // Overload the Diagnostician implementation to inject the monitor into the context
    public Map<Object, Object> createDefaultContext(IProgressMonitor monitor) {
        final Map<Object, Object> defaultContext = super.createDefaultContext();
        defaultContext.put(EvlValidator.VALIDATION_MONITOR, monitor);
        return defaultContext;
    }
}
```

And then in your code (e.g. command handler):

```java
@Override
public void run(IProgressMonitor monitor) throws CoreException {
    myDgnstc = new MyDiagnostician();
    Diagnostic dgnstc = rnblDgnstc.validate(model.getContents().get(0), monitor);
    ...
```

The extended diagnostician can also be used to configure any `EvlValidators` provided via extension points, e.g. to disable logging or dialogs. In this case we assume that all `EvlValidators` are within `CompositeEValidators` (adjust if not using them). This implementation uses a *brute force* approach; ideally you should search for a specific `EPackage` instead.

```java
public class MyDiagnostician extends Diagnostician {
	
    public MyDiagnostician() {
		super();
		for(Object validator : eValidatorRegistry.values()) {
			if (validator instanceof CompositeEValidator) {
				CompositeEValidator cmpsVal = (CompositeEValidator) validator;
				findEvlValidators(cmpsVal);
			}
		}
	}

	public Diagnostic validate(EObject eObject, IProgressMonitor monitor) {
		BasicDiagnostic diagnostics = createDefaultDiagnostic(eObject);
		validate(eObject, diagnostics, createDefaultContext(monitor), monitor);
		return diagnostics;
	}

    // Overload the Diagnostician implementation to inject the monitor into the context
    public Map<Object, Object> createDefaultContext(IProgressMonitor monitor) {
        final Map<Object, Object> defaultContext = super.createDefaultContext();
        defaultContext.put(EvlValidator.VALIDATION_MONITOR, monitor);
        return defaultContext;
    }

    /**
	 * Find all {@link EVlValidator}s and configure them.
	 * @param cmpsVal
	 * @return
	 */
	private void findEvlValidators(CompositeEValidator cmpsVal) {
		for (EValidator nstdVal : cmpsVal.getDelegates()) {
			if (nstdVal instanceof EVlValidator) {
				EVlValidator evlVal = (EVlValidator) nstdVal;
				evlVal.setShowErrorDialog(false);
                // Other settings or hook error listeners
                // evlVal.addValidationProblemListener(this);
			}
		}
	}
}
```