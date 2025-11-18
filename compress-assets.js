// Asset Compression Script
// Compresses textures and audio files

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗜️  Starting asset compression...\n');

// Check if sharp is installed
let sharp;
try {
    sharp = (await import('sharp')).default;
} catch (e) {
    console.log('📦 Installing sharp for image compression...');
    execSync('npm install --save-dev sharp', { stdio: 'inherit' });
    sharp = (await import('sharp')).default;
}

// Texture compression settings
const TEXTURE_QUALITY = 80; // WebP quality (0-100)
const MAX_TEXTURE_SIZE = 1024; // Max dimension in pixels

// Paths
const texturesDir = path.join(__dirname, 'public', 'textures');
const soundsDir = path.join(__dirname, 'public', 'textures', 'sounds');
const backupDir = path.join(__dirname, 'public', 'textures', 'originals');

// Create backup directory
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Compress textures
async function compressTextures() {
    console.log('🖼️  Compressing textures...\n');
    
    const files = fs.readdirSync(texturesDir)
        .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'));
    
    for (const file of files) {
        const inputPath = path.join(texturesDir, file);
        const backupPath = path.join(backupDir, file);
        const outputPath = inputPath;
        
        try {
            const stats = fs.statSync(inputPath);
            const originalSize = (stats.size / 1024).toFixed(2);
            
            // Backup original
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(inputPath, backupPath);
            }
            
            // Compress
            await sharp(inputPath)
                .resize(MAX_TEXTURE_SIZE, MAX_TEXTURE_SIZE, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: TEXTURE_QUALITY })
                .toFile(outputPath + '.tmp');
            
            // Replace original
            fs.renameSync(outputPath + '.tmp', outputPath);
            
            const newStats = fs.statSync(outputPath);
            const newSize = (newStats.size / 1024).toFixed(2);
            const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
            
            console.log(`✅ ${file}`);
            console.log(`   ${originalSize} KB → ${newSize} KB (${savings}% smaller)\n`);
        } catch (error) {
            console.error(`❌ Failed to compress ${file}:`, error.message);
        }
    }
}

// Compress audio files
function compressAudio() {
    console.log('🔊 Compressing audio files...\n');
    
    // Check if ffmpeg is available
    try {
        execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch (e) {
        console.log('⚠️  FFmpeg not found. Skipping audio compression.');
        console.log('   Install FFmpeg to compress audio: https://ffmpeg.org/download.html\n');
        return;
    }
    
    const audioBackupDir = path.join(soundsDir, 'originals');
    if (!fs.existsSync(audioBackupDir)) {
        fs.mkdirSync(audioBackupDir, { recursive: true });
    }
    
    const files = fs.readdirSync(soundsDir)
        .filter(f => f.endsWith('.mp3'));
    
    for (const file of files) {
        const inputPath = path.join(soundsDir, file);
        const backupPath = path.join(audioBackupDir, file);
        const outputPath = inputPath;
        
        try {
            const stats = fs.statSync(inputPath);
            const originalSize = (stats.size / 1024).toFixed(2);
            
            // Backup original
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(inputPath, backupPath);
            }
            
            // Compress with FFmpeg (lower bitrate)
            execSync(
                `ffmpeg -i "${inputPath}" -b:a 96k -y "${outputPath}.tmp"`,
                { stdio: 'ignore' }
            );
            
            // Replace original
            fs.renameSync(outputPath + '.tmp', outputPath);
            
            const newStats = fs.statSync(outputPath);
            const newSize = (newStats.size / 1024).toFixed(2);
            const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
            
            console.log(`✅ ${file}`);
            console.log(`   ${originalSize} KB → ${newSize} KB (${savings}% smaller)\n`);
        } catch (error) {
            console.error(`❌ Failed to compress ${file}:`, error.message);
        }
    }
}

// Run compression
try {
    await compressTextures();
    compressAudio();
    
    console.log('\n✨ Compression complete!');
    console.log('📁 Original files backed up to:');
    console.log(`   ${backupDir}`);
    console.log(`   ${path.join(soundsDir, 'originals')}`);
} catch (error) {
    console.error('❌ Compression failed:', error);
    process.exit(1);
}
