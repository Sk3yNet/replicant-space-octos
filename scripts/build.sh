#!/usr/bin/env sh
# Build the installable wallpaper: dist/ReplicantSpace.zip, containing the ReplicantSpace/ mod folder
# (Octos: "Install mod from .zip"). Checks the manifest and the script first.
set -eu
cd "$(dirname "$0")/.."
python3 -c "import json,sys; json.load(open('src/replicant-space/octos.json')); print('octos.json ok')"
if command -v node >/dev/null 2>&1; then node --check src/replicant-space/launcher.js && echo "launcher.js ok"; fi
rm -rf dist && mkdir -p dist/build/ReplicantSpace
cp -r src/replicant-space/. dist/build/ReplicantSpace/
(cd dist/build && zip -qr ../ReplicantSpace.zip ReplicantSpace)
rm -rf dist/build
echo "built dist/ReplicantSpace.zip"
