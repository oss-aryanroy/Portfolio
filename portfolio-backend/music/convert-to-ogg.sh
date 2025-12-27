#!/bin/bash
# ============================================
# FLAC Processor + Auto Track Registry
# Parses "Artist - Title.flac" and updates tracks.json
# Requires: FFmpeg, jq (for JSON handling)
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FLAC_DIR="$SCRIPT_DIR/flac"
OGG_DIR="$SCRIPT_DIR/ogg"
COVER_DIR="$SCRIPT_DIR/covers"
TRACKS_JSON="$SCRIPT_DIR/tracks.json"
QUALITY=10

echo ""
echo "========================================"
echo "  FLAC Processor + Auto Track Registry"
echo "  Quality: VBR q$QUALITY (~320kbps avg)"
echo "========================================"
echo ""

# Check dependencies
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: FFmpeg not found!"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "ERROR: jq not found! Install with: brew install jq (macOS) or apt install jq (Linux)"
    exit 1
fi

# Create folders
mkdir -p "$OGG_DIR"
mkdir -p "$COVER_DIR"

# Initialize tracks.json if doesn't exist
if [ ! -f "$TRACKS_JSON" ]; then
    echo "[]" > "$TRACKS_JSON"
fi

# Stats
OGG_CONVERTED=0
OGG_SKIPPED=0
COVER_EXTRACTED=0
COVER_SKIPPED=0
TRACKS_ADDED=0

# Get next available ID
NEXT_ID=$(jq '[.[].id] | max + 1 // 1' "$TRACKS_JSON")

echo "Scanning for FLAC files in: $FLAC_DIR"
echo ""

for flac_file in "$FLAC_DIR"/*.flac; do
    [ -e "$flac_file" ] || continue
    
    BASENAME=$(basename "$flac_file" .flac)
    OGG_FILE="$OGG_DIR/$BASENAME.ogg"
    COVER_FILE="$COVER_DIR/${BASENAME}_cover.jpg"
    
    # Parse filename: "Artist - Title"
    if [[ "$BASENAME" =~ ^(.+)\ -\ (.+)$ ]]; then
        ARTIST="${BASH_REMATCH[1]}"
        TITLE="${BASH_REMATCH[2]}"
    else
        ARTIST="Unknown Artist"
        TITLE="$BASENAME"
    fi
    
    # Convert to OGG
    if [ -f "$OGG_FILE" ]; then
        echo "[SKIP OGG] $BASENAME.ogg already exists"
        ((OGG_SKIPPED++))
    else
        echo "[CONVERT] $BASENAME.flac -> $BASENAME.ogg"
        if ffmpeg -i "$flac_file" -c:a libvorbis -q:a $QUALITY "$OGG_FILE" -y -loglevel warning 2>/dev/null; then
            ((OGG_CONVERTED++))
        else
            echo "  ERROR: Failed to convert"
        fi
    fi
    
    # Extract cover
    if [ -f "$COVER_FILE" ]; then
        echo "[SKIP COVER] ${BASENAME}_cover.jpg already exists"
        ((COVER_SKIPPED++))
    else
        echo "[EXTRACT] $BASENAME.flac -> ${BASENAME}_cover.jpg"
        if ffmpeg -i "$flac_file" -an -c:v copy "$COVER_FILE" -y -loglevel warning 2>/dev/null && [ -f "$COVER_FILE" ]; then
            ((COVER_EXTRACTED++))
        else
            echo "  NOTE: No embedded cover art found"
        fi
    fi
    
    # Add to tracks.json if not present
    FLAC_FILENAME="$BASENAME.flac"
    EXISTS=$(jq --arg f "$FLAC_FILENAME" '[.[].files.flac] | index($f)' "$TRACKS_JSON")
    
    if [ "$EXISTS" = "null" ]; then
        echo "[ADD JSON] Adding '$TITLE' by '$ARTIST' to tracks.json"
        
        # Add new track using jq
        jq --arg id "$NEXT_ID" \
           --arg title "$TITLE" \
           --arg artist "$ARTIST" \
           --arg flac "$BASENAME.flac" \
           --arg ogg "$BASENAME.ogg" \
           --arg cover "${BASENAME}_cover.jpg" \
           '. += [{
               id: ($id | tonumber),
               title: $title,
               artist: $artist,
               files: { flac: $flac, ogg: $ogg },
               cover: $cover
           }]' "$TRACKS_JSON" > "$TRACKS_JSON.tmp" && mv "$TRACKS_JSON.tmp" "$TRACKS_JSON"
        
        ((NEXT_ID++))
        ((TRACKS_ADDED++))
    else
        echo "[SKIP JSON] '$TITLE' already in tracks.json"
    fi
    
    echo ""
done

echo "========================================"
echo "  Done!"
echo "  OGG Converted:    $OGG_CONVERTED file(s)"
echo "  OGG Skipped:      $OGG_SKIPPED file(s)"
echo "  Covers Extracted: $COVER_EXTRACTED file(s)"
echo "  Covers Skipped:   $COVER_SKIPPED file(s)"
echo "  Tracks Added:     $TRACKS_ADDED entry(s)"
echo "========================================"
echo ""
