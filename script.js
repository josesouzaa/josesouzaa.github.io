//function utilitária de debounce
function debounce(callback, delay) {
  let timer
  return (...args) => {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      callback(...args)
      timer = null
    }, delay)
  }
}

// Ativar botão hamburguer e mostrar menu mobile
class MenuMobile {
  constructor(btn, itens, links) {
    this.btnMobile = document.querySelector(btn)
    this.itensMenu = document.querySelector(itens)
    this.linksMenu = document.querySelectorAll(links)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.fecharAoClick = this.fecharAoClick.bind(this)
    this.clickOutside = debounce(this.clickOutside.bind(this), 200)
    this.classAtivo = "ativo"
  }
  changeIcon() {
    if (this.itensMenu.classList.contains(this.classAtivo)) {
      this.btnMobile.childNodes[0].innerText = 'close'
      this.btnMobile.classList.add('close-btn')
    } else {
      this.btnMobile.childNodes[0].innerText = 'menu'
      this.btnMobile.classList.remove('close-btn')
    }
  }
  clickOutside(event) {
    if (event.target.dataset.menu === undefined) {
      this.itensMenu.classList.remove(this.classAtivo)
      this.btnMobile.classList.remove(this.classAtivo)
      this.changeIcon()
    }
  }
  fecharAoClick() {
    if (this.itensMenu.classList.contains(this.classAtivo)) {
      this.itensMenu.classList.remove(this.classAtivo)
      this.btnMobile.classList.remove(this.classAtivo)
      this.changeIcon()
    }
  }
  toggleMenu() {
    this.itensMenu.classList.toggle(this.classAtivo)
    this.btnMobile.classList.toggle(this.classAtivo)
    this.changeIcon()
  }
  addEvent() {
    this.btnMobile.addEventListener("click", this.toggleMenu)
    this.linksMenu.forEach(l => l.addEventListener("click", this.fecharAoClick))
    window.addEventListener("click", this.clickOutside)
  }
  init() {
    this.addEvent()
    return this
  }
}

const menuMobile = new MenuMobile(".btn-mobile", ".menu-itens", ".menu-itens li a")
menuMobile.init()

//Adicionar classe ativo aos itens do menu quando clicados
class MenuAtivo {
  constructor(itens) {
    this.menuItens = document.querySelectorAll(itens)
    this.addClass = this.addClass.bind(this)
    this.classAtivo = "ativo"
  }
  removeClass() {
    this.menuItens.forEach(i => i.classList.remove(this.classAtivo))
  }
  addClass(event) {
    this.removeClass()
    event.target.classList.add(this.classAtivo)
  }
  addEvent() {
    this.menuItens.forEach(i => i.addEventListener("click", this.addClass))
  }
  init() {
    this.addEvent()
    return this
  }
}

const menuAtivo = new MenuAtivo('.menu-itens li a')
menuAtivo.init()


// Sobra e transparencia no header ao scroll
class HeaderScroll {
  constructor(header) {
    this.header = document.querySelector(header)
    this.hHeader = this.header.offsetHeight
    this.addClass = debounce(this.addClass.bind(this), 50)
  }
  addClass() {
    if (window.scrollY >= this.hHeader) this.header.classList.add('scroll')
    else this.header.classList.remove('scroll')
  }
  addEvent() {
    window.addEventListener("scroll", this.addClass)
  }
  init() {
    this.addEvent()
    return this
  }
}

const headerScroll = new HeaderScroll('#menu')
headerScroll.init()

//Colocar a classe ativo no menu ao dar scroll
class AtivarAoScroll {
  constructor(sections) {
    this.sections = document.querySelectorAll(sections)
    this.getCheckpoint = debounce(this.getCheckpoint.bind(this), 50)
  }
  checkCheckpoint(checkpointStart, checkpointEnd, sectionId) {
    if (checkpointStart && checkpointEnd) {
      document.querySelector(`.menu-itens li a[href='#${sectionId}']`).classList.add('ativo')
    } else {
      document.querySelector(`.menu-itens li a[href='#${sectionId}']`).classList.remove('ativo')
    }
  }
  getSectionInfo(checkpoint) {
    this.sections.forEach(s => {
      const sectionTop = s.offsetTop
      const sectionHeight = s.offsetHeight
      const sectionId = s.dataset.section
      const checkpointStart = checkpoint >= sectionTop
      const checkpointEnd = checkpoint <= sectionTop + sectionHeight
      this.checkCheckpoint(checkpointStart, checkpointEnd, sectionId)
    })
  }
  getCheckpoint() {
    const checkpoint = window.pageYOffset + (window.innerHeight / 8) * 4
    this.getSectionInfo(checkpoint)
  }
  addEvent() {
    window.addEventListener('scroll', this.getCheckpoint)
  }
  init() {
    this.addEvent()
    return this
  }
}

const ativarAoScroll = new AtivarAoScroll('[data-section]')
ativarAoScroll.init();


(() => {
  //Puxar dados da API
  const itensPortfolio = []

  async function puxarItensDaAPI(url) {
    const itensResponse = await fetch(url)
    const itensJSON = await itensResponse.json()
    itensJSON.forEach(i => itensPortfolio.push(i))
    loopPeloPortfolio()
    addEventItemPortfolio()
  }

  puxarItensDaAPI('apiportfolio.json')

  //Injetar no HTML todos os itens da API do portfolio
  const injetarItensNoHTML = (item) => {
    const figure = document.createElement('figure')
    figure.classList.add('card-port')
    figure.innerHTML = `<img src="${item.preview}">
                      <div class="img-chamada" data-index="${item.index}">
                          <h2>${item.titulo}</h2>
                          <p>Clique para expandir</p>
                      </div>`
    document.querySelector('.container-port').appendChild(figure)
  }

  const loopPeloPortfolio = () => {
    itensPortfolio.forEach(i => injetarItensNoHTML(i))
  }

  //Abrir modal ao clicar em um item do portfolio
  const fecharModal = () => {
    const modal = document.querySelector('#modal')
    modal.classList.remove('show')
  }

  const criarModalContent = (event) => {
    const index = event.target.dataset.index
    const modalContent = document.querySelector('.modal-content')
    modalContent.innerHTML = `<img src="${itensPortfolio[index].previewgif}">
    <h1>${itensPortfolio[index].titulo}</h1>
    <ul>
      <li><span>Descrição:</span>${itensPortfolio[index].descricao}</li>
      <li><span>Tecnologias:</span>${itensPortfolio[index].tecnologias}</li>
      <li><span>Repositório:</span><a href="${itensPortfolio[index].repositorio}">Clique para ver o repositório.</a></li>
      <li><span>Deploy:</span><a href="${itensPortfolio[index].deployments}" target="_blank">Clique para visualizar a página.</a></li>
    </ul>
    <i class="material-icons">close</i>`;
    const modalBtnClose = document.querySelector('.modal-content i')
    modalBtnClose.addEventListener('click', fecharModal)
  }

  const abrirModal = (event) => {
    const modal = document.querySelector('#modal')
    modal.classList.add('show')
    criarModalContent(event)
  }

  const addEventItemPortfolio = () => {
    const divsDescricao = document.querySelectorAll('.container-port figure div')
    divsDescricao.forEach(div => {
      div.addEventListener('click', abrirModal)
    })
  }

})();
