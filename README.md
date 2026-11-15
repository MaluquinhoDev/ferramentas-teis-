# Quadra — Estúdio de HQ Digital

Aplicativo de criação de histórias em quadrinhos, com interface mobile-first e empacotamento Android.

## Ferramentas
- Ferramentas geométricas: linha, retângulo e elipse, com contorno configurável.
- Estabilizador de traço ajustável para reduzir tremores durante o desenho.
- Conta-gotas para capturar cores já renderizadas na página.
- Desenho por toque e mouse: pincel e borracha.
- Quadros, balões, caixas de texto, retículas e linhas de ação.
- Modelos iniciais: mangá, grade europeia, comics, webtoon e yonkoma.
- Direção de leitura configurável: esquerda-direita, direita-esquerda e vertical.
- Página vertical, horizontal, tira e rolagem vertical.
- Páginas múltiplas, desfazer, duplicar e excluir objetos.
- Salvamento automático local após edições, além de salvamento manual.
- Exportação da página atual em PNG, JPEG ou WebP.
- Exportação em lote de todas as páginas para ZIP, com pasta interna e nomes sequenciais (`pagina-001`, `pagina-002`...).
- Pacote completo ZIP com imagens renderizadas e JSON editável do projeto.
- Exportação CBZ para leitores de quadrinhos, com páginas JPEG numeradas e `ComicInfo.xml`.
- Atalhos de teclado Ctrl/Cmd+Z para desfazer e Ctrl/Cmd+S para salvar (quando há teclado).

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

## Exportação — atualização 0.7

A área de exportação foi redesenhada para projetos com várias páginas. O Quadra renderiza cada página separadamente, respeita a ordem do projeto e gera um único arquivo compactado, evitando depender de múltiplos downloads no Android.

- **Todas as páginas · ZIP:** cria uma pasta com todas as imagens, numeradas com três dígitos e prontas para extrair ou enviar.
- **Pacote completo · ZIP + JSON:** inclui as imagens achatadas e o JSON editável com objetos, camadas e estrutura do projeto. O arquivo JSON preserva a edição; as imagens são cópias finais.
- **HQ para leitor · CBZ:** cria um arquivo CBZ (ZIP) com páginas JPEG em ordem alfabética e `ComicInfo.xml` básico.
- **Página atual:** exporta a página selecionada individualmente.
- Formatos selecionáveis para PNG em lote e página individual: PNG, JPEG e WebP.

A exportação em lote é processada sequencialmente para limitar picos de memória em celulares modestos. O Quadra não cria diretamente uma pasta física escolhida pelo usuário dentro do Android: entrega um ZIP com a estrutura de pastas, que pode ser extraído no gerenciador de arquivos. PDF, impressão profissional, CMYK e sangria continuam fora desta versão.

## Editor avançado — atualização 0.6

- Ferramenta Selecionar: clique em um objeto para selecioná-lo; arraste para mover e use a alça inferior direita para redimensionar.
- A seleção permite excluir ou duplicar o objeto selecionado, em vez de operar somente sobre o último objeto.
- Camadas por página: criar, selecionar, ocultar/mostrar e bloquear/desbloquear. Objetos criados passam a pertencer à camada ativa.
- Projetos JSON versão 3 salvam as camadas; projetos anteriores continuam sendo importados e recebem uma camada inicial automaticamente.
- Gerenciamento de páginas: duplicar, excluir e reordenar páginas, preservando o conteúdo e as camadas.
- Atalho Escape limpa a seleção.

**Limites desta etapa:** o redimensionamento usa uma alça única; ainda não há rotação, seleção múltipla, agrupamento, reordenação visual de camadas, renomeação de camadas ou camadas raster independentes. A renderização continua em um único Canvas 2D.

## Interface mobile e experiência de edição — atualização 0.5

- Barra de ferramentas horizontal e rolável em celulares, liberando espaço vertical para o desenho.
- Área de desenho com prioridade de altura e painel de configurações reorganizado abaixo do editor em telas compactas.
- Alvos de toque ampliados, estados de foco visíveis e melhor contenção da rolagem na área de trabalho.
- Zoom calculado pela largura efetiva do editor, em vez da largura total da tela.
- Salvamento automático local após concluir traços e operações de edição.
- Histórico de desfazer isolado por página, evitando que uma ação em outra página contamine o histórico atual.
- Atalhos Ctrl/Cmd+Z e Ctrl/Cmd+S em dispositivos com teclado.

## Narrativa visual — atualização 0.4

A atualização amplia o vocabulário visual do editor com ferramentas diretas para composição e ritmo:

- Ferramenta de onomatopeia com texto editável, estilos de impacto, suave, elétrico e manual.
- Linhas de movimento radiais para sugerir velocidade, impacto e direção.
- Controles de enquadramento de storyboard: regra dos terços, eixo central e diagonais, com seleção da referência visual.
- Páginas múltiplas usadas como sequência de storyboard; os modelos existentes continuam disponíveis para estruturar a página.
- Os novos objetos são armazenados junto com os demais elementos no JSON do projeto e exportados na imagem da página.

As referências de narrativa visual que fundamentaram esta etapa incluem composição de planos, ritmo de quadros, sarjetas, transições entre painéis, lettering, efeitos sonoros e leitura vertical. 

### Referências de narrativa visual

- Clip Studio Paint — [planejamento e composição de quadrinhos](https://www.clipstudio.net/en/comics-manga/), [storyboard e organização de quadros](https://tips.clip-studio.com/en-us/articles/4811).
- MediaSmarts — [gramática visual dos quadrinhos](https://mediasmarts.ca/digital-media-literacy/media-issues/digital-media-literacy-fundamentals/comics-graphic-novels).
- Scottish Book Trust — [Graphic novels: visual storytelling](https://www.scottishbooktrust.com/).
- WEBTOON — [Creator Handbook](https://webtooncanvas.zendesk.com/hc/en-us).

## Limitações da versão 0.2
Ainda não há pressão de caneta, camadas raster independentes, modelos 3D, vetorização, OCR, animação, colaboração em tempo real ou exportação profissional CMYK/PDF. O desenho usa Canvas 2D dentro do WebView; o empacotamento Android não transforma esse motor em renderização nativa.

## Pesquisa e referências
- Clip Studio Paint, ferramentas de quadrinhos: https://www.clipstudio.net/pt/comics-manga/
- Krita, modelos de páginas para quadrinhos: https://docs.krita.org/en/user_manual/templates.html
- Kim (2023), leitura horizontal e vertical em aplicativos: https://doi.org/10.5100/jje.59.JS-12
- Cohn et al. (2017), variações culturais de layout: https://doi.org/10.1080/21504857.2017.1413667
- Capacitor Android: https://capacitorjs.com/docs/android
- GitHub Actions artifacts: https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts


## Balões e diálogos — Quadra 0.3

O editor de balões foi ampliado com referências de fluxos de trabalho documentados pelo Clip Studio Paint, Krita e MediBang Paint.

- Balões de fala com cauda triangular e direção configurável (oito direções).
- Balões de pensamento, grito, sussurro, voz trêmula/dor, voz eletrônica/rádio e narração.
- Campo de diálogo integrado ao desenho do balão, identificação opcional do personagem e tamanho de letra configurável.
- Quebra automática de linhas e centralização do texto dentro do balão.
- Atributos de balão e diálogo preservados no JSON do projeto.

### Referências consultadas

- Clip Studio Paint — [ferramentas de balões](https://help.clip-studio.com/en-us/manual_en/540_comic/Balloons.htm), [lettering e balões](https://www.clipstudio.net/en/comics-manga/tool/text-balloons.html) e [organização da leitura](https://tips.clip-studio.com/en-us/articles/4811).
- Krita — [recursos vetoriais e balões](https://krita.org/en/features/) e [texto em quadrinhos](https://docs.krita.org/en/user_manual/working_with_text.html).
- MediBang Paint — [criação de quadrinhos e painéis](https://medibangpaint.com/en/tutorial/pc/create-comics/) e [convenções de balões](https://medibangpaint.com/en/use/2021/11/mangatutorialforbeginners08/).

### Limites atuais

A implementação continua sendo um editor Canvas 2D compacto. Ainda não oferece camadas vetoriais independentes, edição posterior de cada ponto da cauda, editor de roteiro em lote, fontes tipográficas próprias de lettering, gerenciamento profissional de páginas para impressão, CMYK ou exportação PDF de gráfica. Os recursos adicionados são uma evolução funcional do protótipo, não uma reprodução integral dos softwares profissionais.

## Desenho e precisão — atualização 0.8

- **Estabilizador de traço:** filtro incremental ajustável de 0 a 20. Valores maiores suavizam mais o movimento, com resposta progressivamente mais lenta; valor zero mantém o traçado sem filtragem.
- **Formas geométricas:** linha, retângulo e elipse desenhados por arraste, usando a cor e a espessura atuais. Os objetos permanecem selecionáveis, movíveis, redimensionáveis e salvos no projeto.
- **Conta-gotas:** captura a cor do pixel visível no quadro e atualiza a cor ativa do pincel.
- Os recursos são implementados no Canvas 2D existente e não exigem bibliotecas ou serviços externos.

**Limites desta etapa:** ainda não há balde de preenchimento com tolerância, seleção livre/laço, Bézier, simetria, réguas de perspectiva, pincéis texturizados ou pressão de caneta. O estabilizador é um filtro de posição simples, não um motor avançado de estabilização com previsão de trajetória.
