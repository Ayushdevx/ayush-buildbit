/**
 * Simple test to verify Gemini API connectivity and key validity
 */

const API_KEY = "AIzaSyBExzCuezAUFMS20gjTLviDmlLw3cqGdL8"; // Using the key directly for testing

async function testGeminiAPI() {
    console.log('🔍 Testing Gemini API connectivity...\n');
    
    try {
        // Test the API endpoint directly with fetch
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Generate a simple HTML page with just a title 'Hello World' and a paragraph saying 'This is a test from Gemini API'"
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
            const text = result.candidates[0].content.parts[0].text;
            
            console.log('✅ SUCCESS: Gemini API is working correctly!\n');
            console.log('📄 Generated content:');
            console.log('=====================================');
            console.log(text);
            console.log('=====================================\n');
            console.log(`📊 Response length: ${text.length} characters`);
        } else {
            console.log('⚠️  WARNING: API responded but with unexpected format');
            console.log('Full response:', JSON.stringify(result, null, 2));
        }
        
    } catch (error) {
        console.log('❌ ERROR: Gemini API test failed');
        console.log('Error details:', error.message);
        
        if (error.message.includes('API key')) {
            console.log('\n💡 TROUBLESHOOTING: Check your API key');
            console.log('- Ensure GEMINI_API_KEY is set in .env file');
            console.log('- Verify the API key is valid and active');
            console.log('- Check if the API key has proper permissions');
        } else if (error.message.includes('quota')) {
            console.log('\n💡 TROUBLESHOOTING: API quota exceeded');
            console.log('- Check your Google AI Studio quota');
            console.log('- Wait for quota reset or upgrade your plan');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            console.log('\n💡 TROUBLESHOOTING: Network connectivity issue');
            console.log('- Check your internet connection');
            console.log('- Verify firewall settings');
            console.log('- Try again in a few minutes');
        } else {
            console.log('\n💡 TROUBLESHOOTING: Unknown error');
            console.log('- Check Google AI Studio service status');
            console.log('- Verify API key permissions');
            console.log('- Contact Google AI support if issue persists');
        }    }
}

testGeminiAPI();
