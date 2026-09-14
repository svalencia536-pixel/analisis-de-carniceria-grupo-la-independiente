@echo off
chcp 65001 >nul
title Subir cambios a GitHub
cd /d "%~dp0"

rem Quita restricciones heredadas que impiden mostrar el inicio de sesion
set GIT_TERMINAL_PROMPT=
set GIT_ASKPASS=
set SSH_ASKPASS=
set GCM_INTERACTIVE=always

echo.
echo  Subiendo los cambios del aplicativo a GitHub...
echo  Si aparece una ventana de GitHub, toca "Sign in with your browser" y autoriza.
echo.
git -c credential.helper= -c credential.helper=manager push origin main
echo.
if %errorlevel%==0 (
  echo  LISTO: los cambios quedaron en GitHub.
) else (
  echo  No se pudo subir. Toma una foto de esta ventana y enviasela a Claude.
)
echo.
pause
