@echo off
echo Cleaning up...
del *.obj *.exe *.o *.lib

echo 1. Assembling ASM...
"C:\Program Files\NASM\nasm.exe" -f win64 perf_test.asm -o perf_test.obj
if %errorlevel% neq 0 exit /b %errorlevel%

echo 2. Compiling C RAM Benchmark...
gcc -c ram_bench.c -o ram_bench.o
if %errorlevel% neq 0 exit /b %errorlevel%

echo 3. Compiling C Logic...
gcc -c logic.c -o logic.o
if %errorlevel% neq 0 exit /b %errorlevel%

echo 4. Compiling C++ GUI and Linking Everything...
g++ gui.cpp logic.o ram_bench.o perf_test.obj -o benchmark.exe -lgdi32 -luser32 -lkernel32
if %errorlevel% neq 0 (
    echo Linking failed!
    exit /b %errorlevel%
)

echo.
echo Build Successful! Running Benchmark...
.\benchmark.exe
