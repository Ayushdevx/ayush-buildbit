import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest } from "next/server";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { saveProject } from "@/lib/localStore";
import { websiteTemplates, modernDesignTrends2025 } from "@/lib/promptTemplates";

// Initialize Gemini API with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables");
}
const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Analyze the user's prompt to understand the business type and requirements
 */
function analyzePrompt(prompt: string): {
  businessType: string;
  industry: string;
  features: string[];
  colorMood: string;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  // Business type detection
  let businessType = "business";
  if (lowerPrompt.includes("restaurant") || lowerPrompt.includes("cafe") || lowerPrompt.includes("food")) {
    businessType = "restaurant";
  } else if (lowerPrompt.includes("portfolio") || lowerPrompt.includes("personal") || lowerPrompt.includes("freelance")) {
    businessType = "portfolio";
  } else if (lowerPrompt.includes("shop") || lowerPrompt.includes("store") || lowerPrompt.includes("ecommerce") || lowerPrompt.includes("product")) {
    businessType = "ecommerce";
  } else if (lowerPrompt.includes("agency") || lowerPrompt.includes("marketing") || lowerPrompt.includes("consulting")) {
    businessType = "agency";
  } else if (lowerPrompt.includes("saas") || lowerPrompt.includes("software") || lowerPrompt.includes("app")) {
    businessType = "saas";
  } else if (lowerPrompt.includes("blog") || lowerPrompt.includes("news") || lowerPrompt.includes("article")) {
    businessType = "blog";
  }
  
  // Industry detection
  let industry = "general";
  if (lowerPrompt.includes("tech") || lowerPrompt.includes("ai") || lowerPrompt.includes("software")) {
    industry = "technology";
  } else if (lowerPrompt.includes("health") || lowerPrompt.includes("medical") || lowerPrompt.includes("wellness")) {
    industry = "healthcare";
  } else if (lowerPrompt.includes("finance") || lowerPrompt.includes("bank") || lowerPrompt.includes("investment")) {
    industry = "finance";
  } else if (lowerPrompt.includes("education") || lowerPrompt.includes("school") || lowerPrompt.includes("learning")) {
    industry = "education";
  }
  
  // Feature detection
  const features = [];
  if (lowerPrompt.includes("contact")) features.push("contact form");
  if (lowerPrompt.includes("booking") || lowerPrompt.includes("appointment")) features.push("booking system");
  if (lowerPrompt.includes("gallery") || lowerPrompt.includes("photos")) features.push("image gallery");
  if (lowerPrompt.includes("testimonial") || lowerPrompt.includes("review")) features.push("testimonials");
  if (lowerPrompt.includes("pricing") || lowerPrompt.includes("plan")) features.push("pricing table");
  if (lowerPrompt.includes("blog") || lowerPrompt.includes("news")) features.push("blog section");
  
  // Color mood detection
  let colorMood = "professional";
  if (lowerPrompt.includes("creative") || lowerPrompt.includes("artistic")) {
    colorMood = "creative and vibrant";
  } else if (lowerPrompt.includes("luxury") || lowerPrompt.includes("premium")) {
    colorMood = "elegant and sophisticated";
  } else if (lowerPrompt.includes("fun") || lowerPrompt.includes("playful")) {
    colorMood = "bright and energetic";
  } else if (lowerPrompt.includes("minimal") || lowerPrompt.includes("clean")) {
    colorMood = "minimal and clean";
  }
  
  return { businessType, industry, features, colorMood };
}

/**
 * Clean up the generated HTML to ensure it's properly formatted
 */
function cleanupGeneratedHTML(html: string): string {
  // Remove any markdown code blocks if present
  html = html.replace(/```html\s*/, '').replace(/```\s*$/, '');
  
  // Remove any leading/trailing whitespace
  html = html.trim();
  
  // Ensure it starts with DOCTYPE
  if (!html.toLowerCase().startsWith('<!doctype html>')) {
    html = `<!DOCTYPE html>\n${html}`;
  }
  
  // Basic HTML validation - ensure it has html, head, and body tags
  if (!html.includes('<html')) {
    console.warn('Generated HTML missing html tag structure');
  }
  
  return html;
}

/**
 * Generate a high-quality website using Gemini API based on a user prompt
 * @param prompt User's description of the desired website
 * @returns Generated HTML code for the website
 */
async function generateWebsiteWithGemini(prompt: string): Promise<string> {
  try {
    console.log(`Generating website with Gemini for prompt: "${prompt}"`);
    
    // Define an enhanced system prompt for ultra-high-quality website generation
    const systemPrompt = `You are a world-class UI/UX designer and front-end developer with expertise in creating stunning, modern websites that convert and engage users.

MISSION: Create a complete, production-ready HTML file that exceeds modern web design standards based on the user's request.

🎨 DESIGN EXCELLENCE REQUIREMENTS:
- Create a visually stunning, modern design that follows current 2025 web design trends
- Use sophisticated color psychology - choose colors that evoke the right emotions for the site's purpose
- Implement a clear visual hierarchy with strategic use of typography scales
- Apply modern design principles: minimalism, asymmetry, bold typography, strategic white space
- Use CSS Grid and Flexbox for sophisticated layouts
- Implement micro-interactions and smooth animations using Tailwind's transition classes

📱 RESPONSIVE & ACCESSIBILITY:
- Mobile-first design approach with flawless responsive behavior
- Touch-friendly interface elements (minimum 44px touch targets)
- High contrast ratios for accessibility (WCAG AA compliance)
- Semantic HTML5 structure for screen readers
- Proper focus states and keyboard navigation

🚀 MODERN FEATURES TO INCLUDE:
- Hero section with compelling call-to-action
- Smooth scroll navigation with active states
- Interactive cards with hover effects
- Testimonials or social proof sections (when relevant)
- FAQ section with collapsible items (CSS-only)
- Newsletter signup with attractive styling
- Modern contact form with validation styling
- Social media integration
- Gradient backgrounds and modern shadows
- Icon integration using Unicode or CSS shapes

💡 CONTENT INTELLIGENCE:
- Generate contextually relevant, engaging copy that matches the business type
- Use industry-specific terminology and value propositions
- Create compelling headlines and persuasive calls-to-action
- Include realistic business details (hours, services, features)
- Add testimonials and social proof elements

🎯 INDUSTRY-SPECIFIC CUSTOMIZATION:
- Restaurant: Menu sections, reservation system, food photography placeholders
- E-commerce: Product showcases, shopping cart hints, promotional banners
- Portfolio: Project galleries, skill showcases, about sections
- SaaS: Feature comparisons, pricing tables, demo sections
- Agency: Service offerings, case studies, team sections
- Blog: Article layouts, author bios, category navigation

🔧 TECHNICAL EXCELLENCE:
- Clean, semantic HTML5 structure
- Embedded CSS using Tailwind CSS (via CDN)
- CSS custom properties for consistent theming
- Optimized for Core Web Vitals
- Progressive enhancement approach
- No external JavaScript dependencies
- Meta tags for SEO and social sharing
- Proper favicon and app icons

🎨 ADVANCED STYLING FEATURES:
- Custom CSS animations for loading states and interactions
- Glassmorphism or neumorphism effects where appropriate
- Advanced gradient combinations
- Creative use of backdrop filters and blend modes
- Modern button designs with multiple states
- Interactive navigation with smooth transitions
- Dynamic hover effects and transform animations

📊 CONVERSION OPTIMIZATION:
- Strategic placement of call-to-action buttons
- Trust signals and credibility indicators
- Clear value propositions above the fold
- Reduced friction in contact forms
- Social proof integration
- Urgency and scarcity elements (when appropriate)

Return ONLY the complete HTML code without any explanations, markdown formatting, or code blocks. The response should start with <!DOCTYPE html> and be a single, complete HTML file.`;    // Get Gemini Flash model (higher quotas) with optimized settings for creative web design
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8, // Higher creativity for more unique designs
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Allow for longer HTML output
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });    // Analyze the prompt to provide context-aware generation
    const promptAnalysis = analyzePrompt(prompt);
    
    // Get industry-specific template if available
    const industryTemplate = websiteTemplates[promptAnalysis.businessType as keyof typeof websiteTemplates];
    const industrySpecificPrompt = industryTemplate ? industryTemplate.additionalPrompt : '';
    const suggestedColorSchemes = industryTemplate ? industryTemplate.colorSchemes.join(', ') : 'professional and modern';
    
    // Add current design trends
    const trendsPrompt = `
🔥 2025 DESIGN TRENDS TO INCORPORATE:
Typography: ${modernDesignTrends2025.typography.join(', ')}
Layouts: ${modernDesignTrends2025.layouts.join(', ')}
Colors: ${modernDesignTrends2025.colors.join(', ')}
Interactions: ${modernDesignTrends2025.interactions.join(', ')}
`;
    
    const enhancedPrompt = `${systemPrompt}

🎯 USER REQUEST ANALYSIS:
Business Type: ${promptAnalysis.businessType}
Industry: ${promptAnalysis.industry}
Key Features Needed: ${promptAnalysis.features.join(', ')}
Color Mood: ${promptAnalysis.colorMood}
Suggested Color Schemes: ${suggestedColorSchemes}

${industrySpecificPrompt}

${trendsPrompt}

USER REQUEST: "${prompt}"

Generate a stunning, cutting-edge website that perfectly matches this request. This should be a masterpiece that showcases the latest 2025 design trends while being perfectly functional and user-friendly. Focus on creating something visually exceptional that would win design awards.`;

    // Generate content with enhanced prompt
    const result = await model.generateContent(enhancedPrompt);
    
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response to ensure it's pure HTML
    text = cleanupGeneratedHTML(text);
    
    console.log(`Successfully generated website with Gemini (${text.length} bytes)`);
    
    return text;} catch (error) {
    // Create a detailed error log with specific information about what went wrong
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    
    console.error("Error generating content with Gemini:");
    console.error(`Message: ${errorMessage}`);
    console.error(`Stack: ${errorStack}`);
    console.error(`Prompt: "${prompt}"`);
    
    // Re-throw error to be handled by the calling function
    throw error;
  }
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (!body.prompt) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }    // Enhanced fallback template that creates industry-specific, intelligent content
    function generateEnhancedFallbackTemplate(userPrompt: string): string {
        const analysis = analyzePrompt(userPrompt);
        const industryTemplate = websiteTemplates[analysis.businessType as keyof typeof websiteTemplates];
        
        // Extract business name from prompt (simple heuristic)
        const businessName = userPrompt.includes('"') 
            ? userPrompt.match(/"([^"]+)"/)?.[1] || "Your Business"
            : userPrompt.split(' ').slice(0, 3).join(' ');
        
        // Generate industry-specific content
        let heroHeadline = "Welcome to Our Professional Services";
        let heroSubtext = "We provide excellent solutions tailored to your needs";
        let ctaText = "Get Started";
        let aboutText = "We are dedicated to providing excellent service and products tailored to your needs.";
        let services = [
            { name: "Service 1", desc: "A comprehensive solution for all your needs with expert support and guidance." },
            { name: "Service 2", desc: "Innovative approaches to solving complex problems with cutting-edge technology." },
            { name: "Service 3", desc: "Customized solutions designed specifically for your unique requirements." }
        ];
        
        // Customize based on detected business type
        if (analysis.businessType === "restaurant") {
            heroHeadline = `Welcome to ${businessName}`;
            heroSubtext = "Experience exceptional dining with fresh ingredients and authentic flavors";
            ctaText = "Make Reservation";
            aboutText = "We are passionate about creating memorable dining experiences with the finest ingredients and exceptional service.";
            services = [
                { name: "Fine Dining", desc: "Exquisite cuisine prepared by our expert chefs using premium ingredients." },
                { name: "Catering Services", desc: "Professional catering for special events and corporate functions." },
                { name: "Private Events", desc: "Intimate dining experiences for special occasions and celebrations." }
            ];
        } else if (userPrompt.toLowerCase().includes("visa") || userPrompt.toLowerCase().includes("c'est la visa")) {
            heroHeadline = "Your Gateway to France & Schengen Zone";
            heroSubtext = "Expert visa consultation services with 95% approval rate";
            ctaText = "Book Consultation";
            aboutText = "We are expert visa consultants with 15+ years of experience helping clients successfully obtain France and Schengen visas.";
            services = [
                { name: "Tourist Visa", desc: "Short-stay tourist visas for leisure travel to France and Schengen countries." },
                { name: "Business Visa", desc: "Professional business visas for meetings, conferences, and commercial activities." },
                { name: "Student Visa", desc: "Educational visas for students pursuing studies in French institutions." }
            ];
        } else if (analysis.businessType === "portfolio") {
            heroHeadline = `${businessName} - Creative Professional`;
            heroSubtext = "Bringing creative visions to life with innovative design and development";
            ctaText = "View Portfolio";
            aboutText = "I am a creative professional passionate about design and development, bringing unique visions to life.";
            services = [
                { name: "Web Design", desc: "Modern, responsive website designs that engage and convert visitors." },
                { name: "Brand Identity", desc: "Complete branding solutions including logos, color schemes, and guidelines." },
                { name: "Digital Marketing", desc: "Strategic marketing campaigns to grow your online presence." }
            ];
        } else if (analysis.businessType === "ecommerce") {
            heroHeadline = `Shop ${businessName}`;
            heroSubtext = "Discover premium products with fast shipping and excellent customer service";
            ctaText = "Shop Now";
            aboutText = "We offer carefully curated products with a focus on quality, value, and customer satisfaction.";
            services = [
                { name: "Premium Products", desc: "High-quality items sourced from trusted suppliers worldwide." },
                { name: "Fast Shipping", desc: "Quick and reliable delivery to your doorstep with tracking." },
                { name: "Customer Support", desc: "Dedicated support team ready to assist with any questions." }
            ];
        }
        
        // Color scheme based on analysis
        let colorScheme = "from-blue-500 to-purple-600";
        let accentColor = "blue-500";
        
        if (userPrompt.toLowerCase().includes("france") || userPrompt.toLowerCase().includes("visa")) {
            colorScheme = "from-blue-600 to-red-500"; // French colors
            accentColor = "blue-600";
        } else if (analysis.colorMood === "elegant and sophisticated") {
            colorScheme = "from-gray-800 to-gray-900";
            accentColor = "gray-800";
        } else if (analysis.colorMood === "creative and vibrant") {
            colorScheme = "from-purple-500 to-pink-500";
            accentColor = "purple-500";
        }        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - ${heroSubtext}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: scale(1.05); }
    </style>
</head>
<body class="bg-gray-50">
    <header class="bg-gradient-to-r ${colorScheme} text-white shadow-lg">
        <nav class="container mx-auto flex justify-between items-center p-4">
            <div class="font-bold text-2xl">${businessName}</div>
            <ul class="flex space-x-6 md:flex hidden">
                <li><a href="#hero" class="hover:text-blue-200 transition-colors">Home</a></li>
                <li><a href="#about" class="hover:text-blue-200 transition-colors">About</a></li>
                <li><a href="#services" class="hover:text-blue-200 transition-colors">Services</a></li>
                <li><a href="#contact" class="hover:text-blue-200 transition-colors">Contact</a></li>
            </ul>
            ${userPrompt.toLowerCase().includes("visa") ? '<div class="text-sm">📞 +33 1 23 45 67 89</div>' : ''}
            <div class="md:hidden">
                <button class="text-white">☰</button>
            </div>
        </nav>
    </header>

    <section id="hero" class="bg-gradient-to-br ${colorScheme} text-white py-20 relative overflow-hidden">
        <div class="absolute inset-0 bg-black bg-opacity-20"></div>
        <div class="container mx-auto text-center relative z-10">
            <h1 class="text-5xl font-bold mb-6 leading-tight">${heroHeadline}</h1>
            <p class="text-xl mb-8 max-w-2xl mx-auto">${heroSubtext}</p>
            ${userPrompt.toLowerCase().includes("visa") ? '<div class="text-lg mb-6 font-semibold">✅ 95% Approval Rate | 🌍 15+ Years Experience | 🗣️ Multilingual Support</div>' : ''}
            <a href="#contact" class="bg-white text-${accentColor} hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg transition-all hover-scale inline-block shadow-lg">${ctaText}</a>
        </div>
    </section>

    <section id="about" class="py-20 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12 text-gray-800">About Us</h2>
            <div class="max-w-4xl mx-auto text-center">
                <p class="text-lg mb-8 text-gray-600 leading-relaxed">${aboutText}</p>
                <p class="text-lg text-gray-600 leading-relaxed">Our mission is to deliver outstanding results while maintaining the highest standards of quality and customer satisfaction.</p>
            </div>
        </div>
    </section>

    <section id="services" class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16 text-gray-800">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${services.map(service => `
                <div class="bg-white p-8 rounded-xl shadow-lg hover-scale">
                    <h3 class="text-xl font-semibold mb-4 text-${accentColor}">${service.name}</h3>
                    <p class="text-gray-600 leading-relaxed">${service.desc}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    ${userPrompt.toLowerCase().includes("visa") ? `
    <section class="py-20 bg-blue-600 text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-8">Simple Process, Guaranteed Results</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="p-6">
                    <div class="text-4xl mb-4">📋</div>
                    <h3 class="text-xl font-semibold mb-2">1. Consultation</h3>
                    <p>Initial assessment of your visa requirements and documentation needs</p>
                </div>
                <div class="p-6">
                    <div class="text-4xl mb-4">📄</div>
                    <h3 class="text-xl font-semibold mb-2">2. Preparation</h3>
                    <p>Complete application preparation and document verification</p>
                </div>
                <div class="p-6">
                    <div class="text-4xl mb-4">✈️</div>
                    <h3 class="text-xl font-semibold mb-2">3. Success</h3>
                    <p>Visa approval and travel preparation guidance</p>
                </div>
            </div>
        </div>
    </section>
    ` : ''}

    <section id="contact" class="py-20 bg-gray-800 text-white">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-12">Contact Us</h2>
            <div class="max-w-md mx-auto">
                <form class="space-y-6">
                    <div>
                        <label class="block mb-2 font-semibold">Name</label>
                        <input type="text" class="w-full px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-${accentColor}" placeholder="Your name">
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold">Email</label>
                        <input type="email" class="w-full px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-${accentColor}" placeholder="Your email">
                    </div>
                    <div>
                        <label class="block mb-2 font-semibold">Message</label>
                        <textarea class="w-full px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-${accentColor}" rows="4" placeholder="Your message"></textarea>
                    </div>
                    <button type="submit" class="bg-${accentColor} hover:bg-${accentColor}-600 text-white font-bold py-3 px-8 rounded-lg w-full transition-all hover-scale">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4 text-center">
            <h3 class="text-xl font-semibold mb-4">${businessName}</h3>
            ${userPrompt.toLowerCase().includes("visa") ? '<p class="mb-4">Expert Visa Consultation Services<br>📍 Paris, France | 📞 +33 1 23 45 67 89</p>' : ''}
            <p class="text-gray-400">&copy; 2025 ${businessName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
    }    try {
        let site: string;
        let generatedWith: string;
        let imageCount = 0;
        let sectionsCount = 0;
        
        // Try to generate using Gemini API first
        try {
            console.log("Attempting to generate site with Gemini API");
            site = await generateWebsiteWithGemini(body.prompt);
            generatedWith = "Gemini API";
            
            // Count images and sections in the generated HTML
            imageCount = (site.match(/<img/g) || []).length;
            // Count various section types
            const sectionElements = ['section', 'header', 'footer', 'main', 'article', 'aside'];
            sectionElements.forEach(element => {
                sectionsCount += (site.match(new RegExp(`<${element}`, 'g')) || []).length;
            });
            
            console.log(`Generated site with Gemini API: ${site.length} bytes, ${imageCount} images, ${sectionsCount} sections`);
        } catch (geminiError) {
            console.error("Gemini API generation failed, falling back to template:", geminiError);
            site = generateEnhancedFallbackTemplate(body.prompt);
            generatedWith = "Enhanced Template Fallback";
            sectionsCount = 5; // Default for the fallback template
        }
        
        // Generate a unique ID for this project
        const localId = uuidv4();
        
        // Create enriched project object with metadata
        const projectData = {
            id: localId,
            content: site,
            prompt: body.prompt,
            createdAt: new Date().toISOString(),
            generatedWith,
            stats: {
                htmlLength: site.length,
                imageCount,
                sectionsCount
            }
        };
        
        // Store the project in our local store
        saveProject(localId, projectData);

        console.log(`Successfully created project ${localId} with ${projectData.stats.htmlLength} bytes of HTML`);

        return new Response(JSON.stringify(projectData), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error in create route:", error);
        // Create a more detailed error message for debugging
        const errorMsg = error instanceof Error 
            ? `${error.name}: ${error.message}\n${error.stack}` 
            : "Unknown internal server error";
        console.log("Detailed error:", errorMsg);
        
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : "Internal server error",
            details: errorMsg
        }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
