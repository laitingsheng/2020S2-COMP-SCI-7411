@ECHO OFF
SETLOCAL
    SET JAVA_HOME=%ProgramFiles%\Java\jdk1.8.0_261
    SET ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\sdk
    SET PATH=%ProgramFiles%\Java\jdk1.8.0_261\bin;%USERPROFILE%\.gradle\wrapper\dists\gradle-6.7-bin\efvqh8uyq79v2n7rcncuhu9sv\gradle-6.7\bin;%PATH%
    npx cordova %1 android
ENDLOCAL
