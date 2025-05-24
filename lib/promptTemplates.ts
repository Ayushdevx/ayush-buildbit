/**
 * Advanced prompt templates for different types of websites
 * These templates enhance the AI generation with specific industry knowledge
 */

export const websiteTemplates = {
  restaurant: {
    additionalPrompt: `
🍽️ RESTAURANT-SPECIFIC FEATURES:
- Menu sections with appetizers, mains, desserts, drinks
- Online reservation system with time slots
- Location and hours prominently displayed
- Chef's special or daily specials section
- Customer reviews and testimonials
- Photo gallery of food and restaurant ambiance
- Contact info with phone number for reservations
- Social media integration for Instagram food photos
- Delivery and takeout options
- About the chef/restaurant story
`,
    colorSchemes: ['warm and appetizing', 'elegant dining', 'rustic and cozy', 'modern and fresh']
  },

  portfolio: {
    additionalPrompt: `
🎨 PORTFOLIO-SPECIFIC FEATURES:
- Hero section with professional headshot and tagline
- Skills and expertise showcase
- Project gallery with case studies
- Work experience timeline
- Client testimonials and recommendations
- Downloadable resume/CV
- Contact form for project inquiries
- Social media and professional network links
- About section with personal story
- Services offered with pricing (optional)
`,
    colorSchemes: ['creative and bold', 'minimal and professional', 'artistic and vibrant', 'clean and modern']
  },

  ecommerce: {
    additionalPrompt: `
🛒 E-COMMERCE-SPECIFIC FEATURES:
- Product showcase with grid layout
- Featured products and bestsellers
- Shopping cart icon and functionality hints
- Product categories and filters
- Customer reviews and ratings display
- Promotional banners and sale sections
- Newsletter signup for deals
- Trust badges and security indicators
- Shipping and return policy information
- Customer support contact options
`,
    colorSchemes: ['trustworthy and professional', 'vibrant and energetic', 'luxury and premium', 'friendly and approachable']
  },

  saas: {
    additionalPrompt: `
💻 SAAS-SPECIFIC FEATURES:
- Clear value proposition and benefits
- Feature comparison tables
- Pricing tiers with recommended plan
- Free trial or demo call-to-action
- Customer testimonials and case studies
- Integration showcase with popular tools
- Security and compliance badges
- FAQ section addressing common concerns
- Getting started guide or onboarding flow
- API documentation links
`,
    colorSchemes: ['tech-forward and modern', 'trustworthy and corporate', 'innovative and bold', 'clean and efficient']
  },

  agency: {
    additionalPrompt: `
🏢 AGENCY-SPECIFIC FEATURES:
- Service offerings with detailed descriptions
- Case studies and client success stories
- Team member profiles and expertise
- Client logos and testimonials
- Process or methodology explanation
- Industry specializations
- Contact form for project inquiries
- Blog or insights section
- Awards and recognition display
- Partnership and certification badges
`,
    colorSchemes: ['professional and authoritative', 'creative and dynamic', 'corporate and trustworthy', 'modern and innovative']
  },

  blog: {
    additionalPrompt: `
📝 BLOG-SPECIFIC FEATURES:
- Featured article with large image
- Recent posts grid layout
- Category navigation and tags
- Author bio and profile
- Search functionality hint
- Newsletter subscription
- Social sharing buttons
- Related articles suggestions
- Comment section design
- Archive and date-based navigation
`,
    colorSchemes: ['readable and comfortable', 'magazine-style and editorial', 'minimal and clean', 'vibrant and engaging']
  },

  visa: {
    additionalPrompt: `
🛂 VISA/IMMIGRATION SERVICE FEATURES:
- Clear visa type categories with icons and descriptions
- Step-by-step application process visualization
- Document requirements checklist with upload areas
- Government compliance badges and certifications
- Real-time application status tracking interface
- Multilingual support indicators
- Consulate/embassy location finder
- Processing time estimates with guarantees
- Customer testimonials with success stories
- Live chat support with expert agents
- FAQ section addressing common concerns
- Emergency contact information
- Cultural integration tips and resources
- Partner logos (airlines, hotels, insurance)
- Trust signals (SSL, GDPR compliance, approval rates)
`,
    colorSchemes: ['official and trustworthy', 'patriotic flag colors', 'professional government blue', 'international and multicultural']
  },

  legal: {
    additionalPrompt: `
⚖️ LEGAL SERVICES FEATURES:
- Practice area specializations clearly defined
- Attorney profiles with credentials and experience
- Case study results and success rates
- Free consultation booking system
- Legal resource library and guides
- Client testimonials and reviews
- Professional association memberships
- Awards and recognition display
- Contact forms for different legal needs
- Emergency legal hotline information
- Fee structure transparency
- Multi-language support for international clients
`,
    colorSchemes: ['authoritative and professional', 'classic legal blue', 'trustworthy and conservative', 'modern and approachable']
  },

  medical: {
    additionalPrompt: `
🏥 MEDICAL/HEALTHCARE FEATURES:
- Services and specializations overview
- Doctor profiles with qualifications
- Online appointment booking system
- Patient portal access hints
- Insurance information and accepted plans
- Location and hours with emergency contacts
- Patient testimonials and success stories
- Medical certifications and accreditations
- Health resources and educational content
- Telemedicine options
- Emergency contact information
- Multilingual support for diverse patients
`,
    colorSchemes: ['clean medical white and blue', 'calming and trustworthy', 'professional healthcare green', 'modern and accessible']
  },

  education: {
    additionalPrompt: `
🎓 EDUCATION/TRAINING FEATURES:
- Course catalog with detailed descriptions
- Faculty profiles and qualifications
- Student success stories and testimonials
- Admission requirements and application process
- Campus tour virtual elements
- Academic calendar and important dates
- Student resources and support services
- Alumni network and career outcomes
- Financial aid and scholarship information
- Online learning platform integration
- International student services
- Campus life and extracurricular activities
`,
    colorSchemes: ['academic and scholarly', 'inspiring and motivational', 'youthful and energetic', 'traditional and prestigious']
  }
};

export const modernDesignTrends2025 = {
  typography: [
    'Variable font usage with dynamic weights',
    'Oversized headlines with thin body text',
    'Mixed serif and sans-serif combinations',
    'Kinetic typography with subtle animations',
    'Custom lettering for brand identity',
    'Improved readability with optimal line spacing'
  ],
  
  layouts: [
    'Asymmetrical grid systems',
    'Floating navigation elements',
    'Overlapping content sections',
    'Scroll-triggered animations',
    'Sticky elements and parallax scrolling',
    'Card-based layouts with depth',
    'Masonry grids for dynamic content'
  ],
  
  colors: [
    'Gradient overlays and mesh gradients',
    'High contrast color combinations',
    'Monochromatic with accent colors',
    'Dark mode optimization',
    'Color psychology application',
    'Brand-specific color storytelling',
    'Accessibility-first color choices'
  ],
  
  interactions: [
    'Micro-interactions on hover states',
    'Smooth page transitions',
    'Loading state animations',
    'Interactive elements with feedback',
    'Gesture-based navigation hints',
    'Progressive disclosure of information',
    'Contextual animations and effects'
  ],

  advanced: [
    'Glassmorphism and neumorphism effects',
    'CSS Grid with complex layouts',
    'Custom scroll indicators',
    'Animated SVG icons and illustrations',
    'Parallax scrolling effects',
    'Interactive data visualizations',
    'Dynamic content loading states'
  ]
};

export const complexWebsiteHandling = {
  longPrompts: {
    maxTokens: 12000,
    processingStrategy: 'comprehensive',
    detailLevel: 'maximum'
  },
  
  industrySpecific: {
    government: ['compliance badges', 'official seals', 'security indicators'],
    finance: ['trust badges', 'security certificates', 'regulatory compliance'],
    healthcare: ['privacy notices', 'medical certifications', 'patient portals'],
    legal: ['bar associations', 'case results', 'consultation booking'],
    education: ['accreditation badges', 'student portals', 'course catalogs']
  },
  
  culturalAdaptation: {
    multilingual: true,
    regionalColors: true,
    culturalSymbols: true,
    localCompliance: true
  }
};
