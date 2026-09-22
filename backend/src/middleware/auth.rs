use crate::AppState;
use axum::{
    extract::{FromRef, FromRequestParts},
    http::{StatusCode, header::AUTHORIZATION, request::Parts},
};
use std::sync::Arc;

pub struct Authenticated;

impl<S> FromRequestParts<S> for Authenticated
where
    Arc<AppState>: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let state = Arc::<AppState>::from_ref(state);

        // Extract Bearer token from "Authorization: Bearer <token>"
        let auth_header = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|val| val.to_str().ok())
            .ok_or((StatusCode::UNAUTHORIZED, "Missing Authorization header"))?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or((StatusCode::UNAUTHORIZED, "Invalid Bearer token format"))?;

        // Check if token exists in memory
        let tokens = state.tokens.read().await;
        if tokens.contains(token) {
            Ok(Authenticated)
        } else {
            Err((StatusCode::FORBIDDEN, "Invalid or unapproved token"))
        }
    }
}
