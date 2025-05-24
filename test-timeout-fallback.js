// Test script to verify fallback behavior when Gemini API times out
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/create';

async function testTimeoutFallback() {
    console.log('🚀 Testing Timeout Fallback Behavior');
    console.log('=====================================');
    
    // Test with e-commerce prompt that previously timed out
    const testPrompt = `Create a comprehensive e-commerce website for "TechNova" selling premium electronics, smart home devices, gaming gear, and accessories. Include product catalog with advanced filtering, shopping cart, secure checkout, customer reviews, wishlist, real-time inventory, multi-currency support, mobile app integration, and AI-powered product recommendations.`;
    
    try {
        console.log('📝 Testing E-commerce Prompt (Previously Timed Out)');
        console.log('⏰ Starting test...');
        
        const startTime = Date.now();
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: testPrompt
            }),
            timeout: 150000 // 2.5 minutes timeout
        });
        
        const endTime = Date.now();
        const responseTime = (endTime - startTime) / 1000;
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ SUCCESS: Response received in ${responseTime}s`);
            console.log(`📏 HTML Length: ${result.html?.length || 'N/A'} characters`);
            
            // Check if it's a fallback template or Gemini response
            if (result.html && result.html.includes('generateEnhancedFallbackTemplate')) {
                console.log('🔧 Generation Method: 🎨 Enhanced Fallback Template');
            } else if (result.html && result.html.length > 10000) {
                console.log('🔧 Generation Method: 🤖 Gemini 2.0 Flash');
            } else {
                console.log('🔧 Generation Method: ❓ Unknown');
            }
            
            // Analyze content for e-commerce features
            const html = result.html || '';
            const ecommerceFeatures = [
                'product', 'cart', 'checkout', 'shop', 'buy', 'price', 'electronics'
            ];
            
            const foundFeatures = ecommerceFeatures.filter(feature => 
                html.toLowerCase().includes(feature)
            );
            
            console.log('🛒 E-commerce Features Found:', foundFeatures.length, '/', ecommerceFeatures.length);
            console.log('✅ Features:', foundFeatures.join(', '));
            
        } else {
            console.log(`❌ FAILED: HTTP ${response.status}`);
            const error = await response.text();
            console.log('Error:', error);
        }
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        
        if (error.message.includes('timeout')) {
            console.log('⏰ TIMEOUT: This would trigger fallback template in production');
        }
    }
    
    console.log('\n🎯 TIMEOUT FALLBACK TEST COMPLETE');
    console.log('The system should gracefully handle timeouts by using enhanced fallback templates');
}

testTimeoutFallback();
