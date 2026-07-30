'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import './admin.css';

type Category = { id: string; name: string; image: string };
type Product = { id: string; categoryId: string; name: string; thumbnail: string; descriptionHtml: string };
type Contact = { id: string; name: string; displayNumber: string; whatsappNumber: string };
type Social = { id: string; label: string; url: string };
type ImageSlot = { id: string; group: string; label: string; url: string };
type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'ready_to_ship' | 'shipped' | 'completed';
type Order = { id: string; contractNumber: string; status: OrderStatus; progress: number; note: string; updatedAt: string };
type SiteContent = {
  version: number;
  updatedAt: string | null;
  site: { name: string; logo: string; email: string };
  categories: Category[];
  products: Product[];
  contacts: Contact[];
  socials: Social[];
  images: ImageSlot[];
  orders: Order[];
};

type Section = 'overview' | 'categories' | 'products' | 'orders' | 'contacts' | 'brand' | 'images' | 'socials';

const sections: { id: Section; label: string; short: string }[] = [
  { id: 'overview', label: '概览', short: '概' },
  { id: 'categories', label: '产品类目', short: '类' },
  { id: 'products', label: '产品', short: '品' },
  { id: 'orders', label: '订单进度', short: '单' },
  { id: 'contacts', label: '客服联系方式', short: '客' },
  { id: 'brand', label: '品牌与网站', short: '牌' },
  { id: 'images', label: '页面图片', short: '图' },
  { id: 'socials', label: '社媒链接', short: '媒' },
];

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'in_production', label: '生产中' },
  { value: 'quality_check', label: '质检中' },
  { value: 'ready_to_ship', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
];

const clone = <T,>(value: T): T => structuredClone(value);
const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '请求失败，请稍后重试。');
  return data;
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ImagePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body: form });
      onChange(result.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '上传失败。');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-picker">
      <div className="image-preview">{value ? <img src={value} alt="当前图片" /> : <span>暂无图片</span>}</div>
      <div className="image-picker-fields">
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="/img/... 或 https://..." />
        <label className="button button-secondary upload-button">
          {uploading ? '上传中...' : '上传图片'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={upload} disabled={uploading} />
        </label>
        {error && <small className="field-error">{error}</small>}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedContent, setSavedContent] = useState<SiteContent | null>(null);
  const [active, setActive] = useState<Section>('overview');
  const [search, setSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const dirty = useMemo(() => Boolean(content && savedContent && JSON.stringify(content) !== JSON.stringify(savedContent)), [content, savedContent]);

  const loadContent = useCallback(async () => {
    const next = await api<SiteContent>('/api/admin/content');
    setContent(next);
    setSavedContent(clone(next));
  }, []);

  useEffect(() => {
    api<{ authenticated: boolean; configured: boolean }>('/api/admin/session')
      .then(async (status) => {
        setConfigured(status.configured);
        setAuthenticated(status.authenticated);
        if (status.authenticated) await loadContent();
      })
      .catch(() => setAuthenticated(false));
  }, [loadContent]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      setAuthenticated(true);
      setPassword('');
      await loadContent();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败。');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    if (dirty && !window.confirm('还有未保存的修改，确定退出吗？')) return;
    await api('/api/admin/session', { method: 'DELETE' });
    setAuthenticated(false);
    setContent(null);
    setSavedContent(null);
  };

  const update = (recipe: (draft: SiteContent) => void) => {
    setContent((current) => {
      if (!current) return current;
      const draft = clone(current);
      recipe(draft);
      return draft;
    });
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!content) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const saved = await api<SiteContent>('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      setContent(saved);
      setSavedContent(clone(saved));
      setMessage('全部修改已保存，前台刷新后即可看到。');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存失败。');
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = (id: string) => {
    if (!content) return;
    const used = content.products.filter((product) => product.categoryId === id).length;
    if (used) {
      setError(`该类目下还有 ${used} 个产品，请先移动或删除这些产品。`);
      return;
    }
    if (window.confirm('确定删除这个产品类目吗？')) update((draft) => { draft.categories = draft.categories.filter((item) => item.id !== id); });
  };

  const removeProduct = (id: string) => {
    if (window.confirm('确定删除这个产品吗？此操作保存后生效。')) {
      update((draft) => { draft.products = draft.products.filter((item) => item.id !== id); });
      setEditingProduct(null);
    }
  };

  if (authenticated === null) return <main className="admin-loading">正在加载后台...</main>;

  if (!authenticated) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <div className="login-brand"><span>LC</span><div><b>Lan Chuang</b><small>CONTENT ADMIN</small></div></div>
          <div className="login-copy">
            <p>网站内容管理</p>
            <h1>欢迎回来</h1>
            <span>登录后可维护产品、联系方式、品牌及所有页面图片。</span>
          </div>
          {!configured && <div className="alert alert-error">请先在服务器环境变量中配置 ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。</div>}
          <form onSubmit={login} className="login-form">
            <Field label="后台密码" type="password" value={password} onChange={setPassword} placeholder="请输入后台密码" />
            {error && <div className="alert alert-error">{error}</div>}
            <button className="button button-primary login-button" disabled={busy || !configured}>{busy ? '登录中...' : '登录后台'}</button>
          </form>
          <Link href="/" className="back-link">返回网站首页</Link>
        </section>
        <aside className="login-visual"><div><span>CONTENT OPERATIONS</span><h2>一处管理，<br />全站同步。</h2><p>文件化内容存储 · 安全图片上传 · 修改即时生效</p></div></aside>
      </main>
    );
  }

  if (!content) return <main className="admin-loading">正在读取网站内容...</main>;

  const filteredProducts = content.products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders = content.orders.filter((order) => order.contractNumber.toLowerCase().includes(orderSearch.trim().toLowerCase()));
  const product = content.products.find((item) => item.id === editingProduct);
  const groupedImages = content.images.reduce<Record<string, ImageSlot[]>>((groups, item) => {
    (groups[item.group] ??= []).push(item);
    return groups;
  }, {});

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/admin" className="sidebar-brand"><span>LC</span><div><b>Lan Chuang</b><small>ADMIN CONSOLE</small></div></a>
        <nav>
          {sections.map((section) => (
            <button key={section.id} className={active === section.id ? 'active' : ''} onClick={() => setActive(section.id)}>
              <i>{section.short}</i><span>{section.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="/" target="_blank">查看网站</a>
          <button onClick={logout}>退出登录</button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-header">
          <div><span>网站内容管理</span><h1>{sections.find((section) => section.id === active)?.label}</h1></div>
          <div className="header-actions">
            {dirty && <span className="dirty-indicator">有未保存修改</span>}
            <button className="button button-secondary" disabled={!dirty || busy} onClick={() => savedContent && setContent(clone(savedContent))}>撤销</button>
            <button className="button button-primary" disabled={!dirty || busy} onClick={save}>{busy ? '保存中...' : '保存全部修改'}</button>
          </div>
        </header>

        {(message || error) && <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>{error || message}</div>}

        <div className="admin-content">
          {active === 'overview' && (
            <section>
              <div className="section-heading"><div><span>OVERVIEW</span><h2>网站内容概览</h2><p>所有后台数据均保存在统一内容文件中，保存后前台刷新即可生效。</p></div></div>
              <div className="metrics-grid">
                <button onClick={() => setActive('categories')}><small>产品类目</small><strong>{content.categories.length}</strong><span>管理类目 →</span></button>
                <button onClick={() => setActive('products')}><small>产品总数</small><strong>{content.products.length}</strong><span>管理产品 →</span></button>
                <button onClick={() => setActive('orders')}><small>订单数量</small><strong>{content.orders.length}</strong><span>管理订单 →</span></button>
                <button onClick={() => setActive('contacts')}><small>客服账号</small><strong>{content.contacts.length}</strong><span>管理客服 →</span></button>
                <button onClick={() => setActive('images')}><small>图片槽位</small><strong>{content.images.length}</strong><span>管理图片 →</span></button>
              </div>
              <div className="panel overview-panel">
                <div><span className="status-dot" /><div><b>内容系统运行正常</b><small>上次保存：{content.updatedAt ? new Date(content.updatedAt).toLocaleString('zh-CN') : '尚未通过后台保存'}</small></div></div>
                <div><b>{content.site.name}</b><small>{content.site.email}</small></div>
              </div>
            </section>
          )}

          {active === 'categories' && (
            <section>
              <div className="section-heading row"><div><span>CATALOGUE</span><h2>产品类目</h2><p>类目顺序即前台展示顺序。仍有关联产品的类目不能删除。</p></div><button className="button button-primary" onClick={() => update((draft) => draft.categories.push({ id: makeId('category'), name: '新类目', image: '' }))}>+ 添加类目</button></div>
              <div className="stack-list">
                {content.categories.map((category, index) => (
                  <article className="panel category-row" key={category.id}>
                    <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
                    <ImagePicker value={category.image} onChange={(value) => update((draft) => { draft.categories[index].image = value; })} />
                    <Field label="类目名称" value={category.name} onChange={(value) => update((draft) => { draft.categories[index].name = value; })} />
                    <div className="row-meta"><small>关联产品</small><b>{content.products.filter((item) => item.categoryId === category.id).length}</b></div>
                    <button className="button button-danger" onClick={() => removeCategory(category.id)}>删除</button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {active === 'products' && (
            <section>
              <div className="section-heading row"><div><span>PRODUCTS</span><h2>产品管理</h2><p>添加、修改产品名称、类目、缩略图和详情 HTML。</p></div><button className="button button-primary" onClick={() => { const id = makeId('product'); update((draft) => draft.products.unshift({ id, categoryId: draft.categories[0]?.id || '', name: '新产品', thumbnail: '', descriptionHtml: '' })); setEditingProduct(id); }}>+ 添加产品</button></div>
              <div className="product-toolbar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索产品名称..." /><span>共 {filteredProducts.length} 个产品</span></div>
              <div className="panel table-wrap">
                <table className="admin-table"><thead><tr><th>产品</th><th>类目</th><th>详情内容</th><th>操作</th></tr></thead><tbody>
                  {filteredProducts.map((item) => <tr key={item.id}><td><div className="product-cell">{item.thumbnail ? <img src={item.thumbnail} alt="" /> : <span /> }<b>{item.name}</b></div></td><td>{content.categories.find((category) => category.id === item.categoryId)?.name || '未分类'}</td><td>{item.descriptionHtml ? '已填写' : '未填写'}</td><td><button className="table-action" onClick={() => setEditingProduct(item.id)}>编辑</button></td></tr>)}
                </tbody></table>
              </div>
            </section>
          )}

          {active === 'contacts' && (
            <section>
              <div className="section-heading row"><div><span>CONTACTS</span><h2>客服联系方式</h2><p>WhatsApp 号码只填写数字和国家区号，不要填写空格或加号。</p></div><button className="button button-primary" onClick={() => update((draft) => draft.contacts.push({ id: makeId('contact'), name: '新客服', displayNumber: '', whatsappNumber: '' }))}>+ 添加客服</button></div>
              <div className="stack-list">
                {content.contacts.map((contact, index) => <article className="panel form-row" key={contact.id}>
                  <Field label="客服姓名" value={contact.name} onChange={(value) => update((draft) => { draft.contacts[index].name = value; })} />
                  <Field label="前台显示号码" value={contact.displayNumber} onChange={(value) => update((draft) => { draft.contacts[index].displayNumber = value; })} placeholder="+86 ..." />
                  <Field label="WhatsApp 号码" value={contact.whatsappNumber} onChange={(value) => update((draft) => { draft.contacts[index].whatsappNumber = value.replace(/\D/g, ''); })} placeholder="86133..." />
                  <button className="button button-danger" onClick={() => window.confirm('确定删除这个客服吗？') && update((draft) => { draft.contacts.splice(index, 1); })}>删除</button>
                </article>)}
              </div>
            </section>
          )}

          {active === 'orders' && (
            <section>
              <div className="section-heading row"><div><span>ORDER TRACKING</span><h2>订单进度管理</h2><p>客户使用合同号精确查询。修改状态、进度或备注后请点击右上角保存。</p></div><button className="button button-primary" onClick={() => update((draft) => draft.orders.unshift({ id: makeId('order'), contractNumber: `LC-${new Date().getFullYear()}-`, status: 'pending', progress: 0, note: '', updatedAt: new Date().toISOString() }))}>+ 添加订单</button></div>
              <div className="product-toolbar"><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="搜索合同号..." /><span>共 {filteredOrders.length} 个订单</span></div>
              <div className="stack-list">
                {filteredOrders.map((order) => {
                  const index = content.orders.findIndex((candidate) => candidate.id === order.id);
                  const touch = (draft: SiteContent) => { draft.orders[index].updatedAt = new Date().toISOString(); };
                  return (
                    <article className="panel order-row" key={order.id}>
                      <div className="order-row-main">
                        <Field label="合同号" value={order.contractNumber} onChange={(value) => update((draft) => { draft.orders[index].contractNumber = value.toUpperCase(); touch(draft); })} placeholder="LC-2026-001" />
                        <label className="admin-field"><span>订单状态</span><select value={order.status} onChange={(event) => update((draft) => { draft.orders[index].status = event.target.value as OrderStatus; touch(draft); })}>{orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                        <label className="admin-field progress-field"><span>订单进度</span><div><input type="range" min="0" max="100" step="1" value={order.progress} onChange={(event) => update((draft) => { draft.orders[index].progress = Number(event.target.value); touch(draft); })} /><input type="number" min="0" max="100" value={order.progress} onChange={(event) => update((draft) => { draft.orders[index].progress = Math.max(0, Math.min(100, Number(event.target.value))); touch(draft); })} /><b>%</b></div></label>
                        <button className="button button-danger" onClick={() => window.confirm('确定删除这个订单吗？') && update((draft) => { draft.orders.splice(index, 1); })}>删除</button>
                      </div>
                      <label className="admin-field"><span>客户可见备注</span><textarea rows={3} value={order.note} onChange={(event) => update((draft) => { draft.orders[index].note = event.target.value; touch(draft); })} placeholder="例如：产品正在生产，预计下周进入质量检验。" /></label>
                      <small className="order-updated">更新时间：{new Date(order.updatedAt).toLocaleString('zh-CN')}</small>
                    </article>
                  );
                })}
                {filteredOrders.length === 0 && <div className="panel empty-admin-state">暂无订单，点击“添加订单”开始录入。</div>}
              </div>
            </section>
          )}

          {active === 'brand' && (
            <section>
              <div className="section-heading"><div><span>BRAND & SITE</span><h2>品牌与网站</h2><p>管理网站名称、公司 Logo 和公开联系邮箱。</p></div></div>
              <div className="panel brand-panel">
                <div className="brand-fields">
                  <Field label="网站名称" value={content.site.name} onChange={(value) => update((draft) => { draft.site.name = value; })} />
                  <Field label="联系邮箱" type="email" value={content.site.email} onChange={(value) => update((draft) => { draft.site.email = value; })} />
                </div>
                <div className="brand-logo"><span>公司 Logo</span><ImagePicker value={content.site.logo} onChange={(value) => update((draft) => { draft.site.logo = value; })} /></div>
              </div>
            </section>
          )}

          {active === 'images' && (
            <section>
              <div className="section-heading"><div><span>MEDIA LIBRARY</span><h2>所有页面图片</h2><p>按页面板块替换图片。建议横幅使用 1920×900，内容图使用 1200×900。</p></div></div>
              {Object.entries(groupedImages).map(([group, images]) => <div className="image-group" key={group}><h3>{group}<span>{images?.length || 0} 张</span></h3><div className="image-grid">
                {images?.map((image) => { const index = content.images.findIndex((item) => item.id === image.id); return <article className="panel image-card" key={image.id}><div><small>{image.id}</small><b>{image.label}</b></div><ImagePicker value={image.url} onChange={(value) => update((draft) => { draft.images[index].url = value; })} /></article>; })}
              </div></div>)}
            </section>
          )}

          {active === 'socials' && (
            <section>
              <div className="section-heading row"><div><span>SOCIAL LINKS</span><h2>社媒链接</h2><p>填写完整网址；留空时前台图标保留但不可点击。</p></div><button className="button button-primary" onClick={() => update((draft) => draft.socials.push({ id: makeId('social'), label: '新平台', url: '' }))}>+ 添加社媒</button></div>
              <div className="stack-list">
                {content.socials.map((social, index) => <article className="panel form-row social-row" key={social.id}>
                  <Field label="平台名称" value={social.label} onChange={(value) => update((draft) => { draft.socials[index].label = value; })} />
                  <Field label="链接地址" value={social.url} onChange={(value) => update((draft) => { draft.socials[index].url = value; })} placeholder="https://..." />
                  <button className="button button-danger" onClick={() => window.confirm('确定删除这个社媒链接吗？') && update((draft) => { draft.socials.splice(index, 1); })}>删除</button>
                </article>)}
              </div>
            </section>
          )}
        </div>
      </section>

      {product && (
        <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setEditingProduct(null)}>
          <aside className="product-drawer">
            <header><div><span>PRODUCT EDITOR</span><h2>{product.name}</h2></div><button onClick={() => setEditingProduct(null)} aria-label="关闭">×</button></header>
            <div className="drawer-body">
              <Field label="产品名称" value={product.name} onChange={(value) => update((draft) => { const item = draft.products.find((candidate) => candidate.id === product.id); if (item) item.name = value; })} />
              <label className="admin-field"><span>产品类目</span><select value={product.categoryId} onChange={(event) => update((draft) => { const item = draft.products.find((candidate) => candidate.id === product.id); if (item) item.categoryId = event.target.value; })}>{content.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <div className="drawer-image"><span>产品缩略图</span><ImagePicker value={product.thumbnail} onChange={(value) => update((draft) => { const item = draft.products.find((candidate) => candidate.id === product.id); if (item) item.thumbnail = value; })} /></div>
              <label className="admin-field"><span>详情 HTML</span><textarea value={product.descriptionHtml} onChange={(event) => update((draft) => { const item = draft.products.find((candidate) => candidate.id === product.id); if (item) item.descriptionHtml = event.target.value; })} rows={14} placeholder="支持 HTML 内容" /></label>
            </div>
            <footer><button className="button button-danger" onClick={() => removeProduct(product.id)}>删除产品</button><button className="button button-primary" onClick={() => setEditingProduct(null)}>完成编辑</button></footer>
          </aside>
        </div>
      )}
    </main>
  );
}
