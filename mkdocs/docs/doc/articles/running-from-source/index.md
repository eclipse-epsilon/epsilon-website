# Running Epsilon from Source

To run Epsilon from source, you need to:

- Download a copy of the [latest version of Eclipse](https://www.eclipse.org/downloads) and select the "Eclipse IDE for Eclipse Committers" option when prompted during the installation process.
- Clone the Git repository from `https://github.com/eclipse-epsilon/epsilon`.
- Import all the projects under the `plugins`, `features`, and `tests` folders in your workspace.
- (optional) To organise your workspace, you can create [working sets](http://help.eclipse.org/kepler/index.jsp?topic=%2Forg.eclipse.platform.doc.user%2Fconcepts%2Fcworkset.htm). For example, you could create three working sets that mirror the contents of the folders above (`plugins`, `features`, and `tests`).
- Run `build-and-test.sh` to build and install local Maven dependencies.
- Open `releng/org.eclipse.epsilon.target/org.eclipse.epsilon.target.target` and click the "Set as Active Target Platform" link on the top right.
- Set the JDK compliance level to 1.8. This setting can be found in Window/Preferences/Java/Compiler.
- Right-click on any Epsilon plugin project in the Project Explorer and select Run as → Eclipse Application.

!!! warning "Using your own Eclipse IDE and Maven m2e integration"

    If you would prefer to keep using your own Eclipse IDE instance instead of downloading a new one, please keep in mind that the target platform of the current interim version of Epsilon uses recent features to pull some dependencies directly from Maven Central. To use this target platform, you must install the latest version of the [m2e integration plugin](https://eclipse.dev/m2e/), which can be found here: [https://download.eclipse.org/technology/m2e/releases/latest](https://download.eclipse.org/technology/m2e/releases/latest)

!!! info "Managing the target platform with the CBI Target Platform Definition DSL"

    If needed, you can modify the target platform using the integrated editor provided by Eclipse when opening the `org.eclipse.epsilon.target.target` file. Alternatively, you can use the [Target Platform Definition DSL](https://github.com/eclipse-cbi/targetplatform-dsl) provided by Eclipse CBI. The `org.eclipse.epsilon.target.target.tpd` file contains a target platform specified with this DSL, and used to auto-generate the `.target` version.

## Naming Conventions

- The execution engines for the various Epsilon languages are located in `org.eclipse.epsilon.*.engine` plugins. These are Eclipse-independent.
- Plugins named `*.dt` contain development tools (e.g. editors, run configurations, debuggers) for the respective Epsilon languages.
- Plugins named `org.eclipse.epsilon.emc.*` contain Epsilon Model Connectivity (EMC) drivers through which Epsilon languages can interact with different types of models (e.g. EMF models, spreadsheets etc.).
- Plugins named `org.eclipse.epsilon.emc.*.dt` contain development tools (e.g. model configuration dialogs) for the respective EMC drivers.
- Plugins named `*.workflow` contribute [ANT tasks](../../workflow).

## Modifying the Epsilon parsers

- Before you can regenerate the Epsilon parsers, you need to clone the [epsilon-antlr-dev](https://github.com/epsilonlabs/epsilon-antlr-dev) Git repo into a sibling folder of the Epsilon repo.
- To modify e.g. the EVL parser, you need to change `Evl.g` and/or `EvlParserRules.g`. To re-generate the parser you need to run `build-evl-parser.xml` as an Ant build.
- Since all Epsilon languages extend EOL, if you modify the EOL parser, you'll then need to run `build-all-eol-dependent-parsers.xml`.

## Running the Epsilon tests

- After making any changes to the Epsilon source code, you're advised to run the Epsilon test suites to avoid regressions. Epsilon provides two main test suites: `EpsilonTestSuite` and `EpsilonPluggedInTestSuite` (the latter needs to be run as a `JUnit Plug-In Test`)
