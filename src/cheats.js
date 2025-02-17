import { 
    updateEnergia, 
    updateTempoDeVida, 
    updateSalarios,
    setTempoDeVida,
    updateHabilidade
} from "./funcoes-menores-globais"

import axios from 'axios';

export async function ativaCheat(cheat, personagemEscolhido, habilidadeEscolhida = null) {
    const CHEATS = await axios.get("https://emilyspecht.github.io/the-cresim/cheats.json");

    const listaDeCheats = CHEATS.data;

    const cheatsDeAcoes = {
        "SORTENAVIDA": updateSalarios,
        "DEITADONAREDE": updateEnergia,
        "JUNIM": updateHabilidade, 
        "CAROLINAS": updateTempoDeVida,
        "SINUSITE": setTempoDeVida
    };

    const cheatEscolhido = verificaCheat(cheat, listaDeCheats);
    
    if (cheatEscolhido) {
        // Caso houvesse mais cheats que demandassem mais de dois argumentos poderia ser feita uma outra lista de cheatsDeAcoes 
        if (cheatEscolhido.codigo === "JUNIM" && habilidadeEscolhida) {
            const personagemComCheatJunim = cheatsDeAcoes[cheatEscolhido.codigo](personagemEscolhido, habilidadeEscolhida, cheatEscolhido.valor);
            return [personagemComCheatJunim, true];
        }
            
        const personagemComCheat = cheatsDeAcoes[cheatEscolhido.codigo](personagemEscolhido, cheatEscolhido.valor);
        

        return [personagemComCheat, true];
    }

    return [personagemEscolhido, false];
}

function verificaCheat(cheatEscolhido, listaDeCheats){
    const cheatEncontrado = listaDeCheats.find((cheat)=> cheat.codigo == cheatEscolhido) 
    return cheatEncontrado
}

export function isCheatJunim(cheat){
    return cheat == "JUNIM" 
}