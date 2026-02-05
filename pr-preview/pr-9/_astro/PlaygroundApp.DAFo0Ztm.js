import{r as h}from"./index.DiEladB3.js";const C="modulepreload",R=function(t){return"/"+t},N={},$=function(r,a,d){let l=Promise.resolve();if(a&&a.length>0){let c=function(u){return Promise.all(u.map(x=>Promise.resolve(x).then(b=>({status:"fulfilled",value:b}),b=>({status:"rejected",reason:b}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),g=n?.nonce||n?.getAttribute("nonce");l=c(a.map(u=>{if(u=R(u),u in N)return;N[u]=!0;const x=u.endsWith(".css"),b=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${b}`))return;const p=document.createElement("link");if(p.rel=x?"stylesheet":C,x||(p.as="script"),p.crossOrigin="",p.href=u,g&&p.setAttribute("nonce",g),document.head.appendChild(p),x)return new Promise((i,o)=>{p.addEventListener("load",i),p.addEventListener("error",()=>o(new Error(`Unable to preload CSS for ${u}`)))})}))}function s(c){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=c,window.dispatchEvent(n),!n.defaultPrevented)throw c}return l.then(c=>{for(const n of c||[])n.status==="rejected"&&s(n.reason);return r().catch(s)})};var j={exports:{}},v={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var E;function P(){if(E)return v;E=1;var t=Symbol.for("react.transitional.element"),r=Symbol.for("react.fragment");function a(d,l,s){var c=null;if(s!==void 0&&(c=""+s),l.key!==void 0&&(c=""+l.key),"key"in l){s={};for(var n in l)n!=="key"&&(s[n]=l[n])}else s=l;return l=s.ref,{$$typeof:t,type:d,key:c,ref:l!==void 0?l:null,props:s}}return v.Fragment=r,v.jsx=a,v.jsxs=a,v}var w;function A(){return w||(w=1,j.exports=P()),j.exports}var e=A();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=(...t)=>t.filter((r,a,d)=>!!r&&r.trim()!==""&&d.indexOf(r)===a).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(r,a,d)=>d?d.toUpperCase():a.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>{const r=S(t);return r.charAt(0).toUpperCase()+r.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var T={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=t=>{for(const r in t)if(r.startsWith("aria-")||r==="role"||r==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=h.forwardRef(({color:t="currentColor",size:r=24,strokeWidth:a=2,absoluteStrokeWidth:d,className:l="",children:s,iconNode:c,...n},g)=>h.createElement("svg",{ref:g,...T,width:r,height:r,stroke:t,strokeWidth:d?Number(a)*24/Number(r):a,className:_("lucide",l),...!s&&!L(n)&&{"aria-hidden":"true"},...n},[...c.map(([u,x])=>h.createElement(u,x)),...Array.isArray(s)?s:[s]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(t,r)=>{const a=h.forwardRef(({className:d,...l},s)=>h.createElement(I,{ref:s,iconNode:r,className:_(`lucide-${M(k(t))}`,`lucide-${t}`,d),...l}));return a.displayName=k(t),a};/**
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
 */const B=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],W=y("trash-2",B);function F(){const[t,r]=h.useState([{name:"a",expr:"10"},{name:"b",expr:"a * 2"},{name:"c",expr:"a + b"}]),[a,d]=h.useState(null),[l,s]=h.useState(null),[c,n]=h.useState(null),g=(i,o,m)=>{const f=[...t];f[i][o]=m,r(f)},u=()=>{r([...t,{name:"",expr:""}])},x=i=>{r(t.filter((o,m)=>m!==i))},b=()=>{r([{name:"radius",expr:"5"},{name:"pi",expr:"$math.PI"},{name:"circumference",expr:"2 * pi * radius"},{name:"area",expr:"pi * radius * radius"},{name:"point",expr:"{x: 10, y: 20}"},{name:"scaledX",expr:"point.x * 2"}]),d(null),s(null),n(null)},p=async()=>{s(null),n(null);try{const{evalla:i}=await $(async()=>{const{evalla:f}=await import("./index.Cd4RluUo.js");return{evalla:f}},[]),o=t.filter(f=>f.name.trim()&&f.expr.trim());if(o.length===0){s("Please add at least one expression");return}const m=await i(o);d(m)}catch(i){if(s(i.message),i.variableName){const o=t.findIndex(m=>m.name===i.variableName);o!==-1&&n(o)}}};return e.jsxs("div",{className:"max-w-6xl mx-auto px-6 py-8",children:[e.jsxs("div",{className:"bg-white rounded-xl shadow-xl p-8 mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold text-gray-800 mb-4",children:"Expressions"}),e.jsx("p",{className:"text-gray-600 mb-6",children:"Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically."}),e.jsx("div",{className:"space-y-4 mb-6",children:t.map((i,o)=>e.jsxs("div",{className:`grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-4 items-center p-4 rounded-lg border-2 ${c===o?"bg-red-50 border-red-300":"bg-gray-50 border-gray-200"}`,children:[e.jsx("input",{type:"text",placeholder:"Variable name",value:i.name,onChange:m=>g(o,"name",m.target.value),className:`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-teal-500 ${c===o?"border-red-300":"border-gray-300"}`}),e.jsx("input",{type:"text",placeholder:"Expression (e.g., a + b)",value:i.expr,onChange:m=>g(o,"expr",m.target.value),className:`px-4 py-2 border-2 rounded-lg font-mono focus:outline-none focus:border-teal-500 ${c===o?"border-red-300":"border-gray-300"}`}),e.jsxs("button",{onClick:()=>x(o),className:"px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 justify-center",children:[e.jsx(W,{size:18}),"Remove"]})]},o))}),e.jsxs("div",{className:"flex flex-wrap gap-4 justify-center",children:[e.jsxs("button",{onClick:u,className:"px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(O,{size:20}),"Add Expression"]}),e.jsxs("button",{onClick:p,className:"px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(z,{size:20}),"Evaluate"]}),e.jsxs("button",{onClick:b,className:"px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",children:[e.jsx(U,{size:20}),"Load Example"]})]})]}),l&&e.jsx("div",{className:"bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg",children:e.jsx("p",{className:"text-red-700 font-mono",children:l})}),a&&e.jsxs("div",{className:"bg-white rounded-xl shadow-xl p-8 mb-8",children:[e.jsx("h3",{className:"text-2xl font-semibold text-gray-800 mb-6",children:"Results"}),e.jsx("div",{className:"space-y-3",children:Object.entries(a.values).map(([i,o])=>e.jsxs("div",{className:"grid grid-cols-[200px_1fr] gap-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg",children:[e.jsx("div",{className:"font-semibold text-gray-700 font-mono",children:i}),e.jsx("div",{className:"text-green-700 font-mono font-semibold",children:o.toString()})]},i))}),e.jsxs("div",{className:"mt-6 text-gray-600 italic",children:["Evaluation order: ",a.order.join(" → ")]})]}),e.jsxs("div",{className:"bg-teal-50 border-l-4 border-teal-600 rounded-lg p-6",children:[e.jsx("h3",{className:"text-xl font-semibold text-teal-900 mb-4",children:"Quick Tips"}),e.jsxs("ul",{className:"space-y-2 text-gray-700",children:[e.jsxs("li",{children:["• Variables can reference other variables (e.g., ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"b = a * 2"}),")"]}),e.jsxs("li",{children:["• Use decimal precision math (e.g., ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"0.1 + 0.2"})," = 0.3 exactly!)"]}),e.jsxs("li",{children:["• Access nested properties with dots (e.g., ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"point.x"}),")"]}),e.jsxs("li",{children:["• Use ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"$math"})," functions: ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"$math.sqrt(16)"}),", ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"$math.PI"}),", etc."]}),e.jsxs("li",{children:["• Convert units: ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"$unit.mmToInch(25.4)"})]}),e.jsxs("li",{children:["• Convert angles: ",e.jsx("code",{className:"bg-teal-100 px-2 py-1 rounded text-sm",children:"$angle.toRad(180)"})]})]})]})]})}export{F as default};
