


L.OverPassLayer = L.FeatureGroup.extend({

    options: {

        'debug': false,
        'minZoom': 15,
        'endPoint': 'http://overpass-api.de/api/',
        'query': '(node({{bbox}})[organic];node({{bbox}})[second_hand];);out qt;',
        'timeout': 30 * 1000, // Milliseconds
        'retryOnTimeout': false,
        'noInitialRequest': false,

        beforeRequest: function() {

        },

        afterRequest: function() {

        },

        onSuccess: function(data) {

            for(var i = 0; i < data.elements.length; i++) {

                var pos, popup, circle,
                e = data.elements[i];

                if ( e.id in this.instance._ids ) {

                    continue;
                }

                this.instance._ids[e.id] = true;

                if ( e.type === 'node' ) {

                    pos = new L.LatLng(e.lat, e.lon);
                } else {

                    pos = new L.LatLng(e.center.lat, e.center.lon);
                }

                popup = this.instance._getPoiPopupHTML(e.tags, e.id);
                circle = L.circle(pos, 50, {

                    'color': 'green',
                    'fillColor': '#3f0',
                    'fillOpacity': 0.5,
                })
                .bindPopup(popup);

                this.instance.addLayer(circle);
            }
        },

        onError: function() {

        },

        onTimeout: function() {

        },

        minZoomIndicatorOptions: {

            'minZoomMessageNoLayer': 'No layer assigned',
            'minZoomMessage': 'Current zoom Level: CURRENTZOOM. Data are visible at Level: MINZOOMLEVEL.',
        },
    },

    initialize: function (options) {

        L.Util.setOptions(this, options);

        this._layers = {};
        this._ids = {};
        this._loadedBounds = [];
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
            'color': 'blue',
            'weight': 1,
            'opacity': 0.5,
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
        clipper = new ClipperLib.Clipper();

        clipper.AddPaths(subjectClips, ClipperLib.PolyType.ptSubject, true);
        clipper.AddPaths(knownClips, ClipperLib.PolyType.ptClip, true);
        var solutionPolyTree = new ClipperLib.PolyTree();

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

    _getLoadedBounds: function (bounds) {

        return this._loadedBounds;
    },

    _setLoadedBounds: function (bounds) {

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

        return query.replace(/(\{\{bbox\}\})/g, coordinates);
    },

    _buildOverpassUrlFromEndPointAndQuery: function (endPoint, query){

        return endPoint + 'interpreter?data=[out:json];'+ query;
    },

    _getBoundsFromZoom: function (bounds, zoom) {

        if (zoom >= 12) {
            bounds._southWest.lat -= 0.03;
            bounds._southWest.lng -= 0.04;
            bounds._northEast.lat += 0.03;
            bounds._northEast.lng += 0.04;
        }

        return bounds;
    },

	_prepareRequest: function () {

        if (this._map.getZoom() < this.options.minZoom) {

            return false;
        }

        var url,
        self = this,
        beforeRequest = true,
        loadedBounds = this._getLoadedBounds(),
        bounds = this._getBoundsFromZoom(
            this._map.getBounds(),
            this._map.getZoom()
        ),
        onLoad = function (bounds) {

            this.options.afterRequest.call(self);

            this._setLoadedBounds(bounds);

            if (this.options.debug) {

                this._addResponseBoxes(

                    this._getRequestBoxes()
                );
            }
        },
        onError = function (bounds, box) {

            if (this.options.debug) {

                this._removeRequestBox(box);
            }
        };


        if ( this._isFullyLoadedBounds(bounds, loadedBounds) ) {

            return;
        }

        if (this.options.debug) {

            box = this._buildRequestBox(bounds);
            this._addRequestBox(box);
        }

        if (beforeRequest) {

            var beforeRequestResult = this.options.beforeRequest.call(this);

            if ( beforeRequestResult === false ) {

                this.options.afterRequest.call(this);

                return;
            }

            beforeRequest = false;
        }

        url = this._buildOverpassUrlFromEndPointAndQuery(
            this.options.endPoint,
            this._buildOverpassQueryFromQueryAndBounds(this.options.query, bounds)
        );

        if (this.options.debug) {

            this._sendRequest(
                url,
                onLoad.bind(this, bounds),
                onError.bind(this, bounds, box)
            );
        }
        else {

            this._sendRequest(
                url,
                onLoad.bind(this, bounds),
                onError.bind(this, bounds)
            );
        }
    },

    _sendRequest: function(url, onLoad, onError) {

        var self = this,
        reference = { 'instance': this };

        request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.timeout = this.options.timeout;

        request.ontimeout = function () {

            self.options.onTimeout.call(reference, this);

            if ( self.options.retryOnTimeout ) {

                self._sendRequest( url, onLoad, onError );
            }
            else {

                onError();
                onLoad();
            }
        };

        request.onload = function () {

            if (this.status >= 200 && this.status < 400) {

                self.options.onSuccess.call(reference, JSON.parse(this.response));
            }
            else {

                onError();

                self.options.onError.call(reference, this);
            }

            onLoad();
        };

        request.send();
    },

    onAdd: function (map) {

        this._map = map;

        if (this._map.zoomIndicator) {

            this._zoomControl = this._map.zoomIndicator;
            this._zoomControl._addLayer(this);
        } else {

            this._zoomControl = new L.Control.MinZoomIndicator(this.options.minZoomIndicatorOptions);

            this._map.addControl(this._zoomControl);

            this._zoomControl._addLayer(this);
        }

        if (this.options.debug) {

            this._requestBoxes = L.featureGroup().addTo(this._map);
            this._responseBoxes = L.featureGroup().addTo(this._map);
        }

        if ( !this.options.noInitialRequest ) {

            this._prepareRequest();
        }

        if (this.options.query.indexOf('({{bbox}})') !== -1) {

            this._map.on('moveend', this._prepareRequest, this);
        }
    },

    onRemove: function (map) {

        L.LayerGroup.prototype.onRemove.call(this, map);

        this._ids = {};
        this._loadedBounds = [];
        this._zoomControl._removeLayer(this);

        map.off('moveend', this.onMoveEnd, this);

        this._map = null;
    },

    getData: function () {

        return this._data;
    },
});
