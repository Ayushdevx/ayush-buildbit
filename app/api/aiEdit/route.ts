import { editSchema } from "@/lib/zodSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { NextRequest } from "next/server";
import { getProject, hasProject, saveProject } from "@/lib/localStore";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { success } = editSchema.safeParse(body);

    if (!success) {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    // Simplify the prompt for better reliability
    const prompt = `Edit this HTML based on the following request: "${body.prompt}".
    Apply the changes to this HTML: ${body.html}
    Return the complete HTML document with your changes.
    Start with <!DOCTYPE html> and end with </html>.`


    try {
        // Validate API key is available
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not defined in environment");
            return new Response(JSON.stringify({ error: "API key configuration error" }), { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                maxOutputTokens: 8192,           // Token limit for response
                temperature: 0.4,                // Lower temperature for edits to maintain consistency
                topK: 40,                        // Consider top 40 tokens for diversity
                topP: 0.95                       // Sample from 95% of probability mass
            }
        });
        
        // Set a timeout for the API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        let site = "";
        try {
            console.log("Making request to Gemini API for edit...");
            
            // Simplify the prompt for better reliability
            const simplifiedPrompt = `Edit this HTML based on the following request: "${body.prompt}".
            Apply the changes to this HTML: ${body.html}
            Return the complete HTML document with your changes.
            Start with <!DOCTYPE html> and end with </html>.`;
            
            // Generate content with timeout but without safety settings
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: simplifiedPrompt }] }],
                generationConfig: {
                    stopSequences: ["```"],  // Avoid code block markers
                    temperature: 0.3         // Lower temperature for more predictable edits
                }
                // Removed safety settings as they may be causing empty responses
            }, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            
            // Check for empty response instead of using promptFeedback
            if (!result.response || !result.response.text()) {
                throw new Error("Gemini API returned an empty response");
            }
            
            // Extract and clean up the response text
            site = result.response.text();
            
            // Limit the size of the response if it's too large
            if (site.length > 500000) {
                site = site.substring(0, 500000); // Truncate to avoid memory issues
                console.warn("Generated site was truncated to 500KB to avoid memory issues");
            }
        } catch (genError: any) {  // Using any for error handling
            clearTimeout(timeoutId);
            if (genError.name === "AbortError") {
                throw new Error("Gemini API request timed out after 60 seconds");
            }
            throw genError;
        }
           
        // Clean up response
        site = site.replace(/```html\s*/g, ""); // Remove at start
        site = site.replace(/\s*```/g, ""); // Remove at end
        
        // Ensure the response starts with DOCTYPE declaration
        if (!site.includes("<!DOCTYPE html") && !site.includes("<!doctype html")) {
            site = "<!DOCTYPE html>\n" + site;
        }
        
        // Validate Pexels image URLs with timeout
        const imageUrls = site.match(/https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg/g) || [];
        const validationPromises = imageUrls.map(async (url) => {
            try {
                // Set a short timeout for image validation
                await axios.head(url, { timeout: 2000 });
                return { url, valid: true };
            } catch {
                return { url, valid: false };
            }
        });
        
        // Process images in parallel with a short timeout
        const results = await Promise.allSettled(validationPromises);
        
        // Replace invalid images with verified fallbacks
        results.forEach(result => {
            if (result.status === "fulfilled" && !result.value.valid) {
                site = site.replace(result.value.url, "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg");
            }
        });
        
        // If the ID was provided, update the project in the local store
        if (body.id && hasProject(body.id)) {
            const existingProject = getProject(body.id);
            
            // Update the project with the edited content
            saveProject(body.id, {
                ...existingProject,
                content: site,
                updatedAt: new Date().toISOString(),
                lastEditPrompt: body.prompt
            });
        }
    
        return new Response(JSON.stringify(site), { 
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
        } catch (error) {
            console.error("Error in aiEdit route:", error);
            return new Response(`Error: ${error instanceof Error ? error.message : "Internal server error"}`, { status: 500 });
        }
}