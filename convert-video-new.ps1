Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- Konfigurace ---
$SrcRoot    = '.\src\posts'                      # kořen GIFů
$SrcGlob    = Join-Path $SrcRoot '**\*.gif'      # podporuje více úrovní složek
$OutRoot    = 'static\videos'
$FfmpegExe  = 'C:\programs\ffmpeg-8.0-full_build\bin\ffmpeg.exe'
$MaxWidth   = 900
$ForceRebuild = $false          # $true = překóduj vše znovu, $false = jen změněné

function Get-FileSizeString {
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

$srcRootAbs = (Resolve-Path $SrcRoot).Path
$results = @()

Get-ChildItem -Path $SrcGlob -File | Sort-Object Length -Descending | ForEach-Object {
    $gif = $_

    $relDir = ($gif.Directory.FullName.Substring($srcRootAbs.Length)).TrimStart('\','/')
    $outDir = if ($relDir) { Join-Path $OutRoot $relDir } else { $OutRoot }
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null

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
        & $FfmpegExe -y -hide_banner `
            -i $gif.FullName `
            -vf $vf,format=yuv420p `
            -c:v libx264 -crf 23 -preset veryslow -pix_fmt yuv420p `
            -movflags +faststart -an `
            $mp4Path
    }

    if ($doWebm) {
        & $FfmpegExe -y -hide_banner `
            -i $gif.FullName `
            -vf $vf `
            -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -tile-columns 2 `
            -an `
            $webmPath
    }

    if ($doPoster) {
        & $FfmpegExe -y -hide_banner `
            -i $gif.FullName -frames:v 1 -q:v 2 `
            $posterPath
    }

    $results += [pscustomobject]@{
        Source        = ($gif.FullName.Substring($srcRootAbs.Length)).TrimStart('\','/')
        SourceSize    = Get-FileSizeString $gif.FullName
        Mp4Size       = Get-FileSizeString $mp4Path
        WebmSize      = Get-FileSizeString $webmPath
        Poster        = ($posterPath.Substring((Resolve-Path '.').Path.Length)).TrimStart('\','/')
        UpdatedMp4    = $doMp4
        UpdatedWebm   = $doWebm
        UpdatedPoster = $doPoster
    }
}

$results | Format-Table -AutoSize
Write-Host "`nDONE ✅"
