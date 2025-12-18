const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Creating Aladdin .jsdos bundle...');

// Step 1: Extract the ZIP
console.log('Step 1: Extracting octaltrn.zip...');
try {
    execSync('powershell Expand-Archive -Path public/octaltrn.zip -DestinationPath temp_aladdin -Force', { stdio: 'inherit' });
} catch (e) {
    console.error('Error extracting ZIP. Make sure octaltrn.zip exists in public folder.');
    process.exit(1);
}

// Step 2: Create .jsdos folder
console.log('Step 2: Creating .jsdos folder...');
const jsdosDir = path.join('temp_aladdin', '.jsdos');
if (!fs.existsSync(jsdosDir)) {
    fs.mkdirSync(jsdosDir, { recursive: true });
}

// Step 3: Create dosbox.conf
console.log('Step 3: Creating dosbox.conf...');
const dosboxConf = `[cpu]
core=auto
cputype=auto
cycles=max

[autoexec]
@echo off
mount c .
c:
ALADDIN.EXE
exit
`;

fs.writeFileSync(path.join(jsdosDir, 'dosbox.conf'), dosboxConf);

// Step 4: Create the .jsdos bundle (ZIP)
console.log('Step 4: Creating aladin.jsdos bundle...');
try {
    // First create as ZIP
    execSync('powershell Compress-Archive -Path temp_aladdin/* -DestinationPath public/aladin.zip -Force', { stdio: 'inherit' });
    // Then rename to .jsdos
    if (fs.existsSync('public/aladin.jsdos')) {
        fs.unlinkSync('public/aladin.jsdos');
    }
    fs.renameSync('public/aladin.zip', 'public/aladin.jsdos');
} catch (e) {
    console.error('Error creating bundle.');
    process.exit(1);
}

// Step 5: Cleanup
console.log('Step 5: Cleaning up...');
try {
    execSync('powershell Remove-Item -Recurse -Force temp_aladdin', { stdio: 'inherit' });
} catch (e) {
    console.log('Cleanup warning: Could not remove temp folder');
}

console.log('\n✅ Success! aladin.jsdos has been created in the public folder!');
console.log('You can now test Aladdin on your site.');
