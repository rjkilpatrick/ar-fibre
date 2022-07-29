precision mediump float; // or lowp

uniform sampler2D u_modeAtlasTexture;
uniform vec2 u_uvOffset;
uniform vec2 u_repeat;
uniform float u_time;
varying vec2 v_uv;

// Taken from <https://stackoverflow.com/a/17897228> under WTFPL
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Taken from <https://stackoverflow.com/a/17897228> under WTFPL
// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
}

void main() {
    vec4 original = texture2D(u_modeAtlasTexture, u_repeat * v_uv + u_uvOffset);
    vec3 hsv = rgb2hsv(original.xyz);
    hsv.x = fract(hsv.x + (u_time * 3.5e-4));
    gl_FragColor = vec4(hsv2rgb(hsv), hsv.z);
}