import axios from 'axios';

import {
    criarPersonagem,
    getSalarioAtual,
    trabalhar,
    tomarBanho,
    dormir,
    relacionar,
    treinarHabilidade,
    comprarItem
} from "../src/acoes.js"

import {
    updateDinheiro,
    updateEnergia,
    updateHabilidade,
    updateHigiene,
    updateTempoDeVida,
    updateSalarios,
    setTempoDeVida
} from '../src/funcoes-menores-globais.js'

import {
    ativaCheat,
    isCheatJunim
} from "../src/cheats.js"


let EMPREGOS;
let listaDeEmpregos

let CHEATS;
let listaDeCheats

let ITENS_DE_HABILIDADE
let listaDeItensDeHabilidade

let INTERACOES
let listaDeInteracoes

beforeAll(async () => {
    EMPREGOS = await axios.get('https://emilyspecht.github.io/the-cresim/empregos.json');
    listaDeEmpregos = EMPREGOS.data;

    CHEATS = await axios.get('https://emilyspecht.github.io/the-cresim/cheats.json');
    listaDeCheats = CHEATS.data;

    ITENS_DE_HABILIDADE = await axios.get('https://emilyspecht.github.io/the-cresim/itens-habilidades.json');
    listaDeItensDeHabilidade = ITENS_DE_HABILIDADE.data;

    INTERACOES = await axios.get('https://emilyspecht.github.io/the-cresim/interacoes.json');
    listaDeInteracoes = INTERACOES.data;
})

describe('Testes criacao de personagem', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('Deve conseguir criar um novo Cresim com nome, pontos de higiene e energia carregados e 1500 Cresceleons ', () => {
        const nomeEsperado = 'Robertinho'
        const ptHigieneEsperado = 28
        const ptEnergiaEsperado = 32
        const dinheiroEsperado = 1500

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        expect(personagem.nome).toEqual(nomeEsperado)
        expect(personagem.higiene).toEqual(ptHigieneEsperado)
        expect(personagem.energia).toEqual(ptEnergiaEsperado)
        expect(personagem.dinheiro).toEqual(dinheiroEsperado)
    })


    it('Deve conseguir atribuir uma aspiração ao Cresim', () => {
        const aspiracaoEsperada = 'GASTRONOMIA'

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        expect(personagem.aspiracao).toEqual(aspiracaoEsperada)
    })

})

describe('Testes tomar banho', () => {

    it('Deve descontar 10 Cresceleons ao tomar banho', async () => {
        const dinheiroEsperado = 1490
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')

        const [personagemAtualizado, tempoDeVidaGasto] = await tomarBanho(personagem)

        expect(personagemAtualizado.dinheiro).toEqual(dinheiroEsperado)
    })

    it('Deve impedir o personagem de tomar banho nao tendo Cresceleons suficientes ', async () => {
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const personagemComDinheiroAtualizado = updateDinheiro(personagem, -1500)

        const [personagemAtualizado, tempoDeVidaGasto] = await tomarBanho(personagemComDinheiroAtualizado)

        expect(personagemAtualizado).toEqual(personagemComDinheiroAtualizado)
    })
})

describe('Testes da ação trabalhar', () => {
    it('Deve receber o salario certo sem cheat', () => {
        const salarioEsperado = 130

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        const salarioCalculado = getSalarioAtual(personagem, listaDeEmpregos[1]) // gastronomia

        expect(salarioCalculado).toEqual(salarioEsperado)
    })

    it('Deve receber o salario certo com cheat', async () => {
        const salarioEsperado = 143

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        const [personagemComCheat, isCheatAtivado] = await ativaCheat("SORTENAVIDA", personagem)

        const salarioCalculado = getSalarioAtual(personagemComCheat, listaDeEmpregos[1], listaDeCheats[0])

        expect(salarioCalculado).toEqual(salarioEsperado)
    })


    it('Deve receber o salario do dia ao trabalhar uma jornda padrão', async () => {
        const salarioEsperado = 130 + 1500

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagem, listaDeEmpregos[1])

        expect(personagemPosTrabalho.dinheiro).toEqual(salarioEsperado)
    })

    it('Deve perder os pontos de energia ao trabalhar uma jornada padrão', async () => {
        const pontosDeEnrgiaEsperado = 32 - 10

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagem, listaDeEmpregos[1])

        expect(personagemPosTrabalho.energia).toEqual(pontosDeEnrgiaEsperado)
    })


    it('Deve receber o salario equivalente quando começar a trabalhar com os pontos de energia menores que 10', async () => {
        const salarioEsperado = 1626.1

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagemCansado = updateEnergia(personagem, -20)

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagemCansado, listaDeEmpregos[1])

        expect(personagemPosTrabalho.dinheiro).toEqual(salarioEsperado)
    })

    it('Deve receber o salario equivalente quando começar a trabalhar com os pontos de energia menores que 10 e pontos de higiene menores que 4', async () => {
        const salarioEsperado = 1613.49 // 3 pt de energia < 5 e 2 pt de higiene < 4

        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagemCansado = updateEnergia(personagem, -20)
        const personagemFedido = updateHigiene(personagemCansado, -22)

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagemFedido, listaDeEmpregos[1])

        expect(personagemPosTrabalho.dinheiro).toEqual(salarioEsperado)
    })

    it('Deve validar para que o Cresim não consiga começar a trabalhar com os pontos de energia menores que 4', async () => {
        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagemCansado = updateEnergia(personagem, -32)

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagemCansado, listaDeEmpregos[1])

        expect(personagemPosTrabalho).toBeUndefined()
    })

    it('Deve validar para que o Cresim não consiga começar a trabalhar se o personagem não existe', async () => {
        const [personagemPosTrabalho, tempoGasto] = await trabalhar(null, listaDeEmpregos[1])

        expect(personagemPosTrabalho).toBeUndefined()
    })

    it('Deve validar para que o Cresim não consiga começar a trabalhar se o emprego não existe', async () => {
        const personagem = criarPersonagem('Robertinho', 'GASTRONOMIA');

        const [personagemPosTrabalho, tempoGasto] = await trabalhar(personagem, null)

        expect(personagemPosTrabalho).toBeUndefined()
    })
})

describe('Testes para dormir', () => {

    it('Deve conseguir dormir e receber seus pontos de energia', async () => {
        const energiaEsperada = 17
        const vezesADormir = 2
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')

        const personagemCansado = updateEnergia(personagem, -25)
        const [personagemAtualizado, tempoGasto] = await dormir(personagemCansado, vezesADormir)

        expect(personagemAtualizado.energia).toEqual(energiaEsperada)
    })

    it('Deve validar os pontos de energia do personagem para que não passem de 32 pontos', async () => {
        const energiaEsperada = 32
        const vezesADormir = 1

        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const [personagemAtualizado, tempoGasto] = await dormir(personagem, vezesADormir)

        expect(personagemAtualizado.energia).toEqual(energiaEsperada)
    })

    it('Deve validar os pontos de energia do personagem para que não fiquem negativados', async () => {
        const energiaEsperada = 0

        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const personagemAtualizado = updateEnergia(personagem, -64)

        expect(personagemAtualizado.energia).toEqual(energiaEsperada)
    })
})

describe('Testes das funções menores globais', () => {
    it('Deve atualizar corretamente a energia de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const resultadoEsperado = {
            ...personagem,
            energia: 30
        }

        const resultadoObtido = updateEnergia(personagem, -2)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve atualizar corretamente a higiêne de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const resultadoEsperado = {
            ...personagem,
            higiene: 26
        }

        const resultadoObtido = updateHigiene(personagem, -2)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve atualizar corretamente o dinheiro de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const resultadoEsperado = {
            ...personagem,
            dinheiro: 1000
        }

        const resultadoObtido = updateDinheiro(personagem, -500)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve atualizar corretamente o tempo de vida de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const resultadoEsperado = {
            ...personagem,
            tempoDeVida: 3000000
        }

        const resultadoObtido = updateTempoDeVida(personagem, -600000)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve atualizar corretamente a pontuação de habilidade de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const habilidadesAtualizadas = personagem.habilidades.map(habilidade =>
            habilidade.nome === 'PINTURA'
                ? { ...habilidade, pontos: habilidade.pontos + 2 }
                : habilidade
        )

        const resultadoEsperado = {
            ...personagem,
            habilidades: habilidadesAtualizadas
        }

        const resultadoObtido = updateHabilidade(personagem, 'PINTURA', 2)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve atualizar corretamente o nível de habilidade de um Cresim', () => {
        const personagem = criarPersonagem('Pikachu', 'PINTURA')

        const habilidadesAtualizadas = personagem.habilidades.map(habilidade =>
            habilidade.nome === 'PINTURA'
                ? { ...habilidade, pontos: 27, nivel: 'SENIOR' }
                : habilidade
        )

        const resultadoEsperado = {
            ...personagem,
            habilidades: habilidadesAtualizadas
        }

        const resultadoObtido = updateHabilidade(personagem, 'PINTURA', 27)

        expect(resultadoObtido).toEqual(resultadoEsperado)
    })

    it('Deve dar um update nos salarios do cresim corretamente', () => {
        const salarioEsperadoJogos = 176
        const salarioEsperadoGastronomia = 143
        const salarioEsperadoPintura = 121
        const salarioEsperadoMusica = 231
        const salarioEsperadoLadrao = 176

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const personagemComSalariosAumentados = updateSalarios(personagem, 10)

        expect(personagemComSalariosAumentados.habilidades[1].salario).toEqual(salarioEsperadoGastronomia)
        expect(personagemComSalariosAumentados.habilidades[0].salario).toEqual(salarioEsperadoJogos)
        expect(personagemComSalariosAumentados.habilidades[2].salario).toEqual(salarioEsperadoPintura)
        expect(personagemComSalariosAumentados.habilidades[3].salario).toEqual(salarioEsperadoMusica)
        expect(personagemComSalariosAumentados.habilidades[4].salario).toEqual(salarioEsperadoLadrao)
    })

    it('Deve mudar o tempo de vida do personagem corretamente', () => {
        const tempoDeVidaEsperado = 0

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const personagemComSalariosAumentados = setTempoDeVida(personagem, 0)

        expect(personagemComSalariosAumentados.tempoDeVida).toEqual(tempoDeVidaEsperado)
    })
})

describe('Testes de relacionamento ', () => {
    it('Deve evoluir os pontos da relação', async () => {
        const nivelDeRelacionamentoEsperado = 4

        const listaDeRelacionamentos = []
        const personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinha', 'JOGOS');

        const [[relacionamentoAtual, listaDeRelacionamentosEncontrados, personagem1Atualizado, personagem2Atualizado], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2])

        expect(relacionamentoAtual.ptRelacionamento).toEqual(nivelDeRelacionamentoEsperado)
    })


    it('Deve evoluir o relacionamento de dois Cresims para AMIZADE', async () => {
        const nivelDeRelacionamentoEsperado = ['NEUTRO', 'AMIZADE']

        const listaDeRelacionamentos = []
        const personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinha', 'JOGOS');

        const [[primeiraRelacao, primieraListaDeRelacionamento, p1, p0], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2])
        const [[segundaRelacao, segundaListaDeRelacionamento, p2, p4], tempoGasto2] = await relacionar(p1, p0, primieraListaDeRelacionamento, listaDeInteracoes.NEUTRO[2])
        const [[terceiraRelacao, terceiraListaDeRelacionamento, p3, p5], tempoGasto3] = await relacionar(p2, p4, segundaListaDeRelacionamento, listaDeInteracoes.NEUTRO[2])
                
        expect(terceiraRelacao.tipoRelacionamento).toEqual(nivelDeRelacionamentoEsperado)
    })

    it('Deve recuar o relacionamento de dois Cresims para INIMIZADE', async () => {
        const nivelDeRelacionamentoEsperado = ['NEUTRO', 'INIMIZADE']

        const listaDeRelacionamentos = []
        const personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinha', 'JOGOS');

        
        const [[primeiraRelacao, primieraListaDeRelacionamento, p1, p0], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[5])
        const [[segundaRelacao, segundaListaDeRelacionamento, p2, p4], tempoGasto2] = await relacionar(p1, p0, primieraListaDeRelacionamento, listaDeInteracoes.NEUTRO[5])
        const [[terceiraRelacao, terceiraListaDeRelacionamento, p3, p5], tempoGasto3] = await relacionar( p2, p4, segundaListaDeRelacionamento, listaDeInteracoes.NEUTRO[5])
                        
        expect(terceiraRelacao.tipoRelacionamento).toEqual(nivelDeRelacionamentoEsperado)
    })

    it('Deve descontar os pontos de energia em uma interação entre dois Cresims', async () => {
        const energiaDosPersonagem1Esperado = 28
        const energiaDosPersonagem2Esperado = 30

        const listaDeRelacionamentos = []
        const personagem1 = criarPersonagem('Robertinha', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinho', 'JOGOS');

        const [[primeiraRelacao, primieraListaDeRelacionamento, p1, p0], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[5])
        const [[segundaRelacao, segundaListaDeRelacionamento, p2, p4], tempoGasto2] = await relacionar(p1, p0, primieraListaDeRelacionamento, listaDeInteracoes.NEUTRO[5])

        expect(p2.energia).toEqual(energiaDosPersonagem1Esperado)
        expect(p4.energia).toEqual(energiaDosPersonagem2Esperado)
    })

    it('Deve reconhecer o relacionamento entre personagem1 e personagem2 e entre personagem2 e personagem1', async () => {
        const nivelDeRelacionamentoEsperado = 8

        const listaDeRelacionamentos = []
        const personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinha', 'JOGOS');

        const [[relacionamentoAtual, listaDeRelacionamentosEncontrados, personagem1Atualizado, personagem2Atualizado], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2])

        const [[relacionamentoAtualModificado],tempoGasto2] = await relacionar(personagem2Atualizado, personagem1Atualizado, listaDeRelacionamentosEncontrados, listaDeInteracoes.NEUTRO[2])

        expect(relacionamentoAtualModificado.ptRelacionamento).toEqual(nivelDeRelacionamentoEsperado)
    })

    it('Deve conseguir realizar uma ação da categoria AMOR', async () => {
        const nivelDeRelacionamentoEsperado = ['NEUTRO', 'AMIZADE', 'AMOR'];
        let listaDeRelacionamentos = [];
        let personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        let personagem2 = criarPersonagem('Robertinha', 'JOGOS');

        let relacionamentoAtual;

        const [resultado, tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2]);
        [relacionamentoAtual, listaDeRelacionamentos, personagem1, personagem2] = resultado;

        for (let i = relacionamentoAtual.ptRelacionamento; i < 25; i++) {
            updateEnergia(personagem1, 32)
            updateEnergia(personagem2, 32)
            const [resultado, tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2]);
            [relacionamentoAtual, listaDeRelacionamentos, personagem1, personagem2] = resultado;
        }

        expect(relacionamentoAtual.tipoRelacionamento).toEqual(nivelDeRelacionamentoEsperado)
    })

    it('Deve atualizar corretamente a lista quando o relacionamento já existe', async () => {
        const listaDeRelacionamentos = [
            { nomePersonagem1: 'Robertinho', nomePersonagem2: 'Robertinha', ptRelacionamento: 2, tipoRelacionamento: ['NEUTRO'] },
            { nomePersonagem1: 'João', nomePersonagem2: 'Maria', ptRelacionamento: 5, tipoRelacionamento: ['NEUTRO'] }
        ];
        const personagem1 = criarPersonagem('Robertinho', 'GASTRONOMIA');
        const personagem2 = criarPersonagem('Robertinha', 'JOGOS');
    
        const [[relacionamentoAtualizado, novaListaDeRelacionamentos], tempoGasto] = await relacionar(personagem1, personagem2, listaDeRelacionamentos, listaDeInteracoes.NEUTRO[2]);
    
        expect(novaListaDeRelacionamentos).toContainEqual(relacionamentoAtualizado);
        expect(novaListaDeRelacionamentos.length).toBe(2); 
    });
})

describe('Testes de cheats', () => {
    it('Deve conseguir aplicar o cheat SORTENAVIDA e receber as recompensas', async () => {
        const salarioEsperadoJogos = 176
        const salarioEsperadoGastronomia = 143
        const salarioEsperadoPintura = 121
        const salarioEsperadoMusica = 231
        const salarioEsperadoLadrao = 176

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const [personagemComSalariosAumentados, ativouOCHeat] = await ativaCheat('SORTENAVIDA', personagem)

        if (!ativouOCHeat) console.log("Não foi possível ativar o cheat");

        expect(personagemComSalariosAumentados.habilidades[1].salario).toEqual(salarioEsperadoGastronomia)
        expect(personagemComSalariosAumentados.habilidades[0].salario).toEqual(salarioEsperadoJogos)
        expect(personagemComSalariosAumentados.habilidades[2].salario).toEqual(salarioEsperadoPintura)
        expect(personagemComSalariosAumentados.habilidades[3].salario).toEqual(salarioEsperadoMusica)
        expect(personagemComSalariosAumentados.habilidades[4].salario).toEqual(salarioEsperadoLadrao)
    })

    it('Deve conseguir aplicar o cheat DEITADONAREDE e receber as recompensas', async () => {
        const tempoDeEnergiaEsperado = 7

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const personagemComEnergiaReduzida = updateEnergia(personagem, - 30)

        const [personagemComEnergiaAumentada, ativouOCHeat] = await ativaCheat('DEITADONAREDE', personagemComEnergiaReduzida)

        if (!ativouOCHeat) console.log("Não foi possível ativar o cheat");

        expect(personagemComEnergiaAumentada.energia).toEqual(tempoDeEnergiaEsperado)
    })

    it('Deve conseguir aplicar o cheat JUNIM e receber as recompensas para a habilidade escolhida', async () => {
        const ptHabilidadeEsperadoGastronomia = 5

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const [personagemComHabilidadeAumentada, ativouOCHeat] = await ativaCheat('JUNIM', personagem, 'GASTRONOMIA')

        if (!ativouOCHeat) console.log("Não foi possível ativar o cheat");

        expect(personagemComHabilidadeAumentada.habilidades[1].pontos).toEqual(ptHabilidadeEsperadoGastronomia)
    })

    it('Deve conseguir aplicar o cheat CAROLINAS e receber as recompensas', async () => {
        const tempoDeVidaEsperado = 500000 + 100000

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const personagemComtempoDeVidaReduzido = setTempoDeVida(personagem, 500000)

        const [personagemComtempoDeVidaAumentada, ativouOCHeat] = await ativaCheat('CAROLINAS', personagemComtempoDeVidaReduzido)

        if (!ativouOCHeat) console.log("Não foi possível ativar o cheat");

        expect(personagemComtempoDeVidaAumentada.tempoDeVida).toEqual(tempoDeVidaEsperado)
    })

    it('Deve conseguir aplicar o cheat SINUSITE ter a vida zerada', async () => {
        const tempoDeVidaEsperado = 0

        const personagem = criarPersonagem('Alberto', 'PINTURA')

        const [personagemComtempoDeVidaAumentada, ativouOCHeat] = await ativaCheat('SINUSITE', personagem)

        if (!ativouOCHeat) console.log("Não foi possível ativar o cheat");

        expect(personagemComtempoDeVidaAumentada.tempoDeVida).toEqual(tempoDeVidaEsperado)
    })

    it('Deve retornar true ou false se o cheat é JUNIM', async () => {
        const resultado1Esperado = true
        const resultado2Esperado = false

        const resultado1 = isCheatJunim("JUNIM")
        const resultado2 = isCheatJunim("SINUSITE")

        expect(resultado1).toEqual(resultado1Esperado)
        expect(resultado2).toEqual(resultado2Esperado)
    })

    it('Deve retornar o mesmo personagem e false caso o cheat não exista', async () => {
        const resultadoFalse = false;
        const personagem = criarPersonagem('Testa da Silva', 'PINTURA')

        const [personagemSemCheat, cheatFalse] = await ativaCheat('VALORANT', personagem)

        expect(resultadoFalse).toEqual(cheatFalse)
        expect(personagem).toEqual(personagemSemCheat)

    })
})

describe('Testes de treinar habilidade', () => {

    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('Deve conseguir concluir um ciclo de treino com habilidade que não é aspiração e receber os pontos corretamente', async () => {
        const personagem = criarPersonagem('Teste', 'PINTURA')

        personagem.itensComprados = ['Mouse com led']

        const promiseTreinar = treinarHabilidade(personagem, 'JOGOS')

        jest.runAllTimers()

        const personagemComHabilidadeModificada = await promiseTreinar

        const habilidadeJogos = personagemComHabilidadeModificada.habilidades.find(h => h.nome === 'JOGOS')

        expect(habilidadeJogos.pontos).toBe(2)

    })

    it('Deve conseguir concluir um ciclo de treino com habilidade que é sua aspiração e receber os pontos corretamente', async () => {
        const personagem = criarPersonagem('Teste', 'JOGOS')

        personagem.itensComprados = ["Mouse com led"]

        const promiseTreinar = treinarHabilidade(personagem, 'JOGOS')

        jest.runAllTimers()

        const personagemComHabilidadeModificada = await promiseTreinar

        const habilidadeJogos = personagemComHabilidadeModificada.habilidades.find(h => h.nome === 'JOGOS')

        expect(habilidadeJogos.pontos).toBe(3)

    })

    it('Deve perder pontos de energia ao terminar um ciclo de treino', async () => {
        const personagem = criarPersonagem('Teste', 'JOGOS')

        const promiseTreinar = treinarHabilidade(personagem, 'JOGOS')

        jest.runAllTimers()

        const personagemComEnergiaAtualizada = await promiseTreinar

        expect(personagemComEnergiaAtualizada.energia).toBe(28)
    })

    it('Deve perder pontos de higiene ao terminar um ciclo de treino', async () => {
        const personagem = criarPersonagem('Teste', 'JOGOS')

        const promiseTreinar = treinarHabilidade(personagem, 'JOGOS')

        jest.runAllTimers()

        const personagemComHigieneAtualizada = await promiseTreinar

        expect(personagemComHigieneAtualizada.higiene).toBe(26)
    })

    it('Deve avançar o nivel de habilidade quando completar os pontos necessarios', async () => {
        const personagem = criarPersonagem('Teste', 'PINTURA')

        personagem.habilidades = [
            { nome: "PINTURA", pontos: 16, nivel: "JUNIOR" }
        ]

        const promiseTreinar = treinarHabilidade(personagem, 'PINTURA')

        jest.runAllTimers()

        const personagemAposTreino = await promiseTreinar

        const habilidade = personagemAposTreino.habilidades.find(h => h.nome === "PINTURA");
        expect(habilidade.nivel).toBe("PLENO")
    })

    it('Deve retornar falso quando tentar treinar habilidade sem energia suficiente', async () => {
        const personagem = criarPersonagem('Teste', 'PINTURA')

        const personagemComEnergiaAtualizada = updateEnergia(personagem, -30)

        const promiseTreinar = treinarHabilidade(personagemComEnergiaAtualizada, 'PINTURA')

        jest.runAllTimers()

        const personagemAposTreino = await promiseTreinar


        expect(personagemAposTreino).toBeFalsy()
    })

    it('Deve retornar falso quando tentar treinar sem receber uma habilidade', async () => {
        const personagem = criarPersonagem('Teste', 'PINTURA')

        const promiseTreinar = treinarHabilidade(personagem, null)

        jest.runAllTimers()

        const personagemAposTreino = await promiseTreinar

        expect(personagemAposTreino).toBeFalsy()
    })

    it('Deve conseguir usar o item com mais pontuação para treinar uma habilidade', async () => {
        const personagem = criarPersonagem('Teste', 'PINTURA')

        personagem.itensComprados = [...personagem.itensComprados, "Mouse com led", "Teclado torneiro mecânico", "Ventuinha barulhenta"]

        const promiseTreinar = treinarHabilidade(personagem, 'JOGOS')

        jest.runAllTimers()

        const personagemComHabilidadeModificada = await promiseTreinar

        const habilidadeJogos = personagemComHabilidadeModificada.habilidades.find(h => h.nome === 'JOGOS')

        expect(habilidadeJogos.pontos).toBe(7)
    })


})

describe('Testes comprar itens', () => {

    it('Deve conseguir comprar um item de habilidade', async () => {
        const dinheiroEsperado = 1500 - 1200 // dinheiro padrão | preço do lápis mordido
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const nomeDoItem = 'lápis mordido'

        const personagemAtualizado = await comprarItem(personagem, nomeDoItem, listaDeItensDeHabilidade)

        expect(personagemAtualizado.dinheiro).toEqual(dinheiroEsperado)
    })

    it('Deve validar ao tentar comprar um item de habilidade sem Cresceleons suficientes', async () => {
        const dinheiroEsperado = 1500
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const nomeDoItem = 'Piano burguês'

        const personagemAtualizado = await comprarItem(personagem, nomeDoItem, listaDeItensDeHabilidade)

        expect(personagemAtualizado.dinheiro).toEqual(dinheiroEsperado)
    })

    it('Deve tentar comprar um item que não está na lista', async () => {
        const arrayDeItensEsperado = []
        const personagem = criarPersonagem('Teste da Silva', 'JOGOS')
        const nomeDoItem = 'monitor 24k'

        const personagemAtualizado = await comprarItem(personagem, nomeDoItem, listaDeItensDeHabilidade)

        expect(personagemAtualizado.itensComprados).toEqual(arrayDeItensEsperado)
    })

    it('Deve tentar comprar o mesmo item mais de uma vez', async () => {
        const arrayDeItensEsperado = ['lápis mordido']
        const personagem = updateDinheiro(criarPersonagem('Teste da Silva', 'JOGOS'), 1500)
        const nomeDoItem = 'lápis mordido'

        const personagemAtualizado = await comprarItem(personagem, nomeDoItem, listaDeItensDeHabilidade)

        const personagemAtualizado2 = await comprarItem(personagemAtualizado, nomeDoItem, listaDeItensDeHabilidade)

        expect(personagemAtualizado2.itensComprados).toEqual(arrayDeItensEsperado)
    })




    // teste usando spy
    // it('Deve logar "Dinheiro insuficiente para comprar o item quando não houver dinheiro suficiente', async () => {
    //     const personagem = criarPersonagem('Teste da Silva', 'JOGOS');
    //     const nomeDoItem = 'Piano burguês';
    //
    //     const spy = jest.spyOn(console, 'log');
    //
    //     await comprarItem(personagem, nomeDoItem);
    //
    //     expect(spy).toHaveBeenCalledWith("Dinheiro insuficiente para comprar o item.");
    //
    //     spy.mockRestore();
    // });

})

