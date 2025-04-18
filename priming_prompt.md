# Table Generator Interface Project — Priming Prompt

This project provides a complete solution for designing, previewing, and generating realistic test data tables for development and prototyping through configurable templates and data generation rules.

---

## 🔍 Project Overview

The Table Generator Interface is a JavaScript-based toolkit and UI designed to:

- Build and export synthetic datasets for software prototyping.
- Allow users to define structured data generation templates using static lists, auto-generated values, and composite field patterns.
- Preview table output live in the browser or from a CLI script.

It is built around a modular class (`TableGenerator`) that interprets JSON-based template definitions and returns a formatted 2D array representing table data.

---

## ⚙️ Core Components

### 1. `jw-table-generator.js`
- **Main engine** that interprets templates and outputs data tables.
- Supports `list`, `number`, `random`, `library`, `loremIpsum`, and `composite` generation types.
- Can incorporate a default internal library (`defaultLibrary`) or be overridden by a custom one.
- Generates realistic data like names, job titles, phone numbers, emails, and addresses using composite rules.
- Supports weighted patterns in composite fields to control the frequency of different pattern variations.

### 2. `generate.html`
- A complete **web-based interface** built with TailwindCSS.
- Enables:
  - Editing global settings (row count, headers, index fields).
  - Adding dynamic fields (list or auto-generate).
  - Choosing data types and options via dropdowns.
  - Composing multi-part **composite fields** with modal-based editing.
  - Previewing both the **template JSON** and **generated output**.
  - Exporting JSON output directly.

### 3. `demo.js`
- A **Node.js demo script** that loads a template JSON file, optionally merges a custom library, and outputs data using `console.table()`.

### 4. `demo_template.json`
- A minimal working example of a table template, with:
  - Global `settings` (row count, headers).
  - Fields using both library-based auto-generation and custom static lists.
  - Custom override example: the "foo" field pulls from a runtime-supplied array (`["bar", "baz", "qux"]`).

### 5. `library_types.md`
- A reference doc enumerating all supported **data library keys** (e.g., `firstName`, `organization`, `address`, `emailFormat`, etc.).
- Explains naming patterns and available real-world value types.

### 6. `README.md`
- Full usage documentation:
  - Template structure.
  - Supported field types and settings.
  - Example template and output.
  - Deep dive on all `autoGenerate` options.

---

## ✅ Current Status

### ✅ Completed
- Full-featured `TableGenerator` class with composite pattern support.
- Pre-built internal data library covering names, locations, emails, jobs, etc.
- Functional browser-based UI (`generate.html`) with:
  - Field editor
  - Composite pattern builder
  - Live output preview
- CLI-compatible example (`demo.js`) with template override capability.
- Markdown documentation describing data formats and libraries.

### ⚗️ Experimental
- Composite modal UI is complete but lacks persistent storage across page reloads.
- Pattern validation is minimal — malformed templates may cause errors without inline hints.
- No import/reload mechanism for existing templates via the browser interface (manual paste only).

### 🧭 Planned / Suggested Next Steps
1. **Template Import & Reload:**
   - Add a file upload or "load from textarea" to restore saved templates in the UI.
2. **Advanced Error Reporting:**
   - Highlight template issues within the UI instead of raw JSON output.
3. **Custom Library Editor:**
   - Allow editing of the internal `defaultLibrary` (e.g., add new cities or titles from UI).
4. **Field Dependency Validation:**
   - Ensure composite fields don't refer to non-existent or later-generated fields.
5. **Table Preview Options:**
   - Add HTML/CSV view toggle for better integration/testing scenarios.

---

## 🧠 Design Philosophy

- Prioritize **human-friendly JSON definitions** that are copy/pasteable and version-controllable.
- Ensure **order-dependent generation** for composite fields that depend on other columns.
- Allow mixed data sources: built-in library, user-defined overrides, random value generation.
- Keep output simple and usable: arrays of arrays (optionally with headers) for quick export.

---

## 👩‍💻 Developer Usage Patterns

### From Node.js:
```bash
node demo.js
```
- Uses `demo_template.json` and merges a runtime custom library.
- Output appears as a table in the console.

### From Browser:
- Open `generate.html`
- Define global settings and fields via form controls.
- Optionally open the composite pattern editor to build advanced fields.
- Click **Generate** or **Quick Generate** to produce output.
- Copy or export the result.

---

This priming prompt provides all necessary context to resume feature development, interface enhancements, or back-end integration. It supports a smooth onboarding process for any new developer or AI assistant.
