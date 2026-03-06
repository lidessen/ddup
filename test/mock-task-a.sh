#!/bin/bash
# Mock task A - simulates brew update with lots of output
echo "==> Fetching homebrew/core..."
sleep 0.3
echo "==> Fetching homebrew/cask..."
sleep 0.3
echo "Already up-to-date."
echo "==> Upgrading 5 outdated packages:"
echo "node 20.11.0 -> 22.3.0"
echo "python@3.12 3.12.1 -> 3.12.4"
echo "rust 1.75.0 -> 1.79.0"
echo "go 1.21.5 -> 1.22.4"
echo "vim 9.0.2100 -> 9.1.0500"
sleep 0.5
echo "==> Downloading https://ghcr.io/v2/homebrew/core/node/manifests/22.3.0"
echo "Already downloaded: /Users/dev/Library/Caches/Homebrew/downloads/abc123--node-22.3.0.bottle.tar.gz"
sleep 0.3
echo "==> Upgrading node 20.11.0 -> 22.3.0"
echo "==> Pouring node--22.3.0.arm64_sonoma.bottle.tar.gz"
sleep 0.5
echo "==> Downloading https://ghcr.io/v2/homebrew/core/python/manifests/3.12.4"
echo "==> Upgrading python@3.12 3.12.1 -> 3.12.4"
echo "==> Pouring python@3.12--3.12.4.arm64_sonoma.bottle.tar.gz"
sleep 0.3
echo "==> Upgrading rust 1.75.0 -> 1.79.0"
echo "==> Pouring rust--1.79.0.arm64_sonoma.bottle.tar.gz"
sleep 0.5
echo "==> Upgrading go 1.21.5 -> 1.22.4"
echo "==> Pouring go--1.22.4.arm64_sonoma.bottle.tar.gz"
sleep 0.3
echo "==> Upgrading vim 9.0.2100 -> 9.1.0500"
echo "==> Pouring vim--9.1.0500.arm64_sonoma.bottle.tar.gz"
sleep 0.3
echo "==> Running brew cleanup..."
echo "Removing: /Users/dev/Library/Caches/Homebrew/node--20.11.0 (18.2MB)"
echo "Removing: /Users/dev/Library/Caches/Homebrew/python--3.12.1 (14.5MB)"
echo "==> Autoremoving 3 unneeded formulae:"
echo "libnghttp2 icu4c@74 readline"
echo "Uninstalling /usr/local/Cellar/libnghttp2/1.58.0... (13 files, 728.4KB)"
sleep 0.2
echo "All packages upgraded successfully."
