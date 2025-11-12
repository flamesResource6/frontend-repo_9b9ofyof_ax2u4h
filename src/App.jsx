import { useEffect, useState } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'

// Small header
function Header() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">Foodie</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/test" className="hover:text-blue-600">Status</Link>
          {user?.is_verified ? (
            <span className="px-3 py-1 rounded bg-green-100 text-green-700">Verified</span>
          ) : (
            <Link to="/auth" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Login</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

// Home page - restaurants and products
function HomePage() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [restaurants, setRestaurants] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch(`${baseUrl}/restaurants`),
          fetch(`${baseUrl}/products`),
        ])
        const [r, p] = await Promise.all([rRes.json(), pRes.json()])
        setRestaurants(r)
        setProducts(p)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">Discover great food near you</h1>
          <p className="text-gray-600 mt-2">Browse restaurants and popular dishes</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Restaurants</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((r) => (
                <Link key={r.id} to={`/restaurant/${r.id}`} className="group block rounded-lg overflow-hidden border hover:shadow-md transition">
                  <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{r.name}</h3>
                      <span className="text-sm px-2 py-0.5 rounded bg-green-100 text-green-700">{r.rating ?? '4.5'}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{r.description}</p>
                    {r.cuisine && <p className="text-xs text-gray-500 mt-1">{r.cuisine}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Popular Dishes</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group block rounded-lg overflow-hidden border hover:shadow-md transition">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold">${p.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{p.tags?.join(', ')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthPage() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const sendOtp = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${baseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP')
      setStep('otp')
      setMessage('OTP sent. Use 1234 for demo.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const res = await fetch(`${baseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP')
      localStorage.setItem('user', JSON.stringify(data.user))
      setMessage('Verified! Redirecting...')
      setTimeout(() => navigate('/'), 800)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4">
      <div className="w-full max-w-md border rounded-xl p-6 shadow-sm bg-white">
        <h2 className="text-2xl font-bold mb-2">Login with mobile</h2>
        <p className="text-gray-600 mb-6">We will send you a one-time password.</p>

        {step === 'phone' && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Mobile number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. +15554443333" className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">Send OTP</button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Enter OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="1234" className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded">Verify</button>
            <button type="button" onClick={() => setStep('phone')} className="w-full text-blue-600 hover:underline text-sm">Change number</button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  )
}

function ProductDetail() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [product, setProduct] = useState(null)
  const id = location.pathname.split('/').pop()
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${baseUrl}/products/${id}`)
      if (res.ok) setProduct(await res.json())
    }
    load()
  }, [id])
  if (!product) return <div className="max-w-4xl mx-auto px-4 py-10">Loading...</div>
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden">
          {product.image && <img src={product.image} alt={product.title} className="w-full h-full object-cover" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">${product.price?.toFixed(2)}</span>
            {product.tags?.length > 0 && (
              <span className="text-sm text-gray-500">{product.tags.join(', ')}</span>
            )}
          </div>
          {product.restaurant_id && (
            <Link to={`/restaurant/${product.restaurant_id}`} className="inline-block mt-6 text-blue-600 hover:underline">View restaurant</Link>
          )}
        </div>
      </div>
    </div>
  )
}

function RestaurantDetail() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [restaurant, setRestaurant] = useState(null)
  const [items, setItems] = useState([])
  const id = location.pathname.split('/').pop()
  useEffect(() => {
    const load = async () => {
      const [rRes, pRes] = await Promise.all([
        fetch(`${baseUrl}/restaurants/${id}`),
        fetch(`${baseUrl}/restaurants/${id}/products`),
      ])
      if (rRes.ok) setRestaurant(await rRes.json())
      if (pRes.ok) setItems(await pRes.json())
    }
    load()
  }, [id])
  if (!restaurant) return <div className="max-w-6xl mx-auto px-4 py-10">Loading...</div>
  return (
    <div>
      <div className="relative">
        <div className="h-56 bg-gray-100">
          {restaurant.image && <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />}
        </div>
        <div className="max-w-6xl mx-auto px-4 -mt-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600 mt-1">{restaurant.description}</p>
            <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="group block rounded-lg overflow-hidden border hover:shadow-md transition">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">${p.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">{p.tags?.join(', ')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
      </Routes>
    </div>
  )
}
