// Responsabilidade: guardar TUDO que pode mudar sem mexer na lógica do jogo.
// Número solto no meio do código tem nome: "magic number". Aqui ele ganha nome e endereço.

const CONFIGURACAO = {
  nome: "Bonde do Tigrinho",

  // PARTE AO VIVO: cole aqui o link do seu modelo de POSE do Teachable Machine.
  // Precisa terminar com "/". Ex.: "https://teachablemachine.withgoogle.com/models/aB3xY9kLm/"
  enderecoDoModelo: "",

  // Abaixo disso, a rede "não tem certeza" e a pose não conta.
  confiancaMinima: 0.75,

  // As poses do jogo. Os nomes PRECISAM ser iguais aos nomes das classes no Teachable Machine.
  // (minúsculo, sem acento, sem espaço, separado por _)
  poses: ["bracos_cima", "t_pose", "direita_cima", "esquerda_cima", "agachado"],

  // Nome bonito que aparece na tela para cada classe.
  rotulos: {
    bracos_cima: "Braços pra cima",
    t_pose: "T-pose",
    direita_cima: "Mão direita pra cima",
    esquerda_cima: "Mão esquerda pra cima",
    agachado: "Agacha!",
    nada: "Ninguém na câmera"
  },

  // Dificuldade = de quantas em quantas batidas a pose muda.
  batidasPorPose: { facil: 8, medio: 4, dificil: 2 },

  // Nenhuma pose dura menos que isso (em segundos), senão ninguém consegue acompanhar.
  duracaoMinimaDaPose: 1.3,

  // Quanto da pose você precisa segurar (0 a 1) para cada nota.
  notas: [
    { nome: "PERFEITO", minimo: 0.60, pontos: 300, cor: "#5df2b5" },
    { nome: "BOM",      minimo: 0.35, pontos: 150, cor: "#3fd6ff" },
    { nome: "QUASE",    minimo: 0.12, pontos: 50,  cor: "#ffd34e" },
    { nome: "ERROU",    minimo: 0,    pontos: 0,   cor: "#ff5d8f" }
  ],

  pastaDeMusicas: "musicas/",
  extensao: ".tigrinho",
  formato: "tigrinho/1"
};
