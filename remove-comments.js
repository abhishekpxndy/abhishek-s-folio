import fs from 'fs';

const files = [
    'src/main.js',
    'src/audioSynth.js',
    'src/style.scss'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove single-line comments
    content = content.replace(/^\s*\/\/.*$/gm, '');
    
    // Remove inline comments (but keep URLs like https://)
    content = content.replace(/([^:])\/\/.*$/gm, '$1');
    
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove empty lines (more than 2 consecutive)
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(file, content);
    console.log(`✅ Removed comments from ${file}`);
});

console.log('\n✨ All comments removed!');
