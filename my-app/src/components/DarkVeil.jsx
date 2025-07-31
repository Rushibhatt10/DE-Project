// src/components/DarkVeil.jsx
import { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";
import "./DarkVeil.css";

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

#define iTime uTime
#define iResolution uResolution

vec4 buf[8];
float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}

mat3 rgb2yiq=mat3(0.299,0.587,0.114,
                   0.596,-0.274,-0.322,
                   0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,
                  1.0,-0.272,-0.647,
                  1.0,-1.106,1.703);

vec3 hueShiftRGB(vec3 col,float deg){
    vec3 yiq=rgb2yiq*col;
    float rad=radians(deg);
    float cosh=cos(rad),sinh=sin(rad);
    vec3 yiqShift=vec3(yiq.x,yiq.y*cosh-yiq.z*sinh,yiq.y*sinh+yiq.z*cosh);
    return clamp(yiq2rgb*yiqShift,0.0,1.0);
}

vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

vec4 cppn_fn(vec2 coordinate,float in0,float in1,float in2){
    buf[6]=vec4(coordinate.x,coordinate.y,0.3948333106474662+in0,0.36+in1);
    buf[7]=vec4(0.14+in2,sqrt(coordinate.x*coordinate.x+coordinate.y*coordinate.y),0.,0.);
    buf[0]=mat4(vec4(6.5404263,-3.6126034,0.7590882,-1.13613),
                vec4(2.4582713,3.1660357,1.2219609,0.06276096),
                vec4(-5.478085,-6.159632,1.8701609,-4.7742867),
                vec4(6.039214,-5.542865,-0.90925294,3.251348))*buf[6]
           +mat4(vec4(0.8473259,-5.722911,3.975766,1.6522468),
                 vec4(-0.24321538,0.5839259,-1.7661959,-5.350116),
                 vec4(0.,0.,0.,0.),
                 vec4(0.,0.,0.,0.))*buf[7]
           +vec4(0.21808943,1.1243913,-1.7969975,5.0294676);
    buf[1]=mat4(vec4(-3.3522482,-6.0612736,0.55641043,-4.4719114),
                vec4(0.8631464,1.7432913,5.643898,1.6106541),
                vec4(2.4941394,-3.5012043,1.7184316,6.357333),
                vec4(3.310376,8.209261,1.1355612,-1.165539))*buf[6]
           +mat4(vec4(5.24046,-13.034365,0.009859298,15.870829),
                 vec4(2.987511,3.129433,-0.89023495,-1.6822904),
                 vec4(0.,0.,0.,0.),
                 vec4(0.,0.,0.,0.))*buf[7]
           +vec4(-5.9457836,-6.573602,-0.8812491,1.5436668);
    buf[0]=sigmoid(buf[0]);buf[1]=sigmoid(buf[1]);
    buf[2]=mat4(vec4(-15.219568,8.095543,-2.429353,-1.9381982),
                vec4(-5.951362,4.3115187,2.6393783,1.274315),
                vec4(-7.3145227,6.7297835,5.2473326,5.9411426),
                vec4(5.0796127,8.979051,-1.7278991,-1.158976))*buf[6]
           +mat4(vec4(-11.967154,-11.608155,6.1486754,11.237008),
                 vec4(2.124141,-6.263192,-1.7050359,-0.7021966),
                 vec4(0.,0.,0.,0.),
                 vec4(0.,0.,0.,0.))*buf[7]
           +vec4(-4.17164,-3.2281182,-4.576417,-3.6401186);
    buf[3]=mat4(vec4(3.1832156,-13.738922,1.879223,3.233465),
                vec4(0.64300746,12.768129,1.9141049,0.50990224),
                vec4(-0.049295485,4.4807224,1.4733979,1.801449),
                vec4(5.0039253,13.000481,3.3991797,-4.5561905))*buf[6]
           +mat4(vec4(-0.1285731,7.720628,-3.1425676,4.742367),
                 vec4(0.6393625,3.714393,-0.8108378,-0.39174938),
                 vec4(0.,0.,0.,0.),
                 vec4(0.,0.,0.,0.))*buf[7]
           +vec4(-1.1811101,-21.621881,0.7851888,1.2329718);
    buf[2]=sigmoid(buf[2]);buf[3]=sigmoid(buf[3]);
    buf[4]=mat4(vec4(5.214916,-7.183024,2.7228765,2.6592617),
                vec4(-5.601878,-25.3591,4.067988,0.4602802),
                vec4(-10.57759,24.286327,21.102104,37.546658),
                vec4(4.3024497,-1.9625226,2.3458803,-1.372816))*buf[0]
           +mat4(vec4(-17.6526,-10.507558,2.2587414,12.462782),
                 vec4(6.265566,-502.75443,-12.642513,0.9112289),
                 vec4(-10.983244,20.741234,-9.701768,-0.7635988),
                 vec4(5.383626,1.4819539,-4.1911616,-4.8444734))*buf[1]
           +mat4(vec4(12.785233,-16.345072,-0.39901125,1.7955981),
                 vec4(-30.48365,-1.8345358,1.4542528,-1.1118771),
                 vec4(19.872723,-7.337935,-42.941723,-98.52709),
                 vec4(8.337645,-2.7312303,-2.2927687,-36.142323))*buf[2]
           +mat4(vec4(-16.298317,3.5471997,-0.44300047,-9.444417),
                 vec4(57.5077,-35.609753,16.163465,-4.1534753),
                 vec4(-0.07470326,-3.8656476,-7.0901804,3.1523974),
                 vec4(-12.559385,-7.077619,1.490437,-0.8211543))*buf[3]
           +vec4(-7.67914,15.927437,1.3207729,-1.6686112);
    buf[5]=mat4(vec4(-1.4109162,-0.372762,-3.770383,-21.367174),
                vec4(-6.2103205,-9.35908,0.92529047,8.82561),
                vec4(11.460242,-22.348068,13.625772,-18.693201),
                vec4(-0.3429052,-3.9905605,-2.4626114,-0.45033523))*buf[0]
           +mat4(vec4(7.3481627,-4.3661838,-6.3037653,-3.868115),
                 vec4(1.5462853,6.5488915,1.9701879,-0.58291394),
                 vec4(6.5858274,-2.2180402,3.7127688,-1.3730392),
                 vec4(-5.7973905,10.134961,-2.3395722,-5.965605))*buf[1]
           +mat4(vec4(-2.5132585,-6.6685553,-1.4029363,-0.16285264),
                 vec4(-0.37908727,0.53738135,4.389061,-1.3024765),
                 vec4(-0.70647055,2.0111287,-5.1659346,-3.728635),
                 vec4(-13.562562,10.487719,-0.9173751,-2.6487076))*buf[2]
           +mat4(vec4(-8.645013,6.5546675,-6.3944063,-5.5933375),
                 vec4(-0.57783127,-1.077275,36.91025,5.736769),
                 vec4(14.283112,3.7146652,7.1452246,-4.5958776),
                 vec4(2.7192075,3.6021907,-4.366337,-2.3653464))*buf[3]
           +vec4(-5.9000807,-4.329569,1.2427121,8.59503);
    buf[4]=sigmoid(buf[4]);buf[5]=sigmoid(buf[5]);
    buf[6]=mat4(vec4(-1.61102,0.7970257,1.4675229,0.20917463),
                vec4(-28.793737,-7.1390953,1.5025433,4.656581),
                vec4(-10.94861,39.66238,0.74318546,-10.095605),
                vec4(-0.7229728,-1.5483948,0.7301322,2.1687684))*buf[0]
           +mat4(vec4(3.2547753,21.489103,-1.0194173,-3.3100595),
                 vec4(-3.7316632,-3.3792162,-7.223193,-0.23685838),
                 vec4(13.1804495,0.7916005,5.338587,5.687114),
                 vec4(-4.167605,-17.798311,-6.815736,-1.6451967))*buf[1]
           +mat4(vec4(0.604885,-7.800309,-7.213122,-2.741014),
                 vec4(-3.522382,-0.12359311,-0.5258442,0.43852118),
                 vec4(9.6752825,-22.853785,2.062431,0.099892326),
                 vec4(-4.3196306,-17.730087,2.5184598,5.183942))*buf[2]
           +mat4(vec4(4.698651,5.9881787,4.327365,9.525015),
                 vec4(-10.281484,2.8600626,-3.0213747,-7.1772394),
                 vec4(-11.445799,-9.269867,-1.3814458,-0.28611103),
                 vec4(-3.112356,-0.12270772,2.8573842,6.3298476))*buf[3]
           +vec4(-1.320786,2.334825,0.8682534,-0.2930609);
    return vec4(buf[4].xyz,1.);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  // Warp effect
  float warp = uWarp * sin(uv.y * 10.0 + uTime * 5.0);
  uv.x += warp;

  // Base color from CPPN function
  vec4 color = cppn_fn(uv * 2.0 - 1.0, uHueShift, uNoise, uScan);

  // Hue shift effect
  color.rgb = hueShiftRGB(color.rgb, uHueShift);

  // Scanlines effect
  float scanline = sin(uv.y * uScanFreq * 3.14159 + uTime * 10.0) * uScan;
  color.rgb += scanline;

  // Noise effect
  float noise = rand(gl_FragCoord.xy + uTime) * uNoise;
  color.rgb += noise;

  gl_FragColor = color;
}
`;

export default function DarkVeil({
  hueShift = 0,
  noiseIntensity = 0,
  scanlineIntensity = 0,
  speed = 0.5,
  scanlineFrequency = 0,
  warpAmount = 0,
  resolutionScale = 1,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const canvas = ref.current;
    const parent = canvas.parentElement;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      canvas,
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uScan: { value: scanlineIntensity },
        uScanFreq: { value: scanlineFrequency },
        uWarp: { value: warpAmount },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w * resolutionScale, h * resolutionScale);
      program.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    const start = performance.now();
    let frameId;

    const animate = () => {
      const elapsed = (performance.now() - start) / 1000;
      program.uniforms.uTime.value = elapsed * speed;
      program.uniforms.uHueShift.value = hueShift;
      program.uniforms.uNoise.value = noiseIntensity;
      program.uniforms.uScan.value = scanlineIntensity;
      program.uniforms.uScanFreq.value = scanlineFrequency;
      program.uniforms.uWarp.value = warpAmount;

      renderer.render({ scene: mesh });
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      // No dispose method on renderer
    };
  }, [
    hueShift,
    noiseIntensity,
    scanlineIntensity,
    speed,
    scanlineFrequency,
    warpAmount,
    resolutionScale,
  ]);

  return (
    <canvas
      ref={ref}
      className="darkveil-canvas"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
