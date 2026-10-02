// Responsabilidade: as REGRAS do jogo. Compara a pose pedida com a pose lida e dá os pontos.
// O jogo é uma máquina de estados:  parado → dancando → fim
// Ele não sabe se a pose veio do teclado ou da câmera: só chama Detector.ler().

const Jogo = {
  estado: "parado",

  comecar(musica, passos, aoAcabar) {
    this.musica = musica;
    this.passos = passos;
    this.aoAcabar = aoAcabar;
    this.indice = 0;
    this.pontos = 0;
    this.combo = 0;
    this.maiorCombo = 0;
    this.contagem = {};
    this.quadros = 0;
    this.acertos = 0;
    this.leitura = { nome: "nada", probabilidade: 0 };
    this.estado = "dancando";

    Interface.prepararEsteira(passos);
    Interface.atualizarPlacar(0, 0);
    this.lerSemParar();
    this.quadro();
  },

  // Laço 1: pergunta ao detector, o mais rápido que ele conseguir responder.
  async lerSemParar() {
    while (this.estado === "dancando") {
      try {
        this.leitura = await Detector.ler();
        Interface.mostrarLeitura(this.leitura);
      } catch (erro) {
        console.error("Detector falhou:", erro);
      }
      await new Promise(r => requestAnimationFrame(r));
    }
  },

  // Laço 2: a cada quadro da tela, confere o tempo do vídeo e julga a pose.
  quadro() {
    if (this.estado !== "dancando") return;
    const agora = YouTube.tempo();
    Interface.atualizarEsteira(this.passos, agora);

    const passo = this.passos[this.indice];
    if (passo) {
      const inicioDoJulgamento = passo.tempo + passo.duracao * 0.25; // 25% do tempo para chegar na pose
      const fimDoPasso = passo.tempo + passo.duracao;

      if (agora >= inicioDoJulgamento && agora < fimDoPasso && YouTube.tocando()) {
        this.quadros++;
        if (this.acertou(passo)) this.acertos++;
        Interface.atualizarMedidor(this.acertos / Math.max(1, this.quadros));
      }
      if (agora >= fimDoPasso) {
        this.avaliar();
        this.indice++;
      }
    }

    if (agora >= this.musica.fim || (!passo && this.indice >= this.passos.length && agora > this.musica.inicio + 1)) {
      this.terminar();
      return;
    }
    requestAnimationFrame(() => this.quadro());
  },

  // A proposição central do jogo:  (pose lida == pose pedida) ∧ (probabilidade ≥ limiar)
  acertou(passo) {
    return this.leitura.nome === passo.pose && this.leitura.probabilidade >= CONFIGURACAO.confiancaMinima;
  },

  avaliar() {
    const fracao = this.quadros ? this.acertos / this.quadros : 0;
    const nota = CONFIGURACAO.notas.find(n => fracao >= n.minimo);

    if (nota.pontos > 0 && nota.nome !== "QUASE") this.combo++;
    else this.combo = 0;
    this.maiorCombo = Math.max(this.maiorCombo, this.combo);

    const bonus = 1 + Math.min(this.combo, 10) * 0.1;               // até +100% com combo 10
    this.pontos += Math.round(nota.pontos * bonus);
    this.contagem[nota.nome] = (this.contagem[nota.nome] || 0) + 1;

    Interface.mostrarNota(nota);
    Interface.atualizarPlacar(this.pontos, this.combo);
    Interface.atualizarMedidor(0);
    this.quadros = 0;
    this.acertos = 0;
  },

  terminar() {
    if (this.estado !== "dancando") return;
    this.estado = "fim";
    YouTube.pausar();
    Detector.parar();
    const maximo = this.passos.length * CONFIGURACAO.notas[0].pontos * 1.5;
    const estrelas = Math.max(0, Math.min(5, Math.round((this.pontos / Math.max(1, maximo)) * 5)));
    this.aoAcabar({
      musica: this.musica, pontos: this.pontos, estrelas,
      contagem: this.contagem, maiorCombo: this.maiorCombo
    });
  },

  parar() {
    this.estado = "parado";
  }
};
