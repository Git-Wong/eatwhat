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
  menuRevision: string;
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

export const MENU_REVISION = "2026-08-09-menu-reset-v1";

export const actorNames: Record<Actor, string> = {
  wife: "她",
  cook: "我",
};

export const defaultDishes: Dish[] = [
  {
    id:"pork-rib-rice-cake",name:"排骨年糕",desc:"浓油赤酱 · 年糕软糯",emoji:"🍖",tone:"pepper",minutes:50,calories:680,protein:34,tags:["上海风味","下饭"],cost:14,
    ingredients:[{name:"猪小排",qty:"500 g",category:"肉类"},{name:"条状年糕",qty:"300 g",category:"主食"},{name:"姜",qty:"4 片",category:"调味"},{name:"冰糖",qty:"15 g",category:"调味"},{name:"生抽",qty:"2 汤匙",category:"调味"},{name:"老抽",qty:"1 茶匙",category:"调味"}],
    steps:["排骨冷水下锅焯去血沫，捞出擦干；年糕掰开备用","少油炒化冰糖，放排骨和姜片翻炒上色","加生抽、老抽和没过排骨的热水，小火焖 30 分钟","放入年糕再焖 8–10 分钟，不时翻动，收至酱汁浓稠"],
  },
  {
    id:"pepper-shrimp-paste",name:"青椒酿虾滑",desc:"椒香鲜甜 · 外焦里嫩",emoji:"🫑",tone:"garden",minutes:28,calories:330,protein:29,tags:["高蛋白","家常"],cost:13,
    ingredients:[{name:"大青椒",qty:"4 个",category:"蔬菜"},{name:"虾仁",qty:"350 g",category:"海鲜"},{name:"蛋清",qty:"1 个",category:"蛋奶"},{name:"玉米淀粉",qty:"1 汤匙",category:"调味"},{name:"蚝油",qty:"1 汤匙",category:"调味"}],
    steps:["虾仁拍碎剁成泥，加蛋清、淀粉、盐和白胡椒顺一个方向搅上劲","青椒纵向切段去籽，内侧薄薄抹淀粉，填入虾滑压实","虾肉面朝下中火煎至定型，再翻面把青椒煎出虎皮","加蚝油、生抽和少量清水，加盖焖 3 分钟，开盖收汁"],
  },
  {
    id:"chive-stir-fry",name:"韭菜小炒",desc:"韭香脆嫩 · 鸡蛋香干",emoji:"🌿",tone:"garden",minutes:18,calories:360,protein:24,tags:["快手","家常"],cost:8,
    ingredients:[{name:"韭菜",qty:"1 把",category:"蔬菜"},{name:"五香豆干",qty:"4 片",category:"豆制品"},{name:"鸡蛋",qty:"3 个",category:"蛋奶"},{name:"小米椒",qty:"2 个",category:"调味"}],
    steps:["韭菜切段并把梗、叶分开放；豆干切条，鸡蛋打散","热锅宽油把鸡蛋炒成大块，盛出","原锅炒香小米椒和韭菜梗，放豆干大火翻炒 1 分钟","加入韭菜叶和鸡蛋，以盐、生抽调味，炒至刚断生即出锅"],
  },
  {
    id:"stir-fried-taro-shreds",name:"芋头丝",desc:"外焦内粉 · 湘味椒香",emoji:"🍠",tone:"tofu",minutes:25,calories:310,protein:5,tags:["湖南","素食"],cost:6,
    ingredients:[{name:"大芋头",qty:"500 g",category:"蔬菜"},{name:"青辣椒",qty:"2 个",category:"蔬菜"},{name:"红辣椒",qty:"1 个",category:"蔬菜"},{name:"蒜",qty:"3 瓣",category:"调味"}],
    steps:["芋头戴手套去皮切粗丝，快速冲去表面黏液后彻底沥干","锅里多放一点油，铺入芋头丝中火煎至底部微焦","翻炒至八成熟，加入蒜末和青红椒丝","沿锅边淋少量水，加盐焖 2 分钟，开盖炒至粉糯干香"],
  },
  {
    id:"stir-fried-cucumber",name:"炒黄瓜",desc:"清脆爽口 · 蒜香快炒",emoji:"🥒",tone:"garden",minutes:15,calories:150,protein:4,tags:["快手","清淡","素食"],cost:4,
    ingredients:[{name:"黄瓜",qty:"3 根",category:"蔬菜"},{name:"蒜",qty:"4 瓣",category:"调味"},{name:"干辣椒",qty:"2 个",category:"调味"}],
    steps:["黄瓜纵向剖开去瓤，斜切厚片，加少许盐抓匀腌 8 分钟","倒掉水分并擦干黄瓜，蒜切片、干辣椒剪段","热锅下油爆香蒜片和干辣椒，放黄瓜大火快炒","加盐和少许米醋，炒 60–90 秒保持爽脆，立即出锅"],
  },
  {
    id:"hunan-stir-fried-beef",name:"小炒黄牛肉",desc:"香辣嫩滑 · 湖南下饭菜",emoji:"🥩",tone:"pepper",minutes:25,calories:490,protein:40,tags:["湖南","高蛋白","下饭"],cost:17,
    ingredients:[{name:"牛里脊",qty:"350 g",category:"肉类"},{name:"香芹",qty:"1 把",category:"蔬菜"},{name:"小米椒",qty:"6 个",category:"调味"},{name:"泡椒",qty:"3 个",category:"调味"},{name:"姜蒜",qty:"各 1 份",category:"调味"}],
    steps:["牛肉逆纹切薄片，加生抽、蚝油、淀粉和油抓匀腌 10 分钟","香芹切段，小米椒和泡椒切圈，姜蒜切末","锅烧到冒烟，宽油把牛肉快速滑散至七成熟，盛出","原锅爆香姜蒜和双椒，放香芹、牛肉大火翻炒 40 秒，调盐出锅"],
  },
  {
    id:"minced-pork-eggplant",name:"肉末茄子",desc:"酱香软糯 · 米饭搭档",emoji:"🍆",tone:"sunset",minutes:30,calories:430,protein:22,tags:["下饭","家常"],cost:10,
    ingredients:[{name:"中国茄子",qty:"3 根",category:"蔬菜"},{name:"猪肉末",qty:"200 g",category:"肉类"},{name:"蒜",qty:"4 瓣",category:"调味"},{name:"郫县豆瓣酱",qty:"1 汤匙",category:"调味"},{name:"小葱",qty:"2 根",category:"蔬菜"}],
    steps:["茄子切条，拌少量盐静置 10 分钟，挤干水分","少油把茄子煎软盛出；原锅炒散肉末至微焦","加入蒜末和豆瓣酱炒出红油，放茄子翻匀","加生抽、糖和半碗水焖 4 分钟，薄勾芡后撒葱花"],
  },
  {
    id:"hunan-clams",name:"炒花甲",desc:"紫苏椒香 · 湖南夜市风味",emoji:"🦪",tone:"salmon",minutes:25,calories:300,protein:32,tags:["湖南","海鲜","下饭"],cost:13,
    ingredients:[{name:"活蛤蜊",qty:"900 g",category:"海鲜"},{name:"紫苏叶",qty:"1 小把",category:"蔬菜"},{name:"小米椒",qty:"5 个",category:"调味"},{name:"姜蒜",qty:"各 1 份",category:"调味"},{name:"豆豉",qty:"1 汤匙",category:"调味"}],
    steps:["蛤蜊用盐水吐沙后刷洗；冷水中已开口且轻敲不闭合的丢弃","锅烧热爆香姜蒜、豆豉和小米椒，倒入蛤蜊大火翻炒","淋料酒，加盖焖 2–3 分钟至开口，加入紫苏和生抽炒匀","立即盛出并丢弃烹煮后仍未开口的蛤蜊，避免久炒变老"],
  },
  {
    id:"pineapple-pork-ribs",name:"菠萝排骨",desc:"酸甜开胃 · 果香浓郁",emoji:"🍍",tone:"sunset",minutes:45,calories:620,protein:36,tags:["酸甜","下饭"],cost:15,
    ingredients:[{name:"猪小排",qty:"500 g",category:"肉类"},{name:"新鲜菠萝",qty:"半个",category:"水果"},{name:"彩椒",qty:"1 个",category:"蔬菜"},{name:"番茄酱",qty:"3 汤匙",category:"调味"},{name:"米醋",qty:"2 汤匙",category:"调味"}],
    steps:["排骨加盐、生抽和淀粉腌 15 分钟；菠萝和彩椒切块","排骨煎至各面金黄，加少量热水焖 20 分钟至熟","调匀番茄酱、米醋、糖、生抽和半碗水，入锅煮至浓稠","放彩椒翻炒 1 分钟，最后加入菠萝和排骨快速裹汁"],
  },
  {
    id:"pineapple-fried-rice",name:"菠萝饭",desc:"酸甜咸香 · 粒粒分明",emoji:"🍍",tone:"tofu",minutes:25,calories:560,protein:23,tags:["主食","快手"],cost:11,
    ingredients:[{name:"隔夜米饭",qty:"3 碗",category:"主食"},{name:"新鲜菠萝",qty:"半个",category:"水果"},{name:"虾仁",qty:"200 g",category:"海鲜"},{name:"鸡蛋",qty:"2 个",category:"蛋奶"},{name:"豌豆胡萝卜",qty:"1 杯",category:"蔬菜"},{name:"腰果",qty:"1 小把",category:"其他"}],
    steps:["菠萝切丁沥汁；虾仁加盐和白胡椒腌 5 分钟；米饭拨散","热锅炒熟鸡蛋盛出，再把虾仁炒至变色盛出","锅烧热下米饭和豌豆胡萝卜，大火翻炒至米粒松散","鸡蛋、虾仁和菠萝回锅，加盐和生抽快炒，撒腰果出锅"],
  },
  {
    id:"dry-pot-cauliflower",name:"干锅花菜",desc:"焦香脆嫩 · 香辣入味",emoji:"🥦",tone:"pepper",minutes:28,calories:390,protein:17,tags:["下饭","家常"],cost:9,
    ingredients:[{name:"花菜",qty:"1 大颗",category:"蔬菜"},{name:"五花肉",qty:"150 g",category:"肉类"},{name:"蒜苗",qty:"2 根",category:"蔬菜"},{name:"干辣椒",qty:"6 个",category:"调味"},{name:"豆瓣酱",qty:"1 汤匙",category:"调味"}],
    steps:["花菜掰小朵用盐水洗净，彻底沥干；五花肉切薄片","少油把花菜中大火煸至边缘焦黄、七成熟，盛出","原锅煸香五花肉，加入蒜片、干辣椒和豆瓣酱炒香","花菜回锅，加生抽和少许糖翻炒，最后放蒜苗炒断生"],
  },
  {
    id:"lemon-pan-fried-chicken",name:"柠檬干煎鸡",desc:"焦香多汁 · 清新柠檬味",emoji:"🍋",tone:"chicken",minutes:35,calories:520,protein:46,tags:["高蛋白","下饭"],cost:12,
    ingredients:[{name:"去骨鸡腿",qty:"4 块",category:"肉类"},{name:"柠檬",qty:"1 个",category:"水果"},{name:"蒜",qty:"4 瓣",category:"调味"},{name:"蜂蜜",qty:"1 汤匙",category:"调味"},{name:"生抽",qty:"1.5 汤匙",category:"调味"}],
    steps:["鸡腿擦干并在厚处划刀，加盐、黑胡椒和一半柠檬皮屑腌 15 分钟","冷锅少油，鸡皮朝下中小火压煎 8–10 分钟至金黄出油","翻面煎至中心熟透，盛出静置；倒掉多余鸡油","原锅加入蒜末、生抽、蜂蜜和柠檬汁煮成薄汁，鸡腿回锅裹匀"],
  },
  {
    id:"cantonese-black-bean-mussels",name:"粤式豉汁蒸青口",desc:"豆豉蒜香 · 鲜嫩多汁",emoji:"🦪",tone:"salmon",minutes:22,calories:320,protein:38,tags:["广东","海鲜","高蛋白"],cost:14,
    ingredients:[{name:"青口贝",qty:"900 g",category:"海鲜"},{name:"阳江豆豉",qty:"1.5 汤匙",category:"调味"},{name:"蒜",qty:"5 瓣",category:"调味"},{name:"姜",qty:"3 片",category:"调味"},{name:"小葱",qty:"2 根",category:"蔬菜"}],
    steps:["青口刷净去足丝；破壳或轻敲后不闭合的丢弃","豆豉略切碎，与蒜末、姜末、生抽、糖和油拌成豉汁","青口铺盘淋豉汁，水开后大火蒸 5–7 分钟至全部开口","撒葱花，丢弃蒸后仍未开口的青口，趁热食用"],
  },
  {
    id:"cantonese-garlic-scallops",name:"蒜蓉粉丝蒸扇贝",desc:"粤式宴客菜 · 蒜香鲜甜",emoji:"🐚",tone:"tofu",minutes:28,calories:360,protein:30,tags:["广东","海鲜","清淡"],cost:19,
    ingredients:[{name:"半壳扇贝",qty:"8 只",category:"海鲜"},{name:"龙口粉丝",qty:"1 把",category:"主食"},{name:"蒜",qty:"1 头",category:"调味"},{name:"小葱",qty:"2 根",category:"蔬菜"},{name:"蒸鱼豉油",qty:"2 汤匙",category:"调味"}],
    steps:["扇贝刷净取肉去内脏，只留白色贝柱和裙边；粉丝泡软剪短","一半蒜末小火炸至金黄，和生蒜末、盐、糖拌匀","粉丝铺壳上，放回贝肉并盖蒜蓉，水开后大火蒸 5–6 分钟至熟","淋蒸鱼豉油，撒葱花后浇一勺热油激香"],
  },
  {
    id:"sichuan-spicy-oysters",name:"川味香辣生蚝",desc:"麻辣鲜香 · 彻底熟食版",emoji:"🦪",tone:"pepper",minutes:25,calories:300,protein:28,tags:["四川","海鲜","下饭"],cost:18,
    ingredients:[{name:"去壳生蚝肉",qty:"500 g",category:"海鲜"},{name:"青蒜",qty:"2 根",category:"蔬菜"},{name:"郫县豆瓣酱",qty:"1 汤匙",category:"调味"},{name:"花椒",qty:"1 茶匙",category:"调味"},{name:"干辣椒",qty:"6 个",category:"调味"}],
    steps:["生蚝肉用淡盐水轻洗并沥干，沸水快速汆 20 秒捞出","热锅下油，小火炒香花椒、干辣椒、姜蒜和豆瓣酱","加半碗水、生抽和少许糖煮开，放生蚝中火煮至完全熟透","大火收汁，放青蒜段翻匀；避免反复久煮以免肉质缩水"],
  },
  {
    id:"cantonese-blanched-choy-sum",name:"白灼菜心",desc:"粤式经典 · 清甜爽脆",emoji:"🥬",tone:"garden",minutes:15,calories:120,protein:6,tags:["广东","清淡","素食","快手"],cost:6,
    ingredients:[{name:"菜心",qty:"1 大把",category:"蔬菜"},{name:"姜",qty:"1 小块",category:"调味"},{name:"蒸鱼豉油",qty:"1.5 汤匙",category:"调味"}],
    steps:["菜心洗净，粗梗纵向划一刀；姜切细丝","大锅水烧开，加盐和少许油，先放菜梗 20 秒再全部浸入","再灼 40–60 秒至翠绿刚熟，迅速捞出沥水装盘","铺姜丝，淋蒸鱼豉油，再浇少量热油激香"],
  },
  {
    id:"cantonese-oyster-sauce-gai-lan",name:"蚝油芥兰",desc:"梗脆叶嫩 · 广东家常",emoji:"🥦",tone:"garden",minutes:18,calories:160,protein:7,tags:["广东","清淡","快手"],cost:7,
    ingredients:[{name:"芥兰",qty:"1 大把",category:"蔬菜"},{name:"蚝油",qty:"1.5 汤匙",category:"调味"},{name:"蒜",qty:"3 瓣",category:"调味"}],
    steps:["芥兰削去老皮，粗梗纵切，洗净沥干","沸水加盐和油，先下梗后下叶，焯至翠绿后捞出","少油炒香蒜末，加入蚝油、生抽、糖和少量水煮开","把芥兰回锅快速翻匀，或将蚝油汁直接淋在芥兰上"],
  },
  {
    id:"hunan-hand-torn-cabbage",name:"湘味手撕包菜",desc:"锅气十足 · 酸辣脆爽",emoji:"🥬",tone:"sunset",minutes:18,calories:240,protein:7,tags:["湖南","下饭","快手"],cost:5,
    ingredients:[{name:"圆白菜",qty:"1 颗",category:"蔬菜"},{name:"干辣椒",qty:"6 个",category:"调味"},{name:"蒜",qty:"4 瓣",category:"调味"},{name:"陈醋",qty:"1.5 汤匙",category:"调味"}],
    steps:["包菜手撕成大片，粗梗拍裂，洗后彻底沥干","锅烧到冒烟再下油，爆香蒜片和干辣椒","下包菜大火不停翻炒，沿锅边淋生抽和陈醋","加盐和一小撮糖，炒至叶软梗脆、边缘微焦立刻出锅"],
  },
  {
    id:"hunan-black-bean-lettuce",name:"豆豉辣椒炒油麦菜",desc:"湘味豆豉香 · 脆嫩微辣",emoji:"🥬",tone:"garden",minutes:15,calories:170,protein:6,tags:["湖南","素食","快手"],cost:6,
    ingredients:[{name:"油麦菜",qty:"2 棵",category:"蔬菜"},{name:"豆豉",qty:"1 汤匙",category:"调味"},{name:"小米椒",qty:"3 个",category:"调味"},{name:"蒜",qty:"4 瓣",category:"调味"}],
    steps:["油麦菜洗净沥干，切段并将梗叶分开；豆豉略切碎","热锅下油爆香蒜末、豆豉和小米椒","先下菜梗大火炒 30 秒，再放菜叶快速翻炒","加少许生抽和盐，菜叶刚塌软就关火出锅"],
  },
  {
    id:"sichuan-bok-choy",name:"川味炝炒上海青",desc:"花椒干香 · 青脆不出水",emoji:"🥬",tone:"garden",minutes:14,calories:140,protein:5,tags:["四川","素食","快手"],cost:5,
    ingredients:[{name:"上海青",qty:"600 g",category:"蔬菜"},{name:"干辣椒",qty:"5 个",category:"调味"},{name:"花椒",qty:"1 茶匙",category:"调味"},{name:"蒜",qty:"3 瓣",category:"调味"}],
    steps:["上海青掰开洗净后彻底甩干，大棵的纵向切半","锅烧热下油，小火把花椒和干辣椒炝出香味，注意别炒黑","放蒜片和上海青，转最大火快速翻炒","沿锅边淋少许香醋，加盐，炒至菜梗透明、菜叶刚软即出锅"],
  },
  {
    id:"sichuan-sour-spicy-napa",name:"川味酸辣白菜",desc:"酸辣开胃 · 白菜爽脆",emoji:"🥬",tone:"sunset",minutes:18,calories:180,protein:6,tags:["四川","下饭","素食"],cost:5,
    ingredients:[{name:"大白菜",qty:"半颗",category:"蔬菜"},{name:"泡椒",qty:"4 个",category:"调味"},{name:"干辣椒",qty:"4 个",category:"调味"},{name:"花椒",qty:"1 茶匙",category:"调味"},{name:"米醋",qty:"2 汤匙",category:"调味"}],
    steps:["白菜帮斜刀片薄，菜叶撕大片，洗净后彻底沥干","热锅下油，小火爆香花椒、干辣椒、泡椒和蒜片","先下白菜帮大火炒 1 分钟，再放菜叶翻炒","沿锅边烹米醋，加盐和少许糖，炒至断生但仍爽脆"],
  },
];

export const defaultKitchenState: KitchenState = {
  menuRevision: MENU_REVISION,
  ordered: [],
  wishlist: [],
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
  const shouldResetMenu = state.menuRevision !== MENU_REVISION;
  return {
    ...defaultKitchenState,
    ...state,
    menuRevision: MENU_REVISION,
    dishes: shouldResetMenu ? defaultDishes : Array.isArray(state.dishes) ? state.dishes : defaultDishes,
    ordered: shouldResetMenu ? [] : Array.isArray(state.ordered) ? state.ordered : [],
    wishlist: shouldResetMenu ? [] : Array.isArray(state.wishlist) ? state.wishlist : [],
    confirmed: shouldResetMenu ? false : Boolean(state.confirmed),
    checkedShopping: shouldResetMenu ? [] : Array.isArray(state.checkedShopping) ? state.checkedShopping : [],
    completedSteps: shouldResetMenu ? [] : Array.isArray(state.completedSteps) ? state.completedSteps : [],
    dishNotes: shouldResetMenu ? {} : state.dishNotes ?? {},
    shoppingActors: shouldResetMenu ? {} : state.shoppingActors ?? {},
    activity: Array.isArray(state.activity) ? state.activity : [],
  };
}
