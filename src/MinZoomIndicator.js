import L from 'leaflet';

const MinZoomIndicator = L.Control.extend({
  options: {},

  _layers: {},

  initialize(options) {
    L.Util.setOptions(this, options);

    this._layers = {};
  },

  _addLayer(layer) {
    let minZoom = 15;

    if (layer.options.minZoom) {
      minZoom = layer.options.minZoom;
    }

    this._layers[layer._leaflet_id] = minZoom;

    this._updateBox(null);
  },

  _removeLayer(layer) {
    this._layers[layer._leaflet_id] = null;

    this._updateBox(null);
  },

  _getMinZoomLevel() {
    let minZoomLevel = -1;

    for (const key in this._layers) {
      if (this._layers[key] !== null && this._layers[key] > minZoomLevel) {
        minZoomLevel = this._layers[key];
      }
    }

    return minZoomLevel;
  },

  _updateBox(event) {
    const minZoomLevel = this._getMinZoomLevel();

    if (event !== null) {
      L.DomEvent.preventDefault(event);
    }

    if (minZoomLevel == -1) {
      this._container.innerHTML = this.options.minZoomMessageNoLayer;
    } else {
      this._container.innerHTML = this.options.minZoomMessage
        .replace(/CURRENTZOOM/, this._map.getZoom())
        .replace(/MINZOOMLEVEL/, minZoomLevel);
    }

    if (this._map.getZoom() >= minZoomLevel) {
      this._container.style.display = 'none';
    } else {
      this._container.style.display = 'block';
    }
  },

  onAdd(map) {
    this._map = map;

    this._map.zoomIndicator = this;

    this._container = L.DomUtil.create(
      'div',
      'leaflet-control-minZoomIndicator'
    );

    this._map.on('moveend', this._updateBox, this);

    this._updateBox(null);

    return this._container;
  },

  onRemove(map) {
    L.Control.prototype.onRemove.call(this, map);

    map.off(
      {
        moveend: this._updateBox
      },
      this
    );

    this._map = null;
  }
});

L.Control.MinZoomIndicator = MinZoomIndicator;

export default MinZoomIndicator;
