// Responsabilidade: achar os arquivos .tigrinho, ler e conferir se estão certos.
// Este arquivo nunca mexe na tela e nunca toca música.

const Musicas = {

  // 1º tenta perguntar ao servidor (listar.php, funciona na HostGator).
  // Se não der (Live Server não roda PHP), usa a lista escrita à mão: lista.json.
  async listarArquivos() {
    const pasta = CONFIGURACAO.pastaDeMusicas;
    try {
      const resposta = await fetch(pasta + "listar.php", { cache: "no-store" });
      const nomes = JSON.parse(await resposta.text());
      if (Array.isArray(nomes)) return { nomes, origem: "listar.php" };
    } catch (erro) { /* sem PHP: segue para o plano B */ }

    try {
      const resposta = await fetch(pasta + "lista.json", { cache: "no-store" });
      const nomes = await resposta.json();
      if (Array.isArray(nomes)) return { nomes, origem: "lista.json" };
    } catch (erro) { /* também não deu */ }

    return { nomes: [], origem: "nenhuma" };
  },

  // Lê UM arquivo. Nunca "explode": devolve { ok, musica, problemas }.
  async carregar(nomeDoArquivo) {
    const resultado = { arquivo: nomeDoArquivo, ok: false, musica: null, problemas: [] };
    let texto;
    try {
      const resposta = await fetch(CONFIGURACAO.pastaDeMusicas + encodeURIComponent(nomeDoArquivo), { cache: "no-store" });
      if (!resposta.ok) { resultado.problemas.push(`Não achei o arquivo (erro ${resposta.status}).`); return resultado; }
      texto = await resposta.text();
    } catch (erro) {
      resultado.problemas.push("Não consegui baixar o arquivo.");
      return resultado;
    }
    return this.lerTexto(texto, nomeDoArquivo);
  },

  // Transforma o texto do arquivo em uma música conferida.
  lerTexto(texto, nomeDoArquivo = "") {
    const resultado = { arquivo: nomeDoArquivo, ok: false, musica: null, problemas: [] };
    let dados;
    try {
      dados = JSON.parse(texto.replace(/^﻿/, ""));
    } catch (erro) {
      resultado.problemas.push("O JSON está quebrado: " + this.explicarErroDeJSON(erro, texto));
      return resultado;
    }
    resultado.problemas = this.validar(dados);
    if (resultado.problemas.length === 0) {
      resultado.ok = true;
      resultado.musica = this.normalizar(dados);
    }
    return resultado;
  },

  // Cada regra é uma proposição: se ela for FALSA, vira um problema na lista.
  validar(d) {
    const p = [];
    if (typeof d !== "object" || d === null || Array.isArray(d)) return ["O arquivo precisa ser um objeto { … }."];
    if (typeof d.titulo !== "string" || d.titulo.trim() === "") p.push('Falta o "titulo" (texto).');
    if (typeof d.artista !== "string" || d.artista.trim() === "") p.push('Falta o "artista" (texto).');
    if (!this.idDoYoutube(d.youtube)) p.push('O "youtube" não parece um link de vídeo do YouTube.');
    if (typeof d.bpm !== "number" || d.bpm < 40 || d.bpm > 220) p.push('"bpm" precisa ser um número entre 40 e 220 (sem aspas).');
    if (!(d.dificuldade in CONFIGURACAO.batidasPorPose)) p.push('"dificuldade" precisa ser "facil", "medio" ou "dificil".');
    if (d.inicio !== undefined && (typeof d.inicio !== "number" || d.inicio < 0)) p.push('"inicio" precisa ser um número de segundos (0 ou mais).');
    if (d.fim !== undefined && (typeof d.fim !== "number" || d.fim <= (d.inicio || 0) + 10)) p.push('"fim" precisa ser um número maior que "inicio" + 10 segundos.');
    if (d.cor !== undefined && !/^#[0-9a-fA-F]{6}$/.test(d.cor)) p.push('"cor" precisa ser no formato "#ff8c42".');
    if (d.coreografia !== undefined && d.coreografia !== null) {
      if (!Array.isArray(d.coreografia)) p.push('"coreografia" precisa ser uma lista [ … ] ou null.');
      else d.coreografia.forEach((passo, i) => {
        if (typeof passo !== "object" || passo === null) { p.push(`Passo ${i + 1} da coreografia precisa ser { "tempo": …, "pose": … }.`); return; }
        if (typeof passo.tempo !== "number") p.push(`Passo ${i + 1} da coreografia: "tempo" precisa ser número.`);
        if (!CONFIGURACAO.poses.includes(passo.pose)) p.push(`Passo ${i + 1} da coreografia: a pose "${passo.pose}" não existe no jogo.`);
      });
    }
    return p;
  },

  // Preenche o que é opcional com valores padrão.
  normalizar(d) {
    const inicio = d.inicio ?? 0;
    return {
      formato: d.formato || CONFIGURACAO.formato,
      titulo: d.titulo.trim(),
      artista: d.artista.trim(),
      youtube: d.youtube,
      idDoVideo: this.idDoYoutube(d.youtube),
      bpm: d.bpm,
      dificuldade: d.dificuldade,
      inicio,
      fim: d.fim ?? inicio + 90,
      cor: d.cor || "#ff8c42",
      enviadoPor: typeof d.enviadoPor === "string" ? d.enviadoPor : "",
      coreografia: Array.isArray(d.coreografia) ? d.coreografia : null
    };
  },

  // Aceita: youtube.com/watch?v=ID · youtu.be/ID · youtube.com/shorts/ID · youtube.com/embed/ID · ou só o ID.
  idDoYoutube(link) {
    if (typeof link !== "string") return null;
    const texto = link.trim();
    if (/^[\w-]{11}$/.test(texto)) return texto;
    const achado = texto.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
    return achado ? achado[1] : null;
  },

  // Traduz o erro do JSON.parse para algo que um humano entende, com a linha do erro.
  explicarErroDeJSON(erro, texto) {
    const m = String(erro.message).match(/position (\d+)/);
    let onde = "";
    if (m) {
      const linha = texto.slice(0, Number(m[1])).split("\n").length;
      onde = ` (perto da linha ${linha})`;
    }
    let dica = "confira aspas duplas, vírgulas e chaves";
    if (/'/.test(texto)) dica = "JSON só aceita aspas DUPLAS \" \"";
    else if (/,\s*[}\]]/.test(texto)) dica = "tem uma vírgula sobrando antes de } ou ]";
    else if (/\/\/|\/\*/.test(texto)) dica = "JSON não aceita comentários //";
    return dica + onde + ".";
  }
};
