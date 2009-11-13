if((typeof Autocompleter == 'undefined') || (typeof Autocompleter.Local == "undefined"))
  throw("Please include the script.aculo.us framework.");

Autocompleter.Local.MultiContent = Class.create(Autocompleter.Local, {
  values: null,
  identifier: null,
  onSelect: null,
  lastSelection: null,
  
  initialize: function($super, element, update, values, options) {
    this.values = values;
    this.identifier = options.identifier;
    this.onSelect = options.onSelect;
    $super(element, update, this.extractValues(), options);
  },
  
  updateElement: function(selection) {
    var displayValue = selection.down(".displayValue").innerHTML.stripTags().trim();
    var identifierValue = selection.down(".identifierValue") ? selection.down(".identifierValue").innerHTML : null;
    
    this.element.value = displayValue;
    this.lastSelection = this.findValue(identifierValue || displayValue);
    if(this.onSelect) this.onSelect(this.lastSelection);
  },
  
  extractValues: function() {
    var _this = this;
    return this.values.map(function(value) { return _this.generateValue(value); });
  },
  
  generateValue: function(valueSet) {
    var generation = new Template("#{image} <span class='displayValue'> #{value} </span> #{identifier}");
    var replacements = {value: valueSet.displayValue};

    if(valueSet.displayImage) replacements["image"] = '<img src="' + valueSet.displayImage + '">';
    if(this.identifier) replacements["identifier"] = "<span style='display: none' class='identifierValue'>" + valueSet[""+this.identifier] + "</span>";

    return generation.evaluate(replacements);
  },
  
  findValue: function(identifierValue) {
    var attribute = "displayValue";
    if(this.identifier) attribute = this.identifier;

    return this.values.detect(function(value) {
      return value[attribute] == identifierValue;
    });
  }
});