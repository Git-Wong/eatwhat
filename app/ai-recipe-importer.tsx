"use client";

import { useMemo, useState } from "react";
import type { GeneratedDish } from "@/lib/recipe-generation";

type Draft = {
  id: string;
  dish: GeneratedDish;
  selected: boolean;
};

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN").replace(/\s+/g, "");
}

export default function AiRecipeImporter({
  existingNames,
  onClose,
  onImport,
}: {
  existingNames: string[];
  onClose: () => void;
  onImport: (dishes: GeneratedDish[]) => void;
}) {
  const [prompt,setPrompt] = useState("");
  const [drafts,setDrafts] = useState<Draft[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const existing = useMemo(() => new Set(existingNames.map(normalizeName)), [existingNames]);
  const nameCounts = useMemo(() => {
    const counts = new Map<string,number>();
    drafts.forEach(({dish}) => {
      const name = normalizeName(dish.name);
      if (name) counts.set(name,(counts.get(name) ?? 0)+1);
    });
    return counts;
  }, [drafts]);
  const isDuplicate = (dish: GeneratedDish) => {
    const name = normalizeName(dish.name);
    return !name || existing.has(name) || (nameCounts.get(name) ?? 0)>1;
  };
  const importable = drafts.filter(draft => draft.selected && !isDuplicate(draft.dish));

  const updateDish = (id: string, change: Partial<GeneratedDish>) => {
    setDrafts(current => current.map(draft => draft.id===id?{...draft,dish:{...draft.dish,...change}}:draft));
  };

  const generate = async () => {
    if (prompt.trim().length<2) {
      setError("请先写下菜名或想要的菜谱方向。");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/recipes/generate",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({prompt:prompt.trim()}),
      });
      const data = await response.json() as { dishes?:GeneratedDish[];error?:string };
      if (!response.ok || !Array.isArray(data.dishes)) throw new Error(data.error || "没有生成有效菜谱。");
      setDrafts(data.dishes.map(dish=>({id:crypto.randomUUID(),dish,selected:true})));
    } catch (caught) {
      setError(caught instanceof Error?caught.message:"DeepSeek 生成失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return <div className="modal-backdrop" role="presentation"><section className="recipe-modal ai-import-modal" role="dialog" aria-modal="true" aria-labelledby="ai-import-title"><button className="modal-close" onClick={onClose} aria-label="关闭">×</button><div className="editor-heading"><p className="eyebrow">DEEPSEEK · RECIPE IMPORT</p><h2 id="ai-import-title">AI 批量生成菜谱</h2><p>输入菜名或描述需求，检查草稿后再加入家庭菜谱。</p></div><div className="ai-prompt-box"><textarea aria-label="菜谱生成需求" value={prompt} maxLength={2000} onChange={event=>setPrompt(event.target.value)} placeholder={"例如：加入青椒炒肉、清蒸鲈鱼，再推荐 3 道适合夏天的湖南家常菜。\n全部按两人份，少辣。"}/><div><small>{prompt.length}/2000</small><button className="primary" disabled={loading||prompt.trim().length<2} onClick={generate}>{loading?"DeepSeek 生成中…":drafts.length?"重新生成":"✦ 生成菜谱草稿"}</button></div></div>{error&&<p className="form-error">{error}</p>}{drafts.length>0&&<><div className="ai-result-heading"><div><b>生成了 {drafts.length} 道菜</b><small>重名菜不会被导入；菜谱细节可在加入后继续编辑。</small></div><div><button className="text-button" onClick={()=>setDrafts(current=>current.map(draft=>({...draft,selected:true})))}>全选</button><button className="text-button" onClick={()=>setDrafts(current=>current.map(draft=>({...draft,selected:false})))}>取消全选</button></div></div><div className="ai-draft-list">{drafts.map(({id,dish,selected},index)=>{const duplicate=isDuplicate(dish);return <article className={duplicate?"ai-draft duplicate":"ai-draft"} key={id}><div className="ai-draft-top"><label className="ai-select"><input aria-label={`选择${dish.name||`第 ${index+1} 道菜`}`} type="checkbox" checked={selected&&!duplicate} disabled={duplicate} onChange={event=>setDrafts(current=>current.map(draft=>draft.id===id?{...draft,selected:event.target.checked}:draft))}/><span>{dish.emoji}</span></label><div className="ai-draft-fields"><input aria-label={`第 ${index+1} 道菜名`} value={dish.name} onChange={event=>updateDish(id,{name:event.target.value})}/><input aria-label={`${dish.name}介绍`} value={dish.desc} onChange={event=>updateDish(id,{desc:event.target.value})}/></div><button className="danger-text" onClick={()=>setDrafts(current=>current.filter(draft=>draft.id!==id))}>移除</button></div>{duplicate&&<p className="duplicate-note">菜名为空、与现有菜谱重名，或本批次内重复</p>}<div className="ai-draft-metrics"><label>时间<input type="number" min="0" value={dish.minutes} onChange={event=>updateDish(id,{minutes:Number(event.target.value)})}/><small>分钟</small></label><label>热量<input type="number" min="0" value={dish.calories} onChange={event=>updateDish(id,{calories:Number(event.target.value)})}/><small>kcal</small></label><label>蛋白质<input type="number" min="0" value={dish.protein} onChange={event=>updateDish(id,{protein:Number(event.target.value)})}/><small>g</small></label><label>成本<input type="number" min="0" step="0.1" value={dish.cost} onChange={event=>updateDish(id,{cost:Number(event.target.value)})}/><small>$</small></label></div><details><summary>查看食材与做法</summary><div className="ai-draft-detail"><div><h4>食材</h4>{dish.ingredients.map((item,itemIndex)=><p key={`${item.name}-${itemIndex}`}><span>{item.name}</span><b>{item.qty}</b></p>)}</div><div><h4>步骤</h4>{dish.steps.map((step,stepIndex)=><p key={`${step}-${stepIndex}`}><span>{stepIndex+1}</span>{step}</p>)}</div></div></details></article>})}</div></>}<div className="editor-actions ai-import-actions"><button className="ghost" onClick={onClose}>取消</button><button className="primary" disabled={!importable.length} onClick={()=>onImport(importable.map(draft=>draft.dish))}>确认加入 {importable.length||0} 道菜</button></div></section></div>;
}
