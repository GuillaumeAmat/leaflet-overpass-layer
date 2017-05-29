# Leaflet OverPass Layer

This plugin is a fork of https://github.com/kartenkarsten/leaflet-layer-overpass

## What is it?
A [Leaflet](http://leafletjs.com/) plugin to create a custom POI overlay - thanks to the [OSM](http://www.openstreetmap.org/) dataset and the [Overpass API](http://overpass-api.de/)


## Installation

### NPM

```bash
$ npm install leaflet-overpass-layer
```

### Bower

If you use bower to install leaflet-layer-overpass, you need to load [JsClipper](https://github.com/mathisonian/JsClipper) first.

```bash
$ bower install leaflet-overpass-layer
```

## Usage

You can include and use the `OverpassLayer.css` and `OverpassLayer.bundle.js` files from the `dist` folder in your html.


```javascript
var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors';
var attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';

var osm = new L.TileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        'opacity': 0.7,
        'attribution': [attr_osm, attr_overpass].join(', ')
    }
);

var map = new L.Map('map')
.addLayer(osm)
.setView(new L.LatLng(52.265, 10.524), 14);


var opl = new L.OverPassLayer({

    'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
});

map.addLayer(opl);
```
In order to get a valid query the [Overpass-turbo IDE](http://overpass-turbo.eu/) might help.

## What are the options?
You can specify an options object as an argument of L.OverPassLayer.
```javascript
options: {

  debug: false,
  minZoom: 15,
  endPoint: 'https://overpass-api.de/api/',
  query: '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
  loadedBounds: [],
  markerIcon: L.Icon(),
  timeout: 30 * 1000, // Milliseconds
  retryOnTimeout: false,
  noInitialRequest: false,
  minZoomIndicatorEnabled: true,
  minZoomIndicatorOptions: {
    position: 'topright',
    minZoomMessageNoLayer: 'No layer assigned',
    minZoomMessage: 'Current zoom level: CURRENTZOOM - All data at level: MINZOOMLEVEL'
},
  beforeRequest: function() {},
  afterRequest: function() {},
  onSuccess: function(data) {},
  onError: function(xhr) {},
  onTimeout: function(xhr) {},
};
```

## Dependencies

* [Leaflet](https://github.com/Leaflet/Leaflet)

## Development

*Warning: This fork use Git Flow to manage branches.*

In order to contribute to the project you should first clone the repository. The javascript source files
reside in the `src` folder and are concatenated and minified by Webpack in the `dist` folder. If you want to make changes
make them in the `src` folder and then run `npm run build` (or `npm run watch` for continuous build).
For that you first need to install all the needed packages for this project:
```
$ npm install
```
