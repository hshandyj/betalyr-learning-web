import { motion } from "framer-motion";
import { Construction, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotCompletePage() {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center py-16 px-4 text-center bg-background">
        <motion.div
          className="max-w-2xl mx-auto flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="mb-6 text-primary"
          >
            <Construction size={64} />
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Under construction
          </motion.h1>
          
          <motion.p
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We are working hard to create a great project showcase page for you, stay tuned!
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 items-center justify-center mt-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div className="flex items-center px-6 py-4 rounded-xl bg-muted">
              <Clock className="w-6 h-6 mr-3 text-primary" />
              <span>Expected soon</span>
            </div>
            
            <div className="flex items-center px-6 py-4 rounded-xl bg-muted">
              <Sparkles className="w-6 h-6 mr-3 text-primary" />
              <span>Exciting content, worth waiting for</span>
            </div>
          </motion.div>
          
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Link href="/">
              <Button size="lg" className="rounded-full px-8">
                Return to home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full max-w-2xl h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-16"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 1.1, duration: 1.2 }}
        />
      </div>
    );
  }