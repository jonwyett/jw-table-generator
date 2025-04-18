/***
 * Version 1.0.0 25-03-14
 */

class TableGenerator {
  constructor() {
    // Initialize libraryData with the default library if available.
    this.libraryData = {};
    if (TableGenerator.defaultLibrary && typeof TableGenerator.defaultLibrary === "object") {
      this.libraryData = TableGenerator.defaultLibrary;
    }
  }

  /**
   * Generates a Lorem Ipsum text with the specified number of words.
   * @param {number} wordCount - Number of words to generate.
   * @returns {string} Generated Lorem Ipsum text.
   */
  loremIpsum(wordCount) {
    const loremWords = [
      "Lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
      "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
      "incididunt", "ut", "labore", "et", "dolore", "magna",
      "aliqua", "Ut", "enim", "ad", "minim", "veniam", "quis",
      "nostrud", "exercitation", "ullamco", "laboris", "nisi",
      "ut", "aliquip", "ex", "ea", "commodo", "consequat",
      "Duis", "aute", "irure", "dolor", "in", "reprehenderit",
      "in", "voluptate", "velit", "esse", "cillum", "dolore",
      "eu", "fugiat", "nulla", "pariatur", "Excepteur",
      "sint", "occaecat", "cupidatat", "non", "proident",
      "sunt", "in", "culpa", "qui", "officia", "deserunt",
      "mollit", "anim", "id", "est", "laborum"
    ];
    if (wordCount < 1) {
      return "";
    }
    const result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return result.join(" ") + ".";
  }

  /**
   * Retrieves a value from the library.
   * If the value is composite, it is processed recursively.
   * @param {string} key - The library key.
   * @param {string} columnName - Name of the column.
   * @param {Array} errors - Array to accumulate error messages.
   * @returns {string} A library value or an empty string.
   */
  getLibraryValue(key, columnName, errors) {
    if (!this.libraryData[key]) {
      errors.push("Library key '" + key + "' not found for column '" + columnName + "'.");
      return "";
    }
    if (typeof this.libraryData[key] === "object" && this.libraryData[key].type === "composite") {
      return this.generateAutoValue(this.libraryData[key], columnName, [], [], errors);
    }
    if (!Array.isArray(this.libraryData[key]) || this.libraryData[key].length === 0) {
      errors.push("Library key '" + key + "' is empty or not an array for column '" + columnName + "'.");
      return "";
    }
    return this.libraryData[key][Math.floor(Math.random() * this.libraryData[key].length)];
  }

  /**
   * Generates a value based on autoGenerate settings.
   * @param {Object} autoGenSettings - The autoGenerate config.
   * @param {string} columnName - The column name.
   * @param {Array} currentRow - The current row being built.
   * @param {Array} fullTable - The table data so far.
   * @param {Array} errors - Array to accumulate error messages.
   * @returns {string} The generated value or an empty string on error.
   */
  generateAutoValue(autoGenSettings, columnName, currentRow, fullTable, errors) {
    if (!autoGenSettings.type) {
      errors.push("Missing 'type' in autoGenerate for column '" + columnName + "'.");
      return "";
    }
    if (autoGenSettings.type === "library") {
      return this.getLibraryValue(autoGenSettings.value, columnName, errors);
    }
    if (autoGenSettings.type === "loremIpsum") {
      if (typeof autoGenSettings.min !== "number" || typeof autoGenSettings.max !== "number") {
        errors.push("'loremIpsum' type requires 'min' and 'max' values in column '" + columnName + "'.");
        return "";
      }
      if (autoGenSettings.min > autoGenSettings.max) {
        errors.push("'min' cannot be greater than 'max' in autoGenerate for column '" + columnName + "'.");
        return "";
      }
      const wordCount = Math.floor(Math.random() * (autoGenSettings.max - autoGenSettings.min + 1)) + autoGenSettings.min;
      return this.loremIpsum(wordCount);
    }
    if (autoGenSettings.type === "number") {
      if (typeof autoGenSettings.min !== "number" || typeof autoGenSettings.max !== "number") {
        errors.push("Invalid or missing 'min'/'max' in autoGenerate for column '" + columnName + "'.");
        return "";
      }
      if (autoGenSettings.min > autoGenSettings.max) {
        errors.push("'min' cannot be greater than 'max' in autoGenerate for column '" + columnName + "'.");
        return "";
      }
      return Math.floor(Math.random() * (autoGenSettings.max - autoGenSettings.min + 1)) + autoGenSettings.min;
    }
    if (autoGenSettings.type === "random") {
      if (!autoGenSettings.length || !autoGenSettings.characters) {
        errors.push("'random' type requires 'length' and 'characters' in column '" + columnName + "'.");
        return "";
      }
      let result = "";
      for (let i = 0; i < autoGenSettings.length; i++) {
        result += autoGenSettings.characters[Math.floor(Math.random() * autoGenSettings.characters.length)];
      }
      return result;
    }
    if (autoGenSettings.type === "composite") {
      if (!Array.isArray(autoGenSettings.patterns) || autoGenSettings.patterns.length === 0) {
        errors.push("'patterns' must be a non-empty array in autoGenerate for column '" + columnName + "'.");
        return "";
      }
      
      // Handle weighted patterns
      let pattern;
      if (autoGenSettings.patterns.some(p => p.weight !== undefined)) {
        // Calculate total weight and normalize weights
        let totalWeight = 0;
        const weightedPatterns = autoGenSettings.patterns.map(p => {
          const weight = p.weight !== undefined ? p.weight : 1;
          totalWeight += weight;
          return { pattern: p.pattern || p, weight };
        });
        
        // Generate a random value between 0 and totalWeight
        const randomValue = Math.random() * totalWeight;
        
        // Select pattern based on weight
        let cumulativeWeight = 0;
        for (const weightedPattern of weightedPatterns) {
          cumulativeWeight += weightedPattern.weight;
          if (randomValue <= cumulativeWeight) {
            pattern = weightedPattern.pattern;
            break;
          }
        }
      } else {
        // Fallback to original behavior if no weights are defined
        pattern = autoGenSettings.patterns[Math.floor(Math.random() * autoGenSettings.patterns.length)];
      }
      
      let result = "";
      for (let k = 0; k < pattern.length; k++) {
        const part = pattern[k];
        if (!part.type) {
          errors.push("Missing 'type' in pattern part for column '" + columnName + "'.");
          return "";
        }
        if (part.type === "library") {
          result += this.getLibraryValue(part.value, columnName, errors);
        } else if (part.type === "static") {
          result += part.value || "";
        } else if (part.type === "field") {
          const fieldIndex = fullTable[0] ? fullTable[0].indexOf(part.value) : -1;
          if (fieldIndex === -1) {
            errors.push("Referenced field '" + part.value + "' not found for column '" + columnName + "'.");
            return "";
          }
          result += currentRow[fieldIndex] || "";
        } else if (part.type === "list") {
          result += part.value[Math.floor(Math.random() * part.value.length)];
        } else if (part.type === "random") {
          if (!part.length || !part.characters) {
            errors.push("'random' part must have 'length' and 'characters' properties in column '" + columnName + "'.");
            return "";
          }
          let temp = "";
          for (let j = 0; j < part.length; j++) {
            temp += part.characters[Math.floor(Math.random() * part.characters.length)];
          }
          result += temp;
        } else if (part.type === "number") {
          if (typeof part.min !== "number" || typeof part.max !== "number") {
            errors.push("'number' part must have 'min' and 'max' properties in column '" + columnName + "'.");
            return "";
          }
          if (part.min > part.max) {
            errors.push("'min' cannot be greater than 'max' in number part for column '" + columnName + "'.");
            return "";
          }
          result += Math.floor(Math.random() * (part.max - part.min + 1)) + part.min;
        } else if (part.type === "date") {
          // Now support a nested date type in composite patterns:
          result += this.generateDateValue(part, columnName, errors);
        } else {
          errors.push("Unsupported part type '" + part.type + "' in column '" + columnName + "'.");
          return "";
        }
      }
      return result;
    }

    // New branch for "date" type
    if (autoGenSettings.type === "date") {
      return this.generateDateValue(autoGenSettings, columnName, errors);
    }
    errors.push("Unsupported autoGenerate type '" + autoGenSettings.type + "' for column '" + columnName + "'.");
    return "";
  }

  // New helper function to generate a random Date between "start" and "end"
  generateDateValue(autoGenSettings, columnName, errors) {
    // Parse 'start' date (default: Unix epoch)
    let startDate;
    if (autoGenSettings.start) {
      startDate = new Date(autoGenSettings.start);
      if (isNaN(startDate.getTime())) {
        errors.push("'start' parameter in date type for column '" + columnName + "' is not a valid date.");
        return "";
      }
    } else {
      startDate = new Date(0); // Unix epoch
    }

    // Parse 'end' date (default: 5 years from current date)
    let endDate;
    if (autoGenSettings.end) {
      endDate = new Date(autoGenSettings.end);
      if (isNaN(endDate.getTime())) {
        errors.push("'end' parameter in date type for column '" + columnName + "' is not a valid date.");
        return "";
      }
    } else {
      let now = new Date();
      endDate = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    if (startDate.getTime() > endDate.getTime()) {
      errors.push("'start' date is after 'end' date for column '" + columnName + "'.");
      return "";
    }

    // Generate a random date within the interval
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);

    // Get the format. Default is "UTC" if not provided.
    const format = autoGenSettings.format ? autoGenSettings.format : "UTC";

    // If format is exactly "UTC", return the full UTC string.
    if (format === "UTC") {
      return randomDate.toUTCString();
    } else {
      // Otherwise, return the formatted date using a custom format
      return this.formatDate(randomDate, format);
    }
  }

  // New helper function to format the date based on a custom format string
  formatDate(date, formatString) {
    const fullMonthNames = [ "January", "February", "March", "April", "May", "June",
                             "July", "August", "September", "October", "November", "December" ];
    const abbreviatedMonthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    const fullWeekdayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
    const abbreviatedWeekdayNames = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
    
    // Helper function to pad numbers with leading zeros.
    function pad(n, width) {
      return n.toString().padStart(width, "0");
    }
    
    // Define tokens and their corresponding handlers.
    const tokens = [
      { token: "YYYY", handler: d => d.getFullYear().toString() },
      { token: "MMMM", handler: d => fullMonthNames[d.getMonth()] },
      { token: "dddd", handler: d => fullWeekdayNames[d.getDay()] },
      { token: "MMM",  handler: d => abbreviatedMonthNames[d.getMonth()] },
      { token: "ddd",  handler: d => abbreviatedWeekdayNames[d.getDay()] },
      { token: "YY",   handler: d => d.getFullYear().toString().slice(-2) },
      { token: "MM",   handler: d => pad(d.getMonth() + 1, 2) },
      { token: "DD",   handler: d => pad(d.getDate(), 2) },
      { token: "HH",   handler: d => pad(d.getHours(), 2) },
      { token: "hh",   handler: d => { let h = d.getHours() % 12; if (h === 0) h = 12; return pad(h, 2); } },
      { token: "mm",   handler: d => pad(d.getMinutes(), 2) },
      { token: "ss",   handler: d => pad(d.getSeconds(), 2) },
      { token: "M",    handler: d => (d.getMonth() + 1).toString() },
      { token: "D",    handler: d => d.getDate().toString() },
      { token: "H",    handler: d => d.getHours().toString() },
      { token: "h",    handler: d => { let h = d.getHours() % 12; if (h === 0) h = 12; return h.toString(); } },
      { token: "m",    handler: d => d.getMinutes().toString() },
      { token: "s",    handler: d => d.getSeconds().toString() },
      { token: "A",    handler: d => d.getHours() < 12 ? "AM" : "PM" },
      { token: "a",    handler: d => d.getHours() < 12 ? "am" : "pm" }
    ];
    
    // Sort tokens in descending order of length to match the longest tokens first.
    const sortedTokens = tokens.slice().sort((a, b) => b.token.length - a.token.length);
    
    let result = "";
    let i = 0;
    
    // Process the format string one character at a time.
    while (i < formatString.length) {
      let matched = false;
      
      // Check if any token matches starting at the current position.
      for (let j = 0; j < sortedTokens.length; j++) {
        const tokenStr = sortedTokens[j].token;
        if (formatString.substr(i, tokenStr.length) === tokenStr) {
          result += sortedTokens[j].handler(date);
          i += tokenStr.length; // Skip over the token
          matched = true;
          break;
        }
      }
      
      // If no token matched, add the literal character.
      if (!matched) {
        result += formatString[i];
        i++;
      }
    }
    
    return result;
  }

  /**
   * Builds an error table from an array of error messages.
   * @param {Array} errors - The array of error messages.
   * @returns {Array} A table containing the errors.
   */
  buildErrorTable(errors) {
    const table = [];
    table.push(["Errors"]);
    for (let i = 0; i < errors.length; i++) {
      table.push([errors[i]]);
    }
    return table;
  }

  /**
   * Generates a table based on the provided template.
   * The template is expected to contain both settings and a template definition.
   * File loading for templates or library merging has been removed.
   * @param {Object} template - The table template.
   * @param {Object} [customLibrary] - (Ignored) Optional library overrides.
   * @returns {Array} The generated table or an error table.
   */
  generate(template, customLibrary) {
    const errors = [];
    if (!template || typeof template !== "object") {
      errors.push("Invalid or missing template.");
      return this.buildErrorTable(errors);
    }
    if (customLibrary && typeof customLibrary === "object") {
      this.libraryData = Object.assign(this.libraryData, customLibrary);
    }
    const settings = template.settings || {};
    const numRows = settings.rows || 10;
    const includeHeaders = settings.includeHeaders || false;
    const indexSettings = settings.index || null;
    const tmpl = template.template;
    if (!tmpl || typeof tmpl !== "object") {
      errors.push("Invalid template structure in provided template.");
      return this.buildErrorTable(errors);
    }
    let columns = Object.keys(tmpl);
    let indexName = "";
    let startIndex = 1;
    if (indexSettings && indexSettings.name) {
      indexName = indexSettings.name;
      startIndex = Number.isInteger(indexSettings.start) ? indexSettings.start : 1;
      columns = [indexName].concat(columns);
    }
    const table = [];
    if (includeHeaders) {
      table.push(columns);
    }
    const tmplKeys = (indexSettings && indexSettings.name) ? Object.keys(tmpl) : columns;
    for (let i = 0; i < numRows; i++) {
      const row = [];
      if (indexSettings && indexSettings.name) {
        row.push(startIndex + i);
      }
      for (let j = 0; j < tmplKeys.length; j++) {
        const column = tmplKeys[j];
        const field = tmpl[column];
        let value = "";
        if (field && field.autoGenerate) {
          value = this.generateAutoValue(field.autoGenerate, column, row, table, errors);
        } else if (field && Array.isArray(field.list) && field.list.length > 0) {
          value = field.list[Math.floor(Math.random() * field.list.length)];
        }
        row.push(value);
      }
      table.push(row);
    }
    if (errors.length > 0) {
      return this.buildErrorTable(errors);
    }
    return table;
  }
}

// Export as a Node module if applicable.
if (typeof module !== "undefined" && module.exports) {
  module.exports = TableGenerator;
}

// Export as a global variable if in a browser context.
if (typeof window !== "undefined") {
  window.TableGenerator = TableGenerator;
}


// Static property for the default library.
// Users can assign their default library data here.
TableGenerator.defaultLibrary = 
{
  "firstName": [
      "Alice", "Bob", "Cindy", "David", "Eleanor", "Frank", "Grace", "Hank",
      "Ivy", "Jack", "Katherine", "Liam", "Mia", "Noah", "Olivia", "Peter",
      "Quinn", "Rachel", "Samuel", "Tina", "Ulysses", "Victoria", "Walter",
      "Xander", "Yasmine", "Zachary", "Amber", "Brandon", "Charlotte",
      "Derek", "Emma", "Felix", "Gabriel", "Hannah", "Isaac", "Jasmine",
      "Kevin", "Laura", "Michael", "Natalie", "Oscar", "Penelope", "Quincy",
      "Riley", "Sebastian", "Taylor", "Uriah", "Vanessa", "Wesley", "Xavier",
      "Yvette", "Zane", "Annie", "Beau", "Caroline", "Damien", "Elijah",
      "Fiona", "George", "Heather", "Ian", "Juliet", "Kyle", "Lily", "Mason",
      "Nora", "Owen", "Paige", "Quinton", "Reagan", "Scott", "Tabitha",
      "Ulrich", "Vivian", "Wayne", "Xiomara", "Yosef", "Zelda", "Aaron",
      "Brianna", "Caleb", "Delilah", "Edward", "Faith", "Gavin", "Harper",
      "Isabelle", "Jonah", "Kayla", "Logan", "Maddison", "Nicolas", "Opal",
      "Presley", "Quiana", "Raymond", "Sylvia", "Tobias", "Ursula", "Victor"
    ],
  "lastName": [
      "Anderson", "Baker", "Carter", "Dawson", "Evans", "Fletcher", "Garcia",
      "Henderson", "Ingram", "Jackson", "Kennedy", "Lewis", "Mitchell", 
      "Nelson", "Owens", "Patterson", "Quinn", "Richardson", "Stevens",
      "Thompson", "Underwood", "Vargas", "Wallace", "Xavier", "Young", 
      "Zimmerman", "Adams", "Black", "Coleman", "Daniels", "Edwards", 
      "Foster", "Griffin", "Harris", "Irwin", "Jefferson", "King", "Lopez",
      "Morris", "Norton", "Ortega", "Powell", "Quigley", "Reynolds", 
      "Sullivan", "Taylor", "Upton", "Vaughn", "Williams", "Xander", "Yates",
      "Zuniga", "Armstrong", "Brown", "Clark", "Dixon", "Ellis", "Ferguson",
      "Gonzalez", "Hudson", "Iverson", "Jennings", "Knight", "Lawson",
      "Martin", "Navarro", "O'Connor", "Porter", "Quarles", "Rodriguez",
      "Simmons", "Turner", "Ulrich", "Valentine", "Watson", "Xenakis",
      "Yarbrough", "Zeller", "Abbott", "Bennett", "Cunningham", "Drake",
      "Emerson", "Fitzgerald", "Green", "Holland", "Isaiah", "Johnson",
      "Kirkland", "Larson", "Mendoza", "Newton", "Osborne", "Parker",
      "Quintana", "Randolph", "Shepherd", "Thatcher", "Urbano", "Vega"
    ],
  "organization_long": [
      "AetherTech Solutions", "BrightWave Analytics", "CyberNova Systems",
      "DynamoCorp", "Echelon Dynamics", "Fluxion Industries", "Glacier Innovations",
      "Horizon Synergy", "Ionix Technologies", "Juno Ventures", "Keystone Labs",
      "Luminex Enterprises", "Momentum Works", "Nebula Nexus", "OmniCore Solutions",
      "Pinnacle Systems", "Quantum Apex", "Radiant Edge Technologies",
      "Solaris Networks", "TerraGlobe Industries", "Umbra Tech", "Vertex Dynamics",
      "Waveform Innovations", "Xenith Labs", "YieldTech Solutions",
      "Zenith Visionaries", "Ardent Cyber", "BlueSky Robotics", "Cloudborne AI",
      "DataForge Systems", "EchoMind Analytics", "FusionGrid Technologies",
      "Genesis AI", "HyperLink Solutions", "InnovaPeak", "Jovian Enterprises",
      "Kinetic Synergy", "Launchpad Dynamics", "Metron Systems", "Nimbus Ventures",
      "Octane Innovations", "Polaris Computing", "Quirx Labs", "Ripple Systems",
      "Skyward Robotics", "Titan AI", "UltraCore Networks", "Vortex Enterprises",
      "WhiteHorizon Tech", "XyloSoft Solutions", "YellowStone Digital",
      "Zenova Analytics", "AlphaGrit Ventures", "Bravura Systems",
      "Celestial Technologies", "DeepCore AI", "Emergent Innovations",
      "Firelight Dynamics", "Guardian Robotics", "Helix Computation",
      "Intrepid Labs", "Jetstream Analytics", "Kraken Systems", "LuxeByte Tech",
      "Magnetron Enterprises", "NeuralSphere", "Optimum Nexus", "Prometheon AI",
      "Quasar Robotics", "RocketByte Solutions", "SynergyForge", "Trailblaze AI",
      "Uplift Technologies", "Vigilant Innovations", "Wavelength Labs",
      "Xcelerate Systems", "YieldEdge Solutions", "Zypher Networks",
      "AeroFlux Computing", "BlazeCore AI", "Cipher Dynamics", "Driftwave Robotics",
      "Everlight Industries", "Frontier Systems", "Gigavolt Networks",
      "Hypernova AI", "Intelleq Labs", "Jumpstart Computing", "Kepler Cyber",
      "Lyra Systems", "Momentum AI", "NeonEdge Dynamics", "Omicron Labs",
      "Perseus Digital", "Quintessential Tech", "RogueByte Ventures",
      "Starbound Technologies", "TurboLink Networks", "Unison Robotics",
      "Voyager Computing", "WarpDrive Solutions", "Xentrix AI", "ZenAI Systems"
    ],
  "organization": [
      "Aetheris", "Bravora", "Creston", "Dynavox", "Eldara", "Fluxis", 
      "Gravion", "Harmonia", "Inspira", "Jovexa", "Kinetra", "Lumora", 
      "Meridian", "Nexora", "Omnivex", "Pioneera", "Quorix", "Ridgeway", 
      "Solvex", "Trionis", "Uplora", "Vantora", "Weyland", "Xyphos", 
      "Zenova", "Arctis", "Bellathorn", "Cindara", "Draymont", "Everion", 
      "Fathomix", "Glavion", "Harbren", "Isovex", "Jalvora", "Krysolis", 
      "Landspar", "Montessa", "Novarix", "Orchelon", "Prexa", "Quailis", 
      "Revano", "Sterion", "Tandara", "Ursalis", "Vexora", "Willoby", 
      "Xentris", "Yardleigh", "Zyphos"
    ],
  "department": [
      "Human Resources", "Engineering", "Research & Development",
      "Marketing", "Sales", "Customer Support", "Finance",
      "Information Technology", "Legal", "Operations",
      "Product Management", "Supply Chain", "Quality Assurance",
      "Compliance", "Public Relations", "Security", "Risk Management",
      "Procurement", "Business Development", "Facilities Management",
      "Corporate Strategy", "Training & Development",
      "Data Analytics", "Logistics", "Creative Services"
    ],
  "emailDomain": [
      "example.com", "test.com", "company.org", "domain.com", "email.net",
      "provider.io", "site.com", "web.net", "host.org", "server.com",
      "cloud.net", "data.org", "info.com", "mail.net", "net.com",
      "org.com", "webpage.org", "website.com", "world.net", "zone.org"
    ],
  "country": [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
      "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
      "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
      "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
      "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
      "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
      "Canada", "Central African Republic", "Chad", "Chile", "China",
      "Colombia", "Comoros", "Congo, Democratic Republic of the",
      "Congo, Republic of the", "Costa Rica", "Croatia", "Cuba", "Cyprus",
      "Czech Republic", "Denmark", "Djibouti", "Dominica",
      "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
      "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
      "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
      "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
      "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
      "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
      "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North",
      "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
      "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
      "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
      "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
      "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
      "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
      "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
      "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama",
      "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
      "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
      "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa",
      "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
      "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
      "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
      "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
      "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
      "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
      "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
      "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
      "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ],
  "country_top": [
      "China", "India", "United States", "Indonesia", "Pakistan", "Nigeria",
      "Brazil", "Bangladesh", "Russia", "Mexico", "Japan", "Ethiopia",
      "Philippines", "Egypt", "Vietnam", "DR Congo", "Turkey", "Iran",
      "Germany", "Thailand", "United Kingdom", "France", "Italy", "Tanzania",
      "South Africa", "Myanmar", "South Korea", "Colombia", "Kenya", "Spain",
      "Argentina", "Uganda", "Ukraine", "Algeria", "Sudan", "Iraq",
      "Afghanistan", "Poland", "Canada", "Morocco", "Saudi Arabia",
      "Uzbekistan", "Peru", "Angola", "Malaysia", "Mozambique", "Ghana",
      "Yemen", "Nepal", "Venezuela"
    ],
  "city" : [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
      "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
      "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
      "Indianapolis", "San Francisco", "Seattle", "Denver", "Washington",
      "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City",
      "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
      "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa",
      "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami",
      "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland",
      "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans"
    ],
  "city_int" : [
      "Tokyo", "Jakarta", "Delhi", "Guangzhou-Foshan", "Mumbai", "Manila",
      "Shanghai", "Seoul-Incheon", "Cairo", "Mexico City", "Kolkata",
      "São Paulo", "New York", "Karachi", "Dhaka", "Beijing", "Lagos",
      "Bangkok", "Moscow", "Osaka-Kobe-Kyoto", "Istanbul", "Kinshasa",
      "Lahore", "Tehran", "Rio de Janeiro", "Shenzhen", "Tianjin",
      "Chennai", "Bangalore", "London", "Lima", "Bogotá", "Ho Chi Minh City",
      "Hong Kong", "Hyderabad", "Bangkok", "Los Angeles", "Buenos Aires",
      "Chongqing", "Nairobi", "Ahmedabad", "Kuala Lumpur", "Chicago",
      "Paris", "Santiago", "Riyadh", "Singapore", "Baghdad", "Toronto"
    ],
  "state": [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ],
  "street": [
      "Main Street", "Oak Street", "Maple Avenue", "Cedar Lane",
      "Pine Street", "Elm Street", "Washington Avenue", "Lincoln Road",
      "Jefferson Boulevard", "Park Avenue", "Broadway", "Sunset Drive",
      "Riverside Road", "Highland Avenue", "Chestnut Street",
      "Willow Lane", "Lakeview Drive", "Meadow Road", "Birch Street",
      "Spring Street", "Sycamore Lane", "Hickory Drive", "Mulberry Street",
      "Ash Avenue", "Juniper Road", "Walnut Street", "Magnolia Drive",
      "Holly Lane", "Cherry Street", "Cottonwood Drive", "Dogwood Road",
      "Redwood Avenue", "Cypress Lane", "Evergreen Drive", "Forest Road",
      "Golden Avenue", "Silver Street", "Hilltop Drive", "Mountain Road",
      "Valley Street", "Prairie Lane", "Riverbend Drive", "Seaside Avenue",
      "Coastal Road", "Oceanview Drive", "Bay Street", "Harbor Lane",
      "Lakeshore Drive", "Canyon Road", "Summit Avenue"
    ],
  "zipCode": [
      "00501", "10001", "20001", "30301", "33101", "60601", "73301",
      "85001", "94101", "99501", "10118", "15201", "19104", "02108",
      "60611", "77001", "90001", "48201", "19103", "20005", "85004",
      "60603", "55401", "02114", "10036", "30303", "90012", "94105",
      "75201", "78701", "44101", "46204", "98101", "20036", "10022",
      "10007", "63101", "14604", "19106", "37203", "33130", "46225",
      "94133", "02116", "21202", "10019", "80202", "49503", "68102",
      "53703", "04101"
    ],
  "regions": [
      "Africa",
      "East Asia and the Pacific",
      "Europe and Eurasia",
      "Near East (Middle East and North Africa)",
      "South and Central Asia",
      "Western Hemisphere"
    ],
  "regions_abv": [
      "AF", "EAP", "EUR", "NEA", "SCA", "WHA"
  ],
  "jobTitle": [
      "Software Engineer", "Project Manager", "Data Analyst", 
      "Marketing Specialist", "Human Resources Manager", "Sales Associate", 
      "Financial Analyst", "Graphic Designer", "Customer Service Representative", 
      "Mechanical Engineer", "Electrical Engineer", "Civil Engineer", 
      "IT Support Specialist", "Operations Manager", "Product Manager", 
      "UX/UI Designer", "Accountant", "Medical Assistant", "Registered Nurse", 
      "Physician", "Pharmacist", "Construction Manager", "Architect", 
      "Business Analyst", "Legal Consultant", "Paralegal", "Administrative Assistant", 
      "Security Officer", "Social Media Manager", "Copywriter", "Editor", 
      "Technical Writer", "Event Coordinator", "HR Recruiter", "Cybersecurity Analyst", 
      "Network Administrator", "Database Administrator", "AI Researcher", 
      "Warehouse Supervisor", "Retail Store Manager", "Restaurant Manager", 
      "Chef", "Bartender", "Flight Attendant", "Pilot", "Logistics Coordinator", 
      "Economist", "Biologist", "Chemist", "Research Scientist", "Mechanical Technician"
    ],
  "prefix": [
      "Mr.", "Mrs.", "Ms.", "Miss", "Dr.", "Prof.", "Rev.", "Hon.", 
      "Sir", "Madam", "Mx.", "Master", "Dame", "Lord", "Lady", 
      "Fr.", "Sr.", "Br.", "Rabbi", "Pastor", "Imam", "Sheikh", 
      "Cardinal", "Bishop", "Archbishop", "Dean", "Judge", "Justice", 
      "President", "Chancellor", "Governor", "Mayor", "Ambassador", 
      "General", "Colonel", "Major", "Captain", "Lieutenant", "Sergeant", 
      "Chief", "Commander", "Officer", "Detective"
    ],
  "prefix_simple": [
      "Mr.", "Mrs.", "Ms.", "Miss", "Dr."
  ],
  "suffix": [
      "Jr.", "Sr.", "II", "III", "IV", "Esq.", "PhD", "MD", "DDS", 
      "DVM", "DO", "DC", "JD", "MPH", "MSW", "MBA", "MA", "MS", 
      "MFA", "MEd", "MSc", "PharmD", "PsyD", "EdD", "EngD", "DPhil", 
      "DSc", "LLD", "DCL", "ThD", "Dr.h.c.", "Prof.", "Rev.", "Hon.", 
      "Sir", "Dame", "Lord", "Lady", "Fr.", "Sr.", "Br.", "Rabbi", 
      "Pastor", "Imam", "Sheikh", "Cardinal", "Bishop", "Archbishop", 
      "Dean", "Judge", "Justice", "President", "Chancellor", "Governor", 
      "Mayor", "Ambassador", "General", "Colonel", "Major", "Captain", 
      "Lieutenant", "Sergeant", "Chief", "Commander", "Officer", "Detective"
    ],
  "fullName_common": {
      "type": "composite",
      "patterns": [
          [
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "lastName"}
          ]
      ]  
  },
  "fullName_formal": {
      "type": "composite",
      "patterns": [
          [
              {"type": "library", "value": "lastName"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "firstName"}
          ],
          [
              {"type": "library", "value": "lastName"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "middleName"}
          ]
      ]  
  },
  "fullName_varied": {
      "type": "composite",
      "patterns": [
          [
              {"type": "library", "value": "prefix_simple"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "lastName"}
          ],
          [
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "lastName"}
          ],
          [
              {"type": "library", "value": "lastName"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "firstName"}
          ],
          [
              {"type": "library", "value": "lastName"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "firstName"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "middleName"}
          ]

      ]
  },
  "address": {
      "type": "composite",
      "patterns": [
          [
              {"type": "number", "min": 1, "max": 99},
              {"type": "static", "value": " "},
              {"type": "library", "value": "street"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "city"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "state"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "zipCode"}
          ],
          [
              {"type": "number", "min": 10, "max": 150},
              {"type": "static", "value": "-"},
              {"type": "number", "min": 10, "max": 99},
              {"type": "static", "value": " "},
              {"type": "library", "value": "street"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "city"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "state"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "zipCode"}
          ],
          [
              {"type": "number", "min": 150, "max": 800},
              {"type": "static", "value": " "},
              {"type": "library", "value": "street"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "city"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "state"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "zipCode"}
          ],
          [
              {"type": "number", "min": 1000, "max": 8000},
              {"type": "static", "value": " "},
              {"type": "library", "value": "street"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "city"},
              {"type": "static", "value": ", "},
              {"type": "library", "value": "state"},
              {"type": "static", "value": " "},
              {"type": "library", "value": "zipCode"}
          ]
      ]
  },
  "phoneFormat": {
      "type": "composite",
      "patterns": [
          [
              { "type": "random", "length": 1, "characters": "23456789" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": "-" },
              { "type": "random", "length": 1, "characters": "23456789" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": "-" },
              { "type": "random", "length": 4, "characters": "0123456789" }
          ],
          [
              { "type": "static", "value": "(" },
              { "type": "random", "length": 1, "characters": "23456789" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": ") " },
              { "type": "random", "length": 1, "characters": "23456789" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": "-" },
              { "type": "random", "length": 4, "characters": "0123456789" }
          ]
      ]
  },

  "emailFormat": {
      "type": "composite",
      "patterns": [
          [
              { "type": "library", "value": "firstName" },
              { "type": "static", "value": "." },
              { "type": "library", "value": "lastName" },
              { "type": "static", "value": "@" },
              { "type": "library", "value": "emailDomain" }
          ],
          [
              { "type": "library", "value": "firstName" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": "@" },
              { "type": "library", "value": "emailDomain" }
          ],
          [
              { "type": "library", "value": "firstName" },
              { "type": "static", "value": "-" },
              { "type": "library", "value": "lastName" },
              { "type": "static", "value": "@" },
              { "type": "library", "value": "emailDomain" }
          ],
          [
              { "type": "library", "value": "lastName" },
              { "type": "random", "length": 2, "characters": "0123456789" },
              { "type": "static", "value": "@" },
              { "type": "library", "value": "emailDomain" }
          ]
      ]
  }
}
