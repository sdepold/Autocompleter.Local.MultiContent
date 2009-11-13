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
    options.selector = this.selector;
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
  }
});