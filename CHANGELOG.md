# Changelog

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
