from __future__ import annotations

from core.policies.target_allowlist import allow_ct

from .constants import ALLOWED_COMMENT_MODELS


is_comment_target_allowed = allow_ct(ALLOWED_COMMENT_MODELS)
