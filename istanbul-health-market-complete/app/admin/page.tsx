'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/lib/types';

const blank = { name: '', brand: '', category: '', description: '', sale_price: '', stock: '1', expiry_date: '', image_url: '', is_active: true };

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (session) void load(); }, [session]);

  async function login(e: FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : 'Вход выполнен');
  }
  async function load() {
    if (!supabase) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) setMessage(error.message); else setProducts((data as Product[]) || []);
  }
  async function upload(file: File) {
    if (!supabase) return;
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) return setMessage(error.message);
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm(v => ({ ...v, image_url: data.publicUrl }));
  }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!supabase) return;
    const payload = { ...form, sale_price: Number(form.sale_price), stock: Number(form.stock), expiry_date: form.expiry_date || null };
    const result = editing ? await supabase.from('products').update(payload).eq('id', editing) : await supabase.from('products').insert(payload);
    if (result.error) return setMessage(result.error.message);
    setForm(blank); setEditing(null); setMessage('Сохранено'); void load();
  }
  async function remove(id: string) { if (supabase && confirm('Удалить товар?')) { await supabase.from('products').delete().eq('id', id); void load(); } }
  function edit(p: Product) { setEditing(p.id); setForm({ name: p.name, brand: p.brand || '', category: p.category || '', description: p.description || '', sale_price: String(p.sale_price), stock: String(p.stock), expiry_date: p.expiry_date || '', image_url: p.image_url || '', is_active: p.is_active }); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  if (!supabaseConfigured) return <div className="adminShell"><div className="loginBox"><h1>Supabase не подключён</h1><p>Добавьте переменные окружения в Vercel.</p></div></div>;
  if (!session) return <div className="adminShell"><form className="loginBox" onSubmit={login}><a href="/">← Вернуться в каталог</a><h1>Вход администратора</h1><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/><input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required/><button>Войти</button>{message && <p>{message}</p>}</form></div>;

  return <main className="admin"><div className="adminTop"><div><a href="/">← Каталог</a><h1>Управление товарами</h1></div><button onClick={() => supabase?.auth.signOut()}>Выйти</button></div>
    <form className="productForm" onSubmit={save}><h2>{editing ? 'Редактировать товар' : 'Добавить товар'}</h2><div className="grid2"><label>Название<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required/></label><label>Бренд<input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })}/></label><label>Категория<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}/></label><label>Цена ₽<input type="number" min="0" value={form.sale_price} onChange={e => setForm({ ...form, sale_price: e.target.value })} required/></label><label>Количество<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}/></label><label>Срок годности<input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })}/></label></div><label>Описание<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/></label><label>Фото<input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])}/></label>{form.image_url && <img className="preview" src={form.image_url} alt="Предпросмотр"/>}<label className="check"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}/> Показывать клиентам</label><div className="formActions"><button>{editing ? 'Сохранить изменения' : 'Добавить товар'}</button>{editing && <button type="button" className="secondary" onClick={() => { setEditing(null); setForm(blank); }}>Отмена</button>}</div>{message && <p>{message}</p>}</form>
    <section className="adminList"><h2>Все товары ({products.length})</h2>{products.map(p => <div className="adminProduct" key={p.id}>{p.image_url ? <img src={p.image_url} alt=""/> : <div className="miniPlaceholder"/>}<div className="grow"><b>{p.name}</b><small>{p.sale_price} ₽ • Остаток: {p.stock} • {p.is_active ? 'показывается' : 'скрыт'}</small></div><button onClick={() => edit(p)}>Изменить</button><button className="danger" onClick={() => remove(p.id)}>Удалить</button></div>)}</section>
  </main>;
}
