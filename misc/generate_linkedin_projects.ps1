$projectsData = Invoke-RestMethod -Uri "https://abdxdev.vercel.app/api/portfolio/projects"

# Note: Invoke-RestMethod might return the objects directly as an array without wrapper
$projectsToConvert = if ($projectsData.value) { $projectsData.value } else { $projectsData }
if ($projectsData[0].title) {
    $projectsToConvert = $projectsData
}

$linkedinProjects = @()

foreach ($proj in $projectsToConvert) {
    # Format dates
    $startDateStr = $proj.created_at
    if ($startDateStr) {
        $startDate = Get-Date $startDateStr
        $startMonth = $startDate.Month
        $startYear = $startDate.Year
    } else {
        $startMonth = $null
        $startYear = $null
    }
    
    $endDateStr = $proj.updated_at
    if ($endDateStr) { 
        $endDate = Get-Date $endDateStr
        $endMonth = $endDate.Month
        $endYear = $endDate.Year
    } else {
        $endMonth = $null
        $endYear = $null
    }
    
    # Description build-up
    $description = ""
    if ($proj.description -and $proj.description.Trim() -ne "") {
        $description += $proj.description + "`n`n"
    }
    if ($proj.homepage -and $proj.homepage.Trim() -ne "") {
        $description += "Site: $($proj.homepage)`n"
    }
    if ($proj.html_url -and $proj.html_url.Trim() -ne "") {
        $description += "Github: $($proj.html_url)"
    }
    $description = $description.Trim()
    
    # Media build-up
    $media = @()
    
    if ($proj.thumbnails) {
        foreach ($thumbUrl in $proj.thumbnails) {
            $media += @{
                link = $thumbUrl
            }
        }
    } elseif ($proj.default_image_url) {
        $media += @{
            link = $proj.default_image_url
        }
    }

    $linkedinProj = @{
        name = $proj.title
        description = $description
        details = @{
            timePeriod = @{
                startDate = @{
                    month = $startMonth
                    year = $startYear
                }
            }
        }
    }
    
    # Add end dates if they apply
    if ($endMonth -ne $null) {
        $linkedinProj.details.timePeriod.endDate = @{
            month = $endMonth
            year = $endYear
        }
    }
    
    # Add media
    if ($media.Count -gt 0) {
        $linkedinProj.media = $media
    }
    
    $linkedinProjects += $linkedinProj
}

$linkedinProjects | ConvertTo-Json -Depth 5 | Out-File "linkedin_projects.json" -Encoding utf8
Write-Host "Successfully generated linkedin_projects.json"