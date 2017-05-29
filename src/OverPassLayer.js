
var L = require('leaflet');
var ClipperLib = require('js-clipper');
var css = require('./OverPassLayer.css');
var MinZoomIndicator = require('./MinZoomIndicator');

var OverPassLayer = L.FeatureGroup.extend({

    options: {

        'debug': false,
        'minZoom': 15,
        'endPoint': 'https://overpass-api.de/api/',
        'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
        'loadedBounds': [],
        'markerIcon': null,
        'timeout': 30 * 1000, // Milliseconds
        'retryOnTimeout': false,
        'noInitialRequest': false,
        'noInitialRequest': false,

        beforeRequest: function() {

        },

        afterRequest: function() {

        },

        onSuccess: function(data) {

            for(var i = 0; i < data.elements.length; i++) {

                var pos, popupContent, popup, marker,
                e = data.elements[i];

                if ( e.id in this._ids ) {

                    continue;
                }

                this._ids[e.id] = true;

                if ( e.type === 'node' ) {

                    pos = new L.LatLng(e.lat, e.lon);
                } else {

                    pos = new L.LatLng(e.center.lat, e.center.lon);
                }

                if (this.options.markerIcon) {
                    marker = L.marker(pos, { icon: this.options.markerIcon });
                }
                else {
                    marker = L.circle(pos, 20, {
                        'stroke': false,
                        'fillColor': '#E54041',
                        'fillOpacity': 0.9,
                    });
                }

                popupContent = this._getPoiPopupHTML(e.tags, e.id);
                popup = L.popup().setContent( popupContent );
                marker.bindPopup(popup);

                this._markers.addLayer(marker);
            }
        },

        onError: function() {

        },

        onTimeout: function() {

        },

        minZoomIndicatorEnabled: true,
        minZoomIndicatorOptions: {

            'minZoomMessageNoLayer': 'No layer assigned',
            'minZoomMessage': 'Current zoom Level: CURRENTZOOM. Data are visible at Level: MINZOOMLEVEL.',
        },
    },

    initialize: function (options) {

        L.Util.setOptions(this, options);

        this._ids = {};
        this._loadedBounds = options.loadedBounds || [];
        this._requestInProgress = false;
    },

    _getPoiPopupHTML: function(tags, id) {

        var row,
        link = document.createElement('a'),
        table = document.createElement('table'),
        div = document.createElement('div');

        link.href = 'http://www.openstreetmap.org/edit?editor=id&node=' + id;
        link.appendChild(document.createTextNode('Edit this entry in iD'));

        table.style.borderSpacing = '10px';
        table.style.borderCollapse = 'separate';

        for (var key in tags){

            row = table.insertRow(0);
            row.insertCell(0).appendChild(document.createTextNode(key));
            row.insertCell(1).appendChild(document.createTextNode(tags[key]));
        }

        div.appendChild(link);
        div.appendChild(table);

        return div;
    },


    _buildRequestBox: function (bounds) {

        return L.rectangle(bounds, {
            'bounds': bounds,
            'color': '#204a87',
            'stroke': false,
            'fillOpacity': 0.1,
            'clickable': false
        });
    },

    _addRequestBox: function (box) {

        return this._requestBoxes.addLayer( box );
    },

    _getRequestBoxes: function () {

        return this._requestBoxes.getLayers();
    },

    _removeRequestBox: function (box) {

        this._requestBoxes.removeLayer( box );
    },

    _removeRequestBoxes: function () {

        return this._requestBoxes.clearLayers();
    },

    _addResponseBox: function (box) {

        return this._responseBoxes.addLayer( box );
    },

    _addResponseBoxes: function (requestBoxes) {
        var self = this,
        count = requestBoxes.length;

        this._removeRequestBoxes();

        requestBoxes.forEach(function(box) {

            box.setStyle({
                'color': 'black',
                'weight': 2
            });
            self._addResponseBox( box );
        });
    },


    _isFullyLoadedBounds: function (bounds, loadedBounds) {

        if (loadedBounds.length === 0) {
            return false;
        }

        var solutionExPolygons,
        subjectClips = this._buildClipsFromBounds([bounds]),
        knownClips = this._buildClipsFromBounds(loadedBounds),
        clipper = new ClipperLib.Clipper(),
        solutionPolyTree = new ClipperLib.PolyTree();

        clipper.AddPaths(subjectClips, ClipperLib.PolyType.ptSubject, true);
        clipper.AddPaths(knownClips, ClipperLib.PolyType.ptClip, true);

        clipper.Execute(
            ClipperLib.ClipType.ctDifference,
            solutionPolyTree,
            ClipperLib.PolyFillType.pftNonZero,
            ClipperLib.PolyFillType.pftNonZero
        );

        solutionExPolygons = ClipperLib.JS.PolyTreeToExPolygons(solutionPolyTree);

        if (solutionExPolygons.length === 0) {
            return true;
        }
        else {
            return false;
        }
    },

    _getLoadedBounds: function () {

        return this._loadedBounds;
    },

    _addLoadedBounds: function (bounds) {

        this._loadedBounds.push(bounds);
    },

    _buildClipsFromBounds: function (bounds) {

        var clips = [];

        bounds.forEach(function (bound) {
            clips.push([
                {
                    'X': bound._southWest.lng * 1000000,
                    'Y': bound._southWest.lat * 1000000
                },
                {
                    'X': bound._southWest.lng * 1000000,
                    'Y': bound._northEast.lat * 1000000
                },
                {
                    'X': bound._northEast.lng * 1000000,
                    'Y': bound._northEast.lat * 1000000
                },
                {
                    'X': bound._northEast.lng * 1000000,
                    'Y': bound._southWest.lat * 1000000
                }
            ]);
        });

        return clips;
    },

    _buildBoundsFromClips: function (clips) {

        var bounds = [];

        clips.forEach(function (clip) {
            bounds.push(
                new L.LatLngBounds(
                    new L.LatLng(
                        clip[0].Y / 1000000,
                        clip[0].X / 1000000
                    ),
                    new L.LatLng(
                        clip[2].Y / 1000000,
                        clip[2].X / 1000000
                    )
                )
            );
        });

        return bounds;
    },


    _buildOverpassQueryFromQueryAndBounds: function (query, bounds){

        var sw = bounds._southWest,
        ne = bounds._northEast,
        coordinates = [sw.lat, sw.lng, ne.lat, ne.lng].join(',');

        query = query.replace(/(\/\/.*)/g, '');
        query = query.replace(/(\{\{bbox\}\})/g, coordinates);

        return query;
    },

    _buildOverpassUrlFromEndPointAndQuery: function (endPoint, query){

        return endPoint + 'interpreter?data=[out:json];'+ query;
    },

    _buildLargerBounds: function (bounds) {

        var width = Math.abs( bounds._northEast.lng - bounds._southWest.lng ),
        height = Math.abs( bounds._northEast.lat - bounds._southWest.lat ),
        biggestDimension = (width > height) ? width : height;

        bounds._southWest.lat -= biggestDimension / 2;
        bounds._southWest.lng -= biggestDimension / 2;
        bounds._northEast.lat += biggestDimension / 2;
        bounds._northEast.lng += biggestDimension / 2;

        return L.latLngBounds(
            L.latLng(bounds._southWest.lat, bounds._southWest.lng),
            L.latLng(bounds._northEast.lat, bounds._northEast.lng)
        );
    },

    _setRequestInProgress: function (isInProgress) {

        this._requestInProgress = isInProgress;
    },

    _isRequestInProgress: function () {

        return this._requestInProgress;
    },

    _hasNextRequest: function () {

        if ( this._nextRequest ) {

            return true;
        }

        return false;
    },

    _getNextRequest: function (nextRequest) {

        return this._nextRequest;
    },

    _setNextRequest: function (nextRequest) {

        this._nextRequest = nextRequest;
    },

    _removeNextRequest: function () {

        this._nextRequest = null;
    },

	_prepareRequest: function () {

        if (this._map.getZoom() < this.options.minZoom) {

            return false;
        }

        var bounds = this._buildLargerBounds( this._map.getBounds() ),
        nextRequest = this._sendRequest.bind(this, bounds);

        if ( this._isRequestInProgress() ) {

            this._setNextRequest(nextRequest);
        }
        else {

            this._removeNextRequest();
            nextRequest();
        }
    },

    _sendRequest: function(bounds) {

        var loadedBounds = this._getLoadedBounds();

        if ( this._isFullyLoadedBounds(bounds, loadedBounds) ) {
            this._setRequestInProgress(false);
            return;
        }

        var self = this,
        requestBounds = this._buildLargerBounds(bounds),
        url = this._buildOverpassUrlFromEndPointAndQuery(
            this.options.endPoint,
            this._buildOverpassQueryFromQueryAndBounds(this.options.query, requestBounds)
        ),
        request = new XMLHttpRequest(),
        beforeRequestResult = this.options.beforeRequest.call(this);

        if ( beforeRequestResult === false ) {

            this.options.afterRequest.call(this);

            return;
        }

        this._setRequestInProgress(true);

        if (this.options.debug) {

            this._addRequestBox(
                this._buildRequestBox(requestBounds)
            );
        }

        request.open('GET', url, true);
        request.timeout = this.options.timeout;

        request.ontimeout = function () {

            self._onRequestTimeout(this, url, requestBounds);
        };

        request.onload = function () {

            self._onRequestLoad(this, requestBounds);
        };

        request.send();
    },

    _onRequestLoad: function (xhr, bounds) {

        if (xhr.status >= 200 && xhr.status < 400) {

            this.options.onSuccess.call(this, JSON.parse(xhr.response));

            this._onRequestLoadCallback(bounds);
        }
        else {

            this._onRequestErrorCallback(bounds);

            this.options.onError.call(this, xhr);
        }

        this._onRequestCompleteCallback(bounds);
    },

    _onRequestTimeout: function (xhr, url, bounds) {

        this.options.onTimeout.call(this, xhr);

        if ( this.options.retryOnTimeout ) {

            this._sendRequest(url);
        }
        else {

            this._onRequestErrorCallback(bounds);
            this._onRequestCompleteCallback(bounds);
        }
    },

    _onRequestLoadCallback: function (bounds) {

        this._addLoadedBounds(bounds);

        if (this.options.debug) {

            this._addResponseBoxes(

                this._getRequestBoxes()
            );
        }
    },

    _onRequestErrorCallback: function (bounds) {

        if (this.options.debug) {

            this._removeRequestBox(
                this._buildRequestBox(bounds)
            );
        }
    },

    _onRequestCompleteCallback: function (bounds) {

        this.options.afterRequest.call(this);

        if ( this._hasNextRequest() ) {

            var nextRequest = this._getNextRequest();

            this._removeNextRequest();

            nextRequest();
        }
        else {

            this._setRequestInProgress(false);
        }
    },

    onAdd: function (map) {

        this._map = map;

        if (this.options.minZoomIndicatorEnabled === true) {
            if (this._map.zoomIndicator) {

                this._zoomControl = this._map.zoomIndicator;
                this._zoomControl._addLayer(this);
            } else {

                this._zoomControl = new L.Control.MinZoomIndicator(this.options.minZoomIndicatorOptions);

                this._map.addControl(this._zoomControl);

                this._zoomControl._addLayer(this);
            }
        }

        if (this.options.debug) {

            this._requestBoxes = L.featureGroup().addTo(this._map);
            this._responseBoxes = L.featureGroup().addTo(this._map);
        }

        this._markers = L.featureGroup().addTo(this._map);

        if ( !this.options.noInitialRequest ) {
            this._prepareRequest();
        }

        this._map.on('moveend', this._prepareRequest, this);
    },

    onRemove: function (map) {

        L.LayerGroup.prototype.onRemove.call(this, map);

        this._resetData();

        map.off('moveend', this._prepareRequest, this);

        this._map = null;
    },

    setQuery: function (query) {
        this.options.query = query;
        this._resetData();
        this._prepareRequest();
    },

    _resetData: function (map) {
        this._ids = {};
        this._loadedBounds = [];
        this._requestInProgress = false;

        this._markers.clearLayers();

        if (this.options.debug) {
            this._requestBoxes.clearLayers();
            this._responseBoxes.clearLayers();
        }
    },

    getData: function () {

        return this._data;
    },
});

L.OverPassLayer = OverPassLayer;
L.overpassLayer = function (options) {
  return new L.OverPassLayer(options);
};
module.exports = OverPassLayer;
