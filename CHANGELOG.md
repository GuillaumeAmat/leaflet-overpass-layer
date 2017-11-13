# Changelog

## 2.8.2

* Revert 2.8.1.

## 2.8.1

* Expose the module the ES6 way.

## 2.8.0

* Upgrade the Leaflet dependency to the ^1.2.0 version.

## 2.7.0

* Add the minZoomIndicatorEnabled options (default to true).

## 2.6.1

* Fix the data cleanup when not in debug mode.

## 2.6.0

* Properly remove featureGroups when the main layer is removed from the map.

## 2.5.1

* Fix an issue leading to load the map without any request.

## 2.5.0

* Add constructor L.overpassLayer.

## 2.3.1

* Put the real MIT license content in the LICENSE file.

## 2.3.0

* Update Leaflet to version 1.0.1.

## 2.2.1

* Fix the bower.json file.

## 2.2.0

* Add the loadedBounds option.
* Don't reset the loaded bounds on layer remove.
* Allow to customize the default marker icon.

## 2.1.3

* Forgot to build...

## 2.1.2

* Reimplements the MinZoomIndicator removeLayer.

## 2.1.1

* Don't prepare request if the layer is not added to the map.

## 2.1.0

* Adds a method to update the OverPass query. It automatically resets data and re-launches a request.

## 2.0.3

* Handles one line comments in Overpass requests.

## 2.0.2

* Use the bigger value to extend the search area.

## 2.0.1

* The bounding box is not extended on every requests anymore.

## 2.0.0

* The dist folder is now built with Webpack rather than Gulp.
* Fixes the default onSuccess callback.

## 1.7.1

* Fixes the moveend event removal.

## 1.7.0

* Universal Module Definition.
* ClipperLib loaded by NPM
* Adds Leaflet dependancy to package.json.
* Fixes a debug bug on rectangles creation.

## 1.6.3

* Updates the package.json to publish the module to npmjs.com.

## 1.6.2

* Builds a bounding box without taking care of a zoom level.

## 1.6.1

* Don't launch the next request if its area is already requested.

## 1.6.0

* The request bounding box is larger than the requested one.
* A new collision method is used to prevent requests on already loaded bounding boxes.
* Only one request at a time ;)

## 1.5.3

* Reduce the size of the requests' areas.

## 1.5.2

* Bump Leaflet version to 0.7.7.

## 1.5.1

* Rename the CHANGELOG file.

## 1.5.0

* Adds some significant refactor of code.
* Removes the requestPerTile mode.
* Removes the killMyQueries functionality.
* Extends the requests bounds.
* Adds a debug mode which shows the requests bounds.
* Invalidates the requests cache on error.

## 1.4.5

* Fix the requestPerTile mode since the support of killMyQueries broke it.

## 1.4.4

* Remove a duplicate / in the kill queries call.

## 1.4.3

* Kill out of date queries before sending new ones.

## 1.4.2

* Fix the minZoom option name (not camelcased) in MinZoomIndicator.js.
