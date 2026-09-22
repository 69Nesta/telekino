use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
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

impl ControlCommand {
    pub fn name(&self) -> &'static str {
        match self {
            Self::PlayPause => "play_pause",
            Self::PreviousTrack => "previous_track",
            Self::NextTrack => "next_track",
            Self::VolumeUp => "volume_up",
            Self::VolumeDown => "volume_down",
            Self::VolumeMute => "volume_mute",
            Self::LeftArrow => "left_arrow",
            Self::RightArrow => "right_arrow",
        }
    }
}
