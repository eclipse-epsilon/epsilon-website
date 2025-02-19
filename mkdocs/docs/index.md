# Eclipse Epsilon <a href="forum"><img src="assets/images/forum-badge.svg" style="float:right;position:relative;top:8px"></a>

Epsilon is a family of scripting languages and tools for automating common model-based software engineering tasks such as [code generation](doc/egl.md), [model-to-model transformation](doc/etl.md), [model validation](doc/evl.md) and [model visualisation](doc/picto/index.md), that work out of the box with EMF (including [Xtext](https://www.eclipse.org/Xtext) and [Sirius](https://www.eclipse.org/sirius)), UML (including Cameo/MagicDraw), Simulink, XML and [other types of models](doc/emc.md).

Epsilon can be used as a [standard Java library](getting-started.md/#using-epsilon-as-a-java-library), and also provides [Apache Ant](doc/workflow.md) tasks that can be [embedded in Maven/Gradle](getting-started.md/#epsilon-in-mavengradle-builds) build files. Editing support for Epsilon programs is available in [Eclipse](download/index.md), [VS Code](doc/articles/vscode/index.md), [Intellij](https://github.com/epsilonlabs/epsilon.tmbundle?tab=readme-ov-file#importing-in-intellij), [TextMate](https://github.com/epsilonlabs/epsilon.tmbundle?tab=readme-ov-file#importing-in-textmate) and [Sublime](https://github.com/epsilonlabs/sublime).

!!! example "Online Playground"

    You can try out the examples below from your browser in the online [Epsilon Playground](playground).  No installation required!

=== "Code Generation Template (EGL)"
    ```egl
    --8<-- "docs/playground/examples/psl.egl"
    ```

=== "Validation Constraints (EVL)"

    ```evl
    --8<-- "docs/playground/examples/psl.evl"
    ```

=== "Model Transformation (ETL)"

    ```etl
    --8<-- "docs/playground/examples/psl2pdl.etl"
    ```

=== "Metamodel (Emfatic)"

    ```emf
    @namespace(uri="psl")
    package psl;

    class Project {
        attr String title;
        attr String description;
        val Task[*] tasks;
        val Person[*] people;
    }

    class Task {
        attr String title;
        attr int start;
        attr int duration;
        val Effort[*] effort;
    }

    class Person {
        attr String name;
    }

    class Effort {
        ref Person person;
        attr int percentage = 100;
    }
    ```

=== "Model (Flexmi)"

    ```xml
    --8<-- "docs/playground/examples/psl.flexmi"
    ```

=== "Running from Java"

    ```java
    --8<-- "docs/playground/templates/java/egx/src/main/java/org/eclipse/epsilon/examples/Example.java"
    ```

## Why Epsilon?

- **One syntax to rule them all:** All languages in Epsilon build on top of a [common expression language](doc/eol.md) which means that you can reuse code across your model-to-model transformations, code generators, validation constraints etc.
- **Integrated development tools:**  All languages in Epsilon are supported by editors providing syntax and error highlighting, code templates, and graphical tools for configuring, running, debugging and profiling Epsilon programs. 
- **Documentation, Documentation, Documentation:** More than [80 articles](doc/articles/index.md), [15 screencasts](doc/screencasts) and [40 examples](examples.md) are available to help you get from novice to expert.
- **Strong support for EMF:** Epsilon supports all flavours of EMF, including reflective, generated and non-XMI (textual) models such as these specified using Xtext-based DSLs.
- **No EMF? No problem:** While Epsilon provides strong support for EMF, it is not bound to EMF at all. In fact, support for EMF is implemented as a driver for the model connectivity layer of Epsilon. Other drivers provide support for XML, CSV, Excel, Simulink and you can even roll out your own driver!
- **No Eclipse? No problem:** While Epsilon provides strong support for Eclipse, we also provide [standalone JARs through Maven Central](download/index.md) that you can use to [embed Epsilon in your plain Java](doc/articles/run-epsilon-from-java.md) or Android application.
- **Mix and match:** Epsilon poses no constraints on the number/type of models you can use in the same program. For example, you can write a transformation that transforms an XML-based and an EMF-based model into a Simulink model and also modifies the source EMF model.
- **Plumbing included:** You can use the [ANT Epsilon tasks](doc/workflow.md) to compose Epsilon programs into complex workflows. Programs executed in the same workflow can share models and even pass parameters to each other.
- **Extensible:** Almost every aspect of Epsilon is extensible. You can add support for your [own type of models](doc/articles/developing-a-new-emc-driver), extend the Eclipse-based development tools, add a new method to the String type, or even implement [your own model management language](doc/articles/developing-a-new-language/index.md) on top of EOL.
- **Java is your friend:** You can call methods of Java classes from all Epsilon programs to reuse code you have already written or to perform tasks that Epsilon languages do not support natively.
- **Parallel execution:** Since 2.0, Epsilon is multi-threaded, which includes first-order operations and some of the rule-based languages, making it faster than other interpreted tools.
- **All questions answered:** The [Epsilon forum](forum) contains more than 10K posts and we're proud that no question has ever gone unanswered.<!--TODO: Check for mentions of the "forum"-->
- **We're working on it:** Epsilon has been an Eclipse project since 2006 and it's not going away any time soon.

## License

Epsilon is licensed under the [Eclipse Public License 2.0](https://www.eclipse.org/legal/epl-2.0/).

## Trademarks

Eclipse Epsilon and the Eclipse Epsilon project logo are trademarks of the Eclipse Foundation. Eclipse and the Eclipse logo are registered trademarks of the Eclipse Foundation.

Java and all Java-based trademarks are trademarks of Oracle Corporation in the United States, other countries, or both.

## Acknowledgements

We would like to thank ej-technologies for providing us with free licenses of their powerful [JProfiler Java profiler](https://www.ej-technologies.com/products/jprofiler/overview.html).