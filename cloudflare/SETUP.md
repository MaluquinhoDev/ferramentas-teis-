# Configuração do serviço Voz

O app publicado no GitHub Pages não contém credenciais. O Cloudflare Worker protege o token do GitHub e mantém os textos em um bucket R2 privado.

## 1. Criar o bucket

No painel Cloudflare, crie um bucket R2 chamado `voz-audiobook-jobs`. Não habilite acesso público. Configure uma regra de ciclo de vida para remover objetos com mais de 7 dias.

## 2. Implantar o Worker

No terminal, dentro da pasta `cloudflare`:

```bash
npm install -g wrangler
wrangler login
wrangler r2 bucket create voz-audiobook-jobs
wrangler deploy
```

O arquivo `wrangler.toml` já declara o vínculo com o bucket.

## 3. Configurar os segredos do Worker

Crie um Fine-grained Personal Access Token no GitHub limitado ao repositório `MaluquinhoDev/ferramentas-teis-`, com permissão **Actions: Read and write** e **Contents: Read-only**. Guarde-o como segredo do Worker:

```bash
wrangler secret put GITHUB_TOKEN
wrangler secret put SHARED_SECRET
```

Use uma senha aleatória longa para `SHARED_SECRET`. Não coloque esses valores no código, no Git ou no navegador.

A URL final do Worker será semelhante a `https://voz-audiobook-api.<conta>.workers.dev`.

## 4. Configurar o GitHub Actions

No repositório, abra **Settings → Secrets and variables → Actions → New repository secret** e crie:

- `WORKER_URL`: URL do Worker, sem barra no final.
- `WORKER_SHARED_SECRET`: exatamente o mesmo valor de `SHARED_SECRET` do Worker.

## 5. Configurar o endereço do app

Edite `app/config.js` e substitua `https://COLOQUE-SEU-WORKER.workers.dev` pela URL real do Worker. Em `cloudflare/wrangler.toml`, ajuste `ALLOWED_ORIGIN` para a origem exata do GitHub Pages.

## 6. Publicar o GitHub Pages

No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como fonte de publicação. Essa ativação inicial precisa ser feita manualmente: o token padrão do Actions deste repositório não tem permissão administrativa para habilitar o Pages.

Depois, abra **Actions → Publicar aplicativo Voz no GitHub Pages → Run workflow**. O workflow valida o PWA, envia a pasta `app` como artefato do Pages e publica o site. Este workflow é manual (`workflow_dispatch`) para não gerar falhas enquanto o Pages ainda não estiver habilitado.

O endereço do projeto será `https://maluquinhodev.github.io/ferramentas-teis-/`.

## 7. Fluxo de dados e privacidade

1. O navegador envia texto e velocidade ao Worker por HTTPS.
2. O Worker valida a entrada, cria um UUID imprevisível, guarda o texto no bucket privado e dispara o workflow enviando somente o UUID ao GitHub.
3. O Actions autentica no Worker com segredo, baixa o texto, converte com Piper e FFmpeg e envia o MP3 ao bucket.
4. O Worker marca o pedido como concluído e apaga o texto original.
5. O navegador consulta o status e baixa o MP3 pelo Worker.

O texto não é colocado nos parâmetros do workflow, no código-fonte ou nos logs do GitHub. O MP3 fica temporariamente no bucket R2 e o artefato do Actions também fica disponível conforme a retenção configurada. O UUID funciona como identificador de acesso: não compartilhe o link de status/áudio.

## Limites do protótipo

- 120.000 caracteres por conversão.
- Arquivos de entrada: texto simples UTF-8 (.txt), até 700 KB.
- Saída: MP3, voz brasileira Piper Faber.
- A execução depende da cota e disponibilidade do GitHub Actions e do Cloudflare R2/Workers.
- O Worker aplica rate limit de 3 solicitações por IP por minuto. Para disponibilização irrestrita ao público, ainda é necessário adicionar autenticação e/ou Turnstile.