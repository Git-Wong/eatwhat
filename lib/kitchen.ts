export type Actor = "wife" | "cook";

export type Ingredient = {
  name: string;
  qty: string;
  category: string;
};

export type Dish = {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  tone: string;
  imageUrl?: string;
  minutes: number;
  calories: number;
  protein: number;
  tags: string[];
  cost: number;
  ingredients: Ingredient[];
  steps: string[];
  createdBy?: Actor;
  updatedBy?: Actor;
  updatedAt?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  amount: string;
  category: string;
  daysLeft: number;
  icon: string;
};

export type DishNote = {
  text: string;
  author: Actor;
  updatedAt: string;
};

export type Activity = {
  id: string;
  actor: Actor;
  action: string;
  at: string;
};

export type KitchenState = {
  ordered: string[];
  wishlist: string[];
  confirmed: boolean;
  checkedShopping: string[];
  completedSteps: string[];
  inventory: InventoryItem[];
  dishes: Dish[];
  dishNotes: Record<string, DishNote>;
  shoppingActors: Record<string, Actor>;
  activity: Activity[];
};

export const actorNames: Record<Actor, string> = {
  wife: "她",
  cook: "我",
};

export const defaultDishes: Dish[] = [
  { id:"tomato-egg",name:"番茄炒蛋",desc:"酸甜下饭 · 家庭常驻",emoji:"🍅",tone:"sunset",minutes:18,calories:320,protein:18,tags:["快手","下饭"],cost:6.4,ingredients:[{name:"番茄",qty:"3 个",category:"蔬菜"},{name:"鸡蛋",qty:"4 个",category:"蛋奶"},{name:"小葱",qty:"2 根",category:"蔬菜"}],steps:["番茄切滚刀块，小葱切末，鸡蛋加一小撮盐打散","热锅下油，鸡蛋炒至八成熟后盛出","原锅炒番茄，加盐和少许糖，炒出汁","鸡蛋回锅翻匀 30 秒，撒葱花出锅"] },
  { id:"beef",name:"黑椒牛肉",desc:"嫩滑多汁 · 彩椒爽脆",emoji:"🥩",tone:"pepper",minutes:28,calories:460,protein:35,tags:["高蛋白","人气"],cost:14.8,ingredients:[{name:"牛里脊",qty:"300 g",category:"肉类"},{name:"彩椒",qty:"2 个",category:"蔬菜"},{name:"洋葱",qty:"半个",category:"蔬菜"}],steps:["牛肉逆纹切片，加生抽、淀粉和油抓匀腌 10 分钟","彩椒与洋葱切块，调好黑椒汁","大火滑炒牛肉至变色，立即盛出","炒香洋葱和彩椒，牛肉回锅淋汁翻匀"] },
  { id:"salmon",name:"香煎三文鱼",desc:"柠檬黄油 · 外脆里嫩",emoji:"🐟",tone:"salmon",minutes:25,calories:510,protein:39,tags:["高蛋白","清淡"],cost:16.5,ingredients:[{name:"三文鱼",qty:"2 块",category:"海鲜"},{name:"柠檬",qty:"1 个",category:"水果"},{name:"芦笋",qty:"1 把",category:"蔬菜"}],steps:["三文鱼擦干，撒盐和黑胡椒静置 8 分钟","锅烧热后皮面朝下，中火煎 4 分钟","翻面煎 2–3 分钟，加入黄油和蒜瓣淋油","静置 2 分钟，挤柠檬汁，与芦笋装盘"] },
  { id:"tofu",name:"家常豆腐煲",desc:"暖呼呼 · 一锅就够",emoji:"🥘",tone:"tofu",minutes:32,calories:390,protein:22,tags:["暖胃","素食"],cost:8.2,ingredients:[{name:"嫩豆腐",qty:"1 盒",category:"豆制品"},{name:"香菇",qty:"6 朵",category:"蔬菜"},{name:"青菜",qty:"1 把",category:"蔬菜"}],steps:["豆腐切块，香菇切片，青菜洗净","豆腐两面煎至微黄后盛出","炒香蒜末和香菇，加高汤与豆腐焖 8 分钟","放青菜，水淀粉薄勾芡后关火"] },
  { id:"chicken",name:"葱油鸡腿",desc:"葱香浓郁 · 鲜嫩多汁",emoji:"🍗",tone:"chicken",minutes:35,calories:540,protein:42,tags:["高蛋白","下饭"],cost:10.6,ingredients:[{name:"去骨鸡腿",qty:"3 块",category:"肉类"},{name:"小葱",qty:"1 把",category:"蔬菜"},{name:"姜",qty:"1 块",category:"调味"}],steps:["鸡腿擦干，加盐腌 10 分钟","鸡皮朝下小火煎出油脂，翻面煎熟","鸡腿静置后切块装盘","葱姜末淋热油，加生抽调匀后浇在鸡肉上"] },
  { id:"shrimp",name:"蒜香西兰花虾仁",desc:"清爽鲜甜 · 工作日晚餐",emoji:"🍤",tone:"garden",minutes:20,calories:350,protein:31,tags:["清淡","快手"],cost:12.3,ingredients:[{name:"虾仁",qty:"300 g",category:"海鲜"},{name:"西兰花",qty:"1 颗",category:"蔬菜"},{name:"蒜",qty:"4 瓣",category:"调味"}],steps:["虾仁擦干，加盐和黑胡椒腌 5 分钟","西兰花焯水 60 秒，捞出沥干","热锅炒香蒜末，虾仁炒至变色","加入西兰花和少许蚝油，大火翻匀出锅"] },
];

export const defaultKitchenState: KitchenState = {
  ordered: [],
  wishlist: ["salmon"],
  confirmed: false,
  checkedShopping: [],
  completedSteps: [],
  inventory: [
    { id:"rice",name:"大米",amount:"1.8 kg",category:"主食",daysLeft:90,icon:"🍚" },
    { id:"eggs",name:"鸡蛋",amount:"8 个",category:"蛋奶",daysLeft:12,icon:"🥚" },
    { id:"spinach",name:"菠菜",amount:"1 把",category:"蔬菜",daysLeft:2,icon:"🥬" },
    { id:"garlic",name:"蒜",amount:"2 头",category:"调味",daysLeft:24,icon:"🧄" },
  ],
  dishes: defaultDishes,
  dishNotes: {},
  shoppingActors: {},
  activity: [],
};

export function normalizeKitchenState(value: unknown): KitchenState {
  if (!value || typeof value !== "object") return defaultKitchenState;
  const state = value as Partial<KitchenState>;
  return {
    ...defaultKitchenState,
    ...state,
    dishes: Array.isArray(state.dishes) && state.dishes.length ? state.dishes : defaultDishes,
    dishNotes: state.dishNotes ?? {},
    shoppingActors: state.shoppingActors ?? {},
    activity: Array.isArray(state.activity) ? state.activity : [],
  };
}
