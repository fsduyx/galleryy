// game.js — Дуэль с Боссом (уникальные способности на WASD)
let gameAnimationId = null;
let gameActive = false;
let currentCard = null;
let currentBossCard = null;
let gameCanvas = null;
let ctx = null;

let playerHealth = 100;
let maxPlayerHealth = 100;
let playerDamage = 30;
let playerAttackCooldown = 0;
let playerAttackSpeed = 0.8;
let playerMana = 50;
let maxMana = 100;
let manaRegen = 10;

let bossHealth = 800;
let maxBossHealth = 800;
let bossPhase = 1;
let bossDamage = 12;
let bossAttackCooldown = 0;
let bossAttackSpeed = 1.2;
let bossSpecialTimer = 0;

let minions = [];
let minionSpawnTimer = 0;
let minionSpawnDelay = 2.5;

let particles = [];
let floatingNumbers = [];
let screenShake = 0;
let clickEffects = [];

let score = 0;
let wave = 1;

let berserkTimer = 0;
let berserkDamageBonus = 0;

let shieldTimer = 0;
let shieldActive = false;

let uniqueCooldown = 0;
let uniqueCooldownMax = 10; // seconds

let heroImage = null;
let bossImage = null;
let cardImageCache = window.cardImageCache || {}; // глобальный кэш
window.cardImageCache = cardImageCache;

// ... остальной код game.js без изменений ...