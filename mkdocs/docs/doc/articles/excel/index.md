# Scripting Excel Spreadsheets using Epsilon

Spreadsheets are commonly used in software and systems engineering processes to capture and analyse structured data, and can be sources of valuable information for model-based software engineering activities. 

Epsilon provides built-in support for querying and transforming Excel spreadsheets through an [Apache POI](https://poi.apache.org/)-based [EMC](../../emc) driver. This article discusses how you can configure an Epsilon program to query and modify an Excel spreadsheet, and the video below demonstrates the driver in action.

<iframe width="100%" height="494" src="https://www.youtube.com/embed/tTYGwgzxPMM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

??? info "Citing the Excel EMC driver in a publication?"
    If you are referring to Epsilon's Excel EMC driver in a publication, please cite [this paper](https://link.springer.com/chapter/10.1007/978-3-642-41533-3_3) instead of the website URL.

??? bug "Regression in Epsilon 2.2"
    Due to a regression, the Excel driver is broken in Epsilon 2.2. The driver works well in previous versions (e.g. 2.1) as well as in 2.3. Support for column datatypes and for writing to Excel spreadsheets has improved substantially in 2.3.

## Worksheets, Columns and Rows

Essentially, in the Excel driver, by default, worksheets are treated as model element types (e.g. `Student`, `Staff`, `Module` and `Mark` in the spreadsheet below), columns as their properties (e.g. `Mark` has `student`, `module` and `mark` properties), and rows are treated as model elements (i.e. there are two students, two members of staff, three modules and two marks in the spreadsheet below).

<style>
  .h {
    text-align: center;
    background-color: #EBEBEB;
  }
</style>

=== "Student"

    <table>
      <tr><td class="h">&nbsp;</td><td class="h">A</td><td class="h">B</td><td class="h">C</td><td class="h">D</td><td class="h">E</td><td class="h">F</td></tr>
      <tr><td class="h">1</td><td>id</td><td>firstname</td><td>lastname</td><td>age</td><td>supervisor</td><td>modules</td></tr>
      <tr><td class="h">2</td><td>jt501</td><td>Joe</td><td>Thompson</td><td>23</td><td>mt506</td><td>MSD,RQE</td></tr>
      <tr><td class="h">3</td><td>js502</td><td>Jane</td><td>Smith</td><td>22</td><td>mt506</td><td>MSD,HCI</td></tr>
    </table>

=== "Staff"

    <table>
      <tr><td class="h">&nbsp;</td><td class="h">A</td><td class="h">B</td><td class="h">C</td><td class="h">D</td><td class="h">E</td><td class="h">F</td></tr>
      <tr><td class="h">1</td><td>id</td><td>firstname</td><td>lastname</td><td>teaches</td><td></td><td></td></tr>
      <tr><td class="h">2</td><td>mt506</td><td>Matthew</td><td>Thomas</td><td>MSD,RQE</td><td></td><td></td></tr>
      <tr><td class="h">3</td><td>dj503</td><td>Daniel</td><td>Jackson</td><td>HCI</td><td></td><td></td></tr>
    </table>

=== "Module"

    <table>
      <tr><td class="h">&nbsp;</td><td class="h">A</td><td class="h">B</td><td class="h">C</td><td class="h">D</td><td class="h">E</td><td class="h">F</td></tr>
      <tr><td class="h">1</td><td>id</td><td>title</td><td>term</td><td></td><td></td><td></td></tr>
      <tr><td class="h">2</td><td>MSD</td><td>Modelling and System Design</td><td>Autumn</td><td></td><td></td><td></td></tr>
      <tr><td class="h">3</td><td>HCI</td><td>Human Computer Interaction</td><td>Spring</td><td></td><td></td><td></td></tr>
      <tr><td class="h">4</td><td>RQE</td><td>Requirements Engineering</td><td>Spring</td><td></td><td></td><td></td></tr>
    </table>

=== "Mark"

    <table>
      <tr><td class="h">&nbsp;</td><td class="h">A</td><td class="h">B</td><td class="h">C</td><td class="h">D</td><td class="h">E</td><td class="h">F</td></tr>
      <tr><td class="h">1</td><td>student</td><td>module</td><td>mark</td><td></td><td></td><td></td></tr>
      <tr><td class="h">2</td><td>jt501</td><td>MSD</td><td>62</td><td></td><td></td><td></td></tr>
      <tr><td class="h">3</td><td>js502</td><td>HCI</td><td>74</td><td></td><td></td><td></td></tr>
    </table>

## References and Column Types

The driver supports specifying additional configuration information (e.g. column data types, references between columns) about a spreadsheet in the form of an external XML document, that can be attached to the spreadsheet in Epsilon's run configuration dialog.

For our example spreadsheet, above, the configuration file below specifies the types of the `age` and `mark` columns of the spreadsheet, the multiplicity of the `teaches` column, as well as references between the `Student.supervisor` and `Staff.id`, and the `Staff.teaches` and `Module.id` columns.

```xml
<spreadsheet>
  <worksheet name="Student">
    <column name="age" datatype="integer"/>
    <column name="modules" many="true"/>
  </worksheet>
  <worksheet name="Mark">
    <column name="mark" datatype="integer"/>
  </worksheet>
  <worksheet name="Staff">
    <column name="teaches" many="true" delimiter=","/>
  </worksheet>
  <reference source="Student->supervisor"
             target="Staff->id"/>
  <reference source="Student->modules"
             target="Module->id"/>           
  <reference source="Staff->teaches"
             target="Module->id"/>
  <reference source="Mark->module"
             target="Module->id"/>
  <reference source="Mark->student"
             target="Student->id"/>
</spreadsheet>
```

The format of the XML configuration document is as follows:

### Worksheet
Each worksheet can have an optional name (if a name is not provided, the name of the worksheet on the spreadsheet is used) and acts as a container for `column` elements.

### Column

Each `column` needs to specify at least either its zero-based `index` in the context of the worksheet it belongs to, or its `name` (if a name is not provided, the cell value in the first row is used, as discussed above). Additionally, a `column` can have:

* `alias`: an alternative name for the column.
* `datatype`: the type of the values in the column. As of Epsilon 2.5.0, the valid options (ignoring case) are `string`, `integer`, `boolean`, `double`, or `float`. The default datatype is `string`.
* `many`: it can be `true` or `false`. If `true`, then its cells will be considered to contain unbounded collections, separated by the `delimeter`(see below). Columns are single-valued by default.
* `delimeter`: the delimiter used to separate values if `many` is `true`. The default delimeter is `,`.

As of 2.6.0, numeric values are converted to various datatypes as follows:

* `string`: the textual representation of the cell's value is used, applying its declared format if possible. If the cell format is not supported, a format similar to the Excel General format will be used: `#` for whole numbers and `#.##########` for decimal numbers (see the Apache POI [DateFormatter](https://poi.apache.org/apidocs/4.1/org/apache/poi/ss/usermodel/DataFormatter.html) documentation).
* `integer`, `double`, and `float`:  the cell value is computed (using the formula if one is present), and then cast to the appropriate datatype.
* `boolean`: zero values will be treated as `false`, and non-zero values will be treated as `true`.

??? bug "Issues with numeric cell values in Epsilon 2.5.0 and earlier"

    In Epsilon 2.5.0 and earlier releases, the Excel driver only supported the `integer`, `double`, and `float` datatypes for cells with numeric values. `string` and `boolean` datatypes were ignored, and treated as `double`. See [issue #89](https://github.com/eclipse-epsilon/epsilon/issues/89).

### Reference
In a configuration document we can also specify ID-based references to capture relationships between columns belonging to potentially different worksheets. Each reference has a `source` and a `target` column, an optional `name` (if a name is not specified, the name of the source column is used to navigate the reference), a cardinality (`many` attribute), and specifies whether updates to cells of the target column should be propagated automatically (`cascadeUpdates` attribute) to the respective cells in the source column to preserve referential integrity.

## Querying and Modifying Spreadsheets

Having specified the configuration document above, we can now query the spreadsheet with EOL as follows.

```eol
// Returns all students supervised by Matthew Thomas
Student.all.select(s|s.supervisor?.lastname = "Thomas");

// Returns the modules taught by Daniel Jackson
Module.all.select(m|
    Staff.all.exists(s|
        s.firstname="Daniel" and s.teaches.includes(m)));
```

### Creating Rows

As discussed above, worksheets are treated as types and rows as their instances. As such, to create a new row in the `Student` worksheet, EOL's `new` operation can be used.

```eol
var student : new Student;
```

### Deleting Rows

To delete a row from a worksheet, EOL's `delete` operator can be used. When a row is deleted, all the rows that contain cells referring to it through cascade-update references also need to be recursively deleted.

```eol
var student = Student.all.selectOne(s|s.id = "js502");
// deletes row 2 of the Student worksheet
// also deletes row 3 of the Mark worksheet
delete student;
```

### Modifying Cell Values

If a cell is single-valued, a type-conforming assignment can be used to edit its value. For example, the following listing demonstrates modifying the age and the supervisor of a particular student.

```eol
var student : Student = ...;
var supervisor : Staff = ...;
student.age = 24;
student.supervisor = supervisor;
```

If on the other hand the cell is multi-valued, then its values should be handled as a collection. Adding/removing values from property collections has no effect on the spreadsheet; you need to re-assign values instead.

```eol
// Moves a module between two members of staff
var from : Staff = ...;
var to : Staff = ...;
var module : Module = ...;
// Neither of these will work
// from.teaches.remove(module);
// to.teaches.add(module);
// ... but these will
from.teaches = from.teaches.excluding(module);
to.teaches = to.teaches.including(module);
```

Updating the value of a cell can have side effects to other cells that are linked to it through cascade-update references to preserve referential integrity. For example, updating the value of cell A3 in the `Module` worksheet, should trigger appropriate updates in cells D2 and F2 of the `Staff` and `Student` worksheets respectively.

## Validating and Transforming Spreadsheets

Of course, we can also validate spreadsheets using [EVL](../../evl), transform them into other models using [ETL](../../etl), and into text using [EGL](../../egl), generate graphical views using [Picto](../../picto) etc.

```evl
context Staff {
	constraint NotOverloaded {
		check: self.teaches.size() <= 4
		message: "Member of staff" + self.firstname +
		  " " + self.lastname + " is overloaded"
	}
}
```

## Creating Spreadsheets

To create a spreadsheet from scratch (e.g. when it is produced by an ETL transformation), we also need to specify an `index` for each column in the XML mapping file. Below is an EOL program that creates the [spreadsheet above](#worksheets-columns-and-rows) from scratch, and the mapping file for it. The complete example is in [Epsilon's Git repo](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.excel).

=== "create-spreadsheet.eol"
    ```eol
    // Create the modules
    var MSD = new Module(id="MSD", 
      title="Modelling and System Design", term="Autumn");

    var HCI = new Module(id="HCI", 
      title="Human Computer Interaction", term="Spring");
    
    var RQE = new Module(id="RQE", 
      title="Requirements Engineering", term="Spring");
       
    // Create the staff  
    var matthew = new Staff(id="mt506", firstname="Matthew",
      lastname="Thomas", teaches=Sequence{MSD, RQE});
    
    var matthew = new Staff(id="dj503", firstname="Daniel",
      lastname="Jackson", teaches=Sequence{HCI});
    
    // Create the students
    var joe = new Student(id="jt501", firstname="Joe", 
      lastname="Thompson", age="23", supervisor=matthew, modules=Sequence{MSD, RQE});
    
    var jane = new Student(id="js502", firstname="Jane", 
      lastname="Smith", age="22", supervisor=matthew, modules=Sequence{MSD, HCI});
    
    // Create the marks
    new Mark(student=joe, module=MSD, mark=62);
    new Mark(student=jane, module=HCI, mark=74);
    ```

=== "mapping.xml"

    ```xml
    {{{ example("org.eclipse.epsilon.examples.excel/mapping.xml", true) }}}
    ```

## Working with Formulas

To set the value of a cell to a formula, start its value with `=` as shown below. The complete example is in [Epsilon's Git repo](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.excel.formulas).

=== "create-spreadsheet-with-formulas.eol"
    ```eol
    {{{ example("org.eclipse.epsilon.examples.excel.formulas/create-spreadsheet-with-formulas.eol", true) }}}
    ```

=== "mapping.xml"
    ```xml
    {{{ example("org.eclipse.epsilon.examples.excel.formulas/mapping.xml", true) }}}
    ```


## Reflective Access

To iterate over all the worksheets, columns and rows of a speadsheet without referring to them by name, we can use the following statements (assuming that our Excel spreadsheet is named `M` in the run configuration). Additional methods of interest for this mode of access can be found in the Javadoc of the underlying [ExcelModel](https://download.eclipse.org/epsilon/interim-javadoc/org/eclipse/epsilon/emc/spreadsheets/excel/ExcelModel.html) and [SpreadsheetModel](https://download.eclipse.org/epsilon/interim-javadoc/org/eclipse/epsilon/emc/spreadsheets/SpreadsheetModel.html) classes.

```eol
// Iterate over all worksheets
for (w in M.worksheets) {
  w.name.println();
  
  // Iterate over all columns
  // of the worksheet
  for (c in w.header.columns) {
    c.name.println("\t");
  }
  
  // Iterate over all rows
  // of the worksheet
  for (r in w.rows) {
    r.println("\t");
  }
}
```

## ANT Workflows

You can use Excel spreadsheets in ANT workflows using Epsilon's generic `epsilon.loadModel` task as shown below.

```xml
<epsilon.loadModel name="M" type="ExcelModel">
    <parameter name="SPREADSHEET_FILE" file="spreadsheet.xlsx" />
    <parameter name="CONFIGURATION_FILE" file="mapping.xml" />
</epsilon.loadModel>
```

The parameters supported for spreadsheets are listed below.

| Parameter                | Description                                                  | Default Value |
| ------------------------ | ------------------------------------------------------------ | ------------- |
| SPREADSHEET_FILE         | The path of the `.xslx` file                                 |               |
| CONFIGURATION_FILE       | The path of the XML-based [configuration file](#references-and-column-types) |               |
| PROPERTY_READONLOAD      | Whether the existing contents of the spreadsheet file should be read | true          |
| PROPERTY_STOREONDISPOSAL | Whether any modifications should be written back to the spreadsheet file | false         |

## Resources

- [This article](../running-epsilon-ant-tasks-from-command-line#excel) shows how to use Excel spreadsheets in standalone ANT/Gradle/Maven builds.