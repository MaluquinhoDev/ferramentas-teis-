# Quadra — Estúdio de HQ Digital

Aplicativo web progressivo (PWA), mobile-first, para criar histórias em quadrinhos no celular.

## Ferramentas
- Desenho por toque e mouse: pincel e borracha.
- Quadros, balões, caixas de texto, retículas e linhas de ação.
- Modelos de página: mangá, grade europeia, ação comics, webtoon e yonkoma.
- Direção de leitura configurável: esquerda-direita, direita-esquerda e vertical.
- Página vertical, página horizontal, tira e rolagem vertical.
- Páginas múltiplas, desfazer, duplicar e excluir objetos.
- Salvamento local, importação/exportação de projeto JSON e exportação PNG.
- PWA instalável e cache offline.

## Arquitetura
Aplicação estática sem servidor e sem dependências externas: HTML, CSS, JavaScript Canvas e Service Worker. A escolha reduz consumo de dados, memória e CPU e permite publicação no GitHub Pages.

## Uso
Abra o site no navegador do celular e use a opção de instalar/adicionar à tela inicial. Os projetos ficam no armazenamento local do navegador. Exporte o JSON para criar cópias externas.

## Limitações da versão 0.1
Ainda não há pressão de caneta, camadas raster independentes, modelos 3D, vetorização, OCR, animação, colaboração em tempo real ou exportação profissional CMYK/PDF. São módulos de maior complexidade, não recursos que esta versão afirma possuir.

## Pesquisa e referências
- Clip Studio Paint, ferramentas de quadrinhos: https://www.clipstudio.net/pt/comics-manga/
- Krita, modelos de páginas para quadrinhos: https://docs.krita.org/en/user_manual/templates.html
- Kim (2023), leitura horizontal e vertical em aplicativos: https://doi.org/10.5100/jje.59.JS-12
- Cohn et al. (2017), variações culturais de layout: https://doi.org/10.1080/21504857.2017.1413667
- GitHub Pages com Actions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
