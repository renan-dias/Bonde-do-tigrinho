// Responsabilidade: ajudar a escrever um arquivo .tigrinho sem erro de digitação.
// Reaproveita a MESMA validação do jogo (Musicas.validar). Uma regra, um lugar só.

const $ = (id) => document.getElementById(id);
const campos = ["campoTitulo", "campoArtista", "campoYoutube", "campoDificuldade", "campoBpm", "campoInicio", "campoFim", "campoCor", "campoAutor"];

function montarObjeto() {
  return {
    formato: CONFIGURACAO.formato,
    titulo: $("campoTitulo").value.trim(),
    artista: $("campoArtista").value.trim(),
    youtube: $("campoYoutube").value.trim(),
    bpm: Number($("campoBpm").value),
    dificuldade: $("campoDificuldade").value,
    inicio: Number($("campoInicio").value),
    fim: Number($("campoFim").value),
    cor: $("campoCor").value,
    enviadoPor: $("campoAutor").value.trim(),
    coreografia: null
  };
}

// "Heroes Tonight!" → "heroes-tonight.tigrinho"
function nomeDoArquivo(dados) {
  const base = ((dados.enviadoPor ? dados.enviadoPor + "-" : "") + (dados.titulo || "minha-musica"))
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (base || "minha-musica") + CONFIGURACAO.extensao;
}

function conferir(texto) {
  const r = Musicas.lerTexto(texto);
  const s = $("status");
  s.className = "status " + (r.ok ? "ok" : "erro");
  s.innerHTML = "";
  if (r.ok) {
    s.textContent = "Tudo certo! Esse arquivo vai aparecer no jogo.";
    $("campoArquivo").value = nomeDoArquivo(r.musica);
  } else {
    s.textContent = "Ainda não está pronto:";
    const ul = document.createElement("ul");
    r.problemas.forEach(p => { const li = document.createElement("li"); li.textContent = p; ul.appendChild(li); });
    s.appendChild(ul);
  }
  const id = Musicas.idDoYoutube(r.ok ? r.musica.youtube : $("campoYoutube").value);
  $("previewVideo").style.backgroundImage = id ? `url("https://img.youtube.com/vi/${id}/hqdefault.jpg")` : "none";
  return r.ok;
}

function atualizar() {
  const texto = JSON.stringify(montarObjeto(), null, 2);
  $("saidaJson").value = texto;
  conferir(texto);
}

campos.forEach(id => $(id).addEventListener("input", atualizar));
$("saidaJson").addEventListener("input", (e) => conferir(e.target.value));

// Marcar o BPM tocando no ritmo: média dos intervalos entre os toques.
let toques = [];
$("botaoBatida").addEventListener("click", () => {
  const agora = performance.now();
  if (toques.length && agora - toques[toques.length - 1] > 2000) toques = [];
  toques.push(agora);
  if (toques.length >= 4) {
    const intervalos = toques.slice(1).map((t, i) => t - toques[i]);
    const media = intervalos.reduce((a, b) => a + b) / intervalos.length;
    $("campoBpm").value = Math.round(60000 / media);
    atualizar();
  }
  $("botaoBatida").textContent = toques.length < 4 ? `Continue tocando… (${toques.length})` : `BPM ≈ ${$("campoBpm").value} · continue para refinar`;
});

$("botaoBaixar").addEventListener("click", () => {
  const texto = $("saidaJson").value;
  if (!conferir(texto)) return;
  const arquivo = new Blob([texto + "\n"], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = $("campoArquivo").value;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

$("botaoCopiar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("saidaJson").value); $("botaoCopiar").textContent = "Copiado!"; }
  catch { $("saidaJson").select(); $("botaoCopiar").textContent = "Selecionei: Ctrl + C"; }
});

atualizar();
