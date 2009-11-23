//
// Copyright (c) 2009 Sascha Depold (http://depold.com)
//

if((typeof Autocompleter == 'undefined') || (typeof Autocompleter.Local == "undefined"))
  throw("Please include the script.aculo.us framework.");

Autocompleter.Local.MultiContent = Class.create(Autocompleter.Local, {
  dataSets: null,
  identifierAttribute: null,
  imageAttribute: null,
  valueAttributes: null,
  lastSelection: null,
  onSelect: null,
  displayTextFunction: null,
  
  /*
    Function: initialize
    Is called when creating an Autocompleter.Local.MutliContent object.
    
    Parameters:
      element - The DOM element, which will be observed for typing. Should be an input text field.
      update - The DOM element, which will contain the autocompletion hints. Should be a DIV element.
      dataSets - An array of objects.
      options - An option object.
    
    Returns:
      An Autocompleter.Local.MultiContent object.
  */
  initialize: function($super, element, update, dataSets, options) {
    if(typeof options == "undefined") options = {};
    this.dataSets = dataSets;
    if(options.generateIDs) this.generateIDs();
    
    this.setIdentifier(options.identifier);
    this.valueAttributes = Object.isArray(options.value) ? options.value : [options.value];
    this.imageAttribute = options.image;
    this.onSelect = options.onSelect;
    this.displayTextFunction = options.getDisplayText || this.getDisplayText;
      
    options.selector = this.selector;

    $super(element, update, this.getAutocompleterHints(), options);
  },
  
  /*
    Function: generateIDs
    Generates the attribute 'id'. Each dataset will get a numeric value, according to its position in the dataset array.
  */
  generateIDs: function() {
    this.dataSets.each(function(dataSet, index) { dataSet["id"] = index; });
  },
  
  /*
    Function: setIdentifier
    Sets the identifier of a dataset. As default this function will walk through all datasets and will check, if each entry has an 'id' attribute.
    If so: The identifier will be the 'id' attribute. Otherwise there won't be a default value. If an identifier is passed, this one will be taken.
    
    Parameters:
      identifier - An attribute of the dataset objects, which is able to identify an entry among all other.
  */
  setIdentifier: function(identifier) {
    if(typeof identifier == "undefined") {
      var defaultIdentifier = "id";
      var identifierArray = this.dataSets.map(function(value) { return value[defaultIdentifier] });
      if(identifierArray.indexOf(undefined) == -1)
        this.identifierAttribute = defaultIdentifier;
    } else
      this.identifierAttribute = identifier;
  },
  
  /*
    Function: getAutocompleterHints
    Generates an array of hint string.
    
    Returns:
      An array of hint string for the default Autocompleter.Local.
  */
  getAutocompleterHints: function() {
    var _this = this;
    return this.dataSets.map(function(dataSet) { return _this.getAutocompleterHint(dataSet); });
  },
  
  /*
    Function: getAutocompleterHint
    Generates a single hint string.
    
    Parameters:
      dataSet - A single dataset entry.
      
    Returns:
      A single hint string.
  */
  getAutocompleterHint: function(dataSet) {
    var generation = new Template("#{image} <span class='displayValue'> #{value} </span> #{identifier}");
    var replacements = {};
    
    if(this.valueAttributes) replacements["value"] = this.displayTextFunction(dataSet);
    if(this.imageAttribute && dataSet[this.imageAttribute]) replacements["image"] = '<img src="' + dataSet[this.imageAttribute] + '">';
    if(this.identifierAttribute && (typeof dataSet[this.identifierAttribute] != "undefined"))
      replacements["identifier"] = "<span style='display: none' class='identifierValue'>" + dataSet[this.identifierAttribute] + "</span>";

    return generation.evaluate(replacements);
  },
  
  /*
    Function: getDisplayText
    Generates the text for a single autocompleter hint.
   
    Parameters:
      dataSet - A single dataset entry.
    
    Returns:
      Text for autocompleter hint.
  */
  getDisplayText: function(dataSet) {
    return this.valueAttributes.map(function(valueAttribute) {
      return dataSet[valueAttribute];
    }).join(", ");
  },
  
  /*
    Function: identifyDataSet
    Chooses one of the dataSets by the passed displayText. Will take the identifier for this selection if available. Otherwise each entry will be compared with its generated displayText.
    
    Parameters:
      displayText - The text of one of generated autocompletion hints.
      
    Returns:
      The matching dataset.
  */
  identifyDataSet: function(displayText) {
    var attribute = this.valueAttributes;
    var _this = this;
    
    if(this.identifierAttribute)
      attribute = this.identifierAttribute;

    return this.dataSets.detect(function(dataSet) {
      if(Object.isArray(attribute))
        return _this.displayTextFunction(dataSet) == displayText;
      else
        return dataSet[attribute] == displayText;
    });
  },
  
  /*
    Function: getLastSelection
      A wrapper for the last selected dataset.
    
    Returns:
      The last selected dataset.
  */
  getLastSelection: function() {
    return this.lastSelection;
  },
  
  /*
    Function: updateElement
    Gets called, if one of the recommended hints was selected. Will call the 'onSelect' function specified by the user, if defined.
    
    Parameters:
      selection - The LI element which was be clicked.
  */
  updateElement: function(selection) {
    var displayValue = selection.down(".displayValue").innerHTML.stripTags().strip();
    var identifierValue = selection.down(".identifierValue") ? selection.down(".identifierValue").innerHTML : null;

    this.element.value = displayValue;
    this.lastSelection = this.identifyDataSet(identifierValue || displayValue);
    if(this.onSelect) this.onSelect(this.lastSelection);
  },

  /*
    Function: selector
      This function is basically a copy of the script.aculo.us local autocompleter selector. It was adjusted to the different display values.
    
    Parameters:
      instance - An autocompleter object.
    
    Returns:
      An unordered list, which contains the autocompleter hints.
  */
  selector: function(instance) {
    var ret       = []; // Beginning matches
    var partial   = []; // Inside matches
    var entry     = instance.getToken();
    var count     = 0;

    for (var i = 0; i < instance.options.array.length && ret.length < instance.options.choices ; i++) {
      var elem = instance.options.array[i];
      elem.match(/<span.*displayValue.*?>(.*?)<\/span>/)
      var displayValue = (RegExp.$1).strip();
      var foundPos = instance.options.ignoreCase ? displayValue.toLowerCase().indexOf(entry.toLowerCase()) : displayValue.indexOf(entry);

      while (foundPos != -1) {
        if (foundPos == 0 && displayValue.length != entry.length) {
          var tip = "<strong>" + displayValue.substr(0, entry.length) + "</strong>" + displayValue.substr(entry.length);
          ret.push("<li>" + elem.replace(displayValue, tip) + "</li>");
          break;
        } else if (entry.length >= instance.options.partialChars && instance.options.partialSearch && foundPos != -1) {
          if (instance.options.fullSearch || /\s/.test(displayValue.substr(foundPos-1,1))) {
            var tip = displayValue.substr(0, foundPos) + "<strong>" + displayValue.substr(foundPos, entry.length) + "</strong>" + displayValue.substr(foundPos + entry.length);
            partial.push("<li>" + elem.replace(displayValue, tip) + "</li>");
            break;
          }
        }

        foundPos = instance.options.ignoreCase ? displayValue.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) : displayValue.indexOf(entry, foundPos + 1);
      }
    }
    if (partial.length)
      ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
    return "<ul>" + ret.join('') + "</ul>";
  }
});