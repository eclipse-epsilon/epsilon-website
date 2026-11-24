# Epsilon Development Principles

This article describes the guiding principles that the committers of Epsilon follow.

In-keeping with agile development principles, we don't use a strict/heavy-weight development process. Each member of the development team is free to use quite different approaches to software development. However, we aim to follow the following principles to ensure that there is a basic level of consistency across the Epsilon platform and its development.

## General

1. **Be mindful of different use cases**: design, implementation and evolution of the platform respects that Epsilon can be used in different environments (from Eclipse or stand-alone) and on different operating systems (Windows, Linux, Mac OS); and that Epsilon programs can be invoked in different manners (Eclipse launch configurations, Ant tasks, programmatically).
2. **Maintain backwards-compatibility**: the APIs exposed by Epsilon should be stable. Changes should not break client code. We use deprecation to warn users that an API has changed, and might be changed in a breaking manner in a future version of Epsilon.

## Source code

1. **Collectively own the code**: all of the code is owned by the entire team, and anybody can make changes anywhere. Often, we work together on changes to the core of the platform, or to languages that a particular committer has developed initially (e.g., we might work closely with Antonio on a change to EUnit, because Antonio has done most of the recent work on EUnit).
2. **Collaborate on design**: although we rarely practice "live" pair programming, we do share patches and discuss important design decisions internally.
3. **Adhere to code conventions**
	- We do not place opening brackets on their own line.
	- We always use braces for the bodies of `if`/`while`/`for` statements, unless it's a single statement that can be placed on the same line.
	- Also, `else if` and `else` statements are not placed in the same line as the closing brace of the previous block, but on the next one.
	- Avoid printing the stack traces of caught exceptions. When users run Epsilon from Eclipse they won't see these stack traces while and when they use Epsilon as a library, the stack traces will pollute the application's output. If you can handle the exception meaningfully in the `catch` block, then do it and don't print its stack trace, otherwise throw the exception for the caller to handle.

```java
// Not OK
if (true)
{
	return false;
}

// OK
if (true) {
	return false;
}

// Not OK
if (true)
	return false;

// OK
if (true) return false;

// Not OK
if (something) {
	do something;
} else if (other thing) {
	do other thing;
} else {
	do alternative thing;
}

// OK
if (something) {
	do something;
}
else if (other thing) {
	do other thing;
}
else {
	do alternative thing;
}

// Not OK
try {
	somethingDangerous();
}
catch (Exception ex) {
	ex.printStackTrace();
}
```

## Testing

1. **Favour automated testing**: to provide some assurance that we are shipping working code, we include automated tests along with feature code.
2. **Favour testing over testing-first**: although we appreciate the benefits of test-first and test-driven development, we do not always develop tests first, often preferring peer review to make design decisions.
3. **Everyone uses the same testing frameworks**: currently we favour JUnit 4 and Mockito for testing and mocking, respectively. Older code might still use other libraries (e.g. JUnit 3 and JMock), and we aim to replace these when we encounter them.

## Bug/Feature Tracking

**Trace changes using GitHub Issues**: we use [Github Issues](https://github.com/eclipse-epsilon/epsilon/issues) to document and discuss design and implementation changes. We often raise our own issues. We use issue numbers in commit messages to maintain trace links between the code and discussions about the code.

## Source Code Management

1. **Describe commits with meaningful messages**: to ensure that the history of the code can be understood by every member of the team, we endeavour to make our commit messages understandable and traceable. Metadata is often include in commit messages, for example: "[EOL] Fixes bug #123456, which prevented the creation of widgets."
2. **Avoid large commits**: to ensure that the history of the code can be understood by every member of the team, we favour breaking large commits into smaller consecutive commits.

## Technical Support

1. **No forum post goes unanswered**: to maintain and foster the community around Epsilon, we answer every question on the user forum.
2. **Encourage users to produce minimal examples**: if we need to reproduce a user's issue, we will often ask for [a minimal example](../minimal-examples/index.md) to aid in debugging. We have found this to be effective because it allows us to focus most of our time on fixing issues, and because users sometimes discover the solution to their issue while producing the minimal example.
