# Flexmi

Flexmi (pronounced *flex-em-eye*) is a **reflective textual syntax for EMF models**. Flexmi supports an XML-based and a [YAML-based](#yaml-flavour) flavour and offers features such as fuzzy matching of tags and attributes against Ecore class/feature names, support for embedding EOL expressions in models and for defining and instantiating model element templates. For example, the following XML document (`acme.flexmi`):

```xml
<?nsuri psl?>
<project title="ACME">
  <person name="Alice"/>
  <person name="Bob"/>
  <task title="Analysis" start="1" dur="3">
    <effort person="Alice"/>
  </task>
  <task title="Design" start="4" dur="6">
    <effort person="Bob"/>
  </task>
  <task title="Implementation" start="7" dur="3">
    <effort person="Bob" perc="50"/>
    <effort person="Alice" perc="50"/>
  </task>
</project>
```

is a valid instance of the Ecore metamodel (in Emfatic) below (`psl` stands for Project Scheduling Language):

```emf
@namespace(uri="psl", prefix="")
package psl;

class Project {
  attr String name;
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
  ref Skill[*] skills;
}

class Effort {
  ref Person person;
  attr int percentage = 100;
}

class Skill {
  attr String name;
}
```

## Getting started

-   Create a text file named `psl.emf` in your workspace and place the Emfatic content above in it.
-   Convert it into Ecore and register the produced Ecore metamodel
    (`psl.ecore`) as shown
    [here](../articles/reflective-emf-tutorial).
-   Create a new text file named `acme.flexmi` and place the XML content above in it.
-   The result should look like the screenshot below.

![](screenshot.png)

## Fuzzy Parsing

The Flexmi parser uses fuzzy matching to map the tags in the XML document to instances of EClasses in the target metamodel. In Flexmi, attributes and non-containment references are captured using XML attributes. Multiple values can be captured in a single XML attribute as comma-delimited strings as shown below.

```xml
<?nsuri psl?>
<_>
  <person name="Alice" skills="Java, HTML"/>
  <skill name="Java"/>
  <skill name="HTML"/>
</_>
```

Containment references are captured using XML element containment. If an XML element has attributes, the Flexmi parser will compare its tag against EClass/EReference names expected in the context and choose the best match. For example, when it encounters the `<person>` element below, knowing that it is already in the context of `Project` it will match the name `person` against the names of the containment references of `Project` (`tasks`, `people`) and (all the sub-types of) their types (`Person`, `Task`) and will decide that the best match for it is `Person`.

```xml
<?nsuri psl?>
<project title="ACME">
  <person name="Alice"/>
  ...
</project>
```

As such, it will create an instance of `Person` and will then try to find a suitable containment reference for it (`people`). If there were multiple containment references of type `Person` in class `Project`, we could help the Flexmi parser by either using the name of the target reference instead or `person`, or by using an empty container element as follows.

```xml
<?nsuri psl?>
<project title="ACME">
  <people>
    <person name="Alice"/>
  </people>
</project>
```

### Non-Containment Reference Resolution

To resolve non-containment references, Flexmi needs target elements to have some kind of ID. If a class has an EAttribute marked as `id`, Flexmi will use that to identify its instances, otherwise, it will use the value of the `name` attribute, if present. Fully-qualified ID paths, separated by `.` are also supported. Since version 2.9, [partially-qualified ID paths](https://github.com/eclipse-epsilon/epsilon/issues/221) are also supported.

### Long Attribute Values

XML elements can also be used instead of XML attributes to capture long/multiline EAttributes. For example, we can use a `<description>` nested element instead of an attribute as below.

```xml
<?nsuri psl?>
<project title="ACME">
  <description>
    Lorem ipsum dolor sit amet,
    consectetur adipiscing elit,
    sed do eiusmod tempor incididunt
    ut labore et dolore magna aliqua.
  </description>
</project>
```

To keep very long values out of Flexmi models altogether, appending an `_` to the name of an attribute will instruct the Flexmi parser to look for a file with that name and parse its content as the value of the attribute as shown below.

```xml
<?nsuri psl?>
<project title="ACME" description_="readme.txt">
</project>
```

### Attribute Assignment

The Flexmi parser uses an implementation of the [Hungarian algorithm](https://en.wikipedia.org/wiki/Hungarian_algorithm) to decide the best match of XML attribute names to EAttribute and non-containment EReference names.
Containment EReference names are ignored during matching.

## Executable Attributes

Prepending `:` to the name of an attribute instructs the Flexmi parser to interpret its value as an executable [EOL](../eol) expression instead of a literal value. Also, Flexmi supports attaching a `:var` or a `:global` attribute to XML elements, to declare local/global variables that can be used in EOL expressions. The scope of local variables includes siblings of the element, and their descendants, while global variables can be accessed from anywhere in the model.

For example, in the Flexmi model below, the `Design` task is assigned to a local variable named `design`, which is then used to compute the value of the `start` time of the implementation task.

```xml
<?nsuri psl?>
<project title="ACME">
  <person name="Alice"/>
  <person name="Bob"/>
  <task title="Analysis" start="1" dur="3">
    <effort person="Alice"/>
  </task>
  <task title="Design" start="4" dur="6" :var="design">
    <effort person="Bob"/>
  </task>
  <task title="Implementation" :start="design.start + design.duration + 1" dur="3">
    <effort person="Bob" perc="50"/>
    <effort person="Alice" perc="50"/>
  </task>
</project>
```

You can also use `:var`/`:global` and EOL attributes to refer to model elements without using names/ids as identifiers. For example, in the version, below, `Alice` is attached to the local variable name `alice`, which is then used in the `:person` reference of the second effort of the `Implementation` task.

```xml
<?nsuri psl?>
<project title="ACME">
  <person name="Alice" :var="alice"/>
  <person name="Bob"/>
  <task title="Analysis" start="1" dur="3">
    <effort person="Alice"/>
  </task>
  <task title="Design" start="4" dur="6" :var="design">
    <effort person="Bob"/>
  </task>
  <task title="Implementation" :start="design.start+design.duration+1" dur="3">
    <effort person="Bob" perc="50"/>
    <effort :person="alice" perc="50"/>
  </task>
</project>
```

## Object Initialization

An XML element representing an object can have an `:init` child with complex EOL-based initialization logic.
For example, this would initialize the "Analysis" task to have an Effort child pointing to the first Person in the model:

```xml
<?nsuri psl?>
<project title="ACME">
  <person name="Alice"/>
  <person name="Bob"/>
  <task title="Analysis" start="1" dur="3">
    <:init>
      var effort = new Effort();
      self.effort.add(effort);
      effort.person = Person.all.first();
    </:init>
  </task>
</project>
```

!!! warning "ITool instances not available"

    Since Flexmi is designed to work from outside Eclipse, [Eclipse extension point-based tools](../articles/call-java-from-epsilon/index.md) are not available from Flexmi EOL code.

## Including and Importing other Flexmi Models

Flexmi supports the `<?import other.flexmi?>` and `<?include other.flexmi?>` processing instructions. `import` creates a new resource for `other.flexmi` while `include` parses the contents of `other.flexmi` as if they were embedded in the Flexmi model that contains the `include` processing instruction.

## Instantiating Types from Multiple Ecore Metamodels

Multiple `<?nsuri metamodeluri?>` processing instructions can be used in the preamble of a Flexmi model, allowing it to instantiate multiple Ecore metamodels. However, in case of name clashes between them, there's no good way for disambiguation.

## Models with Multiple Root Elements

If you need to have multiple top-level elements in your model, you can add them under a `<_>` root element, which has no other semantics.

## Reusable Templates

Flexmi supports defining reusable templates through the reserved `<:template>` XML tag. For example, when designing one-person projects where all tasks take place in sequence, we can omit all the repetitive `<effort>` elements that refer to the same person, and we can automate the calculation of the start date of each task using a `simpletask` template, as shown below.

```xml
<?nsuri psl?>
<_>
  <project title="ACME">
    <person name="Alice"/>
    <simpletask title="Analysis" dur="3"/>
    <simpletask title="Design" dur="3"/>
    <simpletask title="Implementation" dur="6"/>
  </project>

  <:template name="simpletask">
    <content>
      <task :start="Task.all.indexOf(self).asVar('index') == 0 ? 1 : Task.all.get(index-1).asVar('previous').start + previous.duration">
        <effort :person="Person.all.first()"/>
      </task>
    </content>
  </:template>
</_>
```

### Parameters

Flexmi templates also support parameters, which can be used to configure the content they produce when they are invoked. An example is shown below:

```xml
<?nsuri psl?>
<_>
  <project title="ACME">
    <person name="Alice"/>
    <design dur="3" person="Alice"/>
  </project>

  <:template name="design">
    <parameter name="person"/>
    <content>
      <task name="Design">
        <effort person="${person}"/>
      </task>
    </content>
  </:template>
</_>
```

### Dynamic Templates and Slots

To further customise the content that Flexmi templates produce, one can use an [EGL](../egl) template that produces XML as the value of the `<content>` element of the template, by setting it's language to EGL as shown below. Also Flexmi supports a `<:slot>` element in the content of templates, which specifies where any nested elements of the caller should be placed in the produced XML as shown below.

```xml
<?nsuri psl?>
<_>
  <project title="ACME">
    <person name="Alice"/>
    <longtask title="Implementation" years="2">
      <effort person="Alice"/>
    </longtask>
  </project>

  <:template name="longtask">
    <parameter name="years"/>
    <content language="EGL">
      <![CDATA[
      <task duration="[%=years.asInteger()*12%]">
        <:slot/>
      </task>
      ]]>
    </content>
  </:template>
</_>
```

### Reusing Templates in Different Flexmi Models

Templates can be stored in separate Flexmi files and be imported from different models using Flexmi's `<?include ?>` processing instruction.

## Use in Epsilon and Java

Flexmi offers and registers an implementation of [EMF's Resource interface](http://download.eclipse.org/modeling/emf/emf/javadoc/2.4.3/org/eclipse/emf/ecore/resource/Resource.html) (`FlexmiResource`), and can be used like any other EMF resource implementation. For example, you can add `.flexmi` models as regular EMF models to the run configuration of your Epsilon program. An example of using Flexmi from Java follows.

```java
ResourceSet resourceSet = new ResourceSetImpl();
resourceSet.getResourceFactoryRegistry().
  getExtensionToFactoryMap().put("flexmi",
    new FlexmiResourceFactory());
Resource resource = resourceSet.createResource
  (URI.createFileURI("/../acme.flexmi"));
resource.load(null);
```

## Converting to XMI

You can convert a Flexmi model to standard XMI (with no templates, executable attributes etc.) by right-clicking on it in the Project Explorer view and selecting `Generate XMI`.

Converting an XMI model to Flexmi on the other hand is not supported as there's no unique mapping in this direction.

## YAML Flavour

Since Epsilon 2.3.0, Flexmi also supports a YAML flavour, which was revamped in 2.9.0 to improve ease of use.

Equivalent YAML representations for the XML-based model at the top of this page are shown below, using the YAML flavour available from 2.9.0 onwards.

!!! info
    The YAML flavour of Flexmi supports all the features of the XML flavour, including [plain](#reusable-templates) and [dynamic templates](#dynamic-templates-and-slots), and [executable attributes](#executable-attributes). YAML-specific features like [anchors and aliases](https://spec.yaml.io/main/spec/1.2.2/#alias-nodes) are also supported.

### Block style (indentation-based)

```yaml
?nsuri: psl
project:
  name: ACME
  person:
    - name: Alice
    - name: Bob
  task:
    - title: Analysis
      start: 1
      dur: 3
      effort:
        person: Alice
    - title: Design
      start: 4
      dur: 6
      effort:
        person: Bob
    - title: Implementation
      start: 7
      dur: 3
      effort:
        - person: Bob
          perc: 50
        - person: Alice
          perc: 50
```

### Flow style (curly braces and brackets)

```yaml
?nsuri: psl
project: {
  name: ACME,
  person: [{name: Alice}, {name: Bob}],
  task: [{
    title: Analysis,
    start: 1,
    dur: 3,
    effort: {person: Alice}
  },
  {
    title: Design,
    start: 4,
    dur: 6,
    effort: {person: Bob}
  },
  {
    title: Implementation,
    start: 7,
    dur: 3,
    effort: [{person: Bob, perc: 50},
             {person: Alice, perc: 50}]
  }]
}
```

For multi-valued attributes and non-containment references, lists of scalars can be used as shown below.

```yaml
?nsuri: psl
person:
  - name: Alice 
    skills: Java
  - name: Bob
    skills: # List of scalars
      - Java
      - HTML
skill:
 - name: Java
 - name: HTML
```

!!! tip "Tabs vs. Spaces"
    If your YAML-flavoured Flexmi model doesn't parse (i.e. the outline view of the Flexmi editor is empty), you may want to check that you have not accidentally used tabs instead of spaces for indentation.

The Flexmi parser auto-detects whether a file is XML-based or YAML-based and parses it accordingly. As such, you should be able to edit YAML-flavoured `*.flexmi` files in the Flexmi editor. Additional examples of YAML-flavoured Flexmi models are available in this [test project](https://github.com/eclipse-epsilon/epsilon/tree/main/tests/org.eclipse.epsilon.flexmi.test/src/org/eclipse/epsilon/flexmi/test/models) (look for `*.yaml` files).

### Dynamic Templates in YAML

The YAML flavour requires a `script` attribute in the `content` of dynamic templates, that holds the EGL script used to dynamically produce the YAML content. The YAML equivalent of the XML-based dynamic template [shown above](#dynamic-templates-and-slots) is as follows.

```yaml
?nsuri: psl
project:
  title: ACME
  person:
    name: Alice
  longtask:
    title: Implementation
    years: 2
    effort:
      person: Alice
:template:
  name: longtask
  parameter:
    name: years
  content:
    language: EGL
    script: |- # Multi-line EGL script
       task:
         duration: [%=years.asInteger()*12%]
         :slot: {}
```

### Representing heterogeneous lists

There is a specific scenario that requires special attention in the YAML flavour.
Suppose that we wanted to rewrite this Flexmi XML document using the YAML flavour, keeping exactly this order among the `EStructuralFeature`s of the `EClass` (`r1`, then `a1`, then `r2`):

```xml
<?xml version="1.0"?>
<?nsuri http://www.eclipse.org/emf/2002/Ecore?>
<class name="c1">
  <eref name="r1" />
  <eattr name="a1" />
  <eref name="r2" />
</class>
```

Unfortunately, YAML does not allow us to repeat keys, so this document would not work as intended - we'd only see `r2`, and not `r1`:

```yaml
$nsuri: http://www.eclipse.org/emf/2002/Ecore
class:
  name: c1
  eref: {name: r1} # <-- would be ignored!
  eattr: {name: a1}
  eref: {name: r2}
```

Instead, what we'd need to do is to introduce a key encompassing the heterogeneous list of `EReference`s and `EAttribute`s, and use `$type` to override the XML tag that would be produced for each of its elements:

```yaml
$nsuri: http://www.eclipse.org/emf/2002/Ecore
class:
  name: c1
  features:
    - {$type: eref, name: r1}
    - {$type: eattr, name: a1}
    - {$type: eref, name: r2}
```

To save some space, we could use `eref` instead of `features`, and avoid using `$type` for the `eref`s:

```yaml
$nsuri: http://www.eclipse.org/emf/2002/Ecore
class:
  name: c1
  eref:
    - {name: r1}
    - {$type: eattr, name: a1}
    - {name: r2}
```

Note that if we do not care about preserving the exact order as in the XML document above, we could have just written:

```yaml
$nsuri: http://www.eclipse.org/emf/2002/Ecore
class:
  name: c1
  eref:
    - name: r1
    - name: r2
  eattr:
    - name: a1
```


## Philosophy

Flexmi was originally developed as a quick and dirty way to type in EMF models without having to define an Xtext grammar or adhere to the rigid naming rules of XMI or HUTN. The name is a combination of the word "flexible" and the "XMI" acronym.

## Limitations

- Flexmi resources can't be saved programmatically (i.e. trying to call `resource.save(...)` will do nothing).
- There is no code completion in the Flexmi editor at the moment.

## Resources

- More examples of using Flexmi can be found in projects containing `flexmi` in their name, under the [examples folder](https://github.com/eclipse-epsilon/epsilon/tree/main/examples) of Epsilon's Git repository.
- [This article](../articles/running-epsilon-ant-tasks-from-command-line/#flexmi-and-emfatic) shows how to use Flexmi models in ANT/Gradle/Maven builds
- Flexmi and relevant underpinning research is further described in the following papers:
    - [Towards Flexible Parsing of StructuredTextual Model Representations](http://ceur-ws.org/Vol-1694/FlexMDE2016_paper_3.pdf)
    - [Towards a Modular and Flexible Human-UsableTextual Syntax for EMF Models](http://ceur-ws.org/Vol-2245/flexmde_paper_3.pdf)
    - [Type Inference in Flexible Model-Driven Engineering using Classification Algorithms](https://link.springer.com/article/10.1007/s10270-018-0658-5)
