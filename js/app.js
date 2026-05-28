/* ============================================
   食刻NOW — 应用逻辑
   ============================================ */

// --- 全局状态 ---
const AppState = {
  currentPage: 'splash',
  userIdentity: null,
  selectedIngredients: [],
  customIngredients: [],
  selectedMethods: [],
  selectedTastes: [],
  selectedDifficulty: null,
  quantity: 1,       // 0=1人份, 1=2-3人份, 2=家庭份
  maxTime: 1,        // 0=15min, 1=30min, 2=45min+
  currentRecipe: null,
  coins: 230,
  favorites: [],
  history: []
};

// --- 食材数据 ---
const INGREDIENTS = [
  { name: '西红柿', icon: '🍅' },
  { name: '鸡蛋',   icon: '🥚' },
  { name: '五花肉', icon: '🥩' },
  { name: '大蒜',   icon: '🧄' },
  { name: '土豆',   icon: '🥔' },
  { name: '西兰花', icon: '🥦' },
  { name: '鸡胸肉', icon: '🍗' },
  { name: '胡萝卜', icon: '🥕' },
  { name: '豆腐',   icon: '🫘' },
  { name: '青椒',   icon: '🫑' },
  { name: '白菜',   icon: '🥬' },
  { name: '香菇',   icon: '🍄' }
];

const METHODS = [
  { name: '蒸', icon: '♨️' },
  { name: '煮', icon: '🍲' },
  { name: '炒', icon: '🍳' },
  { name: '炸', icon: '🫕' }
];

const TASTES = [
  { name: '川菜', cls: 'red' },
  { name: '粤菜', cls: 'gold' },
  { name: '日式', cls: 'cream' },
  { name: '国菜', cls: '' }
];

const DIFFICULTIES = [
  { name: '简单易学', cat: '🥚',  desc: '小白也能做' },
  { name: '进阶挑战', cat: '🍳', desc: '有点小挑战' },
  { name: '大师级',   cat: '👨‍🍳', desc: '招待朋友用', highlight: true }
];

// ============================================
// 页面导航
// ============================================
function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.add('active');
    AppState.currentPage = pageName;
    document.querySelector('.app-container').scrollTop = 0;
  }
  updateNavBar(pageName);
  if (pageName === 'profile') updateProfilePage();
}

function updateNavBar(pageName) {
  const navPages = ['home', 'discover', 'favorites', 'profile'];
  const bottomNav = document.querySelector('.bottom-nav');
  if (navPages.includes(pageName) || pageName === 'home') {
    bottomNav.style.display = '';
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageName);
    });
  } else {
    bottomNav.style.display = 'none';
  }
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ============================================
// 启动页
// ============================================
function selectIdentity(identity) {
  AppState.userIdentity = identity;
  document.querySelectorAll('.identity-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`identity-${identity}`).classList.add('selected');
}

function confirmIdentity() {
  if (!AppState.userIdentity) { showToast('请先选择一个身份吧~ ⭐'); return; }
  showRecommendModal();
}

// ============================================
// 身份推荐 — 为你推荐弹窗
// ============================================

// 每个身份推荐6道菜
const IDENTITY_RECIPES = {
  college: [1, 4, 8, 9, 12, 15],   // 大学生：番茄炒蛋、酸辣土豆丝、麻婆豆腐、蛋炒饭、可乐鸡翅、懒人焖饭
  solo:    [1, 2, 5, 9, 11, 14],   // 独居：番茄炒蛋、蒜蓉西兰花、照烧鸡腿、蛋炒饭、凉拌黄瓜、味噌汤
  fitness:[2, 6, 8, 11, 5, 14]     // 健身：蒜蓉西兰花、清蒸鲈鱼、麻婆豆腐、凉拌黄瓜、照烧鸡腿、味噌汤
};

const IDENTITY_LABELS = {
  college: '大学生',
  solo: '独居青年',
  fitness: '健身减脂'
};

const IDENTITY_DESC = {
  college: '便宜快手 · 一锅搞定',
  solo: '一人食量 · 拒绝浪费',
  fitness: '高蛋白低卡 · 好吃不胖'
};

function showRecommendModal() {
  const identity = AppState.userIdentity;
  const recipeIds = IDENTITY_RECIPES[identity];
  const recipes = recipeIds.map(id => MOCK_RECIPES.find(r => r.id === id)).filter(Boolean);

  document.getElementById('modal-title').textContent = '为你推荐';
  document.getElementById('modal-subtitle').textContent =
    `👤 ${IDENTITY_LABELS[identity]} · ${IDENTITY_DESC[identity]} · 精选${recipes.length}道`;

  document.getElementById('modal-recipes').innerHTML = recipes.map(r => `
    <div class="modal-recipe-item" onclick="openFromModal(${r.id})">
      <span class="mri-icon">${r.emoji}</span>
      <span class="mri-name">${r.name}</span>
      <span class="mri-meta">⏱${r.time} · 🔥${r.calories}</span>
    </div>
  `).join('');

  document.getElementById('recommend-modal').classList.add('show');
}

function closeRecommendModal() {
  document.getElementById('recommend-modal').classList.remove('show');
  navigateTo('home');
}

function openFromModal(id) {
  document.getElementById('recommend-modal').classList.remove('show');
  openRecipeDetail(id);
}

// ============================================
// 首页：食材选择
// ============================================
function renderIngredientGrid() {
  const container = document.getElementById('ingredient-grid');
  container.innerHTML = INGREDIENTS.map((ing, i) => `
    <div class="ingredient-item${AppState.selectedIngredients.includes(i) ? ' selected' : ''}"
         onclick="toggleIngredient(${i}, this)">
      <span class="ing-icon">${ing.icon}</span>
      <span class="ing-name">${ing.name}</span>
    </div>
  `).join('');
}

function toggleIngredient(idx, el) {
  const pos = AppState.selectedIngredients.indexOf(idx);
  if (pos > -1) {
    AppState.selectedIngredients.splice(pos, 1);
    el.classList.remove('selected');
  } else {
    AppState.selectedIngredients.push(idx);
    el.classList.add('selected');
  }
}

function addCustomIngredient() {
  const input = document.getElementById('custom-ing-input');
  const name = input.value.trim();
  if (!name) return;
  if (AppState.customIngredients.includes(name)) { showToast('已经添加过啦~'); return; }
  AppState.customIngredients.push(name);
  input.value = '';
  renderCustomIngredients();
}

function removeCustomIngredient(name) {
  AppState.customIngredients = AppState.customIngredients.filter(n => n !== name);
  renderCustomIngredients();
}

function renderCustomIngredients() {
  const c = document.getElementById('custom-ings');
  c.innerHTML = AppState.customIngredients.map(name => `
    <span style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:var(--orange);border:2px solid var(--stroke);border-radius:50px;font-size:0.78rem;font-weight:700;cursor:pointer;"
          onclick="removeCustomIngredient('${name}')">${name} ✕</span>
  `).join('');
}

// ============================================
// 首页：烹饪方式
// ============================================
function renderMethods() {
  const c = document.getElementById('method-btns');
  c.innerHTML = METHODS.map((m, i) => `
    <div class="btn-choice${AppState.selectedMethods.includes(i) ? ' selected' : ''}"
         onclick="toggleMethod(${i}, this)">
      <span class="choice-icon">${m.icon}</span>
      <span>${m.name}</span>
    </div>
  `).join('');
}

function toggleMethod(idx, el) {
  const pos = AppState.selectedMethods.indexOf(idx);
  if (pos > -1) { AppState.selectedMethods.splice(pos, 1); }
  else { AppState.selectedMethods.push(idx); }
  el.classList.toggle('selected');
}

// ============================================
// 首页：风味标签
// ============================================
function renderTastes() {
  const c = document.getElementById('taste-tags');
  c.innerHTML = TASTES.map((t, i) => `
    <div class="ribbon-tag ${t.cls}${AppState.selectedTastes.includes(i) ? ' selected' : ''}"
         onclick="toggleTaste(${i}, this)">${t.name}</div>
  `).join('');
}

function toggleTaste(idx, el) {
  const pos = AppState.selectedTastes.indexOf(idx);
  if (pos > -1) { AppState.selectedTastes.splice(pos, 1); }
  else { AppState.selectedTastes.push(idx); }
  el.classList.toggle('selected');
}

// ============================================
// 首页：难度选择（猫咪卡片）
// ============================================
function renderDifficulties() {
  const c = document.getElementById('difficulty-cards');
  c.innerHTML = DIFFICULTIES.map((d, i) => `
    <div class="cat-card${AppState.selectedDifficulty === i ? ' selected' : ''}"
         onclick="selectDifficulty(${i}, this)">
      <span class="cat-emoji">${d.cat}</span>
      <span class="cat-label">${d.name}</span>
    </div>
  `).join('');
}

function selectDifficulty(idx, el) {
  AppState.selectedDifficulty = idx;
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ============================================
// 滑块交互（猫爪拖动）
// ============================================
function setSlider(type, value) {
  const pct = (value / 2) * 100;
  document.getElementById(`${type}-fill`).style.width = pct + '%';
  document.getElementById(`${type}-thumb`).style.left = pct + '%';
}

function updateSliderFromEvent(type, e) {
  const track = document.getElementById(`${type}-slider-track`);
  const rect = track.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let ratio = (clientX - rect.left) / rect.width;
  ratio = Math.max(0, Math.min(1, ratio));
  const value = Math.round(ratio * 2);
  if (type === 'qty') AppState.quantity = value;
  else AppState.maxTime = value;
  setSlider(type, value);
}

function startSliderDrag(e, type) {
  e.preventDefault();
  updateSliderFromEvent(type, e);

  function onMove(ev) { updateSliderFromEvent(type, ev); }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onUp);
}

// ============================================
// 生成菜谱
// ============================================
function generateRecipes() {
  const allIngs = [...AppState.selectedIngredients.map(i => INGREDIENTS[i].name), ...AppState.customIngredients];
  if (allIngs.length === 0) { showToast('请先选择至少一种食材哦~ 🥬'); return; }

  // 筛选逻辑
  let filtered = [...MOCK_RECIPES];
  if (AppState.selectedMethods.length > 0) {
    filtered = filtered.filter(r => AppState.selectedMethods.some(mi => r.method === METHODS[mi].name));
  }
  if (AppState.selectedTastes.length > 0) {
    filtered = filtered.filter(r => AppState.selectedTastes.some(ti => r.taste.includes(TASTES[ti].name)));
  }
  if (AppState.selectedDifficulty !== null) {
    filtered = filtered.filter(r => r.diffLevel === AppState.selectedDifficulty);
  }
  if (filtered.length === 0) filtered = [...MOCK_RECIPES];

  const count = AppState.quantity + 1;
  filtered = filtered.slice(0, count);
  renderRecipeList(filtered);
  navigateTo('recipes');
}

// ============================================
// 菜谱列表
// ============================================
function renderRecipeList(recipes) {
  const c = document.getElementById('recipe-list');
  if (recipes.length === 0) {
    c.innerHTML = `<div class="empty-state"><div class="empty-icon">🍽️</div><p>没有找到合适的菜谱~</p><p style="font-size:0.78rem;">试试调整筛选条件吧！</p></div>`;
    return;
  }
  c.innerHTML = recipes.map(r => `
    <div class="recipe-card" onclick="openRecipeDetail(${r.id})">
      <div class="rc-image">${r.emoji}</div>
      <div class="rc-info">
        <div class="rc-name">${r.name}</div>
        <div class="rc-meta">
          <span>⏱ ${r.time}</span>
          <span>📊 ${r.difficulty}</span>
          <span>🔥 ${r.calories}</span>
        </div>
        <div class="rc-tags">${r.tags.map(t => `<span class="mini-tag">${t}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
}

// ============================================
// 菜谱详情
// ============================================
function openRecipeDetail(id) {
  const recipe = MOCK_RECIPES.find(r => r.id === id);
  if (!recipe) return;
  AppState.currentRecipe = recipe;
  const hero = document.getElementById('detail-hero');
  hero.textContent = recipe.emoji;
  hero.style.background = `linear-gradient(135deg, ${recipe.heroColor || '#F3DFC1'} 0%, ${recipe.heroColor || '#F3DFC1'} 60%, rgba(255,255,255,0.5) 100%)`;
  document.getElementById('detail-name').textContent = recipe.name;
  document.getElementById('detail-time').textContent = recipe.time;
  document.getElementById('detail-difficulty').textContent = recipe.difficulty;
  document.getElementById('detail-calories').textContent = recipe.calories;
  document.getElementById('detail-ingredients').innerHTML = recipe.ingredients.map(i => `<span class="ing-tag">${i}</span>`).join('');
  document.getElementById('detail-steps').innerHTML = recipe.steps.map((s, idx) => `
    <div class="step-card">
      <div class="step-num">${idx + 1}</div>
      <div class="step-content"><div class="step-text">${s.text}</div></div>
      <div class="step-illustration">${s.emoji}</div>
    </div>
  `).join('');
  document.getElementById('detail-protein').textContent = recipe.protein;
  document.getElementById('detail-carbs').textContent = recipe.carbs;
  document.getElementById('detail-fat').textContent = recipe.fat;
  navigateTo('recipe-detail');
}

// ============================================
// 个人中心
// ============================================
function updateProfilePage() {
  const names = { college: '干饭大学生', solo: '独居小当家', fitness: '健身餐达人' };
  const icons = { college: '🎓', solo: '🏠', fitness: '💪' };
  const labels = { college: '大学生', solo: '独居青年', fitness: '健身减脂' };
  const cur = AppState.userIdentity || 'college';
  document.getElementById('profile-avatar-icon').textContent = icons[cur];
  document.getElementById('profile-name').textContent = names[cur];
  document.getElementById('profile-identity').textContent = labels[cur];
  document.getElementById('coin-count').textContent = AppState.coins;
  document.getElementById('fav-count').textContent = AppState.favorites.length;
  document.getElementById('share-count').textContent = AppState.history.length;
  document.getElementById('top-coin').textContent = AppState.coins;
}

// ============================================
// 初始化
// ============================================
function init() {
  renderIngredientGrid();
  renderMethods();
  renderTastes();
  renderDifficulties();
  renderRecipeList(MOCK_RECIPES.slice(0, 3));
  updateProfilePage();

  // 底部导航点击
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page === 'discover' || page === 'favorites') {
        showToast('功能即将上线~ 🚧');
        return;
      }
      if (page === 'recipes') renderRecipeList(MOCK_RECIPES.slice(0, AppState.quantity + 1));
      navigateTo(page);
    });
  });

  navigateTo('splash');
}

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

document.addEventListener('DOMContentLoaded', init);
