import{r as g}from"./index.DiEladB3.js";const R="modulepreload",$=function(t){return"/evalla/pr-preview/pr-9/"+t},N={},P=function(s,n,d){let l=Promise.resolve();if(n&&n.length>0){let c=function(m){return Promise.all(m.map(u=>Promise.resolve(u).then(b=>({status:"fulfilled",value:b}),b=>({status:"rejected",reason:b}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),h=o?.nonce||o?.getAttribute("nonce");l=c(n.map(m=>{if(m=$(m),m in N)return;N[m]=!0;const u=m.endsWith(".css"),b=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${b}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":R,u||(p.as="script"),p.crossOrigin="",p.href=m,h&&p.setAttribute("nonce",h),document.head.appendChild(p),u)return new Promise((i,r)=>{p.addEventListener("load",i),p.addEventListener("error",()=>r(new Error(`Unable to preload CSS for ${m}`)))})}))}function a(c){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=c,window.dispatchEvent(o),!o.defaultPrevented)throw c}return l.then(c=>{for(const o of c||[])o.status==="rejected"&&a(o.reason);return s().catch(a)})};var v={exports:{}},y={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var w;function A(){if(w)return y;w=1;var t=Symbol.for("react.transitional.element"),s=Symbol.for("react.fragment");function n(d,l,a){var c=null;if(a!==void 0&&(c=""+a),l.key!==void 0&&(c=""+l.key),"key"in l){a={};for(var o in l)o!=="key"&&(a[o]=l[o])}else a=l;return l=a.ref,{$$typeof:t,type:d,key:c,ref:l!==void 0?l:null,props:a}}return y.Fragment=s,y.jsx=n,y.jsxs=n,y}var E;function M(){return E||(E=1,v.exports=A()),v.exports}var e=M();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(...t)=>t.filter((s,n,d)=>!!s&&s.trim()!==""&&d.indexOf(s)===n).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,n,d)=>d?d.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>{const s=T(t);return s.charAt(0).toUpperCase()+s.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var L={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=t=>{for(const s in t)if(s.startsWith("aria-")||s==="role"||s==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=g.forwardRef(({color:t="currentColor",size:s=24,strokeWidth:n=2,absoluteStrokeWidth:d,className:l="",children:a,iconNode:c,...o},h)=>g.createElement("svg",{ref:h,...L,width:s,height:s,stroke:t,strokeWidth:d?Number(n)*24/Number(s):n,className:_("lucide",l),...!a&&!I(o)&&{"aria-hidden":"true"},...o},[...c.map(([m,u])=>g.createElement(m,u)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=(t,s)=>{const n=g.forwardRef(({className:d,...l},a)=>g.createElement(q,{ref:a,iconNode:s,className:_(`lucide-${S(k(t))}`,`lucide-${t}`,d),...l}));return n.displayName=k(t),n};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],z=j("book-open",U);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],J=j("play",V);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],B=j("plus",O);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],C=j("trash-2",F);function D(){const[t,s]=g.useState([{name:"a",expr:"10"},{name:"b",expr:"a * 2"},{name:"c",expr:"a + b"}]),[n,d]=g.useState(null),[l,a]=g.useState(null),[c,o]=g.useState(null),h=(i,r,x)=>{const f=[...t];f[i][r]=x,s(f)},m=()=>{s([...t,{name:"",expr:""}])},u=i=>{s(t.filter((r,x)=>x!==i))},b=()=>{s([{name:"radius",expr:"5"},{name:"pi",expr:"$math.PI"},{name:"circumference",expr:"2 * pi * radius"},{name:"area",expr:"pi * radius * radius"},{name:"point",expr:"{x: 10, y: 20}"},{name:"scaledX",expr:"point.x * 2"}]),d(null),a(null),o(null)},p=async()=>{a(null),o(null);try{const{evalla:i}=await P(async()=>{const{evalla:f}=await import("./index.Cd4RluUo.js");return{evalla:f}},[]),r=t.filter(f=>f.name.trim()&&f.expr.trim());if(r.length===0){a("Please add at least one expression");return}const x=await i(r);d(x)}catch(i){if(a(i.message),d(null),i.variableName){const r=t.findIndex(x=>x.name===i.variableName);r!==-1&&o(r)}}};return e.jsxs("div",{className:"content",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("h2",{style:{marginTop:"2rem"},children:"Playground"}),e.jsx("p",{className:"text-gray-600 text-sm sm:text-base mb-4",children:"Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically."}),e.jsxs("div",{className:"bg-gray-50 rounded-lg p-3 sm:p-4 mb-4",children:[e.jsxs("div",{className:"hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 mb-2 text-sm font-medium text-gray-600",children:[e.jsx("div",{children:"Name"}),e.jsx("div",{children:"Expression"}),e.jsx("div",{className:"w-[90px]"})]}),e.jsx("div",{className:"space-y-4 sm:space-y-2",children:t.map((i,r)=>e.jsxs("div",{className:`${c===r?"bg-red-50 -mx-2 px-2 py-1 rounded":""}`,children:[e.jsxs("div",{className:"hidden sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-center",children:[e.jsx("input",{type:"text",placeholder:"e.g. radius",value:i.name,onChange:x=>h(r,"name",x.target.value),className:`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===r?"border-red-300 bg-white":"border-gray-300 bg-white"}`}),e.jsx("input",{type:"text",placeholder:"e.g. a + b",value:i.expr,onChange:x=>h(r,"expr",x.target.value),className:`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===r?"border-red-300 bg-white":"border-gray-300 bg-white"}`}),e.jsxs("button",{onClick:()=>u(r),className:"px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center",children:[e.jsx(C,{size:16}),e.jsx("span",{children:"Remove"})]})]}),e.jsxs("div",{className:"sm:hidden flex gap-2",children:[e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx("label",{className:"text-xs font-medium text-gray-600 w-12",children:"Name"}),e.jsx("input",{type:"text",placeholder:"e.g. radius",value:i.name,onChange:x=>h(r,"name",x.target.value),className:`flex-1 px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===r?"border-red-300 bg-white":"border-gray-300 bg-white"}`})]}),e.jsxs("div",{className:"flex gap-2 items-center",children:[e.jsx("label",{className:"text-xs font-medium text-gray-600 w-12",children:"Expr"}),e.jsx("input",{type:"text",placeholder:"e.g. a + b",value:i.expr,onChange:x=>h(r,"expr",x.target.value),className:`flex-1 px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===r?"border-red-300 bg-white":"border-gray-300 bg-white"}`})]})]}),e.jsx("button",{onClick:()=>u(r),className:"p-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors self-center",children:e.jsx(C,{size:16})})]})]},r))}),e.jsxs("button",{onClick:m,className:"mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(B,{size:18}),e.jsx("span",{children:"Add"})]})]}),e.jsx("div",{className:"flex flex-wrap gap-2 sm:gap-3 justify-center",children:e.jsxs("button",{onClick:b,className:"px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(z,{size:18}),e.jsx("span",{children:"Example"})]})})]}),l&&e.jsx("div",{className:"bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded",children:e.jsx("p",{className:"text-red-700 font-mono text-sm",children:l})}),e.jsx("div",{className:"mb-6",children:e.jsxs("div",{className:"bg-green-50 rounded-lg p-4",children:[e.jsx("h3",{className:"text-xl sm:text-2xl font-semibold text-gray-800 mb-3",children:"Results"}),e.jsxs("div",{className:"flex gap-2 mb-4",children:[e.jsxs("button",{onClick:p,className:"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(J,{size:18}),e.jsx("span",{children:"Evaluate"})]}),n&&e.jsx("button",{onClick:()=>d(null),className:"px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors",children:"Reset"})]}),n?e.jsxs(e.Fragment,{children:[e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b border-green-200",children:[e.jsx("th",{className:"text-left py-2 font-medium text-gray-600",children:"Name"}),e.jsx("th",{className:"text-left py-2 font-medium text-gray-600",children:"Value"})]})}),e.jsx("tbody",{children:Object.entries(n.values).map(([i,r])=>e.jsxs("tr",{children:[e.jsx("td",{className:"py-2 px-2 font-mono text-gray-700",children:i}),e.jsx("td",{className:"py-2 px-2 font-mono text-green-700 font-semibold break-all",children:r.toString()})]},i))})]}),e.jsxs("div",{className:"mt-4 text-gray-600 text-xs sm:text-sm italic",children:["Evaluation order: ",n.order.join(" → ")]})]}):e.jsx("p",{className:"text-gray-500 text-sm italic",children:"Click Evaluate to see results"})]})}),e.jsxs("div",{className:"bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 sm:p-6",children:[e.jsx("h3",{className:"text-lg sm:text-xl font-semibold text-blue-900 mb-3",children:"Quick Tips"}),e.jsxs("ul",{className:"space-y-1.5 text-gray-700 text-sm sm:text-base",children:[e.jsxs("li",{children:["• Variables can reference other variables (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"b = a * 2"}),")"]}),e.jsxs("li",{children:["• Use decimal precision math (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"0.1 + 0.2"})," = 0.3 exactly!)"]}),e.jsxs("li",{children:["• Access nested properties with dots (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"point.x"}),")"]}),e.jsxs("li",{children:["• Use ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math"})," functions: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math.sqrt(16)"}),", ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math.PI"}),", etc."]}),e.jsxs("li",{children:["• Convert units: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$unit.mmToInch(25.4)"})]}),e.jsxs("li",{children:["• Convert angles: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$angle.toRad(180)"})]})]})]})]})}export{D as default};
