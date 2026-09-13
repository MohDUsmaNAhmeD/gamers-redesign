import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

export interface Product { id: number; slug: string; name: string; brand: string; category: string; price: number; original_price: number | null; image: string; gallery: string[]; tagline: string; description: string; specs: Record<string, string>; condition: string; stock: number; featured: boolean; badge: string | null; seller: string; }
export interface Category { id: number; name: string; slug: string; image: string; position: number; }
export interface CartItem { product_id: number; quantity: number; }
export interface Cart { id: string; items: CartItem[]; saved_items: number[]; }
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export async function request<T>(url: string, options?: RequestInit): Promise<T> { const response = await fetch(url, options); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.'); return data; }
function sessionId() { let id = localStorage.getItem('nexus_cart'); if (!id) { id = crypto.randomUUID(); localStorage.setItem('nexus_cart', id); } return id; }
interface Store { products: Product[]; categories: Category[]; loading: boolean; error: string; cart: Cart; busy: boolean; toast: string; cartOpen: boolean; setCartOpen: (v: boolean) => void; searchOpen: boolean; setSearchOpen: (v: boolean) => void; savedOpen: boolean; setSavedOpen: (v: boolean) => void; load: () => Promise<void>; refreshCart: () => Promise<void>; mutate: (action: string, product_id: number, quantity?: number) => Promise<boolean>; notify: (text: string) => void; }
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]); const [categories, setCategories] = useState<Category[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [cart, setCart] = useState<Cart>(() => ({ id: sessionId(), items: [], saved_items: [] })); const [busy, setBusy] = useState(false); const busyRef = useRef(false); const [toast, setToast] = useState(''); const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [cartOpen, setCartOpen] = useState(false); const [searchOpen, setSearchOpen] = useState(false); const [savedOpen, setSavedOpen] = useState(false);
  const notify = useCallback((text: string) => { setToast(text); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 4200); }, []);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const data = await request<{ products: Product[]; categories: Category[] }>('/api/catalog'); setProducts(data.products); setCategories(data.categories); } catch (err) { setError((err as Error).message); } finally { setLoading(false); } }, []);
  const refreshCart = useCallback(async () => { const data = await request<Cart>('/api/cart?id=' + sessionId()); setCart(data); }, []);
  useEffect(() => { void load(); void refreshCart().catch(() => notify('Your saved cart could not be loaded. Try refreshing.')); return () => clearTimeout(timer.current); }, [load, refreshCart, notify]);
  const mutate = async (action: string, product_id: number, quantity?: number) => { if (busyRef.current) return false; busyRef.current = true; setBusy(true); try { await request('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cart.id, action, product_id, quantity }) }); await refreshCart(); if (action === 'add') notify('Added to your loadout.'); return true; } catch (err) { notify((err as Error).message); return false; } finally { busyRef.current = false; setBusy(false); } };
  return <Context.Provider value={{ products, categories, loading, error, cart, busy, toast, cartOpen, setCartOpen, searchOpen, setSearchOpen, savedOpen, setSavedOpen, load, refreshCart, mutate, notify }}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('Store provider is missing'); return value; }
