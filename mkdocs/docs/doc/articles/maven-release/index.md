# Releasing Epsilon to Maven Central

This article describes the overall process required to release a new stable release of Epsilon to Maven Central. There are a few steps involved, some of which are outside our control. The guide will describe the steps that we do control, and point you to the relevant resources for the others.

## Preparation

The first step is to gain deploy rights to our `org.eclipse.epsilon` groupId in the [Sonatype OSS](https://oss.sonatype.org/) Nexus repository. To do this, please register at the [Sonatype JIRA](https://issues.sonatype.org/) and give your JIRA username to the Epsilon release engineer(s), so we may file a ticket to have deploy rights granted to you.

## Testing the Plain Maven build

Our plain Maven artifacts are built through a parallel hierarchy of `pom-plain.xml` files, starting from the root of the Epsilon repository.
To do a plain Maven compilation + test build from scratch, simply run this:

```
mvn -f pom-plain.xml clean test
```

Keep in mind that plain Maven builds do not run unit tests, as we already run those in the Tycho build.
Make sure that all tests pass in the Tycho build first.

Double check the dependencies in the various `pom-plain.xml` files, especially those related to external libraries.

Check the project metadata in the `pom-plain.xml` file, which lists the current developers, SCM URLs, and other details.

## Preparing a Maven release

Set the version in the `pom-plain.xml` files:

```sh
mvn -f pom-plain.xml versions:set
```

Enter the version number of the release, and create a commit for it:

```sh
git add ...
git commit -m "Set pom-plain versions to X.Y.Z"
```

Push the commit to Jenkins:

```sh
git push
```

[Here is an example commit](https://github.com/eclipse-epsilon/epsilon/commit/8f680d0bb7270e332d57fe24334012d3cfdae73b).
Typically this would be the last thing you do before tagging the release.
After you've pushed this and tagged the repository with the Epsilon version, remember to bump the version to the next SNAPSHOT.

## Release to Maven Central

The Jenkins build will automatically sign the plain Maven JARs and deploy to the Central Portal server.
After a few hours the contents of the repository should be available from [Maven Central](https://search.maven.org/). This may take up to a day, so be patient!
