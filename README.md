# Random Table Generator
This program generates semi-random table data for use in prototyping and development. It reads a **provide template object**, constructs a table based on the defined data fields and auto-generation rules, and returns the output.

## How It Works
1. The program requires a template parameter object that defines:
   - **Static values** (from a list).
   - **Auto-generated values** (random numbers, composite fields, or values from a predefined library).
2. It also loads default internal library which contains predefined lists and reusable **composite formats**.
3. It then generates a table and returns the value.

---

## Usage
See `demo.js`

---

## Template Structure
A template parameter consists of:
- **`settings`**: Defines global settings (e.g., number of rows, headers, index field).
- **`template`**: Defines the fields and their values or auto-generation rules.

### Example Template Object
```json
{
    "settings": {
        "rows": 5,
        "includeHeaders": true,
        "index": {
            "name": "ID",
            "start": 1
        }
    },
    "template": {
        "prefix": {
            "list": ["Mr.", "Mrs.", "Ms.", "Dr."]
        },
        "First Name": {
            "autoGenerate": {
                "type": "library",
                "value": "firstName"
            }
        },
        "Last Name": {
            "autoGenerate": {
                "type": "library",
                "value": "lastName"
            }
        },
        "Age": {
            "autoGenerate": {
                "type": "number",
                "min": 18,
                "max": 65
            }
        },
        "Random ID": {
            "autoGenerate": {
                "type": "random",
                "length": 8,
                "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            }
        },
        "Phone Number": {
            "autoGenerate": {
                "type": "library",
                "value": "phoneFormat"
            }
        },
        "Email": {
            "autoGenerate": {
                "type": "library",
                "value": "emailFormat"
            }
        }
    }
}
```

---

## Settings Explained
| Setting            | Type    | Description |
|--------------------|--------|-------------|
| `rows`            | Number | Number of rows to generate. |
| `includeHeaders`  | Boolean | If `true`, includes column headers in the output. |
| `index`           | Object  | (Optional) Adds an auto-incrementing index field. |

Example (Index Field in `settings`):
```json
"index": {
    "name": "ID",
    "start": 100
}
```
📌 This will create an `ID` column starting from `100` and increasing per row.

---

## Field Value Types
Each field in the `template` section can use **one of the following types**:

### 1. Static List (`list`)
A field can have a predefined list of values.
```json
"Department": {
    "list": ["HR", "Engineering", "Marketing"]
}
```
📌 **A random value** will be chosen from the list.

---

### 2. Auto-Generated Values (`autoGenerate`)
Instead of a fixed list, fields can be **automatically generated**.

#### Supported `autoGenerate` Types:
| Type        | Description |
|------------|-------------|
| `number`   | Generates a random number within a range. |
| `random`   | Generates a random sequence of characters. |
| `library`  | Pulls values from `library.json`. |
| `composite`| Creates a field using multiple parts. |

---

## Auto-Generate Types Explained
### 🔹 `number` (Random Number)
Generates a **random number within a given range**.
```json
"Age": {
    "autoGenerate": {
        "type": "number",
        "min": 18,
        "max": 65
    }
}
```
📌 Generates a **random age between 18 and 65**.

---

### 🔹 `random` (Random String)
Generates a **random alphanumeric or character-based string**.
```json
"Employee ID": {
    "autoGenerate": {
        "type": "random",
        "length": 6,
        "characters": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    }
}
```
📌 Generates a **random 6-character alphanumeric ID**.

---

### 🔹 `library` (Predefined Data)
Retrieves **a value from `library.json`**.
```json
"First Name": {
    "autoGenerate": {
        "type": "library",
        "value": "firstName"
    }
}
```
📌 Pulls a **random first name** from the `"firstName"` list in `library.json`.

Example `library.json`:
```json
{
    "firstName": ["John", "Jane", "Alice", "Bob"],
    "lastName": ["Doe", "Smith", "Brown"]
}
```

---

### 🔹 `composite` (Multiple Parts Combined)
A **composite** field is built using multiple parts:
```json
"Email": {
    "autoGenerate": {
        "type": "composite",
        "patterns": [
            [
                { "type": "field", "value": "First Name" },
                { "type": "static", "value": "." },
                { "type": "field", "value": "Last Name" },
                { "type": "static", "value": "@" },
                { "type": "list", "value": ["example.com", "test.com"] }
            ]
        ]
    }
}
```
📌 Generates an email like **"Alice.Doe@example.com"** using the data from the fields "First Name" and "Last Name".

Your patterns can contain static values, library lookups, values from a list, random numbers and random character sequences. Make sure any fields used in your composite pattern has already been generated.

Specifically you may use:
- **`static`**: Any character string.
- **`library`**: A library lookup.
- **`number`**: A number between `min` and `max`.
- **`random`**: A sequence of random characters from `characters` of length `length`.
- **`list`**: A value from an array of values.
- **`field`**: A previously generated field.


---

## Example Output (`output.json`)
```json
[
    ["ID", "First Name", "Last Name", "Age", "Random ID", "Phone Number", "Email"],
    [100, "Alice", "Doe", 34, "XH3P2Z9Q", "(415) 873-3298", "Alice.Doe@example.com"]
]
```

---

### 🔹 `loremIpsum` (Randomized Text Generation)
Generates **realistic Lorem Ipsum text** for fields like **memos, comments, and descriptions**.  
Instead of a fixed number of words, you can specify **`min`** and **`max`** values to introduce **variation**.

```json
"Memo": {
    "autoGenerate": {
        "type": "loremIpsum",
        "min": 10,
        "max": 25
    }
}
```
📌 **Each row will have a memo field with a random number of words (between 10 and 25).**

#### **Example Generated Output:**
```json
[
    ["Memo"],
    ["Dolor sit amet consectetur adipiscing elit sed do eiusmod."],
    ["Labore et dolore magna aliqua ut enim ad minim veniam quis nostrud."],
    ["Excepteur sint occaecat cupidatat non proident sunt culpa qui officia."]
]
```
🔹 **Ensures varied, natural-looking text data.**  
🔹 **Works well for generating notes, descriptions, or customer feedback fields.**  
🔹 **No two generated texts will be identical.**

---

## Final Notes
- **Field order matters**: Composite fields rely on previously generated values.
- **Library composites are independent** and do not sync with template fields.
- **Modify `library.json`** to easily expand the dataset.
- **TIP: Copy the 'emailFormat' pattern out of `TableGenerator.defaultLibrary`** into your template, replace the library lookups for first and last names with field names from your template (make sure to change the type to `field`) and the emails will realistically match your data!

