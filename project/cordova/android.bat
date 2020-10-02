@ECHO OFF
SETLOCAL
    SET JAVA_HOME=%ProgramFiles%\Java\jdk1.8.0_261
    SET ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\sdk
    SET PATH=%ProgramFiles%\Java\jdk1.8.0_261\bin;%USERPROFILE%\.gradle\wrapper\dists\gradle-6.6.1-bin\du4tvj86lhti6iga1v8h7pckb\gradle-6.6.1\bin;%PATH%
    npx cordova %1 android
ENDLOCAL
