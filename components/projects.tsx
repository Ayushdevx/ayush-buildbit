import Image from "next/image";
import { Close } from "./icons/close";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProject } from "@/app/actions/fetchProject";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Project {
  id: string;
  prompt: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
}

export function Projects({ setShowProjects }: { setShowProjects: (show: boolean) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [entryLoading, setEntryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const lastProjectRef = useCallback(
    (node: HTMLElement | null) => {
      if (entryLoading || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !entryLoading) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 1.0 }
      );

      if (node) observer.current.observe(node);
    },
    [entryLoading, hasMore]
  );

  useEffect(() => {
    let isMounted = true;

    if (!hasMore || entryLoading) return;

    const fetchData = async () => {
      try {
        setEntryLoading(true);
        if (page === 1) {
          setLoading(true);
        }

        const response = await fetchProject(page);
        const data: { res: Project[]; hasMore?: boolean } = 
          response instanceof Response ? await response.json() : response;
        if (isMounted && 'res' in data && Array.isArray(data.res)) {
          // Ensure no duplicates by filtering out existing project IDs
          setProjects((prev) => {
            const existingIds = new Set(prev.map((p) => p.id)); // Assuming projects have an 'id' field
            const newProjects = (data.res || []).filter((p: Project) => !existingIds.has(p.id));
            return [...prev, ...newProjects];
          });
          setHasMore(data.hasMore ?? data.res.length >= 10);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setEntryLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (observer.current) observer.current.disconnect();
    };
  }, [page, hasMore]); // Added hasMore to dependencies

  // Filter projects based on search term
  const filteredProjects = searchTerm
    ? projects.filter(project => 
        (project.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         project.name?.toLowerCase().includes(searchTerm.toLowerCase())))
    : projects;

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div
        onClick={() => setShowProjects(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-all"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed top-0 right-0 h-screen z-50 w-full sm:w-[400px] md:w-[450px] bg-neutral-900 shadow-2xl shadow-black/40 border-l border-neutral-800"
      >
        {/* Header with search */}
        <div className="flex flex-col p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Image src="/logo-3.png" width={36} height={36} alt="BuildBit Logo" className="rounded-md" />
              <h2 className="font-sans text-xl font-bold text-white">My Projects</h2>
            </div>
            <button 
              onClick={() => setShowProjects(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
            >
              <Close className="text-neutral-400 hover:text-white w-5 h-5" />
            </button>
          </div>
          
          {/* Search bar - Enhanced */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className={`fa-solid fa-search ${searchTerm ? 'text-blue-400' : 'text-neutral-500'} transition-colors`}></i>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2.5 bg-neutral-800/70 backdrop-blur-sm border border-neutral-700/80 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600/50 text-white text-sm transition-all"
              placeholder="Search projects by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>
        
        {/* Projects list */}
        <div className="overflow-y-auto h-[calc(100vh-120px)] px-4">
          {loading && page === 1 ? (
            <div className="flex flex-col items-center justify-center w-full h-full py-12">
              <div className="w-12 h-12 relative">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-700/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-neutral-400 font-medium mt-4">Loading your projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center w-full h-full py-12 text-center"
            >
              {searchTerm ? (
                <>
                  <div className="w-16 h-16 bg-neutral-800/70 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-neutral-700/50 shadow-lg">
                    <i className="fa-solid fa-search text-2xl text-neutral-500"></i>
                  </div>
                  <p className="text-neutral-300 font-medium text-lg mb-2">No matching projects</p>
                  <p className="text-neutral-500 text-sm max-w-xs">
                    Try a different search term or create a new project
                  </p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-md transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-times"></i>
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-lg shadow-blue-500/5">
                    <i className="fa-regular fa-folder-open text-3xl text-blue-400"></i>
                  </div>
                  <p className="text-neutral-200 font-medium text-xl mb-2">No projects yet</p>
                  <p className="text-neutral-500 text-sm max-w-xs mb-6">
                    Start by creating your first website with BuildBit's AI-powered builder
                  </p>
                  <button 
                    onClick={() => { setShowProjects(false); router.push('/'); }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create New Project
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            <div className="py-4 grid gap-3">
              {filteredProjects.map((project, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {router.push(`/project/${project.id}`); setShowProjects(false)}}
                  key={project.id || index}
                  ref={index === projects.length - 1 ? lastProjectRef : null}
                  className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 hover:from-neutral-800 hover:to-neutral-800 backdrop-blur-sm border border-neutral-700/50 hover:border-neutral-600/50 rounded-lg p-4 cursor-pointer transition-all group shadow-md hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-md">
                        <i className="fa-regular fa-file-code text-blue-400"></i>
                      </div>
                      <h3 className="font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {project.name || `Project ${index + 1}`}
                      </h3>
                    </div>
                    <div className="flex items-center bg-neutral-900/50 rounded-full px-2 py-0.5">
                      <span className="text-xs text-neutral-400">{formatDate(project.updatedAt || project.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 line-clamp-2 ml-10">{project.prompt}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-700/30">
                    <span className="text-xs text-neutral-500 flex items-center">
                      <i className="fa-regular fa-clock mr-1.5"></i> 
                      Last edited {formatDate(project.updatedAt)}
                    </span>
                    <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full group-hover:bg-blue-500/20 group-hover:translate-x-0.5 flex items-center transition-all">
                      Open Project <i className="fa-solid fa-arrow-right ml-1.5"></i>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}