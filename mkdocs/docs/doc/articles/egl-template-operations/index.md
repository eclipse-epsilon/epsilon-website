# Using template operations in EGL

Template operations provide a way to re-use small fragments of [EGL](../../egl.md) code. This article shows how to write [EGL](../../egl.md) template operations and discusses when you might want to use them.
 
Suppose we are writing a code generator for plain-old Java objects, and we have the following EGL code (which assumes the presence of a class object):

```egl
class [%=class.name%] {
[% for (feature in class.features) { %]
  /**
   * Gets the value of [%=feature.firstToLowerCase()%]
   */
   public [%=feature.type%] get[%=feature%]() {
      return [%=feature.firstToLowerCase()%];
   }
   
  /**
   * Sets the value of [%=feature.firstToLowerCase()%]
   */
   public void set[%=feature%]([%=feature.type%] [%=feature.firstToLowerCase()%]) {
      this.[%=feature.firstToLowerCase()%] = [%=feature.firstToLowerCase()%];
   }
[% } %]
}
```

While the above code will work, it has a couple of drawbacks. Firstly, the code to generate getters and setters cannot be re-used in other templates. Secondly, the template is arguably hard to read - the purpose of the loop's body is not immediately clear.

Using EGL template operations, the above code becomes:

```egl
class [%=class.name%] {
[% for (feature in class.features) { %]
  [%=feature.getter()%]
  [%=feature.setter()%]
[% } %]
}
[%
  @template
  operation Feature getter() { %]
    /**
     * Gets the value of [%=self.firstToLowerCase()%]
     */
     public [%=self.type%] get[%=self%]() {
        return [%=self.firstToLowerCase()%];
     }
  [% } %]
  
  @template
  operation Feature setter() { %]
    /**
     * Sets the value of [%=self.firstToLowerCase()%]
     */
     public void set[%=self%]([%=self.type%] [%=self.firstToLowerCase()%]) {
        this.[%=self.firstToLowerCase()%] = [%=self.firstToLowerCase()%];
     }
   [% }
%]
```

Notice that, in the body of the loop, we call the template operations, `getter` and `setter`, to generate the getter and setter methods for each feature. This makes the loop arguably easier to read, and the `getter` and `setter` operations can be re-used in other templates.

Template operations are annotated with `@template` and can mix dynamic and static sections, just like the main part of an EGL template. Operations are defined on metamodel types (Feature in the code above), and may be called on any model element that instantiates that type. In the body of an operation, the keyword `self` is used to refer to the model element on which the operation has been called.

## Common issues

**Issue: my template operation produces no output.**

Resolution: ensure that the call to the template operation is placed in a dynamic output section (e.g. `[%=thing.op()%]`) rather than in a plain dynamic section (e.g. `[% thing.op(); %]`). Template operations return a value, which must then be emitted to the main template using a dynamic output section.

Thanks to Mark Tippetts for [reporting this issue via the Epsilon forum](http://www.eclipse.org/forums/index.php?t=msg&th=168976&start=0&).