#!/usr/bin/env bash
# =============================================================================
# Balthasar — prepara l'ospitalita' di Ground Zero (una volta sola, da root).
#
#   sudo bash ~/Claude/balthasar-groundzero/installa.sh
#
# Crea /var/www/html/ground-zero di randolph:www-data e installa la
# configurazione di Apache con autoprova; se la prova fallisce torna indietro.
# =============================================================================
set -euo pipefail
[[ $EUID -eq 0 ]] || exec sudo bash "$0" "$@"
SRC="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
WEB=/var/www/html/ground-zero
CONF=/etc/apache2/conf-available/ground-zero.conf

echo "== cartella del sito =="
install -d -o randolph -g www-data -m 2775 "$WEB"
ls -ld "$WEB" | awk '{print "   " $1, $3":"$4, $NF}'

echo "== configurazione di Apache =="
PRIMA=""
[[ -f $CONF ]] && { PRIMA=$(mktemp); cp "$CONF" "$PRIMA"; }
install -o root -g root -m 0644 "$SRC/apache-ground-zero.conf" "$CONF"
a2enconf -q ground-zero
if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
  systemctl reload apache2
  echo "   ground-zero.conf attiva, Apache ricaricato"
else
  apache2ctl configtest || true
  if [[ -n $PRIMA ]]; then cp "$PRIMA" "$CONF"; else a2disconf -q ground-zero; rm -f "$CONF"; fi
  echo "!! prova di Apache fallita: configurazione ritirata, niente ricaricato" >&2
  exit 1
fi
