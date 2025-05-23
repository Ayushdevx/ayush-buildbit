// This file provides a simple in-memory store for projects when database access is not available
// It's a temporary solution for development without requiring database setup

// In-memory storage for projects
const localProjects = new Map<string, any>();

// Event-based tracking of project changes
const projectEvents: {
    id: string;
    type: 'create' | 'update' | 'delete';
    timestamp: string;
}[] = [];

export function saveProject(id: string, data: any) {
    const isNew = !localProjects.has(id);
    localProjects.set(id, data);
    
    // Track the event
    projectEvents.push({
        id,
        type: isNew ? 'create' : 'update',
        timestamp: new Date().toISOString()
    });
    
    return data;
}

export function getProject(id: string) {
    return localProjects.get(id);
}

export function listProjects() {
    return Array.from(localProjects.values());
}

export function hasProject(id: string) {
    return localProjects.has(id);
}

/**
 * Delete a project from the in-memory store
 * @param id The ID of the project to delete
 * @returns true if the project was deleted, false if it didn't exist
 */
export function deleteProject(id: string) {
    const deleted = localProjects.delete(id);
    
    if (deleted) {
        // Track the deletion event
        projectEvents.push({
            id,
            type: 'delete',
            timestamp: new Date().toISOString()
        });
    }
    
    return deleted;
}

/**
 * Get project activity history
 * @param limit Maximum number of events to return
 * @returns Array of project events
 */
export function getProjectEvents(limit = 100) {
    return projectEvents
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}
