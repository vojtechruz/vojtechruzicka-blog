Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- Konfigurace ---
$SrcRoot      = "src\posts"
$OutRoot      = "src\static\videos"
$FfmpegExe    = 'C:\Program Files\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe'
$MaxWidth     = 900
$ForceRebuild = $false          # $true = překóduj vše znovu, $false = jen změněné

function Get-FileSize {
    param([string]$Path)
    if (!(Test-Path -LiteralPath $Path)) { return '-' }
    [long]$len = (Get-Item -LiteralPath $Path).Length
    switch ($len) {
        {$_ -ge 1TB} { return ('{0:N2} TB' -f ($len / 1TB)) }
        {$_ -ge 1GB} { return ('{0:N2} GB' -f ($len / 1GB)) }
        {$_ -ge 1MB} { return ('{0:N2} MB' -f ($len / 1MB)) }
        {$_ -ge 1KB} { return ('{0:N2} KB' -f ($len / 1KB)) }
        default      { return "$len bytes" }
    }
}

if (!(Test-Path $OutRoot)) {
    New-Item -ItemType Directory -Path $OutRoot -Force | Out-Null
}

$results = @()
$gifs = Get-ChildItem -Path $SrcRoot -Filter "*.gif" -File -Recurse | Sort-Object Length -Descending

if ($null -eq $gifs) {
    Write-Host "No GIF files found in $SrcRoot"
}
else {
    foreach ($gif in $gifs) {
        # Výstupní složka je pojmenována podle složky, ve které je GIF (v našem projektu je to post-name)
        $directoryName = $gif.Directory.Name
        $outDir = Join-Path $OutRoot $directoryName
        if (!(Test-Path $outDir)) {
            New-Item -ItemType Directory -Path $outDir -Force | Out-Null
        }

        $baseName = $gif.BaseName
        $mp4Path     = Join-Path $outDir ($baseName + '.mp4')
        $webmPath    = Join-Path $outDir ($baseName + '.webm')
        $posterPath  = Join-Path $outDir ($baseName + '-poster.jpg')

        # společný filter chain
        $vf = "crop=trunc(iw/2)*2:trunc(ih/2)*2,scale='min($MaxWidth,iw)':-2:flags=lanczos"

        $doMp4    = $ForceRebuild -or !(Test-Path $mp4Path)  -or ((Get-Item $mp4Path).LastWriteTime  -lt $gif.LastWriteTime)
        $doWebm   = $ForceRebuild -or !(Test-Path $webmPath) -or ((Get-Item $webmPath).LastWriteTime -lt $gif.LastWriteTime)
        $doPoster = $ForceRebuild -or !(Test-Path $posterPath) -or ((Get-Item $posterPath).LastWriteTime -lt $gif.LastWriteTime)

        if ($doMp4) {
            Write-Host "Processing MP4: $($gif.Name)"
            & $FfmpegExe -y -hide_banner `
                -i $gif.FullName `
                -vf "$vf,format=yuv420p" `
                -c:v libx264 -crf 23 -preset veryslow -pix_fmt yuv420p `
                -movflags +faststart -an `
                $mp4Path
        }

        if ($doWebm) {
            Write-Host "Processing WebM: $($gif.Name)"
            & $FfmpegExe -y -hide_banner `
                -i $gif.FullName `
                -vf $vf `
                -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -tile-columns 2 `
                -an `
                $webmPath
        }

        if ($doPoster) {
            Write-Host "Processing Poster: $($gif.Name)"
            & $FfmpegExe -y -hide_banner `
                -i $gif.FullName -frames:v 1 -q:v 2 `
                $posterPath
        }

        $results += [pscustomobject]@{
            Post          = $directoryName
            File          = $gif.Name
            SourceSize    = Get-FileSize $gif.FullName
            Mp4Size       = Get-FileSize $mp4Path
            WebmSize      = Get-FileSize $webmPath
            Updated       = ($doMp4 -or $doWebm -or $doPoster)
        }
    }

    $results | Format-Table -AutoSize
}

Write-Host "`nDONE ✅"

# Keep window open if run from GUI
if ($Host.Name -eq "ConsoleHost") {
    Write-Host "`nPress any key to exit..."
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
}
