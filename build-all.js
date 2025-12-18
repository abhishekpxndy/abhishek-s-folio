#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';

console.log('🚀 Building integrated portfolio...\n');

try {
  // Build the inner site first in its own directory
  console.log('📱 Building inner site...');
  process.chdir('inner-site');
  execSync('npm run build', { stdio: 'inherit' });
  process.chdir('..');
  
  // Build the main site
  console.log('\n🏠 Building main site...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy inner site build to main dist folder
  console.log('\n📁 Copying inner site to main dist...');
  if (existsSync('inner-site/build')) {
    if (!existsSync('dist')) {
      mkdirSync('dist');
    }
    cpSync('inner-site/build', 'dist/inner-site', { recursive: true });
    console.log('✅ Inner site copied to dist/inner-site/');
  }
  
  console.log('\n✅ Build completed successfully!');
  console.log('📁 Output: dist/ folder');
  console.log('🌐 Inner site: dist/inner-site/');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}