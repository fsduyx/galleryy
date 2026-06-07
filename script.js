// script.js — полный рабочий вариант с выбором обликов и localStorage
let currentPosition = 0;
let totalCardsCount = cardsData.length;
let selectedCardId = null;
let currentSelectedCardData = null;

// --- Работа с localStorage и выбором изображений ---
const STORAGE_KEY = 'clash_custom_images';

function loadCustomImages() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        const selections = JSON.parse(saved);
        for (let card of cardsData) {
            if (selections[card.id] && card.fullImageOptions.includes(selections[card.id])) {
                card.image = selections[card.id];
                card.heroImage = selections[card.id];
            }
        }
    } catch(e) { console.warn("Ошибка загрузки сохранений", e); }
}

function saveImageSelection(cardId, imageUrl) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card || !card.fullImageOptions.includes(imageUrl)) {
        console.warn("Некорректный выбор изображения");
        return false;
    }
    card.image = imageUrl;
    card.heroImage = imageUrl;
    let selections = {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) selections = JSON.parse(saved);
    selections[cardId] = imageUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    
    if (window.cardImageCache) {
        if (!window.cardImageCache[imageUrl]) {
            const img = new Image();
            img.src = imageUrl;
            window.cardImageCache[imageUrl] = img;
        }
    }
    if (currentSelectedCardData?.id === cardId || cardsData[currentPosition]?.id === cardId) {
        refreshGallery();
    }
    showNotification(`Облик ${card.name} изменён!`, false);
    return true;
}

function openImageSelector(card) {
    const modal = document.getElementById('imageSelectorModal');
    const container = document.getElementById('imageOptionsContainer');
    const cardNameSpan = document.getElementById('modalCardName');
    if (!modal || !container) return;
    
    cardNameSpan.textContent = card.name;
    container.innerHTML = '';
    
    const options = card.fullImageOptions || [card.image];
    options.forEach((imgUrl, idx) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'image-option';
        if (imgUrl === card.image) optionDiv.classList.add('selected');
        
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `Вариант ${idx+1}`;
        img.onerror = () => { img.src = DEFAULT_CARD_IMG; };
        
        optionDiv.appendChild(img);
        optionDiv.addEventListener('click', () => {
            if (options.includes(imgUrl)) {
                saveImageSelection(card.id, imgUrl);
                modal.classList.add('hidden');
            } else {
                showNotification("Ошибка: недопустимый вариант", false);
            }
        });
        container.appendChild(optionDiv);
    });
    
    modal.classList.remove('hidden');
}

function addChangeSkinButton() {
    const infoPanel = document.querySelector('.info-panel');
    if (!infoPanel || document.getElementById('changeSkinBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'changeSkinBtn';
    btn.className = 'change-skin-btn';
    btn.innerHTML = '🎨 Сменить облик';
    btn.style.marginTop = '12px';
    btn.style.width = '100%';
    btn.addEventListener('click', () => {
        const currentCard = cardsData[currentPosition];
        if (currentCard) openImageSelector(currentCard);
    });
    infoPanel.appendChild(btn);
}

function initModalCloser() {
    const modal = document.getElementById('imageSelectorModal');
    if (!modal) return;
    const closeSpan = modal.querySelector('.modal-close');
    closeSpan?.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCustomImages(); // загружаем сохранённые облики
    
    const mainCard = document.getElementById('mainCard');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    const selectBtn = document.getElementById('selectBtn');
    const startBtn = document.getElementById('startBtn');
    const selectedBadge = document.getElementById('selectedBadge');
    const dotsContainer = document.getElementById('bottomDots');
    const counter = document.getElementById('cardCounter');
    const glowBg = document.getElementById('glowBackground');
    const particlesBg = document.getElementById('particlesBackground');
    const toast = document.getElementById('toastNotification');
    const startToast = document.getElementById('startToast');
    const galleryWrapper = document.getElementById('galleryWrapper');
    const gameContainer = document.getElementById('gameContainer');
    const backToGallery = document.getElementById('backToGallery');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const exitToGalleryBtn = document.getElementById('exitToGalleryBtn');
    const gameOverButtons = document.getElementById('gameOverButtons');

    function showNotification(msg, isStart) {
        const notif = isStart ? startToast : toast;
        const textSpan = notif.querySelector('.toast-text');
        if (textSpan) textSpan.textContent = msg;
        notif.classList.add('show');
        setTimeout(() => notif.classList.remove('show'), 2000);
    }

    function updateUI() {
        const card = cardsData[currentPosition];
        const isSelected = (selectedCardId === card.id);
        if (isSelected) {
            selectBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
            selectedBadge.classList.remove('hidden');
        } else {
            selectBtn.classList.remove('hidden');
            startBtn.classList.add('hidden');
            selectedBadge.classList.add('hidden');
        }
        const rarityText = document.querySelector('#cardRarity .rarity-text');
        if (rarityText) rarityText.textContent = card.rarity;
        const elixirVal = document.querySelector('#cardElixir .elixir-value');
        if (elixirVal) elixirVal.textContent = card.elixir;
        document.getElementById('cardName').textContent = card.name;
        document.getElementById('cardDescription').textContent = card.description;
        document.getElementById('cardHp').textContent = card.hp;
        document.getElementById('cardDmg').textContent = card.damage;
        document.getElementById('cardSpeed').textContent = card.attackSpeed;
        document.getElementById('cardTarget').textContent = card.target;
        document.getElementById('cardMove').textContent = card.speed;
        document.getElementById('cardRarityValue').textContent = card.rarityValue;
        if (glowBg) {
            glowBg.className = 'glow-background ' + (card.glowClass || 'glow-1');
        }
        if (counter) counter.textContent = `${(currentPosition + 1).toString().padStart(2, '0')} / ${totalCardsCount.toString().padStart(2, '0')}`;
        document.querySelectorAll('.dot-indicator').forEach((dot, i) => dot.classList.toggle('active', i === currentPosition));
    }

    function createParticles() {
        if (!particlesBg) return;
        particlesBg.innerHTML = '';
        const card = cardsData[currentPosition];
        let colors;
        switch (card.glowClass) {
            case 'glow-1': colors = ['#ff6680', '#ff3366', '#ff99aa']; break;
            case 'glow-2': colors = ['#44ffaa', '#22cc88', '#88ffcc']; break;
            case 'glow-3': colors = ['#ffcc44', '#ffaa22', '#ffdd88']; break;
            case 'glow-4': colors = ['#bb77ff', '#9955ee', '#dd99ff']; break;
            default: colors = ['#44bbff', '#2299ee', '#88ddff'];
        }
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.classList.add('particle-bg');
            const angle = Math.random() * Math.PI * 2;
            const dist = 120 + Math.random() * 160;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
            p.style.left = `calc(50% + ${-50 + Math.random() * 100}px)`;
            p.style.top = `calc(50% + ${-50 + Math.random() * 100}px)`;
            const size = 6 + Math.random() * 16;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.style.background = `radial-gradient(circle, ${color}, ${color}cc)`;
            p.style.boxShadow = `0 0 ${size}px ${color}`;
            p.style.animationDelay = Math.random() * 4 + 's';
            p.style.animationDuration = 3.5 + Math.random() * 3.5 + 's';
            particlesBg.appendChild(p);
        }
    }

    function refreshGallery() {
        mainCard.src = cardsData[currentPosition].image;
        createParticles();
        updateUI();
    }

    function goNext() {
        currentPosition = (currentPosition + 1) % totalCardsCount;
        refreshGallery();
    }

    function goPrev() {
        currentPosition = (currentPosition - 1 + totalCardsCount) % totalCardsCount;
        refreshGallery();
    }

    function handleSelect() {
        console.log("SELECT нажат");
        const card = cardsData[currentPosition];
        if (selectedCardId === card.id) return;
        selectedCardId = card.id;
        currentSelectedCardData = card;
        updateUI();
        showNotification(`✨ ${card.name} выбрана! ✨`, false);
    }

    function handleStart() {
        console.log("START нажат");
        const card = currentSelectedCardData || cardsData[currentPosition];
        if (!card) return;
        showNotification(`🚀 ${card.name} начинает битву! 🚀`, true);
        if (window.startGame) window.startGame(card);
        galleryWrapper.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        if (gameOverButtons) gameOverButtons.classList.add('hidden');
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(circle,rgba(255,100,100,0.4),transparent);pointer-events:none;z-index:999;animation:battleFlash 0.6s ease-out';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);
    }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalCardsCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot-indicator');
            if (i === currentPosition) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (i === currentPosition) return;
                currentPosition = i;
                refreshGallery();
            });
            dotsContainer.appendChild(dot);
        }
    }

    leftArrow.addEventListener('click', goPrev);
    rightArrow.addEventListener('click', goNext);
    selectBtn.addEventListener('click', handleSelect);
    startBtn.addEventListener('click', handleStart);
    mainCard.addEventListener('dragstart', e => e.preventDefault());

    let touchStart = 0;
    const cardCenter = document.getElementById('cardCenter');
    if (cardCenter) {
        cardCenter.addEventListener('touchstart', e => { touchStart = e.changedTouches[0].clientX; });
        cardCenter.addEventListener('touchend', e => {
            const delta = e.changedTouches[0].clientX - touchStart;
            if (Math.abs(delta) > 55) delta > 0 ? goPrev() : goNext();
        });
    }

    window.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    });

    if (backToGallery) {
        backToGallery.addEventListener('click', () => {
            if (window.stopGame) window.stopGame();
            galleryWrapper.classList.remove('hidden');
            gameContainer.classList.add('hidden');
            gameOverButtons.classList.add('hidden');
        });
    }
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            if (window.startGame && currentSelectedCardData) {
                window.stopGame();
                window.startGame(currentSelectedCardData);
                gameOverButtons.classList.add('hidden');
            }
        });
    }
    if (exitToGalleryBtn) {
        exitToGalleryBtn.addEventListener('click', () => {
            if (window.stopGame) window.stopGame();
            galleryWrapper.classList.remove('hidden');
            gameContainer.classList.add('hidden');
            gameOverButtons.classList.add('hidden');
        });
    }

    window.showGameOverButtons = function (show) {
        if (gameOverButtons) show ? gameOverButtons.classList.remove('hidden') : gameOverButtons.classList.add('hidden');
    };

    buildDots();
    refreshGallery();
    addChangeSkinButton();
    initModalCloser();
    console.log('✅ SELECT и START работают, выбор обликов добавлен');
});