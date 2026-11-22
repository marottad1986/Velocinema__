#!/usr/bin/env bash
# Attende la risposta dell'editore a una richiesta dell'app «In 2 minuti» (SOCIAL.md, «Conferme nell'app»).
# Uso: bash scripts/strumenti/attendi-conferma.sh <id> [secondi tra un controllo e l'altro, default 120] [minuti massimi, default 100]
# Da lanciare in background. Esce quando "stato" non è più "aperta" e stampa la richiesta (risposta.nota compresa).
# Dopo i minuti massimi esce da solo con «STATO: ancora aperta» (codice 2), prima del limite di 2 ore dei comandi in
# background: la sessione allora NON smette di aspettare, ma fissa un send_later (SOCIAL.md, «Conferme nell'app», punto 4)
# e rilancia lo script. Errore del 22 nov (Donnie Darko): l'attesa scadeva da sola e l'approvazione arrivata dopo non
# l'ha vista nessuno.
# La chiave (x-avvisi-key) la mette il proxy dell'ambiente: non va scritta qui.
set -u
id="$1"; passo="${2:-120}"; massimo="${3:-100}"
url="https://in-2-minuti-gestione.pages.dev/api/richieste/$id"
fine=$(( $(date +%s) + massimo * 60 ))
while true; do
  r=$(curl -sS "$url" || true)
  stato=$(printf '%s' "$r" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log((j.richiesta||j).stato||"")}catch{console.log("")}})')
  if [ -n "$stato" ] && [ "$stato" != "aperta" ] && [ "$stato" != "inviata" ]; then
    echo "STATO: $stato"; echo "$r"; exit 0
  fi
  if [ "$(date +%s)" -ge "$fine" ]; then
    echo "STATO: ancora aperta (richiesta $id). Fissa un send_later fra 60 minuti per ricontrollare e rilancia questo script."
    exit 2
  fi
  sleep "$passo"
done
