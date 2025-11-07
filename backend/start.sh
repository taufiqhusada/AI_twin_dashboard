#!/bin/bash
cd "$(dirname "$0")"
export PYTHONPATH=.
uv run python -m app.main
