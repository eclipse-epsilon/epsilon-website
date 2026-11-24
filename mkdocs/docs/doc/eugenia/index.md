# Graphical Model Editor development with Eugenia/GMF

!!! warning "Eugenia discontinued in Epsilon 2.5"
    Following the [archival of the GMF Tooling project](https://projects.eclipse.org/projects/modeling.gmf-tooling), Eugenia has been discontinued from version 2.5 onwards. While you can still use Eugenia with older versions of Epsilon, you may want to consider more actively-maintained tools such as [Eclipse Sirius](https://eclipse.org/sirius) if you need to develop a graphical editor, or [Picto](../picto/index.md) if you are only interested in producing read-only views from models.

Eugenia is a tool that simplifies the development of GMF-based graphical model editors by automatically generating the `.gmfgraph`, `.gmftool` and `.gmfmap` models needed by GMF editor from a single annotated Ecore metamodel. For example, from the following annotated EMF metamodel (expressed using Emfatic; an Ecore version is available [here](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.eugenia.examples.filesystem/model/filesystem.ecore)) it can generate a fully functional GMF editor, a screenshot of which is displayed below.

## The Filesystem metamodel

```emf
@namespace(uri="filesystem", prefix="filesystem")
@gmf
package filesystem;

@gmf.diagram
class Filesystem {
    val Drive[*] drives;
    val Sync[*] syncs;
}

class Drive extends Folder {

}

class Folder extends File {
    @gmf.compartment
    val File[*] contents;
}

class Shortcut extends File {
    @gmf.link(target.decoration="arrow", style="dash")
    ref File target;
}

@gmf.link(source="source", target="target", style="dot", width="2")
class Sync {
    ref File source;
    ref File target;
}

@gmf.node(label = "name")
class File {
    attr String name;
}
```

## The generated editor

![](Filesystemscreenshot2.png)

## Supported Annotations
Eugenia supports the following annotations on Ecore elements.

### gmf
Applies to the top `EPackage` only and denotes that GMF-related annotations are expected in its elements. This doesn't affect the forthcoming model transformations, only the Ecore validation process.

### gmf.diagram
Denotes the root object of the metamodel. Only one (non-abstract) `EClass` must be annotated as `gmf.diagram`. Accepts the following details:

* `diagram.extension` (optional) : the file extension for the diagram file
* `model.extension` (optional) : the file extension for the domain model. To make the generated tree-based editor work with the same extension, you need to add an `@emf.gen(fileExtensions="model-file-extension")` annotation `to the root package` of your metamodel.
* `onefile` (optional) : a value of `true` specifies that the domain model and the diagram should be stored in the same file
* `rcp` (optional) : a value of `true` specifies that the editor is intended to be part of a RCP product (printing is disabled)
* `units` (optional) : the units for the diagram (e.g. `Pixels`)

### gmf.node
Applies to an `EClass` and denotes that it should appear on the diagram as a node. Accepts the following details:

* `border.color` (optional) : an RGB color that will be set as the node's border color.
* `border.style` (optional) : the style of the node's border. Can be set to `solid` (default), `dash` or `dot`.
* `border.width` (optional) : an integer that specifies the width of the node's border.
* `color` (optional) : an RGB color that will be set as the node's background color (e.g. `255,0,0`).
* `figure` (optional) : the figure that will represent the node. Can be set to `rectangle`, `ellipse`, `rounded` (default), `svg` (see `svg.uri`), `polygon` (see `polygon.x` and `polygon.y`) or the fully qualified name of a Java class that implements Figure.
* `label`: the name(s) of the `EAttribute`(s) of the `EClass`, the value(s) of which will be displayed as the label of the node. If `label.placement` is set to `none`, this detail is not required.
* `label.color` (optional, since 1.5.0) : an RGB color that will be set as the node's foreground color. Labels will have a fixed font of this color.
* `label.icon` (optional) : if set to `true` (default) a small icon appears on the left of the label.
* `label.parser` (optional) : indicates the unqualified name of the class that will parse the text entered by the user into the label. By default, a [MessageFormat](http://download.oracle.com/javase/6/docs/api/java/text/MessageFormat.html)-based parser is generated, but it can be manually customized after generation.
* `label.edit.pattern` (optional) : like `label.pattern`, but only for editing the label.
* `label.pattern` (optional) : if more than one attributes are specified in the label, the format detail is necessary to show how their values will be rendered in the label. The format follows the Java Message Format style (e.g. `{0} : {1}`). The same pattern is used for editing and viewing the label.
* `label.view.pattern` (optional) : like `label.pattern`, but only for viewing the label.
* `label.placement` (optional) : defines the placement of the label in relation to the node. Can be set to `internal`, `external` or `none` (no label will be shown). ''(The default distance of an external label in GMF is 20pt which is a bit too far away for my taste. [Read more](../articles/eugenia-affixed-nodes/index.md) about fixing this without changing the generated code every time)''.
* `label.text` (optional) : defines the default text to be used when the `EAttribute`(s) in `label` are not set. By default, it is set to the name of the `EClass`.
* `label.readOnly` (optional) : a value of `true` denotes that the label cannot be changed in the generated diagram editor.
* `margin` (optional) : inset margin (5 units by default) for the node.
* `phantom` (optional) : defines if the node is phantom (`true`/`false`). Phantom nodes are particularly useful in order to visualize containment references using links instead of spatial containment ([read more...](../articles/eugenia-phantom-nodes/index.md)).
* `polygon.x` (when `figure` is set to `polygon`) : list of space-separated integers with the X coordinates of the polygon used as figure.
* `polygon.y` (when `figure` is set to `polygon`) : list of space-separated integers with the Y coordinates of the polygon used as figure.
* `resizable` (optional) : a value of `false` disables all the resize handles for the node
* `size` (optional) : a GMF dimension that will be used as the node's preferred size (e.g. `10,5`). Width is specified before height.
* `svg.uri` (when `figure` is set to `svg`) : URI of the `.svg` file to be used as figure for the node. For instance, `platform:/plugin/my.plugin/my.svg` will access the `my.svg` file in the `my.plugin` plugin. Note: until Kepler, using SVG figures required the GMF Tooling Experimental SDK (available from [this update site](http://download.eclipse.org/modeling/gmp/gmf-tooling/updates/releases/)). Remember to add the `.svg` file to the binary builds of your plugin.
* `tool.description` (optional) : the description of the creation tool.
* `tool.large.bundle` (optional) : the bundle of the large icon of the creation tool.
* `tool.large.path` (optional) : the path of the large icon of the creation tool.
* `tool.name` (optional) : the name of the creation tool.
* `tool.small.bundle` (optional) : the bundle of the small icon of the creation tool.
* `tool.small.path` (optional) : the path of the small icon of the creation tool.

### gmf.link
Applies to `EClass`es that should appear on the diagram as links and to non-containment `EReference`s.

### gmf.link (for EClass)
It accepts the following details:

* `color` (optional) : the RGB color of the link.
* `incoming` (optional) : Boolean value which specifies whether the generated editor should allow links to be created from target to source. Defaults to `false`.
* `label` (optional) : the names of the `EAttribute`s of the `EClass` the value of which will be displayed as the label of the link.
* `label.parser` (optional) : indicates the unqualified name of the class that will parse the text entered by the user into the label. By default, a [MessageFormat](http://download.oracle.com/javase/6/docs/api/java/text/MessageFormat.html)-based parser is generated, but it can be manually customized after generation.
<!--* `label.text` (optional) : defines the default text to be used when the `EAttribute`(s) in `label` are not set. By default, it is set to the name of the `EClass`.-->
* `source` : the source non-containment `EReference` of the link.
* `source.constraint` (optional) : OCL assertion that should be checked by the graphical editor when creating a link. For instance, `self <> oppositeEnd` would forbid users for creating a link from a node to itself (a self-loop): `self` is the source of the link, and `oppositeEnd` is the target of the link.
* `source.decoration` (optional) : the decoration of the source end of the link. Can be set to `none`, `arrow`, `rhomb`, `filledrhomb`, `square`, `filledsquare`, `closedarrow`, `filledclosedarrow`, or the fully qualified name of a Java class that implements the `org.eclipse.draw2d.RotatableDecoration` interface
* `style` (optional) : the style of the link (see `border.style` above).
* `target` : the target non-containment `EReference` of the link.
* `target.constraint` (optional) : OCL assertion that should be checked by the graphical editor when creating a link. For instance, `self <> oppositeEnd` would forbid users for creating a link from a node to itself (a self-loop): `self` is the target of the link, and `oppositeEnd` is the source of the link.
* `target.decoration` (optional) : See `source.decoration`.
* `tool.description` (optional) : the description of the creation tool.
* `tool.large.bundle` (optional) : the bundle of the large icon of the creation tool.
* `tool.large.path` (optional) : the path of the large icon of the creation tool.
* `tool.name` (optional) : the name of the creation tool.
* `tool.small.bundle` (optional) : the bundle of the small icon of the creation tool.
* `tool.small.path` (optional) : the path of the small icon of the creation tool.
* `width` (optional) : the width of the link.

For an example see the `Sync` class in the `filesystem` metamodel

### gmf.link (for non-containment EReference)
It accepts the following details:

* `color` (optional) : the RGB color of the link
* `label` (optional) : The static text that will be displayed as the label of the link. If no label is specified, the name of the reference is displayed instead.
* `label.text` (optional) : equivalent to `label` in this case.
* `source.decoration` (optional) : The decoration of the source end of the link. Can be set to `none`, `arrow`, `rhomb`, `filledrhomb`, `square`, `filledsquare`, `closedarrow`, `filledclosedarrow`, or the fully qualified name of a Java class that implements an appropriate interface
* `style` (optional) : the style of the link (see `border.style` above)
* `target.decoration` (optional) : As above.
* `tool.description` (optional) : the description of the creation tool
* `tool.large.bundle` (optional) : The bundle of the large icon of the creation tool
* `tool.large.path` (optional) : The path of the large icon of the creation tool
* `tool.name` (optional) : the name of the creation tool
* `tool.small.bundle` (optional) : The bundle of the small icon of the creation tool
* `tool.small.path` (optional) : The path of the small icon of the creation tool
* `width` (optional) : the width of the link

### gmf.compartment (for containment EReference)
Defines that the containment reference will create a compartment where model elements that conform to the type of the reference can be placed. It accepts the following details:

* `collapsible` (optional) : Set to `false` to prevent the compartment from collapsing (default is `true`)
* `layout` (optional) : The layout of the compartment. Can be set to free (default) or list

### gmf.affixed (for containment EReference)
Defines that the containment reference will create nodes which are affixed to the edges of the containing node. [See an example](../articles/eugenia-affixed-nodes/index.md).

### gmf.label (for EAttribute)
Defines additional labels for the containing `EClass`. These labels will be displayed underneath the default label for the containing `EClass`. It accepts the following details:

* `label.edit.pattern` (optional) : like `label.pattern`, but only for editing the label.
* `label.parser` (optional) : indicates the unqualified name of the class that will parse the text entered by the user into the label. By default, a [MessageFormat](http://download.oracle.com/javase/6/docs/api/java/text/MessageFormat.html)-based parser is generated, but it can be manually customized after generation.
* `label.pattern` (optional) : if more than one attributes are specified in the label, the format detail is necessary to show how their values will be rendered in the label. The format follows the Java Message Format style (e.g. `{0} : {1}`). The same pattern is used for editing and viewing the label.
* `label.readOnly` (optional) : A value of `true` denotes that the label cannot be changed in the generated diagram editor.
* `label.text` (optional) : defines the default text to be used when the attribute is not set.
* `label.view.pattern` (optional) : like `label.pattern`, but only for viewing the label.

## Installing Eugenia

Eugenia is a part of the main Epsilon distribution, available from its [update site](http://download.eclipse.org/epsilon/updates).
Detailed [installation instructions](http://www.eclipse.org/gmt/epsilon/download) are available.

Although not necessary, the Emfatic toolkit mentioned above is heavily recommended: install it from its [update site](http://download.eclipse.org/emfatic/update/).

## Running Eugenia
To run Eugenia you need to do the following:

- Create a new general project
- Create and annotate your Emfatic (or Ecore) metamodel in the root of your project
- Right-click your Emfatic (or Ecore) metamodel and select `Eugenia` --> `Generate GMF editor`
- Launch a new Eclipse instance from the `Run` --> `Eclipse Application` right-click menu of the project that contains your metamodel
- In the new Eclipse instance create a new `General` --> `Project` and in it create a new `Filesystem diagram` through the `File` --> `New` --> `Other...` dialog

## Re-running Eugenia
If you now change your metamodel you'll have to rerun Eugenia to generate your updated editor:

- Right-click your Ecore metamodel (or Emfatic file) and select `Eugenia` --> `Generate GMF editor`
- Run a new instance of Eclipse

(Please note that any changes you have made manually to the editor's `.gmfgraph`, `.gmftool` and `.gmfmap` models will be **overwritten**. Have a look [here](../articles/eugenia-polishing/index.md) for an alternative way to customize these models)

## Troubleshooting
* Certain versions of Emfatic do not support annotations without details (e.g. `@gmf` or `@gmf.diagram`). You can use dummy details as a workaround (e.g. `@gmf(foo="bar")`)
* Should you run across the "Node is referenced from multiple containers with different 'List Layout' values" message during validation please ignore it and proceed with the editor code generation.
* Eugenia does not work with Ecore metamodels that span across multiple files/sub-packages
* Ensure that the name of your package is different to the names of the classes it contains (i.e. a package Foo should not contain a Foo class)

## Recipes
* [Nodes with user defined images](../articles/eugenia-nodes-with-images/index.md) (e.g. jpg, png, gif)
* [Nodes with user defined images at runtime](../articles/eugenia-nodes-with-runtime-images/index.md)

## Customizing your editor
[Click here](../articles/eugenia-polishing/index.md) to find out how you can further customize the generated `.gmfgraph`, `.gmfmap` and `.gmftool` models in ways that are not supported by the annotations provided by Eugenia, and still preserve the customizations when Eugenia is re-invoked.

## Adding Copyright
To add copyright information to your generated .gmfgen model, simply create a file named copyright.txt next to it. Next time you invoke `Eugenia` --> `Synchronize GMF gen model`, Eugenia will pick it up and place its contents in the root GenDiagramEditor of your .gmfgen model. If you have added the copyright.txt file, you can also inject its contents to your .genmodel model (EMF generator model) by right-clicking it and invoking `Eugenia` --> `Synchronize EMF gen model`.

## Next Steps
Now that you've learned how to generate a GMF-based editor using Eugenia, you may also want to add some constraints to your editor, which you can then evaluate (explicitly or on-save) to [check the correctness/consistency of your models](../articles/evl-gmf-integration/index.md):

![](Filesystemwitherrorshighlighted.png)
