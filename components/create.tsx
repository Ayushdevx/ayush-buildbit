'use client'

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from 'next/navigation';
import Editor from "@/components/editor/editor";
import Loading from "@/components/loading/loading";

export function CreateComponent(){
    const searchParams = useSearchParams();
    const prompt = searchParams.get('prompt');
    const [html, setHtml] = useState('');
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(()=> {
        if (hasFetched.current) return; // Skip if already fetched
        hasFetched.current = true;
        const fetchData = async () => { // Encapsulate the fetch logic
            setLoading(true);
            try {
                const response = await fetch("/api/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ prompt: prompt })
                });

                if (!response.ok) {
                    // Get more information from the error response
                    const errorText = await response.text();
                    console.error("Error response:", errorText);
                    try {
                        const errorJson = JSON.parse(errorText);
                        throw new Error(`Server error: ${errorJson.error || errorText}`);
                    } catch (e) {
                        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                    }
                }
                const htmlContent = await response.json();
                setHtml(htmlContent.content);
                setId(htmlContent.id);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Set error state to show appropriate message to user
                setError(error instanceof Error ? error.message : "Failed to generate website. Please try again.");
                setHtml("<div>Error loading content. Please try again.</div>");
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Call the function
    }, [prompt]); // Dependency array: only re-run if 'prompt' changes

    if (loading) {
        return <Loading text={"Creating your website with Gemini AI..."}/>
    }
    
    // Show error message if there was a problem 
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-8">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Generation Error</h2>
                <p className="mb-6 text-center max-w-md">{error}</p>
                <button 
                    onClick={() => {
                        setError(null);
                        hasFetched.current = false;
                        setLoading(true);
                        // Retry once more
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return <div>
        <Editor initialHtml={html} setHtml={setHtml} id={id}/>
    </div>
}
