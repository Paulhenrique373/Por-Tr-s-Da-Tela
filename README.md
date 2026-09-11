# Por Trás da Tela — Cyber-Espaço Interativo

Ficção interativa educativa sobre cyberbullying, feita em HTML, CSS e JavaScript puros (sem frameworks e sem etapa de build).

> "Na internet, uma escolha pode mudar a história de alguém."

## O que é

Um jogo de escolhas com 5 capítulos em que o(a) jogador(a) vive situações realistas de cyberbullying — mensagens ofensivas em grupo, perfis falsos, exclusão social, vazamento de imagens — e precisa decidir como agir. As decisões afetam quatro atributos (Segurança, Empatia, Coragem, Confiança), os relacionamentos com os personagens, e levam a um de 6 finais diferentes, com certificado de "Cidadania Digital" ao final.

O conteúdo educativo (base legal, canais de denúncia, sinais de vitimização, kit de primeiros socorros digitais) fica na tela **"Aprenda Mais"**, dentro do menu.

## Como rodar

Não precisa de servidor nem instalação. Basta abrir `index.html` num navegador.

Para hospedar publicamente (ex: mostrar para a turma ou professor), a forma mais simples é subir os arquivos deste repositório no **GitHub Pages**, Netlify ou Vercel — todos suportam sites estáticos de graça, sem configuração além de apontar para a pasta raiz.

## Estrutura dos arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Todas as telas do jogo (menu, configurações, tela de jogo, resultado, etc.) |
| `style.css` | Todo o visual (tema escuro roxo/azul), responsivo para celular e desktop |
| `script.js` | Toda a lógica: estado do jogo, os 5 capítulos, sistema de save, conquistas |
| `favicon.svg` | Ícone da aba do navegador |

## Como adicionar ou editar um capítulo

Os capítulos ficam no array `chapters`, dentro de `script.js` (procure por `// --- CAPÍTULO`). Cada capítulo tem uma lista de `scenes`, e cada cena pode ser de um dos tipos:

- `narrative` — diálogo/narração com escolhas simples
- `phone` — simula um app de celular (chat, feed do "Conecta", notificações, evidências)
- `investigation` — o jogador clica em itens da cena para coletar evidências
- `reflection` — pergunta de reflexão com feedback educativo

Cada escolha (`choices`) pode alterar os atributos (`effects`), os relacionamentos (`relEffects`) e apontar para a próxima cena (`next`, o índice dentro do array `scenes`, ou `nextChapter` para avançar de capítulo).

## Progresso salvo

O progresso fica salvo automaticamente no `localStorage` do navegador (não sai da máquina/navegador do usuário). Na tela de **Configurações** é possível:

- **Exportar** o progresso como um arquivo `.json` (backup, ou para enviar a um professor)
- **Importar** esse arquivo de volta, em qualquer navegador/dispositivo
- **Apagar** todo o progresso salvo

## Certificado

Ao terminar uma partida, é possível baixar o certificado de "Cidadania Digital" como imagem PNG (usa a biblioteca [html2canvas](https://html2canvas.hertzen.com/), carregada via CDN — é necessário estar online para essa função específica).

## Conteúdo educativo — fontes usadas

- Lei 13.185/2015 (Programa de Combate à Intimidação Sistemática / Bullying)
- Lei 13.718/2018 (crime de divulgação de imagem íntima sem consentimento)
- Canais reais de denúncia/apoio: Disque 100, CVV (188), SaferNet Brasil

Todos os nomes de personagens e situações no jogo são fictícios, criados apenas para fins pedagógicos.

## Aviso sobre o CDN externo

O botão "Baixar certificado" depende de carregar `html2canvas` a partir do `cdnjs.cloudflare.com`. Se for hospedar o jogo num ambiente sem acesso à internet (ex: rede interna da escola sem esse domínio liberado), essa função específica não vai funcionar — o restante do jogo continua 100% funcional offline.

## Changelog — v2.0

Melhorias implementadas em cima da base já existente, sem remover capítulos, personagens, finais, save, celular, investigação, conquistas ou certificado:

- **Save com versão e migração** (`SaveSystem.VERSION` + `migrate()`): saves de versões antigas não são mais descartados, só têm os campos que faltam preenchidos.
- **Introdução cinematográfica** antes do Capítulo 1 (frases em sequência + logo do jogo), com botão "Pular".
- **Indicador "digitando..."** no chat do celular antes da última mensagem de cada conversa aparecer.
- **Sistema de pistas conectadas** na investigação: feedback textual ("Você encontrou uma conexão...", "...uma inconsistência") ao reunir evidências.
- **Modal de denúncia com categorias** (Cyberbullying, Assédio, Conteúdo impróprio, Spam, Golpe, Outro) no Conecta — antes era um clique único sem contexto.
- **Correção de bug**: os botões de curtir/denunciar do Conecta não funcionavam quando abertos pelo Hub (só funcionavam na cena de celular); agora funcionam nos dois lugares.
- **Correção de bug**: a tela de criação de personagem não tinha a opção de pronome "Elu/Delu", embora fosse o padrão interno do jogo.
- **Acessibilidade**: novos controles em Configurações — Reduzir Movimento (+ respeito a `prefers-reduced-motion` do sistema), Alto Contraste, Tamanho do Texto (normal/grande/muito grande).
- **Limpeza de código**: remoção de 3 referências a ids inexistentes no cache do DOM (dead code sem efeito funcional).

