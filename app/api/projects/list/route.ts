import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/localStore";

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

export async function GET(request: NextRequest) {
  try {
    const startTime = performance.now();
    
    // Parse query parameters
    const url = new URL(request.url);
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const search = url.searchParams.get('search')?.toLowerCase() || '';
    
    // Get all projects from our local store
    let projects = listProjects();
    
    // Apply search filter if provided
    if (search) {
      projects = projects.filter(project => {
        return (
          project.id?.toLowerCase().includes(search) ||
          project.name?.toLowerCase().includes(search) ||
          project.content?.toLowerCase().includes(search)
        );
      });
    }
    
    // Sort projects based on query parameters
    projects.sort((a, b) => {
      // Handle missing values
      if (!a[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (!b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      
      // Date sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Size-based sorting
      if (sortBy === 'contentSize') {
        const sizeA = a.contentSize || (a.content ? new TextEncoder().encode(a.content).length : 0);
        const sizeB = b.contentSize || (b.content ? new TextEncoder().encode(b.content).length : 0);
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
      
      // Default string/number sorting
      if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
        return sortOrder === 'asc' 
          ? a[sortBy].localeCompare(b[sortBy])
          : b[sortBy].localeCompare(a[sortBy]);
      }
      
      // Fallback for numerical sorting
      return sortOrder === 'asc' ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
    });
    
    // Apply pagination
    const paginatedProjects = projects.slice(offset, offset + limit);
    
    // Calculate processing time
    const duration = performance.now() - startTime;
    
    return createApiResponse({
      success: true,
      projects: paginatedProjects,
      pagination: {
        total: projects.length,
        filtered: paginatedProjects.length,
        offset,
        limit,
        hasMore: offset + limit < projects.length
      },
      meta: {
        filters: {
          sortBy,
          sortOrder,
          search: search || undefined
        },
        processingTimeMs: Math.round(duration),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    
    const errorInfo = error instanceof Error ? 
      { message: error.message, name: error.name } : 
      { message: "Unknown error occurred" };
      
    return createApiResponse({ 
      error: "Failed to fetch projects",
      details: errorInfo
    }, 500);
  }
}
