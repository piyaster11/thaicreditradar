#!/bin/bash
# keep retrying (box IP may be rate-limited by Google) — up to ~8 h
cd "$(dirname "$0")"
for i in $(seq 1 40); do
  python3 -u pull_trends.py
  python3 -c "import json;d=json.load(open('../data/trends.json'));import terms;import sys;sys.exit(0 if len(d['items'])+len(d.get('empty',{}))>=len(terms.TERMS) else 1)" 2>/dev/null && break
  sleep 600
done
