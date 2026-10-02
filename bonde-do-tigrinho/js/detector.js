// Responsabilidade: dizer QUAL POSE o jogador está fazendo agora.
//
// ┌──────────────────────────────────────────────────────────────────┐
// │ VERSÃO 1 · TECLADO (provisória)                                   │
// │ Segure as teclas 1 a 5 para "fazer" uma pose.                     │
// │                                                                   │
// │ Na aula AO VIVO, trocamos o conteúdo deste arquivo pela câmera +  │
// │ Teachable Machine (o professor tem o tutorial).                   │
// │                                                                   │
// │ O resto do jogo não muda NADA: ele só conhece estas 3 funções:    │
// │   Detector.iniciar(area)  · Detector.ler()  · Detector.parar()    │
// └──────────────────────────────────────────────────────────────────┘

const Detector = {
  tipo: "teclado",
  teclaApertada: null,
  area: null,

  async iniciar(area) {
    this.area = area;
    this.aoApertar = (e) => { if (/^[1-9]$/.test(e.key)) this.teclaApertada = Number(e.key); };
    this.aoSoltar = (e) => { if (Number(e.key) === this.teclaApertada) this.teclaApertada = null; };
    window.addEventListener("keydown", this.aoApertar);
    window.addEventListener("keyup", this.aoSoltar);

    const legenda = CONFIGURACAO.poses
      .map((pose, i) => `<li><kbd>${i + 1}</kbd> ${CONFIGURACAO.rotulos[pose] || pose}</li>`).join("");
    area.innerHTML = `<div class="camera-falsa"><div class="espelho"></div><ul class="teclas">${legenda}</ul>
      <p class="mini">Modo teclado · ao vivo vira câmera</p></div>`;
  },

  // Devolve SEMPRE no mesmo formato: { nome, probabilidade }
  async ler() {
    const pose = CONFIGURACAO.poses[this.teclaApertada - 1];
    const leitura = pose ? { nome: pose, probabilidade: 0.95 } : { nome: "nada", probabilidade: 0.9 };
    const espelho = this.area && this.area.querySelector(".espelho");
    if (espelho && espelho.dataset.pose !== leitura.nome) {
      espelho.dataset.pose = leitura.nome;
      espelho.innerHTML = pose ? desenharPictograma(pose, "#ffd34e") : "";
    }
    return leitura;
  },

  parar() {
    window.removeEventListener("keydown", this.aoApertar);
    window.removeEventListener("keyup", this.aoSoltar);
    this.teclaApertada = null;
  }
};
