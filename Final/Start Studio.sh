#!/usr/bin/env bash
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Install Node.js 24 from https://nodejs.org then open this file again.'
  read -r -p 'Press Enter to close.'
  exit 1
fi
node scripts/launch-studio.mjs
result=$?
if [ "$result" -ne 0 ]; then read -r -p 'Press Enter to close.'; fi
exit "$result"
