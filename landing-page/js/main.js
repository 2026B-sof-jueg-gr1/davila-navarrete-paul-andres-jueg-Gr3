// Interacción de la landing: navegación, selector de asesinos, carrusel de escenarios y animaciones

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Navegación ----------
const nav = $('#nav');
const burger = $('#burger');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
}));

// Marca en el menú la sección visible
const sections = $$('main section[id]');
const linkFor = id => $(`#navLinks a[href="#${id}"]`);
// La sección actual es la última cuyo borde superior ya pasó la mitad de la pantalla
function markCurrent() {
    const mid = window.innerHeight / 2;
    let cur = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= mid) cur = s; });
    $$('#navLinks a').forEach(a => a.classList.toggle('is-current', !!cur && a === linkFor(cur.id)));
}
window.addEventListener('scroll', markCurrent, { passive: true });
markCurrent();

// ---------- Gotas de sangre bajo el título ----------
// Solo en la última línea, para que las gotas no caigan sobre el texto de abajo
$$('.hero__title .drip').slice(-1).forEach((line, li) => {
    const n = 7;
    for (let i = 0; i < n; i++) {
        const d = document.createElement('span');
        d.className = 'blood-drop';
        const w = 5 + ((i * 7 + li * 3) % 5);
        d.style.left = `${8 + (84 * (i + 0.5)) / n + ((i * 37) % 7) - 3}%`;
        d.style.setProperty('--w', `${w}px`);
        d.style.setProperty('--h', `${14 + ((i * 53 + li * 17) % 34)}px`);
        d.style.setProperty('--d', `${2.6 + ((i * 0.7) % 1.8)}s`);
        d.style.setProperty('--delay', `${(i * 0.9 + li * 0.4) % 3}s`);
        d.appendChild(document.createElement('i'));
        line.appendChild(d);
    }
});

// ---------- Aparición al hacer scroll ----------
const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealer.unobserve(e.target); }
    });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => revealer.observe(el));

// Contadores de las estadísticas
const counter = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        counter.unobserve(e.target);
        const end = +e.target.dataset.count;
        if (reduceMotion) return;
        const t0 = performance.now(), dur = 1200;
        const tick = t => {
            const p = Math.min(1, (t - t0) / dur);
            e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counter.observe(el));

// ---------- Selector de asesinos ----------
const KILLERS = [
    {
        word: 'ART',
        name: 'Art',
        role: '// World 01 · The Killer Clown',
        img: 'img/char-clown.png', alt: 'Art the clown, holding a knife',
        skin: { img: 'img/char-artSanta.png', label: 'Santa Art', alt: 'Art dressed as Santa, holding an axe' },
        bio: 'Silent, grinning and never in a hurry. Art slides across fast food joints, playgrounds and a Christmas mall until he hits something, and if that something is a victim, the show goes on.',
        ability: { icon: '✂', name: 'The Slide', text: 'Moves in a straight line until he hits a wall. Every move counts: you get the minimum plus two.' },
        tags: ['5 sets', '21 victims', 'Moves: par + 2']
    },
    {
        word: 'JASON',
        name: 'Jason',
        role: "// World 02 · Mommy's Good Boy",
        img: 'img/char-jason.png', alt: 'Jason in his hockey mask, holding a machete',
        skin: { img: 'img/char-jasonX.png', label: 'Jason X', alt: 'Jason in futuristic armor' },
        bio: 'He came back from the lake, and this time Mother came with him. Jason hunts camps, rainy city streets and even a spaceship, and the victims here are smarter: the sober ones run.',
        ability: { icon: '<img src="img/char-momHead.png" alt="">', name: 'Mommy Knows Best', text: "Press Space and his mother's head marks the next 5 moves of the best route. 3 uses per level." },
        tags: ['5 sets', '36 victims', 'Moves: par + 3', 'Sober victims']
    }
];
let current = 0;
let showingSkin = false;
const kImg = $('#kImg');
const swapFields = ['#kRole', '#kName', '#kBio', '#kAbIcon', '#kAbName', '#kAbText', '#kTags', '#bigword'].map(s => $(s));
swapFields.forEach(el => el.classList.add('fade-swap'));

function renderKiller(i) {
    const k = KILLERS[i];
    current = i;
    showingSkin = false;
    $$('.ktab').forEach((t, j) => {
        t.classList.toggle('is-active', j === i);
        t.setAttribute('aria-selected', j === i);
    });
    swapFields.forEach(el => el.classList.add('is-out'));
    kImg.classList.add('is-swapping');
    setTimeout(() => {
        $('#kRole').textContent = k.role;
        $('#kName').textContent = k.name;
        $('#kBio').textContent = k.bio;
        $('#kAbIcon').innerHTML = k.ability.icon;
        $('#kAbName').textContent = k.ability.name;
        $('#kAbText').textContent = k.ability.text;
        $('#kTags').innerHTML = k.tags.map(t => `<li>${t}</li>`).join('');
        $('#bigword').textContent = k.word;
        kImg.src = k.img; kImg.alt = k.alt;
        $('#kSkinImg').src = k.skin.img;
        $('#kSkinLabel').textContent = k.skin.label;
        swapFields.forEach(el => el.classList.remove('is-out'));
        kImg.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 250);
}
$$('.ktab').forEach(t => t.addEventListener('click', () => {
    const i = +t.dataset.k;
    if (i !== current || showingSkin) renderKiller(i);
}));
// Botón de disfraz: alterna entre el traje normal y el alternativo
$('#kSkin').addEventListener('click', () => {
    const k = KILLERS[current];
    showingSkin = !showingSkin;
    kImg.classList.add('is-swapping');
    setTimeout(() => {
        kImg.src = showingSkin ? k.skin.img : k.img;
        kImg.alt = showingSkin ? k.skin.alt : k.alt;
        $('#kSkinImg').src = showingSkin ? k.img : k.skin.img;
        $('#kSkinLabel').textContent = showingSkin ? 'Classic' : k.skin.label;
        kImg.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 250);
});

// ---------- Carrusel de escenarios ----------
const track = $('#track');
const bar = $('#progress');
const visibleSets = () => $$('.set', track).filter(s => !s.hidden);
const step = () => {
    const s = visibleSets()[0];
    return s ? s.getBoundingClientRect().width + 22 : 400;
};
$('#prev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }));
$('#next').addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }));

function updateProgress() {
    const max = track.scrollWidth - track.clientWidth;
    const ratio = track.clientWidth / track.scrollWidth;
    const w = Math.min(100, ratio * 100);
    bar.style.width = `${w}%`;
    bar.style.left = `${max > 0 ? (track.scrollLeft / max) * (100 - w) : 0}%`;
}
track.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

$$('.filter button').forEach(b => b.addEventListener('click', () => {
    $$('.filter button').forEach(x => x.classList.toggle('is-active', x === b));
    const w = b.dataset.w;
    $$('.set', track).forEach(s => { s.hidden = w !== 'all' && s.dataset.w !== w; });
    track.scrollTo({ left: 0 });
    updateProgress();
}));

// Arrastrar el carrusel con el mouse
let drag = null;
track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    track.style.scrollSnapType = 'none';
});
window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = drag.left - dx;
});
window.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    track.style.scrollSnapType = '';
});
track.addEventListener('dragstart', e => e.preventDefault());

// Las flechas del teclado mueven el carrusel cuando tiene el foco
track.tabIndex = 0;
track.setAttribute('aria-label', 'Sets carousel');
track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); $('#next').click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); $('#prev').click(); }
});
