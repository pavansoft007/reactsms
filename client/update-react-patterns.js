#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function updateReactPatterns(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, and build directories
      if (!['node_modules', '.git', 'build', 'dist'].includes(item)) {
        updateReactPatterns(itemPath);
      }
    } else if (item.match(/\.(tsx?|jsx?)$/)) {
      updateFile(itemPath);
    }
  }
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove React.FC types
  const reactFcPattern = /:\s*React\.FC(<[^>]*>)?\s*=/g;
  if (reactFcPattern.test(content)) {
    content = content.replace(reactFcPattern, ' =');
    modified = true;
    console.log(`Removed React.FC from: ${filePath}`);
  }
  
  // Update React.createElement to createElement (and add import if needed)
  if (content.includes('React.createElement')) {
    // Check if createElement is already imported
    if (!content.includes('import ') || !content.match(/import.*\{[^}]*createElement[^}]*\}.*from ['"]react['"]/)) {
      // Add createElement to imports
      const reactImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
      if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (!imports.includes('createElement')) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
            `import { ${imports.trim() ? imports + ', ' : ''}createElement } from 'react'`
          );
        }
      } else {
        // Add new import for createElement
        content = `import { createElement } from 'react';\n${content}`;
      }
    }
    
    content = content.replace(/React\.createElement/g, 'createElement');
    modified = true;
    console.log(`Updated React.createElement in: ${filePath}`);
  }
  
  // Update React.Component to Component (and add import if needed)
  if (content.includes('React.Component')) {
    // Check if Component is already imported
    if (!content.includes('import ') || !content.match(/import.*\{[^}]*Component[^}]*\}.*from ['"]react['"]/)) {
      // Add Component to imports
      const reactImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
      if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (!imports.includes('Component')) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
            `import { ${imports.trim() ? imports + ', ' : ''}Component } from 'react'`
          );
        }
      } else {
        // Add new import for Component
        content = `import { Component } from 'react';\n${content}`;
      }
    }
    
    content = content.replace(/React\.Component/g, 'Component');
    modified = true;
    console.log(`Updated React.Component in: ${filePath}`);
  }
  
  // Update React.Fragment to Fragment (and add import if needed)
  if (content.includes('React.Fragment')) {
    // Check if Fragment is already imported
    if (!content.includes('import ') || !content.match(/import.*\{[^}]*Fragment[^}]*\}.*from ['"]react['"]/)) {
      // Add Fragment to imports
      const reactImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
      if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (!imports.includes('Fragment')) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
            `import { ${imports.trim() ? imports + ', ' : ''}Fragment } from 'react'`
          );
        }
      } else {
        // Add new import for Fragment
        content = `import { Fragment } from 'react';\n${content}`;
      }
    }
    
    content = content.replace(/React\.Fragment/g, 'Fragment');
    modified = true;
    console.log(`Updated React.Fragment in: ${filePath}`);
  }
  
  // Update React.ReactNode to ReactNode in type definitions
  if (content.includes('React.ReactNode')) {
    // Check if ReactNode is already imported
    if (!content.includes('import ') || !content.match(/import.*\{[^}]*ReactNode[^}]*\}.*from ['"]react['"]/)) {
      // Add ReactNode to imports
      const reactImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
      if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (!imports.includes('ReactNode')) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
            `import { ${imports.trim() ? imports + ', ' : ''}ReactNode } from 'react'`
          );
        }
      } else {
        // Add new import for ReactNode
        content = `import { ReactNode } from 'react';\n${content}`;
      }
    }
    
    content = content.replace(/React\.ReactNode/g, 'ReactNode');
    modified = true;
    console.log(`Updated React.ReactNode in: ${filePath}`);
  }
  
  // Update React.ComponentType to ComponentType
  if (content.includes('React.ComponentType')) {
    // Check if ComponentType is already imported
    if (!content.includes('import ') || !content.match(/import.*\{[^}]*ComponentType[^}]*\}.*from ['"]react['"]/)) {
      // Add ComponentType to imports
      const reactImportMatch = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/);
      if (reactImportMatch) {
        const imports = reactImportMatch[1];
        if (!imports.includes('ComponentType')) {
          content = content.replace(
            /import\s*\{([^}]*)\}\s*from\s*['"]react['"]/,
            `import { ${imports.trim() ? imports + ', ' : ''}ComponentType } from 'react'`
          );
        }
      } else {
        // Add new import for ComponentType
        content = `import { ComponentType } from 'react';\n${content}`;
      }
    }
    
    content = content.replace(/React\.ComponentType/g, 'ComponentType');
    modified = true;
    console.log(`Updated React.ComponentType in: ${filePath}`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
}

// Start the update process
const srcPath = path.join(__dirname, 'src');
console.log('Updating React patterns for React 19 compatibility...');
updateReactPatterns(srcPath);
console.log('✅ React pattern updates complete!');
