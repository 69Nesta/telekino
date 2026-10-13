fn main() {
    #[cfg(target_os = "macos")]
    {
        let mut search_paths = vec![
            "/Library/Developer/CommandLineTools/usr/lib/swift/macosx".to_string(),
            "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx".to_string(),
            "/Applications/Xcode.app/Contents/Developer/usr/lib/swift/macosx".to_string(),
        ];

        let mut rpaths = vec![
            "/usr/lib/swift".to_string(),
            "/Library/Developer/CommandLineTools/usr/lib/swift-5.5/macosx".to_string(),
            "/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift-5.5/macosx".to_string(),
        ];

        if let Ok(output) = std::process::Command::new("xcode-select").arg("-p").output() {
            if output.status.success() {
                let dev_dir = String::from_utf8_lossy(&output.stdout).trim().to_string();
                search_paths.push(format!("{dev_dir}/usr/lib/swift/macosx"));
                search_paths.push(format!("{dev_dir}/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift/macosx"));
                rpaths.push(format!("{dev_dir}/usr/lib/swift-5.5/macosx"));
                rpaths.push(format!("{dev_dir}/Toolchains/XcodeDefault.xctoolchain/usr/lib/swift-5.5/macosx"));
            }
        }

        for path in search_paths {
            if std::path::Path::new(&path).exists() {
                println!("cargo:rustc-link-search=native={path}");
            }
        }

        for rpath in rpaths {
            if std::path::Path::new(&rpath).exists() {
                println!("cargo:rustc-link-arg=-Wl,-rpath,{rpath}");
            }
        }
    }
}
