# ============================================
# FLAC Processor + Auto Track Registry
# Parses "Artist - Title.flac", renames to "Title.flac"
# and updates tracks.json
# ============================================

param(
    [string]$FlacDir,
    [string]$OggDir,
    [string]$CoverDir,
    [string]$TracksJson,
    [int]$Quality = 10
)

$stats = @{
    OggConverted   = 0
    OggSkipped     = 0
    CoverExtracted = 0
    CoverSkipped   = 0
    TracksAdded    = 0
    FilesRenamed   = 0
}

# Load existing tracks.json or create empty array
if (Test-Path $TracksJson) {
    $tracks = Get-Content $TracksJson -Raw | ConvertFrom-Json
    if ($null -eq $tracks) { $tracks = @() }
}
else {
    $tracks = @()
}

# Get next available ID
$nextId = 1
if ($tracks.Count -gt 0) {
    $nextId = ($tracks | ForEach-Object { $_.id } | Measure-Object -Maximum).Maximum + 1
}

# Get list of existing track filenames (FLAC)
$existingFiles = $tracks | ForEach-Object { $_.files.flac }

Write-Host ""
Write-Host "Scanning for FLAC files in: $FlacDir"
Write-Host ""

Get-ChildItem -Path $FlacDir -Filter "*.flac" | ForEach-Object {
    $flacFile = $_
    $originalBasename = $flacFile.BaseName
    
    # Parse filename: "Artist - Title"
    if ($originalBasename -match "^(.+?)\s*-\s*(.+)$") {
        $artist = $Matches[1].Trim()
        $title = $Matches[2].Trim()
        $needsRename = $true
    }
    else {
        # Already in correct format or no separator
        $artist = "Unknown Artist"
        $title = $originalBasename
        $needsRename = $false
    }
    
    # New filename based on title only
    $newBasename = $title
    $newFlacPath = Join-Path $FlacDir "$newBasename.flac"
    $oggFile = Join-Path $OggDir "$newBasename.ogg"
    $coverFile = Join-Path $CoverDir "${newBasename}_cover.jpg"
    
    # Rename original FLAC file if needed
    if ($needsRename -and ($flacFile.FullName -ne $newFlacPath)) {
        if (Test-Path $newFlacPath) {
            Write-Host "[SKIP RENAME] $newBasename.flac already exists"
        }
        else {
            Write-Host "[RENAME] $originalBasename.flac -> $newBasename.flac"
            Rename-Item -Path $flacFile.FullName -NewName "$newBasename.flac"
            $stats.FilesRenamed++
        }
    }
    
    # Convert to OGG (using new name)
    $sourceFlac = Join-Path $FlacDir "$newBasename.flac"
    if (Test-Path $oggFile) {
        Write-Host "[SKIP OGG] $newBasename.ogg already exists"
        $stats.OggSkipped++
    }
    else {
        if (Test-Path $sourceFlac) {
            Write-Host "[CONVERT] $newBasename.flac -> $newBasename.ogg"
            & ffmpeg -i $sourceFlac -c:a libvorbis -q:a $Quality $oggFile -y -loglevel warning 2>$null
            if ($LASTEXITCODE -eq 0) {
                $stats.OggConverted++
            }
            else {
                Write-Host "  ERROR: Failed to convert"
            }
        }
    }
    
    # Extract cover
    if (Test-Path $coverFile) {
        Write-Host "[SKIP COVER] ${newBasename}_cover.jpg already exists"
        $stats.CoverSkipped++
    }
    else {
        if (Test-Path $sourceFlac) {
            Write-Host "[EXTRACT] $newBasename.flac -> ${newBasename}_cover.jpg"
            & ffmpeg -i $sourceFlac -an -c:v copy $coverFile -y -loglevel warning 2>$null
            if (Test-Path $coverFile) {
                $stats.CoverExtracted++
            }
            else {
                Write-Host "  NOTE: No embedded cover art found"
            }
        }
    }
    
    # Add to tracks.json if not already present
    $flacFilename = "$newBasename.flac"
    if ($flacFilename -notin $existingFiles) {
        Write-Host "[ADD JSON] Adding '$title' by '$artist' to tracks.json"
        
        $newTrack = [PSCustomObject]@{
            id     = $nextId
            title  = $title
            artist = $artist
            files  = [PSCustomObject]@{
                flac = "$newBasename.flac"
                ogg  = "$newBasename.ogg"
            }
            cover  = "${newBasename}_cover.jpg"
        }
        
        $tracks += $newTrack
        $nextId++
        $stats.TracksAdded++
    }
    else {
        Write-Host "[SKIP JSON] '$title' already in tracks.json"
    }
    
    Write-Host ""
}

# Save updated tracks.json (UTF8 without BOM for Node.js compatibility)
$json = $tracks | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($TracksJson, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host "========================================"
Write-Host "  Done!"
Write-Host "  Files Renamed:    $($stats.FilesRenamed) file(s)"
Write-Host "  OGG Converted:    $($stats.OggConverted) file(s)"
Write-Host "  OGG Skipped:      $($stats.OggSkipped) file(s)"
Write-Host "  Covers Extracted: $($stats.CoverExtracted) file(s)"
Write-Host "  Covers Skipped:   $($stats.CoverSkipped) file(s)"
Write-Host "  Tracks Added:     $($stats.TracksAdded) entry(s)"
Write-Host "========================================"
Write-Host ""
