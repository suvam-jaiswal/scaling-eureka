<template>
  <div class="docs-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading documentation...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
      <p>{{ error }}</p>
    </div>
    <div v-else class="docs-layout">
      <div class="main-content-area">
        <div class="markdown-content" v-html="renderedContent" ref="contentRef"></div>
      </div>
      
      <!-- Secondary navigation as part of the layout -->
      <div class="secondary-nav" v-if="tableOfContents.length > 0">
        <div class="toc">
          <div class="toc-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h12"></path></svg>
            <h4>Contents</h4>
          </div>
          <div class="toc-progress-container">
            <div class="toc-progress-bar" :style="{ height: scrollProgress + '%' }"></div>
          </div>
          
          <ul class="toc-list">
            <li v-for="(item, index) in tableOfContents" :key="index" :class="{ 'active': activeHeading === item.id }">
              <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)" :class="{ 'indent-1': item.level === 2, 'indent-2': item.level === 3 }">
                <span class="toc-bullet"></span>
                <span class="toc-text">{{ item.text }}</span>
              </a>
            </li>
          </ul>
          
          <div class="toc-footer">
            <button @click="scrollToTop" class="scroll-top-button" title="Scroll to top">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg>
              Back to top
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import { getDocFileContent } from '../services/DocsService'

// Import Prism CSS themes - you can add these to main.css instead if you prefer
import 'prismjs/themes/prism.css'
// Import additional Prism components for specific languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup' // HTML
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const renderedContent = ref('')
const contentRef = ref<HTMLElement | null>(null)
const tableOfContents = ref<Array<{ id: string; text: string; level: number }>>([])
const activeHeading = ref('')
const scrollProgress = ref(0)
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="language-${lang}"><code class="language-${lang}">${
          Prism.highlight(str, Prism.languages[lang], lang)
        }</code></pre>`
      } catch (e) {
        console.error(e)
      }
    }
    return `<pre class="language-text"><code class="language-text">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// Function to extract heading IDs and text for table of contents
const extractTableOfContents = () => {
  // Look for headings in the entire document - this is a more reliable approach
  const headings = document.querySelectorAll('.markdown-content h1, .markdown-content h2, .markdown-content h3')
  console.log("Found headings:", headings.length, headings)
  
  const toc: Array<{ id: string; text: string; level: number }> = []
  
  // For example pages, limit to main headings and skip explanations
  const isExamplesPage = window.location.pathname.includes('examples') || 
                          document.title.toLowerCase().includes('example');
  
  // Skip headings that contain "explanation" for example pages
  const shouldSkipHeading = (text: string) => {
    if (!isExamplesPage) return false;
    return text.toLowerCase().includes('explanation') || 
           text.toLowerCase().includes('scenario');
  };

  headings.forEach((heading, index) => {
    const headingText = heading.textContent || '';
    console.log("Processing heading:", headingText);
    
    // Skip certain headings for examples pages
    if (shouldSkipHeading(headingText)) {
      console.log("Skipping explanation heading");
      return;
    }
    
    // Create IDs for headings if they don't have one
    if (!heading.id) {
      const id = `heading-${index}-${headingText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`
      
      console.log("Generated ID for heading:", id)
      heading.id = id
    }

    // Truncate long headings to make them more concise
    let tocText = headingText;
    
    // Extract first part only for cleaner TOC
    if (tocText.includes(':')) {
      tocText = tocText.split(':')[0].trim();
    }
    
    // Replace "Example" with "eg." to save space
    tocText = tocText.replace(/\bExample[s]?\b/gi, 'eg.');
    
    // Extract before dash if present
    if (tocText.includes(' - ')) {
      tocText = tocText.split(' - ')[0].trim();
    }
    
    // Skip numbered examples if there are too many, or any content after code blocks
    if (isExamplesPage) {
      // Skip code examples or explanations after code blocks
      const previousElement = heading.previousElementSibling;
      if (previousElement && (
          previousElement.tagName === 'PRE' || 
          previousElement.querySelector('pre') || 
          previousElement.tagName === 'CODE'
      )) {
        console.log("Skipping heading after code block");
        return;
      }
      
      // Skip numbered examples if there are too many
      if (toc.length > 5 && /eg\.\s*\d+/i.test(tocText)) {
        console.log("Skipping numbered example due to length");
        return;
      }
    }
    
    // Remove "Key Features", "Common Use Cases", etc. prefixes
    tocText = tocText.replace(/^(Key Features|Common Use Cases|How .* Works):\s*/i, '');
    
    // Hard limit on length
    const maxLength = 25; // Shorter maximum for TOC items
    if (tocText.length > maxLength) {
      tocText = tocText.substring(0, maxLength) + '...';
    }
    
    // Remove any trailing punctuation
    tocText = tocText.replace(/[:.]+$/, '');

    toc.push({
      id: heading.id,
      text: tocText,
      level: parseInt(heading.tagName.charAt(1))
    })
  })

  tableOfContents.value = toc
  console.log("Final TOC:", tableOfContents.value)
}

// Function to scroll to a specific heading
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 100, // Offset for header
      behavior: 'smooth'
    })
    activeHeading.value = id
  }
}

// Function to scroll to the top of the page
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Function to determine which heading is currently active based on scroll position
// and calculate scroll progress
const handleScroll = () => {
  if (tableOfContents.value.length === 0) return

  const scrollPosition = window.scrollY + 150 // Add offset for header
  
  // Calculate total scroll height and current progress
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const currentProgress = (window.scrollY / docHeight) * 100
  scrollProgress.value = Math.min(Math.max(currentProgress, 0), 100)

  // Find the current section
  for (let i = tableOfContents.value.length - 1; i >= 0; i--) {
    const heading = document.getElementById(tableOfContents.value[i].id)
    if (heading && heading.offsetTop <= scrollPosition) {
      activeHeading.value = tableOfContents.value[i].id
      return
    }
  }

  // Default to first heading if none is active
  if (tableOfContents.value.length > 0) {
    activeHeading.value = tableOfContents.value[0].id
  }
}

// Reference to the setTimeout so we can clear it if needed
let tocTimeout: number | null = null

const fetchMarkdownContent = async (fileName: string): Promise<void> => {
  loading.value = true
  error.value = ''
  tableOfContents.value = []
  
  // Clear any existing timeout
  if (tocTimeout !== null) {
    clearTimeout(tocTimeout)
    tocTimeout = null
  }

  try {
    // Use the DocsService to fetch the content
    const content = await getDocFileContent(fileName)

    // Process Markdown content
    renderedContent.value = md.render(content)

    // After rendering is complete, process links and apply syntax highlighting
    await nextTick()
    
    // Apply Prism.js syntax highlighting to code blocks
    Prism.highlightAll()
    
    // Process links to make them work with Vue Router
    const links = document.querySelectorAll('.markdown-content a')
    links.forEach(link => {
      const href = link.getAttribute('href')
      if (href !== null && href.startsWith('./') && href.endsWith('.md')) {
        link.setAttribute('href', href.replace('./', '').replace('.md', ''))
        link.addEventListener('click', (e) => {
          e.preventDefault()
          const target = e.currentTarget as HTMLAnchorElement
          const path = target.getAttribute('href')
          if (path !== null) {
            window.location.href = `/docs/${path}`
          }
        })
      }
    })

    // Extract table of contents after content is rendered
    // We need to give the browser a moment to fully render the HTML
    await nextTick()
    // Use setTimeout to ensure DOM is fully rendered
    tocTimeout = window.setTimeout(() => {
      extractTableOfContents()
      
      // Log for debugging
      console.log('Table of Contents:', tableOfContents.value)
      
      // Initialize active heading
      if (tableOfContents.value.length > 0) {
        activeHeading.value = tableOfContents.value[0].id
      }
      
      // Add scroll event listener
      window.addEventListener('scroll', handleScroll)
    }, 100)
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'An unknown error occurred'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.params.fileName !== undefined) {
    void fetchMarkdownContent(route.params.fileName as string)
  }
})

watch(() => route.params.fileName, (newFileName) => {
  if (newFileName !== undefined) {
    // Remove previous scroll listener before loading new content
    window.removeEventListener('scroll', handleScroll)
    void fetchMarkdownContent(newFileName as string)
  }
})

// Clean up event listener and timeout on component unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (tocTimeout !== null) {
    clearTimeout(tocTimeout)
    tocTimeout = null
  }
})
</script>

<style scoped>
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-light);
  text-align: center;
  min-height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(58, 134, 255, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #ff3b30;
  margin-bottom: var(--spacing-sm);
  width: 40px;
  height: 40px;
}

.error-state p {
  font-weight: 500;
  color: var(--text-color);
}

/* Main docs layout container */
.docs-layout {
  display: flex;
  width: 100%;
  position: relative;
}

/* Main content area */
.main-content-area {
  flex: 1;
  max-width: calc(100% - 280px); /* Give space for the secondary nav */
  padding-right: var(--spacing-lg);
  box-sizing: border-box;
}

.markdown-content {
  width: 100%;
  max-width: 900px; /* Limit content width for readability */
  padding: var(--spacing-lg);
  margin: 0 auto; /* Center content */
}

/* Target h1, h2, h3 elements in the markdown content to ensure they have proper styles */
:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3) {
  margin-top: var(--spacing-xl);
  font-weight: 600;
  color: var(--text-color);
}

:deep(.markdown-content h1) {
  font-size: 2.2rem;
  margin-bottom: var(--spacing-lg);
}

:deep(.markdown-content h2) {
  font-size: 1.7rem;
  margin-bottom: var(--spacing-md);
}

:deep(.markdown-content h3) {
  font-size: 1.4rem;
  margin-bottom: var(--spacing-sm);
}

:deep(.markdown-content p) {
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  margin-bottom: var(--spacing-md);
  padding-left: 1.5rem;
}

:deep(.markdown-content li) {
  margin-bottom: var(--spacing-xs);
}

/* Secondary navigation */
.secondary-nav {
  width: 280px;
  min-width: 280px;
  box-sizing: border-box;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 0;
}

.secondary-nav .toc {
  height: calc(100vh - 150px); /* Adjust based on header height */
  position: sticky;
  top: calc(var(--spacing-lg) * 2 + 70px); /* Match header height */
  display: flex;
  flex-direction: column;
}

/* Add media query to handle smaller screens */
@media (max-width: 1200px) {
  .docs-layout {
    flex-direction: column;
  }
  
  .secondary-nav {
    width: 100%;
    min-width: 100%;
    padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
    order: 2; /* Move to the bottom on small screens */
  }
  
  .secondary-nav .toc {
    height: auto;
    max-height: 300px;
    position: relative;
    top: 0;
  }
  
  .main-content-area {
    max-width: 100%;
    padding-right: 0;
    order: 1; /* Keep content at the top on small screens */
  }
  
  .markdown-content {
    max-width: 100%;
  }
}

.toc {
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-lg);
  border-left: 2px solid var(--border-color);
  font-size: 0.9rem;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  width: 100%;  /* Ensure it stays within container */
  box-sizing: border-box;
  overflow: hidden; /* Prevent content overflow */
}

.toc-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  color: var(--text-light);
  padding-bottom: var(--spacing-xs);
  border-bottom: 1px solid var(--border-color);
}

.toc-header svg {
  margin-right: var(--spacing-xs);
}

.toc h4 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toc-progress-container {
  position: absolute;
  left: -1px;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: var(--border-color);
}

.toc-progress-bar {
  width: 100%;
  background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
  position: absolute;
  bottom: 0;
  left: 0;
  transition: height 0.2s ease;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-lg) 0;
  flex: 1; /* Take up available space */
  overflow-y: auto;
  scrollbar-width: thin;
}

.toc-list::-webkit-scrollbar {
  width: 4px;
}

.toc-list::-webkit-scrollbar-track {
  background: transparent;
}

.toc-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 10px;
}

.toc-list li {
  margin-bottom: var(--spacing-xs);
}

/* Adjustments for nested items */
.toc-list li a.indent-1,
.toc-list li a.indent-2 {
  margin-top: 3px;
  margin-bottom: 3px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.toc-list li a {
  display: flex;
  align-items: center;
  color: var(--text-light);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 400;
  line-height: 1.4;
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  font-size: 0.9rem; /* Smaller font size for better fit */
}

.toc-list li a:hover {
  color: var(--primary-color);
  background-color: rgba(58, 134, 255, 0.05);
}

.toc-bullet {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background-color: var(--primary-color);
  opacity: 0.5;
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* Styling for different heading levels */
.indent-1 .toc-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  opacity: 0.4;
  margin-left: 2px;
}

.indent-2 .toc-bullet {
  width: 4px;
  height: 4px;
  opacity: 0.3;
  border-radius: 50%;
  background-color: var(--text-light);
  margin-left: 3px;
  margin-right: 8px; /* Reduced margin for better alignment */
}

.toc-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px; /* Increased width for text */
  display: inline-block;
}

/* Font weight based on heading level */
.toc-list li a:not(.indent-1):not(.indent-2) .toc-text {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.toc-list li a:not(.indent-1):not(.indent-2) {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-xs);
  padding-bottom: var(--spacing-xs);
  border-radius: var(--radius-sm);
  background-color: rgba(0, 0, 0, 0.02);
  position: relative;
}

/* Add a separator before each top-level item (except the first) */
.toc-list li:not(:first-child) a:not(.indent-1):not(.indent-2)::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 8px;
  right: 8px;
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.6;
}

/* Adjust spacing for nested items */
.toc-list a.indent-1,
.toc-list a.indent-2 {
  margin-top: 1px;
  margin-bottom: 1px;
}

/* Extra bottom margin after the last nested item in a group */
.toc-list li:last-child a.indent-1,
.toc-list li:last-child a.indent-2 {
  margin-bottom: var(--spacing-xs);
}

.indent-1 .toc-text {
  font-weight: 500;
  color: var(--text-color);
}

.indent-2 .toc-text {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--text-light);
  opacity: 0.85;
}

/* Ensure proper line heights for nested items */
.toc-list li a.indent-1 .toc-text,
.toc-list li a.indent-2 .toc-text {
  line-height: 1.2;
}

/* Active state for top level */
.toc-list li.active a:not(.indent-1):not(.indent-2) {
  color: var(--primary-color);
  background-color: rgba(58, 134, 255, 0.08);
  border-left: 3px solid var(--primary-color);
}

/* Active state for level 1 and 2 */
.toc-list li.active a.indent-1,
.toc-list li.active a.indent-2 {
  color: var(--primary-color);
  background-color: rgba(58, 134, 255, 0.05);
}

/* Common active bullet styles */
.toc-list li.active .toc-bullet {
  opacity: 1;
  transform: scale(1.2);
}

/* Keep font weights consistent with hierarchy */
.toc-list li.active a:not(.indent-1):not(.indent-2) .toc-text {
  font-weight: 600;
}

.toc-list li.active a.indent-1 .toc-text {
  font-weight: 500;
}

.toc-list li.active a.indent-2 .toc-text {
  font-weight: 400;
}

.indent-1 {
  margin-left: 12px;
  padding-left: 3px; /* Added for better alignment with bullets */
}

.indent-2 {
  margin-left: 24px;
  padding-left: 3px; /* Added for better alignment with bullets */
}

/* Add small left padding for all headings */
.toc-list li a {
  padding-left: 8px;
}

.toc-footer {
  text-align: center;
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-sm);
}

.scroll-top-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-light);
  font-size: 0.8rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  margin: 0 auto;
  transition: all 0.2s ease;
}

.scroll-top-button svg {
  margin-right: var(--spacing-xs);
}

.scroll-top-button:hover {
  color: var(--primary-color);
  background-color: rgba(58, 134, 255, 0.05);
}

.toc-empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-light);
  font-size: 0.9rem;
  font-style: italic;
}
</style>