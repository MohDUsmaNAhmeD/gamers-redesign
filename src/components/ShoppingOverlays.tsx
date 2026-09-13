import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Heart,
  LoaderCircle,
  X,
  Package,
} from "lucide-react";
import { money, request, useStore } from "../lib/store";
import Overlay from "./Overlay";
import ProductCard from "./ProductCard";

function SearchPanel() {
  const { products, categories, setSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const close = useCallback(() => setSearchOpen(false), [setSearchOpen]);
  const filtered = products
    .filter((p) =>
      (p.name + " " + p.brand + " " + p.category)
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 5);
  return (
    <Overlay title="Find your next upgrade." close={close} wide>
      <form
        className="expanded-search"
        onSubmit={(e) => {
          e.preventDefault();
          close();
          navigate("/shop?q=" + encodeURIComponent(query));
        }}
      >
        <Search size={22} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search consoles, gear, and more…"
          aria-label="Search all products"
        />
        <button className="icon-button" aria-label="See all search results">
          <ArrowRight size={21} />
        </button>
      </form>
      {!query && (
        <div className="search-chips">
          {categories.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                close();
                navigate("/shop?category=" + c.slug);
              }}
            >
              {c.name}
              <ArrowRight size={12} />
            </button>
          ))}
        </div>
      )}
      <div className="panel-section-label">
        {query ? "MATCHING GEAR" : "EXPLORE THE ARMORY"}
        <span>{filtered.length} results</span>
      </div>
      <div className="search-results">
        {filtered.map((p) => (
          <Link
            to={"/product/" + p.slug}
            onClick={close}
            key={p.id}
            className="search-result"
          >
            <img src={p.image} alt={p.name} />
            <div>
              <span className="eyebrow">{p.brand}</span>
              <h3>{p.name}</h3>
              <small>
                {p.category} · {p.condition}
              </small>
            </div>
            <strong>{money(p.price)}</strong>
            <ArrowRight size={17} />
          </Link>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <Search size={32} />
            <h3>No gear found.</h3>
            <p>Try a brand, product name, or category.</p>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function CartPanel() {
  const { cart, products, setCartOpen, mutate, busy, refreshCart } = useStore();
  const close = useCallback(() => setCartOpen(false), [setCartOpen]);
  const [step, setStep] = useState<"cart" | "checkout" | "complete">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState("");
  const lines = cart.items
    .map((item) => ({
      ...item,
      product: products.find((p) => p.id === item.product_id),
    }))
    .filter((item) => item.product);
  const subtotal = lines.reduce(
    (sum, item) => sum + item.quantity * Number(item.product!.price),
    0,
  );
  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await request<{ id: string }>("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cart.id,
          email: data.get("email"),
          full_name: data.get("full_name"),
          address: data.get("address"),
        }),
      });
      setOrder(result.id);
      await refreshCart();
      setStep("complete");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Overlay
      title={
        step === "checkout"
          ? "The final checkpoint."
          : step === "complete"
            ? "You’re all set."
            : "Your loadout."
      }
      close={close}
    >
      {step === "complete" ? (
        <div className="order-success">
          <div className="success-icon">
            <Check size={32} />
          </div>
          <span className="eyebrow">DEMO ORDER SAVED</span>
          <h2>A next-level choice.</h2>
          <p>
            Your demo order has been saved to the database. No payment was
            collected and no products will be shipped.
          </p>
          <div className="order-number">
            REFERENCE #{order.slice(0, 8).toUpperCase()}
          </div>
          <button className="button primary" onClick={close}>
            Back to the armory <ArrowRight size={17} />
          </button>
        </div>
      ) : step === "checkout" ? (
        <form className="checkout-form" onSubmit={checkout}>
          <button
            type="button"
            className="text-button"
            onClick={() => setStep("cart")}
          >
            ← Back to your cart
          </button>
          <div className="demo-notice">
            <ShieldCheck size={20} />
            <p>
              <strong>A safe test drive.</strong> This is a demo checkout. No
              payment or real order fulfillment. You can use test contact
              details.
            </p>
          </div>
          <label>
            Full name
            <input
              name="full_name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Your full name"
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Delivery address
            <textarea
              name="address"
              autoComplete="street-address"
              required
              maxLength={500}
              placeholder="Street address, city, ZIP code, country"
              rows={3}
            />
          </label>
          <div className="checkout-total">
            <span>Demo order total</span>
            <strong>{money(subtotal)}</strong>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full-button" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <>
                Place demo order <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="small-note">
            No card details required. Shipping and tax are not calculated in
            this demo.
          </p>
        </form>
      ) : (
        <>
          {lines.length ? (
            <>
              <div className="cart-shipping">
                <Package size={16} />
                <span>Your next-level setup is taking shape.</span>
              </div>
              <div className="cart-lines">
                {lines.map(({ product: p, quantity }) => (
                  <div className="cart-line" key={p!.id}>
                    <Link to={"/product/" + p!.slug} onClick={close}>
                      <img src={p!.image} alt={p!.name} />
                    </Link>
                    <div className="cart-line-content">
                      <span className="eyebrow">{p!.brand}</span>
                      <h3>{p!.name}</h3>
                      <strong>{money(p!.price)}</strong>
                      <div className="cart-line-controls">
                        <div className="quantity-control">
                          <button
                            aria-label={"Decrease quantity of " + p!.name}
                            disabled={busy || quantity <= 1}
                            onClick={() =>
                              void mutate("quantity", p!.id, quantity - 1)
                            }
                          >
                            <Minus size={13} />
                          </button>
                          <span>{quantity}</span>
                          <button
                            aria-label={"Increase quantity of " + p!.name}
                            disabled={
                              busy || quantity >= Math.min(p!.stock, 10)
                            }
                            onClick={() =>
                              void mutate("quantity", p!.id, quantity + 1)
                            }
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          className="icon-button remove-button"
                          disabled={busy}
                          aria-label={"Remove " + p!.name}
                          onClick={() => void mutate("remove", p!.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>
                <p>Demo catalog · Prices in USD</p>
                <button
                  className="button primary full-button"
                  disabled={busy}
                  onClick={() => setStep("checkout")}
                >
                  Continue to checkout <ArrowRight size={18} />
                </button>
                <span className="cart-secure">
                  <ShieldCheck size={14} /> DEMO CHECKOUT · NO PAYMENT REQUIRED
                </span>
                <button
                  className="text-button continue-shopping"
                  onClick={close}
                >
                  Continue exploring
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state cart-empty">
              <ShoppingBag size={44} />
              <h3>Your next upgrade awaits.</h3>
              <p>Your cart is empty. Let’s find your new favorite gear.</p>
              <Link to="/shop" onClick={close} className="button primary">
                Explore the armory <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </>
      )}
    </Overlay>
  );
}
function SavedPanel() {
  const { products, cart, setSavedOpen } = useStore();
  const close = useCallback(() => setSavedOpen(false), [setSavedOpen]);
  const saved = products.filter((p) => cart.saved_items.includes(p.id));
  return (
    <Overlay title="Your wishlist." close={close} wide>
      <p className="overlay-description">
        Keep your next upgrades in sight. Saved to this browser’s shopping
        session.
      </p>
      {saved.length ? (
        <div className="saved-grid">
          {saved.map((p) => (
            <div
              key={p.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) close();
              }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={40} />
          <h3>Make room for your favorites.</h3>
          <p>Tap the heart on any product to save it here.</p>
          <button className="button primary" onClick={close}>
            Keep exploring <ArrowRight size={17} />
          </button>
        </div>
      )}
    </Overlay>
  );
}
export default function ShoppingOverlays() {
  const { searchOpen, cartOpen, savedOpen, toast } = useStore();
  return (
    <>
      <AnimatePresence>
        {searchOpen && <SearchPanel key="search" />}
        {cartOpen && <CartPanel key="cart" />}
        {savedOpen && <SavedPanel key="saved" />}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <div className="toast" role="status">
            <Check size={17} />
            {toast}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
