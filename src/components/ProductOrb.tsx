import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  RiSparklingFill, 
  RiCloseLine, 
  RiMicLine, 
  RiSendPlaneLine,
  RiBrainLine,
  RiUser3Line,
  RiLoader2Line
} from '@remixicon/react'

// Add fade-in animation styles and pulse animation
const fadeInAnimation = `
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

@keyframes pulse-orb {
  0% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
}

.glass-orb-container {
  position: relative;
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 2px 4px rgba(16,24,32,0.08));
}

.glass-orb-container::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(144,238,144,0.5);
  animation: pulse-orb 2.5s infinite;
  z-index: 0;
}

.glass-orb-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
`

// Add the styles to the document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = fadeInAnimation
  document.head.appendChild(styleSheet)
}

interface ProductOrbProps {
  isVisible: boolean
  onClose: () => void
  onExpanded?: (expanded: boolean) => void
  productName?: string
  productDescription?: string
  productImage?: string
}

interface ConversationMessage {
  id: string
  type: 'user' | 'result' | 'error'
  content: string
  timestamp: number
  isTyping?: boolean
  icon?: React.ComponentType<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ProductOrb({
  isVisible,
  onClose,
  onExpanded,
  productName,
  productDescription,
  productImage
}: ProductOrbProps) {
  const placeholder = productName
    ? `Ask about ${productName}...`
    : 'Ask about this tea...'
  const [showTooltip, setShowTooltip] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Voice and conversation states
  const [inputText, setInputText] = useState('')
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([])
  const [isInConversation, setIsInConversation] = useState(false)
  const [isVoiceRecording, setIsVoiceRecording] = useState(false)
  const [showVoiceAnimation, setShowVoiceAnimation] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [isAiResponding, setIsAiResponding] = useState(false)
  const voiceTimeoutRef = useRef<number | null>(null)
  const chatContentRef = useRef<HTMLDivElement>(null)

  const orbRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight
    }
  }

  // Voice response arrays
  const DISCOVERY_VOICE_RESPONSES = [
    "That's interesting. I usually drink strong filter coffee. Which of these Karnataka teas is the most robust and would give me that caffeine kick I'm used to?",
    "I prefer my morning beverage very strong with milk. Can any of these Karnataka teas be brewed like traditional filter coffee?",
    "I'm looking for something that can replace my daily coffee habit. Which Karnataka tea has the strongest, most full-bodied flavor?"
  ]

  const DISCOVERY_AI_RESPONSES = [
    "Great question, Ajay! Based on your preference for a strong, traditional brew similar to filter 'kaapi', I highly recommend the **Karnataka 'Filter Kaapi' Style Tea**.\n\nIt's a robust CTC (Crush, Tear, Curl) black tea blend specifically designed to create a strong, dark liquor that stands up well to milk and sugar, much like your morning coffee.\n\nThe Coorg Spiced Black Tea is also quite strong, but it has added notes of local spices like cinnamon and clove, which gives it a different character.\n\nWould you like to add a 100g pack of the 'Filter Kaapi' Style Tea to your cart, or would you like to see its product details first?",
    "Perfect choice for someone who loves strong brews! The **Karnataka 'Filter Kaapi' Style Tea** is exactly what you're looking for.\n\nThis special blend uses **bold CTC processing** to create small, dense leaves that release maximum strength and color when brewed. You can prepare it just like your filter coffee - strong decoction with milk and sugar.\n\nIt gives you that same robust caffeine kick (about 60-70mg per cup) and has that familiar full-bodied mouthfeel you're used to from traditional South Indian filter coffee.\n\nShall I add this to your cart? It's currently ₹399 for 250g, which makes about 125 strong cups."
  ]

  // Product details to show after AI response
  const FILTER_KAAPI_PRODUCT = {
    name: "Karnataka 'Filter Kaapi' Style Tea",
    description: "Strong CTC black tea blend designed for traditional South Indian brewing",
    price: "₹399",
    weight: "250g",
    servings: "125 cups",
    caffeine: "60-70mg per cup",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=200&fit=crop&crop=center",
    features: [
      "Bold CTC processing for maximum strength",
      "Perfect with milk and sugar",
      "Traditional South Indian flavor profile",
      "High caffeine content",
      "Premium Karnataka tea leaves"
    ]
  }

  // Auto-show tooltip after appearing
  useEffect(() => {
    if (isVisible && !showTooltip && !isExpanded) {
      const autoShowTimeout = setTimeout(() => {
        setShowTooltip(true)
      }, 500) // Show tooltip after 0.5 seconds
      return () => clearTimeout(autoShowTimeout)
    }
  }, [isVisible, showTooltip, isExpanded])

  // Handle orb click: when we have product context, show intro message + options
  const handleOrbClick = () => {
    setShowTooltip(false)
    setIsExpanded(true)
    onExpanded?.(true)
    if (productName && productDescription) {
      setIsInConversation(true)
      setConversationMessages([{
        id: `intro-${Date.now()}`,
        type: 'result',
        content: `You're looking at **${productName}**. ${productDescription}. How can I help?`,
        timestamp: Date.now(),
        isTyping: false,
        icon: RiSparklingFill
      }])
      setShowSuggestions(true)
      setTimeout(() => scrollToBottom(), 100)
    } else {
      setTimeout(() => setShowSuggestions(true), 300)
    }
  }

  // Handle close
  const handleClose = () => {
    setIsExpanded(false)
    setShowTooltip(false)
    setShowSuggestions(false)
    setIsInConversation(false)
    setConversationMessages([])
    setInputText('')
    setShowProductDetails(false)
    onExpanded?.(false)
    onClose()
  }

  // Voice input handlers
  const handleVoiceClick = () => {
    setIsVoiceRecording(true)
    setShowVoiceAnimation(true)
    
    voiceTimeoutRef.current = setTimeout(() => {
      stopVoiceRecording()
    }, 2000) // 2 seconds of recording
  }

  const stopVoiceRecording = () => {
    setIsVoiceRecording(false)
    setShowVoiceAnimation(false)
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current)
      voiceTimeoutRef.current = null
    }

    // Pick random voice response
    const randomIndex = Math.floor(Math.random() * DISCOVERY_VOICE_RESPONSES.length)
    const randomResponse = DISCOVERY_VOICE_RESPONSES[randomIndex]
    const aiResponse = DISCOVERY_AI_RESPONSES[randomIndex] || DISCOVERY_AI_RESPONSES[0]
    
    setInputText(randomResponse) // Show user input in input box first
    
    // After delay, move to conversation
    setTimeout(() => {
      setIsInConversation(true)
      setShowSuggestions(false)
      
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'result',
        content: randomResponse.trim(),
        timestamp: Date.now(),
        isTyping: false,
        icon: RiUser3Line
      }
      
      setConversationMessages([userMessage])
      setInputText('') // Clear input
    }, 1000) // Give user time to see their input
    
    // Start AI response
    setTimeout(() => {
      addTypingMessage({
        type: 'result',
        content: aiResponse,
        icon: RiBrainLine
      })
      
      setTimeout(() => {
        setShowSuggestions(true)
      }, 2500)
    }, 1800) // Wait for conversation to show + buffer
  }

  // Add typing message with character-by-character animation
  const addTypingMessage = ({ type, content, icon }: {
    type: 'user' | 'result' | 'error'
    content: string
    icon?: React.ComponentType<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  }) => {
    const newMessage: ConversationMessage = {
      id: `ai-${Date.now()}`,
      type,
      content: '',
      timestamp: Date.now(),
      isTyping: true,
      icon
    }

    setConversationMessages(prev => [...prev, newMessage])
    setIsAiResponding(true)
    
    // Auto-scroll when AI message starts
    setTimeout(() => scrollToBottom(), 100)

    // Character-by-character typing animation
    let currentIndex = 0
    const fullContent = content
    
    const typeChar = () => {
      if (currentIndex < fullContent.length) {
        setConversationMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, content: fullContent.substring(0, currentIndex + 1) }
            : msg
        ))
        currentIndex++
        setTimeout(typeChar, 7) // 7ms per character for 4x faster typing
      } else {
        // Finished typing
        setConversationMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, isTyping: false }
            : msg
        ))
        setIsAiResponding(false)
        
        // Check if this response mentions "Filter Kaapi" and show product details
        if (content.includes("Filter Kaapi") && content.includes("cart")) {
          setTimeout(() => {
            setShowProductDetails(true)
          }, 1000) // Show product details 1 second after AI response finishes
        }
      }
    }
    
    // Start typing after 300ms delay
    setTimeout(typeChar, 300)
  }

  // Handle send input
  const handleSendInput = () => {
    if (inputText.trim()) {
      const userMessage: ConversationMessage = {
        id: `user-${Date.now()}`,
        type: 'result',
        content: inputText.trim(),
        timestamp: Date.now(),
        icon: RiUser3Line
      }
      
      setIsInConversation(true)
      setShowSuggestions(false)
      setConversationMessages(prev => [...prev, userMessage])
      setInputText('')
      
      // Auto-scroll after adding user message
      setTimeout(() => scrollToBottom(), 100)
      
      // Simulate AI response with typing animation
      setTimeout(() => {
        addTypingMessage({
          type: 'result',
          content: "Thanks for your question! Let me help you find the perfect tea for your taste preferences.",
          icon: RiBrainLine
        })
      }, 500)
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendInput()
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div 
        ref={orbRef}
        className={`absolute pointer-events-auto z-50 ${
          isExpanded 
            ? 'fixed top-4 right-4' // Fixed positioning for expanded state to "hover" 
            : 'top-3 right-3'      // Absolute positioning for collapsed state
        }`}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          width: isExpanded ? '384px' : '48px',
          height: isExpanded ? '400px' : '48px'
        }}
        exit={{ opacity: 0, scale: 0.3 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 30,
          mass: 0.8
        }}
        layoutId="product-orb"
        style={{
          background: isExpanded ? '#ffffff' : 'transparent', // No white background for initial orb
          border: isExpanded ? '1px solid rgba(229, 231, 235, 0.5)' : 'none', // No border for initial orb
          borderRadius: isExpanded ? '24px' : '50%',
          boxShadow: isExpanded ? '0 8px 32px rgba(0, 0, 0, 0.12)' : 'none', // No shadow for initial orb
          maxWidth: isExpanded ? '384px' : '48px',
          // Ensure expanded chat doesn't get cut off on small screens
          ...(isExpanded && {
            maxWidth: 'min(384px, calc(100vw - 32px))',
            maxHeight: 'min(400px, calc(100vh - 32px))'
          })
        }}
      >
        {!isExpanded ? (
          // Initial orb state with tooltip options
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer group relative"
            onClick={handleOrbClick}
          >
            {/* Glass morphism orb */}
            <div className="glass-orb-container">
              <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="orb-base-product" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                    <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                    <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                  </radialGradient>

                  <radialGradient id="orb-rim-product" cx="50%" cy="40%" r="52%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                    <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                  </radialGradient>

                  <linearGradient id="specular-product" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.95)"/>
                    <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                  </linearGradient>

                  <filter id="inner-shadow-product" x="-20%" y="-20%" width="140%" height="140%">
                    <feOffset dx="0" dy="6" result="off"/>
                    <feGaussianBlur in="off" stdDeviation="10" result="blur"/>
                    <feComposite in="blur" in2="SourceAlpha" operator="out" result="comp"/>
                    <feColorMatrix in="comp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
                    <feComposite in2="SourceGraphic" operator="over"/>
                  </filter>
                </defs>

                <g transform="translate(500,500)">
                  <circle cx="0" cy="0" r="420" fill="url(#orb-base-product)" stroke="url(#orb-rim-product)" strokeWidth="2" />
                  <g style={{opacity: 0.95, filter: 'blur(0.6px)'}}>
                    <ellipse cx="-160" cy="-180" rx="160" ry="80" fill="url(#specular-product)" transform="rotate(-20)" />
                    <ellipse cx="-120" cy="-140" rx="32" ry="18" fill="rgba(255,255,255,0.95)" />
                  </g>
                  <circle cx="0" cy="0" r="360" fill="none" filter="url(#inner-shadow-product)" stroke="rgba(0,0,0,0)" />
                </g>
              </svg>
              
              <RiSparklingFill 
                size={20} 
                className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{ zIndex: 2 }}
              />
            </div>

            {/* Product Orb Tooltip Options */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div 
                  className="absolute right-full top-1/2 transform -translate-y-1/2 -translate-x-2 pointer-events-auto z-50"
                  initial={{ opacity: 0, scale: 0.8, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 8 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3
                  }}
                >
                  <div 
                    className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer text-center"
                    style={{
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      backdropFilter: 'blur(8px)',
                      minWidth: '200px',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => {
                      setInputText("Show me the Karnataka tea collection")
                      handleOrbClick()
                      setTimeout(() => {
                        handleSendInput()
                      }, 400)
                    }}
                  >
                     <p className="text-xs font-medium text-gray-900 leading-tight">
                       Hey Ajay, find some tea blends from Karnataka
                     </p>
                    
                    {/* Tooltip Arrow - Points right toward orb */}
                    <div 
                      className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0"
                      style={{
                        borderTop: '4px solid transparent',
                        borderBottom: '4px solid transparent', 
                        borderLeft: '4px solid white'
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Expanded chat interface with orb visible in header
          <div className="w-full h-full flex flex-col overflow-hidden rounded-3xl">
            {/* Header with orb integrated */}
            <div className="flex items-center justify-between p-4 rounded-t-3xl" style={{ borderBottom: '1px solid rgba(229, 231, 235, 0.2)', background: '#ffffff' }}>
              <div className="flex items-center gap-4">
                {/* Keep the original orb visible and prominent in header */}
                <div className="flex items-center gap-2">
                    <div className="glass-orb-container" style={{ width: '24px', height: '24px' }}>
                      <svg className="glass-orb-svg" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <radialGradient id="orb-base-header" cx="40%" cy="35%" r="70%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                            <stop offset="40%" stopColor="rgba(22,163,74,0.55)" />
                            <stop offset="100%" stopColor="rgba(15,118,110,0.45)" />
                          </radialGradient>
                          <radialGradient id="orb-rim-header" cx="50%" cy="40%" r="52%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="80%" stopColor="rgba(4,120,87,0.25)" />
                            <stop offset="100%" stopColor="rgba(6,78,59,0.35)" />
                          </radialGradient>
                        </defs>
                        <g transform="translate(500,500)">
                          <circle cx="0" cy="0" r="420" fill="url(#orb-base-header)" stroke="url(#orb-rim-header)" strokeWidth="2" />
                        </g>
                      </svg>
                      <RiSparklingFill size={12} className="text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 2 }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">AI Shopping Assistant</span>
                    {isAiResponding && (
                      <RiLoader2Line size={16} className="animate-spin ml-2" style={{ color: '#374151' }} />
                    )}
                  </div>
                
              </div>
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <RiCloseLine size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Chat content area */}
            <div ref={chatContentRef} className="flex-1 overflow-auto p-4 space-y-3">
              {isInConversation ? (
                // Conversation Mode: Show user messages and AI responses
                <div className="space-y-3">
                  {conversationMessages.map((message) => {
                    const IconComponent = message.icon || RiSparklingFill
                    const isUserMessage = message.id.startsWith('user-')

                    return (
                      <div key={message.id} className={`flex items-start gap-3 animate-fadeIn ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 flex items-center justify-center flex-shrink-0 rounded-full ${isUserMessage ? 'bg-green-100' : ''}`}>
                          <IconComponent 
                            size={14} 
                            style={isUserMessage ? { color: '#059669' } : { color: '#374151' }} 
                          />
                        </div>
                        <div className={`flex-1 text-sm ${isUserMessage ? 'text-right' : ''}`} style={{ color: '#374151', lineHeight: '1.6' }}>
                          {message.content.includes('**') || message.content.includes('\n') ? (
                            /* Render markdown-style bold text and line breaks */
                            <div 
                              dangerouslySetInnerHTML={{
                                __html: message.content
                                  .split('\n').map(line => line.trim()).join('<br/>')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/•/g, '•')
                              }}
                            />
                          ) : (
                            <>
                              {/* Character-by-character display for typing animation */}
                              {message.content.split('').map((char, index) => (
                                <span key={index}>{char}</span>
                              ))}
                              {/* Typing cursor */}
                              {message.isTyping && (
                                <span className="inline-block w-0.5 h-4 ml-1 animate-pulse" style={{ backgroundColor: '#374151' }}></span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Product Details Section - Show after AI mentions Filter Kaapi */}
                  {showProductDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-3"
                    >
                      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={FILTER_KAAPI_PRODUCT.image}
                          alt={FILTER_KAAPI_PRODUCT.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">{FILTER_KAAPI_PRODUCT.name}</div>
                          <div className="text-xs text-gray-600">Strong CTC blend - {FILTER_KAAPI_PRODUCT.price}</div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0">
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  )}
                  {/* Product intro options - when we have productName and showSuggestions */}
                  {showSuggestions && productName && productDescription && (
                    <div className="space-y-3 pt-2">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {productImage && (
                          <img src={productImage} alt={productName} className="w-full h-28 object-cover" />
                        )}
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900">{productName}</p>
                          <p className="text-xs text-gray-600 mt-1">{productDescription}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`Summarise ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium text-gray-900 border border-gray-200"
                        >
                          Summarise
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`I have a question about ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium text-gray-900 border border-gray-200"
                        >
                          Ask question
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`Help me buy ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-left text-sm font-medium border border-green-600"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : showSuggestions && (
                <div className="space-y-3">
                  {productName && productDescription ? (
                    <>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        {productImage && (
                          <img src={productImage} alt={productName} className="w-full h-28 object-cover" />
                        )}
                        <div className="p-3">
                          <p className="text-sm font-semibold text-gray-900">{productName}</p>
                          <p className="text-xs text-gray-600 mt-1">{productDescription}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`Summarise ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium text-gray-900 border border-gray-200"
                        >
                          Summarise
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`I have a question about ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm font-medium text-gray-900 border border-gray-200"
                        >
                          Ask question
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(`Help me buy ${productName}`)
                            setTimeout(() => handleSendInput(), 300)
                          }}
                          className="w-full p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors text-left text-sm font-medium border border-green-600"
                        >
                          Buy
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                        <img src="https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=40&h=40&fit=crop&crop=center" alt="Nilgiri Frost Tea" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Nilgiri 'Frost' Tea</div>
                          <div className="text-xs text-gray-600">High-altitude blend - $18.99</div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0">Add to Cart</button>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                        <img src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=40&h=40&fit=crop&crop=center" alt="Munnar Cardamom Chai" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Munnar Cardamom Chai</div>
                          <div className="text-xs text-gray-600">Spiced blend - $22.50</div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0">Add to Cart</button>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                        <img src="https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=40&h=40&fit=crop&crop=center" alt="Coorg Spiced Black Tea" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Coorg Spiced Black Tea</div>
                          <div className="text-xs text-gray-600">Bold & robust - $24.99</div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0">Add to Cart</button>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=40&h=40&fit=crop&crop=center" alt="Karnataka Filter Kaapi Style Tea" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">Karnataka 'Filter Kaapi' Style Tea</div>
                          <div className="text-xs text-gray-600">Strong CTC blend - $19.99</div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex-shrink-0">Add to Cart</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input area with voice input */}
            <div className="p-3 border-t border-gray-200" style={{ background: '#ffffff' }}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isVoiceRecording ? "Listening..." : placeholder}
                    className="w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{
                      paddingLeft: showVoiceAnimation ? '60px' : '12px',
                      paddingRight: '12px',
                      paddingTop: '8px',
                      paddingBottom: '8px'
                    }}
                  />
                  
                  {/* Voice Animation - Green Bars */}
                  {showVoiceAnimation && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-green-600 rounded-full animate-pulse"
                          style={{
                            height: '16px',
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '1s',
                            animationIterationCount: 'infinite'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Voice Input Button */}
                <button
                  onClick={handleVoiceClick}
                  className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors group relative"
                  title="Voice input"
                >
                  <RiMicLine size={16} className="text-gray-600" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    Voice input
                  </div>
                </button>
                
                {/* Send Button */}
                <button
                  onClick={handleSendInput}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  title="Send message"
                >
                  <RiSendPlaneLine size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
