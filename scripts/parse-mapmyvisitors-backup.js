#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const dir = process.argv[2];

if (!dir) {
  console.error("Usage: parse-mapmyvisitors-backup.js <backup-dir>");
  process.exit(1);
}

function read(name) {
  return fs.readFileSync(path.join(dir, name), "utf8");
}

function unjsonp(raw) {
  const match = raw.match(/^\w+\((.*)\)\s*;?\s*$/s);
  if (!match) return raw;
  try {
    return JSON.parse(match[1]);
  } catch {
    return match[1];
  }
}

function first(pattern, text) {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function parseMarkers(js) {
  const markers = [];
  const pattern =
    /addMarker\('([^']+)',\s*\{\s*latLng:\s*\[\s*([-0-9.]+)\s*,\s*([-0-9.]+)\s*\],[\s\S]*?name:\s*"([^"]*)"[\s\S]*?\}\s*\);/g;
  let match;

  while ((match = pattern.exec(js)) !== null) {
    markers.push({
      id: match[1],
      lat: Number(match[2]),
      lng: Number(match[3]),
      name: match[4],
    });
  }

  return markers;
}

function parseRealtimeEvents(js) {
  const events = [];
  const pattern = /addRealtimeVisitors\(([^)]*)\)/g;
  let match;

  while ((match = pattern.exec(js)) !== null) {
    const args =
      match[1]
        .match(/(?:"(?:\\.|[^"])*"|[^,])+/g)
        ?.map((item) =>
          item.trim().replace(/^"|"$/g, "").replace(/\\"/g, '"'),
        ) || [];

    events.push({
      ip_id: args[0] ? Number(args[0]) : null,
      location: args[1] || "",
      flag: args[2] || "",
      date: args[3] || "",
      hits: args[4] ? Number(args[4]) : null,
      country_code: args[5] || "",
    });
  }

  return events;
}

const widget = read("widget_call_home.js");
const ajaxFalse = unjsonp(read("ajax-map-global-false.jsonp"));
const ajaxTrue = unjsonp(read("ajax-map-global-true.jsonp"));

const summary = {
  captured_at_local: new Date().toISOString(),
  project: {
    domain: "https://fernand.tech/",
    mapmyvisitors_project_id: Number(first(/'project_id':\s*(\d+)/, widget)),
    profile_link: first(/'profile_link'\s*:\s*'([^']+)'/, widget),
    visible_label: first(/mapmyvisitors-visitors'\)\.html\('([^']+)'\)/, widget),
    initial_hit_id: first(/initial_hit_id\s*=\s*'([^']+)'/, widget),
    initial_hit_date: first(/initial_hit_date\s*=\s*'([^']+)'/, widget),
    last_hit_id_from_ajax: first(/last_hit_id\s*=\s*'([^']+)'/, ajaxFalse),
  },
  widget_url: read("source-widget-url.txt").trim(),
  map_js_url: read("source-map-js-url.txt").trim(),
  ajax_global_false: {
    markers: parseMarkers(ajaxFalse),
    realtime_events: parseRealtimeEvents(ajaxFalse),
  },
  ajax_global_true: {
    markers: parseMarkers(ajaxTrue),
    realtime_events: parseRealtimeEvents(ajaxTrue),
    raw_count_assignment: first(/\bcount\s*=\s*([0-9]+)/, ajaxTrue),
  },
  notes: [
    "visible_label is the widget label shown by MapMyVisitors for t=tt.",
    "raw_count_assignment from globalTotal=true may not be the public pageview total; verify before using it.",
    "markers/realtime_events are parsed from public JSONP responses and may represent current/recent server state, not full legacy ClustrMaps history.",
  ],
};

fs.writeFileSync(
  path.join(dir, "snapshot-summary.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(dir, "markers-global-false.json"),
  `${JSON.stringify(summary.ajax_global_false.markers, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(dir, "realtime-events-global-false.json"),
  `${JSON.stringify(summary.ajax_global_false.realtime_events, null, 2)}\n`,
);

