# Bonde do Tigrinho · O Jogo

Clone de jogo de dança feito com **Teachable Machine (Pose)**, **YouTube** e **JavaScript puro**.
Funciona em hospedagem comum (HostGator): HTML + CSS + JS + um PHP de 10 linhas.

## Estrutura

```
bonde-do-tigrinho/
├── index.html            o jogo (menu, palco, resultado)
├── criar.html            ajuda a escrever um arquivo .tigrinho sem erro
├── estilo.css
├── .htaccess             avisa o servidor que .tigrinho é JSON
├── img/tigrinho.svg
├── js/
│   ├── configuracao.js   tudo que muda: link do modelo, poses, limiar, pontos
│   ├── pictogramas.js    desenha os bonequinhos das poses
│   ├── musicas.js        acha, lê e confere os arquivos .tigrinho
│   ├── coreografia.js    transforma a música numa sequência de poses
│   ├── youtube.js        toca o clipe (YouTube IFrame API)
│   ├── detector.js       diz qual pose você está fazendo  ← PARTE AO VIVO
│   ├── interface.js      mexe na tela
│   ├── jogo.js           regras e pontuação
│   ├── principal.js      coordena todo mundo
│   └── criador.js        lógica da página criar.html
├── musicas/
│   ├── listar.php        lista os .tigrinho da pasta (roda no servidor)
│   ├── lista.json        plano B quando não tem PHP (Live Server)
│   └── *.tigrinho        uma música por arquivo
└── LEIA-ME.md
```

> O tutorial da parte ao vivo e o gabarito do `detector.js` ficam na pasta `PROFESSOR/`, **fora** do site: não envie essa pasta para o servidor.

## Publicar na HostGator

1. Abra o FileZilla e conecte (`ftp.industrialab.online`, porta 21, usuário e senha da conta).
2. Arraste a pasta `bonde-do-tigrinho` inteira para dentro de `public_html/` (ou da pasta indicada).
3. Abra `https://industrialab.online/bonde-do-tigrinho/`.

> Use **https**. Sem ele o navegador não libera a câmera.
> O FileZilla esconde arquivos que começam com ponto. Se o `.htaccess` não subir: menu **Servidor → Forçar exibição de arquivos ocultos**.
> Se o site der **Erro 500** depois de subir o `.htaccess`, apague a linha `Options -Indexes` dele.

## O formato `.tigrinho`

É um arquivo de texto com **JSON** dentro. A extensão própria só diz "quem sabe ler isso é o Bonde do Tigrinho".

```json
{
  "formato": "tigrinho/1",
  "titulo": "Heroes Tonight",
  "artista": "Janji feat. Johnning (NCS)",
  "youtube": "https://www.youtube.com/watch?v=3nQNiWdeH2Q",
  "bpm": 128,
  "dificuldade": "facil",
  "inicio": 0,
  "fim": 90,
  "cor": "#ff8c42",
  "enviadoPor": "Grupo 3 · 3º DS",
  "coreografia": null
}
```

| Campo | Obrigatório | O que é |
|---|---|---|
| `titulo`, `artista` | sim | texto |
| `youtube` | sim | link do clipe (watch, youtu.be, shorts ou embed) |
| `bpm` | sim | batidas por minuto, **número sem aspas** (40 a 220) |
| `dificuldade` | sim | `"facil"` (pose a cada 8 batidas), `"medio"` (4) ou `"dificil"` (2) |
| `inicio`, `fim` | não | em que segundo a dança começa e termina (padrão: 0 e 90) |
| `cor` | não | cor do cartão, `"#rrggbb"` |
| `enviadoPor` | não | nome do grupo |
| `coreografia` | não | `null` = o jogo gera sozinho. Ou uma lista: `[{ "tempo": 12.5, "pose": "t_pose" }, …]` |

**Regras do JSON:** aspas **duplas**, nada de vírgula sobrando antes de `}` ou `]`, nada de comentários.

**Atenção ao clipe:** alguns donos de vídeo bloqueiam a reprodução fora do YouTube. Se aparecer "não deixa ele tocar fora do YouTube", troque o link.

## Missão dos alunos (teste do FileZilla)

1. Abra `criar.html` no site, preencha e clique em **Baixar arquivo**.
2. Nome do arquivo: `grupoX-nome-da-musica.tigrinho` (sem espaço, sem acento).
3. No FileZilla, envie o arquivo para a pasta `musicas/` do jogo.
4. Recarregue o jogo. Sua música apareceu? Se apareceu um cartão vermelho, leia o problema, corrija e envie de novo.

No Live Server (sem PHP), acrescente o nome do arquivo em `musicas/lista.json` para ele aparecer.
