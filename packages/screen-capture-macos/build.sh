#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$SCRIPT_DIR/bin"

swiftc \
  -parse-as-library \
  "$SCRIPT_DIR/Sources/screen-capture-macos/screen_capture_macos.swift" \
  -o "$SCRIPT_DIR/bin/screen-capture-macos"

echo "Built: $SCRIPT_DIR/bin/screen-capture-macos"
