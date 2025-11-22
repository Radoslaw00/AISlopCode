#include <stdio.h>
#include <windows.h>

// External functions from ASM and Rust
extern double asm_cpu_test();
extern double asm_gpu_test();
extern double ram_test_c();

// Structure to hold results
typedef struct {
    double cpu_flops;
    double ram_speed;
    double gpu_score;
} BenchResults;

BenchResults run_full_suite() {
    BenchResults res;
    
    printf("Starting CPU Test...\n");
    res.cpu_flops = asm_cpu_test();
    printf("CPU Done: %.2f GFLOPS\n", res.cpu_flops);
    
    printf("Starting RAM Test...\n");
    res.ram_speed = ram_test_c();
    printf("RAM Done: %.2f GB/s\n", res.ram_speed);
    
    printf("Starting GPU Test...\n");
    res.gpu_score = asm_gpu_test();
    printf("GPU Done: %.2f Score\n", res.gpu_score);
    
    return res;
}
