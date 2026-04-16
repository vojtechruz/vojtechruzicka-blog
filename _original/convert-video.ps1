Function Get-FileSize {

    Param(
        [String]$FilePath
    )

    #Get the File Size
    [int]$Length = (Get-Item $FilePath).length

    #Format the File size based on size
    If ($Length -ge 1TB) {
        return "{0:N2} TB" -f ($Length / 1TB)
    }
    elseif ($Length -ge 1GB) {
        return "{0:N2} GB" -f ($Length / 1GB)
    }
    elseif ($Length -ge 1MB) {
        return "{0:N2} MB" -f ($Length / 1MB)
    }
    elseif ($Length -ge 1KB) {
        return "{0:N2} KB" -f ($Length / 1KB)
    }
    else {
        return "$($Length) bytes"
    }
}

$sb = [System.Text.StringBuilder]::new()

Get-ChildItem -Path ".\src\posts\*\*.gif" | Sort-Object Length -Descending | ForEach-Object {
    $file = $_.Directory.Name +"\"+$_.BaseName+$_.Extension
    $directory = $_.Directory.Name
    $directoryPath = "static\videos\"+$directory



    if (Test-Path -Path $directoryPath) {
        Write-Host "Folder already exists."
    } else {
        New-Item -Path "static\videos\" -Name $directory -ItemType Directory
    }

#    Copy-Item $_.FullName -Destination $directoryPath
    $mp4Path = $directoryPath+"\"+$_.BaseName+".mp4"
    & "C:\Program Files\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" -i $_.FullName -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2, scale='min(900,iw)':-2" -f mp4 -c:v libx264 -pix_fmt yuv420p -preset veryslow -fps_mode passthrough $mp4Path

    $webmPath = $directoryPath+"\"+$_.BaseName+".webm"
    & "C:\Program Files\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" -i $_.FullName -c:v vp9 -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2, scale='min(900,iw)':-2" -crf 43 -preset veryslow -fps_mode passthrough $webmPath


    $originalSize = Get-FileSize $_.FullName
    $mp4Size = Get-FileSize $mp4Path
    $webmSize = Get-FileSize $webmPath

    [void]$sb.AppendLine( "-----------------------------------------------------------------")
    [void]$sb.AppendLine($file)
    [void]$sb.AppendLine($originalSize)
    [void]$sb.AppendLine($mp4Size)
    [void]$sb.AppendLine($webmSize)

}

$sb.ToString()
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")