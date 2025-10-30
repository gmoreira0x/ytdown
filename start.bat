@echo off
title Front + Back

echo Iniciando backend...
cd /d C:\Users\Haaz\Desktop\Node\ytdown\src\server
start /B node server.js

echo Iniciando frontend...
cd /d C:\Users\Haaz\Desktop\Node\ytdown\src
start /B npm start

echo Ambos iniciados. Pressione CTRL+C para parar.
pause
