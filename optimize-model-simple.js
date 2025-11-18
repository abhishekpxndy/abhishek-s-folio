// Simple Model Optimization Script
// Run: node optimize-model-simple.js

import { NodeIO } from '@gltf-transform/core';
import { simplify, weld, dedup, prune } from '@gltf-transform/functions';

async function optimizeModel() {
    console.log('🔧 Starting model optimization...');
    
    // Create IO without extensions to avoid Draco issues
    const io = new NodeIO();
    
    try {
        // Load the model
        console.log('📂 Loading beg-v1.glb...');
        const document = await io.read('public/models/beg-v1.glb');
        
        console.log('⚙️ Applying optimizations...');
        
        // 1. Weld vertices (merge duplicates)
        console.log('  - Welding vertices...');
        await document.transform(weld({ tolerance: 0.0001 }));
        
        // 2. Remove duplicate data
        console.log('  - Removing duplicates...');
        await document.transform(dedup());
        
        // 3. Simplify geometry (reduce triangles by 70%)
        console.log('  - Simplifying geometry (this may take a minute)...');
        await document.transform(
            simplify({ 
                simplifier: 'meshoptimizer',
                ratio: 0.3,  // Keep 30% of triangles (278K → ~83K)
                error: 0.001
            })
        );
        
        // 4. Clean up unused data
        console.log('  - Pruning unused data...');
        await document.transform(prune());
        
        // Save optimized model
        console.log('💾 Saving optimized model...');
        await io.write('public/models/beg-v1-optimized.glb', document);
        
        console.log('✅ Done! Optimized model saved as beg-v1-optimized.glb');
        console.log('');
        console.log('📝 Next steps:');
        console.log('1. Test the optimized model in your app');
        console.log('2. If it looks good, replace the original:');
        console.log('   copy public\\models\\beg-v1-optimized.glb public\\models\\beg-v1.glb');
        
    } catch (err) {
        console.error('❌ Error:', err.message);
        console.error('');
        console.error('💡 Tip: Make sure public/models/beg-v1.glb exists');
        process.exit(1);
    }
}

optimizeModel();
