// GABARITO da parte ao vivo. NÃO é carregado pelo jogo.
// Se a aula travar, copie este conteúdo por cima de js/detector.js.
//
// Responsabilidade: dizer QUAL POSE o jogador está fazendo agora, usando a câmera + Teachable Machine.
// Mesmas 3 funções da versão teclado: iniciar(area) · ler() · parar()

const Detector = {
  tipo: "camera",
  modelo: null,
  webcam: null,
  ctx: null,

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

  // Devolve SEMPRE no mesmo formato: { nome, probabilidade }
  async ler() {
    this.webcam.update();
    const { pose, posenetOutput } = await this.modelo.estimatePose(this.webcam.canvas);
    const previsoes = await this.modelo.predict(posenetOutput);
    this.desenhar(pose);

    const melhor = previsoes.reduce((a, b) => (b.probability > a.probability ? b : a));
    return { nome: melhor.className, probabilidade: melhor.probability };
  },

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
};
