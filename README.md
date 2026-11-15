# Quadra — Estúdio de HQ Digital

Aplicativo de criação de histórias em quadrinhos, com interface mobile-first e empacotamento Android.

## Ferramentas
- Desenho por toque e mouse: pincel e borracha.
- Quadros, balões, caixas de texto, retículas e linhas de ação.
- Modelos iniciais: mangá, grade europeia, comics, webtoon e yonkoma.
- Direção de leitura configurável: esquerda-direita, direita-esquerda e vertical.
- Página vertical, horizontal, tira e rolagem vertical.
- Páginas múltiplas, desfazer, duplicar e excluir objetos.
- Salvamento local, importação/exportação JSON e exportação PNG.

## Arquitetura Android
O projeto mantém a interface em HTML, CSS e JavaScript Canvas. O Capacitor empacota essa interface em um aplicativo Android (WebView). O GitHub Actions prepara os recursos web, gera o projeto Android, compila um APK de depuração e publica o arquivo como artefato da execução.

**Não utiliza GitHub Pages, hospedagem web ou servidor próprio.** O APK é instalado no dispositivo e a criação/armazenamento dos projetos ocorre localmente.

## Gerar o APK
1. Abra a aba **Actions** do repositório.
2. Selecione **Build Quadra Android APK**.
3. Execute **Run workflow** ou aguarde a compilação automática após um push na branch `main`.
4. Ao terminar, abra a execução e baixe o artefato **Quadra-Android-debug**.
5. Extraia o ZIP e instale `app-debug.apk` no Android. O Android poderá solicitar autorização para instalar aplicativos dessa origem.

O APK de depuração é destinado a testes. Uma versão de distribuição exige assinatura de release e gerenciamento seguro da chave de assinatura.

## Desenvolvimento local
Requer Node.js 22, Java 21 e Android SDK. Depois de instalar as dependências com `npm install`, execute:

```bash
npm run android:build
```

O projeto Android é gerado no processo de compilação e fica ignorado pelo Git; a fonte de configuração é `capacitor.config.json`.

## Limitações da versão 0.2
Ainda não há pressão de caneta, camadas raster independentes, modelos 3D, vetorização, OCR, animação, colaboração em tempo real ou exportação profissional CMYK/PDF. O desenho usa Canvas 2D dentro do WebView; o empacotamento Android não transforma esse motor em renderização nativa.

## Pesquisa e referências
- Clip Studio Paint, ferramentas de quadrinhos: https://www.clipstudio.net/pt/comics-manga/
- Krita, modelos de páginas para quadrinhos: https://docs.krita.org/en/user_manual/templates.html
- Kim (2023), leitura horizontal e vertical em aplicativos: https://doi.org/10.5100/jje.59.JS-12
- Cohn et al. (2017), variações culturais de layout: https://doi.org/10.1080/21504857.2017.1413667
- Capacitor Android: https://capacitorjs.com/docs/android
- GitHub Actions artifacts: https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts
