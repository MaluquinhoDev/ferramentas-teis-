from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = Path(__file__).resolve().parent
TEXT_DIR = ROOT / "roteiro"
OUT_DIR = ROOT / "dist"
MODEL = os.getenv("PIPER_MODEL", "pt_BR-faber-medium")
VOICE_SPEED = os.getenv("PIPER_LENGTH_SCALE", "1.0")

CHAPTERS = [
    ("01-estudos-de-caso", "pagina-09.txt"),
    ("02-beneficios", "pagina-10.txt"),
    ("03-panorama-legal", "pagina-11.txt"),
    ("04-desafios-e-encerramento", "pagina-12.txt"),
]


def run(command: list[str], *, input_text: str | None = None) -> None:
    subprocess.run(
        command,
        input=input_text,
        text=True if input_text is not None else None,
        check=True,
    )


def main() -> None:
    if shutil.which("piper") is None:
        raise SystemExit("Executável 'piper' não encontrado. Instale piper-tts.")
    if shutil.which("ffmpeg") is None:
        raise SystemExit("FFmpeg não encontrado.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    wav_files: list[Path] = []

    for chapter_name, source_name in CHAPTERS:
        source = TEXT_DIR / source_name
        if not source.is_file():
            raise FileNotFoundError(f"Roteiro ausente: {source}")

        text = source.read_text(encoding="utf-8").strip()
        if not text:
            raise ValueError(f"Roteiro vazio: {source}")

        wav_path = OUT_DIR / f"{chapter_name}.wav"
        mp3_path = OUT_DIR / f"{chapter_name}.mp3"

        print(f"Gerando capítulo: {chapter_name}")
        run(
            [
                "piper",
                "--model", MODEL,
                "--output_file", str(wav_path),
                "--length_scale", VOICE_SPEED,
            ],
            input_text=text,
        )
        run([
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(wav_path),
            "-codec:a", "libmp3lame", "-b:a", "128k",
            str(mp3_path),
        ])
        wav_files.append(wav_path)

    concat_file = OUT_DIR / "concat.txt"
    concat_file.write_text(
        "".join(f"file '{path.name}'\n" for path in wav_files),
        encoding="utf-8",
    )

    combined_wav = OUT_DIR / "audiobook-completo.wav"
    run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", str(concat_file),
        "-c", "copy", str(combined_wav),
    ])

    final_mp3 = OUT_DIR / "audiobook-logistica-sustentavel.mp3"
    run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(combined_wav),
        "-codec:a", "libmp3lame", "-b:a", "128k",
        "-metadata", "title=Audiobook - Logística Sustentável",
        "-metadata", "artist=Projeto de audiobook",
        str(final_mp3),
    ])

    # WAVs intermediários não são necessários no artefato final.
    for wav in wav_files:
        wav.unlink(missing_ok=True)
    combined_wav.unlink(missing_ok=True)
    concat_file.unlink(missing_ok=True)

    if not final_mp3.is_file() or final_mp3.stat().st_size < 10_000:
        raise RuntimeError("O MP3 final não foi gerado corretamente.")

    print(f"Audiobook pronto: {final_mp3} ({final_mp3.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
