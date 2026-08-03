'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
export default function Login(){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [err,setErr]=useState('');const router=useRouter();async function go(){const s=createClient();if(!s){setErr('База данных ещё не подключена');return;}const {error}=await s.auth.signInWithPassword({email,password});if(error)setErr('Неверный логин или пароль');else router.push('/admin');}return <div className="login-card"><h1>Вход администратора</h1><div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Пароль</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></div>{err&&<div className="notice">{err}</div>}<button className="btn btn-primary" style={{width:'100%'}} onClick={go}>Войти</button></div>}
