/**
 * Script to replace console.log calls with logger utility
 * Usage: node scripts/replace-console-logs.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Files to update (excluding main.jsx which has dev-specific logs)
const filesToUpdate = [
  'src/features/extra/Extra.jsx',
  'src/features/instructor/InstructorDashboard.jsx',
  'src/layouts/AppLayout.jsx',
  'src/components/ui/NavTabs.jsx',
  'src/features/admin/AdminClubDashboard.jsx',
  'src/features/stats/StatisticheGiocatore.jsx'
];

// Import statement to add (using @ alias like other files)
const loggerImport = "import { logger } from '@/utils/logger';";

// Mapping of console methods to logger methods
const replacements = [
  // Debug logs (dev only)
  { from: /console\.log\('🔍.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('📚.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🎓.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🏓.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('⏰.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🏢.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🚫.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('📍.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🔄.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🎯.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('⚠️.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('✅.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🔘.*?\[.*?\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('📊.*?\[DEBUG\].*?',/g, to: "logger.debug(" },
  { from: /console\.log\('🔎.*?\[.*?\].*?',/g, to: "logger.debug(" },
  
  // Remove emoji and [Component] prefixes from messages
  { from: /\[.*?\]\s+/g, to: "" }
];

function processFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (file not found)`);
    return { skipped: true };
  }

  console.log(`📝 Processing ${filePath}...`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Count console.log occurrences before replacement
  const consoleLogs = (content.match(/console\.(log|debug|info)\(/g) || []).length;
  if (consoleLogs === 0) {
    console.log(`   ✅ Already clean (no debug logs found)`);
    return { replaced: 0 };
  }

  // Add logger import if not present
  if (!content.includes("from '@/utils/logger'") && !content.includes('from "@/utils/logger"')) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, loggerImport);
      content = lines.join('\n');
      console.log(`   ➕ Added logger import`);
    }
  }

  // Apply replacements
  let replaced = 0;
  replacements.forEach(({ from, to }) => {
    const matches = content.match(from) || [];
    if (matches.length > 0) {
      content = content.replace(from, to);
      replaced += matches.length;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`   ✅ Replaced ${replaced} console.log calls`);
    return { replaced };
  } else {
    console.log(`   ⏭️  No changes needed`);
    return { replaced: 0 };
  }
}

// Main execution
console.log('🧹 Starting console.log cleanup...\n');

let totalReplaced = 0;
let totalSkipped = 0;
let totalProcessed = 0;

filesToUpdate.forEach(file => {
  const result = processFile(file);
  if (result.skipped) {
    totalSkipped++;
  } else {
    totalProcessed++;
    totalReplaced += result.replaced;
  }
  console.log('');
});

console.log('📊 Summary:');
console.log(`   Files processed: ${totalProcessed}`);
console.log(`   Files skipped: ${totalSkipped}`);
console.log(`   Total replacements: ${totalReplaced}`);
console.log('\n✅ Cleanup complete!');
console.log('💡 Run "npm run build" to validate changes');
