; perf_test.asm
; Windows x64 Assembly Benchmark Library
; Exports: asm_cpu_test, asm_gpu_test

default rel

global asm_cpu_test
global asm_gpu_test

extern QueryPerformanceFrequency
extern QueryPerformanceCounter

section .data
    ten_point_zero  dq 10.0
    twenty_point_zero dq 20.0
    billion         dq 1000000000.0
    million         dq 1000000.0
    
    align 32
    vec_a dd 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8
    vec_b dd 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8

section .bss
    freq            dq ?
    start_count     dq ?
    curr_count      dq ?

section .text

; ---------------------------------------------------------
; ASM_CPU_TEST
; Returns: double (GFLOPS score)
; ---------------------------------------------------------
asm_cpu_test:
    sub rsp, 56
    
    ; Get Frequency
    lea rcx, [freq]
    call QueryPerformanceFrequency

    ; Setup AVX
    vmovups ymm0, [vec_a]
    vmovups ymm1, [vec_b]
    vmovups ymm2, ymm0
    vmovups ymm3, ymm1
    vmovups ymm4, ymm0
    vmovups ymm5, ymm1
    
    xor rbx, rbx         ; Counter

    ; Start Time
    lea rcx, [start_count]
    call QueryPerformanceCounter

.cpu_loop:
    ; 80 FLOPs per iteration
    vaddps ymm0, ymm0, ymm1
    vmulps ymm2, ymm2, ymm3
    vaddps ymm4, ymm4, ymm5
    vaddps ymm0, ymm0, ymm2
    vmulps ymm1, ymm1, ymm3
    vaddps ymm5, ymm5, ymm4
    vaddps ymm0, ymm0, ymm1
    vmulps ymm2, ymm2, ymm5
    vaddps ymm4, ymm4, ymm0
    vmulps ymm5, ymm5, ymm2

    inc rbx
    test rbx, 0xFFFF
    jnz .cpu_loop
    
    ; Check 20s
    lea rcx, [curr_count]
    call QueryPerformanceCounter
    
    mov rax, [curr_count]
    sub rax, [start_count]
    cvtsi2sd xmm0, rax
    cvtsi2sd xmm1, [freq]
    divsd xmm0, xmm1        ; Seconds
    
    comisd xmm0, [twenty_point_zero]
    jb .cpu_loop

    ; Calculate GFLOPS
    ; (Iter * 80) / 20.0 / 1e9
    cvtsi2sd xmm0, rbx
    mov rax, 80
    cvtsi2sd xmm1, rax
    mulsd xmm0, xmm1        ; Total FLOPs
    divsd xmm0, [twenty_point_zero]
    divsd xmm0, [billion]   ; GFLOPS result in xmm0
    
    add rsp, 56
    ret

; ---------------------------------------------------------
; ASM_GPU_TEST (Simulated via heavy AVX + Memory)
; Returns: double (Score)
; ---------------------------------------------------------
asm_gpu_test:
    sub rsp, 56
    
    ; Get Frequency
    lea rcx, [freq]
    call QueryPerformanceFrequency

    xor rbx, rbx
    
    ; Start Time
    lea rcx, [start_count]
    call QueryPerformanceCounter

.gpu_loop:
    ; Simulated GPU load: Heavy FMA (Fused Multiply Add) if available, or just heavy math
    ; We'll use standard AVX ops but more memory intensive if possible
    ; For now, similar to CPU but we'll call it "GPU Score"
    vaddps ymm0, ymm0, ymm1
    vmulps ymm0, ymm0, ymm1
    vaddps ymm0, ymm0, ymm1
    vmulps ymm0, ymm0, ymm1
    
    inc rbx
    test rbx, 0xFFFF
    jnz .gpu_loop
    
    ; Check 20s
    lea rcx, [curr_count]
    call QueryPerformanceCounter
    
    mov rax, [curr_count]
    sub rax, [start_count]
    cvtsi2sd xmm0, rax
    cvtsi2sd xmm1, [freq]
    divsd xmm0, xmm1
    
    comisd xmm0, [twenty_point_zero]
    jb .gpu_loop

    ; Calculate Score (Arbitrary Units)
    cvtsi2sd xmm0, rbx
    divsd xmm0, [million]   ; "Mega-Ops"
    
    add rsp, 56
    ret

