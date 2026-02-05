import{r as h}from"./index.DiEladB3.js";const _="modulepreload",R=function(t){return"/pr-preview/pr-10/"+t},N={},$=function(s,n,d){let l=Promise.resolve();if(n&&n.length>0){let c=function(m){return Promise.all(m.map(u=>Promise.resolve(u).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),b=a?.nonce||a?.getAttribute("nonce");l=c(n.map(m=>{if(m=R(m),m in N)return;N[m]=!0;const u=m.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${f}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":_,u||(p.as="script"),p.crossOrigin="",p.href=m,b&&p.setAttribute("nonce",b),document.head.appendChild(p),u)return new Promise((i,o)=>{p.addEventListener("load",i),p.addEventListener("error",()=>o(new Error(`Unable to preload CSS for ${m}`)))})}))}function r(c){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=c,window.dispatchEvent(a),!a.defaultPrevented)throw c}return l.then(c=>{for(const a of c||[])a.status==="rejected"&&r(a.reason);return s().catch(r)})};var j={exports:{}},v={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var w;function P(){if(w)return v;w=1;var t=Symbol.for("react.transitional.element"),s=Symbol.for("react.fragment");function n(d,l,r){var c=null;if(r!==void 0&&(c=""+r),l.key!==void 0&&(c=""+l.key),"key"in l){r={};for(var a in l)a!=="key"&&(r[a]=l[a])}else r=l;return l=r.ref,{$$typeof:t,type:d,key:c,ref:l!==void 0?l:null,props:r}}return v.Fragment=s,v.jsx=n,v.jsxs=n,v}var E;function A(){return E||(E=1,j.exports=P()),j.exports}var e=A();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=(...t)=>t.filter((s,n,d)=>!!s&&s.trim()!==""&&d.indexOf(s)===n).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(s,n,d)=>d?d.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>{const s=S(t);return s.charAt(0).toUpperCase()+s.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var T={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=t=>{for(const s in t)if(s.startsWith("aria-")||s==="role"||s==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=h.forwardRef(({color:t="currentColor",size:s=24,strokeWidth:n=2,absoluteStrokeWidth:d,className:l="",children:r,iconNode:c,...a},b)=>h.createElement("svg",{ref:b,...T,width:s,height:s,stroke:t,strokeWidth:d?Number(n)*24/Number(s):n,className:C("lucide",l),...!r&&!L(a)&&{"aria-hidden":"true"},...a},[...c.map(([m,u])=>h.createElement(m,u)),...Array.isArray(r)?r:[r]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=(t,s)=>{const n=h.forwardRef(({className:d,...l},r)=>h.createElement(I,{ref:r,iconNode:s,className:C(`lucide-${M(k(t))}`,`lucide-${t}`,d),...l}));return n.displayName=k(t),n};/**
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
 */const B=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],W=y("trash-2",B);function F(){const[t,s]=h.useState([{name:"a",expr:"10"},{name:"b",expr:"a * 2"},{name:"c",expr:"a + b"}]),[n,d]=h.useState(null),[l,r]=h.useState(null),[c,a]=h.useState(null),b=(i,o,x)=>{const g=[...t];g[i][o]=x,s(g)},m=()=>{s([...t,{name:"",expr:""}])},u=i=>{s(t.filter((o,x)=>x!==i))},f=()=>{s([{name:"radius",expr:"5"},{name:"pi",expr:"$math.PI"},{name:"circumference",expr:"2 * pi * radius"},{name:"area",expr:"pi * radius * radius"},{name:"point",expr:"{x: 10, y: 20}"},{name:"scaledX",expr:"point.x * 2"}]),d(null),r(null),a(null)},p=async()=>{r(null),a(null);try{const{evalla:i}=await $(async()=>{const{evalla:g}=await import("./index.Cd4RluUo.js");return{evalla:g}},[]),o=t.filter(g=>g.name.trim()&&g.expr.trim());if(o.length===0){r("Please add at least one expression");return}const x=await i(o);d(x)}catch(i){if(r(i.message),i.variableName){const o=t.findIndex(x=>x.name===i.variableName);o!==-1&&a(o)}}};return e.jsxs("div",{className:"px-4 sm:px-6 md:px-8 py-6",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("h2",{className:"text-xl sm:text-2xl font-semibold text-gray-800 mb-3",children:"Expressions"}),e.jsx("p",{className:"text-gray-600 text-sm sm:text-base mb-4",children:"Define variables with math expressions. They can reference each other and will be evaluated in the correct order automatically."}),e.jsx("div",{className:"space-y-2 mb-4",children:t.map((i,o)=>e.jsxs("div",{className:`flex flex-col sm:grid sm:grid-cols-[150px_1fr_auto] gap-2 items-stretch sm:items-center p-2 sm:p-3 rounded ${c===o?"bg-red-50":"bg-gray-50"}`,children:[e.jsx("input",{type:"text",placeholder:"Variable name",value:i.name,onChange:x=>b(o,"name",x.target.value),className:`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===o?"border-red-300 bg-white":"border-gray-300 bg-white"}`}),e.jsx("input",{type:"text",placeholder:"Expression (e.g., a + b)",value:i.expr,onChange:x=>b(o,"expr",x.target.value),className:`px-3 py-2 text-sm border rounded font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${c===o?"border-red-300 bg-white":"border-gray-300 bg-white"}`}),e.jsxs("button",{onClick:()=>u(o),className:"px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-1.5 justify-center",children:[e.jsx(W,{size:16}),e.jsx("span",{className:"hidden sm:inline",children:"Remove"})]})]},o))}),e.jsxs("div",{className:"flex flex-wrap gap-2 sm:gap-3 justify-center",children:[e.jsxs("button",{onClick:m,className:"px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(O,{size:18}),e.jsx("span",{children:"Add"})]}),e.jsxs("button",{onClick:p,className:"px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(z,{size:18}),e.jsx("span",{children:"Evaluate"})]}),e.jsxs("button",{onClick:f,className:"px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded font-semibold transition-colors flex items-center gap-1.5",children:[e.jsx(U,{size:18}),e.jsx("span",{children:"Example"})]})]})]}),l&&e.jsx("div",{className:"bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded",children:e.jsx("p",{className:"text-red-700 font-mono text-sm",children:l})}),n&&e.jsxs("div",{className:"mb-6",children:[e.jsx("h3",{className:"text-xl sm:text-2xl font-semibold text-gray-800 mb-4",children:"Results"}),e.jsx("div",{className:"space-y-2",children:Object.entries(n.values).map(([i,o])=>e.jsxs("div",{className:"flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-green-50 border-l-4 border-green-500 rounded",children:[e.jsx("div",{className:"font-semibold text-gray-700 font-mono text-sm sm:text-base min-w-[80px] sm:min-w-[120px]",children:i}),e.jsx("div",{className:"text-green-700 font-mono font-semibold text-sm sm:text-base break-all",children:o.toString()})]},i))}),e.jsxs("div",{className:"mt-4 text-gray-600 text-xs sm:text-sm italic",children:["Evaluation order: ",n.order.join(" → ")]})]}),e.jsxs("div",{className:"bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 sm:p-6",children:[e.jsx("h3",{className:"text-lg sm:text-xl font-semibold text-blue-900 mb-3",children:"Quick Tips"}),e.jsxs("ul",{className:"space-y-1.5 text-gray-700 text-sm sm:text-base",children:[e.jsxs("li",{children:["• Variables can reference other variables (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"b = a * 2"}),")"]}),e.jsxs("li",{children:["• Use decimal precision math (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"0.1 + 0.2"})," = 0.3 exactly!)"]}),e.jsxs("li",{children:["• Access nested properties with dots (e.g., ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"point.x"}),")"]}),e.jsxs("li",{children:["• Use ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math"})," functions: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math.sqrt(16)"}),", ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$math.PI"}),", etc."]}),e.jsxs("li",{children:["• Convert units: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$unit.mmToInch(25.4)"})]}),e.jsxs("li",{children:["• Convert angles: ",e.jsx("code",{className:"bg-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm",children:"$angle.toRad(180)"})]})]})]})]})}export{F as default};
