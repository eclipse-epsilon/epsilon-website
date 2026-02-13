# Epsilon and EMF Datatypes

This articles provides advice for working with different datatypes supported by EMF.

## Decimal Numbers

Arithmetic computations with Ecore `double` and `float` attributes can produce [floating point precision errors](https://dzone.com/articles/understanding-floating-points-number-in-java) as shown in the example below (also [on the playground](https://eclipse.dev/epsilon/playground/?4e00ceaa)), as these are underpinned by Java's `double` and `float` primitive data types. When precision is required, it is advisable to use `EBigDecimal` instead, which is underpinned by Java's `BigDecimal`.

=== "numbers.eol"
    ```eol
    Number.all.dec.sum().println(); // Prints 0.24
    Number.all.dbl.sum().println(); // Prints 0.24000000000000002
    Number.all.flt.sum().println(); // Prints 0.24000001
    ```

=== "numbers.flexmi"
    ```xml
    <?nsuri numbers?>
    <_>
        <number dec="0.1" dbl="0.1" flt="0.1"/>
        <number dec="0.14" dbl="0.14" flt="0.14"/>
    </_>
    ```

=== "numbers.emf"
    ```emf
    @namespace(uri="numbers", prefix="")
    package numbers;

    class Number {
        attr EBigDecimal dec;
        attr double dbl;
        attr float flt;
    }
    ```

To set the value of an `EBigDecimal` attribute you can use its underpinning Java type as shown below.

```eol
Number.all.first().dec = new Native("java.math.BigDecimal")("0.2");
```

## Dates

Ecore supports a built-in `EDate` type, underpinned by Java's `Date` type. EMF provides built-in support for the following [date formats](https://github.com/eclipse-emf/org.eclipse.emf/blob/5a62f269ed73a54af6a636cb3e001cfa6683fefb/plugins/org.eclipse.emf.ecore/src/org/eclipse/emf/ecore/impl/EFactoryImpl.java#L65):

```
yyyy-MM-dd'T'HH:mm:ss'.'SSSZ
yyyy-MM-dd'T'HH:mm:ss'.'SSS
yyyy-MM-dd'T'HH:mm:ss
yyyy-MM-dd'T'HH:mm
yyyy-MM-dd
```

The example below (also [on the playground](https://eclipse.dev/epsilon/playground/?8fd182d8)) shows how to work with date attributes in Epsilon.

=== "persons.eol"
    ```eol
    var newton = Person.all.first();

    newton.dob.println(); // Prints Sun Jan 04 00:00:00 UTC 1643
    newton.dob.class.println(); // Prints class java.util.Date

    var einstein = new Person;
    einstein.name = "Albert Einstein";
    einstein.dob = new Native("java.text.SimpleDateFormat")
        ("yyyy-MM-dd").parse("1879-03-14");
    einstein.dob.println(); // Prints Fri Mar 14 00:00:00 UTC 1879
    ```

=== "persons.flexmi"
    ```xml
    <?nsuri persons?>
    <_>
        <person name="Isaac Newton" dob="1643-01-04"/>
        <person name="Charles Darwin" dob="1809-02-12"/>
        <person name="Marie Curie" dob="1867-11-07"/>
    </_>
    ```

=== "persons.emf"
    ```emf
    package persons;

    class Person {
        attr String name;
        attr EDate dob;
    }
    ```