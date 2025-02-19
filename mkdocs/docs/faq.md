# Frequently Asked Questions

In this page we provide answers to common questions about Epsilon. If your question is not answered here, please feel free to [ask in the forum](../forum).

## What is the relationship between Epsilon and EMF?

Briefly, with EMF you can specify metamodels and construct models that conform to these metamodels, while with Epsilon you can process these EMF models and metamodels (e.g. validate them, transform them, generate code from them etc.).

## Is Epsilon a model transformation language?

No. Epsilon is a family of languages, **one of which** targets model-to-model transformation (ETL).

## Who is using Epsilon?

With **more than 10,000 posts** in the [Epsilon forum](support.md), it appears that quite a few people are currently using different parts of Epsilon. A list of companies and open-source projects that use Epsilon is available [here](users/index.md).

## How do I get help?

Epsilon has a dedicated [forum](support.md) where you can ask questions about the tools and languages it provides. Whenever possible, please use the forum instead of direct email. We're monitoring the forum very closely and there is practically no difference in terms of response time. Also, answered questions in the forum form a knowledge base, which other users can consult in case they face similar issues in the future, and an active forum is an indication of a healthy and actively maintained project (properties that the Eclipse Foundation takes very seriously). When posting messages to the forum we recommend that you use your full (or at least a realistic) name instead of a nickname (e.g. "ABC", "SomeGuy") as the latter can lead to pretty awkward sentences.

## How do I get notified when a new version of Epsilon becomes available?

To get notified when a new version of Epsilon becomes available you can configure Eclipse to check for updates automatically by going to `Window` --> `Preferences` --> `Install/Update/Automatic Updates` and checking the `Automatically find new updates and notify me` option.

## Can I use Epsilon in a non-Eclipse-based standalone Java application?

Yes. There are several examples of doing just that in the [examples/org.eclipse.epsilon.examples.standalone](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.examples.standalone/src/org/eclipse/epsilon/examples/standalone) project in the Git repository. Just grab your JARs through [Maven Central](download/index.md).

## How does Epsilon compare to the OMG family of languages?

There are two main differences:

First, QVT, OCL and MTL are standards while languages in Epsilon are not. While having standards is arguably *a good thing*, by not having to conform to standardized specifications, Epsilon provides the agility to explore interesting new features and extensions of model management languages, and contribute to advancing the state of the art in the field. Examples of such interesting and novel features in Epsilon include [interactive transformation](http://epsilonblog.wordpress.com/2007/12/17/interactive-model-transformation-with-etl/), [tight Java integration](http://epsilonblog.wordpress.com/2007/12/16/using-java-objects-in-eol/), [extended properties](http://epsilonblog.wordpress.com/2008/01/30/extended-properties-in-eol/), and support for [transactions](http://portal.acm.org/citation.cfm?id=1370748).

Second, Epsilon provides specialized languages for tasks that are currently not explicitly targeted by the OMG standards. Examples of such tasks include interactive in-place model transformation, model comparison, and model merging.

## What is the difference between E\*L and language X?

If the available [documentation](doc/index.md) doesn't provide enough information for figuring this out, please feel free to ask in the [Epsilon forum](support.md).

## Are Epsilon languages compiled or interpreted?

All Epsilon languages are interpreted. With the exception of EGL templates which are transformed into EOL before execution, all other languages are supported by bespoke interpreters.

## How can I contribute to Epsilon?

There are several ways to contribute to Epsilon. In the first phase you can ask questions in the forum and help with maintaining the vibrant community around Epsilon. You may also want to let other developers know about Epsilon by sharing your experiences online. If you are interested in contributing code to Epsilon, you should start by submitting bug reports, feature requests - and hopefully patches that fix/implement them. This will demonstrate your commitment and long-term interest in the project - which is required by the Eclipse Foundation in order to later on be nominated for a committer account.

## Where is the metamodel of ETL/EVL etc.?

Epsilon languages do not have Ecore-based metamodels.

## How do I enable code-completion/assistance in the Epsilon editors?

Epsilon does not provide support for type-aware code completion as Epsilon languages are dynamically typed. However, `ctrl+space` provides a list of previously typed tokens to speed up typing.