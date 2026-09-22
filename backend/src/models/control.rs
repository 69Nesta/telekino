use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum ControlCommand {
    PlayPause,
    PreviousTrack,
    NextTrack,
    VolumeUp,
    VolumeDown,
    VolumeMute,
    LeftArrow,
    RightArrow,
}
