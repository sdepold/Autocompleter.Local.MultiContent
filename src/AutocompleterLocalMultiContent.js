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
  onSelect: null,
  lastSelection: null,
  
  initialize: function($super, element, update, dataSets, options) {
    if(typeof options == "undefined") options = {};
    this.dataSets = dataSets;
    if(options.generateIDs) this.generateIDs();
    this.setIdentifier(options.identifier);
    this.valueAttributes = Object.isArray(options.value) ? options.value : [options.value];
    this.imageAttribute = options.image;
    this.onSelect = options.onSelect;
    options.selector = this.selector;

    $super(element, update, this.extractValues(), options);
  },
  
  generateIDs: function() {
    this.dataSets.each(function(dataSet, index) { dataSet["id"] = index; });
  },
  
  setIdentifier: function(identifier) {
    if(typeof identifier == "undefined") {
      var defaultIdentifier = "id";
      var identifierArray = this.dataSets.map(function(value) { return value[defaultIdentifier] });
      if(identifierArray.indexOf(undefined) == -1)
        this.identifierAttribute = defaultIdentifier;
    } else
      this.identifierAttribute = identifier;
  },
  
  updateElement: function(selection) {
    var displayValue = selection.down(".displayValue").innerHTML.stripTags().strip();
    var identifierValue = selection.down(".identifierValue") ? selection.down(".identifierValue").innerHTML : null;

    this.element.value = displayValue;
    this.lastSelection = this.findValue(identifierValue || displayValue);
    if(this.onSelect) this.onSelect(this.lastSelection);
  },
  
  extractValues: function() {
    var _this = this;
    return this.dataSets.map(function(value) { return _this.generateValue(value); });
  },
  
  getValue: function(dataSet) {
    return this.valueAttributes.map(function(valueAttribute) {
      return dataSet[valueAttribute];
    }).join(", ");
  },
  
  generateValue: function(dataSet) {
    var generation = new Template("#{image} <span class='displayValue'> #{value} </span> #{identifier}");
    var replacements = {};
    
    if(this.valueAttributes) replacements["value"] = this.getValue(dataSet);
    if(this.imageAttribute && dataSet[this.imageAttribute]) replacements["image"] = '<img src="' + dataSet[this.imageAttribute] + '">';
    if(this.identifierAttribute && (typeof dataSet[this.identifierAttribute] != "undefined"))
      replacements["identifier"] = "<span style='display: none' class='identifierValue'>" + dataSet[this.identifierAttribute] + "</span>";

    return generation.evaluate(replacements);
  },
  
  findValue: function(identifierValue) {
    var attribute = this.valueAttributes;
    if(this.identifierAttribute) attribute = this.identifierAttribute;

    return this.dataSets.detect(function(value) {
      return value[attribute] == identifierValue;
    });
  },

  // basically a copy of the local selector, but only searching in the displayValue
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
  },
  
  getLastSelection: function() {
    return this.lastSelection;
  }
});