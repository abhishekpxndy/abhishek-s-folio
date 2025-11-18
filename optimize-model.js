// Model Optimization Script
// Run: node optimize-model.js

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { simplify, weld, dedup } from '@gltf-transform/functions';

async function optimizeModel() {
    console.log('🔧 Starting model optimization...');
    
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    
    // Load the model
    console.log('📂 Loading beg-v1.glb...');
    const document = await io.read('public/models/beg-v1.glb');
    
    // Get initial stats
    const root = document.getRoot();
    const initialPrims = root.listMeshes().reduce((acc, mesh) => 
        acc + mesh.listPrimitives().length, 0
    );
    console.log(`📊 Initial primitives: ${initialPrims}`);
    
    // Optimize
    console.log('⚙️ Applying optimizations...');
    
    // 1. Weld vertices (merge duplicates)
    await document.transform(weld());
    
    // 2. Remove duplicate data
    await document.transform(dedup());
    
    // 3. Simplify geometry (reduce triangles by 70%)
    await document.transform(
        simplify({ 
            simplifier: 'meshoptimizer',
            ratio: 0.3,  // Keep 30% of triangles
            error: 0.001
        })
    );
    
    // Get final stats
    const finalPrims = root.listMeshes().reduce((acc, mesh) => 
        acc + mesh.listPrimitives().length, 0
    );
    console.log(`📊 Final primitives: ${finalPrims}`);
    console.log(`✅ Reduced by ${Math.round((1 - finalPrims/initialPrims) * 100)}%`);
    
    // Save optimized model
    console.log('💾 Saving optimized model...');
    await io.write('public/models/beg-v1-optimized.glb', document);
    
    console.log('✅ Done! Optimized model saved as beg-v1-optimized.glb');
    console.log('📝 Test it first, then rename to beg-v1.glb to replace the original');
}

optimizeModel().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
