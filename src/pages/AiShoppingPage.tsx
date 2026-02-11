import { useState, useEffect, useCallback, useRef } from 'react'
import SmartSuggestOrb from '../components/SmartSuggestOrb'
import ProductOrb from '../components/ProductOrb'
import Badge from '../components/Badge'
import { RiTruckLine, RiArrowGoBackLine, RiPlantLine, RiFacebookFill, RiTwitterXFill, RiInstagramFill, RiArrowRightLine } from '@remixicon/react'

export default function AiShoppingPage() {
  const [showOrb, setShowOrb] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<number | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  const [isOrbExpanded, setIsOrbExpanded] = useState(false)
  
  // Idle state nudge
  const [showHelpOrb, setShowHelpOrb] = useState(false)
  const [helpOrbExpanded, setHelpOrbExpanded] = useState(false)
  const idleTimerRef = useRef<number | null>(null)
  
  // Product data with all details for each product
  const products = [
    {
      src: '/asam on table3.png',
      alt: 'Assam tea on table',
      label: 'Assam Tea',
      name: 'Assam Breakfast Blend',
      description: 'A robust, full-bodied black tea, perfect for the open road.',
      price: 24.99,
      originalPrice: 32.99,
      discount: 25,
      sizes: ['50g', '100g', '250g'],
      formats: ['Loose Leaf', 'Tea Bags'],
      highlights: [
        'Robust and full-bodied black tea',
        'Perfect for morning energy',
        'Rich and malty flavor',
        'Hand-picked from Assam gardens'
      ],
      fullDescription: 'Fuel your day with this robust, full-bodied black tea, perfect for the open road. This Assam Breakfast Blend delivers a strong, malty flavor that provides the perfect morning boost. Hand-picked from the finest Assam gardens, it offers a rich and invigorating experience that tea enthusiasts love.'
    },
    {
      src: '/sample2.png', 
      alt: 'Brewed Earl Grey tea in elegant cup',
      label: 'Brewed Tea',
      name: 'Mint Revitalizer Herblizer',
      description: 'A refreshing, caffeine-free blend to recharge your engine.',
      price: 19.99,
      originalPrice: 24.99,
      discount: 20,
      sizes: ['50g', '100g', '200g'],
      formats: ['Herbal Infusion', 'Tea Bags'],
      highlights: [
        'Caffeine-free herbal blend',
        'Refreshing mint flavor',
        'Natural herbal ingredients',
        'Perfect for any time of day'
      ],
      fullDescription: 'Recharge your engine with our Mint Revitalizer Herblizer, a refreshing caffeine-free herbal infusion. This blend combines premium mint leaves with other natural herbs to create a revitalizing experience that energizes without caffeine.'
    },
    {
      src: '/sample.png',
      alt: 'Premium tea packaging and bergamot',
      label: 'Packaging',
      name: 'Spicy Masala Chai Concentrate',
      description: 'A spicy, aromatic blend for a powerful boost.',
      price: 22.99,
      originalPrice: 28.99,
      discount: 21,
      sizes: ['100g', '200g', '500g'],
      formats: ['Concentrate', 'Tea Bags'],
      highlights: [
        'Spicy masala blend',
        'Aromatic chai spices',
        'Concentrated flavor',
        'Perfect for traditional chai'
      ],
      fullDescription: 'Fuel your day with our Spicy Masala Chai Concentrate, a powerful blend of aromatic spices and premium tea. This concentrated mix delivers the authentic taste of traditional Indian masala chai, perfect for those who love bold, spicy flavors.'
    },
    {
      src: '/asamontablfull.png',
      alt: 'Assam tea full view on table',
      label: 'Assam Full View',
      name: 'Assam Breakfast Blend',
      description: 'A robust, full-bodied black tea, perfect for the open road.',
      price: 24.99,
      originalPrice: 32.99,
      discount: 25,
      sizes: ['50g', '100g', '250g'],
      formats: ['Loose Leaf', 'Tea Bags'],
      highlights: [
        'Robust and full-bodied black tea',
        'Perfect for morning energy',
        'Rich and malty flavor',
        'Hand-picked from Assam gardens'
      ],
      fullDescription: 'Fuel your day with this robust, full-bodied black tea, perfect for the open road. This Assam Breakfast Blend delivers a strong, malty flavor that provides the perfect morning boost. Hand-picked from the finest Assam gardens, it offers a rich and invigorating experience that tea enthusiasts love.'
    }
  ]
  
  // Selected product state - default to first Assam image
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)
  // Which product context to show in orb (main/thumb hover)
  const [hoveredProductIndex, setHoveredProductIndex] = useState<number>(0)
  // Orb on Other Products section
  const [showOrbOther1, setShowOrbOther1] = useState(false)
  const [showOrbOther2, setShowOrbOther2] = useState(false)
  const [expandedOrbSource, setExpandedOrbSource] = useState<'main' | 'other1' | 'other2' | null>(null)
  const hoverTimeoutOther1Ref = useRef<number | null>(null)
  const hoverTimeoutOther2Ref = useRef<number | null>(null)
  
  // Fixed product for pricing and content - always show Assam Breakfast Blend
  const fixedProduct = {
    name: 'Assam Breakfast Blend',
    description: 'Fuel your day with this robust, full-bodied black tea, perfect for the open road.',
    price: 24.99,
    originalPrice: 32.99,
    discount: 25,
    sizes: ['50g', '100g', '250g'],
    formats: ['Loose Leaf', 'Tea Bags'],
    highlights: [
      'Robust and full-bodied black tea',
      'Perfect for morning energy',
      'Rich and malty flavor',
      'Hand-picked from Assam gardens'
    ],
    fullDescription: 'Fuel your day with this robust, full-bodied black tea, perfect for the open road. This Assam Breakfast Blend delivers a strong, malty flavor that provides the perfect morning boost. Hand-picked from the finest Assam gardens, it offers a rich and invigorating experience that tea enthusiasts love.'
  }
  
  // Section orbs temporarily removed - see SECTION_ORBS_BACKUP.md

  // Smart Suggest Orb hover handlers (optional thumbnail index for context). Only one orb at a time.
  const handleProductImageHover = (thumbIndex?: number) => {
    setHoveredProductIndex(thumbIndex ?? selectedProductIndex)
    setIsHoveringAnySection(true)
    if (showHelpOrb && !helpOrbExpanded) setShowHelpOrb(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    const timeout = window.setTimeout(() => {
      setShowOrbOther1(false)
      setShowOrbOther2(false)
      setShowOrb(true)
    }, 800)
    hoverTimeoutRef.current = timeout
    setHoverTimeout(timeout)
  }

  const handleProductImageLeave = () => {
    setIsHoveringAnySection(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    if (!isOrbExpanded) setShowOrb(false)
  }

  const handleCloseSmartOrb = () => {
    setShowOrb(false)
    setIsOrbExpanded(false)
    setExpandedOrbSource(null)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  const handleOrbExpanded = (expanded: boolean) => {
    setIsOrbExpanded(expanded)
  }

  const handleOtherProduct1Hover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoverTimeout(null)
    if (hoverTimeoutOther1Ref.current) clearTimeout(hoverTimeoutOther1Ref.current)
    hoverTimeoutOther1Ref.current = window.setTimeout(() => {
      setShowOrb(false)
      setShowOrbOther2(false)
      setShowOrbOther1(true)
    }, 800)
  }
  const handleOtherProduct1Leave = () => {
    if (hoverTimeoutOther1Ref.current) {
      clearTimeout(hoverTimeoutOther1Ref.current)
      hoverTimeoutOther1Ref.current = null
    }
    if (expandedOrbSource !== 'other1') setShowOrbOther1(false)
  }
  const handleOtherProduct2Hover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoverTimeout(null)
    if (hoverTimeoutOther2Ref.current) clearTimeout(hoverTimeoutOther2Ref.current)
    hoverTimeoutOther2Ref.current = window.setTimeout(() => {
      setShowOrb(false)
      setShowOrbOther1(false)
      setShowOrbOther2(true)
    }, 800)
  }
  const handleOtherProduct2Leave = () => {
    if (hoverTimeoutOther2Ref.current) {
      clearTimeout(hoverTimeoutOther2Ref.current)
      hoverTimeoutOther2Ref.current = null
    }
    if (expandedOrbSource !== 'other2') setShowOrbOther2(false)
  }

  // Track if user is hovering over any interactive area
  const [isHoveringAnySection, setIsHoveringAnySection] = useState(false)
  
  // Handle user activity for idle detection  
  const handleActivity = useCallback(() => {
    // Only hide help orb if not expanded (respect user's active engagement)
    if (!helpOrbExpanded) {
      setShowHelpOrb(false)
    }
    
    // Clear existing idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
    
    // Set new idle timer - only if no other orbs are active and not hovering anywhere
    idleTimerRef.current = setTimeout(() => {
      // Only show help orb if no other orbs are active and not hovering on any section
      const anyOrbActive = showOrb || showOrbOther1 || showOrbOther2
      if (!anyOrbActive && !isHoveringAnySection) {
        setShowHelpOrb(true)
      }
    }, 2000) // 2 seconds
  }, [helpOrbExpanded, showOrb, showOrbOther1, showOrbOther2, isHoveringAnySection])


  // Handle help orb close
  const handleCloseHelpOrb = () => {
    setShowHelpOrb(false)
    setHelpOrbExpanded(false)
  }

  // Handle help orb expansion
  const handleHelpOrbExpanded = (expanded: boolean) => {
    setHelpOrbExpanded(expanded)
  }

  // Section handlers temporarily removed - see SECTION_ORBS_BACKUP.md

  // Set up activity listeners
  useEffect(() => {
    const events = ['scroll', 'click', 'keydown'] // Removed mousemove - let mouse movement be allowed during idle
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    // Start initial timer
    handleActivity()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [handleActivity])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
      // Section orb cleanup removed - see SECTION_ORBS_BACKUP.md
    }
  }, [])


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation breadcrumb */}
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <nav className="flex text-sm text-gray-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Assam Breakfast Blend</span>
          </nav>
        </div>
      </div>

      {/* Main Shopify Product Page */}
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Product Images - 7 columns */}
            <div className="lg:col-span-7">
              <div className="space-y-4">
                {/* Main product image with Smart Suggest Orb */}
                <div 
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative"
                  onMouseEnter={() => handleProductImageHover(selectedProductIndex)}
                  onMouseLeave={handleProductImageLeave}
                >
                  <img 
                    src={products[selectedProductIndex].src}
                    alt={products[selectedProductIndex].alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Product Orb positioned on image */}
                  <ProductOrb 
                    isVisible={showOrb}
                    onClose={handleCloseSmartOrb}
                    onExpanded={(exp) => {
                      handleOrbExpanded(exp)
                      setExpandedOrbSource(exp ? 'main' : null)
                    }}
                    productName={products[hoveredProductIndex]?.name}
                    productDescription={products[hoveredProductIndex]?.description}
                    productImage={products[hoveredProductIndex]?.src}
                  />
                </div>
                
                {/* Thumbnail images */}
                <div className="grid grid-cols-4 gap-3">
                  {products.map((product, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedProductIndex(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden transition-all group relative ${
                        selectedProductIndex === idx 
                          ? 'ring-2 ring-gray-800' 
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onMouseEnter={() => handleProductImageHover(idx)}
                      onMouseLeave={handleProductImageLeave}
                      title={product.label}
                    >
                      <img 
                        src={product.src} 
                        alt={product.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVhcmwgR3JleSBUZWE8L3RleHQ+PC9zdmc+';
                          target.alt = `${product.label} - Tea`;
                        }}
                        loading="lazy"
                      />
                      
                      {/* Subtle label overlay on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="p-2">
                          <span className="text-white text-xs font-medium">{product.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details - 5 columns */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product title and price */}
              <div className="p-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fixedProduct.name}</h1>
                <p className="text-sm text-gray-600 mb-4">{fixedProduct.description}</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-gray-900">${fixedProduct.price.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">${fixedProduct.originalPrice.toFixed(2)}</span>
                  <Badge variant="warning" className="bg-gray-100 text-gray-800 px-2 py-1 text-xs">{fixedProduct.discount}% OFF</Badge>
                </div>
              </div>

              {/* Product options - Unified hover area */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Options</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <div className={`grid gap-2 ${fixedProduct.sizes.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {fixedProduct.sizes.map((size, idx) => (
                        <button 
                          key={size} 
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            idx === 1 ? 'border-gray-800 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {fixedProduct.formats.map((format, idx) => (
                        <button 
                          key={format} 
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            idx === 0 ? 'border-gray-800 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center border border-gray-300 rounded-lg w-32">
                      <button className="p-2 hover:bg-gray-100 transition-colors">-</button>
                      <span className="flex-1 text-center py-2 border-x border-gray-300">1</span>
                      <button className="p-2 hover:bg-gray-100 transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to cart actions - Unified hover area */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase</h3>
                
                <div className="space-y-3">
                  <button className="w-full py-3 text-lg font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors">
                    Add to Cart - ${fixedProduct.price.toFixed(2)}
                  </button>
                  <button className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Buy it now
                  </button>
                </div>
              </div>

              {/* Product highlights - Unified hover area */}
              <div className="border-t border-gray-200 pt-6">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Highlights</h3>
                  
                  <ul className="space-y-2">
                    {fixedProduct.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Trust indicators - Unified hover area */}
              <div className="border-t border-gray-200 pt-6">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust & Policies</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <RiTruckLine size={16} className="text-green-600" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiArrowGoBackLine size={16} className="text-green-600" />
                      <span>30-day return policy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiPlantLine size={16} className="text-green-600" />
                      <span>Organic certified & ethically sourced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className="mt-16 border-t border-gray-200">
            <div className="">
              <h2 className="text-5xl font-serif text-center text-gray-900 mt-6 mb-6 tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '0.05em' }}>Description</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Text */}
                <div className="text-left">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Assam Breakfast Blend</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Fuel your day with this robust, full-bodied black tea, perfect for the open road. This Assam Breakfast Blend delivers a strong, malty flavor that provides the perfect morning boost. Hand-picked from the finest Assam gardens, it offers a rich and invigorating experience that tea enthusiasts love.
                  </p>
                </div>
                
                {/* Right side - Image */}
                <div className="w-full overflow-hidden rounded-lg bg-transparent" style={{ height: '400px', backgroundColor: 'transparent' }}>
                  <img 
                    src="/asam on table.png"
                    alt="Assam tea on table"
                    className="w-full h-full object-cover rounded-lg"
                    style={{ objectPosition: 'center center', transform: 'scale(1.2)', backgroundColor: 'transparent' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients section */}
          <div className="mt-16 border-t border-gray-200">
            <div className="">
              <h2 className="text-5xl font-serif text-center text-gray-900 mt-6 mb-6 tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '0.05em' }}>Ingredients</h2>
              
              <div className="grid grid-cols-4 gap-6">
                {/* Col 1 - Cinnamon */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24">
                    <img 
                      src="/patta.png"
                      alt="Cinnamon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Cinnamon</h3>
                    <p className="text-sm text-gray-600">Warm and aromatic spice</p>
                  </div>
                </div>

                {/* Col 2 - Clove */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24">
                    <img 
                      src="/clove.png"
                      alt="Clove"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Clove</h3>
                    <p className="text-sm text-gray-600">Bold and pungent flavor</p>
                  </div>
                </div>

                {/* Col 3 - Ginger */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24">
                    <img 
                      src="/ginger.png"
                      alt="Ginger"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ginger</h3>
                    <p className="text-sm text-gray-600">Spicy and invigorating root</p>
                  </div>
                </div>

                {/* Col 4 - Cardamom */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24">
                    <img 
                      src="/cardomn.png"
                      alt="Cardamom"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Cardamom</h3>
                    <p className="text-sm text-gray-600">Fragrant and sweet pods</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to make chai section - Copy 2 */}
          <div className="mt-16 pt-6 border-t border-gray-200">
            <div className="">
              <div className="flex items-center justify-center gap-4 mb-6">
                <h2 className="text-5xl font-serif text-center text-gray-900 tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '0.05em' }}>How to make chai?</h2>
                <img 
                  src="/chai.png"
                  alt="Chai tea"
                  className="h-12 w-auto"
                />
              </div>
              
              <div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(139, 115, 85, 0.06)', // Calm brown/wood color with 6% opacity
                }}
              >
                {/* Left side - Image */}
                <div className="w-full overflow-hidden rounded-lg" style={{ height: '500px' }}>
                  <img 
                    src="/MAKING.svg"
                    alt="How to make Assam chai"
                    className="w-full h-full object-cover"
                    style={{ 
                      objectPosition: 'center top',
                      objectFit: 'cover',
                      height: '100%'
                    }}
                  />
                </div>
                
                {/* Right side - Steps */}
                <div className="flex flex-col justify-center">
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://in.teabox.com/cdn/shop/files/Step_1.svg?v=1710581456"
                          alt="Step 1"
                          className="w-16 h-16"
                          style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(15%) saturate(800%) hue-rotate(15deg) brightness(95%) contrast(90%)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Boil Water</h3>
                        <p className="text-sm text-gray-600">Bring 1 cup of water to a rolling boil in a saucepan.</p>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://in.teabox.com/cdn/shop/files/Step_2.svg?v=1710581558"
                          alt="Step 2"
                          className="w-16 h-16"
                          style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(15%) saturate(800%) hue-rotate(15deg) brightness(95%) contrast(90%)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Tea & Spices</h3>
                        <p className="text-sm text-gray-600">Add 1-2 teaspoons of tea leaves, crushed cardamom, ginger, and other spices.</p>
                      </div>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://in.teabox.com/cdn/shop/files/Step_3.svg?v=1710581672"
                          alt="Step 3"
                          className="w-16 h-16"
                          style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(15%) saturate(800%) hue-rotate(15deg) brightness(95%) contrast(90%)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Simmer</h3>
                        <p className="text-sm text-gray-600">Reduce heat and let it simmer for 3-5 minutes until the tea is dark and aromatic.</p>
                      </div>
                    </div>
                    
                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://in.teabox.com/cdn/shop/files/Step_4.svg?v=1710581712"
                          alt="Step 4"
                          className="w-16 h-16"
                          style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(15%) saturate(800%) hue-rotate(15deg) brightness(95%) contrast(90%)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Milk & Sugar</h3>
                        <p className="text-sm text-gray-600">Add milk and sugar to taste. Bring to a boil again and let it froth.</p>
                      </div>
                    </div>
                    
                    {/* Step 5 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <img 
                          src="https://in.teabox.com/cdn/shop/files/Chai_Step_5.svg?v=1710581736"
                          alt="Step 5"
                          className="w-16 h-16"
                          style={{ filter: 'brightness(0) saturate(100%) invert(47%) sepia(15%) saturate(800%) hue-rotate(15deg) brightness(95%) contrast(90%)' }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Strain & Serve</h3>
                        <p className="text-sm text-gray-600">Strain the chai into cups and serve hot. Enjoy your perfect cup of chai!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Feature Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-2">
          <div className="mt-16 pt-6 border-t border-gray-200">
            <div className="">
              <div className="flex items-center justify-center gap-4 mb-6">
                <h2 className="text-5xl font-serif text-center text-gray-900 tracking-wide" style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 400, letterSpacing: '0.05em' }}>Other Products</h2>
                <img 
                  src="/bucket.png"
                  alt="Tea bucket"
                  className="h-12 w-auto"
                />
              </div>
              
              <div 
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center rounded-lg p-6"
                style={{ 
                  backgroundColor: 'rgba(139, 115, 85, 0.03)', // Calm brown/wood color with very light opacity
                }}
              >
            {/* Left side - Text (40%) */}
            <div className="lg:col-span-2 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Golden Darjeeling Muscatel</h2>
              <p className="text-base text-gray-700 mb-6">
                A rare first flush with notes of sweet street grapes, a joyride for your senses. 3 packets in one: Golden Darjeeling, Mint Revitalizer, and Spicy Masala.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">$29.99</span>
                <span className="text-lg text-gray-500 line-through">$39.99</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium rounded">25% OFF</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors">
                  Add to Cart
                </button>
                <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors">
                  Buy Now
                </button>
              </div>
            </div>
            
            {/* Right side - Image (60%) - Golden Darjeeling */}
            <div 
              className="w-full lg:col-span-3 p-6 relative"
              onMouseEnter={handleOtherProduct1Hover}
              onMouseLeave={handleOtherProduct1Leave}
            >
              <img 
                src="/asam on table3.png"
                alt="Golden Darjeeling Muscatel"
                className="w-full h-auto object-cover rounded-lg"
              />
              <ProductOrb
                isVisible={showOrbOther1}
                onClose={() => {
                  setShowOrbOther1(false)
                  setExpandedOrbSource(null)
                }}
                onExpanded={(exp) => setExpandedOrbSource(exp ? 'other1' : null)}
                productName="Golden Darjeeling Muscatel"
                productDescription="A rare first flush with notes of sweet street grapes, a joyride for your senses. 3 packets in one: Golden Darjeeling, Mint Revitalizer, and Spicy Masala."
                productImage="/asam on table3.png"
                orbPosition="top-[24px] right-[27px]"
              />
            </div>
              </div>
              
              {/* Second Product - Swapped direction */}
              <div 
                className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center rounded-lg p-6 mt-8"
                style={{ 
                  backgroundColor: 'rgba(139, 115, 85, 0.03)', // Calm brown/wood color with very light opacity
                }}
              >
                {/* Left side - Image (60%) - Assam Breakfast Blend (3-pack) */}
                <div 
                  className="w-full lg:col-span-3 p-6 relative"
                  onMouseEnter={handleOtherProduct2Hover}
                  onMouseLeave={handleOtherProduct2Leave}
                >
                  <img 
                    src="/asamontablfull.png"
                    alt="Assam Breakfast Blend (3-pack)"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  <ProductOrb
                    isVisible={showOrbOther2}
                    onClose={() => {
                      setShowOrbOther2(false)
                      setExpandedOrbSource(null)
                    }}
                    onExpanded={(exp) => setExpandedOrbSource(exp ? 'other2' : null)}
                    productName="Assam Breakfast Blend (3-pack)"
                    productDescription="A robust, full-bodied black tea, perfect for the open road."
                    productImage="/asamontablfull.png"
                  />
                </div>
                
                {/* Right side - Text (40%) */}
                <div className="lg:col-span-2 p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Assam Breakfast Blend (3-pack)</h2>
                  <p className="text-base text-gray-700 mb-6">
                    A robust, full-bodied black tea, perfect for the open road.
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-gray-900">$24.99</span>
                    <span className="text-lg text-gray-500 line-through">$32.99</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium rounded">25% OFF</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors">
                      Add to Cart
                    </button>
                    <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/logofull.png" 
              alt="teagarage" 
              className="h-24 w-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Visit Us Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Visit Us</h3>
              <div className="space-y-1.5 text-sm text-gray-700">
                <p>teagarage</p>
                <p>Idukki</p>
                <p className="mt-3">Phone / Whatsapp: +91 97330 61444</p>
                <p>Email: help@teagarage.com</p>
              </div>
            </div>

            {/* Need Help? Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Need Help?</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">About teagarage</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Shop Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Shop</h3>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Tea</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Trial Packs</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Teaware</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Gifts</a></li>
              </ul>
            </div>

            {/* Let's Be Friends Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Let's Be Friends</h3>
              <p className="text-sm text-gray-700 mb-3">
                Discover exclusive access to early sales, captivating offers, and tantalizing exotic tea recipes! Unsubscribe anytime
              </p>
              <form className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="E-mail"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 text-sm"
                />
                <button
                  type="submit"
                  className="p-2 bg-gray-900 hover:bg-gray-800 rounded transition-colors"
                  aria-label="Subscribe"
                >
                  <RiArrowRightLine size={18} className="text-white" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-300 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors" aria-label="Facebook">
                <RiFacebookFill size={20} />
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors" aria-label="Twitter">
                <RiTwitterXFill size={20} />
              </a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors" aria-label="Instagram">
                <RiInstagramFill size={20} />
              </a>
            </div>
            <div className="text-xs text-gray-600 text-center md:text-right">
              <p>© 2026, teagarage. Powered by Shopify</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Help Orb - Right Side */}
      {showHelpOrb && !showOrb && (
        <div className="fixed top-1/2 z-50 transform -translate-y-1/2" 
             style={{ 
               right: helpOrbExpanded ? '20px' : '20px', // Responsive positioning for small screens
               transition: 'right 0.3s ease-out'
             }}>
          <SmartSuggestOrb 
            isVisible={showHelpOrb}
            onClose={handleCloseHelpOrb}
            onExpanded={handleHelpOrbExpanded}
            productCategory="tea"
            isOnProduct={false}
            mode="help"
            showTooltipImmediately={true}
          />
        </div>
      )}


      <style>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
          }
          
          20% {
            transform: scale3d(1.1, 1.1, 1.1);
          }
          
          40% {
            transform: scale3d(0.9, 0.9, 0.9);
          }
          
          60% {
            opacity: 1;
            transform: scale3d(1.03, 1.03, 1.03);
          }
          
          80% {
            transform: scale3d(0.97, 0.97, 0.97);
          }
          
          100% {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }

        .bounce-in {
          animation: bounceIn 0.75s;
        }
      `}</style>
    </div>
  )
}
