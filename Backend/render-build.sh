#!/usr/bin/env bash
# exit on error
set -o errexit

# Install standard dependencies
npm install

# Store/install playwright or puppeteer browsers.
# We clear the npm cache to keep the build light.
npx puppeteer browsers install chrome
npm cache clean --force
