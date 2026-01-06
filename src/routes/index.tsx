import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Search,
  SlidersHorizontal,
  Coffee,
  GlassWater,
  Utensils,
  Cookie,
  Star,
  Plus,
  Minus,
  X,
  Menu as MenuIcon,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import productData from '../data/produk.json'

export const Route = createFileRoute('/')({ component: App })

// Helper to format price
const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`

// Category Icon Mapping
const categoryIcons: Record<string, any> = {
  RECOMMENDED: Star,
  MONOLOG_SIGNATURE: Coffee,
  TEA_SERIES: GlassWater,
  WARM_MEAL: Utensils,
  MILKSHAKE_SERIES: GlassWater,
  ESPRESSO_BASED: Coffee,
  MAIN_COURSE: Utensils,
  REFRESHER: GlassWater,
  FLAVOURED_LATTE: Coffee,
  YAKULT_SERIES: GlassWater,
  SNACK: Cookie,
  ADD_ON: Plus
}

const categoryColors: Record<string, string> = {
  RECOMMENDED: 'bg-indigo-100 text-indigo-600',
  MONOLOG_SIGNATURE: 'bg-orange-100 text-orange-600',
  TEA_SERIES: 'bg-blue-100 text-blue-600',
  WARM_MEAL: 'bg-red-100 text-red-600',
  MILKSHAKE_SERIES: 'bg-pink-100 text-pink-600',
  ESPRESSO_BASED: 'bg-orange-100 text-orange-600',
  MAIN_COURSE: 'bg-red-100 text-red-600',
  REFRESHER: 'bg-yellow-100 text-yellow-600',
  FLAVOURED_LATTE: 'bg-orange-100 text-orange-600',
  YAKULT_SERIES: 'bg-red-50 text-red-500',
  SNACK: 'bg-yellow-100 text-yellow-600',
  ADD_ON: 'bg-gray-100 text-gray-600'
}

interface ProductCardProps {
  product: any;
  category: string;
  onAdd: (product: any, category: string) => void;
  icon?: any;
}

const ProductCard = ({ product, category, onAdd, icon: Icon }: ProductCardProps) => {
  return (
    <div className='bg-white rounded-[22px] p-2 flex gap-3 h-[127px] items-center overflow-hidden'>
      <div className="w-[114px] h-full shrink-0 rounded-[20px] overflow-hidden bg-gray-100 relative">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${categoryColors[category] || 'bg-gray-100'} bg-opacity-20`}>
            {Icon ? <Icon className="w-8 h-8 opacity-50" /> : <Utensils className="w-8 h-8 opacity-50" />}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between h-full py-1">
        <div>
          <div className="flex justify-between items-start">
            {product.isBestSeller && (
              <div className="bg-bg-badge px-2.5 py-1.5 flex items-center rounded-full">
                <span className="text-text-badge text-[10px] font-bold">Best Seller</span>
              </div>
            )}
            {product.rating && (
              <div className="flex items-center gap-1 text-xs text-gray-500 font-medium ml-auto">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {product.rating}
              </div>
            )}
          </div>
          <h3 className="font-bold text-text-title mt-2 text-[16px] leading-tight line-clamp-2">{product.name}</h3>
          {product.description && !product.isBestSeller && <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>}
        </div>
        <div className="flex justify-between items-end">
          <p className="font-bold text-dark text-[18px] mb-1">{formatPrice(product.price)}</p>
          <button
            onClick={() => onAdd(product, category)}
            className="w-[69px] h-[46px] bg-primary rounded-full flex items-center justify-center text-white hover:bg-opacity-90 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
  const [cart, setCart] = useState<any[]>([])

  // Customization State
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [temperature, setTemperature] = useState<'Hot' | 'Ice'>('Ice')
  const [sugarLevel, setSugarLevel] = useState<'Normal' | 'Less' | 'None'>('Normal')
  const [shots, setShots] = useState<'None' | 'Shot' | 'Double'>('None')
  const [toppings, setToppings] = useState<string[]>([])

  // Derived check for product type
  const isCoffee = (category: string) =>
    ['MONOLOG_SIGNATURE', 'ESPRESSO_BASED', 'FLAVOURED_LATTE', 'RECOMMENDED'].includes(category)

  const isDrink = (category: string) =>
    isCoffee(category) || ['TEA_SERIES', 'MILKSHAKE_SERIES', 'REFRESHER', 'YAKULT_SERIES'].includes(category)

  const openProductDrawer = (product: any, category: string) => {
    setSelectedProduct({ ...product, category })
    setQuantity(1)
    setNotes('')
    setTemperature('Ice')
    setSugarLevel('Normal')
    setShots('None')
    setToppings([])
  }

  const addToCart = () => {
    if (!selectedProduct) return
    const item = {
      ...selectedProduct,
      quantity,
      notes,
      customizations: {
        temperature: isCoffee(selectedProduct.category) ? temperature : undefined,
        sugarLevel: isCoffee(selectedProduct.category) ? sugarLevel : undefined,
        shots: isCoffee(selectedProduct.category) ? shots : undefined,
        toppings: isDrink(selectedProduct.category) ? toppings : undefined
      }
    }
    setCart(prev => [...prev, item])
    setSelectedProduct(null)
  }

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(category)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsCategoryDrawerOpen(false)
    }
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // Recommendations data removed in favor of JSON data

  return (
    <div className="min-h-screen flex flex-col font-sans pb-32 bg-[#F5F4F7]">
      {/* Search and Filter Section */}
      <section className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border-none rounded-full bg-white text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search your food..."
            />
          </div>
          <button className="flex-none w-12 h-12 bg-dark rounded-full flex items-center justify-center text-white hover:bg-opacity-90 transition-all active:scale-95">
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Promo Banners */}
      <section className="pt-6 pl-4 max-w-7xl mx-auto w-full">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pr-4 no-scrollbar">
          <div className="flex-none w-80 h-40 rounded-2xl overflow-hidden snap-center relative transform transition-transform hover:scale-[1.02]">
            <img src="/banner-1.png" alt="Promo" className="w-full h-full object-cover" />
          </div>
          <div className="flex-none w-80 h-40 rounded-2xl overflow-hidden snap-center relative transform transition-transform hover:scale-[1.02]">
            <img src="/banner-2.png" alt="Promo" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Categories Pills (Top Filter) */}
      <section className="pt-1.5 px-3 max-w-7xl mx-auto w-full sticky top-0 z-40 bg-[#F5F4F7]/90 backdrop-blur-sm py-2">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {Object.keys(productData).filter(c => c !== 'RECOMMENDED').map((category, index) => {
            const Icon = categoryIcons[category] || Utensils
            return (
              <button
                key={index}
                onClick={() => scrollToCategory(category)}
                className="flex-none flex items-center bg-white rounded-full p-1 pr-6 border border-gray-100 cursor-pointer hover:border-primary transition-all whitespace-nowrap"
              >
                <div className={`w-10 h-10 rounded-full ${categoryColors[category] || 'bg-gray-100'} flex items-center justify-center mr-3 shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-dark text-sm capitalize">{category.replace(/_/g, ' ').toLowerCase()}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recommended Section */}
      {(productData as any).RECOMMENDED && (
        <section className="pt-4 px-4 max-w-7xl mx-auto w-full">
          <div className='flex items-center justify-between'>
            <h2 className="text-lg font-bold text-dark mb-3">Recommend For You</h2>
            <button className="text-sm text-primary font-medium">See All</button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {(productData as any).RECOMMENDED.map((product: any, idx: number) => (
              <ProductCard
                key={idx}
                product={product}
                category="RECOMMENDED"
                onAdd={openProductDrawer}
                icon={Star}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Product Sections */}
      <div className="space-y-8 mt-8 px-4 max-w-7xl mx-auto w-full">
        {Object.entries(productData).filter(([key]) => key !== 'RECOMMENDED').map(([category, products]) => (
          <section id={category} key={category} className="scroll-mt-20">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-dark capitalize">{category.replace(/_/g, ' ').toLowerCase()}</h2>
              <div className="h-0.5 bg-gray-200 flex-1 ml-2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(products as any[]).map((product, idx) => (
                <ProductCard
                  key={idx}
                  product={product}
                  category={category}
                  onAdd={openProductDrawer}
                  icon={categoryIcons[category]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Menu Button */}
      <button
        onClick={() => setIsCategoryDrawerOpen(true)}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30 bg-dark text-white p-2 pl-3 rounded-full shadow-xl flex items-center gap-3 pr-5 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/20"
      >
        <div className="bg-white/20 p-2 rounded-full animate-pulse-slow">
          <MenuIcon className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm tracking-wide">Menu Categories</span>
      </button>

      {/* Floating Cart Notification */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-40 p-4 bg-linear-to-t from-[#F5F4F7] to-transparent pointer-events-none flex justify-center">
          <button
            onClick={() => {
              localStorage.setItem('monolog-cart', JSON.stringify(cart))
              navigate({ to: '/order-summary' })
            }}
            className="pointer-events-auto bg-primary text-white w-full max-w-md rounded-2xl p-4 shadow-xl shadow-primary/20 flex justify-between items-center transform transition-all active:scale-95 hover:shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex flex-col items-start translate-x-0 transition-transform group-hover:translate-x-1">
              <span className="text-xs font-medium opacity-90">{totalItems} Items</span>
              <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center gap-2 font-bold group">
              Order Now <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      )}

      {/* Category Menu Drawer */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsCategoryDrawerOpen(false)}
          ></div>

          {/* Drawer Content */}
          <div className="bg-white w-full max-w-md rounded-t-[32px] max-h-[85vh] relative z-10 flex flex-col animate-in slide-in-from-bottom duration-300 ease-out shadow-2xl">
            <div className="p-6 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 opacity-50"></div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-dark">Menu Categories</h2>
                <button
                  onClick={() => setIsCategoryDrawerOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors active:scale-90"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 pt-0 no-scrollbar space-y-3 pb-safe-bottom">
              {Object.keys(productData).map((category, index) => {
                const Icon = categoryIcons[category] || Utensils
                const count = (productData as any)[category].length
                return (
                  <button
                    key={category}
                    onClick={() => scrollToCategory(category)}
                    className="w-full flex items-center p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all border border-transparent hover:border-gray-100 text-left group active:scale-[0.98]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-full ${categoryColors[category]} flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-dark capitalize text-base group-hover:text-primary transition-colors">{category.replace(/_/g, ' ').toLowerCase()}</h3>
                      <p className="text-sm text-gray-500">{count} products</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Drawer */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="bg-white rounded-t-[32px] w-full max-w-lg p-6 relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

            <div className="flex gap-5 mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
                <div className={`w-full h-full flex items-center justify-center bg-opacity-20 bg-gray-200`}>
                  <Utensils className="w-8 h-8 opacity-30 text-dark" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-dark">{selectedProduct.name}</h3>
                <p className="text-primary font-bold text-lg mt-1">{formatPrice(selectedProduct.price)}</p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{selectedProduct.description || 'No description available.'}</p>
              </div>
            </div>

            {/* Customizations based on category */}
            {isCoffee(selectedProduct.category) && (
              <div className="space-y-6 border-t border-gray-100 pt-6">
                <div>
                  <h4 className="font-bold text-dark mb-3">Temperature</h4>
                  <div className="flex gap-3">
                    {['Hot', 'Ice'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setTemperature(opt as any)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${temperature === opt ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-3">Sugar Level</h4>
                  <div className="flex gap-3">
                    {['Normal', 'Less', 'None'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSugarLevel(opt as any)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${sugarLevel === opt ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-dark mb-3">Extra Shot</h4>
                  <div className="flex gap-3">
                    {['None', 'Shot', 'Double'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setShots(opt as any)}
                        className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${shots === opt ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500'}`}
                      >
                        {opt === 'None' ? 'No Extra' : opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isDrink(selectedProduct.category) && (
              <div className="space-y-6 pt-6">
                <div>
                  <h4 className="font-bold text-dark mb-3">Toppings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['Messes', 'Jelly Coffee'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setToppings(prev => prev.includes(opt) ? prev.filter(t => t !== opt) : [...prev, opt])
                        }}
                        className={`py-2 px-4 rounded-xl border text-sm font-bold text-left transition-all ${toppings.includes(opt) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-dark mb-3">Add Note</h4>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 rounded-xl p-4 text-sm text-dark focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                placeholder="Example: No onion, spicy sauce..."
              ></textarea>
            </div>

            <div className="mt-8 flex gap-4 items-center pb-4">
              <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-dark shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-dark w-4 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                className="flex-1 bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 flex justify-center items-center gap-2"
                onClick={addToCart}
              >
                Add - {formatPrice(selectedProduct.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
