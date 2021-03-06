#!/bin/sh
set -e
VERSIONS="5.0 5.1 5 6"
PACKAGES="common compiler core forms platform-browser platform-browser-dynamic router"

for version in $VERSIONS
do
  echo Building with Angular $version...
  OLD="rxjs zone.js"
  NEW=""
  for package in $PACKAGES
  do
    OLD="$OLD @angular/$package"
    NEW="$NEW @angular/$package@$version"
  done

  echo $version | grep -Eq "^5" && NEW="$NEW rxjs@5.5.5 zone.js@0.8.20" || NEW="$NEW rxjs@^6.0.0 zone.js@^0.8.26"

  npm uninstall --no-save $OLD
  npm install --no-save $NEW
  npm run build:all
done
echo Testing complete
npm install
