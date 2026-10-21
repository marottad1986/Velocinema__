# Voce sintetica gratuita per i film: Kokoro (licenza Apache 2.0), voce maschile italiana im_nicola.
# Prepara (una volta): python -m venv .venv-voce && .venv-voce/bin/pip install kokoro-onnx soundfile
#   e scarica in voce-modello/ kokoro-v1.0.onnx e voices-v1.0.bin da
#   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
# Uso: .venv-voce/bin/python scripts/voce-kokoro.py voce-modello films/<film>.json audio/<film>
#   poi npm run voce -- <film>
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
mdir, jpath, outdir = sys.argv[1:4]
VOICE, PAUSE, MARGIN = 'im_nicola', 0.14, 0.2
k = Kokoro(f"{mdir}/kokoro-v1.0.onnx", f"{mdir}/voices-v1.0.bin")
film = json.load(open(jpath))
segs = [('00_copertina', [film['copertina']['voce']], film['copertina']['durata'])]
for i, c in enumerate(film['capitoli'], 1):
    segs.append((f"{i:02d}_{c['id']}", c['sottotitoli'], c['durata']))

def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 200): idx[-1] + 400] if len(idx) else a

def render(lines, speed):
    parts, sr = [], 24000
    for l in lines:
        s, sr = k.create(l, voice=VOICE, speed=speed, lang='it')
        parts += [trim(s), np.zeros(int(PAUSE * sr), dtype=np.float32)]
    return np.concatenate(parts[:-1]), sr

for name, lines, dur in segs:
    target = dur - MARGIN
    speed = 1.2
    for _ in range(4):
        a, sr = render(lines, speed)
        L = len(a) / sr
        if L <= target or speed >= 1.75: break
        speed = min(1.75, speed * L / target * 1.02)
    sf.write(f"{outdir}/{name}.wav", a, sr)
    print(f"{name:16} {dur:4.1f}s  voce {L:5.2f}s  velocità {speed:.2f}{'  <-- LUNGA' if L > target else ''}")
