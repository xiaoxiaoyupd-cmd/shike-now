/* ============================================
   食刻NOW — 应用逻辑
   ============================================ */

// --- localStorage 工具 ---
function saveData(key, data) {
  try { localStorage.setItem('sk_' + key, JSON.stringify(data)); } catch(e) {}
}
function loadData(key, defaultVal) {
  try {
    const raw = localStorage.getItem('sk_' + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch(e) { return defaultVal; }
}

// --- 全局状态 ---
const AppState = {
  currentPage: 'splash',
  userIdentity: loadData('identity', null),
  selectedIngredients: [],
  customIngredients: [],
  selectedMethods: [],
  selectedTastes: [],
  selectedDifficulty: null,
  quantity: 1,       // 0=1人份, 1=2-3人份, 2=家庭份
  maxTime: 1,        // 0=15min, 1=30min, 2=45min+
  currentRecipe: null,
  coins: loadData('coins', 230),
  favorites: loadData('favorites', []),    // 收藏的菜谱ID数组
  favPosts: loadData('favPosts', []),      // 收藏的帖子ID数组
  history: loadData('history', []),        // [{recipeId, timestamp}]
  posts: loadData('posts', []),            // 用户发布的帖子
  nickname: loadData('nickname', ''),
  settings: loadData('settings', {})
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
// 收藏 & 烹饪历史 操作
// ============================================
function toggleFavorite(recipeId) {
  const pos = AppState.favorites.indexOf(recipeId);
  if (pos > -1) {
    AppState.favorites.splice(pos, 1);
  } else {
    AppState.favorites.push(recipeId);
  }
  saveData('favorites', AppState.favorites);
  updateFavCookedBtns();
}

function isFavorited(recipeId) {
  return AppState.favorites.includes(recipeId);
}

function markAsCooked(recipeId) {
  if (isCooked(recipeId)) {
    // 已制作过 → 取消
    AppState.history = AppState.history.filter(h => h.recipeId !== recipeId);
    saveData('history', AppState.history);
    updateFavCookedBtns();
    showToast('已取消记录');
  } else {
    AppState.history.unshift({
      recipeId: recipeId,
      timestamp: Date.now()
    });
    saveData('history', AppState.history);
    updateFavCookedBtns();
    showToast('太棒了！已加入烹饪历史 🎉');
  }
}

function isCooked(recipeId) {
  return AppState.history.some(h => h.recipeId === recipeId);
}

function updateFavCookedBtns() {
  const recipeId = AppState.currentRecipe ? AppState.currentRecipe.id : null;
  if (!recipeId) return;
  const favBtn = document.getElementById('btn-fav');
  const cookedBtn = document.getElementById('btn-cooked');
  if (!favBtn || !cookedBtn) return;

  if (isFavorited(recipeId)) {
    favBtn.textContent = '⭐ 已收藏';
    favBtn.classList.add('active');
  } else {
    favBtn.textContent = '☆ 收藏菜谱';
    favBtn.classList.remove('active');
  }
  if (isCooked(recipeId)) {
    cookedBtn.textContent = '✅ 已制作完成';
    cookedBtn.classList.add('done');
  } else {
    cookedBtn.textContent = '🍽️ 美味已制作完成';
    cookedBtn.classList.remove('done');
  }
  updateProfilePage();
}

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
  if (pageName === 'favorites') renderFavoritesPage();
  if (pageName === 'history') renderHistoryPage();
  if (pageName === 'discover') renderDiscoverPage();
  if (pageName === 'settings') renderSettingsPage();
}

function updateNavBar(pageName) {
  const navPages = ['home', 'discover', 'favorites', 'profile', 'create', 'history', 'settings'];
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
  saveData('identity', AppState.userIdentity);
  updateBannerForIdentity();
  if (AppState.userIdentity === 'headchef') {
    // 主厨直接进社区
    navigateTo('discover');
  } else {
    showRecommendModal();
  }
}

function updateBannerForIdentity() {
  const bannerConfigs = {
    college:  { title: '食刻NOW——<br>个性化美食生成', emoji: '🐱👨‍🍳' },
    solo:     { title: '食刻NOW——<br>一人食也精彩', emoji: '🍳' },
    fitness:  { title: '食刻NOW——<br>吃出好身材', emoji: '💪' },
    prochef:  { title: '食刻NOW——<br>米其林灵感进修', emoji: '👨‍🍳' },
    headchef: { title: '食刻NOW——<br>分享你的招牌菜', emoji: '🧑‍🍳' }
  };
  const config = bannerConfigs[AppState.userIdentity] || bannerConfigs.college;
  document.getElementById('banner-title').innerHTML = config.title;
  document.getElementById('banner-emoji').textContent = config.emoji;
}

// ============================================
// 身份推荐 — 为你推荐弹窗
// ============================================

// 每个身份推荐6道菜
const IDENTITY_RECIPES = {
  college:  [1, 4, 8, 9, 12, 15],  // 大学生：番茄炒蛋、酸辣土豆丝、麻婆豆腐、蛋炒饭、可乐鸡翅、懒人焖饭
  solo:     [1, 2, 5, 9, 11, 14],  // 独居：番茄炒蛋、蒜蓉西兰花、照烧鸡腿、蛋炒饭、凉拌黄瓜、味噌汤
  fitness:  [2, 6, 8, 11, 5, 14],  // 健身：蒜蓉西兰花、清蒸鲈鱼、麻婆豆腐、凉拌黄瓜、照烧鸡腿、味噌汤
  prochef:  [3, 5, 7, 10, 16, 17], // 专业厨师：红烧肉、照烧鸡腿、天妇罗炸虾、糖醋里脊、香煎牛排、法式红酒炖鸡
  headchef: [7, 3, 10, 13, 18, 19] // 主厨：天妇罗、红烧肉、糖醋里脊、地三鲜、惠灵顿牛排、海鲜意面
};

const IDENTITY_LABELS = {
  college: '大学生',
  solo: '独居青年',
  fitness: '健身减脂',
  prochef: '专业厨师',
  headchef: '主厨'
};

const IDENTITY_DESC = {
  college: '便宜快手 · 一锅搞定',
  solo: '一人食量 · 拒绝浪费',
  fitness: '高蛋白低卡 · 好吃不胖',
  prochef: '进阶学习 · 米其林灵感',
  headchef: '分享交流 · 美食社区'
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
  updateFavCookedBtns();
}

// ============================================
// 个人中心
// ============================================
function updateProfilePage() {
  const names = { college: '干饭大学生', solo: '独居小当家', fitness: '健身餐达人', prochef: '进阶小厨神', headchef: '食刻主厨' };
  const icons = { college: '🎓', solo: '🏠', fitness: '💪', prochef: '👨‍🍳', headchef: '🧑‍🍳' };
  const labels = { college: '大学生', solo: '独居青年', fitness: '健身减脂', prochef: '专业厨师', headchef: '主厨' };
  const cur = AppState.userIdentity || 'college';
  document.getElementById('profile-avatar-icon').textContent = icons[cur];
  const displayName = AppState.nickname || names[cur];
  document.getElementById('profile-name').textContent = displayName;
  document.getElementById('profile-identity').textContent = labels[cur];
  document.getElementById('coin-count').textContent = AppState.coins;
  document.getElementById('fav-count').textContent = AppState.favorites.length + AppState.favPosts.length;
  document.getElementById('share-count').textContent = AppState.posts.length;
  document.getElementById('top-coin').textContent = AppState.coins;
}

// ============================================
// 收藏页
// ============================================
let currentFavTab = 'recipes';

function switchFavTab(tab, el) {
  currentFavTab = tab;
  document.querySelectorAll('#page-favorites .tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('#page-favorites .tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`fav-${tab}-tab`).classList.add('active');
  if (tab === 'recipes') renderFavRecipes();
  else renderFavPosts();
}

function renderFavoritesPage() {
  currentFavTab = 'recipes';
  document.querySelectorAll('#page-favorites .tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('#page-favorites .tab-content').forEach((c, i) => c.classList.toggle('active', i === 0));
  renderFavRecipes();
  renderFavPosts();
}

function renderFavRecipes() {
  const container = document.getElementById('fav-recipes-tab');
  const recipes = AppState.favorites.map(id => MOCK_RECIPES.find(r => r.id === id)).filter(Boolean);
  if (recipes.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🍳</div><p>还没有收藏菜谱哦~</p><p style="font-size:0.78rem;">去首页挑选喜欢的菜谱吧！</p><button class="btn btn-primary" onclick="navigateTo('home')">去首页看看</button></div>`;
    return;
  }
  container.innerHTML = recipes.map(r => `
    <div class="recipe-card" style="position:relative;" onclick="openRecipeDetail(${r.id})">
      <div class="rc-image">${r.emoji}</div>
      <div class="rc-info">
        <div class="rc-name">${r.name}</div>
        <div class="rc-meta">
          <span>⏱ ${r.time}</span>
          <span>📊 ${r.difficulty}</span>
          <span>🔥 ${r.calories}</span>
        </div>
      </div>
      <button class="btn-remove" onclick="event.stopPropagation();removeFavorite(${r.id})" title="取消收藏">✕</button>
    </div>
  `).join('');
}

function renderFavPosts() {
  const container = document.getElementById('fav-posts-tab');
  const posts = AppState.favPosts.map(id => AppState.posts.find(p => p.id === id)).filter(Boolean);
  if (posts.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><p>还没有收藏帖子哦~</p><p style="font-size:0.78rem;">去发现页看看大家的美食分享吧！</p><button class="btn btn-primary" onclick="navigateTo('discover')">去发现页</button></div>`;
    return;
  }
  container.innerHTML = posts.map(p => renderPostCard(p)).join('');
}

function removeFavorite(recipeId) {
  AppState.favorites = AppState.favorites.filter(id => id !== recipeId);
  saveData('favorites', AppState.favorites);
  renderFavRecipes();
  updateProfilePage();
  showToast('已取消收藏');
}

// ============================================
// 烹饪历史页
// ============================================
function renderHistoryPage() {
  const container = document.getElementById('history-list');
  if (AppState.history.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📜</div><p>还没有烹饪记录~</p><p style="font-size:0.78rem;">做完一道菜后点击"美味已制作完成"来记录吧！</p><button class="btn btn-primary" onclick="navigateTo('home')">去首页看看</button></div>`;
    return;
  }
  container.innerHTML = AppState.history.map(h => {
    const recipe = MOCK_RECIPES.find(r => r.id === h.recipeId);
    if (!recipe) return '';
    const date = new Date(h.timestamp);
    const dateStr = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
    return `
      <div class="recipe-card" onclick="openRecipeDetail(${recipe.id})">
        <div class="rc-image">${recipe.emoji}</div>
        <div class="rc-info">
          <div class="rc-name">${recipe.name}</div>
          <div class="rc-meta">
            <span>⏱ ${recipe.time}</span>
            <span>🔥 ${recipe.calories}</span>
          </div>
          <div class="history-date">🕐 ${dateStr}</div>
        </div>
        <button class="btn-remove" onclick="event.stopPropagation();removeHistory(${h.recipeId})" title="删除记录">✕</button>
      </div>
    `;
  }).join('');
}

function removeHistory(recipeId) {
  AppState.history = AppState.history.filter(h => h.recipeId !== recipeId);
  saveData('history', AppState.history);
  renderHistoryPage();
  updateProfilePage();
  showToast('已删除记录');
}

// ============================================
// 发布页
// ============================================
const COVER_EMOJIS = ['🍱','🍜','🍝','🍛','🍲','🍳','🥘','🍗','🥗','🍰','🧁','🍩','🥟','🍣','🥩','🍕','🥐','🍞','🥨','🧇'];
const POST_TAGS = ['🥗减脂','🍱便当','🍰甜品','🍜面食','🥘家常','🌶️川味','🍣日料','🎂烘焙','🍲汤羹','🥟小吃'];
let selectedCoverEmoji = null;
let selectedRefRecipeId = null;
let selectedPostTags = [];

function resetCreatePage() {
  selectedCoverEmoji = null;
  selectedRefRecipeId = null;
  selectedPostTags = [];
  document.getElementById('cover-placeholder').style.display = '';
  document.getElementById('cover-preview').style.display = 'none';
  document.getElementById('emoji-picker').style.display = 'none';
  document.getElementById('post-title').value = '';
  document.getElementById('post-desc').value = '';
  document.getElementById('recipe-ref-name').style.display = 'none';
  document.getElementById('recipe-ref-clear').style.display = 'none';
  renderTagChips();
}

function pickCoverEmoji() {
  const picker = document.getElementById('emoji-picker');
  if (picker.style.display === 'none') {
    const grid = document.getElementById('emoji-grid');
    grid.innerHTML = COVER_EMOJIS.map(e => `
      <div class="emoji-option${selectedCoverEmoji === e ? ' selected' : ''}"
           onclick="selectCoverEmoji('${e}', this)">${e}</div>
    `).join('');
    picker.style.display = 'block';
  } else {
    picker.style.display = 'none';
  }
}

function selectCoverEmoji(emoji, el) {
  selectedCoverEmoji = emoji;
  document.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function confirmCoverEmoji() {
  if (!selectedCoverEmoji) { showToast('请先选一个封面哦~ 📸'); return; }
  document.getElementById('cover-placeholder').style.display = 'none';
  document.getElementById('cover-preview').style.display = 'flex';
  document.getElementById('cover-emoji').textContent = selectedCoverEmoji;
  document.getElementById('emoji-picker').style.display = 'none';
}

function renderTagChips() {
  const container = document.getElementById('tag-chips');
  container.innerHTML = POST_TAGS.map(tag => `
    <span class="tag-chip${selectedPostTags.includes(tag) ? ' selected' : ''}"
          onclick="togglePostTag('${tag}', this)">${tag}</span>
  `).join('');
}

function togglePostTag(tag, el) {
  const pos = selectedPostTags.indexOf(tag);
  if (pos > -1) {
    selectedPostTags.splice(pos, 1);
    el.classList.remove('selected');
  } else {
    if (selectedPostTags.length >= 5) { showToast('最多选5个标签哦~'); return; }
    selectedPostTags.push(tag);
    el.classList.add('selected');
  }
}

function showRecipePicker() {
  document.getElementById('recipe-picker-list').innerHTML = MOCK_RECIPES.map(r => `
    <div class="recipe-picker-item${selectedRefRecipeId === r.id ? ' selected' : ''}"
         onclick="selectRecipeRef(${r.id})">
      <span>${r.emoji}</span>
      <span style="font-weight:700;">${r.name}</span>
      <span style="font-size:0.7rem;color:var(--brown-light);">⏱${r.time}</span>
    </div>
  `).join('');
  document.getElementById('recipe-picker-modal').classList.add('show');
}

function closeRecipePicker() {
  document.getElementById('recipe-picker-modal').classList.remove('show');
}

function selectRecipeRef(id) {
  selectedRefRecipeId = id;
  document.getElementById('recipe-picker-modal').classList.remove('show');
  const recipe = MOCK_RECIPES.find(r => r.id === id);
  document.getElementById('recipe-ref-name').textContent = recipe.emoji + ' ' + recipe.name;
  document.getElementById('recipe-ref-name').style.display = '';
  document.getElementById('recipe-ref-clear').style.display = '';
}

function clearRecipeRef() {
  selectedRefRecipeId = null;
  document.getElementById('recipe-ref-name').style.display = 'none';
  document.getElementById('recipe-ref-clear').style.display = 'none';
}

function publishPost() {
  const title = document.getElementById('post-title').value.trim();
  const desc = document.getElementById('post-desc').value.trim();
  if (!selectedCoverEmoji) { showToast('请先选择封面图哦~ 📸'); return; }
  if (!title) { showToast('请输入标题哦~ ✨'); return; }
  if (!desc) { showToast('请输入描述哦~ 📝'); return; }

  const names = { college: '干饭大学生', solo: '独居小当家', fitness: '健身餐达人', prochef: '进阶小厨神', headchef: '食刻主厨' };
  const icons = { college: '🎓', solo: '🏠', fitness: '💪', prochef: '👨‍🍳', headchef: '🧑‍🍳' };
  const cur = AppState.userIdentity || 'college';

  const post = {
    id: Date.now(),
    type: 'post',
    title: title,
    desc: desc,
    image: selectedCoverEmoji,
    tags: selectedPostTags,
    recipeRef: selectedRefRecipeId,
    author: {
      name: AppState.nickname || names[cur],
      avatar: icons[cur]
    },
    time: Date.now(),
    likes: 0,
    likedBy: []
  };

  AppState.posts.unshift(post);
  saveData('posts', AppState.posts);

  // 如果有关联菜谱，自动收藏该菜谱
  if (selectedRefRecipeId && !isFavorited(selectedRefRecipeId)) {
    AppState.favorites.push(selectedRefRecipeId);
    saveData('favorites', AppState.favorites);
  }

  resetCreatePage();
  showToast('发布成功！🎉');
  navigateTo('discover');
}

// ============================================
// 发现页（美食社区）
// ============================================
let discoverFilter = 'all';

// 预置示例帖子
const SEED_POSTS = [
  {
    id: 1001, type: 'post',
    title: '宿舍版番茄炒蛋！超下饭',
    desc: '用电煮锅就能做，全程15分钟搞定，舍友都说好吃~',
    image: '🍳', tags: ['🥘家常', '🍱便当'],
    recipeRef: 1,
    author: { name: '干饭大学生', avatar: '🎓' },
    time: Date.now() - 86400000 * 2,
    likes: 28, likedBy: []
  },
  {
    id: 1002, type: 'post',
    title: '减脂期最爱的蒜蓉西兰花',
    desc: '低卡又美味，已经连续吃了一周了！姐妹们冲！',
    image: '🥗', tags: ['🥗减脂', '🍱便当'],
    recipeRef: 2,
    author: { name: '健身餐达人', avatar: '💪' },
    time: Date.now() - 86400000,
    likes: 56, likedBy: []
  },
  {
    id: 1003, type: 'post',
    title: '第一次做照烧鸡腿就成功！',
    desc: '照着菜谱做的，照烧汁超浓郁，比外卖好吃一百倍~',
    image: '🍗', tags: ['🍣日料', '🍱便当'],
    recipeRef: 5,
    author: { name: '独居小当家', avatar: '🏠' },
    time: Date.now() - 43200000,
    likes: 42, likedBy: []
  },
  {
    id: 1004, type: 'post',
    title: '周末在家做的抹茶蛋糕',
    desc: '第一次尝试烘焙，虽然卖相一般但味道超棒！',
    image: '🍰', tags: ['🍰甜品', '🎂烘焙'],
    recipeRef: null,
    author: { name: '独居小当家', avatar: '🏠' },
    time: Date.now() - 21600000,
    likes: 89, likedBy: []
  },
  {
    id: 1005, type: 'post',
    title: '可乐鸡翅！朋友聚会必做',
    desc: '简单又拿得出手的硬菜，每次朋友来都点名要吃这个~',
    image: '🥘', tags: ['🥘家常', '🍱便当'],
    recipeRef: 12,
    author: { name: '干饭大学生', avatar: '🎓' },
    time: Date.now() - 3600000,
    likes: 34, likedBy: []
  }
];

function initSeedPosts() {
  if (!localStorage.getItem('sk_posts_seeded')) {
    AppState.posts = [...SEED_POSTS, ...AppState.posts];
    saveData('posts', AppState.posts);
    localStorage.setItem('sk_posts_seeded', '1');
  }
}

function renderDiscoverPage() {
  initSeedPosts();
  // 从localStorage重新加载posts
  AppState.posts = loadData('posts', []);
  filterDiscover(discoverFilter);
}

function filterDiscover(filter, el) {
  discoverFilter = filter;
  if (el) {
    document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }
  let posts = [...AppState.posts];
  if (filter !== 'all') {
    posts = posts.filter(p => p.tags && p.tags.includes(filter));
  }
  posts.sort((a, b) => b.time - a.time);
  const container = document.getElementById('discover-feed');
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <p>这个分类还没有帖子~</p>
        <p style="font-size:0.78rem;">快来发布第一条吧！</p>
        <button class="btn btn-primary" onclick="navigateTo('create');resetCreatePage()">📸 去发布</button>
      </div>`;
    return;
  }
  container.innerHTML = posts.map(p => renderPostCard(p)).join('');
}

function renderPostCard(p) {
  const recipe = p.recipeRef ? MOCK_RECIPES.find(r => r.id === p.recipeRef) : null;
  const isLiked = p.likedBy && p.likedBy.includes(AppState.userIdentity || 'college');
  const timeStr = getTimeAgo(p.time);
  return `
    <div class="post-card">
      <div class="post-cover">${p.image}</div>
      <div class="post-body">
        <div class="post-author">
          <span class="pa-avatar">${p.author.avatar}</span>
          <span class="pa-name">${p.author.name}</span>
          <span class="pa-time">${timeStr}</span>
        </div>
        <div class="post-title">${p.title}</div>
        <div class="post-desc">${p.desc}</div>
        <div class="post-tags">${(p.tags||[]).map(t => `<span class="mini-tag">${t}</span>`).join('')}</div>
        ${recipe ? `<div class="post-recipe-link" onclick="event.stopPropagation();openRecipeDetail(${recipe.id})">
          📖 关联菜谱：${recipe.name} →
        </div>` : ''}
        <div class="post-actions">
          <span class="action-btn${isLiked ? ' liked' : ''}" onclick="event.stopPropagation();likePost(${p.id})">
            ${isLiked ? '❤️' : '🤍'} <span id="like-count-${p.id}">${p.likes}</span>
          </span>
          <span class="action-btn fav-btn-post"
                id="fav-post-btn-${p.id}"
                onclick="event.stopPropagation();toggleFavPost(${p.id})">
            ${isPostFavorited(p.id) ? '⭐ 已收藏' : '☆ 收藏'}
          </span>
        </div>
      </div>
    </div>`;
}

function likePost(postId) {
  const post = AppState.posts.find(p => p.id === postId);
  if (!post) return;
  if (!post.likedBy) post.likedBy = [];
  const uid = AppState.userIdentity || 'college';
  const idx = post.likedBy.indexOf(uid);
  if (idx > -1) {
    post.likedBy.splice(idx, 1);
    post.likes = Math.max(0, (post.likes || 0) - 1);
  } else {
    post.likedBy.push(uid);
    post.likes = (post.likes || 0) + 1;
  }
  saveData('posts', AppState.posts);
  // 只更新点赞数
  const countEl = document.getElementById('like-count-' + postId);
  if (countEl) countEl.textContent = post.likes;
  // 刷新整个卡片以更新心形状态
  filterDiscover(discoverFilter);
}

function isPostFavorited(postId) {
  return AppState.favPosts.includes(postId);
}

function toggleFavPost(postId) {
  const pos = AppState.favPosts.indexOf(postId);
  if (pos > -1) {
    AppState.favPosts.splice(pos, 1);
  } else {
    AppState.favPosts.push(postId);
  }
  saveData('favPosts', AppState.favPosts);
  updateProfilePage();
  // 刷新按钮
  const btn = document.getElementById('fav-post-btn-' + postId);
  if (btn) {
    btn.textContent = isPostFavorited(postId) ? '⭐ 已收藏' : '☆ 收藏';
  }
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return mins + '分钟前';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + '小时前';
  const days = Math.floor(hours / 24);
  if (days < 7) return days + '天前';
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

// ============================================
// 设置页
// ============================================
const AVATAR_EMOJIS = ['🎓','🏠','💪','👧','👦','🐱','🐶','🐰','🦊','🐻','🐼','🐨'];
let tempAvatar = null;
let tempNickname = null;

function renderSettingsPage() {
  const icons = { college: '🎓', solo: '🏠', fitness: '💪', prochef: '👨‍🍳', headchef: '🧑‍🍳' };
  const names = { college: '干饭大学生', solo: '独居小当家', fitness: '健身餐达人', prochef: '进阶小厨神', headchef: '食刻主厨' };
  const labels = { college: '大学生', solo: '独居青年', fitness: '健身减脂', prochef: '专业厨师', headchef: '主厨' };
  const cur = AppState.userIdentity || 'college';
  const savedAvatar = loadData('avatar', icons[cur]);
  document.getElementById('setting-avatar').textContent = savedAvatar;
  document.getElementById('setting-nickname').textContent = AppState.nickname || names[cur];
  document.getElementById('setting-identity').textContent = labels[cur];
  // 高亮当前身份
  document.querySelectorAll('#page-settings .identity-card').forEach(c => c.classList.remove('selected'));
  const activeCard = document.getElementById('set-' + cur);
  if (activeCard) activeCard.classList.add('selected');

  // 恢复开关状态
  const notifOn = loadData('setting_notif', true);
  const soundOn = loadData('setting_sound', true);
  document.getElementById('toggle-notif').checked = notifOn;
  document.getElementById('toggle-sound').checked = soundOn;
}

function showAvatarPicker() {
  tempAvatar = document.getElementById('setting-avatar').textContent;
  const grid = document.getElementById('avatar-grid');
  grid.innerHTML = AVATAR_EMOJIS.map(e => `
    <div class="emoji-option${tempAvatar === e ? ' selected' : ''}"
         onclick="pickAvatar('${e}', this)">${e}</div>
  `).join('');
  document.getElementById('avatar-picker-modal').classList.add('show');
}

function pickAvatar(emoji, el) {
  tempAvatar = emoji;
  document.querySelectorAll('#avatar-grid .emoji-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

function closeAvatarPicker() {
  if (tempAvatar) {
    document.getElementById('setting-avatar').textContent = tempAvatar;
    saveData('avatar', tempAvatar);
    // 更新profile页
    document.getElementById('profile-avatar-icon').textContent = tempAvatar;
  }
  document.getElementById('avatar-picker-modal').classList.remove('show');
}

function editNickname() {
  tempNickname = document.getElementById('setting-nickname').textContent;
  document.getElementById('nickname-input').value = tempNickname;
  document.getElementById('nickname-modal').classList.add('show');
  setTimeout(() => document.getElementById('nickname-input').focus(), 200);
}

function confirmNickname() {
  const val = document.getElementById('nickname-input').value.trim();
  if (!val) { showToast('昵称不能为空哦~'); return; }
  tempNickname = val;
  AppState.nickname = val;
  saveData('nickname', val);
  document.getElementById('setting-nickname').textContent = val;
  document.getElementById('profile-name').textContent = val;
  document.getElementById('nickname-modal').classList.remove('show');
  showToast('昵称已更新 ✨');
}

function closeNicknameModal() {
  document.getElementById('nickname-modal').classList.remove('show');
}

function switchIdentity(identity) {
  AppState.userIdentity = identity;
  saveData('identity', identity);
  updateBannerForIdentity();
  updateProfilePage();
  renderSettingsPage();
  showToast('身份已切换 ✨');
}

function toggleSetting(type) {
  const val = document.getElementById('toggle-' + type).checked;
  saveData('setting_' + type, val);
}

function clearAllData() {
  if (confirm('确定要清除所有缓存数据吗？\n\n这将删除：\n• 收藏的菜谱和帖子\n• 烹饪历史\n• 发布的帖子\n\n身份和昵称会保留。')) {
    AppState.favorites = [];
    AppState.favPosts = [];
    AppState.history = [];
    AppState.posts = [];
    saveData('favorites', []);
    saveData('favPosts', []);
    saveData('history', []);
    saveData('posts', []);
    // 重新播种示例帖子
    localStorage.removeItem('sk_posts_seeded');
    updateProfilePage();
    showToast('缓存已清除 ✅');
  }
}

function logout() {
  if (confirm('确定要退出登录吗？\n\n你的收藏、历史和帖子数据会保留在本机。')) {
    AppState.userIdentity = null;
    saveData('identity', null);
    navigateTo('splash');
    updateNavBar('splash');
  }
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
      if (page === 'discover') {
        navigateTo('discover');
        return;
      }
      if (page === 'favorites') {
        navigateTo('favorites');
        return;
      }
      navigateTo(page);
    });
  });

  // 如果已有身份，直接进首页；否则显示启动页
  if (AppState.userIdentity) {
    updateBannerForIdentity();
    navigateTo('home');
  } else {
    navigateTo('splash');
  }
}

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

document.addEventListener('DOMContentLoaded', init);
