# fetch-github-projects.ps1
# Fetches all repos for abdxdev and writes everything to a single output file.

$User        = "abdxdev"
$ApiBase     = "https://api.github.com"
$OutputFile  = "misc/github-projects.md"
$ExcludeForks = $true   # Set to $false to include forked repos
$SkipRepos   = @("abdxdev")      # e.g., @("my-private-repo", "test-repo")
$SkipNoReadme= $true   # Set to $true to skip repos if no README is found
$DescriptionRegex = ":" # Regex filter for description. Only repositories whose description matches this will be fetched.

$Headers = @{ "User-Agent" = "PS-GitHubFetcher/1.0" }

Write-Host "Fetching repos for $User..." -ForegroundColor Cyan

$ReposUrl = "$ApiBase/users/$User/repos?per_page=100`&sort=updated"

try {
    $Repos = Invoke-RestMethod -Uri $ReposUrl -Headers $Headers -ErrorAction Stop
} catch {
    Write-Error "Failed to fetch repos: $_"
    exit 1
}

if ($ExcludeForks) {
    $Repos = $Repos | Where-Object { -not $_.fork }
    Write-Host "Forks excluded. $($Repos.Count) repos remaining." -ForegroundColor Yellow
} else {
    Write-Host "Found $($Repos.Count) repositories (including forks)." -ForegroundColor Green
}

$Lines = [System.Collections.Generic.List[string]]::new()
$Lines.Add("# GitHub Projects - $User")
$Lines.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$Lines.Add("Total: $($Repos.Count)$(if ($ExcludeForks) { ' (forks excluded)' })")
$Lines.Add("")
$Lines.Add("---")
$Lines.Add("")

$Success = 0
$NoReadme = 0
$Failed   = 0
$i        = 0

foreach ($Repo in $Repos) {
    $i++
    $Name        = $Repo.name

    if ($SkipRepos -contains $Name) {
        Write-Host "[$i/$($Repos.Count)] $Name (Skipped - in SkipRepos list)" -ForegroundColor DarkGray
        continue
    }

    $Description = if ($Repo.description) { $Repo.description } else { "No description" }

    if ($DescriptionRegex -and $Description -notmatch $DescriptionRegex) {
        Write-Host "[$i/$($Repos.Count)] $Name (Skipped - description doesn't match filter regex)" -ForegroundColor DarkGray
        continue
    }

    $Branch      = if ($Repo.default_branch) { $Repo.default_branch } else { "main" }
    $Stars       = $Repo.stargazers_count
    $Language    = if ($Repo.language) { $Repo.language } else { "N/A" }
    $Topics      = if ($Repo.topics -and $Repo.topics.Count -gt 0) { $Repo.topics -join ", " } else { "N/A" }
    $HtmlUrl     = $Repo.html_url

    Write-Host "[$i/$($Repos.Count)] $Name" -ForegroundColor Cyan

    $ReadmeUrl = "https://raw.githubusercontent.com/$User/$Name/$Branch/README.md"
    
    $ReadmeContent = $null
    $ReadmeError = $null
    $ReadmeCode = $null

    try {
        $ReadmeContent = Invoke-RestMethod -Uri $ReadmeUrl -Headers $Headers -ErrorAction Stop
    } catch {
        $ReadmeError = $_
        $ReadmeCode = $_.Exception.Response.StatusCode.value__
    }

    if ($SkipNoReadme -and ($ReadmeCode -eq 404 -or $ReadmeError -ne $null)) {
        Write-Host "  Skipped - No README found." -ForegroundColor DarkGray
        $NoReadme++
        continue
    }

    $Lines.Add("## $Name")
    $Lines.Add("- **Description:** $Description")
    $Lines.Add("- **Language:** $Language | **Stars:** $Stars")
    $Lines.Add("- **Topics:** $Topics")
    $Lines.Add("- **URL:** $HtmlUrl")
    $Lines.Add("")

    if (-not $ReadmeError) {
        $Lines.Add("### README")
        $Lines.Add("")
        $Lines.Add($ReadmeContent.TrimEnd())
        $Lines.Add("")

        Write-Host "  README fetched." -ForegroundColor Green
        $Success++
    } else {
        if ($ReadmeCode -eq 404) {
            $Lines.Add("_No README found._")
            $Lines.Add("")
            Write-Host "  No README (404)." -ForegroundColor DarkYellow
            $NoReadme++
        } else {
            $Lines.Add("_Failed to fetch README (HTTP $ReadmeCode)._")
            $Lines.Add("")
            Write-Host "  Failed (HTTP $ReadmeCode)." -ForegroundColor Red
            $Failed++
        }
    }

    $Lines.Add("---")
    $Lines.Add("")

    Start-Sleep -Milliseconds 200
}

$Lines | Set-Content $OutputFile -Encoding UTF8

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "  READMEs fetched : $Success"
Write-Host "  No README       : $NoReadme"
Write-Host "  Errors          : $Failed"
Write-Host "  Output file     : $(Resolve-Path $OutputFile)"