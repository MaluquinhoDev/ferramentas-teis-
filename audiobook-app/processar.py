from __future__ import annotations
import json, os, subprocess, sys, urllib.request
from pathlib import Path

job_id = os.environ["JOB_ID"]
base = os.environ["WORKER_URL"].rstrip("/")
secret = os.environ["WORKER_SHARED_SECRET"]
headers = {"Authorization": f"Bearer {secret}"}
request = urllib.request.Request(f"{base}/internal/jobs/{job_id}/input", headers=headers)
with urllib.request.urlopen(request, timeout=60) as response:
    payload = json.loads(response.read().decode("utf-8"))

text = str(payload.get("text", "")).strip()
if not text or len(text) > 120000:
    raise ValueError("Texto vazio ou acima do limite permitido.")
speed = float(payload.get("speed", 1.0))
if not 0.8 <= speed <= 1.3:
    raise ValueError("Velocidade inválida.")

# Uma linha por parágrafo mantém a leitura segmentada pelo Piper.
paragraphs = [line.strip() for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n") if line.strip()]
source = Path("/tmp/audiobook-input.txt")
source.write_text("\n".join(paragraphs) + "\n", encoding="utf-8")
wav = Path("/tmp/audiobook.wav")
mp3 = Path("/tmp/audiobook.mp3")
length_scale = str(1.0 / speed)

subprocess.run([
    sys.executable, "-m", "piper",
    "--data-dir", "/tmp/piper-model",
    "-m", "pt_BR-faber-medium",
    "-f", str(wav),
    "--length-scale", length_scale,
    "--input-file", str(source),
], check=True)
subprocess.run([
    "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
    "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "128k",
    "-metadata", "title=Audiobook gerado pelo Voz",
    str(mp3)
], check=True)
if not mp3.is_file() or mp3.stat().st_size < 1000:
    raise RuntimeError("O arquivo MP3 não foi gerado corretamente.")

status_req = urllib.request.Request(
    f"{base}/internal/jobs/{job_id}/status",
    data=json.dumps({"status":"processing"}).encode(),
    headers={**headers,"Content-Type":"application/json"},
    method="POST"
)
with urllib.request.urlopen(status_req, timeout=30) as response:
    response.read()
print(f"MP3 criado: {mp3.stat().st_size} bytes")
