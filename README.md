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


## Aplicativo Voz — conversão de texto em audiobook

O projeto agora inclui um aplicativo web progressivo (PWA) responsivo para celular e Linux, com entrada de texto/arquivo TXT, controle de velocidade, acompanhamento do processamento e download do MP3.

- Interface: [pasta app](app/)
- API segura e armazenamento temporário: [configuração Cloudflare](cloudflare/SETUP.md)
- Workflow sob demanda: [audiobook-dinamico.yml](.github/workflows/audiobook-dinamico.yml)
- Publicação do PWA: [publicar-app-voz.yml](.github/workflows/publicar-app-voz.yml)

**Importante:** a implantação exige configurar Cloudflare R2/Worker e os segredos descritos em `cloudflare/SETUP.md`. O código já está no repositório, mas a API e o app ainda não estarão operacionais até essa configuração.
