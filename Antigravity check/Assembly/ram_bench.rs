use std::time::Instant;
use std::thread;
use std::sync::{Arc, Mutex};

#[no_mangle]
pub extern "C" fn rust_ram_test() -> f64 {
    println!("[Rust] Allocating 4GB of RAM...");
    
    // 4GB = 4 * 1024 * 1024 * 1024 bytes
    const SIZE: usize = 4 * 1024 * 1024 * 1024;
    
    // Allocate zeroed memory (this might take a moment)
    let mut data = vec![0u8; SIZE];
    
    println!("[Rust] Starting Parallel Write Test (20s)...");
    
    let start_time = Instant::now();
    let duration = std::time::Duration::from_secs(20);
    
    // We will split the work into chunks and have threads write to them repeatedly
    let thread_count = 8;
    let chunk_size = SIZE / thread_count;
    
    // Unsafe is needed to share mutable raw pointers across threads without Arc<Mutex<Vec>> overhead
    // for the raw buffer, but for simplicity and safety in this snippet, we'll use a slightly different approach:
    // We will just count how many "passes" we can make over smaller buffers in parallel, 
    // OR we can just write to the big buffer once and measure time, but 20s is a long time.
    // Let's simulate heavy memory traffic by repeatedly writing to 4GB.
    
    // Actually, passing a 4GB vec to threads is tricky without unsafe. 
    // Let's do a "simulated" 4GB load by having threads allocate their own 512MB chunks 
    // and hammer them. This ensures we touch 4GB total.
    
    let total_bytes_written = Arc::new(Mutex::new(0u64));
    let mut handles = vec![];
    
    for _ in 0..thread_count {
        let counter = Arc::clone(&total_bytes_written);
        handles.push(thread::spawn(move || {
            let mut local_chunk = vec![0u8; 512 * 1024 * 1024]; // 512MB per thread * 8 = 4GB total active set
            let mut local_written = 0u64;
            
            let t_start = Instant::now();
            while t_start.elapsed() < duration {
                // Write pass
                for i in (0..local_chunk.len()).step_by(64) { // Cache line stride
                    local_chunk[i] = 1;
                }
                local_written += local_chunk.len() as u64;
            }
            
            let mut global = counter.lock().unwrap();
            *global += local_written;
        }));
    }
    
    for h in handles {
        h.join().unwrap();
    }
    
    let total = *total_bytes_written.lock().unwrap();
    let elapsed = start_time.elapsed().as_secs_f64();
    let gb_written = (total as f64) / (1024.0 * 1024.0 * 1024.0);
    let speed = gb_written / elapsed; // GB/s
    
    println!("[Rust] Finished. Speed: {:.2} GB/s", speed);
    
    speed
}
