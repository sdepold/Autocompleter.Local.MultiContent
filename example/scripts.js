var autocompleter = null;
var carIds = [];
var autocompleterData = [
  {name: "Bus",       img_small: "img/bus_64.png",      img_big: "img/bus_128.png"},
  {name: "Camaro",    img_small: "img/camaro_64.png",   img_big: "img/camaro_128.png"},
  {name: "Tanker",    img_small: "img/tanker_64.png",   img_big: "img/tanker_128.png"},
  {name: "Tanker",    img_small: "img/tanker_2_64.png", img_big: "img/tanker_2_128.png"},
  {name: "Truck",     img_small: "img/truck_64.png",    img_big: "img/truck_128.png"},
  {name: "VW Käfer",  img_small: "img/kaefer_64.png",   img_big: "img/kaefer_128.png"}
];

autocompleterData.each(function(dataSet, index) { dataSet["id"] = index; });

function toggleCar() {
  var dataSet = autocompleter.lastSelection;
  
  if(carIds.indexOf(dataSet.id) == -1) {
    carIds.push(dataSet.id);
    var container = renderCar(dataSet);
    var remove = new Element("a", {href:"#", onclick: "removeCar("+dataSet.id+")", style:"float:right"}).update("remove");
    container.insert(new Element("br"));
    container.insert(remove);
    $("cars").insert({bottom: container});
  } else {
    removeCar(dataSet.id)
  }
  
  $("autocompletion_text_field").value = "";
  $("preview").fade();
}

function removeCar(id) {
  carIds.pop(id);
  $("carContainer"+id).remove();
}

function renderCar(dataSet, id) {
  var container = new Element("div", {id: "carContainer"+dataSet.id, "class": "carContainer"});
  container.insert(new Element("img", {src: dataSet.img_big}));
  container.insert(new Element("span").update(dataSet.name));
  return container;
}

function evalSelection(selection) {
  var container = renderCar(selection);
  container.insert(new Element("br"));
  container.insert(new Element("span", {style: "float: right; color: red"}).update("preview"));
  
  $("preview").innerHTML = "";
  $("preview").insert(container);
  $("preview").appear({
    afterFinish: function(){
      window.setTimeout(function(){
        $("preview").fade();
      }, 5000);
    }
  });
}