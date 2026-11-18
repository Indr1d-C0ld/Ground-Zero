#!/usr/bin/env bash
# =============================================================================
# Ground Zero — build sotto /ground-zero/ e pubblicazione su Balthasar.
#
#   bash deploy/pubblica.sh            # build + rsync
#   bash deploy/pubblica.sh --prova    # solo build e rsync a secco (--dry-run)
#
# Prima volta: la cartella e la configurazione di Apache le prepara
#   sudo bash ~/Claude/balthasar-groundzero/installa.sh   (su Balthasar)
# =============================================================================
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")/.."

HOST=${GZ_HOST:-balthasar}
DEST=${GZ_DEST:-/var/www/html/ground-zero}
BASE=${GZ_BASE:-/ground-zero/}
URL=${GZ_URL:-https://timrouter.dns.army/ground-zero/}
DRY=""; [[ ${1:-} == --prova ]] && DRY="--dry-run"

echo "== build (base $BASE) =="
GZ_BASE="$BASE" npm run build --silent

VERSION=$(node -p "require('./package.json').version")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "?")
SPORCO=$([[ -n $(git status --porcelain 2>/dev/null) ]] && echo true || echo false)
cat > dist/version.json <<JSON
{"name":"Ground Zero","version":"$VERSION","commit":"$COMMIT","dirty":$SPORCO,"built":"$(date -Iseconds)"}
JSON
echo "   versione $VERSION ($COMMIT$([[ $SPORCO == true ]] && echo ', modifiche non committate'))"

echo "== rsync verso $HOST:$DEST =="
rsync -az --delete --delay-updates $DRY \
  --chmod=D2775,F0664 \
  --exclude '.DS_Store' \
  dist/ "$HOST:$DEST/"

[[ -n $DRY ]] && exit 0
echo "== verifica =="
code=$(curl -s -o /dev/null -w '%{http_code}' "$URL")
ver=$(curl -s "${URL}version.json" | node -pe 'JSON.parse(require("fs").readFileSync(0)).commit' 2>/dev/null || echo "?")
echo "   $URL → HTTP $code, commit pubblicato $ver"
[[ $code == 200 && $ver == "$COMMIT" ]]
