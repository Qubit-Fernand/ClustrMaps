# MapMyVisitors backup 20260911-123622

This folder is a local backup of the public MapMyVisitors assets and data used by `https://qubit-fernand.github.io/ClustrMaps/`.

Important files:

- `map.js`: public MapMyVisitors rendering code.
- `widget_call_home.js`: widget bootstrap response, including the visible label.
- `ajax-map-global-false.jsonp` and `ajax-map-global-true.jsonp`: raw JSONP map-data responses.
- `snapshot-summary.json`: parsed project id, visible pageview label, markers, and realtime events.
- `background-w760.png`: generated blue-map background used by the current style.
- `map-static.png`: low-resolution official static fallback image.
Do not treat every internal field as authoritative. In particular, `globalTotal=true` may return an internal count assignment that is not the public pageview total.
