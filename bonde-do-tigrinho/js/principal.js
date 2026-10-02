// Responsabilidade: COORDENAR. Lendo só este arquivo você entende o jogo inteiro:
// acha as músicas → escolhe → gera a coreografia → liga detector e vídeo → joga → mostra o resultado.

let musicaAtual = null;

async function iniciar() {
  Interface.aplicarNome();
  Interface.avisoDoDetector(Detector.tipo === "camera"
    ? "Câmera + Teachable Machine ligados. Fique de corpo inteiro na frente da câmera."
    : "Modo teclado: segure as teclas 1 a 5 para fazer as poses. Na aula ao vivo, vamos ligar a câmera.");

  const { nomes, origem } = await Musicas.listarArquivos();
  const arquivos = nomes.filter(n => n.toLowerCase().endsWith(CONFIGURACAO.extensao));
  const resultados = await Promise.all(arquivos.map(nome => Musicas.carregar(nome)));
  Interface.desenharMenu(resultados, origem, dancar);
}

async function dancar(musica) {
  musicaAtual = musica;
  const passos = Coreografia.gerar(musica);

  Interface.mostrarTela("telaJogo");
  Interface.mensagem("Preparando o palco…");
  document.getElementById("botaoTocar").hidden = true;

  try {
    await Detector.iniciar(document.getElementById("areaDaCamera"));
  } catch (erro) {
    Interface.mensagem("Não consegui ligar o detector: " + erro.message);
    return;
  }

  let erroDoVideo = null;
  try {
    await YouTube.criar(document.getElementById("encaixeDoVideo"), musica, {
      aoTerminar: () => Jogo.terminar(),
      aoErrar: (texto) => { erroDoVideo = texto; Interface.mensagem(texto + " Clique em ✕ Sair."); Jogo.parar(); }
    });
  } catch (erro) {
    Interface.mensagem(erro.message);
    return;
  }
  if (erroDoVideo) return;

  Interface.esconderMensagem();
  YouTube.tocar();
  Jogo.comecar(musica, passos, (resultado) => Interface.mostrarResultado(resultado));

  // Alguns navegadores bloqueiam som sem um clique. Se o vídeo não começou, pedimos o clique.
  setTimeout(() => {
    if (Jogo.estado === "dancando" && !YouTube.tocando()) document.getElementById("botaoTocar").hidden = false;
  }, 1800);
}

function voltarAoMenu() {
  Jogo.parar();
  Detector.parar();
  YouTube.destruir();
  Interface.esconderMensagem();
  Interface.mostrarTela("telaMenu");
}

document.getElementById("botaoTocar").addEventListener("click", (e) => { YouTube.tocar(); e.currentTarget.hidden = true; });
document.getElementById("botaoSair").addEventListener("click", voltarAoMenu);
document.getElementById("botaoMenu").addEventListener("click", voltarAoMenu);
document.getElementById("botaoDeNovo").addEventListener("click", () => musicaAtual && dancar(musicaAtual));
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && Jogo.estado === "dancando") voltarAoMenu(); });

iniciar();
