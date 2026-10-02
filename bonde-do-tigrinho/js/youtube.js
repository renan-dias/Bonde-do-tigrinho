// Responsabilidade: falar com o player do YouTube (tocar, pausar, dizer o tempo).
// Usa a IFrame Player API oficial: o vídeo é incorporado, nada é baixado.

const YouTube = {
  player: null,
  apiPronta: null,

  carregarAPI() {
    if (this.apiPronta) return this.apiPronta;
    this.apiPronta = new Promise((resolver, rejeitar) => {
      if (window.YT && window.YT.Player) return resolver();
      window.onYouTubeIframeAPIReady = () => resolver();
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = () => rejeitar(new Error("Não consegui carregar o YouTube. Confira a internet."));
      document.head.appendChild(tag);
    });
    return this.apiPronta;
  },

  // Cria o player e espera ele ficar pronto. "aoTerminar" e "aoErrar" são avisos para o jogo.
  async criar(encaixe, musica, { aoTerminar, aoErrar } = {}) {
    await this.carregarAPI();
    this.destruir();
    encaixe.innerHTML = '<div id="playerYoutube"></div>';   // um lugar novo para o player a cada música
    return new Promise((resolver) => {
      this.player = new YT.Player("playerYoutube", {
        videoId: musica.idDoVideo,
        playerVars: {
          start: Math.floor(musica.inicio),
          controls: 0, rel: 0, disablekb: 1, playsinline: 1, modestbranding: 1, iv_load_policy: 3
        },
        events: {
          onReady: () => resolver(),
          onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED && aoTerminar) aoTerminar(); },
          onError: (e) => { if (aoErrar) aoErrar(this.explicarErro(e.data)); resolver(); }
        }
      });
    });
  },

  tocar()   { this.player && this.player.playVideo && this.player.playVideo(); },
  pausar()  { this.player && this.player.pauseVideo && this.player.pauseVideo(); },
  tempo()   { return this.player && this.player.getCurrentTime ? this.player.getCurrentTime() : 0; },
  tocando() { return !!(this.player && this.player.getPlayerState && this.player.getPlayerState() === YT.PlayerState.PLAYING); },

  destruir() {
    if (this.player && this.player.destroy) this.player.destroy();
    this.player = null;
  },

  explicarErro(codigo) {
    const erros = {
      2: "O link do vídeo está errado (ID inválido).",
      5: "O navegador não conseguiu tocar esse vídeo.",
      100: "Esse vídeo não existe ou é privado.",
      101: "O dono desse vídeo não deixa ele tocar fora do YouTube. Escolha outro clipe.",
      150: "O dono desse vídeo não deixa ele tocar fora do YouTube. Escolha outro clipe."
    };
    return erros[codigo] || `O YouTube deu o erro ${codigo}.`;
  }
};
