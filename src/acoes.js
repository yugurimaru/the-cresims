import axios from 'axios'

import {
    updateDinheiro,
    updateEnergia,
    updateHabilidade,
    updateHigiene,
    updateTempoDeVida,
    copiarPersonagem
  } from './funcoes-menores-globais'

export function criarPersonagem(nomeRecebido, aspiracao) {
    return {
        nome: nomeRecebido,
        aspiracao: aspiracao,
        tempoDeVida: 3600000,
        energia: 32,
        higiene: 28,
        dinheiro: 1500,
        itensComprados: [],
        habilidades: [
            {
                nome: "JOGOS",
                pontos: 0,
                nivel: 'JUNIOR',
                salario: 160
            },
            {
                nome: "GASTRONOMIA",
                pontos: 0,
                nivel: 'JUNIOR',
                salario: 130
            },
            {
                nome: "PINTURA",
                pontos: 0,
                nivel: 'JUNIOR',
                salario: 110
            },
            {
                nome: "MUSICA",
                pontos: 0,
                nivel: 'JUNIOR',
                salario: 210
            },
            {
                nome: "JARDINAGEM",
                pontos: 0,
                nivel: 'JUNIOR',
                salario: 160
            }
        ]
    };
}

export async function trabalhar(personagem, empregoEscolhido) {
    if(!empregoEscolhido || !personagem) return [undefined, null];

    const energiaInicial = personagem.energia

    if(energiaInicial < 4) return [undefined, null]

    const turnosPossiveis = Math.min(10, energiaInicial - 2); // retorna o menor valor 

    const tempoPorTurno = 2000; // 20000ms / 10 turnos
    const tempoTotalTrabalho = turnosPossiveis * tempoPorTurno

    const personagemComTempoDeVidaAtualizado = updateTempoDeVida(personagem, - tempoTotalTrabalho)

    const ptHigienePorTurno = 4 / 10
    const descontoHigiene = Math.ceil(ptHigienePorTurno * turnosPossiveis)
    
    const personagemComHigieneDepreciada = updateHigiene(personagemComTempoDeVidaAtualizado, - descontoHigiene)

    const energiaPosTrabalho = energiaInicial - turnosPossiveis;

    const totalSalarioComDesconto = calcularSalario(
        turnosPossiveis,
        energiaPosTrabalho,
        personagemComHigieneDepreciada,
        empregoEscolhido,
        descontoHigiene
    );
    
    const personagemPosTrabalhoComEnergiaAtualizada = updateEnergia(personagemComHigieneDepreciada, - turnosPossiveis)
    const personagemPosTrabalhoComNovoSalario = updateDinheiro(personagemPosTrabalhoComEnergiaAtualizada, totalSalarioComDesconto)
    
    return [personagemPosTrabalhoComNovoSalario, tempoTotalTrabalho]
}

export function calcularSalario(turnosPossiveis, energiaPosTrabalho, personagemComHigieneDepreciada, empregoEscolhido, cheat) {
    const ENERGIA_CANSADO = 5

    const turnosCansado = Math.max(ENERGIA_CANSADO - energiaPosTrabalho, 0);
    const turnosNaoCansado = turnosPossiveis - turnosCansado;
    
    const valorDeSalarioAtual = getSalarioAtual(personagemComHigieneDepreciada, empregoEscolhido)
    const ganhoPorTurno = valorDeSalarioAtual / 10
    

    const totalSalarioDescansado = ganhoPorTurno * turnosNaoCansado
    const totalSalarioCansado = (ganhoPorTurno - (ganhoPorTurno * 0.1)) * turnosCansado
    const totalSalario = totalSalarioDescansado + totalSalarioCansado

    
    const descontoDeHigiene = getDescontoHigiene(personagemComHigieneDepreciada)

    const totalSalarioComDesconto = totalSalario - (totalSalario * descontoDeHigiene)

    return totalSalarioComDesconto
}

export function getSalarioAtual(personagem, empregoEscolhido) {
    const habilidadeAtual = personagem.habilidades.find((habilidade) => habilidade.nome == empregoEscolhido.categoria)

    return habilidadeAtual.salario
}

function getDescontoHigiene(personagemComHigieneDepreciada) {
    if (personagemComHigieneDepreciada.higiene < 4) {
        const dezPorCento = 0.1
        return dezPorCento
    }

    return 0
}

export async function tomarBanho(personagem) {
    const tempoGasto = 3000;
    const custoDoBanho = 10;
    const higieneRecebida = 28;

    if (personagem.dinheiro < custoDoBanho) {
        console.clear();
        console.log("Dinheiro insuficiente para tomar banho.");
        return [personagem, null];

    }

    const personagemAposDecontoDeTempoDeVida = updateTempoDeVida(personagem, - tempoGasto)
    const personagemAposDesconto = updateDinheiro(personagemAposDecontoDeTempoDeVida, -custoDoBanho);
    const personagemAtualizado = updateHigiene(personagemAposDesconto, higieneRecebida);


    return [personagemAtualizado, tempoGasto];

}

export async function dormir(personagem, vezesADormir) {
    const tempoGasto = 5000 * vezesADormir
    const bonus = 2 * (vezesADormir - 1)
    const energiaRecebida = (4 * vezesADormir) + bonus

    const personagemComNovaEnergia = updateEnergia(personagem, energiaRecebida)
    const personagemComNovoTempoDeVida = updateTempoDeVida(personagemComNovaEnergia, - tempoGasto)


    return [personagemComNovoTempoDeVida, tempoGasto]
}

export async function relacionar(personagem1, personagem2, relacionamentos, interacao) {
    const tempoDeInteracao = 2000;
    const personagem1Copiado = copiarPersonagem(personagem1)
    const personagem2Copiado = copiarPersonagem(personagem2)

    const [relacionamentoEncontrado, novosRelacionamentos] = buscarRelacionamento(personagem1Copiado, personagem2Copiado, relacionamentos);

    const novoRelacionamento = interagir(relacionamentoEncontrado, interacao);

    const personagem1ComNovaEnergia = updateEnergia(personagem1Copiado, -interacao.energia);
    const personagem2ComNovaEnergia = updateEnergia(personagem2Copiado, -Math.ceil(interacao.energia / 2));

    const novaListaDeRelacionamentos = novosRelacionamentos.map(relacao =>
        (relacao.nomePersonagem1 === personagem1Copiado.nome && relacao.nomePersonagem2 === personagem2Copiado.nome) ||
        (relacao.nomePersonagem2 === personagem1Copiado.nome && relacao.nomePersonagem1 === personagem2Copiado.nome)
        ? novoRelacionamento : relacao
    );

    const tempoDeInteracaoTotal = (tempoDeInteracao * interacao.energia)

    const personagem1ComTempoDeVidaAtualizado = updateTempoDeVida(personagem1ComNovaEnergia, - tempoDeInteracaoTotal)
    const personagem2ComTempoDeVidaAtualizado = updateTempoDeVida(personagem2ComNovaEnergia, - tempoDeInteracaoTotal)


    return [[novoRelacionamento, novaListaDeRelacionamentos, personagem1ComTempoDeVidaAtualizado, personagem2ComTempoDeVidaAtualizado], tempoDeInteracaoTotal];
}

function retornarNivelRelacionamento(pontosDeRelacionamentoAtualizados) {
    const NEUTRO_MIN = 0
    const NEUTRO_MAX = 10
    const AMIZADE_MAX = 25

    if (pontosDeRelacionamentoAtualizados < NEUTRO_MIN) {
        return ['NEUTRO', 'INIMIZADE'];
    } else if (pontosDeRelacionamentoAtualizados > NEUTRO_MAX && pontosDeRelacionamentoAtualizados <= AMIZADE_MAX) {
        return ['NEUTRO', 'AMIZADE'];
    } else if (pontosDeRelacionamentoAtualizados > AMIZADE_MAX) {
        return ['NEUTRO', 'AMIZADE', 'AMOR'];
    }
    return ['NEUTRO'];
}

function interagir(relacionamentoEncontrado, interacao) {
    const pontosDeRelacionamentoAtualizados = relacionamentoEncontrado.ptRelacionamento + interacao.pontos;
    const novosNiveis = retornarNivelRelacionamento(pontosDeRelacionamentoAtualizados);

    return { 
        ...relacionamentoEncontrado, 
        ptRelacionamento: pontosDeRelacionamentoAtualizados, 
        tipoRelacionamento: novosNiveis  
    };
}

export function buscarRelacionamento(personagem1, personagem2, relacionamentos) {
    const relacionamentoEncontrado = relacionamentos.find(relacionamento => 
        (relacionamento.nomePersonagem1 == personagem1.nome && relacionamento.nomePersonagem2 == personagem2.nome) || 
        (relacionamento.nomePersonagem2 == personagem1.nome && relacionamento.nomePersonagem1 == personagem2.nome) 
    );

    if (!relacionamentoEncontrado) {
        const ptRelacaoInicial = 0
        const relacionamentoCriado = {
            nomePersonagem1: personagem1.nome,
            nomePersonagem2: personagem2.nome,
            ptRelacionamento: ptRelacaoInicial,
            tipoRelacionamento: ['NEUTRO']
        };
        
        return [relacionamentoCriado, [...relacionamentos, relacionamentoCriado]];
    }

    return [relacionamentoEncontrado, relacionamentos];
}

export async function treinarHabilidade(personagem, habilidadeTreinada) {
    if (personagem.energia < 4){        
        console.clear()
        console.log('Energia insuficiente')
        return 
    }

    if(!habilidadeTreinada){
        console.clear()
        console.log('Habilidade não encontrada')
        return 
    }
    
    const tempoGasto = 8000

    const bonusAspiracao = (personagem.aspiracao === habilidadeTreinada) ? 1 : 0
        
    const bonusItem = await getPontuacaoItem(personagem, habilidadeTreinada)
                
    const valorDeAprendizado = bonusAspiracao + bonusItem
                
    const personagemComHabilidadeAtualizada = updateHabilidade(personagem, habilidadeTreinada, valorDeAprendizado)
    const personagemComEnergiaAtualizada = updateEnergia(personagemComHabilidadeAtualizada , -4)
    const personagemComHigieneAtualizada = updateHigiene (personagemComEnergiaAtualizada, -2)

    const personagemComTempoDeVidaAtualizado = updateTempoDeVida(personagemComHigieneAtualizada, -tempoGasto)    

    return personagemComTempoDeVidaAtualizado
}

async function getPontuacaoItem(personagem, habilidadeTreinada) {
    const response = await axios.get('https://emilyspecht.github.io/the-cresim/itens-habilidades.json')
    const itensHabilidades = response.data

    const catalogoCategoria = itensHabilidades[habilidadeTreinada]

    const itensInventarioCategoria = catalogoCategoria.filter(itemCatalog =>
        personagem.itensComprados.includes(itemCatalog.nome)
    );

    if (itensInventarioCategoria.length === 0) {
        return 0;
    }

    const itensOrdenadosDecrescente = itensInventarioCategoria.slice().sort((a, b) => b.pontos - a.pontos);

    const itemComMaisPontos = itensOrdenadosDecrescente[0];

    return itemComMaisPontos.pontos
}

export async function comprarItem(personagem, nomeDoItem, listaDeItens) {
    const itemEncontrado = Object.values(listaDeItens).reduce((acc, categoria) => {
        return categoria.find(i => i.nome.toLowerCase() === nomeDoItem.toLowerCase()) || acc;
    }, null);

    if (!itemEncontrado) {
        console.log(`Item ${nomeDoItem} não encontrado.`);
        return personagem;
    }

    if (personagem.itensComprados.includes(nomeDoItem)) {
        console.log("Personagem já possui este item.");
        return personagem;
    }

    if (personagem.dinheiro < itemEncontrado.preco) {
        console.log("Dinheiro insuficiente para comprar o item.");
        return personagem;
    }

    const personagemAtualizado = updateDinheiro(personagem, -itemEncontrado.preco);
    const novoItensComprados = [...personagemAtualizado.itensComprados, nomeDoItem];
    const personagemComItem = {
        ...personagemAtualizado,
        itensComprados: novoItensComprados
    };

    console.log(`Item ${nomeDoItem} comprado com sucesso!`);
    return personagemComItem;
}
  
    
