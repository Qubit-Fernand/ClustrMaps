#!/usr/bin/env bash
set -euo pipefail

stamp="${1:-$(date '+%Y%m%d-%H%M%S')}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dir="$repo_root/backups/mapmyvisitors/$stamp"
mkdir -p "$dir"

map_js_url='https://mapmyvisitors.com/map.js?d=jphtf95t_gxsh22CxBQ_2xtA8csQOD-jp3rF5A27jqE&cl=1565c0&w=a&t=tt&cmo=9db7d6&cmn=ff6b4a&ct=111827&co=ffffff'
widget_url='https://mapmyvisitors.com/widget_call_home.js?d=jphtf95t_gxsh22CxBQ_2xtA8csQOD-jp3rF5A27jqE&cl=1565c0&w=760&t=tt&cmo=9db7d6&cmn=ff6b4a&ct=111827&co=ffffff'
ajax_false_url='https://mapmyvisitors.com/ajax/map?last_hit_id=0&initial_hit_id=0&initial=true&animate=true&user=0&url=%22https%3A%2F%2Ffernand.tech%2F%22&id=2249830&globalTotal=false&mapType=widget&callback=backup'
ajax_true_url='https://mapmyvisitors.com/ajax/map?last_hit_id=0&initial_hit_id=0&initial=true&animate=true&user=0&url=%22https%3A%2F%2Ffernand.tech%2F%22&id=2249830&globalTotal=true&mapType=widget&callback=backup'
background_url='https://mapmyvisitors.com/generated_content/backs/bg-w_760-co_ffffff-cl_1565c0.png'
static_png_url='https://mapmyvisitors.com/map.png?d=jphtf95t_gxsh22CxBQ_2xtA8csQOD-jp3rF5A27jqE&cl=1565c0&w=400&t=tt&cmo=9db7d6&cmn=ff6b4a&ct=111827&co=ffffff'

curl -sSL "$map_js_url" -o "$dir/map.js"
curl -sSL "$widget_url" -o "$dir/widget_call_home.js"
curl -sSL "$ajax_false_url" -o "$dir/ajax-map-global-false.jsonp"
curl -sSL "$ajax_true_url" -o "$dir/ajax-map-global-true.jsonp"
curl -sSL "$background_url" -o "$dir/background-w760.png"
curl -sSL "$static_png_url" -o "$dir/map-static.png"

printf '%s\n' "$map_js_url" > "$dir/source-map-js-url.txt"
printf '%s\n' "$widget_url" > "$dir/source-widget-url.txt"
printf '%s\n' "$ajax_false_url" > "$dir/source-ajax-global-false-url.txt"
printf '%s\n' "$ajax_true_url" > "$dir/source-ajax-global-true-url.txt"
printf '%s\n' "$background_url" > "$dir/source-background-url.txt"
printf '%s\n' "$static_png_url" > "$dir/source-static-png-url.txt"

node "$repo_root/scripts/parse-mapmyvisitors-backup.js" "$dir"

cat > "$dir/README.md" <<EOF
# MapMyVisitors backup $stamp

This folder is a local backup of the public MapMyVisitors assets and data used by \`https://qubit-fernand.github.io/ClustrMaps/\`.

Important files:

- \`map.js\`: public MapMyVisitors rendering code.
- \`widget_call_home.js\`: widget bootstrap response, including the visible label.
- \`ajax-map-global-false.jsonp\` and \`ajax-map-global-true.jsonp\`: raw JSONP map-data responses.
- \`snapshot-summary.json\`: parsed project id, visible pageview label, markers, and realtime events.
- \`background-w760.png\`: generated blue-map background used by the current style.
- \`map-static.png\`: low-resolution official static fallback image.
Do not treat every internal field as authoritative. In particular, \`globalTotal=true\` may return an internal count assignment that is not the public pageview total.
EOF

echo "Backup written to $dir"
