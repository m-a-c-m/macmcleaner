fn run_ps(cmd: &str) -> String {
    std::process::Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default()
}

pub fn get_recycle_bin_size() -> u64 {
    run_ps(
        "(New-Object -ComObject Shell.Application).NameSpace(0xa).Items() | \
         Measure-Object -Property Size -Sum | Select-Object -ExpandProperty Sum"
    ).parse::<u64>().unwrap_or(0)
}

pub fn get_recycle_bin_count() -> usize {
    run_ps(
        "(New-Object -ComObject Shell.Application).NameSpace(0xa).Items().Count"
    ).parse::<usize>().unwrap_or(0)
}

pub fn empty_recycle_bin() -> Result<(), String> {
    let out = std::process::Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command",
               "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"])
        .output()
        .map_err(|e| e.to_string())?;

    if out.status.success() { Ok(()) }
    else { Err(String::from_utf8_lossy(&out.stderr).to_string()) }
}
