import { NextRequest } from "next/server";
import { getProject, hasProject, listProjects } from "@/lib/localStore";

/**
 * Create a standardized API response
 */
function createApiResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

/**
 * GET handler for project statistics
 * Returns aggregated stats about projects in the system
 */
export async function GET(request: NextRequest) {
    try {
        const startTime = performance.now();
        
        // Get all projects
        const projects = listProjects();
        
        // Calculate basic stats
        const totalProjects = projects.length;
        let totalContentSize = 0;
        let largestProject = { id: "", size: 0 };
        let smallestProject = { id: "", size: Number.MAX_SAFE_INTEGER };
        let totalUpdates = 0;
        
        // Last 24 hours stats
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        let projectsUpdatedLast24Hours = 0;
        
        // Process each project
        for (const project of projects) {
            // Calculate content size (if available)
            const contentSize = project.contentSize || 
                (project.content ? new TextEncoder().encode(project.content).length : 0);
            
            totalContentSize += contentSize;
            
            // Track largest and smallest
            if (contentSize > largestProject.size) {
                largestProject = { id: project.id, size: contentSize };
            }
            
            if (contentSize < smallestProject.size) {
                smallestProject = { id: project.id, size: contentSize };
            }
            
            // Check for recent updates
            if (project.updatedAt) {
                totalUpdates++;
                const updateDate = new Date(project.updatedAt);
                if (updateDate >= last24Hours) {
                    projectsUpdatedLast24Hours++;
                }
            }
        }
        
        // If no projects, reset smallest project info
        if (totalProjects === 0) {
            smallestProject = { id: "", size: 0 };
        }
        
        // Format statistics
        const stats = {
            totalProjects,
            totalContentSizeBytes: totalContentSize,
            totalContentSizeMB: (totalContentSize / (1024 * 1024)).toFixed(2),
            averageProjectSizeBytes: totalProjects > 0 ? Math.round(totalContentSize / totalProjects) : 0,
            largestProject: {
                id: largestProject.id,
                sizeBytes: largestProject.size,
                sizeKB: (largestProject.size / 1024).toFixed(2)
            },
            smallestProject: {
                id: smallestProject.id,
                sizeBytes: smallestProject.size,
                sizeKB: (smallestProject.size / 1024).toFixed(2)
            },
            updateStats: {
                totalUpdates,
                projectsUpdatedLast24Hours,
                percentUpdatedLast24Hours: totalProjects > 0 
                    ? ((projectsUpdatedLast24Hours / totalProjects) * 100).toFixed(1) 
                    : "0"
            }
        };
        
        const duration = performance.now() - startTime;
        
        return createApiResponse({
            success: true,
            stats,
            meta: {
                generatedAt: new Date().toISOString(),
                processingTimeMs: Math.round(duration)
            }
        });
    } catch (error) {
        console.error("Error generating project statistics:", error);
        
        const errorInfo = error instanceof Error ? 
            { message: error.message, name: error.name } : 
            { message: "Unknown error occurred" };
            
        return createApiResponse({ 
            error: "Failed to generate project statistics",
            details: errorInfo
        }, 500);
    }
}
