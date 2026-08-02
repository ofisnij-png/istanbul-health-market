'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { CartItem, Product } from '@/lib/types';

const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ihm_cart');
    if (saved) setCart(JSON.parse(saved));
    void loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('ihm_cart', JSON.stringify(cart));
  }, [cart]);

  async function loadProducts() {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  const categories = useMemo(() => ['Все', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))], [products]);
  const filtered = products.filter(p => {
    const text = `${p.name} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (category === 'Все' || p.category === category);
  });
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + Number(i.sale_price) * i.quantity, 0);

  function add(product: Product) {
    setCart(old => {
      const found = old.find(i => i.id === product.id);
      return found ? old.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) : [...old, { ...product, quantity: 1 }];
    });
  }
  function change(id: string, delta: number) {
    setCart(old => old.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  }
  function sendWhatsApp() {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '79289580400';
    const lines = cart.map((i, n) => `${n + 1}. ${i.name} — ${i.quantity} шт. × ${money(Number(i.sale_price))}`);
    const message = `Здравствуйте! Хочу оформить заказ:\n\n${lines.join('\n')}\n\nИтого: ${money(total)}\n\nИмя: \nГород: `;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brandMark">IH</span><div><b>Istanbul Health Market</b><small>Витамины и товары для здоровья</small></div></div>
        <div className="actions"><a className="adminLink" href="/admin">Администратор</a><button className="cartBtn" onClick={() => setCartOpen(true)}>Корзина <b>{cartCount}</b></button></div>
      </header>

      <section className="hero"><div><p className="eyebrow">АКТУАЛЬНЫЙ КАТАЛОГ</p><h1>Заказывайте удобно через WhatsApp</h1><p>Фото, цены, наличие и срок годности всегда в одном месте.</p></div></section>

      {!supabaseConfigured && <div className="notice">Добавьте переменные Supabase в Vercel.</div>}
      <section className="filters"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск товара..."/><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></section>

      <section className="catalog">
        {loading ? <p className="empty">Загрузка...</p> : filtered.length === 0 ? <p className="empty">Товары пока не добавлены.</p> : filtered.map(p => (
          <article className="card" key={p.id}>
            <div className="imageWrap">{p.image_url ? <img src={p.image_url} alt={p.name}/> : <div className="placeholder">Нет фото</div>}{p.stock <= 0 && <span className="sold">Нет в наличии</span>}</div>
            <div className="cardBody"><div className="meta">{p.brand || 'IHM'}{p.category ? ` • ${p.category}` : ''}</div><h2>{p.name}</h2><p>{p.description || 'Описание товара'}</p>{p.expiry_date && <div className="expiry">Срок годности: {new Date(p.expiry_date).toLocaleDateString('ru-RU')}</div>}<div className="cardFoot"><strong>{money(Number(p.sale_price))}</strong><button disabled={p.stock <= 0} onClick={() => add(p)}>В корзину</button></div></div>
          </article>
        ))}
      </section>

      {cartOpen && <div className="overlay" onMouseDown={() => setCartOpen(false)}><aside className="drawer" onMouseDown={e => e.stopPropagation()}><div className="drawerHead"><h2>Ваш заказ</h2><button onClick={() => setCartOpen(false)}>×</button></div>{cart.length === 0 ? <p className="empty">Корзина пуста</p> : <><div className="cartItems">{cart.map(i => <div className="cartItem" key={i.id}><div><b>{i.name}</b><small>{money(Number(i.sale_price))}</small></div><div className="qty"><button onClick={() => change(i.id, -1)}>−</button><span>{i.quantity}</span><button onClick={() => change(i.id, 1)}>+</button></div></div>)}</div><div className="total"><span>Итого</span><b>{money(total)}</b></div><button className="whatsapp" onClick={sendWhatsApp}>Отправить заказ в WhatsApp</button></>}</aside></div>}
      <footer>© Istanbul Health Market</footer>
    </main>
  );
}
