// Responsabilidade: mexer na tela. Este arquivo nunca decide pontos nem lê a câmera.
// Regra de segurança: texto que veio de arquivo de aluno entra com textContent, nunca com innerHTML.

const PIXELS_POR_SEGUNDO = 170;
const POSICAO_DO_ALVO = 25;   // mesma posição do quadro "AGORA" no estilo.css

const Interface = {
  cartoesDaEsteira: [],

  el(id) { return document.getElementById(id); },

  mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.toggle("ativa", t.id === id));
  },

  aplicarNome() {
    this.el("tituloDoApp").textContent = CONFIGURACAO.nome;
    document.title = CONFIGURACAO.nome + " · O Jogo";
  },

  avisoDoDetector(texto) { this.el("avisoDetector").textContent = texto; },

  // ---------- MENU ----------
  desenharMenu(resultados, origem, aoEscolher) {
    const lista = this.el("listaDeMusicas");
    lista.innerHTML = "";

    if (resultados.length === 0) {
      const vazio = document.createElement("p");
      vazio.className = "carregando";
      vazio.textContent = origem === "nenhuma"
        ? "Não achei a pasta musicas/. Ela foi enviada pelo FileZilla?"
        : "Nenhum arquivo .tigrinho na pasta musicas/ ainda. Seja o primeiro!";
      lista.appendChild(vazio);
      return;
    }

    resultados.forEach(r => {
      const cartao = document.createElement("article");
      cartao.className = "cartao-musica" + (r.ok ? "" : " com-erro");

      if (r.ok) {
        const m = r.musica;
        cartao.style.setProperty("--cor", m.cor);
        cartao.innerHTML = `<div class="capa"></div><div class="info"><h3></h3><p class="artista"></p>
          <div class="etiquetas"><span class="dif"></span><span class="bpm"></span></div>
          <p class="autor"></p><button class="botao">Dançar ▶</button></div>`;
        cartao.querySelector(".capa").style.backgroundImage = `url("https://img.youtube.com/vi/${m.idDoVideo}/hqdefault.jpg")`;
        cartao.querySelector("h3").textContent = m.titulo;
        cartao.querySelector(".artista").textContent = m.artista;
        cartao.querySelector(".dif").textContent = { facil: "Fácil", medio: "Médio", dificil: "Difícil" }[m.dificuldade];
        cartao.querySelector(".dif").dataset.nivel = m.dificuldade;
        cartao.querySelector(".bpm").textContent = Math.round(m.bpm) + " bpm";
        cartao.querySelector(".autor").textContent = (m.enviadoPor ? "Enviado por " + m.enviadoPor + " · " : "") + r.arquivo;
        cartao.querySelector("button").addEventListener("click", () => aoEscolher(m));
      } else {
        cartao.innerHTML = `<div class="info"><h3>Arquivo com problema</h3><p class="autor"></p><ul class="problemas"></ul></div>`;
        cartao.querySelector(".autor").textContent = r.arquivo;
        const ul = cartao.querySelector(".problemas");
        r.problemas.forEach(texto => { const li = document.createElement("li"); li.textContent = texto; ul.appendChild(li); });
      }
      lista.appendChild(cartao);
    });

    const rodape = document.createElement("p");
    rodape.className = "dica rodape";
    rodape.textContent = `${resultados.length} arquivo(s) encontrados via ${origem}.`;
    lista.after(rodape);
    this.rodape && this.rodape.remove();
    this.rodape = rodape;
  },

  // ---------- JOGO ----------
  prepararEsteira(passos) {
    const trilha = this.el("trilha");
    trilha.innerHTML = "";
    this.cartoesDaEsteira = passos.map(passo => {
      const c = document.createElement("div");
      c.className = "cartao-pose";
      c.innerHTML = desenharPictograma(passo.pose) + `<span>${CONFIGURACAO.rotulos[passo.pose] || passo.pose}</span>`;
      trilha.appendChild(c);
      return c;
    });
  },

  // Cada cartão anda da direita para a esquerda. Posição = (tempo do passo − tempo agora) × velocidade.
  atualizarEsteira(passos, agora) {
    passos.forEach((passo, i) => {
      const c = this.cartoesDaEsteira[i];
      const fimDoPasso = passo.tempo + passo.duracao;
      let x, visivel = true;
      if (agora < passo.tempo) x = POSICAO_DO_ALVO + (passo.tempo - agora) * PIXELS_POR_SEGUNDO;
      else if (agora < fimDoPasso) x = POSICAO_DO_ALVO;
      else { x = POSICAO_DO_ALVO - (agora - fimDoPasso) * PIXELS_POR_SEGUNDO * 3; visivel = agora - fimDoPasso < 0.4; }
      if (x > 2400) visivel = false;
      c.style.transform = `translateX(${x}px)`;
      c.style.opacity = visivel ? (agora >= passo.tempo && agora < fimDoPasso ? 1 : 0.85) : 0;
      c.classList.toggle("ativo", agora >= passo.tempo && agora < fimDoPasso);
    });
  },

  atualizarMedidor(fracao) {
    this.el("medidor").firstElementChild.style.width = Math.round(Math.min(1, fracao) * 100) + "%";
  },

  mostrarNota(nota) {
    const n = this.el("nota");
    n.textContent = nota.nome;
    n.style.color = nota.cor;
    n.classList.remove("pula"); void n.offsetWidth; n.classList.add("pula");
  },

  atualizarPlacar(pontos, combo) {
    this.el("pontos").textContent = pontos.toLocaleString("pt-BR");
    this.el("combo").textContent = combo;
  },

  mostrarLeitura(leitura) {
    const texto = CONFIGURACAO.rotulos[leitura.nome] || leitura.nome;
    this.el("poseLida").textContent = `${texto} · ${Math.round(leitura.probabilidade * 100)}%`;
  },

  mensagem(texto) { const m = this.el("mensagem"); m.textContent = texto; m.hidden = false; },
  esconderMensagem() { this.el("mensagem").hidden = true; },

  // ---------- RESULTADO ----------
  mostrarResultado(r) {
    this.el("resultadoTitulo").textContent = r.estrelas >= 4 ? "Que bonde!" : r.estrelas >= 2 ? "Mandou bem!" : "Bora treinar mais!";
    this.el("resultadoMusica").textContent = `${r.musica.titulo} · ${r.musica.artista}`;
    this.el("resultadoPontos").textContent = r.pontos.toLocaleString("pt-BR");
    this.el("estrelas").textContent = "★".repeat(r.estrelas) + "☆".repeat(5 - r.estrelas);
    const ul = this.el("resultadoNotas");
    ul.innerHTML = "";
    CONFIGURACAO.notas.forEach(nota => {
      const li = document.createElement("li");
      li.innerHTML = `<b></b><span></span>`;
      li.querySelector("b").textContent = r.contagem[nota.nome] || 0;
      li.querySelector("b").style.color = nota.cor;
      li.querySelector("span").textContent = nota.nome;
      ul.appendChild(li);
    });
    const li = document.createElement("li");
    li.innerHTML = `<b></b><span>MAIOR COMBO</span>`;
    li.querySelector("b").textContent = r.maiorCombo;
    ul.appendChild(li);
    this.mostrarTela("telaResultado");
  }
};
