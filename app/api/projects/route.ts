import { NextRequest } from "next/server";
import { getProject, hasProject, saveProject, deleteProject, getProjectEvents } from "@/lib/localStore";
import { createApiResponse, successResponse, errorResponse, handleApiError } from "@/lib/apiUtils";

// Helper function to validate project IDs
function validateProjectId(id: any): { valid: boolean; error?: string } {
  if (!id) {
    return { valid: false, error: "Project ID is required" };
  }
  
  if (typeof id !== 'string' || id.trim() === '') {
    return { valid: false, error: "Project ID must be a non-empty string" };
  }
  
  return { valid: true };
}

// Security utilities for the API endpoints

// In-memory store for rate limiting (would use Redis in production)
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

/**
 * Apply CORS headers to the response
 * @param response The response to modify with CORS headers
 * @returns The modified response
 */
function applyCorsHeaders(response: Response): Response {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*'); // Restrict in production
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    newHeaders.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

/**
 * Check if a request is rate-limited
 * @param ip The IP address or identifier to check
 * @param limit The maximum number of requests allowed per window
 * @param windowMs The time window in milliseconds
 * @returns Object containing whether the request is allowed and rate limit info
 */
function checkRateLimit(ip: string, limit = 100, windowMs = 60000): { allowed: boolean, remaining: number, resetIn: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);
    
    // If no record exists or the window has expired, create a new one
    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: limit - 1, resetIn: windowMs };
    }
    
    // If the limit has been reached, deny the request
    if (record.count >= limit) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }
    
    // Increment the count and allow the request
    record.count++;
    rateLimitStore.set(ip, record);
    return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*', // Restrict in production
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400' // 24 hours
        }
    });
}

export async function POST(request: NextRequest) {
    // Request validation
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return errorResponse("Invalid request format", "INVALID_REQUEST", 400);
    }
    
    const { id } = body;
    const idValidation = validateProjectId(id);
    
    if (!idValidation.valid) {
        return errorResponse(idValidation.error || "Invalid project ID", "INVALID_ID", 400);
    }
    
    // Check if the project exists in our local store
    if (!hasProject(id)) {
        return errorResponse(`Project with ID ${id} not found`, "NOT_FOUND", 404, { requestedId: id });
    }
    
    // Performance measurement
    const startTime = performance.now();
    const project = getProject(id);
    const duration = performance.now() - startTime;
    
    // Log performance metrics for monitoring
    console.log(`Retrieved project ${id} in ${duration.toFixed(2)}ms`);
    
    return successResponse({
        project,
        meta: {
            requestId: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        }
    });
}

export async function PUT(request: NextRequest) {
    // Request validation
    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error("Failed to parse request body:", error);
        return createApiResponse({ error: "Invalid request format" }, 400);
    }
    
    const { id, completeHtml } = body;
    
    // Validate project ID
    const idValidation = validateProjectId(id);
    if (!idValidation.valid) {
        return createApiResponse({ error: idValidation.error }, 400);
    }
    
    // Validate HTML content
    if (typeof completeHtml === 'undefined') {
        return createApiResponse({ error: "HTML content is required" }, 400);
    }
    
    // Additional validation for extremely large content
    const contentSize = new TextEncoder().encode(completeHtml).length;
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit
    
    if (contentSize > maxSizeBytes) {
        console.warn(`Project ${id} content size (${contentSize} bytes) exceeds recommended limit of ${maxSizeBytes} bytes`);
        // Continue but log a warning - could enforce size limit if needed
    }
    
    try {
        // Measure performance
        const startTime = performance.now();
        let projectData;
        let statusCode = 200; // Default to OK for updates
        let operation = "updated";

        if (hasProject(id)) {
            // Project exists, update it
            const existingProject = getProject(id);
            projectData = {
                ...existingProject, // Preserve other fields like name, createdAt
                content: completeHtml,
                updatedAt: new Date().toISOString(),
                contentSize: contentSize // Store content size for analytics
            };
        } else {
            // Project does not exist, create it (upsert behavior)
            operation = "created";
            projectData = {
                id: id,
                name: `Project ${id}`, // Default name for a newly created project via PUT
                content: completeHtml,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                contentSize: contentSize,
                version: 1
            };
            statusCode = 201; // Created
        }
        
        // Save project and measure performance
        saveProject(id, projectData);
        const duration = performance.now() - startTime;
        
        console.log(`Project ${id} ${operation} in ${duration.toFixed(2)}ms (${(contentSize/1024).toFixed(2)}KB)`);

        return createApiResponse({
            success: true,
            project: projectData,
            operation: operation,
            meta: {
                requestId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                processingTimeMs: Math.round(duration)
            }
        }, statusCode);
    } catch (error) {
        console.error("Error creating/updating project:", error);
        
        // Enhanced error reporting
        const errorInfo = error instanceof Error ? 
            { message: error.message, name: error.name } : 
            { message: "Unknown error occurred" };
            
        return createApiResponse({ 
            error: "Failed to create/update project",
            details: errorInfo
        }, 500);
    }
}

export async function DELETE(request: NextRequest) {
    // Extract the project ID from the URL query parameters
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    
    // Ensure ID is not null
    if (!idParam) {
        return createApiResponse({ error: "Project ID is required as a query parameter" }, 400);
    }
    
    const id = idParam; // Now id is definitely a string, not null
    
    // Validate project ID
    const idValidation = validateProjectId(id);
    if (!idValidation.valid) {
        return createApiResponse({ error: idValidation.error }, 400);
    }
    
    // Check if project exists
    if (!hasProject(id)) {
        return createApiResponse({ error: "Project not found" }, 404);
    }
    
    try {
        // In production, we would implement proper deletion
        // For demo purposes using in-memory store, we'll simulate project deletion
        // by removing it from the map in localStore.ts
        
        // Get a reference to the project before deletion for the response
        const project = getProject(id); // Now id is guaranteed to be a string
        
        // Delete the project using our new function
        const deleted = deleteProject(id);
        
        // Log the result
        console.log(`Project ${id} deletion ${deleted ? 'successful' : 'failed'}`);
        
        return createApiResponse({
            success: true,
            message: "Project deleted successfully",
            projectId: id,
            meta: {
                requestId: crypto.randomUUID(),
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        
        const errorInfo = error instanceof Error ? 
            { message: error.message, name: error.name } : 
            { message: "Unknown error occurred" };
            
        return createApiResponse({ 
            error: "Failed to delete project",
            details: errorInfo
        }, 500);
    }
}

/**
 * PATCH handler for bulk operations on projects
 * This could be used for operations like:
 * - Bulk update of project metadata
 * - Tagging multiple projects
 * - Changing status of multiple projects
 */
export async function PATCH(request: NextRequest) {
    // Request validation
    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error("Failed to parse request body:", error);
        return createApiResponse({ error: "Invalid request format" }, 400);
    }
    
    const { operation, projectIds, data } = body;
    
    if (!operation || !Array.isArray(projectIds) || projectIds.length === 0) {
        return createApiResponse({ 
            error: "Invalid request format. Required fields: operation, projectIds (array)" 
        }, 400);
    }
    
    // Validate all project IDs
    const invalidIds = projectIds.filter(id => !validateProjectId(id).valid);
    if (invalidIds.length > 0) {
        return createApiResponse({ 
            error: "One or more project IDs are invalid", 
            invalidIds 
        }, 400);
    }
    
    // Handle different bulk operations
    try {
        const startTime = performance.now();
        const results: { successful: string[], failed: {id: string, reason: string}[] } = { 
            successful: [], 
            failed: [] 
        };
        
        switch (operation) {
            case 'tag':
                // Example: Add tags to multiple projects
                if (!data?.tags || !Array.isArray(data.tags)) {
                    return createApiResponse({ error: "Tags array is required for 'tag' operation" }, 400);
                }
                
                for (const id of projectIds) {
                    if (hasProject(id)) {
                        const project = getProject(id);
                        // In a real implementation, we would update the project with tags
                        // project.tags = [...(project.tags || []), ...data.tags];
                        // saveProject(id, project);
                        
                        // For now, just log it
                        console.log(`Would add tags ${data.tags.join(', ')} to project ${id}`);
                        results.successful.push(id);
                    } else {
                        results.failed.push({ id, reason: "Project not found" });
                    }
                }
                break;
                
            case 'archive':
                // Example: Archive multiple projects
                for (const id of projectIds) {
                    if (hasProject(id)) {
                        const project = getProject(id);
                        // In a real implementation:
                        // project.archived = true;
                        // project.archivedAt = new Date().toISOString();
                        // saveProject(id, project);
                        
                        console.log(`Would archive project ${id}`);
                        results.successful.push(id);
                    } else {
                        results.failed.push({ id, reason: "Project not found" });
                    }
                }
                break;
                
            default:
                return createApiResponse({ error: `Unsupported operation: ${operation}` }, 400);
        }
        
        const duration = performance.now() - startTime;
        
        return createApiResponse({
            success: true,
            operation,
            results,
            meta: {
                requestId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                processingTimeMs: Math.round(duration)
            }
        });
    } catch (error) {
        console.error(`Error in bulk ${operation} operation:`, error);
        
        const errorInfo = error instanceof Error ? 
            { message: error.message, name: error.name } : 
            { message: "Unknown error occurred" };
            
        return createApiResponse({ 
            error: `Failed to perform bulk ${operation}`,
            details: errorInfo
        }, 500);
    }
}