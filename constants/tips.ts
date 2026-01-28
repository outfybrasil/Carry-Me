
export interface GameTip {
    id: string;
    category: 'Economia' | 'Mira' | 'Utilitários' | 'Mental' | 'Noção de Jogo';
    title: string;
    content: string;
}

export const CS_TIPS: GameTip[] = [
    // ECONOMIA
    {
        id: 'eco-1',
        category: 'Economia',
        title: 'Sobreviva com R$0',
        content: 'Se você perder o pistol round como CT, considere fazer um "full eco" (não comprar nada) para ter rifles no Round 3 (Bonus Round do TR).',
    },
    {
        id: 'eco-2',
        category: 'Economia',
        title: 'Gerencie o Loss Bonus',
        content: 'Fique atento ao "Loss Bonus". Se ele estiver no máximo ($3400), forçar compras pode ser viável pois a próxima derrota ainda garantirá dinheiro.',
    },
    {
        id: 'eco-3',
        category: 'Economia',
        title: 'A AK Heróica',
        content: 'Como CT, salvar uma AK-47 vale mais que tentar um retake 1v3 impossível. Essa arma é superior a qualquer M4.',
    },
    // UTILITÁRIOS
    {
        id: 'util-1',
        category: 'Utilitários',
        title: 'Pop Flashes',
        content: 'Aprenda "pop flashes" para os seus ângulos favoritos. Elas cegam o inimigo sem dar tempo de reação (som da quicada).',
    },
    {
        id: 'util-2',
        category: 'Utilitários',
        title: 'Smoke na Bomba',
        content: 'Ninja Defuse é real. Sempre compre um defuse kit e uma smoke. Smokar a bomba corta a visão dos TRs e ganha segundos preciosos.',
    },
    {
        id: 'util-3',
        category: 'Utilitários',
        title: 'Molotov nos Cantos',
        content: 'Use molotovs para limpar cantos comuns (ex: Areia na Mirage, Banana na Inferno) sem precisar expor seu corpo.',
    },
    // MIRA
    {
        id: 'aim-1',
        category: 'Mira',
        title: 'Posicionamento de Mira',
        content: 'Mantenha a mira na altura da cabeça SEMPRE, mesmo quando estiver apenas rotacionando. Isso reduz o tempo de ajuste quando um inimigo aparece.',
    },
    {
        id: 'aim-2',
        category: 'Mira',
        title: 'Counter-Strafing',
        content: 'No CS2, você precisa parar completamente para atirar com precisão. Aperte a tecla oposta ao movimento (A -> D) brevemente antes de disparar.',
    },
    {
        id: 'aim-3',
        category: 'Mira',
        title: 'Transferência de Spray',
        content: 'Se matar um inimigo e outro aparecer, não pare de atirar. Transfira o spray, mas lembre-se que o recoil aumenta drasticamente.',
    },
    // MENTAL
    {
        id: 'mental-1',
        category: 'Mental',
        title: 'Resete o Mental',
        content: 'Perdeu um round "ganho"? Respire fundo. O tilt é o maior inimigo da consistência. Foque no próximo buy.',
    },
    {
        id: 'mental-2',
        category: 'Mental',
        title: 'Informação Clara',
        content: 'Ao morrer, dê a info IMEDIATAMENTE (Local, Quantidade, Dano). Não reclame da morte antes de dar a info.',
    },
    // NOÇÃO DE JOGO
    {
        id: 'sense-1',
        category: 'Noção de Jogo',
        title: 'Troca de Kills',
        content: 'Nunca entre sozinho se tiver um teammate perto. Espere ele fazer contato e "troque" a kill (mate o inimigo enquanto ele foca no seu amigo).',
    },
    {
        id: 'sense-2',
        category: 'Noção de Jogo',
        title: 'Off-Angles',
        content: 'Segure posições que não são comuns ("off-angles"). O inimigo vai pré-mirar nos locais padrão e você terá vantagem de surpresa.',
    },
    {
        id: 'sense-3',
        category: 'Noção de Jogo',
        title: 'Fake Defuse',
        content: 'Em 1v1, dê um "tapp" no defuse para forçar o TR a aparecer. Esteja pronto para atirar imediatamente.',
    },
    {
        id: 'sense-4',
        category: 'Noção de Jogo',
        title: 'Jogue com o Tempo',
        content: 'Como CT, você não precisa matar todos os TRs se a C4 não estiver plantada. Se o tempo acabar, você ganha. Esconda-se.',
    },
    {
        id: 'aim-4',
        category: 'Mira',
        title: 'Pre-Fire Comum',
        content: 'Em elos altos, dar pre-fire em posições comuns (ex: Ticket na Mirage) é essencial. Você atira antes mesmo de ver o inimigo.',
    },
    {
        id: 'util-4',
        category: 'Utilitários',
        title: 'One-Way Smokes',
        content: 'Aprenda smokes que deixam uma brecha onde você vê o inimigo, mas ele não vê você. Isso é devastador na defesa.',
    },
    {
        id: 'eco-4',
        category: 'Economia',
        title: 'Drop para o Carry',
        content: 'Se o top fragger estiver sem dinheiro e você sobrando, drope uma AK/M4 para ele. A vitória do time é prioridade.',
    },
    {
        id: 'eco-5',
        category: 'Economia',
        title: 'Bonus Round (Round 3)',
        content: 'Se venceram o pistol e o anti-eco, o round 3 é o "Bonus". Comprem SMGs/Famas/Galil e guardem dinheiro para o round armado completo no 4.',
    },
    {
        id: 'mental-3',
        category: 'Mental',
        title: 'Mute o Tóxico',
        content: 'Se alguém está sendo tóxico, mute imediatamente. Não discuta. Sua performance cairá se você entrar na discussão.',
    },
    {
        id: 'sense-5',
        category: 'Noção de Jogo',
        title: 'Lurking (Costinha)',
        content: 'Se você é o Lurker, seu trabalho é cortar rotações, não apenas pegar kills nas costas. Faça barulho em um lado para chamar atenção.',
    },
    {
        id: 'sense-6',
        category: 'Noção de Jogo',
        title: 'Stacking (Apostar)',
        content: 'Em rounds eco, considere um "stack" (5 jogadores em um bomb). Se acertarem o bomb, a chance de vencer aumenta drasticamente.',
    },
    {
        id: 'aim-5',
        category: 'Mira',
        title: 'Rotina de Aquecimento',
        content: 'Antes de entrar no competitivo, faça 10 minutos de Deathmatch ou Aim Botz. O aquecimento mecânico previne rounds iniciais ruins.',
    },
    {
        id: 'util-5',
        category: 'Utilitários',
        title: 'Flash para Amigo',
        content: 'A melhor flash é aquela que você joga para seu amigo entrar. Peça flashes e jogue flashes para o time.',
    }
];
