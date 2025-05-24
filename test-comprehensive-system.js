#!/usr/bin/env node

/**
 * Final comprehensive test to verify complete Gemini 2.0 Flash + Enhanced Fallback system
 * This tests both successful API calls and fallback scenarios
 */

const axios = require('axios');
const fs = require('fs');

// Test cases covering different scenarios
const comprehensiveTestCases = [
    {
        name: "C'est La Visa - Complex Visa Service",
        prompt: "Create a comprehensive website for \"C'est La Visa\" - a premium France/Schengen visa consultation service. Include detailed visa types (tourist, business, student, family reunion), success stories, multilingual support (French, English, Arabic, Spanish), expert consultation team with 15+ years experience, 95% approval rate statistics, process workflow, document preparation assistance, interview coaching, and contact information for Paris office at +33 1 23 45 67 89. Design should be professional with French-inspired colors and government-like trustworthiness.",
        category: "Complex Business Service",
        expectedElements: ["visa", "france", "schengen", "consultation", "approval rate", "multilingual"]
    },
    {
        name: "Luxury Italian Restaurant",
        prompt: "Design an elegant website for \"Ristorante Bellissimo\" - a luxury Italian restaurant in Paris featuring authentic Tuscan cuisine, wine cellar with 300+ selections, private dining rooms, chef's table experience, and Michelin-starred quality. Include online reservations, event booking, menu showcase, chef biography, and wine pairing recommendations.",
        category: "Restaurant & Hospitality",
        expectedElements: ["restaurant", "menu", "reservation", "dining", "luxury"]
    },
    {
        name: "Creative Design Agency",
        prompt: "Build a stunning portfolio website for \"Pixel Perfect Studio\" - a creative design agency specializing in brand identity, web design, mobile apps, and digital marketing. Showcase portfolio projects, team expertise, client testimonials, creative process, and modern case studies with before/after comparisons.",
        category: "Creative & Portfolio",
        expectedElements: ["portfolio", "design", "creative", "agency", "projects"]
    },
    {
        name: "E-commerce Tech Store",
        prompt: "Create a modern e-commerce website for \"TechNova\" selling premium electronics, smart home devices, gaming gear, and accessories. Include product catalog, shopping cart, user reviews, fast shipping options, warranty information, and customer support chat.",
        category: "E-commerce & Retail",
        expectedElements: ["shop", "products", "cart", "reviews", "electronics"]
    },
    {
        name: "SaaS Project Management",
        prompt: "Develop a professional website for \"FlowMaster Pro\" - a SaaS project management platform with team collaboration, real-time analytics, task automation, and integrations. Include pricing tiers, feature comparisons, free trial signup, and customer success stories.",
        category: "SaaS & Technology",
        expectedElements: ["saas", "software", "platform", "features", "pricing"]
    }
];

// Function to analyze generated content quality
function analyzeContentQuality(content, testCase) {
    const lowerContent = content.toLowerCase();
    
    // Check for expected elements
    const foundElements = testCase.expectedElements.filter(element => 
        lowerContent.includes(element.toLowerCase())
    );
    
    // Check for modern web features
    const modernFeatures = [
        'tailwind', 'responsive', 'gradient', 'shadow', 'rounded',
        'transition', 'hover:', 'flex', 'grid', 'mobile', 'desktop'
    ];
    const foundModernFeatures = modernFeatures.filter(feature => 
        lowerContent.includes(feature)
    );
    
    // Check for semantic HTML
    const semanticElements = [
        '<header', '<nav', '<main', '<section', '<article', 
        '<aside', '<footer', 'role=', 'aria-'
    ];
    const foundSemanticElements = semanticElements.filter(element => 
        lowerContent.includes(element)
    );
    
    // Check for accessibility features
    const accessibilityFeatures = [
        'alt=', 'aria-', 'role=', 'tabindex', 'focus:', 'sr-only'
    ];
    const foundAccessibilityFeatures = accessibilityFeatures.filter(feature => 
        lowerContent.includes(feature)
    );
    
    // Calculate scores
    const elementScore = (foundElements.length / testCase.expectedElements.length) * 100;
    const modernScore = (foundModernFeatures.length / modernFeatures.length) * 100;
    const semanticScore = (foundSemanticElements.length / semanticElements.length) * 100;
    const accessibilityScore = (foundAccessibilityFeatures.length / accessibilityFeatures.length) * 100;
    
    const overallScore = Math.round((elementScore + modernScore + semanticScore + accessibilityScore) / 4);
    
    return {
        elementScore: Math.round(elementScore),
        modernScore: Math.round(modernScore),
        semanticScore: Math.round(semanticScore),
        accessibilityScore: Math.round(accessibilityScore),
        overallScore,
        foundElements,
        foundModernFeatures: foundModernFeatures.length,
        foundSemanticElements: foundSemanticElements.length,
        foundAccessibilityFeatures: foundAccessibilityFeatures.length
    };
}

// Function to test a single case
async function testSingleCase(testCase, testNumber, totalTests) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST ${testNumber}/${totalTests}: ${testCase.name}`);
    console.log(`📂 Category: ${testCase.category}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📝 Prompt: ${testCase.prompt.substring(0, 150)}...`);
    
    const startTime = Date.now();
    
    try {
        const response = await axios.post('http://localhost:3002/api/create', {
            prompt: testCase.prompt
        }, {
            timeout: 120000, // 2 minutes timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        if (response.status === 200) {
            const result = response.data;
            
            console.log(`⏱️  Response Time: ${responseTime} seconds`);
            console.log(`✅ SUCCESS: Generated with ${result.generatedWith}`);
            console.log(`📏 HTML Length: ${result.stats.htmlLength} characters`);
            console.log(`🖼️  Images: ${result.stats.imageCount}`);
            console.log(`📦 Sections: ${result.stats.sectionsCount}`);
            
            // Analyze content quality
            const analysis = analyzeContentQuality(result.content, testCase);
            
            console.log(`\n📊 QUALITY ANALYSIS:`);
            console.log(`   Expected Elements: ${analysis.elementScore}% (${analysis.foundElements.length}/${testCase.expectedElements.length})`);
            console.log(`   Modern Features: ${analysis.modernScore}% (${analysis.foundModernFeatures} found)`);
            console.log(`   Semantic HTML: ${analysis.semanticScore}% (${analysis.foundSemanticElements} found)`);
            console.log(`   Accessibility: ${analysis.accessibilityScore}% (${analysis.foundAccessibilityFeatures} found)`);
            console.log(`   🎯 OVERALL SCORE: ${analysis.overallScore}%`);
            
            if (analysis.foundElements.length > 0) {
                console.log(`   ✅ Found Elements: ${analysis.foundElements.join(', ')}`);
            }
            
            const missingElements = testCase.expectedElements.filter(el => 
                !analysis.foundElements.includes(el)
            );
            if (missingElements.length > 0) {
                console.log(`   ❌ Missing Elements: ${missingElements.join(', ')}`);
            }
            
            // Check if it's using Gemini API or fallback
            const usingGemini = result.generatedWith === "Gemini API";
            console.log(`🔧 Generation Method: ${usingGemini ? '🤖 Gemini 2.0 Flash' : '🛡️ Enhanced Fallback'}`);
            
            return {
                success: true,
                name: testCase.name,
                category: testCase.category,
                responseTime: parseFloat(responseTime),
                generatedWith: result.generatedWith,
                htmlLength: result.stats.htmlLength,
                imageCount: result.stats.imageCount,
                sectionsCount: result.stats.sectionsCount,
                qualityScore: analysis.overallScore,
                elementScore: analysis.elementScore,
                modernScore: analysis.modernScore,
                semanticScore: analysis.semanticScore,
                accessibilityScore: analysis.accessibilityScore
            };
        }
    } catch (error) {
        const endTime = Date.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log(`⏱️  Response Time: ${responseTime} seconds`);
        console.log(`❌ FAILED: ${error.message}`);
        
        if (error.response) {
            console.log(`📊 Status: ${error.response.status}`);
            console.log(`📝 Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        
        return {
            success: false,
            name: testCase.name,
            category: testCase.category,
            responseTime: parseFloat(responseTime),
            error: error.message
        };
    }
}

// Main test runner
async function runComprehensiveTests() {
    console.log('🚀 COMPREHENSIVE GEMINI 2.0 FLASH + ENHANCED FALLBACK SYSTEM TEST');
    console.log('================================================================');
    console.log('Testing complete system with complex prompts and quality analysis...\n');
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log(`🧪 Running ${comprehensiveTestCases.length} comprehensive tests\n`);
    
    const results = [];
    
    for (let i = 0; i < comprehensiveTestCases.length; i++) {
        const testCase = comprehensiveTestCases[i];
        const result = await testSingleCase(testCase, i + 1, comprehensiveTestCases.length);
        results.push(result);
        
        // Wait between tests to avoid overwhelming the server
        if (i < comprehensiveTestCases.length - 1) {
            console.log(`\n⏳ Waiting 3 seconds before next test...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // Generate comprehensive summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log(`${'='.repeat(80)}`);
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful Tests: ${successful.length}/${results.length} (${Math.round(successful.length/results.length*100)}%)`);
    console.log(`❌ Failed Tests: ${failed.length}/${results.length} (${Math.round(failed.length/results.length*100)}%)`);
    
    if (successful.length > 0) {
        const avgResponseTime = (successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length).toFixed(2);
        const avgQualityScore = Math.round(successful.reduce((sum, r) => sum + r.qualityScore, 0) / successful.length);
        const avgHtmlLength = Math.round(successful.reduce((sum, r) => sum + r.htmlLength, 0) / successful.length);
        
        console.log(`\n⏱️  Average Response Time: ${avgResponseTime} seconds`);
        console.log(`🎯 Average Quality Score: ${avgQualityScore}%`);
        console.log(`📏 Average HTML Length: ${avgHtmlLength} characters`);
        
        // Generation method breakdown
        const generationMethods = successful.reduce((acc, r) => {
            acc[r.generatedWith] = (acc[r.generatedWith] || 0) + 1;
            return acc;
        }, {});
        
        console.log(`\n🔧 Generation Methods:`);
        Object.entries(generationMethods).forEach(([method, count]) => {
            const percentage = Math.round((count / successful.length) * 100);
            console.log(`   ${method}: ${count}/${successful.length} (${percentage}%)`);
        });
        
        // Quality breakdown
        const avgElementScore = Math.round(successful.reduce((sum, r) => sum + r.elementScore, 0) / successful.length);
        const avgModernScore = Math.round(successful.reduce((sum, r) => sum + r.modernScore, 0) / successful.length);
        const avgSemanticScore = Math.round(successful.reduce((sum, r) => sum + r.semanticScore, 0) / successful.length);
        const avgAccessibilityScore = Math.round(successful.reduce((sum, r) => sum + r.accessibilityScore, 0) / successful.length);
        
        console.log(`\n📊 Quality Breakdown:`);
        console.log(`   Expected Elements: ${avgElementScore}%`);
        console.log(`   Modern Features: ${avgModernScore}%`);
        console.log(`   Semantic HTML: ${avgSemanticScore}%`);
        console.log(`   Accessibility: ${avgAccessibilityScore}%`);
        
        // Category performance
        const categoryPerformance = {};
        successful.forEach(r => {
            if (!categoryPerformance[r.category]) {
                categoryPerformance[r.category] = [];
            }
            categoryPerformance[r.category].push(r.qualityScore);
        });
        
        console.log(`\n📂 Performance by Category:`);
        Object.entries(categoryPerformance).forEach(([category, scores]) => {
            const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
            console.log(`   ${category}: ${avgScore}% (${scores.length} tests)`);
        });
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ Failed Tests Details:`);
        failed.forEach(r => {
            console.log(`   ${r.name}: ${r.error}`);
        });
    }
    
    console.log(`\n⏰ Completed at: ${new Date().toLocaleString()}`);
    console.log(`\n🎯 FINAL ASSESSMENT:`);
    
    if (successful.length === results.length) {
        console.log(`   🏆 EXCELLENT: All tests passed! System is working perfectly.`);
    } else if (successful.length >= results.length * 0.8) {
        console.log(`   ✅ GOOD: Most tests passed. System is working well.`);
    } else if (successful.length >= results.length * 0.5) {
        console.log(`   ⚠️  MODERATE: Some issues detected. Review failed tests.`);
    } else {
        console.log(`   ❌ CRITICAL: Major issues detected. System needs attention.`);
    }
    
    const avgQuality = successful.length > 0 ? Math.round(successful.reduce((sum, r) => sum + r.qualityScore, 0) / successful.length) : 0;
    
    if (avgQuality >= 80) {
        console.log(`   🌟 Content Quality: EXCELLENT (${avgQuality}%)`);
    } else if (avgQuality >= 60) {
        console.log(`   ✅ Content Quality: GOOD (${avgQuality}%)`);
    } else if (avgQuality >= 40) {
        console.log(`   ⚠️  Content Quality: MODERATE (${avgQuality}%)`);
    } else {
        console.log(`   ❌ Content Quality: NEEDS IMPROVEMENT (${avgQuality}%)`);
    }
    
    console.log(`\n🎉 Gemini 2.0 Flash + Enhanced Fallback System Test Complete!`);
}

// Run the comprehensive tests
runComprehensiveTests().catch(console.error);
