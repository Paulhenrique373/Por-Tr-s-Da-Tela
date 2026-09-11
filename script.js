/* ============================================
   POR TRÁS DA TELA — SCRIPT COMPLETO v4
   ============================================ */

// ============================================
// AUDIO SINTETIZADO (Web Audio API com Controle de Volume)
// ============================================
const SynthAudio = {
    ctx: null,
    musicInterval: null,
    initialized: false,

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.initialized = true;
    },

    getVolumeMultiplier() {
        return (settings.volume / 100);
    },

    playTone(freq, type, duration, volume, isMusic = false) {
        if (isMusic && !settings.music) return;
        if (!isMusic && !settings.sfx) return;
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = type;
            osc.frequency.value = freq;
            
            const finalVol = Math.max(0.0001, volume * this.getVolumeMultiplier());
            gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Áudio indisponível.", e);
        }
    },

    playSFX(type) {
        if (!settings.sfx) return;
        this.init();
        if (type === 'click') {
            this.playTone(600, 'sine', 0.08, 0.1);
        } else if (type === 'notif') {
            this.playTone(523.25, 'sine', 0.12, 0.12);
            setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 80);
        } else if (type === 'achievement') {
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'triangle', 0.3, 0.12), idx * 90);
            });
        } else if (type === 'chapter') {
            this.playTone(110, 'sawtooth', 0.6, 0.15);
            setTimeout(() => this.playTone(220, 'sine', 0.8, 0.1), 180);
        }
    },

    startAmbientMusic() {
        if (!settings.music) return;
        this.init();
        this.stopMusic();
        
        let beat = 0;
        const melody = [146.83, 164.81, 196.00, 220.00, 196.00, 164.81];
        
        this.musicInterval = setInterval(() => {
            if (!settings.music) return;
            this.playTone(melody[beat % melody.length] / 2, 'sine', 1.5, 0.04, true);
            beat++;
        }, 2000);
    },

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
};

// ============================================
// ESTADO GLOBAL DO JOGO
// ============================================
const gameState = {
    playerName: 'Alex',
    playerAvatar: '🧑',
    playerPronoun: 'neutro',
    chapter: 1,
    scene: 0,
    security: 50,
    empathy: 50,
    courage: 50,
    trust: 50,
    choices: [],
    achievements: [],
    choiceFlags: {},
    relationships: {
        rafael: 50,
        bia: 60,
        lucas: 50
    },
    evidence: [],
    actionStats: {
        reports: 0,
        peopleHelped: 0,
        evidenceFound: 0,
        contentNotShared: 0
    },
    gamesPlayed: 0,
    hasPlayed: false,
    lastEnding: null,
    chatRepliesUsed: {},
    endingsUnlocked: [],
    postsMade: {}
};

// ============================================
// CONFIGURAÇÕES
// ============================================
const settings = {
    music: true,
    sfx: true,
    volume: 50,
    animations: true,
    textSpeed: 'normal',
    reducedMotion: false,   // v2.0: acessibilidade — reduz/some com animações não essenciais
    highContrast: false,    // v2.0: acessibilidade — aumenta contraste de texto e bordas
    textSize: 'normal'      // v2.0: acessibilidade — 'normal' | 'large' | 'xlarge'
};

// ============================================
// FUNÇÕES UTILITÁRIAS DE TELA E NAVEGAÇÃO
// ============================================
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        if (id === 'menu-screen') {
            SynthAudio.stopMusic();
            updateMenuStats();
        }
    } else {
        console.error(`Tela #${id} não encontrada.`);
    }
}

let pendingAction = null;
let confirmHandlers = { accept: null, cancel: null };

function showConfirm(title, text, onAccept) {
    if (DOM['confirm-title']) DOM['confirm-title'].textContent = title;
    if (DOM['confirm-text']) DOM['confirm-text'].textContent = text;
    if (DOM['confirm-modal']) DOM['confirm-modal'].style.display = 'flex';

    if (confirmHandlers.accept) DOM['confirm-accept'].removeEventListener('click', confirmHandlers.accept);
    if (confirmHandlers.cancel) DOM['confirm-cancel'].removeEventListener('click', confirmHandlers.cancel);

    confirmHandlers.accept = () => {
        if (DOM['confirm-modal']) DOM['confirm-modal'].style.display = 'none';
        onAccept();
    };
    confirmHandlers.cancel = () => {
        if (DOM['confirm-modal']) DOM['confirm-modal'].style.display = 'none';
    };

    if (DOM['confirm-accept']) DOM['confirm-accept'].addEventListener('click', confirmHandlers.accept);
    if (DOM['confirm-cancel']) DOM['confirm-cancel'].addEventListener('click', confirmHandlers.cancel);

    // Acessibilidade: leva o foco do teclado para o botão de cancelar (ação mais segura) ao abrir
    if (DOM['confirm-cancel']) DOM['confirm-cancel'].focus();
}

function getCurrentChapter() {
    return chapters.find(c => c.id === gameState.chapter);
}

function getCurrentScene() {
    const chapter = getCurrentChapter();
    return chapter ? (chapter.scenes[gameState.scene] || null) : null;
}

function getPronounText(masc, fem, neutro) {
    if (gameState.playerPronoun === 'masculino') return masc;
    if (gameState.playerPronoun === 'feminino') return fem;
    return neutro;
}

// ============================================
// PERSONAGENS E EXPRESSÕES
// ============================================
const CHARACTERS = {
    narrator: {
        name: 'Narrador',
        avatar: '📖',
        nameClass: 'narrator',
        expressions: { normal: '📖' }
    },
    player: {
        get name() { return gameState.playerName || 'Alex'; },
        get avatar() { return gameState.playerAvatar || '🧑'; },
        nameClass: 'player',
        expressions: { 
            get normal() { return gameState.playerAvatar || '🧑'; }, 
            worried: '😟', determined: '😤', happy: '😊' 
        }
    },
    rafael: {
        name: 'Rafael',
        avatar: '😔',
        nameClass: '',
        expressions: {
            normal: '😐', sad: '😢', worried: '😟', scared: '😨',
            happy: '😊', relieved: '😌', angry: '😠', default: '😔'
        }
    },
    bia: {
        name: 'Bia',
        avatar: '😊',
        nameClass: '',
        expressions: {
            normal: '😊', worried: '😟', happy: '😄', sad: '😢',
            determined: '😤', relieved: '😌', default: '😊'
        }
    },
    lucas: {
        name: 'Lucas',
        avatar: '😎',
        nameClass: '',
        expressions: {
            normal: '😎', angry: '😠', worried: '😟', guilty: '😬',
            defensive: '🙄', default: '😎'
        }
    },
    ana: {
        name: 'Professora Ana',
        avatar: '👩‍🏫',
        nameClass: '',
        expressions: {
            normal: '👩‍🏫', worried: '😟', happy: '😊', serious: '😐',
            relieved: '😌', default: '👩‍🏫'
        }
    }
};

// ============================================
// CONQUISTAS (NORMAIS + SECRETAS)
// ============================================
const ACHIEVEMENTS = {
    guardian: { id: 'guardian', icon: '🛡️', name: 'Guardião Digital', desc: 'Tomou decisões seguras em todas as situações.', secret: false },
    empath: { id: 'empath', icon: '💜', name: 'Grande Aliado', desc: 'Apoiou todos os personagens que precisaram de ajuda.', secret: false },
    reporter: { id: 'reporter', icon: '🚨', name: 'Voz Ativa', desc: 'Denunciou perfis ou imagens falsas.', secret: false },
    witness: { id: 'witness', icon: '👀', name: 'Testemunha Atenta', desc: 'Identificou os ataques de cyberbullying de imediato.', secret: false },
    secondChance: { id: 'secondChance', icon: '🔄', name: 'Segunda Chance', desc: 'Jogou novamente buscando mudar o rumo das escolhas.', secret: false },
    brave: { id: 'brave', icon: '🦁', name: 'Corajoso', desc: 'Defendeu Rafael publicamente e de forma responsável.', secret: false },
    investigator: { id: 'investigator', icon: '🔎', name: 'Perito Digital', desc: 'Encontrou todas as evidências cruciais do caso.', secret: false },
    trueFriend: { id: 'trueFriend', icon: '🤝', name: 'Amigo de Verdade', desc: 'Conquistou a confiança total do Rafael.', secret: false },
    // Conquistas Secretas
    detetivePerfeito: { id: 'detetivePerfeito', icon: '🕵️‍♂️', name: 'Detetive Perfeito', desc: 'Encontrou todas as pistas sem cair em nenhuma pista falsa.', secret: true },
    influenciadorPositivo: { id: 'influenciadorPositivo', icon: '⭐', name: 'Influenciador Positivo', desc: 'Alcançou 100 de empatia e confiança na mesma partida.', secret: true },
    diplomata: { id: 'diplomata', icon: '🕊️', name: 'Diplomata Digital', desc: 'Manteve relacionamentos altos com Rafael, Bia E Lucas.', secret: true },
    // Novas conquistas v2.0
    firstStep: { id: 'firstStep', icon: '🥇', name: 'Primeiro Passo', desc: 'Completou o primeiro capítulo da história.', secret: false },
    redeDeApoio: { id: 'redeDeApoio', icon: '📞', name: 'Rede de Apoio', desc: 'Utilizou um canal de ajuda ou denunciou conteúdo dentro do jogo.', secret: false },
    tudoTemConsequencia: { id: 'tudoTemConsequencia', icon: '⚠️', name: 'Tudo Tem Consequência', desc: 'Desbloqueou um final negativo e viu no que a omissão ou a cumplicidade dão.', secret: false },
    todosOsCaminhos: { id: 'todosOsCaminhos', icon: '🗺️', name: 'Todos os Caminhos', desc: 'Desbloqueou os 6 finais possíveis da história.', secret: true }
};

// ============================================
// CATALOGO DE EVIDÊNCIAS
// ============================================
const EVIDENCE_CATALOG = {
    msg_screenshot: { id: 'msg_screenshot', icon: '📸', name: 'Print das mensagens ofensivas do grupo', chapter: 1 },
    fake_profile_print: { id: 'fake_profile_print', icon: '👤', name: 'Print do perfil falso @rafael_ridiculo', chapter: 2 },
    fake_profile_url: { id: 'fake_profile_url', icon: '🔗', name: 'Link definitivo do perfil falso', chapter: 2 },
    group_screenshot: { id: 'group_screenshot', icon: '👥', name: 'Print do grupo de exclusão "SEM O RAFAEL"', chapter: 3 },
    group_members: { id: 'group_members', icon: '📋', name: 'Lista de participantes do grupo de exclusão', chapter: 3 },
    image_senders: { id: 'image_senders', icon: '📩', name: 'Print do remetente da foto vazada', chapter: 4 },
    timeline: { id: 'timeline', icon: '🕐', name: 'Linha temporal de postagem das ofensas', chapter: 4 },
    bia_testimony: { id: 'bia_testimony', icon: '💬', name: 'Declaração formal de Bia à escola', chapter: 4 }
};

// ============================================
// HISTÓRIA COMPLETA — 5 CAPÍTULOS REESCRITOS E DINÂMICOS
// ============================================
const chapters = [
    // --- CAPÍTULO 1 ---
    {
        id: 1,
        title: "A Primeira Mensagem",
        desc: "Você presencia uma mensagem ofensiva direcionada a um colega no grupo da turma. Como vai reagir?",
        scenes: [
            {
                type: 'narrative',
                visual: '🏫', location: 'Pátio da escola — Segunda-feira',
                character: 'narrator', expression: 'normal',
                text: () => `Segunda-feira de manhã na Escola Estadual Heitor Vila-Lobos. O sinal do intervalo acaba de tocar. Enquanto você, ${gameState.playerName}, se senta nas arquibancadas do pátio, seu celular vibra repetidamente no bolso.\n\nO grupo principal da sua turma está movimentado.`,
                choices: [{ text: 'Verificar notificações', next: 1 }]
            },
            {
                type: 'narrative',
                visual: '😊', location: 'Pátio da escola',
                character: 'bia', expression: 'worried',
                text: () => `"Ei, ${gameState.playerName}, você viu o celular?" Bia se aproxima correndo, a testa franzida em preocupação. "A galera tá com os celulares ligados desde a aula de Geografia. Tá rolando uma palhaçada muito errada no grupo..."`,
                choices: [
                    { text: '"O que estão fazendo lá?"', next: 2, relEffects: { bia: 5 } },
                    { text: 'Apenas puxar o celular e ler', next: 2 }
                ]
            },
            {
                type: 'phone', phoneType: 'chat',
                appName: '💬 Grupo — 9º Ano B',
                messages: [
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Kkkkk alguém viu a foto do Rafael na educação física? Que mico', time: '10:02' },
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Ele parece um espantalho correndo, socorro 🤣', time: '10:03', offensive: true },
                    { avatar: '🤷', name: 'Fernanda_sz', text: 'Mano, ele não sabe nem segurar a bola de basquete...', time: '10:03' },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Vou lançar no Conecta pro colégio todo rir kkk', time: '10:04', offensive: true }
                ],
                afterText: 'Eles estão atacando Rafael, um garoto tímido que costuma desenhar no canto da sala. Alguém tirou uma foto dele caindo na quadra e começou a espalhar.',
                choices: [
                    {
                        letter: 'A', text: 'Entrar na onda: rir e pedir para ver a foto',
                        effects: { security: -15, empathy: -20, courage: -10, trust: -15 },
                        relEffects: { rafael: -15, bia: -15, lucas: 15 },
                        flag: 'ch1_joined_mockery',
                        tip: 'Compartilhar e pedir fotos de pessoas em situações ridicularizadoras incentiva quem iniciou a agressão e amplifica o dano psicológico na vítima.',
                        next: 3
                    },
                    {
                        letter: 'B', text: 'Fechar o aplicativo e ignorar a conversa',
                        effects: { security: 0, empathy: -5, courage: -5, trust: 0 },
                        relEffects: { bia: -5 },
                        flag: 'ch1_ignored',
                        tip: 'Ficar em silêncio quando alguém sofre opressão faz com que os agressores entendam que você concorda com eles, isolando ainda mais a vítima.',
                        next: 4
                    },
                    {
                        letter: 'C', text: 'Registrar um print da conversa como prova',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 5 },
                        relEffects: { bia: 10 },
                        flag: 'ch1_saved_evidence',
                        addEvidence: 'msg_screenshot',
                        decisionText: 'Você arquivou provas digitais do ataque inicial.',
                        next: 5
                    },
                    {
                        letter: 'D', text: 'Mandar mensagem no grupo exigindo respeito',
                        effects: { security: 5, empathy: 20, courage: 20, trust: 15 },
                        relEffects: { rafael: 15, bia: 15, lucas: -10 },
                        flag: 'ch1_spoke_up',
                        decisionText: 'Você confrontou a zombaria digital no grupo da turma.',
                        next: 6
                    }
                ]
            },
            {
                type: 'narrative', visual: '😕',
                character: 'narrator', expression: 'normal',
                text: 'Seu riso incitou as mensagens seguintes. Rafael passou pelo corredor de cabeça baixa minutos depois, segurando as lágrimas. A zombaria se espalhou.',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '🤷',
                character: 'bia', expression: 'sad',
                text: '"Nossa... ninguém faz nada." Bia murmura, vendo Lucas digitar furiosamente. Você guardou o celular, mas a sensação de que algo ruim foi tolerado permanece.',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '📸',
                character: 'narrator', expression: 'normal',
                text: 'O print foi salvo no seu celular. Bia sorri de canto: "Boa. Esses posts costumam ser apagados rapidamente quando a escola descobre."',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '💬',
                character: 'player', expression: 'determined',
                text: () => `Sua mensagem fez o chat esfriar. Lucas respondeu: "Ah, ${gameState.playerName} virou fiscal de piada agora?". Mas Pedro parou de mandar emojis. Bia te manda mensagem: "Valeu por falar. Eu estava com medo de falar sozinha."`,
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 2 ---
    {
        id: 2,
        title: "O Perfil Falso",
        desc: "Um perfil anônimo surge no Conecta focado apenas em ridicularizar Rafael. Como agir?",
        scenes: [
            {
                type: 'narrative', visual: '👤', location: 'Quarto do jogador — Quarta-feira',
                character: 'narrator', expression: 'normal',
                text: 'Quarta-feira, 20:45. Você está terminando um trabalho quando um story marcado por colegas no Conecta chama sua atenção.\n\nUm perfil foi criado: @rafael_ridiculo. A foto de exibição é o rosto de Rafael montado no corpo de um burro.',
                choices: [{ text: 'Abrir o Conecta', next: 1 }]
            },
            {
                type: 'phone', phoneType: 'profile',
                profileData: {
                    avatar: '🤡', name: '@rafael_ridiculo',
                    bio: '"Fã clube oficial do moleque mais bizarro do colégio. Postamos suas maiores burrices diárias."\n47 seguidores · 3 posts humilhantes.',
                    isFake: true
                },
                afterText: 'O bullying virtual escalou para um espaço público. Colegas da turma estão comentando nas fotos.',
                choices: [
                    {
                        letter: 'A', text: 'Seguir o perfil falso e marcar amigos',
                        effects: { security: -10, empathy: -20, courage: -10, trust: -15 },
                        relEffects: { rafael: -20, lucas: 10 },
                        flag: 'ch2_followed_fake',
                        tip: 'Seguir e marcar conhecidos em perfis fakes aumenta o engajamento do algoritmo, ampliando o constrangimento e legitimando a agressão.',
                        next: 2
                    },
                    {
                        letter: 'B', text: 'Ignorar o perfil de calúnia',
                        effects: { security: 0, empathy: -5, courage: -5, trust: 0 },
                        flag: 'ch2_ignored_profile',
                        next: 3
                    },
                    {
                        letter: 'C', text: 'Tirar print e denunciar no aplicativo',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 10 },
                        flag: 'ch2_reported',
                        addEvidence: 'fake_profile_print',
                        actionStat: 'reports',
                        next: 4
                    },
                    {
                        letter: 'D', text: 'Copiar link, denunciar e avisar Rafael no privado',
                        effects: { security: 15, empathy: 20, courage: 15, trust: 15 },
                        relEffects: { rafael: 20, bia: 5 },
                        flag: 'ch2_full_support',
                        addEvidence: 'fake_profile_print',
                        addEvidence2: 'fake_profile_url',
                        actionStat: 'reports',
                        next: 5
                    }
                ]
            },
            {
                type: 'narrative', visual: '📊',
                character: 'narrator', expression: 'normal',
                text: 'Seu follow ajudou a elevar a conta. Outros alunos começaram a rir na seção de comentários. Rafael agora é assunto de sussurros nos armários.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🤐',
                character: 'narrator', expression: 'normal',
                text: 'Você optou por fechar o aplicativo. No dia seguinte, Rafael foi visto sozinho perto da sala dos professores com os olhos vermelhos.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🚨',
                character: 'narrator', expression: 'normal',
                text: 'Sua denúncia ajudou. O algoritmo enviou o perfil falso para revisão de conteúdo e ele caiu temporariamente nas horas seguintes.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🤝',
                character: 'rafael', expression: 'sad',
                text: () => `Rafael responde sua mensagem de forma tímida:\n\n"Oi, ${gameState.playerName}... vi sim. Eu nem queria ir amanhã para a aula. Mas obrigado por avisar e mandar os prints, ajuda saber que alguém não acha isso normal..."`,
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'investigation',
                desc: 'Clique em cada elemento do mural abaixo para identificar pistas sobre a autoria do perfil falso.',
                evidenceItems: [
                    { id: 'ev_post_time', icon: '🕐', label: 'Horários das postagens', detail: 'As fotos foram enviadas às 22h15 de quarta-feira. Lucas estava jogando e ativo no bate-papo de voz da turma nesse exato horário.' },
                    { id: 'ev_writing_style', icon: '✍️', label: 'Vícios linguísticos', detail: 'A bio usa gírias de games muito específicas e o termo "vlw flw", característico do jeito de digitar do Lucas.' },
                    { id: 'ev_followers', icon: '👥', label: 'Lista de contatos iniciais', detail: 'Os primeiros seguidores da página foram Pedro, Fernanda e o próprio perfil do Lucas.' },
                    { id: 'ev_photo_source', icon: '📸', label: 'Origem da imagem base', detail: 'A imagem original de Rafael na quadra foi tirada de um ângulo muito próximo de onde Lucas estava sentado.' },
                    { id: 'ev_false_lead', icon: '❓', label: 'Comentário do Pedro', detail: 'Pedro comentou "kkk quem fez isso é mestre", mas o IP de login do perfil não coincide com a casa dele. (PISTA FALSA)', isFalseLead: true }
                ],
                afterText: 'As evidências apontam fortemente para Lucas. Expor suspeitas públicas sem provas confiáveis também gera linchamento digital. Qual será sua conduta?',
                choices: [
                    {
                        letter: 'A', text: 'Confrontar Lucas no chat público do grupo de jogos',
                        effects: { security: -5, empathy: 5, courage: 10, trust: -10 },
                        relEffects: { lucas: -20, rafael: -5 },
                        flag: 'ch2_confronted_lucas',
                        tip: 'Acusações informais sem base consolidada dão espaço para que o agressor se faça de vítima, inflamando o conflito.',
                        next: 7
                    },
                    {
                        letter: 'B', text: 'Guardar e apresentar o relatório de prints à Professora Ana',
                        effects: { security: 20, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 10, bia: 10 },
                        flag: 'ch2_investigated_properly',
                        addEvidence: 'fake_profile_url',
                        actionStat: 'evidenceFound',
                        next: 8
                    }
                ]
            },
            {
                type: 'narrative', visual: '😠',
                character: 'lucas', expression: 'angry',
                text: '"Tá maluco?!" Lucas responde irado. "Só porque eu sigo quer dizer que fui eu? Não viaja!". A discussão deixou Lucas alerta e ele apagou vestígios.',
                choices: [{ text: 'Prosseguir na semana', goHub: true }]
            },
            {
                type: 'narrative', visual: '👩‍🏫',
                character: 'ana', expression: 'serious',
                text: () => `"Excelente iniciativa em documentar isso de maneira reservada, ${gameState.playerName}. Esse dossiê impede que neguem o ocorrido. Vou encaminhar à coordenação."`,
                choices: [{ text: 'Prosseguir na semana', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 3 ---
    {
        id: 3,
        title: "O Grupo de Exclusão",
        desc: "Você é arrastado para um chat clandestino criado especificamente para isolar Rafael.",
        scenes: [
            {
                type: 'reflection',
                question: 'Imagine que um grupo de colegas influentes da sua turma cria um chat secreto para decidir quem será banido das festas e trabalhos. Se você sair, pode virar o próximo alvo.\n\nQual decisão você costuma tomar diante de cenários de pressão social real?',
                reflectionChoices: [
                    'Permanecer calado para autopreservação',
                    'Sair do chat mesmo sob risco de retaliação',
                    'Ficar e contestar as atitudes ofensivas',
                    'Coletar as provas e denunciar aos responsáveis'
                ],
                feedback: 'A pressão de grupo é uma das maiores causas de negligência digital. Permanecer passivo legitima os agressores. Sair do grupo e reportar aos mentores escolares quebra o círculo vicioso do bullying sem colocar você em risco direto.',
                next: 1
            },
            {
                type: 'narrative', visual: '📱', location: 'Quarto do jogador — Sexta-feira à noite',
                character: 'narrator', expression: 'normal',
                text: 'Sexta-feira à noite. Você recebe um alerta vibratório de um aplicativo de mensagens:\n\n"Pedro.zz incluiu seu perfil no chat de conferência: BANDO DO 9B (Sem o Esquisito)"',
                choices: [{ text: 'Acessar o chat secreto', next: 2 }]
            },
            {
                type: 'phone', phoneType: 'chat',
                appName: '💬 BANDO DO 9B (Sem o Esquisito)',
                messages: [
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Esse grupo é pra marcar os trabalhos e o churrasco sem o Rafael ficar pedindo pra entrar', time: '19:15' },
                    { avatar: '🤷', name: 'Fernanda_sz', text: 'Perfeito, ele é bizarro d+', time: '19:16' },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Até que enfim espaço livre de gente chata', time: '19:16' },
                    { avatar: '😊', name: 'Bia_oficial', text: 'Gente, eu fui adicionada mas acho isso de exclusão muito infantil, na boa', time: '19:17' }
                ],
                afterText: 'O isolamento social sistemático é uma forma de violência psicológica. Há muita pressão para manter a panelinha coesa.',
                choices: [
                    {
                        letter: 'A', text: 'Concordar e ajudar a planejar o isolamento do Rafael',
                        effects: { security: -15, empathy: -25, courage: -10, trust: -20 },
                        relEffects: { rafael: -20, bia: -15, lucas: 15 },
                        flag: 'ch3_participated',
                        tip: 'Participar ativamente de projetos de isolamento de um aluno é assédio moral e pode gerar sansões escolares pesadas.',
                        next: 3
                    },
                    {
                        letter: 'B', text: 'Ficar no grupo para ler tudo, mas não interagir',
                        effects: { security: -5, empathy: -10, courage: -5, trust: -5 },
                        relEffects: { rafael: -10, bia: -5 },
                        flag: 'ch3_silent',
                        tip: 'Ser observador inerte em grupos de exclusão apenas garante aos agressores que eles têm sua aceitação velada.',
                        next: 4
                    },
                    {
                        letter: 'C', text: 'Sair do grupo imediatamente',
                        effects: { security: 10, empathy: 15, courage: 15, trust: 10 },
                        relEffects: { bia: 15 },
                        flag: 'ch3_left',
                        decisionText: 'Você rejeitou participar de um canal de isolamento escolar.',
                        actionStat: 'contentNotShared',
                        next: 5
                    },
                    {
                        letter: 'D', text: 'Registrar prints dos membros e relatar para a escola',
                        effects: { security: 15, empathy: 20, courage: 20, trust: 15 },
                        relEffects: { rafael: 15, bia: 15 },
                        flag: 'ch3_reported_adult',
                        addEvidence: 'group_screenshot',
                        addEvidence2: 'group_members',
                        decisionText: 'Você denunciou um complô de exclusão social sistemática.',
                        actionStat: 'reports',
                        next: 6
                    }
                ]
            },
            {
                type: 'narrative', visual: '😬',
                character: 'narrator', expression: 'normal',
                text: 'Sua conivência deu força à exclusão. Rafael foi deixado de fora do trabalho de História por todos e acabou realizando a atividade sozinho na biblioteca.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '😶',
                character: 'bia', expression: 'worried',
                text: () => `"Você viu como eles planejaram ignorar ele, ${gameState.playerName}? E ninguém diz nada naquele chat. É triste demais..."`,
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '🚪',
                character: 'bia', expression: 'relieved',
                text: 'Sua saída do grupo inspirou Bia a fazer o mesmo minutos depois. O bando perdeu duas testemunhas silenciosas de uma só vez.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '🏫',
                character: 'ana', expression: 'serious',
                text: 'Professora Ana acionou a coordenação imediatamente. "Esta organização secreta para isolar alunos é uma infração grave. Ter os prints dos membros nos poupa tempo."',
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 4 ---
    {
        id: 4,
        title: "A Imagem Vazada",
        desc: "Uma foto de caráter estritamente pessoal do Rafael cai nas redes sociais.",
        scenes: [
            {
                type: 'narrative', visual: '⚠️', location: 'Refeitório — Terça-feira',
                character: 'bia', expression: 'scared',
                text: () => `Terça-feira, hora do lanche. Bia puxa você para debaixo da escada. "${gameState.playerName}, é grave... muito grave. Conseguiram uma foto pessoal do Rafael de exame médico e estão encaminhando no Conecta..."`,
                choices: [{ text: 'Analisar notificações', next: 1 }]
            },
            {
                type: 'phone', phoneType: 'notifications',
                notifications: [
                    { icon: '💬', text: 'Lucas_gamer: "Olha a joia preciosa no refeitório" (Imagem)', time: 'Agora' },
                    { icon: '📩', text: 'Pedro.zz encaminhou um arquivo de imagem', time: '1 min' },
                    { icon: '🌐', text: 'Mencionaram você na publicação de vazamento no Conecta', time: '3 min' }
                ],
                afterText: 'O vazamento de fotos íntimas ou de privacidade sem consentimento é crime. O refeitório está em alvoroço.',
                choices: [
                    {
                        letter: 'A', text: 'Encaminhar o conteúdo para rir com contatos externos',
                        effects: { security: -20, empathy: -30, courage: -15, trust: -25 },
                        relEffects: { rafael: -30, bia: -20, lucas: 10 },
                        flag: 'ch4_shared_image',
                        tip: 'Repassar fotos íntimas, além de um dano irreversível para a vítima, torna você coautor de um crime passível de punição civil e penal.',
                        next: 2
                    },
                    {
                        letter: 'B', text: 'Manter a imagem salva no celular, sem compartilhar',
                        effects: { security: -5, empathy: -10, courage: 0, trust: -10 },
                        flag: 'ch4_kept_image',
                        actionStat: 'contentNotShared',
                        tip: 'Armazenar fotos íntimas de terceiros sem consentimento viola diretrizes de privacidade e termos éticos.',
                        next: 3
                    },
                    {
                        letter: 'C', text: 'Deletar a imagem recebida de forma imediata',
                        effects: { security: 10, empathy: 15, courage: 10, trust: 10 },
                        flag: 'ch4_deleted',
                        actionStat: 'contentNotShared',
                        next: 4
                    },
                    {
                        letter: 'D', text: 'Salvar apenas o remetente de envio e denunciar à direção',
                        effects: { security: 20, empathy: 20, courage: 20, trust: 20 },
                        relEffects: { rafael: 20, bia: 15 },
                        flag: 'ch4_full_response',
                        addEvidence: 'image_senders',
                        addEvidence2: 'timeline',
                        decisionText: 'Você acionou as lideranças contra o vazamento de mídia.',
                        actionStat: 'reports',
                        next: 5
                    }
                ]
            },
            {
                type: 'narrative', visual: '💔',
                character: 'narrator', expression: 'normal',
                text: 'Sua atitude de encaminhar fez com que o vazamento chegasse às escolas vizinhas. Rafael entrou em crise de pânico e não sairá mais de casa este semestre.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '😔',
                character: 'narrator', expression: 'normal',
                text: 'A foto permaneceu no seu dispositivo. Embora você não tenha encaminhado, sua omissão permitiu que o assédio moral continuasse desenfreado.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '🗑️',
                character: 'bia', expression: 'relieved',
                text: '"Você apagou né? Eu também deletei de imediato. Isso é nojento demais..." Bia balança a cabeça aliviada. É preciso que a escola entre em campo.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '✊',
                character: 'ana', expression: 'serious',
                text: 'Professora Ana aciona os pais de Lucas e Pedro na coordenação. "Com esses prints dos remetentes iniciais, temos material indiscutível para o Conselho Tutelar e a polícia de crimes digitais."',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 5 ---
    {
        id: 5,
        title: "A Decisão Final",
        desc: "Todas as suas escolhas ao longo da jornada ecoam nesta grande assembleia estudantil.",
        scenes: [
            {
                type: 'narrative', visual: '🌅', location: 'Auditório da Escola — Sexta-feira',
                character: 'narrator', expression: 'normal',
                text: 'Uma semana após a crise. A escola está reunida no auditório principal para discutir segurança digital, responsabilidade e empatia.\n\nRafael está presente na última fileira, ainda retraído. Ele avista você.',
                choices: [{ text: 'Ouvir conversa', next: 1 }]
            },
            {
                type: 'narrative', visual: '😔',
                character: 'rafael',
                expression: function() {
                    if (gameState.relationships.rafael >= 70) return 'happy';
                    if (gameState.relationships.rafael >= 45) return 'normal';
                    return 'scared';
                },
                text: function() {
                    const r = gameState.relationships.rafael;
                    const p = gameState.playerName;
                    if (r >= 70) {
                        return `"Ei, ${p}... eu queria agradecer de verdade. Quando toda aquela loucura começou, eu achei que ia ter que sair da escola. Mas você se importou de verdade em me ajudar..."`;
                    } else if (r >= 45) {
                        return `"Oi, ${p}... as coisas estão um pouco difíceis, mas fico aliviado que a professora interveio. Obrigado por não ter me atacado na internet..."`;
                    } else {
                        return '"..." Rafael desvia os olhos de forma amedrontada quando você tenta se aproximar. Ele não confia em ninguém da turma.';
                    }
                },
                choices: [{ text: 'Prestar atenção na assembleia', next: 2 }]
            },
            {
                type: 'narrative', visual: '😊',
                character: 'bia',
                expression: function() {
                    return gameState.relationships.bia >= 65 ? 'happy' : 'worried';
                },
                text: function() {
                    if (gameState.relationships.bia >= 65) {
                        return '"A diretora quer que algum aluno vá lá na frente dar o depoimento. Que bom que agimos juntos nisso. Vai lá e representa a gente!"';
                    } else {
                        return '"A diretora está chamando alguém para falar na tribuna. Todo mundo tá fingindo que não vê nada. O silêncio é doloroso..."';
                    }
                },
                choices: [{ text: 'Subir ao palco do auditório', next: 3 }]
            },
            {
                type: 'narrative', visual: '🎤', location: 'Tribuna do auditório',
                character: 'narrator', expression: 'normal',
                text: 'A diretora passa o microfone. A plateia de alunos está dispersa. Qual será sua atitude?',
                choices: [
                    {
                        letter: 'A', text: 'Não falar nada e devolver o microfone',
                        effects: { security: -5, empathy: -5, courage: -15, trust: -10 },
                        flag: 'ch5_stayed_silent',
                        next: 4
                    },
                    {
                        letter: 'B', text: 'Dar um depoimento firme em prol da empatia e apoio à vítima',
                        effects: { security: 10, empathy: 20, courage: 20, trust: 15 },
                        relEffects: { rafael: 15, bia: 15 },
                        flag: 'ch5_spoke_up',
                        decisionText: 'Você deu voz à defesa da empatia na escola.',
                        actionStat: 'peopleHelped',
                        next: 5
                    },
                    {
                        letter: 'C', text: 'Recusar o palco, mas sentar e apoiar o Rafael na plateia',
                        effects: { security: 5, empathy: 20, courage: 10, trust: 20 },
                        relEffects: { rafael: 20 },
                        flag: 'ch5_checked_rafael',
                        decisionText: 'Você ofereceu abrigo social à vítima de cyberbullying.',
                        actionStat: 'peopleHelped',
                        next: 6
                    },
                    {
                        letter: 'D', text: 'Entregar o relatório de provas e propor o canal anônimo',
                        effects: { security: 20, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 10, bia: 15 },
                        flag: 'ch5_full_action',
                        decisionText: 'Você formalizou diretrizes éticas contra abusos escolares.',
                        actionStat: 'reports',
                        next: 7
                    }
                ]
            },
            {
                type: 'narrative', visual: '🤐',
                character: 'narrator', expression: 'normal',
                text: 'Sua recusa em se expor fez o debate terminar em minutos, de forma apática. O cyberbullying continuou ocorrendo de forma mais oculta em outros aplicativos.',
                choices: [{ text: 'Ver Resultados', end: true }]
            },
            {
                type: 'narrative', visual: '🎤',
                character: 'player', expression: 'determined',
                text: '"Cyberbullying não é brincadeira. Quando rimos de fotos roubadas, criamos os monstros que nos atormentam amanhã. Nós somos responsáveis por quem é excluído nos chats..."\n\nSua fala arrancou palmas do pavilhão. Rafael sorri tímido pela primeira vez.',
                choices: [{ text: 'Ver Resultados', end: true }]
            },
            {
                type: 'narrative', visual: '💚',
                character: 'rafael', expression: 'relieved',
                text: 'Você caminha e se senta ao lado de Rafael. No início ele hesita, mas depois desabafa sobre tudo. Bia junta-se a vocês. Ali no auditório, longe das telas de ódio, um laço de amizade real começou a se reconstruir.',
                choices: [{ text: 'Ver Resultados', end: true }]
            },
            {
                type: 'narrative', visual: '🌟',
                character: 'narrator', expression: 'normal',
                text: 'Sua proposta de canal anônimo de denúncias foi aprovada e integrada à grade educacional. Os agressores agora pensam duas vezes antes de iniciar deboches digitais. Rafael finalmente respira aliviado.',
                choices: [{ text: 'Ver Resultados', end: true }]
            }
        ]
    }
];

// ============================================
// ELEMENTOS DO DOM (CACHE COMPLETO)
// ============================================
const DOM = {};
function cacheDom() {
    const ids = [
        'loading-screen','menu-screen','settings-screen','about-screen','achievements-screen','learn-screen','player-setup-screen',
        'game-screen','hub-screen','chapter-transition','result-screen','progress-screen','endings-screen',
        'loading-bar','loading-text','menu-stats',
        'btn-new-game','btn-continue','btn-achievements-menu','btn-progress-menu','btn-endings-menu','btn-progress-back','btn-endings-back',
        'progress-empty','progress-content','progress-action-stats','endings-grid','endings-progress-label',
        'pg-security','pg-empathy','pg-courage','pg-trust','pgv-security','pgv-empathy','pgv-courage','pgv-trust',
        'pgrel-rafael','pgrel-bia','pgrel-lucas','pgrelv-rafael','pgrelv-bia','pgrelv-lucas',
        'btn-learn-more','btn-settings','btn-about',
        'btn-settings-back','toggle-music','toggle-sfx','volume-slider','toggle-animations','text-speed','btn-clear-data',
        'toggle-reduced-motion','toggle-high-contrast','text-size',
        'btn-about-back','btn-achievements-back','btn-learn-back','btn-setup-back','btn-start-game',
        'input-player-name','avatar-grid',
        'achievements-grid',
        'btn-game-menu','chapter-indicator','chapter-title-header',
        'ms-security','ms-empathy','ms-courage','ms-trust',
        'narrative-container','scene-visual','scene-location','character-display','char-avatar-large','char-expression',
        'speaker-name','dialogue-text','dialogue-continue','choices-container',
        'phone-container','phone-screen','phone-time','phone-nav-bar','notif-badge',
        'investigation-container','investigation-desc','evidence-board','evidence-list','investigation-choices',
        'reflection-container','reflection-question','reflection-choices','reflection-feedback','reflection-tip-text','reflection-continue-btn',
        'game-sidebar','sidebar-overlay','btn-close-sidebar','sidebar-player-info','sidebar-avatar','sidebar-player-name',
        'sf-security','sf-empathy','sf-courage','sf-trust','sv-security','sv-empathy','sv-courage','sv-trust',
        'rel-rafael','rel-bia','rel-lucas','relv-rafael','relv-bia','relv-lucas',
        'sidebar-evidence','sidebar-achievements-list',
        'btn-save-game','btn-back-menu',
        'hub-completed','hub-phone-btn','hub-evidence-btn','hub-relationships-btn','hub-continue-btn','hub-next-chapter-desc','hub-phone-badge',
        'hub-phone-panel','hub-phone-content','hub-chat-panel','hub-chat-title','hub-chat-content','hub-chat-input-area',
        'hub-evidence-panel','hub-evidence-content','hub-relationships-panel','hub-relationships-content',
        'transition-chapter-num','transition-title','transition-desc',
        'tip-overlay','tip-text','btn-close-tip',
        'achievement-toast','ach-toast-icon','ach-toast-name',
        'stat-toast-container',
        'evidence-toast','evidence-toast-name',
        'rel-toast','rel-toast-avatar','rel-toast-text','share-toast',
        'result-emoji','result-header','result-title','result-subtitle',
        'certificate',
        'profile-badge-icon','profile-title','profile-desc',
        'rs-security','rs-empathy','rs-courage','rs-trust','rsv-security','rsv-empathy','rsv-courage','rsv-trust',
        'action-stats-grid',
        'result-decisions-list','result-achievements-list','result-message',
        'btn-play-again','btn-share-result','btn-result-menu',
        'confirm-modal','confirm-title','confirm-text','confirm-cancel','confirm-accept',
        'scene-image-container',
        'phone-nav-messages','phone-nav-conecta','phone-nav-notifications','phone-nav-evidence',
        'post-modal','post-options','btn-close-post-modal',
        'btn-export-save','btn-import-save','input-import-save','btn-download-cert',
        'connection-toast','connection-toast-text',
        'intro-cinematic-screen','intro-line','intro-title-wrap','btn-skip-intro',
        'report-modal','report-options','btn-close-report-modal'
    ];
    ids.forEach(id => { DOM[id] = document.getElementById(id); });
}

// ============================================
// SALVAMENTO NO LOCALSTORAGE
// ============================================
const SaveSystem = {
    KEY: 'por_tras_da_tela_save_v5',
    SKEY: 'por_tras_da_tela_settings_v5',
    VERSION: 2, // v2.0: incrementar sempre que a forma do save mudar. migrate() cuida de saves antigos.
    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify({
                saveVersion: this.VERSION,
                playerName: gameState.playerName,
                playerAvatar: gameState.playerAvatar,
                playerPronoun: gameState.playerPronoun,
                chapter: gameState.chapter, scene: gameState.scene,
                security: gameState.security, empathy: gameState.empathy,
                courage: gameState.courage, trust: gameState.trust,
                choices: gameState.choices, achievements: gameState.achievements,
                choiceFlags: gameState.choiceFlags,
                relationships: gameState.relationships,
                evidence: gameState.evidence,
                actionStats: gameState.actionStats,
                gamesPlayed: gameState.gamesPlayed,
                hasPlayed: gameState.hasPlayed, lastEnding: gameState.lastEnding,
                chatRepliesUsed: gameState.chatRepliesUsed,
                endingsUnlocked: gameState.endingsUnlocked,
                postsMade: gameState.postsMade,
                savedAt: Date.now()
            }));
            return true;
        } catch(e) { return false; }
    },
    load() {
        try {
            const r = localStorage.getItem(this.KEY);
            if (!r) return null;
            return this.migrate(JSON.parse(r));
        } catch(e) { return null; }
    },
    // Migra saves de versões anteriores em vez de descartá-los. Sempre devolve um
    // objeto com todos os campos que o jogo atual espera, preenchendo o que faltar.
    migrate(data) {
        if (!data || typeof data !== 'object') return null;
        const fromVersion = data.saveVersion || 1; // saves antigos (v1.x) não tinham saveVersion
        if (fromVersion < 2) {
            // v1 -> v2: campos novos que podem não existir em saves antigos
            if (!data.postsMade) data.postsMade = {};
            if (!data.endingsUnlocked) data.endingsUnlocked = [];
            if (!data.chatRepliesUsed) data.chatRepliesUsed = {};
            if (!data.actionStats) data.actionStats = { reports: 0, peopleHelped: 0, evidenceFound: 0, contentNotShared: 0 };
        }
        data.saveVersion = this.VERSION;
        return data;
    },
    hasSave() { return !!localStorage.getItem(this.KEY); },
    clear() { localStorage.removeItem(this.KEY); },
    saveSettings() { try { localStorage.setItem(this.SKEY, JSON.stringify(settings)); } catch(e) {} },
    loadSettings() {
        try {
            const r = localStorage.getItem(this.SKEY);
            if (r) Object.assign(settings, JSON.parse(r));
        } catch(e) {}
    },
    // Exporta o save atual (localStorage) como arquivo .json para o usuário baixar
    exportSave() {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) { alert('Não há progresso salvo para exportar ainda.'); return false; }
        try {
            const blob = new Blob([raw], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `por-tras-da-tela-progresso-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch(e) { return false; }
    },
    // Importa um save exportado anteriormente, validando o formato antes de sobrescrever
    importSave(jsonText) {
        try {
            const data = JSON.parse(jsonText);
            if (!data || typeof data !== 'object' || typeof data.playerName === 'undefined') {
                throw new Error('formato inválido');
            }
            const migrated = this.migrate(data);
            localStorage.setItem(this.KEY, JSON.stringify(migrated));
            return true;
        } catch(e) { return false; }
    }
};

// ============================================
// TOASTS VISUAIS
// ============================================
function showStatToast(label, value) {
    if (!settings.animations) return;
    const container = DOM['stat-toast-container'];
    if (!container) return;
    const toast = document.createElement('div');
    const positive = value > 0;
    toast.className = `stat-toast ${positive ? 'positive' : 'negative'}`;
    toast.textContent = `${label} ${positive ? '+' : ''}${value}`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2500);
}

function showEvidenceToast(name) {
    const el = DOM['evidence-toast'];
    if (!el) return;
    if (DOM['evidence-toast-name']) DOM['evidence-toast-name'].textContent = name;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'fadeInUp .4s ease, fadeOut .4s ease 2.5s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 3200);
}

function showRelToast(charId, value) {
    if (!settings.animations) return;
    const char = CHARACTERS[charId];
    if (!char) return;
    const el = DOM['rel-toast'];
    if (!el) return;
    if (DOM['rel-toast-avatar']) DOM['rel-toast-avatar'].textContent = char.avatar;
    const sign = value > 0 ? '+' : '';
    if (DOM['rel-toast-text']) DOM['rel-toast-text'].textContent = `${char.name} ${sign}${value} de afinidade`;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'slideInLeft .3s ease, fadeOut .4s ease 2s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 2800);
}

// v2.0: feedback de "pistas conectadas" durante a investigação — reforça a
// sensação de que o jogador está juntando peças, e não só coletando itens soltos.
const CONNECTION_MESSAGES = [
    'Você encontrou uma conexão entre as pistas.',
    'Essa informação pode ser importante para o caso.',
    'Você percebeu uma inconsistência na história de alguém.'
];
function showConnectionToast(text) {
    const el = DOM['connection-toast'];
    if (!el) return;
    if (DOM['connection-toast-text']) DOM['connection-toast-text'].textContent = text;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'fadeInUp .4s ease, fadeOut .4s ease 3s forwards';
    SynthAudio.playSFX('notif');
    setTimeout(() => { el.style.display = 'none'; }, 3600);
}

function showShareToast() {
    const el = DOM['share-toast'];
    if (!el) return;
    el.style.display = 'block';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'fadeInUp .3s ease, fadeOut .3s ease 2s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 2500);
}

// ============================================
// ATUALIZAÇÃO DA INTERFACE
// ============================================
function updateStatsUI() {
    const s = clamp(gameState.security,0,100), e = clamp(gameState.empathy,0,100);
    const c = clamp(gameState.courage,0,100), t = clamp(gameState.trust,0,100);
    if (DOM['ms-security']) DOM['ms-security'].textContent = s;
    if (DOM['ms-empathy']) DOM['ms-empathy'].textContent = e;
    if (DOM['ms-courage']) DOM['ms-courage'].textContent = c;
    if (DOM['ms-trust']) DOM['ms-trust'].textContent = t;
    if (DOM['sf-security']) DOM['sf-security'].style.width = s+'%';
    if (DOM['sf-empathy']) DOM['sf-empathy'].style.width = e+'%';
    if (DOM['sf-courage']) DOM['sf-courage'].style.width = c+'%';
    if (DOM['sf-trust']) DOM['sf-trust'].style.width = t+'%';
    if (DOM['sv-security']) DOM['sv-security'].textContent = s;
    if (DOM['sv-empathy']) DOM['sv-empathy'].textContent = e;
    if (DOM['sv-courage']) DOM['sv-courage'].textContent = c;
    if (DOM['sv-trust']) DOM['sv-trust'].textContent = t;
}

function updateRelationshipsUI() {
    const r = gameState.relationships;
    if (DOM['rel-rafael']) DOM['rel-rafael'].style.width = clamp(r.rafael,0,100)+'%';
    if (DOM['rel-bia']) DOM['rel-bia'].style.width = clamp(r.bia,0,100)+'%';
    if (DOM['rel-lucas']) DOM['rel-lucas'].style.width = clamp(r.lucas,0,100)+'%';
    if (DOM['relv-rafael']) DOM['relv-rafael'].textContent = clamp(r.rafael,0,100);
    if (DOM['relv-bia']) DOM['relv-bia'].textContent = clamp(r.bia,0,100);
    if (DOM['relv-lucas']) DOM['relv-lucas'].textContent = clamp(r.lucas,0,100);
}

function updateEvidenceUI() {
    const el = DOM['sidebar-evidence'];
    if (!el) return;
    if (gameState.evidence.length === 0) {
        el.innerHTML = '<p class="no-items">Nenhuma evidência coletada.</p>';
    } else {
        el.innerHTML = gameState.evidence.map(evId => {
            const ev = EVIDENCE_CATALOG[evId];
            return ev ? `<div class="sidebar-ev-item"><span>${ev.icon}</span><span>${ev.name}</span></div>` : '';
        }).join('');
    }
}

function updateAchievementsUI() {
    const el = DOM['sidebar-achievements-list'];
    if (!el) return;
    if (gameState.achievements.length === 0) {
        el.innerHTML = '<p class="no-items">Nenhuma conquista ainda.</p>';
    } else {
        el.innerHTML = gameState.achievements.map(id => {
            const a = ACHIEVEMENTS[id];
            return a ? `<div class="sidebar-ach-item"><span class="ach-icon">${a.icon}</span><span>${a.name}</span></div>` : '';
        }).join('');
    }
}

function updateChapterHeader() {
    const ch = getCurrentChapter();
    if (ch && DOM['chapter-indicator']) {
        const label = DOM['chapter-indicator'].querySelector('.chapter-label');
        if (label) label.textContent = `Capítulo ${ch.id}`;
        if (DOM['chapter-title-header']) DOM['chapter-title-header'].textContent = ch.title;
    }
}

function updateSidebarPlayerInfo() {
    if (DOM['sidebar-avatar']) DOM['sidebar-avatar'].textContent = gameState.playerAvatar || '🧑';
    if (DOM['sidebar-player-name']) DOM['sidebar-player-name'].textContent = gameState.playerName || 'Alex';
}

function updateMenuStats() {
    if (DOM['menu-stats']) {
        if (gameState.gamesPlayed > 0) {
            DOM['menu-stats'].textContent = `🎮 Partidas jogadas: ${gameState.gamesPlayed} | 🏆 Conquistas: ${gameState.achievements.length}/${Object.keys(ACHIEVEMENTS).length}`;
        } else {
            DOM['menu-stats'].textContent = '';
        }
    }
}

function updateAllUI() {
    updateStatsUI(); updateRelationshipsUI(); updateEvidenceUI(); updateAchievementsUI(); updateChapterHeader(); updateSidebarPlayerInfo();
}

// ============================================
// VALIDADOR DE CONQUISTAS
// ============================================
function checkAchievements() {
    const f = gameState.choiceFlags, r = gameState.relationships;
    if (!gameState.achievements.includes('guardian')) {
        const bad = ['ch1_joined_mockery','ch2_followed_fake','ch3_participated','ch4_shared_image'].some(k=>f[k]);
        if (!bad && gameState.security >= 65) unlockAchievement('guardian');
    }
    if (!gameState.achievements.includes('empath')) {
        if (gameState.empathy >= 75 && (f['ch1_spoke_up']||f['ch2_full_support']||f['ch5_checked_rafael'])) unlockAchievement('empath');
    }
    if (!gameState.achievements.includes('reporter')) {
        if (f['ch2_reported']||f['ch2_full_support']||f['ch3_reported_adult']||f['ch4_full_response']) unlockAchievement('reporter');
    }
    if (!gameState.achievements.includes('witness')) {
        const w = ['ch1_saved_evidence','ch1_spoke_up','ch2_reported','ch2_full_support'].filter(k=>f[k]).length;
        if (w >= 2) unlockAchievement('witness');
    }
    if (!gameState.achievements.includes('brave')) {
        if (gameState.courage >= 70 && (f['ch5_spoke_up']||f['ch5_full_action'])) unlockAchievement('brave');
    }
    if (!gameState.achievements.includes('investigator')) {
        if (gameState.evidence.length >= 4) unlockAchievement('investigator');
    }
    if (!gameState.achievements.includes('trueFriend')) {
        if (r.rafael >= 80) unlockAchievement('trueFriend');
    }
    // Conquistas Secretas
    if (!gameState.achievements.includes('detetivePerfeito')) {
        if (f['ch2_investigated_properly'] && !f['ch2_confronted_lucas'] && gameState.actionStats.evidenceFound >= 4) {
            unlockAchievement('detetivePerfeito');
        }
    }
    if (!gameState.achievements.includes('influenciadorPositivo')) {
        if (gameState.empathy >= 95 && gameState.trust >= 95) unlockAchievement('influenciadorPositivo');
    }
    if (!gameState.achievements.includes('diplomata')) {
        if (r.rafael >= 65 && r.bia >= 65 && r.lucas >= 65) unlockAchievement('diplomata');
    }
}

function unlockAchievement(id) {
    if (gameState.achievements.includes(id)) return;
    gameState.achievements.push(id);
    const a = ACHIEVEMENTS[id]; if (!a) return;
    if (DOM['ach-toast-icon']) DOM['ach-toast-icon'].textContent = a.icon;
    if (DOM['ach-toast-name']) DOM['ach-toast-name'].textContent = a.name;
    const el = DOM['achievement-toast'];
    if (el) {
        el.style.display = 'flex'; el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'slideInRight .5s ease, fadeOut .5s ease 3s forwards';
        setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
    SynthAudio.playSFX('achievement');
    updateAchievementsUI();
}

// ============================================
// DICAS PEDAGÓGICAS
// ============================================
function showTip(text) {
    if (DOM['tip-text']) DOM['tip-text'].textContent = text;
    if (DOM['tip-overlay']) DOM['tip-overlay'].style.display = 'flex';
}

function closeTip() {
    if (DOM['tip-overlay']) DOM['tip-overlay'].style.display = 'none';
    if (pendingAction) { const a = pendingAction; pendingAction = null; a(); }
}

// ============================================
// VELOCIDADE DE DIGITAÇÃO DO TEXTO (FIXED DUP BUGS)
// ============================================
let activeTypewriterInterval = null;

function getTextSpeed() {
    const speeds = { fast: 8, normal: 18, slow: 35, instant: 0 };
    return speeds[settings.textSpeed] || 18;
}

function typewriter(element, text, callback) {
    if (!element) return;
    if (activeTypewriterInterval) {
        clearInterval(activeTypewriterInterval);
        activeTypewriterInterval = null;
    }

    const speed = getTextSpeed();
    if (speed === 0 || !settings.animations) { 
        element.textContent = text; 
        if (callback) callback(); 
        return; 
    }

    let i = 0; 
    element.textContent = '';
    
    activeTypewriterInterval = setInterval(() => {
        if (i < text.length) { 
            element.textContent += text[i]; 
            i++; 
        } else { 
            clearInterval(activeTypewriterInterval); 
            activeTypewriterInterval = null;
            if (callback) callback(); 
        }
    }, speed);

    const skip = () => { 
        if (activeTypewriterInterval) {
            clearInterval(activeTypewriterInterval); 
            activeTypewriterInterval = null;
        }
        element.textContent = text; 
        element.removeEventListener('click', skip); 
        if (callback) callback(); 
    };
    element.addEventListener('click', skip);
}

// ============================================
// RENDERIZAÇÃO DE CENAS E CELULAR
// ============================================
let currentPhoneScene = null;

function renderScene() {
    const scene = getCurrentScene();
    if (!scene) return;
    updateAllUI();

    if (DOM['narrative-container']) DOM['narrative-container'].style.display = 'none';
    if (DOM['phone-container']) DOM['phone-container'].style.display = 'none';
    if (DOM['investigation-container']) DOM['investigation-container'].style.display = 'none';
    if (DOM['reflection-container']) DOM['reflection-container'].style.display = 'none';
    if (DOM['phone-nav-bar']) DOM['phone-nav-bar'].style.display = 'none';

    switch(scene.type) {
        case 'phone':
            currentPhoneScene = scene;
            if (DOM['phone-nav-bar']) DOM['phone-nav-bar'].style.display = 'flex';
            setActiveTabButton('messages');
            renderPhoneScene(scene, 'messages');
            break;
        case 'investigation':
            renderInvestigationScene(scene);
            break;
        case 'reflection':
            renderReflectionScene(scene);
            break;
        default:
            renderNarrativeScene(scene);
            break;
    }
}

// --- NARRATIVA ---
function renderNarrativeScene(scene) {
    if (DOM['narrative-container']) DOM['narrative-container'].style.display = 'flex';
    if (DOM['scene-visual']) DOM['scene-visual'].textContent = scene.visual || '📖';
    if (DOM['scene-location']) DOM['scene-location'].textContent = scene.location || '';

    const charId = scene.character;
    const char = charId ? CHARACTERS[charId] : null;
    if (char && charId !== 'narrator') {
        if (DOM['character-display']) DOM['character-display'].style.display = 'flex';
        let expr = scene.expression;
        if (typeof expr === 'function') expr = expr();
        const avatar = char.expressions[expr] || char.expressions.default || char.avatar;
        if (DOM['char-avatar-large']) DOM['char-avatar-large'].textContent = avatar;
        if (DOM['char-expression']) DOM['char-expression'].textContent = expr ? expr.charAt(0).toUpperCase()+expr.slice(1) : '';
    } else {
        if (DOM['character-display']) DOM['character-display'].style.display = 'none';
    }

    const speakerName = char ? char.name : (scene.speaker || '');
    if (DOM['speaker-name']) {
        DOM['speaker-name'].textContent = speakerName;
        DOM['speaker-name'].className = 'speaker-name' + (char ? ` ${char.nameClass}` : '');
    }

    let text = typeof scene.text === 'function' ? scene.text() : scene.text;
    if (DOM['dialogue-continue']) DOM['dialogue-continue'].style.display = 'none';
    
    typewriter(DOM['dialogue-text'], text, () => {
        if (scene.choices && scene.choices.length > 0) {
            if (DOM['dialogue-continue']) DOM['dialogue-continue'].style.display = 'none';
        }
    });

    renderChoices(scene.choices);

    if (settings.animations && DOM['narrative-container']) {
        DOM['narrative-container'].style.animation = 'none';
        void DOM['narrative-container'].offsetWidth;
        DOM['narrative-container'].style.animation = 'fadeInUp .5s ease';
    }

    if (scene.relEffects) applyRelEffects(scene.relEffects);
    if (scene.addEvidence) addEvidence(scene.addEvidence);
    if (scene.actionStat) gameState.actionStats[scene.actionStat] = (gameState.actionStats[scene.actionStat]||0)+1;
}

function renderChoices(choices) {
    if (!DOM['choices-container']) return;
    DOM['choices-container'].innerHTML = '';
    if (!choices || choices.length === 0) return;
    choices.forEach((ch, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.setAttribute('aria-label', `Escolha ${ch.letter||(i+1)}: ${ch.text}`);
        btn.innerHTML = ch.letter
            ? `<span class="choice-letter">${ch.letter}</span><span class="choice-text">${ch.text}</span>`
            : `<span class="choice-text">${ch.text}</span>`;
        btn.addEventListener('click', () => handleChoice(ch, i));
        DOM['choices-container'].appendChild(btn);
    });
}

// --- SMARTPHONE SIMULADO ---
function setActiveTabButton(tab) {
    const tabs = ['messages', 'conecta', 'notifications', 'evidence'];
    tabs.forEach(t => {
        const btn = DOM[`phone-nav-${t}`];
        if (btn) {
            if (t === tab) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
}

function renderPhoneScene(scene, tab) {
    if (DOM['phone-container']) DOM['phone-container'].style.display = 'flex';
    if (DOM['phone-nav-bar']) DOM['phone-nav-bar'].style.display = 'flex';
    
    const now = new Date();
    if (DOM['phone-time']) DOM['phone-time'].textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    let html = '';
    if (tab === 'messages') {
        if (scene.phoneType === 'chat') {
            html = renderPhoneChat(scene);
        } else {
            html = renderPhoneChat({
                appName: '💬 Central de Grupos',
                messages: [{ avatar: '😊', name: 'Bia', text: 'Você viu a confusão de hoje?', time: 'Ontem' }]
            });
        }
    } else if (tab === 'conecta') {
        html = renderPhoneConecta(scene);
    } else if (tab === 'notifications') {
        html = renderPhoneNotifications(scene);
    } else if (tab === 'evidence') {
        html = renderPhoneEvidence(scene);
    }

    if (tab === 'messages' && scene.choices) {
        if (scene.afterText) {
            html += `<div style="padding:14px 16px;border-top:1px solid #374151"><p style="font-size:13px;color:#9CA3AF;line-height:1.7">${scene.afterText}</p></div>`;
        }
        html += '<div class="phone-choices">';
        scene.choices.forEach((ch, i) => {
            html += `<button class="phone-choice-btn" data-ci="${i}" aria-label="Escolha ${ch.letter}: ${ch.text}"><span class="choice-letter">${ch.letter}</span><span>${ch.text}</span></button>`;
        });
        html += '</div>';
    } else if (tab !== 'messages') {
        html += `<div style="padding:14px 16px;border-top:1px solid #374151;text-align:center;"><p style="font-size:12px;color:var(--purple);font-weight:600">⚠️ Responda à situação na aba de Mensagens (💬)</p></div>`;
    }

    if (DOM['phone-screen']) {
        DOM['phone-screen'].innerHTML = html;
        if (tab === 'messages') playTypingReveal(scene);
        DOM['phone-screen'].querySelectorAll('.phone-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleChoice(scene.choices[parseInt(btn.dataset.ci)], parseInt(btn.dataset.ci));
            });
        });

        bindConectaActions(DOM['phone-screen']);
    }
}

// Botões de curtir/denunciar do Conecta aparecem tanto na cena de celular quanto no
// hub (aba Conecta) — centralizado aqui para os dois lugares ficarem funcionais.
function bindConectaActions(container) {
    if (!container) return;
    container.querySelectorAll('.conecta-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'like') {
                btn.classList.toggle('liked');
                const span = btn.querySelector('span');
                if (btn.classList.contains('liked')) {
                    span.textContent = parseInt(span.textContent) + 1;
                    SynthAudio.playSFX('click');
                } else {
                    span.textContent = parseInt(span.textContent) - 1;
                }
            } else if (action === 'report') {
                if (!btn.classList.contains('reported')) {
                    openReportModal(btn);
                }
            }
        });
    });
}

// ============================================
// MODAL DE DENÚNCIA (v2.0)
// ============================================
const REPORT_CATEGORIES = [
    { id: 'bullying', icon: '😢', label: 'Cyberbullying' },
    { id: 'harassment', icon: '⚠️', label: 'Assédio' },
    { id: 'inappropriate', icon: '🔞', label: 'Conteúdo impróprio' },
    { id: 'spam', icon: '📢', label: 'Spam' },
    { id: 'scam', icon: '💰', label: 'Golpe' },
    { id: 'other', icon: '❓', label: 'Outro' }
];
let pendingReportBtn = null;

function openReportModal(btn) {
    pendingReportBtn = btn;
    const container = DOM['report-options'];
    if (!container) return;
    container.innerHTML = '';
    REPORT_CATEGORIES.forEach(cat => {
        const opt = document.createElement('button');
        opt.className = 'post-option-btn';
        opt.innerHTML = `<span class="post-option-preview">${cat.icon} ${cat.label}</span>`;
        opt.addEventListener('click', () => confirmReport(cat));
        container.appendChild(opt);
    });
    if (DOM['report-modal']) DOM['report-modal'].style.display = 'flex';
}

function closeReportModal() {
    if (DOM['report-modal']) DOM['report-modal'].style.display = 'none';
    pendingReportBtn = null;
}

function confirmReport(category) {
    const btn = pendingReportBtn;
    closeReportModal();
    if (!btn || btn.classList.contains('reported')) return;
    btn.classList.add('reported');
    const span = btn.querySelector('span');
    if (span) span.textContent = 'Denunciado';
    showStatToast(`🚨 Denúncia enviada (${category.label})`, 1);
    gameState.actionStats.reports++;
    SynthAudio.playSFX('notif');
    if (gameState.actionStats.reports >= 2) unlockAchievement('redeDeApoio');
    SaveSystem.save();
}

function renderPhoneChat(scene) {
    let h = `<div class="phone-app-header"><span style="font-size:16px">←</span><span class="phone-app-name">${scene.appName||'💬 Chat'}</span></div>`;
    const msgs = scene.messages || [];
    const lastIdx = msgs.length - 1;
    // v2.0: a última mensagem do grupo só aparece depois de um indicador "digitando...",
    // dando a sensação de mensagem chegando em tempo real (uma vez por cena/partida).
    const showTyping = settings.animations && !scene._chatIntroPlayed && lastIdx >= 0;
    msgs.forEach((m,i) => {
        const off = m.offensive ? ' offensive' : '';
        const pending = (showTyping && i === lastIdx) ? ' phone-msg-pending' : '';
        h += `<div class="phone-message${pending}" style="animation-delay:${i*.12}s">
                <div class="phone-msg-avatar">${m.avatar}</div>
                <div class="phone-msg-body">
                    <div class="phone-msg-name">${m.name}</div>
                    <div class="phone-msg-text${off}">${m.text}</div>
                    <div class="phone-msg-time">${m.time}</div>
                </div>
              </div>`;
    });
    if (showTyping) {
        const last = msgs[lastIdx];
        h += `<div class="phone-typing-indicator" id="phone-typing-indicator">
                <div class="phone-msg-avatar">${last.avatar}</div>
                <div class="typing-dots"><span></span><span></span><span></span></div>
              </div>`;
    }
    return h;
}

// Revela a última mensagem pendente depois do indicador "digitando...", tocando
// um som de notificação. Chamado uma vez por cena de chat (renderPhoneScene).
function playTypingReveal(scene) {
    const indicator = document.getElementById('phone-typing-indicator');
    const pending = DOM['phone-screen'] ? DOM['phone-screen'].querySelector('.phone-msg-pending') : null;
    if (!indicator || !pending) { if (scene) scene._chatIntroPlayed = true; return; }
    setTimeout(() => {
        if (indicator.parentNode) indicator.remove();
        pending.classList.remove('phone-msg-pending');
        SynthAudio.playSFX('notif');
        scene._chatIntroPlayed = true;
    }, 1100);
}

function renderPhoneConecta(scene) {
    let h = `<div class="phone-app-header"><span class="phone-app-name">🌐 Conecta 9B</span></div>`;

    // Botão de nova publicação (v2.0) — disponível a partir do capítulo 2, uma vez por partida
    if (gameState.chapter >= 2) {
        const used = !!gameState.postsMade.conecta;
        h += `<div style="padding:10px 16px 4px"><button class="menu-btn" id="btn-open-post-modal" ${used ? 'disabled' : ''} style="width:100%;padding:10px;font-size:12px">
                <span class="btn-icon">✏️</span><span class="btn-text">${used ? 'VOCÊ JÁ PUBLICOU' : 'FAZER UMA PUBLICAÇÃO'}</span>
              </button></div>`;
        if (used && gameState.postsMade.conectaText) {
            h += `<div class="conecta-post" style="border-left: 2px solid var(--purple);">
                    <div class="conecta-header"><div class="conecta-avatar">${gameState.playerAvatar}</div><div class="conecta-username">@${(gameState.playerName||'voce').toLowerCase()}</div><div class="conecta-time">agora</div></div>
                    <div class="conecta-content">${gameState.postsMade.conectaText}</div>
                  </div>`;
        }
    }
    
    // Stories Bar
    h += `<div class="stories-container">
            <div class="story-item">
                <div class="story-avatar-ring"><div class="story-avatar-inner">😊</div></div>
                <span class="story-name">Bia</span>
            </div>
            <div class="story-item">
                <div class="story-avatar-ring"><div class="story-avatar-inner">😎</div></div>
                <span class="story-name">Lucas</span>
            </div>
            <div class="story-item">
                <div class="story-avatar-ring viewed"><div class="story-avatar-inner">🤡</div></div>
                <span class="story-name">Pedro</span>
            </div>
            <div class="story-item">
                <div class="story-avatar-ring viewed"><div class="story-avatar-inner">🤷</div></div>
                <span class="story-name">Fernanda</span>
            </div>
          </div>`;

    h += `<div class="conecta-post">
            <div class="conecta-header">
                <div class="conecta-avatar">😎</div>
                <div class="conecta-username">@lucas_gamer</div>
                <div class="conecta-time">10 min atrás</div>
            </div>
            <div class="conecta-content">
                Quem aí quer ver a foto das Olimpíadas de Basquete do Heitor Vila-Lobos? Kkkk Mico total!
            </div>
            <div class="conecta-actions">
                <button class="conecta-action" data-action="like">❤️ <span>24</span></button>
                <button class="conecta-action" data-action="comment">💬 5</button>
                <button class="conecta-action" data-action="report">🚨 <span>Denunciar</span></button>
            </div>
            <div class="conecta-comments">
                <div class="conecta-comment"><span class="conecta-comment-user">@pedro.zz</span> cansei de rir disso kkkk</div>
                <div class="conecta-comment"><span class="conecta-comment-user">@fernanda_sz</span> rindo até 2030 mano</div>
            </div>
          </div>`;
    
    if (gameState.chapter >= 2) {
        h += `<div class="conecta-post" style="border-left: 2px solid var(--red);">
                <div class="conecta-header">
                    <div class="conecta-avatar">🤡</div>
                    <div class="conecta-username">@rafael_ridiculo</div>
                    <div class="conecta-time">Ontem</div>
                </div>
                <div class="conecta-content">
                    Bio atualizada com os novos micos! Sigam e compartilhem pra gente bater 100 seguidores!
                </div>
                <div class="conecta-actions">
                    <button class="conecta-action" data-action="like">❤️ <span>47</span></button>
                    <button class="conecta-action" data-action="report">🚨 <span>Denunciar</span></button>
                </div>
              </div>`;
    }
    return h;
}

// ============================================
// MODAL "POSTAR NO CONECTA" (v2.0)
// ============================================
const POST_OPTIONS = [
    {
        id: 'support',
        preview: '"Gente que fica rindo da vida dos outros devia se enxergar. Chega de fingir que isso é brincadeira. 💜"',
        effectLabel: '💪 +Coragem 💜 +Empatia 🤝 Rafael confia mais',
        apply: () => { applyChoiceEffects({ courage: 10, empathy: 5 }); applyRelEffects({ rafael: 10, lucas: -5 }); }
    },
    {
        id: 'vague',
        preview: '"Só uma indireta pra quem sabe quem é... deviam ter mais vergonha na cara."',
        effectLabel: '💪 +Coragem leve 🤝 Confiança -',
        apply: () => { applyChoiceEffects({ courage: 5, trust: -5 }); }
    },
    {
        id: 'silent',
        preview: 'Você decide não postar nada e apenas observar a timeline por enquanto.',
        effectLabel: '📵 Conteúdo Retido +1',
        apply: () => { gameState.actionStats.contentNotShared = (gameState.actionStats.contentNotShared||0)+1; }
    }
];

function applyChoiceEffects(effects) {
    Object.entries(effects).forEach(([k, v]) => {
        if (gameState[k] !== undefined) gameState[k] = clamp(gameState[k] + v, 0, 100);
    });
}

function openPostModal() {
    const container = DOM['post-options'];
    if (!container) return;
    container.innerHTML = '';
    POST_OPTIONS.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'post-option-btn';
        btn.innerHTML = `<div class="post-option-preview">${opt.preview}</div><div class="post-option-effect">${opt.effectLabel}</div>`;
        btn.addEventListener('click', () => {
            opt.apply();
            gameState.postsMade.conecta = true;
            gameState.postsMade.conectaText = opt.id === 'silent' ? null : opt.preview.replace(/^"|"$/g, '');
            updateAllUI();
            checkAchievements();
            SaveSystem.save();
            closePostModal();
            showStatToast('📝 Publicação registrada', 1);
            SynthAudio.playSFX('click');
            // Re-renderiza a tela do Conecta que estiver visível no momento
            if (currentPhoneScene && DOM['phone-container'] && DOM['phone-container'].style.display !== 'none') {
                renderPhoneScene(currentPhoneScene, 'conecta');
            }
            if (activeHubTab === 'conecta' && DOM['hub-phone-panel'] && DOM['hub-phone-panel'].style.display === 'flex') {
                renderHubPhonePanel();
            }
        });
        container.appendChild(btn);
    });
    if (DOM['post-modal']) DOM['post-modal'].style.display = 'flex';
}

function closePostModal() {
    if (DOM['post-modal']) DOM['post-modal'].style.display = 'none';
}

function renderPhoneNotifications(scene) {
    let h = `<div class="phone-app-header"><span class="phone-app-name">🔔 Notificações</span></div>`;
    
    const list = [
        { icon: '👥', text: 'Você foi adicionado ao grupo "💬 Grupo — 9º Ano B"', time: 'Segunda-feira' }
    ];
    
    if (gameState.chapter >= 2) {
        list.unshift({ icon: '🤡', text: 'Novo perfil sugerido: @rafael_ridiculo na sua rede social Conecta.', time: 'Quarta-feira' });
    }
    if (gameState.chapter >= 3) {
        list.unshift({ icon: '⚠️', text: 'Bia_oficial adicionou você ao chat "BANDO DO 9B (Sem o Esquisito)"', time: 'Sexta-feira' });
    }
    if (gameState.chapter >= 4) {
        list.unshift({ icon: '📩', text: 'Pedro.zz enviou um arquivo em anexo para você.', time: 'Terça-feira' });
    }

    list.forEach((n, i) => {
        h += `<div class="phone-notification" style="animation-delay:${i*.12}s">
                <div class="phone-notif-icon">${n.icon}</div>
                <div class="phone-notif-text">${n.text}</div>
                <div class="phone-notif-time">${n.time}</div>
              </div>`;
    });
    return h;
}

function renderPhoneEvidence(scene) {
    let h = `<div class="phone-app-header"><span class="phone-app-name">🔎 Evidências Adquiridas</span></div>`;
    if (gameState.evidence.length === 0) {
        h += `<div style="padding:40px 20px; text-align:center;"><p style="font-size:13px; color:var(--gray);">Nenhum print ou prova guardados no rolo da câmera segura.</p></div>`;
    } else {
        gameState.evidence.forEach(evId => {
            const ev = EVIDENCE_CATALOG[evId];
            if (ev) {
                h += `<div class="phone-evidence-item">
                        <span class="phone-evidence-icon">${ev.icon}</span>
                        <span class="phone-evidence-text">${ev.name}</span>
                        <span class="phone-evidence-check">✓ Salvo</span>
                      </div>`;
            }
        });
    }
    return h;
}

// --- INVESTIGAÇÃO ---
function renderInvestigationScene(scene) {
    if (DOM['investigation-container']) DOM['investigation-container'].style.display = 'block';
    if (DOM['investigation-desc']) DOM['investigation-desc'].textContent = scene.desc || '';

    const board = DOM['evidence-board'];
    if (!board) return;
    board.innerHTML = '';
    const foundItems = [];
    
    (scene.evidenceItems||[]).forEach(item => {
        const card = document.createElement('div');
        card.className = 'evidence-card';
        card.innerHTML = `<span class="ev-icon">${item.icon}</span><span class="ev-label">${item.label}</span>`;
        
        card.addEventListener('click', () => {
            if (!card.classList.contains('found') && !card.classList.contains('false-lead')) {
                if (item.isFalseLead) {
                    card.classList.add('false-lead');
                    card.innerHTML = `
                        <span class="ev-icon">❌</span>
                        <span class="ev-label" style="color:var(--red)">PISTA FALSA</span>
                        <p style="font-size:11px;color:#D1D5DB;margin-top:6px;line-height:1.4">${item.detail}</p>
                    `;
                    showStatToast('⚠️ Pista Falsa!', -5);
                } else {
                    card.classList.add('found');
                    foundItems.push(item.id);
                    showEvidenceToast(item.label);
                    gameState.actionStats.evidenceFound = (gameState.actionStats.evidenceFound||0)+1;
                    
                    card.innerHTML = `
                        <span class="ev-icon">${item.icon}</span>
                        <span class="ev-label" style="color:var(--green)">${item.label}</span>
                        <p style="font-size:11px;color:#D1D5DB;margin-top:6px;line-height:1.4">${item.detail}</p>
                    `;
                    updateInvestigationList(scene.evidenceItems, foundItems);

                    // v2.0: feedback de conexão de pistas — mostra ao encontrar a 2ª pista real,
                    // e uma mensagem de fechamento ao reunir todas as pistas verdadeiras da cena.
                    const realItemsTotal = (scene.evidenceItems||[]).filter(it => !it.isFalseLead).length;
                    setTimeout(() => {
                        if (foundItems.length === 2 && realItemsTotal > 2) {
                            showConnectionToast(CONNECTION_MESSAGES[0]);
                        } else if (foundItems.length === realItemsTotal && realItemsTotal > 0) {
                            showConnectionToast(CONNECTION_MESSAGES[2]);
                        } else if (foundItems.length >= 1 && realItemsTotal <= 2 && foundItems.length < realItemsTotal) {
                            showConnectionToast(CONNECTION_MESSAGES[1]);
                        }
                    }, 3300); // depois do toast de evidência sumir, pra não sobrepor
                }
            }
        });
        board.appendChild(card);
    });

    updateInvestigationList(scene.evidenceItems, foundItems);

    const choicesEl = DOM['investigation-choices'];
    if (!choicesEl) return;
    choicesEl.innerHTML = '';
    if (scene.afterText) {
        choicesEl.innerHTML = `<p style="font-size:13px;color:#9CA3AF;line-height:1.7;margin-bottom:14px;text-align:center">${scene.afterText}</p>`;
    }
    if (scene.choices) {
        scene.choices.forEach((ch, i) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `<span class="choice-letter">${ch.letter}</span><span class="choice-text">${ch.text}</span>`;
            btn.addEventListener('click', () => handleChoice(ch, i));
            choicesEl.appendChild(btn);
        });
    }
}

function updateInvestigationList(allItems, foundIds) {
    const el = DOM['evidence-list'];
    if (!el) return;
    el.innerHTML = allItems.map(item => {
        if (item.isFalseLead) return '';
        const found = foundIds.includes(item.id);
        return `<div class="evidence-list-item ${found?'found':'missing'}"><span>${found?'✓':'○'}</span><span>${item.label}</span></div>`;
    }).join('');
}

// --- REFLEXÃO ---
function renderReflectionScene(scene) {
    if (DOM['reflection-container']) DOM['reflection-container'].style.display = 'flex';
    if (DOM['reflection-question']) DOM['reflection-question'].textContent = scene.question;
    if (DOM['reflection-feedback']) DOM['reflection-feedback'].style.display = 'none';

    const choicesEl = DOM['reflection-choices'];
    if (!choicesEl) return;
    choicesEl.innerHTML = '';
    
    (scene.reflectionChoices||[]).forEach((text, i) => {
        const btn = document.createElement('button');
        btn.className = 'reflection-choice-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => {
            choicesEl.querySelectorAll('.reflection-choice-btn').forEach(b => b.style.opacity = '0.4');
            btn.style.opacity = '1';
            btn.style.borderColor = 'var(--purple)';
            if (DOM['reflection-tip-text']) DOM['reflection-tip-text'].textContent = scene.feedback;
            if (DOM['reflection-feedback']) DOM['reflection-feedback'].style.display = 'block';
        });
        choicesEl.appendChild(btn);
    });

    if (DOM['reflection-continue-btn']) {
        DOM['reflection-continue-btn'].onclick = () => {
            gameState.scene = scene.next !== undefined ? scene.next : gameState.scene + 1;
            renderScene();
        };
    }
}

// ============================================
// LÓGICA DE ESCOLHAS
// ============================================
function handleChoice(choice, index) {
    SynthAudio.playSFX('click');

    gameState.choices.push({
        chapter: gameState.chapter, scene: gameState.scene,
        choiceIndex: index, choiceText: choice.text,
        decisionText: choice.decisionText || null
    });

    if (choice.effects) {
        const ef = choice.effects;
        if (ef.security) { gameState.security = clamp(gameState.security+ef.security,0,100); showStatToast('🛡️ Segurança', ef.security); }
        if (ef.empathy) { gameState.empathy = clamp(gameState.empathy+ef.empathy,0,100); showStatToast('💜 Empatia', ef.empathy); }
        if (ef.courage) { gameState.courage = clamp(gameState.courage+ef.courage,0,100); showStatToast('💪 Coragem', ef.courage); }
        if (ef.trust) { gameState.trust = clamp(gameState.trust+ef.trust,0,100); showStatToast('🤝 Confiança', ef.trust); }
    }

    if (choice.relEffects) applyRelEffects(choice.relEffects);
    if (choice.flag) gameState.choiceFlags[choice.flag] = true;
    if (choice.addEvidence) addEvidence(choice.addEvidence);
    if (choice.addEvidence2) addEvidence(choice.addEvidence2);

    if (choice.actionStat) gameState.actionStats[choice.actionStat] = (gameState.actionStats[choice.actionStat]||0)+1;
    if (choice.decisionText && (choice.effects && (choice.effects.empathy > 0 || choice.effects.trust > 0))) {
        gameState.actionStats.peopleHelped = (gameState.actionStats.peopleHelped||0)+1;
    }

    updateAllUI();
    checkAchievements();

    if (choice.tip) {
        showTip(choice.tip);
        pendingAction = () => proceedAfterChoice(choice);
        return;
    }

    proceedAfterChoice(choice);
}

function applyRelEffects(rels) {
    Object.entries(rels).forEach(([charId, val]) => {
        if (gameState.relationships[charId] !== undefined) {
            gameState.relationships[charId] = clamp(gameState.relationships[charId]+val,0,100);
            showRelToast(charId, val);
        }
    });
    updateRelationshipsUI();
}

function addEvidence(evId) {
    if (!gameState.evidence.includes(evId)) {
        gameState.evidence.push(evId);
        const ev = EVIDENCE_CATALOG[evId];
        if (ev) showEvidenceToast(ev.name);
        updateEvidenceUI();
    }
}

function proceedAfterChoice(choice) {
    if (choice.end) { endGame(); return; }
    if (choice.goHub) { showHub(); return; }
    if (choice.nextChapter) { goToChapter(choice.nextChapter); return; }
    gameState.scene = choice.next !== undefined ? choice.next : gameState.scene + 1;
    SaveSystem.save();
    renderScene();
}

// ============================================
// HUB DE INTERVALO COM CONVERSAS 1-A-1
// ============================================
function showHub() {
    SaveSystem.save();
    const ch = getCurrentChapter();
    if (DOM['hub-completed']) DOM['hub-completed'].textContent = `Capítulo ${ch.id} concluído — ${ch.title}`;

    const nextChId = gameState.chapter + 1;
    const nextCh = chapters.find(c => c.id === nextChId);
    if (DOM['hub-next-chapter-desc']) {
        if (nextCh) {
            DOM['hub-next-chapter-desc'].textContent = `Capítulo ${nextCh.id}: ${nextCh.title}`;
        } else {
            DOM['hub-next-chapter-desc'].textContent = 'Encerrar e Ver Estatísticas de Perfil';
        }
    }

    if (DOM['hub-phone-badge']) DOM['hub-phone-badge'].style.display = 'inline-block';
    showScreen('hub-screen');
}

let activeHubTab = 'contacts';

function renderHubPhonePanel() {
    let html = '';
    
    if (activeHubTab === 'contacts') {
        html += '<div style="padding:10px 0;">';
        
        // Rafael Chat
        const rVal = gameState.relationships.rafael;
        let rStatus = rVal >= 70 ? 'Confia em você' : rVal >= 45 ? 'Pouca conversa' : 'Magoado';
        html += `<div class="hub-contact-item" data-contact="rafael">
                    <span class="hub-contact-avatar">😔</span>
                    <div class="hub-contact-info">
                        <span class="hub-contact-name">Rafael</span>
                        <span class="hub-contact-status">${rStatus} (${rVal}%)</span>
                    </div>
                    <span class="hub-contact-arrow">💬</span>
                 </div>`;
        
        // Bia Chat
        const bVal = gameState.relationships.bia;
        let bStatus = bVal >= 70 ? 'Aliada próxima' : 'Amiga';
        html += `<div class="hub-contact-item" data-contact="bia">
                    <span class="hub-contact-avatar">😊</span>
                    <div class="hub-contact-info">
                        <span class="hub-contact-name">Bia</span>
                        <span class="hub-contact-status">${bStatus} (${bVal}%)</span>
                    </div>
                    <span class="hub-contact-arrow">💬</span>
                 </div>`;

        // Lucas Chat (v2.0)
        const lVal = gameState.relationships.lucas;
        let lStatus = lVal >= 60 ? 'Parceiro de jogos' : lVal >= 35 ? 'Indiferente' : 'Na defensiva';
        html += `<div class="hub-contact-item" data-contact="lucas">
                    <span class="hub-contact-avatar">😎</span>
                    <div class="hub-contact-info">
                        <span class="hub-contact-name">Lucas</span>
                        <span class="hub-contact-status">${lStatus} (${lVal}%)</span>
                    </div>
                    <span class="hub-contact-arrow">💬</span>
                 </div>`;

        html += '</div>';
    } else if (activeHubTab === 'conecta') {
        html = renderPhoneConecta({ phoneType: 'conecta' });
    } else if (activeHubTab === 'stories') {
        html = `<div style="padding:16px; text-align:center;">
                    <h4 style="color:var(--purple); margin-bottom:12px;">📸 Stories do Conecta</h4>
                    <p style="font-size:13px; color:var(--gray); line-height:1.6;">Stories expirados em 24h. Algumas pessoas da turma postaram indiretas nos momentos mais tensos da semana.</p>
                </div>`;
    }

    if (DOM['hub-phone-content']) {
        DOM['hub-phone-content'].innerHTML = html;
        
        DOM['hub-phone-content'].querySelectorAll('.hub-contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contact = item.dataset.contact;
                open1on1Chat(contact);
            });
        });

        if (activeHubTab === 'conecta') bindConectaActions(DOM['hub-phone-content']);
    }
}

function open1on1Chat(charId) {
    const char = CHARACTERS[charId];
    if (!char) return;

    if (DOM['hub-chat-title']) DOM['hub-chat-title'].textContent = `💬 ${char.name}`;
    
    let chatHtml = '';
    let replyOptions = [];

    if (charId === 'rafael') {
        const rVal = gameState.relationships.rafael;
        if (rVal >= 70) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😔</div><div class="hub-chat-msg-bubble">Oi ${gameState.playerName}... valeu de verdade por estar do meu lado nessa bagunça toda.</div></div>`;
            replyOptions = [
                { text: '"Tamo junto, Rafa. Não liga pra eles."', rel: { rafael: 5 }, id: 'r1' },
                { text: '"Tô guardando tudo que postarem contra você."', rel: { rafael: 5 }, id: 'r2' }
            ];
        } else if (rVal >= 45) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😔</div><div class="hub-chat-msg-bubble">Oi... as coisas estão estranhas na escola. Mas espero que tudo se resolva logo.</div></div>`;
            replyOptions = [
                { text: '"Se precisar conversar, tô por aqui."', rel: { rafael: 10 }, id: 'r3' },
                { text: '"É, tomara que passe."', rel: { rafael: 0 }, id: 'r4' }
            ];
        } else {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😔</div><div class="hub-chat-msg-bubble">Por que você tá me mandando mensagem? Você nem se importa com o que fazem comigo...</div></div>`;
            replyOptions = [
                { text: '"Desculpa, Rafa. Eu errei em não ajudar antes."', rel: { rafael: 15 }, id: 'r5' },
                { text: '"Deixa pra lá então."', rel: { rafael: -5 }, id: 'r6' }
            ];
        }
    } else if (charId === 'bia') {
        const biaVal = gameState.relationships.bia;
        if (biaVal >= 70) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😊</div><div class="hub-chat-msg-bubble">Oii ${gameState.playerName}! Fico feliz que a gente tá remando junto nisso. Se topar, posso te ajudar a organizar as provas.</div></div>`;
            replyOptions = [
                { text: '"Bora sim, conto contigo, Bia."', rel: { bia: 5 }, id: 'b1' },
                { text: '"Combinado, valeu pela força."', rel: { bia: 5 }, id: 'b2' }
            ];
        } else if (biaVal >= 45) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😊</div><div class="hub-chat-msg-bubble">Oii ${gameState.playerName}! O que tá achando de como as coisas tão indo na turma?</div></div>`;
            replyOptions = [
                { text: '"Tô tentando fazer a coisa certa."', rel: { bia: 5 }, id: 'b3' },
                { text: '"Tá tenso, mas a gente se ajuda!"', rel: { bia: 5 }, id: 'b4' }
            ];
        } else {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😊</div><div class="hub-chat-msg-bubble">Sincerando: eu esperava mais de você nessa história toda com o Rafael...</div></div>`;
            replyOptions = [
                { text: '"Você tem razão, posso melhorar."', rel: { bia: 10 }, id: 'b5' },
                { text: '"Cada um faz o que pode, Bia."', rel: { bia: 0 }, id: 'b6' }
            ];
        }
    } else if (charId === 'lucas') {
        const lucasVal = gameState.relationships.lucas;
        if (lucasVal >= 60) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😎</div><div class="hub-chat-msg-bubble">E aí, ${gameState.playerName}! Bora de squad hoje à noite? Preciso desopilar depois dessa semana doida.</div></div>`;
            replyOptions = [
                { text: '"Bora! Só sem clima pesado com o Rafael, hein."', rel: { lucas: 5 }, id: 'l1' },
                { text: '"Topo, mano."', rel: { lucas: 5 }, id: 'l2' }
            ];
        } else if (lucasVal >= 35) {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😎</div><div class="hub-chat-msg-bubble">Fala. Andaram comentando um monte de coisa essa semana, né? Eu nem tô ligando muito pra isso.</div></div>`;
            replyOptions = [
                { text: '"Deveria ligar. Isso afetou o Rafael de verdade."', rel: { lucas: -5, rafael: 5 }, id: 'l3' },
                { text: '"É, melhor nem se meter."', rel: { lucas: 5 }, id: 'l4' }
            ];
        } else {
            chatHtml += `<div class="hub-chat-msg"><div class="hub-chat-msg-avatar">😎</div><div class="hub-chat-msg-bubble">Por que você fica me enchendo com esse assunto? Fala logo o que você quer.</div></div>`;
            replyOptions = [
                { text: '"Só quero entender o que rolou de verdade."', rel: { lucas: 5 }, id: 'l5' },
                { text: '"Nada. Esquece."', rel: { lucas: 0 }, id: 'l6' }
            ];
        }
    }

    if (DOM['hub-chat-content']) DOM['hub-chat-content'].innerHTML = chatHtml;

    let inputHtml = '<div class="hub-chat-input-title">Sua Resposta:</div>';
    replyOptions.forEach(opt => {
        const used = gameState.chatRepliesUsed[opt.id];
        inputHtml += `<button class="hub-chat-reply-btn ${used ? 'used' : ''}" data-reply-id="${opt.id}">${opt.text}</button>`;
    });

    if (DOM['hub-chat-input-area']) {
        DOM['hub-chat-input-area'].innerHTML = inputHtml;

        DOM['hub-chat-input-area'].querySelectorAll('.hub-chat-reply-btn').forEach((btn, idx) => {
            btn.addEventListener('click', () => {
                const opt = replyOptions[idx];
                if (gameState.chatRepliesUsed[opt.id]) return;

                gameState.chatRepliesUsed[opt.id] = true;
                btn.classList.add('used');

                // Adiciona bolha do jogador
                const playerBubble = document.createElement('div');
                playerBubble.className = 'hub-chat-msg own';
                playerBubble.innerHTML = `<div class="hub-chat-msg-avatar">${gameState.playerAvatar}</div><div class="hub-chat-msg-bubble">${opt.text}</div>`;
                DOM['hub-chat-content'].appendChild(playerBubble);

                if (opt.rel) applyRelEffects(opt.rel);
                SynthAudio.playSFX('click');
            });
        });
    }

    if (DOM['hub-chat-panel']) DOM['hub-chat-panel'].style.display = 'flex';
}

function setupHubEvents() {
    if (DOM['hub-phone-btn']) {
        DOM['hub-phone-btn'].addEventListener('click', () => {
            renderHubPhonePanel();
            if (DOM['hub-phone-panel']) DOM['hub-phone-panel'].style.display = 'flex';
        });
    }

    document.querySelectorAll('.hub-phone-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
            document.querySelectorAll('.hub-phone-tab').forEach(t => t.classList.remove('active'));
            tabBtn.classList.add('active');
            activeHubTab = tabBtn.dataset.hubtab;
            renderHubPhonePanel();
        });
    });

    if (DOM['hub-evidence-btn']) {
        DOM['hub-evidence-btn'].addEventListener('click', () => {
            let html = '';
            if (gameState.evidence.length === 0) {
                html = '<p style="font-size:14px;color:#9CA3AF;text-align:center;padding:20px">Seu banco de evidências seguro está vazio.<br><br>Prints e provas arquivados durante os capítulos serão listados aqui.</p>';
            } else {
                gameState.evidence.forEach(evId => {
                    const ev = EVIDENCE_CATALOG[evId];
                    if (ev) html += `<div class="phone-evidence-item"><span class="phone-evidence-icon">${ev.icon}</span><span class="phone-evidence-text">${ev.name}</span><span class="phone-evidence-check">✓ Salvo</span></div>`;
                });
            }
            if (DOM['hub-evidence-content']) DOM['hub-evidence-content'].innerHTML = html;
            if (DOM['hub-evidence-panel']) DOM['hub-evidence-panel'].style.display = 'flex';
        });
    }

    if (DOM['hub-relationships-btn']) {
        DOM['hub-relationships-btn'].addEventListener('click', () => {
            let html = '';
            const chars = [
                { id: 'rafael', desc: function() {
                    const v = gameState.relationships.rafael;
                    if (v >= 70) return 'Rafael enxerga você como um abrigo seguro.';
                    if (v >= 45) return 'Rafael está receoso, mas respeita sua neutralidade.';
                    return 'Rafael se sente magoado pelas suas atitudes.';
                }},
                { id: 'bia', desc: function() {
                    const v = gameState.relationships.bia;
                    if (v >= 70) return 'Bia tem extrema admiração por suas intervenções.';
                    if (v >= 45) return 'Bia valoriza sua amizade, embora queira mais atitude.';
                    return 'Bia está decepcionada com sua tolerância ao bullying.';
                }},
                { id: 'lucas', desc: function() {
                    const v = gameState.relationships.lucas;
                    if (v >= 60) return 'Lucas o enxerga como parceiro de brincadeiras.';
                    if (v >= 35) return 'Lucas está indiferente com você.';
                    return 'Lucas se sente desconfortável com suas denúncias.';
                }}
            ];
            chars.forEach(c => {
                const ch = CHARACTERS[c.id];
                const val = clamp(gameState.relationships[c.id],0,100);
                html += `<div class="hub-rel-card"><span class="hub-rel-avatar">${ch.avatar}</span><div class="hub-rel-info"><span class="hub-rel-name">${ch.name}</span><span class="hub-rel-status">${c.desc()} (Nível de confiança: ${val}%)</span></div></div>`;
            });
            if (DOM['hub-relationships-content']) DOM['hub-relationships-content'].innerHTML = html;
            if (DOM['hub-relationships-panel']) DOM['hub-relationships-panel'].style.display = 'flex';
        });
    }

    if (DOM['hub-continue-btn']) {
        DOM['hub-continue-btn'].addEventListener('click', () => {
            const nextChId = gameState.chapter + 1;
            goToChapter(nextChId);
        });
    }

    document.querySelectorAll('.hub-panel-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.dataset.close;
            const el = document.getElementById(panelId);
            if (el) el.style.display = 'none';
        });
    });
}

// ============================================
// TRANSIÇÕES DE CAPÍTULO
// ============================================
function goToChapter(chapterId) {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) { endGame(); return; }

    if (gameState.chapter === 1 && chapterId > 1) unlockAchievement('firstStep');

    gameState.chapter = chapterId;
    gameState.scene = 0;
    if (DOM['transition-chapter-num']) DOM['transition-chapter-num'].textContent = `Capítulo ${ch.id}`;
    if (DOM['transition-title']) DOM['transition-title'].textContent = ch.title;
    if (DOM['transition-desc']) DOM['transition-desc'].textContent = ch.desc;
    
    showScreen('chapter-transition');
    SynthAudio.playSFX('chapter');
    SaveSystem.save();
    
    setTimeout(() => { 
        showScreen('game-screen'); 
        renderScene(); 
    }, 3000);
}

// ============================================
// RESULTADO FINAL — EXPANDIDO PARA 6 FINAIS
// ============================================
function getPlayerProfile() {
    const s = gameState, f = s.choiceFlags;
    const profiles = [
        { id: 'hero', icon: '🌟', title: 'Líder Transformador', desc: 'Sua coragem, empatia e proatividade criaram mudanças reais na escola, tornando o ambiente seguro para todos.' },
        { id: 'guardian', icon: '🛡️', title: 'Guardião Digital', desc: 'Sua conduta de coleta sistemática de provas e denúncias ativas blindou as vítimas e responsabilizou os detratores.' },
        { id: 'ally', icon: '💜', title: 'Grande Aliado', desc: 'Sua empatia ativa garantiu abrigo social à vítima de forma consistente, impedindo o isolamento emocional severo.' },
        { id: 'investigator', icon: '🔎', title: 'Perito Digital', desc: 'Sua vocação investigativa não permitiu que mentiras e fakes anônimos ficassem ocultos.' },
        { id: 'trusted', icon: '🤝', title: 'Pessoa de Confiança', desc: 'Seus pares e a comunidade escolar o enxergam como alguém que toma decisões éticas sob pressão.' },
        { id: 'observer', icon: '👀', title: 'Espectador Tolerante', desc: 'Suas condutas focaram mais em assistir de longe do que em quebrar o fluxo abusivo de mensagens.' }
    ];

    const avg = (s.security + s.empathy + s.courage + s.trust) / 4;
    if (avg >= 85) return profiles[0];
    if (s.security >= 70 && !f['ch4_shared_image']) return profiles[1];
    if (s.empathy >= 75 && s.relationships.rafael >= 65) return profiles[2];
    if (s.evidence.length >= 4) return profiles[3];
    if (s.trust >= 70) return profiles[4];
    return profiles[5];
}

function endGame() {
    gameState.hasPlayed = true;
    gameState.gamesPlayed = (gameState.gamesPlayed || 0) + 1;

    // Lógica expandida de 6 Finais
    const avg = (gameState.security + gameState.empathy + gameState.courage + gameState.trust) / 4;
    const f = gameState.choiceFlags;

    let ending = 'neutral';
    if (f['ch4_shared_image'] || (f['ch1_joined_mockery'] && f['ch3_participated'])) {
        ending = 'negative'; // Final Cúmplice
    } else if (avg >= 80 && (f['ch5_spoke_up'] || f['ch5_full_action'])) {
        ending = 'heroic'; // Final Heroico
    } else if (gameState.security >= 70 && gameState.actionStats.reports >= 2) {
        ending = 'guardian'; // Final Guardião Silencioso
    } else if (gameState.relationships.rafael >= 80) {
        ending = 'friend'; // Final Amigo Leal
    } else if (avg >= 50) {
        ending = 'neutral'; // Final Neutro
    } else {
        ending = 'silent'; // Final Espectador Omisso
    }

    gameState.lastEnding = ending;

    if (!gameState.endingsUnlocked.includes(ending)) gameState.endingsUnlocked.push(ending);

    if (!gameState.achievements.includes('secondChance') && gameState.gamesPlayed > 1) {
        unlockAchievement('secondChance');
    }
    if (ending === 'negative' || ending === 'silent') unlockAchievement('tudoTemConsequencia');
    if (gameState.endingsUnlocked.length >= 6) unlockAchievement('todosOsCaminhos');

    SaveSystem.save();
    showResultScreen(ending);
}

const ENDINGS_CONFIG = {
    heroic: { emoji:'🌟', title:'VOCÊ FEZ A DIFERENÇA!', subtitle:'Sua liderança ética e sensibilidade transformaram o ambiente escolar.', cls:'hero',
        message: () => `Parabéns, ${gameState.playerName}! Suas posturas mostraram que o cyberbullying recua quando as pessoas decidem agir. Você acolheu Rafael, documentou as difamações e liderou mudanças na escola. Você é um exemplo de cidadania digital!` },
    guardian: { emoji:'🛡️', title:'GUARDIÃO DA SEGURANÇA', subtitle:'Você usou a inteligência e a responsabilidade para proteger quem precisava.', cls:'positive',
        message: () => `Sua atuação focou na prevenção e na coleta responsável de evidências, ${gameState.playerName}. Graças à sua denúncia e cuidado, a escola pôde tomar providências éticas e legais.` },
    friend: { emoji:'💜', title:'AMIGO DE VERDADE', subtitle:'Sua empatia garantiu que Rafael não se sentisse sozinho nas horas mais difíceis.', cls:'friend',
        message: () => `Mais do que denunciar, você esteve presente para quem precisava, ${gameState.playerName}. O apoio emocional que você deu ao Rafael fez toda a diferença na vida dele.` },
    neutral: { emoji:'💛', title:'AINDA DÁ TEMPO', subtitle:'Houve boas decisões pontuais, mas você permitiu que a agressão continuasse.', cls:'neutral',
        message: () => `Você não impulsionou o ódio, mas a hesitação em alguns momentos permitiu que a situação se arrastasse, ${gameState.playerName}. A internet precisa de mais barreira ativa. Tente jogar novamente!` },
    silent: { emoji:'🤐', title:'SILÊNCIO QUE PESA', subtitle:'Ficar em silêncio nem sempre significa ser neutro. O omisso fortalece o agressor.', cls:'silent',
        message: () => `Seu silêncio permitiu que a perseguição contra Rafael continuasse sem barreiras, ${gameState.playerName}. No mundo real, a falta de ajuda é percebida como apoio ao bullying. Que tal tentar uma nova postura?` },
    negative: { emoji:'⚠️', title:'TUDO SAIU DO CONTROLE', subtitle:'Sua conivência com as zombarias amplificou o dano moral no Rafael.', cls:'negative',
        message: () => `Encaminhar fotos roubadas ou rir de piadas cruéis causa estragos profundos e duradouros na saúde mental das pessoas. Use esta experiência virtual para agir de forma diferente no seu dia a dia real.` }
};

function showResultScreen(ending) {
    showScreen('result-screen');
    const c = ENDINGS_CONFIG[ending] || ENDINGS_CONFIG['neutral'];

    if (DOM['result-emoji']) DOM['result-emoji'].textContent = c.emoji;
    if (DOM['result-title']) DOM['result-title'].textContent = c.title;
    if (DOM['result-subtitle']) DOM['result-subtitle'].textContent = c.subtitle;
    if (DOM['result-header']) DOM['result-header'].className = `result-header ${c.cls}`;

    const prof = getPlayerProfile();
    if (DOM['profile-badge-icon']) DOM['profile-badge-icon'].textContent = prof.icon;
    if (DOM['profile-title']) DOM['profile-title'].textContent = prof.title;
    if (DOM['profile-desc']) DOM['profile-desc'].textContent = prof.desc;

    setTimeout(() => {
        if (DOM['rs-security']) DOM['rs-security'].style.width = gameState.security+'%';
        if (DOM['rs-empathy']) DOM['rs-empathy'].style.width = gameState.empathy+'%';
        if (DOM['rs-courage']) DOM['rs-courage'].style.width = gameState.courage+'%';
        if (DOM['rs-trust']) DOM['rs-trust'].style.width = gameState.trust+'%';
    }, 300);
    if (DOM['rsv-security']) DOM['rsv-security'].textContent = gameState.security;
    if (DOM['rsv-empathy']) DOM['rsv-empathy'].textContent = gameState.empathy;
    if (DOM['rsv-courage']) DOM['rsv-courage'].textContent = gameState.courage;
    if (DOM['rsv-trust']) DOM['rsv-trust'].textContent = gameState.trust;

    const as = gameState.actionStats;
    if (DOM['action-stats-grid']) {
        DOM['action-stats-grid'].innerHTML = `
            <div class="action-stat-item"><span class="action-stat-value">${as.reports||0}</span><span class="action-stat-label">🚨 Denúncias</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${as.peopleHelped||0}</span><span class="action-stat-label">💜 Acolhimentos</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${gameState.evidence.length||0}</span><span class="action-stat-label">🔎 Evidências Adquiridas</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${as.contentNotShared||0}</span><span class="action-stat-label">📵 Conteúdo Retido</span></div>`;
    }

    if (DOM['result-decisions-list']) {
        DOM['result-decisions-list'].innerHTML = '';
        const decisions = gameState.choices.filter(ch => ch.decisionText);
        if (decisions.length > 0) {
            decisions.forEach(d => {
                const li = document.createElement('li'); li.textContent = d.decisionText;
                DOM['result-decisions-list'].appendChild(li);
            });
        } else {
            const li = document.createElement('li'); li.textContent = 'Nenhum registro de ação decisiva positiva na rodada.';
            DOM['result-decisions-list'].appendChild(li);
        }
    }

    if (DOM['result-achievements-list']) {
        DOM['result-achievements-list'].innerHTML = '';
        if (gameState.achievements.length > 0) {
            gameState.achievements.forEach(id => {
                const a = ACHIEVEMENTS[id]; if (!a) return;
                const div = document.createElement('div'); div.className = 'result-ach-item';
                div.innerHTML = `<span class="ach-icon">${a.icon}</span><span>${a.name} — ${a.desc}</span>`;
                DOM['result-achievements-list'].appendChild(div);
            });
        } else {
            DOM['result-achievements-list'].innerHTML = '<p style="color:#9CA3AF;font-size:13px">Nenhuma medalha de mérito conquistada.</p>';
        }
    }

    if (DOM['result-message']) DOM['result-message'].textContent = typeof c.message === 'function' ? c.message() : c.message;

    // Certificado: exibido apenas nos finais positivos, como reconhecimento de cidadania digital
    const certEndings = ['heroic', 'guardian', 'friend'];
    if (DOM['certificate']) {
        if (certEndings.includes(ending)) {
            DOM['certificate'].style.display = '';
            const certNameEl = document.getElementById('cert-name');
            const certDateEl = document.getElementById('cert-date');
            const certBadgeEl = document.getElementById('cert-badge-title');
            if (certNameEl) certNameEl.textContent = gameState.playerName || 'Jogador';
            if (certDateEl) certDateEl.textContent = `Emitido em ${new Date().toLocaleDateString('pt-BR')}`;
            if (certBadgeEl) certBadgeEl.textContent = `${prof.icon} ${prof.title}`;
        } else {
            DOM['certificate'].style.display = 'none';
        }
    }
}

function shareResultText() {
    const prof = getPlayerProfile();
    const text = `🎮 Joguei "Por Trás da Tela"!
👤 Jogador: ${gameState.playerName}
🏆 Perfil: ${prof.title} ${prof.icon}
🛡️ Segurança: ${gameState.security} | 💜 Empatia: ${gameState.empathy}
💪 Coragem: ${gameState.courage} | 🤝 Confiança: ${gameState.trust}
Aprenda sobre empatia e segurança digital também!`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showShareToast();
        });
    } else {
        alert(text);
    }
}

// Baixa o certificado como imagem PNG (usa html2canvas, carregado via CDN no index.html)
function downloadCertificateImage() {
    const certEl = DOM['certificate'];
    if (!certEl || certEl.style.display === 'none') {
        alert('Nenhum certificado disponível neste resultado.');
        return;
    }
    if (typeof html2canvas === 'undefined') {
        alert('Não foi possível carregar o gerador de imagem. Verifique sua conexão com a internet e tente novamente.');
        return;
    }
    html2canvas(certEl, { backgroundColor: '#111827', scale: 2 }).then(canvas => {
        const a = document.createElement('a');
        a.download = `certificado-${(gameState.playerName || 'jogador').replace(/\s+/g, '-')}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }).catch(() => {
        alert('Não foi possível gerar a imagem do certificado.');
    });
}

// ============================================
// SETUP DO JOGADOR (PERSONALIZAÇÃO)
// ============================================
function resetState() {
    gameState.chapter = 1; gameState.scene = 0;
    gameState.security = 50; gameState.empathy = 50;
    gameState.courage = 50; gameState.trust = 50;
    gameState.choices = [];
    // OBS: gameState.achievements, endingsUnlocked e postsMade NÃO são resetados aqui de propósito —
    // são um "troféu" permanente do jogador que deve sobreviver a novas partidas (corrige bug antigo
    // que apagava todas as medalhas toda vez que "Novo Jogo" era iniciado).
    gameState.choiceFlags = {};
    gameState.relationships = { rafael: 50, bia: 60, lucas: 50 };
    gameState.evidence = [];
    gameState.actionStats = { reports:0, peopleHelped:0, evidenceFound:0, contentNotShared:0 };
    gameState.chatRepliesUsed = {};
    
    if (DOM['rs-security']) DOM['rs-security'].style.width = '0%';
    if (DOM['rs-empathy']) DOM['rs-empathy'].style.width = '0%';
    if (DOM['rs-courage']) DOM['rs-courage'].style.width = '0%';
    if (DOM['rs-trust']) DOM['rs-trust'].style.width = '0%';
}

function openPlayerSetup() {
    showScreen('player-setup-screen');
}

// ============================================
// INTRODUÇÃO CINEMATOGRÁFICA — v2.0
// Uma sequência curta de frases antes do Capítulo 1, terminando no logo do jogo.
// ============================================
const INTRO_LINES = ['Uma mensagem.', 'Um comentário.', 'Uma publicação.', 'Uma escolha.', 'Uma consequência.'];
function runIntroCinematic(onDone) {
    showScreen('intro-cinematic-screen');
    if (DOM['intro-title-wrap']) DOM['intro-title-wrap'].style.display = 'none';
    if (DOM['intro-line']) { DOM['intro-line'].textContent = ''; DOM['intro-line'].classList.remove('show'); }

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        if (skipBtn) skipBtn.removeEventListener('click', finish);
        onDone();
    };
    const skipBtn = DOM['btn-skip-intro'];
    if (skipBtn) skipBtn.addEventListener('click', finish);

    // Sem animações / movimento reduzido: pula direto para o título, sem esperar.
    if (!settings.animations || settings.reducedMotion) {
        if (DOM['intro-title-wrap']) DOM['intro-title-wrap'].style.display = 'block';
        setTimeout(finish, 900);
        return;
    }

    const lineDuration = 1500;
    INTRO_LINES.forEach((line, i) => {
        setTimeout(() => {
            if (finished || !DOM['intro-line']) return;
            DOM['intro-line'].textContent = line;
            DOM['intro-line'].classList.remove('show');
            void DOM['intro-line'].offsetWidth;
            DOM['intro-line'].classList.add('show');
            SynthAudio.playSFX('notif');
        }, i * lineDuration);
    });
    setTimeout(() => {
        if (finished) return;
        if (DOM['intro-line']) DOM['intro-line'].textContent = '';
        if (DOM['intro-title-wrap']) DOM['intro-title-wrap'].style.display = 'block';
        SynthAudio.playSFX('chapter');
    }, INTRO_LINES.length * lineDuration);
    setTimeout(finish, INTRO_LINES.length * lineDuration + 2200);
}

function startNewGame() {
    const inputName = DOM['input-player-name'] ? DOM['input-player-name'].value.trim() : 'Alex';
    gameState.playerName = inputName || 'Alex';
    
    resetState(); 
    updateAllUI(); 
    SaveSystem.save();

    const beginChapterOne = () => {
        const ch = chapters[0];
        if (DOM['transition-chapter-num']) DOM['transition-chapter-num'].textContent = `Capítulo ${ch.id}`;
        if (DOM['transition-title']) DOM['transition-title'].textContent = ch.title;
        if (DOM['transition-desc']) DOM['transition-desc'].textContent = ch.desc;

        showScreen('chapter-transition');
        SynthAudio.startAmbientMusic();

        setTimeout(() => {
            showScreen('game-screen');
            renderScene();
        }, 3000);
    };

    runIntroCinematic(beginChapterOne);
}

function continueGame() {
    const saved = SaveSystem.load(); if (!saved) return;
    Object.assign(gameState, {
        playerName: saved.playerName || 'Alex',
        playerAvatar: saved.playerAvatar || '🧑',
        playerPronoun: saved.playerPronoun || 'neutro',
        chapter: saved.chapter || 1, scene: saved.scene || 0,
        security: saved.security ?? 50, empathy: saved.empathy ?? 50,
        courage: saved.courage ?? 50, trust: saved.trust ?? 50,
        choices: saved.choices||[], achievements: saved.achievements||[],
        choiceFlags: saved.choiceFlags||{},
        relationships: saved.relationships||{rafael:50,bia:60,lucas:50},
        evidence: saved.evidence||[],
        actionStats: saved.actionStats||{reports:0,peopleHelped:0,evidenceFound:0,contentNotShared:0},
        gamesPlayed: saved.gamesPlayed||0,
        hasPlayed: saved.hasPlayed||false, lastEnding: saved.lastEnding||null,
        chatRepliesUsed: saved.chatRepliesUsed||{},
        endingsUnlocked: saved.endingsUnlocked||[],
        postsMade: saved.postsMade||{}
    });
    
    updateAllUI(); 
    showScreen('game-screen'); 
    renderScene();
    SynthAudio.startAmbientMusic();
}

function openSidebar() { if (DOM['game-sidebar']) DOM['game-sidebar'].classList.add('open'); }
function closeSidebar() { if (DOM['game-sidebar']) DOM['game-sidebar'].classList.remove('open'); }

function renderAchievementsScreen() {
    const grid = DOM['achievements-grid'];
    if (!grid) return;
    grid.innerHTML = '';
    Object.values(ACHIEVEMENTS).forEach(a => {
        const unlocked = gameState.achievements.includes(a.id);
        const div = document.createElement('div');
        const secretClass = a.secret ? ' secret' : '';
        div.className = `ach-grid-item ${unlocked ? 'unlocked' : 'locked'}${secretClass}`;
        
        if (a.secret && !unlocked) {
            div.innerHTML = `<span class="ach-g-icon">❓</span><span class="ach-g-name">Conquista Secreta</span><span class="ach-g-desc">Jogue para descobrir como desbloquear.</span>`;
        } else {
            div.innerHTML = `<span class="ach-g-icon">${a.icon}</span><span class="ach-g-name">${a.name}</span><span class="ach-g-desc">${a.desc}</span>`;
        }
        grid.appendChild(div);
    });
}

// ============================================
// TELA "MEU PROGRESSO" (v2.0)
// ============================================
function renderProgressScreen() {
    const hasProgress = gameState.hasPlayed || gameState.chapter > 1 || gameState.choices.length > 0;
    if (DOM['progress-empty']) DOM['progress-empty'].style.display = hasProgress ? 'none' : 'block';
    if (DOM['progress-content']) DOM['progress-content'].style.display = hasProgress ? 'block' : 'none';
    if (!hasProgress) return;

    const s = gameState;
    if (DOM['pg-security']) DOM['pg-security'].style.width = s.security + '%';
    if (DOM['pg-empathy']) DOM['pg-empathy'].style.width = s.empathy + '%';
    if (DOM['pg-courage']) DOM['pg-courage'].style.width = s.courage + '%';
    if (DOM['pg-trust']) DOM['pg-trust'].style.width = s.trust + '%';
    if (DOM['pgv-security']) DOM['pgv-security'].textContent = s.security;
    if (DOM['pgv-empathy']) DOM['pgv-empathy'].textContent = s.empathy;
    if (DOM['pgv-courage']) DOM['pgv-courage'].textContent = s.courage;
    if (DOM['pgv-trust']) DOM['pgv-trust'].textContent = s.trust;

    if (DOM['pgrel-rafael']) DOM['pgrel-rafael'].style.width = s.relationships.rafael + '%';
    if (DOM['pgrel-bia']) DOM['pgrel-bia'].style.width = s.relationships.bia + '%';
    if (DOM['pgrel-lucas']) DOM['pgrel-lucas'].style.width = s.relationships.lucas + '%';
    if (DOM['pgrelv-rafael']) DOM['pgrelv-rafael'].textContent = s.relationships.rafael;
    if (DOM['pgrelv-bia']) DOM['pgrelv-bia'].textContent = s.relationships.bia;
    if (DOM['pgrelv-lucas']) DOM['pgrelv-lucas'].textContent = s.relationships.lucas;

    if (DOM['progress-action-stats']) {
        const as = s.actionStats;
        DOM['progress-action-stats'].innerHTML = `
            <div class="action-stat-item"><span class="action-stat-value">${s.gamesPlayed||0}</span><span class="action-stat-label">🎮 Partidas jogadas</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${as.reports||0}</span><span class="action-stat-label">🚨 Denúncias</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${s.evidence.length||0}</span><span class="action-stat-label">🔎 Evidências</span></div>
            <div class="action-stat-item"><span class="action-stat-value">${s.achievements.length}/${Object.keys(ACHIEVEMENTS).length}</span><span class="action-stat-label">🏆 Conquistas</span></div>`;
    }
}

// ============================================
// GALERIA DE FINAIS (v2.0)
// ============================================
const ENDING_ORDER = ['heroic', 'guardian', 'friend', 'neutral', 'silent', 'negative'];
function renderEndingsScreen() {
    const grid = DOM['endings-grid'];
    if (!grid) return;
    grid.innerHTML = '';
    const unlocked = gameState.endingsUnlocked || [];
    if (DOM['endings-progress-label']) DOM['endings-progress-label'].textContent = `${unlocked.length}/${ENDING_ORDER.length} finais descobertos`;

    ENDING_ORDER.forEach(id => {
        const cfg = ENDINGS_CONFIG[id];
        const isUnlocked = unlocked.includes(id);
        const div = document.createElement('div');
        div.className = `ach-grid-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        if (isUnlocked) {
            div.innerHTML = `<span class="ach-g-icon">${cfg.emoji}</span><span class="ach-g-name">${cfg.title}</span><span class="ach-g-desc">${cfg.subtitle}</span>`;
        } else {
            div.innerHTML = `<span class="ach-g-icon">🔒</span><span class="ach-g-name">Caminho desconhecido</span><span class="ach-g-desc">Jogue de forma diferente para descobrir este final.</span>`;
        }
        grid.appendChild(div);
    });
}

function applySettings() {
    if (DOM['toggle-music']) DOM['toggle-music'].checked = settings.music;
    if (DOM['toggle-sfx']) DOM['toggle-sfx'].checked = settings.sfx;
    if (DOM['volume-slider']) DOM['volume-slider'].value = settings.volume || 50;
    if (DOM['toggle-animations']) DOM['toggle-animations'].checked = settings.animations;
    if (DOM['text-speed']) DOM['text-speed'].value = settings.textSpeed || 'normal';
    if (DOM['toggle-reduced-motion']) DOM['toggle-reduced-motion'].checked = settings.reducedMotion;
    if (DOM['toggle-high-contrast']) DOM['toggle-high-contrast'].checked = settings.highContrast;
    if (DOM['text-size']) DOM['text-size'].value = settings.textSize || 'normal';

    document.body.classList.toggle('no-animations', !settings.animations);
    // Respeita também a preferência do sistema operacional, além do toggle manual
    const systemReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.toggle('reduce-motion', settings.reducedMotion || systemReducedMotion);
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.remove('text-size-large', 'text-size-xlarge');
    if (settings.textSize === 'large') document.body.classList.add('text-size-large');
    if (settings.textSize === 'xlarge') document.body.classList.add('text-size-xlarge');

    if (settings.music) SynthAudio.startAmbientMusic();
    else SynthAudio.stopMusic();
}

// ============================================
// CARREGAMENTO INICIAL
// ============================================
function runLoading() {
    const pc = document.getElementById('loading-particles');
    if (pc) {
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random()*100 + '%';
            p.style.animationDelay = Math.random()*4 + 's';
            p.style.animationDuration = (3+Math.random()*3) + 's';
            pc.appendChild(p);
        }
    }

    const texts = ['Decodificando cenários...', 'Sincronizando avatares escolares...', 'Ligando o simulador móvel...', 'Mapeando rumos de escolhas...'];
    let prog = 0, ti = 0;
    const iv = setInterval(() => {
        prog += Math.random()*18+5; if (prog>=100) prog=100;
        if (DOM['loading-bar']) DOM['loading-bar'].style.width = prog+'%';
        if (prog > (ti+1)*25 && ti < texts.length-1) { ti++; if (DOM['loading-text']) DOM['loading-text'].textContent = texts[ti]; }
        if (prog >= 100) {
            clearInterval(iv);
            if (DOM['loading-text']) DOM['loading-text'].textContent = 'Módulos prontos!';
            setTimeout(() => showScreen('menu-screen'), 500);
        }
    }, 180);
}

// ============================================
// REGISTRO DE EVENTOS
// ============================================
function setupEvents() {
    document.addEventListener('click', () => {
        SynthAudio.init();
    }, { once: true });

    if (DOM['btn-new-game']) {
        DOM['btn-new-game'].addEventListener('click', () => {
            if (SaveSystem.hasSave()) {
                showConfirm('Novo Jogo', 'Deseja iniciar nova rodada? O progresso existente no rolo de salvamento será excluído de forma irreversível.', () => { 
                    SaveSystem.clear(); 
                    openPlayerSetup(); 
                });
            } else {
                openPlayerSetup();
            }
        });
    }

    if (DOM['btn-setup-back']) DOM['btn-setup-back'].addEventListener('click', () => showScreen('menu-screen'));
    if (DOM['btn-start-game']) DOM['btn-start-game'].addEventListener('click', startNewGame);

    // Grid de Avatares no Setup
    if (DOM['avatar-grid']) {
        DOM['avatar-grid'].querySelectorAll('.avatar-option').forEach(btn => {
            btn.addEventListener('click', () => {
                DOM['avatar-grid'].querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                gameState.playerAvatar = btn.dataset.avatar;
            });
        });
    }

    // Pronomes no Setup
    document.querySelectorAll('.pronoun-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pronoun-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.playerPronoun = btn.dataset.pronoun;
        });
    });

    if (DOM['btn-continue']) DOM['btn-continue'].addEventListener('click', continueGame);
    
    if (DOM['btn-achievements-menu']) {
        DOM['btn-achievements-menu'].addEventListener('click', () => { 
            renderAchievementsScreen(); 
            showScreen('achievements-screen'); 
        });
    }

    if (DOM['btn-learn-more']) {
        DOM['btn-learn-more'].addEventListener('click', () => showScreen('learn-screen'));
    }

    if (DOM['btn-progress-menu']) {
        DOM['btn-progress-menu'].addEventListener('click', () => { renderProgressScreen(); showScreen('progress-screen'); });
    }
    if (DOM['btn-progress-back']) DOM['btn-progress-back'].addEventListener('click', () => showScreen('menu-screen'));

    if (DOM['btn-endings-menu']) {
        DOM['btn-endings-menu'].addEventListener('click', () => { renderEndingsScreen(); showScreen('endings-screen'); });
    }
    if (DOM['btn-endings-back']) DOM['btn-endings-back'].addEventListener('click', () => showScreen('menu-screen'));
    
    if (DOM['btn-settings']) DOM['btn-settings'].addEventListener('click', () => showScreen('settings-screen'));
    if (DOM['btn-about']) DOM['btn-about'].addEventListener('click', () => showScreen('about-screen'));

    if (DOM['btn-settings-back']) DOM['btn-settings-back'].addEventListener('click', () => showScreen('menu-screen'));
    if (DOM['btn-learn-back']) DOM['btn-learn-back'].addEventListener('click', () => showScreen('menu-screen'));
    
    if (DOM['toggle-music']) {
        DOM['toggle-music'].addEventListener('change', () => { 
            settings.music = DOM['toggle-music'].checked; 
            if (settings.music) SynthAudio.startAmbientMusic();
            else SynthAudio.stopMusic(); 
            SaveSystem.saveSettings(); 
        });
    }
    
    if (DOM['toggle-sfx']) {
        DOM['toggle-sfx'].addEventListener('change', () => { 
            settings.sfx = DOM['toggle-sfx'].checked; 
            SaveSystem.saveSettings(); 
        });
    }

    if (DOM['volume-slider']) {
        DOM['volume-slider'].addEventListener('input', () => {
            settings.volume = parseInt(DOM['volume-slider'].value);
            SaveSystem.saveSettings();
        });
    }
    
    if (DOM['toggle-animations']) {
        DOM['toggle-animations'].addEventListener('change', () => {
            settings.animations = DOM['toggle-animations'].checked;
            document.body.classList.toggle('no-animations', !settings.animations);
            SaveSystem.saveSettings();
        });
    }
    
    if (DOM['text-speed']) {
        DOM['text-speed'].addEventListener('change', () => { 
            settings.textSpeed = DOM['text-speed'].value; 
            SaveSystem.saveSettings(); 
        });
    }

    if (DOM['toggle-reduced-motion']) {
        DOM['toggle-reduced-motion'].addEventListener('change', () => {
            settings.reducedMotion = DOM['toggle-reduced-motion'].checked;
            applySettings();
            SaveSystem.saveSettings();
        });
    }

    if (DOM['toggle-high-contrast']) {
        DOM['toggle-high-contrast'].addEventListener('change', () => {
            settings.highContrast = DOM['toggle-high-contrast'].checked;
            applySettings();
            SaveSystem.saveSettings();
        });
    }

    if (DOM['text-size']) {
        DOM['text-size'].addEventListener('change', () => {
            settings.textSize = DOM['text-size'].value;
            applySettings();
            SaveSystem.saveSettings();
        });
    }
    
    if (DOM['btn-clear-data']) {
        DOM['btn-clear-data'].addEventListener('click', () => {
            showConfirm('Apagar Dados do Jogo', 'Limpar todo o histórico de medalhas e salvamentos da memória local do seu navegador?', () => {
                SaveSystem.clear(); 
                if (DOM['btn-continue']) DOM['btn-continue'].disabled = true; 
                showScreen('settings-screen');
            });
        });
    }

    if (DOM['btn-export-save']) {
        DOM['btn-export-save'].addEventListener('click', () => SaveSystem.exportSave());
    }
    if (DOM['btn-import-save'] && DOM['input-import-save']) {
        DOM['btn-import-save'].addEventListener('click', () => DOM['input-import-save'].click());
        DOM['input-import-save'].addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const ok = SaveSystem.importSave(reader.result);
                if (ok) {
                    if (DOM['btn-continue']) DOM['btn-continue'].disabled = false;
                    alert('Progresso importado com sucesso! Toque em "Continuar" no menu principal para retomar.');
                } else {
                    alert('Não foi possível importar esse arquivo. Verifique se é um arquivo de progresso válido exportado por este jogo.');
                }
                DOM['input-import-save'].value = '';
            };
            reader.readAsText(file);
        });
    }

    // Links reais de canais de ajuda (Disque 100 / CVV / SaferNet)
    document.querySelectorAll('.help-link').forEach(link => {
        link.addEventListener('click', () => unlockAchievement('redeDeApoio'));
    });

    if (DOM['btn-about-back']) DOM['btn-about-back'].addEventListener('click', () => showScreen('menu-screen'));
    if (DOM['btn-achievements-back']) DOM['btn-achievements-back'].addEventListener('click', () => showScreen('menu-screen'));

    if (DOM['btn-game-menu']) DOM['btn-game-menu'].addEventListener('click', openSidebar);
    if (DOM['btn-close-sidebar']) DOM['btn-close-sidebar'].addEventListener('click', closeSidebar);
    if (DOM['sidebar-overlay']) DOM['sidebar-overlay'].addEventListener('click', closeSidebar);
    
    if (DOM['btn-save-game']) {
        DOM['btn-save-game'].addEventListener('click', () => {
            SaveSystem.save(); closeSidebar();
            DOM['btn-save-game'].textContent = '✅ Salvo!';
            setTimeout(() => { if (DOM['btn-save-game']) DOM['btn-save-game'].textContent = '💾 Salvar Jogo'; }, 2000);
        });
    }
    
    if (DOM['btn-back-menu']) {
        DOM['btn-back-menu'].addEventListener('click', () => {
            showConfirm('Menu Principal', 'Deseja voltar ao menu inicial? O andamento da cena atual será devidamente resguardado.', () => {
                SaveSystem.save(); closeSidebar(); showScreen('menu-screen');
                if (DOM['btn-continue']) DOM['btn-continue'].disabled = !SaveSystem.hasSave();
            });
        });
    }

    if (DOM['btn-close-tip']) DOM['btn-close-tip'].addEventListener('click', closeTip);

    if (DOM['btn-play-again']) DOM['btn-play-again'].addEventListener('click', () => { SaveSystem.clear(); openPlayerSetup(); });
    if (DOM['btn-share-result']) DOM['btn-share-result'].addEventListener('click', shareResultText);
    if (DOM['btn-download-cert']) DOM['btn-download-cert'].addEventListener('click', downloadCertificateImage);
    if (DOM['btn-result-menu']) DOM['btn-result-menu'].addEventListener('click', () => { showScreen('menu-screen'); if (DOM['btn-continue']) DOM['btn-continue'].disabled = !SaveSystem.hasSave(); });

    const tabs = ['messages', 'conecta', 'notifications', 'evidence'];
    tabs.forEach(tab => {
        const btn = DOM[`phone-nav-${tab}`];
        if (btn) {
            btn.addEventListener('click', () => {
                if (currentPhoneScene) {
                    SynthAudio.playSFX('click');
                    setActiveTabButton(tab);
                    renderPhoneScene(currentPhoneScene, tab);
                }
            });
        }
    });

    setupHubEvents();

    // Modal "Postar no Conecta" (delegação de evento pois o botão é recriado a cada render)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-open-post-modal')) openPostModal();
    });
    if (DOM['btn-close-post-modal']) DOM['btn-close-post-modal'].addEventListener('click', closePostModal);
    if (DOM['post-modal']) {
        DOM['post-modal'].addEventListener('click', (e) => { if (e.target === DOM['post-modal']) closePostModal(); });
    }
    if (DOM['btn-close-report-modal']) DOM['btn-close-report-modal'].addEventListener('click', closeReportModal);
    if (DOM['report-modal']) {
        DOM['report-modal'].addEventListener('click', (e) => { if (e.target === DOM['report-modal']) closeReportModal(); });
    }

    document.addEventListener('keydown', e => {
        const isGameActive = DOM['game-screen'] && DOM['game-screen'].classList.contains('active');
        if (!isGameActive) return;

        // Se a tela de reflexão estiver aberta, bloqueia respostas normais 1-4
        if (DOM['reflection-container'] && DOM['reflection-container'].style.display === 'flex') {
            return;
        }
        
        const map = {'1':0,'2':1,'3':2,'4':3,'a':0,'b':1,'c':2,'d':3};
        const k = e.key.toLowerCase();
        if (map[k] !== undefined) {
            const btns = DOM['choices-container'] ? DOM['choices-container'].querySelectorAll('.choice-btn') : [];
            const pBtns = DOM['phone-screen'] ? DOM['phone-screen'].querySelectorAll('.phone-choice-btn') : [];
            const iBtns = DOM['investigation-choices'] ? DOM['investigation-choices'].querySelectorAll('.choice-btn') : [];
            const all = btns.length ? btns : pBtns.length ? pBtns : iBtns;
            if (all && all[map[k]]) all[map[k]].click();
        }
        if (e.key === 'Escape') {
            if (DOM['game-sidebar'] && DOM['game-sidebar'].classList.contains('open')) closeSidebar();
            if (DOM['tip-overlay'] && DOM['tip-overlay'].style.display === 'flex') DOM['btn-close-tip'].click();
        }
    });

    // Acessibilidade: Esc fecha o modal de confirmação em qualquer tela (não só durante o jogo)
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        if (DOM['confirm-modal'] && DOM['confirm-modal'].style.display === 'flex') {
            if (DOM['confirm-cancel']) DOM['confirm-cancel'].click();
        }
        if (DOM['post-modal'] && DOM['post-modal'].style.display === 'flex') closePostModal();
        if (DOM['report-modal'] && DOM['report-modal'].style.display === 'flex') closeReportModal();
    });
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    cacheDom();
    SaveSystem.loadSettings();
    applySettings();
    
    if (DOM['btn-continue']) DOM['btn-continue'].disabled = !SaveSystem.hasSave();
    
    const saved = SaveSystem.load();
    if (saved) {
        if (saved.achievements) gameState.achievements = saved.achievements;
        if (saved.gamesPlayed) gameState.gamesPlayed = saved.gamesPlayed;
    }
    
    setupEvents();
    runLoading();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}