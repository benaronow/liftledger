#!/usr/bin/env bash
# Wrapper around `maestro test` that points the JVM at a trust store including
# the local mkcert root CA, so the host-side seed/reset scripts can reach the
# dev API over https://localhost:4000 without a PKIX/cert error.
#
# Usage (same args as `maestro test`):
#   apps/mobile/.maestro/run.sh apps/mobile/.maestro/flows/test1-week1.yaml -e INTERNAL_SECRET=...
#
# The trust store (truststore.jks) is machine-local and gitignored. Rebuild it
# if your mkcert CA changes — see .maestro/README.md.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStore=$DIR/truststore.jks -Djavax.net.ssl.trustStorePassword=changeit"
exec maestro test "$@"
