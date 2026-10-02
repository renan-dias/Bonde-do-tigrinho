// Responsabilidade: desenhar o bonequinho (pictograma) de cada pose.
// Só desenho. Nenhuma regra do jogo mora aqui.
//
// Cada pose é uma lista de pontos (x, y) numa caixa de 100 × 140.
// O desenho é ESPELHADO, como um espelho: a "mão direita" aparece do lado direito da tela.

const ESQUELETOS = {
  bracos_cima:   { cabeca: [50, 20], pescoco: [50, 36], quadril: [50, 80],
                   cotoveloE: [34, 22], maoE: [30, 4],  cotoveloD: [66, 22], maoD: [70, 4],
                   joelhoE: [42, 106], peE: [40, 134],  joelhoD: [58, 106], peD: [60, 134] },
  t_pose:        { cabeca: [50, 20], pescoco: [50, 36], quadril: [50, 80],
                   cotoveloE: [28, 42], maoE: [6, 42],  cotoveloD: [72, 42], maoD: [94, 42],
                   joelhoE: [42, 106], peE: [40, 134],  joelhoD: [58, 106], peD: [60, 134] },
  direita_cima:  { cabeca: [50, 20], pescoco: [50, 36], quadril: [50, 80],
                   cotoveloE: [38, 58], maoE: [34, 78], cotoveloD: [66, 24], maoD: [70, 4],
                   joelhoE: [42, 106], peE: [40, 134],  joelhoD: [58, 106], peD: [60, 134] },
  esquerda_cima: { cabeca: [50, 20], pescoco: [50, 36], quadril: [50, 80],
                   cotoveloE: [34, 24], maoE: [30, 4],  cotoveloD: [62, 58], maoD: [66, 78],
                   joelhoE: [42, 106], peE: [40, 134],  joelhoD: [58, 106], peD: [60, 134] },
  agachado:      { cabeca: [50, 40], pescoco: [50, 55], quadril: [50, 94],
                   cotoveloE: [32, 70], maoE: [26, 54], cotoveloD: [68, 70], maoD: [74, 54],
                   joelhoE: [30, 108], peE: [34, 134],  joelhoD: [70, 108], peD: [66, 134] }
};

function desenharPictograma(nomeDaPose, cor) {
  const e = ESQUELETOS[nomeDaPose];
  const tinta = cor || "#ffffff";

  // Pose sem desenho: mostra o nome dentro de um balão (classe nova criada pelo grupo).
  if (!e) {
    return `<svg viewBox="0 0 100 140" class="picto" aria-label="${nomeDaPose}">
      <circle cx="50" cy="60" r="40" fill="none" stroke="${tinta}" stroke-width="6" stroke-dasharray="10 8"/>
      <text x="50" y="70" text-anchor="middle" font-size="34" font-family="Fredoka" fill="${tinta}">?</text></svg>`;
  }

  const ombro = [e.pescoco[0], e.pescoco[1] + 4];
  const osso = (a, b) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
  const caminho = [
    osso(e.pescoco, e.quadril),
    osso(ombro, e.cotoveloE), osso(e.cotoveloE, e.maoE),
    osso(ombro, e.cotoveloD), osso(e.cotoveloD, e.maoD),
    osso(e.quadril, e.joelhoE), osso(e.joelhoE, e.peE),
    osso(e.quadril, e.joelhoD), osso(e.joelhoD, e.peD)
  ].join(" ");

  return `<svg viewBox="0 0 100 140" class="picto" aria-label="${nomeDaPose}">
    <path d="${caminho}" fill="none" stroke="${tinta}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${e.cabeca[0]}" cy="${e.cabeca[1]}" r="12" fill="${tinta}"/>
  </svg>`;
}
