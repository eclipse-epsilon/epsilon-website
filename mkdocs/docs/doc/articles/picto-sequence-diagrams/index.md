# Drill-Down Sequence Diagrams with Picto

This article demonstrates using [Picto](../../Picto) and its [PlantUML](https://plantuml.com) integration to generate [drill-down sequence diagrams](#drill-down-sequence-diagrams) from models conforming to a minimal EMF-based sequence diagram language.

## Metamodel

Below is the metamodel of our mini sequence-diagram (`minisd`) DSL (in [Emfatic](../emfatic)). In our language, a scenario consists of a number of interactions between participants, and alternative execution paths (`Alt`).

```emf
@namespace(uri="minisd", prefix="")
package minisd;

class Scenario extends Block {}

class Participant {
	attr String name;
}

abstract class Step {}

class Block extends Step {
	attr String title;
	val Step[*] steps;
}

class Alt extends Step {
	attr String title;
	val Block[*] blocks;
}

class Interaction extends Step {
	ref Participant from;
	ref Participant to;
	attr String message;
}
```

## Customer-ATM Model
Below is a [Flexmi](../../flexmi/index.md) model that conforms to the minisd DSL and captures the interaction between a customer and an ATM.

```xml
<?nsuri minisd?>
<?render-egx minisd2plantuml.egx?>
<_>
	<participant name="Customer"/>
	<participant name="ATM"/>
	
	<scenario title="Customer-ATM">
		<int from="Customer" to="ATM" msg="Insert card"/>
		<int from="ATM" to="Customer" msg="Request PIN"/>
		<int from="Customer" to="ATM" msg="Enter PIN"/>
		<alt title="Check PIN">
			<block title="PIN valid">
				<int from="ATM" to="Customer" msg="Display options"/>
				<alt title="Options">
					<block title="Cash withdrawal">
						<int from="Customer" to="ATM" msg="Select cash withdrawal"/>
						<int from="ATM" to="Customer" msg="Ask for amount"/>
						<int from="Customer" to="ATM" msg="Enter amount"/>
						<alt title="Check funds">
							<block title="Sufficient funds">
								<int from="ATM" to="Customer" msg="Produce cash"/>
							</block>
							<block title="Insufficient funds">
								<int from="ATM" to="Customer" msg="Produce error message"/>
							</block>
						</alt>
					</block>
					<block title="Balance display">
						<int from="Customer" to="ATM" msg="Select balance display"/>
						<int from="ATM" to="Customer" msg="Display balance"/>
						<int from="ATM" to="Customer" msg="Return card"/>
					</block>
				</alt>
			</block>
			<block title="PIN invalid">
				<int from="ATM" to="Customer" msg="Try again"/>
			</block>
		</alt>
	</scenario>
</_>
```

## Visualisation Transformation

To visualise models that conform to the minisd DSL (such as the Customer-ATM model above) in Picto, we have written a model-to-text transformation in EGL, that transforms such models into a series of PlantUML sequence diagrams.

In particular, the transformation produces one sequence diagram for the entire model, and one sequence diagram for each execution path in it. The [EGX](../../egx.md) orchestration program and the [EGL](../../egl.md) template are shown below.

=== "minisd2plantuml.egx"

	```egx
	rule Scenario2PlantUml 
		transform s : Scenario {

		template : "minisd2plantuml.egl"

		parameters : Map {
			"mainBlock" = null,
			"format" = "plantuml",
			"path" = List{s.title},
			"icon" = "sequence"
		}

	}

	rule Block2PlantUml 
		transform b : Block {

		guard : b.eContainer.isTypeOf(Alt)

		template : "minisd2plantuml.egl"

		parameters : Map {
			"mainBlock" = b,
			"format" = "plantuml",
			"path" = b.closure(p|p.eContainer).invert().including(b).title,
			"icon" = "block"
		}

	}

	rule Alt2PlantUml 
		transform a : Alt {

		parameters : Map {
			"format" = "text",
			"path" =  a.closure(p|p.eContainer).invert().including(a).title,
			"icon" = "alt"
		}

	}
	```

=== "minisd2plantuml.egl"

	```egl
	@startuml
	[%
	var excludedBlocks = Sequence{};
	if (mainBlock.isDefined()) {
		var ancestors = mainBlock.closure(b|b.eContainer()).select(b|b.isTypeOf(Block)).including(mainBlock);
		for (a in ancestors) {
			if (a.eContainer().isDefined() and a.eContainer().isTypeOf(Alt)) {
				excludedBlocks.addAll(a.eContainer().blocks.excluding(a));
			}
		}
	}
	%]
	[%=Scenario.all.first().toPlantUml()%]
	@enduml

	[%
	operation Scenario toPlantUml() {
		return self.steps.collect(s|s.toPlantUml()).concat("\n");
	}

	operation Interaction toPlantUml() {
		return self.from.name + "->" + self.to.name + ": " + self.message + "\n";
	}

	operation Alt toPlantUml() {
		var plantUml = "";
		var visibleBlocks = self.blocks.excludingAll(excludedBlocks);
		for (b in visibleBlocks) {
			if (loopCount == 1) {
				plantUml += "alt";
				if (mainBlock.isDefined() and mainBlock.eContainer == self) {
					plantUml += " #azure";
				}
			}
			else plantUml += "else ";
			plantUml += " " + b.title;
			plantUml += "\n" + b.toPlantUml();
		}
		if (visibleBlocks.notEmpty()) plantUml += "\nend\n";
		return plantUml;
	}

	operation Block toPlantUml() {
		if (excludedBlocks.contains(self)) return "";
		return self.steps.collect(s|s.toPlantUml()).concat("");
	}
	%]
	```

## Drill-Down Sequence Diagrams

The result is a set of sequence diagrams that we can navigate to drill down the alternative interaction paths. Notice how selecting an alternative (e.g. `Sufficient funds`) hides all irrelevant information from the sequence diagram (e.g. `Balance display`, `PIN invalid`).

![](picto-minisd.gif)

!!! info "Source code"

    The complete source code for this example is in Epsilon's [Git repository](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.picto.plantuml.minisd).