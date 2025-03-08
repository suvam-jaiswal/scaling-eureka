/**
 * Script to generate docs-index.json file in the public directory
 * This script scans the public directory for markdown files and creates an index
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'docs-index.json');

/**
 * Extract title from markdown content
 * Looks for the first heading (# Title) in the markdown file
 */
function extractTitleFromMarkdown(content) {
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  return null;
}

/**
 * Get a human-readable title from the file name
 */
function getTitleFromFileName(fileName) {
  // Remove order prefix (e.g., "01-")
  const withoutOrder = fileName.replace(/^\d+-/, '');
  
  // Replace dashes with spaces and capitalize each word
  return withoutOrder
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main function to scan the public directory and generate the index
 */
function generateDocsIndex() {
  console.log('Scanning for markdown files in:', PUBLIC_DIR);
  
  const docFiles = [];
  
  // Read all files in the public directory
  const files = fs.readdirSync(PUBLIC_DIR);
  
  // Filter markdown files
  const markdownFiles = files.filter(file => 
    file.endsWith('.md') && !file.includes('README') && !file.includes('index')
  );
  
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  // Process each markdown file
  markdownFiles.forEach(file => {
    const filePath = path.join(PUBLIC_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Get file ID (without .md extension)
    const fileId = file.replace('.md', '');
    
    // Try to extract title from content, fallback to file name
    let title = extractTitleFromMarkdown(content);
    if (!title) {
      title = getTitleFromFileName(fileId);
    }
    
    // Extract order from file name (e.g., "01-overview" -> 1)
    let order = 999;
    const orderMatch = fileId.match(/^(\d+)-/);
    if (orderMatch && orderMatch[1]) {
      order = parseInt(orderMatch[1], 10);
    }
    
    docFiles.push({
      id: fileId,
      title,
      path: `/${fileId}.md`,
      order
    });
  });
  
  // Sort by order
  docFiles.sort((a, b) => a.order - b.order);
  
  // Write to the output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(docFiles, null, 2));
  
  console.log(`Generated docs index with ${docFiles.length} files at: ${OUTPUT_FILE}`);
}

// Run the generator
generateDocsIndex();