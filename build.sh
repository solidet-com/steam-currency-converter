#!/bin/bash

if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    echo "Install it using:"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  MacOS: brew install jq"
    exit 1
fi

increment_version() {
    local version=$1
    local type=$2
    
    IFS='.' read -r -a parts <<< "$version"
    local major="${parts[0]}"
    local minor="${parts[1]}"
    local patch="${parts[2]}"
    
    if [ "$type" == "--major" ]; then
        if [ "$minor" == "9" ]; then
            major=$((major + 1))
            minor=0
            patch=0
        else
            minor=$((minor + 4))
            patch=0
        fi
    else
        if [ "$patch" == "99" ]; then
            minor=$((minor + 1))
            patch=0
        else
            patch=$((patch + 1))
        fi
    fi
    
    echo "$major.$minor.$patch"
}

update_html_files() {
    local old_version=$1
    local new_version=$2
    local files=("src/pages/choose-currency.html" "src/pages/index.html")
    
    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            echo "Warning: $file not found"
            continue
        fi
        
        temp_file="$file.tmp"
        
        while IFS= read -r line; do
            if echo "$line" | grep -q "version-text"; then
                line=$(echo "$line" | sed -E "s/v$old_version/v$new_version/g")
            fi
            echo "$line" >> "$temp_file"
        done < "$file"
        
        mv "$temp_file" "$file"
    done
}

build_type="--minor"
if [ "$#" -eq 1 ] && [ "$1" == "--major" ]; then
    build_type="--major"
fi

current_version=$(jq -r '.version' manifest.json)
new_version=$(increment_version "$current_version" "$build_type")

jq ".version = \"$new_version\"" manifest.json > manifest.json.tmp && mv manifest.json.tmp manifest.json
jq ".version = \"$new_version\"" manifest_firefox.json > manifest_firefox.json.tmp && mv manifest_firefox.json.tmp manifest_firefox.json

update_html_files "$current_version" "$new_version"

rm -f Steam-Currency-Converter-Chrome-V*.zip
zip -r "Steam-Currency-Converter-Chrome-V${new_version}.zip" . \
    -x "*.git*" ".git/*" "*.zip" ".vscode/*" "manifest_firefox.json" "build.sh" "node_modules/*"

rm -f Steam-Currency-Converter-Firefox-V*.zip
cp manifest_firefox.json manifest_firefox_temp.json
mv manifest.json manifest_temp.json
mv manifest_firefox_temp.json manifest.json

zip -r "Steam-Currency-Converter-Firefox-V${new_version}.zip" . \
    -x "*.git*" ".git/*" "*.zip" ".vscode/*" "manifest_firefox.json" "build.sh" "node_modules/*"

mv manifest_temp.json manifest.json

echo "Version updated from $current_version to $new_version"
echo "Created Steam-Currency-Converter-Chrome-V${new_version}.zip"
echo "Created Steam-Currency-Converter-Firefox-V${new_version}.zip"