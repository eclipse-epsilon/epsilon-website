# Developing a new EMC Driver

This article demonstrates the implementation of "drivers" for Epsilon's [Model Connectivity layer](../../emc.md).

## YAML Driver

The following training session recording and deck of slides demonstrate the implementation of [Epsilon's YAML driver](../yaml-emc/index.md). The complete source-code is located in [Epsilon's Git repository](https://github.com/eclipse-epsilon/epsilon/tree/main/plugins/org.eclipse.epsilon.emc.yaml).

<iframe src="https://www.youtube.com/embed/M0nvnhSF6Y0" width="100%" height="485" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen></iframe> <div style="margin-bottom:15px"></div>

<iframe src="https://www.slideshare.net/slideshow/embed_code/key/yc9uUXElc1Zbac" width="100%" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:15px"></div>

## CSV Pro Driver

The slides below demonstrate the implementation of an alternative driver for CSV files, located under the [`examples` folder of Epsilon's repository](https://github.com/eclipse-epsilon/epsilon/tree/main/examples/org.eclipse.epsilon.emc.csvpro).

<iframe src="//www.slideshare.net/slideshow/embed_code/key/EIOJx3cFZKlcEh" width="100%" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"></div>

## Filesystem Driver

This is a minimal toy driver where filesystem folders represent types and property files contained in them represent model elements that are their instances. Below is the main class of the driver and the [full source code](https://github.com/eclipse-epsilon/epsilon/blob/main/examples/org.eclipse.epsilon.emc.filesystem) in Epsilon's repository.

=== "FilesystemModel.java"

    ```java
    {{{ example("org.eclipse.epsilon.emc.filesystem/src/org/eclipse/epsilon/emc/filesystem/FilesystemModel.java", true) }}}
    ```
