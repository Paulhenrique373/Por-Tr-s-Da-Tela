/* ============================================
   POR TRÁS DA TELA — JOGO COMPLETO v2
   ============================================
   Evolução: relacionamentos, evidências, investigação,
   hub entre capítulos, celular interativo (Conecta),
   reflexões "E Você?", perfil final do jogador,
   personagens com expressões, toasts visuais.
   Todos personagens e situações são fictícios.
   ============================================ */

// ============================================
// ESTADO GLOBAL DO JOGO (preservado + expandido)
// ============================================
const gameState = {
    chapter: 1,
    scene: 0,
    // Atributos (preservados)
    security: 50,
    empathy: 50,
    courage: 50,
    trust: 50,
    // Histórico
    choices: [],
    achievements: [],
    choiceFlags: {},
    // NOVO: Relacionamentos
    relationships: {
        rafael: 50,
        bia: 60,
        lucas: 50
    },
    // NOVO: Evidências coletadas
    evidence: [],
    // NOVO: Contadores de ações
    actionStats: {
        reports: 0,
        peopleHelped: 0,
        evidenceFound: 0,
        contentNotShared: 0
    },
    // Controle
    hasPlayed: false,
    lastEnding: null
};

// ============================================
// CONFIGURAÇÕES (preservadas + expandidas)
// ============================================
const settings = {
    music: true,
    sfx: true,
    animations: true,
    textSpeed: 'normal'  // NOVO
};

// ============================================
// PERSONAGENS
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
// CONQUISTAS (preservadas + expandidas)
// ============================================
const ACHIEVEMENTS = {
    guardian: { id: 'guardian', icon: '🛡️', name: 'Guardião Digital', desc: 'Tomou decisões seguras em todas as situações.' },
    empath: { id: 'empath', icon: '💜', name: 'Grande Aliado', desc: 'Apoiou todos os personagens que precisaram de ajuda.' },
    reporter: { id: 'reporter', icon: '🚨', name: 'Voz Ativa', desc: 'Denunciou situações perigosas.' },
    witness: { id: 'witness', icon: '👀', name: 'Testemunha Atenta', desc: 'Identificou todas as situações de cyberbullying.' },
    secondChance: { id: 'secondChance', icon: '🔄', name: 'Segunda Chance', desc: 'Jogou novamente depois de um final.' },
    brave: { id: 'brave', icon: '🦁', name: 'Corajoso', desc: 'Enfrentou situações difíceis de forma responsável.' },
    investigator: { id: 'investigator', icon: '🔎', name: 'Investigador', desc: 'Encontrou todas as evidências de um caso.' },
    trueFriend: { id: 'trueFriend', icon: '🤝', name: 'Amigo de Verdade', desc: 'Conquistou a confiança máxima de Rafael.' }
};

// ============================================
// LISTA DE EVIDÊNCIAS POSSÍVEIS
// ============================================
const EVIDENCE_CATALOG = {
    msg_screenshot: { id: 'msg_screenshot', icon: '📸', name: 'Print das mensagens ofensivas', chapter: 1 },
    fake_profile_print: { id: 'fake_profile_print', icon: '👤', name: 'Print do perfil falso', chapter: 2 },
    fake_profile_url: { id: 'fake_profile_url', icon: '🔗', name: 'Link do perfil falso', chapter: 2 },
    group_screenshot: { id: 'group_screenshot', icon: '👥', name: 'Print do grupo "Sem o Rafael"', chapter: 3 },
    group_members: { id: 'group_members', icon: '📋', name: 'Lista de membros do grupo', chapter: 3 },
    image_senders: { id: 'image_senders', icon: '📩', name: 'Print de quem enviou a imagem', chapter: 4 },
    timeline: { id: 'timeline', icon: '🕐', name: 'Linha do tempo dos acontecimentos', chapter: 4 },
    bia_testimony: { id: 'bia_testimony', icon: '💬', name: 'Relato da Bia como testemunha', chapter: 4 }
};

// ============================================
// CAPÍTULOS E CENAS (preservados + muito expandidos)
// ============================================
const chapters = [
    // ========================
    // CAPÍTULO 1 — A PRIMEIRA MENSAGEM
    // ========================
    {
        id: 1,
        title: "A Primeira Mensagem",
        desc: "Você presencia uma mensagem ofensiva direcionada a um colega. Como vai reagir?",
        scenes: [
            { // 0 — Intro
                type: 'narrative',
                visual: '🏫', location: 'Pátio da escola — Segunda-feira',
                character: 'narrator', expression: 'normal',
                text: 'É segunda-feira de manhã. O sol entra pelas janelas do corredor enquanto você caminha até o pátio.\n\nSeu celular vibra no bolso. Uma notificação do grupo da turma.',
                choices: [{ text: 'Pegar o celular', next: 1 }]
            },
            { // 1 — Bia aparece
                type: 'narrative',
                visual: '😊', location: 'Pátio da escola',
                character: 'bia', expression: 'worried',
                text: '"Ei, você viu o grupo? Tá rolando uma coisa muito chata lá..."\n\nBia parece preocupada. Ela está olhando para o próprio celular com uma expressão séria.',
                choices: [
                    { text: '"O que aconteceu?"', next: 2, relEffects: { bia: 3 } },
                    { text: 'Abrir o grupo direto', next: 2 }
                ]
            },
            { // 2 — Celular: grupo
                type: 'phone', phoneType: 'chat',
                appName: '💬 Grupo — Turma 9B',
                messages: [
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Kkkkk alguém viu a foto do Rafael?', time: '08:32' },
                    { avatar: '😂', name: 'Bia_oficial', text: 'Gente isso é sério, para com isso', time: '08:33' },
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Que vergonha ser ele hein 🤣', time: '08:33', offensive: true },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Vou postar no Conecta essa foto kkk', time: '08:34', offensive: true },
                    { avatar: '🤷', name: 'Fernanda_sz', text: 'Kkk coitado', time: '08:35' }
                ],
                afterText: 'Você percebe que estão rindo de uma foto constrangedora de Rafael. Alguém tirou a foto sem ele perceber durante a aula de educação física.\n\nBia já tentou pedir para pararem, mas foi ignorada.',
                choices: [
                    {
                        letter: 'A', text: 'Mandar risada e pedir a foto',
                        effects: { security: -10, empathy: -15, courage: -5, trust: -10 },
                        relEffects: { rafael: -15, bia: -10, lucas: 10 },
                        flag: 'ch1_joined_mockery',
                        tip: 'Participar de uma situação de cyberbullying, mesmo que pareça "brincadeira", contribui para o sofrimento da vítima e incentiva os agressores.',
                        next: 3
                    },
                    {
                        letter: 'B', text: 'Ignorar e fechar o celular',
                        effects: { security: 0, empathy: -5, courage: -5, trust: 0 },
                        relEffects: { bia: -5 },
                        flag: 'ch1_ignored',
                        next: 4
                    },
                    {
                        letter: 'C', text: 'Tirar print da conversa como evidência',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 5 },
                        relEffects: { bia: 5 },
                        flag: 'ch1_saved_evidence',
                        addEvidence: 'msg_screenshot',
                        decisionText: 'Você guardou evidências de cyberbullying.',
                        next: 5
                    },
                    {
                        letter: 'D', text: 'Responder no grupo que isso não é legal',
                        effects: { security: 5, empathy: 15, courage: 15, trust: 10 },
                        relEffects: { rafael: 10, bia: 10, lucas: -5 },
                        flag: 'ch1_spoke_up',
                        decisionText: 'Você se posicionou contra o cyberbullying.',
                        next: 6
                    }
                ]
            },
            { // 3 — Consequência A
                type: 'narrative', visual: '😕',
                character: 'narrator', expression: 'normal',
                text: 'Você mandou risadas e pediu a foto. Logo, mais pessoas começaram a compartilhar e fazer piadas ainda piores.\n\nBia olhou para você com decepção.\n\nNo dia seguinte, Rafael não veio à escola.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 4 — Consequência B
                type: 'narrative', visual: '🤷',
                character: 'bia', expression: 'sad',
                text: '"Você não vai fazer nada?" Bia perguntou baixinho.\n\nVocê fechou o celular. Durante o resto do dia, a foto de Rafael se espalhou por vários grupos. Ele passou o dia cabisbaixo, sozinho num canto do pátio.',
                tip: 'Ignorar uma situação de cyberbullying não é o mesmo que não participar. Testemunhas silenciosas podem ajudar se tomarem uma atitude.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 5 — Consequência C
                type: 'narrative', visual: '📸',
                character: 'narrator', expression: 'normal',
                text: 'Você tirou print de toda a conversa com cuidado — nomes, horários, mensagens.\n\nBia notou o que você fez. "Boa ideia. Pode ser útil depois."\n\nPreservar evidências é um passo fundamental para resolver situações de cyberbullying de forma responsável.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 6 — Consequência D
                type: 'narrative', visual: '💬',
                character: 'player', expression: 'determined',
                text: 'Você digitou no grupo:\n\n"Gente, isso não é engraçado. Tirar foto de alguém sem permissão e zoar é errado. Parem com isso."\n\nLucas mandou "relaxa, é brincadeira". Mas algumas pessoas pararam de responder. Bia mandou uma mensagem particular: "Obrigada por falar. Eu tentei e ninguém me ouviu."',
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // ========================
    // CAPÍTULO 2 — O PERFIL FALSO
    // ========================
    {
        id: 2,
        title: "O Perfil Falso",
        desc: "Um perfil falso aparece no Conecta para ridicularizar Rafael. O que você vai fazer?",
        scenes: [
            { // 0 — Intro
                type: 'narrative', visual: '👤', location: 'Em casa — Quarta-feira à noite',
                character: 'narrator', expression: 'normal',
                text: 'Alguns dias se passaram. À noite, você está em casa navegando no Conecta quando algo estranho aparece.\n\nUm perfil novo: "@rafael_ridiculo".\n\nUsa uma foto editada de Rafael com textos humilhantes.',
                choices: [{ text: 'Verificar o perfil', next: 1 }]
            },
            { // 1 — Celular: perfil
                type: 'phone', phoneType: 'profile',
                profileData: {
                    avatar: '🤡', name: '@rafael_ridiculo',
                    bio: '"O maior perdedor da escola"\n23 seguidores · 4 publicações\nTodas as publicações são fotos editadas e textos humilhantes.',
                    isFake: true
                },
                afterText: 'O perfil foi criado apenas para humilhar Rafael. Algumas pessoas da escola já seguem e comentaram rindo.\n\nIsso é cyberbullying. Criar perfis falsos para ridicularizar pode ter consequências legais.',
                choices: [
                    {
                        letter: 'A', text: 'Seguir o perfil por curiosidade',
                        effects: { security: -5, empathy: -10, courage: -5, trust: -5 },
                        relEffects: { rafael: -10 },
                        flag: 'ch2_followed_fake',
                        tip: 'Seguir ou interagir com perfis de humilhação aumenta o alcance e incentiva o agressor. Cada seguidor normaliza a violência.',
                        next: 2
                    },
                    {
                        letter: 'B', text: 'Ignorar o perfil',
                        effects: { security: 0, empathy: -3, courage: -3, trust: 0 },
                        flag: 'ch2_ignored_profile',
                        next: 3
                    },
                    {
                        letter: 'C', text: 'Denunciar o perfil na plataforma',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 10 },
                        flag: 'ch2_reported',
                        addEvidence: 'fake_profile_print',
                        decisionText: 'Você denunciou o perfil falso.',
                        actionStat: 'reports',
                        next: 4
                    },
                    {
                        letter: 'D', text: 'Tirar print, denunciar e avisar Rafael',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 15, bia: 5 },
                        flag: 'ch2_full_support',
                        addEvidence: 'fake_profile_print',
                        addEvidence2: 'fake_profile_url',
                        decisionText: 'Você denunciou e avisou a vítima.',
                        actionStat: 'reports',
                        next: 5
                    }
                ]
            },
            { // 2 — Seguiu
                type: 'narrative', visual: '📊',
                character: 'narrator', expression: 'normal',
                text: 'Você seguiu o perfil. Os seguidores cresceram. Quem criou ficou motivado e postou conteúdo ainda pior.\n\nRafael descobriu e ficou arrasado ao ver quantas pessoas seguiam.',
                choices: [{ text: 'Continuar', next: 6 }]
            },
            { // 3 — Ignorou
                type: 'narrative', visual: '🤐',
                character: 'narrator', expression: 'normal',
                text: 'Você não interagiu, mas também não fez nada. O perfil ficou ativo por dias antes de alguém denunciar.\n\nRafael sofreu em silêncio durante esse tempo.',
                choices: [{ text: 'Continuar', next: 6 }]
            },
            { // 4 — Denunciou
                type: 'narrative', visual: '🚨',
                character: 'narrator', expression: 'normal',
                text: 'Você denunciou o perfil diretamente no Conecta. Em algumas horas, foi removido.\n\nAs redes sociais possuem ferramentas de denúncia justamente para situações como essa. Usá-las é importante.',
                choices: [{ text: 'Continuar', next: 6 }]
            },
            { // 5 — Denunciou + avisou
                type: 'narrative', visual: '🤝',
                character: 'rafael', expression: 'relieved',
                text: 'Você denunciou, tirou prints e procurou Rafael.\n\n"Cara, vi aquele perfil falso. Já denunciei e guardei as provas, se precisar."\n\nRafael ficou surpreso. Ninguém tinha feito isso por ele. Pela primeira vez em dias, ele não se sentiu sozinho.\n\n"...Obrigado. De verdade."',
                choices: [{ text: 'Continuar', next: 6 }]
            },
            { // 6 — Investigação (NOVA MECÂNICA)
                type: 'investigation',
                title: 'Quem criou o perfil falso?',
                desc: 'Analise as pistas disponíveis. Clique nos elementos para investigar.',
                evidenceItems: [
                    { id: 'ev_post_time', icon: '🕐', label: 'Horário das postagens', detail: 'As publicações foram feitas entre 22h e 23h, horário que Lucas costuma estar online jogando.' },
                    { id: 'ev_writing_style', icon: '✍️', label: 'Estilo de escrita', detail: 'O perfil usa muitos "kkk" e gírias idênticas às que Lucas usa nos grupos.' },
                    { id: 'ev_followers', icon: '👥', label: 'Primeiros seguidores', detail: 'Os primeiros seguidores foram Pedro e Fernanda — amigos próximos de Lucas.' },
                    { id: 'ev_photo_source', icon: '📸', label: 'Origem das fotos', detail: 'As fotos usadas foram tiradas durante a aula de educação física — Lucas senta atrás de Rafael nessa aula.' }
                ],
                afterText: 'As pistas indicam uma direção, mas não é possível ter certeza absoluta. Na vida real, é importante não fazer acusações sem provas concretas e deixar que os adultos responsáveis investiguem.',
                choices: [
                    {
                        letter: 'A', text: 'Confrontar Lucas diretamente e acusá-lo',
                        effects: { security: -5, empathy: 0, courage: 10, trust: -5 },
                        relEffects: { lucas: -15 },
                        flag: 'ch2_confronted_lucas',
                        tip: 'Confrontar alguém com acusações diretas sem provas concretas pode piorar a situação e criar mais conflito. O melhor é levar as evidências a um adulto responsável.',
                        next: 7
                    },
                    {
                        letter: 'B', text: 'Guardar todas as pistas e levar para a Professora Ana',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 10 },
                        relEffects: { rafael: 5 },
                        flag: 'ch2_investigated_properly',
                        addEvidence: 'fake_profile_url',
                        decisionText: 'Você investigou e levou evidências a um adulto.',
                        actionStat: 'evidenceFound',
                        next: 8
                    }
                ]
            },
            { // 7 — Confrontou Lucas
                type: 'narrative', visual: '😠',
                character: 'lucas', expression: 'defensive',
                text: '"Tá me acusando de quê?! Eu não fiz nada! Para de ser paranóico!"\n\nLucas ficou na defensiva. Mesmo que ele tenha feito, acusar diretamente sem provas só criou mais tensão. Ele saiu irritado e o clima ficou pesado.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 8 — Levou para Prof. Ana
                type: 'narrative', visual: '👩‍🏫',
                character: 'ana', expression: 'serious',
                text: '"Obrigada por trazer isso. Você fez a coisa certa. Eu vou analisar com cuidado e conversar com a coordenação. Não se preocupe — vamos resolver isso sem expor ninguém desnecessariamente."\n\nA Professora Ana pegou os prints e anotou tudo. Você sentiu que fez a coisa certa.',
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // ========================
    // CAPÍTULO 3 — O GRUPO
    // ========================
    {
        id: 3,
        title: "O Grupo",
        desc: "Um grupo foi criado para excluir Rafael. Você foi adicionado.",
        scenes: [
            { // 0 — Intro + Reflexão "E Você?"
                type: 'reflection',
                question: 'Imagine que você está na escola e descobre que criaram um grupo para excluir um colega de propósito. Todo mundo da turma está lá. Se você sair, pode ser excluído também.\n\nO que você faria na vida real?',
                reflectionChoices: [
                    'Ficaria no grupo para não ser excluído',
                    'Sairia do grupo mesmo com o risco',
                    'Ficaria no grupo mas tentaria defender a pessoa',
                    'Contaria para um adulto de confiança'
                ],
                feedback: 'Cada pessoa pode reagir de uma forma diferente, e tudo bem. O importante é saber que ficar em um grupo de humilhação, mesmo sem participar ativamente, pode ser interpretado como apoio. Uma atitude segura pode ser sair do grupo, guardar evidências e procurar uma pessoa de confiança.',
                next: 1
            },
            { // 1 — Notificação
                type: 'narrative', visual: '📱', location: 'Em casa — Sexta-feira à noite',
                character: 'narrator', expression: 'normal',
                text: 'Uma notificação aparece:\n\n"Bia_oficial adicionou você ao grupo: SEM O RAFAEL"\n\nO nome do grupo já diz tudo.',
                choices: [{ text: 'Abrir o grupo', next: 2 }]
            },
            { // 2 — Celular: grupo
                type: 'phone', phoneType: 'chat',
                appName: '💬 SEM O RAFAEL',
                messages: [
                    { avatar: '🤷', name: 'Fernanda_sz', text: 'Grupo pra combinar as coisas sem aquele chato', time: '19:15' },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Finalmente kkk', time: '19:16' },
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Bora não chamar ele pro rolê de sábado', time: '19:17', offensive: true },
                    { avatar: '🤷', name: 'Fernanda_sz', text: 'Ninguém aguenta ele mesmo', time: '19:18', offensive: true },
                    { avatar: '😊', name: 'Bia_oficial', text: 'Gente eu não concordo com isso não', time: '19:20' },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Se não concorda sai ué', time: '19:20' }
                ],
                afterText: 'Exclusão social intencional é uma forma de bullying. Bia foi adicionada contra a vontade e já se manifestou contra.\n\n15 pessoas estão no grupo. Você precisa decidir.',
                choices: [
                    {
                        letter: 'A', text: 'Participar e mandar mensagens concordando',
                        effects: { security: -10, empathy: -15, courage: -5, trust: -15 },
                        relEffects: { rafael: -20, bia: -15, lucas: 10 },
                        flag: 'ch3_participated',
                        tip: 'Participar de grupos de exclusão é cyberbullying ativo, mesmo que pareça "só um grupo".',
                        next: 3
                    },
                    {
                        letter: 'B', text: 'Ficar no grupo mas não dizer nada',
                        effects: { security: -3, empathy: -5, courage: -5, trust: -3 },
                        relEffects: { rafael: -5, bia: -5 },
                        flag: 'ch3_silent',
                        tip: 'Permanecer em um grupo de humilhação, mesmo sem participar, dá a impressão de apoio.',
                        next: 4
                    },
                    {
                        letter: 'C', text: 'Sair do grupo imediatamente',
                        effects: { security: 10, empathy: 10, courage: 10, trust: 5 },
                        relEffects: { bia: 10 },
                        flag: 'ch3_left',
                        decisionText: 'Você saiu do grupo de exclusão.',
                        actionStat: 'contentNotShared',
                        next: 5
                    },
                    {
                        letter: 'D', text: 'Tirar print, sair do grupo e procurar a Professora Ana',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 10, bia: 10 },
                        flag: 'ch3_reported_adult',
                        addEvidence: 'group_screenshot',
                        addEvidence2: 'group_members',
                        decisionText: 'Você procurou a ajuda de um adulto responsável.',
                        actionStat: 'reports',
                        next: 6
                    }
                ]
            },
            { // 3 — Participou
                type: 'narrative', visual: '😬',
                character: 'narrator', expression: 'normal',
                text: 'Você participou. Rafael descobriu o grupo no dia seguinte — alguém mostrou para ele.\n\nEle olhou para você no corredor. Nos olhos dele, havia decepção. Bia também ficou distante.\n\nA situação está piorando.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 4 — Ficou quieto
                type: 'narrative', visual: '😶',
                character: 'bia', expression: 'worried',
                text: '"Você ficou lá sem fazer nada?" Bia perguntou no dia seguinte.\n\nAs mensagens continuaram por dias. Rafael foi excluído de tudo — rolês, trabalhos em grupo, até do futebol no intervalo.\n\nVocê poderia ter feito mais.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 5 — Saiu
                type: 'narrative', visual: '🚪',
                character: 'bia', expression: 'relieved',
                text: 'Você saiu do grupo. Bia mandou mensagem particular:\n\n"Vi que você saiu. Eu também vou sair. Obrigada por não participar disso."\n\nAlguns colegas estranharam, mas ninguém comentou muito. Não participar já é um primeiro passo.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 6 — Saiu + adulto
                type: 'narrative', visual: '🏫',
                character: 'ana', expression: 'worried',
                text: 'Você mostrou tudo para a Professora Ana.\n\n"Isso é muito sério. Obrigada por confiar em mim. Vou tratar isso com cuidado — sem expor quem denunciou."\n\nBia também procurou a professora depois. Juntos, vocês estão fazendo diferença.',
                relEffects: { rafael: 5, bia: 5 },
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // ========================
    // CAPÍTULO 4 — A IMAGEM
    // ========================
    {
        id: 4,
        title: "A Imagem",
        desc: "Uma imagem pessoal começa a circular sem autorização. Isso é muito sério.",
        scenes: [
            { // 0 — Bia avisa
                type: 'narrative', visual: '⚠️', location: 'Intervalo — Terça-feira',
                character: 'bia', expression: 'scared',
                text: '"Você precisa ver isso. Agora."\n\nBia está tremendo. Ela segura o celular com as duas mãos.\n\n"Estão compartilhando uma foto pessoal do Rafael. Uma foto que ele mandou em particular para alguém... e essa pessoa espalhou."',
                choices: [{ text: 'Ver a situação', next: 1 }]
            },
            { // 1 — Celular: notificações
                type: 'phone', phoneType: 'notifications',
                notifications: [
                    { icon: '💬', text: 'Lucas_gamer enviou uma imagem em "Turma 9B"', time: '2 min' },
                    { icon: '📩', text: 'Pedro.zz encaminhou uma mensagem para você', time: '5 min' },
                    { icon: '🔔', text: '23 novas mensagens em "SEM O RAFAEL"', time: '8 min' },
                    { icon: '🌐', text: 'Nova publicação no Conecta mencionando Rafael', time: '12 min' }
                ],
                afterText: 'A foto está se espalhando rápido. Você recebeu em mensagem privada.\n\nCompartilhar imagens pessoais sem consentimento é uma violação gravíssima. No Brasil, pode configurar crime.',
                choices: [
                    {
                        letter: 'A', text: 'Compartilhar — "todo mundo já viu mesmo"',
                        effects: { security: -15, empathy: -20, courage: -10, trust: -20 },
                        relEffects: { rafael: -25, bia: -20 },
                        flag: 'ch4_shared_image',
                        tip: 'Compartilhar imagens pessoais sem consentimento é crime. "Todo mundo fazendo" não justifica nem protege. Todos que compartilham podem responder legalmente.',
                        next: 2
                    },
                    {
                        letter: 'B', text: 'Não compartilhar, mas guardar a foto',
                        effects: { security: -5, empathy: -5, courage: 0, trust: -5 },
                        flag: 'ch4_kept_image',
                        actionStat: 'contentNotShared',
                        tip: 'Manter imagens sem consentimento, mesmo sem repassar, pode ser problemático. O melhor é apagar e denunciar.',
                        next: 3
                    },
                    {
                        letter: 'C', text: 'Apagar imediatamente e não compartilhar',
                        effects: { security: 10, empathy: 10, courage: 5, trust: 5 },
                        flag: 'ch4_deleted',
                        decisionText: 'Você se recusou a compartilhar conteúdo íntimo.',
                        actionStat: 'contentNotShared',
                        next: 4
                    },
                    {
                        letter: 'D', text: 'Apagar, registrar quem enviou e procurar ajuda urgente',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 15, bia: 10 },
                        flag: 'ch4_full_response',
                        addEvidence: 'image_senders',
                        addEvidence2: 'timeline',
                        decisionText: 'Você tomou todas as medidas responsáveis.',
                        actionStat: 'reports',
                        next: 5
                    }
                ]
            },
            { // 2 — Compartilhou
                type: 'narrative', visual: '💔',
                character: 'narrator', expression: 'normal',
                text: 'Você compartilhou. A foto se espalhou ainda mais.\n\nRafael não veio à escola nos dias seguintes. A mãe dele ligou para a direção. Ele estava tendo crises de ansiedade e se recusava a sair de casa.\n\nA escola começou uma investigação. Todos que compartilharam podem ter consequências sérias.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 3 — Guardou
                type: 'narrative', visual: '😔',
                character: 'narrator', expression: 'normal',
                text: 'Você não compartilhou, mas não fez nada. A foto circulou por dias.\n\nRafael ficou cada vez mais isolado. Bia comentou: "Alguém precisava ter feito algo mais cedo."',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 4 — Apagou
                type: 'narrative', visual: '🗑️',
                character: 'bia', expression: 'relieved',
                text: '"Você apagou? Bom. Eu também."\n\nFoi a decisão certa, mas a foto já estava circulando. Você fez sua parte — agora a situação precisa de uma solução maior.',
                choices: [{ text: 'Continuar', goHub: true }]
            },
            { // 5 — Resposta completa
                type: 'narrative', visual: '✊',
                character: 'ana', expression: 'serious',
                text: 'Você levou tudo para a Professora Ana e para a coordenação.\n\n"Isso é extremamente grave. Vamos acionar os protocolos da escola e, se necessário, as autoridades. Você fez a coisa certa."\n\nBia também ajudou com seu relato como testemunha. Rafael recebeu apoio psicológico.\n\nSua atitude fez uma diferença real.',
                addEvidence: 'bia_testimony',
                relEffects: { rafael: 10 },
                actionStat: 'peopleHelped',
                choices: [{ text: 'Continuar', goHub: true }]
            }
        ]
    },
    // ========================
    // CAPÍTULO 5 — A DECISÃO
    // ========================
    {
        id: 5,
        title: "A Decisão",
        desc: "Todas as suas escolhas levaram até aqui. Este é o capítulo final.",
        scenes: [
            { // 0 — Intro
                type: 'narrative', visual: '🌅', location: 'Escola — Uma semana depois',
                character: 'narrator', expression: 'normal',
                text: 'Uma semana se passou. A escola convocou uma reunião sobre cyberbullying.\n\nRafael voltou à escola, mas está diferente — mais quieto, cauteloso. Bia tem tentado apoiá-lo.\n\nO clima na turma está tenso.',
                choices: [{ text: 'Continuar', next: 1 }]
            },
            { // 1 — Encontro com Rafael (DINÂMICO)
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
                        return '"Ei... eu sei que você tentou me ajudar. Obrigado. Quando tudo aconteceu, eu achei que ninguém se importava. Mas você se importou."\n\nEle dá um sorriso pequeno, mas sincero.';
                    } else if (r >= 45) {
                        return '"Oi... Olha, eu não sei muito bem quem fez o quê. Mas foi tudo muito difícil. Espero que as coisas melhorem agora."';
                    } else {
                        return '"..."\n\nRafael não diz nada. Ele apenas passa por você sem olhar. A confiança dele em todos está abalada — inclusive em você.';
                    }
                },
                choices: [{ text: 'Continuar', next: 2 }]
            },
            { // 2 — Bia conversa
                type: 'narrative', visual: '😊',
                character: 'bia',
                expression: function() {
                    return gameState.relationships.bia >= 60 ? 'happy' : 'worried';
                },
                text: function() {
                    if (gameState.relationships.bia >= 70) {
                        return '"A reunião vai começar. Eu fico feliz que a gente enfrentou isso junto. Não foi fácil, mas valeu a pena."\n\nBia aperta sua mão.';
                    } else {
                        return '"A reunião vai começar. Espero que algo mude de verdade. A gente não pode continuar fingindo que tá tudo bem."';
                    }
                },
                choices: [{ text: 'Ir para a reunião', next: 3 }]
            },
            { // 3 — Escolha final
                type: 'narrative', visual: '🎤', location: 'Auditório da escola',
                character: 'narrator', expression: 'normal',
                text: 'A diretora fala sobre cyberbullying. Explica as consequências legais, os danos emocionais, a importância de denunciar.\n\nEntão ela pergunta: "Alguém gostaria de compartilhar algo?"\n\nO silêncio é pesado. Esta é sua última escolha.',
                choices: [
                    {
                        letter: 'A', text: 'Ficar calado e esperar que tudo passe',
                        effects: { security: -5, empathy: -5, courage: -10, trust: -5 },
                        flag: 'ch5_stayed_silent',
                        next: 4
                    },
                    {
                        letter: 'B', text: 'Levantar a mão e compartilhar o que aprendeu',
                        effects: { security: 10, empathy: 15, courage: 20, trust: 15 },
                        relEffects: { rafael: 10, bia: 10 },
                        flag: 'ch5_spoke_up',
                        decisionText: 'Você teve coragem de se posicionar publicamente.',
                        actionStat: 'peopleHelped',
                        next: 5
                    },
                    {
                        letter: 'C', text: 'Depois da reunião, procurar Rafael e perguntar como ele está',
                        effects: { security: 5, empathy: 15, courage: 10, trust: 15 },
                        relEffects: { rafael: 15 },
                        flag: 'ch5_checked_rafael',
                        decisionText: 'Você perguntou como a vítima estava.',
                        actionStat: 'peopleHelped',
                        next: 6
                    },
                    {
                        letter: 'D', text: 'Falar com a diretora em particular, entregar evidências e sugerir um canal de denúncia anônimo',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        relEffects: { rafael: 10, bia: 10 },
                        flag: 'ch5_full_action',
                        decisionText: 'Você propôs uma solução concreta.',
                        actionStat: 'reports',
                        next: 7
                    }
                ]
            },
            { // 4 — Calado
                type: 'narrative', visual: '🤐',
                character: 'narrator', expression: 'normal',
                text: 'O silêncio permaneceu. A reunião acabou sem mudanças concretas.\n\nRafael saiu de cabeça baixa. Bia suspirou. A sensação é de que tudo pode acontecer de novo.',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            { // 5 — Falou na reunião
                type: 'narrative', visual: '🎤',
                character: 'player', expression: 'determined',
                text: '"Eu vi o que aconteceu com o Rafael. Alguns participaram, outros ficaram calados — incluindo eu, em alguns momentos.\n\nEu aprendi que ficar calado também é participar. E que a gente pode fazer diferente. Denunciar, apoiar, pelo menos não compartilhar."\n\nO auditório ficou em silêncio. Depois, Bia se levantou também. E mais uma pessoa. E outra.',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            { // 6 — Procurou Rafael
                type: 'narrative', visual: '💚',
                character: 'rafael', expression: 'relieved',
                text: '"E aí, Rafael. Como você tá de verdade?"\n\nEle pareceu surpreso. "Ninguém pergunta isso de verdade..."\n\nVocês conversaram. Sobre a escola, sobre internet, sobre como é difícil pedir ajuda. Uma conversa simples faz mais diferença do que qualquer discurso.\n\n"Obrigado. Por perguntar."',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            { // 7 — Ação completa
                type: 'narrative', visual: '🌟',
                character: 'narrator', expression: 'normal',
                text: 'Você entregou as evidências e sugeriu um canal de denúncia anônimo.\n\n"A escola precisa de um lugar seguro onde qualquer aluno possa pedir ajuda sem medo."\n\nA diretora concordou. Nas semanas seguintes, a escola implementou o sistema. Rafael começou a melhorar. Bia ajudou a divulgar.\n\nLucas, surpreendentemente, procurou a orientação por conta própria.\n\nVocê fez a diferença.',
                choices: [{ text: 'Ver resultado', end: true }]
            }
        ]
    }
];

// ============================================
// REFERÊNCIAS DOM (expandidas)
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
        'scene-image-container'
    ];
    ids.forEach(id => { DOM[id] = document.getElementById(id); });
}

// ============================================
// AUDIO SYSTEM (stub preservado)
// ============================================
const AudioSystem = {
    sounds: {},
    play(name) { if (!settings.sfx) return; },
    playMusic(name) { if (!settings.music) return; },
    stopMusic() {}
};

// ============================================
// UTILITÁRIOS
// ============================================
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

let confirmHandlers = {};
function showConfirm(title, text, onAccept) {
    DOM['confirm-title'].textContent = title;
    DOM['confirm-text'].textContent = text;
    DOM['confirm-modal'].style.display = 'flex';
    if (confirmHandlers.accept) DOM['confirm-accept'].removeEventListener('click', confirmHandlers.accept);
    if (confirmHandlers.cancel) DOM['confirm-cancel'].removeEventListener('click', confirmHandlers.cancel);
    confirmHandlers.accept = () => { DOM['confirm-modal'].style.display = 'none'; onAccept(); };
    confirmHandlers.cancel = () => { DOM['confirm-modal'].style.display = 'none'; };
    DOM['confirm-accept'].addEventListener('click', confirmHandlers.accept);
    DOM['confirm-cancel'].addEventListener('click', confirmHandlers.cancel);
}

// ============================================
// SAVE SYSTEM (preservado + expanded)
// ============================================
const SaveSystem = {
    KEY: 'por_tras_da_tela_save',
    SKEY: 'por_tras_da_tela_settings',
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
// TOASTS (stat changes, evidence, relationships)
// ============================================
function showStatToast(label, value) {
    if (!settings.animations) return;
    const container = DOM['stat-toast-container'];
    const toast = document.createElement('div');
    const positive = value > 0;
    toast.className = `stat-toast ${positive ? 'positive' : 'negative'}`;
    toast.textContent = `${label} ${positive ? '+' : ''}${value}`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2500);
}

function showEvidenceToast(name) {
    const el = DOM['evidence-toast'];
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
    DOM['rel-toast-avatar'].textContent = char.avatar;
    const sign = value > 0 ? '+' : '';
    DOM['rel-toast-text'].textContent = `${char.name} ${sign}${value} confiança`;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'slideInLeft .3s ease, fadeOut .4s ease 2s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 2800);
}

// ============================================
// UPDATE UI
// ============================================
function updateStatsUI() {
    const s = clamp(gameState.security,0,100), e = clamp(gameState.empathy,0,100);
    const c = clamp(gameState.courage,0,100), t = clamp(gameState.trust,0,100);
    DOM['ms-security'].textContent = s; DOM['ms-empathy'].textContent = e;
    DOM['ms-courage'].textContent = c; DOM['ms-trust'].textContent = t;
    DOM['sf-security'].style.width = s+'%'; DOM['sf-empathy'].style.width = e+'%';
    DOM['sf-courage'].style.width = c+'%'; DOM['sf-trust'].style.width = t+'%';
    DOM['sv-security'].textContent = s; DOM['sv-empathy'].textContent = e;
    DOM['sv-courage'].textContent = c; DOM['sv-trust'].textContent = t;
}

function updateRelationshipsUI() {
    const r = gameState.relationships;
    DOM['rel-rafael'].style.width = clamp(r.rafael,0,100)+'%';
    DOM['rel-bia'].style.width = clamp(r.bia,0,100)+'%';
    DOM['rel-lucas'].style.width = clamp(r.lucas,0,100)+'%';
    DOM['relv-rafael'].textContent = clamp(r.rafael,0,100);
    DOM['relv-bia'].textContent = clamp(r.bia,0,100);
    DOM['relv-lucas'].textContent = clamp(r.lucas,0,100);
}

function updateEvidenceUI() {
    const el = DOM['sidebar-evidence'];
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
    const ch = chapters.find(c => c.id === gameState.chapter);
    if (ch) {
        DOM['chapter-indicator'].querySelector('.chapter-label').textContent = `Capítulo ${ch.id}`;
        DOM['chapter-title-header'].textContent = ch.title;
    }
}

function updateAllUI() {
    updateStatsUI(); updateRelationshipsUI(); updateEvidenceUI(); updateAchievementsUI(); updateChapterHeader();
}

// ============================================
// ACHIEVEMENTS
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
        if (f['ch2_investigated_properly'] && gameState.evidence.length >= 4) unlockAchievement('investigator');
    }
    if (!gameState.achievements.includes('trueFriend')) {
        if (r.rafael >= 85) unlockAchievement('trueFriend');
    }
}

function unlockAchievement(id) {
    if (gameState.achievements.includes(id)) return;
    gameState.achievements.push(id);
    const a = ACHIEVEMENTS[id]; if (!a) return;
    DOM['ach-toast-icon'].textContent = a.icon;
    DOM['ach-toast-name'].textContent = a.name;
    const el = DOM['achievement-toast'];
    el.style.display = 'flex'; el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'slideInRight .5s ease, fadeOut .5s ease 3s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
    AudioSystem.play('achievement');
    updateAchievementsUI();
}

// ============================================
// TIPS
// ============================================
let pendingAction = null;

function showTip(text) {
    DOM['tip-text'].textContent = text;
    DOM['tip-overlay'].style.display = 'flex';
}

function closeTip() {
    DOM['tip-overlay'].style.display = 'none';
    if (pendingAction) { const a = pendingAction; pendingAction = null; a(); }
}

// ============================================
// TEXT SPEED
// ============================================
function getTextSpeed() {
    const speeds = { fast: 8, normal: 18, slow: 35, instant: 0 };
    return speeds[settings.textSpeed] || 18;
}

function typewriter(element, text, callback) {
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
// RENDER SCENES
// ============================================
function getCurrentChapter() { return chapters.find(c => c.id === gameState.chapter); }
function getCurrentScene() { const ch = getCurrentChapter(); return ch ? (ch.scenes[gameState.scene] || null) : null; }

function renderScene() {
    const scene = getCurrentScene();
    if (!scene) return;
    updateAllUI();

    // Hide all containers
    DOM['narrative-container'].style.display = 'none';
    DOM['phone-container'].style.display = 'none';
    DOM['investigation-container'].style.display = 'none';
    DOM['reflection-container'].style.display = 'none';
    DOM['phone-nav-bar'].style.display = 'none';

    switch(scene.type) {
        case 'phone': renderPhoneScene(scene); break;
        case 'investigation': renderInvestigationScene(scene); break;
        case 'reflection': renderReflectionScene(scene); break;
        default: renderNarrativeScene(scene); break;
    }
}

// --- NARRATIVE ---
function renderNarrativeScene(scene) {
    DOM['narrative-container'].style.display = 'flex';
    DOM['scene-visual'].textContent = scene.visual || '📖';
    DOM['scene-location'].textContent = scene.location || '';

    // Character
    const charId = scene.character;
    const char = charId ? CHARACTERS[charId] : null;
    if (char && charId !== 'narrator') {
        DOM['character-display'].style.display = 'flex';
        let expr = scene.expression;
        if (typeof expr === 'function') expr = expr();
        const avatar = char.expressions[expr] || char.expressions.default || char.avatar;
        DOM['char-avatar-large'].textContent = avatar;
        DOM['char-expression'].textContent = expr ? expr.charAt(0).toUpperCase()+expr.slice(1) : '';
    } else {
        DOM['character-display'].style.display = 'none';
    }

    // Speaker
    const speakerName = char ? char.name : (scene.speaker || '');
    DOM['speaker-name'].textContent = speakerName;
    DOM['speaker-name'].className = 'speaker-name' + (char ? ` ${char.nameClass}` : '');

    // Text
    let text = typeof scene.text === 'function' ? scene.text() : scene.text;
    DOM['dialogue-continue'].style.display = 'none';
    typewriter(DOM['dialogue-text'], text, () => {
        if (scene.choices && scene.choices.length > 0) {
            DOM['dialogue-continue'].style.display = 'none';
        }
    });

    renderChoices(scene.choices);

    if (settings.animations) {
        DOM['narrative-container'].style.animation = 'none';
        void DOM['narrative-container'].offsetWidth;
        DOM['narrative-container'].style.animation = 'fadeInUp .5s ease';
    }

    // Apply scene-level effects
    if (scene.relEffects) applyRelEffects(scene.relEffects);
    if (scene.addEvidence) addEvidence(scene.addEvidence);
    if (scene.actionStat) gameState.actionStats[scene.actionStat] = (gameState.actionStats[scene.actionStat]||0)+1;
}

function renderChoices(choices) {
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

// --- PHONE ---
function renderPhoneScene(scene) {
    DOM['phone-container'].style.display = 'flex';
    const now = new Date();
    DOM['phone-time'].textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    let html = '';
    if (scene.phoneType === 'chat') html = renderPhoneChat(scene);
    else if (scene.phoneType === 'profile') html = renderPhoneProfile(scene);
    else if (scene.phoneType === 'notifications') html = renderPhoneNotifications(scene);

    if (scene.afterText) {
        html += `<div style="padding:14px 16px;border-top:1px solid #374151"><p style="font-size:13px;color:#9CA3AF;line-height:1.7">${scene.afterText}</p></div>`;
    }
    if (scene.choices) {
        html += '<div class="phone-choices">';
        scene.choices.forEach((ch, i) => {
            html += `<button class="phone-choice-btn" data-ci="${i}" aria-label="Escolha ${ch.letter}: ${ch.text}"><span class="choice-letter">${ch.letter}</span><span>${ch.text}</span></button>`;
        });
        html += '</div>';
    }
    DOM['phone-screen'].innerHTML = html;
    DOM['phone-screen'].querySelectorAll('.phone-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handleChoice(scene.choices[parseInt(btn.dataset.ci)], parseInt(btn.dataset.ci)));
    });
}

function renderPhoneChat(scene) {
    let h = `<div class="phone-app-header"><span style="font-size:16px">←</span><span class="phone-app-name">${scene.appName||'💬 Chat'}</span></div>`;
    (scene.messages||[]).forEach((m,i) => {
        const off = m.offensive ? ' offensive' : '';
        h += `<div class="phone-message" style="animation-delay:${i*.12}s"><div class="phone-msg-avatar">${m.avatar}</div><div class="phone-msg-body"><div class="phone-msg-name">${m.name}</div><div class="phone-msg-text${off}">${m.text}</div><div class="phone-msg-time">${m.time}</div></div></div>`;
    });
    return h;
}

function renderPhoneProfile(scene) {
    const p = scene.profileData;
    return `<div class="phone-app-header"><span style="font-size:16px">←</span><span class="phone-app-name">Conecta — Perfil</span></div>
    <div class="phone-profile"><div class="phone-profile-avatar${p.isFake?' fake':''}">${p.avatar}</div>
    <div class="phone-profile-name">${p.name}</div><div class="phone-profile-bio">${p.bio}</div>
    ${p.isFake?'<div class="phone-profile-fake-badge">⚠️ PERFIL FALSO</div>':''}</div>`;
}

function renderPhoneNotifications(scene) {
    let h = `<div class="phone-app-header"><span class="phone-app-name">🔔 Notificações</span></div>`;
    (scene.notifications||[]).forEach((n,i) => {
        h += `<div class="phone-notification" style="animation-delay:${i*.12}s"><div class="phone-notif-icon">${n.icon}</div><div class="phone-notif-text">${n.text}</div><div class="phone-notif-time">${n.time}</div></div>`;
    });
    return h;
}

// --- INVESTIGATION ---
function renderInvestigationScene(scene) {
    DOM['investigation-container'].style.display = 'block';
    DOM['investigation-desc'].textContent = scene.desc || '';

    const board = DOM['evidence-board'];
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
                // Show detail
                card.innerHTML = `<span class="ev-icon">${item.icon}</span><span class="ev-label" style="color:var(--green)">${item.label}</span><p style="font-size:11px;color:#D1D5DB;margin-top:6px;line-height:1.4">${item.detail}</p>`;
                updateInvestigationList(scene.evidenceItems, foundItems);
            }
        });
        board.appendChild(card);
    });

    updateInvestigationList(scene.evidenceItems, foundItems);

    // Choices
    const choicesEl = DOM['investigation-choices'];
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
    el.innerHTML = allItems.map(item => {
        const found = foundIds.includes(item.id);
        return `<div class="evidence-list-item ${found?'found':'missing'}"><span>${found?'✓':'○'}</span><span>${item.label}</span></div>`;
    }).join('');
}

// --- REFLECTION ("E Você?") ---
function renderReflectionScene(scene) {
    DOM['reflection-container'].style.display = 'flex';
    DOM['reflection-question'].textContent = scene.question;
    DOM['reflection-feedback'].style.display = 'none';

    const choicesEl = DOM['reflection-choices'];
    choicesEl.innerHTML = '';
    (scene.reflectionChoices||[]).forEach((text, i) => {
        const btn = document.createElement('button');
        btn.className = 'reflection-choice-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => {
            choicesEl.querySelectorAll('.reflection-choice-btn').forEach(b => b.style.opacity = '0.4');
            btn.style.opacity = '1';
            btn.style.borderColor = 'var(--purple)';
            DOM['reflection-tip-text'].textContent = scene.feedback;
            DOM['reflection-feedback'].style.display = 'block';
        });
        choicesEl.appendChild(btn);
    });

    DOM['reflection-continue-btn'].onclick = () => {
        if (scene.next !== undefined) {
            gameState.scene = scene.next;
        } else {
            gameState.scene++;
        }
        renderScene();
    };
}

// ============================================
// HANDLE CHOICES (preservado + expanded)
// ============================================
function handleChoice(choice, index) {
    AudioSystem.play('choice');

    gameState.choices.push({
        chapter: gameState.chapter, scene: gameState.scene,
        choiceIndex: index, choiceText: choice.text,
        decisionText: choice.decisionText || null
    });

    // Effects
    if (choice.effects) {
        const ef = choice.effects;
        if (ef.security) { gameState.security = clamp(gameState.security+ef.security,0,100); showStatToast('🛡️ Segurança', ef.security); }
        if (ef.empathy) { gameState.empathy = clamp(gameState.empathy+ef.empathy,0,100); showStatToast('💜 Empatia', ef.empathy); }
        if (ef.courage) { gameState.courage = clamp(gameState.courage+ef.courage,0,100); showStatToast('💪 Coragem', ef.courage); }
        if (ef.trust) { gameState.trust = clamp(gameState.trust+ef.trust,0,100); showStatToast('🤝 Confiança', ef.trust); }
    }

    // Relationships
    if (choice.relEffects) applyRelEffects(choice.relEffects);

    // Flags
    if (choice.flag) gameState.choiceFlags[choice.flag] = true;

    // Evidence
    if (choice.addEvidence) addEvidence(choice.addEvidence);
    if (choice.addEvidence2) addEvidence(choice.addEvidence2);

    // Action stats
    if (choice.actionStat) gameState.actionStats[choice.actionStat] = (gameState.actionStats[choice.actionStat]||0)+1;
    if (choice.decisionText && (choice.effects && (choice.effects.empathy > 0 || choice.effects.trust > 0))) {
        gameState.actionStats.peopleHelped = (gameState.actionStats.peopleHelped||0)+1;
    }

    updateAllUI();
    checkAchievements();

    // Tip
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
// HUB (NOVA MECÂNICA)
// ============================================
function showHub() {
    SaveSystem.save();
    const ch = getCurrentChapter();
    DOM['hub-completed'].textContent = `Capítulo ${ch.id} concluído — ${ch.title}`;

    const nextChId = gameState.chapter + 1;
    const nextCh = chapters.find(c => c.id === nextChId);
    if (nextCh) {
        DOM['hub-next-chapter-desc'].textContent = `Capítulo ${nextCh.id}: ${nextCh.title}`;
    } else {
        DOM['hub-next-chapter-desc'].textContent = 'Encerrar história';
    }

    DOM['hub-phone-badge'].style.display = gameState.evidence.length > 0 ? 'inline-block' : 'none';
    showScreen('hub-screen');
}

function setupHubEvents() {
    // Phone panel
    DOM['hub-phone-btn'].addEventListener('click', () => {
        let html = '<div class="phone-app-header"><span class="phone-app-name">📱 Seu Celular</span></div>';
        // Recent messages summary
        html += '<div style="padding:14px 16px"><h4 style="font-size:13px;color:var(--purple);margin-bottom:10px">💬 Mensagens Recentes</h4>';
        html += '<p style="font-size:13px;color:#9CA3AF;line-height:1.6">Nenhuma nova mensagem no momento. As conversas dos grupos continuam ativas.</p></div>';
        // Conecta
        html += '<div style="padding:14px 16px;border-top:1px solid #374151"><h4 style="font-size:13px;color:var(--purple);margin-bottom:10px">🌐 Conecta</h4>';
        html += '<p style="font-size:13px;color:#9CA3AF;line-height:1.6">A timeline está movimentada. Algumas publicações sobre o que aconteceu na escola estão circulando.</p></div>';
        DOM['hub-phone-content'].innerHTML = html;
        DOM['hub-phone-panel'].style.display = 'flex';
    });

    // Evidence panel
    DOM['hub-evidence-btn'].addEventListener('click', () => {
        let html = '';
        if (gameState.evidence.length === 0) {
            html = '<p style="font-size:14px;color:#9CA3AF;text-align:center;padding:20px">Nenhuma evidência coletada ainda.<br><br>Preste atenção nas pistas e prints durante a história.</p>';
        } else {
            gameState.evidence.forEach(evId => {
                const ev = EVIDENCE_CATALOG[evId];
                if (ev) html += `<div class="phone-evidence-item"><span class="phone-evidence-icon">${ev.icon}</span><span class="phone-evidence-text">${ev.name}</span><span class="phone-evidence-check">✓</span></div>`;
            });
        }
        DOM['hub-evidence-content'].innerHTML = html;
        DOM['hub-evidence-panel'].style.display = 'flex';
    });

    // Relationships panel
    DOM['hub-relationships-btn'].addEventListener('click', () => {
        let html = '';
        const chars = [
            { id: 'rafael', desc: function() {
                const v = gameState.relationships.rafael;
                if (v >= 70) return 'Rafael confia em você. Sabe que pode contar com sua ajuda.';
                if (v >= 45) return 'Rafael está cauteloso, mas não te vê como ameaça.';
                return 'Rafael está distante. Sua confiança em você é baixa.';
            }},
            { id: 'bia', desc: function() {
                const v = gameState.relationships.bia;
                if (v >= 70) return 'Bia te considera um aliado. Vocês enfrentam a situação juntos.';
                if (v >= 45) return 'Bia está do seu lado, mas esperava mais atitude.';
                return 'Bia está decepcionada com suas escolhas.';
            }},
            { id: 'lucas', desc: function() {
                const v = gameState.relationships.lucas;
                if (v >= 60) return 'Lucas te vê como parceiro e não questiona suas ações.';
                if (v >= 35) return 'Lucas não sabe o que pensar de você.';
                return 'Lucas está na defensiva. Sente que você é contra ele.';
            }}
        ];
        chars.forEach(c => {
            const ch = CHARACTERS[c.id];
            const val = clamp(gameState.relationships[c.id],0,100);
            html += `<div class="hub-rel-card"><span class="hub-rel-avatar">${ch.avatar}</span><div class="hub-rel-info"><span class="hub-rel-name">${ch.name}</span><span class="hub-rel-status">${c.desc()} (${val}%)</span></div></div>`;
        });
        DOM['hub-relationships-content'].innerHTML = html;
        DOM['hub-relationships-panel'].style.display = 'flex';
    });

    // Continue
    DOM['hub-continue-btn'].addEventListener('click', () => {
        const nextChId = gameState.chapter + 1;
        goToChapter(nextChId);
    });

    // Close panels
    document.querySelectorAll('.hub-panel-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const panelId = btn.dataset.close;
            document.getElementById(panelId).style.display = 'none';
        });
    });
}

// ============================================
// CHAPTER TRANSITION (preservado)
// ============================================
function goToChapter(chapterId) {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) { endGame(); return; }
    gameState.chapter = chapterId;
    gameState.scene = 0;
    DOM['transition-chapter-num'].textContent = `Capítulo ${ch.id}`;
    DOM['transition-title'].textContent = ch.title;
    DOM['transition-desc'].textContent = ch.desc;
    showScreen('chapter-transition');
    AudioSystem.play('chapter');
    SaveSystem.save();
    setTimeout(() => { showScreen('game-screen'); renderScene(); }, 3000);
}

// ============================================
// END GAME (preservado + expanded)
// ============================================
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

function getPlayerProfile() {
    const s = gameState, f = s.choiceFlags;
    const profiles = [
        { id: 'guardian', icon: '🛡️', title: 'Guardião Digital', desc: 'Protegeu as pessoas e tomou decisões seguras.', req: () => s.security >= 70 && !f['ch4_shared_image'] },
        { id: 'ally', icon: '💜', title: 'Grande Aliado', desc: 'Esteve sempre ao lado de quem precisava.', req: () => s.empathy >= 75 && s.relationships.rafael >= 65 },
        { id: 'investigator', icon: '🔎', title: 'Investigador', desc: 'Coletou evidências e buscou a verdade.', req: () => s.evidence.length >= 4 },
        { id: 'trusted', icon: '🤝', title: 'Pessoa de Confiança', desc: 'Conquistou a confiança de todos.', req: () => s.trust >= 70 && s.relationships.rafael >= 60 },
        { id: 'observer', icon: '👀', title: 'Observador', desc: 'Viu tudo acontecer, mas nem sempre agiu.', req: () => true }
    ];
    return profiles.find(p => p.req()) || profiles[profiles.length-1];
}

function showResultScreen(ending) {
    showScreen('result-screen');
    const configs = {
        positive: { emoji:'🌟', title:'VOCÊ FEZ A DIFERENÇA', subtitle:'Pequenas atitudes podem fazer uma grande diferença.', cls:'positive',
            message:'Suas decisões mostraram maturidade, empatia e coragem. Você apoiou quem precisava, denunciou e buscou ajuda. Continue assim.' },
        neutral: { emoji:'💛', title:'AINDA DÁ TEMPO', subtitle:'Você tomou boas decisões, mas perdeu oportunidades de ajudar.', cls:'neutral',
            message:'Boas intenções existiram, mas hesitação permitiu que a situação se agravasse. Não é preciso ser herói — uma pequena ação pode mudar tudo.' },
        negative: { emoji:'⚠️', title:'TUDO SAIU DO CONTROLE', subtitle:'Suas decisões contribuíram para o agravamento. Mas este não é o fim.', cls:'negative',
            message:'Pressão do grupo, curiosidade ou falta de informação levam a decisões que machucam. O importante é reconhecer e tentar diferente. Tente novamente.' }
    };
    const c = configs[ending];

    DOM['result-emoji'].textContent = c.emoji;
    DOM['result-title'].textContent = c.title;
    DOM['result-subtitle'].textContent = c.subtitle;
    DOM['result-header'].className = `result-header ${c.cls}`;

    // Profile
    const prof = getPlayerProfile();
    DOM['profile-badge-icon'].textContent = prof.icon;
    DOM['profile-title'].textContent = prof.title;
    DOM['profile-desc'].textContent = prof.desc;

    // Stats
    setTimeout(() => {
        DOM['rs-security'].style.width = gameState.security+'%';
        DOM['rs-empathy'].style.width = gameState.empathy+'%';
        DOM['rs-courage'].style.width = gameState.courage+'%';
        DOM['rs-trust'].style.width = gameState.trust+'%';
    }, 300);
    DOM['rsv-security'].textContent = gameState.security;
    DOM['rsv-empathy'].textContent = gameState.empathy;
    DOM['rsv-courage'].textContent = gameState.courage;
    DOM['rsv-trust'].textContent = gameState.trust;

    // Action stats
    const as = gameState.actionStats;
    DOM['action-stats-grid'].innerHTML = `
        <div class="action-stat-item"><span class="action-stat-value">${as.reports||0}</span><span class="action-stat-label">🚨 Denúncias</span></div>
        <div class="action-stat-item"><span class="action-stat-value">${as.peopleHelped||0}</span><span class="action-stat-label">💜 Pessoas apoiadas</span></div>
        <div class="action-stat-item"><span class="action-stat-value">${as.evidenceFound||0}</span><span class="action-stat-label">🔎 Evidências</span></div>
        <div class="action-stat-item"><span class="action-stat-value">${as.contentNotShared||0}</span><span class="action-stat-label">📵 Conteúdo não compartilhado</span></div>`;

    // Decisions
    DOM['result-decisions-list'].innerHTML = '';
    const decisions = gameState.choices.filter(c => c.decisionText);
    if (decisions.length > 0) {
        decisions.forEach(d => {
            const li = document.createElement('li'); li.textContent = d.decisionText;
            DOM['result-decisions-list'].appendChild(li);
        });
    } else {
        const li = document.createElement('li'); li.textContent = 'Nenhuma ação positiva significativa foi registrada.';
        DOM['result-decisions-list'].appendChild(li);
    }

    // Achievements
    DOM['result-achievements-list'].innerHTML = '';
    if (gameState.achievements.length > 0) {
        gameState.achievements.forEach(id => {
            const a = ACHIEVEMENTS[id]; if (!a) return;
            const div = document.createElement('div'); div.className = 'result-ach-item';
            div.innerHTML = `<span class="ach-icon">${a.icon}</span><span>${a.name} — ${a.desc}</span>`;
            DOM['result-achievements-list'].appendChild(div);
        });
    } else {
        DOM['result-achievements-list'].innerHTML = '<p style="color:#9CA3AF;font-size:13px">Nenhuma conquista desbloqueada.</p>';
    }

    DOM['result-message'].textContent = c.message;
}

// ============================================
// START / CONTINUE (preservados)
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
    DOM['rs-security'].style.width = '0%'; DOM['rs-empathy'].style.width = '0%';
    DOM['rs-courage'].style.width = '0%'; DOM['rs-trust'].style.width = '0%';
}

function startNewGame() {
    resetState(); updateAllUI(); SaveSystem.save();
    const ch = chapters[0];
    DOM['transition-chapter-num'].textContent = `Capítulo ${ch.id}`;
    DOM['transition-title'].textContent = ch.title;
    DOM['transition-desc'].textContent = ch.desc;
    showScreen('chapter-transition');
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
}

// ============================================
// SIDEBAR
// ============================================
function openSidebar() { DOM['game-sidebar'].classList.add('open'); }
function closeSidebar() { DOM['game-sidebar'].classList.remove('open'); }

// ============================================
// ACHIEVEMENTS SCREEN (Menu)
// ============================================
function renderAchievementsScreen() {
    const grid = DOM['achievements-grid'];
    grid.innerHTML = '';
    Object.values(ACHIEVEMENTS).forEach(a => {
        const unlocked = gameState.achievements.includes(a.id);
        const div = document.createElement('div');
        div.className = `ach-grid-item ${unlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `<span class="ach-g-icon">${a.icon}</span><span class="ach-g-name">${a.name}</span><span class="ach-g-desc">${a.desc}</span>`;
        grid.appendChild(div);
    });
}

// ============================================
// SETTINGS
// ============================================
function applySettings() {
    DOM['toggle-music'].checked = settings.music;
    DOM['toggle-sfx'].checked = settings.sfx;
    DOM['toggle-animations'].checked = settings.animations;
    DOM['text-speed'].value = settings.textSpeed || 'normal';
    document.body.classList.toggle('no-animations', !settings.animations);
}

// ============================================
// LOADING
// ============================================
function runLoading() {
    // Particles
    const pc = document.getElementById('loading-particles');
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100 + '%';
        p.style.animationDelay = Math.random()*4 + 's';
        p.style.animationDuration = (3+Math.random()*3) + 's';
        pc.appendChild(p);
    }

    const texts = ['Carregando história...','Preparando personagens...','Configurando cenários...','Quase pronto...'];
    let prog = 0, ti = 0;
    const iv = setInterval(() => {
        prog += Math.random()*18+5; if (prog>=100) prog=100;
        DOM['loading-bar'].style.width = prog+'%';
        if (prog > (ti+1)*25 && ti < texts.length-1) { ti++; DOM['loading-text'].textContent = texts[ti]; }
        if (prog >= 100) {
            clearInterval(iv); DOM['loading-text'].textContent = 'Pronto!';
            setTimeout(() => showScreen('menu-screen'), 500);
        }
    }, 180);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEvents() {
    // Menu
    DOM['btn-new-game'].addEventListener('click', () => {
        if (SaveSystem.hasSave()) {
            showConfirm('Novo Jogo', 'Começar novo jogo? O progresso atual será apagado.', () => { SaveSystem.clear(); startNewGame(); });
        } else startNewGame();
    });
    DOM['btn-continue'].addEventListener('click', continueGame);
    DOM['btn-achievements-menu'].addEventListener('click', () => { renderAchievementsScreen(); showScreen('achievements-screen'); });
    DOM['btn-settings'].addEventListener('click', () => showScreen('settings-screen'));
    DOM['btn-about'].addEventListener('click', () => showScreen('about-screen'));

    // Settings
    DOM['btn-settings-back'].addEventListener('click', () => showScreen('menu-screen'));
    DOM['toggle-music'].addEventListener('change', () => { settings.music = DOM['toggle-music'].checked; if (!settings.music) AudioSystem.stopMusic(); SaveSystem.saveSettings(); });
    DOM['toggle-sfx'].addEventListener('change', () => { settings.sfx = DOM['toggle-sfx'].checked; SaveSystem.saveSettings(); });
    DOM['toggle-animations'].addEventListener('change', () => {
        settings.animations = DOM['toggle-animations'].checked;
        document.body.classList.toggle('no-animations', !settings.animations);
        SaveSystem.saveSettings();
    });
    DOM['text-speed'].addEventListener('change', () => { settings.textSpeed = DOM['text-speed'].value; SaveSystem.saveSettings(); });
    DOM['btn-clear-data'].addEventListener('click', () => {
        showConfirm('Apagar Progresso', 'Apagar todo o progresso? Não pode ser desfeito.', () => {
            SaveSystem.clear(); DOM['btn-continue'].disabled = true; showScreen('settings-screen');
        });
    });

    // About / Achievements back
    DOM['btn-about-back'].addEventListener('click', () => showScreen('menu-screen'));
    DOM['btn-achievements-back'].addEventListener('click', () => showScreen('menu-screen'));

    // Game
    DOM['btn-game-menu'].addEventListener('click', openSidebar);
    DOM['btn-close-sidebar'].addEventListener('click', closeSidebar);
    DOM['sidebar-overlay'].addEventListener('click', closeSidebar);
    DOM['btn-save-game'].addEventListener('click', () => {
        SaveSystem.save(); closeSidebar();
        DOM['btn-save-game'].textContent = '✅ Salvo!';
        setTimeout(() => { DOM['btn-save-game'].textContent = '💾 Salvar Jogo'; }, 2000);
    });
    DOM['btn-back-menu'].addEventListener('click', () => {
        showConfirm('Voltar ao Menu', 'Voltar? Progresso será salvo.', () => {
            SaveSystem.save(); closeSidebar(); showScreen('menu-screen');
            DOM['btn-continue'].disabled = !SaveSystem.hasSave();
        });
    });

    // Tip
    DOM['btn-close-tip'].addEventListener('click', closeTip);

    // Result
    DOM['btn-play-again'].addEventListener('click', () => { SaveSystem.clear(); startNewGame(); });
    DOM['btn-result-menu'].addEventListener('click', () => { showScreen('menu-screen'); DOM['btn-continue'].disabled = !SaveSystem.hasSave(); });

    // Hub
    setupHubEvents();

    // Keyboard
    document.addEventListener('keydown', e => {
        if (!DOM['game-screen'].classList.contains('active') && !DOM['hub-screen'].classList.contains('active')) return;
        const map = {'1':0,'2':1,'3':2,'4':3,'a':0,'b':1,'c':2,'d':3};
        const k = e.key.toLowerCase();
        if (map[k] !== undefined) {
            const btns = DOM['choices-container'].querySelectorAll('.choice-btn');
            const pBtns = DOM['phone-screen'].querySelectorAll('.phone-choice-btn');
            const iBtns = DOM['investigation-choices']?.querySelectorAll('.choice-btn');
            const all = btns.length ? btns : pBtns.length ? pBtns : iBtns;
            if (all && all[map[k]]) all[map[k]].click();
        }
        if (e.key === 'Escape') {
            if (DOM['game-sidebar'].classList.contains('open')) closeSidebar();
            if (DOM['tip-overlay'].style.display === 'flex') DOM['btn-close-tip'].click();
        }
    });
}

// ============================================
// INIT
// ============================================
function init() {
    cacheDom();
    SaveSystem.loadSettings();
    applySettings();
    DOM['btn-continue'].disabled = !SaveSystem.hasSave();
    // Load achievements from save for menu display
    const saved = SaveSystem.load();
    if (saved && saved.achievements) gameState.achievements = saved.achievements;
    setupEvents();
    runLoading();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();