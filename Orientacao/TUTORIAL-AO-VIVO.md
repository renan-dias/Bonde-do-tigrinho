# Bonde do Tigrinho · Tutorial da parte ao vivo

**Objetivo da demonstração:** trocar o "detector de teclado" pelo **Teachable Machine (Pose)** e mostrar que o resto do jogo não muda nada.

> Tempo estimado: 25 a 35 minutos (treinar o modelo é a parte mais demorada).
> Precisa de: um notebook **com webcam**, VS Code com a extensão **Live Server**, internet.

---

## 0 · Antes da aula (checklist do professor)

- [ ] O jogo já está no ar em `https://industrialab.online/<pasta-do-jogo>/` e abre no modo teclado.
- [ ] A mesma pasta está aberta no VS Code do notebook.
- [ ] Espaço livre de uns **2 a 3 metros** na frente da webcam, com luz de frente (janela atrás de você atrapalha).
- [ ] Se a aula travar: o arquivo `PROFESSOR/detector-camera.js` (fora da pasta do site) tem a resposta pronta.

---

## 1 · Mostrar o jogo como está (2 min)

1. Abra o site e escolha uma música.
2. Segure as teclas **1 a 5** para "fazer" as poses.
3. Pergunta para a turma: *"Quem está dizendo ao jogo qual pose eu estou fazendo?"*
   Resposta: o arquivo `js/detector.js`. Hoje ele lê o **teclado**.

Abra o `js/detector.js` e mostre as **três funções** que o jogo conhece:

```js
Detector.iniciar(area)   // prepara
Detector.ler()           // devolve { nome, probabilidade }
Detector.parar()         // desliga
```

> **Frase da aula:** o `jogo.js` não sabe se a pose veio do teclado ou da câmera.
> Ele só chama `Detector.ler()`. Por isso dá para trocar um arquivo sem quebrar os outros.

---

## 2 · Treinar o modelo de POSE (15 a 20 min)

1. Abra **teachablemachine.withgoogle.com** → **Get Started** → **Pose Project**.
2. Crie as classes **com estes nomes exatos** (são os mesmos do `configuracao.js`):

| Classe | Como fazer | Atalho no modo teclado |
|---|---|---|
| `bracos_cima` | os dois braços esticados para cima | 1 |
| `t_pose` | braços abertos na horizontal | 2 |
| `direita_cima` | só a mão direita para cima | 3 |
| `esquerda_cima` | só a mão esquerda para cima | 4 |
| `agachado` | joelhos dobrados, mãos à frente | 5 |
| `nada` | ninguém na frente da câmera, ou parado de braços baixos | — |

> **Nome de classe é nome de variável.** Se no Teachable Machine estiver `T Pose` e no código `t_pose`, o jogo nunca vai pontuar.

3. Em cada classe, clique em **Webcam** e segure **Hold to Record**.
   - Grave **uns 50 a 100 exemplos** por classe.
   - Fique de **corpo inteiro** no quadro.
   - Mexa um pouco: mais perto, mais longe, um pouco de lado. Chame **outro aluno** para gravar também.
4. Clique em **Train Model** e **não troque de aba** até terminar.
5. Teste no painel **Preview**: faça cada pose e veja as barras.

> **Pergunta para a turma:** se todos os exemplos forem só do professor, de camiseta azul, o que pode acontecer quando um aluno for jogar?
> (O modelo pode aprender "camiseta azul" em vez da pose. Overfitting.)

---

## 3 · Exportar (1 min)

1. **Export Model** → aba **Tensorflow.js** → **Upload my model** (shareable link).
2. Copie o link. Ele termina com `/`:

```
https://teachablemachine.withgoogle.com/models/aB3xY9kLm/
```

---

## 4 · Colar o link no `configuracao.js` (1 min)

```js
enderecoDoModelo: "https://teachablemachine.withgoogle.com/models/aB3xY9kLm/",
```

> Sem a `/` no final, o jogo vai procurar `.../aB3xY9kLmmodel.json` e não vai achar.

---

## 5 · Ligar as bibliotecas no `index.html` (1 min)

No final do `index.html` existem duas linhas comentadas. **Tire os comentários** `<!--` e `-->`:

```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>
```

Elas precisam ficar **antes** de `js/detector.js` (já estão).

---

## 6 · Reescrever o `js/detector.js` (ao vivo, 8 a 10 min)

Apague o conteúdo do arquivo e escreva junto com a turma, parte por parte.

### 6.1 · O esqueleto (as mesmas 3 funções)

```js
// Responsabilidade: dizer QUAL POSE o jogador está fazendo agora, usando a câmera.

const Detector = {
  tipo: "camera",
  modelo: null,
  webcam: null,
  ctx: null,

  async iniciar(area) { },
  async ler() { },
  parar() { }
};
```

### 6.2 · `iniciar`: carregar o modelo e ligar a câmera

```js
  async iniciar(area) {
    if (!CONFIGURACAO.enderecoDoModelo) {
      throw new Error("cole o link do modelo em js/configuracao.js (enderecoDoModelo).");
    }

    // 1. Carrega o modelo de POSE uma vez só.
    if (!this.modelo) {
      const url = CONFIGURACAO.enderecoDoModelo;
      this.modelo = await tmPose.load(url + "model.json", url + "metadata.json");
    }

    // 2. Liga a câmera (300 × 300, espelhada).
    this.webcam = new tmPose.Webcam(300, 300, true);
    await this.webcam.setup();   // aqui o navegador pede permissão
    await this.webcam.play();

    // 3. Um canvas para desenhar a imagem + o esqueleto.
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    area.innerHTML = "";
    area.appendChild(canvas);
    this.ctx = canvas.getContext("2d");
  },
```

> Pare e pergunte: *"Por que o `if (!this.modelo)`?"* Para não baixar o modelo de novo a cada música.

### 6.3 · `ler`: a rede neural responde

```js
  async ler() {
    this.webcam.update();
    const { pose, posenetOutput } = await this.modelo.estimatePose(this.webcam.canvas);
    const previsoes = await this.modelo.predict(posenetOutput);
    this.desenhar(pose);

    const melhor = previsoes.reduce((a, b) => (b.probability > a.probability ? b : a));
    return { nome: melhor.className, probabilidade: melhor.probability };
  },
```

Explique em duas etapas:

1. `estimatePose` acha **17 pontos do corpo** (nariz, ombros, cotovelos, punhos, quadril, joelhos…).
2. `predict` usa o **seu** modelo para dizer qual das **suas** classes aqueles pontos parecem.

> **Lembrete:** `previsoes` sempre soma 100%. A rede nunca diz "não sei". Quem decide é o `confiancaMinima` no `jogo.js`.

### 6.4 · `desenhar` e `parar`

```js
  desenhar(pose) {
    this.ctx.drawImage(this.webcam.canvas, 0, 0);
    if (pose) {
      tmPose.drawKeypoints(pose.keypoints, 0.5, this.ctx);
      tmPose.drawSkeleton(pose.keypoints, 0.5, this.ctx);
    }
  },

  parar() {
    if (this.webcam) this.webcam.stop();
    this.webcam = null;
  }
```

---

## 7 · Testar no Live Server (3 min)

1. Botão direito no `index.html` → **Open with Live Server**.
2. O navegador pede a câmera → **Permitir**.
3. O aviso amarelo do menu muda para *"Câmera + Teachable Machine ligados"*.
4. Escolha uma música **Fácil** e dance.

**Deu ruim?** Abra o console com **F12**:

| Mensagem | Causa |
|---|---|
| `tmPose is not defined` | As linhas do passo 5 continuam comentadas. |
| `404 … model.json` | Link do modelo errado ou sem `/` no final. |
| `NotAllowedError` | A câmera foi bloqueada. Clique no cadeado da barra de endereço e permita. |
| `NotReadableError` | Outro programa (Meet, Teams) está usando a webcam. |
| Nunca pontua | O nome da classe no Teachable Machine é diferente do nome em `configuracao.js`. |

---

## 8 · Subir pelo FileZilla (2 min)

Envie **só os arquivos que mudaram**:

- `index.html`
- `js/configuracao.js`
- `js/detector.js`

Depois, abra `https://industrialab.online/<pasta-do-jogo>/` e aperte **Ctrl + F5**.

> **Por que precisa de `https://`?** O navegador só libera a câmera em sites seguros (HTTPS) ou no próprio computador (`localhost` / Live Server).

---

## 9 · Fechamento (para dizer à turma)

1. **Trocamos um arquivo.** `jogo.js`, `interface.js`, `coreografia.js` e as músicas continuaram iguais.
2. **A regra do jogo é uma proposição:** `(pose lida == pose pedida) ∧ (probabilidade ≥ limiar)`.
3. **A dança virou uma sequência discreta** de poses no tempo. É assim que um computador "entende" movimento.
