const maxAttributeAtLevel1 = 7;
let characterLevel = 1;
let availablePoints = 0;
let radarChart;
let maxScale = 10;
let isUpdating = false; //Verificação de atualizações
let selectedRace = '';

let attributes = {
    'For': 0,
    'Con': 0,
    'Des': 0,
    'Int': 0,
    'Sab': 0,
    'Car': 0
};

// Definição dos bônus raciais
const racialBonuses = {
    'Orc': { 'For': 2, 'Con': 1 },
    'Elfo': { 'Des': 2, 'Int': 1 },
    'Anão': { 'Con': 2, 'Sab': 1 },
    'Halfling': { 'Car': 2, 'Des': 1 },
    'Draconato': { 'For': 2, 'Car': 1 },
    'Gnomo': { 'Int': 2, 'Sab': 1 },
    'Humano': {} 
};

function theIndomitableHumanSpirit() {
    if (selectedRace === 'Humano') { // Usar '===' é uma boa prática
        availablePoints = 22;
    }
    else{
        availablePoints = 20;
    }
}

//Função para incrementar o atributo
function increment(attr) {
    if (isUpdating) return;
    
    const baseValue = attributes[attr] - (racialBonusValues[attr] || 0);
    
    if (availablePoints <= 0) {
        showMessage("Você não tem pontos disponíveis!");
        return;
    }
    
    const currentMax = characterLevel > 1 ? maxScale : maxAttributeAtLevel1;
    if (baseValue >= currentMax) {
        showMessage(`Atributo base não pode ser maior que ${currentMax} no nível atual!`);
        return;
    }
    
    isUpdating = true;
    attributes[attr]++;
    availablePoints--;
    
    requestAnimationFrame(() => {
        radarChart.data.datasets[0].data = Object.values(attributes);
        radarChart.update();
        updatePointsDisplay();
        isUpdating = false;
        
        // Chama a função de atualização de status secundários se for nível > 1
        if (characterLevel > 1) {
            levelupSecondaryStats(attr);
        } else {
            // Se for nível 1, usa o cálculo base
            updateSecondaryStats();
        }
    });
}

function incrementLevel() {
    if (availablePoints > 0) {
        showMessage(`Você ainda tem ${availablePoints} ponto(s) para distribuir antes de subir de nível!`);
        return;
    }
    // Incrementa o nível
    characterLevel++;
    
    // Adiciona 2 pontos para cada nível acima de 1
    const additionalPoints = 2;
    availablePoints += additionalPoints;
    
    // Atualiza os displays
    document.getElementById('char-level-display').textContent = characterLevel;
    updatePointsDisplay();
    
    // Verifica o maior valor de atributo atual
    const maxAttributeValue = Math.max(...Object.values(attributes));
    
    // Define os intervalos de aumento do gráfico
    const scaleThresholds = [10, 15, 20, 25]; // Podemos adicionar mais níveis se necessário
    let newMaxScale = 10; // Valor padrão
    
    // Determina o novo máximo com base nos thresholds
    for (let i = scaleThresholds.length - 1; i >= 0; i--) {
        if (maxAttributeValue >= scaleThresholds[i]) {
            newMaxScale = scaleThresholds[i] + 5;
            break;
        }
    }
    
    // Se o valor máximo atual for menor que 10, mantém 10
    if (maxAttributeValue < 10) {
        newMaxScale = 10;
    }
    
    // Aplica a nova escala apenas se for diferente da atual
    if (newMaxScale !== maxScale) {
        maxScale = newMaxScale;
        radarChart.options.scales.r.suggestedMax = maxScale;
        
        // Adiciona efeito visual de transição
        radarChart.options.animation = {
            duration: 1000,
            easing: 'easeOutQuart'
        };
    }
    
    // Atualiza o gráfico
    radarChart.update();
    // Mostra mensagem de confirmação
    showMessage(`Nível aumentado para ${characterLevel}! +${additionalPoints} pontos adicionados.`);
    // Atualiza os status secundários
    updateStatsOnAttributeChange('level');
}

function updateSecondaryStats() {
    // Só calcula se estiver no nível 1 e sem pontos
    if (characterLevel !== 1 || availablePoints > 0) return;

    // Calcula os valores
    const forca = attributes['For'] || 0;
    const constituicao = attributes['Con'] || 0;
    const inteligencia = attributes['Int'] || 0;
    const sabedoria = attributes['Sab'] || 0;
    const destreza = attributes['Des'] || 0;

    const healthPoints = 10 + 2 * (forca + constituicao);
    const manaPoints = 10 + 2 * (inteligencia + sabedoria);
    const dodge = 12 + destreza;
    const determination = 12 + Math.max(sabedoria, inteligencia);

    // Atualiza a UI
    document.getElementById('pv-total').textContent = healthPoints;
    document.getElementById('pm-total').textContent = manaPoints;   
    document.getElementById('esquiva').textContent = `Esquiva: ${dodge}`;
    document.getElementById('determinacao').textContent = `Determinação: ${determination}`;
}


function levelupSecondaryStats(changedAttribute) {
    // Obtém os valores atuais dos elementos da UI
    let healthPoints = parseInt(document.getElementById('pv-total').textContent) || 10;
    let manaPoints = parseInt(document.getElementById('pm-total').textContent) || 10;
    let dodge = parseInt(document.getElementById('esquiva').textContent.replace('Esquiva: ', '')) || 12;
    let determination = parseInt(document.getElementById('determinacao').textContent.replace('Determinação: ', '')) || 12;

    // Aplica os bônus conforme o atributo modificado
    switch(changedAttribute) {
        case 'Con':
            healthPoints += 4; // +4 HP por ponto em Constituição
            break;
            
        case 'Int':
        case 'Sab':
            manaPoints += 6; // +6 MP por ponto em Inteligência ou Sabedoria
            determination += 1; // +1 Determinação também
            break;
            
        case 'Des':
            dodge += 1; // +1 Esquiva por ponto em Destreza
            break;
            
        // Força e Carisma não afetam esses status secundários
    }

    // Atualiza a UI
    document.getElementById('pv-total').textContent = healthPoints;
    document.getElementById('pm-total').textContent = manaPoints;
    document.getElementById('esquiva').textContent = `Esquiva: ${dodge}`;
    document.getElementById('determinacao').textContent = `Determinação: ${determination}`;
}

//Função para enviar uma mensagem que não pode upar
function showMessage(message) {
    const messageElement = document.getElementById('message-display');
    messageElement.textContent = message;
    messageElement.style.opacity = 1;
    
    setTimeout(() => {
        messageElement.style.opacity = 0;
    }, 3000);
}

//Atualizar pontos no display
function updatePointsDisplay() {
    document.getElementById('char-points-display').textContent = availablePoints;
    
    radarChart.options.scales.r.pointLabels.callback = function(value) {
        return `${value} ${attributes[value]}`;
    };
    radarChart.update();
}

// Funções de bônus raciais
function applyRacialBonuses(race) {
    if (!racialBonuses[race]) return;
    

    racialBonusValues = {}; // Reseta os bônus anteriores
    const bonuses = racialBonuses[race];
    
    for (const attribute in bonuses) {
        if (attributes.hasOwnProperty(attribute)) {
            racialBonusValues[attribute] = bonuses[attribute]; // Armazena o valor do bônus
            attributes[attribute] += bonuses[attribute];
            if (attributes[attribute] > maxAttributeAtLevel1) {
                attributes[attribute] = maxAttributeAtLevel1;
            }
        }
    }
    updateChart();
    highlightBonuses(bonuses);
}

function highlightBonuses(bonuses) {
    const attributeKeys = Object.keys(bonuses);
    attributeKeys.forEach(attr => {
        const label = document.querySelector(`[data-attribute="${attr}"]`);
        if (label) {
            label.classList.add('attribute-bonus');
            setTimeout(() => {
                label.classList.remove('attribute-bonus');
            }, 3000);
        }
    });
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    
    //Função de subir de nível
    document.querySelector('.meu-icone').addEventListener('click', incrementLevel);

    // Formulário de criação de personagem
    document.getElementById('character-form').addEventListener('submit', function(e) {
        e.preventDefault();

    const charName = document.getElementById('char-name').value;
    const playerName = document.getElementById('player-name').value;
    const charRace = document.getElementById('char-race').value;

    selectedRace = charRace; 
    theIndomitableHumanSpirit();

    racialBonusValues = {};

    
    document.getElementById('character-name').textContent = charName;
    document.getElementById('player-name-display').textContent = playerName;
    document.getElementById('char-race-display').textContent = charRace;
    document.getElementById('char-level-display').textContent = '1';
    document.getElementById('char-points-display').textContent = availablePoints;

    document.getElementById('character-modal').style.display = 'none';
        createRadarChart();
        updatePointsDisplay();
    });
    
    // Upload de imagem
    document.getElementById('character-image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('character-profile').style.backgroundImage = `url(${event.target.result})`;
                document.getElementById('upload-label').style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // Botão Iniciar
    document.getElementById('Iniciar').addEventListener('click', function() {
        const selectedRace = document.getElementById('char-race').value;
        if (selectedRace) {
            theIndomitableHumanSpirit();
            applyRacialBonuses(selectedRace);
        }
    });

    // Inicializa o gráfico
    createRadarChart();
    updateSecondaryStats();
});