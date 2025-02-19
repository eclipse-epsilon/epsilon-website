# Human Usable Textual Notation

HUTN is an OMG standard for storing models in a human understandable
format. In a sense it is a human-oriented alternative to XMI; it has a
C-like style which uses curly braces instead of the verbose XML start
and end-element tags. Epsilon provides an implementation of HUTN which
has been realized using ETL for model-to-model transformation, EGL for
generating model-to-text transformations, and EVL for checking the
consistency of HUTN models.

## Features

-   Write models using a text editor
-   Generic-syntax: no need to specify parser
-   Error markers highlighting inconsistencies
-   Resilient to metamodel changes
-   Built-in HUTN-\>XMI and XMI-\>HUTN transformations
-   Automated builder (HUTN-\>XMI)

## Examples

-   [Article: Using the Human-Usable Textual Notation (HUTN) in Epsilon](articles/hutn-basic/index.md)
-   [Article: Using HUTN for T2M transformation](http://epsilonblog.wordpress.com/2008/01/16/using-hutn-for-t2m-transformation/) -   [Article: New in HUTN 0.7.1](http://epsilonblog.wordpress.com/2008/09/15/new-in-hutn-071/)
-   [Article: Managing Inconsistent Models with HUTN](http://epsilonblog.wordpress.com/2009/04/27/managing-inconsistent-models-with-hutn/)

### Reference

The OMG provides a [complete specification](http://www.omg.org/technology/documents/formal/hutn.htm) of the HUTN syntax.
