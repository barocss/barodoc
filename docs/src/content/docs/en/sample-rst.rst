=====================
Asset Viewer Samples
=====================

This document tests the **RST asset viewer** with reStructuredText features:
sections, code blocks, lists, links, and inline markup.

Overview
========

The asset content viewer supports multiple file types in the same docs layout.
Each type has a dedicated viewer (e.g. LaTeX.js for ``.tex``, inline table for
``.csv``).

Supported formats
-----------------

- **HTML, PDF, PPTX** – iframe or native viewer
- **LaTeX** (``.tex``) – compiled to HTML in the browser (LaTeX.js)
- **CSV** – rendered as an inline table (no iframe)
- **RST** – this file; parsed to HTML
- **Jupyter** (``.ipynb``) – code cells and saved outputs (text, HTML, images)
- **ODT/ODS/ODP** – ViewerJS (WebODF)
- **EPUB** – EPUB.js

Code block example
------------------

Here is a short code block to test literal blocks::

  def greet(name):
      return f"Hello, {name}!"

  if __name__ == "__main__":
      print(greet("Asset Viewer"))

Numbered list
-------------

1. Add asset files under ``src/content/<section>/`` (e.g. ``docs/en/sample.csv``).
2. Add the slug to ``barodoc.config.json`` in ``navigation[].pages`` so it appears in the sidebar.
3. Build or run dev; the asset is served at ``/docs/<slug>`` (without extension).

Links and emphasis
-----------------

- Link to `Barodoc repo <https://github.com/barocss/barodoc>`_.
- *Italic* and **bold** and ``inline code``.
- A longer paragraph to ensure wrapping and spacing look correct when rendered
  as HTML. The viewer should show this as the main content, with an optional
  "Show source" toggle.

Conclusion
==========

If you see this as formatted HTML (headings, lists, code block, links) rather
than raw source, the RST viewer is working correctly.
