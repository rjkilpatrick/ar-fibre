precision mediump float; // or lowp

varying vec2 v_uv;

// attribute mat4 projectionMatrix;
// attribute mat4 modelViewMatrix;
// attribute vec2 uv;
// attribute vec3 position;

void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
