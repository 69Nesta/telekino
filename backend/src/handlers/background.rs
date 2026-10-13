use crate::config::AppState;
use std::sync::Arc;
#[cfg(target_os = "macos")]
use crate::models::background::Rgb;
#[cfg(target_os = "macos")]
use std::time::{Duration, Instant};

#[cfg(target_os = "macos")]
const SMOOTHING: f32 = 0.18;


#[cfg(target_os = "macos")]
pub fn start_capture(state: Arc<AppState>) {
    std::thread::spawn(move || {
        use screencapturekit::prelude::*;

        let result = (|| -> Result<(), Box<dyn std::error::Error>> {
            let content = SCShareableContent::get()?;
            let display = content
                .displays()
                .into_iter()
                .next()
                .ok_or("No display found")?;
            let width = display.width();
            let height = display.height();
            let filter = SCContentFilter::create()
                .with_display(&display)
                .with_excluding_windows(&[])
                .build()?;
            let config = SCStreamConfiguration::new()
                .with_width(width)
                .with_height(height)
                .with_pixel_format(PixelFormat::BGRA);

            let last_color = Arc::new(std::sync::Mutex::new(Rgb::default()));
            let last_emit = Arc::new(std::sync::Mutex::new(
                Instant::now() - Duration::from_secs(1),
            ));
            let output = state.average_color.clone();
            let mut stream = SCStream::new(&filter, &config)?;
            stream.add_output_handler(
                move |sample: CMSampleBuffer, _: SCStreamOutputType| {
                    let Ok(mut emit_at) = last_emit.try_lock() else {
                        return;
                    };
                    if emit_at.elapsed() < Duration::from_millis(250) {
                        return;
                    }
                    let Some(pixel_buffer) = sample.pixel_buffer() else {
                        return;
                    };
                    let Ok(guard) = pixel_buffer.lock_read_only() else {
                        return;
                    };
                    let Some(data) = (unsafe { guard.as_slice() }) else {
                        return;
                    };
                    let (width, height, stride) = (
                        pixel_buffer.width(),
                        pixel_buffer.height(),
                        pixel_buffer.bytes_per_row(),
                    );
                    if width == 0 || height == 0 || stride < width * 4 {
                        return;
                    }

                    let step_x = (width / 64).max(1);
                    let step_y = (height / 64).max(1);
                    let mut sum = [0u64; 3];
                    let mut count = 0u64;
                    for y in (0..height).step_by(step_y) {
                        for x in (0..width).step_by(step_x) {
                            let i = y * stride + x * 4;
                            if i + 2 >= data.len() {
                                continue;
                            }
                            sum[0] += data[i + 2] as u64;
                            sum[1] += data[i + 1] as u64;
                            sum[2] += data[i] as u64;
                            count += 1;
                        }
                    }
                    if count == 0 {
                        return;
                    }
                    let raw = Rgb {
                        r: (sum[0] / count) as u8,
                        g: (sum[1] / count) as u8,
                        b: (sum[2] / count) as u8,
                    };
                    let Ok(mut previous) = last_color.lock() else {
                        return;
                    };
                    let smooth = Rgb {
                        r: (previous.r as f32 * (1.0 - SMOOTHING) + raw.r as f32 * SMOOTHING) as u8,
                        g: (previous.g as f32 * (1.0 - SMOOTHING) + raw.g as f32 * SMOOTHING) as u8,
                        b: (previous.b as f32 * (1.0 - SMOOTHING) + raw.b as f32 * SMOOTHING) as u8,
                    };
                    *previous = smooth;
                    let _ = output.send(smooth);
                    *emit_at = Instant::now();
                },
                SCStreamOutputType::Screen,
            )?;
            stream.start_capture()?;
            loop {
                std::thread::sleep(Duration::from_secs(3600));
            }
        })();
        if let Err(error) = result {
            eprintln!("Screen capture could not start: {error}");
        }
    });
}

#[cfg(not(target_os = "macos"))]
pub fn start_capture(_state: Arc<AppState>) {
    eprintln!("ScreenCaptureKit color capture is available only on macOS");
}
