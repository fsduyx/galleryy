// script.js — полный рабочий вариант с созданием аватарок
let currentPosition = 0;
let totalCardsCount = cardsData.length;
let selectedCardId = null;
let currentSelectedCardData = null;

// ========== ДОБАВЛЕНИЕ: Пользовательские аватарки ==========
let userAvatars = [];
let avatarCanvas = null;
let avatarCtx = null;
let isDrawing = false;

// Загрузка аватарок из localStorage
function loadUserAvatars() {
    const saved = localStorage.getItem('clash_user_avatars');
    if (saved) {
        try {
            userAvatars = JSON.parse(saved);
            renderUserAvatarsSection();
        } catch(e) { console.error('Ошибка загрузки аватарок:', e); }
    }
}

// Сохранение аватарок
function saveUserAvatars() {
    localStorage.setItem('clash_user_avatars', JSON.stringify(userAvatars));
}

// Отображение секции с аватарками в галерее
function renderUserAvatarsSection() {
    // Ищем или создаём контейнер для аватарок
    let container = document.getElementById('userAvatarsSection');
    const galleryWrapper = document.querySelector('.gallery-wrapper');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'userAvatarsSection';
        container.className = 'gallery-section';
        
        // Вставляем после bottom-nav
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.insertAdjacentElement('afterend', container);
        } else {
            galleryWrapper.appendChild(container);
        }
    }
    
    if (userAvatars.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h3 class="gallery-title"><i class="fas fa-user-astronaut"></i> Мои аватарки (${userAvatars.length})</h3>
        <div class="user-avatars-container" id="userAvatarsContainer"></div>
    `;
    
    const avatarsContainer = document.getElementById('userAvatarsContainer');
    
    userAvatars.forEach((avatar, index) => {
        const avatarCard = document.createElement('div');
        avatarCard.className = 'user-avatar-card';
        avatarCard.innerHTML = `
            <div class="user-avatar-badge">🎨 Моя аватарка</div>
            <img src="${avatar.data}" class="user-avatar-img" alt="Аватар ${index + 1}">
            <div class="user-avatar-name">Аватар ${index + 1}</div>
            <button class="delete-avatar-btn" data-id="${avatar.id}">🗑️ Удалить</button>
        `;
        avatarsContainer.appendChild(avatarCard);
        
        const deleteBtn = avatarCard.querySelector('.delete-avatar-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteUserAvatar(avatar.id);
        });
    });
}

// Удаление аватарки
function deleteUserAvatar(id) {
    if (confirm('Удалить этот аватар из коллекции?')) {
        userAvatars = userAvatars.filter(a => a.id !== id);
        saveUserAvatars();
        renderUserAvatarsSection();
        showAvatarNotification('Аватар удалён', 'error');
    }
}

// Инициализация canvas для рисования
function initAvatarCanvas() {
    avatarCanvas = document.getElementById('avatarCanvas');
    if (!avatarCanvas) return;
    
    avatarCtx = avatarCanvas.getContext('2d');
    avatarCanvas.width = 300;
    avatarCanvas.height = 300;
    
    // Белый фон
    avatarCtx.fillStyle = '#ffffff';
    avatarCtx.fillRect(0, 0, 300, 300);
    
    // Рисуем рамку и подсказку
    avatarCtx.strokeStyle = '#cccccc';
    avatarCtx.lineWidth = 2;
    avatarCtx.strokeRect(10, 10, 280, 280);
    
    avatarCtx.fillStyle = '#999999';
    avatarCtx.font = '14px Arial';
    avatarCtx.textAlign = 'center';
    avatarCtx.fillText('Нарисуй свой аватар!', 150, 150);
    
    avatarCtx.strokeStyle = '#ff4444';
    avatarCtx.lineWidth = 3;
    avatarCtx.lineCap = 'round';
    
    // Обработчики рисования
    const startDraw = (e) => {
        isDrawing = true;
        const pos = getCanvasPos(e);
        avatarCtx.beginPath();
        avatarCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
    };
    
    const draw = (e) => {
        if (!isDrawing) return;
        const pos = getCanvasPos(e);
        avatarCtx.lineTo(pos.x, pos.y);
        avatarCtx.stroke();
        avatarCtx.beginPath();
        avatarCtx.moveTo(pos.x, pos.y);
        e.preventDefault();
    };
    
    const stopDraw = () => {
        isDrawing = false;
        avatarCtx.beginPath();
    };
    
    const getCanvasPos = (e) => {
        const rect = avatarCanvas.getBoundingClientRect();
        const scaleX = avatarCanvas.width / rect.width;
        const scaleY = avatarCanvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };
    
    avatarCanvas.addEventListener('mousedown', startDraw);
    avatarCanvas.addEventListener('mousemove', draw);
    avatarCanvas.addEventListener('mouseup', stopDraw);
    avatarCanvas.addEventListener('mouseleave', stopDraw);
    avatarCanvas.addEventListener('touchstart', startDraw);
    avatarCanvas.addEventListener('touchmove', draw);
    avatarCanvas.addEventListener('touchend', stopDraw);
    
    // Настройки инструментов
    const brushColor = document.getElementById('brushColor');
    const brushSize = document.getElementById('brushSize');
    const sizeValue = document.getElementById('sizeValue');
    
    if (brushColor) {
        brushColor.addEventListener('input', () => {
            avatarCtx.strokeStyle = brushColor.value;
        });
    }
    
    if (brushSize) {
        brushSize.addEventListener('input', () => {
            const val = parseInt(brushSize.value);
            avatarCtx.lineWidth = val;
            if (sizeValue) sizeValue.textContent = val + 'px';
        });
    }
    
    const clearBtn = document.getElementById('clearCanvasBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            avatarCtx.fillStyle = '#ffffff';
            avatarCtx.fillRect(0, 0, 300, 300);
            avatarCtx.strokeStyle = '#cccccc';
            avatarCtx.lineWidth = 2;
            avatarCtx.strokeRect(10, 10, 280, 280);
            avatarCtx.strokeStyle = brushColor?.value || '#ff4444';
            avatarCtx.lineWidth = parseInt(brushSize?.value || 3);
            avatarCtx.fillStyle = '#999999';
            avatarCtx.font = '14px Arial';
            avatarCtx.textAlign = 'center';
            avatarCtx.fillText('Нарисуй свой аватар!', 150, 150);
        });
    }
}

// Открыть модалку рисования
function openAvatarModal() {
    const modal = document.getElementById('avatarModal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Очищаем canvas для нового рисунка
        if (avatarCtx) {
            avatarCtx.fillStyle = '#ffffff';
            avatarCtx.fillRect(0, 0, 300, 300);
            avatarCtx.strokeStyle = '#cccccc';
            avatarCtx.lineWidth = 2;
            avatarCtx.strokeRect(10, 10, 280, 280);
            avatarCtx.fillStyle = '#999999';
            avatarCtx.font = '14px Arial';
            avatarCtx.textAlign = 'center';
            avatarCtx.fillText('Нарисуй свой аватар!', 150, 150);
            avatarCtx.strokeStyle = document.getElementById('brushColor')?.value || '#ff4444';
            avatarCtx.lineWidth = parseInt(document.getElementById('brushSize')?.value || 3);
        }
    }
}

// Закрыть модалку
function closeAvatarModal() {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.classList.add('hidden');
}

// Сохранить аватарку в галерею
function saveAvatarToGallery() {
    if (!avatarCanvas) return;
    
    const imageData = avatarCanvas.toDataURL();
    const newAvatar = {
        id: Date.now(),
        data: imageData,
        timestamp: Date.now()
    };
    
    userAvatars.unshift(newAvatar);
    saveUserAvatars();
    renderUserAvatarsSection();
    closeAvatarModal();
    showAvatarNotification('Аватар добавлен в галерею!', 'success');
}

// Уведомление для аватарок
function showAvatarNotification(message, type) {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '2000';
    toast.innerHTML = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========== ОРИГИНАЛЬНЫЙ КОД script.js (без изменений) ==========

document.addEventListener('DOMContentLoaded', () => {
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
    console.log('✅ SELECT и START работают');
});

// ========== ИНИЦИАЛИЗАЦИЯ АВАТАРОК ==========
setTimeout(() => {
    initAvatarCanvas();
    loadUserAvatars();
    
    const createBtn = document.getElementById('createAvatarBtn');
    const closeModalBtn = document.getElementById('closeAvatarModal');
    const cancelBtn = document.getElementById('cancelAvatarBtn');
    const saveBtn = document.getElementById('saveAvatarBtn');
    const modal = document.getElementById('avatarModal');
    
    if (createBtn) createBtn.addEventListener('click', openAvatarModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAvatarModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeAvatarModal);
    if (saveBtn) saveBtn.addEventListener('click', saveAvatarToGallery);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAvatarModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            closeAvatarModal();
        }
    });
}, 100);