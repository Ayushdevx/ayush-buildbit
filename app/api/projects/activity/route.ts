import { NextRequest } from "next/server";
import { getProjectEvents } from "@/lib/localStore";

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
 * GET handler for project activity
 * Returns a history of project-related events (create, update, delete)
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        
        // Parse query parameters
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const projectId = url.searchParams.get('projectId') || null;
        const eventType = url.searchParams.get('eventType') || null;
        
        // Get project events (already sorted by most recent first)
        let events = getProjectEvents(limit);
        
        // Filter by project ID if specified
        if (projectId) {
            events = events.filter(event => event.id === projectId);
        }
        
        // Filter by event type if specified
        if (eventType && ['create', 'update', 'delete'].includes(eventType)) {
            events = events.filter(event => event.type === eventType);
        }
        
        // Calculate some basic statistics
        const stats = {
            total: events.length,
            byType: {
                create: events.filter(e => e.type === 'create').length,
                update: events.filter(e => e.type === 'update').length,
                delete: events.filter(e => e.type === 'delete').length
            }
        };
        
        return createApiResponse({
            success: true,
            events,
            stats,
            meta: {
                filters: {
                    projectId,
                    eventType,
                    limit
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error retrieving project activity:", error);
        
        const errorInfo = error instanceof Error ? 
            { message: error.message, name: error.name } : 
            { message: "Unknown error occurred" };
            
        return createApiResponse({ 
            error: "Failed to retrieve project activity",
            details: errorInfo
        }, 500);
    }
}
