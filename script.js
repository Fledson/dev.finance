// 
const Modal = {
  // ler o modal-overlay e adiciona o 'active' se não tiver ouuuu remover se tiver
  show(){
      document.querySelector('.modal-overlay').classList.toggle('active')
  }
}

const Storage = {
  get(){
    return JSON.parse(localStorage.getItem('transactions')) || []
  },
  set(transactions){
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }
}

// Funções de calculo
const Transection = {
  // importando pra dentro da função a constante
  all: Storage.get()
  ,
  // adicionando transação para dentro do array de transections
  addTransection(transection){
    // push adiciona a transection inserida ao final do array
    Transection.all.push(transection)
    // recarrega a tabela de transections
    App.reload()
  },
  removeTransection(index){
    // aqui ele pega uma transection pelo index e remove ela da lista
     Transection.all.splice(index, 1)
     // recarrea a tabela de transections
     App.reload()
  },
  incomes(){
    let income = 0

    /**
     * pegando todas as transações e verificando se o valor em cada é positivo
     * se for ele pega o valor e soma a variavel income
     */

    // percorrendo todas as transaçãos 
    Transection.all.forEach((transection) => {
      // verificando se cada amount passado é positivo
        if(transection.amount > 0){
          // se for positivo ele pega o valor do amount e soma a variavel
          income += transection.amount
        }
    })
    // dividindo
    // retornando o valor 
    return income
  },
  expenses(){
    let expense = 0
    
    Transection.all.forEach((transection) => {
        if(transection.amount < 0 ) {
            expense += transection.amount
        }
    })

    return expense
  },
  total(){
    return Transection.incomes() + Transection.expenses()
  }
}

// Adicionando HTML manipulado ao codigo
const DOM = {
  //pegando o tbody para adicionar o tr dentro
  transectionsContainer: document.querySelector('#data-table tbody'),
  // função para criar o tr e adicionar os dados
  addTransection(transaction, index) {
    // cria um elemento tr dentro da tabela
    const tr = document.createElement('tr')
    // adiciona o Elemento html ao tr criado
    tr.innerHTML = DOM.innerHTMLTransection(transaction, index)
    //passando a posição do array
    tr.dataset.index = index
    // adicionando o tr dentro do tbody usando o appendChild
    DOM.transectionsContainer.appendChild(tr)
  },
  // Alimentado informações no tr
  innerHTMLTransection(transection, index){ 

    const amount = Utils.formatCurrency(transection.amount)

    //** Cria o elemento dentro da pagina htmml */
    const html = `
      <td class="description">${transection.description}</td>
      <td class=${transection.amount > 0 ? 'income': 'expense'}>${amount}</td>
      <td class="date">${transection.date}</td>
      <td class="">
        <img onclick="Transection.removeTransection(${index})" src="./assets/minus.svg" alt="Remover Transação">'
      </td>
    `
    //retorna o html
    return html
  },
  //atualizando valores totais dos cards
  updateBalance(){
    // Mostrando o income na tela e formatando usando a função formatCurrency
    document.getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transection.incomes())
    
    // Mostrando o expense na tela e formatando usando a função formatCurrency
    document.getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transection.expenses())

    // Mostrando o total na tela e formatando usando a função formatCurrency
    document.getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transection.total())
  },
  // limpa a Tbody (limpa as transections do DOM)
  clearTransections(){
    document.querySelector('#data-table tbody').innerHTML = ''
  }
}

// Tratamento de informação
const Utils = {
  formatAmount(value) {
    //=> pegando o valor e multiplicando por 100
    value = (Number(value) * 100)
    // tratamento via expressão regular
    // value = Number(value.replace(/\,\./g,"")) * 100
    return value
  },
  formatDate(value){
    // => pegando a data (string) e transformando e array 
    // usado o split para separar por - 
    let splittedDate = value.split('-')
    // retornando a data formatada dd/mm/aa
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },
  formatCurrency(value) {
    // pegando o sinal
    const signal = Number(value) < 0 ? '-' : ''
    // pegando os dados via expressao regular e tudo que não for numero (/\D/) ele substitui por nada
    value = String(value).replace(/\D/g, "")
    // transformando em decimal
    value = Number(value) / 100
    // agora eu pego o valor e coloco configurações locais nele, primeiro defino qual a localidade que estou
    // em segundo os parametros
    value = value.toLocaleString('pt-BR', {
        // o tipo de formatação => moeda
        style: 'currency',
        // o tipo de moeda Brazilian ReaL
        currency: 'BRL'
    })

    // Retornando o valor formatado
    return signal + value
  }
}

// manipulando o envento do FORM
const Form = {
  // pegando o input description
  description: document.querySelector('input#description'),
  // pegando o input amount
  amount: document.querySelector('input#amount'),
  // pegando o input date
  date: document.querySelector('input#date'),

  // função só pra pegar os valores
  getValues() {
    return {
      // pegando o valor inserido no description
      description: Form.description.value,
      // pegando o valor inserido no amount
      amount: Form.amount.value,
      // pegando o valor inserido no value
      date: Form.date.value
    }
  },

  // validando os campos
  validadeFields(){
    // pegando os valores (usando desestruturação)
    const { description, amount, date } = Form.getValues()
    /**
     * verificando se os valores estão vazios
     * usando a função trim() para limpar os espaços
     */
    if(description.trim() === '' || amount.trim() === '' || date === ''){
      throw new Error("Há campos vazios, por favor preencha os campos")
    }
  },

  //f formatando dados
  formatValues(){
    // pegando valores dos campos
    let { description, amount, date } = Form.getValues()
    
    // formatando valores
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)
    
    //retornando objeto
    return {
      description, 
      amount, 
      date
    }
  },

  //limpando formulario
  clearValues(){
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    // removendo o evento padrão de envio de form (não recarrega a pagina)
    event.preventDefault()

    try {
      // validando dados
      Form.validadeFields()
      // formatando (recebe um objeto)
      const transaction = Form.formatValues()
      // salvando dados
      Transection.addTransection(transaction)
      // limpando campos
      Form.clearValues()
      

    } catch (error) {
      alert(error.message)
    }

  }
}

// função de chamada das outras funções na tela
const App = {
  init(){
    Transection.all.forEach( (transection, index)=> {
        DOM.addTransection(transection, index)
    })
    DOM.updateBalance()
    // colocando informações no localStorage
    Storage.set(Transection.all)
  },
  reload(){
    DOM.clearTransections()
    App.init()
    // colocando informações no localStorage
    Storage.set(Transection.all)
  }

}


App.init()