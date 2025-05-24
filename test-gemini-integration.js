/**
 * Test script to verify Gemini API integration with complex C'est La Visa prompt
 */

// Use built-in fetch (Node.js 18+)

// Your complex C'est La Visa prompt
const complexPrompt = `Create a comprehensive website for "C'est La Visa" - a premium France/Schengen visa consultation service. The website should include:

**Header & Navigation:**
- Elegant logo with French flair
- Navigation: Home, Services, About, Contact, Blog, FAQ
- Phone number: +33 1 23 45 67 89
- "Book Consultation" CTA button

**Hero Section:**
- Compelling headline: "Your Gateway to France & Schengen Zone"
- Subheading about expert visa guidance
- Success rate statistics (95% approval rate)
- Primary CTA: "Start Your Application"
- Hero image of Eiffel Tower or French landmarks

**Services Section:**
- Tourist Visa (short-stay)
- Business Visa
- Student Visa
- Family Reunion Visa
- Long-term Visa
- Each with icons, descriptions, and processing times

**Why Choose Us:**
- Expert consultation team
- 15+ years experience
- Multilingual support (French, English, Arabic, Spanish)
- Document preparation assistance
- Interview coaching
- Fast-track processing options

**Process Steps:**
1. Initial consultation
2. Document collection
3. Application preparation
4. Submission assistance
5. Interview preparation
6. Visa collection

**Testimonials:**
- Success stories from satisfied clients
- Photos and quotes
- Star ratings

**Blog/Resources:**
- Latest visa updates
- Travel tips for France
- Required documents checklist
- Embassy locations

**Contact Information:**
- Paris office address
- Multiple contact methods
- Consultation booking form
- Map integration

**Footer:**
- Complete contact details
- Social media links
- Privacy policy
- Terms of service
- Accreditation badges

Design should be professional, trustworthy, with French-inspired colors (blue, white, red accents), modern typography, and mobile-responsive layout. Include subtle animations and a clean, governmental feel that inspires confidence.`;

async function testGeminiIntegration() {
    console.log('🚀 Testing Gemini API integration with complex C\'est La Visa prompt...\n');
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('http://localhost:3002/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: complexPrompt
            })
        });

        const result = await response.json();
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`⏱️  Response time: ${duration} seconds\n`);        if (response.ok) {
            console.log('✅ SUCCESS: API responded correctly!\n');
            
            // Show full response for debugging
            console.log('🔧 FULL API RESPONSE:');
            console.log('====================');
            console.log(JSON.stringify(result, null, 2));
            console.log('\n');
              // Analyze the generated content
            const htmlContent = result.content || result.html || '';
            
            console.log('📊 ANALYSIS OF GENERATED CONTENT:');
            console.log('=====================================');
            
            // Check for key elements
            const checks = [
                { name: 'Contains C\'est La Visa branding', check: htmlContent.toLowerCase().includes('c\'est la visa') || htmlContent.toLowerCase().includes('cest la visa') },
                { name: 'Has French color scheme', check: htmlContent.includes('#0055A4') || htmlContent.includes('blue') || htmlContent.includes('red') },
                { name: 'Includes visa services', check: htmlContent.toLowerCase().includes('visa') && htmlContent.toLowerCase().includes('service') },
                { name: 'Has navigation menu', check: htmlContent.toLowerCase().includes('nav') || htmlContent.toLowerCase().includes('menu') },
                { name: 'Contains contact information', check: htmlContent.toLowerCase().includes('contact') },
                { name: 'Includes consultation CTA', check: htmlContent.toLowerCase().includes('consultation') || htmlContent.toLowerCase().includes('book') },
                { name: 'Has testimonials section', check: htmlContent.toLowerCase().includes('testimonial') },
                { name: 'Includes process steps', check: htmlContent.toLowerCase().includes('step') || htmlContent.toLowerCase().includes('process') },
                { name: 'Mobile responsive', check: htmlContent.includes('responsive') || htmlContent.includes('mobile') || htmlContent.includes('viewport') },
                { name: 'Has animations/effects', check: htmlContent.includes('animation') || htmlContent.includes('transition') || htmlContent.includes('transform') }
            ];

            let passedChecks = 0;
            checks.forEach(check => {
                const status = check.check ? '✅' : '❌';
                console.log(`${status} ${check.name}`);
                if (check.check) passedChecks++;
            });

            console.log(`\n📈 SCORE: ${passedChecks}/${checks.length} (${Math.round((passedChecks/checks.length)*100)}%)\n`);

            // Content quality analysis
            console.log('🎨 CONTENT QUALITY INDICATORS:');
            console.log('===============================');
            console.log(`📝 HTML length: ${htmlContent.length} characters`);
            console.log(`🏷️  Contains semantic HTML: ${htmlContent.includes('<header>') && htmlContent.includes('<main>') && htmlContent.includes('<footer>') ? '✅' : '❌'}`);
            console.log(`🎭 Has CSS styling: ${htmlContent.includes('<style>') || htmlContent.includes('class=') ? '✅' : '❌'}`);
            console.log(`📱 Responsive design: ${htmlContent.includes('media') || htmlContent.includes('responsive') ? '✅' : '❌'}`);

            // Check if it's using Gemini AI or fallback
            console.log(`\n🤖 SOURCE: ${result.source === 'gemini' ? 'Gemini AI Generated' : 'Enhanced Template Fallback'}`);
            
            if (result.error) {
                console.log(`⚠️  Warning: ${result.error}`);
            }

            // Log first 500 characters of HTML for preview
            console.log('\n🔍 GENERATED CONTENT PREVIEW:');
            console.log('=============================');
            console.log(htmlContent.substring(0, 500) + '...\n');

        } else {
            console.log('❌ ERROR: API request failed');
            console.log('Status:', response.status);
            console.log('Response:', result);
        }

    } catch (error) {
        console.log('❌ CRITICAL ERROR: Failed to connect to API');
        console.log('Error:', error.message);
        console.log('\n💡 TROUBLESHOOTING TIPS:');
        console.log('- Ensure the development server is running on port 3002');
        console.log('- Check if the Gemini API key is properly configured');
        console.log('- Verify the .env file exists with GEMINI_API_KEY');
    }
}

// Run the test
testGeminiIntegration();
