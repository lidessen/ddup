#!/bin/bash
# Mock task that fails - simulates a broken update
echo "Checking for updates..."
sleep 0.3
echo "Connecting to registry.example.com..."
sleep 0.5
echo "Error: Connection timed out after 30s" >&2
echo "Error: Failed to fetch package index from registry.example.com" >&2
echo "Hint: Check your network connection and proxy settings" >&2
exit 1
