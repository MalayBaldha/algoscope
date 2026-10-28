# Agent Guidelines & Rules

## Git Commit Policy
- Do not run `git commit` commands automatically.
- Always output the suggested commit message, affected files, and instructions in the chat response for the user to review.

## Terminal Command Guidelines
- The terminal environment on Windows is already PowerShell. Never wrap commands in `powershell -Command "..."` or `powershell -NoProfile -Command "..."`. Run commands and PowerShell cmdlets directly (e.g., `git status`, `Get-Content`, `uv run ...`).
- Prefer using the file reading tools directly rather than running shell commands for read queries.
