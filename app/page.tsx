'use client'
import { BackgroundBeams } from "@/components/background";
import { Window } from "@/components/icons/window";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Projects } from "@/components/projects";

const suggestions = [
  "Create a developer's portfolio",
  "Create a bakery shop",
  "Create a restaurant website",
  "Create an e-commerce store"
]

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = () => {
    if (prompt.length > 0) {
      setIsLoading(true);
      router.push(`/create?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Projects panel */}
      {showProjects && <Projects setShowProjects={setShowProjects}/>}
      
      {/* Background animation */}
      <BackgroundBeams className="bg-neutral-950"/>
      
      <div className="relative w-full h-full flex flex-col">
        {/* Enhanced Header with modern styling */}
        <header className="flex items-center justify-between py-5 px-6 md:px-10 z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <Image
                  src="/logo-3.png"
                  width={52}
                  height={52}
                  alt="BuildBit Logo"
                  className="object-contain rounded-xl shadow-lg group-hover:shadow-blue-500/20 transition-all"
                />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-sm"
              ></motion.div>
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="font-sans text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
              >
                BuildBit
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs font-medium text-neutral-400 tracking-wider"
              >
                AI-Powered Website Creator
              </motion.p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {setShowProjects(true)}}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-neutral-800/80 to-neutral-900/80 hover:from-neutral-700/80 hover:to-neutral-800/80 backdrop-blur-sm rounded-lg text-neutral-100 text-sm font-medium transition-all border border-neutral-700/50 hover:border-neutral-600/50 shadow-md hover:shadow-lg"
            >
              <Window className="w-4 h-4 text-blue-400" />
              <span>My Projects</span>
            </motion.button>
          </div>
        </header>
        
        {/* Main content with improved styling */}
        <motion.div
          initial={{opacity:0, y:20}}
          animate={{opacity:1, y:0}}
          transition={{duration:0.5, ease: "easeOut"}}
          className="flex-1 flex flex-col justify-center items-center px-4"
        >
          <motion.div
            initial={{scale: 0.95, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{delay: 0.2, duration: 0.5}}
            className="mb-2 text-center"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3">
              Create stunning websites <span className="text-blue-400">instantly</span>
            </h2>
            <p className="text-neutral-400 max-w-lg mx-auto mb-8">
              Describe your vision and our AI will build a website tailored just for you. No coding required.
            </p>
          </motion.div>
          
          <motion.div
            initial={{y: 20, opacity: 0}}
            animate={{y: 0, opacity: 1}}
            transition={{delay: 0.4, duration: 0.5}}
            className="w-full max-w-2xl"
          >
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-t-xl"></div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2 text-sm text-neutral-400 font-medium">
                <i className="fa-solid fa-lightbulb text-amber-400"></i>
                <span>Describe your dream website</span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => {setPrompt(e.target.value)}}
                placeholder="E.g. 'A modern portfolio for a photographer with a dark theme, gallery section, about page, and contact form'"
                className="w-full bg-neutral-800/50 backdrop-blur-md shadow-xl border border-neutral-700/50 rounded-xl pt-12 px-4 pb-16 text-white text-base font-medium min-h-[180px] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all resize-none"
              />
              
              <div className="absolute right-3 bottom-3 flex items-center gap-3">
                <div className={`text-xs ${prompt.length > 0 ? 'text-blue-400' : 'text-neutral-500'} transition-colors`}>
                  {prompt.length} characters
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={prompt.length === 0 || isLoading}
                  className={`px-6 py-3 font-medium rounded-lg text-sm flex items-center gap-2.5 transition-all ${
                    prompt.length === 0 ? 
                    'bg-neutral-700 text-neutral-400 cursor-not-allowed shadow-none' : 
                    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25'
                  }`}
                  onClick={handleCreate}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Building Your Website...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i> 
                      Create Website
                    </>
                  )}
                </motion.button>
              </div>
              
              {/* Character count bubble */}
              <div className="absolute left-3 bottom-3 text-xs bg-neutral-700/50 rounded-full px-3 py-1.5 text-neutral-400 hidden sm:block">
                <i className="fa-solid fa-keyboard mr-1.5"></i>
                Press Enter to create
              </div>
            </div>
            
            <div className="mt-5">
              <p className="text-neutral-400 text-sm mb-3 font-medium flex items-center gap-2">
                <i className="fa-solid fa-star text-amber-400"></i>
                Popular templates:
              </p>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((v, i) => {
                  // Icons for each suggestion
                  const icons = [
                    'fa-solid fa-laptop-code',
                    'fa-solid fa-bread-slice',
                    'fa-solid fa-utensils',
                    'fa-solid fa-shopping-cart'
                  ];
                  
                  return (
                    <motion.button 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {setPrompt(v)}}
                      className="text-sm text-neutral-200 bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 py-2.5 px-4 rounded-lg border border-neutral-700/50 hover:border-blue-500/40 hover:from-neutral-800 hover:to-neutral-900 shadow-sm hover:shadow-blue-500/10 transition-all flex items-center gap-2"
                    >
                      <i className={`${icons[i]} text-blue-400`}></i>
                      {v}
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1.5">
                <i className="fa-solid fa-info-circle"></i>
                <span>Click any template or type your own idea to get started</span>
              </div>
            </div>
          </motion.div>
          
          {/* Enhanced Features section */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.7, duration: 0.5}}
            className="flex flex-wrap justify-center gap-6 mt-16 text-center max-w-5xl mx-auto px-4"
          >
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-800/50 shadow-lg hover:shadow-blue-500/5 transition-all w-64"
            >
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <i className="fa-solid fa-bolt text-blue-400 text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2 text-lg">Fast Creation</h3>
              <p className="text-sm text-neutral-400">Create professional websites in seconds with AI-powered generation</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-800/50 shadow-lg hover:shadow-indigo-500/5 transition-all w-64"
            >
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <i className="fa-solid fa-pen-to-square text-indigo-400 text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2 text-lg">Intuitive Editing</h3>
              <p className="text-sm text-neutral-400">Easy drag & drop interface with real-time visual feedback</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-800/50 shadow-lg hover:shadow-purple-500/5 transition-all w-64"
            >
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <i className="fa-solid fa-download text-purple-400 text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2 text-lg">Export Anywhere</h3>
              <p className="text-sm text-neutral-400">Download complete code packages ready to host on any platform</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-800/50 shadow-lg hover:shadow-green-500/5 transition-all w-64"
            >
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <i className="fa-solid fa-code text-green-400 text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2 text-lg">Modern Code</h3>
              <p className="text-sm text-neutral-400">Clean, responsive code with best practices and optimization</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}