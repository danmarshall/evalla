import{r as h}from"./index.DiEladB3.js";const C="modulepreload",R=function(r){return"/"+r},N={},$=function(t,n,d){let l=Promise.resolve();if(n&&n.length>0){let c=function(u){return Promise.all(u.map(x=>Promise.resolve(x).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),b=o?.nonce||o?.getAttribute("nonce");l=c(n.map(u=>{if(u=R(u),u in N)return;N[u]=!0;const x=u.endsWith(".css"),g=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${g}`))return;const m=document.createElement("link");if(m.rel=x?"stylesheet":C,x||(m.as="script"),m.crossOrigin="",m.href=u,b&&m.setAttribute("nonce",b),document.head.appendChild(m),x)return new Promise((i,a)=>{m.addEventListener("load",i),m.addEventListener("error",()=>a(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(c){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=c,window.dispatchEvent(o),!o.defaultPrevented)throw c}return l.then(c=>{for(const o of c||[])o.status==="rejected"&&s(o.reason);return t().catch(s)})};var j={exports:{}},v={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var E;function P(){if(E)return v;E=1;var r=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function n(d,l,s){var c=null;if(s!==void 0&&(c=""+s),l.key!==void 0&&(c=""+l.key),"key"in l){s={};for(var o in l)o!=="key"&&(s[o]=l[o])}else s=l;return l=s.ref,{$$typeof:r,type:d,key:c,ref:l!==void 0?l:null,props:s}}return v.Fragment=t,v.jsx=n,v.jsxs=n,v}var w;function A(){return w||(w=1,j.exports=P()),j.exports}var e=A();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(...r)=>r.filter((t,n,d)=>!!t&&t.trim()!==""&&d.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,n,d)=>d?d.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=r=>{const t=S(r);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var T={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=r=>{for(const t in r)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=h.forwardRef(({color:r="currentColor",size:t=24,strokeWidth:n=2,absoluteStrokeWidth:d,className:l="",children:s,iconNode:c,...o},b)=>h.createElement("svg",{ref:b,...T,width:t,height:t,stroke:r,strokeWidth:d?Number(n)*24/Number(t):n,className:_("lucide",l),...!s&&!L(o)&&{"aria-hidden":"true"},...o},[...c.map(([u,x])=>h.createElement(u,x)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(r,t)=>{const n=h.forwardRef(({className:d,...l},s)=>h.createElement(I,{ref:s,iconNode:t,className:_(`lucide-${M(k(r))}`,`lucide-${r}`,d),...l}));return n.displayName=k(r),n};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]],U=y("book-open",q);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],z=y("play",V);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],O=y("plus",J);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],W=y("trash-2",B);function F(){const[r,t]=h.useState([{name:"a",expr:"10"},{name:"b",expr:"a * 2"},{name:"c",expr:"a + b"}]),[n,d]=h.useState(null),[l,s]=h.useState(null),[c,o]=h.useState(null),b=(i,a,p)=>{const f=[...r];f[i][a]=p,t(f)},u=()=>{t([...r,{name:"",expr:""}])},x=i=>{t(r.filter((a,p)=>p!==i))},g=()=>{t([{name:"radius",expr:"5"},{name:"pi",expr:"$math.PI"},{name:"circumference",expr:"2 * pi * radius"},{name:"area",expr:"pi * radius * radius"},{name:"point",expr:"{x: 10, y: 20}"},{name:"scaledX",expr:"point.x * 2"}]),d(null),s(null),o(null)},m=async()=>{s(null),o(null);try{const{evalla:i}=await $(async()=>{const{evalla:f}=await import("./index.Cd4RluUo.js");return{evalla:f}},[]),a=r.filter(f=>f.name.trim()&&f.expr.trim());if(a.length===0){s("Please add at least one expression");return}const p=await i(a);d(p)}catch(i){if(s(i.message),i.variableName){const a=r.findIndex(p=>p.name===i.variableName);a!==-1&&o(a)}}};return e.jsxs("div",{className:"max-w-6xl mx-auto px-6 py-8",children:[e.jsxs("div",{className:"bg-white rounded-xl shadow-xl p-8 mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-gray-800 mb-4",children:"Expressions"}),e.jsx("p",{className:"text-gray-600 mb-6",children:"Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically."}),e.jsx("div",{className:"space-y-4 mb-6",children:r.map((i,a)=>e.jsxs("div",{className:`grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-4 items-center p-4 rounded-lg border-2 ${c===a?"bg-red-50 border-red-300":"bg-gray-50 border-gray-200"}`,children:[e.jsx("input",{type:"text",placeholder:"Variable name",value:i.name,onChange:p=>b(a,"name",p.target.value),className:`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-blue-500 ${c===a?"border-red-300":"border-gray-300"}`}),e.jsx("input",{type:"text",placeholder:"Expression (e.g., a + b)",value:i.expr,onChange:p=>b(a,"expr",p.target.value),className:`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-blue-500 ${c===a?"border-red-300":"border-gray-300"}`}),e.jsxs("button",{onClick:()=>x(a),className:"px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 justify-center",children:[e.jsx(W,{size:18}),"Remove"]})]},a))}),e.jsxs("div",{className:"flex flex-wrap gap-4 justify-center",children:[e.jsxs("button",{onClick:u,className:"px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(O,{size:20}),"Add Expression"]}),e.jsxs("button",{onClick:m,className:"px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(z,{size:20}),"Evaluate"]}),e.jsxs("button",{onClick:g,className:"px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(U,{size:20}),"Load Example"]})]})]}),l&&e.jsx("div",{className:"bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg",children:e.jsx("p",{className:"text-red-700 font-mono",children:l})}),n&&e.jsxs("div",{className:"bg-white rounded-xl shadow-xl p-8 mb-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-gray-800 mb-6",children:"Results"}),e.jsx("div",{className:"space-y-3",children:Object.entries(n.values).map(([i,a])=>e.jsxs("div",{className:"grid grid-cols-[200px_1fr] gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-gray-700 font-mono",children:i}),e.jsx("div",{className:"text-green-700 font-mono font-semibold",children:a.toString()})]},i))}),e.jsxs("div",{className:"mt-6 text-gray-600 italic",children:["Evaluation order: ",n.order.join(" → ")]})]}),e.jsxs("div",{className:"bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6",children:[e.jsx("h3",{className:"text-xl font-semibold text-blue-900 mb-4",children:"Quick Tips"}),e.jsxs("ul",{className:"space-y-2 text-gray-700",children:[e.jsxs("li",{children:["• Variables can reference other variables (e.g., ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"b = a * 2"}),")"]}),e.jsxs("li",{children:["• Use decimal precision math (e.g., ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"0.1 + 0.2"})," = 0.3 exactly!)"]}),e.jsxs("li",{children:["• Access nested properties with dots (e.g., ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"point.x"}),")"]}),e.jsxs("li",{children:["• Use ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"$math"})," functions: ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"$math.sqrt(16)"}),", ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"$math.PI"}),", etc."]}),e.jsxs("li",{children:["• Convert units: ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"$unit.mmToInch(25.4)"})]}),e.jsxs("li",{children:["• Convert angles: ",e.jsx("code",{className:"bg-blue-100 px-2 py-1 rounded text-sm",children:"$angle.toRad(180)"})]})]})]})]})}export{F as default};
