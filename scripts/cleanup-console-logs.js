/**
 * Script to automatically replace console.log calls with logger utility
 * This is a PowerShell-compatible version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to update (from DEBUG_LOGS_CLEANUP_GUIDE.md)
const filesToUpdate = [
  'src/features/extra/Extra.jsx',
  'src/features/instructor/InstructorDashboard.jsx',
  'src/layouts/AppLayout.jsx',
  'src/components/ui/NavTabs.jsx',
  'src/features/admin/AdminClubDashboard.jsx',
  'src/features/stats/StatisticheGiocatore.jsx'
];

const projectRoot = path.resolve(__dirname, '..');

function processFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return { skipped: true };
  }

  console.log(`\n📝 Processing ${filePath}...`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let replaced = 0;

  // Check if logger import already exists
  const hasLoggerImport = content.includes("from '@/utils/logger'") || 
                          content.includes('from "@/utils/logger"') ||
                          content.includes("from '@utils/logger'");

  // Add logger import if not present
  if (!hasLoggerImport) {
    // Find last import line
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('import ') && !trimmed.includes('//')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/utils/logger';");
      content = lines.join('\n');
      console.log(`   ➕ Added logger import after line ${lastImportIndex + 1}`);
    }
  } else {
    console.log(`   ✓ Logger import already exists`);
  }

  // Replace console.log patterns
  // Pattern 1: console.log with emoji and [Component] tag
  const pattern1 = /console\.log\(['"](?:🔍|📚|🎓|🏓|⏰|🏢|🚫|📍|🔄|🎯|⚠️|✅|🔘|📊|🔎)\s*\[[\w\s]+\]\s*([^'"]+)['"]/g;
  content = content.replace(pattern1, (match, message) => {
    replaced++;
    // Remove trailing comma or colon if present
    message = message.trim().replace(/[,:]\s*$/, '');
    return `logger.debug('${message}'`;
  });

  // Pattern 2: Simple console.log
  const pattern2 = /console\.log\(/g;
  const matches2 = content.match(pattern2);
  if (matches2) {
    // Only replace if we haven't replaced via pattern1
    const remainingConsoleLog = (content.match(/console\.log/g) || []).length;
    if (remainingConsoleLog > 0) {
      content = content.replace(/console\.log\(/g, 'logger.debug(');
      replaced += remainingConsoleLog;
    }
  }

  // Pattern 3: console.error
  content = content.replace(/console\.error\(/g, 'logger.error(');
  
  // Pattern 4: console.warn
  content = content.replace(/console\.warn\(/g, 'logger.warn(');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`   ✅ Replaced ${replaced} console calls`);
    return { replaced };
  } else {
    console.log(`   ⏭️  No changes needed`);
    return { replaced: 0 };
  }
}

// Main execution
console.log('🧹 Starting console.log cleanup automation...\n');
console.log('=' .repeat(60));

let totalReplaced = 0;
let totalProcessed = 0;
let totalSkipped = 0;

filesToUpdate.forEach(file => {
  const result = processFile(file);
  if (result.skipped) {
    totalSkipped++;
  } else {
    totalProcessed++;
    totalReplaced += result.replaced;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 CLEANUP SUMMARY:');
console.log(`   Files processed: ${totalProcessed}`);
console.log(`   Files skipped: ${totalSkipped}`);
console.log(`   Total replacements: ${totalReplaced}`);
console.log('\n✅ Cleanup complete!');
console.log('💡 Run "npm run build" to validate changes');
