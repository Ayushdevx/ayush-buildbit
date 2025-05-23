import { NextRequest } from "next/server";
import { listProjects } from "@/lib/localStore";

/**
 * GET handler for API health check
 * This endpoint allows monitoring systems to verify the API is functioning properly
 */
export async function GET(request: NextRequest) {
    const startTime = performance.now();
    
    try {
        // Check basic functionality by listing projects
        const projects = listProjects();
        
        // Get memory usage statistics
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        return new Response(JSON.stringify({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
            version: "1.0.0", // This should be read from package.json in production
            stats: {
                projects: projects.length,
                responseTime: `${responseTime}ms`,
                uptime: `${Math.floor(uptime / 60)} minutes`,
                memory: {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
                }
            }
        }), { 
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache" 
            }
        });
    } catch (error) {
        console.error("Health check failed:", error);
        
        return new Response(JSON.stringify({
            status: "error",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error",
            responseTime: `${Math.round(performance.now() - startTime)}ms`
        }), { 
            status: 503,
            headers: { 
                "Content-Type": "application/json",
                "Cache-Control": "no-cache"
            }
        });
    }
}
