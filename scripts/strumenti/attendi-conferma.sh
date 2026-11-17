#!/usr/bin/env bash
# Attende la risposta dell'editore a una richiesta dell'app «In 2 minuti» (SOCIAL.md, «Conferme nell'app»).
# Uso: bash scripts/strumenti/attendi-conferma.sh <id> [secondi tra un controllo e l'altro, default 120]
# Da lanciare in background. Esce quando "stato" non è più "aperta" e stampa la richiesta (risposta.nota compresa).
# La chiave (x-avvisi-key) la mette il proxy dell'ambiente: non va scritta qui.
set -u
id="$1"; passo="${2:-120}"
url="https://in-2-minuti-gestione.pages.dev/api/richieste/$id"
while true; do
  r=$(curl -sS "$url" || true)
  stato=$(printf '%s' "$r" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).stato||"")}catch{console.log("")}})')
  if [ -n "$stato" ] && [ "$stato" != "aperta" ]; then
    echo "STATO: $stato"; echo "$r"; exit 0
  fi
  sleep "$passo"
done
