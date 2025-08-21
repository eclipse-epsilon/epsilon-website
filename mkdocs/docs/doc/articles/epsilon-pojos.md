# Running Epsilon Programs on POJOs

Epsilon's languages can be used to query and modify plain-old Java objects (POJOs). The following [Maven-based example](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.pojos) demonstrates setting up a `Project` object with two `Task`s, and passing it to an [EOL](../eol.md) program (`return project.tasks.size();`) to query.

=== "EOLExample.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/EOLExample.java", true) }}}
    ```

=== "Project.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/Project.java", true) }}}
    ```

=== "Task.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/Task.java", true) }}}
    ```

=== "pom.xml"

    ```xml
    {{{ example("org.eclipse.epsilon.examples.pojos/pom.xml", true) }}}
    ```

## Running an EGL Template against the POJO

The example below demonstrates processing the same POJO using Epsilon's template language ([EGL](../egl.md)), to generate text from it.


=== "EGLExample.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/EGLExample.java", true) }}}
    ```

=== "Project.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/Project.java", true) }}}
    ```

=== "Task.java"

    ```java
    {{{ example("org.eclipse.epsilon.examples.pojos/src/main/java/org/eclipse/epsilon/examples/pojos/Task.java", true) }}}
    ```

=== "pom.xml"

    ```xml
    {{{ example("org.eclipse.epsilon.examples.pojos/pom.xml", true) }}}
    ```

The complete source of the example is [on GitHub](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.pojos).