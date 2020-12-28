@echo off
title RBH Bot
cd "C:\Hosting\rbhbot"
:loop
Echo Bootup at [%date%, %time%]
Node main.js
goto loop