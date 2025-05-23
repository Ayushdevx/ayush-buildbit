'use server'

import { listProjects } from "@/lib/localStore";

export async function fetchProject(page: number) {
    try {
        // Get all projects
        const allProjects = listProjects();
        
        // Sort by createdAt in descending order (newest first)
        const sortedProjects = allProjects.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Apply pagination
        const start = (page - 1) * 10;
        const end = start + 10;
        const res = sortedProjects.slice(start, end);
        
        return { res, hasMore: end < sortedProjects.length };
    } catch (error) {
        console.error("Error fetching projects:", error);
        return { error: "Error fetching projects", res: [] };
    }
}
