# Audiobook — Logística sustentável e reversa

Geração automatizada de audiobook em português brasileiro a partir das páginas 9 a 12 do material fornecido.

## Tecnologia

- **Piper TTS**: síntese neural local, executada em CPU.
- **Voz**: `pt_BR-faber-medium`.
- **FFmpeg**: conversão para MP3 e concatenação dos capítulos.
- **GitHub Actions**: execução automatizada e publicação do resultado como artefato.

## Resultado

O workflow gera:

- `audiobook-logistica-sustentavel.mp3`: audiobook completo.
- Quatro arquivos MP3 individuais, um por capítulo.

## Execução

O workflow é executado automaticamente quando arquivos desta pasta ou o próprio workflow são alterados na branch principal. Também pode ser iniciado manualmente pela aba **Actions**, selecionando **Gerar audiobook - Logística sustentável** e clicando em **Run workflow**.

Após a conclusão, baixe o pacote em **Artifacts** na página da execução.

## Estrutura

```text
audiobook-logistica/
├── roteiro/
│   ├── pagina-09.txt
│   ├── pagina-10.txt
│   ├── pagina-11.txt
│   └── pagina-12.txt
├── scripts/
│   └── gerar_audiobook.py
├── requirements.txt
└── dist/                 # gerado pelo workflow
```

Os arquivos de áudio são gerados durante a execução e não são versionados no Git.
