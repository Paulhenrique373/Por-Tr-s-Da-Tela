/* ============================================
   POR TRÁS DA TELA — SCRIPT CORRIGIDO & COMPLETO
   ============================================ */

// ============================================
// AUDIO SINTETIZADO (Web Audio API)
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
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
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
    hasPlayed: false,
    lastEnding: null
};

// ============================================
// CONFIGURAÇÕES
// ============================================
const settings = {
    music: true,
    sfx: true,
    animations: true,
    textSpeed: 'normal'
};

// ============================================
// FUNÇÕES UTILITÁRIAS DE TELA E LÓGICA (CORRIGIDAS)
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
    } else {
        console.error(`Tela #${id} não encontrada.`);
    }
}

let pendingAction = null;
let confirmHandlers = { accept: null, cancel: null };

function showConfirm(title, text, onAccept) {
    DOM['confirm-title'].textContent = title;
    DOM['confirm-text'].textContent = text;
    DOM['confirm-modal'].style.display = 'flex';

    if (confirmHandlers.accept) DOM['confirm-accept'].removeEventListener('click', confirmHandlers.accept);
    if (confirmHandlers.cancel) DOM['confirm-cancel'].removeEventListener('click', confirmHandlers.cancel);

    confirmHandlers.accept = () => {
        DOM['confirm-modal'].style.display = 'none';
        onAccept();
    };
    confirmHandlers.cancel = () => {
        DOM['confirm-modal'].style.display = 'none';
    };

    DOM['confirm-accept'].addEventListener('click', confirmHandlers.accept);
    DOM['confirm-cancel'].addEventListener('click', confirmHandlers.cancel);
}

function getCurrentChapter() {
    return chapters.find(c => c.id === gameState.chapter);
}

function getCurrentScene() {
    const chapter = getCurrentChapter();
    return chapter ? (chapter.scenes[gameState.scene] || null) : null;
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
        name: 'Você',
        avatar: '🧑',
        nameClass: 'player',
        expressions: { normal: '🧑', worried: '😟', determined: '😤', happy: '😊' }
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
// CONQUISTAS
// ============================================
const ACHIEVEMENTS = {
    guardian: { id: 'guardian', icon: '🛡️', name: 'Guardião Digital', desc: 'Tomou decisões seguras em todas as situações.' },
    empath: { id: 'empath', icon: '💜', name: 'Grande Aliado', desc: 'Apoiou todos os personagens que precisaram de ajuda.' },
    reporter: { id: 'reporter', icon: '🚨', name: 'Voz Ativa', desc: 'Denunciou perfis ou imagens falsas.' },
    witness: { id: 'witness', icon: '👀', name: 'Testemunha Atenta', desc: 'Identificou os ataques de cyberbullying de imediato.' },
    secondChance: { id: 'secondChance', icon: '🔄', name: 'Segunda Chance', desc: 'Jogou novamente buscando mudar o rumo das escolhas.' },
    brave: { id: 'brave', icon: '🦁', name: 'Corajoso', desc: 'Defendeu Rafael publicamente e de forma responsável.' },
    investigator: { id: 'investigator', icon: '🔎', name: 'Investigador Digital', desc: 'Encontrou todas as evidências cruciais do caso.' },
    trueFriend: { id: 'trueFriend', icon: '🤝', name: 'Amigo de Verdade', desc: 'Conquistou a confiança total do Rafael.' }
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
// HISTÓRIA COMPLETA DE 5 CAPÍTULOS
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
                text: 'Segunda-feira de manhã na Escola Estadual Heitor Vila-Lobos. O sinal do intervalo acaba de tocar. Enquanto você se senta nas arquibancadas do pátio, seu celular vibra repetidamente no bolso.\n\nO grupo principal da sua turma está em polvorosa.',
                choices: [{ text: 'Verificar notificações', next: 1 }]
            },
            {
                type: 'narrative',
                visual: '😊', location: 'Pátio da escola',
                character: 'bia', expression: 'worried',
                text: '"Ei, você viu o celular?" Bia se aproxima correndo, a testa franzida em preocupação. "A galera da frente tá com os celulares ligados desde a aula de Geografia. Tá rolando uma palhaçada muito errada no grupo..."',
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
                afterText: 'Eles estão atacando a coordenação motora de Rafael, um garoto tímido que costuma desenhar no canto da sala. Alguém tirou uma foto dele caindo na quadra e começou a espalhar.',
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
                text: 'Seu riso incitou as mensagens seguintes de Pedro e Fernanda. Rafael passou pelo corredor de cabeça baixa minutos depois, segurando as lágrimas. A zombaria se espalhou pelo andar inferior da escola.',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '🤷',
                character: 'bia', expression: 'sad',
                text: '"Nossa... ninguém faz nada." Bia murmura, vendo Lucas digitar furiosamente ao fundo. Você guardou o celular, mas a sensação de que algo ruim foi tolerado permanece no ar.',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '📸',
                character: 'narrator', expression: 'normal',
                text: 'O print foi salvo na galeria secreta do seu celular. Bia sorri de canto. "Acho excelente. Esses posts costumam ser apagados rapidamente quando a escola descobre."',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            },
            {
                type: 'narrative', visual: '💬',
                character: 'player', expression: 'determined',
                text: 'Sua mensagem fez o chat esfriar. Lucas respondeu com desdém ("Ah, virou fiscal de piada agora?"), mas Pedro parou de mandar emojis de risos. Bia envia uma mensagem privada: "Valeu por se posicionar. Eu estava com medo de falar sozinha."',
                choices: [{ text: 'Terminar o intervalo', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 2 ---
    {
        id: 2,
        title: "O Perfil Falso",
        desc: "Um perfil anônimo surge na rede social Conecta focado apenas em ridicularizar Rafael. Como agir?",
        scenes: [
            {
                type: 'narrative', visual: '👤', location: 'Quarto do jogador — Quarta-feira',
                character: 'narrator', expression: 'normal',
                text: 'Quarta-feira, 20:45. Você está terminando um trabalho escolar quando um story marcado por colegas no Conecta chama sua atenção.\n\nUm perfil foi criado: @rafael_ridiculo. A foto de exibição é o rosto de Rafael montado no corpo de um burro.',
                choices: [{ text: 'Abrir a rede social Conecta', next: 1 }]
            },
            {
                type: 'phone', phoneType: 'profile',
                profileData: {
                    avatar: '🤡', name: '@rafael_ridiculo',
                    bio: '"Fã clube oficial do moleque mais bizarro do colégio. Postamos suas maiores burrices diárias."\n47 seguidores · 3 posts humilhantes.',
                    isFake: true
                },
                afterText: 'O bullying virtual escalou de um grupo privado para um espaço público da comunidade. Colegas da turma estão comentando nas fotos de montagens.',
                choices: [
                    {
                        letter: 'A', text: 'Seguir o perfil falso e marcar amigos',
                        effects: { security: -10, empathy: -20, courage: -10, trust: -15 },
                        relEffects: { rafael: -20, lucas: 10 },
                        flag: 'ch2_followed_fake',
                        tip: 'Seguir e marcar conhecidos em perfis fakes de perseguição aumenta o engajamento do algoritmo, ampliando o constrangimento e legitimando a agressão.',
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
                text: 'Seu follow ajudou a elevar a conta na barra de descobertas da escola. Outros adolescentes começaram a rir na seção de comentários. Rafael agora é assunto de sussurros nos armários.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🤐',
                character: 'narrator', expression: 'normal',
                text: 'Você optou por fechar o aplicativo. No dia seguinte, Rafael foi visto sozinho perto da sala dos professores com os olhos vermelhos. Ninguém derrubou a página.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🚨',
                character: 'narrator', expression: 'normal',
                text: 'Sua denúncia por assédio e falsidade ideológica ajudou. O algoritmo enviou o perfil falso para revisão de conteúdo e ele caiu temporariamente nas horas seguintes.',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'narrative', visual: '🤝',
                character: 'rafael', expression: 'sad',
                text: 'Rafael responde sua mensagem no privado de forma tímida:\n\n"Oi... vi sim. Eu nem queria ir amanhã para a aula. Mas obrigado por avisar e mandar os prints, ajuda saber que alguém não acha isso normal..."',
                choices: [{ text: 'Investigar quem fez isso', next: 6 }]
            },
            {
                type: 'investigation',
                desc: 'Clique em cada elemento do mural abaixo para identificar possíveis inconsistências que indiquem a autoria do perfil falso.',
                evidenceItems: [
                    { id: 'ev_post_time', icon: '🕐', label: 'Horários das postagens', detail: 'As fotos foram enviadas precisamente às 22h15 de quarta-feira. Lucas estava jogando e ativo no bate-papo de voz da turma nesse exato horário.' },
                    { id: 'ev_writing_style', icon: '✍️', label: 'Vícios linguísticos', detail: 'A bio do perfil usa gírias de games muito específicas e o termo "vlw flw", característico do jeito de digitar de Lucas.' },
                    { id: 'ev_followers', icon: '👥', label: 'Lista de contatos iniciais', detail: 'Os primeiros três seguidores da página foram Pedro, Fernanda e o próprio perfil principal do Lucas.' },
                    { id: 'ev_photo_source', icon: '📸', label: 'Origem da imagem base', detail: 'A imagem original de Rafael na quadra de esportes foi registrada de um ângulo muito próximo de onde Lucas estava sentado.' }
                ],
                afterText: 'As evidências apontam fortemente para Lucas, mas lembre-se: expor suspeitas públicas sem provas confiáveis também gera linchamento digital. Qual será sua conduta?',
                choices: [
                    {
                        letter: 'A', text: 'Confrontar Lucas no chat público do grupo de jogos',
                        effects: { security: -5, empathy: 5, courage: 10, trust: -10 },
                        relEffects: { lucas: -20, rafael: -5 },
                        flag: 'ch2_confronted_lucas',
                        tip: 'Acusações digitais informais sem base consolidada dão espaço para que o agressor se faça de vítima, inflamando o ódio contra você.',
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
                text: '"Tá maluco?!" Lucas responde irado no chat do game. "Só porque eu sigo o post quer dizer que fui eu que criei? Não viaja, nerd do caramba!"\n\nA discussão dispersou as pessoas e deixou Lucas alerta. Ele apagou vestígios digitais e as pistas sumiram.',
                choices: [{ text: 'Prosseguir na semana', goHub: true }]
            },
            {
                type: 'narrative', visual: '👩‍🏫',
                character: 'ana', expression: 'serious',
                text: 'Professora Ana ouve e analisa seu PDF de evidências detalhadamente. "Excelente iniciativa em documentar isso de maneira reservada. Esse dossiê impede que eles neguem o ocorrido. Vou encaminhar à coordenação para intervir legalmente."',
                choices: [{ text: 'Prosseguir na semana', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 3 ---
    {
        id: 3,
        title: "O Grupo de Exclusão",
        desc: "Você é arrastado para um canal de chat clandestino criado especificamente para isolar Rafael.",
        scenes: [
            {
                type: 'reflection',
                question: 'Imagine que um grupo de colegas influentes da sua turma cria um chat secreto com a única intenção de decidir quem será banido das atividades sociais e festas. Se você sair, pode virar o próximo alvo.\n\nQual decisão você costuma tomar diante de cenários de pressão social real?',
                reflectionChoices: [
                    'Permanecer calado para autopreservação',
                    'Sair do chat mesmo sob risco de retaliação',
                    'Ficar e contestar as atitudes ofensivas',
                    'Coletar as provas e denunciar aos responsáveis'
                ],
                feedback: 'A pressão de grupo é uma das maiores causas de negligência digital. Permanecer passivo legitima os agressores. Sair do grupo e reportar aos mentores escolares quebra o círculo vicioso do bullying sem colocar você em risco físico direto.',
                next: 1
            },
            {
                type: 'narrative', visual: '📱', location: 'Quarto do jogador — Sexta-feira à noite',
                character: 'narrator', expression: 'normal',
                text: 'Sexta-feira à noite. Você recebe um alerta vibratório de um aplicativo de mensagens de comunidade:\n\n"Pedro.zz incluiu seu perfil no chat de conferência: BANDO DO 9B (Sem o Esquisito)"',
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
                afterText: 'O isolamento social sistemático e deliberado é tipificado como violência psicológica. Há muita pressão para manter a panelinha coesa contra o garoto.',
                choices: [
                    {
                        letter: 'A', text: 'Concordar e ajudar a planejar o isolamento do Rafael',
                        effects: { security: -15, empathy: -25, courage: -10, trust: -20 },
                        relEffects: { rafael: -20, bia: -15, lucas: 15 },
                        flag: 'ch3_participated',
                        tip: 'Participar ativamente de projetos de isolamento de um aluno é assédio moral e pode gerar sansões escolares pesadas de acordo com as leis anti-bullying.',
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
                text: 'Sua conivência deu força à exclusão. Rafael foi deixado de fora do trabalho de História por todos e acabou realizando a atividade sozinho na biblioteca, visivelmente abalado.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '😶',
                character: 'bia', expression: 'worried',
                text: 'Bia mandou mensagem irritada no dia seguinte: "Você viu como eles planejaram ignorar ele no pátio? E ninguém diz nada naquele maldito chat público. É triste demais..."',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '🚪',
                character: 'bia', expression: 'relieved',
                text: 'Sua saída do grupo inspirou Bia a fazer o mesmo minutos depois. O bando perdeu duas testemunhas silenciosas de uma só vez, enfraquecendo a narrativa agressora do grupo.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            {
                type: 'narrative', visual: '🏫',
                character: 'ana', expression: 'serious',
                text: 'Professora Ana acionou a coordenação imediatamente. "Esta organização secreta de alunos para isolar outros é uma infração grave. Ter os prints dos administradores e membros nos poupa tempo de apuração."',
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // --- CAPÍTULO 4 ---
    {
        id: 4,
        title: "A Imagem Vazada",
        desc: "Uma foto de caráter estritamente pessoal e de privacidade confidencial do Rafael cai nas redes sociais.",
        scenes: [
            {
                type: 'narrative', visual: '⚠️', location: 'Refeitório — Terça-feira',
                character: 'bia', expression: 'scared',
                text: 'Terça-feira, hora do lanche. Bia puxa você com força para debaixo da escada do pavilhão. "É grave... muito grave. Conseguiram hackear ou roubar o celular do Rafael e pegaram uma foto dele de cueca em um exame médico. Estão encaminhando no Conecta..."',
                choices: [{ text: 'Analisar notificações', next: 1 }]
            },
            {
                type: 'phone', phoneType: 'notifications',
                notifications: [
                    { icon: '💬', text: 'Lucas_gamer: "Olha a joia preciosa no refeitório" (Imagem)', time: 'Agora' },
                    { icon: '📩', text: 'Pedro.zz encaminhou um arquivo de imagem', time: '1 min' },
                    { icon: '🌐', text: 'Mencionaram você na publicação de vazamento no Conecta', time: '3 min' }
                ],
                afterText: 'O vazamento de fotos íntimas ou de nudez parcial sem consentimento é crime grave tipificado no Código Penal brasileiro. O refeitório está em alvoroço.',
                choices: [
                    {
                        letter: 'A', text: 'Encaminhar o conteúdo para rir com contatos externos',
                        effects: { security: -20, empathy: -30, courage: -15, trust: -25 },
                        relEffects: { rafael: -30, bia: -20, lucas: 10 },
                        flag: 'ch4_shared_image',
                        tip: 'Repassar fotos íntimas, além de um dano irreversível para a vítima, torna você coautor de um crime passível de punição civil e penal pela justiça de menores.',
                        next: 2
                    },
                    {
                        letter: 'B', text: 'Manter a imagem salva no celular, sem compartilhar',
                        effects: { security: -5, empathy: -10, courage: 0, trust: -10 },
                        flag: 'ch4_kept_image',
                        actionStat: 'contentNotShared',
                        tip: 'Armazenar fotos íntimas de terceiros sem consentimento em seu dispositivo pessoal viola diretrizes de privacidade e termos éticos.',
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
                text: 'Sua atitude de encaminhar fez com que o vazamento chegasse aos grupos das escolas vizinhas. Rafael entrou em surto emocional, foi internado com crise severa de pânico e não sairá mais de casa este semestre.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '😔',
                character: 'narrator', expression: 'normal',
                text: 'A foto permaneceu no seu dispositivo por dias. Embora você não tenha encaminhado, sua omissão permitiu que o assédio moral continuasse desenfreado pelos corredores.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '🗑️',
                character: 'bia', expression: 'relieved',
                text: '"Você apagou né? Eu também deletei de imediato. Isso é nojento demais..." Bia balança a cabeça aliviada. Mas o assunto continua correndo de boca em boca na cantina. É preciso que os mentores entrem em campo.',
                choices: [{ text: 'Ir para a Reunião Final', goHub: true }]
            },
            {
                type: 'narrative', visual: '✊',
                character: 'ana', expression: 'serious',
                text: 'Professora Ana aciona os pais de Lucas e de Pedro na coordenação imediatamente. "Com esses prints registrando os remetentes iniciais, temos material probatório indiscutível para o Conselho Tutelar e a polícia de crimes digitais."',
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
                text: 'Uma semana após o auge da crise. A escola está reunida no auditório principal para discutir segurança digital, responsabilidade social e empatia.\n\nRafael está presente na última fileira, ainda retraído e quieto. Ele avista você.',
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
                    if (r >= 70) {
                        return '"Ei... eu queria agradecer de verdade. Quando toda aquela loucura começou com o perfil falso e as mensagens, eu achei que ia ter que sair da escola. Mas você se importou de verdade em me ajudar..."';
                    } else if (r >= 45) {
                        return '"Oi... as coisas estão um pouco difíceis, mas fico aliviado que a professora interveio. Obrigado por não ter me atacado na internet de qualquer forma..."';
                    } else {
                        return '"..." Rafael desvia os olhos de forma amedrontada quando você tenta se aproximar. Ele não confia em absolutamente ninguém da turma.';
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
                        return '"A diretora quer que algum aluno vá lá na frente dar o depoimento para abrir o debate. Que bom que agimos juntos nisso. Vai lá e representa a gente."';
                    } else {
                        return '"A diretora está chamando alguém para falar na tribuna. Todo mundo tá fingindo que não vê nada. O silêncio deles é doloroso..."';
                    }
                },
                choices: [{ text: 'Subir ao palco do auditório', next: 3 }]
            },
            {
                type: 'narrative', visual: '🎤', location: 'Tribuna do auditório',
                character: 'narrator', expression: 'normal',
                text: 'A diretora passa o microfone. A plateia de alunos está dispersa, muitos ainda usando celulares de forma oculta pelas calças. Qual será sua atitude?',
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
                        decisionText: 'Você formalizou diretrizes éticas e práticas contra abusos escolares.',
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
                text: '"Cyberbullying não é brincadeira. Quando rimos de fotos roubadas, criamos os monstros que nos atormentam amanhã. Nós somos responsáveis por quem é excluído nos chats..."\n\nSua fala arrancou palmas do pavilhão de cima. Rafael sorri tímido pela primeira vez.',
                choices: [{ text: 'Ver Resultados', end: true }]
            },
            {
                type: 'narrative', visual: '💚',
                character: 'rafael', expression: 'relieved',
                text: 'Você caminha e se senta ao lado de Rafael. No início ele hesita, mas depois desabafa sobre tudo. Bia junta-se a vocês. Ali no auditório, longe das telas de ódio, um laço de amizade real e duradouro começou a se reconstruir.',
                choices: [{ text: 'Ver Resultados', end: true }]
            },
            {
                type: 'narrative', visual: '🌟',
                character: 'narrator', expression: 'normal',
                text: 'Sua proposta de canal anônimo de denúncias foi aprovada e integrada à grade educacional. Os agressores agora pensam duas vezes antes de iniciar deboches digitais, pois sabem que a rede de denúncia escolar é ativa e vigilante. Rafael finalmente respira aliviado.',
                choices: [{ text: 'Ver Resultados', end: true }]
            }
        ]
    }
];

// ============================================
// ELEMENTOS DO DOM
// ============================================
const DOM = {};
function cacheDom() {
    const ids = [
        'loading-screen','menu-screen','settings-screen','about-screen','achievements-screen',
        'game-screen','hub-screen','chapter-transition','result-screen',
        'loading-bar','loading-text',
        'btn-new-game','btn-continue','btn-achievements-menu','btn-settings','btn-about',
        'btn-settings-back','toggle-music','toggle-sfx','toggle-animations','text-speed','btn-clear-data',
        'btn-about-back','btn-achievements-back','achievements-grid',
        'btn-game-menu','chapter-indicator','chapter-title-header',
        'ms-security','ms-empathy','ms-courage','ms-trust',
        'narrative-container','scene-visual','scene-location','character-display','char-avatar-large','char-expression',
        'speaker-name','dialogue-text','dialogue-continue','choices-container',
        'phone-container','phone-screen','phone-time','phone-nav-bar','notif-badge',
        'investigation-container','investigation-desc','evidence-board','evidence-list','investigation-choices',
        'reflection-container','reflection-question','reflection-choices','reflection-feedback','reflection-tip-text','reflection-continue-btn',
        'game-sidebar','sidebar-overlay','btn-close-sidebar',
        'sf-security','sf-empathy','sf-courage','sf-trust','sv-security','sv-empathy','sv-courage','sv-trust',
        'rel-rafael','rel-bia','rel-lucas','relv-rafael','relv-bia','relv-lucas',
        'sidebar-evidence','sidebar-achievements-list',
        'btn-save-game','btn-back-menu',
        'hub-completed','hub-phone-btn','hub-evidence-btn','hub-relationships-btn','hub-continue-btn','hub-next-chapter-desc','hub-phone-badge',
        'hub-phone-panel','hub-phone-content','hub-evidence-panel','hub-evidence-content','hub-relationships-panel','hub-relationships-content',
        'transition-chapter-num','transition-title','transition-desc',
        'tip-overlay','tip-text','btn-close-tip',
        'achievement-toast','ach-toast-icon','ach-toast-name',
        'stat-toast-container',
        'evidence-toast','evidence-toast-name',
        'rel-toast','rel-toast-avatar','rel-toast-text',
        'result-emoji','result-header','result-title','result-subtitle',
        'result-profile-card','profile-badge-icon','profile-title','profile-desc',
        'rs-security','rs-empathy','rs-courage','rs-trust','rsv-security','rsv-empathy','rsv-courage','rsv-trust',
        'result-action-stats','action-stats-grid',
        'result-decisions-list','result-achievements-list','result-message',
        'btn-play-again','btn-result-menu',
        'confirm-modal','confirm-title','confirm-text','confirm-cancel','confirm-accept',
        'scene-image-container',
        'phone-nav-messages','phone-nav-conecta','phone-nav-notifications','phone-nav-evidence'
    ];
    ids.forEach(id => { DOM[id] = document.getElementById(id); });
}

// ============================================
// SALVAMENTO NO LOCALSTORAGE
// ============================================
const SaveSystem = {
    KEY: 'por_tras_da_tela_save_v4',
    SKEY: 'por_tras_da_tela_settings_v4',
    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify({
                chapter: gameState.chapter, scene: gameState.scene,
                security: gameState.security, empathy: gameState.empathy,
                courage: gameState.courage, trust: gameState.trust,
                choices: gameState.choices, achievements: gameState.achievements,
                choiceFlags: gameState.choiceFlags,
                relationships: gameState.relationships,
                evidence: gameState.evidence,
                actionStats: gameState.actionStats,
                hasPlayed: gameState.hasPlayed, lastEnding: gameState.lastEnding,
                savedAt: Date.now()
            }));
            return true;
        } catch(e) { return false; }
    },
    load() {
        try { const r = localStorage.getItem(this.KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; }
    },
    hasSave() { return !!localStorage.getItem(this.KEY); },
    clear() { localStorage.removeItem(this.KEY); },
    saveSettings() { try { localStorage.setItem(this.SKEY, JSON.stringify(settings)); } catch(e) {} },
    loadSettings() {
        try {
            const r = localStorage.getItem(this.SKEY);
            if (r) Object.assign(settings, JSON.parse(r));
        } catch(e) {}
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
    DOM['evidence-toast-name'].textContent = name;
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
    DOM['rel-toast-avatar'].textContent = char.avatar;
    const sign = value > 0 ? '+' : '';
    DOM['rel-toast-text'].textContent = `${char.name} ${sign}${value} de afinidade`;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'slideInLeft .3s ease, fadeOut .4s ease 2s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 2800);
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

function updateAllUI() {
    updateStatsUI(); updateRelationshipsUI(); updateEvidenceUI(); updateAchievementsUI(); updateChapterHeader();
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
// VELOCIDADE DE DIGITAÇÃO DO TEXTO
// ============================================
function getTextSpeed() {
    const speeds = { fast: 8, normal: 18, slow: 35, instant: 0 };
    return speeds[settings.textSpeed] || 18;
}

function typewriter(element, text, callback) {
    if (!element) return;
    const speed = getTextSpeed();
    if (speed === 0 || !settings.animations) { element.textContent = text; if (callback) callback(); return; }
    let i = 0; element.textContent = '';
    const interval = setInterval(() => {
        if (i < text.length) { element.textContent += text[i]; i++; }
        else { clearInterval(interval); if (callback) callback(); }
    }, speed);
    const skip = () => { clearInterval(interval); element.textContent = text; element.removeEventListener('click', skip); if (callback) callback(); };
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
        DOM['phone-screen'].querySelectorAll('.phone-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleChoice(scene.choices[parseInt(btn.dataset.ci)], parseInt(btn.dataset.ci));
            });
        });

        DOM['phone-screen'].querySelectorAll('.conecta-action').forEach(btn => {
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
                        btn.classList.add('reported');
                        btn.querySelector('span').textContent = 'Denunciado';
                        showStatToast('🚨 Denúncia registrada', 1);
                        gameState.actionStats.reports++;
                        SynthAudio.playSFX('notif');
                    }
                }
            });
        });
    }
}

function renderPhoneChat(scene) {
    let h = `<div class="phone-app-header"><span style="font-size:16px">←</span><span class="phone-app-name">${scene.appName||'💬 Chat'}</span></div>`;
    (scene.messages||[]).forEach((m,i) => {
        const off = m.offensive ? ' offensive' : '';
        h += `<div class="phone-message" style="animation-delay:${i*.12}s">
                <div class="phone-msg-avatar">${m.avatar}</div>
                <div class="phone-msg-body">
                    <div class="phone-msg-name">${m.name}</div>
                    <div class="phone-msg-text${off}">${m.text}</div>
                    <div class="phone-msg-time">${m.time}</div>
                </div>
              </div>`;
    });
    return h;
}

function renderPhoneConecta(scene) {
    let h = `<div class="phone-app-header"><span class="phone-app-name">🌐 Conecta 9B</span></div>`;
    
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
            if (!card.classList.contains('found')) {
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
// HUB DE INTERVALO
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

    if (DOM['hub-phone-badge']) DOM['hub-phone-badge'].style.display = gameState.evidence.length > 0 ? 'inline-block' : 'none';
    showScreen('hub-screen');
}

function setupHubEvents() {
    if (DOM['hub-phone-btn']) {
        DOM['hub-phone-btn'].addEventListener('click', () => {
            let html = '<div class="phone-app-header"><span class="phone-app-name">📱 Dispositivo Integrado</span></div>';
            html += '<div style="padding:14px 16px"><h4 style="font-size:13px;color:var(--purple);margin-bottom:10px">💬 Caixa de Entrada Recente</h4>';
            html += '<p style="font-size:13px;color:#9CA3AF;line-height:1.6">Nenhuma nova transmissão ativa. Você pode analisar as mídias salvas nos painéis de evidências.</p></div>';
            
            if (DOM['hub-phone-content']) DOM['hub-phone-content'].innerHTML = html;
            if (DOM['hub-phone-panel']) DOM['hub-phone-panel'].style.display = 'flex';
        });
    }

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
                    if (v >= 70) return 'Rafael enxerga você como um abrigo seguro e uma das únicas pessoas justas na turma.';
                    if (v >= 45) return 'Rafael está receoso devido à pressão da turma, mas respeita sua neutralidade.';
                    return 'Rafael se sente ameaçado e alienado por suas posturas apáticas ou ativas nas zombarias.';
                }},
                { id: 'bia', desc: function() {
                    const v = gameState.relationships.bia;
                    if (v >= 70) return 'Bia tem extrema admiração por suas intervenções e se sente encorajada.';
                    if (v >= 45) return 'Bia valoriza sua amizade, embora queira ver mais de suas atitudes de liderança.';
                    return 'Bia está bastante desapontada com sua tolerância com os deboches virtuais.';
                }},
                { id: 'lucas', desc: function() {
                    const v = gameState.relationships.lucas;
                    if (v >= 60) return 'Lucas o enxerga como parceiro de zombarias e assume que você concorda com seu bullying.';
                    if (v >= 35) return 'Lucas está um tanto indiferente às suas posições na turma.';
                    return 'Lucas se sente desconfortável com suas condutas de barreira e denúncias ativas.';
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
// RESULTADO FINAL
// ============================================
function getPlayerProfile() {
    const s = gameState, f = s.choiceFlags;
    const profiles = [
        { id: 'guardian', icon: '🛡️', title: 'Guardião Digital', desc: 'Sua conduta de coleta sistemática de provas e preservação da segurança jurídica e psicológica blindou as vítimas e responsabilizou os detratores.', req: () => s.security >= 70 && !f['ch4_shared_image'] },
        { id: 'ally', icon: '💜', title: 'Grande Aliado', desc: 'Sua empatia ativa garantiu abrigo social à vítima de forma consistente, impedindo o adoecimento emocional severo do Rafael.', req: () => s.empathy >= 75 && s.relationships.rafael >= 65 },
        { id: 'investigator', icon: '🔎', title: 'Perito Digital', desc: 'Sua vocação investigativa não permitiu que mentiras e fakes anônimos ficassem ocultos. Você desvendou as trilhas cibernéticas e relatou os fatos de forma íntegra.', req: () => s.evidence.length >= 4 },
        { id: 'trusted', icon: '🤝', title: 'Pessoa de Confiança', desc: 'Seus pares de confiança e a própria comunidade escolar o enxergam como alguém que toma decisões éticas sob forte pressão de grupo.', req: () => s.trust >= 70 && s.relationships.rafael >= 60 },
        { id: 'observer', icon: '👀', title: 'Espectador Tolerante', desc: 'Suas condutas focaram mais em assistir de longe a perseguição cibernética do que em quebrar o fluxo abusivo de dados e deboche.', req: () => true }
    ];
    return profiles.find(p => p.req()) || profiles[profiles.length-1];
}

function endGame() {
    gameState.hasPlayed = true;
    const avg = (gameState.security + gameState.empathy + gameState.courage + gameState.trust) / 4;
    let ending = avg >= 70 ? 'positive' : avg >= 45 ? 'neutral' : 'negative';
    gameState.lastEnding = ending;

    if (SaveSystem.load()?.hasPlayed && !gameState.achievements.includes('secondChance')) {
        unlockAchievement('secondChance');
    }
    SaveSystem.save();
    showResultScreen(ending);
}

function showResultScreen(ending) {
    showScreen('result-screen');
    const configs = {
        positive: { emoji:'🌟', title:'VOCÊ FEZ A DIFERENÇA', subtitle:'Sua liderança ética e sensibilidade quebrou o círculo vicioso de abusos online.', cls:'positive',
            message:'Suas posturas mostraram que o cyberbullying recua quando as testemunhas decidem agir em prol do bem comum. Você acolheu Rafael, documentou as difamações e acionou canais responsáveis. Você é um exemplo de cidadania no ciberespaço.' },
        neutral: { emoji:'💛', title:'AINDA DÁ TEMPO', subtitle:'Houve boas decisões pontuais, mas você permitiu que a agressão continuasse ativa.', cls:'neutral',
            message:'Você não impulsionou o ódio, mas permitiu que a omissão distanciasse você da solução ativa. A internet precisa de mais barreira ativa e menos neutralidade estéril. Desafie suas próprias decisões jogando outra vez!' },
        negative: { emoji:'⚠️', title:'TUDO SAIU DO CONTROLE', subtitle:'Sua conivência com as zombarias amplificou o dano moral no Rafael.', cls:'negative',
            message:'Rir de fotos roubadas ou tolerar perfis anônimos gera danos permanentes e irreparáveis na saúde mental de seus pares. O jogo do ódio digital se alimenta do conformismo. Use esta experiência virtual para agir de forma diferente e protetiva no seu dia a dia real.' }
    };
    const c = configs[ending];

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
            <div class="action-stat-item"><span class="action-stat-value">${as.contentNotShared||0}</span><span class="action-stat-label">📵 Compartilhamentos Retidos</span></div>`;
    }

    if (DOM['result-decisions-list']) {
        DOM['result-decisions-list'].innerHTML = '';
        const decisions = gameState.choices.filter(c => c.decisionText);
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

    if (DOM['result-message']) DOM['result-message'].textContent = c.message;
}

// ============================================
// RESET E NOVO JOGO
// ============================================
function resetState() {
    gameState.chapter = 1; gameState.scene = 0;
    gameState.security = 50; gameState.empathy = 50;
    gameState.courage = 50; gameState.trust = 50;
    gameState.choices = []; gameState.achievements = [];
    gameState.choiceFlags = {};
    gameState.relationships = { rafael: 50, bia: 60, lucas: 50 };
    gameState.evidence = [];
    gameState.actionStats = { reports:0, peopleHelped:0, evidenceFound:0, contentNotShared:0 };
    if (DOM['rs-security']) DOM['rs-security'].style.width = '0%';
    if (DOM['rs-empathy']) DOM['rs-empathy'].style.width = '0%';
    if (DOM['rs-courage']) DOM['rs-courage'].style.width = '0%';
    if (DOM['rs-trust']) DOM['rs-trust'].style.width = '0%';
}

function startNewGame() {
    resetState(); updateAllUI(); SaveSystem.save();
    const ch = chapters[0];
    if (DOM['transition-chapter-num']) DOM['transition-chapter-num'].textContent = `Capítulo ${ch.id}`;
    if (DOM['transition-title']) DOM['transition-title'].textContent = ch.title;
    if (DOM['transition-desc']) DOM['transition-desc'].textContent = ch.desc;
    showScreen('chapter-transition');
    SynthAudio.startAmbientMusic();
    setTimeout(() => { showScreen('game-screen'); renderScene(); }, 3000);
}

function continueGame() {
    const saved = SaveSystem.load(); if (!saved) return;
    Object.assign(gameState, {
        chapter: saved.chapter, scene: saved.scene,
        security: saved.security, empathy: saved.empathy,
        courage: saved.courage, trust: saved.trust,
        choices: saved.choices||[], achievements: saved.achievements||[],
        choiceFlags: saved.choiceFlags||{},
        relationships: saved.relationships||{rafael:50,bia:60,lucas:50},
        evidence: saved.evidence||[],
        actionStats: saved.actionStats||{reports:0,peopleHelped:0,evidenceFound:0,contentNotShared:0},
        hasPlayed: saved.hasPlayed||false, lastEnding: saved.lastEnding||null
    });
    updateAllUI(); showScreen('game-screen'); renderScene();
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
        div.className = `ach-grid-item ${unlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `<span class="ach-g-icon">${a.icon}</span><span class="ach-g-name">${a.name}</span><span class="ach-g-desc">${a.desc}</span>`;
        grid.appendChild(div);
    });
}

function applySettings() {
    if (DOM['toggle-music']) DOM['toggle-music'].checked = settings.music;
    if (DOM['toggle-sfx']) DOM['toggle-sfx'].checked = settings.sfx;
    if (DOM['toggle-animations']) DOM['toggle-animations'].checked = settings.animations;
    if (DOM['text-speed']) DOM['text-speed'].value = settings.textSpeed || 'normal';
    document.body.classList.toggle('no-animations', !settings.animations);
    
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
    // Libera a Web Audio API no primeiro clique do usuário
    document.addEventListener('click', () => {
        SynthAudio.init();
    }, { once: true });

    if (DOM['btn-new-game']) {
        DOM['btn-new-game'].addEventListener('click', () => {
            if (SaveSystem.hasSave()) {
                showConfirm('Novo Jogo', 'Deseja iniciar nova rodada? O progresso existente no rolo de salvamento será excluído de forma irreversível.', () => { SaveSystem.clear(); startNewGame(); });
            } else startNewGame();
        });
    }
    
    if (DOM['btn-continue']) DOM['btn-continue'].addEventListener('click', continueGame);
    
    if (DOM['btn-achievements-menu']) {
        DOM['btn-achievements-menu'].addEventListener('click', () => { 
            renderAchievementsScreen(); 
            showScreen('achievements-screen'); 
        });
    }
    
    if (DOM['btn-settings']) DOM['btn-settings'].addEventListener('click', () => showScreen('settings-screen'));
    if (DOM['btn-about']) DOM['btn-about'].addEventListener('click', () => showScreen('about-screen'));

    if (DOM['btn-settings-back']) DOM['btn-settings-back'].addEventListener('click', () => showScreen('menu-screen'));
    
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
    
    if (DOM['btn-clear-data']) {
        DOM['btn-clear-data'].addEventListener('click', () => {
            showConfirm('Apagar Dados do Jogo', 'Limpar todo o histórico de medalhas e salvamentos da memória local do seu navegador?', () => {
                SaveSystem.clear(); if (DOM['btn-continue']) DOM['btn-continue'].disabled = true; showScreen('settings-screen');
            });
        });
    }

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

    if (DOM['btn-play-again']) DOM['btn-play-again'].addEventListener('click', () => { SaveSystem.clear(); startNewGame(); });
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

    document.addEventListener('keydown', e => {
        const isGameActive = DOM['game-screen'] && DOM['game-screen'].classList.contains('active');
        const isHubActive = DOM['hub-screen'] && DOM['hub-screen'].classList.contains('active');
        if (!isGameActive && !isHubActive) return;
        
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
    if (saved && saved.achievements) gameState.achievements = saved.achievements;
    
    setupEvents();
    runLoading();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}