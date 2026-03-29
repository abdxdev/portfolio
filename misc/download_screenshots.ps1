# powershell -ExecutionPolicy ByPass -File .\download_screenshots.ps1

$data = Invoke-RestMethod -Uri "https://abdxdev.vercel.app/api/portfolio/projects"
$urls = @()
foreach ($project in $data.value) { # The original response root was `value` or sometimes root. I'll handle both.
    if ($project.thumbnails) {
        $urls += $project.thumbnails
    }
}
if ($urls.Count -eq 0) {
    foreach ($project in $data) {
        if ($project.thumbnails) {
            $urls += $project.thumbnails
        }
    }
}

$urls = $urls | Select-Object -Unique

New-Item -ItemType Directory -Force -Path "projects-screenshots" | Out-Null
Write-Host "Total urls:" $($urls.Count)

$count = 0
foreach ($url in $urls) {
    if ($url -match "screenshot") {
        $parts = $url -split "/"
        $repoName = $parts[4]
        $fileName = $parts[-1]
        $outPath = "screenshots\projects\${repoName}_${fileName}"
        
        if (-Not (Test-Path $outPath)) {
            Write-Host "Downloading $outPath ..."
            try {
                Invoke-WebRequest -Uri $url -OutFile $outPath
                $count++
            } catch {
                Write-Host "Failed to download $url" -ForegroundColor Red
            }
        } else {
            Write-Host "Skipping $outPath (already exists)"
            $count++
        }
    }
}
Write-Host "Done! Found/Downloaded $count screenshots in projects-screenshots"