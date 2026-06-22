const defaultCategories = [
  { name: "蔬菜", icon: "🥬" },
  { name: "肉类", icon: "🥩" },
  { name: "海鲜", icon: "🦐" },
  { name: "主食", icon: "🍚" },
  { name: "汤", icon: "🍲" },
  { name: "其他", icon: "🍽️" }
];
const manageCategoryLabel = { name: "分类管理", icon: "⚙️", isManage: true };
const categoryIcons = {
  "分类管理": "⚙️"
};
const storageKey = "mouse-menu-dishes";
const cartKey = "mouse-menu-cart-count";
const cartItemsKey = "mouse-menu-cart-items";
const profileKey = "mouse-menu-profile";
const customCategoriesKey = "mouse-menu-custom-categories";

const builtInDishes = [
  {
    id: "dish-1",
    name: "酸辣土豆丝",
    desc: "土豆",
    category: "蔬菜",
    sales: 2,
    image: makeFoodSvg("#f4d46a", "#b83327", "酸")
  },
  {
    id: "dish-2",
    name: "西红柿炒鸡蛋",
    desc: "西红柿、鸡蛋",
    category: "蔬菜",
    sales: 0,
    image: makeFoodSvg("#f0693a", "#f8cf4d", "番")
  },
  {
    id: "dish-3",
    name: "清炒/水煮西兰花",
    desc: "西兰花",
    category: "蔬菜",
    sales: 0,
    image: makeFoodSvg("#2aa35b", "#d93f38", "青")
  },
  {
    id: "dish-4",
    name: "手撕包菜",
    desc: "包菜",
    category: "蔬菜",
    sales: 0,
    image: makeFoodSvg("#cfe57b", "#7b3f19", "包")
  },
  {
    id: "dish-5",
    name: "水煮肉片",
    desc: "豆芽、青菜、肉片",
    category: "肉类",
    sales: 0,
    image: makeFoodSvg("#db4a32", "#f2f2f2", "肉")
  }
];

const categoryList = document.querySelector("#categoryList");
const categoryTitle = document.querySelector("#categoryTitle");
const dishList = document.querySelector("#dishList");
const cartCount = document.querySelector("#cartCount");
const dialog = document.querySelector("#dishDialog");
const openAddDish = document.querySelector("#openAddDish");
const closeDialog = document.querySelector("#closeDialog");
const dishForm = document.querySelector("#dishForm");
const dishCategory = document.querySelector("#dishCategory");
const dishImage = document.querySelector("#dishImage");
const dialogPreview = document.querySelector("#dialogPreview");
const dialogHint = document.querySelector("#dialogHint");
const editShop = document.querySelector("#editShop");
const orderDialog = document.querySelector("#orderDialog");
const closeOrderDialog = document.querySelector("#closeOrderDialog");
const orderItems = document.querySelector("#orderItems");
const orderMessage = document.querySelector("#orderMessage");
const sendToBoyfriend = document.querySelector("#sendToBoyfriend");
const clearCart = document.querySelector("#clearCart");
const sendTip = document.querySelector("#sendTip");
const orderTab = document.querySelectorAll(".tab")[1];
const profileTab = document.querySelectorAll(".tab")[2];
const profileDialog = document.querySelector("#profileDialog");
const closeProfileDialog = document.querySelector("#closeProfileDialog");
const profileForm = document.querySelector("#profileForm");
const profileName = document.querySelector("#profileName");
const profileTaste = document.querySelector("#profileTaste");
const profileAvoid = document.querySelector("#profileAvoid");
const profileNote = document.querySelector("#profileNote");
const profileTip = document.querySelector("#profileTip");
const shopAvatar = document.querySelector("#shopAvatar");
const shopName = document.querySelector("#shopName");
const shopTagline = document.querySelector("#shopTagline");
const profileAvatar = document.querySelector("#profileAvatar");
const avatarPreview = document.querySelector("#avatarPreview");
const menuTab = document.querySelectorAll(".tab")[0];
const searchRow = document.querySelector("#searchRow");
const searchInput = document.querySelector("#searchInput");
const clearSearch = document.querySelector("#clearSearch");
const toastDialog = document.querySelector("#toastDialog");
const toastText = document.querySelector("#toastText");
const categoryDialog = document.querySelector("#categoryDialog");
const categoryForm = document.querySelector("#categoryForm");
const closeCategoryDialog = document.querySelector("#closeCategoryDialog");
const categoryName = document.querySelector("#categoryName");
const categoryManageList = document.querySelector("#categoryManageList");

let activeCategory = "蔬菜";
let pendingImage = "";
let pendingAvatar = "";
let editing = false;
let searchTerm = "";
let toastTimer = 0;

function makeFoodSvg(bg, accent, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <filter id="noise">
          <feTurbulence baseFrequency="0.8" numOctaves="2" seed="${label.charCodeAt(0)}"/>
          <feColorMatrix type="saturate" values="0.35"/>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
      </defs>
      <rect width="180" height="180" rx="28" fill="${bg}"/>
      <g filter="url(#noise)" opacity="0.38">
        <circle cx="42" cy="46" r="20" fill="#fff"/>
        <circle cx="130" cy="52" r="24" fill="${accent}"/>
        <circle cx="80" cy="104" r="36" fill="#fff"/>
        <circle cx="136" cy="124" r="26" fill="${accent}"/>
      </g>
      <text x="90" y="106" text-anchor="middle" font-size="48" font-family="Microsoft YaHei, sans-serif" font-weight="900" fill="rgba(255,255,255,0.9)">${label}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function readCustomDishes() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveCustomDishes(dishes) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(dishes));
    return true;
  } catch {
    showToast("图片太多了，先删几道自定义菜再添加。");
    return false;
  }
}

function readCustomCategories() {
  try {
    const categories = JSON.parse(localStorage.getItem(customCategoriesKey) || "[]");
    return Array.isArray(categories) ? categories.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(categories) {
  localStorage.setItem(customCategoriesKey, JSON.stringify(categories));
}

function getCategories({ includeManage = false } = {}) {
  const merged = [...defaultCategories];
  readCustomCategories().forEach((category) => {
    if (!merged.find(c => c.name === category)) {
      merged.push({ name: category, icon: "📂" });
    }
  });

  return includeManage ? [...merged, manageCategoryLabel] : merged;
}

function getCategoryName(category) {
  return typeof category === "string" ? category : category.name;
}

function allDishes() {
  return [...builtInDishes, ...readCustomDishes()];
}

function readCartItems() {
  try {
    return JSON.parse(localStorage.getItem(cartItemsKey) || "[]");
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  localStorage.setItem(cartItemsKey, JSON.stringify(items));
  localStorage.setItem(cartKey, String(items.reduce((sum, item) => sum + item.count, 0)));
}

function readProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(profileKey) || "{}");
    return profile;
  } catch {
    return {};
  }
}

function saveProfile(profile) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

async function compressAvatar(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function renderCategories() {
  categoryList.innerHTML = "";
  const counts = readCartItems().reduce((map, item) => {
    map[item.category] = (map[item.category] || 0) + item.count;
    return map;
  }, {});

  const categories = getCategories();
  const activeName = getCategoryName(activeCategory);
  if (!categories.find(c => getCategoryName(c) === activeName)) {
    activeCategory = categories[0]?.name || "蔬菜";
  }

  getCategories({ includeManage: true }).forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    const isManage = category.isManage;
    const catName = getCategoryName(category);
    const catIcon = category.icon || categoryIcons[catName] || "📂";

    button.className = isManage ? "category-item category-manage" : "category-item";
    button.innerHTML = isManage
      ? `<span class="manage-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span><span class="category-name">${catName}</span>`
      : `<span class="category-icon">${catIcon}</span><span class="category-name">${catName}</span><span class="badge-count"></span>`;

    if (getCategoryName(category) === activeName) {
      button.classList.add("active");
    }

    if (counts[catName]) {
      button.classList.add("has-count");
      button.querySelector(".badge-count").textContent = counts[catName];
    }

    button.addEventListener("click", () => {
      if (isManage) {
        setActiveTab(menuTab);
        renderCategoryManager();
        categoryDialog.showModal();
        return;
      }

      clearSearchState();
      activeCategory = catName;
      render();
    });

    categoryList.appendChild(button);
  });
}

function renderDishes() {
  const normalized = searchTerm.trim().toLowerCase();
  const activeName = getCategoryName(activeCategory);
  const dishes = allDishes().filter((dish) => {
    const inCategory = dish.category === activeName;
    const text = `${dish.name} ${dish.desc || ""} ${dish.category}`.toLowerCase();
    return normalized ? text.includes(normalized) : inCategory;
  });

  categoryTitle.textContent = normalized ? "搜索结果" : activeName;
  dishList.innerHTML = "";
  dishList.classList.toggle("editing", editing);

  if (!dishes.length) {
    dishList.innerHTML = `<p class="empty-text">${
      normalized ? "没找到这道菜。" : "这个分类还没有菜。"
    }<br />点上方"添加"手动放一张图片。</p>`;
    return;
  }

  const plusIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;

  dishes.forEach((dish) => {
    const card = document.createElement("article");
    card.className = `dish-card${dish.custom ? " can-delete" : ""}`;
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <div class="dish-info">
        <h3>${escapeHtml(dish.name)}</h3>
        <p>${escapeHtml(dish.desc || dish.name)}</p>
        <small>销量:${dish.sales || 0}</small>
      </div>
      <button class="add-button" type="button" aria-label="加入订单">${plusIcon}</button>
      <button class="delete-button" type="button" aria-label="删除菜品">×</button>
    `;

    card.querySelector(".add-button").addEventListener("click", (event) => {
      const button = event.currentTarget;
      addToCart(dish);
      button.classList.add("pulse");
      setTimeout(() => button.classList.remove("pulse"), 260);
      showToast(`已加入：${dish.name}`);
    });

    card.querySelector(".delete-button").addEventListener("click", () => {
      if (!dish.custom) {
        alert("示例菜品不能删除，可以删除你手动添加的菜。");
        return;
      }

      if (saveCustomDishes(readCustomDishes().filter((item) => item.id !== dish.id))) {
        saveCartItems(readCartItems().filter((item) => item.id !== dish.id));
        render();
      }
    });

    dishList.appendChild(card);
  });
}

function renderDialogCategories() {
  dishCategory.innerHTML = "";
  getCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = getCategoryName(category);
    option.textContent = getCategoryName(category);
    dishCategory.appendChild(option);
  });
}

function renderCategoryManager() {
  const customCategories = readCustomCategories();
  const dishCounts = allDishes().reduce((map, dish) => {
    map[dish.category] = (map[dish.category] || 0) + 1;
    return map;
  }, {});

  categoryManageList.innerHTML = "";

  getCategories().forEach((category) => {
    const catName = getCategoryName(category);
    const isDefault = defaultCategories.find(c => c.name === catName);
    const row = document.createElement("div");
    row.className = "category-manage-row";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(catName)}</strong>
        <span>${isDefault ? "默认分类" : `自定义 · ${dishCounts[catName] || 0} 道菜`}</span>
      </div>
      <button type="button" ${isDefault ? "disabled" : ""}>${isDefault ? "保留" : "删除"}</button>
    `;

    row.querySelector("button").addEventListener("click", () => {
      if (isDefault) {
        return;
      }

      saveCustomCategories(customCategories.filter((item) => item !== catName));
      saveCustomDishes(readCustomDishes().filter((dish) => dish.category !== catName));
      saveCartItems(readCartItems().filter((item) => item.category !== catName));
      if (activeCategory === catName) {
        activeCategory = "蔬菜";
      }
      renderDialogCategories();
      renderCategoryManager();
      render();
      showToast(`已删除分类：${catName}`);
    });

    categoryManageList.appendChild(row);
  });
}

function addToCart(dish) {
  const items = readCartItems();
  const existing = items.find((item) => item.id === dish.id);

  if (existing) {
    existing.count += 1;
  } else {
    items.push({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      count: 1
    });
  }

  saveCartItems(items);
  cartCount.textContent = String(items.reduce((sum, item) => sum + item.count, 0));
  renderCategories();
}

function buildOrderText(items) {
  if (!items.length) {
    return "今天还没有点菜。";
  }

  const profile = readProfile();
  const boyfriendName = profile.name || "男朋友";
  const lines = items.map((item, index) => `${index + 1}. ${item.name} x${item.count}`);
  const extras = [
    profile.taste ? `我的口味：${profile.taste}` : "",
    profile.avoid ? `我的忌口：${profile.avoid}` : "",
    profile.note ? `我想说：${profile.note}` : ""
  ].filter(Boolean);

  return `${profile.name || "我的名字"}，今天想吃这些：\n${lines.join("\n")}${
    extras.length ? `\n\n${extras.join("\n")}` : ""
  }`;
}

function renderOrderDialog() {
  const items = readCartItems();
  orderItems.innerHTML = "";
  const hasItems = items.length > 0;

  const minusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14"/></svg>`;
  const plusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>`;
  const trashIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>`;

  if (!hasItems) {
    orderItems.innerHTML = `<p class="empty-text">还没点菜，先去菜单加几个想吃的。</p>`;
  } else {
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML = `
        <span>${escapeHtml(item.name)}</span>
        <div class="order-item-controls">
          <button type="button" data-action="minus" aria-label="减少">${minusIcon}</button>
          <strong>x${item.count}</strong>
          <button type="button" data-action="plus" aria-label="增加">${plusIcon}</button>
          <button type="button" data-action="remove" aria-label="删除">${trashIcon}</button>
        </div>
      `;

      row.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => updateCartItem(item.id, button.dataset.action));
      });
      orderItems.appendChild(row);
    });
  }

  orderMessage.value = buildOrderText(items);
  sendToBoyfriend.disabled = !hasItems;
  clearCart.disabled = !hasItems;
  sendTip.hidden = true;
}

function updateCartItem(id, action) {
  const items = readCartItems();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) {
    return;
  }

  if (action === "plus") {
    items[index].count += 1;
  }

  if (action === "minus") {
    items[index].count -= 1;
  }

  if (action === "remove" || items[index].count <= 0) {
    items.splice(index, 1);
  }

  saveCartItems(items);
  render();
  renderOrderDialog();
}

function setActiveTab(tab) {
  document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastText.textContent = message;

  if (!toastDialog.open) {
    toastDialog.show();
  }

  toastTimer = setTimeout(() => {
    if (toastDialog.open) {
      toastDialog.close();
    }
  }, 1600);
}

function clearSearchState() {
  searchTerm = "";
  searchInput.value = "";
  clearSearch.hidden = true;
}

async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: "屎壳郎的情侣厨房",
        text
      });
      return true;
    } catch {
      // User cancellation or unsupported target falls through to copy.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Server酱 推送配置
const SERVERCHAN_SENDKEY = "SCT368344TmXNF7zYz0NZvf3C0pHAuzTWT";

// 发送订单到微信
async function sendToWechat(orderText) {
  const profile = readProfile();
  const title = profile.name ? `${profile.name} 点了菜` : "有人点了菜";

  try {
    const response = await fetch(`https://sctapi.ftqq.com/${SERVERCHAN_SENDKEY}.send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        desp: orderText
      })
    });

    const result = await response.json();
    if (result.code === 0 || result.errno === 0) {
      return { success: true, message: "已发送到微信" };
    } else {
      return { success: false, message: "发送失败：" + (result.msg || "未知错误") };
    }
  } catch (error) {
    return { success: false, message: "网络错误，请检查网络" };
  }
}

function renderShopHeader() {
  const profile = readProfile();
  if (shopAvatar && profile.avatar) {
    shopAvatar.src = profile.avatar;
  }
  if (shopName && profile.name) {
    shopName.textContent = profile.name;
  }
  if (shopTagline && profile.taste) {
    shopTagline.textContent = profile.taste;
  }
}

function renderProfileDialog() {
  const profile = readProfile();
  profileName.value = profile.name || "";
  profileTaste.value = profile.taste || "";
  profileAvoid.value = profile.avoid || "";
  profileNote.value = profile.note || "";
  profilePreviewName.textContent = profile.name || "我的名字";
  profilePreviewTaste.textContent = profile.name ? "点菜单会显示他的名字" : "点菜单会显示他的名字";
  profileTip.hidden = true;

  // 显示头像
  if (profile.avatar) {
    avatarPreview.src = profile.avatar;
  } else {
    avatarPreview.src = "assets/avatar.svg";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fileToSmallImage(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const size = 360;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  const x = (size - width) / 2;
  const y = (size - height) / 2;
  ctx.drawImage(bitmap, x, y, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function resetDialog() {
  dishForm.reset();
  pendingImage = "";
  dialogPreview.hidden = true;
  dialogPreview.removeAttribute("src");
  dialogHint.style.display = "flex";
  dishCategory.value = getCategoryName(activeCategory);
}

function render() {
  renderShopHeader();
  renderCategories();
  renderDishes();
  cartCount.textContent = String(readCartItems().reduce((sum, item) => sum + item.count, 0));
}

menuTab.addEventListener("click", () => {
  setActiveTab(menuTab);
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  clearSearch.hidden = !searchInput.value;
  renderDishes();
});

clearSearch.addEventListener("click", () => {
  clearSearchState();
  searchInput.focus();
  renderDishes();
});

closeCategoryDialog.addEventListener("click", () => {
  categoryDialog.close();
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = categoryName.value.trim();

  if (!name) {
    showToast("先写一个分类名");
    return;
  }

  if (getCategories().find(c => getCategoryName(c) === name) || name === manageCategoryLabel.name) {
    showToast("这个分类已经有了");
    return;
  }

  saveCustomCategories([...readCustomCategories(), name]);
  categoryName.value = "";
  activeCategory = name;
  renderDialogCategories();
  renderCategoryManager();
  render();
  showToast(`已添加分类：${name}`);
});

openAddDish.addEventListener("click", () => {
  renderDialogCategories();
  resetDialog();
  dialog.showModal();
});

closeDialog.addEventListener("click", () => {
  dialog.close();
});

editShop.addEventListener("click", () => {
  editing = !editing;
  editShop.innerHTML = editing
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>完成`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>编辑`;
  renderDishes();
  showToast(editing ? "编辑模式：可删除自定义菜，默认菜保留" : "已退出编辑模式");
});

orderTab.addEventListener("click", () => {
  setActiveTab(orderTab);
  renderOrderDialog();
  orderDialog.showModal();
});

closeOrderDialog.addEventListener("click", () => {
  orderDialog.close();
  setActiveTab(menuTab);
});

profileTab.addEventListener("click", () => {
  setActiveTab(profileTab);
  renderProfileDialog();
  profileDialog.showModal();
});

closeProfileDialog.addEventListener("click", () => {
  profileDialog.close();
  setActiveTab(menuTab);
});

// 头像上传
profileAvatar.addEventListener("change", async () => {
  const file = profileAvatar.files?.[0];
  if (!file) return;

  try {
    pendingAvatar = await compressAvatar(file);
    avatarPreview.src = pendingAvatar;
  } catch {
    showToast("头像上传失败");
  }
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const profile = {
    name: profileName.value.trim(),
    taste: profileTaste.value.trim(),
    avoid: profileAvoid.value.trim(),
    note: profileNote.value.trim(),
    avatar: pendingAvatar || readProfile().avatar || ""
  };

  saveProfile(profile);
  pendingAvatar = "";
  profileDialog.close();
  render(); // 重新渲染，更新所有用到名字的地方
  showToast("设置已保存");
});

clearCart.addEventListener("click", () => {
  saveCartItems([]);
  render();
  renderOrderDialog();
});

sendToBoyfriend.addEventListener("click", async () => {
  const text = orderMessage.value;

  // 同时复制到剪贴板
  await shareText(text);

  // 发送到微信
  const result = await sendToWechat(text);

  if (result.success) {
    sendTip.textContent = "已发送到微信！";
  } else {
    sendTip.textContent = result.message;
  }

  sendTip.hidden = false;
});

dishImage.addEventListener("change", async () => {
  const file = dishImage.files?.[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件。");
    return;
  }

  try {
    pendingImage = await fileToSmallImage(file);
  } catch {
    pendingImage = await fileToDataUrl(file);
  }

  dialogPreview.src = pendingImage;
  dialogPreview.hidden = false;
  dialogHint.style.display = "none";
});

dishForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!pendingImage) {
    alert("请先选择一张菜品图片。");
    return;
  }

  const customDish = {
    id: crypto.randomUUID(),
    name: document.querySelector("#dishName").value.trim(),
    desc: document.querySelector("#dishDesc").value.trim(),
    category: dishCategory.value,
    sales: 0,
    image: pendingImage,
    custom: true
  };

  if (!saveCustomDishes([customDish, ...readCustomDishes()].slice(0, 40))) {
    return;
  }

  activeCategory = customDish.category;
  dialog.close();
  resetDialog();
  render();
});

renderDialogCategories();
render();
