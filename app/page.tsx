"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  actorNames,
  defaultKitchenState,
  normalizeKitchenState,
  type Actor,
  type Dish,
  type InventoryItem,
  type KitchenState,
} from "@/lib/kitchen";

type Tab = "menu" | "wishlist" | "shopping" | "cook" | "inventory" | "stats";
type ModalState = { kind: "detail" | "edit" | "create"; dishId?: string } | null;

const nav: [Tab, string, string][] = [["menu","⌂","今日菜单"],["wishlist","♡","想吃清单"],["shopping","🧺","买菜清单"],["cook","♨","做饭 SOP"],["inventory","◫","厨房库存"],["stats","⌁","本月数据"]];
const filters = ["全部","30分钟内","高蛋白","清淡","下饭"];

function nowActivity(actor: Actor, action: string) {
  return { id: crypto.randomUUID(), actor, action, at: new Date().toISOString() };
}

function randomSelection(items: Dish[], count: number, previous: string[]) {
  if (!items.length) return [];
  const limit = Math.min(count, items.length);
  let selected = items.slice(0, limit);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    selected = shuffled.slice(0, limit);
    if (selected.map(item => item.id).join() !== previous.join()) break;
  }
  return selected.map(item => item.id);
}

export default function Home() {
  const [tab,setTab] = useState<Tab>("menu");
  const [filter,setFilter] = useState("全部");
  const [role,setRole] = useState<Actor>("wife");
  const [state,setState] = useState<KitchenState>(defaultKitchenState);
  const [batchIds,setBatchIds] = useState<string[]>([]);
  const [modal,setModal] = useState<ModalState>(null);
  const [ready,setReady] = useState(false);
  const [saved,setSaved] = useState(true);
  const [storageReady,setStorageReady] = useState(true);
  const [toast,setToast] = useState("");
  const suppressNextSave = useRef(false);
  const savedRef = useRef(true);
  const serverUpdatedAt = useRef("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/state", { signal: controller.signal }).then(async response => {
      const data = await response.json();
      suppressNextSave.current = true;
      if (data.state) setState(normalizeKitchenState(data.state));
      serverUpdatedAt.current = data.updatedAt ?? "";
      setStorageReady(!data.warning);
      setReady(true);
    }).catch(error => {
      if (error.name !== "AbortError") {
        setStorageReady(false);
        setReady(true);
      }
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (suppressNextSave.current) {
      suppressNextSave.current = false;
      return;
    }
    setSaved(false);
    savedRef.current = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state),
        signal: controller.signal,
      }).then(async response => {
        if (!response.ok) throw new Error("save failed");
        const data = await response.json();
        serverUpdatedAt.current = data.updatedAt ?? serverUpdatedAt.current;
        setStorageReady(true);
        setSaved(true);
        savedRef.current = true;
      }).catch(error => {
        if (error.name !== "AbortError") {
          setStorageReady(false);
          setSaved(false);
          savedRef.current = false;
        }
      });
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [state, ready]);

  useEffect(() => {
    if (!ready || !storageReady) return;
    const pull = () => {
      if (!savedRef.current || document.visibilityState === "hidden") return;
      fetch("/api/state").then(response => response.json()).then(data => {
        if (!data.updatedAt || data.updatedAt <= serverUpdatedAt.current) return;
        suppressNextSave.current = true;
        serverUpdatedAt.current = data.updatedAt;
        setState(normalizeKitchenState(data.state));
        setToast("已同步对方的最新修改");
      }).catch(() => undefined);
    };
    const timer = window.setInterval(pull, 5000);
    window.addEventListener("focus", pull);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", pull);
    };
  }, [ready, storageReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const commit = useCallback((change: (current: KitchenState) => KitchenState, action?: string) => {
    setState(current => {
      const next = change(current);
      return action ? { ...next, activity: [nowActivity(role, action), ...next.activity].slice(0, 30) } : next;
    });
  }, [role]);

  const dishMap = useMemo(() => new Map(state.dishes.map(dish => [dish.id, dish])), [state.dishes]);
  const chosen = state.ordered.flatMap(id => dishMap.get(id) ?? []);
  const wanted = state.wishlist.flatMap(id => dishMap.get(id) ?? []);
  const eligible = state.dishes.filter(dish => filter === "全部" ? true : filter === "30分钟内" ? dish.minutes > 0 && dish.minutes <= 30 : dish.tags.includes(filter));
  const visible = batchIds.length ? batchIds.flatMap(id => dishMap.get(id) ?? []).filter(dish => eligible.some(item => item.id === dish.id)) : eligible;
  const shopping = useMemo(() => {
    const inventoryNames = new Set(state.inventory.map(item => item.name));
    const map = new Map<string,{name:string;qty:string;category:string;forDish:string[]}>();
    chosen.forEach(dish => dish.ingredients.forEach(item => {
      if (inventoryNames.has(item.name)) return;
      const current = map.get(item.name);
      if (current) current.forDish.push(dish.name);
      else map.set(item.name,{...item,forDish:[dish.name]});
    }));
    return [...map.values()];
  }, [chosen, state.inventory]);

  const toggleList = (key: "ordered" | "wishlist" | "checkedShopping" | "completedSteps", id: string, label?: string) => {
    commit(current => ({ ...current, [key]: current[key].includes(id) ? current[key].filter(item => item !== id) : [...current[key], id] }), label);
  };
  const toggleShopping = (name: string) => commit(current => {
    const checked = current.checkedShopping.includes(name);
    return {
      ...current,
      checkedShopping: checked ? current.checkedShopping.filter(item => item !== name) : [...current.checkedShopping, name],
      shoppingActors: checked ? Object.fromEntries(Object.entries(current.shoppingActors).filter(([key]) => key !== name)) : { ...current.shoppingActors, [name]: role },
    };
  }, `${state.checkedShopping.includes(name) ? "取消勾选" : "买到了"}「${name}」`);
  const confirmOrder = () => {
    commit(current => ({ ...current, confirmed:true, checkedShopping:[], completedSteps:[], shoppingActors:{} }), "确认了今晚菜单");
    setRole("cook");
    setTab("shopping");
  };
  const saveDish = (dish: Dish, isNew: boolean) => {
    commit(current => ({ ...current, dishes: isNew ? [dish, ...current.dishes] : current.dishes.map(item => item.id === dish.id ? dish : item) }), `${isNew ? "新增" : "更新"}了菜谱「${dish.name}」`);
    setModal({ kind:"detail", dishId:dish.id });
    setBatchIds([]);
    setToast(isNew ? "新菜谱已加入菜单" : "菜谱已更新");
  };
  const deleteDish = (dish: Dish) => {
    if (!window.confirm(`确定删除「${dish.name}」吗？`)) return;
    commit(current => ({
      ...current,
      dishes: current.dishes.filter(item => item.id !== dish.id),
      ordered: current.ordered.filter(id => id !== dish.id),
      wishlist: current.wishlist.filter(id => id !== dish.id),
      dishNotes: Object.fromEntries(Object.entries(current.dishNotes).filter(([id]) => id !== dish.id)),
    }), `删除了菜谱「${dish.name}」`);
    setBatchIds([]);
    setModal(null);
  };
  const saveNote = (dish: Dish, text: string) => commit(current => ({
    ...current,
    dishNotes: text.trim() ? { ...current.dishNotes, [dish.id]: { text:text.trim(), author:role, updatedAt:new Date().toISOString() } } : Object.fromEntries(Object.entries(current.dishNotes).filter(([id]) => id !== dish.id)),
  }), text.trim() ? `给「${dish.name}」留言：${text.trim()}` : `清除了「${dish.name}」的留言`);

  const activeDish = modal?.dishId ? dishMap.get(modal.dishId) : undefined;
  const title = {menu:"晚上想吃什么？",wishlist:"最近想吃这些",shopping:"今晚要买什么？",cook:"开火，按顺序来",inventory:"家里还有什么？",stats:"这个月吃得怎么样？"}[tab];

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand plain" onClick={() => setTab("menu")}><span className="brand-mark">灶</span><span><b>今晚吃什么</b><small>我们的家庭厨房</small></span></button>
      <div className="top-actions"><span className={saved&&storageReady?"save-state":"save-state saving"}>{!ready?"○ 连接中":!storageReady?"○ 仅本机预览":saved?"● 已同步":"○ 保存中"}</span><button className="role-pill" onClick={() => setRole(role==="wife"?"cook":"wife")}>{role==="wife"?"♡ 她在操作":"♨ 我在操作"} · 切换</button><button className="avatar" onClick={() => setRole(role==="wife"?"cook":"wife")} aria-label="切换操作人">{actorNames[role]}</button></div>
    </header>
    <div className="page-grid">
      <aside className="sidebar"><nav>{nav.map(([id,icon,label]) => <button key={id} className={tab===id?"nav-item active":"nav-item"} onClick={() => setTab(id)}><span>{icon}</span>{label}{id==="wishlist"&&<em>{state.wishlist.length}</em>}{id==="shopping"&&<em>{shopping.length}</em>}</button>)}<div className="nav-divider"/></nav><CollaborationPanel activity={state.activity}/></aside>
      <section className="content">
        <div className="welcome-row"><div><p className="eyebrow">OUR HOME · TODAY</p><h1>{title}</h1><p className="lede">{tab==="menu"?"今天你只管点，剩下的交给我。":tab==="cook"?"备菜、开火、出锅，一个步骤都不乱。":"点菜、库存和预算，全部自动串起来。"}</p></div>{tab==="menu"&&<div className="weather-card"><span>☀</span><div><b>24°C</b><small>适合吃点清爽的</small></div></div>}</div>

        {tab==="menu"&&<Menu dishes={visible} allDishes={dishMap} filter={filter} setFilter={value=>{setFilter(value);setBatchIds([])}} state={state} onOpen={dish => setModal({kind:"detail",dishId:dish.id})} onCreate={() => setModal({kind:"create"})} onShuffle={() => setBatchIds(previous => randomSelection(eligible,3,previous))} toggleOrder={dish => toggleList("ordered",dish.id,`${state.ordered.includes(dish.id)?"取消":"点了"}「${dish.name}」`)} toggleWish={dish => toggleList("wishlist",dish.id,`${state.wishlist.includes(dish.id)?"取消收藏":"收藏了"}「${dish.name}」`)} confirmOrder={confirmOrder}/>}
        {tab==="wishlist"&&<Wishlist dishes={wanted} onOpen={dish => setModal({kind:"detail",dishId:dish.id})} moveToOrder={dish => commit(current => ({...current,ordered:current.ordered.includes(dish.id)?current.ordered:[...current.ordered,dish.id]}),`把「${dish.name}」加入今晚菜单`)} remove={dish => toggleList("wishlist",dish.id,`取消收藏「${dish.name}」`)}/>}
        {tab==="shopping"&&<Shopping items={shopping} checked={state.checkedShopping} actors={state.shoppingActors} toggle={toggleShopping} onCook={() => setTab("cook")} confirmed={state.confirmed}/>}
        {tab==="cook"&&<Cook chosen={chosen} completed={state.completedSteps} toggle={id => toggleList("completedSteps",id)}/>}
        {tab==="inventory"&&<Inventory items={state.inventory} remove={id => commit(current => ({...current,inventory:current.inventory.filter(item=>item.id!==id)}),"更新了厨房库存")} add={item => commit(current => ({...current,inventory:[...current.inventory,item]}),`加入库存「${item.name}」`)}/>}
        {tab==="stats"&&<Stats chosen={chosen}/>}
      </section>
    </div>
    <nav className="mobile-nav">{nav.slice(0,5).map(([id,icon,label]) => <button key={id} className={tab===id?"active":""} onClick={() => setTab(id)}><span>{icon}</span>{label.replace("今日","").replace("清单","")}</button>)}</nav>
    {toast&&<div className="toast" role="status">✓ {toast}</div>}
    {modal?.kind==="create"&&<RecipeEditor role={role} onClose={() => setModal(null)} onSave={dish => saveDish(dish,true)}/>}
    {modal?.kind==="detail"&&activeDish&&<RecipeDetail dish={activeDish} note={state.dishNotes[activeDish.id]} onClose={() => setModal(null)} onEdit={() => setModal({kind:"edit",dishId:activeDish.id})} onDelete={() => deleteDish(activeDish)} onSaveNote={text => saveNote(activeDish,text)} ordered={state.ordered.includes(activeDish.id)} onOrder={() => toggleList("ordered",activeDish.id,`${state.ordered.includes(activeDish.id)?"取消":"点了"}「${activeDish.name}」`)}/>}
    {modal?.kind==="edit"&&activeDish&&<RecipeEditor role={role} dish={activeDish} onClose={() => setModal({kind:"detail",dishId:activeDish.id})} onSave={dish => saveDish(dish,false)}/>}
  </main>;
}

function CollaborationPanel({activity}:{activity:KitchenState["activity"]}) {
  const latest = activity[0];
  return <div className="collab-panel"><div className="collab-avatars"><span>她</span><span>我</span><i>●</i></div><b>两个人的厨房</b>{latest?<p><strong>{actorNames[latest.actor]}</strong>{latest.action}<small>{formatRelative(latest.at)}</small></p>:<p>点菜、留言和买菜进度会同步显示。</p>}</div>;
}

function Menu({dishes,allDishes,filter,setFilter,state,onOpen,onCreate,onShuffle,toggleOrder,toggleWish,confirmOrder}:{dishes:Dish[];allDishes:Map<string,Dish>;filter:string;setFilter:(value:string)=>void;state:KitchenState;onOpen:(dish:Dish)=>void;onCreate:()=>void;onShuffle:()=>void;toggleOrder:(dish:Dish)=>void;toggleWish:(dish:Dish)=>void;confirmOrder:()=>void}) {
  return <><div className="filter-row">{filters.map(item=><button key={item} className={filter===item?"filter active":"filter"} onClick={()=>setFilter(item)}>{item}</button>)}</div>{state.ordered.length>0&&<div className="order-banner"><div><span>✓</span><p><b>今晚已选 {state.ordered.length} 道菜</b><small>{state.ordered.map(id=>allDishes.get(id)?.name??id).join("、")}</small></p></div><button onClick={()=>document.getElementById("summary")?.scrollIntoView({behavior:"smooth"})}>去确认</button></div>}<div className="section-heading"><div><h2>今日推荐</h2><p>共 {state.dishes.length} 道家庭菜谱</p></div><div className="heading-actions"><button className="text-button" onClick={onShuffle}>↻ 随机换一批</button><button className="add-recipe-button" onClick={onCreate}>＋ 新菜谱</button></div></div>{dishes.length?<div className="dish-grid">{dishes.map(dish=><DishCard key={dish.id} dish={dish} ordered={state.ordered.includes(dish.id)} wished={state.wishlist.includes(dish.id)} onOpen={()=>onOpen(dish)} onOrder={()=>toggleOrder(dish)} onWish={()=>toggleWish(dish)}/>)}</div>:<Empty icon="🍽" title="这个分类还没有菜" text="添加一道新菜谱，或者切换其他筛选条件。"/>}<section className="summary-card" id="summary"><div><p className="eyebrow">TONIGHT&apos;S ORDER</p><h2>{state.ordered.length?"今晚菜单已选好":"还没有点菜"}</h2><p>{state.ordered.length?"确认后自动合并食材，生成买菜清单与做饭顺序。":"从上面选一道想吃的菜吧。"}</p></div><div className="summary-dishes">{state.ordered.map(id=><span key={id}>{allDishes.get(id)?.emoji}</span>)}</div><button disabled={!state.ordered.length} onClick={confirmOrder}>{state.ordered.length?"确认今晚菜单 →":"等你点菜"}</button></section></>;
}

function DishVisual({dish,className="dish-visual"}:{dish:Dish;className?:string}) {
  return <div className={`${className} ${dish.tone}`}>{dish.imageUrl?<Image src={dish.imageUrl} alt={dish.name} fill sizes="(max-width: 720px) 50vw, 340px" className="dish-photo"/>:<><span className="food-emoji">{dish.emoji}</span><div className="plate"/></>}</div>;
}

function DishCard({dish,ordered,wished,onOrder,onWish,onOpen}:{dish:Dish;ordered:boolean;wished:boolean;onOrder:()=>void;onWish:()=>void;onOpen:()=>void}) {
  return <article className="dish-card"><div className="dish-visual-wrap"><button className="visual-button" onClick={onOpen} aria-label={`查看${dish.name}详情`}><DishVisual dish={dish}/></button><button className={wished?"heart active":"heart"} aria-label={wished?`移除${dish.name}`:`收藏${dish.name}`} onClick={onWish}>{wished?"♥":"♡"}</button><span className="time">◷ {dish.minutes>0?`${dish.minutes} 分钟`:"时间待补充"}</span></div><div className="dish-body"><button className="dish-title-button" onClick={onOpen}><div className="dish-title-row"><div><h3>{dish.name}</h3><p>{dish.desc}</p></div><span className="rating">详情 ›</span></div></button><div className="nutrition"><span>{dish.calories>0?`${dish.calories} kcal`:"营养待补充"}</span>{dish.protein>0&&<><i/><span>蛋白质 {dish.protein}g</span></>}</div><div className="tags">{dish.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className={ordered?"order-button ordered":"order-button"} onClick={onOrder}>{ordered?"✓ 已点这道":"+ 今晚吃这个"}</button></div></article>;
}

function RecipeDetail({dish,note,onClose,onEdit,onDelete,onSaveNote,ordered,onOrder}:{dish:Dish;note:KitchenState["dishNotes"][string];onClose:()=>void;onEdit:()=>void;onDelete:()=>void;onSaveNote:(text:string)=>void;ordered:boolean;onOrder:()=>void}) {
  const [noteText,setNoteText] = useState(note?.text ?? "");
  return <div className="modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="recipe-modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><DishVisual dish={dish} className="detail-hero"/><div className="detail-content"><p className="eyebrow">FAMILY RECIPE</p><div className="detail-title"><div><h2 id="recipe-title">{dish.name}</h2><p>{dish.desc}</p></div><button className="ghost" onClick={onEdit}>编辑菜谱</button></div><div className="detail-metrics"><span><b>{dish.minutes>0?dish.minutes:"—"}</b> 分钟</span><span><b>{dish.calories>0?dish.calories:"—"}</b> kcal</span><span><b>{dish.protein>0?`${dish.protein}g`:"—"}</b> 蛋白质</span><span><b>{dish.cost>0?`$${dish.cost}`:"—"}</b> 预计成本</span></div><div className="detail-columns"><div><h3>准备食材</h3>{dish.ingredients.length?dish.ingredients.map((item,index)=><div className="ingredient-row" key={`${item.name}-${index}`}><span>{item.name}<small>{item.category}</small></span><b>{item.qty}</b></div>):<p className="optional-empty">暂未填写食材</p>}</div><div><h3>做法步骤</h3>{dish.steps.length?dish.steps.map((step,index)=><div className="detail-step" key={`${step}-${index}`}><span>{index+1}</span><p>{step}</p></div>):<p className="optional-empty">暂未填写做法步骤</p>}</div></div><div className="dish-note"><div><h3>给对方留言</h3>{note&&<small>{actorNames[note.author]} · {formatRelative(note.updatedAt)}</small>}</div><textarea value={noteText} onChange={event=>setNoteText(event.target.value)} placeholder="例如：少辣、不要香菜，或者今晚想多做一点…"/><button className="ghost" onClick={()=>onSaveNote(noteText)}>保存留言</button></div><div className="modal-actions"><button className="danger-text" onClick={onDelete}>删除菜谱</button><button className={ordered?"primary ordered":"primary"} onClick={onOrder}>{ordered?"✓ 已加入今晚菜单":"＋ 今晚吃这个"}</button></div></div></section></div>;
}

function RecipeEditor({role,dish,onClose,onSave}:{role:Actor;dish?:Dish;onClose:()=>void;onSave:(dish:Dish)=>void}) {
  const [name,setName] = useState(dish?.name ?? "");
  const [desc,setDesc] = useState(dish?.desc ?? "");
  const [emoji,setEmoji] = useState(dish?.emoji ?? "🍳");
  const [imageUrl,setImageUrl] = useState(dish?.imageUrl ?? "");
  const [minutes,setMinutes] = useState(dish?.minutes ? String(dish.minutes) : "");
  const [calories,setCalories] = useState(dish?.calories ? String(dish.calories) : "");
  const [protein,setProtein] = useState(dish?.protein ? String(dish.protein) : "");
  const [cost,setCost] = useState(dish?.cost ? String(dish.cost) : "");
  const [tags,setTags] = useState(dish?.tags.join("、") ?? "");
  const [ingredients,setIngredients] = useState(dish?.ingredients.map(item=>`${item.name} | ${item.qty} | ${item.category}`).join("\n") ?? "");
  const [steps,setSteps] = useState(dish?.steps.join("\n") ?? "");
  const [uploading,setUploading] = useState(false);
  const [error,setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file",file);
    try {
      const response = await fetch("/api/images",{method:"POST",body:formData});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "图片上传失败");
      setImageUrl(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "图片上传失败");
    } finally {
      setUploading(false);
    }
  };
  const submit = () => {
    const parsedIngredients = ingredients.split("\n").map(line=>line.split("|").map(part=>part.trim())).filter(parts=>parts[0]).map(parts=>({name:parts[0],qty:parts[1]||"适量",category:parts[2]||"其他"}));
    const parsedSteps = steps.split("\n").map(line=>line.trim()).filter(Boolean);
    if (!name.trim()) {
      setError("请填写菜名。");
      return;
    }
    const stamp = new Date().toISOString();
    onSave({
      id: dish?.id ?? `dish-${crypto.randomUUID()}`,
      name:name.trim(), desc:desc.trim()||"我们的家庭菜谱", emoji:emoji.trim()||"🍳", imageUrl:imageUrl||undefined,
      tone:dish?.tone ?? ["sunset","pepper","salmon","tofu","chicken","garden"][Math.floor(Math.random()*6)],
      minutes:Number(minutes)||0, calories:Number(calories)||0, protein:Number(protein)||0, cost:Number(cost)||0,
      tags:tags.split(/[、,，]/).map(item=>item.trim()).filter(Boolean).slice(0,4), ingredients:parsedIngredients, steps:parsedSteps,
      createdBy:dish?.createdBy ?? role, updatedBy:role, updatedAt:stamp,
    });
  };

  return <div className="modal-backdrop" role="presentation"><section className="recipe-modal editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><div className="editor-heading"><p className="eyebrow">RECIPE BOOK</p><h2 id="editor-title">{dish?"编辑菜谱":"添加新菜谱"}</h2><p>只需要填写菜名，其余内容都可以稍后再补。</p></div><div className="editor-grid"><label className="image-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event=>upload(event.target.files?.[0])}/>{imageUrl?<Image src={imageUrl} alt="菜谱图片预览" fill sizes="280px" className="dish-photo"/>:<span>{uploading?"上传中…":"＋ 上传成品图片\nJPG / PNG / WebP · 最大 5MB"}</span>}<i>{uploading?"请稍候":"点击更换图片"}</i></label><div className="form-fields"><label>菜名 <em className="required-mark">必填</em><input required aria-required="true" value={name} onChange={event=>setName(event.target.value)} placeholder="例如：可乐鸡翅"/></label><div className="form-row"><label>Emoji <span className="optional-label">选填</span><input value={emoji} onChange={event=>setEmoji(event.target.value)} maxLength={4}/></label><label>一句话介绍 <span className="optional-label">选填</span><input value={desc} onChange={event=>setDesc(event.target.value)} placeholder="甜咸入味 · 新手友好"/></label></div><div className="form-row four"><label>时间 <span className="optional-label">选填</span><input type="number" min="1" value={minutes} onChange={event=>setMinutes(event.target.value)}/><small>分钟</small></label><label>热量 <span className="optional-label">选填</span><input type="number" min="0" value={calories} onChange={event=>setCalories(event.target.value)}/><small>kcal</small></label><label>蛋白质 <span className="optional-label">选填</span><input type="number" min="0" value={protein} onChange={event=>setProtein(event.target.value)}/><small>g</small></label><label>成本 <span className="optional-label">选填</span><input type="number" min="0" step="0.1" value={cost} onChange={event=>setCost(event.target.value)}/><small>$</small></label></div><label>标签 <span className="optional-label">选填</span><input value={tags} onChange={event=>setTags(event.target.value)} placeholder="快手、高蛋白、下饭"/></label></div></div><div className="editor-textareas"><label>食材清单 <small>选填 · 每行：食材 | 数量 | 分类</small><textarea value={ingredients} onChange={event=>setIngredients(event.target.value)} placeholder={"鸡翅 | 8 个 | 肉类\n可乐 | 1 罐 | 调味"}/></label><label>做法步骤 <small>选填 · 每行一个步骤</small><textarea value={steps} onChange={event=>setSteps(event.target.value)} placeholder={"鸡翅洗净并划两刀\n煎至两面金黄\n加入可乐焖煮收汁"}/></label></div>{error&&<p className="form-error">{error}</p>}<div className="editor-actions"><button className="ghost" onClick={onClose}>取消</button><button className="primary" disabled={uploading} onClick={submit}>{dish?"保存修改":"加入家庭菜谱"}</button></div></section></div>;
}

function Empty({icon,title,text}:{icon:string;title:string;text:string}) { return <div className="empty"><span>{icon}</span><h2>{title}</h2><p>{text}</p></div>; }

function Wishlist({dishes,moveToOrder,remove,onOpen}:{dishes:Dish[];moveToOrder:(dish:Dish)=>void;remove:(dish:Dish)=>void;onOpen:(dish:Dish)=>void}) { return dishes.length?<div className="list-stack top-space">{dishes.map(dish=><article className="wish-row" key={dish.id}><button className="mini-visual-button" onClick={()=>onOpen(dish)}><DishVisual dish={dish} className="mini-visual"/></button><button className="wish-copy" onClick={()=>onOpen(dish)}><h3>{dish.name}</h3><p>{dish.desc}{dish.minutes>0?` · ${dish.minutes} 分钟`:""}</p></button><div className="row-actions"><button className="ghost" onClick={()=>remove(dish)}>移除</button><button className="primary" onClick={()=>moveToOrder(dish)}>今晚吃</button></div></article>)}</div>:<Empty icon="♡" title="想吃清单还是空的" text="看到喜欢的菜，点一下爱心就会留在这里。"/>; }

function Shopping({items,checked,actors,toggle,onCook,confirmed}:{items:{name:string;qty:string;category:string;forDish:string[]}[];checked:string[];actors:Record<string,Actor>;toggle:(id:string)=>void;onCook:()=>void;confirmed:boolean}) { if(!confirmed)return <Empty icon="🧺" title="先确认今晚菜单" text="确认后，会自动扣除家中库存并合并需要购买的食材。"/>;const done=items.filter(item=>checked.includes(item.name)).length;return <><div className="progress-card top-space"><div><b>{done}/{items.length} 已买</b><span>两个人的进度每 5 秒自动同步</span></div><div className="progress"><i style={{width:`${items.length?done/items.length*100:100}%`}}/></div></div><div className="shopping-grid">{["肉类","海鲜","蔬菜","水果","蛋奶","豆制品","调味","其他"].map(category=>{const group=items.filter(item=>item.category===category);return group.length?<section className="shopping-group" key={category}><h3>{category}</h3>{group.map(item=><label className={checked.includes(item.name)?"check-row checked":"check-row"} key={item.name}><input type="checkbox" checked={checked.includes(item.name)} onChange={()=>toggle(item.name)}/><span className="fake-check">✓</span><span><b>{item.name}</b><small>{checked.includes(item.name)&&actors[item.name]?`${actorNames[actors[item.name]]}买到了 · `:""}{item.forDish.join("、")}</small></span><em>{item.qty}</em></label>)}</section>:null})}</div><button className="wide-action" onClick={onCook}>东西齐了，开始做饭 →</button></>; }

function Cook({chosen,completed,toggle}:{chosen:Dish[];completed:string[];toggle:(id:string)=>void}) { if(!chosen.length)return <Empty icon="♨" title="今晚还没选菜" text="先去菜单点菜，SOP 会按火候和时间自动排好。"/>;const total=chosen.reduce((sum,dish)=>sum+dish.steps.length,0);const timed=chosen.map(dish=>dish.minutes).filter(minutes=>minutes>0);return <><div className="cook-overview top-space"><div><span>⏱</span><p><b>{timed.length?`预计 ${Math.max(...timed)+8} 分钟`:"时间待补充"}</b><small>{chosen.length} 道菜 · 先备菜，再集中开火</small></p></div><strong>{completed.length}/{total}</strong></div><div className="timeline">{chosen.map((dish,dishIndex)=><section className="cook-dish" key={dish.id}><div className={`cook-icon ${dish.tone}`}>{dish.emoji}</div><div className="cook-content"><h2>{dish.name}{dish.minutes>0&&<span>{dish.minutes} 分钟</span>}</h2>{dish.steps.length?dish.steps.map((step,index)=>{const number=chosen.slice(0,dishIndex).reduce((sum,item)=>sum+item.steps.length,0)+index+1;const id=`${dish.id}-${index}`;return <label className={completed.includes(id)?"step done":"step"} key={id}><input type="checkbox" checked={completed.includes(id)} onChange={()=>toggle(id)}/><span>{number}</span><p>{step}</p></label>}):<p className="optional-empty">这道菜还没有填写做法步骤。</p>}</div></section>)}</div>{total>0&&completed.length===total&&<div className="celebrate">🎉 <b>全部完成，开饭啦！</b></div>}</>; }

function Inventory({items,remove,add}:{items:InventoryItem[];remove:(id:string)=>void;add:(item:InventoryItem)=>void}) { const [adding,setAdding]=useState(false);const [name,setName]=useState("");const [amount,setAmount]=useState("");const submit=()=>{if(!name.trim())return;add({id:`custom-${Date.now()}`,name:name.trim(),amount:amount.trim()||"1 份",category:"其他",daysLeft:7,icon:"🥕"});setName("");setAmount("");setAdding(false)};return <><div className="inventory-summary top-space"><span><b>{items.length}</b> 种食材</span><span><b>{items.filter(item=>item.daysLeft<=3).length}</b> 项快到期</span><button onClick={()=>setAdding(!adding)}>{adding?"收起":"＋ 添加食材"}</button></div>{adding&&<div className="add-inventory"><input aria-label="食材名称" placeholder="食材名称，例如：胡萝卜" value={name} onChange={event=>setName(event.target.value)}/><input aria-label="食材数量" placeholder="数量，例如：3 根" value={amount} onChange={event=>setAmount(event.target.value)}/><button onClick={submit} disabled={!name.trim()}>加入库存</button></div>}<div className="inventory-grid">{items.map(item=><article className="inventory-card" key={item.id}><span>{item.icon}</span><div><h3>{item.name}</h3><p>{item.amount} · {item.category}</p><small className={item.daysLeft<=3?"urgent":""}>{item.daysLeft<=3?`⚠ ${item.daysLeft} 天内吃掉`:`保质期约 ${item.daysLeft} 天`}</small></div><button aria-label={`删除${item.name}`} onClick={()=>remove(item.id)}>×</button></article>)}</div><div className="inventory-tip"><span>💡</span><p><b>今晚优先建议</b>菠菜快到期了，下次推荐会优先出现菠菜相关菜品。</p></div></>; }

function Stats({chosen}:{chosen:Dish[]}) { const calories=chosen.reduce((sum,dish)=>sum+dish.calories,0);const protein=chosen.reduce((sum,dish)=>sum+dish.protein,0);const cost=chosen.reduce((sum,dish)=>sum+dish.cost,0);return <><div className="stat-grid top-space"><article><span>本月做饭</span><b>12 <small>顿</small></b><p>比上月多 3 顿</p></article><article><span>本月食材</span><b>$186</b><p>预算 $260 · 剩余 $74</p></article><article><span>减少浪费</span><b>7 <small>份</small></b><p>及时吃掉快到期食材</p></article></div><section className="budget-card"><div><p className="eyebrow">MONTHLY BUDGET</p><h2>八月厨房预算</h2><p>目前使用 72%，按这个节奏刚刚好。</p></div><div className="budget-ring"><span><b>72%</b><small>$186 / $260</small></span></div></section><section className="nutrition-card"><div><h2>今晚营养预估</h2><p>按两人份计算，仅供日常参考</p></div><div className="macro"><span><b>{calories}</b> kcal</span><span><b>{protein}g</b> 蛋白质</span><span><b>${cost.toFixed(0)}</b> 预计成本</span></div></section></>; }

function formatRelative(value: string) {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0,Math.floor(elapsed/60000));
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes/60);
  if (hours < 24) return `${hours} 小时前`;
  return new Intl.DateTimeFormat("zh-CN",{month:"numeric",day:"numeric"}).format(new Date(value));
}
