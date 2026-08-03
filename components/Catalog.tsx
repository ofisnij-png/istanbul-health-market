'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient, hasSupabaseConfig } from '@/lib/supabase-browser';
import type { Product } from '@/lib/types';

type CartItem = Product & { qty:number };

export default function Catalog(){
 const supabase=createClient();
 const [products,setProducts]=useState<Product[]>([]); const [q,setQ]=useState(''); const [cart,setCart]=useState<CartItem[]>([]); const [open,setOpen]=useState(false); const [name,setName]=useState(''); const [comment,setComment]=useState('');
 useEffect(()=>{if(!supabase)return;(async()=>{const {data}=await supabase.from('products').select('*').eq('is_active',true).order('created_at',{ascending:false}); setProducts(data||[]);})();},[supabase]);
 const filtered=useMemo(()=>products.filter(p=>`${p.name} ${p.category||''}`.toLowerCase().includes(q.toLowerCase())),[products,q]);
 function add(p:Product){setCart(c=>{const x=c.find(i=>i.id===p.id);return x?c.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...c,{...p,qty:1}]});}
 function qty(id:string,n:number){setCart(c=>c.map(i=>i.id===id?{...i,qty:Math.max(1,n)}:i));}
 function remove(id:string){setCart(c=>c.filter(i=>i.id!==id));}
 const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
 function send(){if(!cart.length)return; const lines=cart.map((i,n)=>`${n+1}. ${i.name} — ${i.qty} шт. × ${i.price} ${i.currency} = ${(i.qty*i.price).toFixed(2)} ${i.currency}`); const text=`Здравствуйте! Хочу оформить заказ.%0A%0AИмя: ${encodeURIComponent(name||'Не указано')}%0A%0A${encodeURIComponent(lines.join('\n'))}%0A%0AИтого: ${total.toFixed(2)}%0AКомментарий: ${encodeURIComponent(comment||'Нет')}`; const phone=process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'79289580400'; window.open(`https://wa.me/${phone}?text=${text}`,'_blank');}
 return <>
  <header className="header"><div className="container header-inner"><div className="brand">Istanbul Health Market</div><input className="search" placeholder="Поиск товара..." value={q} onChange={e=>setQ(e.target.value)}/><button className="btn btn-secondary" onClick={()=>setOpen(true)}>Корзина ({cart.reduce((s,i)=>s+i.qty,0)})</button></div></header>
  {!hasSupabaseConfig()&&<div className="notice" style={{margin:'16px auto',maxWidth:1100}}>Сайт опубликован, но база данных ещё не подключена. Добавьте переменные Supabase в настройках Vercel.</div>}<main className="container"><section className="hero"><h1>Каталог товаров</h1><div>Актуальные цены, наличие и сроки годности</div></section>
  <div className="grid">{filtered.map(p=><article className="card" key={p.id}><img src={p.image_url||'https://placehold.co/600x450?text=No+photo'} alt={p.name}/><div className="card-body"><div className="muted">{p.category||'Без категории'}</div><h3>{p.name}</h3><div className="price">{p.price} {p.currency}</div><div className="muted">В наличии: {p.stock}</div><div className="muted">Срок: {p.expiry_date||'не указан'}</div><button className="btn btn-primary" style={{width:'100%',marginTop:12}} onClick={()=>add(p)}>Добавить в корзину</button></div></article>)}</div>{!filtered.length&&<div className="empty">Товары пока не добавлены</div>}</main>
  {open&&<div className="drawer" onClick={()=>setOpen(false)}><div className="drawer-panel" onClick={e=>e.stopPropagation()}><div className="row between"><h2>Корзина</h2><button className="btn btn-secondary" onClick={()=>setOpen(false)}>Закрыть</button></div>{cart.map(i=><div key={i.id} style={{padding:'12px 0',borderBottom:'1px solid #ddd'}}><b>{i.name}</b><div className="row between"><div className="row"><button className="btn btn-secondary" onClick={()=>qty(i.id,i.qty-1)}>-</button><span>{i.qty}</span><button className="btn btn-secondary" onClick={()=>qty(i.id,i.qty+1)}>+</button></div><button className="btn btn-danger" onClick={()=>remove(i.id)}>Удалить</button></div></div>)}<div className="field"><label>Ваше имя</label><input value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label>Комментарий</label><textarea value={comment} onChange={e=>setComment(e.target.value)}/></div><h3>Итого: {total.toFixed(2)}</h3><button className="btn btn-primary" style={{width:'100%'}} onClick={send}>Отправить заказ в WhatsApp</button></div></div>}
 </>;
}
