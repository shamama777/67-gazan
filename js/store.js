/**
 * Модуль Магазина Vapor
 */
import { audio } from './audio.js';

// Procedural SVG Game Artwork Generators to guarantee visual excellence without external links
export const gameArt = {
    shooter: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%23050508"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%22" stop-color="%23132e4f"/><stop offset="100%22" stop-color="%23050508"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><path d="M200 80 L180 130 L190 120 L210 120 L220 130 Z" stroke="%2300ffff" stroke-width="3" fill="none"/><line x1="200" y1="70" x2="200" y2="20" stroke="%23ffff00" stroke-width="2"/><circle cx="80" cy="180" r="15" stroke="%23ff3b30" stroke-width="2" fill="none"/><circle cx="320" cy="90" r="25" stroke="%238e8e93" stroke-width="2" fill="none"/><text x="50%22" y="210" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="%23fff" text-anchor="middle" letter-spacing="4">SPACE DEFENDER</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%23050508"><circle cx="120" cy="200" r="2" fill="%23fff"/><circle cx="560" cy="80" r="1.5" fill="%23fff"/><path d="M400 350 L380 400 L390 395 L410 395 L420 400 Z" stroke="%2300ffff" stroke-width="4" fill="none"/><circle cx="350" cy="150" r="30" stroke="%238e8e93" stroke-width="3" fill="none"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%2300ffff" text-anchor="middle">ИГРОВОЙ ПРОЦЕСС: РЕТРО-БОЙ В КОСМОСЕ</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%23050508"><path d="M400 350 L370 410 L430 410 Z" stroke="%2300ffff" stroke-width="4" fill="none"/><line x1="375" y1="340" x2="375" y2="100" stroke="%23ffff00" stroke-width="3"/><line x1="425" y1="340" x2="425" y2="100" stroke="%23ffff00" stroke-width="3"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%23ffcc00" text-anchor="middle">БОНУС: АКТИВИРОВАН ТРОЙНОЙ ВЫСТРЕЛ</text></svg>`
        ]
    },
    snake: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%2306050b"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%22" stop-color="%232b071e"/><stop offset="100%22" stop-color="%2306050b"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><path d="M40 100 H160 V150 H240 V80" stroke="%2300ffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="240" cy="50" r="10" fill="%23ff007f"/><text x="50%22" y="210" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="%23fff" text-anchor="middle" letter-spacing="4">NEON SNAKE</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%2306050b"><path d="M100 200 H300 V350 H550" stroke="%2300ffff" stroke-width="16" fill="none" stroke-linejoin="round"/><circle cx="600" cy="350" r="14" fill="%23ff007f"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%2300ffff" text-anchor="middle">ЗМЕЙКА В НЕОНОВОМ КИБЕР-ПРОСТРАНСТВЕ</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%2306050b"><path d="M200 400 V150 H500" stroke="%2300ffff" stroke-width="16" fill="none" stroke-linejoin="round"/><circle cx="550" cy="150" r="15" fill="%23ffff00"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%23ffff00" text-anchor="middle">БОНУСЫ НА СКОРОСТЬ И УДВОЕНИЕ ОЧКОВ</text></svg>`
        ]
    },
    maze: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%230a0912"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%22" stop-color="%2317112c"/><stop offset="100%22" stop-color="%230a0912"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><path d="M80 50 H320 V120 H180 V180 H80" stroke="%232d2554" stroke-width="14" fill="none" stroke-linejoin="round"/><circle cx="250" cy="150" r="12" fill="%2339ff14"/><circle cx="120" cy="120" r="8" fill="%23ffff00"/><text x="50%22" y="225" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="%23fff" text-anchor="middle" letter-spacing="4">MAZE ESCAPER</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%230a0912"><rect x="100" y="100" width="600" height="300" stroke="%232d2554" stroke-width="8" fill="none"/><circle cx="200" cy="200" r="20" fill="%2339ff14"/><circle cx="500" cy="200" r="16" fill="%23ff3b30"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%2339ff14" text-anchor="middle">ОПАСНОСТЬ: ИЗБЕГАЙТЕ ПАТРУЛЬНЫХ РОБОТОВ</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%230a0912"><path d="M200 150 H600 V350" stroke="%232d2554" stroke-width="8" fill="none"/><circle cx="550" cy="300" r="15" fill="%23ffff00"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%23ffff00" text-anchor="middle">НАЙДИТЕ КЛЮЧ, ЧТОБЫ ОТПЕРЕТЬ ВЫХОД</text></svg>`
        ]
    },
    cyberpunk: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%230d0912"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%22" stop-color="%23ff0055"/><stop offset="50%22" stop-color="%233a0055"/><stop offset="100%22" stop-color="%230d0912"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><path d="M20 250 L80 120 L120 180 L180 80 L220 140 L300 60 L380 250 Z" fill="%23050209" opacity="0.8"/><text x="50%22" y="140" font-family="Outfit, sans-serif" font-weight="900" font-size="34" fill="%23ffff00" text-anchor="middle" font-style="italic" letter-spacing="2">CYBERPUNK 2088</text><text x="50%22" y="170" font-family="Inter" font-size="11" fill="%23ff00ff" text-anchor="middle" letter-spacing="1">AAA NEXT-GEN SIMULATOR</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%230d0912"><path d="M0 400 L800 400" stroke="%2300ffff" stroke-width="4"/><path d="M50 400 L120 200 L250 400" fill="%23050209"/><text x="400" y="250" font-family="Outfit" font-weight="900" font-size="42" fill="%23ff0055" text-anchor="middle">NEXT-GEN GRAPHICS (AAA)</text><text x="400" y="300" font-family="Inter" font-size="16" fill="%23c7d5e0" text-anchor="middle">Симулятор будущего с невероятной детализацией</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%230d0912"><circle cx="400" cy="200" r="80" fill="none" stroke="%23ffff00" stroke-width="8"/><text x="400" y="460" font-family="Inter" font-weight="700" font-size="20" fill="%23ffff00" text-anchor="middle">ПОЛНАЯ СВОБОДА В ОТКРЫТОМ МИРЕ МЕГА-ГОРОДА</text></svg>`
        ]
    },
    mario: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%235c94fc"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%22" stop-color="%235c94fc"/><stop offset="100%22" stop-color="%23b8d0fc"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><rect x="0" y="200" width="400" height="50" fill="%238B4513"/><rect x="0" y="190" width="400" height="10" fill="%234c6b22"/><rect x="250" y="130" width="60" height="60" fill="%236e7a8a"/><rect x="80" y="110" width="40" height="40" fill="%23b87333"/><text x="50%22" y="70" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="%23fff" text-anchor="middle" letter-spacing="3" stroke="%23e52521" stroke-width="1.5">VAPOR MARIO</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%235c94fc"><rect x="0" y="440" width="800" height="60" fill="%238B4513"/><rect x="300" y="340" width="60" height="100" fill="%234c6b22"/><rect x="150" y="400" width="24" height="40" fill="%23e52521"/><text x="400" y="250" font-family="Outfit" font-weight="900" font-size="34" fill="%23fff" text-anchor="middle">РЕТРО ПЛАТФОРМЕР С ГРАВИТАЦИЕЙ</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%235c94fc"><rect x="0" y="440" width="800" height="60" fill="%238B4513"/><circle cx="500" cy="200" r="15" fill="%23ffcc00"/><text x="400" y="250" font-family="Outfit" font-weight="900" font-size="34" fill="%23ffcc00" text-anchor="middle">СОБИРАЙТЕ ЗОЛОТЫЕ МОНЕТЫ</text></svg>`
        ]
    },
    sonic: {
        cover: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250" style="background:%23060514"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%22" stop-color="%230055d4"/><stop offset="100%22" stop-color="%23060514"/></linearGradient></defs><rect width="400" height="250" fill="url(%23g)"/><circle cx="200" cy="110" r="25" fill="none" stroke="%23ffff00" stroke-width="4"/><circle cx="100" cy="120" r="16" fill="%2300ffff" stroke="%23fff" stroke-width="2"/><path d="M30 190 H370" stroke="%23ff007f" stroke-width="6"/><text x="50%22" y="220" font-family="Outfit, sans-serif" font-weight="900" font-size="28" fill="%23fff" text-anchor="middle" letter-spacing="4">NEON SONIC</text></svg>`,
        screens: [
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%23060514"><circle cx="200" cy="250" r="20" fill="%2300ffff" stroke="%23fff" stroke-width="3"/><path d="M0 400 H800" stroke="%2300ffff" stroke-width="6"/><text x="400" y="200" font-family="Outfit" font-weight="900" font-size="34" fill="%2300ffff" text-anchor="middle">БЕШЕНАЯ СКОРОСТЬ И ДВОЙНЫЕ ПРЫЖКИ</text></svg>`,
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" style="background:%23060514"><circle cx="400" cy="180" r="14" fill="none" stroke="%23ffff00" stroke-width="3"/><text x="400" y="250" font-family="Outfit" font-weight="900" font-size="34" fill="%23ffff00" text-anchor="middle">СОБИРАЙТЕ СВЕТЯЩИЕСЯ КОЛЬЦА</text></svg>`
        ]
    }
};

export const gamesData = [
    {
        id: 'shooter',
        title: 'Космический Защитник',
        tagline: 'Ураганный ретро-шутер против орд космических пришельцев!',
        description: 'Приготовьтесь к эпическому сражению в глубоком космосе! "Космический Защитник" возвращает классическую аркадную эстетику в неоновом оформлении. Управляйте маневренным истребителем, уклоняйтесь от гигантских астероидов, собирайте усилители (энергетические щиты, тройные лазеры) и уничтожайте вражеские крейсеры. Испытайте свои рефлексы и поставьте абсолютный рекорд галактики!',
        price: 0,
        genre: 'action',
        genreLabel: 'Экшен / Ретро-шутер',
        tags: ['Ретро', 'Космос', 'Аркада', 'Canvas'],
        rating: 94,
        developer: 'Vapor Retro Studios',
        publisher: 'Vapor Games',
        releaseDate: '15 мая 2026',
        coverImg: gameArt.shooter.cover,
        screenshots: gameArt.shooter.screens,
        specs: {
            os: 'Windows 10/11, macOS, Linux',
            cpu: 'Любой современный процессор',
            ram: '512 MB ОЗУ',
            gpu: 'Встроенная видеокарта с поддержкой HTML5 Canvas',
            disk: '10 MB свободного места'
        },
        reviews: [
            { username: 'RetroPlayer', rating: 'positive', text: 'Потрясающая динамика! Физика частиц взрыва просто шикарная. Вспомнил детство в залах игровых автоматов!', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroPlayer', gamesOwned: 4 },
            { username: 'NeoGamer', rating: 'positive', text: 'Очень плавное управление мышкой! И звуки приятные, уши не режет.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NeoGamer', gamesOwned: 12 }
        ]
    },
    {
        id: 'snake',
        title: 'Кибер-Змейка',
        tagline: 'Легендарная змейка в неоновом киберпространстве с мощными бонусами!',
        description: 'Классика, переосмысленная в стиле киберпанк! Управляйте светящимся неоновым питоном на матричной сетке. Поедайте энергетические ядра, чтобы расти, но будьте предельно осторожны — сетка ограничена силовыми стенами, а собственный хвост смертельно опасен. Собирайте редкие золотые и лазурные плоды для активации замедления времени и умножения очков!',
        price: 199,
        genre: 'arcade',
        genreLabel: 'Аркада / Казуальная',
        tags: ['Неон', 'Змейка', 'Казуальная', 'Киберпанк'],
        rating: 88,
        developer: 'Matrix Softworks',
        publisher: 'Vapor Games',
        releaseDate: '1 апреля 2026',
        coverImg: gameArt.snake.cover,
        screenshots: gameArt.snake.screens,
        specs: {
            os: 'Windows 10/11, macOS, Linux',
            cpu: 'Intel Celeron / AMD Athlon',
            ram: '1 GB ОЗУ',
            gpu: 'Intel HD Graphics 4000',
            disk: '15 MB свободного места'
        },
        reviews: [
            { username: 'AppleEater', rating: 'positive', text: 'Яркие сочные цвета! Ачивка "Гипердрайв" заставила меня изрядно попотеть, крутая игра.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=AppleEater', gamesOwned: 8 },
            { username: 'SnakeHater', rating: 'negative', text: 'Игра хорошая, но слишком быстро разгоняется! После 20 съеденных ядер управлять нереально.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SnakeHater', gamesOwned: 2 }
        ]
    },
    {
        id: 'maze',
        title: 'Побег из Лабиринта',
        tagline: 'Процедурные подземелья, хитрые патрули и захватывающий побег!',
        description: 'Каждый запуск — абсолютно новый лабиринт! "Побег из Лабиринта" — это процедурная головоломка, где вам нужно проявить тактическое мышление и скрытность. Исследуйте запутанные коридоры, найдите светящийся ключ от ворот и доберитесь до выхода. Главная помеха — автоматические роботы-охранники, которые неустанно патрулируют территорию. Сможете ли вы пройти лабиринт незамеченным?',
        price: 299,
        genre: 'puzzle',
        genreLabel: 'Головоломка / Экшен',
        tags: ['Процедурная', 'Лабиринт', 'Головоломка', 'Стелс'],
        rating: 91,
        developer: 'Procedural Logic Labs',
        publisher: 'Vapor Games Studio',
        releaseDate: '10 марта 2026',
        coverImg: gameArt.maze.cover,
        screenshots: gameArt.maze.screens,
        specs: {
            os: 'Windows 10/11, macOS',
            cpu: 'Intel Core i3 / AMD Ryzen 3',
            ram: '2 GB ОЗУ',
            gpu: 'NVIDIA GeForce GT 730 / AMD Radeon R7',
            disk: '20 MB свободного места'
        },
        reviews: [
            { username: 'LabyrinthMaster', rating: 'positive', text: 'Бесконечная реиграбельность за счет генератора лабиринтов! Умные патрули делают геймплей реально напряженным.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=LabyrinthMaster', gamesOwned: 7 }
        ]
    },
    {
        id: 'cyberpunk',
        title: 'Cyberpunk 2088',
        tagline: 'Ролевой экшен нового поколения в мегаполисе будущего!',
        description: 'Погрузитесь в самую амбициозную научно-фантастическую ролевую игру. Найт-Сити 2.0 ждет вас! Модифицируйте свое тело имплантами, выполняйте опасные контракты мегакорпораций и станьте легендой улиц. (Внимание: Данная игра является демонстрацией AAA-новинки в магазине Vapor. Её можно купить за виртуальный баланс, чтобы украсить библиотеку, однако поиграть в неё на Canvas не получится!).',
        price: 1499,
        genre: 'action',
        genreLabel: 'Экшен / RPG',
        tags: ['RPG', 'Открытый мир', 'AAA', 'Будущее'],
        rating: 79,
        developer: 'CD Vapor Project',
        publisher: 'Vapor Games',
        releaseDate: '28 мая 2026',
        coverImg: gameArt.cyberpunk.cover,
        screenshots: gameArt.cyberpunk.screens,
        specs: {
            os: 'Windows 10/11 (64-bit)',
            cpu: 'Intel Core i7-12700K / AMD Ryzen 7 5800X',
            ram: '16 GB ОЗУ',
            gpu: 'NVIDIA GeForce RTX 3070 / AMD Radeon RX 6700 XT',
            disk: '70 GB свободного SSD места'
        },
        reviews: [
            { username: 'CyberGamer', rating: 'positive', text: 'Графика некстген, требования бешеные! Очень реалистичный концепт-арт магазина.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberGamer', gamesOwned: 15 }
        ]
    },
    {
        id: 'mario',
        title: 'Супер Марио',
        tagline: 'Легендарное приключение Марио в процедурном мире с коинами!',
        description: 'Приготовьтесь к классическому ностальгическому приключению! "Супер Марио" (Vapor Mario) — это сайд-скроллер платформер, где вам предстоит бегать, прыгать по платформам, выбивать монеты из блоков головой и давить хитрых Goombas, прыгая им на головы. Пройдите до конца уровня сквозь препятствия, найдите замок и захватите флагшток!',
        price: 249,
        genre: 'puzzle',
        genreLabel: 'Платформер / Ретро-скроллер',
        tags: ['Марио', 'Ретро', 'Платформер', 'Скроллер'],
        rating: 96,
        developer: 'Vapor Nintendo Labs',
        publisher: 'Vapor Games',
        releaseDate: '20 мая 2026',
        coverImg: gameArt.mario.cover,
        screenshots: gameArt.mario.screens,
        specs: {
            os: 'Windows 10/11, macOS, Linux',
            cpu: 'Любой двухъядерный процессор',
            ram: '1 GB ОЗУ',
            gpu: 'Встроенный графический ускоритель с Canvas2D',
            disk: '25 MB свободного места'
        },
        reviews: [
            { username: 'PlumberMan', rating: 'positive', text: 'Невероятная дань уважения оригиналу! Прыжки на грибы Goomba сделаны шикарно, физика гравитации ощущается отлично!', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PlumberMan', gamesOwned: 9 },
            { username: 'PrincessPeach', rating: 'positive', text: 'Замок в конце уровня просто чудо, очень атмосферная и милая игра! Рекомендую.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PrincessPeach', gamesOwned: 4 }
        ]
    },
    {
        id: 'sonic',
        title: 'Соник Скорость',
        tagline: 'Сверхзвуковой раннер: безумная скорость, золотые кольца и прыжки на пружинах!',
        description: 'Почувствуйте сверхзвуковой драйв! "Соник Скорость" (Neon Sonic) предлагает вам автоматический скоростной бесконечный бег, где скорость непрерывно нарастает. Прыгайте по неоновым платформам, собирайте кольца, используйте прыжковые пружины и остерегайтесь шипов. Особенность: если у вас есть кольца, при попадании на шипы вы выживете, рассыпав их! Будьте быстры как молния!',
        price: 349,
        genre: 'arcade',
        genreLabel: 'Аркада / Скролл-раннер',
        tags: ['Соник', 'Раннер', 'Скорость', 'Неон'],
        rating: 92,
        developer: 'Sega Vapor Studio',
        publisher: 'Vapor Games',
        releaseDate: '25 мая 2026',
        coverImg: gameArt.sonic.cover,
        screenshots: gameArt.sonic.screens,
        specs: {
            os: 'Windows 10/11, macOS',
            cpu: 'Intel Core i3 / AMD Ryzen 3',
            ram: '2 GB ОЗУ',
            gpu: 'Встроенная видеокарта с поддержкой WebGL/Canvas',
            disk: '30 MB свободного места'
        },
        reviews: [
            { username: 'RingCollector', rating: 'positive', text: 'Идея с потерей колец при ударе просто гениальна, прямо как в оригинальной игре на Sega Mega Drive! Музыка и звуки супер.', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RingCollector', gamesOwned: 11 }
        ]
    }
];

export class StoreModule {
    constructor(state, app) {
        this.state = state;
        this.app = app;
        this.activeFilter = 'all';
        this.searchQuery = '';
        this.modalActiveScreenshotIndex = 0;
        this.activeDetailGame = null;

        this.init();
    }

    init() {
        this.renderFeaturedHero();
        this.renderCatalog();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search bar
        const searchInput = document.getElementById('store-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderCatalog();
            });
        }

        // Genre filter buttons
        const filterButtons = document.querySelectorAll('.genre-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.genre;
                audio.playClick();
                this.renderCatalog();
            });
        });

        // Close detail modal
        const closeBtn = document.getElementById('close-detail-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('game-detail-modal').style.display = 'none';
                audio.playClick();
            });
        }

        // Click outside modal to close
        const modalOverlay = document.getElementById('game-detail-modal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
            });
        }
    }

    renderFeaturedHero() {
        const carousel = document.getElementById('featured-carousel');
        if (!carousel) return;

        // Use Cyberpunk 2088 or Space Defender as featured game
        const heroGame = gamesData.find(g => g.id === 'cyberpunk') || gamesData[0];
        
        carousel.innerHTML = `
            <div class="hero-main-cover" style="background-image: url('${heroGame.coverImg}')">
                <div class="hero-gradient"></div>
            </div>
            <div class="hero-info-column">
                <div>
                    <span class="tag">РЕКОМЕНДУЕМОЕ</span>
                    <h2 class="hero-title">${heroGame.title}</h2>
                    <div class="hero-tags">
                        ${heroGame.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
                    </div>
                    <p class="hero-desc">${heroGame.tagline}</p>
                </div>
                <div>
                    <div class="hero-carousel-nav">
                        ${heroGame.screenshots.map((s, idx) => `
                            <div class="carousel-thumb ${idx === 0 ? 'active' : ''}" 
                                 style="background-image: url('${s}')"
                                 data-idx="${idx}">
                            </div>
                        `).join('')}
                    </div>
                    <div class="hero-purchase-bar">
                        <div class="hero-price-tag">
                            <span class="current-price">₽${heroGame.price.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-primary" id="hero-buy-btn" data-id="${heroGame.id}">ПОДРОБНЕЕ</button>
                    </div>
                </div>
            </div>
        `;

        // Featured purchase/detail action
        document.getElementById('hero-buy-btn').addEventListener('click', () => {
            this.openGameDetails(heroGame.id);
        });

        // Screenshot hover swap
        const thumbs = carousel.querySelectorAll('.carousel-thumb');
        const mainCover = carousel.querySelector('.hero-main-cover');
        thumbs.forEach(t => {
            t.addEventListener('mouseenter', () => {
                thumbs.forEach(th => th.classList.remove('active'));
                t.classList.add('active');
                const idx = parseInt(t.dataset.idx);
                mainCover.style.backgroundImage = `url('${heroGame.screenshots[idx]}')`;
            });
        });
    }

    renderCatalog() {
        const grid = document.getElementById('store-game-grid');
        if (!grid) return;

        // Filter & Search logic
        const filteredGames = gamesData.filter(game => {
            const matchesGenre = this.activeFilter === 'all' || game.genre === this.activeFilter;
            const matchesSearch = game.title.toLowerCase().includes(this.searchQuery) ||
                                  game.tags.some(t => t.toLowerCase().includes(this.searchQuery));
            return matchesGenre && matchesSearch;
        });

        if (filteredGames.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-text" style="grid-column: 1 / -1; width: 100%;">
                    <h3>Игры не найдены</h3>
                    <p>Попробуйте изменить запрос или выбрать другой жанр.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredGames.map(game => {
            const isOwned = this.state.purchasedGames.includes(game.id);
            const isFree = game.price === 0;
            const inCart = this.state.cart.includes(game.id);

            let priceHTML = `<span class="card-price">₽${game.price.toFixed(2)}</span>`;
            if (isFree) {
                priceHTML = `<span class="price-free">БЕСПЛАТНО</span>`;
            }

            let cartBtnHTML = `
                <button class="card-cart-btn ${inCart ? 'owned' : ''}" 
                        data-id="${game.id}" 
                        title="${inCart ? 'Уже в корзине' : 'Добавить в корзину'}">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </button>
            `;

            if (isOwned) {
                cartBtnHTML = `
                    <button class="card-cart-btn owned" title="Уже в библиотеке">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                `;
            }

            return `
                <div class="game-card" data-id="${game.id}">
                    <div class="card-cover-wrapper">
                        <img src="${game.coverImg}" class="card-cover" alt="${game.title}">
                        <div class="card-overlay-badge">${game.rating}% 👍</div>
                    </div>
                    <div class="card-body">
                        <div class="card-top">
                            <h3 class="card-title">${game.title}</h3>
                            <div class="card-tags">
                                ${game.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
                            </div>
                            <p class="card-desc">${game.tagline}</p>
                        </div>
                        <div class="card-footer">
                            <div class="card-price-row">${priceHTML}</div>
                            ${cartBtnHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Card Click Details
        grid.querySelectorAll('.game-card').forEach(card => {
            const id = card.dataset.id;
            
            // Cart button click exclusion
            const cartBtn = card.querySelector('.card-cart-btn');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOwned = this.state.purchasedGames.includes(id);
                    if (isOwned) return;

                    this.app.cartModule.toggleCartItem(id);
                });
            }

            card.addEventListener('click', () => {
                this.openGameDetails(id);
            });
        });
    }

    openGameDetails(gameId) {
        const game = gamesData.find(g => g.id === gameId);
        if (!game) return;

        this.activeDetailGame = game;
        this.modalActiveScreenshotIndex = 0;

        const isOwned = this.state.purchasedGames.includes(game.id);
        const inCart = this.state.cart.includes(game.id);
        const isFree = game.price === 0;

        let buyBtnHTML = '';
        if (isOwned) {
            buyBtnHTML = `<button class="btn btn-success" id="modal-play-btn">ИГРАТЬ В БИБЛИОТЕКЕ</button>`;
        } else if (inCart) {
            buyBtnHTML = `<button class="btn btn-secondary" id="modal-cart-btn">В КОРЗИНЕ (ПЕРЕЙТИ)</button>`;
        } else {
            buyBtnHTML = `
                <button class="btn btn-primary" id="modal-cart-btn">
                    ДОБАВИТЬ В КОРЗИНУ — ₽${game.price.toFixed(2)}
                </button>
            `;
        }

        const modal = document.getElementById('game-detail-modal');
        const content = document.getElementById('detail-modal-content');

        content.innerHTML = `
            <div class="detail-header-cover" style="background-image: url('${game.coverImg}')">
                <div class="detail-header-info">
                    <div>
                        <h2 class="detail-title">${game.title}</h2>
                        <div class="detail-tags">
                            ${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                        </div>
                    </div>
                    <div class="detail-buy-box">
                        ${buyBtnHTML}
                    </div>
                </div>
            </div>

            <div class="detail-content-grid">
                <!-- Left Details: Description & Screens -->
                <div>
                    <div class="detail-screenshots">
                        <div class="active-screenshot-container">
                            <img src="${game.screenshots[0]}" class="active-screenshot" id="modal-main-screen" alt="Screenshot">
                        </div>
                        <div class="screenshot-thumbs">
                            ${game.screenshots.map((s, idx) => `
                                <img src="${s}" class="screenshot-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}" alt="Thumb">
                            `).join('')}
                        </div>
                    </div>
                    <h3 class="section-title">Об игре</h3>
                    <p class="detail-description">${game.description}</p>
                </div>

                <!-- Right Details: Specs & Devs -->
                <div>
                    <div class="lib-panel" style="margin-bottom: 20px;">
                        <h4 class="panel-header" style="color: var(--text-primary);">ИНФОРМАЦИЯ</h4>
                        <div class="lib-quick-specs" style="font-size:12px;">
                            <div class="spec-row"><strong>Жанр:</strong> <span>${game.genreLabel}</span></div>
                            <div class="spec-row"><strong>Разработчик:</strong> <span>${game.developer}</span></div>
                            <div class="spec-row"><strong>Издатель:</strong> <span>${game.publisher}</span></div>
                            <div class="spec-row"><strong>Релиз:</strong> <span>${game.releaseDate}</span></div>
                            <div class="spec-row"><strong>Рейтинг:</strong> <span style="color: var(--steam-green-hover); font-weight:700;">${game.rating}% Положительных</span></div>
                        </div>
                    </div>

                    <div class="detail-specs">
                        <h4 style="font-size:13px; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">СИСТЕМНЫЕ ТРЕБОВАНИЯ</h4>
                        <ul class="spec-list">
                            <li><span>ОС:</span> <strong>${game.specs.os}</strong></li>
                            <li><span>Процессор:</span> <strong>${game.specs.cpu}</strong></li>
                            <li><span>Память:</span> <strong>${game.specs.ram}</strong></li>
                            <li><span>Видеокарта:</span> <strong>${game.specs.gpu}</strong></li>
                            <li><span>Место на диске:</span> <strong>${game.specs.disk}</strong></li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Reviews List Section -->
            <div class="reviews-section">
                <div class="reviews-section-header">
                    <h3 class="section-title">Отзывы пользователей</h3>
                    <span>Всего отзывов: <span id="reviews-count">${game.reviews.length}</span></span>
                </div>

                <!-- Write custom review panel -->
                <div class="write-review-panel">
                    <div class="write-review-header">Оставить отзыв к игре</div>
                    <div class="rating-buttons">
                        <button class="rating-btn" id="rev-btn-up">
                            <svg class="rating-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            РЕКОМЕНДУЮ
                        </button>
                        <button class="rating-btn" id="rev-btn-down">
                            <svg class="rating-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-5h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
                            НЕ РЕКОМЕНДУЮ
                        </button>
                    </div>
                    <textarea class="review-textarea" id="rev-text-input" placeholder="Поделитесь вашим мнением об этой игре..."></textarea>
                    <button class="btn btn-primary" id="btn-submit-review" style="padding: 6px 15px; font-size:12px;">Опубликовать</button>
                </div>

                <div class="reviews-list-container" id="modal-reviews-list">
                    <!-- Loaded dynamically below -->
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        audio.playClick();

        // Register dynamic triggers inside modal
        this.setupModalControls(game);
    }

    setupModalControls(game) {
        const modal = document.getElementById('game-detail-modal');

        // Play or Add to Cart actions
        const playBtn = document.getElementById('modal-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.app.switchTab('library');
                this.app.libraryModule.selectGame(game.id);
            });
        }

        const cartBtn = document.getElementById('modal-cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                const inCart = this.state.cart.includes(game.id);
                if (inCart) {
                    modal.style.display = 'none';
                    this.app.switchTab('cart');
                } else {
                    this.app.cartModule.toggleCartItem(game.id);
                    modal.style.display = 'none';
                }
            });
        }

        // Thumb click visual change
        const mainScreen = document.getElementById('modal-main-screen');
        const thumbs = modal.querySelectorAll('.screenshot-thumb');
        thumbs.forEach(t => {
            t.addEventListener('click', () => {
                thumbs.forEach(th => th.classList.remove('active'));
                t.classList.add('active');
                const idx = parseInt(t.dataset.idx);
                mainScreen.src = game.screenshots[idx];
                audio.playClick();
            });
        });

        // Reviews Render
        this.renderModalReviews(game);

        // Rating triggers
        let reviewRating = 'positive'; // default
        const btnUp = document.getElementById('rev-btn-up');
        const btnDown = document.getElementById('rev-btn-down');

        btnUp.classList.add('active-thumbs-up');

        btnUp.addEventListener('click', () => {
            reviewRating = 'positive';
            btnUp.classList.add('active-thumbs-up');
            btnDown.classList.remove('active-thumbs-down');
            audio.playClick();
        });

        btnDown.addEventListener('click', () => {
            reviewRating = 'negative';
            btnDown.classList.add('active-thumbs-down');
            btnUp.classList.remove('active-thumbs-up');
            audio.playClick();
        });

        // Submit review
        const submitBtn = document.getElementById('btn-submit-review');
        submitBtn.addEventListener('click', () => {
            const text = document.getElementById('rev-text-input').value.trim();
            if (!text) {
                this.app.showToast("Ошибка", "Текст отзыва не может быть пустым!", "error");
                return;
            }

            const isOwned = this.state.purchasedGames.includes(game.id);
            if (!isOwned && game.price > 0) {
                this.app.showToast("Внимание", "Вы не можете написать отзыв к некупленной игре!", "error");
                return;
            }

            const newReview = {
                username: this.state.username,
                rating: reviewRating,
                text: text,
                avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${this.state.username}`,
                gamesOwned: this.state.purchasedGames.length
            };

            // Inject review into game list (temporary runtime store)
            game.reviews.unshift(newReview);
            
            // Add review to global state reviews written
            this.state.reviewsWritten.unshift({
                gameId: game.id,
                gameTitle: game.title,
                rating: reviewRating,
                text: text
            });

            this.app.saveState();
            this.app.showToast("Успех", "Ваш отзыв успешно опубликован!", "success");
            audio.playSuccess();

            // Rerender reviews
            document.getElementById('rev-text-input').value = '';
            this.renderModalReviews(game);
            this.app.profileModule.renderProfileData(); // update stats profile reviews
        });
    }

    renderModalReviews(game) {
        const container = document.getElementById('modal-reviews-list');
        const countSpan = document.getElementById('reviews-count');
        if (!container) return;

        countSpan.textContent = game.reviews.length;

        if (game.reviews.length === 0) {
            container.innerHTML = `<div class="empty-state-text">К этой игре пока нет отзывов. Станьте первым!</div>`;
            return;
        }

        container.innerHTML = game.reviews.map(r => `
            <div class="user-review-item">
                <div class="rev-user-col">
                    <img src="${r.avatar}" class="rev-avatar" alt="Avatar">
                    <span class="rev-username">${r.username}</span>
                    <span class="rev-games-owned">Игр в аккаунте: ${r.gamesOwned || 1}</span>
                </div>
                <div class="rev-content-col">
                    <div class="rev-badge ${r.rating === 'positive' ? 'positive' : 'negative'}">
                        ${r.rating === 'positive' ? '👍 РЕКОМЕНДУЕТСЯ' : '👎 НЕ РЕКОМЕНДУЕТСЯ'}
                    </div>
                    <p class="rev-text">${r.text}</p>
                </div>
            </div>
        `).join('');
    }
}
