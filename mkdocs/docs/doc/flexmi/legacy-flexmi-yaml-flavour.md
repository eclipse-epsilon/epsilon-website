# Legacy Flexmi YAML Flavour

In Epsilon 2.9, we significantly revised the mapping between YAML and Ecore constructs, as the previous approach could produce awkward YAML documents. This page describes the Flexmi YAML syntax supported in Epsilon 2.8 and earlier. The current version of the Flexmi YAML flavour is discussed [here](index.md#yaml-flavour).

=== "Indentation-based"
  
    ```yaml
    ?nsuri: psl
    project:
    - name: ACME
    - person: {name: Alice}
    - person: {name: Bob}
    - task:
      - title: Analysis
      - start: 1
      - dur: 3
      - effort: {person: Alice}
    - task:
      - title: Design
      - start: 4
      - dur: 6
      - effort: {person: Bob}
    - task:
      - title: Implementation
      - start: 7
      - dur: 3
      - effort: {person: Bob, perc: 50}
      - effort: {person: Alice, perc: 50}
    ```

=== "Curly brackets-based"
  
    ```yaml
    ?nsuri: psl
    project: {
      name: ACME,
      person: {name: Alice},
      person: {name: Bob},
      task: {
        title: Analysis,
        start: 1,
        dur: 3,
        effort: {person: Alice}
      },
      task: {
        title: Design,
        start: 4,
        dur: 6,
        effort: {person: Bob}
      },
      task: {
        title: Implementation,
        start: 7,
        dur: 3,
        effort: {person: Bob, perc: 50},
        effort: {person: Alice, perc: 50}
      }
    }
    ```

For multi-valued attributes and non-containment references, comma-separated values, or lists of scalars can be used as shown below.

```yaml
- ?nsuri: psl
- person:
  - name: Alice 
  - skills: Java, HTML # Comma-separated
- person:
  - name: Bob
  - skills: # List of scalars
      - Java
      - HTML
- skill: {name: Java}
- skill: {name: HTML}
```