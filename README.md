# Leaflet Layer OverPass

This plugin is a fork of https://github.com/kartenkarsten/leaflet-layer-overpass

## What is it?
A [Leaflet](http://leafletjs.com/) plugin to create a custom POI overlay - thanks to the [OSM](http://www.openstreetmap.org/) dataset and the [Overpass API](http://overpass-api.de/)


## Installation

### NPM

```bash
$ npm install leaflet-layer-overpass
```

### Bower

If you use bower to install leaflet-layer-overpass, you need to load [JsClipper](https://github.com/mathisonian/JsClipper) first.

```bash
$ bower install leaflet-layer-overpass
```

## Usage

You can include and use the `OverpassLayer.css` and `OverpassLayer.js` files (or `OverPassLayer.min.js` if you want the minified version) from the `dist` folder in your html.


```javascript
var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',

attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>',

osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    'opacity': 0.7,
    'attribution': [attr_osm, attr_overpass].join(', ')
}),

map = new L.Map('map')
.addLayer(osm)
.setView(new L.LatLng(52.265, 10.524), 14),

opl = new L.OverPassLayer({

    'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
});

map.addLayer(opl);
```
In order to get a valid query the [Overpass-turbo IDE](http://overpass-turbo.eu/) might help.

## What are the options?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {

  'debug': false,
  'minZoom': 15,
  'endPoint': 'http://overpass-api.de/api/',
  'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
  'timeout': 30 * 1000, // Milliseconds
  'retryOnTimeout': false,
  'noInitialRequest': false,
  'minZoomIndicatorOptions': {

    'position': 'topright',
    'minZoomMessageNoLayer': 'no layer assigned',
    'minZoomMessage': 'current Zoom-Level: CURRENTZOOM all data at Level: MINZOOMLEVEL'
},
  'beforeRequest': function() {},
  'afterRequest': function() {},
  'onSuccess': function(data) {},
  'onError': function(xhr) {},
  'onTimeout': function(xhr) {},
};
```

## Dependencies

* [Leaflet](https://github.com/Leaflet/Leaflet)
* [JsClipper](https://github.com/mathisonian/JsClipper)

## Development

*Warning: This fork use Git Flow to manage branches.*

In order to contribute to the project you should first clone the repository. The javascript source files
reside in the `src` folder and are concatenated and minified by gulp. If you want to make changes
make them in the `src` folder and then build the `dist` file with gulp.
For that you first need to install gulp if you do not have installed it yet
```
$ npm install --global gulp
```
Then install all the needed packages for this project:
```
$ npm install
```
And then just run
```
gulp
```
after you made your changes. This will combine (and minify) the files and put them into the `dist` folder.
