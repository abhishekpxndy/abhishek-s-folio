uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main()
{
    // Scale and animate
    vec2 steamUv = vUv;
    steamUv.x *= 0.5;
    steamUv.y *= 0.3;
    steamUv.y -= uTime * 0.04;

    // Steam
    float steam = texture(uPerlinTexture, steamUv).r;

    // Remap
    steam = smoothstep(0.4, 1.0, steam);

    // Edges
    steam *= smoothstep(0.0, 0.1, vUv.x);
    steam *= smoothstep(1.0, 0.9, vUv.x);
    steam *= smoothstep(0.0, 0.1, vUv.y);
    steam *= smoothstep(1.0, 0.4, vUv.y);

    // Final color
    gl_FragColor = vec4(1.0, 1.0, 1.0, steam * 0.6);
}