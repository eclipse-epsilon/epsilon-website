# Type Relationships in Epsilon

Types in an Epsilon program come from Epsilon's standard library (e.g. `Boolean`, `Sequence`, `Native`) and from the models it has access to. For example, if a program is executed against an EMF model that conforms to the metamodel below, it can also define variables, parameters etc. of types `Project`, `Task`, `Person` etc.

```emf
package psl;

class Project {
	attr String title;
	val Task[*] tasks;
	val Person[*] people;
}

class Task {
	attr String title;
	ref Person[*] participants;
}

abstract class Person {
	attr String name;
}

class Employee extends Person {}

class Manager extends Employee {}
```

## Type-Related Operations

Epsilon provides the `isKindOf` and `isTypeOf` operations to check conformance of objects to types and the `getAllOfKind` and `getAllOfType` operations to retrieve all instances of types at runtime. Consider the following Flexmi model that conforms to the metamodel above.

```xml
<?nsuri psl?>
<project title="Acme">
	<employee name="Alice"/>
	<employee name="Bob"/>
	<manager name="Charlie"/>
</project>
```

The following EOL program demonstrates how the language's type-related methods work.

```eol
// Prints Alice, Bob
Employee.getAllOfType().name.println();

// Define variables for Alice and Charlie
// Employee.all is an alias for Employee.getAllOfKind()
var alice = Employee.all.first();
var charlie = Manager.all.first();

// Prints true as Alice's type (Employee) is a sub-type of Person
alice.isKindOf(Person).println();

// Also prints true
alice.isTypeOf(Employee).println();

// Prints false as Alice is not a manager
alice.isTypeOf(Manager).println();

// Prints true as Charlie's type (Manager) is a sub-type of Person
charlie.isKindOf(Person).println();

// Also prints true
alice.isTypeOf(Manager).println();

// Prints true as Charlie's type (Manager) is a sub-type of Employee
alice.isKindOf(Employee).println();

// Prints true as Charlie's most specific type is Manager
alice.isTypeOf(Employee).println();
```

## User-Defined Operation Call Dispatch

As discussed in [EOL's documentation page](../eol.md#user-defined-operations), the language supports adding user-defined operations to existing types. For example, we can define a `getRole()` method for `Employee` and `Manager` that returns a string representation of the element's role as shown below.

```
var alice = Employee.all.first();
var charlie = Manager.all.first();

// Prints employee
alice.getRole().println();

// Prints manager
charlie.getRole().println();

// Prints employee, manager
Sequence{alice, charlie}.collect(p|p.getRole()).println();

operation Employee getRole() {
    return "employee";
}

operation Manager getRole() {
    return "manager";
}
```

As the EOL interpreter dispatches calls to these operations at runtime only, the fact that we have not declared the types of the `alice` and `charlie` variables is inconsequential. To determine which operation to call, the interpreter works in two phases:

- In the first phase it will try to dispatch the call to an operation where both its context type and its parameter types have `type-of` relationships with the object and parameters on which it is called.
- If no such operation is found, it will dispatch the call the **first** operation where its context type and parameter types have `kind-of` relationships with the objects and parameters on which it is called.

As EOL is only aware of `type-of` and `kind-of` relationships between types and elements, it does not take into account more complex type hierarchies that the underlying modelling framework may support. For example, consider the following program.

```eol
var charlie = Manager.all.first();

// Prints person instead of employee
charlie.getRole().println();

operation Person getRole() {
    return "person";
}

operation Employee getRole() {
    return "employee";
}
```

Coming from a language like Java, one would expect `charlie.getRole()` to be dispatched to the `Employee.getRole()` user-defined method as `Employee` is a closer super-type of `Manager` than `Person`. However, according to the dispatch algorithm described above, since there is no version of `getRole()` that applies specifically to managers, the EOL interpreter will choose the first operation if finds with matching `kind-of` types. To make the program behave as expected, one would need to swap the order of the two operations as shown below.

```
var charlie = Manager.all.first();

// Prints employee
charlie.getRole().println();

operation Employee getRole() {
    return "employee";
}

operation Person getRole() {
    return "person";
}
```

To avoid unexpected behaviour for developers with a background in mainstream object-oriented languages, it is advisable to place definitions of operations that apply on more abstract types below their overloaded counterparts for more concrete types in Epsilon programs.
