// Objeto Modal
 const Modal = {
    abrir(){
        // abrir modal
        // adicionar class active ao modal
        document.querySelector(".modal-overlay").classList.add("active"); // pega a lista de classes e adiciona a classe active nela
    },
    fechar(){
        // fechar o modal
        //remover class active do modal
        document.querySelector(".modal-overlay").classList.remove("active");// pega a lista de classes e remove a classe active nela
    }
}

// criei uma const para pegar as informações e guardar no localStorage do navegador,
// pra que sempre que haver alterações dos dados ficar registrado
const Storage = {
    pegar(){
        // volto a string para um array, se caso nao existir retorna um array vazio
        return JSON.parse(localStorage.getItem("dev.finances:transacoes")) || []
    },

    guardar(transacoes){
        //colocando um nome para servir de localização no meu localStorage.
        //JSON.stringfy tranforma em string, nesse caso transformei o array transacoes em string
        localStorage.setItem("dev.finances:transacoes", JSON.stringify(transacoes))
    }
}

const Transacao = {
    all: Storage.pegar(),
    // Eu preciso somar entradas
    // depois eu preciso somar as saídas e
    // remover das entradas o valor das saidas
    // assim , eu terei o total
    adicionar(transacao){
        Transacao.all.push(transacao)
        
        App.recarregar()
    },
    
    remover(index){
        Transacao.all.splice(index, 1)
        App.recarregar()
    },

    renda(){
        let renda = 0;
        // pegar todas as transações
        // para cada transação ,
        Transacao.all.forEach(transacao => {
           // se ela for maior que zero
           if(transacao.valor > 0){
               // somar a uma variavel e retornar a variavel
               renda += transacao.valor;
           }
        })
        
        return renda
    },
    despesa(){
        let despesa = 0;

        // pegar todas as transações
        // para cada transação ,
        Transacao.all.forEach(transacao => {
           // se ela for menor que zero
           if(transacao.valor < 0){
               // somar a uma variavel e retornar a variavel
               despesa += transacao.valor;
           }
        })
        
        return despesa
    },
    
    total(){
        // retornar o valor da renda menos o valor das despesas, como o valor de
        // despesa é negativo, basta aplicar a matemática, sinais diferentes subtrai e conserva o sinal do maior
        return Transacao.renda() + Transacao.despesa();
    }
}

const DOM = {
    transacoesContainer: document.querySelector("#tabela-dados tbody"),

    adicionarTransacao(transacao, index){
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransacao(transacao, index) // DOM nome do objeto recebendo a função por ponto notação
        tr.dataset.index = index

        DOM.transacoesContainer.appendChild(tr)
    },

    innerHTMLTransacao(transacao, index) {
        // ternário: se valor for maior que 0 adicione classe renda, se não add classe despesa
        // os valores negativo na tabela vao ficar em vermelho e os positivos em verde
        const CSSclass = transacao.valor > 0 ? "renda" : "despesa" 

        const valor2 = Utils.formatarMoeda(transacao.valor)

        const html = `
       <td class="descrição class">${transacao.descricao}</td>
       <td class="${CSSclass}">${valor2}</td>
       <td class="data">${transacao.data}</td>
       <td>
       <img onclick="Transacao.remover(${index})" src="./assets/minus.svg" alt="Remover Transação"> <!-- alt == leitor de tela-->
       </td>
        `
        return html
    },

    limparTransacoes(){
        DOM.transacoesContainer.innerHTML = "";
    },

    atualizarBalanco(){
        document.getElementById("displayDespesa").innerHTML = Utils.formatarMoeda(Transacao.despesa())
        document.getElementById("displayRenda").innerHTML = Utils.formatarMoeda(Transacao.renda())
        document.getElementById("displayTotal").innerHTML = Utils.formatarMoeda(Transacao.total())

    },
    
}

 // funções utilitárias
const Utils = {
     formatarValores(value){
         // o numero vem como uma string, então vou formatar para Number
         // multipliquei por 100 pq na função formatarMoeda o numero é dividido por 100
         // exemplo: se o valor digitado for 8.01 ele passa a ser 801(8.01 * 100)
         // e na função formatarMoeda volta a ser 8.01
         value = Number(value) * 100 
         return value
     },

     formatarData(data){
         // separa por traços a data em um array ficou assim ano(posição[0]), mês[1] e dia[2]
         const dataDividida = data.split("-") 
         // aqui eu organizo por dia, mês e ano
         return `${dataDividida[2]}/${dataDividida[1]}/${dataDividida[0]}`
     },
     
     formatarMoeda(value){
         // forçei value a ser um numero (Number)
         // se value menor que 0 sinal de subtração , senão sem sinal
         const sinal = Number(value) < 0 ? "-" : ""
         
         // raplace é um método de troca, então troquei todos os caracteres que não for número por nada ("")
         value  = String(value).replace(/\D/g, "")
         
         // quebra o número pra se caso precisa de números depois do ponto, exemplo: numeros com casas depois do ponto
         value = Number(value) / 100
         
         // formata a moeda de acordo com a localidade, aqui foi feito em reais
         value = value.toLocaleString("pt-BR", {
             style: "currency",
             currency: "BRL"
         })
         return sinal + value
        }
    }

const Formulario = {
    descricao: document.querySelector("input#descricao"),
    valor: document.querySelector("input#valor"),
    data: document.querySelector("input#data"),

    pegarValor(){
        return {
            descricao: Formulario.descricao.value,
            valor: Formulario.valor.value,
            data: Formulario.data.value,
        }
    },

    validarCampos(){
        const descricao = Formulario.pegarValor().descricao
        const valor = Formulario.pegarValor().valor
        const data = Formulario.pegarValor().data
        // trim remove os espaços 
        // verificar se todas informações foram preenchidas
        if(descricao.trim() === "" || valor.trim() === "" || data.trim() === ""){
            throw new Error("Por favor, preencha todos os campos !")
        }
    },

    formatarDados(){
        let descricao = Formulario.pegarValor().descricao
        let valor = Formulario.pegarValor().valor
        let data = Formulario.pegarValor().data

        valor = Utils.formatarValores(valor)

        data = Utils.formatarData(data)
        
        return {
            descricao: descricao,
            valor: valor,
            data: data
        }
    },

    salvarTransacao(transacao){
        Transacao.adicionar(transacao)
    },

    limparCampos(){
        Formulario.descricao.value = ""
        Formulario.valor.value = ""
        Formulario.data.value = ""
    },

    enviar(event){
        event.preventDefault() // interrompe o comportamento padrão de enviar dados do submit, pra que eu possa manipular funcionalidades

        // tente
        try {
        Formulario.validarCampos()
        // formatar os dados para salvar
        const transacao = Formulario.formatarDados()
        // salvar
        Formulario.salvarTransacao(transacao)
        // apagar campos
        Formulario.limparCampos()
        // fechar Modal
        Modal.fechar()
        
        } catch (error){
            alert(error.message)
        }
        
    }
}

const App = {
    iniciar(){
       // para cada transação do array transações chamar a função addTransacao do objeto DOM
        Transacao.all.forEach(DOM.adicionarTransacao)

        DOM.atualizarBalanco()

        Storage.guardar(Transacao.all)
    },

    recarregar(){
       DOM.limparTransacoes()
       App.iniciar()
    },
}

App.iniciar()






