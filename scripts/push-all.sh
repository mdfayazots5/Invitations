#!/usr/bin/env bash
# Push main to every person's branch, so all branches stay identical.
# Each Netlify site rebuilds only if its own folder changed.
set -e
git push origin main main:Fayaz main:FayazMD main:Muskan main:MuskanKhanam main:Muskanone main:Admin
