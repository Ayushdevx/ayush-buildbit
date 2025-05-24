#!/usr/bin/env node

/**
 * Test script for enhanced fallback templates
 * This simulates various business types to verify the intelligent template system
 */

const axios = require('axios');

// Test cases for different business types
const testCases = [
    {
        name: "C'est La Visa - French Visa Service",
        prompt: "Create a comprehensive website for \"C'est La Visa\" - a premium France/Schengen visa consultation service with expert guidance, multilingual support, and 95% approval rate.",
        expectedFeatures: ['visa', 'france', 'consultation', 'schengen']
    },
    {
        name: "Italian Restaurant",
        prompt: "Create a website for \"Bella Notte\" - an authentic Italian restaurant featuring homemade pasta, wood-fired pizza, and traditional recipes from Tuscany.",
        expectedFeatures: ['restaurant', 'menu', 'reservation', 'food']
    },
    {
        name: "Creative Portfolio",
        prompt: "Build a portfolio website for Sarah Johnson, a creative graphic designer specializing in brand identity, web design, and digital illustrations.",
        expectedFeatures: ['portfolio', 'design', 'creative', 'projects']
    },
    {
        name: "E-commerce Store",
        prompt: "Create an online store for \"TechGear Pro\" selling premium electronic accessories, gadgets, and smart home devices with fast shipping.",
        expectedFeatures: ['shop', 'products', 'ecommerce', 'store']
    },
    {
        name: "SaaS Platform",
        prompt: "Build a website for \"CloudFlow\" - a project management SaaS platform that helps teams collaborate efficiently with real-time updates and analytics.",
        expectedFeatures: ['saas', 'software', 'platform', 'features']
    }
];

// Function to temporarily disable Gemini API (simulate quota exceeded)
async function testFallbackTemplate(testCase) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Prompt: ${testCase.prompt}`);
    
    try {
        // Make request to our API (this should hit the fallback if Gemini fails)
        const response = await axios.post('http://localhost:3002/api/create', {
            prompt: testCase.prompt
        }, {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 200) {
            const result = response.data;
            console.log(`✅ SUCCESS: Generated ${result.stats.htmlLength} characters`);
            console.log(`🔧 Generated with: ${result.generatedWith}`);
            
            // Analyze content for expected features
            const content = result.content.toLowerCase();
            const foundFeatures = testCase.expectedFeatures.filter(feature => 
                content.includes(feature)
            );
            
            console.log(`📊 Feature Match: ${foundFeatures.length}/${testCase.expectedFeatures.length}`);
            console.log(`✅ Found: ${foundFeatures.join(', ')}`);
            
            if (foundFeatures.length === 0) {
                console.log(`❌ Missing: ${testCase.expectedFeatures.join(', ')}`);
            }
            
            // Check for modern design elements
            const modernFeatures = [
                'tailwind', 'gradient', 'shadow', 'rounded', 'transition',
                'hover:', 'responsive', 'flex', 'grid'
            ];
            
            const foundModern = modernFeatures.filter(feature => 
                content.includes(feature)
            );
            
            console.log(`🎨 Modern Design Elements: ${foundModern.length}/${modernFeatures.length}`);
            
            // Quality score
            const qualityScore = Math.round(
                ((foundFeatures.length / testCase.expectedFeatures.length) * 50 + 
                 (foundModern.length / modernFeatures.length) * 50)
            );
            console.log(`📈 Quality Score: ${qualityScore}%`);
            
            return {
                success: true,
                score: qualityScore,
                generatedWith: result.generatedWith,
                size: result.stats.htmlLength
            };
        }
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Main test runner
async function runFallbackTests() {
    console.log('🚀 Testing Enhanced Fallback Template System');
    console.log('=============================================');
    console.log('Testing various business types to verify intelligent content generation...\n');
    
    const results = [];
    
    for (const testCase of testCases) {
        const result = await testFallbackTemplate(testCase);
        results.push({
            name: testCase.name,
            ...result
        });
        
        // Wait between tests to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
        const avgScore = Math.round(
            successful.reduce((sum, r) => sum + r.score, 0) / successful.length
        );
        console.log(`📈 Average Quality Score: ${avgScore}%`);
        
        const generationMethods = successful.reduce((acc, r) => {
            acc[r.generatedWith] = (acc[r.generatedWith] || 0) + 1;
            return acc;
        }, {});
        
        console.log(`🔧 Generation Methods:`);
        Object.entries(generationMethods).forEach(([method, count]) => {
            console.log(`   ${method}: ${count} tests`);
        });
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ Failed Tests:`);
        failed.forEach(r => {
            console.log(`   ${r.name}: ${r.error}`);
        });
    }
    
    console.log('\n🎯 Enhanced fallback template system test completed!');
}

// Run the tests
runFallbackTests().catch(console.error);
