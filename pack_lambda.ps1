#!/usr/bin/env pwsh

try {

    # Create tmp folder for pack
    if (Test-Path "tmp") {
        Remove-Item -Recurse -Force -Path "tmp"
    }
    
    New-Item -ItemType Directory -Force -Path "tmp"
    
    Set-StrictMode -Version latest
    $ErrorActionPreference = "Stop"

    # Get component data and set necessary variables
    $component = Get-Content -Path "component.json" | ConvertFrom-Json
    $buildImage = "$($component.registry)/$($component.name):$($component.version)-$($component.build)-lambda"
    $container = $component.name

    # Build docker image
    docker build -f docker/Dockerfile.build -t $buildImage .

    # Create and copy compiled files, then destroy
    docker create --name $container $buildImage
    docker cp "$($container):/app/obj" ./tmp/obj
    docker rm $container

    # Copy dependency files and sources
    New-Item -ItemType Directory -Force -Path "tmp/config"
    Copy-Item ./config/config.yml ./tmp/config/config.yml
    Copy-Item ./src/ ./tmp/src/ -Recurse
    Copy-Item ./test/ ./tmp/test/ -Recurse
    Copy-Item ./node_modules/ ./tmp/node_modules/ -Recurse
    Copy-Item ./package.json ./tmp/package.json
    Copy-Item ./bin/lambda.js ./tmp/index.js

    # Create dist folder
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force -Path "dist"
    }
    New-Item -ItemType Directory -Force -Path "dist"

    $component = Get-Content -Path "component.json" | ConvertFrom-Json

    # Pack archive for lambda

    $compress = @{
        Path             = "./tmp/*"
        CompressionLevel = "Optimal" #"NoCompression"
        DestinationPath  = "./dist/$($component.name)-lambda-v$($component.version).zip"
    }
    # Archiving
    Compress-Archive @compress
    
    Write-Host "The archive was successfully created."
}
finally {
    Remove-Item -Recurse -Force -Path "tmp"
}