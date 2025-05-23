import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest } from "next/server";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { saveProject } from "@/lib/localStore";

// Initialize Gemini API with the API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables");
}
const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * Generate a high-quality website using Gemini API based on a user prompt
 * @param prompt User's description of the desired website
 * @returns Generated HTML code for the website
 */
async function generateWebsiteWithGemini(prompt: string): Promise<string> {
  try {
    console.log(`Generating website with Gemini for prompt: "${prompt}"`);
    
    // Define a system prompt for high-quality website generation
    const systemPrompt = `You are an expert web designer and developer who specializes in creating beautiful, responsive websites with modern designs.
    
Task: Generate a complete, production-ready HTML file based on the following user request.

Requirements:
- Create a single HTML file with embedded CSS (using Tailwind CSS).
- The site should be fully responsive and work well on mobile, tablet, and desktop.
- Include appropriate semantic HTML5 elements (header, nav, main, section, article, aside, footer).
- Use Tailwind CSS for styling (already linked via CDN: https://cdn.tailwindcss.com).
- Create a beautiful, modern, professional design with appealing color schemes that match the site's purpose.
- Include realistic placeholder content relevant to the site's purpose.
- Ensure all sections are well-organized with proper spacing and typography.
- Add subtle animations or hover effects where appropriate (using Tailwind's transition classes).
- Implement a user-friendly navigation system with mobile responsiveness.
- Add a functioning contact form in a relevant section.
- Include appropriate meta tags for SEO.
- Add social media links in the footer.
- No external JavaScript dependencies except Tailwind CSS CDN.
- Include a favicon link (can use a generic one).
- Use modern UI/UX patterns appropriate for the website type.

Color Scheme:
- Choose a cohesive color palette (3-5 colors) that suits the website's purpose.
- Use these colors consistently throughout the site.
- Ensure sufficient contrast for accessibility.

Layout Best Practices:
- Use a clean, grid-based layout system.
- Follow visual hierarchy principles.
- Maintain balanced white space.
- Use Tailwind's container classes for content width management.

Return ONLY the complete HTML code without any explanations or markdown.`;

    // Get Gemini Pro model with optimized settings
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7, // Balanced between creativity and consistency
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
    });

    // Generate content with structured prompt
    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { text: `User request: "${prompt}". Create a complete, beautiful website for this purpose.` }
        ]
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log(`Successfully generated website with Gemini (${text.length} bytes)`);
    
    // Ensure response starts with <!DOCTYPE html> if it doesn't
    if (!text.trimStart().toLowerCase().startsWith("<!doctype html>")) {
      console.warn("Generated HTML doesn't start with doctype declaration, adding it");
      return `<!DOCTYPE html>\n${text}`;
    }
    
    return text;  } catch (error) {
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
    }

    // Function to generate a basic fallback HTML template when Gemini fails
    function generateFallbackTemplate(userPrompt: string): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${userPrompt}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <header class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <nav class="container mx-auto flex justify-between items-center p-4">
            <div class="font-bold text-xl">Brand</div>
            <ul class="flex space-x-4 md:flex hidden">
                <li><a href="#hero" class="hover:text-blue-200">Home</a></li>
                <li><a href="#about" class="hover:text-blue-200">About</a></li>
                <li><a href="#services" class="hover:text-blue-200">Services</a></li>
                <li><a href="#contact" class="hover:text-blue-200">Contact</a></li>
            </ul>
            <div class="md:hidden">
                <button class="text-white">Menu</button>
            </div>
        </nav>
    </header>

    <section id="hero" class="bg-gray-900 text-white py-20">
        <div class="container mx-auto text-center">
            <h1 class="text-4xl font-bold mb-4">${userPrompt}</h1>
            <p class="text-xl mb-8">Welcome to our website! We're here to help you succeed.</p>
            <a href="#contact" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full">Get Started</a>
        </div>
    </section>

    <section id="about" class="py-16 bg-gray-100">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-8">About Us</h2>
            <div class="max-w-3xl mx-auto text-center">
                <p class="text-lg mb-6">We are dedicated to providing excellent service and products tailored to your needs. With years of experience in the industry, we have developed a unique approach that sets us apart.</p>
                <p class="text-lg">Our mission is to deliver outstanding results while maintaining the highest standards of quality and customer satisfaction.</p>
            </div>
        </div>
    </section>

    <section id="services" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-4">Service 1</h3>
                    <p>A comprehensive solution for all your needs with expert support and guidance.</p>
                </div>
                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-4">Service 2</h3>
                    <p>Innovative approaches to solving complex problems with cutting-edge technology.</p>
                </div>
                <div class="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-4">Service 3</h3>
                    <p>Customized solutions designed specifically for your unique requirements.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="py-16 bg-gray-800 text-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
            <div class="max-w-md mx-auto">
                <form>
                    <div class="mb-4">
                        <label class="block mb-2">Name</label>
                        <input type="text" class="w-full px-4 py-2 rounded text-gray-800" placeholder="Your name">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Email</label>
                        <input type="email" class="w-full px-4 py-2 rounded text-gray-800" placeholder="Your email">
                    </div>
                    <div class="mb-4">
                        <label class="block mb-2">Message</label>
                        <textarea class="w-full px-4 py-2 rounded text-gray-800" rows="4" placeholder="Your message"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full w-full">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="bg-gray-900 text-white py-8">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 ${userPrompt}. All rights reserved.</p>
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
            site = generateFallbackTemplate(body.prompt);
            generatedWith = "Fallback Template";
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
