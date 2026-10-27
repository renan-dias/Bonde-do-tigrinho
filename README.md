# Bonde do Tigrinho: Just Dance com Teachable Machine & Matemática Discreta

Este repositório contém a documentação e a estrutura de apoio para a atividade prática de Inteligência Artificial aplicada em sala de aula, desenvolvida para as turmas de **Matemática Discreta**. O objetivo é integrar conceitos teóricos fundamentais da computação — como grafos, complexidade de algoritmos e aprendizado de máquina — a uma aplicação interativa inspirada no jogo Just Dance, utilizando o [Google Teachable Machine](https://teachablemachine.withgoogle.com/).

---

## 🧭 Como a Teoria se Conecta com a Prática

A proposta pedagógica utiliza o reconhecimento de gestos em tempo real para materializar conceitos abstratos abordados nas aulas:

* **Grafos:** A pose corporal capturada pela webcam pode ser modelada como um grafo não direcionado, onde os nós (vértices) representam as articulações principais do corpo (ombros, cotovelos, punhos, joelhos) e as arestas representam as distâncias relativas e conexões esqueléticas entre elas. O modelo de aprendizado de máquina processa essas relações espaciais para classificar qual movimento de dança está sendo executado.
* **Notação Big O ($O$):** Durante a inferência do modelo de machine learning e o processamento dos quadros de vídeo (frames), analisamos a eficiência computacional. Discutimos a complexidade temporal e espacial das operações de classificação e varredura de dados utilizando a notação Big O, avaliando como a quantidade de pontos articulares afeta o desempenho do algoritmo.
* **Teachable Machine:** Atua como a ferramenta de prototipagem rápida, permitindo que os alunos treinem modelos de classificação baseados em imagens corporais sem a necessidade de escrever redes neurais complexas do zero, focando na lógica algorítmica e na estruturação dos dados de entrada.

---

## 👩‍🎓 Instruções para Alunos (Passo a Passo)

Se você é estudante e deseja clonar, configurar e executar a sua própria versão do projeto em seu ambiente de desenvolvimento, siga as etapas abaixo:

### 1. Pré-requisitos

* Ter o [Node.js](https://nodejs.org/) instalado na máquina.
* Possuir um editor de código (como o [VS Code](https://code.visualstudio.com/)).
* Um navegador web moderno com acesso à webcam.

### 2. Clonando o Repositório

Abra o terminal ou prompt de comando e execute o comando abaixo para clonar o projeto:

```bash
git clone https://github.com/renan-dias/Bonde-do-tigrinho.git

```

### 3. Executando o Projeto

1. Navegue até a pasta do projeto clonado:
```bash
cd Bonde-do-tigrinho

```


2. Instale as dependências necessárias (caso aplicável ao seu ambiente):
```bash
npm install

```


3. Inicie o servidor de desenvolvimento ou abra o arquivo principal (`index.html`) utilizando uma extensão de servidor local, como o *Live Server* no VS Code.

---

## 🔍 Nota do Professor

> Se você não é meu aluno e chegou até aqui se perguntando como vamos juntar tudo isso na prática: eu também estou pensando nisso conforme o semestre avança. Assim que o fluxo completo estiver redondinho, atualizo todas as orientações e códigos de suporte por aqui!
