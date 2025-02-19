# The Epsilon Wizard Language (EWL)

There are two types of model-to-model transformations: mapping and update transformations. Mapping transformations typically transform a source model into a set of target models expressed in (potentially) different modelling languages by creating zero or more model elements in the target models for each model element of the source model. By contrast, update transformations perform in-place modifications in the source model itself. They can be further classified into two subcategories: transformations in the small and in the large. Update transformations in the large apply to sets of model elements calculated using well-defined rules in a batch manner. An example of this category of transformations is a transformation that automatically adds accessor and mutator operations for all attributes in a UML model. On the other hand, update transformations in the small are applied in a user-driven manner on model elements that have been explicitly selected by the user. An example of this kind of transformations is a transformation that renames a *user-specified* UML class and all its incoming associations consistently.

In Epsilon, mapping transformations can be specified using [ETL](../etl), and update transformations in the large can be implemented either using the model modification features of EOL or using an ETL transformation in which the source and target models are the same model. By contrast, update transformations in the small cannot be effectively addressed by any of the languages presented so far.

The following section discusses the importance of update transformations in the small and motivates the definition of a task-specific language (Epsilon Wizard Language (EWL)) that provides tailored and effective support for defining and executing update transformations on models of diverse metamodels.

## Motivation

Constructing and refactoring models is undoubtedly a mentally intensive process. However, during modelling, recurring patterns of model update activities typically appear. As an example, when renaming a class in a UML class diagram, the user also needs to manually update the names of association ends that link to the renamed class. Thus, when renaming a class from *Chapter* to *Section*, all associations ends that point to the class and are named *chapter* or *chapters* should be also renamed to *section* and *sections* respectively. As another example, when a modeller needs to refactor a UML class into a singleton, they need to go through a number of well-defined, but trivial, steps such as attaching a stereotype (`<<singleton>>`), defining a static *instance* attribute and adding a static *getInstance()* method that returns the unique instance of the singleton.

It is generally accepted that performing repetitive tasks manually is both counter-productive and error-prone. On the other hand, failing to complete such tasks correctly and precisely compromises the consistency, and thus the quality, of the models. In Model Driven Engineering, this is particularly important since models are increasingly used to automatically produce (parts of) working systems.

### Automating the Construction and Refactoring Process

Contemporary modelling tools provide built-in transformations (*wizards*) for automating common repetitive tasks. However, according to the architecture of the designed system and the specific problem domain, additional repetitive tasks typically appear, which cannot be addressed by the pre-conceived built-in wizards of a modelling tool. To address the automation problem in its general case, users must be able to easily define update transformations (wizards) that are tailored to their specific needs.

To an extent, this can be achieved via the extensible architecture that state-of-the-art modelling tools often provide which enables users to add functionality to the tool via scripts or application code using the implementation language of the tool. Nevertheless, the majority of modelling tools provide an API through which they expose an edited model, which requires significant effort to learn and use. Also, since each API is proprietary, such scripts and extensions are not portable to other tools. Finally, API scripting languages and third-generation languages such as Java and C++ are not particularly suitable for model navigation and modification.

Furthermore, existing languages for mapping transformations, such as QVT, ATL and ETL, cannot be used as-is for this purpose, because these languages have been designed to operate in a batch manner without human involvement in the process. By contrast, as discussed above, the task of constructing and refactoring models is inherently user-driven.

## Update Transformations in the Small

Update transformations are actions that automatically create, update or delete model elements based on a selection of existing elements in the model and information obtained otherwise (e.g. through user input), in a user-driven fashion. In this section, such actions are referred to as *wizards* instead of *rules* to reduce confusion between them and rules of mapping transformation languages. In the following sections, the desirable characteristics of wizards are elaborated informally.

### Structure of Wizards

In its simplest form, a wizard only needs to define the actions it will perform when it is applied to a selection of model elements. The structure of such a wizard that transforms a UML class into a *singleton* is shown using pseudo-code in the listing below.

```
do :
    attach the singleton stereotype
    create the instance attribute
    create the getInstance method
```

Since not all wizards apply to all types of elements in the model, each wizard needs to specify the types of elements to which it applies. For example, the wizard of the listing above, which automatically transforms a class into a singleton, applies only when the selected model element is a class. The simplest approach to ensuring that the wizard will only be applied on classes is to enclose its body in an *if* condition as shown in the listing below.

```
do : 
    if (selected element is a class) {
        attach the singleton stereotype
        create the instance attribute
        create the getInstance method
    }
```

A more modular approach is to separate this condition from the body of the wizard. This is shown in the listing below where the condition of the wizard is specified as a separate *guard* stating that the wizard applies only to elements of type Class. The latter is preferable since it enables filtering out wizards that are not applicable to the current selection of elements by evaluating only their *guard* parts and rejecting those that return *false*. Thus, at any time, the user can be provided with only the wizards that are applicable to the current selection of elements. Filtering out irrelevant wizards reduces confusion and enhances usability, particularly as the list of specified wizards grows.

```ewl
guard : selected element is a class
do : 
    attach the singleton stereotype
    create the instance attribute
    create the getInstance method
```

To enhance usability, a wizard also needs to define a short human-readable description of its functionality. To achieve this, another field named *title* has been added. There are two options for defining the title of a wizard: the first is to use a static string and the second to use a dynamic expression. The latter is preferable since it enables definition of context-aware titles.

```ewl
guard : selected element is a class
title : Convert class <class-name> into a singleton
do : 
    attach the singleton stereotype
    create the instance attribute
    create the getInstance method
```

### Capabilities of Wizards

The *guard* and *title* parts of a wizard need to be expressed using a language that provides model querying and navigation facilities. Moreover, the *do* part also requires model modification capabilities to implement the transformation. To achieve complex transformations, it is essential that the user can provide additional information. For instance, to implement a wizard that addresses the class renaming scenario, the information provided by the selected class does not suffice; the user must also provide the new name of the class. Therefore, EWL must also provide mechanisms for capturing user input.

## Abstract Syntax

Since EWL is built atop Epsilon, its abstract and concrete syntax need only to define the concepts that are relevant to the task it addresses; they can reuse lower-level constructs from EOL. A graphical overview of the abstract syntax of the language is provided in the figure below.

The basic concept of the EWL abstract syntax is a *Wizard*. A wizard defines a *name*, a *guard* part, a *title* part and a $do$ part. Wizards are organized in *Modules*. The *name* of a wizard acts as an identifier and must be unique in the context of a module. The *guard* and *title* parts of a wizard are of type *ExpressionOrStatementBlock*, inherited from EOL. An *ExpressionOrStatementBlock* is either a single EOL expression or a block of EOL statements that include one or more *return* statements. This construct allows users to express simple declarative calculations as single expressions and complex calculations as blocks of imperative statements. Finally, the *do* part of the wizard is a block of EOL statements that specify the effects of the wizard when applied to a compatible selection of model elements.

![EWL Abstract
Syntax](images/EwlAbstractSyntax.png)

## Concrete Syntax

The following listing presents the concrete syntax of EWL wizards.

```
wizard <name> {
    (guard (:expression)|({statementBlock}))?
    (title (:expression)|({statementBlock}))? 
    do {
        statementBlock
    } 
}
```

## Execution Semantics

The process of executing EWL wizards is inherently user-driven and as such it depends on the environment in which they are used. In general, each time the selection of model elements changes (i.e. the user selects or deselects a model element in the modelling tool), the guards of all wizards are evaluated. If the guard of a wizard is satisfied, the *title* part is also evaluated and the wizard is added to a list of *applicable* wizards. Then, the user can select a wizard and execute its *do* part to perform the intended transformation.

In EWL, variables defined and initialized in the *guard* part of the wizard can be accessed both by the *title* and the *do* parts. In this way, results of calculations performed in the *guard* part can be re-used, instead of re-calculated in the subsequent parts. The practicality of this approach is discussed in more detail in the examples that follow. Also, the execution of the *do* part of each wizard is performed in a transactional mode by exploiting the transaction capabilities of the underlying model connectivity framework, so that possible logical errors in the *do* part of a wizard do not leave the edited model in an inconsistent state.

## Examples

This section presents three concrete examples of EWL wizards for refactoring UML 1.4 models. The aim of this section is not to provide complete implementations that address all the sub-cases of each scenario but to provide enhanced understanding of the concrete syntax, the features and the capabilities of EWL to the reader. Moreover, it should be stressed again that although the examples in this section are based on UML models, by building on Epsilon, EWL can be used to capture wizards for diverse modelling languages and technologies.

### Converting a Class into a Singleton

The singleton pattern is applied when there is a class for which only one instance can exist at a time. In terms of UML, a singleton is a class stereotyped with the `<<singleton>>` stereotype, and it defines a static attribute named `instance` which holds the value of the unique instance. It also defines a static `getInstance()` operation that returns that unique instance. Wizard `ClassToSingleton`, presented below, simplifies the process of converting a class into a singleton by adding the proper stereotype, attribute and operation to it automatically.

```ewl
wizard ClassToSingleton {
    
    // The wizard applies when a class is selected
    guard : self.isTypeOf(Class)
    
    title : "Convert " + self.name + " to a singleton"
    
    do {
        // Create the getInstance() operation 
        var gi : new Operation; 
        gi.owner = self; 
        gi.name = "getInstance"; 
        gi.visibility = VisibilityKind#vk_public; 
        gi.ownerScope = ScopeKind#sk_classifier; 
        
        // Create the return parameter of the operation 
        var ret : new Parameter; 
        ret.type = self; 
        ret.kind = ParameterDirectionKind#pdk_return; 
        gi.parameter = Sequence{ret}; 
        
        // Create the instance field 
        var ins : new Attribute; 
        ins.name = "instance"; 
        ins.type = self; 
        ins.visibility = VisibilityKind#vk_private; 
        ins.ownerScope = ScopeKind#sk_classifier; 
        ins.owner = self; 
        
        // Attach the <<singleton>> stereotype 
        self.attachStereotype("singleton");
    }
}

// Attaches a stereotype with the specified name
// to the Model Element on which it is invoked
operation ModelElement attachStereotype(name : String) {
        var stereotype : Stereotype;
        
        // Try to find an existing stereotype with this name
        stereotype = Stereotype.allInstances.selectOne(s|s.name = name);
        
        // If there is no existing stereotype
        // with that name, create one
        if (not stereotype.isDefined()){
            stereotype = Stereotype.createInstance();
            stereotype.name = name;
            stereotype.namespace = self.namespace;
        }
        
        // Attach the stereotype to the model element
        self.stereotype.add(stereotype);
}
```

The `guard` part of the wizard specifies that it is only applicable when the selection is a single UML class. The `title` part specifies a context-aware title that informs the user of the functionality of the wizard and the `do` part implements the functionality by adding the `getInstance` operation (lines 10-14), the `instance` attribute (lines 23-28) and the `<<singleton>>` stereotype (line 31). 

The stereotype is added via a call to the `attachStereotype()` operation. Attaching a stereotype is a very common action when refactoring UML models, particularly where UML profiles are involved, and therefore to avoid duplication, this reusable operation that checks for an existing stereotype, creates it if it does not already exists, and attaches it to the model element on which it is invoked has been specified.

An extended version of this wizard could also check for existing association ends that link to the class and for which the upper-bound of their multiplicity is greater than one and either disallow the wizard from executing on such classes (in the `guard` part) or update the upper-bound of their multiplicities to one (in the `do` part). However, the aim of this section is not to implement complete wizards that address all sub-cases but to provide a better  understanding of the concrete syntax and the features of EWL. This principle also applies to the examples presented in the sequel.

### Renaming a Class

The most widely used convention for naming attributes and association
ends of a given class is to use a lower-case version of the name of the
class as the name of the attribute or the association end. For instance,
the two ends of a one-to-many association that links classes `Book` and
`Chapter` are most likely to be named `book` and `chapters`
respectively. When renaming a class (e.g. from `Chapter` to `Section`)
the user must then manually traverse the model to find all attributes
and association ends of this type and update their names (i.e. from
`chapter` or `bookChapter` to `section` and `bookSection` respectively).
This can be a daunting process especially in the context of large
models. Wizard `RenameClass` presented in the listing below automates this process.

```
wizard RenameClass {
    
    // The wizard applies when a Class is selected
    guard : self.isKindOf(Class)
    
    title : "Rename class " + self.name
    
    do {
        var newName : String;
        
        // Prompt the user for the new name of the class
        newName = UserInput.prompt("New name for class " + self.name);
        if (newName.isDefined()) {
            var affectedElements : Sequence;
            
            // Collect the AssociationEnds and Attributes
            // that are affected by the rename
            affectedElements.addAll(
                AssociationEnd.allInstances.select(ae|ae.participant=self));
            affectedElements.addAll(
                Attribute.allInstances.select(a|a.type = self));
            
            var oldNameToLower : String;
            oldNameToLower = self.name.firstToLowerCase();
            var newNameToLower : String;
            newNameToLower = newName.firstToLowerCase();
            
            // Update the names of the affected AssociationEnds
            // and Attributes
            for (ae in affectedElements) {
                ae.replaceInName(oldNameToLower, newNameToLower);
                ae.replaceInName(self.name, newName);
            }
            self.name = newName;
        }
    }
    
}

// Renames the ModelElement on which it is invoked
operation ModelElement replaceInName
    (oldString : String, newString : String) {
    
    if (oldString.isSubstringOf(self.name)) {
        // Calculate the new name
        var newName : String;
        newName = self.name.replace(oldString, newString);
        
        // Prompt the user for confirmation of the rename
        if (UserInput.confirm
            ("Rename " + self.name + " to " + newName + "?")) {
            // Perform the rename
            self.name = newName;
        }
    }
}
```

As with the `ClassToSingleton` wizard, the `guard` part of `RenameClass` specifies that the wizard is applicable only when the selection is a simple class and the *title* provides a context-aware description of the functionality of the wizard.

The information provided by the selected class itself does not suffice in the case of renaming since the new name of the class is not specified anywhere in the existing model. In EWL, and in all languages that build on EOL, user input can be obtained using the built-in `UserInput` facility. Thus, in line 12 the user is prompted for the new name of the class using the `UserInput.prompt()` operation. Then, all the association ends and attributes that refer to the class are collected in the `affectedElements` sequence (lines 14-21). Using the `replaceInName` operation (lines 31 and 32), the name of each one is examined for a substring of the upper-case or the lower-case version of the old name of the class. In case the check returns true, the user is prompted to confirm (line 48) that the feature needs to be renamed. This further highlights the importance of user input for implementing update transformations with fine-grained user control.

### Moving Model Elements into a Different Package

A common refactoring when modelling in UML is to move model elements, particularly Classes, between different packages. When moving a pair of classes from one package to another, the associations that connect them must also be moved to the target package. To automate this process, the listing below presents the `MoveToPackage` wizard.

```
wizard MoveToPackage {
    
    // The wizard applies when a Collection of
    // elements, including at least one Package
    // is selected
    guard { 
        var moveTo : Package;
        if (self.isKindOf(Collection)) {
            moveTo = self.select(e|e.isKindOf(Package)).last();
        }
        return moveTo.isDefined();
    }
    
    title : "Move " + (self.size()-1) + " elements to " + moveTo.name
    
    do {
        // Move the selected Model Elements to the
        // target package
        for (me in self.excluding(moveTo)) {
            me.namespace = moveTo;
        }
        
        // Move the Associations connecting any
        // selected Classes to the target package
        for (a in Association.allInstances) {
            if (a.connection.forAll(c|self.includes(c.participant))){
                a.namespace = moveTo;
            }
        }
    }
    
}
```

The wizard applies when more than one element is selected and at least one of the elements is a *Package*. If more than one package is selected, the last one is considered as the target package to which the rest of the selected elements will be moved. This is specified in the *guard* part of the wizard.

To reduce user confusion in identifying the package to which the elements will be moved, the name of the target package appears in the title of the wizard. This example shows the importance of the decision to express the title as a dynamically calculated expression (as opposed to a static string). It is worth noting that in the *title* part of the wizard (line 14), the *moveTo* variable declared in the *guard* (line 7) is referenced. Through experimenting with a number of wizards, it has been noticed that in complex wizards repeated calculations need to be performed in the *guard*, *title* and *do* parts of the wizard. To eliminate this duplication, the scope of variables defined in the *guard* part has been extended so that they are also accessible from the *title* and *do* part of the wizard.