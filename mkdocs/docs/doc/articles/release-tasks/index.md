# Releasing a new version of Epsilon

There are a number of adiministrative and engineering tasks required to release a new verison of Epsilon.
It's important to do them in proper order, as described below.

### Checking licensing via the Dash tool

We use the [Eclipse Dash License](https://www.eclipse.org/projects/handbook/#ip-license-tool) tool to check the libraries we use.
To perform these checks, run the provided script in the root of the repository:

```shell
./dash-license-check.sh
```

The script may mention a number of libraries which show as restricted due to their coordinates not being recorded in IPLab, but are still OK to use as they are on Eclipse Orbit (which has had its own IP review process), or they match a Maven Central dependency which has an approved license.

If there is a restricted dependency which has not been reviewed in any way, then it needs to be put through the [IPLab](https://www.eclipse.org/projects/handbook/#ip-request) process.

### Checking that the interim site is installable from a clean Eclipse

Before continuing, ensure that the interim site can be installed from a clean installation of the latest release of the Eclipse Modeling Tools.

### Getting the release approved by Eclipse

Log in to [the PMI](https://projects.eclipse.org/projects/modeling.epsilon). Under the "Releases" section (right hand side under "Committer Tools"), click on "Create a new release" and fill in the fields. Note that we typically have a major.minor naming scheme, so for the release name, make sure it's 2 numbers (i.e. don't add a .0 patch number). If it has been more than one year since the last review, a new review is required, so the release date should be set at least 8 days later than today.

On the release, go to "Edit". At a minimum, you should ensure "The Basics" section is filled in and correct. When you're happy with it, and it has been more than a year since the last review, you need to submit the release for review.

### Updating Orbit repos

Before creating the release, it's worth updating links to the Orbit repository used for resolving our dependencies. [This commit](https://github.com/eclipse-epsilon/epsilon/commit/1f6f1fac9edf21de7614bc74da9165db53408448) provides an example of the process, showing which files should be updated.


### Managing the update sites

When creating a new release, we need to add the update site for this release to the [composite](https://download.eclipse.org/epsilon/updates/). We also need to create a folder containing the javadocs for the release under a directory with the name of the release at the [root of the download site](https://download.eclipse.org/epsilon/). We also need to remove the old release folder (move it to the archive). The new update site for the release is obtained by copying the interim.

These tasks are automated by a [shell script](https://github.com/eclipse-epsilon/epsilon/tree/main/releng/org.eclipse.epsilon.releng/new_version_tasks.sh). Before the release, please check its `OldVersion` and `NewVersion` variables: `OldVersion` should be the current stable release, and `NewVersion` should be the new stable release that we are about to publish.
This script needs to be run from the CI server via the [release-logistics](https://ci.eclipse.org/epsilon/job/release-logistics/) Jenkins job, which has a copy of the contents of the above script that should be kept up to date with the repo. Of course, you should check what is being run first, since if anything is deleted or overwritten, it can't be undone. Login to the CI and then you can check what is being run in [Configure](https://ci.eclipse.org/epsilon/job/release-logistics/configure). Scroll down to Build and check the Execute shell task, making sure it's the same as that in the shell script in the repo (or whichever looks correct).

### Creating a new version in the Oomph installer

The `releng/org.eclipse.epsilon.releng/epsilonUse.setup` should be updated with the new version. You can copy the Interim version and rename it to the release. The ordering of Product Versions should always be the latest release at the top, then Interim, then older versions. Whichever is at the top will be the default when users try to install Epsilon using Oomph.
Of course, the properties for the new version should be changed to match (e.g. the name, description and update site). Check these carefully. A version of Eclipse should also be hard-coded, rather than relying on the latest update site, so pick whichever is the latest Eclipse release and use that.

### Build and release to Maven Central

See [this article](../maven-release).

### Tagging the release

You should run `git tag x.y`, replacing x.y with the version. Then do `git push origin x.y` (again, `x.y` is the version).
You can verify the tag was pushed by checking the output of `git ls-remote --tags origin`.

### Update the website

The Epsilon website's [Download page](https://www.eclipse.org/epsilon/download/) should be the only place in the [website repo](https://github.com/eclipse-epsilon/epsilon-website) that needs updating. Specifically, you will need to change two source files in the [source directory](https://github.com/eclipse-epsilon/epsilon-website/tree/master/mkdocs/docs/download).
Add the new release info to `all-versions.md`. Copy `index.md` and rename it to the current / old release. Then update `index.md` to mention the new release. Generally it should be as easy as Find and Replacing the old version with the new one.

You should also update the list of Javadoc URLs in `mkdocs.yml`, adding the link to the previous stable release as the `Stable` link will now point to the new stable release.

Also don't forget to build the static site for changes to take effect.

### Bump up versions

Run the following commands from the root of the repository, replacing `X.Y.Z` with the full version number of the release (where Z is the patch, usually 0). Tycho will automatically take care of updating the Maven and PDE projects (`MANIFEST.MF`, `feature.xml` etc.). Note that the standalone POMs (i.e. the `pom-plain.xml` files) are bumped separately using the third command below. Also note the order: run the Tycho one first, then bump `epsilon.version`, then run the Tycho versions bump again and it should succeed.

```
mvn org.eclipse.tycho:tycho-versions-plugin:set-version -DnewVersion=X.Y.Z-SNAPSHOT

mvn versions:set-property -Dproperty=epsilon.version -DnewVersion=X.Y.Z-SNAPSHOT

mvn org.eclipse.tycho:tycho-versions-plugin:set-version -DnewVersion=X.Y.Z-SNAPSHOT

mvn -f pom-plain.xml versions:set -DnewVersion=X.Y.Z-SNAPSHOT
```

You may also need to manually bump up the version of the `releng/org.eclipse.epsilon.target` project. Specifically, the `META-INF/MANIFEST.MF`, but it's also worth checking the `pom.xml` to make sure they're consistent with each other. Also check `org.eclipse.epsilon.test/META-INF/MANIFEST.MF`. The build will fail if anything is inconsistent.

### Announce release on forum

It would be courteous to let users know of the new release, along with the new features, on the [forum](../../../forum).