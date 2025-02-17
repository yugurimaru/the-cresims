export function updateHigiene (personagem, valor) {
	const higiene = Math.min(personagem.higiene + valor, 28)
	const novaHigiene = Math.max(higiene, 0)

    const personagemCopia = copiarPersonagem(personagem)

    return {
        ...personagemCopia, 
        higiene: novaHigiene
    }
}

export function updateHabilidade(personagem, tipoHabilidade, valor){
    
    const habilidadesAtualizadas = personagem.habilidades.map(habilidade =>
        habilidade.nome === tipoHabilidade
            ? { ...habilidade, pontos: habilidade.pontos + valor }
            : habilidade
    )

    const personagemCopia = copiarPersonagem(personagem)

	const personagemComHabilidadeAtualizada = {
        ...personagemCopia, 
        habilidades: habilidadesAtualizadas
    }
	
    return updateNivelCarreira(personagemComHabilidadeAtualizada)
}

function updateNivelCarreira (personagem){
    const PLENO = 17
    const SENIOR = 27

    const personagemCopia = copiarPersonagem(personagem)

    const habilidadesAtualizadas = personagem.habilidades.map((habilidade) => {
        if (habilidade.pontos >= SENIOR){
            return {...habilidade,
                nivel: 'SENIOR'
            }
        }else if (habilidade.pontos >= PLENO) {
            return {...habilidade,
                nivel: 'PLENO'
            }
        }else {
            return {...habilidade,
                nivel: 'JUNIOR'
            }
        }
    })

    return {
        ...personagemCopia,
        habilidades: habilidadesAtualizadas
    }
}

export function updateEnergia(personagem, valor){
	const energia = Math.min(personagem.energia + valor, 32)
	const novaEnergia = Math.max(energia, 0)

    const personagemCopia = copiarPersonagem(personagem)

    return {
        ...personagemCopia, 
        energia: novaEnergia
    }
}

export function updateTempoDeVida (personagem, valor) {
    const novoTempoDeVida = Math.max(personagem.tempoDeVida + valor, 0)

    const personagemCopia = copiarPersonagem(personagem)

    return {
        ...personagemCopia, 
        tempoDeVida: novoTempoDeVida
    }
}

export function updateDinheiro (personagem, valor){
    const dinheiroCalculado = personagem.dinheiro + valor
    const novoDinheiro = Math.max(dinheiroCalculado, 0)

    const personagemCopia = copiarPersonagem(personagem)

    return {
        ...personagemCopia,
        dinheiro: novoDinheiro
    }
}

export function copiarPersonagem(personagem){
    const copiaPersonagem = {
        ...personagem,
        itensComprados: [...personagem.itensComprados],
        habilidades: personagem.habilidades.map(habilidade => ({ ...habilidade })) 
    };

    return copiaPersonagem
}

export function updateSalarios(personagem, valor) {
    const personagemAtualizado = {
        ...personagem,
        habilidades: personagem.habilidades.map(habilidade => ({
            ...habilidade,
            salario: habilidade.salario + (habilidade.salario * (valor / 100)) 
        }))
    };

    return personagemAtualizado;
}

export function setTempoDeVida(personagem, valor){ 
    const copiaPersonagem = copiarPersonagem(personagem)

    const personagemComNovoTempoDeVida = {...copiaPersonagem, tempoDeVida: valor}

    return personagemComNovoTempoDeVida
}
