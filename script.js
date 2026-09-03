/* ============================================
   POR TRÁS DA TELA — JOGO COMPLETO
   ============================================
   Jogo interativo educacional sobre cyberbullying,
   empatia e segurança digital.
   Todos os personagens e situações são fictícios.
   ============================================ */

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
    choices: [],          // histórico de escolhas: [{chapter, scene, choiceIndex, choiceId}]
    achievements: [],     // IDs das conquistas desbloqueadas
    choiceFlags: {},      // flags para lógica condicional
    hasPlayed: false
};

// ============================================
// CONFIGURAÇÕES
// ============================================
const settings = {
    music: true,
    sfx: true,
    animations: true
};

// ============================================
// DEFINIÇÃO DE CONQUISTAS
// ============================================
const ACHIEVEMENTS = {
    guardian: {
        id: 'guardian',
        icon: '🛡️',
        name: 'Guardião Digital',
        desc: 'Tomou decisões seguras em todas as situações.'
    },
    empath: {
        id: 'empath',
        icon: '💜',
        name: 'Empatia Total',
        desc: 'Apoiou todos os personagens que precisaram de ajuda.'
    },
    reporter: {
        id: 'reporter',
        icon: '🚨',
        name: 'Denunciante',
        desc: 'Escolheu denunciar situações perigosas.'
    },
    witness: {
        id: 'witness',
        icon: '👀',
        name: 'Testemunha Atenta',
        desc: 'Identificou todas as situações de cyberbullying.'
    },
    secondChance: {
        id: 'secondChance',
        icon: '🔄',
        name: 'Segunda Chance',
        desc: 'Jogou novamente depois de um final negativo.'
    },
    brave: {
        id: 'brave',
        icon: '🦁',
        name: 'Corajoso',
        desc: 'Teve coragem de enfrentar situações difíceis de forma responsável.'
    }
};

// ============================================
// DADOS DOS CAPÍTULOS E CENAS
// ============================================
const chapters = [
    // ==============================
    // CAPÍTULO 1 — A PRIMEIRA MENSAGEM
    // ==============================
    {
        id: 1,
        title: "A Primeira Mensagem",
        desc: "Você presencia uma mensagem ofensiva direcionada a um colega. Como vai reagir?",
        scenes: [
            {
                // Cena 0 — Intro narrativa
                type: 'narrative',
                visual: '📱',
                speaker: 'Narrador',
                text: 'É segunda-feira de manhã. Você está no intervalo da escola, sentado no pátio, quando pega o celular para checar as mensagens.\n\nO grupo da turma está movimentado.',
                choices: [
                    {
                        text: 'Abrir o grupo da turma',
                        next: 1
                    }
                ]
            },
            {
                // Cena 1 — Celular: grupo
                type: 'phone',
                phoneType: 'chat',
                appName: '💬 Grupo — Turma 9B',
                messages: [
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Kkkkk alguém viu a foto do Rafael?', time: '08:32' },
                    { avatar: '😂', name: 'Bia_oficial', text: 'Sim!!! Morri de rir kkkk', time: '08:33' },
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Que vergonha ser ele hein', time: '08:33', offensive: true },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Vou postar no meu perfil essa foto kkk', time: '08:34', offensive: true },
                ],
                afterText: 'Você percebe que estão rindo de uma foto constrangedora de Rafael, um colega mais quieto da turma. Parece que alguém tirou a foto sem ele perceber.',
                choices: [
                    {
                        letter: 'A',
                        text: 'Responder com risada e pedir para mandarem a foto',
                        effects: { security: -10, empathy: -15, courage: -5, trust: -10 },
                        flag: 'ch1_joined_mockery',
                        tip: 'Participar de uma situação de cyberbullying, mesmo que pareça "brincadeira", contribui para o sofrimento da vítima e pode ter consequências sérias para todos os envolvidos.',
                        next: 2
                    },
                    {
                        letter: 'B',
                        text: 'Ignorar e fechar o celular',
                        effects: { security: 0, empathy: -5, courage: -5, trust: 0 },
                        flag: 'ch1_ignored',
                        next: 3
                    },
                    {
                        letter: 'C',
                        text: 'Tirar print da conversa e guardar como evidência',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 5 },
                        flag: 'ch1_saved_evidence',
                        decisionText: 'Você guardou evidências de uma situação de cyberbullying.',
                        next: 4
                    },
                    {
                        letter: 'D',
                        text: 'Mandar uma mensagem dizendo que isso não é legal',
                        effects: { security: 5, empathy: 15, courage: 15, trust: 10 },
                        flag: 'ch1_spoke_up',
                        decisionText: 'Você se posicionou contra o cyberbullying no grupo.',
                        next: 5
                    }
                ]
            },
            {
                // Cena 2 — Consequência A (participou)
                type: 'narrative',
                visual: '😕',
                speaker: 'Narrador',
                text: 'Você respondeu com risadas. Logo depois, mais pessoas começaram a compartilhar a foto e fazer piadas. O grupo ficou ainda mais cruel.\n\nNo dia seguinte, Rafael não veio à escola. Você sente um peso estranho.',
                choices: [{ text: 'Continuar', nextChapter: 2 }]
            },
            {
                // Cena 3 — Consequência B (ignorou)
                type: 'narrative',
                visual: '🤷',
                speaker: 'Narrador',
                text: 'Você fechou o celular e tentou não pensar naquilo. Mas durante o resto do dia, viu que a foto de Rafael estava sendo compartilhada por várias pessoas.\n\nRafael passou o dia cabisbaixo. Você poderia ter feito algo?',
                tip: 'Ignorar uma situação de cyberbullying não é o mesmo que não participar. Testemunhas silenciosas podem ajudar a vítima se tomarem uma atitude.',
                choices: [{ text: 'Continuar', nextChapter: 2 }]
            },
            {
                // Cena 4 — Consequência C (evidência)
                type: 'narrative',
                visual: '📸',
                speaker: 'Narrador',
                text: 'Você tirou print de tudo com cuidado. Não compartilhou a foto, mas guardou as evidências.\n\nIsso pode ser muito útil depois. Saber preservar provas é um passo importante para ajudar a resolver a situação de forma responsável.',
                choices: [{ text: 'Continuar', nextChapter: 2 }]
            },
            {
                // Cena 5 — Consequência D (falou)
                type: 'narrative',
                visual: '💬',
                speaker: 'Narrador',
                text: 'Você mandou uma mensagem no grupo:\n\n"Gente, isso não é engraçado. Tirar foto de alguém sem permissão e ficar zoando é errado."\n\nAlgumas pessoas ficaram em silêncio. Lucas mandou "relaxa, é brincadeira", mas as piadas pararam um pouco. Você sentiu que fez a coisa certa, mesmo que não tenha sido fácil.',
                choices: [{ text: 'Continuar', nextChapter: 2 }]
            }
        ]
    },
    // ==============================
    // CAPÍTULO 2 — O PERFIL FALSO
    // ==============================
    {
        id: 2,
        title: "O Perfil Falso",
        desc: "Um perfil falso aparece nas redes sociais para ridicularizar um colega. O que você vai fazer?",
        scenes: [
            {
                // Cena 0 — Intro
                type: 'narrative',
                visual: '👤',
                speaker: 'Narrador',
                text: 'Alguns dias se passaram. Quando você abre sua rede social, percebe que um perfil estranho apareceu: "@rafael_o_ridiculo".\n\nO perfil usa uma foto editada de Rafael com textos humilhantes na bio.',
                choices: [
                    { text: 'Ver o perfil', next: 1 }
                ]
            },
            {
                // Cena 1 — Celular: perfil falso
                type: 'phone',
                phoneType: 'profile',
                profileData: {
                    avatar: '🤡',
                    name: '@rafael_o_ridiculo',
                    bio: '"Perfil oficial do maior perdedor da escola"\n15 seguidores · 3 publicações',
                    isFake: true
                },
                afterText: 'O perfil foi criado apenas para humilhar Rafael. Algumas pessoas da escola já seguem e até comentaram rindo.\n\nIsso é claramente cyberbullying. Criar perfis falsos para ridicularizar alguém pode ter consequências legais.',
                choices: [
                    {
                        letter: 'A',
                        text: 'Seguir o perfil e ver as publicações por curiosidade',
                        effects: { security: -5, empathy: -10, courage: -5, trust: -5 },
                        flag: 'ch2_followed_fake',
                        tip: 'Seguir ou interagir com perfis criados para humilhar alguém aumenta o alcance e incentiva quem criou. Cada seguidor é um incentivo a mais para o agressor.',
                        next: 2
                    },
                    {
                        letter: 'B',
                        text: 'Ignorar o perfil',
                        effects: { security: 0, empathy: -3, courage: -3, trust: 0 },
                        flag: 'ch2_ignored_profile',
                        next: 3
                    },
                    {
                        letter: 'C',
                        text: 'Denunciar o perfil na plataforma',
                        effects: { security: 15, empathy: 10, courage: 10, trust: 10 },
                        flag: 'ch2_reported',
                        decisionText: 'Você denunciou o perfil falso.',
                        next: 4
                    },
                    {
                        letter: 'D',
                        text: 'Tirar print, denunciar e contar para Rafael que o perfil existe',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        flag: 'ch2_full_support',
                        decisionText: 'Você denunciou e avisou a vítima sobre o perfil falso.',
                        next: 5
                    }
                ]
            },
            {
                // Cena 2 — Seguiu
                type: 'narrative',
                visual: '📊',
                speaker: 'Narrador',
                text: 'Você seguiu o perfil. Logo o número de seguidores cresceu. Quem criou o perfil se sentiu motivado e começou a postar mais conteúdo ofensivo.\n\nRafael descobriu o perfil e ficou arrasado ao ver quantas pessoas estavam seguindo e curtindo.',
                choices: [{ text: 'Continuar', nextChapter: 3 }]
            },
            {
                // Cena 3 — Ignorou
                type: 'narrative',
                visual: '🤐',
                speaker: 'Narrador',
                text: 'Você decidiu não interagir com o perfil, mas também não fez nada a respeito. O perfil continuou ativo por vários dias antes de alguém finalmente denunciar.\n\nRafael sofreu em silêncio durante esse tempo todo.',
                choices: [{ text: 'Continuar', nextChapter: 3 }]
            },
            {
                // Cena 4 — Denunciou
                type: 'narrative',
                visual: '🚨',
                speaker: 'Narrador',
                text: 'Você denunciou o perfil diretamente na plataforma. Em algumas horas, o perfil foi removido.\n\nÉ importante saber que as redes sociais possuem ferramentas de denúncia justamente para situações como essa.',
                choices: [{ text: 'Continuar', nextChapter: 3 }]
            },
            {
                // Cena 5 — Denunciou + avisou
                type: 'narrative',
                visual: '🤝',
                speaker: 'Narrador',
                text: 'Você denunciou o perfil, tirou prints como evidência e procurou Rafael para conversar.\n\n"Cara, eu vi aquele perfil falso. Já denunciei. Guardei as provas, se precisar."\n\nRafael ficou surpreso. Ninguém tinha feito isso por ele. Pela primeira vez em dias, ele não se sentiu sozinho.',
                choices: [{ text: 'Continuar', nextChapter: 3 }]
            }
        ]
    },
    // ==============================
    // CAPÍTULO 3 — O GRUPO
    // ==============================
    {
        id: 3,
        title: "O Grupo",
        desc: "Um novo grupo foi criado para excluir e humilhar. Você foi adicionado. E agora?",
        scenes: [
            {
                // Cena 0 — Intro
                type: 'narrative',
                visual: '👥',
                speaker: 'Narrador',
                text: 'Uma notificação aparece no seu celular:\n\n"Bia_oficial adicionou você ao grupo: SEM O RAFAEL"\n\nO nome do grupo já diz tudo. É um grupo criado para falar mal de Rafael pelas costas.',
                choices: [{ text: 'Ver o grupo', next: 1 }]
            },
            {
                // Cena 1 — Celular: grupo novo
                type: 'phone',
                phoneType: 'chat',
                appName: '💬 SEM O RAFAEL',
                messages: [
                    { avatar: '😂', name: 'Bia_oficial', text: 'Grupo oficial pra gente conversar sem aquele chato kkk', time: '19:15' },
                    { avatar: '😎', name: 'Lucas_gamer', text: 'Finalmente um espaço livre kkk', time: '19:16' },
                    { avatar: '🤡', name: 'Pedro.zz', text: 'Bora combinar de não chamar ele pro rolê de sábado', time: '19:17', offensive: true },
                    { avatar: '😈', name: 'Fernanda_sz', text: 'Ele é tão estranho, ninguém aguenta', time: '19:18', offensive: true }
                ],
                afterText: 'O grupo foi criado para excluir Rafael propositalmente. Exclusão social intencional é uma forma de bullying.\n\nVocê foi adicionado. 15 pessoas já estão no grupo.',
                choices: [
                    {
                        letter: 'A',
                        text: 'Participar do grupo e mandar mensagens concordando',
                        effects: { security: -10, empathy: -15, courage: -5, trust: -15 },
                        flag: 'ch3_participated',
                        tip: 'Participar de grupos criados para excluir ou humilhar alguém é uma forma ativa de cyberbullying, mesmo que você ache que "é só um grupo".',
                        next: 2
                    },
                    {
                        letter: 'B',
                        text: 'Ficar no grupo mas não dizer nada',
                        effects: { security: -3, empathy: -5, courage: -5, trust: -3 },
                        flag: 'ch3_silent',
                        tip: 'Permanecer em um grupo que existe para humilhar alguém, mesmo sem participar, dá a impressão de que você concorda com o que está acontecendo.',
                        next: 3
                    },
                    {
                        letter: 'C',
                        text: 'Sair do grupo imediatamente',
                        effects: { security: 10, empathy: 10, courage: 10, trust: 5 },
                        flag: 'ch3_left',
                        decisionText: 'Você saiu do grupo criado para excluir um colega.',
                        next: 4
                    },
                    {
                        letter: 'D',
                        text: 'Sair do grupo, guardar evidências e procurar um professor de confiança',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        flag: 'ch3_reported_adult',
                        decisionText: 'Você procurou a ajuda de um adulto de confiança.',
                        next: 5
                    }
                ]
            },
            {
                // Cena 2 — Participou
                type: 'narrative',
                visual: '😬',
                speaker: 'Narrador',
                text: 'Você mandou mensagens no grupo, concordando com as piadas. No dia seguinte, Rafael apareceu na escola sabendo que o grupo existia — alguém contou para ele.\n\nEle olhou para você no corredor. Nos olhos dele, havia mais do que tristeza. Havia decepção.\n\nA situação está piorando cada vez mais.',
                choices: [{ text: 'Continuar', nextChapter: 4 }]
            },
            {
                // Cena 3 — Ficou quieto
                type: 'narrative',
                visual: '😶',
                speaker: 'Narrador',
                text: 'Você ficou no grupo sem dizer nada. As mensagens continuaram por dias. A exclusão de Rafael ficou cada vez mais organizada — não chamavam ele para nada, faziam piadas na frente dele.\n\nVocê não participou ativamente, mas também não fez nada para ajudar.',
                choices: [{ text: 'Continuar', nextChapter: 4 }]
            },
            {
                // Cena 4 — Saiu
                type: 'narrative',
                visual: '🚪',
                speaker: 'Narrador',
                text: 'Você saiu do grupo sem dizer nada. Alguns colegas estranharam, mas ninguém comentou muito.\n\nFoi um gesto simples, mas importante. Não participar de algo errado já é um primeiro passo.',
                choices: [{ text: 'Continuar', nextChapter: 4 }]
            },
            {
                // Cena 5 — Saiu + adulto
                type: 'narrative',
                visual: '🏫',
                speaker: 'Narrador',
                text: 'Você saiu do grupo, guardou os prints e procurou a professora Márcia, que é conselheira da turma.\n\n"Professora, preciso mostrar uma coisa pra senhora. Criaram um grupo pra excluir o Rafael e estão falando coisas muito pesadas."\n\nA professora ficou preocupada e agradeceu por você ter confiado nela. Ela prometeu tratar a situação com cuidado, sem expor ninguém desnecessariamente.',
                choices: [{ text: 'Continuar', nextChapter: 4 }]
            }
        ]
    },
    // ==============================
    // CAPÍTULO 4 — A IMAGEM
    // ==============================
    {
        id: 4,
        title: "A Imagem",
        desc: "Uma imagem pessoal de alguém começa a circular. Chegou a hora de tomar decisões sérias.",
        scenes: [
            {
                // Cena 0 — Intro
                type: 'narrative',
                visual: '⚠️',
                speaker: 'Narrador',
                text: 'A situação ficou mais grave.\n\nAgora, uma foto pessoal de Rafael — tirada em um momento particular — está sendo compartilhada em vários grupos. Alguém pegou essa imagem do celular dele sem autorização.\n\nIsso é muito sério. Compartilhar imagens pessoais sem consentimento pode ser crime.',
                choices: [{ text: 'Ver a situação', next: 1 }]
            },
            {
                // Cena 1 — Celular: notificações
                type: 'phone',
                phoneType: 'notifications',
                notifications: [
                    { icon: '💬', text: 'Lucas_gamer enviou uma imagem no grupo "Turma 9B"', time: '2 min' },
                    { icon: '📩', text: 'Pedro.zz encaminhou uma mensagem para você', time: '5 min' },
                    { icon: '👥', text: '23 novas mensagens em "SEM O RAFAEL"', time: '8 min' },
                    { icon: '⚠️', text: 'Fernanda_sz publicou uma nova story', time: '12 min' }
                ],
                afterText: 'A foto de Rafael está se espalhando rapidamente. Você recebeu em uma mensagem privada.\n\nVocê sabe que compartilhar essa imagem é errado e pode causar danos irreparáveis.',
                choices: [
                    {
                        letter: 'A',
                        text: 'Compartilhar a foto — "todo mundo já viu mesmo"',
                        effects: { security: -15, empathy: -20, courage: -10, trust: -20 },
                        flag: 'ch4_shared_image',
                        tip: 'Compartilhar imagens pessoais de alguém sem consentimento é uma violação grave. Mesmo que "todo mundo esteja fazendo", isso não torna certo. No Brasil, isso pode configurar crime segundo o ECA e a Lei de Crimes Cibernéticos.',
                        next: 2
                    },
                    {
                        letter: 'B',
                        text: 'Não compartilhar, mas guardar a foto no celular',
                        effects: { security: -5, empathy: -5, courage: 0, trust: -5 },
                        flag: 'ch4_kept_image',
                        tip: 'Manter imagens compartilhadas sem consentimento, mesmo sem repassar, ainda contribui para a violação de privacidade. O melhor é apagar e denunciar.',
                        next: 3
                    },
                    {
                        letter: 'C',
                        text: 'Apagar a foto imediatamente e não compartilhar',
                        effects: { security: 10, empathy: 10, courage: 5, trust: 5 },
                        flag: 'ch4_deleted',
                        decisionText: 'Você se recusou a compartilhar conteúdo ofensivo.',
                        next: 4
                    },
                    {
                        letter: 'D',
                        text: 'Apagar a foto, guardar evidências dos remetentes e procurar ajuda de um adulto responsável',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        flag: 'ch4_full_response',
                        decisionText: 'Você tomou todas as medidas responsáveis diante de uma violação grave.',
                        next: 5
                    }
                ]
            },
            {
                // Cena 2 — Compartilhou
                type: 'narrative',
                visual: '💔',
                speaker: 'Narrador',
                text: 'Você compartilhou a foto. Ela se espalhou ainda mais.\n\nNo dia seguinte, Rafael não apareceu na escola. E no outro dia também não. A mãe dele ligou para a escola. Ele estava tendo crises de ansiedade e se recusava a sair de casa.\n\nA diretora começou a investigar. Todos que compartilharam podem ter consequências.',
                choices: [{ text: 'Continuar', nextChapter: 5 }]
            },
            {
                // Cena 3 — Guardou
                type: 'narrative',
                visual: '😔',
                speaker: 'Narrador',
                text: 'Você não compartilhou, mas também não fez nada para ajudar. A foto continuou circulando por dias.\n\nRafael ficou cada vez mais afastado. Você se pergunta se poderia ter feito mais.',
                choices: [{ text: 'Continuar', nextChapter: 5 }]
            },
            {
                // Cena 4 — Apagou
                type: 'narrative',
                visual: '🗑️',
                speaker: 'Narrador',
                text: 'Você apagou a foto imediatamente e não compartilhou com ninguém. Foi a decisão certa.\n\nMesmo assim, a foto já estava circulando. Você fez sua parte, mas a situação ainda precisa de uma solução maior.',
                choices: [{ text: 'Continuar', nextChapter: 5 }]
            },
            {
                // Cena 5 — Resposta completa
                type: 'narrative',
                visual: '✊',
                speaker: 'Narrador',
                text: 'Você apagou a foto, mas antes registrou quem estava compartilhando. Depois, procurou o coordenador da escola e explicou tudo.\n\n"Senhor, tem uma foto pessoal do Rafael circulando. Eu apaguei a minha, mas trouxe os prints de quem está espalhando. Ele precisa de ajuda."\n\nO coordenador agradeceu e disse que ia tomar as providências necessárias. Rafael recebeu apoio.\n\nSua atitude fez uma diferença real.',
                choices: [{ text: 'Continuar', nextChapter: 5 }]
            }
        ]
    },
    // ==============================
    // CAPÍTULO 5 — A DECISÃO
    // ==============================
    {
        id: 5,
        title: "A Decisão",
        desc: "Todas as suas escolhas levaram até aqui. Este é o momento que define o resultado.",
        scenes: [
            {
                // Cena 0 — Intro final
                type: 'narrative',
                visual: '🌅',
                speaker: 'Narrador',
                text: 'Uma semana se passou. A escola convocou uma reunião para falar sobre cyberbullying depois de tudo que aconteceu.\n\nRafael voltou à escola, mas está diferente — mais quieto, desconfiado. Ele olha para você no corredor.',
                choices: [{ text: 'Continuar', next: 1 }]
            },
            {
                // Cena 1 — Encontro com Rafael
                type: 'narrative',
                visual: '😞',
                speaker: 'Rafael',
                text: function() {
                    if (gameState.trust >= 70) {
                        return '"Ei... eu sei que você tentou me ajudar. Obrigado. É sério. Quando tudo aquilo aconteceu, eu achei que ninguém se importava."\n\nEle dá um sorriso pequeno, mas sincero.';
                    } else if (gameState.trust >= 40) {
                        return '"Oi... Olha, eu não sei muito bem quem fez o quê. Mas a situação toda foi muito difícil pra mim. Eu espero que as coisas melhorem."';
                    } else {
                        return '"..." \n\nRafael não diz nada. Ele apenas passa por você sem olhar nos seus olhos. A confiança dele em todo mundo está abalada — inclusive em você.';
                    }
                },
                choices: [{ text: 'Continuar', next: 2 }]
            },
            {
                // Cena 2 — Reflexão + escolha final
                type: 'narrative',
                visual: '🪞',
                speaker: 'Narrador',
                text: 'A reunião da escola está para começar. A diretora vai falar sobre cyberbullying e pedir que os alunos reflitam sobre o que aconteceu.\n\nAntes da reunião, você tem uma última escolha.',
                choices: [
                    {
                        letter: 'A',
                        text: 'Ficar calado durante a reunião e esperar que tudo passe',
                        effects: { security: -5, empathy: -5, courage: -10, trust: -5 },
                        flag: 'ch5_stayed_silent',
                        next: 3
                    },
                    {
                        letter: 'B',
                        text: 'Levantar a mão e compartilhar o que aprendeu com a situação',
                        effects: { security: 10, empathy: 15, courage: 20, trust: 15 },
                        flag: 'ch5_spoke_up',
                        decisionText: 'Você teve coragem de se posicionar publicamente.',
                        next: 4
                    },
                    {
                        letter: 'C',
                        text: 'Depois da reunião, procurar Rafael e perguntar como ele está',
                        effects: { security: 5, empathy: 15, courage: 10, trust: 15 },
                        flag: 'ch5_checked_rafael',
                        decisionText: 'Você procurou saber como a vítima estava se sentindo.',
                        next: 5
                    },
                    {
                        letter: 'D',
                        text: 'Falar com a diretora em particular, entregar todas as evidências que você reuniu e sugerir que a escola crie um canal de denúncia anônimo',
                        effects: { security: 15, empathy: 15, courage: 15, trust: 15 },
                        flag: 'ch5_full_action',
                        decisionText: 'Você propôs uma solução para prevenir futuras situações.',
                        next: 6
                    }
                ]
            },
            {
                // Cena 3 — Calado
                type: 'narrative',
                visual: '🤐',
                speaker: 'Narrador',
                text: 'Você ficou em silêncio durante toda a reunião. A diretora falou, alguns alunos pareceram constrangidos, mas ninguém realmente se manifestou.\n\nA reunião acabou sem mudanças concretas. A sensação é de que tudo pode acontecer de novo.',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            {
                // Cena 4 — Falou na reunião
                type: 'narrative',
                visual: '🎤',
                speaker: 'Você',
                text: '"Eu queria dizer que... eu vi o que aconteceu com o Rafael. E acho que muita gente viu. Alguns participaram, outros ficaram calados — incluindo eu, em alguns momentos.\n\nEu aprendi que ficar calado também é uma forma de participar. E que a gente pode fazer diferente. Pode denunciar, pode apoiar, pode pelo menos não compartilhar."',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            {
                // Cena 5 — Procurou Rafael
                type: 'narrative',
                visual: '💚',
                speaker: 'Narrador',
                text: 'Depois da reunião, você encontrou Rafael sozinho.\n\n"E aí, Rafael. Como você tá?"\n\nEle pareceu surpreso com a pergunta. "Ninguém pergunta isso de verdade... Tô indo. É difícil, mas tô indo."\n\nVocês conversaram por alguns minutos. Às vezes, uma conversa simples faz mais diferença do que qualquer discurso.',
                choices: [{ text: 'Ver resultado', end: true }]
            },
            {
                // Cena 6 — Ação completa
                type: 'narrative',
                visual: '🌟',
                speaker: 'Narrador',
                text: 'Você procurou a diretora em particular e entregou todas as evidências.\n\n"Diretora, eu reuni prints de tudo que aconteceu. E gostaria de sugerir que a escola criasse um canal anônimo para que os alunos possam denunciar situações de bullying sem medo."\n\nA diretora ficou impressionada com sua maturidade e prometeu trabalhar nisso.\n\nNas semanas seguintes, a escola implementou um formulário anônimo e passou a discutir o tema em sala. Rafael começou a melhorar. Você fez a diferença.',
                choices: [{ text: 'Ver resultado', end: true }]
            }
        ]
    }
];

// ============================================
// REFERÊNCIAS DOM
// ============================================
const DOM = {
    // Screens
    loadingScreen: document.getElementById('loading-screen'),
    menuScreen: document.getElementById('menu-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    aboutScreen: document.getElementById('about-screen'),
    gameScreen: document.getElementById('game-screen'),
    chapterTransition: document.getElementById('chapter-transition'),
    resultScreen: document.getElementById('result-screen'),

    // Loading
    loadingBar: document.getElementById('loading-bar'),
    loadingText: document.getElementById('loading-text'),

    // Menu buttons
    btnNewGame: document.getElementById('btn-new-game'),
    btnContinue: document.getElementById('btn-continue'),
    btnSettings: document.getElementById('btn-settings'),
    btnAbout: document.getElementById('btn-about'),

    // Settings
    btnSettingsBack: document.getElementById('btn-settings-back'),
    toggleMusic: document.getElementById('toggle-music'),
    toggleSfx: document.getElementById('toggle-sfx'),
    toggleAnimations: document.getElementById('toggle-animations'),
    btnClearData: document.getElementById('btn-clear-data'),

    // About
    btnAboutBack: document.getElementById('btn-about-back'),

    // Game header
    btnGameMenu: document.getElementById('btn-game-menu'),
    chapterIndicator: document.getElementById('chapter-indicator'),
    chapterTitleHeader: document.getElementById('chapter-title-header'),

    // Mini stats
    msSecurity: document.getElementById('ms-security'),
    msEmpathy: document.getElementById('ms-empathy'),
    msCourage: document.getElementById('ms-courage'),
    msTrust: document.getElementById('ms-trust'),

    // Game main
    narrativeContainer: document.getElementById('narrative-container'),
    sceneVisual: document.getElementById('scene-visual'),
    speakerName: document.getElementById('speaker-name'),
    dialogueText: document.getElementById('dialogue-text'),
    choicesContainer: document.getElementById('choices-container'),
    phoneContainer: document.getElementById('phone-container'),
    phoneScreen: document.getElementById('phone-screen'),
    phoneTime: document.getElementById('phone-time'),

    // Sidebar
    gameSidebar: document.getElementById('game-sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    btnCloseSidebar: document.getElementById('btn-close-sidebar'),
    sfSecurity: document.getElementById('sf-security'),
    sfEmpathy: document.getElementById('sf-empathy'),
    sfCourage: document.getElementById('sf-courage'),
    sfTrust: document.getElementById('sf-trust'),
    svSecurity: document.getElementById('sv-security'),
    svEmpathy: document.getElementById('sv-empathy'),
    svCourage: document.getElementById('sv-courage'),
    svTrust: document.getElementById('sv-trust'),
    sidebarAchievementsList: document.getElementById('sidebar-achievements-list'),
    btnSaveGame: document.getElementById('btn-save-game'),
    btnBackMenu: document.getElementById('btn-back-menu'),

    // Chapter transition
    transitionChapterNum: document.getElementById('transition-chapter-num'),
    transitionTitle: document.getElementById('transition-title'),
    transitionDesc: document.getElementById('transition-desc'),

    // Tip
    tipOverlay: document.getElementById('tip-overlay'),
    tipText: document.getElementById('tip-text'),
    btnCloseTip: document.getElementById('btn-close-tip'),

    // Achievement toast
    achievementToast: document.getElementById('achievement-toast'),
    achToastIcon: document.getElementById('ach-toast-icon'),
    achToastName: document.getElementById('ach-toast-name'),

    // Result
    resultEmoji: document.getElementById('result-emoji'),
    resultHeader: document.getElementById('result-header'),
    resultTitle: document.getElementById('result-title'),
    resultSubtitle: document.getElementById('result-subtitle'),
    rsSecurity: document.getElementById('rs-security'),
    rsEmpathy: document.getElementById('rs-empathy'),
    rsCourage: document.getElementById('rs-courage'),
    rsTrust: document.getElementById('rs-trust'),
    rsvSecurity: document.getElementById('rsv-security'),
    rsvEmpathy: document.getElementById('rsv-empathy'),
    rsvCourage: document.getElementById('rsv-courage'),
    rsvTrust: document.getElementById('rsv-trust'),
    resultDecisionsList: document.getElementById('result-decisions-list'),
    resultAchievementsList: document.getElementById('result-achievements-list'),
    resultMessage: document.getElementById('result-message'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    btnResultMenu: document.getElementById('btn-result-menu'),

    // Confirm modal
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmText: document.getElementById('confirm-text'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmAccept: document.getElementById('confirm-accept')
};

// ============================================
// SISTEMA DE ÁUDIO (STUB)
// ============================================
const AudioSystem = {
    // Placeholder — os sons podem ser adicionados depois
    // Estrutura pronta para receber arquivos de áudio
    sounds: {},

    play(name) {
        if (!settings.sfx) return;
        // Quando houver arquivos: this.sounds[name]?.play();
    },

    playMusic(name) {
        if (!settings.music) return;
        // Quando houver arquivos de música
    },

    stopMusic() {
        // Parar música atual
    }
};

// ============================================
// UTILITÁRIOS
// ============================================
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('active');
}

function showConfirm(title, text, onAccept) {
    DOM.confirmTitle.textContent = title;
    DOM.confirmText.textContent = text;
    DOM.confirmModal.style.display = 'flex';

    const handleAccept = () => {
        DOM.confirmModal.style.display = 'none';
        DOM.confirmAccept.removeEventListener('click', handleAccept);
        DOM.confirmCancel.removeEventListener('click', handleCancel);
        onAccept();
    };

    const handleCancel = () => {
        DOM.confirmModal.style.display = 'none';
        DOM.confirmAccept.removeEventListener('click', handleAccept);
        DOM.confirmCancel.removeEventListener('click', handleCancel);
    };

    DOM.confirmAccept.addEventListener('click', handleAccept);
    DOM.confirmCancel.addEventListener('click', handleCancel);
}

// ============================================
// SISTEMA DE SALVAMENTO (localStorage)
// ============================================
const SaveSystem = {
    SAVE_KEY: 'por_tras_da_tela_save',
    SETTINGS_KEY: 'por_tras_da_tela_settings',

    save() {
        try {
            const data = {
                chapter: gameState.chapter,
                scene: gameState.scene,
                security: gameState.security,
                empathy: gameState.empathy,
                courage: gameState.courage,
                trust: gameState.trust,
                choices: gameState.choices,
                achievements: gameState.achievements,
                choiceFlags: gameState.choiceFlags,
                hasPlayed: gameState.hasPlayed,
                savedAt: Date.now()
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return null;
        }
    },

    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    },

    clear() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    saveSettings() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Erro ao salvar configurações:', e);
        }
    },

    loadSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            if (raw) {
                const loaded = JSON.parse(raw);
                Object.assign(settings, loaded);
            }
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
    }
};

// ============================================
// ATUALIZAR UI
// ============================================
function updateStatsUI() {
    const sec = clamp(gameState.security, 0, 100);
    const emp = clamp(gameState.empathy, 0, 100);
    const cou = clamp(gameState.courage, 0, 100);
    const tru = clamp(gameState.trust, 0, 100);

    // Mini stats no header
    DOM.msSecurity.textContent = sec;
    DOM.msEmpathy.textContent = emp;
    DOM.msCourage.textContent = cou;
    DOM.msTrust.textContent = tru;

    // Sidebar stats
    DOM.sfSecurity.style.width = sec + '%';
    DOM.sfEmpathy.style.width = emp + '%';
    DOM.sfCourage.style.width = cou + '%';
    DOM.sfTrust.style.width = tru + '%';
    DOM.svSecurity.textContent = sec;
    DOM.svEmpathy.textContent = emp;
    DOM.svCourage.textContent = cou;
    DOM.svTrust.textContent = tru;
}

function updateAchievementsUI() {
    const list = DOM.sidebarAchievementsList;
    if (gameState.achievements.length === 0) {
        list.innerHTML = '<p class="no-achievements">Nenhuma conquista ainda.</p>';
    } else {
        list.innerHTML = gameState.achievements.map(achId => {
            const ach = ACHIEVEMENTS[achId];
            if (!ach) return '';
            return `<div class="sidebar-ach-item"><span class="ach-icon">${ach.icon}</span><span>${ach.name}</span></div>`;
        }).join('');
    }
}

function updateChapterHeader() {
    const ch = chapters.find(c => c.id === gameState.chapter);
    if (ch) {
        DOM.chapterIndicator.querySelector('.chapter-label').textContent = `Capítulo ${ch.id}`;
        DOM.chapterTitleHeader.textContent = ch.title;
    }
}

// ============================================
// SISTEMA DE CONQUISTAS
// ============================================
function checkAchievements() {
    const flags = gameState.choiceFlags;

    // Guardião Digital — todas as decisões seguras
    if (!gameState.achievements.includes('guardian')) {
        const safeFlags = ['ch1_saved_evidence', 'ch1_spoke_up', 'ch2_reported', 'ch2_full_support',
            'ch3_left', 'ch3_reported_adult', 'ch4_deleted', 'ch4_full_response'];
        const hasBadFlags = ['ch1_joined_mockery', 'ch2_followed_fake', 'ch3_participated',
            'ch4_shared_image'].some(f => flags[f]);
        const hasGoodFlags = safeFlags.some(f => flags[f]);
        if (hasGoodFlags && !hasBadFlags && gameState.security >= 70) {
            unlockAchievement('guardian');
        }
    }

    // Empatia Total
    if (!gameState.achievements.includes('empath')) {
        if (gameState.empathy >= 80 &&
            (flags['ch1_spoke_up'] || flags['ch2_full_support'] || flags['ch5_checked_rafael'])) {
            unlockAchievement('empath');
        }
    }

    // Denunciante
    if (!gameState.achievements.includes('reporter')) {
        if (flags['ch2_reported'] || flags['ch2_full_support'] || flags['ch3_reported_adult'] || flags['ch4_full_response']) {
            unlockAchievement('reporter');
        }
    }

    // Testemunha Atenta
    if (!gameState.achievements.includes('witness')) {
        const witnessFlags = ['ch1_saved_evidence', 'ch1_spoke_up', 'ch2_reported', 'ch2_full_support'];
        if (witnessFlags.filter(f => flags[f]).length >= 2) {
            unlockAchievement('witness');
        }
    }

    // Corajoso
    if (!gameState.achievements.includes('brave')) {
        if (gameState.courage >= 75 && (flags['ch5_spoke_up'] || flags['ch5_full_action'])) {
            unlockAchievement('brave');
        }
    }
}

function unlockAchievement(achId) {
    if (gameState.achievements.includes(achId)) return;
    gameState.achievements.push(achId);

    const ach = ACHIEVEMENTS[achId];
    if (!ach) return;

    // Toast
    DOM.achToastIcon.textContent = ach.icon;
    DOM.achToastName.textContent = ach.name;
    DOM.achievementToast.style.display = 'flex';
    DOM.achievementToast.style.animation = 'none';
    // Trigger reflow
    void DOM.achievementToast.offsetWidth;
    DOM.achievementToast.style.animation = 'slideInRight 0.5s ease, fadeOut 0.5s ease 3s forwards';

    setTimeout(() => {
        DOM.achievementToast.style.display = 'none';
    }, 4000);

    AudioSystem.play('achievement');
    updateAchievementsUI();
}

// ============================================
// SISTEMA DE DICAS
// ============================================
function showTip(text) {
    DOM.tipText.textContent = text;
    DOM.tipOverlay.style.display = 'flex';
    AudioSystem.play('notification');
}

function closeTip() {
    DOM.tipOverlay.style.display = 'none';
}

// ============================================
// RENDERIZAR CENA
// ============================================
function getCurrentChapter() {
    return chapters.find(c => c.id === gameState.chapter);
}

function getCurrentScene() {
    const ch = getCurrentChapter();
    if (!ch) return null;
    return ch.scenes[gameState.scene] || null;
}

function renderScene() {
    const scene = getCurrentScene();
    if (!scene) return;

    updateChapterHeader();
    updateStatsUI();

    if (scene.type === 'phone') {
        renderPhoneScene(scene);
    } else {
        renderNarrativeScene(scene);
    }
}

function renderNarrativeScene(scene) {
    // Mostrar narrativa, esconder celular
    DOM.narrativeContainer.style.display = 'flex';
    DOM.phoneContainer.style.display = 'none';

    // Visual
    DOM.sceneVisual.textContent = scene.visual || '📖';

    // Speaker
    const speakerText = scene.speaker || '';
    DOM.speakerName.textContent = speakerText;

    // Dialogue — suporta texto dinâmico (função)
    let text = typeof scene.text === 'function' ? scene.text() : scene.text;
    DOM.dialogueText.textContent = '';

    // Efeito de digitação
    if (settings.animations) {
        typewriterEffect(DOM.dialogueText, text, 15);
    } else {
        DOM.dialogueText.textContent = text;
    }

    // Choices
    renderChoices(scene.choices);

    // Re-animar container
    if (settings.animations) {
        DOM.narrativeContainer.style.animation = 'none';
        void DOM.narrativeContainer.offsetWidth;
        DOM.narrativeContainer.style.animation = 'fadeInUp 0.5s ease';
    }
}

function typewriterEffect(element, text, speed) {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(interval);
        }
    }, speed);
    // Clicar para pular
    const skipHandler = () => {
        clearInterval(interval);
        element.textContent = text;
        element.removeEventListener('click', skipHandler);
    };
    element.addEventListener('click', skipHandler);
}

function renderChoices(choices) {
    DOM.choicesContainer.innerHTML = '';
    if (!choices || choices.length === 0) return;

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', `Escolha ${choice.letter || (index + 1)}: ${choice.text}`);

        if (choice.letter) {
            btn.innerHTML = `<span class="choice-letter">${choice.letter}</span><span class="choice-text">${choice.text}</span>`;
        } else {
            btn.innerHTML = `<span class="choice-text">${choice.text}</span>`;
        }

        btn.addEventListener('click', () => handleChoice(choice, index));
        DOM.choicesContainer.appendChild(btn);
    });
}

function renderPhoneScene(scene) {
    // Mostrar celular, esconder narrativa
    DOM.narrativeContainer.style.display = 'none';
    DOM.phoneContainer.style.display = 'flex';

    // Atualizar hora do celular
    const now = new Date();
    DOM.phoneTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let phoneHTML = '';

    if (scene.phoneType === 'chat') {
        phoneHTML = renderPhoneChat(scene);
    } else if (scene.phoneType === 'profile') {
        phoneHTML = renderPhoneProfile(scene);
    } else if (scene.phoneType === 'notifications') {
        phoneHTML = renderPhoneNotifications(scene);
    }

    // Texto depois do celular
    if (scene.afterText) {
        phoneHTML += `<div style="padding: 16px; border-top: 1px solid #374151;">
            <p style="font-size: 13px; color: #9CA3AF; line-height: 1.7;">${scene.afterText}</p>
        </div>`;
    }

    // Choices dentro do celular
    if (scene.choices) {
        phoneHTML += '<div class="phone-choices">';
        scene.choices.forEach((choice, index) => {
            phoneHTML += `<button class="phone-choice-btn" data-choice-index="${index}" aria-label="Escolha ${choice.letter}: ${choice.text}">
                <span class="choice-letter">${choice.letter}</span>
                <span>${choice.text}</span>
            </button>`;
        });
        phoneHTML += '</div>';
    }

    DOM.phoneScreen.innerHTML = phoneHTML;

    // Event listeners para choices do celular
    DOM.phoneScreen.querySelectorAll('.phone-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.choiceIndex);
            handleChoice(scene.choices[idx], idx);
        });
    });
}

function renderPhoneChat(scene) {
    let html = `<div class="phone-app-header">
        <span style="font-size: 18px;">←</span>
        <span class="phone-app-name">${scene.appName || '💬 Chat'}</span>
    </div>`;

    if (scene.messages) {
        scene.messages.forEach((msg, i) => {
            const offensiveClass = msg.offensive ? ' offensive' : '';
            html += `<div class="phone-message" style="animation-delay: ${i * 0.15}s">
                <div class="phone-msg-avatar">${msg.avatar}</div>
                <div class="phone-msg-body">
                    <div class="phone-msg-name">${msg.name}</div>
                    <div class="phone-msg-text${offensiveClass}">${msg.text}</div>
                    <div class="phone-msg-time">${msg.time}</div>
                </div>
            </div>`;
        });
    }

    return html;
}

function renderPhoneProfile(scene) {
    const p = scene.profileData;
    let html = `<div class="phone-app-header">
        <span style="font-size: 18px;">←</span>
        <span class="phone-app-name">Perfil</span>
    </div>`;

    html += `<div class="phone-profile">
        <div class="phone-profile-avatar">${p.avatar}</div>
        <div class="phone-profile-name">${p.name}</div>
        <div class="phone-profile-bio">${p.bio}</div>
        ${p.isFake ? '<div class="phone-profile-fake-badge">⚠️ PERFIL FALSO</div>' : ''}
    </div>`;

    return html;
}

function renderPhoneNotifications(scene) {
    let html = `<div class="phone-app-header">
        <span class="phone-app-name">🔔 Notificações</span>
    </div>`;

    if (scene.notifications) {
        scene.notifications.forEach((notif, i) => {
            html += `<div class="phone-notification" style="animation-delay: ${i * 0.15}s">
                <div class="phone-notif-icon">${notif.icon}</div>
                <div class="phone-notif-text">${notif.text}</div>
                <div class="phone-notif-time">${notif.time}</div>
            </div>`;
        });
    }

    return html;
}

// ============================================
// LIDAR COM ESCOLHAS
// ============================================
function handleChoice(choice, index) {
    AudioSystem.play('choice');

    // Registrar escolha
    gameState.choices.push({
        chapter: gameState.chapter,
        scene: gameState.scene,
        choiceIndex: index,
        choiceText: choice.text,
        decisionText: choice.decisionText || null
    });

    // Aplicar efeitos
    if (choice.effects) {
        gameState.security = clamp(gameState.security + (choice.effects.security || 0), 0, 100);
        gameState.empathy = clamp(gameState.empathy + (choice.effects.empathy || 0), 0, 100);
        gameState.courage = clamp(gameState.courage + (choice.effects.courage || 0), 0, 100);
        gameState.trust = clamp(gameState.trust + (choice.effects.trust || 0), 0, 100);
    }

    // Definir flag
    if (choice.flag) {
        gameState.choiceFlags[choice.flag] = true;
    }

    updateStatsUI();

    // Verificar conquistas
    checkAchievements();

    // Mostrar tip se houver
    if (choice.tip) {
        showTip(choice.tip);
        // Armazenar próxima ação para executar após fechar a dica
        pendingAction = () => proceedAfterChoice(choice);
        return;
    }

    // Se a cena tem tip (não a choice)
    const scene = getCurrentScene();
    if (scene && scene.tip && !choice.tip) {
        showTip(scene.tip);
        pendingAction = () => proceedAfterChoice(choice);
        return;
    }

    proceedAfterChoice(choice);
}

let pendingAction = null;

function proceedAfterChoice(choice) {
    // Verificar se é final
    if (choice.end) {
        endGame();
        return;
    }

    // Verificar se muda de capítulo
    if (choice.nextChapter) {
        goToChapter(choice.nextChapter);
        return;
    }

    // Ir para próxima cena
    if (choice.next !== undefined) {
        gameState.scene = choice.next;
    } else {
        gameState.scene++;
    }

    // Auto-salvar
    SaveSystem.save();

    renderScene();
}

// ============================================
// TRANSIÇÃO DE CAPÍTULO
// ============================================
function goToChapter(chapterId) {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) {
        // Se não há capítulo, finalizar
        endGame();
        return;
    }

    gameState.chapter = chapterId;
    gameState.scene = 0;

    // Mostrar transição
    DOM.transitionChapterNum.textContent = `Capítulo ${ch.id}`;
    DOM.transitionTitle.textContent = ch.title;
    DOM.transitionDesc.textContent = ch.desc;

    showScreen('chapter-transition');
    AudioSystem.play('chapter');

    // Auto-salvar
    SaveSystem.save();

    setTimeout(() => {
        showScreen('game-screen');
        renderScene();
    }, 3000);
}

// ============================================
// FINALIZAR JOGO
// ============================================
function endGame() {
    gameState.hasPlayed = true;

    // Determinar final
    const totalScore = gameState.security + gameState.empathy + gameState.courage + gameState.trust;
    const avgScore = totalScore / 4;

    let ending;
    if (avgScore >= 70) {
        ending = 'positive';
    } else if (avgScore >= 45) {
        ending = 'neutral';
    } else {
        ending = 'negative';
    }

    // Verificar conquista "Segunda Chance"
    const savedData = SaveSystem.load();
    if (savedData && savedData.hasPlayed) {
        if (!gameState.achievements.includes('secondChance')) {
            unlockAchievement('secondChance');
        }
    }

    SaveSystem.save();
    showResultScreen(ending);
}

function showResultScreen(ending) {
    showScreen('result-screen');

    // Config baseada no final
    const endingConfig = {
        positive: {
            emoji: '🌟',
            title: 'VOCÊ FEZ A DIFERENÇA',
            subtitle: 'Você percebeu que ficar em silêncio nem sempre significa não participar. Pequenas atitudes podem fazer uma grande diferença.',
            headerClass: 'positive',
            message: 'Suas decisões mostraram maturidade, empatia e coragem. Você apoiou quem precisava, denunciou situações perigosas e buscou ajuda de forma responsável. O mundo precisa de mais pessoas como você — pessoas que não ficam caladas diante da injustiça. Continue assim. Cada escolha importa.'
        },
        neutral: {
            emoji: '💛',
            title: 'AINDA DÁ TEMPO',
            subtitle: 'Você tomou algumas boas decisões, mas também perdeu oportunidades de ajudar. Nunca é tarde para fazer diferente.',
            headerClass: 'neutral',
            message: 'Você demonstrou boas intenções em alguns momentos, mas em outros, a hesitação ou o silêncio permitiram que a situação se agravasse. Lembre-se: não é preciso ser herói para fazer a diferença. Às vezes, uma pequena ação — um print, uma denúncia, uma conversa — pode mudar tudo. Que tal tentar de novo?'
        },
        negative: {
            emoji: '⚠️',
            title: 'TUDO SAIU DO CONTROLE',
            subtitle: 'Suas decisões contribuíram para o agravamento da situação. Mas este não é o fim — é uma oportunidade de aprender.',
            headerClass: 'negative',
            message: 'Muitas vezes, a pressão do grupo, a curiosidade ou a falta de informação nos levam a tomar decisões que machucam outras pessoas. O importante é reconhecer isso e tentar fazer diferente. No mundo real, cada escolha na internet tem consequências. Mas a boa notícia é: você sempre pode recomeçar. Tente novamente e veja como suas escolhas podem mudar a história.'
        }
    };

    const config = endingConfig[ending];

    // Header
    DOM.resultEmoji.textContent = config.emoji;
    DOM.resultTitle.textContent = config.title;
    DOM.resultSubtitle.textContent = config.subtitle;
    DOM.resultHeader.className = `result-header ${config.headerClass}`;

    // Stats com animação
    setTimeout(() => {
        DOM.rsSecurity.style.width = gameState.security + '%';
        DOM.rsEmpathy.style.width = gameState.empathy + '%';
        DOM.rsCourage.style.width = gameState.courage + '%';
        DOM.rsTrust.style.width = gameState.trust + '%';
    }, 300);

    DOM.rsvSecurity.textContent = gameState.security;
    DOM.rsvEmpathy.textContent = gameState.empathy;
    DOM.rsvCourage.textContent = gameState.courage;
    DOM.rsvTrust.textContent = gameState.trust;

    // Decisões
    DOM.resultDecisionsList.innerHTML = '';
    const decisions = gameState.choices.filter(c => c.decisionText);
    if (decisions.length > 0) {
        decisions.forEach(d => {
            const li = document.createElement('li');
            li.textContent = d.decisionText;
            DOM.resultDecisionsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhuma ação positiva significativa foi registrada.';
        DOM.resultDecisionsList.appendChild(li);
    }

    // Conquistas
    DOM.resultAchievementsList.innerHTML = '';
    if (gameState.achievements.length > 0) {
        gameState.achievements.forEach(achId => {
            const ach = ACHIEVEMENTS[achId];
            if (!ach) return;
            const div = document.createElement('div');
            div.className = 'result-ach-item';
            div.innerHTML = `<span class="ach-icon">${ach.icon}</span><span>${ach.name} — ${ach.desc}</span>`;
            DOM.resultAchievementsList.appendChild(div);
        });
    } else {
        DOM.resultAchievementsList.innerHTML = '<p style="color: #9CA3AF; font-size: 14px;">Nenhuma conquista desbloqueada nesta partida.</p>';
    }

    // Mensagem final
    DOM.resultMessage.textContent = config.message;
}

// ============================================
// INICIAR NOVO JOGO
// ============================================
function startNewGame() {
    // Resetar estado
    gameState.chapter = 1;
    gameState.scene = 0;
    gameState.security = 50;
    gameState.empathy = 50;
    gameState.courage = 50;
    gameState.trust = 50;
    gameState.choices = [];
    gameState.achievements = [];
    gameState.choiceFlags = {};

    // Resetar visuals de resultado
    DOM.rsSecurity.style.width = '0%';
    DOM.rsEmpathy.style.width = '0%';
    DOM.rsCourage.style.width = '0%';
    DOM.rsTrust.style.width = '0%';

    updateStatsUI();
    updateAchievementsUI();

    // Salvar e ir para transição do capítulo 1
    SaveSystem.save();

    const ch = chapters[0];
    DOM.transitionChapterNum.textContent = `Capítulo ${ch.id}`;
    DOM.transitionTitle.textContent = ch.title;
    DOM.transitionDesc.textContent = ch.desc;

    showScreen('chapter-transition');
    AudioSystem.play('chapter');

    setTimeout(() => {
        showScreen('game-screen');
        renderScene();
    }, 3000);
}

// ============================================
// CONTINUAR JOGO
// ============================================
function continueGame() {
    const saved = SaveSystem.load();
    if (!saved) return;

    // Restaurar estado
    gameState.chapter = saved.chapter;
    gameState.scene = saved.scene;
    gameState.security = saved.security;
    gameState.empathy = saved.empathy;
    gameState.courage = saved.courage;
    gameState.trust = saved.trust;
    gameState.choices = saved.choices || [];
    gameState.achievements = saved.achievements || [];
    gameState.choiceFlags = saved.choiceFlags || {};
    gameState.hasPlayed = saved.hasPlayed || false;

    updateStatsUI();
    updateAchievementsUI();

    showScreen('game-screen');
    renderScene();
}

// ============================================
// SIDEBAR
// ============================================
function openSidebar() {
    DOM.gameSidebar.classList.add('open');
}

function closeSidebar() {
    DOM.gameSidebar.classList.remove('open');
}

// ============================================
// CONFIGURAÇÕES
// ============================================
function applySettings() {
    DOM.toggleMusic.checked = settings.music;
    DOM.toggleSfx.checked = settings.sfx;
    DOM.toggleAnimations.checked = settings.animations;

    if (!settings.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // --- MENU ---
    DOM.btnNewGame.addEventListener('click', () => {
        if (SaveSystem.hasSave()) {
            showConfirm(
                'Novo Jogo',
                'Você tem um jogo salvo. Começar um novo jogo irá apagar o progresso atual. Deseja continuar?',
                () => {
                    SaveSystem.clear();
                    startNewGame();
                }
            );
        } else {
            startNewGame();
        }
    });

    DOM.btnContinue.addEventListener('click', () => {
        continueGame();
    });

    DOM.btnSettings.addEventListener('click', () => {
        showScreen('settings-screen');
    });

    DOM.btnAbout.addEventListener('click', () => {
        showScreen('about-screen');
    });

    // --- SETTINGS ---
    DOM.btnSettingsBack.addEventListener('click', () => {
        showScreen('menu-screen');
    });

    DOM.toggleMusic.addEventListener('change', () => {
        settings.music = DOM.toggleMusic.checked;
        if (!settings.music) AudioSystem.stopMusic();
        SaveSystem.saveSettings();
    });

    DOM.toggleSfx.addEventListener('change', () => {
        settings.sfx = DOM.toggleSfx.checked;
        SaveSystem.saveSettings();
    });

    DOM.toggleAnimations.addEventListener('change', () => {
        settings.animations = DOM.toggleAnimations.checked;
        if (!settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        SaveSystem.saveSettings();
    });

    DOM.btnClearData.addEventListener('click', () => {
        showConfirm(
            'Apagar Progresso',
            'Tem certeza que deseja apagar todo o seu progresso? Esta ação não pode ser desfeita.',
            () => {
                SaveSystem.clear();
                DOM.btnContinue.disabled = true;
                showScreen('settings-screen');
            }
        );
    });

    // --- ABOUT ---
    DOM.btnAboutBack.addEventListener('click', () => {
        showScreen('menu-screen');
    });

    // --- GAME ---
    DOM.btnGameMenu.addEventListener('click', openSidebar);
    DOM.btnCloseSidebar.addEventListener('click', closeSidebar);
    DOM.sidebarOverlay.addEventListener('click', closeSidebar);

    DOM.btnSaveGame.addEventListener('click', () => {
        const success = SaveSystem.save();
        if (success) {
            closeSidebar();
            // Feedback visual simples
            DOM.btnSaveGame.textContent = '✅ Salvo!';
            setTimeout(() => {
                DOM.btnSaveGame.textContent = '💾 Salvar Jogo';
            }, 2000);
        }
    });

    DOM.btnBackMenu.addEventListener('click', () => {
        showConfirm(
            'Voltar ao Menu',
            'Deseja voltar ao menu principal? Seu progresso será salvo automaticamente.',
            () => {
                SaveSystem.save();
                closeSidebar();
                showScreen('menu-screen');
                // Atualizar botão continuar
                DOM.btnContinue.disabled = !SaveSystem.hasSave();
            }
        );
    });

    // --- TIP ---
    DOM.btnCloseTip.addEventListener('click', () => {
        closeTip();
        if (pendingAction) {
            const action = pendingAction;
            pendingAction = null;
            action();
        }
    });

    // --- RESULT ---
    DOM.btnPlayAgain.addEventListener('click', () => {
        // Verificar se último final foi negativo para conquista
        const saved = SaveSystem.load();
        if (saved && saved.hasPlayed) {
            // A conquista secondChance será verificada no próximo endGame
        }
        SaveSystem.clear();
        startNewGame();
    });

    DOM.btnResultMenu.addEventListener('click', () => {
        showScreen('menu-screen');
        DOM.btnContinue.disabled = !SaveSystem.hasSave();
    });

    // --- TECLADO ---
    document.addEventListener('keydown', (e) => {
        // Teclas 1-4 ou A-D para escolher
        const gameActive = DOM.gameScreen.classList.contains('active');
        if (!gameActive) return;

        const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        const key = e.key.toLowerCase();

        if (keyMap[key] !== undefined) {
            const btns = DOM.choicesContainer.querySelectorAll('.choice-btn');
            const phoneBtns = DOM.phoneScreen.querySelectorAll('.phone-choice-btn');
            const allBtns = btns.length > 0 ? btns : phoneBtns;

            if (allBtns[keyMap[key]]) {
                allBtns[keyMap[key]].click();
            }
        }

        // ESC para fechar sidebar/tip
        if (e.key === 'Escape') {
            if (DOM.gameSidebar.classList.contains('open')) {
                closeSidebar();
            }
            if (DOM.tipOverlay.style.display === 'flex') {
                DOM.btnCloseTip.click();
            }
        }
    });
}

// ============================================
// TELA DE LOADING
// ============================================
function runLoadingScreen() {
    const loadingTexts = [
        'Carregando história...',
        'Preparando personagens...',
        'Configurando cenários...',
        'Iniciando sistema...',
        'Quase pronto...'
    ];

    let progress = 0;
    let textIndex = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) progress = 100;

        DOM.loadingBar.style.width = progress + '%';

        if (progress > (textIndex + 1) * 20 && textIndex < loadingTexts.length - 1) {
            textIndex++;
            DOM.loadingText.textContent = loadingTexts[textIndex];
        }

        if (progress >= 100) {
            clearInterval(interval);
            DOM.loadingText.textContent = 'Pronto!';
            setTimeout(() => {
                showScreen('menu-screen');
            }, 500);
        }
    }, 200);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    // Carregar configurações
    SaveSystem.loadSettings();
    applySettings();

    // Verificar save
    DOM.btnContinue.disabled = !SaveSystem.hasSave();

    // Setup
    setupEventListeners();

    // Loading
    runLoadingScreen();
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}