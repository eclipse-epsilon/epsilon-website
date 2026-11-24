# Troubleshooting

Below are some common issues that (particularly new) users of Epsilon tend to run into.

## Line: 1, Reason: missing EOF at ‘<'

If you get this error message while you are trying to run your Epsilon program, chances are that in the `Source` tab of your run configuration, you have selected a model instead of the Epsilon program you are trying to run.

## Where is the "Run" button?

If you cannot find the run button in the toolbar of your Eclipse, you need to activate the Epsilon perspective from the `Window` --> `Perspective` --> `Open Perspective` --> `Other` menu or from the respective shortcut at the top-right corner of your Eclipse window.

## I see no files when I browse for a program/model file

In the dialog that pops up after you have clicked the `Browse` button, please start typing the name of the file you are looking for (or `*` to see all files) in the search box on the top, and files should start appearing under the `Matched items` part of the dialog.

## Syntax highlighting doesn't work in the Epsilon/Emfatic editors

Chances are that you don't have Epsilon installed in your Eclipse instance. To download Epsilon please follow [these instructions](../../../download/index.md). 