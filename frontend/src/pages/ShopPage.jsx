import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productsAPI } from '../api/client';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { FiFilter, FiSearch } from 'react-icons/fi';

const CATEGORIES = ['all', 'clothing', 'footwear', 'accessories', 'electronics', 'home', 'beauty'];
const BADGES     = ['all', 'trending', 'featured', 'new-arrival', 'best-seller'];
const SORTS      = [
  { label: 'Newest',       value: 'createdAt', order: 'desc' },
  { label: 'Price: Low',   value: 'price',     order: 'asc'  },
  { label: 'Price: High',  value: 'price',     order: 'desc' },
  { label: 'Best Selling', value: 'totalSold', order: 'desc' },
];

const SHOP_HERO_VIDEO = '/media/scatch-hero.mp4';

function SkeletonCard() {
  return (
    <div className="glass" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '220px' }} />
      <div style={{ padding: '1.25rem' }}>
        <div className="skeleton" style={{ height: '1rem', marginBottom: '.75rem', width: '70%' }} />
        <div className="skeleton" style={{ height: '.8rem', width: '40%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '2.5rem', borderRadius: '.75rem' }} />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [pages, setPages]               = useState(1);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    badge:    searchParams.get('badge')    || '',
    sort:     searchParams.get('sort')      || 'createdAt',
    order:    searchParams.get('order')     || 'desc',
    page:     Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search:   searchParams.get('search')   || '',
      category: searchParams.get('category') || '',
      badge:    searchParams.get('badge')    || '',
      sort:     searchParams.get('sort')      || 'createdAt',
      order:    searchParams.get('order')     || 'desc',
      page:     Number(searchParams.get('page')) || 1,
    }));
  }, [searchParams]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    if (filters.category) next.set('category', filters.category);
    if (filters.badge) next.set('badge', filters.badge);
    if (filters.sort !== 'createdAt') next.set('sort', filters.sort);
    if (filters.order !== 'desc') next.set('order', filters.order);
    if (filters.page > 1) next.set('page', String(filters.page));

    const nextString = next.toString();
    if (nextString !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search:   filters.search   || undefined,
        category: filters.category || undefined,
        badge:    filters.badge    || undefined,
        sort:     filters.sort,
        order:    filters.order,
        page:     filters.page,
        limit:    12,
      };
      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const update = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  const activeFilterCount = [filters.category, filters.badge, filters.search].filter(Boolean).length;

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
        style={{ padding: '3rem 2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}
      >
        <p className="section-label" style={{ marginBottom: '.5rem' }}>Browse</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="section-heading">Luxury Collection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{total} items found</p>
        </div>
      </motion.div>

      <section className="shop-video-hero">
        <video 
          className="shop-top-video" 
          autoPlay 
          muted 
          loop 
          playsInline
          preload="metadata"
        >
          <source src={SHOP_HERO_VIDEO} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="shop-video-copy">
          <p className="section-label">Shop</p>
          <h1 className="section-heading">Luxury in Motion</h1>
        </div>
      </section>

      <div className="shop-layout" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {/* ── Sidebar Filters ─── */}
        <aside className={`shop-sidebar ${showFilters ? 'shop-sidebar-open' : ''}`} style={{ width: '240px', flexShrink: 0 }}>
          <div className="glass" style={{ borderRadius: '1.25rem', padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '.9rem' }}>Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={() => setFilters(f => ({ ...f, search: '', category: '', badge: '', page: 1 }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '.78rem' }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '.75rem' }}>Search</p>
              <div style={{ position: 'relative' }}>
                <input className="input-luxury" placeholder="Product name..." value={filters.search} onChange={(e) => update('search', e.target.value)} style={{ paddingRight: '2.5rem' }} />
                <FiSearch style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '.75rem' }}>Category</p>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => update('category', c === 'all' ? '' : c)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '.45rem .75rem', borderRadius: '.5rem', border: 'none',
                  background: filters.category === (c === 'all' ? '' : c) ? 'var(--accent-soft)' : 'transparent',
                  color: filters.category === (c === 'all' ? '' : c) ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '.85rem', textTransform: 'capitalize',
                  marginBottom: '.2rem', transition: 'all .15s',
                }}>
                  {c === 'all' ? 'All Categories' : c}
                </button>
              ))}
            </div>

            {/* Badge */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '.75rem' }}>Badge</p>
              {BADGES.map((b) => (
                <button key={b} onClick={() => update('badge', b === 'all' ? '' : b)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '.45rem .75rem', borderRadius: '.5rem', border: 'none',
                  background: filters.badge === (b === 'all' ? '' : b) ? 'var(--accent-soft)' : 'transparent',
                  color: filters.badge === (b === 'all' ? '' : b) ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '.85rem', textTransform: 'capitalize',
                  marginBottom: '.2rem', transition: 'all .15s',
                }}>
                  {b === 'all' ? 'All' : b.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div>
              <p style={{ fontSize: '.75rem', letterSpacing: '.1em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '.75rem' }}>Sort By</p>
              {SORTS.map((s) => (
                <button key={s.label} onClick={() => setFilters(f => ({ ...f, sort: s.value, order: s.order, page: 1 }))} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '.45rem .75rem', borderRadius: '.5rem', border: 'none',
                  background: filters.sort === s.value && filters.order === s.order ? 'var(--accent-soft)' : 'transparent',
                  color: filters.sort === s.value && filters.order === s.order ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '.85rem',
                  marginBottom: '.2rem', transition: 'all .15s',
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Products Grid ─── */}
        <div className="shop-main" style={{ flex: 1 }}>
          {/* Mobile filter toggle */}
          <div className="shop-filter-toggle" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-magnetic btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <FiFilter /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</p>
              <p style={{ fontSize: '1.1rem', marginBottom: '.5rem', color: 'var(--text-secondary)' }}>No products found</p>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
              {products.map((p, index) => <ProductCard key={p._id} product={p} index={index} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))} style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: filters.page === p ? 'var(--gradient)' : 'rgba(0,0,0,.04)',
                  border: `1px solid ${filters.page === p ? 'transparent' : 'rgba(0,0,0,.08)'}`,
                  color: filters.page === p ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '.85rem', transition: 'all .2s',
                }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
