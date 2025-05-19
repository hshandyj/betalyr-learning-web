"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Book, Code, MessageSquare, Video, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CodingIllustration } from '../components/Home/CodingIllustration'

// 动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}

// 功能卡片组件
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  link, 
  color 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  link: string,
  color: string
}) {
  const isColoredCard = color.includes('gradient') || !color.includes('white');
  
  return (
    <motion.div variants={itemVariants} className="group">
      <Link href={link} className="block">
        <div className={`p-6 border rounded-xl transition-all duration-300 hover:shadow-md ${color} group-hover:translate-y-[-5px]`}>
          <div className="mb-4">
            <Icon className={`w-10 h-10 ${isColoredCard ? 'text-white' : 'text-gray-900 dark:text-gray-900'}`} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isColoredCard ? 'text-white' : 'text-gray-900 dark:text-gray-900'}`}>{title}</h3>
          <p className={`${isColoredCard ? 'text-gray-300' : 'text-gray-700 dark:text-gray-700'} mb-4`}>{description}</p>
          <div className={`flex items-center text-sm font-medium ${isColoredCard ? 'text-white' : 'text-gray-900 dark:text-gray-900'} group-hover:underline`}>
            Start exploring <ArrowRight className="ml-1 w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  // 视差效果
  const [scrollY, setScrollY] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 大背景区域 */}
      <div className="relative h-[90vh] overflow-hidden">
        {/* 背景 */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        {/* 渐变覆盖层 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>

        {/* 动态背景元素 - 代码编辑器样式 */}
        <div className="absolute right-[10%] top-[25%] w-1/3 h-auto p-4 bg-black/60 backdrop-blur-sm rounded-xl border border-primary/30 shadow-xl transform -rotate-3"
             style={{ transform: `translateY(${scrollY * -0.2}px) rotate(-3deg)` }}>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 text-xs text-gray-400">~/code/myproject</div>
          </div>
          <pre className="text-xs sm:text-sm md:text-base text-green-400 overflow-hidden">
            <code>{`const createDream = async () => {
  await learn();
  await practice();
  return buildSomethingAmazing();
};

// The road is under your feet, the dream is ahead
createDream();`}</code>
          </pre>
        </div>
        
        {/* 标题和介绍文字 */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8 lg:px-24 text-white z-10 max-w-3xl" 
             style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Programming journey,<br />start here
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Here not only do you have in-depth technical blogs, complete and clear learning roadmaps, but also practical project development guides, and interactive learning communities. Whether you are a beginner or an experienced developer.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/blog">
              <Button size="lg" className="rounded-full px-8">
                Start exploring
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* 向下滚动提示 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <p className="text-sm mb-2">Scroll down to learn more</p>
            <svg 
              className="w-6 h-6 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </motion.div>
        </div>
      </div>
      
      {/* 功能展示区域 */}
      <div className="py-16 lg:py-24 px-4 sm:px-8 lg:px-24 bg-background">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Explore our features
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            From learning to practice, from thinking to creation, we provide comprehensive tools and resources to help you achieve your programming dreams
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <FeatureCard 
            icon={Book} 
            title="Technical Blog" 
            description="In-depth technical articles covering multiple fields such as front-end, back-end, and mobile end, from basic to advanced, all in one." 
            link="/blog"
            color="bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white"
          />
          
          <FeatureCard 
            icon={Compass} 
            title="Learning Roadmap" 
            description="Professional learning path planning to help you clearly understand the development direction of the technology stack." 
            link="/roadmap"
            color="bg-white border-gray-200"
          />
          
          <FeatureCard 
            icon={Code} 
            title="Project Practice" 
            description="Complete project development tutorials, covering implementation ideas for front-end, back-end, and middleware." 
            link="/projects"
            color="bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white"
          />
          
          <FeatureCard 
            icon={Video} 
            title="Video Tutorials" 
            description="Carefully crafted video tutorials to help you understand complex concepts, improve learning efficiency." 
            link="/videos"
            color="bg-white border-gray-200"
          />
          
          <FeatureCard 
            icon={MessageSquare} 
            title="Treehollow" 
            description="Anonymous technical exchange platform, where you can speak freely, seek help or share your insights." 
            link="/treehollow"
            color="bg-gradient-to-br from-orange-500 to-red-600 border-orange-400 text-white"
          />
          
          <FeatureCard 
            icon={Book} 
            title="Resource Center" 
            description="Handpicked programming resources, tools, and book recommendations to help you learn and work efficiently." 
            link="/resources"
            color="bg-white border-gray-200"
          />
        </motion.div>
      </div>
      
      {/* 特色部分 */}
      <div className="py-16 lg:py-24 px-4 sm:px-8 lg:px-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">why select us?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            carefully designed learning experience, focusing on practical ability cultivation, committed to creating a one-stop programming learning platform
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <CodingIllustration />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ul className="space-y-6">
                <li className="flex">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-1">Systematic learning path</h3>
                    <p className="text-muted-foreground">
                      Carefully planned learning path, from zero to advanced development, each step is clear and visible
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-1">Focus on practical ability</h3>
                    <p className="text-muted-foreground">
                      A large number of project cases, help you transform theoretical knowledge into practical development ability
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-1">Community support</h3>
                    <p className="text-muted-foreground">
                      Active developer community, discuss and solve problems you encounter in the learning process
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold mb-1">Continuous update</h3>
                    <p className="text-muted-foreground">
                      We constantly update learning content, keep up with technological development, and help you master the latest programming knowledge
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* 行动召唤区域 */}
      <div 
        className="py-20 lg:py-32 px-4 sm:px-8 lg:px-24 bg-gradient-to-r from-primary to-primary-dark text-white text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="none"/>
            <path d="M10 10h10v10H10zM30 10h10v10H30zM50 10h10v10H50zM70 10h10v10H70zM90 10h10v10H90zM0 30h10v10H0zM20 30h10v10H20zM40 30h10v10H40zM60 30h10v10H60zM80 30h10v10H80zM10 50h10v10H10zM30 50h10v10H30zM50 50h10v10H50zM70 50h10v10H70zM90 50h10v10H90zM0 70h10v10H0zM20 70h10v10H20zM40 70h10v10H40zM60 70h10v10H60zM80 70h10v10H80zM10 90h10v10H10zM30 90h10v10H30zM50 90h10v10H50zM70 90h10v10H70zM90 90h10v10H90z" fill="currentColor"/>
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Are you ready to start your programming journey?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl mb-10 text-white/80"
          >
            Whether you are a programming novice or an experienced developer, there is content suitable for you here. Join us, grow together, and create together!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/blog">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                Start now
              </Button>
            </Link>
            <Link href="/roadmap">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-transparent border-white text-white hover:bg-white/20">
                Learn more
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}