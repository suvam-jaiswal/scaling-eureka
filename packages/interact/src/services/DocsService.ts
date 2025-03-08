/**
 * Service for managing documentation files
 */

// Type definition for a documentation file
export interface DocFile {
  id: string;  // The file id (e.g., "01-overview")
  title: string; // The human-readable title
  path: string; // The file path
  order: number; // The display order (extracted from file name)
}

/**
 * Fetches all markdown files from the public directory
 * Files are expected to be named with a numeric prefix like "01-overview.md"
 */
export async function getAllDocFiles(): Promise<DocFile[]> {
  try {
    // Fetch the index file that contains the list of all doc files
    const response = await fetch('/docs-index.json');
    
    if (!response.ok) {
      // If the index file doesn't exist, try to discover all md files in the public dir
      console.warn('docs-index.json not found, will try to discover MD files directly');
      return discoverDocFiles();
    }
    
    const docFiles = await response.json();
    return docFiles;
  } catch (error) {
    console.error('Error fetching doc files:', error);
    return [];
  }
}

/**
 * Alternative approach to discover all markdown files
 * This is a fallback in case the docs-index.json file doesn't exist
 */
async function discoverDocFiles(): Promise<DocFile[]> {
  const docFiles: DocFile[] = [];
  
  // Define the known documentation files (hardcoded as fallback)
  const knownFiles = [
    { id: '01-overview', title: 'Overview' },
    { id: '02-installation', title: 'Installation' },
    { id: '03-usage', title: 'Basic Usage' },
    { id: '04-api', title: 'API Reference' },
    { id: '05-tutorials', title: 'Tutorials' },
    { id: '06-best-practices', title: 'Best Practices' },
    { id: '07-examples', title: 'Examples' },
    { id: '08-typescript-interfaces', title: 'TypeScript Interfaces' },
    { id: '09-advanced-features', title: 'Advanced Features' },
    { id: '10-modifiers-system', title: 'Modifiers System' },
    { id: '11-complete-api-reference', title: 'Complete API Reference' },
  ];
  
  // Check each file and add it if it exists
  for (const file of knownFiles) {
    try {
      const response = await fetch(`/${file.id}.md`);
      if (response.ok) {
        const order = parseInt(file.id.split('-')[0], 10) || 999;
        docFiles.push({
          id: file.id,
          title: file.title,
          path: `/${file.id}.md`,
          order
        });
      }
    } catch (error) {
      console.error(`Error checking file ${file.id}.md:`, error);
    }
  }
  
  // Sort by order
  return docFiles.sort((a, b) => a.order - b.order);
}

/**
 * Fetches a specific markdown file by ID
 */
export async function getDocFileContent(fileId: string): Promise<string> {
  try {
    const response = await fetch(`/${fileId}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load documentation: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching doc file ${fileId}:`, error);
    throw error;
  }
}