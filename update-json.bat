@echo off
setlocal enabledelayedexpansion

REM Define the folders
set "folders=AOM No_Effusion OME"
set "json_file=images.json"

REM Create a temporary file to hold the JSON content
set "temp_json=temp_images.json"
echo { > %temp_json%

REM Iterate over each folder
for %%f in (%folders%) do (
    echo "%%f":[ >> %temp_json%
    
    REM List all images in the current folder
    for %%i in (%%f\*.jpg %%f\*.jpeg %%f\*.png) do (
        echo "%%f/%%~nxi", >> %temp_json%
    )
    
    REM Remove the last comma and close the array
    >nul copy %temp_json% temp_copy.txt
    for /f "delims=" %%j in ('type temp_copy.txt') do set "last_line=%%j"
    set last_line=!last_line:~0,-1!
    >nul findstr /v /r "^.*" %temp_json%
    echo !last_line! >> %temp_json%
    echo ], >> %temp_json%
)

REM Remove the last comma and close the JSON object
>nul copy %temp_json% temp_copy.txt
for /f "delims=" %%j in ('type temp_copy.txt') do set "last_line=%%j"
set last_line=!last_line:~0,-1!
>nul findstr /v /r "^.*" %temp_json%
echo !last_line! >> %temp_json%
echo } >> %temp_json%

REM Clean up temporary file
del temp_copy.txt

REM Move the temporary JSON to the final file
move /y %temp_json% %json_file%

echo JSON file updated successfully!
endlocal
