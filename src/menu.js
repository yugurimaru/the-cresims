import axios from 'axios';
import { useQuestion } from './services/question/use-question'
import { useLocalStorage } from "./services/local-storage/use-local-storage";

import {
    buscarRelacionamento,
    relacionar,
    comprarItem,
    tomarBanho,
    treinarHabilidade,
    dormir,
    trabalhar, criarPersonagem
} from "./acoes";

import {
    ativaCheat,
    isCheatJunim
} from "./cheats";


//============================================================================================================================================
//                                                        MENUS
//============================================================================================================================================
const figlet = require("figlet");


export async function menuPrincipal() { 
    
    await showMenuPrincipal();
    const escolha = await useQuestion("Selecione uma opção:")

    switch (escolha) {
        case "0": 
            console.log("Encerrando...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            process.exit(0);
            break;
        case "1": 
            return await menuEscolherPersonagens();
        case "2": 
            return await menuDeCriacaoDePersonagem();
        default:
            console.log("Escolha nao reconhecida ou indisponível");
            await new Promise(resolve => setTimeout(resolve, 1000))
            return await menuPrincipal()
    }
}

export async function menuDeCriacaoDePersonagem() {
    console.clear();
    
    console.log('0 - Menu Principal\n')
    const nome = await useQuestion("Escreva o nome do seu personagem:");
    const listaDePersonagens = getListaDePersonagens();
    const nomeJaExiste = listaDePersonagens.some(personagem => personagem.nome.toLowerCase() === nome.toLowerCase());

    if (nomeJaExiste) {
        console.log("Já existe um personagem com esse nome. Por favor, escolha outro nome.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await menuPrincipal();
    }

    if(nome === '0'){
        console.log("Retornando ao menu principal");
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await menuPrincipal()
    }

    const escolha = await obterEscolhaAspiracao();

    if(escolha === '0'){
        console.log("Retornando ao menu principal");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await menuPrincipal()
    }

    const aspiracao = escolhaParaAspiracao(escolha);

    if (aspiracao === null) {
        console.log("Escolha de aspiração não reconhecida");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await menuPrincipal();
    }

    await interfaceCriarPersonagem(nome, aspiracao);
}

async function menuEscolherPersonagens(){
    const listaDePersonagens = showEscolherPersonagem()

    const escolhaStr = await useQuestion("\nEscolha o personagem:")
    const escolhaNum = Number(escolhaStr) - 1;

    const personagemEscolhido = listaDePersonagens[escolhaNum]

    if (escolhaStr === "0") {
        console.log("Voltando ao menu principal...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        await menuPrincipal()
    }

    if (!personagemEscolhido) {
        console.log("Escolha nao reconhecida ou indisponível");
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await menuEscolherPersonagens()
    }

    return await menuDeAcoes(personagemEscolhido);
}

export async function menuDeAcoes(personagemEscolhido){
    showMenuDeAcao(personagemEscolhido)
    const escolha = await useQuestion("Escolha sua ação:")

    switch (escolha) {
        case "0":
            console.log("Voltando ao menu principal");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await menuPrincipal()
            break;
        case "1":
            await menuTrabalhar(personagemEscolhido);
            break;
        case "2":
            await menuDormir(personagemEscolhido);
            break;
        case "3":
            await menuTreinar(personagemEscolhido);
            break;
        case "4":
            await menuTomarBanho(personagemEscolhido)
            break;
        case "5":
            await menuRelacionar(personagemEscolhido)
            break;
        case "6":
            await menuCategorias(personagemEscolhido);
            break;
        default:
            await processarCheat(escolha, personagemEscolhido, menuDeAcoes);
            console.log("Escolha não reconhecida ou indisponível");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await menuDeAcoes(personagemEscolhido)
        }
}

export async function menuCategorias(personagemEscolhido) {
    const ITENSLOJA = await axios.get('https://emilyspecht.github.io/the-cresim/itens-habilidades.json');
    const listaDeItens = ITENSLOJA.data;

    const categorias = Object.keys(listaDeItens);

    showInformacoesPersonagem(personagemEscolhido);
    showCategoriasParaEscolher(categorias);

    const escolha = await useQuestion("Escolha a categoria:");

    if(escolha == "0") {
            console.log("Voltando para o menu de ações...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return menuDeAcoes(personagemEscolhido);
    }
    else{
        await processarCheat(escolha, personagemEscolhido, menuCategorias);
        const categoriaEscolhida = categorias
            .map((categoria, index) => ({ categoria, index }))
            .find(({ index }) => index === parseInt(escolha, 10) - 1)?.categoria;
        if (categoriaEscolhida && listaDeItens[categoriaEscolhida]) {
            await menuComprarItem(personagemEscolhido, categoriaEscolhida, listaDeItens);
        } else {
            console.log("Escolha não reconhecida ou indisponível");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return menuCategorias(personagemEscolhido);
        }
    }
}

async function menuComprarItem(personagemEscolhido, categoria, listaDeItens) {
    showInformacoesPersonagem(personagemEscolhido);
    showItensParaEscolher(listaDeItens, categoria);
    const itemEscolha = await useQuestion("Escolha seu item:");

    if(itemEscolha == "0") {
        console.log("Retornando ao menu de categorias...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return menuCategorias(personagemEscolhido);
    }else{
        await processarCheat(itemEscolha, personagemEscolhido, menuComprarItem, categoria, listaDeItens);
            if (itemEscolha >= "1" && itemEscolha <= "3") {
                const itemSelecionado = listaDeItens[categoria]
                    .map((item, index) => ({ ...item, index: index + 1 }))
                    .find(item => item.index === Number(itemEscolha))?.nome;
                await interfaceComprarItem(personagemEscolhido, itemSelecionado, listaDeItens);
                return;
            }
            else {
                console.log("Escolha não reconhecida ou indisponível");
                await new Promise(resolve => setTimeout(resolve, 1000));
                return menuComprarItem(personagemEscolhido, categoria, listaDeItens)
            }
    }
}

async function menuTomarBanho(personagemEscolhido) {
    await interfaceTomarBanho(personagemEscolhido)
}

async function menuDormir(personagemEscolhido) {
    showInformacoesPersonagem(personagemEscolhido)
    const escolha = await useQuestion("Digite quantas vezes você quer dormir:");
    console.clear()

    await interfaceDormir(personagemEscolhido, escolha)
}

async function menuTreinar(personagemEscolhido){
    showInformacoesPersonagem(personagemEscolhido)
    showHabilidades(personagemEscolhido)

    const listaDeHabilidades = personagemEscolhido.habilidades.map((habilidade)=> {return habilidade.nome})

    const escolha = await useQuestion('Escolha a habilidade que será treinada')

    if(escolha === "0") {
        console.log('Voltando ao menu de ações...')
        await new Promise(resolve => setTimeout(resolve, 1000));
        await menuDeAcoes(personagemEscolhido)
    }else{
        await processarCheat(escolha, personagemEscolhido, menuTreinar)
        await interfaceTreinar(personagemEscolhido, listaDeHabilidades[Number(escolha) - 1])
        return await menuDeAcoes(personagemEscolhido)
    }
}

async function menuTrabalhar(personagemEscolhido){
    const EMPREGOS = await axios.get('https://emilyspecht.github.io/the-cresim/empregos.json');
    const listaDeEmpregos = EMPREGOS.data;
    showInformacoesPersonagem(personagemEscolhido)

    showEmpregosParaEscolher(listaDeEmpregos)
    const escolha = await useQuestion("Escolha seu emprego")
    
    if(escolha == "0") {
            console.log('Voltando ao menu de ações...')
            await new Promise(resolve => setTimeout(resolve, 1000));
            await menuDeAcoes(personagemEscolhido)
    }else{
        await processarCheat(escolha, personagemEscolhido, menuTrabalhar);
        await interfaceTrabalhar(personagemEscolhido, listaDeEmpregos, escolha);
        console.log('Escolha não reconhecida')
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await menuTrabalhar(personagemEscolhido)
    }
}

async function menuRelacionar (personagem) {  
    showInformacoesPersonagem(personagem)    
    const listaDePersonagens = getListaDePersonagens()

    showListaDePersonagem(listaDePersonagens)

    const escolha = await useQuestion("Escolha o personagem para se relacionar")

    if(escolha == "0") {
            console.log('Voltando ao menu de ações...')
            await new Promise(resolve => setTimeout(resolve, 1000));
            await menuDeAcoes(personagem)
    }else{
        await processarCheat(escolha, personagem, menuRelacionar);

        if(listaDePersonagens[parseInt(escolha, 10) - 1]){
            if(listaDePersonagens[parseInt(escolha, 10) - 1].nome == personagem.nome){
                console.log("Não é possivel relacionar-se com o mesmo personagem");
                await new Promise(resolve => setTimeout(resolve, 3000));
                return menuRelacionar(personagem)
            }
            await menuInteracoes(personagem, listaDePersonagens[parseInt(escolha, 10) - 1]);
        }
        console.log("Personagem não encontrado");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await menuRelacionar (personagem)
    }
}

async function menuInteracoes(personagem1, personagem2){
    const INTERACOES = await axios.get('https://emilyspecht.github.io/the-cresim/interacoes.json');
    const listaDeInteracoes = INTERACOES.data

    const listaDeRelacionamentosDoDB = getListaDeRelacionamentos()

    const [relacionamento] = buscarRelacionamento(personagem1, personagem2, listaDeRelacionamentosDoDB)

    if(!relacionamento) {
        pushRelacionamentoNaListaDeRelacionamentos(relacionamento)
        return await menuInteracoes(personagem1, personagem2)
    }

    const arrayTipos = relacionamento.tipoRelacionamento
    showInformacoesPersonagem(personagem1)
    console.log(`Pontos Atuais: ${relacionamento.ptRelacionamento}`)
    const arrayDeInteracoes = showInteracoes(arrayTipos, listaDeInteracoes);

    const escolha = await useQuestion("Escolha a interação desejada:")

    if(escolha === "0") {
            console.log('Voltando ao menu de ações...')
            await new Promise(resolve => setTimeout(resolve, 1000));
            await menuDeAcoes(personagem1)
    }else{
        await processarCheat(escolha, personagem1, menuInteracoes, personagem2);

        if (arrayDeInteracoes[parseInt(escolha, 10) - 1]) {
            await interfaceRelacionar(personagem1, personagem2, arrayDeInteracoes[parseInt(escolha, 10) - 1], listaDeRelacionamentosDoDB);
        }
        console.log("Interação não encontrada");
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await menuInteracoes(personagem1, personagem2)
    }
}

//============================================================================================================================================
//                                                        FUNÇÕES GERAIS
//============================================================================================================================================

const escolhaParaAspiracao = (escolha) => {
    const aspiracoes = {
        '1': 'GASTRONOMIA',
        '2': 'PINTURA',
        '3': 'JOGOS',
        '4': 'JARDINAGEM',
        '5': 'MUSICA',
    };
    return aspiracoes[escolha] || null;
};

const obterEscolhaAspiracao = async () => {
    showMenuCriacaoDePersonagem();
    return await useQuestion("Selecione a aspiração do personagem:");
};

//============================================================================================================================================
//                                                        FUNÇÕES DO BD
//============================================================================================================================================

export function pushPersonagemNaListaDePersonagens(personagem){
    const localStorage = useLocalStorage()

    const listaDePersonagens = localStorage.getObject('listaDePersonagens')

    if(!listaDePersonagens){
        localStorage.setObject('listaDePersonagens', [personagem])
        return 
    }

    const novaLista = listaDePersonagens.some(p => p.nome === personagem.nome) ? listaDePersonagens.map(p => (p.nome === personagem.nome) ? personagem : p) : [...listaDePersonagens, personagem]
    
    localStorage.setObject('listaDePersonagens', novaLista)
}

export function getListaDePersonagens(){
    const localStorage = useLocalStorage()

    const listaDePersonagens = localStorage.getObject('listaDePersonagens');

    if(!listaDePersonagens){
        localStorage.setObject('listaDePersonagens', [])
        return localStorage.getObject('listaDePersonagens')
    }

    const listaDePersonagensSemOsMortos = listaDePersonagens.filter(personagem => personagem.tempoDeVida !== 0);

    return listaDePersonagensSemOsMortos
}

export function pushRelacionamentoNaListaDeRelacionamentos(relacionamento){
    const localStorage = useLocalStorage()

    const listaDeRelacionamentos = localStorage.getObject('listaDeRelacionamentos');

    if(!listaDeRelacionamentos){
        localStorage.setObject('listaDeRelacionamentos', [relacionamento])
        return 
    }

    const relacionamentoJaEstaNaLista = listaDeRelacionamentos.some(r =>
        (r.nomePersonagem1 === relacionamento.nomePersonagem1 && r.nomePersonagem2 === relacionamento.nomePersonagem2) ||
        (r.nomePersonagem1 === relacionamento.nomePersonagem2 && r.nomePersonagem2 === relacionamento.nomePersonagem1)
      )

      const novaLista = relacionamentoJaEstaNaLista
      ? listaDeRelacionamentos.map(r =>
          ((r.nomePersonagem1 === relacionamento.nomePersonagem1 && r.nomePersonagem2 === relacionamento.nomePersonagem2) ||
           (r.nomePersonagem1 === relacionamento.nomePersonagem2 && r.nomePersonagem2 === relacionamento.nomePersonagem1))
            ? relacionamento : r) : [...listaDeRelacionamentos, relacionamento]

    localStorage.setObject('listaDeRelacionamentos', novaLista)
}

export function getListaDeRelacionamentos(){
    const localStorage = useLocalStorage()

    const listaDePersonagens = localStorage.getObject('listaDeRelacionamentos');

    if(!listaDePersonagens){
        localStorage.setObject('listaDeRelacionamentos', [])
        return localStorage.getObject('listaDeRelacionamentos')
    }

    return listaDePersonagens
}

//============================================================================================================================================
//                                                        FUNÇÕES CHEATS
//============================================================================================================================================

async function processarCheat(cheat, personagemEscolhido, tipoDeMenu, ...args) {
    const habilidade = isCheatJunim(cheat)
        ? await cheatMenuEscolhaDeHabilidade(personagemEscolhido)
        : undefined;

    const [personagemComPossivelCheat, cheatAtivado] = await ativaCheat(cheat, personagemEscolhido, habilidade);

    if (cheatAtivado) {
        console.log(`\nCHEAT ATIVADO: ${cheat}`);
        console.log("Voltando...");
        pushPersonagemNaListaDePersonagens(personagemComPossivelCheat)
        await new Promise(resolve => setTimeout(resolve, 3000));
        return await tipoDeMenu(personagemComPossivelCheat, ...args);
    }
    
    return null
}

async function cheatMenuEscolhaDeHabilidade(personagemEscolhido) {
    showInformacoesPersonagem(personagemEscolhido)
    const habilidadesValidas = personagemEscolhido.habilidades.map((habilidade)=> {return habilidade.nome})
    console.log("Escolha a habilidade para aumentar:")
    showHabilidades(personagemEscolhido)

    const escolha = await useQuestion("Digite a habilidade desejada:");
    const indiceEscolha = parseInt(escolha, 10) - 1;

    if (habilidadesValidas.includes(habilidadesValidas[indiceEscolha])) {
        return habilidadesValidas[indiceEscolha];
    } else {
        console.log("Habilidade inválida! Escolha novamente.");
        await new Promise(resolve => setTimeout(resolve, 3000))
        return cheatMenuEscolhaDeHabilidade(personagemEscolhido);
    }
}

//============================================================================================================================================
//                                                        ANIMAÇÔES
//============================================================================================================================================

async function animacaoAcoes(tempoGasto, textoARepetir, textoFinal) {
    console.clear();

    await new Promise((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const dots = ".".repeat((Math.floor(elapsedTime / 500) % 3) + 1);
            process.stdout.write(`\r${textoARepetir}${dots}  `);

            if (elapsedTime >= tempoGasto) {
                clearInterval(interval);
                console.clear();
                process.stdout.write(textoFinal + '\n');
                resolve();
            }
        }, 250);
    });
}

//============================================================================================================================================
//                                                        SHOW INFORMAÇÔES
//============================================================================================================================================

function showInteracoes(arrayDeTipos, listaDeInteracoes){
    let contador = 0;

    const arrayDeInteracoes = arrayDeTipos.flatMap((tipo) => {
        console.log('\n', tipo);
        return listaDeInteracoes[tipo].map((interacao) => {
            contador++;
            console.log(`${contador}. ${interacao.interacao}`);
            return interacao;
        });
    });

    return arrayDeInteracoes
}

function showListaDePersonagem(listaDePersonagens) {
    listaDePersonagens.map((personagem, index) => {
        console.log(`${index+1}. ${personagem.nome}`)
    })
    console.log("\n0. Sair");
}

function showEmpregosParaEscolher(listaDeEmpregos) {
    listaDeEmpregos.map((emprego, index)=>{
        console.log(`${index + 1}. ${emprego.cargo}`);
    })

    console.log("\n0. Sair");

}

function showHabilidades(personagemEscolhido){
    personagemEscolhido.habilidades.map((habilidade, index)=>{
        console.log(`${index+1} - ${habilidade.nome}`)
    })

    console.log('\n0 - Voltar ao menu de ações')
}

function showItensParaEscolher(listaDeItens, nomeCategoria) {
    console.log(`Itens da categoria ${nomeCategoria.toUpperCase()}:\n`);
    listaDeItens[nomeCategoria].forEach((item, index) => {
        console.log(`${index + 1}. ${item.nome.padEnd(29)} | Preço: ${item.preco} | Pontos: ${item.pontos}`);
    });
    console.log("\n0. Voltar\n");
}

function showCategoriasParaEscolher(categorias) {
    console.log(`Escolha a categoria de itens:\n`);
    categorias.forEach((item, index) => {
        console.log(`${index + 1}. ${item.toUpperCase()}`);
    });
    console.log("\n0. Voltar\n");
}

function showInformacoesPersonagem(personagem) {
    console.clear();

    const habilidadesFormatadas = personagem.habilidades
        .map(h => `${h.nivel} em ${h.nome} | ${h.pontos} pts.`)
        .concat(Array(5).fill("").slice(personagem.habilidades.length))
        .map(h => h.padEnd(30))
        .join("\n");

console.log(`
+----------------------------------------------------------------+
Informações do personagem:              Habilidades:
Nome: ${personagem.nome.padEnd(25)} | ${habilidadesFormatadas.split("\n")[0]}
Aspiração: ${personagem.aspiracao.padEnd(20)} | ${habilidadesFormatadas.split("\n")[1]}
Tempo de jogo: ${String(personagem.tempoDeVida).padEnd(16)} | ${habilidadesFormatadas.split("\n")[2]}
Energia: ${String(personagem.energia).padEnd(22)} | ${habilidadesFormatadas.split("\n")[3]}
Higiene: ${String(personagem.higiene).padEnd(22)} | ${habilidadesFormatadas.split("\n")[4]}
Cresceleons: ${String(personagem.dinheiro.toFixed(2)).padEnd(20)}
Itens: ${personagem.itensComprados.join(", ")}
+----------------------------------------------------------------+
`);

}

function showMenuDeAcao(personagemEscolhido) {
    showInformacoesPersonagem(personagemEscolhido)
    console.log("Selecione uma opção:\n")
    console.log("1. Trabalhar")
    console.log("2. Dormir")
    console.log("3. Treinar Habilidade")
    console.log("4. Tomar Banho")
    console.log("5. Evoluir Relações")
    console.log("6. Loja")
    console.log("\n0. Menu Principal\n")
}

function showEscolherPersonagem() {
    console.clear()
    console.log("Lista de Personagens:\n")

    // FORMATAR E IMPRIMIR TODA A LISTA DE PERSONAGENS COM ÍNDICE
    const listaDePersonagens = getListaDePersonagens();
    const listaFormatada = listaDePersonagens.map((personagem, index) =>
        `${index + 1}. ${personagem.nome}`
    );
    console.log(listaFormatada.join('\n'));
    console.log("\n0. Menu Principal")
    return listaDePersonagens
}

function showMenuCriacaoDePersonagem() {
    console.clear()
    console.log("\nASPIRAÇÕES:\n");
    console.log("1. GASTRONOMIA");
    console.log("2. PINTURA");
    console.log("3. JOGOS");
    console.log("4. JARDINAGEM");
    console.log("5. MUSICA\n");
    console.log('0. Voltar ao menu principal\n')
}

async function showMenuPrincipal() {
    console.clear()
    await figlet.text("CRESIM", { font: "Slant" }, function (err, data) {
        console.log(data);
    });    console.log("Selecione uma opção:\n")
    console.log("1. Escolher Personagem")
    console.log("2. Criar Personagem")
    console.log("0. Finalizar Jogo\n")

}

//============================================================================================================================================
//                                                        INTERFACES
//============================================================================================================================================


async function interfaceTreinar(personagem, habilidadeTreinada) {

    if(!habilidadeTreinada) {
        console.clear()
        console.log("Habilidade não reconehecida");
        await new Promise(resolve => setTimeout(resolve, 3000))
        return await menuDeAcoes(personagem);
    }

    const personagemRetornado = await treinarHabilidade(personagem, habilidadeTreinada)
    const tempoGasto = 8000

    if (!personagemRetornado) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        return await menuDeAcoes(personagem)
    }

    await animacaoAcoes(tempoGasto, "Treinando", "Treinamento concluido")

    pushPersonagemNaListaDePersonagens(personagemRetornado)

    console.log('Voltando ao menu de ações...')
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await menuDeAcoes(personagemRetornado)
}

async function interfaceTrabalhar(personagemEscolhido, listaDeEmpregos, escolha){
    const empregoEscolhidoVerificado = await verificaEmprego(escolha - 1, listaDeEmpregos)

    if(empregoEscolhidoVerificado) {
        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagemEscolhido, empregoEscolhidoVerificado)
        const personagemAtualizado = personagemPosTrabalho ? personagemPosTrabalho : personagemEscolhido

        if(!personagemPosTrabalho && !tempoGasto){
            console.clear()
            console.log("Personagem com energia insuficiente")
            await new Promise(resolve => setTimeout(resolve, 3000))
            return menuDeAcoes(personagemAtualizado)
        }


        await animacaoAcoes(tempoGasto, "Trabalhando", "Trabalho finalizado!")

        pushPersonagemNaListaDePersonagens(personagemAtualizado)

        console.log('Voltando ao menu de ações...')
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await menuDeAcoes(personagemAtualizado)
    }

    console.log("Nao conseguiu trabalhar, retornando para o menu de ações...");
    await new Promise(resolve => setTimeout(resolve, 3000))
    return await menuDeAcoes(personagemEscolhido)
}

async function verificaEmprego(escolha, listaDeEmpregos){
    const empregoEscolhido = listaDeEmpregos[escolha];

    if(empregoEscolhido){
        return empregoEscolhido;
    }

}

async function interfaceRelacionar(personagem1, personagem2, interacao, listaDeRelacionamentos){
    if(personagem1.energia < interacao.energia){
        console.clear()
        console.log(`\n${personagem1.nome} não tem energia suficiente`);
        console.log("Voltando...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return menuDeAcoes(personagem1)
    }

    if(personagem2.energia < Math.ceil(interacao.energia/2)){
        console.clear()
        console.log(`\n${personagem2.nome} não tem energia suficiente`);
        console.log("Voltando...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return menuDeAcoes(personagem1)
    }

    const [retornoRelacionamento, tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, interacao)

    retornoRelacionamento.forEach((retorno) => {
        if (!retorno) {
            console.log("Erro na função de relacionar");
            menuPrincipal();
        }
    });

    const tempoGastoTotal = tempoGasto > 0 ? tempoGasto : 2000

    await animacaoAcoes(tempoGastoTotal, "Interagindo", "Interação finalizada!")

    console.clear()
    console.log(`${personagem1.nome} fez a ação ${interacao.interacao} para o personagem ${personagem2.nome}`);

    await new Promise(resolve => setTimeout(resolve, 2000));

    pushRelacionamentoNaListaDeRelacionamentos(retornoRelacionamento[0])

    pushPersonagemNaListaDePersonagens(retornoRelacionamento[2])
    pushPersonagemNaListaDePersonagens(retornoRelacionamento[3])

    return menuDeAcoes(retornoRelacionamento[2])
}

async function interfaceComprarItem(personagemEscolhido, itemSelecionado, listaDeItens){ // ok
    console.clear()
    const novoPersonagem = await comprarItem(personagemEscolhido, itemSelecionado, listaDeItens);
    await new Promise(resolve => setTimeout(resolve, 1000));

    pushPersonagemNaListaDePersonagens(novoPersonagem)

    return menuDeAcoes(novoPersonagem)
}

async function interfaceTomarBanho(personagemEscolhido) {
    const [personagemAtualizado, tempoGasto] = await tomarBanho(personagemEscolhido)

    const novoPersonagem = personagemAtualizado

    if(tempoGasto !== null){
        await animacaoAcoes(tempoGasto, "Tomando banho", "Banho finalizado!")
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    pushPersonagemNaListaDePersonagens(novoPersonagem)

    return menuDeAcoes(novoPersonagem)
}

async function interfaceDormir(personagemEscolhido, vezesADormir) {
    if(vezesADormir == 0){
        console.log("Não pode dormir 0 vezes");
        console.log("Retornando ao menu de ações...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return menuDeAcoes(personagemEscolhido)
    }

    const [novoPersonagem, tempoGasto] = await dormir(personagemEscolhido, vezesADormir)

    await animacaoAcoes(tempoGasto,"dormindo", "Você acordou!")
    await new Promise(resolve => setTimeout(resolve, 1000));

    pushPersonagemNaListaDePersonagens(novoPersonagem)

    return menuDeAcoes(novoPersonagem)
}

async function interfaceCriarPersonagem(nomeEscolhido, aspiracaoEscolhida) {
    const novoPersonagem = criarPersonagem(nomeEscolhido, aspiracaoEscolhida)

    pushPersonagemNaListaDePersonagens(novoPersonagem)

    return menuDeAcoes(novoPersonagem)
}