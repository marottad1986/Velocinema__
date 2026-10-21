# Voce Azure Speech (TTS neurale), alternativa a voce-kokoro.py: stesse clip in audio/<film>/, stessi nomi.
# Chiave: header Ocp-Apim-Subscription-Key (variabile AZURE_SPEECH_KEY, oppure iniettato dal proxy dell'ambiente).
# Regione: AZURE_SPEECH_REGION (predefinita swedencentral). Nessuna dipendenza oltre la libreria standard.
# Uso: python scripts/voce-azure.py <voce> films/<film>.json audio/<film>     (es. it-IT-DiegoNeural)
#      python scripts/voce-azure.py <voce> --campione "testo" <file.wav>     (prova breve)
#   poi npm run voce -- <film>
import io, json, os, ssl, sys, time, urllib.request, wave
from xml.sax.saxutils import escape

REGION = os.environ.get('AZURE_SPEECH_REGION', 'swedencentral')
URL = f'https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1'
PAUSE, MARGIN, MAX_RATE = 0.14, 0.2, 1.75
voice = sys.argv[1]
ctx = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or None)


def tts(lines, rate):
    body = ''.join(f'{escape(l)}<break time="{int(PAUSE * 1000)}ms"/>' for l in lines[:-1]) + escape(lines[-1])
    ssml = (f"<speak version='1.0' xml:lang='it-IT'><voice name='{voice}'>"
            f"<prosody rate='{(rate - 1) * 100:+.0f}%'>{body}</prosody></voice></speak>")
    headers = {'Content-Type': 'application/ssml+xml', 'User-Agent': 'velocinema',
               'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm'}
    if os.environ.get('AZURE_SPEECH_KEY'):
        headers['Ocp-Apim-Subscription-Key'] = os.environ['AZURE_SPEECH_KEY']
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, ssml.encode(), headers)
            return urllib.request.urlopen(req, context=ctx, timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500: raise
            time.sleep(2 ** attempt)
    raise RuntimeError('Azure Speech non risponde')


def length(data):
    with wave.open(io.BytesIO(data)) as w:
        return w.getnframes() / w.getframerate()


if sys.argv[2] == '--campione':
    open(sys.argv[4], 'wb').write(tts([sys.argv[3]], 1.0))
    sys.exit()

jpath, outdir = sys.argv[2:4]
film = json.load(open(jpath))
segs = [('00_copertina', [film['copertina']['voce']], film['copertina']['durata'])]
for i, c in enumerate(film['capitoli'], 1):
    segs.append((f"{i:02d}_{c['id']}", c['sottotitoli'], c['durata']))
os.makedirs(outdir, exist_ok=True)

for name, lines, dur in segs:
    target = dur - MARGIN
    rate = 1.0
    for _ in range(4):
        data = tts(lines, rate)
        L = length(data)
        if L <= target or rate >= MAX_RATE: break
        rate = min(MAX_RATE, rate * L / target * 1.02)
    open(f'{outdir}/{name}.wav', 'wb').write(data)
    print(f"{name:16} {dur:4.1f}s  voce {L:5.2f}s  velocità {rate:.2f}{'  <-- LUNGA' if L > target else ''}")
