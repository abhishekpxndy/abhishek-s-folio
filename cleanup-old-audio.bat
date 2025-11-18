@echo off
echo ========================================
echo  Cleaning up old piano MP3 files
echo ========================================
echo.
echo This will DELETE 36 MP3 files (~1.09 MB)
echo These files are no longer needed because
echo we're using the Web Audio synthesizer.
echo.
echo Files to delete: public\textures\sounds\AUD-*.mp3
echo.
pause

echo.
echo Deleting files...
del /Q public\textures\sounds\AUD-*.mp3

echo.
echo ✅ Done! Deleted 36 piano MP3 files
echo 💾 Saved ~1.09 MB of space
echo.
echo Your portfolio will now load faster on iPhone!
echo.
pause
