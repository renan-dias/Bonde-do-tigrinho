// Responsabilidade: transformar uma música numa SEQUÊNCIA de poses no tempo.
// Uma dança contínua vira uma lista discreta: [{ tempo, duracao, pose }, …]

const Coreografia = {

  gerar(musica) {
    // Se o arquivo .tigrinho já trouxe a coreografia feita à mão, usamos ela.
    if (musica.coreografia && musica.coreografia.length) return this.daLista(musica);

    const batida = 60 / musica.bpm;                                  // segundos por batida
    let duracao = CONFIGURACAO.batidasPorPose[musica.dificuldade] * batida;
    while (duracao < CONFIGURACAO.duracaoMinimaDaPose) duracao *= 2; // rápido demais? dobra.

    const sortear = this.geradorComSemente(this.hash(musica.titulo + musica.idDoVideo));
    const poses = CONFIGURACAO.poses;

    // Um "refrão" de 4 poses, sem repetir a mesma pose em seguida.
    const refrao = [];
    while (refrao.length < 4) {
      const p = poses[Math.floor(sortear() * poses.length)];
      if (p !== refrao[refrao.length - 1]) refrao.push(p);
    }

    const passos = [];
    let tempo = musica.inicio + 4 * batida;                          // 4 batidas para se preparar
    let i = 0;
    while (tempo + duracao <= musica.fim) {
      let pose = refrao[i % 4];                                      // o refrão se repete…
      if (Math.floor(i / 4) % 3 === 2 && i % 4 === 2) {              // …mas a cada 3 rodadas, 1 pose muda
        const outras = poses.filter(x => x !== pose && x !== passos[passos.length - 1]?.pose);
        pose = outras[Math.floor(sortear() * outras.length)];
      }
      passos.push({ tempo, duracao, pose });
      tempo += duracao;
      i++;
    }
    return passos;
  },

  // Coreografia escrita à mão no .tigrinho: [{ "tempo": 12.5, "pose": "t_pose" }, …]
  daLista(musica) {
    const lista = [...musica.coreografia].sort((a, b) => a.tempo - b.tempo);
    return lista.map((passo, k) => {
      const proximo = lista[k + 1] ? lista[k + 1].tempo : Math.min(musica.fim, passo.tempo + 4);
      return { tempo: passo.tempo, duracao: Math.max(0.8, proximo - passo.tempo), pose: passo.pose };
    });
  },

  // Mesma música = mesma coreografia, sempre. (Aleatório "de mentirinha", com semente.)
  hash(texto) {
    let h = 2166136261;
    for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return h >>> 0;
  },

  geradorComSemente(semente) {
    let s = semente || 1;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;              // gerador congruente linear
      return s / 4294967296;
    };
  }
};
