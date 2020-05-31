### Moving Model Elements into a Different Package {#sec:MoveToPackage}

A common refactoring when modelling in UML is to move model elements,
particularly Classes, between different packages. When moving a pair of
classes from one package to another, the associations that connect them
must also be moved to the target package. To automate this process,
Listing [\[lst:MoveToPackage\]](#lst:MoveToPackage){reference-type="ref"
reference="lst:MoveToPackage"} presents the `MoveToPackage` wizard.

    [
        basicstyle=\ttfamily\footnotesize, 
        flexiblecolumns=true, 
        numbers=none, 
        nolol=true, 
        caption=Implementation of the MoveToPackage Wizard, 
        label=lst:MoveToPackage, 
        numbers=left, 
        language=EWL, 
        tabsize=2
    ]
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

The wizard applies when more than one element is selected and at least
one of the elements is a *Package*. If more than one package is
selected, the last one is considered as the target package to which the
rest of the selected elements will be moved. This is specified in the
*guard* part of the wizard.

To reduce user confusion in identifying the package to which the
elements will be moved, the name of the target package appears in the
title of the wizard. This example shows the importance of the decision
to express the title as a dynamically calculated expression (as opposed
to a static string). It is worth noting that in the *title* part of the
wizard (line 14), the *moveTo* variable declared in the *guard* (line 7)
is referenced. Through experimenting with a number of wizards, it has
been noticed that in complex wizards repeated calculations need to be
performed in the *guard*, *title* and *do* parts of the wizard. To
eliminate this duplication, the scope of variables defined in the
*guard* part has been extended so that they are also accessible from the
*title* and *do* part of the wizard.
