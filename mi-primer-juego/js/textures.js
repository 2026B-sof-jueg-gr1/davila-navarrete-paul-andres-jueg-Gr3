// Todas las texturas se dibujan por código: el juego no depende de imágenes externas
function generateTextures(scene) {
    if (scene.textures.exists('clown')) return;
    const mk = (key, w, h, draw) => {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        draw(g);
        g.generateTexture(key, w, h);
        g.destroy();
    };

    // Piso tipo feria abandonada (damero oscuro)
    const floor = (key, tones) => mk(key, T, T, g => {
        for (let i = 0; i < 4; i++) {
            g.fillStyle(tones[i % tones.length]); g.fillRect(0, i * 16, T, 16);
            g.fillStyle(0x000000, 0.35); g.fillRect(0, i * 16 + 15, T, 1);
            g.fillStyle(0xffffff, 0.04); g.fillRect(0, i * 16, T, 1);
            const seam = (i % 2) ? 22 : 46;
            g.fillStyle(0x000000, 0.3); g.fillRect(seam, i * 16, 1, 15);
            g.fillStyle(0x000000, 0.25); g.fillCircle(seam + 4, i * 16 + 8, 1);
        }
        g.lineStyle(1, 0x000000, 0.12); g.lineBetween(6, 6, 18, 7); g.lineBetween(30, 38, 44, 39);
    });
    floor('floorA', [0x2b1d24, 0x31212a, 0x281a21, 0x2e1f27]);
    floor('floorB', [0x251920, 0x2b1d25, 0x22171d, 0x281b22]);

    // Panel de carpa de circo con franjas
    mk('wall', T, T, g => {
        g.fillStyle(0x3b0a16); g.fillRect(0, 0, T, T);
        for (let x = 4; x < T - 4; x += 14) {
            g.fillStyle(0x9e1530); g.fillRect(x, 6, 7, T - 12);
            g.fillStyle(0xe9dcc0); g.fillRect(x + 7, 6, 7, T - 12);
        }
        g.fillStyle(0xff1f3d); g.fillRect(2, 2, T - 4, 5); g.fillRect(2, T - 7, T - 4, 5);
        g.fillStyle(0x000000, 0.25); g.fillRect(2, T - 7, T - 4, 5);
    });

    // Caja de madera con estrella pintada
    mk('crate', T, T, g => {
        g.fillStyle(0x5a3a22); g.fillRect(4, 4, T - 8, T - 8);
        g.lineStyle(4, 0x3a2414); g.strokeRect(6, 6, T - 12, T - 12);
        g.lineBetween(8, 8, T - 8, T - 8); g.lineBetween(T - 8, 8, 8, T - 8);
        g.fillStyle(0xff1f3d, 0.85); g.fillCircle(T / 2, T / 2, 7);
        g.fillStyle(0x000000, 0.3); g.fillRect(4, T - 10, T - 8, 6);
    });

    // Personajes en pixel art: mapas de 85 filas dibujados a 2 px por píxel (texturas de 170 px de alto,
    // y el ancho que tenga el mapa). La paleta es un objeto por letra, o una lista donde 'A' = 0, 'B' = 1, ...;
    // '.' es transparente. "pad" agrega espacio arriba (para gorros) y "extra" dibuja encima.
    const PAL_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const HAT_PAD = 40;
    const CHAR_MAPS = {};
    const pixelMap = (key, rows, pal, extra, pad = 0) => {
        CHAR_MAPS[key] = { rows, pal };
        const w = rows[0].length * 2;
        mk(key, w, 170 + pad, g => {
            g.fillStyle(0x000000, 0.35); g.fillEllipse(w / 2 + 1, pad + 166, 80, 10);
            rows.forEach((row, y) => [...row].forEach((ch, x) => {
                if (ch === '.') return;
                g.fillStyle(Array.isArray(pal) ? pal[PAL_KEYS.indexOf(ch)] : pal[ch]); g.fillRect(x * 2, pad + y * 2, 2, 2);
            }));
            if (extra) extra(g);
        });
    };

    // Asesino del mundo 1, Art el payaso: pixel art fiel a la imagen de referencia (59x85 px, cada píxel a 2 px) con cuchillo
    const CLOWN_MAP = [
        '..........................................KKKK.............',
        '.........................................KKKKKKK...........',
        '.........................................KKKKKKKK..........',
        '.......................................KKKKKKKKKK..........',
        '......................................KKKKKKKKKKK..........',
        '.................................KKKKKDDDDKKKKKK...........',
        '...............................KKGGGGGLLLLDDDKKKK..........',
        '..............................KGGGLLLLLWWWWWLDDKKK.........',
        '.............................KGGGLLLLWWWWWWWWWLDKK.........',
        '............................KGGGLLLLWWWWWWWWWWWLK..........',
        '............................KGGGLLLWWWWWWWWWWWWWK..........',
        '............................KGGLLWWWWWWWWWWWWWWWLK.........',
        '...........................KGGGLWGWWWKKKKKWWWWWLLLK........',
        '...........................KGGLWGWWWKWWWWWKWWWWKKLK........',
        '...........................KGGLGWWWKWWWWWWWKWWKWWKK........',
        '...........................KGLGWWWWWWWWWWWWKWWKWWWK........',
        '..........................KGGGWWGWWWWWKKKKWWWWWWWK.........',
        '..........................KGWWWGWWWWWKKKKKKWWWWKKK....K....',
        '..........................KWWWWGWWWWKKKKPPKKWWKKPK...KSK...',
        '...........................KWWGGWWWWKKKPPKWKKWKKWK...KSsK..',
        '...........................KGGGGWWWWWKKKPKKKKWKKKKK..KSsK..',
        '...........................KGGGGWWKWWWWKKKKKKWWKGLKK.KSsK..',
        '............................KGGGWWLKWWWWLLKKWWWKLWWK.KSsK..',
        '............................KGGGGWWLKKWWWWWLLWWKWWK..KSsK..',
        '...........................KKKGGGWWWLKKWWWWKWLWLKK...KSBK..',
        '.........................KKLKKKGGGWWWLKWWWKWWWWWKK...KBBK..',
        '......................KKKLLLKKWKGGWWWLKWWKKKKWKLKK...KBBK..',
        '....................KKLLLLLGGKKWKGGWWWWWKKKKKKWKGK...KSBK..',
        '..................KKKKKKLLGGLKKKWKGWWWWWKKRKKKKKKK...KSsK..',
        '................KKKKKKKKKLLLLLKKKKGGGWWWKKPKRKRKKK...KSBK..',
        '..............KKDWWWWKKKKLLLLGGKKKKGGGWWKKKKPKPKKK...KSsK..',
        '.............KKKKKKWWWKKKKLWWGGGKKKKGGGWKPKKKKKKK....KSsK..',
        '............KKKKKKKKWWKKKKWWWGGGGWKKKGGWKKKPKPKLK..KDDDDDK.',
        '...........KKKKKKDDDKWWKKKKWWGGWWWWKKKGGWKKKKKKLK...KKKKK..',
        '..........KKKKKKDDDDDWWWKKKWWWWWWWGGGKGGWWKKKKLKKK.KWWWWWK.',
        '.........KKKKKKKDDDDDWWWKKKKWWWWWWGGGGKKWWWWWWLKKKKKWWWWWWK',
        '.......KKKKKKKKKDDDDDKWWWKKKKWWWWGGGGWWKKWWWWLKKKLKWWWWWWWK',
        '....KKKKKKKKKKKKDDDDKLWWWKKKKKWWWGGGWWWGGKKWWKKLKWKWWWWWWWK',
        '...KKWWWWKKKKKKKKDKKLLWWWWKKKKKKWWWWWWWWWWKKKKLLKWKWWWWWWLK',
        '..KKLWWWWWKWWKKKKKKLLLWGWWWWKKKKKKWWWWWWKKKKKLLLKWLKLWWWWLK',
        '.KKLWWWWWWKWWKKKKKKLLWWGGWWWWWKKKKKKKKKKKKKKLLLLKWWKLWWWLLK',
        '.KKLWWWWWWKWLKKKKKLLLWWGGWWWWWWWWKKKKKKKKKKLLLLLLKKWKLLLLLK',
        'KKKLWWWWWWKLLKK..KLLWGWWGGWWWWWWWWWWKKKKKKKLLLLLKKRKKLLLLLK',
        'KKKLLWWWWWKKK....KLLWGWWGGGWWWWWWDDKKKKKKKWLLLLKWWKPRKKKKK.',
        'KKKLLLWWWLK.....KLLLWGWWWGGGWWWWDDDDKKKKKKWWWLKWWWWKPPRRK..',
        'KKKKLLLLLKK.....KLLWWGGWWWGGGWWWDDDDKKK...KWWWWWWWWWKKKKK..',
        '.KRKKDDDKK......KLLWWGGWWWGGGWWWDDDDKK.....KKWWWWWWWGGGGK..',
        '.KPPRKKK........KLWWWGGWWWWWWWWWWDDKK........KGGWWWGGGGK...',
        '..KKKK..........KLWWWWGWWWWWWWWWWKKKK.........KGGGGGGGK....',
        '...............KLWWWWWGGWWWWWWDDKKKK...........KKGGGGK.....',
        '...............KWWGWWWGGGWWWWDDDDKK..............KKKK......',
        '...............KWWGGWWWGGGWWWDDDDKK........................',
        '..............KWWWGGWWWGGGWWWDDDDKK........................',
        '..............KWWWWWGGWWWGGGWWDDKKK........................',
        '.............KWWWWWWWGGWWWWWWWWKKKKK.......................',
        '.............KWWWWWWWWGGGWWWWWWKKKKKKK.....................',
        '............KWWWWWGGWWWWGGWWWWWKKKDDDDKK...................',
        '............KWWWWWWGWWWWWWWWWWKKKDKKDDDDKK.................',
        '............KWWWWWWGGWWWWWWWWWKKKKKDDDDDDDK................',
        '............KWWWWWWWGGWWWWWWWKKKKKDDKKKKDDDK...............',
        '.............KWWWWWWWGGGWWKWKKKKKKKKKKKDDDDK...............',
        '.............KWWWWWWWWGGWWKKKKKKKKKKKKDKKKKKK..............',
        '..............KWWWWWWWWWWWK..KKKKKKKKKKKKKKKK..............',
        '..............KWWWWWWWWWWWK....KKKKKKKKKKKKKKK.............',
        '..............KLWWWWWWWWWWK......KKKKKKKKKKKKK.............',
        '..............KLLWWWWWWWWWK........KKKKKKKKKKK.............',
        '.............KGLLWWWWWWWWLK........KKKKKKKKKKK.............',
        '............KKLLLWWWWWWWWLK........KKKKKKKKKKKK............',
        '............KGLLLLWWWWWLLLK........KKKKKKKKKKKK............',
        '...........KGGGLLLLLWWLLLK........KKKKKKKKKKKKK............',
        '...........KGGGGLLLLLLLLLK........KKKKKKKKKKKKK............',
        '..........KGGGGGGGGLLLLLGK........KKKKKKKKKKKKKK...........',
        '.........KGGGGGGGGGGGGGGK.........KKKKKKKKKKKKKK...........',
        '........KGGGGGGGGGGGGGGGK.........KKKKKKKKKKKDD...KKKKK....',
        '........KGGGGGGGGGGGGGGK..........KKKKKKKKKDDKKKKKKKKKKK...',
        '.......KGGGGGGGGGGGGGGK...........KKDDDDDDDKKKKKKKKKKKKKK..',
        '......KGGGGGGGGGGGGGGGK.............KKKKKKKKKKKKKKKKKKKKKK.',
        '.......KGGGGGGGGGGGGGK..............KKKKKKKKKKKKKKKKKKKKKK.',
        '.......KGGGGGGGGGGGGK...............KKKKKKKKKKKKKKKKKKKKKK.',
        '........KKKKKKKGGGGK................KKKKKKK....KKKKKKKKKKK.',
        '.......KKDDKKKKKGGGK.......................................',
        '......KKDKKKKKKKKKK........................................',
        '.....KKKKKKKKKKKKK.........................................',
        '.....KKKKKKKKKKKKK.........................................',
        '.....KKKKKKKKKKKKK.........................................'
    ];
    const CLOWN_PAL = {
        K: 0x000000, W: 0xffffff, G: 0x8d8d8d, L: 0xc9c9c9, D: 0x4a4a4a, P: 0xff918b, R: 0xf74132,
        S: 0xe4eaee, s: 0x8c98a0, B: 0xa8101e
    };
    pixelMap('clown', CLOWN_MAP, CLOWN_PAL);

    // Víctimas en pixel art, convertidas de la imagen de referencia
    // Chica gótica
    pixelMap('victimA', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '.................AAAA......................................',
        '................AAAHAH...............A..AA.................',
        '...............AAEEHAAAAA..AAAAAA..AAAAAEGA................',
        '..............AAAABAAAALAAAAAAAAGAAAFAAABEGA...............',
        '..............AAAAAAAALLLAAAAAAAAAAABLAAAAHA...............',
        '...............AAAAAALLLAAAAAAAAAAAAABLAAAAA...............',
        '...............AAAAAHFLAAAAACAAAAAAAADAFAAAAA..............',
        '................AAAAFFAAAAAHCBHAEAGABDHBAAA................',
        '................A..AFAGABIHHHAHHGABIIHHGA.A................',
        '...................AACHIDHIDAAABAJADAAIIA..A...............',
        '....................AHHIGHHABBAABKAAAABEH..................',
        '....................ACGAIAAAAMCCCQIABBAACA.................',
        '....................AABAGAACOOPQQQQQQQAAAA.................',
        '....................AAAAAAABMNBBOQQOABBAAA.................',
        '....................AAAAAAADBCIOQQQCPMIAA..................',
        '....................AAOOAAABAAACQQQBBBAAA..................',
        '.....................AQGAAADRIFRQQQBEQAAA..................',
        '.....................AQOBAANJFEPQQQCDJAAA..................',
        '......................AQHBBPPPQQQQQQQPAA...................',
        '.......................DCAAQQQQQQQPPQQAA...................',
        '........................BABPQQQQQQQQQDA....................',
        '.......................ARA.BQQQQKDGQNAA....................',
        '........................K..JKFQQQPQCA......................',
        '...........................COKAABAB........................',
        '.........................AKHCKNABAA........................',
        '.......................AAQQNKEJKKBPA.......................',
        '......................AGGCPQQPDDPPCHG......................',
        '.....................AGGGGECDPPPPBGGGC.....................',
        '.....................DGGGGGGGGBBBGGGBHA....................',
        '....................ACGGGGGGGGGGIGGGGDA....................',
        '....................ACGGGECGGGGGLLHGGAGA...................',
        '....................CGGGGADGGGILHHLFGADA...................',
        '...................AABEGGADGGGGGFFFGEAPA...................',
        '....................APOGCADGGGGGLHLECAPA...................',
        '....................HQQOGBDDGGGLHGGGGCQA...................',
        '...................AOQQQAADDGGGGGGGGHAQG...................',
        '...................AOQQQACBDGGGGEEGGGEOI...................',
        '...................AQQQQBBDDCCEMOQQPMABQB..................',
        '...................AQQQPCDAPOQQQQQQQQPNQB..................',
        '...................AQQQMDCOPQQQQQQPQQQAQPA.................',
        '...................AQQQAEBABKQQQQQQQQBBGQA.................',
        '...................AQQQACDEHHCBCCCDCEHHAQB.................',
        '..................AOQQPAADEDEEHHHHHHEEHCPH.................',
        '..................AQQQPBCDHHHEHHHHHHHHHHAMA................',
        '..................BQQQOAEEHHHEHHHHHHHGHHAK.................',
        '..................AQQQOAEHHHHHHHHHHHHEHHCA.................',
        '..................BQQQOCEHHHGHHHHHHHHEHHHA.................',
        '.................AQQQQODEHHHEHHHHHHHHHHHHA.................',
        '.................AQQQQMDGHHHGHHHHHHHHHHHHA.................',
        '.................AOOOQBEEHHHHHHHHHHHHHGHH..................',
        '..................ANHHAAHGEADHHGGGGHEAHIB..................',
        '...................A..AMJIKJKJJ..JJIJJNJA..................',
        '......................AJMJKMJKB..JJJMNKMA..................',
        '......................BKMMKKMJ...IKMNJNE...................',
        '......................ANJNNKKA...JJNKKMB...................',
        '......................IKNJMMK...ANMJNNJA...................',
        '.....................AMNKNKMB....JJNKKNA...................',
        '.....................AMJNKNJA....JNNJMMA...................',
        '.....................AJJNNJK.....KJKNMK....................',
        '.....................EJKMJJB.....KNKKKB....................',
        '....................AMKJJKMA....ANNJKNA....................',
        '....................AKKMJKH.....AMJNKKA....................',
        '....................IJMJMMA.....IJNKKMA....................',
        '...................AKNKNNIA.....GMKNKMA....................',
        '...................AMIMKKD......IJNJMJ.....................',
        '...................AJNMJMA......HKIMJK.....................',
        '...................EKMKMJA......BIMIMI.....................',
        '..................AHJIKKC.......AIJKHHA....................',
        '..................AAGEDBA.......ABCBEEA....................',
        '.................AAEGGGBA......AAAAEGGGA...................',
        '.................AAEDDEGAA.....AEEAEEHCA...................',
        '.................ADHHHHGD......AEEGFKRRH...................',
        '.................AEQLNPGA......AEFEGHLRRD..................',
        '................AEHHGHHEC......AELFGGGIEGCA................',
        '................AGGEEEEGEA.....AEGGEGHHGPQQA...............',
        '................BHQRRRRRHAAAAAAAOGECEEEOQQPH...............',
        '...............ANNNNMNNNNA.....AOOOOPRRRRRRQA..............',
        '................KOPRRRRQOA......AAAAAAAAAAAA...............'
    ], [
        0x000000, 0x060302, 0x080707, 0x0c0a0a, 0x100f0f, 0x53241d, 0x151414, 0x191919,
        0x2d2722, 0x3b352f, 0x4a4139, 0x813629, 0x605246, 0x726357, 0x8f7d6d, 0xae947c,
        0xccb9a4, 0xcfcdcd
    ]);

    // Chico con gorro
    pixelMap('victimB', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '.....................AAAAAA................................',
        '...................AKKKKKKKKKEA............................',
        '..................AJKIKKKKKKKKKBA..........................',
        '.................AJIKKKKKKKKKKKKKD.........................',
        '.................AGIKKKKKKKKKKKKKKA........................',
        '.................DGKKIKKKKKGAABBAAAA.......................',
        '................AGIKKIKKKBCIJJIIGGGKGA.....................',
        '................AGIKKGIDIKDACCFFHFDABIE....................',
        '................AGIKKDJKAAFFLQPFPQQLAABE...................',
        '................DGGJEJGBHQPBFQQQDPQQLBBA...................',
        '................GGGGKAFPLQDVTCQQFFFQPQA....................',
        '...............AGGGJCHQPHFQWWVHPAABHPAP....................',
        '...............AGDGCFQQHCBBBPWCHHVTCLBF....................',
        '...............ACGDELQHCDPVVVWDDBBADFP.....................',
        '................EEBFFPHCPAABQWWBAVDAFD.....................',
        '................EAFCDFLAABVVCWWTCWCAD......................',
        '................AECWTEFACCEWVWWWTVVBB......................',
        '...............ADFHBABFBVCAVWWWWVWWA.......................',
        '................DFLVCTABWWWWWWVVVWWA.......................',
        '................DDDVVWWWWWWWWWWWWWP........................',
        '................ADEBPTBWWWWWWWDCEWA........................',
        '..................AEBEBBVWWWHHWVWC.........................',
        '..................AMBAAEAHVWWWWWE..........................',
        '................AMOSSJCAFVEABAAAB..........................',
        '................JMMOSSUSDCVVVBBMSB.........................',
        '...............AJMSMKOSUUUJVVAJJURA........................',
        '...............AMOMAABAMRSUSLVJUMA.........................',
        '...............AMCMRUSSOGAGOSCOGORA........................',
        '...............ADMOURSUUSROORURMSSRA.......................',
        '................AMSSSRUSSUURSSSUSUOC.......................',
        '................BOSSSSRSSSSRSSUURSDJ.......................',
        '................JMSSSSSRSSSSSUUSMUGMA......................',
        '...............AMSSSSSRISSSSUUSSSSSJA......................',
        '...............AMSSSSSOGSSSSUSSSSSUIJ......................',
        '...............GOSSSSUBMUSSSSSSSSUUCRB.....................',
        '...............MSSSSSUBOUUSSSSSSSSSIRO.....................',
        '...............OSSSSSSBMSSUUSSSSUSOMIRA....................',
        '..............AMSSSMMCAMMUSSSSSSOOUSAOJ....................',
        '..............AMUUOMSRAOMOURMSUUSUUOISUA...................',
        '..............AMSSSSUOBBMMGURSSUSSSSOEMI...................',
        '..............AMSSSSMDRMAMSUUUSSSSSSUCSSA..................',
        '..............AOOSSUISSSOAMJRUUSSSSSUMOSA..................',
        '...............MOUSMSUURMMGMMMRSSUUSMJAOSA.................',
        '...............BOMSSSSSMSSBSRRMMMMMMMSAURA.................',
        '................JMOMSOJRURAAOSUUUSSUSCBOSA.................',
        '................AOMOJISSUDNHHBBDDCCBBHFFG..................',
        '.................AAIMMOSOLNLNNHFEFFHNNNHA..................',
        '..................IOMMMBBNHNNNNNFNNHNNNLA..................',
        '...................AABAFPHNNNNNNFNNHNNNL...................',
        '....................EFFLLNNNNNNNHNNHNNNN...................',
        '....................DFFFNNNNNNHHFNNFHNNN...................',
        '....................DFHNNNNNNNNFFFAENNNN...................',
        '....................FFHNNNNNNNLFBAHNNNNNA..................',
        '....................FFNNNNNNNNNNBFHNNNNNA..................',
        '....................HFLNNNNNNNNNBHNNNNNNA..................',
        '...................AHFFNNNNNNNNNAFNNNNNNNNA................',
        '..................AAABBBBNNNNNNNAFNNNNNNFNA................',
        '.................AHNNNNNNDNNNNNNAFNNNNNNENA................',
        '.................AFNNNNNNCNNNNNNAFNNNNNNEA.................',
        '.................AHFHHNNPCNNNNNHDFNNNNNNNA.................',
        '..................BBCCEEAHNNNNNEFFNNNNNNNH.................',
        '..................DEFFEHNHNNNNNBFFNNNNNNNNA................',
        '.................AFFHHNNNFNNNNNAFFNNNNNNNNA................',
        '.................AFFNHNNNFNNNNNAFFNNNNNNNNA................',
        '.................AFFHFNNNFNNNNNAFFNNNNNFEA.................',
        '.................AAAFFFFFFNNNNLAFFNNNLBFA..................',
        '..................ADDCDDDNNNNNEEEHNNNFFHA..................',
        '..................AFFFFFHNNNNNAFEHNNFFHHA..................',
        '..................AFFFFHNNNNNNAFEFNNNLFDA..................',
        '.................AFFFLNNNNNNFLCEEFHLNPPNNA.................',
        '.................EFFNLFFEFFFFFHAFFFFFFFEFA.................',
        '................AFFFEEFLLNEEFFFAFFDBHLLHCA.................',
        '.................EEFENNNNNNLBEBCFBFNNNNNNA.................',
        '.................ABHNNNLLNNNNDBCCELHCBCFNA.................',
        '.................AEFFFABCBBFHNECEFFARVVCEA.................',
        '................AEEFACVWWWCADHHAFAAEGVTWOA.................',
        '................ADFACEECCCAGBDDBATKIGEWGEEB................',
        '.................ACDGGWWWWWGEAAABBVEGEGGWWWB...............',
        '.................AAEEWWWWWWWEBAVVVVECDETVVVO...............',
        '..................AVCTTTTTTTTA.AAVVVVWWWWWWWA..............',
        '...................OVWWWWWWWTA...AAAAAAAAAAA...............'
    ], [
        0x000000, 0x060504, 0x0b0908, 0x120e0c, 0x181511, 0x221c15, 0x1b1b1c, 0x2b231b,
        0x212225, 0x262a30, 0x323131, 0x3b3026, 0x303643, 0x42382d, 0x383f4d, 0x4f3d2c,
        0x5f452f, 0x454e60, 0x4d576d, 0x6a6159, 0x515b71, 0xa29181, 0xd5c9bc
    ]);

    // Chico de la calavera
    pixelMap('victimC', [
        '...........................................................',
        '...........................................................',
        '............................A....AAA.......................',
        '.......................AA..AA.A.AEEAA......................',
        '........................AAAAAAAAAAAA.AAA...................',
        '.....................AAAAAAAAAAAAAAAAA.....................',
        '......................AAAAAAAAAAAAAAAAAAA..................',
        '...................AAAACHAAAHACADAAAAAAAAA.................',
        '...................AAACFAJAJHHJJFHACAAAA...................',
        '....................AABBIAHIBBFAHIHDHHEAA..................',
        '..................AAAACJBBIAABAAAHHJHJIJA..................',
        '..................AAAAAAAFCBCQAOACBIAAIFJA.................',
        '...................AAAAAAHADQQOAOBBHBABDADA................',
        '...................AAAAAAJBPECABQBAHCOAFAAA................',
        '.................AAAAERBACNPQQRPALAFQQBFB..................',
        '.................AAAARBDADAAAAAPQQAAAAACB..................',
        '...................ABROAAAACBQOBRLAAPQBAAA.................',
        '...................AAROPBAPCEISORPBADBAA.A.................',
        '...................AAARQQBQRNPRRRRAERFAA...................',
        '..................A.AABBRRRRRRRRRRMCPAA.A..................',
        '....................AAAAPRRRRRRRRRRQPAA....................',
        '.....................AAAARRRNRRRQPPRRA.....................',
        '....................A.AAAKRRRKRRRRRRC......................',
        '......................AAAPNRRRRDCHRQA......................',
        '........................APPMRRRPQRMA.......................',
        '......................AADQPPACRRPA.........................',
        '...................AABDDBPRQPMAAA..........................',
        '.................AAEFFFDFKCQPPBLAA.........................',
        '................ACGFEFFFECSDDBCOEFA........................',
        '................CFFFFFFFFECDCFCEFFFC.......................',
        '...............ACGFFFFFFFFFDEDCFFFFFA......................',
        '...............ACEFFFFFFFFFFFFFFFFFFD......................',
        '..............AAACCFFEDFFFGFFFGGFFFBFA.....................',
        '..............AFFFABGCBFFFFHSSSSHFGBGA.....................',
        '.............AEFFFGEBBAFFFFSSSSSSHGECEA....................',
        '.............AAABFGFFACFFFKSSSSSSSFFCFE....................',
        '..............APPMGAFECFFFLSEGSSFQIGAAA....................',
        '..............BPQPPPBACFFFJSFFSSFQIFAM.....................',
        '..............ASSSQPBACFFFFSSSRSSSFFBPB....................',
        '..............ASSSSRBDCFFFFGSSSSSFFFCSB....................',
        '..............BSSSSSCCCFFFFFESPGQGFFASD....................',
        '..............GSSSSPBCCDFFFFFSOFRFFFCPPA...................',
        '.............ASSSPOEBDCCFFFFFFFGFFFFAPSC...................',
        '.............ASSQRSSPACDDDFFFFFFFFFCBSSOA..................',
        '.............BSSSSSSPADFECCFFFFFFFEFHCRPA..................',
        '.............ASSSSSSSRBCCFGHCDFFFFFFFBSSB..................',
        '.............AOSSSSSSSCABBCCFFFFFFFECANSJ..................',
        '..............BSSSSSSSSHEFFECBDDFFFCDGCSSB.................',
        '..............APSSSSSSSQBAEFGGGFFFFFFFDOPA.................',
        '...............DSSSSSSSSAJFCCGFFFFFGEACHPB.................',
        '...............BPSSSSSSQBKPJOAAABAAADJHDOB.................',
        '...............APQSSSSKAMJMMPKLLILHHLLLKA..................',
        '................APSSSOPLKMLPKLLLHLLHLLLKA..................',
        '................BPPPIOILKLSNLLLLJMLHLLLLA..................',
        '.................APBBKLILKONLLLLJLLILLLLA..................',
        '..................AGLKJLLLOOKLLLJLLGKLLLA..................',
        '..................BHIJLLLSMLLLLHHIBILLLLA..................',
        '..................AHLLLLLMQKLLJKGCGHLLLLA..................',
        '..................AHLLLLPMNKLLLLBHHLLLLLA..................',
        '..................MHLLLPMPKLLLLLAHHLLLLLA..................',
        '..................IRNONLRLLLLLLLAHHLLLLLA..................',
        '..................LJLLLOKKLLLLLLAHKLLLLLA..................',
        '..................HOJPMLLLLLLLLJAHKLLLLLA..................',
        '.................AHHKLKJLLLLLLLFGHKLLLLLA..................',
        '.................AHKLJILLLLLLLLBIHKLLLLLA..................',
        '.................AIKHHILLLLLLLLAHHKLLLLLK..................',
        '.................FHIHHLLLLLLLLIAHHLLLLLLK..................',
        '.................HHHHLLLLLLLLLHAHHLLLLLLL..................',
        '................AHHHILLLLLLLLHIAHHLLLLLLLA.................',
        '................AHHHLLLLLLLLKHHFHHLLLLLLLC.................',
        '................AHHLLLLLLLLLHHFHHHLLLLLLKHA................',
        '................HHLLLLLLLLLHHHAHHHHLLLLLLHA................',
        '...............AILLLLLLLLLKHHHAFHHHILKLLHHA................',
        '...............FHHJLLLLLLIILIHDHHHHHJLLHHHA................',
        '..............AHHHHHHHHHILJHHBHGHHLLKHHHHIA................',
        '..............AHHHHHILKJHHHLJHAHIIIHGLLLHB.................',
        '..............AGHHHLLLLLLHHIIIAHHHHILLLLLLA................',
        '...............AHLLLLLLLLMLHHIBHHJLLLLKKLLKA...............',
        '..............AHLLLKKKKKLLLMIGBGILLLJBCCBIIA...............',
        '..............AHKHACPSSPCELMLAGHLHEADQOQQCA................',
        '..............AHICFFFFJNEBCHIJBGGDAHEGQDGEEA...............',
        '..............AFAFFSSSSSRGDGGFFFBEHEFGFNSSSSA..............',
        '...............AAEQSSSSSSQDADAACPPNCEDFPPPPOF..............',
        '...............APPOOOOOOOOPPA...APPPPSSSSSSSRA.............',
        '...............ANPPSSSSSSPOA.....AAAAAAAAAAAA..............'
    ], [
        0x000000, 0x060505, 0x0a0909, 0x0e0e0d, 0x131212, 0x161616, 0x1b1b1b, 0x1f1e1e,
        0x252423, 0x292828, 0x302f2e, 0x333232, 0x3e3a38, 0x504943, 0x726c66, 0x948980,
        0xb6a798, 0xd4c4b1, 0xdedddd
    ]);

    // Chica rubia (víctima final)
    pixelMap('finalGirl', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................AAAA............................',
        '.........................BALMMMFBA.........................',
        '.......................ADMMMMMMMMHFCA......................',
        '......................AMMMMMMMMLLHHHHA.....................',
        '.....................ALMMMMMLMMMMMMHHLB....................',
        '.....................CTTTTNHMMMMMMMMHLMA...................',
        '....................AMTTMTLTRMMLMMMMHLNMA..................',
        '....................AMTLMLTTTMRTLLFNCLNRB..................',
        '....................EMMMNHTMLMMLWWWWVCMMA..................',
        '...................AMMHHHMMMHLTWWWWWWTFRNA.................',
        '...................AMMBBFMMMDBBBLWWWWWDTNA.................',
        '...................BMDVWBMMENVTNBLWWWWHNTA.................',
        '...................BMCWHFMMBBABMMRWWWVTHTA.................',
        '...................CMCWCMMNAABBBNWWWEBAENA.................',
        '..................AMMHCBMMRADBSUBWWCADDFNA.................',
        '..................AMMLHBRMTMBFSXVWVBEBAENA.................',
        '..................BMLLHDMMTRTRNVWWHBFXBDNA.................',
        '..................CNLHHMMMNVWWWWWWWBCBBHNA.................',
        '.................AMMNHHMMMMWWWWWWWTWTBAMMA.................',
        '.................BNHMHHEMMBWWFVWWVVWTEHMB..................',
        '................AMHMMHHBMMBCWWVCCDWVBHLMB..................',
        '...............AMMMMHHHCMMLBBWWVSWEBHHLMB..................',
        '...............ELMMHBBDABMNCRBBABBHFHHMNA..................',
        '..............AMCNHEDOBDBMMBNNEABFHFHFMMA..................',
        '..............FBMLEEPPBQABMLWWNNBDBFFLFMA..................',
        '...............AMHBPPPESBHLNSWWWBOPDFLHD...................',
        '...............BLBPPPKKQDOCMBWWTOOPPCHMA...................',
        '...............ABFPPKFBBBBDEPCCKPPPPOANB...................',
        '................BPPKBBWVRLECPPWWPPPFPBHAA..................',
        '...............BPOHBPCWWVBAPPPPPPPPCPBHAA..................',
        '..............BOKBOPPDWWMDKPPPPPPPPPBKFA...................',
        '..............FEKPPPPBWWVFPPPPPPPPPPBOA....................',
        '.............AKPPPPOPCBBBBPPPPPPPPPKAPB....................',
        '.............APPPPPKKKBQBKPPOPPPKKKBOPA....................',
        '.............APPPOKKBBUBKKKPPPPPPPKBPPD....................',
        '.............AKKKKABSBSFAKPPPPPPPPPBPPPA...................',
        '..............AAABSUADBBFHPPPPPPPPPBPPPA...................',
        '................EUXXCBDBKPPPPPPPPPPBKHOB...................',
        '...............BXXXBDDDBKPPPPPPPPPPOFPPPB..................',
        '...............BXXXCDDBKKHOPPPPPPPPOBPPPA..................',
        '..............AXXXBDDDBKPPOKKPPPPPPOBKPPA..................',
        '..............BXXXCDDABHPPPPPKKKPPKKFFPPPB.................',
        '.............AQXXBDDDBGGBFKPPPPPPPPPHAPPPF.................',
        '.............BXXXCDDCCGJGJGBBBAABBBBAAKPPPA................',
        '.............BXXEEDDAGIJGIGIJJIIGGIGGAKPKKB................',
        '..............EXBDDCBGJJIIGIIIIIIIJJGEFHKPPA...............',
        '...............BBCDBGGJGIJGJIIJIIGJIGGBOPPOA...............',
        '.................ABBGIJGJJIIIIJIJGIIIICKPFA................',
        '...................AGIGJJGJJIJJJJGIIIGGBBTB................',
        '....................ABCIJGJIJJJJJGIIJDCBBVA................',
        '....................ARFCBAGIIIIJIEABBFALAA.................',
        '....................ARRRRNNNBAAMNRRRNRBA...................',
        '....................BRWWRRNRB.BRRRWWWWC....................',
        '....................ARWWWWWRB..CRWWWWWE....................',
        '....................AHWWWWWVB..BVWWWWWE....................',
        '.....................EWWWWWVB..AMWWWWWE....................',
        '.....................EWWWWWTA...BWWWWWWA...................',
        '.....................DWWWWWSA...AVWWWWWB...................',
        '.....................CWWWWWSA...AHWWWWWD...................',
        '.....................ATWWWWSA....AWWWWWNA..................',
        '.....................ARWWVRSA....BMNTWNVA..................',
        '.....................AWRRRVTB.....AVNRRWB..................',
        '.....................AWWVWWVB.....BWWWWWTB.................',
        '.....................BNWWWWCB.....AKWWWWTBB................',
        '....................BXUCBBBXSA....BCBBBCCXB................',
        '....................BQXXXXXXQA....AQUXXXXUB................',
        '....................BSSSXXQQA.....AQQQXXQJB................',
        '.....................AXXQEGSD......BXXSJIUSA...............',
        '.....................BQXXXXSJA.....AQUXXXXQXA..............',
        '....................BXXQSWSQXA.....BQQXXXJQSB..............',
        '....................AQUSGQQXXG.....BUUUQQJQQA..............',
        '....................DXXXXXSQSE.....BSQSXXXXXJA.............',
        '....................DSDBBBUSQB.....BGQXIBBBSSA.............',
        '....................ABOPOPDDQA.....AHQCOXUQEA..............',
        '....................AKQQXPOKC.......ADOOUSQKF..............',
        '...................AOOOPOOOSD.......AKQOQPPPPF.............',
        '...................COUXXUPOKC.......AQKPPSXXSKA............',
        '..................AIQOPOOKSQBAAAAAAAAQQUKOOOOSA............',
        '...................AQXXXXUQA.........AAQXXXXXQA............'
    ], [
        0x000000, 0x050403, 0x120e0c, 0x1e1917, 0x2f2722, 0x4e3a31, 0x353b45, 0x65503c,
        0x4e5769, 0x545d6e, 0x734f53, 0x816b4b, 0x9a7f58, 0xaa8c67, 0x93676c, 0xa8747b,
        0x827f80, 0xb49573, 0x9d9896, 0xc8ae87, 0xb8b6b5, 0xcfb8a0, 0xd7c6b1, 0xdcdbdb
    ]);

    // Chico de la gorra
    pixelMap('victimD', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '.............................AAA...........................',
        '..........................AAHQQQGA.........................',
        '........................AAOSSQQQQSCA.......................',
        '.......................ASISSSQQQQQSSA......................',
        '......................AQSSSSSSSSSQSSSA.....................',
        '......................GSQSSSSSSBAAAGSE.....................',
        '.....................AQSQSSSSSEAAABAHSA....................',
        '.....................ASSSQSSSSHPOIHGAQA....................',
        '.....................BSSSISSSQQHAAAABAA....................',
        '.....................BOSSISSOBBGWWBAGAAAA..................',
        '.....................COSSSIATVWWWWWBAVAA...................',
        '.....................BIOSQAAWUBEWWWWHWUA...................',
        '.....................AOICBCJUAAABWWWWBAAA..................',
        '.....................AOBAAAWVTTUGAWWATUB...................',
        '....................AOAVBAAUAAABAWWWAABA...................',
        '...................ASGUBVAAKABCYOWWBCXA....................',
        '..................ASIHUUAAABUBCYVWWBDYA....................',
        '.................AQHHHCVCWBVWWVVWWWWUUA....................',
        '.................AOHHHARWWWWWWWWWWWWVWA....................',
        '..................AHHA.ABAVWWWWWWWUUWVA....................',
        '.........................AAVWWVCTVVWWA.....................',
        '.....................AA.ABBTVWWWWWVWG......................',
        '...................AFAAADABVTDWWWWWC.......................',
        '..................DLLLLDABWWUUAABBBA.......................',
        '.................AFFKMMLMBBWWVUAABFKA......................',
        '................AFKFAAAAJMLFCWWDAFLMA......................',
        '................AJJDMMLFBDFLMDTUDKJAA......................',
        '................AFDMLMMMLMFCFKEBKFFKK......................',
        '.................AKMMKMMLTYYVTTTTYVLMD.....................',
        '.................FMMMMKLNYYYYYYYYYYUMJA....................',
        '.................FMMMMFLYYYYYYYYYYYYMFA....................',
        '................AMMMMMFJYYYNKLYYMKLVVFK....................',
        '................BMMMMMFXYYLLLLLYLKLLYDLA...................',
        '................JMMMMMAYYYKKYLKYKYLKYDKA...................',
        '...............AKMMMMMCYYYLLYYYYYYKKYDMF...................',
        '...............AMMMKMLRUYYLKKLXYYYLNYCLLA..................',
        '...............FLMMJFLUUYYLKNLLYYUKYYDJLA..................',
        '...............FMMMFFFTUXYKKYKKYYLLYYAFFF..................',
        '..............AKMLFFJDCUUYLLULLYYLXYYCFKMA.................',
        '..............ALMMMMMFAOUXYLKKNYTLYYXYBKMD.................',
        '..............AJMMMLJFFAUUXYYYYYYYYYYTAFKLA................',
        '..............AFMLLLLLJBRBAUXYYYYYYYUIAJKDA................',
        '...............FJLLLLMMMBUXTCOVXXXUTEXHFLLK................',
        '...............AFMMLMMLLKAIOYYTUUUXYYUVBFLLA...............',
        '...............AFJLMMMLLFDEXRTXYYYYYUXXEFFLA...............',
        '................AFLMMMFFLMBVYYTUUVXVYYYGLFFA...............',
        '.................FFLLFJMMLAAUYYYYYYYYYOAFKF................',
        '.................AFMFFMMDAPHGBUYYYYYABIOAJA................',
        '.................AFFJMLCTPOSOIGABABBHQSOCFA................',
        '..................AFFJCUQIQQQQPQGSSHQQQQHA.................',
        '...................AFANPOQQQQQQQOSQHQQQQOA.................',
        '....................AHOOQQQQQQOQOSQHOQQQIA.................',
        '....................HGQSQQQQQQQIHHBEOQQQQA.................',
        '....................IIQQQQQQQQOHHAGIQQQQQA.................',
        '....................IIQQSQQQQQQQAHIIQQQQQA.................',
        '...................AHIOOQSQQQQQQAGIQQQQQQA.................',
        '...................AHHQTSISQQQQQAHIQQQQQQA.................',
        '...................AISPVSHQQQQSSAGIQQQQQQA.................',
        '...................AIIQQQQQQSQQPCHIQQQQQPA.................',
        '...................AHISQHSQQQSSHHHIQQQQQOA.................',
        '...................AIIQIIQQQQSSAGHIQQQQQIA.................',
        '...................AIIHIQQQQQSPAHHOQQQQQI..................',
        '...................GIIIOQQQQQQIAHHIQQQQQG..................',
        '..................AOOIHQQQQQQQIAHHPQQQQOC..................',
        '..................AIGISSQQQQSIGGHIPQQQQIIA.................',
        '..................AIISQQQQQQIHAHHHOQQQOIQB.................',
        '..................AHPQQQQQQOHHBHHHIQQOHQPA.................',
        '..................CISQSQQPIIIIAHHHIPHHQSG..................',
        '.................AISQQSQIIIIIHCHHHHHHPQHA..................',
        '.................GHHOQSSSSIIICEHHIOPOPPPHA.................',
        '.................HHHIHHIIIQQIIAHHHHHHHHHPE.................',
        '.................CHHIPQQOEHOSPBHHIGCHPPHEA.................',
        '.................AAISQQSQQOEIHAIGAEQPPPPQA.................',
        '.................AOSIOOOPQSOEABCGPPPHCCCIH.................',
        '................AHIIGBCBBIHOOAGGHHHDAIHGBC.................',
        '.................HHBFVYYYFAHOHGGGBDFFKXKKDA................',
        '.................AARJFFJFFLAHBGGAOVFRRJKYXYA...............',
        '..............A..AFJUYYYYKJFABAAFFUFFKKXYYYRA..............',
        '..............A...FFVYYYYXJFAAAUUUUTTRRTTRRTB..............',
        '.................AURTTTTRTTVA..ARRUUUUYYYXYVA..............',
        '.................AOUYYYYYVTI....AAAAAAAAAAAA...............'
    ], [
        0x010101, 0x090706, 0x100d0d, 0x290f0b, 0x1b1c1f, 0x4d1d17, 0x2a2c31, 0x323842,
        0x383f49, 0x5f251d, 0x702e25, 0x7c3429, 0x84382c, 0x7d463d, 0x414854, 0x495262,
        0x505a6c, 0x645f5e, 0x545e71, 0x7d6e68, 0x92857b, 0xb29e8f, 0xd1bea8, 0xc4c2c1,
        0xdad9d9
    ]);

    // Chico de los audífonos
    pixelMap('victimE', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '..........................AAA.AA...........................',
        '....................AAA.ADOOMAHAA..........................',
        '....................ADCIOOOEALAAAAA...A....................',
        '....................AAPPOEAAEHHHGGCAAAA....................',
        '..................ADGPPPCAEEGGHHHHHHHCA....................',
        '..................ADOPPDAGHHDHHLGHHEAAAA...................',
        '..................EEPPPAHLLLHLLHLELELGGBA..................',
        '...............AABGMPOAGLMLEHLCMMLBNGLCA...................',
        '................AAAPPOAGGELAHHAGNNAGLHGGDA.................',
        '.................AAIKKDEGHLAHLDDHLACHGHAA..................',
        '.................ECADAAEGGDQBHNAHGGADGEGA..................',
        '................AGCPRBFAGDABAABBDHDACEEHCA.................',
        '...............AEAPPPRCJBDRRLBARGGBAAAEDEA.................',
        '.................AQPQPBJAAAAARQRERAQQAEAA..................',
        '.................ASPSPBIABAAAAOERSAAAADC.A.................',
        '................AAPSPPBIBRQLDQPSSMAAAADCA..................',
        '................A.EPPPCFAARLBRSSSOHRCDA.A..................',
        '..................AOOBEBQOSSSSSSSSRRACA....................',
        '...................AAAAASSSSSSSSRRSSAAA....................',
        '....................AADAASSSQSSSSSSEA......................',
        '....................AAAAAMSSSSRRNSQA.......................',
        '...................BJEACBRBRSSSSSAA........................',
        '..................AJJJJIAORRAABAAA.........................',
        '..................AEJJJJJJCRRRAADCA........................',
        '.................AFKEAEIJJJCRRAEIJA........................',
        '.................AEAEJFDADIICRCJJEA........................',
        '.................ACEIJJJJDAFIJBEDCA........................',
        '..................AJJJJJJJIEEEEEEEEA.......................',
        '.................AIJJJJJJJJJEJJIIEEEA......................',
        '.................AJJJJJJJJJJEJKJFJCEA......................',
        '.................AJJJJJJDJJJEJPKEFAEA......................',
        '................AJJJJJJJAJJJIPKPKEAEE......................',
        '................AJJJJJFEAJJPPJKJPKAFFA.....................',
        '................BJJJJJJA.JJJJPMMKICAFA.....................',
        '...............AJJJFEEJA.JJJJPKPKIEAFJA....................',
        '...............AJJEFFFAA.IJJJJJJMJFBEEC....................',
        '...............BJJJJJJJAC.JJJJJJJJFAEFIA...................',
        '...............CJJJIEDEBA.FJJJJJJJFAEEEA...................',
        '...............AFJJJEKJJJAEEDJJJFEAAFJFA...................',
        '...............AEEJJJJJJJDAJJFCCEJJKAIJA...................',
        '................AEJJJJJJIJIJEJJJJJJJBCJI...................',
        '.................AFFJJJFEJAJJJJJJJJJJAEF...................',
        '..................AFFJEEJJAJJJJJJJJJJIAA...................',
        '..................AAEFEEEAJJJJJJJJJJJFA....................',
        '....................AAAAAEFJJJFEEFFFEAA....................',
        '....................AEEEBFFJFFBCCBEEAEA....................',
        '....................AECAAAADAAEEEDABAEA....................',
        '....................AAAGGFAEAAEAECIJJA.....................',
        '.....................AJJMFNNNMMAKINNJA.....................',
        '.....................AKEEONNNNNANNNNNA.....................',
        '.....................AOKOONNNNMAIENNNA.....................',
        '.....................IOONONNNNJADMNNNJ.....................',
        '.....................IMNNOONNNNAINNNNGA....................',
        '....................ADAAAAAONONAKNNNOAA....................',
        '....................KOONNNJNNOEBMONNOBNA...................',
        '...................AGJOONNAONOABNNNNOAMA...................',
        '...................KOOJMOMAONOACNOONNKAA...................',
        '...................AJNOONBDOOOABNNONNMIA...................',
        '...................AICCEBNMOOCBBNNNNNNIA...................',
        '..................AMJOIOOIOOOAIBJNNNNNAE...................',
        '..................ANMONOODOOMAIAJONNNNAO...................',
        '..................AIJKMOOAOONAIFJNNNNNAA...................',
        '..................ABAADMBCOMNAIIIJNNNNGA...................',
        '..................KGGJGEIONMMAIDJJONNNMA...................',
        '.................ANGNMNNNNOOAAIDKNJNNNOA...................',
        '................AGNJONNNNMNOAGIDMNNJNNNMA..................',
        '................DNKNOONNMOONMBIDNNNNNNNNA..................',
        '...............AMMIOONNNKONJCAIDKNNNNNNKA..................',
        '...............AFIEONKNNNOMMBDEDJIMNNKIA...................',
        '................AIEIIINNNNNDAGIENONNIIAA...................',
        '................AIDEONNNNJKNAGGEONNNOKJA...................',
        '................AEINNGGGIIIIBAIIIIKJFEFIA..................',
        '...............AMJJKNMNNKAJIAAGCDEMNNNNJA..................',
        '...............AMENNMMNNNOEEAEEAJNNCAABKA..................',
        '...............AMKIAAAAADOOAAAFJJEAQQSOAA..................',
        '..............AJIFADPSSSBAMKAGGEAAEEPRPAAA.................',
        '..............AGECIIAACAFBEDAFFARPREFCQSSRA................',
        '..............AAAIFQSSSSSFBABAAAEEFFFPSSSSA................',
        '...............ABEEQPPQQPEBACAORRRBCCOPPOPPA...............',
        '..............AARRSSSSSSSSEAAANRRRRRSSSSSSRA...............',
        '.............AAAABIIEEBAADAAAAAAAAAAAAAAAAAAA..............'
    ], [
        0x000000, 0x060404, 0x090808, 0x100d0c, 0x131111, 0x181718, 0x1d1715, 0x241b17,
        0x1e1b1b, 0x201f1f, 0x272323, 0x2b201b, 0x2e2827, 0x342e2c, 0x373230, 0x444043,
        0x665957, 0x9a857a, 0xd5c6ba
    ]);

    // Chica gótica de pelo largo
    pixelMap('victimF', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '.......................AAFEEAAAA...........................',
        '.....................AAHHHHEDDGGBAA........................',
        '....................AGHGHGHHHFEEGGGA.......................',
        '....................CKJHGHHGFGGGGGHHA......................',
        '...................AJJJGPLIGIGGGGEHHHA.....................',
        '...................GJIMOOOEJJBHIKAIJIGA....................',
        '..................AGIGGONOFJJBKHHAAHGGA....................',
        '..................AGGGGPKOFHGMGGGBEGGFA....................',
        '..................AGGFBHGDGHBOGGGANHGDGA...................',
        '.................AEGGDFGGDFABEEFGHMACAGA...................',
        '.................AGGGDGGGBMNOMBGDJFNBBEA...................',
        '.................AGGGAGHBAAAAMPPPNBAAFB....................',
        '.................AHHBJFGDAGBBAPPPAAAAGF....................',
        '.................AHHCMBGHMPHIPPPPEFOBFF....................',
        '.................AHHBOFGGONHJPPPPLGDACGA...................',
        '.................AHHCAFGDCPPPPPPPNPOBEFA...................',
        '.................AHGFCAHBLPPPPPPOPPBFFAF...................',
        '.................AHFHCAHFAPPPPNNOPHAGFAB...................',
        '.................AHFHDAFGBLLPPPPPAADGCA.A..................',
        '.................AHGGCCDGANNAAAAAACDGCA.A..................',
        '................AHEHFDCBCAACAAAACACBFFA.A..................',
        '................AHEHCDBAAFDEFOAAAADDCDA.A..................',
        '...............AHCHGDBBBEEPONGOMBBADDAF....................',
        '...............CEAIECMPPLFOPOHMPDENADDGA...................',
        '..............AHAHHEBPPPPBBPPPPNAABBDEAGA..................',
        '..............DDAIFDBPPPOIECDABBEEBAAEEAA..................',
        '.............AGCIIFBBMPCBGGFCGGNEGGBGDEAD..................',
        '.............AAAICGAEFGFFCBFGGFFGGGGACFACA.................',
        '..............GGGFFABFCBBGGGGGGGFGGDABEBCA.................',
        '..............AICGFBLLKMKAEGGFEEDDEEACBEAA.................',
        '...............JAFFABLMFFAEDEEDEFFEAAADFB..................',
        '...............EBAFDCGGGBADFFFFFFFFAKBDB...................',
        '................ABFCFMMMABAEFFFFFEEBAABAAA.................',
        '...............A.AEEFMMLADADEFFFFFEFFAA....................',
        '..................ACBGGGBDADFFFABBLAAGA....................',
        '.................A..BLLMLAAAAGMNPPPPGAKB...................',
        '....................BMMJBABBNPPPPPNDBDBGA..................',
        '....................AGGGGBAFGFAAABCJJGAJA..................',
        '....................AGGMMAAGIIIIIJJGEEIBLA.................',
        '....................AMMMIAGGGJJGGJIIJGJJAA.................',
        '....................AIGGGFIJFJJJGJJGJJFJFA.................',
        '....................AGGGMMAIJJJJIJJGJJJIJA.................',
        '....................AMMMMHBFJJJJIJJJIJJFJJA................',
        '....................AGGFFGIFJJGJIJJJFJJJIIA................',
        '....................ACEGLLAIJJGJJJJJGJJJAA.................',
        '.....................ALMFDBJJJGJJJJJFFBAA..................',
        '......................ACBKBBAAABBABBBBNB...................',
        '........................ABNNNNNNACNNNNNA...................',
        '.........................BPPPNNNANNNOOK....................',
        '.........................BPPPPPBBNNPPPB....................',
        '.........................DPPPPPBAJOPPOB....................',
        '.........................CNPPPPABFEFGFA....................',
        '........................AGFDBBB.AJGFFB.....................',
        '........................AKGGGGA.BKKKKA.....................',
        '........................AKKKKK..AGGGFA.....................',
        '.......................AGGGGGA..AKJJKA.....................',
        '.......................FKKGGGA..AIJKGA.....................',
        '......................AKGGKKA...AGGGGA.....................',
        '.....................AGKKKIB....AKGIJA.....................',
        '.....................AGGJKKA....FKKKKA.....................',
        '.....................GKGGGF....AFGFFGA.....................',
        '.....................IKKKGA....AIIGGJA.....................',
        '....................AGGGGGA....AKKKKJA.....................',
        '....................AKKGGB.....AFGGJD......................',
        '....................AKKKKA.....AKKKJA......................',
        '...................AGGGJGA......BGGIA......................',
        '...................AKGGGA.......AKIIA......................',
        '...................AJKKKA.......AJKJA......................',
        '...................AFBABA.......AFGBAA.....................',
        '..................AFAIIGA......AALAHIGA....................',
        '.................AGACFFGAA....AGGABFFEA....................',
        '.................AGGEKPOFA.....EFGGCOPPA...................',
        '.................AGEIJNPLA.....FGFFGFKPPAA.................',
        '.................AMNGFDBAF....AFFLNFGEGIPMA................',
        '.................FGIGPPPPJA...ADGFGGGFPPPPHA...............',
        '................AMFGLLLLLLAA..ANMEAGDBLKKKKA...............',
        '...............AANOPPPPPPPPAAAAMOONNPPPPPPOBA..............',
        '.............AAAAABDIJKKKJAAAAAAAAAAAAAAAAAAAA.............'
    ], [
        0x000000, 0x040303, 0x0a0807, 0x0e0b0a, 0x110f0e, 0x151211, 0x181717, 0x201b19,
        0x22201f, 0x282726, 0x343232, 0x4c4745, 0x6a625e, 0x98796c, 0xb09c95, 0xd2bfb0
    ]);

    // Chico de la chamarra universitaria
    pixelMap('victimG', [
        '...........................................................',
        '...........................................................',
        '...........................AA..............................',
        '......................AA.AIDAAEEAA.AA......................',
        '......................AGACIAIIGAEIIA.......................',
        '....................AAAAEGGIGGIIIGBAA......................',
        '..................AGGIIIIGEEEGGIIGIIIAAAA..................',
        '...................AAIGEGIIEGIIIEIGIIIIIA..................',
        '...................IOOIIIGIIGGIIIEIIIGCA...................',
        '..................AIOGOIOIIEECGOIIGIGIIDA..................',
        '...............AAAIIIIIGGICBECAIOOBGIEIGGA.................',
        '................AAAIIGIGIGABBAAGIOBBGGGBAAA................',
        '.................AIIIGEDIIGTCTUBGGGAEIGIA..................',
        '.................DIIEEIBGGUWWWWEGGUOEGEGG..................',
        '...............ADIDIGDIIDGDDDIWOEGTEAEECEA.................',
        '................AAGGDAIGACBTUTEWGDBTDDEABA.................',
        '.................AGEAACIBBAAABVWDUBAADDC.A.................',
        '.................EBDSDCGACUBDGWWWBAAABCE...................',
        '.................AADVTAAGVOOIXWWWDEVADAAA..................',
        '..................ACCWIWDTWWWWWWWWUUAEA....................',
        '..................AADCWVWWWWWWWWWTWWAA.....................',
        '...................CADCBUWWWOWWWWWWB.......................',
        '....................AACCAVWWWOOMOWUA.......................',
        '.....................AACATCWWWWWWBA........................',
        '......................AVFOUCBCCAA..........................',
        '......................AVWIMUTAEIB..........................',
        '....................AAMBTTJBUADFTA.........................',
        '...................AMMMMDTWFGTACUDA........................',
        '..................AUJMMMMMFVBVVCFJMA.......................',
        '.................AVXXWJMMMMMDWXAJMMMA......................',
        '.................BWXXXJMMMMMMBXDMMMJA......................',
        '................AVUXXXXMMMMMMAXVMMMFWA.....................',
        '...............AOVUXXXXJFMMMMAXXJWOVUB.....................',
        '...............AUUXXXXXFFMMMMBXXJMMVDVA....................',
        '..............ATVWXWXXXDFMMMMAXXFMWJBVA....................',
        '..............AVUXXXWXVBJMMMMAXXFMXMBVUA...................',
        '..............EWWXXXVXVAJMMMMBXXDJXMCVVA...................',
        '..............DUXXUOUVTFJMMMMBXXUJMMBUWVA..................',
        '.............AVXXUUWICAFJJMMMAXXVAMMCBUVA..................',
        '.............AVXXXXXXWAFFJTMMJWXWBMMFBUUBA.................',
        '.............AUXXXXVUVXBFJXMMTVXXUFMMBWWUA.................',
        '..............BVXXXXXXXXBVMMMMCXWUBMMMAVWA.................',
        '..............BVVXXXXXXXWBMMMMAWWXBMMMMCVA.................',
        '...............AVVXXXXXWUAFJMMAXXXVBMMJCCA.................',
        '................BVVXXXVTFOBFJUAXXUABFFBIB..................',
        '................AAVXXVUFVVATJFBAAAHAFUBIA..................',
        '..................CVVVEVWFBJTAKKKKKEBMCA...................',
        '...................AABIJFEVBFCPPHQPKACTB...................',
        '....................BTAAIVGNKPQQHQPPLLAA...................',
        '....................ADAATOQQQQPQKQPQPLA....................',
        '......................CKDPPQQQQQKRPPPPA....................',
        '......................KQHQQQQQKNKKHPPPB....................',
        '.....................GNQQQQQQQQLBBKPPPE....................',
        '.....................EQPRQQRQQNPAKLPPPG....................',
        '.....................GRLRRRRQQQQAKPPPPPA...................',
        '.....................IRLRRRRQQQQDKPPPPPA...................',
        '.....................KRKQRRRQQQRKKPPPPQA...................',
        '.....................EPLRPRQRRQHKKPPPPPA...................',
        '.....................KQKLSRQQRRDKKPPPPPA...................',
        '.....................KPKSSQRRRQAKKPPPPPA...................',
        '.....................KKRSRQQRRRAKKPPPPPA...................',
        '....................CHNRSQQRRRNAKKPPPPPA...................',
        '...................EQSRRRQRRRRCCKKPPPPPA...................',
        '...................IRLQQRRRRRRAHKKPPPQPA...................',
        '...................DQKQRRRRRRRAKKKPPPPQA...................',
        '...................ANKLRRRRRRLAKKKPPPPNA...................',
        '...................ALLLRRRRRNKAKLLPPPND....................',
        '...................ANLRRRRRLKKEKLLPPPKA....................',
        '..................ANNRSRRRKKKAKHLQPPKKLA...................',
        '..................ARNRRRQKKKKAKKLPPKKLLA...................',
        '..................AQQQRNKKKKKAKKPQKKKNLE...................',
        '..................HPQQQNRKKKEALKNPPKLPQPA..................',
        '.................APKQQQRRRKKAALKPPPQQPLA...................',
        '.................LPPPPKNQRRQCAKHKNNQKHDA...................',
        '................ANKQRRRRRNNRPBKKPQPPPPNA...................',
        '................ANKPNKDHKKLPRAKKLLKHKKLKA..................',
        '................ALKKQQQQQEHKLAKKKDKPPPPNA..................',
        '................ADLRQQQPQQNCABKHHPQLHABPA..................',
        '................APPLHAABCKPPBBEKKNDBOVUAA..................',
        '...............ANQHAJUXWMBKNAAKKKAFJITXIEAA................',
        '...............AKKBMMJJJFMAKDBHKBOJSMMMXXXBA...............',
        '................ABMMXXXXXMJCACKAJUJJMMXXXXWA...............',
        '................ACJSUVWVUTJAAAETSIFFJJSSSSTOA..............',
        '..............AAAWXXXXXXXXWBAASUUUUUVXXXXXXUA..............',
        '............AAAAAAUXXXXXXVSAAAAAAAAAAAAAAAAAAA.............'
    ], [
        0x000000, 0x060404, 0x0b0807, 0x160f0e, 0x261b17, 0x3d1113, 0x392820, 0x212830,
        0x463027, 0x55181c, 0x29323e, 0x2e3846, 0x6c1f24, 0x333f4f, 0x63443a, 0x3b4a5d,
        0x3f4f63, 0x445468, 0x62636b, 0x87645a, 0x99877c, 0xb2a295, 0xd0bdad, 0xd5cec6
    ]);

    // Chica de coleta morada
    pixelMap('victimH', [
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '...........................................................',
        '..................AAA..A...................................',
        '...................BKLA.D..................................',
        '................ALLK..LAIA.................................',
        '...............AL.LLK..BIAAA.AAAA..........................',
        '..............AAAKK...BAAKKKKK....AA.......................',
        '...............BLLK..BBA.KKK......K.AA.....................',
        '..............ALAMA..A.KKLK.LK..KK.KKAA....................',
        '.............AL.LLL..AL.KKLLKAKIKKL.KLK....................',
        '.............AAAK.L.A.LLLAMMAMKCKLLBLMMA...................',
        '.............KAKK...A..KKLLLAMLCBLMLAMALA..................',
        '.............AAKKL..A.K..LL.LKGOMKLKAA.KA..................',
        '..............AKKL....K..LK.LLJPPFKKNAL..A.................',
        '...............FL...A...LLL.AAPPPHLDOA...A.................',
        '...............CL.K.A...KLKDMNOAAHLEIMA..A.................',
        '..............AK....A.AALLBAAACNOIKLEDB.AA.................',
        '............AAL..K.A.BNNKLKABAAAOPPAAAA.AA.................',
        '.............AAA.....AOBKLLJPDGJPPPBFB.....................',
        '...............AKK...APNA.AOMGCOPPPEJB.A...................',
        '...............KL.....BPBKANPPPPPPPOPB.A...................',
        '...............KA.K....BBKBBPPNPPPOPPA.....................',
        '..............A.ABK...BFA.AOPPPMMJPPA...A..................',
        '..............AA.AK...ANAALJBPPPPPBBA.A....................',
        '...................B.A.A..AMOBABAA....A....................',
        '.................KA......AADBBAA.....A.....................',
        '........................AAGEDCODA..........................',
        '.......................AGFAOPOCMOBAA.......................',
        '......................AFFFFDBMMOBEEE.......................',
        '......................EFFFFFFEFFEEEDA......................',
        '.....................AFFFFFFFFEEEEFAC......................',
        '.....................AFFFFDFFFMNEMNEAA.....................',
        '....................AAAFGFAFFFNNMMNMFA.....................',
        '.....................ABBEEAEFFNNMKNGEA.....................',
        '.....................ANOOBBDFFENMMLDDA.....................',
        '.....................AOPPBBDDEDDLKDDA......................',
        '.....................AOPPBAEDEDEFFEED......................',
        '.....................AOPPB.BDFFEEFFEB......................',
        '.....................AOPPA.ADFFEFFEEAA.....................',
        '.....................APPPA.CEEABBAJCAA.....................',
        '.....................APOPA.ABMPPPPPPBA.....................',
        '.....................BPPPA.BOPPPPPPPBE.....................',
        '.....................BPPOABBOPPPPPPPNAA....................',
        '.....................BPPBAADBCCCAABAABA....................',
        '.....................BPPBADDFFHGAOCPBOA....................',
        '.....................BPPAAFGGDFIBJIPANBA...................',
        '....................AABABDAABBEBBONMBAAB...................',
        '....................AEHFAGJLDDBBAABCEGCJA..................',
        '....................BFEIBHLGJICJHFGGGGGBA..................',
        '....................AEEAAIEJGHMIHFIIHGGBA..................',
        '...................APJJBCGIIIOJIHGHIGGFAA..................',
        '...................BPPPPDFJIIJOIHEAEGGGA...................',
        '...................BOPBNHFIHNJGGFAEGGGGA...................',
        '....................JPBAFIIHJNHGDDFGGGGB...................',
        '.....................AABGGMJPHHHAEFGGGGA...................',
        '......................ENNNKNIHHHAFGGGGGAA..................',
        '.....................BMNIMOHGHHHAFGGGGGAB..................',
        '.....................AGFFEDIHHHHCFGGGGGAF..................',
        '....................AIIIIIDHHHHAEGGGGGGGB..................',
        '....................AGIJIFFHHHHAFGGGGGGGA..................',
        '....................AEABDEHIIIIAFGGGGGGGA..................',
        '...................AHHIHIFIIIIFAFGGGGGGGA..................',
        '...................AHEIIEIIIIIECFGGGGGGGA..................',
        '...................AEHIIEIIIIEBFFGGGGGGGA..................',
        '..................AEFEEEIIIIIFAGEGGGGGGGA..................',
        '..................AIFIHIIIIIGFAFEGGGGGGEA..................',
        '.................AIIIIHHIIIIFEAFFGGGGGEA...................',
        '................AFIFIIGHIIIFFBCFGGGGHGEA...................',
        '................AFGEHFFIIIFFFBFFGGGGGEEEA..................',
        '.................CFEFFHIIFIFFFBEGGHGDDDFA..................',
        '.................AFCFIIIFFFDFFAEFGGGGGGCA..................',
        '.................AEHIIIIHIHFCADFFFEFGGGGEA.................',
        '................AHIIIIIIIHHHHADEFFGGGGGGGEA................',
        '...............AIIIIIGFFFFHHHFAEGHGGFDCEGEA................',
        '...............AIFIGEEHHHEEFHGAFHGFBFFFFFA.................',
        '...............AGFEEIIGGHHHEFHAEEEFFGGBADA.................',
        '................AEGHBABAAAEHFABEDFFFAFAAAA.................',
        '...............AGGGBEBILJICCHAEDFFBADCHJJHA................',
        '...............AGGBFDHJGGGHAEAADFBBEEGGGGGA................',
        '...............AFAADEEDDEEEABADCAADEDEEEDCBA...............',
        '...............AAEEEGGHIIIHGAAABEEEEEGGIIIGA...............',
        '...............AAFAFHIIHIHHEAAAEEAEEEGIIGFFA...............',
        '............AAAAAFAEGHHHHHGFAAAEEAEEEGHHGFDAAA.............'
    ], [
        0x000000, 0x040303, 0x0b090a, 0x100f0f, 0x141313, 0x181818, 0x1e1c1d, 0x242222,
        0x272526, 0x332c2a, 0x352839, 0x3c2e40, 0x55414c, 0x705d64, 0xa48a80, 0xd3bba9
    ]);

    // Chico de lentes
    pixelMap('victimI', [
        '...........................................................',
        '...........................................................',
        '.........................AA...A............................',
        '........................AB..AAA............................',
        '....................A..AFAAEEAAAA..........................',
        '....................ACBAEAEEECEEEAA........................',
        '..................ABEACCDECEEEFFDFFAAAA....................',
        '.................ABAAFFDCCDEEEEEFDEEEEA....................',
        '..................AHHFEEEEEEEEFEDEDECA.....................',
        '..................FGGFGDGFEFEAHFGDGFEEBA...................',
        '.................AEEEGEHGGAEFAFHHBEGFBCC...................',
        '...............ABECEEEEEBFBEEAAEECADBEAAA..................',
        '................AAEEEDEEDELBFCBDEDADADDA...................',
        '.................AEEEDEECARQASNCFSRACDDA...................',
        '................AEDDDCECAHABAATBCAAAADADA..................',
        '...............AAACDCAEDLBSLRLTBSBOQADAAA..................',
        '................AADCAAABABAABSATBBAABAA....................',
        '.................ACASCCAHSUBETBBALBBABA....................',
        '.................AABTOABBSSLITBTBLRBAAA....................',
        '.................A.ATRGDGBETLBTTTBPBA......................',
        '..................A.ATTTTTTTTTTTSTTB.......................',
        '....................AAABTTTTTTTTTTTA.......................',
        '....................A.CAATTTTOQMTTA........................',
        '......................A.AGSTTTTTTA.........................',
        '.......................ACQOABABAA..........................',
        '.......................AUBQQGAA............................',
        '.....................AABUUTBQAKBA..........................',
        '....................AGGFBUUUCRPSAA.........................',
        '...................AAEBGFAUUSACJBHA........................',
        '...................CKKJAGGHBIBHEGHHA.......................',
        '..................AKIKKKFGEIIJKIKJHD.......................',
        '..................BKKKKKFGFBKKJJJJGHA......................',
        '..................HKKKJKKAGGJKJJKKDHA......................',
        '.................AKKKKKHKIEGBKKJKKHAB......................',
        '.................AKKJKKAKKABABKKKKJAIA.....................',
        '................AJKKKIKBKJBTTSBKKKJAIA.....................',
        '................AJKJHHIBHATTTRAKKKKAIA.....................',
        '................CJJHIBAAHBTTTQBKKKKAIIA....................',
        '................BKKJBKKHKKTTTQAKKKKCHIA....................',
        '...............AKKKHKKKGIKBTTTBKKKKGCHF....................',
        '...............AKKJKKKKKJIEQAAJKKKKICHIA...................',
        '...............AJKKKKKKKIHHAEIKKKKJIBHHA...................',
        '...............ABHKKKJIIHBBEFKKKKKJIAGGA...................',
        '................AHHHHHHBADBFBKKKJHHJKBHGA..................',
        '.................AAABAABGEFCHIKKKKKKJAIHA..................',
        '..................CDDAHHIFGBKKKKKKKJHAHHA..................',
        '.................AGEDBCHBFAHHHIIHGHIBIIBA..................',
        '.................AGFEDAAFAHJHJHHJIJIAAHA...................',
        '.................AGFEEAEABHHHJIGGABBBRAA...................',
        '.................AGFGCEBMPHGBBABAMNOBSA....................',
        '.................AGGGFBPNORQQRONBPQQMBA....................',
        '.................AGGGFARLRRRRQQQCQQQNA.....................',
        '.................AAGEECRPRRRRROMBNQQPA.....................',
        '..................AADACRRRRRRQNANQQQQA.....................',
        '.....................ANRRRRRRRRANQQQQA.....................',
        '.....................ARORRRRRRQENQQQQA.....................',
        '.....................ARORRRRRRPMNQQQQA.....................',
        '.....................BRORRRRRRLMNQQQQA.....................',
        '.....................BRRRRRRRRLNNQQQQA.....................',
        '.....................CRRRRRRRRGNNQQQQA.....................',
        '....................ARPRRRRRRRBNOQQQQA.....................',
        '....................BRORRRRRRRANNQQQQA.....................',
        '....................ARORRRRRROANNQQQPA.....................',
        '....................HRRRRRRRRNENNQQQNA.....................',
        '...................AORRRRRRROLNNNOQPOA.....................',
        '...................ANRRRRRRRNMNNNNQOOA.....................',
        '...................AQRRORRROOHNNNOOOOA.....................',
        '...................AQNORRRPOOBNNNNOOOA.....................',
        '...................AOMRRRROONANONNOOOG.....................',
        '...................ANQRRROOONBNNNOOOONA....................',
        '..................ANPRRRQQQONBNNNNOPOOA....................',
        '..................ARRRRRRRRONAMNNNPOOOA....................',
        '.................ARRRRRRQRRROAMNMOOOOLA....................',
        '.................BRQRRNNNNRROBNNOONLLA.....................',
        '.................AQORRPMNNNPPAMNNOOONA.....................',
        '.................AMONOOPNLNNBLMOOOONNNA....................',
        '..................APMOQRROMONAMONMMONNNA...................',
        '..................ANQQQQQQQMOAMMLOONNONA...................',
        '.................APQRPBBAMQQEBLNNNBBPAAA...................',
        '.................APOABQUSDANPALNMBDNSKCAA..................',
        '.................ANBHHEFFCHBMAMLAIHGDTUUPA.................',
        '.................BLGGMUUUUHBBAABPIGGKUUUUB.................',
        '.................AAGGPQSRRPEAAPRNEEFNPMNMNA................',
        '...............AAAPSUUUUUUUUBBRRRRTUUUUUUSB................',
        '.............AAAAAAPSUUUUUSCAAAAAAAAAAAAAAAA...............'
    ], [
        0x000000, 0x040403, 0x0e0c0a, 0x141210, 0x1a1715, 0x1d1b19, 0x242320, 0x2c3128,
        0x333c31, 0x3e4a3d, 0x435041, 0x4f4136, 0x605144, 0x6e5c4d, 0x756251, 0x7a6c5e,
        0x8d7865, 0x97836e, 0xa7988e, 0xcfb8a6, 0xd9d8d7
    ]);

    // Art vestido de Santa con hacha (nivel navideño), convertido de la imagen de referencia
    pixelMap('artSanta', [
        '..................................AAAAAAA...........................',
        '.................................ALLLLLLI.A.........................',
        '...............................ALLLLLLLLLKF.........................',
        '..............................ALLLKIHILLLLLLG.......................',
        '.............................AKLLKHHHKILLLLFAA......................',
        '............................ALLLIHGGHHHHLLLLIHA.....................',
        '...........................ALLLHHHDHHILLLLLLLHHA....................',
        '...........................ALLHHFDGHILLLIHHGFDHH....................',
        '..........................ALLIHHABHHKIGGFFFQRQFGAA..................',
        '.........................AKLHHH.BHHHFFNQSUURUUQUQAA.................',
        '.....................AAAALLHHHAAHHFQQSUUUUUUUUUUUQA.................',
        '....................APRSRFIHHAAHGFQUUUUUUUUUUUUUUUAA................',
        '....................ASTUURHFAABHPRUUUUUUUUURSURUUSQA................',
        '....................CRUUUSQA.ADPRUUTUURPMNMMQRQRMNQA................',
        '...................APRRUURQA.BQQSSRUUQRPJEJCQQRQBANA................',
        '....................EQQRQQPAANQRRRSTRJPSTTTQATUBTUEA................',
        '....................ANQRQRB.ANRRRSRQNNSSSUTTBUUBUUTA................',
        '.....................ACMNA..APQRSPJNSSSAAAARUUUUTUA.................',
        '.......................AA...APQQQNRSSSCAAABATTTTAAA.................',
        '............................ANNPPNSSSMAAAOOBATUAAOA.................',
        '............................AMPPNNSSSNAAOOAUAATAATA.................',
        '.............................ANNNNSSSSEAAOAAAATAAAAA................',
        '.............................BNNNNSPNSSSBAAAAAUQANRAA...AAA.........',
        '..............................CNNNSRJNSTSPPAAQUUAPTTA..AMPPAA...AA..',
        '..............................CNNNPSRJASTSSSQQUUBTUA...AMMMPPAAAAPA.',
        '...........................AAAACNNPSSQEATSTSASQUQAA....AMMMMJNMMNQSA',
        '.........................AAPQRAACNNQSSPBTTSATSUUUAA...AMMMMMJMHMNNSA',
        '......................AAAARRTRAAACNQSSPBSTAAAAUBQAA...AMMMMMJMMHNHRA',
        '...................AAAFIFARTUQPAAPCNQSSSSAAAAAATANA...AJJMMMMMMJHNOA',
        '..................AGLLLLLARRQQTPACQMQSSSSAALAAAAAAA....AAAACMMMHGHQA',
        '................AGKLLLLLLIAQTTURPAAMNNSSTAAOALALOAA....AE..AAMJHGILA',
        '.............AAFLLLLLLLLLLAQQUQQQNAAMNNSSABAAOAOOAA....AJE...AHGHOA.',
        '............AGLLLLLILLHKLLGARUTQQQMAAJNNSAOAAAAAAA....A.JEA...DHISA.',
        '.........ABKLLLLLLLLHLHGLLLARUTQQQRPAAMNTAAAOAOAPA....AEJC.....HQGA.',
        '.........GLLLLIKKLKLHHDGHLIHAURQRUSRNAANNSAAAAAAPA....AJJ......ASA..',
        '.....AAJAHLLLLLGGGHHHHDGHHHHARRRUUSQNNEANTTAAAARAA...AEJEA......HA..',
        '....APTTSPILLLLIHGDGHHDGHGHHGAQSTRTQNNNCBPTUTTRNA....AJJ.A......A...',
        '...AANRUUQGKLKHHHHGFDGDGDDHHHHBMQQPNNPNNAAMPTTCA.....AJE.A..........',
        '..AAQMPUUTJHHHHHHHHGDAADFHHILHGFCMNNNQPJGGAACCA.....AEJEA...........',
        '.AANQQNRTTQGHHHHHHFDAAFFDFHKLIHHFFNNNNMFGHAFFIA.....AEE.A...........',
        '.BNQQQNPSRQPGHHHFDAAAFHHFGHILLKHGQRQQNFHHGAGHKK.....AEA.............',
        '.ANQQQQNQQQQEFFDAAAAAHHHHHIKLLLLGUUQQMFHHFDGILKDCBJAQQPE............',
        'ABNQQQQPMQQQNAAAAAAAAFHIIIILLLLLQUUSQMHHGAFHIKIJSPRASTTSA...........',
        'AANQQQQQCPQQEAAA...AAADHKLKLLLKGUUURQGHHAAHHIIJSTATEPTTTQA..........',
        'AANNQQQQBBEBA......AAABBGKLLLKGPUURQNHHFAFHHHFQTTASNJSTTQA..........',
        'AAANNQQCAAA........AACCBBAHKLHFUTRQPEHHAAFHHGFTTQAPERTTRE...........',
        '.LBENNCA...........AACCCCBAAHHDSQQQNHHAAAAGHFQTTPAAQQSSQA...........',
        'AOLGAAA...........AFFDCCBAAAAABMBJNEGDA..AAGFQTRNAAAQQQMA...........',
        '.AAA..............DHHFBBBAAAAAAMQOMFFA....AAAPQQQA..AAAA............',
        '.................AFILLKHDAAAAABOAAMMAA......AANQPA.E.A..............',
        '................AJHHKLLLLKGAAAOMAAEMAA........AENAEE.A..............',
        '...............AMRTQIGLLLLLFRPBEOOJAA...........A.EEA...............',
        '...............JQSTUSPIHLLINTUNJABDDA...........AEEEA...............',
        '..............APRRTUUTRPIHMSUUQPPCDHHA..........AEE.A...............',
        '...............CQRQUTUUURPSURUQQQCHHGMB..........AC.................',
        '...............AANQRRTUUTTUSRRRQNBFHQTUJ............................',
        '................FCMQRRSTUSURSRRQNJMRTUUPA...........................',
        '..............AFHHDGNQQRSQUUSQQNQQRSSQQBA...........................',
        '..............AHHHHGAJPRQRSTQQPMQQRQRQGFA...........................',
        '..............AILLHHHFAJPPQQQQNPQQQPFBHH............................',
        '..............AKLLLKHHGDABMQQNAPQQEAFHHILLAA........................',
        '..............AILLLLIHHHHGBAAAAAAADHHHILLLLAA.......................',
        '..............AILLLLLLIHHHGAAAAFFFGHIKLLLLLL........................',
        '...............GLLLLLLLLHHAAAAADHHHHHHHHGHLLLA......................',
        '..............AFKLLLLLLIHAAA..AAADHGHFFDHHKLLD......................',
        '............AADHILLLLLLHHAA.....AADGBAGHHHHLLF......................',
        '...........AMPFLKKLLLLHHAA.......AAAAHHHHHHILD......................',
        '...........ANTSILKLLLHHHAA.........AHHDHHHHHGB......................',
        '..........AAUUTPKLKIHHHAA..........AFFBBDFFDUJ......................',
        '..........ASUUUSMHHHHHHA...........AQQQQRTTUUUB.....................',
        '..........AASSUUTNGHHHAA..........AQQQQTUTURTUB.....................',
        '.........AACMRRSRQPJFAA...........AQQQQQTQQQUNA.....................',
        '........AAJJBNQQQQQQQA............ANQQBAAAQQQAA.....................',
        '.......AAJJJEAANQQQQQA.............AAAAAAAAAAA......................',
        '.......ABJJEAAAANQQPB...............AAAAAAAAJAAAAAAAA...............',
        '......AAJJJAAAAAAAAA................AAAAABEJBEJBAAAAAA..............',
        '.....AAJJEAAAAAA...................ACEEEEEBBAAAAAAAAAAA.............',
        '.....AAJEAAAAAA....................ABBBABBAAAAAAAAAAAAAA............',
        '......AEEECAAAA....................AAAAAAAAAAAAAAAAAAAAAA...........',
        '......ABEEECAAA....................AAAAAAAAAAAAAAAAAAAAAA...........',
        '......AAEEEEAAA....................AAAAAAA....AAAAAAAAAAA...........',
        '.....AAJJJAAAAAA...............................A.....A.AA...........',
        '.....AJJAAAAAAAAA...................................................',
        '....AAAAAAAAAAAAAA..................................................',
        '....................................................................'
    ], [
        0x000000, 0x0a0606, 0x171414, 0x260001, 0x312523, 0x400103, 0x5a0207, 0x72010a,
        0x910210, 0x493c38, 0xb20517, 0xca071d, 0x6e6457, 0x888686, 0xd7715d, 0xaaa7a7,
        0xc3c2c2, 0xcecdcd, 0xdcdbdb, 0xe4e4e4, 0xeaeaea
    ]);

    // Gorritos navideños: copia de un personaje con un gorro dibujado sobre la cabeza.
    // La textura gana HAT_PAD px arriba para que el gorro no se corte (GameScene ajusta el origen).
    const HAT_K = 0x140a0c;
    const HAT_DRAW = {
        santa: (g, x, y) => {
            g.fillStyle(0xc2172f); g.fillTriangle(x - 15, y, x + 15, y, x + 20, y - 26);
            g.lineStyle(2, HAT_K); g.strokeTriangle(x - 15, y, x + 15, y, x + 20, y - 26);
            g.fillStyle(0xf0f0f0); g.fillRoundedRect(x - 18, y - 4, 36, 9, 4); g.lineStyle(2, HAT_K); g.strokeRoundedRect(x - 18, y - 4, 36, 9, 4);
            g.fillStyle(0xf0f0f0); g.fillCircle(x + 20, y - 26, 5); g.lineStyle(2, HAT_K); g.strokeCircle(x + 20, y - 26, 5);
        },
        elf: (g, x, y) => {
            g.fillStyle(0x2f8a44); g.fillTriangle(x - 15, y, x + 15, y, x - 8, y - 32);
            g.lineStyle(2, HAT_K); g.strokeTriangle(x - 15, y, x + 15, y, x - 8, y - 32);
            g.fillStyle(0xc2172f); g.fillRect(x - 17, y - 4, 34, 8); g.lineStyle(2, HAT_K); g.strokeRect(x - 17, y - 4, 34, 8);
            g.fillStyle(0xf0f0f0); for (let i = 0; i < 5; i++) g.fillTriangle(x - 15 + i * 7, y + 4, x - 9 + i * 7, y + 4, x - 12 + i * 7, y + 9);
            g.fillStyle(0xc9d3da); g.fillCircle(x - 8, y - 33, 4); g.lineStyle(2, HAT_K); g.strokeCircle(x - 8, y - 33, 4);
        },
        antlers: (g, x, y) => {
            g.lineStyle(4, HAT_K); g.beginPath(); g.arc(x, y + 8, 16, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
            g.lineStyle(2, 0x6a4422); g.beginPath(); g.arc(x, y + 8, 16, Math.PI * 1.1, Math.PI * 1.9); g.strokePath();
            [-1, 1].forEach(s => {
                g.lineStyle(5, HAT_K); g.lineBetween(x + s * 10, y - 2, x + s * 14, y - 22); g.lineBetween(x + s * 13, y - 14, x + s * 22, y - 18); g.lineBetween(x + s * 14, y - 22, x + s * 10, y - 28);
                g.lineStyle(3, 0x8a5a2a); g.lineBetween(x + s * 10, y - 2, x + s * 14, y - 22); g.lineBetween(x + s * 13, y - 14, x + s * 22, y - 18); g.lineBetween(x + s * 14, y - 22, x + s * 10, y - 28);
                g.fillStyle(0xc2172f); g.fillCircle(x + s * 9, y - 1, 3);
            });
        },
        beanie: (g, x, y) => {
            g.fillStyle(0xc2172f); g.slice(x, y, 16, Math.PI, 0); g.fillPath();
            g.fillStyle(0xf0f0f0); g.fillRect(x - 15, y - 9, 30, 3);
            g.lineStyle(2, HAT_K); g.beginPath(); g.arc(x, y, 16, Math.PI, 0); g.strokePath();
            g.fillStyle(0xf0f0f0); g.fillRoundedRect(x - 18, y - 3, 36, 8, 3); g.lineStyle(2, HAT_K); g.strokeRoundedRect(x - 18, y - 3, 36, 8, 3);
            g.fillStyle(0xf0f0f0); g.fillCircle(x, y - 18, 5); g.lineStyle(2, HAT_K); g.strokeCircle(x, y - 18, 5);
        },
        tree: (g, x, y) => {
            [[y, 15, 12], [y - 9, 11, 10], [y - 17, 7, 9]].forEach(([by, hw, h]) => {
                g.fillStyle(0x2f8a44); g.fillTriangle(x - hw, by, x + hw, by, x, by - h);
                g.lineStyle(2, HAT_K); g.strokeTriangle(x - hw, by, x + hw, by, x, by - h);
            });
            [[x - 6, y - 3, 0xc2172f], [x + 6, y - 6, 0x4a8ad8], [x - 2, y - 14, 0xf0f0f0]].forEach(([cx, cy, c]) => { g.fillStyle(c); g.fillCircle(cx, cy, 2); });
            g.fillStyle(0xe6edf2); g.fillTriangle(x - 4, y - 25, x + 4, y - 25, x, y - 31); g.fillTriangle(x - 4, y - 28, x + 4, y - 28, x, y - 22);
        },
        bow: (g, x, y) => {
            [-1, 1].forEach(s => { g.fillStyle(0xc2172f); g.fillEllipse(x + s * 9, y - 6, 18, 12); g.lineStyle(2, HAT_K); g.strokeEllipse(x + s * 9, y - 6, 18, 12); });
            g.fillStyle(0x8e1622); g.fillTriangle(x - 3, y - 2, x - 9, y + 8, x - 1, y + 6); g.fillTriangle(x + 3, y - 2, x + 9, y + 8, x + 1, y + 6);
            g.fillStyle(0xa8142a); g.fillCircle(x, y - 5, 5); g.lineStyle(2, HAT_K); g.strokeCircle(x, y - 5, 5);
        }
    };
    const withHat = (base, hat, key) => {
        const { rows, pal } = CHAR_MAPS[base];
        const top = rows.findIndex(r => /[^.]/.test(r));
        let sx = 0, n = 0;
        for (let y = top; y < top + 8; y++) [...rows[y]].forEach((ch, x) => { if (ch !== '.') { sx += x; n++; } });
        pixelMap(key, rows, pal, g => HAT_DRAW[hat](g, (sx / n + 0.5) * 2, HAT_PAD + top * 2 + 8), HAT_PAD);
    };
    withHat('victimA', 'santa', 'victimA_santa'); withHat('victimB', 'elf', 'victimB_elf');
    withHat('victimC', 'antlers', 'victimC_antlers'); withHat('victimD', 'beanie', 'victimD_beanie');
    withHat('victimH', 'tree', 'victimH_tree'); withHat('finalGirl', 'bow', 'finalGirl_bow');

    // Jason Voorhees con machete (mundo 2)
    pixelMap('jason', [
        '............................................AAAA.................',
        '........................................AACDDAJKAA...............',
        '......................................AAOQQRSSALBSA..............',
        '.....................................AEPORRSSSALFSSA.............',
        '.....................................AHPPRSSSSLABSSCA............',
        '.....................................APPRSSSSSSSSSSSBA...........',
        '....................................AIPRRSSBSSSSSSSSAA...........',
        '....................................ANNRSSSSLSSSSSSSA............',
        '...................................AACACRSSSSSSCSSSSSA...........',
        '...................................AJJKBRSSSSSMRRRMSSB...........',
        '...................................AJJKARSSRAASMMMSBAA...........',
        '...................................AAAAARSSAAAASSSBAAA...........',
        '....................................APGQRSSBAMACSQAMBA...........',
        '...................................AAPNRRSSSAAARSSABSA...........',
        '....................................AAPQRSSSSSMSSSSSSA...........',
        '...................................AAADQRBSSSMSSRRSMMA...........',
        '..................................AAGAAORSSSMSSSSSSSA............',
        '...............................AAAADLAAARRSBSSSBSOSSBA...........',
        '............................AAAAEJBBNJAABRRSSSSSSSSDA............',
        '...........................AAANNNJABNLAAACQRRSSCSNSA.............',
        '...........................CCDLNNDAGNNBADBLQRSSHSFAA.............',
        '..........................BLNNINNCINNNKANLABORSSSEAA.............',
        '.........................ANNNNLNNAINNANAAPLLBAAAAAIA.............',
        '.........................ANNNNNENCAABAOAHAPPPBAADHNBAA...........',
        '........................ADGNNNNENKGBNINAILABAIAAGAAGAA...........',
        '........................AGGNNNNNFKNHNNAAQLQQQQIAJNALKA...........',
        '.......................AAKGINNNNCKNINNALQQPPQQQANNALLA...........',
        '.......................AJLGGKNNIAKNLINAOQQQQQQQALNJALAA..........',
        '......................AANLGNHNKBBKNNJNAPQQQQQQQANBIALHAA.........',
        '.....................AANNNLNNKIAALNNILAQQQQQQQQALAGALAAA.........',
        '....................AAGHNNNNNHAAJLNNNDAPQQQQQQQALFBGLA...........',
        '...................AABLFHNNHGAAAKNNNNCBPQQHQQQNANNAJKA...........',
        '...................ACNNKDEJKBAABHLNNNDAQQIHQQQCANIBJKA...........',
        '...................ACNNNLDBFAAAAFJNNNDAQQHHQQQAANCAKJA...........',
        '..................AABJNNNDADAAAAEINNNAAQQIHQQQAANAAHGA...........',
        '..................AADGNNNNKAA.AAFGJNNAAQQQQQQLAANAGGGBA..........',
        '.................AANNINFFKKA..AEEFINNACQQQHQQAAANADDLNLA.........',
        '.................AKNNNNNFFAA..AEFEINNAJQIIHQQAABJAELNLJA.........',
        '.................ANNNNNNNHAA.AAFFJNNNAJPIQIPOAAAIAEEEFGHA........',
        '................ANNHHDFNNNA..AFFINNNJALKQGLQGAABKAAEGKNLA........',
        '................AANNICCGJBA..AFJLNNNBAKQIOPIGBABOIAGLNNNA........',
        '................AFNNNHDEHA..ADFJNNNNGAKQNPKHLLAAOLAHHLLGA........',
        '................AHNNNNGDDA..AFGNNINNNAIPQPIIQQABNNAEGHGGBA.......',
        '................AAAGNNNNA...AHNNILNNDANKJIQQQQAAOAAADFINNA.......',
        '................AOBAAANNA..AANNIHLNNCANLLQQQQPAANBAAGJNNNA.......',
        '...............APQQOLAAAA..ALNJANNNNAAAAQQPAAAABNNAAGGEBAA.......',
        '...............AQQQQQQIBA..AANCANNNNAEEAABAAFGAANNAAAAANNA.......',
        '...............AQKAQQQQAA...AKAANNNNAGJJJEJJJJFANBAAADIQRA.......',
        '................AHFAHQQA....AAFBAJNAAKJJJEJJFFFAAACAANQRRRA......',
        '...............AAAHAHQAA....AHHFAAAACJJHEBABDHJHCAAAFOQFNQA......',
        '..............ABKAAHACA....AAKJIHAAAJKGACACEJJKJJGAAANOBQOA......',
        '..............AOOGAHAA.....ABKKKJHBGKJFAAAEFJKKKKHAAAAIKPEA......',
        '.............AAQJKACA......AIJKKKKKKKIAAADEEGKKKKKBAAACPLA.......',
        '............AAQEJAAAA......AJKKKKKKKKAA.AAEEEEKKKKKAA.AAA........',
        '............ARPNOA........AAJGGKKKKKEA..AABEHEFGKKKAA............',
        '...........AARKQBA........AHJGKKKKKIAA...AAADIJGKKKHAA...........',
        '..........ARRNLDA.........AKJKKKKKKAA.....AACEKKKKKKAA...........',
        '.........AARNONA.........AGKKKKKKJIA.......AAEFKKKKKICA..........',
        '........AARNNOBA.........AJKKKKKJEAA........AEFFKKKKKIA..........',
        '.......AARNNQBA.........AAKKFFKKIEA.........AAFHHKKKKKAA.........',
        '.......AOONOQA.........ADFKGFFKKJAA..........AFIIKKJKKEA.........',
        '.....AAORONOQA.........AKKKFFFIKAA...........AEIJJKEKKEA.........',
        '....AADRROORAA.........AKKKIFFGEB............AAAJJEFJKEA.........',
        '....ALQROMKRA.........AAJKKKKFFBA............AAHIFEHKKDA.........',
        '...AARROOMQAA........AAJJJKKKHHAA............AAIIFGKKJAA.........',
        '..AARPOOMPAA.........AAJJFFFGJAAA.............AAFFKKJEDA.........',
        '..ARMOOLORA.........AAAIJFFFJJBA..............AAFFKKGDDA.........',
        '.AQPMLLMRAA.........AAGIGFFJKAA...............AAFJKKEEDA.........',
        '.AQMMMNRAA.........AAHIHFFJKIA................AAFKKFGHJJA........',
        'AIMMMOOBA..........AKKJIFJJJBAA................AKKIFGIJJA........',
        'AOMOMJAA...........AKKJJHJKGAA.................AJKFFGHGFA........',
        'ARMRAAAA..........AAJKKKKKKDAA................AAHJGGGFFFA........',
        'ARRAA............AADFFKKKKFFA.................AAGJKKKJKKAA.......',
        'AAAA.............AKKJFFKJKFFA.................AJJKKKJHDCAA.......',
        '.................AKKKAAAKKIAA.................AJJHFAAAGIAA.......',
        '.................AAADIIAAAIA..................AJHAAAIIGIIAA......',
        '.................AAFEFFJCAAA..................AAAADFIJIAIDAAAA...',
        '................AAFIJIIGDGA...................AAAEDGGIJJIIJJIAA..',
        '...............AADDDGIIIGGA...................AAEDDECBCDHIJEDAA..',
        '...............AAEDDDHIIAAA...................AAEDEDACFHHHHHHHHA.',
        '..............AAAAAAAAAAAAA...................AAAAAAAAFHHHHHHGFA.',
        '..............AAHHHHHHHBAAA...................AAAAAAAAAAAAAAAAAA.',
        '..............AAHHHHHHHHAA.......................................',
        '..............AAAAAAAAAAA........................................',
        '.................................................................'
    ], [
        0x000000, 0x050404, 0x0a0807, 0x120f0c, 0x171411, 0x1d1916, 0x26211c, 0x302823,
        0x3a3028, 0x3e372f, 0x453d34, 0x4f4639, 0x6b1f20, 0x565141, 0x65584f, 0x7d6551,
        0x89745c, 0x998d7c, 0xd4c9b0
    ]);
    // Jason X: Uber Jason con armadura metálica y machete (nivel en el espacio)
    pixelMap('jasonX', [
        '..................................................................',
        '...........................................AAAAAAAA...............',
        '..........................................AIDNOAMHMBA.............',
        '.........................................ALOIBPPDILOA.............',
        '.........................................EOMHCPONFAOPA............',
        '.........................................IIEMOPGMLLNNA............',
        '........................................AAHMLPPNMMKNNAA...........',
        '........................................JKBGMPMGGKKMKKA...........',
        '........................................ELKBNPPLMJGLMLA...........',
        '........................................AACAMPABBKLKAAA...........',
        '.........................................IHKMPAHFBJAIBA...........',
        '.........................................BHKGOPAALMJBLA...........',
        '.........................................BHGGDMMLLMMIJA...........',
        '........................................AAHKJJKKMMMNLA............',
        '......................................BACDADKLPLMJLFJA............',
        '..............................AAAA..AAAAGDBAJMLLMMMNA.............',
        '............................AFMONAABBFGGFDDBAJLMMDLEA.............',
        '...........................AMNOKLGNNMFABCDDCBACKMMAA..............',
        '..........................ANMMKMNJGGLLNOFCDCCBBAAAADA.............',
        '..........................ANLNOONPNBCCBEOOBDDCBBBBACDAA...........',
        '..........................GLLGGPONNAIHCCDLOBEECCBCCBD.AA..........',
        '..........................EJAKLKLJDHHMPNGBLMACDDDDCACF.A..........',
        '..........................ABHAMMOLHHGLLLFFCLNLFDE.DCD...A.........',
        '.........................ABDIHABAFHLJLOOOOMLLBAJD.EE..DEB.........',
        '........................AABBHHF.AFANNNMLNOPOMMKAAEEEE.CDB.........',
        '.......................AAPFIHHH.A.ALJONNMLJMOFNFDEEEE.CCB.........',
        '.......................APNGHHIH....AMLKKKNOKLOBEDDEEE.BAB.........',
        '......................ADONMDIIHA...AKJGLLLLNMDNGADEDDEABA.........',
        '......................AMLMOKCIFAB.JGAKLNNNNGBAIAACDDDDABB.........',
        '......................AKPOKLCHAABGLONABCCCBAIEAACBCCBAABBA........',
        '......................AAKGNEHJLACJLLDLKAABAIABOKABBBDABBCA........',
        '.....................AFANLJFHNAAAFECOKIMONNBCNBFECBCDABCDB........',
        '...................ACEBIFGDHMEA.BFJLKMLJLLLMNJFABDCDAABCCAA.......',
        '...................AOMBHHHILBA..ADEFOMEGPMMDGGABDDDDAABACDA.......',
        '..................AAMOKAHHHCA....EKLKDOKJKENJACHBDDBABAACFBA......',
        '..................APPPNGHHHA.....AEDEKJGPNJLONBADDEAAABDCDFA......',
        '.................AOMPNNLFHH......AKKLMKJONNBEBHCDDDAABABCDFAA.....',
        '.................ALKJJMMHH.......AAEKLMLMJJIEMABDDDAAAAACDDEA.....',
        '................AALDELGMHHA......AFAACMOMNMDGAHAEDEA.ABBBCDEA.....',
        '.................DMDHFMLHHA......FHBDALOJKHANBBBDDDA.AAABCCDBA....',
        '................ALLBMHGHHGA.....AGHEAAEMMKBHCBCBDDDA...AAACEFA....',
        '................BNJBOGHHGA......BMBACIIADFBIFACCDDDA....ABABDFA...',
        '................GNJHJLHHA.......AAANNAHIHAAABAADDDEAA...AACDFFDA..',
        '................GNLHDNHBB.......ADECAMCBCAHCNBACDDEDA...AACDAAAA..',
        '................GJMHBNFA........A.DDCAMOMONEKAIADDEFA....ACAADGA..',
        '................AKKHBMB........AD..DDCBBNMKCALBDDDDFFA....ADFEFGB.',
        '................EOPMJKA........A.....DCCCCCCCCDCCDAMKBA...ADGACEE.',
        '................BBABOJ........AC....DDDDDDCCDCCADAMGGKA...AAGAADE.',
        '................CKLJEA........A....EDDCDCCCCDCACAMMOKMA....AEAAAE.',
        '...............BLMNKAA........A...EDDCDDDCCCBABABMGNPNAA...AAADFA.',
        '...............KLKLKEA.......AC...DDDCDDDCCAABBFNNLGLLGA....ADEB..',
        '..............AGMIIIAH.......A...EDCDDDDCBABBAJGLKNJJFMD..........',
        '.............AAFFAIBCC......AA...DCDDDDCBAAACCDDEKNMJONK..........',
        '.............ANGHAJBKA......A....DCDDDDBB..ADDDFJJLNLJMK..........',
        '.............AALEBALAA......A....CCDDDCBA..AAECGKJKMMGLKA.........',
        '............ANCGALAAA.......A...DDCDDCBA....AAEELLGLNLLKE.........',
        '..........ADMKKJAA.........AD..EDDDCDBA......ABDLMGGLMJKG.........',
        '.........AMLKLLEA..........A...CDDDDBAA.......AEGMGEKLMKKA........',
        '........APKKKNAB...........A...DCDDDBA.........AEMFEKKNJJA........',
        '........FLKKNA.................FDDCCA..........ACJJEGJNJLA........',
        '......ABMKKNOA............ADD...DDCBA...........AFPNJANKLA........',
        '.....AMNLLMLA............ABECD..DCBAB...........ACIGEIHHJA........',
        '....ANLLKKNA.............A.CCCDDCBAB.............AIHFIIIHB........',
        '...AOKKKINA..............A.CCCCCCBA..............AHIIIIBGMA.......',
        '..AOIKKHMB..............ABEDCCDBBA...............ABAABBOLJA.......',
        '.AOKHKHLFB..............A..DCCBBBA..............AMJPOIBAGB........',
        'AMHHHJLJA..............A...DCBBBCA..............ALNNOMKABA........',
        'ALHJHIHB..............AA..DCBBBCCA..............AIECDLLACA........',
        'AMHIHLA...............AE..CBBBBCCA..............ALLPODLJCA........',
        'OLII.A................A..DCBBBCCA...............AGJGLHKKB.........',
        'LLK...................B..CBBBCCBA................GGKJKKKE.........',
        'AA...................A..DBBBCDBA.................DJKJLMJKA........',
        '.....................A.DECCCCCA..................CKKJLMJJ.........',
        '.....................ADBCCDBCAA..................CLJGLMJJ.........',
        '....................ADDFCBBCCA...................DFJGLMKK.........',
        '....................AECBBBCDB.....................AMKKINLA........',
        '....................BADDBACCA.....................AIFFIAB.........',
        '....................ACECBBAA.....................CAAAAABGA........',
        '....................AGDBCCAA.....................ANFBABMKKA.......',
        '...................AAFFFDCA......................ALJIFBPLGGAA.....',
        '...................AGFBAAAA.......................FJHFANNELLDBB...',
        '..................AEGJJKJG........................CECCBEGNLOJDFCA.',
        '..................AFFDCCCDD..........................AABELGKDCCDB.',
        '..................AAAAAAAAA.......................AAAAAAAAAAAAAAA.',
        '..................................................................'
    ], [
        0x000000, 0x050403, 0x0b0908, 0x100d0c, 0x191613, 0x231c18, 0x2a2724, 0x412519,
        0x5d3b2a, 0x393531, 0x45413c, 0x544f4a, 0x666059, 0x7a756d, 0x948d83, 0xb4afa4
    ]);
    // Cabeza de la madre de Jason: aparece para marcar el camino (habilidad del mundo 2)
    const MOM_MAP = [
        '..................A.AA.................',
        '............AAA..AKARAAA.A.............',
        '...........AAAPBAAROOMAAANAA...........',
        '..........BHAAKQNRKRPKKPPBAOA..........',
        '.........CABPNAMRQPOQQMRORBAAA.........',
        '......AAAAQPPROQROQQQMRQRNNQCBA........',
        '.....ANNNPONQQRRNQQQMQRQPRRRQNNEA......',
        '......AAKPPQQRRRNMPMPRQQRRRRRRKAOA.....',
        '..A.AAONQKQQRNPQKOQPQOQRQRRQORQKA......',
        '..CAAOQQQQNNPOPMPMNQKMPQRNRRRPNNAAA....',
        '..AOOBHMMRRRRPMOKDOKKPFONPPPPRROPQOA...',
        '...AAMPQOQRONMHPCEGGPJIFFDNNORPRMAA....',
        '.AANMQQQRQNMOMCDFIJGJJJJLICMMNRNRNAA...',
        'AMNAMMMRQPNKMCFFIIJLIJJJJLJCHNQRORCAB..',
        'AAAAHMNOQMNQMEGFJIGJJJJLJJGCOMMQRMQAOA.',
        '..AAONMMQMPMDFIIIJJFILJLJJLIKQQMQQKBAOA',
        '.AOMMNMQQPMCDFIIIJJJFJIJLLJIBMPRMQAOAA.',
        'AKAKPKQMNMBEEFJFIJJJIGILJLIJGMQMRNNA...',
        'AAAPNKKQOHBEEGIGFIIJJJJILLLJIMMRRNOPA..',
        '.APAKNKQMKCEEGGBBBDDJIIICBCJGMNNOKAANA.',
        '.APAHMQQMDEDEFBFHLEFJIGDHMMDJMNNRHMAD..',
        '..A.BMQMMHEFEFBGHHCEEJJDHLHBIHNQPKA....',
        '...AMMNHMBFFFLDFLKFEIJLDLHHDGHMNNOA....',
        '...DAMMHHAFEFGLFHJGIGJILFHHJEAHOOANB...',
        '...AAKMHHBDEGJFLJJIFFILIJHJIFAHQHAAA...',
        '...ANAKKHBEEDFJGJIIGGGLJIJLFDHHQA......',
        '....DAHMMHCDEIFJJJFGBEEGJJGJACKNOA.....',
        '......AMHHAEEEIJIIIFFFEFJIJFAHMDAA.....',
        '......CAKMHADEFIDGIIIJJJJGFEHHHA.......',
        '.....ANAAKEHDDDFIFFFEEILIJGBHMNA.......',
        '......A.AKHADFEIIFDBCCCCGFDAHAB........',
        '........DAHADEDIDGJLLNNLJGDEA.A........',
        '........AABADEFEGIFEFFFGGEAHA..........',
        '.........A.ADCFDGEFDDDDFIB.A...........',
        '...........ADCEFDGIFEFGGFA.............',
        '............BDBECFGIEJEGE..............',
        '.............AADCFDGEEGEA..............',
        '...............ADCEE..AA...............',
        '.................A..AA.................',
        '.......................................'
    ];
    const MOM_PAL = [
        0x020101, 0x090403, 0x1c100b, 0x2d1b11, 0x442819, 0x55311e, 0x673e26, 0x594d44,
        0x74462b, 0x8a593a, 0x72675f, 0x9a7054, 0x8b8075, 0x988d82, 0xa69b91, 0xb4a99e,
        0xbbb1a6, 0xd6cdc3
    ];
    mk('momHead', MOM_MAP[0].length * 2, MOM_MAP.length * 2, g => MOM_MAP.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === '.') return;
        g.fillStyle(MOM_PAL[PAL_KEYS.indexOf(ch)]); g.fillRect(x * 2, y * 2, 2, 2);
    })));

    // ---------- Escenario: local de comida rápida con baño sucio ----------
    const OLF = 0x140a0c;
    // Piso de damero de diner, gastado
    // Cada casilla del tablero es UNA baldosa (con su junta), para que se lea bien la cuadrícula
    const tile = (g, base, grout) => {
        g.fillStyle(grout); g.fillRect(0, 0, T, T);
        g.fillStyle(base); g.fillRect(3, 3, T - 6, T - 6);
        g.fillStyle(0xffffff, 0.06); g.fillRect(3, 3, T - 6, 3);
        g.fillStyle(0x000000, 0.18); g.fillRect(3, T - 6, T - 6, 3);
    };
    // Piso de diner: damero de una baldosa por casilla, gastado
    const diner = (key, base, spots) => mk(key, T, T, g => {
        tile(g, base, 0x140a0c);
        g.fillStyle(0x2a1a10, 0.3); spots.forEach(([x, y, r]) => g.fillCircle(x, y, r));
    });
    diner('ffFloorA', 0x2a0a0e, [[44, 20, 7], [16, 48, 4]]);
    diner('ffFloorB', 0x37322a, [[20, 42, 6], [48, 16, 3], [42, 50, 3]]);
    // Piso de cocina: una plancha metálica por casilla
    mk('ffKitchen', T, T, g => {
        tile(g, 0x262a30, 0x0e1012);
        g.lineStyle(2, 0x363c44);
        for (let y = 10; y < T - 6; y += 12) for (let x = (y / 12) % 2 ? 8 : 14; x < T - 10; x += 12) g.lineBetween(x, y + 3, x + 5, y - 2);
        g.fillStyle(0x6a4a14, 0.25); g.fillEllipse(40, 44, 22, 12);
        g.fillStyle(0x9aa2aa); [[7, 7], [T - 7, 7], [7, T - 7], [T - 7, T - 7]].forEach(([x, y]) => g.fillCircle(x, y, 1.5));
    });
    // Piso de baño: una baldosa grande por casilla, con mugre y grietas
    const bath = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x14170f);
        g.fillStyle(0x4a3a12, 0.35); g.fillEllipse(22 + seed * 6, 40 - seed * 4, 24, 12); g.fillCircle(46 - seed * 4, 18 + seed * 5, 4);
        g.lineStyle(1, 0x1e221a, 0.8); g.lineBetween(30, 8 + seed * 3, 38, 22); g.lineBetween(38, 22, 34, 32);
    });
    bath('bathFloorA', 0x343b2e, 0); bath('bathFloorB', 0x2a3025, 3);

    // Pared de baño: azulejos manchados, grieta y grafiti
    const bathWall = (g) => {
        g.fillStyle(0x2a2d26); g.fillRect(0, 0, T, T);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
            g.fillStyle((i + j) % 3 ? 0xb4baa9 : 0xa6ad9a); g.fillRect(i * 16 + 1, j * 16 + 1, 14, 14);
        }
        g.fillStyle(0x5a4a1a, 0.18); g.fillRect(0, 44, T, 20);
        g.fillStyle(0x5a4a1a, 0.25); g.fillRect(6, 24, 6, 20); g.fillRect(44, 30, 4, 14);
        g.lineStyle(2, 0x1a1c16); g.lineBetween(8, 0, 16, 14); g.lineBetween(16, 14, 12, 26); g.lineBetween(12, 26, 22, 38);
        g.fillStyle(0x000000, 0.35); g.fillRect(0, T - 6, T, 6);
        g.lineStyle(2, OLF); g.strokeRect(1, 1, T - 2, T - 2);
    };
    mk('bathWall', T, T, g => bathWall(g));
    // Inodoro sucio contra la pared inferior
    mk('bathToilet', T, T, g => {
        g.fillStyle(0x000000, 0.3); g.fillEllipse(32, 34, 46, 44);
        g.fillStyle(0xd2d2c2); g.fillRoundedRect(12, 46, 40, 16, 4); g.lineStyle(3, OLF); g.strokeRoundedRect(12, 46, 40, 16, 4);
        g.fillStyle(0xd2d2c2); g.fillEllipse(32, 28, 34, 40); g.lineStyle(3, OLF); g.strokeEllipse(32, 28, 34, 40);
        g.fillStyle(0xb8b8a6); g.fillEllipse(32, 28, 26, 32);
        g.fillStyle(0x6a6a34); g.fillEllipse(32, 26, 18, 22);
        g.fillStyle(0x4a3a12, 0.6); g.fillEllipse(30, 30, 10, 8); g.fillCircle(42, 16, 3); g.fillCircle(20, 40, 2.5);
        g.fillStyle(0x8a8a5a, 0.6); g.fillRect(16, 50, 32, 3);
        g.fillStyle(0xffffff, 0.6); g.fillRect(16, 48, 10, 2);
    });
    // Lavamanos roto con grifo goteando
    mk('bathSink', T, T, g => {
        g.fillStyle(0x4a4d44); g.fillRect(4, 20, 56, 42); g.lineStyle(3, OLF); g.strokeRect(4, 20, 56, 42);
        g.fillStyle(0xcfd2c4); g.fillEllipse(32, 38, 38, 24); g.lineStyle(3, OLF); g.strokeEllipse(32, 38, 38, 24);
        g.fillStyle(0x7a8070); g.fillEllipse(32, 40, 26, 14);
        g.fillStyle(0x4a3a12, 0.6); g.fillCircle(32, 40, 3); g.fillEllipse(24, 36, 8, 4);
        g.fillStyle(0x9aa2aa); g.fillRect(29, 50, 6, 10); g.fillCircle(32, 50, 4); g.lineStyle(2, OLF); g.strokeRect(29, 50, 6, 10);
        g.fillStyle(0x7fc8ff, 0.8); g.fillCircle(32, 45, 2);
        g.lineStyle(2, 0x1a1c16); g.lineBetween(46, 22, 52, 34); g.lineBetween(52, 34, 48, 44);
        g.fillStyle(0x0d0d0d); g.fillEllipse(12, 28, 5, 3);
    });
    // Máquina de refrescos contra la pared superior
    mk('ffSoda', T, T, g => {
        g.fillStyle(0x000000, 0.3); g.fillRect(8, 8, 52, 54);
        g.fillStyle(0x23262e); g.fillRect(6, 2, 52, 52); g.lineStyle(3, OLF); g.strokeRect(6, 2, 52, 52);
        g.fillStyle(0xb3123a); g.fillRect(10, 6, 44, 18);
        g.lineStyle(3, 0xf0e6e6); g.beginPath(); g.moveTo(14, 18); g.lineTo(22, 12); g.lineTo(32, 18); g.lineTo(42, 12); g.lineTo(50, 18); g.strokePath();
        g.fillStyle(0x9aa2aa); [18, 32, 46].forEach(x => g.fillRect(x - 3, 28, 6, 8));
        g.fillStyle(0x121418); g.fillRect(10, 40, 44, 10);
        g.lineStyle(1, 0x5a626c); for (let x = 12; x < 54; x += 5) g.lineBetween(x, 41, x, 49);
        g.fillStyle(0x3a1a08, 0.7); g.fillEllipse(30, 58, 22, 7);
    });
    // Freidora con aceite viejo
    mk('ffFryer', T, T, g => {
        g.fillStyle(0xff2a1a, 0.35); g.fillRoundedRect(0, 0, T, T, 8);
        g.fillStyle(0x000000, 0.4); g.fillRect(7, 9, 54, 54);
        g.fillStyle(0xb8c2cc); g.fillRect(4, 4, 56, 56);
        g.fillStyle(0xe6edf2); g.fillRect(4, 4, 56, 5);
        g.lineStyle(3, OLF); g.strokeRect(4, 4, 56, 56);
        [[9, 11], [34, 11]].forEach(([x, y]) => {
            g.fillStyle(0x1a1c20); g.fillRect(x, y, 21, 30);
            g.fillStyle(0xc2410c); g.fillRect(x + 2, y + 2, 17, 26);
            g.fillStyle(0xff6a1a); g.fillRect(x + 4, y + 5, 13, 18);
            g.fillStyle(0xffb38a); [[6, 8], [12, 15], [8, 21], [14, 6]].forEach(([dx, dy]) => g.fillCircle(x + dx, y + dy, 1.8));
            g.lineStyle(2, OLF); g.strokeRect(x, y, 21, 30);
        });
        for (let i = 0; i < 7; i++) { g.fillStyle(i % 2 ? 0x0d0d0d : 0xff1f3d); g.fillRect(6 + i * 7.7, 45, 7.7, 7); }
        g.lineStyle(2, OLF); g.strokeRect(6, 45, 52, 7);
        g.fillStyle(0x1a1a1a); g.fillRect(16, 53, 8, 6); g.fillRect(41, 53, 8, 6);
        g.fillStyle(0xffffff, 0.5); g.fillCircle(18, 6, 4); g.fillCircle(24, 3, 3); g.fillCircle(44, 5, 4); g.fillCircle(50, 2, 2.5);
    });
    // Mostrador del local (con o sin caja registradora)
    const counter = (g) => {
        g.fillStyle(0x000000, 0.3); g.fillRect(6, 8, 56, 56);
        g.fillStyle(0x9aa2aa); g.fillRect(2, 2, 60, 60);
        g.fillStyle(0x7a141c); g.fillRect(6, 6, 52, 52);
        g.fillStyle(0xffffff, 0.08); g.fillRect(6, 6, 52, 6);
        g.lineStyle(3, OLF); g.strokeRect(2, 2, 60, 60);
    };
    mk('ffCounter', T, T, g => {
        counter(g);
        g.fillStyle(0x5a3a22); g.fillRect(12, 14, 26, 20); g.lineStyle(2, OLF); g.strokeRect(12, 14, 26, 20);
        g.fillStyle(0xd8d0c0); g.fillRect(16, 18, 12, 8);
        g.fillStyle(0x9aa2aa); g.fillRect(42, 14, 10, 14); g.lineStyle(2, OLF); g.strokeRect(42, 14, 10, 14);
        g.fillStyle(0xc2172f); g.fillRoundedRect(42, 36, 8, 16, 3); g.fillStyle(0xf0f0f0); g.fillRect(44, 33, 4, 4);
        g.fillStyle(0x2a1208, 0.5); g.fillEllipse(24, 46, 16, 6);
    });
    mk('ffRegister', T, T, g => {
        counter(g);
        g.fillStyle(0x3a3f46); g.fillRect(14, 12, 36, 30); g.lineStyle(2, OLF); g.strokeRect(14, 12, 36, 30);
        g.fillStyle(0x2f7a44); g.fillRect(18, 15, 28, 9);
        g.fillStyle(0x9aa2aa); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillRect(19 + i * 7, 28 + j * 6, 5, 4);
        g.fillStyle(0xe8e2d4); g.fillRect(40, 42, 8, 14);
    });
    // Mesa con sillas, bandeja y comida abandonada
    mk('ffTable', T, T, g => {
        g.fillStyle(0x7a141c); g.fillRoundedRect(18, 0, 28, 12, 4); g.fillRoundedRect(18, 52, 28, 12, 4);
        g.lineStyle(2, OLF); g.strokeRoundedRect(18, 0, 28, 12, 4); g.strokeRoundedRect(18, 52, 28, 12, 4);
        g.fillStyle(0x000000, 0.35); g.fillCircle(34, 35, 21);
        g.fillStyle(0xcfc8b8); g.fillCircle(32, 32, 21); g.lineStyle(3, OLF); g.strokeCircle(32, 32, 21);
        g.fillStyle(0x8a2a1a); g.fillRect(20, 22, 24, 18);
        g.fillStyle(0xa8682a); g.fillCircle(27, 30, 6); g.fillStyle(0x4a2410); g.fillRect(21, 30, 12, 2);
        g.fillStyle(0xb3123a); g.fillRect(35, 26, 8, 10);
        g.fillStyle(0xd8b46a); [36, 38, 40, 42].forEach(x => g.fillRect(x, 22, 1.5, 5));
        g.fillStyle(0x2a1208, 0.4); g.fillEllipse(40, 44, 10, 4);
    });
    // Basurero desbordado con moscas
    mk('ffTrash', T, T, g => {
        g.fillStyle(0x3a2a10, 0.45); g.fillEllipse(34, 56, 50, 14);
        g.fillStyle(0x30353c); g.fillRoundedRect(12, 10, 40, 46, 5); g.lineStyle(3, OLF); g.strokeRoundedRect(12, 10, 40, 46, 5);
        g.fillStyle(0x23262e); g.fillRect(16, 14, 32, 10); g.fillStyle(0x0a0a0a); g.fillRect(20, 18, 24, 3);
        g.fillStyle(0xe8e2d4); g.fillRect(14, 4, 9, 11); g.fillStyle(0xb3123a); g.fillRect(14, 7, 9, 3);
        g.fillStyle(0x8a5a2a); g.fillRect(36, 2, 12, 9);
        g.fillStyle(0xd8d0c0); g.fillTriangle(24, 8, 34, 2, 32, 12);
        g.fillStyle(0xb3123a); g.fillRect(50, 46, 8, 10); g.fillStyle(0xe8e2d4); g.fillRect(50, 44, 8, 3);
        g.fillStyle(0x000000); [[8, 10], [56, 20], [30, 0], [4, 30]].forEach(([x, y]) => g.fillCircle(x, y, 1.6));
    });
    // Sillón de reservado con el tapiz rasgado
    mk('ffBooth', T, T, g => {
        g.fillStyle(0x000000, 0.3); g.fillRect(10, 2, 54, 62);
        g.fillStyle(0x4a0a12); g.fillRect(44, 0, 18, T); g.lineStyle(3, OLF); g.strokeRect(44, 0, 18, T);
        g.fillStyle(0x8e1622); g.fillRect(8, 2, 38, 60); g.lineStyle(3, OLF); g.strokeRect(8, 2, 38, 60);
        g.lineStyle(2, 0x5a0a12); g.lineBetween(10, 22, 44, 22); g.lineBetween(10, 42, 44, 42);
        g.fillStyle(0xd8cfae); g.fillEllipse(24, 32, 14, 8); g.lineStyle(2, OLF); g.strokeEllipse(24, 32, 14, 8);
        g.fillStyle(0x8a8a8a, 0.9); g.fillRect(30, 48, 12, 5);
        g.fillStyle(0xffffff, 0.08); g.fillRect(10, 4, 34, 4);
    });
    // Balde con trapeador y letrero rojo de piso mojado
    mk('ffMop', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillEllipse(30, 50, 44, 18);
        g.fillStyle(0x2f5a8a); g.fillRoundedRect(8, 28, 34, 28, 5); g.lineStyle(3, OLF); g.strokeRoundedRect(8, 28, 34, 28, 5);
        g.fillStyle(0x3a4a34); g.fillEllipse(25, 32, 28, 9);
        g.fillStyle(0x5a6a72); g.fillRect(12, 22, 26, 7); g.lineStyle(2, OLF); g.strokeRect(12, 22, 26, 7);
        g.fillStyle(0xd8cfae); g.fillEllipse(27, 34, 14, 7);
        g.lineStyle(4, 0x7a5232); g.lineBetween(27, 34, 18, 4);
        g.fillStyle(0xc2172f); g.fillTriangle(40, 58, 60, 58, 50, 20); g.lineStyle(3, OLF); g.strokeTriangle(40, 58, 60, 58, 50, 20);
        g.fillStyle(0xf0f0f0); g.fillCircle(50, 36, 2.5); g.fillRect(49, 39, 2, 8); g.lineStyle(2, 0xf0f0f0); g.lineBetween(50, 47, 46, 53);
        g.fillRect(44, 52, 12, 2);
    });
    // Estación de aderezos: servilletas, popotes y bombas de salsa
    mk('ffCondiments', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(6, 10, 56, 54);
        g.fillStyle(0x9aa2aa); g.fillRect(3, 4, 58, 56); g.fillStyle(0x7a141c); g.fillRect(7, 8, 50, 48);
        g.lineStyle(3, OLF); g.strokeRect(3, 4, 58, 56);
        g.fillStyle(0xd8d0c0); g.fillRect(11, 12, 14, 18); g.lineStyle(2, OLF); g.strokeRect(11, 12, 14, 18);
        g.fillStyle(0xf0f0f0); g.fillRect(13, 14, 10, 4);
        g.fillStyle(0xb8c2cc); g.fillRect(30, 12, 10, 18); g.lineStyle(2, OLF); g.strokeRect(30, 12, 10, 18);
        g.lineStyle(2, 0xc2172f); [32, 35, 38].forEach(x => g.lineBetween(x, 12, x - 1, 4));
        [[47, 0xc2172f], [47, 0xf0f0f0]].forEach(([x, c], i) => {
            const y = 14 + i * 20;
            g.fillStyle(c); g.fillRoundedRect(x - 6, y, 12, 16, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(x - 6, y, 12, 16, 3);
            g.fillStyle(0x23262e); g.fillRect(x - 2, y - 4, 4, 5);
        });
        g.fillStyle(0x0d0d0d); g.fillRect(12, 40, 22, 10); g.fillStyle(0x2a1208, 0.6); g.fillEllipse(24, 52, 14, 4);
    });
    // ---------- Escenario: parque infantil de noche con el food truck "Clown Cafe" ----------
    // Pasto oscuro, una mata por casilla
    const grass = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x0a1008);
        g.lineStyle(2, 0x2c4224);
        for (let i = 0; i < 9; i++) {
            const x = 8 + ((i * 23 + seed * 11) % 48), y = 10 + ((i * 37 + seed * 7) % 44);
            g.lineBetween(x, y, x - 2, y - 5); g.lineBetween(x + 3, y, x + 4, y - 4);
        }
    });
    grass('parkGrassA', 0x182414, 0); grass('parkGrassB', 0x1d2b18, 5);
    // Losa de concreto donde se estaciona el food truck
    const slab = (key, base) => mk(key, T, T, g => {
        tile(g, base, 0x0c0c0e);
        g.lineStyle(1, 0x0c0c0e, 0.8); g.lineBetween(14, 50, 26, 40); g.lineBetween(26, 40, 24, 30);
        g.fillStyle(0x000000, 0.25); g.fillEllipse(44, 18, 14, 8);
    });
    slab('parkSlabA', 0x2a2a2e); slab('parkSlabB', 0x242428);

    // Food truck "Clown Cafe" (convertido de la imagen de referencia, ocupa 2 casillas)
    const TRUCK_MAP = [
        '.............................................................................BBA............................................',
        '...................................................................B..BJMMJAGYYMF...........................................',
        '.............................................................BC...CMICBYWYYIGZYYDA..........................................',
        '.........................................CCCCC.......BBBB...CMYGBAGYYSJSZWWYJZWYF...........................................',
        '...........ADGIGIGFDDDDDDDDDDDDDDDDDDGGGGGGGGGFFFFFCIYYYYMFDSYWYJCSWYYSGZZZWYWZYFCGCAAAAAA..................................',
        '..........BGIGFEHKLPPPPPPPPPPPPPPPPPOLKKKKKKKEDDDDDMZYYWYYYIIYZZYSYZZYJGZWZWZWWYFCGGGGGGGIGDDDDDDDDDC.......................',
        '.........CIIFHLPRVVVVVVVVVVWWWWWWWVPPPPPRKKKKJGKNHIZWWZZWZYMGGYZWWWWWLGIZZZZZZZYDBEEEEEEEEFFFFFFFFGGGGFFFGFBBB..............',
        '........AGIGHOOOOOOOOOOOOOOQRRRRRLKJMMMJHFYZWWJHPCYZZZYIYZZWJIFMZZZZWCIFSZZMMZYYFKRRRRRRPNKKKKKKKKHCDCDDDGGGGGDDCA..........',
        '.......ACIGENQQQQQQQQOOOOOOOOOOOKIYYYYYYSISZZYMENCYZWZJGGZZWJIIGMWWWJGIGSZZMFWYSFKRVVVVVVVRRVVVVVRPNLLLLLHEEEFFGGGBB........',
        '.......AIGDLWWWWWWWWWVVVVVVVVRRLGYYZZZZZMGIZZWSFLCYZZZSGJZZWJIIIFJZYGIIIJMJGBDDDCKOOOOOOOOOOQQQQPPQQQQQQQQPONKKECGIGC.......',
        '......AGIFHWWWWWWWWWWWWWWWWWWWVFSZZZSGISFIGZZZWIHDGZZZYYWZZYGIIIIFGFJMMMJMIBKHHHKNOOOQQQQQOOOOOOOOOOOOOOOOOOOOONLHDGGD......',
        '......AGGENQQQQQQQQQQRRRRRRRRQNCSZZZFGGFIIIMZZYYYSMIYZZZWZZJGIIIMYGFYYYWWYMEPPPPRVVVVVVVVVRPPPPRRVVVRRRRRRRRRRQOONKCGGC.....',
        '......GIFKOOOOOOOOOOOOOOOOOOOONCSZYZJIIIJIIJZZZYYYYGFJYYYMGIJMYWYYMFYWZYLLIEPVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLEGGA....',
        '.....CIGDPVVVVVVVVRQQQQQQQQQQQNCMZZZYMJSYSJGYZZZZZYGIGGIMIIGZYWZWMGCYZWYYMDKOQQQQQQQQQQQQQQQQQQQPPOPVVVVVVVVVVVVVVVVLEGF....',
        '....ADIFKWWWWWWWWWWWWWWWWWWWWWVHFMZZZWWYZYYFJMJGBCFGISZWYYJFMZZWMMSDYWZWYYDKOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOQOHGGA...',
        '....BIGCNRRRRRRRRRRRRWWWWWWWWWVNEFMYZZZZWSGMYYYYYJIIGSZWZWYIGWZWYYWJYZZMGGDKVVVVVVRRRRRRRRRRRRRRRRPPOOPPQQOOOOOOOOOOOLBGFA..',
        '....CIFHOOOOOOOOOOOOOOOOOOOOOOOOLEDFJJJJGDMWWZZZYIIIJWZZYZYMDMZWZYJCYZWYYYIKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVPBGGA..',
        '...AIGDLRRVQQQQQQQQQQQQQQQQOOOOOONKECCCDCJZZZYIMJGIIJZWZJYZYMDYZWSFDYWZZZWIKOOOOOOOOPRRRRRRRRRRRRRRRRRRRRRRRVVVVVVVVVVLCGD..',
        '...BIFHPWWWWWWWWWWWWWWWWWWVVVVVVVRRPLLLLCMZZZIGGGIIIMZZZWWZZYMIYZWGFFFGFFFCKOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOPPPPPPPPPPNCGF..',
        '..AGIFLRRRRRRVWWWWWWWWWWWWWWWWWWWWWWVVWVCMZYZJIIMMIFZZZYHDJWWSIMJGBKHHHHHHKNRVVVVRPPPPPPPPPPPPPPPQOOOOOOOOOOOOOOOOOOOONEFFA.',
        '..BGGDLOOOOOOOQQQQQQQQQQQQQQORRRRRRRRRRPDGYZZYYYYYSGZWZMDEDMGDEDDHLPPPPPPPPVVVVVVVVVVVVVVVVVVVVVVVRRRRRRRRRRRRRRRRRRRPPLDGC.',
        '..FIGHOQRRQOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKFIYZZWWZWMGMMMFELECEKLKLNOOOQQQQPPPPPPPPPPPPPVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLDGC.',
        '.AFGFKVVVVVVVVVVVVVVVVVVVRQQQQQQQQQQQQQQPKFFJYYYSICECDDENONNNOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOPPPPPPPPPPPPPPPPPPPLEGC.',
        '.CIGDLVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVRLDDCBCCEKPLKLNRVVVVVVVRRRRRRRRRRRRRRRQQQQOQPQPQQQOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKDGB',
        '.DIGEOOOOOOOOOPRRRRRRRRRRRRRRRRRRRVVVVVVVVVRNLLHHKLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLPVVVVVVVVVVRRRRRRRRRRRRRRRRPPPPPPPKDGB',
        'AFIGEOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOCGFFFFDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCLVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVLDGB',
        'BIGDKVVVVVRQQQQQQQQQQQQQQQQLLLLLLLLLLLLLLLOOOOODFCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCBLOOOOOOPPPPPPPPRRRRRRPPPPPPPPRVVVVLDGB',
        'BIGCNVVWWVPVWVPPPPPPPPVVVPVISSSSSSSSSSSSSINRRRRDCDIJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJDBBBLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOKDGB',
        'CLLEITUXTMDSUUSIDFDFISUXSCMGSMSSSSSSSSSMMJSYLLLCCISTTTTTTTSSSSSSSSSSSSSSSSSSSSSSSSGFCCNRRRRRRRRRRPPPPPPPPPPPPPPPPPPPPPPOKFGB',
        'EVQKSUTJFFFFGJUUTJJUUUJIDFDFSTXXXXXXXXXUSIMTTMICCISTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIIDCGHIMTXXMJHHHHHHJSXXMJHHHHHHJSXXMJHDEHB',
        'ERQKSMDDFFFFFFDJXXXXJDDFFFDFSTXTUUUTUXXUSICDMSTFDISTTTTTTTTTTTTTTTTUUUTTTTTTTTTTTTIIDCDMTXXXXXUSFDCJSXXXXXUSGCDJSXXXXXUSBLQE',
        'EVQKMUXSJFFFJMXUTGGTUXMJFFDFSTXUUUUXXXXUSJCDJSUGCITTUUUUUUUUUUUUUUTTTTTTTTTTTTTTTTIICBSUXXXXXXXXTIMUXXXXXXXXTIMUXXXXXXXXJLQE',
        'EVQKBGMTXSMTUUMIDFDDIMTUSIMGSTXUUUUXXXUUSJJTXSIBDISTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIIDCCIMXXXXXSJDDDGMUXXXXTMFCCIMUXXXXTJALQE',
        'ERQKCDFJSXXXSJDDFFFFFFGMXXXISTXXXUXXXUXUSISJDDDCDISTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIIDCCDDFMTSFCDDDDDCDJTTGDDDDDDCDITTIDCBLQE',
        'ERQKDSUXSJDJUXTJDFDDJTXUMFJGMTXUXXXXXXXUSISTICDCDISTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIIDCCDDCJSSCDDDDDDDDISSFDDDDDDDDGSSFCCBLQE',
        'ERQKSUSGFDDFFGTTUMMUTTIFFFDFSTXUUUUXXXXUSIGTUUJCDITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGDCCIMXXXXXSJDCDGJUXXXXTJFDDGJUXXXXTJALQE',
        'ERQKJMDDDFDDDFDMXUXXMCDDFFDFSTXXXXXXXXUUSICDIMTGDITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGCCSUXXXXXXXXTIMUXXXXXXXXTIMUXXXXXXXTENQE',
        'EQQKGUUSIDDDISUUSGGSTUMIDDDFMTXTTTUXXUXUSICIMUUFDISTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGDCGMUXXXXXUTJFGMUXXXXXXTIFGMTXXXXXXSKQK.',
        'CLQOBFJSXTSTXSJDFFFDDMSXTMSGMTXXXXXXXXXUSIMXTMFCDITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGDCCCCMTXUMGDDDDDCJTXXSICDDDCCJTXXSJBKQK.',
        '.KRQBDGJTXTUSJDDFFFFFDISXTXISTXXXXXXXXXUSISMGDDCDITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGDCCCDCIMJCDDDDDDDDGMMDDDDDDDDCFMJFCBKQK.',
        '.KRQCIUXSIDITXSJDFFDJSXTMDIGSTXXXXXXXXXUMIMXTMCCFITTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTIGDCCCGSUXXSJCDDDCCSTXXSMCDDDDCSTXXTJBKQK.',
        '.HPQNIMFDDDDFGSTUMMUTSIFFFDDSMSSSSSSSSSSSICGMTTDCCIMSSSSSSSSSSSSSSSSSSSSSSSSSSSSMMGDCBITXXXXXXXUMGISUXXXXXXUMGISUXXXXXXHNNC.',
        '..LQNBFFFFFFFFGSXXXXMDDFFFDCIIIIIIIIIIIIIDCDFMUFIMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMJGJTXXXXXXXXMGJTXXXXXXXXMGITXXXXXXXHOL..',
        '..LQOESSJDFFJTXTMGFMTUSJDDFFJSSJGCJMTJICCDIMUTJCJMSMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMJBDITUXXTMFCDDDFSUXXTMGDDCDFSTXXTIKQL..',
        '..KQQLITXTMTXSMDFFFFDJSUSJSUUMIDDFDFMTUTMTUTJDDBDGGGGGGGGGGGFFGGGGGGGGGGGGGGGGGGGGGGGFBDDCIMJCDDDDDDDCIMMFCDDDDDDCGMMFBNOH..',
        '..ANQNEFGTTSFFFFFFFFFFFFMTTIFDFFFFFFFFFTTSFFDDDCBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCCCCOOA..',
        '...LQQKCDDDDFFFFFFFFFFFFFDDFFFFFFFFFFFFDDDDDDDDDBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCHQNA..',
        '...BRQKCDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDDDDCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCNQH...',
        '...ALQOHDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCCOQH...',
        '....EQQKCFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDBKQLC...',
        '....BKQQEDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDDDCEHHHHHHHHHHHHHHHHHDCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDANQK....',
        '.....ENQLCDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDFCELOQQQQQQQQQQQQQQQQQNKBDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCKONH....',
        '......KRQHCFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDDDLOQNNEEEEEEEEEEEEEEHLOQLDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCBNOKA....',
        '......ENQOEDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFDENQNHAABBBBBBBBBBBBBBBAENQNCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCHOOA.....',
        '.......EOQPBFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFCHPQLABBBAAAAAAAAAAAAABBBBENQKCDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDLOK......',
        '.......AHQQLEDFFFFFFFFFDCCCCCCCCCCCCCCCCCCCKOQLBBBAABCCCCCCCBCCCBABCBAKQOHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHKONE......',
        '........AKOQNHCCCCCCCCCHLLLLLLLLLLLLLLLLLLLOQLCBBACCCCCCCCCCCCCCCCBBCCANQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQOOQQQQQOOH.......',
        '........AAHNQQQQQQQQQQOQQQQQQQQQQQQQQQQQQQQQNEBBBCCCCCCCCCCCCCCCCCCBBBAKLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLHB.......',
        '........ACACKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKEAABCCCCCCCCCCCCCCCCCCCCBBABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAAAAAAAAA........',
        '........AFBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBCCBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBAAAADDCCCA........',
        '..............G.............................................................................................................',
        '..............IGG...........................................................................................................'
    ];
    const TRUCK_PAL = [
        0x050405, 0x0b080b, 0x0f0d0f, 0x141314, 0x2c180f, 0x1a1919, 0x262422, 0x402214,
        0x34322e, 0x49453b, 0x612f1b, 0x87462a, 0x5f5a4d, 0xa9522f, 0xcb5c36, 0xc66b41,
        0xd36b3c, 0xd07848, 0x747065, 0x91908a, 0xaaa598, 0xd28653, 0xd49856, 0xc6c1b1,
        0xad9053, 0xdab663
    ];
    mk('foodTruck', 128, 64, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(64, 60, 124, 10);
        TRUCK_MAP.forEach((row, y) => [...row].forEach((ch, x) => {
            if (ch === '.') return;
            g.fillStyle(TRUCK_PAL[PAL_KEYS.indexOf(ch)]); g.fillRect(x + 2, y + 1, 1, 1);
        }));
    });

    // Columpios: viga vertical que cruza 2 casillas, con un asiento en cada una
    const swing = (key, top) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(28, 0, 12, T);
        if (top) { g.fillStyle(0x2f5a8a); g.fillTriangle(12, 14, 52, 14, 32, 2); g.lineStyle(3, OLF); g.strokeTriangle(12, 14, 52, 14, 32, 2); }
        else { g.fillStyle(0x2f5a8a); g.fillTriangle(12, 50, 52, 50, 32, 62); g.lineStyle(3, OLF); g.strokeTriangle(12, 50, 52, 50, 32, 62); }
        g.fillStyle(0xc2172f); g.fillRect(28, top ? 6 : 0, 8, top ? T - 6 : T - 6); g.lineStyle(2, OLF); g.strokeRect(28, top ? 6 : 0, 8, top ? T - 6 : T - 6);
        const sy = top ? 38 : 22;
        g.lineStyle(2, 0x9aa2aa); g.lineBetween(36, sy - 8, 46, sy - 2); g.lineBetween(36, sy + 8, 46, sy + 2);
        g.fillStyle(0x1a1a1a); g.fillRoundedRect(44, sy - 7, 8, 14, 2); g.lineStyle(2, OLF); g.strokeRoundedRect(44, sy - 7, 8, 14, 2);
    });
    swing('parkSwingTop', true); swing('parkSwingBot', false);
    // Banca de madera
    mk('parkBench', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(8, 22, 52, 30);
        g.fillStyle(0x23262e); g.fillRect(10, 18, 5, 30); g.fillRect(49, 18, 5, 30);
        [18, 28, 38].forEach(y => { g.fillStyle(0x8a5a2a); g.fillRect(4, y, 56, 7); g.lineStyle(2, OLF); g.strokeRect(4, y, 56, 7); });
        g.fillStyle(0xffffff, 0.12); g.fillRect(6, 19, 52, 2);
    });
    // Caballito de resorte
    mk('parkSpring', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillEllipse(32, 56, 40, 10);
        g.fillStyle(0x3a3f46); g.fillEllipse(32, 56, 30, 8);
        g.lineStyle(3, 0x9aa2aa); for (let y = 40; y < 56; y += 4) g.lineBetween(26, y, 38, y + 2);
        g.fillStyle(0xc2172f); g.fillEllipse(30, 32, 34, 16); g.lineStyle(3, OLF); g.strokeEllipse(30, 32, 34, 16);
        g.fillStyle(0xc2172f); g.fillRoundedRect(40, 12, 12, 22, 4); g.lineStyle(3, OLF); g.strokeRoundedRect(40, 12, 12, 22, 4);
        g.fillStyle(0xf0f0f0); g.fillCircle(48, 18, 2.5); g.fillStyle(0x0d0d0d); g.fillCircle(48.5, 18, 1.2);
        g.fillStyle(0x1a1a1a); g.fillRect(14, 24, 8, 4); g.fillRect(36, 20, 10, 3);
        g.fillStyle(0x2f5a8a); g.fillRect(24, 25, 10, 6);
    });
    // Árbol de copa redonda
    mk('parkTree', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(36, 40, 58, 48);
        g.fillStyle(0x2f5a2a); g.fillCircle(32, 30, 27); g.lineStyle(3, OLF); g.strokeCircle(32, 30, 27);
        g.fillStyle(0x4a8a3a); [[24, 22, 12], [40, 24, 11], [30, 36, 13]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0x6aa84a); [[22, 18, 5], [40, 20, 4], [30, 32, 4]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0x4a2e1a); g.fillRect(29, 52, 6, 10);
    });
    // Carrusel giratorio
    mk('parkMerry', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillCircle(34, 35, 28);
        for (let i = 0; i < 6; i++) {
            g.fillStyle(i % 2 ? 0xf0f0f0 : 0xc2172f);
            g.slice(32, 32, 27, i * Math.PI / 3, (i + 1) * Math.PI / 3); g.fillPath();
        }
        g.lineStyle(3, OLF); g.strokeCircle(32, 32, 27);
        g.lineStyle(3, 0x9aa2aa); for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3; g.lineBetween(32, 32, 32 + Math.cos(a) * 20, 32 + Math.sin(a) * 20); }
        g.fillStyle(0x2f5a8a); g.fillCircle(32, 32, 7); g.lineStyle(2, OLF); g.strokeCircle(32, 32, 7);
    });
    // Resbaladilla: escalera + plataforma + rampa
    mk('parkSlide', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(12, 6, 44, 56);
        g.fillStyle(0x9aa2aa); g.fillRect(8, 4, 4, 20); g.fillRect(24, 4, 4, 20);
        g.lineStyle(2, 0x9aa2aa); for (let y = 8; y < 24; y += 5) g.lineBetween(10, y, 26, y);
        g.fillStyle(0xc2172f); g.fillRect(6, 22, 24, 12); g.lineStyle(3, OLF); g.strokeRect(6, 22, 24, 12);
        g.fillStyle(0x2f7ab0); g.fillRect(10, 34, 16, 26); g.lineStyle(3, OLF); g.strokeRect(10, 34, 16, 26);
        g.fillStyle(0x5aa0d0); g.fillRect(13, 36, 4, 22);
        g.fillStyle(0x2f5a8a); g.fillRect(34, 22, 22, 22); g.lineStyle(3, OLF); g.strokeRect(34, 22, 22, 22);
        g.fillStyle(0xc2172f); g.fillTriangle(32, 22, 58, 22, 45, 8); g.lineStyle(3, OLF); g.strokeTriangle(32, 22, 58, 22, 45, 8);
    });
    // Bote de basura del parque
    mk('parkTrash', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 54, 40, 12);
        g.fillStyle(0x2a6a4a); g.fillRoundedRect(16, 14, 32, 42, 4); g.lineStyle(3, OLF); g.strokeRoundedRect(16, 14, 32, 42, 4);
        g.lineStyle(2, 0x1a4a32); [24, 32, 40].forEach(x => g.lineBetween(x, 20, x, 52));
        g.fillStyle(0x1a4a32); g.fillEllipse(32, 14, 36, 10); g.lineStyle(2, OLF); g.strokeEllipse(32, 14, 36, 10);
        g.fillStyle(0xe8e2d4); g.fillRect(22, 4, 8, 9); g.fillStyle(0xd0602a); g.fillRect(34, 6, 10, 6);
    });
    // Mesa de picnic junto al food truck
    mk('parkPicnic', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(8, 6, 52, 56);
        g.fillStyle(0x6a4422); g.fillRect(4, 4, 56, 9); g.fillRect(4, 51, 56, 9);
        g.lineStyle(2, OLF); g.strokeRect(4, 4, 56, 9); g.strokeRect(4, 51, 56, 9);
        g.fillStyle(0x8a5a2a); g.fillRect(6, 17, 52, 30); g.lineStyle(3, OLF); g.strokeRect(6, 17, 52, 30);
        g.lineStyle(1, 0x5a3a1a); [27, 37].forEach(y => g.lineBetween(8, y, 56, y));
        g.fillStyle(0xd0602a); g.fillRect(14, 24, 16, 12); g.fillStyle(0xf0e6d0); g.fillRect(16, 22, 12, 4);
        g.fillStyle(0xc2172f); g.fillRect(40, 22, 7, 14); g.fillStyle(0xf0f0f0); g.fillRect(41, 20, 5, 3);
    });
    // Sube y baja
    mk('parkSeesaw', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(6, 30, 56, 12);
        g.fillStyle(0x3a3f46); g.fillTriangle(22, 44, 42, 44, 32, 30); g.lineStyle(2, OLF); g.strokeTriangle(22, 44, 42, 44, 32, 30);
        g.fillStyle(0xc2172f); g.fillRect(4, 26, 56, 7); g.lineStyle(3, OLF); g.strokeRect(4, 26, 56, 7);
        g.fillStyle(0x2f5a8a); g.fillRect(8, 22, 8, 4); g.fillRect(48, 22, 8, 4);
        g.lineStyle(3, 0x9aa2aa); g.lineBetween(20, 26, 20, 16); g.lineBetween(44, 26, 44, 16);
    });
    // Arenero con cubeta y pala
    mk('parkSandbox', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(6, 8, 56, 56);
        g.fillStyle(0x6a4422); g.fillRect(2, 2, 60, 60); g.lineStyle(3, OLF); g.strokeRect(2, 2, 60, 60);
        g.fillStyle(0x9a8462); g.fillRect(9, 9, 46, 46);
        g.fillStyle(0x7a6648); g.fillCircle(22, 40, 6); g.fillCircle(42, 22, 5);
        g.fillStyle(0xc2172f); g.fillRoundedRect(30, 32, 14, 14, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(30, 32, 14, 14, 3);
        g.lineStyle(3, 0x2f5a8a); g.lineBetween(14, 16, 26, 28); g.fillStyle(0x2f5a8a); g.fillEllipse(28, 30, 8, 6);
    });
    // Arbustos
    mk('parkBush', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 44, 58, 32);
        [[20, 36, 15], [42, 34, 16], [32, 24, 14]].forEach(([x, y, r]) => { g.fillStyle(0x2f5a2a); g.fillCircle(x, y, r); g.lineStyle(3, OLF); g.strokeCircle(x, y, r); });
        g.fillStyle(0x4a8a3a); [[18, 32, 8], [42, 30, 9], [32, 20, 7]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0xc2172f); [[26, 38], [46, 40], [36, 22], [14, 30]].forEach(([x, y]) => g.fillCircle(x, y, 2));
    });

    // ---------- Escenario: vestidor de gimnasio de preparatoria (lockers y regaderas) ----------
    // Piso de vestidor: losetas de resina oscura con motas
    const gymFloor = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x0b0c0e);
        g.fillStyle(0x3a3d44, 0.7);
        for (let i = 0; i < 14; i++) g.fillRect(6 + ((i * 29 + seed * 13) % 50), 6 + ((i * 41 + seed * 7) % 50), 2, 2);
        g.fillStyle(0x000000, 0.25); g.fillEllipse(20 + seed * 3, 44, 18, 6);
    });
    gymFloor('lrFloorA', 0x1e2026, 0); gymFloor('lrFloorB', 0x24262d, 4);
    // Piso de regaderas: azulejo mojado con reflejos y coladera
    const showerFloor = (key, base, drain) => mk(key, T, T, g => {
        tile(g, base, 0x0a1014);
        g.fillStyle(0x6a9ab0, 0.18); g.fillEllipse(22, 22, 20, 6); g.fillEllipse(44, 44, 14, 4);
        if (drain) { g.fillStyle(0x6a737d); g.fillCircle(32, 32, 7); g.lineStyle(1, 0x1a1c20); g.lineBetween(26, 32, 38, 32); g.lineBetween(32, 26, 32, 38); }
    });
    showerFloor('lrShowerA', 0x1a252c, false); showerFloor('lrShowerB', 0x16212a, true);

    // Lockers metálicos rojos: dos puertas por casilla, con rejillas y candado
    const locker = (key, open) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(4, 6, 60, 58);
        g.fillStyle(0x5a0e16); g.fillRect(2, 2, 60, 60);
        [0, 1].forEach(i => {
            const x = 4 + i * 29;
            if (open && i === 1) {
                g.fillStyle(0x0a0c10); g.fillRect(x, 4, 27, 56);
                g.fillStyle(0x2f5aa8); g.fillRect(x + 6, 14, 15, 20); g.fillStyle(0xf0f0f0); g.fillRect(x + 10, 18, 7, 8);
                g.fillStyle(0x9aa2aa); g.fillRect(x + 2, 40, 23, 3);
                g.fillStyle(0xa8142a); g.fillRect(x + 22, 4, 6, 56); g.lineStyle(2, 0x0a0c10); g.strokeRect(x + 22, 4, 6, 56);
                return;
            }
            g.fillStyle(0xa8142a); g.fillRect(x, 4, 27, 56);
            g.fillStyle(0xd83a4a); g.fillRect(x, 4, 27, 3);
            g.fillStyle(0x0a0c10); for (let k = 0; k < 4; k++) g.fillRect(x + 6, 9 + k * 4, 15, 2);
            g.fillStyle(0x9aa2aa); g.fillRect(x + 20, 30, 4, 10);
            g.fillStyle(0x0a0c10); for (let k = 0; k < 3; k++) g.fillRect(x + 6, 46 + k * 4, 15, 2);
            g.lineStyle(2, 0x0a0c10); g.strokeRect(x, 4, 27, 56);
        });
        if (!open) {
            g.fillStyle(0xc9d3da); g.fillRoundedRect(23, 38, 6, 7, 1); g.lineStyle(1.5, 0xc9d3da); g.strokeCircle(26, 37, 2.5);
            g.fillStyle(0xf0f0f0, 0.85); g.fillRect(38, 22, 10, 6);
        }
        g.lineStyle(3, OLF); g.strokeRect(2, 2, 60, 60);
    });
    locker('lrLocker', false); locker('lrLockerOpen', true);
    // Banca larga de madera entre lockers (cruza 2 casillas en vertical)
    const lrBench = (key, top) => mk(key, T, T, g => {
        const y0 = top ? 8 : 0, h = top ? T - 8 : T - 8;
        g.fillStyle(0x000000, 0.35); g.fillRect(22, y0 + 4, 26, h);
        g.fillStyle(0x3a3f46); g.fillRect(24, top ? 14 : 44, 18, 6);
        g.fillStyle(0xa06a32); g.fillRect(20, y0, 24, h); g.lineStyle(3, OLF); g.strokeRect(20, y0, 24, h);
        g.lineStyle(1, 0x6a4422); g.lineBetween(28, y0 + 2, 28, y0 + h - 2); g.lineBetween(36, y0 + 2, 36, y0 + h - 2);
        g.fillStyle(0xffffff, 0.12); g.fillRect(22, y0 + 2, 4, h - 4);
        if (!top) { g.fillStyle(0xe8e8e0); g.fillRoundedRect(16, 14, 32, 18, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(16, 14, 32, 18, 4); g.fillStyle(0xc2172f); g.fillRect(16, 26, 32, 3); }
    });
    lrBench('lrBenchTop', true); lrBench('lrBenchBot', false);
    // Bebedero de acero contra la pared
    mk('lrFountain', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(10, 6, 48, 46);
        g.fillStyle(0x9aa6b0); g.fillRoundedRect(8, 2, 48, 44, 6); g.lineStyle(3, OLF); g.strokeRoundedRect(8, 2, 48, 44, 6);
        g.fillStyle(0x5a646e); g.fillEllipse(32, 24, 32, 22); g.fillStyle(0x3a4450); g.fillCircle(32, 26, 4);
        g.fillStyle(0xd8e0e6); g.fillRect(40, 10, 6, 6); g.fillStyle(0x7fc8ff, 0.8); g.fillCircle(38, 20, 2);
        g.fillStyle(0x6a737d); g.fillRect(26, 46, 12, 12);
    });
    // Carro de lona para la ropa sucia
    mk('lrHamper', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(8, 10, 52, 50);
        g.fillStyle(0x6a6e62); g.fillRect(6, 8, 52, 46); g.lineStyle(3, OLF); g.strokeRect(6, 8, 52, 46);
        g.lineStyle(3, 0x9aa2aa); g.strokeRect(4, 6, 56, 6);
        g.fillStyle(0xe8e8e0); g.fillEllipse(22, 10, 22, 10); g.fillStyle(0xc2172f); g.fillEllipse(40, 9, 18, 9);
        g.fillStyle(0x2f5aa8); g.fillEllipse(32, 14, 16, 7);
        g.fillStyle(0x1a1a1a); [[10, 58], [54, 58]].forEach(([x, y]) => g.fillCircle(x, y, 4));
    });
    // Rack de balones de básquetbol
    mk('lrBallRack', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(6, 8, 56, 54);
        g.lineStyle(3, 0x9aa2aa); g.strokeRect(4, 6, 56, 52); g.lineBetween(4, 32, 60, 32);
        [[16, 19], [32, 19], [48, 19], [16, 45], [32, 45], [48, 45]].forEach(([x, y]) => {
            g.fillStyle(0xd0602a); g.fillCircle(x, y, 9); g.lineStyle(2, OLF); g.strokeCircle(x, y, 9);
            g.lineStyle(1.5, 0x3a1a08); g.lineBetween(x - 9, y, x + 9, y); g.lineBetween(x, y - 9, x, y + 9);
        });
    });
    // Repisa con toallas dobladas
    mk('lrTowels', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(6, 6, 56, 56);
        g.fillStyle(0x6a4422); g.fillRect(4, 4, 56, 56); g.lineStyle(3, OLF); g.strokeRect(4, 4, 56, 56);
        [[8, 8], [34, 8], [8, 34], [34, 34]].forEach(([x, y], i) => {
            g.fillStyle(i === 3 ? 0x2f5aa8 : 0xe8e8e0); g.fillRoundedRect(x, y, 22, 22, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(x, y, 22, 22, 3);
            g.lineStyle(1, 0x9a9a90); g.lineBetween(x + 2, y + 8, x + 20, y + 8); g.lineBetween(x + 2, y + 15, x + 20, y + 15);
        });
    });
    // Báscula de consultorio
    mk('lrScale', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(14, 40, 40, 22);
        g.fillStyle(0x3a3f46); g.fillRect(12, 40, 40, 20); g.lineStyle(3, OLF); g.strokeRect(12, 40, 40, 20);
        g.fillStyle(0x9aa6b0); g.fillRect(28, 6, 6, 36); g.lineStyle(2, OLF); g.strokeRect(28, 6, 6, 36);
        g.fillStyle(0xd8e0e6); g.fillRect(14, 8, 36, 7); g.lineStyle(2, OLF); g.strokeRect(14, 8, 36, 7);
        g.fillStyle(0x0d0d0d); for (let x = 16; x < 48; x += 4) g.fillRect(x, 9, 1, 3);
        g.fillStyle(0xc2172f); g.fillRect(38, 7, 4, 9);
    });
    // Pila de maletas deportivas y tenis
    mk('lrBags', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 44, 58, 34);
        g.fillStyle(0x2f5aa8); g.fillRoundedRect(4, 26, 40, 26, 10); g.lineStyle(3, OLF); g.strokeRoundedRect(4, 26, 40, 26, 10);
        g.fillStyle(0xc2172f); g.fillRoundedRect(22, 10, 36, 24, 10); g.lineStyle(3, OLF); g.strokeRoundedRect(22, 10, 36, 24, 10);
        g.lineStyle(2, 0x0a0a0a); g.lineBetween(26, 22, 54, 22); g.lineBetween(8, 38, 40, 38);
        g.fillStyle(0xf0f0f0); g.fillRoundedRect(42, 44, 18, 9, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(42, 44, 18, 9, 4);
    });
    // Bote de basura del vestidor
    mk('lrTrash', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 54, 42, 12);
        g.fillStyle(0x4a4f58); g.fillRoundedRect(14, 12, 36, 44, 5); g.lineStyle(3, OLF); g.strokeRoundedRect(14, 12, 36, 44, 5);
        g.fillStyle(0x2a2e34); g.fillEllipse(32, 12, 38, 10);
        g.fillStyle(0xe8e8e0); g.fillRect(20, 4, 10, 9); g.fillStyle(0x2f5aa8); g.fillRect(34, 6, 9, 7);
        g.lineStyle(2, 0xc9d3da); g.lineBetween(24, 26, 40, 26);
    });
    // Regadera: pared de azulejo al fondo, regadera goteando y cortina corrida a un lado
    mk('lrShower', T, T, g => {
        g.fillStyle(0x7a8a96); g.fillRect(0, 40, T, 24);
        g.lineStyle(1, 0x3a4650); for (let x = 0; x <= T; x += 16) g.lineBetween(x, 40, x, T); g.lineBetween(0, 52, T, 52);
        g.lineStyle(3, OLF); g.strokeRect(1, 40, T - 2, 23);
        g.fillStyle(0x9aa2aa); g.fillRect(30, 26, 4, 16); g.fillStyle(0xc9d3da); g.fillEllipse(32, 26, 16, 8); g.lineStyle(2, OLF); g.strokeEllipse(32, 26, 16, 8);
        g.fillStyle(0x7fc8ff, 0.85); [[28, 16], [34, 10], [38, 18], [31, 4]].forEach(([x, y]) => g.fillRect(x, y, 2, 4));
        g.fillStyle(0xe8e8e0); g.fillRect(2, 0, 12, 42); g.lineStyle(2, OLF); g.strokeRect(2, 0, 12, 42);
        g.lineStyle(1, 0x9a9a90); [6, 10].forEach(x => g.lineBetween(x, 2, x, 40));
        g.fillStyle(0x9aa2aa); g.fillRect(0, 0, T, 3);
    });
    // Muro bajo de azulejo entre regaderas, con toallas colgadas
    mk('lrTileWall', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(4, 8, 60, 56);
        g.fillStyle(0x3a4650); g.fillRect(2, 4, 60, 56);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle((i + j) % 2 ? 0x8a9aa6 : 0x7a8a96); g.fillRect(3 + i * 15, 5 + j * 14, 13, 12); }
        g.lineStyle(3, OLF); g.strokeRect(2, 4, 60, 56);
        g.fillStyle(0x9aa2aa); g.fillRect(14, 14, 36, 3);
        g.fillStyle(0xe8e8e0); g.fillRect(16, 16, 14, 26); g.lineStyle(2, OLF); g.strokeRect(16, 16, 14, 26);
        g.fillStyle(0x2f5aa8); g.fillRect(34, 16, 14, 22); g.lineStyle(2, OLF); g.strokeRect(34, 16, 14, 22);
        g.fillStyle(0xc2172f); g.fillRect(34, 32, 14, 3);
    });

    // ---------- Escenario: centro comercial moderno (blanco, vidrio y luz) con decoración navideña ----------
    // Paleta blanca del centro comercial; el piso es piedra gris claro pulida, más oscura que los muebles blancos
    const MW = 0xf1f3f5, MG = 0xd3d7dc, MS = 0xa9afb6;
    const mallFloor = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x34363b);
        g.fillStyle(0xffffff, 0.1); g.fillTriangle(8 + seed, 8, 28 + seed, 8, 8, 32);
        g.fillStyle(0xffffff, 0.05); g.fillRect(4, 4, T - 8, 2);
        g.lineStyle(1, 0x55585e, 0.7); g.lineBetween(16, 46 - seed, 34, 54 - seed);
    });
    mallFloor('xmFloorA', 0x6a6d73, 0); mallFloor('xmFloorB', 0x63666c, 6);
    // Alfombra roja del área de Santa con copos tenues
    const carpet = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x14040a);
        g.lineStyle(1.5, 0xffffff, 0.14);
        [[18 + seed, 20], [44 - seed, 42]].forEach(([x, y]) => {
            for (let a = 0; a < 3; a++) { const ang = a * Math.PI / 3; g.lineBetween(x - Math.cos(ang) * 6, y - Math.sin(ang) * 6, x + Math.cos(ang) * 6, y + Math.sin(ang) * 6); }
        });
    });
    carpet('xmCarpetA', 0x4a0c16, 0); carpet('xmCarpetB', 0x420a14, 6);

    // Tiendas: fachada blanca, vitrina de vidrio, letrero luminoso y guirnalda
    const store = (key, neon, drawItems) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(3, 6, 61, 58);
        g.fillStyle(MW); g.fillRect(0, 0, T, 58); g.lineStyle(3, OLF); g.strokeRect(1, 1, T - 2, 57);
        g.fillStyle(MG); g.fillRect(2, 14, T - 4, 2);
        g.fillStyle(neon); g.fillRect(14, 6, 36, 4);
        g.fillStyle(0xbcd4e2); g.fillRect(5, 18, 54, 37);
        drawItems(g);
        g.fillStyle(0xffffff, 0.35); g.fillTriangle(7, 20, 20, 20, 7, 40);
        g.lineStyle(2, MS); g.strokeRect(5, 18, 54, 37); g.lineBetween(32, 18, 32, 55);
        g.lineStyle(3, 0x1f6a34); g.beginPath(); g.moveTo(4, 17); g.lineTo(18, 21); g.lineTo(32, 17); g.lineTo(46, 21); g.lineTo(60, 17); g.strokePath();
        [[11, 19, 0xc2172f], [25, 19, 0xc2172f], [39, 19, 0xc2172f], [53, 19, 0xc2172f]].forEach(([x, y, c]) => { g.fillStyle(c); g.fillCircle(x, y, 1.8); });
    });
    store('xmShopFashion', 0xff4fa0, g => {
        [[16, 0x23262e], [46, 0xc2172f]].forEach(([x, c]) => {
            g.fillStyle(MW); g.fillCircle(x, 27, 4); g.lineStyle(1.5, MS); g.strokeCircle(x, 27, 4);
            g.fillStyle(c); g.fillTriangle(x - 8, 50, x + 8, 50, x, 31); g.fillStyle(MS); g.fillRect(x - 1, 50, 2, 4);
        });
    });
    store('xmShopTech', 0x4ab8ff, g => {
        g.fillStyle(MW); g.fillRect(7, 44, 22, 3);
        g.fillStyle(0x23262e); g.fillRect(9, 31, 18, 12); g.fillStyle(0x4a8ad8); g.fillRect(10, 32, 16, 10);
        [38, 46, 54].forEach((x, i) => { g.fillStyle(0x23262e); g.fillRoundedRect(x - 3, 30 + i, 7, 13, 1); g.fillStyle(i === 1 ? 0xc2172f : 0x9fd3ff); g.fillRect(x - 2, 32 + i, 5, 9); });
        g.fillStyle(MW); g.fillRect(34, 46, 24, 3);
    });
    store('xmShopShoes', 0x3a9a4a, g => {
        g.fillStyle(MW); g.fillRect(6, 35, 52, 2); g.fillRect(6, 49, 52, 2);
        [[14, 30, MW], [30, 30, 0xc2172f], [46, 30, 0x23262e], [22, 44, 0x4a8ad8], [40, 44, MW]].forEach(([x, y, c]) => {
            g.fillStyle(c); g.fillRoundedRect(x - 6, y, 12, 5, 2); g.lineStyle(1, OLF); g.strokeRoundedRect(x - 6, y, 12, 5, 2);
        });
    });
    // Mostrador de información: curva blanca que cruza 2 casillas en vertical
    const infoDesk = (key, top) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(14, top ? 10 : 0, 42, top ? 54 : 56);
        g.fillStyle(MW);
        if (top) { g.fillRoundedRect(12, 6, 40, 58, { tl: 20, tr: 20, bl: 0, br: 0 }); g.lineStyle(3, OLF); g.strokeRoundedRect(12, 6, 40, 58, { tl: 20, tr: 20, bl: 0, br: 0 }); }
        else { g.fillRoundedRect(12, 0, 40, 56, { tl: 0, tr: 0, bl: 20, br: 20 }); g.lineStyle(3, OLF); g.strokeRoundedRect(12, 0, 40, 56, { tl: 0, tr: 0, bl: 20, br: 20 }); }
        g.fillStyle(MG); g.fillRect(18, top ? 18 : 0, 6, top ? 46 : 44);
        g.fillStyle(0x4ab8ff, 0.8); g.fillRect(46, top ? 16 : 0, 3, top ? 48 : 46);
        if (top) {
            g.fillStyle(0x23262e); g.fillRect(28, 22, 14, 10); g.fillStyle(0x9fd3ff); g.fillRect(29, 23, 12, 8);
            g.fillStyle(0x2f6ac8); g.fillCircle(35, 46, 8); g.fillStyle(MW); g.fillCircle(35, 42, 1.8); g.fillRect(34, 45, 2.5, 6);
        } else {
            g.fillStyle(0xc2172f); g.fillRect(28, 14, 12, 10); g.fillStyle(MW); g.fillRect(33, 14, 2, 10); g.fillRect(28, 18, 12, 2);
            g.fillStyle(MS); g.fillRect(28, 32, 12, 2); g.fillRect(28, 37, 8, 2);
            g.lineStyle(3, 0x1f6a34); g.lineBetween(14, 50, 50, 50);
            g.fillStyle(0xc2172f); [20, 32, 44].forEach(x => g.fillCircle(x, 50, 2));
        }
    });
    infoDesk('xmInfoTop', true); infoDesk('xmInfoBot', false);
    // Directorio digital
    mk('xmDirectory', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(16, 8, 38, 56);
        g.fillStyle(MW); g.fillRoundedRect(14, 4, 36, 54, 4); g.lineStyle(3, OLF); g.strokeRoundedRect(14, 4, 36, 54, 4);
        g.fillStyle(0x0d1a2a); g.fillRect(18, 9, 28, 38);
        g.fillStyle(0x4a8ad8); g.fillRect(20, 11, 11, 8); g.fillStyle(0x3a9a4a); g.fillRect(33, 11, 11, 14); g.fillStyle(0xc2172f); g.fillRect(20, 21, 11, 10);
        g.fillStyle(0x6a737d); g.fillRect(33, 27, 11, 10); g.fillRect(20, 33, 24, 4);
        g.fillStyle(0xff1f3d); g.fillCircle(26, 26, 2.5);
        g.fillStyle(MW); g.fillRect(20, 40, 24, 4);
        g.fillStyle(MS); g.fillRect(22, 58, 20, 4);
    });
    // Banca blanca con bolsas de compras
    mk('xmBench', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(6, 26, 56, 28);
        g.fillStyle(MS); g.fillRect(10, 38, 5, 14); g.fillRect(49, 38, 5, 14);
        g.fillStyle(MW); g.fillRoundedRect(4, 28, 56, 12, 5); g.lineStyle(3, OLF); g.strokeRoundedRect(4, 28, 56, 12, 5);
        g.fillStyle(MG); g.fillRect(8, 36, 48, 2);
        g.fillStyle(0x23262e); g.fillRect(8, 10, 16, 20); g.lineStyle(2, OLF); g.strokeRect(8, 10, 16, 20);
        g.lineStyle(2, MS); g.beginPath(); g.arc(16, 10, 4, Math.PI, 0); g.strokePath();
        g.fillStyle(0xff4fa0); g.fillRect(12, 16, 8, 2);
        g.fillStyle(0xc2172f); g.fillRect(36, 14, 16, 16); g.lineStyle(2, OLF); g.strokeRect(36, 14, 16, 16);
        g.fillStyle(MW); g.fillRect(42, 14, 3, 16);
    });
    // Columna blanca con pantalla de oferta navideña
    mk('xmAdColumn', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillCircle(35, 35, 25);
        g.fillStyle(MW); g.fillCircle(32, 32, 24); g.lineStyle(3, OLF); g.strokeCircle(32, 32, 24);
        g.fillStyle(MG); g.fillCircle(32, 32, 19);
        g.fillStyle(0x0a0a0d); g.fillRoundedRect(13, 17, 38, 28, 3);
        g.fillStyle(0xc2172f); g.fillRect(15, 19, 34, 24);
        g.fillStyle(MW); g.fillRect(19, 23, 26, 4); g.fillRect(23, 30, 18, 7);
        g.fillStyle(0xc2172f); g.fillRect(28, 31, 3, 5); g.fillRect(34, 31, 3, 5);
        g.lineStyle(1.5, MW, 0.8); g.lineBetween(17, 40, 23, 40); g.lineBetween(41, 40, 47, 40);
    });
    // Maceta blanca con arbolito y luces
    mk('xmPlanter', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 56, 46, 12);
        g.fillStyle(MW); g.fillRoundedRect(16, 40, 32, 20, 6); g.lineStyle(3, OLF); g.strokeRoundedRect(16, 40, 32, 20, 6);
        g.fillStyle(MG); g.fillRect(18, 52, 28, 3);
        g.fillStyle(0x4a2e1a); g.fillRect(30, 26, 4, 16);
        [[32, 18, 14], [22, 24, 9], [42, 24, 9]].forEach(([x, y, r]) => { g.fillStyle(0x2f6a3a); g.fillCircle(x, y, r); g.lineStyle(2, OLF); g.strokeCircle(x, y, r); });
        g.fillStyle(0x4a8a4a); g.fillCircle(30, 14, 6);
        g.fillStyle(0xfff0f0); [[22, 20], [30, 10], [40, 18], [36, 26], [26, 28], [44, 26], [18, 26]].forEach(([x, y]) => g.fillCircle(x, y, 1.6));
    });
    // Kiosco blanco de accesorios con un mini árbol
    mk('xmKiosk', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(8, 12, 54, 50);
        g.fillStyle(MW); g.fillRoundedRect(4, 20, 56, 38, 10); g.lineStyle(3, OLF); g.strokeRoundedRect(4, 20, 56, 38, 10);
        g.fillStyle(MG); g.fillRoundedRect(10, 26, 44, 26, 6);
        [[14, 30], [24, 30], [34, 30], [14, 40], [24, 40], [34, 40]].forEach(([x, y], i) => {
            g.fillStyle([0xff4fa0, 0x4a8ad8, 0x23262e, 0x3a9a4a, 0xc2172f, MS][i]); g.fillRoundedRect(x, y, 7, 9, 2);
        });
        g.fillStyle(0x1f6a34); g.fillTriangle(42, 48, 54, 48, 48, 30); g.fillStyle(0xc2172f); g.fillCircle(46, 42, 1.6); g.fillStyle(MW); g.fillCircle(50, 38, 1.6);
        g.fillStyle(MW); g.fillRect(14, 6, 36, 6); g.lineStyle(2, OLF); g.strokeRect(14, 6, 36, 6); g.fillStyle(0x4ab8ff); g.fillRect(18, 8, 28, 2);
        g.lineStyle(2, MS); g.lineBetween(16, 12, 16, 20); g.lineBetween(48, 12, 48, 20);
    });
    // Kiosco de café blanco con madera clara
    mk('xmCoffee', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(6, 10, 56, 54);
        g.fillStyle(MW); g.fillRoundedRect(4, 22, 56, 36, 8); g.lineStyle(3, OLF); g.strokeRoundedRect(4, 22, 56, 36, 8);
        g.fillStyle(0xb88a5a); g.fillRect(4, 46, 56, 6);
        g.fillStyle(MS); g.fillRect(10, 28, 18, 16); g.lineStyle(2, OLF); g.strokeRect(10, 28, 18, 16);
        g.fillStyle(0x23262e); g.fillRect(14, 31, 10, 6); g.fillStyle(0xc2172f); g.fillCircle(19, 40, 2);
        [36, 44, 52].forEach((x, i) => { g.fillStyle(i === 1 ? 0xc2172f : MW); g.fillRect(x - 3, 32, 7, 10); g.lineStyle(1, OLF); g.strokeRect(x - 3, 32, 7, 10); g.fillStyle(0x6a4422); g.fillRect(x - 3, 35, 7, 3); });
        g.fillStyle(MW); g.fillRect(12, 4, 40, 14); g.lineStyle(2, OLF); g.strokeRect(12, 4, 40, 14);
        g.fillStyle(0x6a4422); g.fillCircle(22, 11, 4); g.fillStyle(MS); g.fillRect(30, 9, 16, 3);
    });
    // Cajero automático blanco
    mk('xmATM', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(14, 8, 40, 56);
        g.fillStyle(MW); g.fillRoundedRect(12, 4, 40, 56, 4); g.lineStyle(3, OLF); g.strokeRoundedRect(12, 4, 40, 56, 4);
        g.fillStyle(0x0a1a2a); g.fillRect(18, 10, 28, 18); g.fillStyle(0x3a9a4a); g.fillRect(20, 12, 24, 3); g.fillStyle(0x4a8ad8); g.fillRect(20, 18, 16, 6);
        g.fillStyle(MS); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect(20 + i * 6, 32 + j * 5, 4, 3);
        g.fillStyle(0x23262e); g.fillRect(40, 34, 6, 2); g.fillRect(22, 50, 20, 3);
        g.fillStyle(0x2f6ac8); g.fillRect(12, 4, 40, 4);
    });
    // Estación de reciclaje blanca con tapas de color
    mk('xmRecycle', T, T, g => {
        g.fillStyle(0x000000, 0.35); g.fillRect(6, 16, 56, 46);
        [[4, 0x2f6ac8], [23, 0x3a9a4a], [42, 0x6a737d]].forEach(([x, c]) => {
            g.fillStyle(MW); g.fillRoundedRect(x, 14, 18, 44, 3); g.lineStyle(3, OLF); g.strokeRoundedRect(x, 14, 18, 44, 3);
            g.fillStyle(c); g.fillRect(x + 1, 14, 16, 8); g.fillStyle(0x0d0d0d); g.fillRect(x + 4, 17, 10, 2);
            g.lineStyle(2, c); g.strokeCircle(x + 9, 38, 4);
        });
    });
    // Máquina de garra blanca con peluches
    mk('xmClaw', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(8, 8, 54, 56);
        g.fillStyle(MW); g.fillRect(6, 4, 52, 58); g.lineStyle(3, OLF); g.strokeRect(6, 4, 52, 58);
        g.fillStyle(0xbcd4e2); g.fillRect(10, 12, 44, 30);
        g.lineStyle(2, MS); g.lineBetween(32, 12, 32, 22); g.lineBetween(28, 22, 36, 22); g.lineBetween(28, 22, 26, 27); g.lineBetween(36, 22, 38, 27);
        [[16, 38, 0x8a5a2a], [26, 38, 0xff4fa0], [38, 37, 0x4a8ad8], [48, 38, 0xc2172f]].forEach(([x, y, c]) => { g.fillStyle(c); g.fillCircle(x, y, 4.5); });
        g.fillStyle(0xffffff, 0.35); g.fillRect(12, 14, 6, 26);
        g.fillStyle(MG); g.fillRect(10, 46, 44, 12); g.fillStyle(0xff4fa0); g.fillCircle(42, 52, 3); g.fillStyle(0x23262e); g.fillRect(18, 48, 3, 7);
        g.fillStyle(0xff4fa0); g.fillRect(14, 6, 36, 4);
    });
    // Árbol de Navidad con esferas, guirnalda y estrella plateada
    mk('xmTree', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 56, 54, 14);
        g.fillStyle(0x4a2e1a); g.fillRect(29, 50, 6, 10);
        [[32, 4, 14, 22], [32, 14, 20, 36], [32, 24, 26, 50]].forEach(([x, top, hw, bottom]) => {
            g.fillStyle(0x1f6a34); g.fillTriangle(x - hw, bottom, x + hw, bottom, x, top);
            g.lineStyle(3, OLF); g.strokeTriangle(x - hw, bottom, x + hw, bottom, x, top);
            g.fillStyle(0x2f8a44); g.fillTriangle(x - hw + 6, bottom - 3, x, bottom - 3, x, top + 6);
        });
        g.lineStyle(2, 0xf0f0f0, 0.8); g.lineBetween(20, 30, 40, 24); g.lineBetween(14, 44, 46, 36);
        [[24, 22, 0xc2172f], [38, 30, 0x4a8ad8], [22, 38, 0xf0f0f0], [42, 44, 0xc2172f], [30, 46, 0x4a8ad8], [32, 16, 0xc2172f]]
            .forEach(([x, y, c]) => { g.fillStyle(c); g.fillCircle(x, y, 2.8); });
        g.fillStyle(0xe6edf2); g.fillTriangle(27, 6, 37, 6, 32, -2); g.fillTriangle(27, 2, 37, 2, 32, 10);
        g.fillStyle(0xc2172f); g.fillRect(40, 52, 12, 9); g.fillStyle(0x3a9a4a); g.fillRect(12, 53, 11, 8);
    });
    // Sillón de Santa: respaldo alto de terciopelo rojo con piel blanca, gorro y costal
    mk('xmSanta', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 56, 56, 14);
        g.fillStyle(0x8e1622); g.fillRoundedRect(12, 2, 40, 34, { tl: 18, tr: 18, bl: 2, br: 2 });
        g.lineStyle(3, OLF); g.strokeRoundedRect(12, 2, 40, 34, { tl: 18, tr: 18, bl: 2, br: 2 });
        g.lineStyle(3, 0xf0f0f0); g.strokeRoundedRect(16, 6, 32, 28, { tl: 14, tr: 14, bl: 2, br: 2 });
        g.fillStyle(0xa81c2a); g.fillRoundedRect(8, 30, 48, 20, 6); g.lineStyle(3, OLF); g.strokeRoundedRect(8, 30, 48, 20, 6);
        g.fillStyle(0xf0f0f0); g.fillRoundedRect(4, 26, 12, 22, 5); g.fillRoundedRect(48, 26, 12, 22, 5);
        g.lineStyle(2, OLF); g.strokeRoundedRect(4, 26, 12, 22, 5); g.strokeRoundedRect(48, 26, 12, 22, 5);
        g.fillStyle(0x4a2e1a); g.fillRect(12, 50, 5, 10); g.fillRect(47, 50, 5, 10);
        g.fillStyle(0xc2172f); g.fillTriangle(24, 42, 40, 42, 36, 30); g.fillStyle(0xf0f0f0); g.fillRect(23, 41, 18, 4); g.fillCircle(36, 30, 3);
        g.fillStyle(0x8a6a4a); g.fillEllipse(54, 54, 16, 12); g.lineStyle(2, OLF); g.strokeEllipse(54, 54, 16, 12);
    });

    // ---------- Escenario: carpa de circo abandonada (horror) ----------
    // Piso de tierra con paja vieja
    const dirt = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x0c0806);
        g.lineStyle(1.5, 0x4a3a1e, 0.8);
        for (let i = 0; i < 7; i++) {
            const x = 8 + ((i * 23 + seed * 11) % 46), y = 10 + ((i * 37 + seed * 7) % 42);
            g.lineBetween(x, y, x + 7, y - 2 + (i % 3));
        }
        g.fillStyle(0x000000, 0.25); g.fillEllipse(22 + seed * 2, 42, 18, 8);
    });
    dirt('ccFloorA', 0x231a13, 0); dirt('ccFloorB', 0x1e1610, 5);
    // Pista del circo: aserrín rojizo con manchas oscuras
    const ring = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x100404);
        g.fillStyle(0x5a1a12, 0.5); for (let i = 0; i < 10; i++) g.fillRect(8 + ((i * 29 + seed * 13) % 48), 8 + ((i * 41 + seed * 5) % 48), 2, 1.5);
        g.fillStyle(0x1a0404, 0.55); g.fillEllipse(40 - seed * 3, 24 + seed * 2, 16, 9); g.fillCircle(18, 46, 3);
    });
    ring('ccRingA', 0x3a1410, 0); ring('ccRingB', 0x32110d, 4);

    // Lona de la carpa contra la pared: rayas desteñidas, rasgada y con manchas
    mk('ccTentWall', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(2, 6, 62, 58);
        g.fillStyle(0x2a0a10); g.fillRect(0, 0, T, 60);
        for (let x = 0; x < T; x += 16) { g.fillStyle(0x7a1420); g.fillRect(x, 0, 8, 60); g.fillStyle(0xb8ad94); g.fillRect(x + 8, 0, 8, 60); }
        g.fillStyle(0x3a2a14, 0.45); g.fillRect(0, 36, T, 24);
        g.fillStyle(0x0a0606); g.fillTriangle(20, 60, 34, 60, 28, 30); g.fillTriangle(44, 0, 52, 0, 48, 16);
        g.fillStyle(0x6a0a12, 0.85); g.fillCircle(12, 22, 4); g.fillRect(11, 22, 2, 14); g.fillCircle(12, 36, 1.8);
        g.lineStyle(3, OLF); g.strokeRect(1, 1, T - 2, 59);
        g.lineStyle(2, 0x6a5a3a); g.lineBetween(0, 58, T, 58);
    });
    // Tambor-pedestal de circo, oxidado
    mk('ccDrum', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 52, 50, 16);
        g.fillStyle(0x6a1018); g.fillRect(12, 22, 40, 28); g.lineStyle(3, OLF); g.strokeRect(12, 22, 40, 28);
        g.lineStyle(2, 0xb8ad94); for (let i = 0; i < 4; i++) g.lineBetween(14 + i * 10, 24, 22 + i * 10, 48);
        g.fillStyle(0x8a5a2a); g.fillRect(12, 22, 40, 4); g.fillRect(12, 46, 40, 4);
        g.fillStyle(0xb8ad94); g.fillEllipse(32, 22, 40, 14); g.lineStyle(3, OLF); g.strokeEllipse(32, 22, 40, 14);
        g.fillStyle(0x5a3a1a, 0.6); g.fillEllipse(26, 22, 14, 5); g.fillStyle(0x6a0a12, 0.8); g.fillCircle(38, 21, 3);
    });
    // Caja de utilería con letrero de peligro
    mk('ccCrate', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(8, 10, 54, 52);
        g.fillStyle(0x5a3a22); g.fillRect(4, 6, 54, 52); g.lineStyle(3, OLF); g.strokeRect(4, 6, 54, 52);
        g.lineStyle(3, 0x3a2414); g.lineBetween(6, 8, 56, 56); g.lineBetween(56, 8, 6, 56);
        g.fillStyle(0xd8d0c0); g.fillRect(14, 24, 34, 14); g.lineStyle(2, OLF); g.strokeRect(14, 24, 34, 14);
        g.fillStyle(0xc2172f); for (let i = 0; i < 5; i++) g.fillRect(17 + i * 6, 28, 4, 6);
        g.fillStyle(0x0a0606); g.fillTriangle(48, 58, 58, 58, 56, 46);
    });
    // Jaula de león rota (2 casillas)
    mk('ccCage', 128, 64, g => {
        g.fillStyle(0x000000, 0.5); g.fillRect(8, 10, 118, 52);
        g.fillStyle(0x3a1a10); g.fillRect(4, 44, 120, 12); g.lineStyle(3, OLF); g.strokeRect(4, 44, 120, 12);
        g.fillStyle(0x140a08); g.fillRect(8, 10, 112, 34);
        g.lineStyle(4, 0x6a5a4a);
        for (let x = 14; x < 120; x += 12) { if (x === 62 || x === 74) continue; g.lineBetween(x, 10, x, 44); }
        g.lineBetween(62, 10, 56, 30); g.lineBetween(74, 10, 82, 26);
        g.fillStyle(0x7a1420); g.fillRect(4, 4, 120, 8); g.lineStyle(3, OLF); g.strokeRect(4, 4, 120, 8);
        g.fillStyle(0x1a1a1a); [[18, 58], [110, 58]].forEach(([x, y]) => { g.fillCircle(x, y, 7); g.fillStyle(0x5a4a3a); g.fillCircle(x, y, 3); g.fillStyle(0x1a1a1a); });
        g.fillStyle(0x6a0a12, 0.8); g.fillEllipse(96, 40, 18, 5); g.lineStyle(2, 0x6a0a12); g.lineBetween(30, 20, 36, 34); g.lineBetween(36, 20, 30, 34);
    });
    // Tablero de lanzar cuchillos con silueta (2 casillas)
    mk('ccKnifeBoard', 128, 64, g => {
        g.fillStyle(0x000000, 0.5); g.fillRect(10, 10, 116, 52);
        g.fillStyle(0x6a4422); g.fillRect(6, 4, 116, 54); g.lineStyle(3, OLF); g.strokeRect(6, 4, 116, 54);
        g.lineStyle(1, 0x4a2e1a); for (let y = 14; y < 58; y += 10) g.lineBetween(8, y, 120, y);
        [[44, 0x7a1420], [44, 0xb8ad94], [44, 0x7a1420]].forEach(([x], i) => { g.fillStyle(i % 2 ? 0xb8ad94 : 0x7a1420); g.fillCircle(64, 31, 24 - i * 8); });
        g.fillStyle(0x1a0a0a); g.fillCircle(64, 16, 6); g.fillRect(58, 22, 12, 22); g.fillRect(48, 24, 32, 5);
        [[40, 12], [88, 18], [50, 46], [80, 44], [64, 6]].forEach(([x, y]) => {
            g.fillStyle(0xc9d3da); g.fillRect(x - 1, y, 3, 8); g.fillStyle(0x1a1a1a); g.fillRect(x - 2, y - 6, 5, 6);
        });
        g.fillStyle(0x8a0f1e, 0.85); g.fillCircle(72, 30, 4); g.fillRect(71, 30, 2, 12); g.fillCircle(60, 40, 2.5);
    });
    // Barriles apilados
    mk('ccBarrels', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 54, 56, 16);
        [[20, 40], [44, 40], [32, 18]].forEach(([x, y]) => {
            g.fillStyle(0x6a4422); g.fillEllipse(x, y, 24, 28); g.lineStyle(3, OLF); g.strokeEllipse(x, y, 24, 28);
            g.lineStyle(2, 0x3a3f46); g.lineBetween(x - 11, y - 6, x + 11, y - 6); g.lineBetween(x - 11, y + 6, x + 11, y + 6);
        });
        g.fillStyle(0x6a0a12, 0.75); g.fillCircle(44, 46, 3);
    });
    // Poste central de la carpa con cuerdas (2 casillas en vertical)
    const pole = (key, top) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(28, 0, 14, T);
        g.lineStyle(2, 0x8a7a5a); if (top) { g.lineBetween(32, 6, 4, 60); g.lineBetween(32, 6, 60, 60); } else { g.lineBetween(32, 50, 6, 62); g.lineBetween(32, 50, 58, 62); }
        g.fillStyle(0x6a4422); g.fillRect(26, top ? 4 : 0, 12, top ? 60 : 56); g.lineStyle(3, OLF); g.strokeRect(26, top ? 4 : 0, 12, top ? 60 : 56);
        g.fillStyle(0x8a5a2a); g.fillRect(28, top ? 6 : 0, 3, top ? 58 : 54);
        if (top) { g.fillStyle(0x7a1420); g.fillTriangle(38, 6, 38, 18, 54, 12); g.lineStyle(2, OLF); g.strokeTriangle(38, 6, 38, 18, 54, 12); }
        else { g.fillStyle(0x3a3f46); g.fillRect(20, 52, 24, 8); g.lineStyle(2, OLF); g.strokeRect(20, 52, 24, 8); }
    });
    pole('ccPoleTop', true); pole('ccPoleBot', false);
    // Muñeco de payaso tétrico sentado en un banquito
    mk('ccDoll', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 56, 40, 10);
        g.fillStyle(0x3a2414); g.fillRect(18, 44, 28, 6); g.fillRect(20, 50, 4, 10); g.fillRect(40, 50, 4, 10);
        g.fillStyle(0x7a1420); g.fillRoundedRect(20, 28, 24, 18, 5); g.lineStyle(2, OLF); g.strokeRoundedRect(20, 28, 24, 18, 5);
        g.fillStyle(0xb8ad94); [24, 32, 40].forEach(x => g.fillCircle(x, 28, 3.5));
        g.fillStyle(0xe8e2d4); g.fillCircle(32, 18, 10); g.lineStyle(2, OLF); g.strokeCircle(32, 18, 10);
        g.fillStyle(0x2a6a4a); g.fillCircle(22, 14, 5); g.fillCircle(42, 14, 5);
        g.fillStyle(0x0d0d0d); g.fillCircle(28, 17, 2.5); g.fillCircle(36, 17, 2.5);
        g.fillStyle(0xff1f3d); g.fillCircle(28, 17, 0.9); g.fillCircle(36, 17, 0.9); g.fillCircle(32, 21, 2.2);
        g.lineStyle(2, 0x6a0a12); g.lineBetween(26, 24, 38, 24); g.lineBetween(26, 24, 24, 21); g.lineBetween(38, 24, 40, 21);
        g.lineStyle(1.5, 0x1a1a1a); g.lineBetween(30, 8, 34, 14);
    });
    // Globos desinflados atados a una pesa
    mk('ccBalloons', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(32, 56, 28, 8);
        g.fillStyle(0x3a3f46); g.fillRect(24, 50, 16, 8); g.lineStyle(2, OLF); g.strokeRect(24, 50, 16, 8);
        g.lineStyle(1.5, 0xb8ad94); [[32, 50, 18, 20], [32, 50, 34, 12], [32, 50, 46, 22]].forEach(([x, y, x2, y2]) => g.lineBetween(x, y, x2, y2));
        [[18, 18, 0x7a1420], [34, 10, 0x4a3a5a], [46, 20, 0x5a5a3a]].forEach(([x, y, c]) => {
            g.fillStyle(c); g.fillEllipse(x, y, 13, 15); g.lineStyle(2, OLF); g.strokeEllipse(x, y, 13, 15);
            g.fillStyle(0x000000, 0.35); g.fillEllipse(x + 2, y + 3, 6, 5);
        });
        g.fillStyle(0x6a0a12, 0.8); g.fillCircle(30, 54, 2);
    });
    // Gradas de madera rotas (2 casillas)
    mk('ccBleachers', 128, 64, g => {
        g.fillStyle(0x000000, 0.5); g.fillRect(6, 8, 120, 56);
        [[4, 0x4a2e1a], [22, 0x5a3a22], [40, 0x6a4422]].forEach(([y, c], i) => {
            g.fillStyle(c); g.fillRect(4, y, 120, 14); g.lineStyle(3, OLF); g.strokeRect(4, y, 120, 14);
            g.lineStyle(1, 0x2a1a0e); g.lineBetween(6, y + 7, 122, y + 7);
        });
        g.fillStyle(0x0a0606); g.fillTriangle(70, 22, 92, 22, 82, 40); g.fillTriangle(30, 40, 44, 40, 38, 54);
        g.lineStyle(3, 0x3a3f46); [16, 64, 112].forEach(x => g.lineBetween(x, 54, x, 62));
        g.fillStyle(0xe8e2d4); g.fillRect(100, 10, 9, 6); g.fillStyle(0x7a1420); g.fillRect(100, 12, 9, 2);
    });
    // Máquina de palomitas oxidada
    mk('ccPopcorn', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(10, 10, 52, 54);
        g.fillStyle(0x6a1018); g.fillRect(10, 40, 44, 18); g.lineStyle(3, OLF); g.strokeRect(10, 40, 44, 18);
        g.fillStyle(0x23384a, 0.9); g.fillRect(12, 12, 40, 28); g.lineStyle(3, OLF); g.strokeRect(12, 12, 40, 28);
        g.fillStyle(0xd8cfae); for (let i = 0; i < 12; i++) g.fillCircle(16 + (i * 7) % 34, 32 + (i % 3) * 2, 2.5);
        g.fillStyle(0x7a1420); g.fillTriangle(8, 12, 56, 12, 32, 2); g.lineStyle(2, OLF); g.strokeTriangle(8, 12, 56, 12, 32, 2);
        g.fillStyle(0x5a3a1a, 0.6); g.fillRect(12, 12, 14, 8); g.lineStyle(2, 0x0a0606); g.lineBetween(36, 14, 44, 26);
        g.fillStyle(0x1a1a1a); g.fillCircle(16, 60, 4); g.fillCircle(48, 60, 4);
    });
    // Carrito de payaso destrozado (2 casillas)
    mk('ccClownCar', 128, 64, g => {
        g.fillStyle(0x000000, 0.5); g.fillEllipse(66, 56, 120, 14);
        g.fillStyle(0x7a1420); g.fillRoundedRect(8, 22, 112, 28, 12); g.lineStyle(3, OLF); g.strokeRoundedRect(8, 22, 112, 28, 12);
        g.fillStyle(0x23384a); g.fillRoundedRect(36, 8, 52, 20, 8); g.lineStyle(3, OLF); g.strokeRoundedRect(36, 8, 52, 20, 8);
        g.lineStyle(2, 0xd8e0e6); g.lineBetween(44, 12, 58, 24); g.lineBetween(58, 12, 48, 22); g.lineBetween(70, 10, 80, 24);
        g.fillStyle(0xb8ad94); for (let x = 16; x < 116; x += 16) g.fillCircle(x, 36, 3);
        g.fillStyle(0x0a0606); g.fillTriangle(96, 22, 118, 30, 104, 40);
        [[30, 50], [100, 52]].forEach(([x, y], i) => { g.fillStyle(0x1a1a1a); g.fillCircle(x, y, 10); g.fillStyle(0x5a4a3a); g.fillCircle(x, y, 4); });
        g.fillStyle(0x3a3f46); g.fillEllipse(100, 58, 14, 6);
        g.fillStyle(0x6a0a12, 0.8); g.fillEllipse(20, 30, 10, 5);
    });
    // Pacas de paja
    mk('ccHay', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 12, 56, 50);
        [[4, 32, 56, 26], [10, 8, 44, 26]].forEach(([x, y, w, h]) => {
            g.fillStyle(0x8a7440); g.fillRect(x, y, w, h); g.lineStyle(3, OLF); g.strokeRect(x, y, w, h);
            g.lineStyle(1.5, 0x5a4a24); for (let i = 1; i < 6; i++) g.lineBetween(x + 2, y + i * h / 6, x + w - 2, y + i * h / 6);
            g.lineStyle(2, 0x3a2414); g.lineBetween(x + w * 0.3, y, x + w * 0.3, y + h); g.lineBetween(x + w * 0.7, y, x + w * 0.7, y + h);
        });
        g.fillStyle(0x6a0a12, 0.7); g.fillEllipse(44, 48, 10, 5);
    });
    // Baúl de vestuario entreabierto
    mk('ccTrunk', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 14, 56, 48);
        g.fillStyle(0x3a2414); g.fillRect(4, 24, 56, 32); g.lineStyle(3, OLF); g.strokeRect(4, 24, 56, 32);
        g.fillStyle(0x5a3a22); g.fillRect(2, 10, 60, 14); g.lineStyle(3, OLF); g.strokeRect(2, 10, 60, 14);
        g.fillStyle(0x0a0606); g.fillRect(6, 22, 52, 4);
        g.fillStyle(0x7a1420); g.fillTriangle(14, 24, 26, 24, 18, 40); g.fillStyle(0xb8ad94); g.fillTriangle(30, 24, 42, 24, 38, 36);
        g.lineStyle(2, 0x8a7a5a); g.lineBetween(4, 36, 60, 36); g.lineBetween(20, 24, 20, 56); g.lineBetween(44, 24, 44, 56);
        g.fillStyle(0x9aa2aa); g.fillRect(29, 38, 6, 8);
    });

    // ---------- Escenario: campamento Crystal Lake de noche (Jason) ----------
    // Tierra del bosque con agujas de pino, una baldosa por casilla
    const campDirt = (key, base, seed) => mk(key, T, T, g => {
        tile(g, base, 0x0a0806);
        g.lineStyle(1, 0x3a2e1a, 0.8);
        for (let i = 0; i < 10; i++) {
            const x = 8 + ((i * 29 + seed * 13) % 48), y = 8 + ((i * 41 + seed * 5) % 48), a = (i * 1.7 + seed) % Math.PI;
            g.lineBetween(x, y, x + Math.cos(a) * 6, y + Math.sin(a) * 6);
        }
        g.fillStyle(0x2e281e); g.fillCircle(14 + seed * 3, 44, 2); g.fillCircle(46, 18 + seed * 2, 1.5);
    });
    campDirt('cmDirtA', 0x1a1610, 0); campDirt('cmDirtB', 0x1f1a12, 4);
    // Pino de tres pisos
    mk('cmPine', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 58, 44, 10);
        g.fillStyle(0x3a2414); g.fillRect(29, 50, 6, 10);
        [[52, 25, 24], [40, 20, 12], [28, 14, 2]].forEach(([yb, hw, yt]) => {
            g.fillStyle(0x1f4a2c); g.fillTriangle(32 - hw, yb, 32 + hw, yb, 32, yt);
            g.fillStyle(0x2f6a3c); g.fillTriangle(32 - hw + 6, yb - 3, 32, yb - 3, 32, yt + 6);
            g.lineStyle(2, OLF); g.strokeTriangle(32 - hw, yb, 32 + hw, yb, 32, yt);
        });
    });
    // Cabaña de troncos (2 casillas) con una ventana encendida y otra rota
    mk('cmCabin', 2 * T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 14, 120, 50);
        g.fillStyle(0x2a2420); g.fillRect(2, 4, 124, 16); g.lineStyle(2, OLF); g.strokeRect(2, 4, 124, 16);
        g.lineStyle(1, 0x3e3630); for (let x = 8; x < 124; x += 8) g.lineBetween(x, 5, x - 3, 19);
        for (let y = 20; y < 60; y += 8) {
            g.fillStyle(y % 16 ? 0x6a4424 : 0x5a3a1e); g.fillRect(6, y, 116, 8);
            g.fillStyle(0x8a5a30, 0.5); g.fillRect(6, y + 1, 116, 2);
            g.fillStyle(0x4a2e18); g.fillCircle(6, y + 4, 4); g.fillCircle(122, y + 4, 4);
        }
        g.lineStyle(2, OLF); g.strokeRect(6, 20, 116, 40);
        g.fillStyle(0x1a1408); g.fillRect(20, 28, 24, 18); g.fillStyle(0xd8a83a, 0.8); g.fillRect(22, 30, 20, 14);
        g.lineStyle(2, 0x2a1a0c); g.lineBetween(32, 30, 32, 44); g.lineBetween(22, 37, 42, 37);
        g.lineStyle(2, OLF); g.strokeRect(20, 28, 24, 18);
        g.fillStyle(0x8f0a1e, 0.9); g.fillCircle(38, 40, 3); g.fillRect(36.5, 40, 2, 6);
        g.fillStyle(0x3a2412); g.fillRect(70, 30, 20, 30); g.lineStyle(2, OLF); g.strokeRect(70, 30, 20, 30);
        g.fillStyle(0x9aa2aa); g.fillCircle(86, 46, 1.6);
        g.fillStyle(0x0c0a08); g.fillRect(100, 28, 16, 16);
        g.lineStyle(1, 0x5a5a60); g.lineBetween(100, 28, 110, 40); g.lineBetween(110, 40, 116, 32);
        g.lineStyle(2, OLF); g.strokeRect(100, 28, 16, 16);
    });
    // Canoa volteada (2 casillas) con su remo
    mk('cmCanoe', 2 * T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(66, 46, 120, 22);
        g.fillStyle(0xa8251e); g.fillEllipse(64, 34, 118, 30);
        g.fillStyle(0xc84a3a); g.fillEllipse(60, 28, 96, 10);
        g.lineStyle(3, OLF); g.strokeEllipse(64, 34, 118, 30);
        g.lineStyle(2, 0x6a1410); [36, 64, 92].forEach(x => g.lineBetween(x, 22, x, 46));
        g.lineStyle(4, 0x8a6a3a); g.lineBetween(10, 58, 54, 52);
        g.fillStyle(0x8a6a3a); g.fillEllipse(60, 51, 16, 8); g.lineStyle(2, OLF); g.strokeEllipse(60, 51, 16, 8);
    });
    // Letrero de madera "Camp Crystal Lake" con una mancha de sangre
    {
        const t = scene.textures.createCanvas('cmSign', T, T), c = t.getContext();
        c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(12, 56, 42, 6);
        c.fillStyle = '#3a2414'; c.fillRect(14, 30, 5, 30); c.fillRect(45, 30, 5, 30);
        c.fillStyle = '#7a5430'; c.fillRect(3, 8, 58, 30);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(3, 22, 58, 1);
        c.strokeStyle = '#140a0c'; c.lineWidth = 2; c.strokeRect(3, 8, 58, 30);
        c.fillStyle = '#efe3c8'; c.font = 'bold 9px Impact, sans-serif'; c.textAlign = 'center';
        c.fillText('CAMP', 32, 19); c.fillText('CRYSTAL LAKE', 32, 32);
        c.fillStyle = 'rgba(143,10,30,0.9)'; c.beginPath(); c.arc(52, 14, 4, 0, 7); c.fill(); c.fillRect(51, 14, 2, 10);
        t.refresh();
    }
    // Letrina de madera con la luna en la puerta
    mk('cmOuthouse', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillRect(14, 12, 44, 50);
        g.fillStyle(0x6a4a2a); g.fillRect(12, 14, 40, 46);
        g.lineStyle(1, 0x4a2e18); [22, 32, 42].forEach(x => g.lineBetween(x, 14, x, 60));
        g.lineStyle(2, OLF); g.strokeRect(12, 14, 40, 46);
        g.fillStyle(0x2a2420); g.fillTriangle(8, 15, 56, 15, 32, 2); g.lineStyle(2, OLF); g.strokeTriangle(8, 15, 56, 15, 32, 2);
        g.fillStyle(0x0c0a08); g.fillCircle(32, 26, 5); g.fillStyle(0x6a4a2a); g.fillCircle(34.5, 25, 4.5);
        g.fillStyle(0x9aa2aa); g.fillCircle(45, 40, 1.6);
    });
    // Arbusto
    mk('cmBush', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 50, 56, 20);
        [[20, 38, 14], [44, 38, 14], [32, 28, 16]].forEach(([x, y, r]) => {
            g.fillStyle(0x1f4a2c); g.fillCircle(x, y, r); g.lineStyle(2, OLF); g.strokeCircle(x, y, r);
        });
        g.fillStyle(0x2f6a3c); [[18, 34, 6], [30, 24, 7], [44, 34, 6]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0x3a8a4a); [[16, 31, 2], [28, 21, 3], [42, 31, 2]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    });
    // Rocas con musgo
    mk('cmRock', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 52, 54, 14);
        g.fillStyle(0x4e4e56); g.fillEllipse(30, 38, 44, 32); g.lineStyle(2, OLF); g.strokeEllipse(30, 38, 44, 32);
        g.fillStyle(0x45454c); g.fillEllipse(48, 46, 20, 14); g.lineStyle(2, OLF); g.strokeEllipse(48, 46, 20, 14);
        g.fillStyle(0x6a6a74); g.fillEllipse(24, 30, 18, 8);
        g.fillStyle(0x2f5a2a, 0.8); g.fillEllipse(32, 50, 22, 5);
    });
    // Fogata con anillo de piedras
    mk('cmFire', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(32, 48, 54, 18);
        g.lineStyle(6, 0x4a2e18); g.lineBetween(16, 48, 48, 38); g.lineBetween(16, 38, 48, 48);
        g.fillStyle(0xc2341a); g.fillTriangle(18, 44, 46, 44, 32, 8);
        g.fillStyle(0xff7a1a); g.fillTriangle(22, 44, 42, 44, 29, 16);
        g.fillStyle(0xffd24a); g.fillTriangle(26, 44, 38, 44, 33, 26);
        for (let i = 0; i < 9; i++) {
            const a = Math.PI * 0.05 + i * Math.PI * 0.9 / 8, x = 32 - Math.cos(a) * 24, y = 46 + Math.sin(a) * 9;
            g.fillStyle(0x5a5a62); g.fillCircle(x, y, 4.5); g.lineStyle(2, OLF); g.strokeCircle(x, y, 4.5);
        }
    });
    // Pila de leña
    mk('cmLogs', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 54, 56, 14);
        [[18, 46], [32, 46], [46, 46], [25, 33], [39, 33], [32, 20]].forEach(([x, y]) => {
            g.fillStyle(0x6a4424); g.fillCircle(x, y, 7.5); g.lineStyle(2, OLF); g.strokeCircle(x, y, 7.5);
            g.fillStyle(0xb88a5a); g.fillCircle(x, y, 5); g.lineStyle(1, 0x8a5a30); g.strokeCircle(x, y, 2.5);
        });
    });
    // Arroyo que baja al lago, con piedras en las orillas y el reflejo de la luna
    mk('cmWater', T, T, g => {
        g.fillStyle(0x0e2a36); g.fillRect(0, 0, T, T);
        g.fillStyle(0x163e50); g.fillRect(6, 0, 52, T);
        g.lineStyle(2, 0x3a6a7a, 0.8); [[14, 12, 20], [34, 26, 16], [18, 42, 18], [38, 54, 14]].forEach(([x, y, w]) => g.lineBetween(x, y, x + w, y));
        g.fillStyle(0xd8e4ea, 0.4); g.fillEllipse(40, 34, 10, 4);
        [[3, 10], [2, 30], [4, 50], [61, 18], [62, 40], [60, 58]].forEach(([x, y]) => {
            g.fillStyle(0x4a4a50); g.fillCircle(x, y, 4.5); g.lineStyle(1, OLF); g.strokeCircle(x, y, 4.5);
        });
    });
    // Tocón, con o sin hacha clavada
    const stump = (key, axe) => mk(key, T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 52, 48, 14);
        g.fillStyle(0x4a2e18); g.fillRect(14, 30, 36, 20); g.fillEllipse(32, 50, 36, 10);
        g.lineStyle(2, OLF); g.lineBetween(14, 30, 14, 50); g.lineBetween(50, 30, 50, 50);
        g.lineStyle(1, 0x2e1c0e); [22, 32, 42].forEach(x => g.lineBetween(x, 34, x, 52));
        g.fillStyle(0xb88a5a); g.fillEllipse(32, 30, 36, 14); g.lineStyle(2, OLF); g.strokeEllipse(32, 30, 36, 14);
        g.lineStyle(1, 0x8a5a30); g.strokeEllipse(32, 30, 22, 8); g.strokeEllipse(32, 30, 10, 4);
        if (!axe) return;
        g.lineStyle(5, OLF); g.lineBetween(32, 27, 52, 4);
        g.lineStyle(3, 0x8a6a3a); g.lineBetween(32, 27, 52, 4);
        g.fillStyle(0x9aa2aa); g.fillPoints([{ x: 22, y: 20 }, { x: 36, y: 24 }, { x: 33, y: 32 }, { x: 22, y: 31 }], true);
        g.lineStyle(2, OLF); g.strokePoints([{ x: 22, y: 20 }, { x: 36, y: 24 }, { x: 33, y: 32 }, { x: 22, y: 31 }], true);
        g.fillStyle(0x8f0a1e); g.fillRect(23, 26, 6, 4); g.fillCircle(20, 36, 2);
    });
    stump('cmStumpAxe', true); stump('cmStump', false);
    // Tienda de campaña rasgada
    mk('cmTent', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 56, 58, 12);
        g.fillStyle(0x4a5a2a); g.fillTriangle(4, 56, 60, 56, 32, 10);
        g.fillStyle(0x3a4a20); g.fillTriangle(32, 10, 60, 56, 40, 56);
        g.lineStyle(2, OLF); g.strokeTriangle(4, 56, 60, 56, 32, 10);
        g.fillStyle(0x0c0a08); g.fillTriangle(24, 56, 40, 56, 32, 30);
        g.lineStyle(2, 0x8f0a1e); g.lineBetween(12, 42, 22, 30); g.lineBetween(15, 46, 25, 34);
    });
    // Hielera roja con latas (fiesta en el lago)
    mk('cmCooler', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 54, 52, 12);
        g.fillStyle(0xb3123a); g.fillRoundedRect(10, 26, 44, 28, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(10, 26, 44, 28, 4);
        g.fillStyle(0xefe3c8); g.fillRoundedRect(8, 20, 48, 9, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(8, 20, 48, 9, 3);
        g.fillStyle(0xd8202e); g.fillRect(14, 34, 36, 3);
        [[18, 0x9aa2aa], [30, 0x3a6ad8], [42, 0x9aa2aa]].forEach(([x, col]) => {
            g.fillStyle(col); g.fillRoundedRect(x - 4, 8, 8, 13, 2); g.lineStyle(1.5, OLF); g.strokeRoundedRect(x - 4, 8, 8, 13, 2);
            g.fillStyle(0xffffff, 0.5); g.fillRect(x - 3, 10, 2, 8);
        });
        g.fillStyle(0x7a7f88); g.fillRoundedRect(24, 4, 6, 3, 1);
    });
    // Grabadora (boombox) que sigue sonando
    mk('cmBoombox', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(34, 52, 56, 12);
        g.lineStyle(3, 0x5a5f66); g.beginPath(); g.arc(32, 22, 16, Math.PI, 0); g.strokePath();
        g.fillStyle(0x2a2d33); g.fillRoundedRect(6, 22, 52, 28, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(6, 22, 52, 28, 4);
        [18, 46].forEach(x => {
            g.fillStyle(0x111214); g.fillCircle(x, 37, 9); g.lineStyle(2, 0x7a7f88); g.strokeCircle(x, 37, 9);
            g.fillStyle(0x3a3d44); g.fillCircle(x, 37, 4);
        });
        g.fillStyle(0x0c3a2a); g.fillRect(27, 27, 10, 6); g.fillStyle(0x7dff4a); g.fillRect(28, 28, 3, 4); g.fillRect(32, 29, 2, 3);
        g.fillStyle(0xff4fb8); g.fillRect(28, 40, 3, 3); g.fillStyle(0x9aa2aa); g.fillRect(33, 40, 3, 3);
    });
    // ---------- Escenario: Manhattan de noche bajo la lluvia (Jason in the Big Apple) ----------
    // Asfalto mojado con grietas y charcos; banqueta de losas; paso de cebra; tapa de alcantarilla
    const asphalt = (key, base, seed) => mk(key, T, T, g => {
        g.fillStyle(base); g.fillRect(0, 0, T, T);
        for (let i = 0; i < 26; i++) {
            g.fillStyle(i % 3 ? 0x2a2c32 : 0x101114, 0.9);
            g.fillRect((i * 37 + seed * 11) % 62, (i * 23 + seed * 7) % 62, 2, 2);
        }
        g.lineStyle(1, 0x0c0d10, 0.9);
        g.lineBetween(6 + seed * 4, 10, 18 + seed * 3, 24); g.lineBetween(18 + seed * 3, 24, 14 + seed * 4, 34);
        g.fillStyle(0x3a4a66, 0.35); g.fillEllipse(42 - seed * 3, 46, 22, 7);
        g.fillStyle(0xff4fb8, 0.12); g.fillEllipse(40 - seed * 3, 45, 10, 3);
    });
    asphalt('nyAsphaltA', 0x1c1d22, 0); asphalt('nyAsphaltB', 0x202127, 3);
    const sidewalk = (key, base) => mk(key, T, T, g => {
        tile(g, base, 0x16161a);
        g.lineStyle(1, 0x16161a, 0.8); g.lineBetween(32, 3, 32, 61);
        g.fillStyle(0x0c0c0e, 0.5); g.fillCircle(18, 44, 2.5); g.fillCircle(48, 18, 1.5);
        g.fillStyle(0x6a7a96, 0.18); g.fillRect(5, 5, 54, 4);
    });
    sidewalk('nySidewalkA', 0x3e3f46); sidewalk('nySidewalkB', 0x44454c);
    mk('nyCrosswalk', T, T, g => {
        g.fillStyle(0x1c1d22); g.fillRect(0, 0, T, T);
        g.fillStyle(0xd8d4c4, 0.75); for (let x = 4; x < T; x += 16) g.fillRect(x, 0, 9, T);
        g.fillStyle(0x1c1d22, 0.6); g.fillRect(20, 30, 14, 5); g.fillRect(44, 12, 8, 4);
    });
    mk('nyManhole', T, T, g => {
        g.fillStyle(0x1e1f24); g.fillRect(0, 0, T, T);
        g.fillStyle(0x2e3036); g.fillCircle(32, 32, 20); g.lineStyle(3, 0x101114); g.strokeCircle(32, 32, 20);
        g.lineStyle(2, 0x45474e); g.strokeCircle(32, 32, 13);
        for (let i = -12; i <= 12; i += 6) g.lineBetween(32 + i, 22, 32 + i, 42);
        g.fillStyle(0x3a4a66, 0.3); g.fillEllipse(14, 54, 16, 5);
    });
    // Taxi amarillo (2 casillas) con su letrero en el techo y los faros encendidos
    mk('nyTaxi', 2 * T, T, g => {
        g.fillStyle(0x000000, 0.5); g.fillEllipse(64, 56, 124, 14);
        g.fillStyle(0xe8b818); g.fillRoundedRect(36, 12, 58, 22, 7); g.lineStyle(2, OLF); g.strokeRoundedRect(36, 12, 58, 22, 7);
        g.fillStyle(0x2a3444); g.fillRoundedRect(42, 16, 21, 14, 3); g.fillRoundedRect(67, 16, 21, 14, 3);
        g.fillStyle(0x8ab0d8, 0.4); g.fillRect(44, 17, 6, 12); g.fillRect(69, 17, 6, 12);
        g.fillStyle(0xf2c820); g.fillRoundedRect(4, 30, 120, 22, 6); g.lineStyle(2, OLF); g.strokeRoundedRect(4, 30, 120, 22, 6);
        g.fillStyle(0x16161a); for (let x = 10; x < 120; x += 8) g.fillRect(x, 38, 4, 4);
        g.fillStyle(0xfff4c8); g.fillRect(118, 34, 5, 6); g.fillStyle(0xd8202e); g.fillRect(5, 34, 4, 6);
        g.lineStyle(1, 0xa87a10); g.lineBetween(64, 32, 64, 50);
        g.fillStyle(0xefe3c8); g.fillRoundedRect(56, 5, 18, 8, 2); g.lineStyle(1.5, OLF); g.strokeRoundedRect(56, 5, 18, 8, 2);
        g.fillStyle(0x16161a); g.fillRect(59, 8, 12, 2);
        [28, 100].forEach(x => {
            g.fillStyle(0x111214); g.fillCircle(x, 52, 9); g.lineStyle(2, OLF); g.strokeCircle(x, 52, 9);
            g.fillStyle(0x7a7f88); g.fillCircle(x, 52, 4);
        });
        g.fillStyle(0x8f0a1e, 0.85); g.fillCircle(84, 44, 3); g.fillRect(83, 44, 2, 6);
    });
    // Hidrante rojo
    mk('nyHydrant', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 56, 36, 10);
        g.fillStyle(0xc2172f); g.fillRoundedRect(22, 20, 20, 34, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(22, 20, 20, 34, 4);
        g.fillStyle(0xd83a4a); g.fillRect(25, 22, 4, 30);
        g.fillStyle(0xc2172f); g.fillEllipse(32, 18, 24, 12); g.lineStyle(2, OLF); g.strokeEllipse(32, 18, 24, 12);
        g.fillStyle(0x9a1024); g.fillRect(29, 8, 6, 6); g.lineStyle(1.5, OLF); g.strokeRect(29, 8, 6, 6);
        [[14, 34], [44, 34]].forEach(([x, y]) => { g.fillStyle(0xa8122a); g.fillRect(x, y, 7, 9); g.lineStyle(1.5, OLF); g.strokeRect(x, y, 7, 9); });
        g.fillStyle(0x7a0a1a); g.fillRect(20, 50, 24, 6); g.lineStyle(2, OLF); g.strokeRect(20, 50, 24, 6);
    });
    // Bote de basura metálico con la tapa ladeada
    mk('nyTrash', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(34, 56, 44, 10);
        g.fillStyle(0x6a6e76); g.fillRoundedRect(16, 20, 32, 36, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(16, 20, 32, 36, 3);
        g.lineStyle(1.5, 0x4a4e56); [24, 32, 40].forEach(x => g.lineBetween(x, 22, x, 54));
        g.fillStyle(0x8a8e96); g.fillRect(18, 22, 4, 32);
        g.fillStyle(0x7a7e86); g.fillEllipse(30, 15, 38, 10); g.lineStyle(2, OLF); g.strokeEllipse(30, 15, 38, 10);
        g.fillStyle(0x5a3a1e); g.fillRect(40, 17, 8, 4); g.fillStyle(0xd8d4c4); g.fillRect(20, 17, 7, 3);
    });
    // Bolsas de basura apiladas con una rata
    mk('nyBags', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 56, 58, 12);
        [[18, 42, 15], [44, 42, 15], [30, 26, 14]].forEach(([x, y, r]) => {
            g.fillStyle(0x16171c); g.fillCircle(x, y, r); g.lineStyle(2, 0x050506); g.strokeCircle(x, y, r);
            g.fillStyle(0x4a5066, 0.6); g.fillEllipse(x - 4, y - 6, 8, 4);
        });
        g.lineStyle(2, 0x2a2c32); g.lineBetween(28, 13, 32, 9); g.lineBetween(32, 9, 34, 13);
        g.fillStyle(0x5a5048); g.fillEllipse(48, 54, 14, 7); g.fillCircle(55, 52, 3.5);
        g.fillStyle(0xff4a4a); g.fillCircle(56.5, 51, 1);
        g.lineStyle(1.5, 0x8a7a70); g.lineBetween(41, 55, 34, 58);
    });
    // Caja de periódicos
    mk('nyNews', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 57, 40, 10);
        g.fillStyle(0x1f4a8a); g.fillRect(16, 14, 32, 40); g.lineStyle(2, OLF); g.strokeRect(16, 14, 32, 40);
        g.fillStyle(0x0c1424); g.fillRect(20, 20, 24, 16);
        g.fillStyle(0xd8d4c4); g.fillRect(22, 24, 20, 11); g.fillStyle(0x16161a); g.fillRect(24, 26, 16, 3);
        g.fillStyle(0x8f0a1e); g.fillRect(24, 30, 7, 4);
        g.fillStyle(0x7a7f88); g.fillRect(28, 40, 8, 3); g.fillStyle(0x2a5aa8); g.fillRect(16, 12, 32, 4);
        g.fillStyle(0x3a3d44); g.fillRect(18, 54, 4, 4); g.fillRect(42, 54, 4, 4);
    });
    // Farola encendida
    mk('nyLamp', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 26, 8);
        g.fillStyle(0x2a2d33); g.fillRect(29, 14, 6, 44); g.lineStyle(2, OLF); g.strokeRect(29, 14, 6, 44);
        g.fillStyle(0x1e2026); g.fillRect(25, 52, 14, 6);
        g.lineStyle(4, 0x2a2d33); g.beginPath(); g.arc(40, 14, 8, Math.PI, Math.PI * 1.6); g.strokePath();
        g.fillStyle(0x2a2d33); g.fillRoundedRect(36, 4, 22, 8, 3); g.lineStyle(2, OLF); g.strokeRoundedRect(36, 4, 22, 8, 3);
        g.fillStyle(0xffe8a0); g.fillRect(39, 11, 16, 3);
        g.fillStyle(0xffe8a0, 0.12); g.fillTriangle(36, 13, 58, 13, 47, 40);
    });
    // Entrada del metro: barandal, escalones que bajan y las dos farolas verdes
    mk('nySubway', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 20, 54, 40);
        g.fillStyle(0x0c0c10); g.fillRect(10, 22, 44, 36);
        for (let y = 26, i = 0; y < 58; y += 6, i++) { g.fillStyle(0x34363e - i * 0x040404); g.fillRect(12, y, 40, 4); }
        g.lineStyle(3, 0x1f5a3a); g.strokeRect(10, 22, 44, 36);
        g.lineStyle(2, 0x2f7a4a); [18, 32, 46].forEach(x => g.lineBetween(x, 18, x, 22)); g.lineBetween(10, 18, 54, 18);
        [[8, 10], [56, 10]].forEach(([x, y]) => {
            g.lineStyle(3, 0x1f5a3a); g.lineBetween(x, y + 4, x, 24);
            g.fillStyle(0x7dff9a); g.fillCircle(x, y, 5); g.lineStyle(1.5, OLF); g.strokeCircle(x, y, 5);
            g.fillStyle(0xe8ffe8); g.fillCircle(x - 1.5, y - 1.5, 1.5);
        });
    });
    // Contenedor de basura verde
    mk('nyDumpster', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 62, 10);
        g.fillStyle(0x2a5a3a); g.fillPoints([{ x: 4, y: 22 }, { x: 60, y: 22 }, { x: 56, y: 56 }, { x: 8, y: 56 }], true);
        g.lineStyle(2, OLF); g.strokePoints([{ x: 4, y: 22 }, { x: 60, y: 22 }, { x: 56, y: 56 }, { x: 8, y: 56 }], true);
        g.lineStyle(1.5, 0x1f4a2c); [18, 32, 46].forEach(x => g.lineBetween(x, 26, x, 52));
        g.fillStyle(0x1f4a2c); g.fillPoints([{ x: 2, y: 22 }, { x: 62, y: 22 }, { x: 56, y: 10 }, { x: 8, y: 14 }], true);
        g.lineStyle(2, OLF); g.strokePoints([{ x: 2, y: 22 }, { x: 62, y: 22 }, { x: 56, y: 10 }, { x: 8, y: 14 }], true);
        g.fillStyle(0xd8d4c4); g.fillRect(20, 30, 24, 8); g.fillStyle(0x16161a); g.fillRect(23, 33, 18, 2);
        g.fillStyle(0x8f0a1e, 0.9); g.fillRect(48, 22, 4, 9); g.fillCircle(50, 32, 2.5);
    });
    // Cabina telefónica
    mk('nyBooth', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 59, 40, 8);
        g.fillStyle(0x7a7f88); g.fillRect(16, 4, 32, 54); g.lineStyle(2, OLF); g.strokeRect(16, 4, 32, 54);
        g.fillStyle(0x1f4a8a); g.fillRect(16, 4, 32, 9); g.fillStyle(0xefe3c8); g.fillRect(21, 7, 22, 3);
        g.fillStyle(0x2a3444); g.fillRect(20, 16, 24, 38);
        g.fillStyle(0x8ab0d8, 0.3); g.fillRect(22, 18, 5, 34);
        g.fillStyle(0x3a3d44); g.fillRect(30, 26, 10, 14); g.fillStyle(0x111214); g.fillRect(32, 22, 3, 12);
        g.lineStyle(1.5, 0x111214); g.lineBetween(33, 34, 33, 46);
    });
    // Barrera de obra a rayas con un cono
    mk('nyBarrier', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 60, 10);
        g.lineStyle(3, 0x5a5f66); g.lineBetween(10, 34, 6, 58); g.lineBetween(14, 34, 18, 58); g.lineBetween(50, 34, 46, 58); g.lineBetween(54, 34, 58, 58);
        g.fillStyle(0xefe3c8); g.fillRect(4, 20, 56, 14); g.lineStyle(2, OLF); g.strokeRect(4, 20, 56, 14);
        g.fillStyle(0xff7a1a); for (let x = 4; x < 60; x += 14) g.fillTriangle(x, 34, x + 7, 34, x + 14, 20);
        g.fillStyle(0xffb020); g.fillCircle(10, 16, 3.5); g.fillCircle(54, 16, 3.5);
        g.fillStyle(0xff7a1a); g.fillTriangle(30, 58, 42, 58, 36, 38); g.fillStyle(0xefe3c8); g.fillRect(33, 47, 6, 3);
        g.lineStyle(1.5, OLF); g.strokeTriangle(30, 58, 42, 58, 36, 38);
    });
    // Carrito de hot dogs con sombrilla
    mk('nyHotdog', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 56, 10);
        g.lineStyle(2, 0x7a7f88); g.lineBetween(32, 10, 32, 30);
        g.fillStyle(0xd8202e); g.fillTriangle(6, 14, 32, 2, 32, 14); g.fillStyle(0xf2c820); g.fillTriangle(32, 2, 58, 14, 32, 14);
        g.lineStyle(2, OLF); g.strokeTriangle(6, 14, 58, 14, 32, 2);
        g.fillStyle(0xb8bcc4); g.fillRect(8, 30, 48, 20); g.lineStyle(2, OLF); g.strokeRect(8, 30, 48, 20);
        g.fillStyle(0xd8202e); g.fillRect(8, 38, 48, 5);
        g.fillStyle(0xc87a3a); g.fillRoundedRect(14, 25, 16, 5, 2); g.fillStyle(0xf2c820); g.fillRect(16, 26, 12, 1.5);
        g.fillStyle(0x111214); g.fillCircle(16, 52, 5); g.fillCircle(48, 52, 5);
        g.lineStyle(2, 0x7a7f88); g.lineBetween(56, 34, 62, 28);
    });
    // Buzón azul
    mk('nyMailbox', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 38, 8);
        g.fillStyle(0x1f3a7a); g.fillRect(18, 22, 28, 28); g.fillEllipse(32, 22, 28, 16);
        g.lineStyle(2, OLF); g.strokeEllipse(32, 22, 28, 16); g.strokeRect(18, 22, 28, 28);
        g.fillStyle(0x1f3a7a); g.fillRect(19, 20, 26, 6);
        g.fillStyle(0x0c1424); g.fillRect(24, 24, 16, 3); g.fillStyle(0xefe3c8); g.fillRect(26, 34, 12, 6);
        g.fillStyle(0x16161a); [[20, 50], [40, 50]].forEach(([x, y]) => g.fillRect(x, y, 4, 8));
    });
    // Poste con los letreros verdes de la esquina
    {
        const t = scene.textures.createCanvas('nySign', T, T), c = t.getContext();
        c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(22, 56, 20, 5);
        c.fillStyle = '#2a2d33'; c.fillRect(29, 6, 5, 52);
        c.fillStyle = '#1f6a3a'; c.fillRect(4, 8, 56, 13); c.fillRect(10, 24, 46, 13);
        c.strokeStyle = '#efe3c8'; c.lineWidth = 1; c.strokeRect(5.5, 9.5, 53, 10); c.strokeRect(11.5, 25.5, 43, 10);
        c.fillStyle = '#efe3c8'; c.font = 'bold 9px Impact, sans-serif'; c.textAlign = 'center';
        c.fillText('BROADWAY', 32, 18); c.fillText('W 42 ST', 33, 34);
        c.fillStyle = '#c2172f'; c.fillRect(24, 42, 15, 10); c.fillStyle = '#efe3c8'; c.font = 'bold 7px sans-serif'; c.fillText('STOP', 31.5, 50);
        t.refresh();
    }
    // Muro de ladrillo con un letrero de neón ("HOTEL", con la T fundida)
    {
        const t = scene.textures.createCanvas('nyNeon', T, T), c = t.getContext();
        c.fillStyle = '#4a1e1a'; c.fillRect(0, 0, T, T);
        for (let y = 0; y < T; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < T; x += 16) {
            c.fillStyle = (x * 3 + y) % 5 ? '#6a2a22' : '#5a2420'; c.fillRect(x + 1, y + 1, 14, 6);
        }
        c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(4, 14, 56, 22);
        c.strokeStyle = '#140a0c'; c.lineWidth = 2; c.strokeRect(4, 14, 56, 22);
        c.font = 'bold 14px Impact, sans-serif'; c.textAlign = 'center';
        c.shadowColor = '#ff4fb8'; c.shadowBlur = 6; c.fillStyle = '#ffb0e0';
        c.fillText('HO', 21, 31); c.fillText('EL', 45, 31);
        c.shadowBlur = 0; c.fillStyle = '#5a3a4a'; c.fillText('T', 33, 31);
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 54, T, 10);
        t.refresh();
    }
    // Gota de lluvia y vapor de la alcantarilla
    mk('rainDrop', 2, 14, g => { g.fillStyle(0xaec4e8, 0.55); g.fillRect(0, 0, 2, 14); });
    mk('steam', 96, 96, g => {
        for (let i = 0; i < 8; i++) { g.fillStyle(0xd8dce4, 0.05); g.fillCircle(48, 48, 48 - i * 6); }
    });
    // ---------- Escenario: nave espacial Grendel (Jason X) ----------
    // Placas de metal remachadas; rejilla con luz por debajo; ventana al espacio en el piso
    const deck = (key, base) => mk(key, T, T, g => {
        g.fillStyle(0x0c0e14); g.fillRect(0, 0, T, T);
        g.fillStyle(base); g.fillRect(2, 2, T - 4, T - 4);
        g.fillStyle(0xffffff, 0.06); g.fillRect(2, 2, T - 4, 2);
        g.lineStyle(1, 0x0c0e14, 0.7); g.lineBetween(2, 32, 62, 32);
        g.fillStyle(0x5a6274); [[7, 7], [57, 7], [7, 57], [57, 57], [7, 27], [57, 37]].forEach(([x, y]) => g.fillCircle(x, y, 1.6));
        g.fillStyle(0x000000, 0.25); g.fillRect(14, 40, 12, 3);
    });
    deck('spDeckA', 0x2a2f3a); deck('spDeckB', 0x262a34);
    mk('spGrate', T, T, g => {
        g.fillStyle(0x0c0e14); g.fillRect(0, 0, T, T);
        g.fillStyle(0x0a3a4a); g.fillRect(4, 4, 56, 56);
        g.fillStyle(0x2ad8ff, 0.25); g.fillRect(8, 8, 48, 48);
        g.fillStyle(0x323846); for (let x = 4; x < 60; x += 8) g.fillRect(x, 4, 3, 56);
        g.lineStyle(2, 0x0c0e14); g.strokeRect(4, 4, 56, 56);
    });
    mk('spWindowFloor', T, T, g => {
        g.fillStyle(0x0c0e14); g.fillRect(0, 0, T, T);
        g.fillStyle(0x03040a); g.fillRect(5, 5, 54, 54);
        [[12, 14], [40, 10], [50, 30], [20, 44], [33, 26], [46, 52], [10, 34]].forEach(([x, y], i) => {
            g.fillStyle(0xffffff, 0.5 + (i % 3) * 0.2); g.fillRect(x, y, 2, 2);
        });
        g.fillStyle(0x2a6ad8, 0.9); g.fillCircle(46, 46, 9); g.fillStyle(0x3aa86a, 0.8); g.fillEllipse(43, 44, 8, 5);
        g.fillStyle(0xffffff, 0.08); g.fillTriangle(5, 5, 30, 5, 5, 30);
        g.lineStyle(3, 0x4a5262); g.strokeRect(5, 5, 54, 54);
    });
    // Cápsula criogénica con la escarcha y la luz azul
    mk('spCryo', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 46, 10);
        g.fillStyle(0x4a5262); g.fillRoundedRect(12, 4, 40, 54, 12); g.lineStyle(2, OLF); g.strokeRoundedRect(12, 4, 40, 54, 12);
        g.fillStyle(0x0a2a3a); g.fillRoundedRect(18, 10, 28, 38, 9);
        g.fillStyle(0x6ad8ff, 0.55); g.fillRoundedRect(20, 12, 24, 34, 8);
        g.fillStyle(0x1a3a4a, 0.8); g.fillEllipse(32, 22, 10, 9); g.fillRect(27, 27, 10, 16);
        g.fillStyle(0xe8f8ff, 0.6); g.fillRect(22, 14, 3, 26); g.fillCircle(38, 40, 3);
        g.fillStyle(0x2ad8ff); g.fillRect(24, 51, 16, 3);
    });
    // Consola de mando (2 casillas) con pantallas verdes
    mk('spConsole', 2 * T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 52, 118, 10);
        g.fillStyle(0x3a4150); g.fillRect(4, 10, 120, 44); g.lineStyle(2, OLF); g.strokeRect(4, 10, 120, 44);
        g.fillStyle(0x2a303c); g.fillPoints([{ x: 4, y: 36 }, { x: 124, y: 36 }, { x: 118, y: 54 }, { x: 10, y: 54 }], true);
        [[12, 16], [48, 16], [84, 16]].forEach(([x, y], i) => {
            g.fillStyle(0x061a10); g.fillRect(x, y, 32, 17);
            g.fillStyle(i === 1 ? 0xff3a3a : 0x3aff8a, 0.8);
            for (let k = 0; k < 4; k++) g.fillRect(x + 3, y + 3 + k * 3.5, 6 + ((k * 7 + i * 5) % 20), 1.5);
            g.lineStyle(1.5, OLF); g.strokeRect(x, y, 32, 17);
        });
        [[16, 0xff3a3a], [28, 0xffd23a], [40, 0x3aff8a], [88, 0x2ad8ff], [100, 0xff3a3a], [112, 0x3aff8a]].forEach(([x, c]) => {
            g.fillStyle(c); g.fillRect(x, 42, 6, 4);
        });
        g.fillStyle(0x8f0a1e, 0.9); g.fillCircle(66, 46, 4); g.fillRect(64, 46, 3, 7);
    });
    // Contenedores de carga apilados
    mk('spCrate', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 58, 10);
        [[6, 28, 30, 28, 0x5a6a4a], [30, 26, 28, 30, 0x6a5a3a], [12, 6, 30, 24, 0x4a5a6a]].forEach(([x, y, w, h, c]) => {
            g.fillStyle(c); g.fillRect(x, y, w, h); g.lineStyle(2, OLF); g.strokeRect(x, y, w, h);
            g.fillStyle(0xffd23a); for (let k = 0; k < w - 4; k += 8) g.fillTriangle(x + 2 + k, y + h - 3, x + 6 + k, y + h - 3, x + 4 + k, y + h - 7);
            g.fillStyle(0xffffff, 0.12); g.fillRect(x + 2, y + 2, w - 4, 3);
        });
        g.fillStyle(0xefe3c8); g.fillRect(17, 12, 14, 4);
    });
    // Tanque de gas con medidor
    mk('spTank', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 40, 10);
        g.fillStyle(0x8a95a8); g.fillRoundedRect(18, 8, 28, 50, 12); g.lineStyle(2, OLF); g.strokeRoundedRect(18, 8, 28, 50, 12);
        g.fillStyle(0xb8c4d4); g.fillRect(22, 14, 5, 38);
        g.fillStyle(0xd8202e); g.fillRect(18, 28, 28, 6);
        g.fillStyle(0x3a4150); g.fillRect(28, 2, 8, 8); g.lineStyle(1.5, OLF); g.strokeRect(28, 2, 8, 8);
        g.fillStyle(0xefe3c8); g.fillCircle(32, 44, 5); g.lineStyle(1.5, OLF); g.strokeCircle(32, 44, 5);
        g.lineStyle(1.5, 0xd8202e); g.lineBetween(32, 44, 35, 41);
    });
    // Barriles con franjas de peligro
    mk('spHazard', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 58, 10);
        [[20, 0], [44, 4]].forEach(([x, dy]) => {
            g.fillStyle(0xd8a020); g.fillRect(x - 12, 20 + dy, 24, 34 - dy); g.lineStyle(2, OLF); g.strokeRect(x - 12, 20 + dy, 24, 34 - dy);
            g.fillStyle(0x16161a); for (let k = 0; k < 24; k += 8) g.fillTriangle(x - 12 + k, 30 + dy, x - 8 + k, 30 + dy, x - 12 + k + 8, 38 + dy);
            g.fillStyle(0xe8b830); g.fillEllipse(x, 20 + dy, 24, 8); g.lineStyle(2, OLF); g.strokeEllipse(x, 20 + dy, 24, 8);
        });
        g.fillStyle(0x7dff4a, 0.8); g.fillEllipse(30, 57, 22, 5);
    });
    // Androide desactivado tirado contra la pared
    mk('spDroid', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 54, 10);
        g.fillStyle(0xc8ccd4); g.fillRoundedRect(20, 24, 24, 26, 6); g.lineStyle(2, OLF); g.strokeRoundedRect(20, 24, 24, 26, 6);
        g.fillStyle(0xd8dce4); g.fillCircle(30, 15, 10); g.lineStyle(2, OLF); g.strokeCircle(30, 15, 10);
        g.fillStyle(0x16161a); g.fillRect(24, 12, 13, 4); g.fillStyle(0xff3a3a); g.fillRect(26, 13, 3, 2);
        g.lineStyle(5, OLF); g.lineBetween(18, 30, 8, 48); g.lineBetween(46, 30, 56, 50); g.lineBetween(26, 50, 16, 58); g.lineBetween(38, 50, 50, 58);
        g.lineStyle(3, 0xb8bcc4); g.lineBetween(18, 30, 8, 48); g.lineBetween(46, 30, 56, 50); g.lineBetween(26, 50, 16, 58); g.lineBetween(38, 50, 50, 58);
        g.lineStyle(1.5, 0xffd23a); g.lineBetween(42, 26, 47, 20); g.lineBetween(47, 20, 45, 16);
        g.fillStyle(0x2ad8ff); g.fillRect(28, 32, 8, 3);
    });
    // Proyector holográfico: el campamento falso del holodeck
    mk('spHolo', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 46, 10);
        g.fillStyle(0x3a4150); g.fillEllipse(32, 52, 40, 12); g.lineStyle(2, OLF); g.strokeEllipse(32, 52, 40, 12);
        g.fillStyle(0x2ad8ff, 0.18); g.fillTriangle(14, 50, 50, 50, 32, 4);
        g.fillStyle(0x2ad8ff, 0.7); g.fillTriangle(22, 40, 42, 40, 32, 14);
        g.fillStyle(0x0a3a4a, 0.6); g.fillRect(30, 38, 4, 6);
        g.lineStyle(1, 0xaef0ff, 0.6); [20, 28, 36].forEach(y => g.lineBetween(14 + (52 - y) * 0.3, y, 50 - (52 - y) * 0.3, y));
        g.fillStyle(0xaef0ff); g.fillEllipse(32, 50, 20, 4);
    });
    // Compuerta blindada cerrada
    mk('spDoor', T, T, g => {
        g.fillStyle(0x3a4150); g.fillRect(0, 0, T, T);
        g.fillStyle(0x4a5262); g.fillRect(6, 6, 52, 54); g.lineStyle(2, OLF); g.strokeRect(6, 6, 52, 54);
        g.lineStyle(2, OLF); g.lineBetween(32, 6, 32, 60);
        g.fillStyle(0xd8a020); for (let y = 10; y < 58; y += 12) { g.fillTriangle(8, y, 14, y, 8, y + 6); g.fillTriangle(56, y + 6, 50, y + 6, 56, y); }
        g.fillStyle(0xff3a3a); g.fillRect(26, 14, 12, 4);
        g.fillStyle(0x000000, 0.35); g.fillRect(0, 56, T, 8);
    });
    // Pared del casco con ojo de buey a las estrellas
    mk('spPort', T, T, g => {
        g.fillStyle(0x323846); g.fillRect(0, 0, T, T);
        g.lineStyle(1, 0x1a1e28); g.lineBetween(0, 10, T, 10); g.lineBetween(0, 54, T, 54);
        g.fillStyle(0x03040a); g.fillCircle(32, 32, 17);
        g.fillStyle(0xffffff); [[24, 26], [38, 22], [30, 40], [42, 36]].forEach(([x, y]) => g.fillRect(x, y, 1.5, 1.5));
        g.fillStyle(0xd8a86a, 0.9); g.fillCircle(38, 38, 6);
        g.lineStyle(4, 0x6a7284); g.strokeCircle(32, 32, 18); g.lineStyle(2, OLF); g.strokeCircle(32, 32, 20);
        g.fillStyle(0x8a95a8); [0, 1, 2, 3, 4, 5].forEach(i => g.fillCircle(32 + Math.cos(i * 1.047) * 18, 32 + Math.sin(i * 1.047) * 18, 1.6));
        g.fillStyle(0x000000, 0.35); g.fillRect(0, 56, T, 8);
    });
    // Tubos y válvulas que salen del piso
    mk('spPipes', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 56, 10);
        [[14, 0x6a7284], [30, 0x8a95a8], [46, 0x5a6274]].forEach(([x, c], i) => {
            g.fillStyle(c); g.fillRect(x - 5, 6 + i * 4, 10, 52 - i * 4); g.lineStyle(2, OLF); g.strokeRect(x - 5, 6 + i * 4, 10, 52 - i * 4);
            g.fillStyle(0xffffff, 0.15); g.fillRect(x - 3, 8 + i * 4, 2, 48 - i * 4);
            g.fillStyle(0x3a4150); g.fillRect(x - 7, 20 + i * 8, 14, 4);
        });
        g.fillStyle(0xd8202e); g.fillCircle(30, 34, 5); g.lineStyle(1.5, OLF); g.strokeCircle(30, 34, 5);
        g.fillStyle(0xe8f8ff, 0.5); g.fillCircle(50, 8, 4); g.fillCircle(54, 4, 2.5);
    });
    // Camilla médica con una sábana manchada
    mk('spBed', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 58, 10);
        g.lineStyle(3, 0x8a95a8); g.lineBetween(10, 38, 10, 56); g.lineBetween(54, 38, 54, 56);
        g.fillStyle(0xb8c4d4); g.fillRect(4, 28, 56, 12); g.lineStyle(2, OLF); g.strokeRect(4, 28, 56, 12);
        g.fillStyle(0xe8ecf0); g.fillRoundedRect(6, 20, 52, 12, 4); g.lineStyle(1.5, OLF); g.strokeRoundedRect(6, 20, 52, 12, 4);
        g.fillStyle(0xd8dce4); g.fillEllipse(14, 22, 12, 7);
        g.fillStyle(0x8f0a1e, 0.85); g.fillEllipse(38, 26, 14, 6); g.fillRect(44, 30, 2, 9);
        g.lineStyle(2, 0x6a7284); g.lineBetween(56, 20, 56, 4); g.fillStyle(0xaef0ff, 0.7); g.fillRoundedRect(52, 4, 8, 10, 2);
    });
    // Letrero con el nombre de la nave
    {
        const t = scene.textures.createCanvas('spSign', T, T), c = t.getContext();
        c.fillStyle = '#323846'; c.fillRect(0, 0, T, T);
        c.fillStyle = '#1a1e28'; c.fillRect(4, 12, 56, 30);
        c.strokeStyle = '#6a7284'; c.lineWidth = 2; c.strokeRect(4, 12, 56, 30);
        c.font = 'bold 11px Impact, sans-serif'; c.textAlign = 'center';
        c.fillStyle = '#ffd23a'; c.fillText('GRENDEL', 32, 26);
        c.font = 'bold 8px sans-serif'; c.fillStyle = '#2ad8ff'; c.fillText('DECK 4  ·  LAB', 32, 37);
        c.fillStyle = '#d8a020'; for (let x = 0; x < T; x += 10) { c.beginPath(); c.moveTo(x, 50); c.lineTo(x + 5, 50); c.lineTo(x + 10, 56); c.lineTo(x + 5, 56); c.fill(); }
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 56, T, 8);
        t.refresh();
    }
    // Chispa y estrella para el ambiente
    mk('spStar', 4, 4, g => { g.fillStyle(0xffffff); g.fillRect(1, 0, 2, 4); g.fillRect(0, 1, 4, 2); });
    // ---------- Escenario: la cabaña de Jason en el bosque, con el altar a su madre ----------
    // Piso de tablones viejos (adentro)
    const planks = (key, base, seed) => mk(key, T, T, g => {
        g.fillStyle(0x140c08); g.fillRect(0, 0, T, T);
        for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 ? base : base - 0x060402); g.fillRect(1, i * 16 + 1, T - 2, 14);
            g.fillStyle(0xffffff, 0.05); g.fillRect(1, i * 16 + 1, T - 2, 2);
            const j = 10 + ((i * 23 + seed * 17) % 40); g.fillStyle(0x140c08); g.fillRect(j, i * 16 + 1, 2, 14);
            g.fillStyle(0x2a1a10); g.fillCircle(j - 5, i * 16 + 8, 1.2); g.fillCircle(j + 6, i * 16 + 8, 1.2);
        }
        g.fillStyle(0x3a0a10, 0.5); g.fillEllipse(20 + seed * 18, 40 - seed * 12, 10, 5);
    });
    planks('shFloorA', 0x4a3220, 0); planks('shFloorB', 0x45301e, 1);
    // Paredes de troncos: horizontal (fila de arriba), vertical (lado izquierdo) y esquina
    mk('shWallH', T, T, g => {
        g.fillStyle(0x1a120c); g.fillRect(0, 0, T, T);
        for (let y = 4; y < 60; y += 11) {
            g.fillStyle(y % 22 ? 0x6a4424 : 0x5a3a1e); g.fillRoundedRect(0, y, T, 10, 4);
            g.fillStyle(0x8a5a30, 0.5); g.fillRect(0, y + 2, T, 2);
            g.lineStyle(1, OLF); g.strokeRoundedRect(0, y, T, 10, 4);
        }
        g.fillStyle(0x000000, 0.35); g.fillRect(0, 56, T, 8);
    });
    mk('shWallV', T, T, g => {
        g.fillStyle(0x1a120c); g.fillRect(0, 0, T, T);
        for (let x = 4; x < 60; x += 11) {
            g.fillStyle(x % 22 ? 0x6a4424 : 0x5a3a1e); g.fillRoundedRect(x, 0, 10, T, 4);
            g.fillStyle(0x8a5a30, 0.5); g.fillRect(x + 2, 0, 2, T);
            g.lineStyle(1, OLF); g.strokeRoundedRect(x, 0, 10, T, 4);
        }
        g.fillStyle(0x000000, 0.3); g.fillRect(56, 0, 8, T);
    });
    mk('shCorner', T, T, g => {
        g.fillStyle(0x1a120c); g.fillRect(0, 0, T, T);
        for (let i = 0; i < 4; i++) {
            const r = 26 - i * 6; g.fillStyle(i % 2 ? 0x6a4424 : 0x8a5a30); g.fillCircle(32, 32, r);
        }
        g.lineStyle(2, OLF); g.strokeCircle(32, 32, 26);
        g.lineStyle(1, 0x4a2e18); g.strokeCircle(32, 32, 14); g.strokeCircle(32, 32, 6);
    });
    // Pared con el marco de la puerta: la hoja abierta pegada a la pared, junto al hueco
    mk('shWallDoor', T, T, g => {
        g.fillStyle(0x1a120c); g.fillRect(0, 0, T, T);
        for (let x = 4; x < 60; x += 11) {
            g.fillStyle(x % 22 ? 0x6a4424 : 0x5a3a1e); g.fillRoundedRect(x, 0, 10, T, 4);
            g.lineStyle(1, OLF); g.strokeRoundedRect(x, 0, 10, T, 4);
        }
        g.fillStyle(0x3a2412); g.fillRect(40, 8, 24, 56); g.lineStyle(2, OLF); g.strokeRect(40, 8, 24, 56);
        g.lineStyle(1, 0x2a1a0c); [48, 56].forEach(x => g.lineBetween(x, 10, x, 62));
        g.fillStyle(0x9aa2aa); g.fillCircle(44, 38, 2);
    });
    // Altar: mesa con mantel, velas y el suéter de la madre (la cabeza se dibuja encima con 'momHead')
    mk('shAltar', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 60, 10);
        g.lineStyle(4, 0x3a2412); g.lineBetween(8, 40, 8, 58); g.lineBetween(56, 40, 56, 58);
        g.fillStyle(0x4a2e18); g.fillRect(2, 34, 60, 8); g.lineStyle(2, OLF); g.strokeRect(2, 34, 60, 8);
        g.fillStyle(0x6a6a5a); g.fillPoints([{ x: 4, y: 36 }, { x: 60, y: 36 }, { x: 56, y: 52 }, { x: 8, y: 52 }], true);
        g.fillStyle(0x4a5a7a); g.fillRoundedRect(14, 26, 36, 14, 4); g.lineStyle(1.5, OLF); g.strokeRoundedRect(14, 26, 36, 14, 4);
        g.lineStyle(1, 0x3a4a6a); [20, 26, 32, 38, 44].forEach(x => g.lineBetween(x, 28, x, 38));
        [[6, 22], [58, 22], [10, 28]].forEach(([x, y]) => {
            g.fillStyle(0xe8dcc0); g.fillRect(x - 2, y, 4, 34 - y); g.lineStyle(1, OLF); g.strokeRect(x - 2, y, 4, 34 - y);
            g.fillStyle(0xffb020); g.fillEllipse(x, y - 4, 4, 7); g.fillStyle(0xfff2a0); g.fillEllipse(x, y - 3, 2, 3);
        });
        g.fillStyle(0xe8dcc0, 0.8); g.fillRect(52, 34, 3, 6);
    });
    // Cama sucia con el colchón manchado
    mk('shBed', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 62, 10);
        g.fillStyle(0x3a2412); g.fillRect(2, 22, 60, 30); g.lineStyle(2, OLF); g.strokeRect(2, 22, 60, 30);
        g.fillStyle(0x8a7a5a); g.fillRect(6, 24, 52, 22);
        g.fillStyle(0x6a5a3a); g.fillEllipse(30, 34, 22, 10); g.fillStyle(0x5a1a14, 0.8); g.fillEllipse(44, 38, 12, 7);
        g.fillStyle(0xb8a888); g.fillRoundedRect(8, 26, 14, 9, 3);
        g.fillStyle(0x3a2412); g.fillRect(2, 12, 6, 42); g.lineStyle(2, OLF); g.strokeRect(2, 12, 6, 42);
    });
    // Estufa de leña con el fuego encendido
    mk('shStove', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 48, 10);
        g.fillStyle(0x2a2a30); g.fillRect(26, 0, 10, 20); g.lineStyle(2, OLF); g.strokeRect(26, 0, 10, 20);
        g.fillStyle(0x34343c); g.fillRoundedRect(10, 18, 44, 34, 4); g.lineStyle(2, OLF); g.strokeRoundedRect(10, 18, 44, 34, 4);
        g.fillStyle(0x0c0a08); g.fillRect(18, 28, 28, 16);
        g.fillStyle(0xc2341a); g.fillTriangle(20, 44, 44, 44, 32, 30); g.fillStyle(0xffb020); g.fillTriangle(25, 44, 39, 44, 32, 35);
        g.lineStyle(2, 0x5a5a62); [24, 32, 40].forEach(x => g.lineBetween(x, 28, x, 44));
        g.fillStyle(0x2a2a30); g.fillRect(12, 52, 6, 6); g.fillRect(46, 52, 6, 6);
    });
    // Mesa con un quinqué encendido
    mk('shTable', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 54, 10);
        g.lineStyle(4, 0x3a2412); g.lineBetween(12, 36, 10, 58); g.lineBetween(52, 36, 54, 58);
        g.fillStyle(0x5a3a1e); g.fillRect(4, 30, 56, 9); g.lineStyle(2, OLF); g.strokeRect(4, 30, 56, 9);
        g.fillStyle(0x8a6a3a); g.fillRect(24, 26, 16, 5); g.fillStyle(0xd8a83a, 0.85); g.fillEllipse(32, 18, 12, 16);
        g.lineStyle(1.5, OLF); g.strokeEllipse(32, 18, 12, 16); g.fillStyle(0xfff2a0); g.fillEllipse(32, 19, 4, 7);
        g.fillStyle(0x2a2a30); g.fillRect(29, 6, 6, 4);
        g.fillStyle(0xd8d4c4); g.fillRect(44, 26, 10, 4); g.fillStyle(0x9aa2aa); g.fillRect(8, 27, 12, 3);
    });
    // Repisa con frascos
    mk('shShelf', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillRect(6, 54, 54, 8);
        g.fillStyle(0x3a2412); g.fillRect(4, 4, 56, 52); g.lineStyle(2, OLF); g.strokeRect(4, 4, 56, 52);
        g.fillStyle(0x1a120c); g.fillRect(8, 8, 48, 18); g.fillRect(8, 32, 48, 20);
        [[14, 12, 0x6a8a4a], [24, 14, 0x8a6a3a], [34, 10, 0x5a1a14], [46, 13, 0x9aa28a]].forEach(([x, y, c]) => {
            g.fillStyle(c); g.fillRect(x - 4, y, 8, 26 - y); g.lineStyle(1, OLF); g.strokeRect(x - 4, y, 8, 26 - y);
        });
        [[16, 38, 0xb8a888], [30, 36, 0x4a5a3a], [44, 40, 0x8a2a1a]].forEach(([x, y, c]) => {
            g.fillStyle(c); g.fillRect(x - 5, y, 10, 52 - y); g.lineStyle(1, OLF); g.strokeRect(x - 5, y, 10, 52 - y);
        });
    });
    // Baúl viejo con cerrojo
    mk('shTrunk', T, T, g => {
        g.fillStyle(0x000000, 0.45); g.fillEllipse(32, 58, 58, 10);
        g.fillStyle(0x5a3a1e); g.fillRect(6, 28, 52, 26); g.lineStyle(2, OLF); g.strokeRect(6, 28, 52, 26);
        g.fillStyle(0x6a4424); g.fillRoundedRect(6, 18, 52, 14, 6); g.lineStyle(2, OLF); g.strokeRoundedRect(6, 18, 52, 14, 6);
        g.fillStyle(0x7a7f88); [14, 50].forEach(x => g.fillRect(x - 2, 18, 4, 36));
        g.fillStyle(0xb8a040); g.fillRect(28, 30, 8, 8); g.lineStyle(1, OLF); g.strokeRect(28, 30, 8, 8);
    });
    // Montón de huesos y un cráneo
    mk('shBones', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(32, 54, 54, 12);
        g.lineStyle(5, OLF);
        [[10, 48, 40, 40], [20, 36, 52, 50], [14, 54, 46, 54]].forEach(([a, b, c, d]) => g.lineBetween(a, b, c, d));
        g.lineStyle(3, 0xe0d4b8);
        [[10, 48, 40, 40], [20, 36, 52, 50], [14, 54, 46, 54]].forEach(([a, b, c, d]) => g.lineBetween(a, b, c, d));
        g.fillStyle(0xe0d4b8); g.fillCircle(32, 30, 11); g.fillRect(26, 36, 12, 8); g.lineStyle(2, OLF); g.strokeCircle(32, 30, 11);
        g.fillStyle(0x16100c); g.fillCircle(28, 30, 3); g.fillCircle(36, 30, 3); g.fillTriangle(31, 34, 33, 34, 32, 37);
        g.fillStyle(0x8f0a1e, 0.8); g.fillEllipse(46, 46, 10, 4);
    });
    // Velas sueltas en el piso
    mk('shCandles', T, T, g => {
        g.fillStyle(0x000000, 0.4); g.fillEllipse(32, 54, 48, 10);
        g.fillStyle(0xe8dcc0, 0.5); g.fillEllipse(32, 52, 40, 8);
        [[18, 30, 16], [32, 22, 24], [46, 32, 14], [26, 38, 10], [40, 40, 9]].forEach(([x, y, h]) => {
            g.fillStyle(0xe8dcc0); g.fillRect(x - 3, y, 6, h); g.lineStyle(1, OLF); g.strokeRect(x - 3, y, 6, h);
            g.fillStyle(0xffb020); g.fillEllipse(x, y - 4, 4, 7); g.fillStyle(0xfff2a0); g.fillEllipse(x, y - 3, 2, 3);
        });
    });
    // Niebla del lago que cruza el tablero
    mk('fog', 256, 128, g => {
        for (let i = 0; i < 10; i++) { g.fillStyle(0xc8d4dc, 0.03); g.fillEllipse(128, 64, 256 - i * 22, 128 - i * 11); }
    });

    // Foco blanco que barre la pista del circo
    mk('spot', 256, 256, g => {
        for (let r = 128; r > 0; r -= 8) { g.fillStyle(0xfff4e8, 0.025); g.fillCircle(128, 128, r); }
    });

    // Luz roja que acompaña al asesino
    mk('light', 256, 256, g => {
        for (let r = 128; r > 0; r -= 8) { g.fillStyle(0xff1030, 0.03); g.fillCircle(128, 128, r); }
    });

    // Mancha caricaturesca
    mk('splat', T, T, g => {
        g.fillStyle(0x8f0a1e, 0.9);
        g.fillEllipse(32, 34, 40, 26);
        [[12, 26, 6], [52, 30, 5], [20, 50, 5], [46, 48, 4], [32, 14, 4], [56, 42, 3]]
            .forEach(([x, y, r]) => g.fillCircle(x, y, r));
        g.fillStyle(0xc2172f, 0.6); g.fillEllipse(28, 30, 16, 8);
    });

    mk('px', 6, 6, g => { g.fillStyle(0xffffff); g.fillRect(0, 0, 6, 6); });
    // Indicador de fiesta sobre las víctimas: notas musicales de colores y burbujas
    // (con el color ya dibujado: el tinte no funciona en el modo Canvas)
    const note = (key, color) => mk(key, 16, 20, g => {
        g.fillStyle(0x000000, 0.7); g.fillEllipse(6, 16, 10, 7); g.fillRect(9, 2, 3, 15);
        g.fillStyle(color); g.fillEllipse(5, 15, 8, 6); g.fillRect(8, 2, 2, 13);
        g.fillTriangle(8, 2, 15, 6, 8, 8);
    });
    note('partyNotePink', 0xff4fb8); note('partyNoteGreen', 0x7dff4a);
    const heart = (key, color) => mk(key, 16, 16, g => {
        g.fillStyle(0x000000, 0.7); g.fillCircle(5, 6, 4.5); g.fillCircle(11, 6, 4.5); g.fillTriangle(0.8, 7.5, 15.2, 7.5, 8, 15.5);
        g.fillStyle(color); g.fillCircle(5, 6, 3.5); g.fillCircle(11, 6, 3.5); g.fillTriangle(1.8, 7.2, 14.2, 7.2, 8, 14);
        g.fillStyle(0xffffff, 0.7); g.fillCircle(4, 4.8, 1.2);
    });
    heart('partyHeartRed', 0xff1f3d); heart('partyHeartPink', 0xff7ac8);
    mk('partyBubble', 10, 10, g => {
        g.lineStyle(1.5, 0xffe46a, 0.95); g.strokeCircle(5, 5, 3.5);
        g.fillStyle(0xfff6c8, 0.9); g.fillCircle(3.8, 3.8, 1);
    });
    mk('ring', 72, 72, g => { g.lineStyle(4, 0xff1f3d, 1); g.strokeCircle(36, 36, 32); });

    // Viñeta oscura
    const tex = scene.textures.createCanvas('vignette', W, H);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(W / 2, H / 2 + 20, 180, W / 2, H / 2, 520);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    tex.refresh();
}
