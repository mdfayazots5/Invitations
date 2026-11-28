#!/usr/bin/env bash
# Netlify "ignore" check. Exit 0 = skip this build, exit 1 = build.
# Each site builds only when its own folder (or netlify.toml) changed.
case "$BRANCH" in
  Fayaz)        folder=fayaz ;;
  FayazMD)      folder=fayazmd ;;
  Muskan)       folder=muskan ;;
  MuskanKhanam) folder=muskankhanam ;;
  *) echo "No folder mapped to branch '$BRANCH'"; exit 1 ;;
esac

# First build, or no previous build to compare with: build.
if [ -z "$CACHED_COMMIT_REF" ] || [ "$CACHED_COMMIT_REF" = "$COMMIT_REF" ]; then
  echo "No earlier build to compare with: building $folder/"
  exit 1
fi

if git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- "$folder/" netlify.toml; then
  echo "$folder/ unchanged since the last deploy: skipping"
  exit 0
fi
echo "$folder/ changed: building"
exit 1
