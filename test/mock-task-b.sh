#!/bin/bash
# Mock task B - simulates npm global update with lots of output
echo "npm warn config global --global, --local are deprecated. Use --location=global instead."
sleep 0.2
echo "added 0 packages, changed 12 packages in 3s"
echo ""
echo "Packages updated:"
echo "  typescript@5.4.5 -> 5.5.2"
echo "  eslint@8.56.0 -> 9.5.0"
echo "  prettier@3.2.4 -> 3.3.2"
echo "  npm@10.2.4 -> 10.8.1"
echo "  pnpm@8.15.4 -> 9.4.0"
echo "  tsx@4.7.0 -> 4.15.7"
sleep 0.5
echo ""
echo "npm notice"
echo "npm notice New major version of npm available! 10.2.4 -> 10.8.1"
echo "npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.8.1"
echo "npm notice Run npm install -g npm@10.8.1 to update!"
echo "npm notice"
sleep 0.3
echo "checking for deprecated packages..."
echo "  coffee-script@1.12.7: CoffeeScript on NPM has moved to coffeescript"
echo "  request@2.88.2: request has been deprecated"
sleep 0.3
echo ""
echo "12 packages updated, 0 new, 2 deprecated"
echo "audited 156 global packages in 2s"
echo "found 0 vulnerabilities"
