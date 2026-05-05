const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/CompanyDashboard-B-vja6Gz.js","assets/EmptyState-D27YmmUt.js","assets/EmptyState-CEGRWZfM.css","assets/AdviserDeletionAlertBanner-CL9xbS__.js","assets/AdviserDeletionAlertBanner-BNO2CWZP.css","assets/importUtils-CUEx5jI6.js","assets/CustomDropdown-CQy9zMRd.js","assets/activityLogger-BqlhTtln.js","assets/importUtils-BRPC3K1C.css","assets/CompanyDetailModal-BDqp1CQc.js","assets/CompanyDetailModal-BaU_yhzH.css","assets/useToast-Jnu-FzBs.js","assets/useToast-DxIJIAQ2.css","assets/Footer-B14iSaqF.js","assets/Footer-bwPI2FV8.css","assets/CompanyDashboard-oEzDET23.css","assets/StudentDashboard-Bf5LCagy.js","assets/StudentDashboard-BXrC0cNT.css","assets/ResourceManagementDashboard-CEwgYQ9m.js","assets/ResourceManagementDashboard-CCylk27h.css","assets/UserRoleManagement-DCkvEYiO.js","assets/UserRoleManagement-Dp2Hv97C.css","assets/DeletedRecords-DPM5dGTo.js","assets/DeletedRecords-q8SggW6H.css","assets/ActivityLogViewer-B27hdhhb.js","assets/ActivityLogViewer-mi6TMQt2.css","assets/ForgotPassword-DOLU0Du6.js","assets/ForgotPassword-ARTDwIOt.css","assets/ChangePassword-BU4_kmkW.js","assets/ChangePassword-TRbczMyg.css","assets/PlatformData-BqjtA3TV.js","assets/PlatformData-B5TveA_K.css"])))=>i.map(i=>d[i]);
var OC=Object.defineProperty;var DC=(n,e,t)=>e in n?OC(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var y0=(n,e,t)=>DC(n,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const u of a.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();function lE(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}var qp={exports:{}},eu={},Gp={exports:{}},Ne={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var v0;function bC(){if(v0)return Ne;v0=1;var n=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),s=Symbol.for("react.profiler"),a=Symbol.for("react.provider"),u=Symbol.for("react.context"),h=Symbol.for("react.forward_ref"),f=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),w=Symbol.iterator;function T(V){return V===null||typeof V!="object"?null:(V=w&&V[w]||V["@@iterator"],typeof V=="function"?V:null)}var C={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},A=Object.assign,M={};function D(V,q,le){this.props=V,this.context=q,this.refs=M,this.updater=le||C}D.prototype.isReactComponent={},D.prototype.setState=function(V,q){if(typeof V!="object"&&typeof V!="function"&&V!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,V,q,"setState")},D.prototype.forceUpdate=function(V){this.updater.enqueueForceUpdate(this,V,"forceUpdate")};function H(){}H.prototype=D.prototype;function Z(V,q,le){this.props=V,this.context=q,this.refs=M,this.updater=le||C}var K=Z.prototype=new H;K.constructor=Z,A(K,D.prototype),K.isPureReactComponent=!0;var re=Array.isArray,Ie=Object.prototype.hasOwnProperty,we={current:null},O={key:!0,ref:!0,__self:!0,__source:!0};function S(V,q,le){var ke,Ae={},Ve=null,$e=null;if(q!=null)for(ke in q.ref!==void 0&&($e=q.ref),q.key!==void 0&&(Ve=""+q.key),q)Ie.call(q,ke)&&!O.hasOwnProperty(ke)&&(Ae[ke]=q[ke]);var He=arguments.length-2;if(He===1)Ae.children=le;else if(1<He){for(var Ze=Array(He),bt=0;bt<He;bt++)Ze[bt]=arguments[bt+2];Ae.children=Ze}if(V&&V.defaultProps)for(ke in He=V.defaultProps,He)Ae[ke]===void 0&&(Ae[ke]=He[ke]);return{$$typeof:n,type:V,key:Ve,ref:$e,props:Ae,_owner:we.current}}function R(V,q){return{$$typeof:n,type:V.type,key:q,ref:V.ref,props:V.props,_owner:V._owner}}function N(V){return typeof V=="object"&&V!==null&&V.$$typeof===n}function b(V){var q={"=":"=0",":":"=2"};return"$"+V.replace(/[=:]/g,function(le){return q[le]})}var F=/\/+/g;function P(V,q){return typeof V=="object"&&V!==null&&V.key!=null?b(""+V.key):q.toString(36)}function ze(V,q,le,ke,Ae){var Ve=typeof V;(Ve==="undefined"||Ve==="boolean")&&(V=null);var $e=!1;if(V===null)$e=!0;else switch(Ve){case"string":case"number":$e=!0;break;case"object":switch(V.$$typeof){case n:case e:$e=!0}}if($e)return $e=V,Ae=Ae($e),V=ke===""?"."+P($e,0):ke,re(Ae)?(le="",V!=null&&(le=V.replace(F,"$&/")+"/"),ze(Ae,q,le,"",function(bt){return bt})):Ae!=null&&(N(Ae)&&(Ae=R(Ae,le+(!Ae.key||$e&&$e.key===Ae.key?"":(""+Ae.key).replace(F,"$&/")+"/")+V)),q.push(Ae)),1;if($e=0,ke=ke===""?".":ke+":",re(V))for(var He=0;He<V.length;He++){Ve=V[He];var Ze=ke+P(Ve,He);$e+=ze(Ve,q,le,Ze,Ae)}else if(Ze=T(V),typeof Ze=="function")for(V=Ze.call(V),He=0;!(Ve=V.next()).done;)Ve=Ve.value,Ze=ke+P(Ve,He++),$e+=ze(Ve,q,le,Ze,Ae);else if(Ve==="object")throw q=String(V),Error("Objects are not valid as a React child (found: "+(q==="[object Object]"?"object with keys {"+Object.keys(V).join(", ")+"}":q)+"). If you meant to render a collection of children, use an array instead.");return $e}function Xe(V,q,le){if(V==null)return V;var ke=[],Ae=0;return ze(V,ke,"","",function(Ve){return q.call(le,Ve,Ae++)}),ke}function Dt(V){if(V._status===-1){var q=V._result;q=q(),q.then(function(le){(V._status===0||V._status===-1)&&(V._status=1,V._result=le)},function(le){(V._status===0||V._status===-1)&&(V._status=2,V._result=le)}),V._status===-1&&(V._status=0,V._result=q)}if(V._status===1)return V._result.default;throw V._result}var qe={current:null},ie={transition:null},ge={ReactCurrentDispatcher:qe,ReactCurrentBatchConfig:ie,ReactCurrentOwner:we};function ae(){throw Error("act(...) is not supported in production builds of React.")}return Ne.Children={map:Xe,forEach:function(V,q,le){Xe(V,function(){q.apply(this,arguments)},le)},count:function(V){var q=0;return Xe(V,function(){q++}),q},toArray:function(V){return Xe(V,function(q){return q})||[]},only:function(V){if(!N(V))throw Error("React.Children.only expected to receive a single React element child.");return V}},Ne.Component=D,Ne.Fragment=t,Ne.Profiler=s,Ne.PureComponent=Z,Ne.StrictMode=r,Ne.Suspense=f,Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ge,Ne.act=ae,Ne.cloneElement=function(V,q,le){if(V==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+V+".");var ke=A({},V.props),Ae=V.key,Ve=V.ref,$e=V._owner;if(q!=null){if(q.ref!==void 0&&(Ve=q.ref,$e=we.current),q.key!==void 0&&(Ae=""+q.key),V.type&&V.type.defaultProps)var He=V.type.defaultProps;for(Ze in q)Ie.call(q,Ze)&&!O.hasOwnProperty(Ze)&&(ke[Ze]=q[Ze]===void 0&&He!==void 0?He[Ze]:q[Ze])}var Ze=arguments.length-2;if(Ze===1)ke.children=le;else if(1<Ze){He=Array(Ze);for(var bt=0;bt<Ze;bt++)He[bt]=arguments[bt+2];ke.children=He}return{$$typeof:n,type:V.type,key:Ae,ref:Ve,props:ke,_owner:$e}},Ne.createContext=function(V){return V={$$typeof:u,_currentValue:V,_currentValue2:V,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},V.Provider={$$typeof:a,_context:V},V.Consumer=V},Ne.createElement=S,Ne.createFactory=function(V){var q=S.bind(null,V);return q.type=V,q},Ne.createRef=function(){return{current:null}},Ne.forwardRef=function(V){return{$$typeof:h,render:V}},Ne.isValidElement=N,Ne.lazy=function(V){return{$$typeof:y,_payload:{_status:-1,_result:V},_init:Dt}},Ne.memo=function(V,q){return{$$typeof:p,type:V,compare:q===void 0?null:q}},Ne.startTransition=function(V){var q=ie.transition;ie.transition={};try{V()}finally{ie.transition=q}},Ne.unstable_act=ae,Ne.useCallback=function(V,q){return qe.current.useCallback(V,q)},Ne.useContext=function(V){return qe.current.useContext(V)},Ne.useDebugValue=function(){},Ne.useDeferredValue=function(V){return qe.current.useDeferredValue(V)},Ne.useEffect=function(V,q){return qe.current.useEffect(V,q)},Ne.useId=function(){return qe.current.useId()},Ne.useImperativeHandle=function(V,q,le){return qe.current.useImperativeHandle(V,q,le)},Ne.useInsertionEffect=function(V,q){return qe.current.useInsertionEffect(V,q)},Ne.useLayoutEffect=function(V,q){return qe.current.useLayoutEffect(V,q)},Ne.useMemo=function(V,q){return qe.current.useMemo(V,q)},Ne.useReducer=function(V,q,le){return qe.current.useReducer(V,q,le)},Ne.useRef=function(V){return qe.current.useRef(V)},Ne.useState=function(V){return qe.current.useState(V)},Ne.useSyncExternalStore=function(V,q,le){return qe.current.useSyncExternalStore(V,q,le)},Ne.useTransition=function(){return qe.current.useTransition()},Ne.version="18.3.1",Ne}var w0;function mg(){return w0||(w0=1,Gp.exports=bC()),Gp.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var E0;function LC(){if(E0)return eu;E0=1;var n=mg(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,s=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function u(h,f,p){var y,w={},T=null,C=null;p!==void 0&&(T=""+p),f.key!==void 0&&(T=""+f.key),f.ref!==void 0&&(C=f.ref);for(y in f)r.call(f,y)&&!a.hasOwnProperty(y)&&(w[y]=f[y]);if(h&&h.defaultProps)for(y in f=h.defaultProps,f)w[y]===void 0&&(w[y]=f[y]);return{$$typeof:e,type:h,key:T,ref:C,props:w,_owner:s.current}}return eu.Fragment=t,eu.jsx=u,eu.jsxs=u,eu}var T0;function MC(){return T0||(T0=1,qp.exports=LC()),qp.exports}var Q=MC(),W=mg();const _i=lE(W);var Ch={},Kp={exports:{}},Sn={},Qp={exports:{}},Yp={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var I0;function VC(){return I0||(I0=1,function(n){function e(ie,ge){var ae=ie.length;ie.push(ge);e:for(;0<ae;){var V=ae-1>>>1,q=ie[V];if(0<s(q,ge))ie[V]=ge,ie[ae]=q,ae=V;else break e}}function t(ie){return ie.length===0?null:ie[0]}function r(ie){if(ie.length===0)return null;var ge=ie[0],ae=ie.pop();if(ae!==ge){ie[0]=ae;e:for(var V=0,q=ie.length,le=q>>>1;V<le;){var ke=2*(V+1)-1,Ae=ie[ke],Ve=ke+1,$e=ie[Ve];if(0>s(Ae,ae))Ve<q&&0>s($e,Ae)?(ie[V]=$e,ie[Ve]=ae,V=Ve):(ie[V]=Ae,ie[ke]=ae,V=ke);else if(Ve<q&&0>s($e,ae))ie[V]=$e,ie[Ve]=ae,V=Ve;else break e}}return ge}function s(ie,ge){var ae=ie.sortIndex-ge.sortIndex;return ae!==0?ae:ie.id-ge.id}if(typeof performance=="object"&&typeof performance.now=="function"){var a=performance;n.unstable_now=function(){return a.now()}}else{var u=Date,h=u.now();n.unstable_now=function(){return u.now()-h}}var f=[],p=[],y=1,w=null,T=3,C=!1,A=!1,M=!1,D=typeof setTimeout=="function"?setTimeout:null,H=typeof clearTimeout=="function"?clearTimeout:null,Z=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function K(ie){for(var ge=t(p);ge!==null;){if(ge.callback===null)r(p);else if(ge.startTime<=ie)r(p),ge.sortIndex=ge.expirationTime,e(f,ge);else break;ge=t(p)}}function re(ie){if(M=!1,K(ie),!A)if(t(f)!==null)A=!0,Dt(Ie);else{var ge=t(p);ge!==null&&qe(re,ge.startTime-ie)}}function Ie(ie,ge){A=!1,M&&(M=!1,H(S),S=-1),C=!0;var ae=T;try{for(K(ge),w=t(f);w!==null&&(!(w.expirationTime>ge)||ie&&!b());){var V=w.callback;if(typeof V=="function"){w.callback=null,T=w.priorityLevel;var q=V(w.expirationTime<=ge);ge=n.unstable_now(),typeof q=="function"?w.callback=q:w===t(f)&&r(f),K(ge)}else r(f);w=t(f)}if(w!==null)var le=!0;else{var ke=t(p);ke!==null&&qe(re,ke.startTime-ge),le=!1}return le}finally{w=null,T=ae,C=!1}}var we=!1,O=null,S=-1,R=5,N=-1;function b(){return!(n.unstable_now()-N<R)}function F(){if(O!==null){var ie=n.unstable_now();N=ie;var ge=!0;try{ge=O(!0,ie)}finally{ge?P():(we=!1,O=null)}}else we=!1}var P;if(typeof Z=="function")P=function(){Z(F)};else if(typeof MessageChannel<"u"){var ze=new MessageChannel,Xe=ze.port2;ze.port1.onmessage=F,P=function(){Xe.postMessage(null)}}else P=function(){D(F,0)};function Dt(ie){O=ie,we||(we=!0,P())}function qe(ie,ge){S=D(function(){ie(n.unstable_now())},ge)}n.unstable_IdlePriority=5,n.unstable_ImmediatePriority=1,n.unstable_LowPriority=4,n.unstable_NormalPriority=3,n.unstable_Profiling=null,n.unstable_UserBlockingPriority=2,n.unstable_cancelCallback=function(ie){ie.callback=null},n.unstable_continueExecution=function(){A||C||(A=!0,Dt(Ie))},n.unstable_forceFrameRate=function(ie){0>ie||125<ie?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):R=0<ie?Math.floor(1e3/ie):5},n.unstable_getCurrentPriorityLevel=function(){return T},n.unstable_getFirstCallbackNode=function(){return t(f)},n.unstable_next=function(ie){switch(T){case 1:case 2:case 3:var ge=3;break;default:ge=T}var ae=T;T=ge;try{return ie()}finally{T=ae}},n.unstable_pauseExecution=function(){},n.unstable_requestPaint=function(){},n.unstable_runWithPriority=function(ie,ge){switch(ie){case 1:case 2:case 3:case 4:case 5:break;default:ie=3}var ae=T;T=ie;try{return ge()}finally{T=ae}},n.unstable_scheduleCallback=function(ie,ge,ae){var V=n.unstable_now();switch(typeof ae=="object"&&ae!==null?(ae=ae.delay,ae=typeof ae=="number"&&0<ae?V+ae:V):ae=V,ie){case 1:var q=-1;break;case 2:q=250;break;case 5:q=1073741823;break;case 4:q=1e4;break;default:q=5e3}return q=ae+q,ie={id:y++,callback:ge,priorityLevel:ie,startTime:ae,expirationTime:q,sortIndex:-1},ae>V?(ie.sortIndex=ae,e(p,ie),t(f)===null&&ie===t(p)&&(M?(H(S),S=-1):M=!0,qe(re,ae-V))):(ie.sortIndex=q,e(f,ie),A||C||(A=!0,Dt(Ie))),ie},n.unstable_shouldYield=b,n.unstable_wrapCallback=function(ie){var ge=T;return function(){var ae=T;T=ge;try{return ie.apply(this,arguments)}finally{T=ae}}}}(Yp)),Yp}var S0;function FC(){return S0||(S0=1,Qp.exports=VC()),Qp.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var C0;function UC(){if(C0)return Sn;C0=1;var n=mg(),e=FC();function t(i){for(var o="https://reactjs.org/docs/error-decoder.html?invariant="+i,l=1;l<arguments.length;l++)o+="&args[]="+encodeURIComponent(arguments[l]);return"Minified React error #"+i+"; visit "+o+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,s={};function a(i,o){u(i,o),u(i+"Capture",o)}function u(i,o){for(s[i]=o,i=0;i<o.length;i++)r.add(o[i])}var h=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),f=Object.prototype.hasOwnProperty,p=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,y={},w={};function T(i){return f.call(w,i)?!0:f.call(y,i)?!1:p.test(i)?w[i]=!0:(y[i]=!0,!1)}function C(i,o,l,d){if(l!==null&&l.type===0)return!1;switch(typeof o){case"function":case"symbol":return!0;case"boolean":return d?!1:l!==null?!l.acceptsBooleans:(i=i.toLowerCase().slice(0,5),i!=="data-"&&i!=="aria-");default:return!1}}function A(i,o,l,d){if(o===null||typeof o>"u"||C(i,o,l,d))return!0;if(d)return!1;if(l!==null)switch(l.type){case 3:return!o;case 4:return o===!1;case 5:return isNaN(o);case 6:return isNaN(o)||1>o}return!1}function M(i,o,l,d,m,_,E){this.acceptsBooleans=o===2||o===3||o===4,this.attributeName=d,this.attributeNamespace=m,this.mustUseProperty=l,this.propertyName=i,this.type=o,this.sanitizeURL=_,this.removeEmptyString=E}var D={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(i){D[i]=new M(i,0,!1,i,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(i){var o=i[0];D[o]=new M(o,1,!1,i[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(i){D[i]=new M(i,2,!1,i.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(i){D[i]=new M(i,2,!1,i,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(i){D[i]=new M(i,3,!1,i.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(i){D[i]=new M(i,3,!0,i,null,!1,!1)}),["capture","download"].forEach(function(i){D[i]=new M(i,4,!1,i,null,!1,!1)}),["cols","rows","size","span"].forEach(function(i){D[i]=new M(i,6,!1,i,null,!1,!1)}),["rowSpan","start"].forEach(function(i){D[i]=new M(i,5,!1,i.toLowerCase(),null,!1,!1)});var H=/[\-:]([a-z])/g;function Z(i){return i[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(i){var o=i.replace(H,Z);D[o]=new M(o,1,!1,i,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(i){var o=i.replace(H,Z);D[o]=new M(o,1,!1,i,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(i){var o=i.replace(H,Z);D[o]=new M(o,1,!1,i,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(i){D[i]=new M(i,1,!1,i.toLowerCase(),null,!1,!1)}),D.xlinkHref=new M("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(i){D[i]=new M(i,1,!1,i.toLowerCase(),null,!0,!0)});function K(i,o,l,d){var m=D.hasOwnProperty(o)?D[o]:null;(m!==null?m.type!==0:d||!(2<o.length)||o[0]!=="o"&&o[0]!=="O"||o[1]!=="n"&&o[1]!=="N")&&(A(o,l,m,d)&&(l=null),d||m===null?T(o)&&(l===null?i.removeAttribute(o):i.setAttribute(o,""+l)):m.mustUseProperty?i[m.propertyName]=l===null?m.type===3?!1:"":l:(o=m.attributeName,d=m.attributeNamespace,l===null?i.removeAttribute(o):(m=m.type,l=m===3||m===4&&l===!0?"":""+l,d?i.setAttributeNS(d,o,l):i.setAttribute(o,l))))}var re=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Ie=Symbol.for("react.element"),we=Symbol.for("react.portal"),O=Symbol.for("react.fragment"),S=Symbol.for("react.strict_mode"),R=Symbol.for("react.profiler"),N=Symbol.for("react.provider"),b=Symbol.for("react.context"),F=Symbol.for("react.forward_ref"),P=Symbol.for("react.suspense"),ze=Symbol.for("react.suspense_list"),Xe=Symbol.for("react.memo"),Dt=Symbol.for("react.lazy"),qe=Symbol.for("react.offscreen"),ie=Symbol.iterator;function ge(i){return i===null||typeof i!="object"?null:(i=ie&&i[ie]||i["@@iterator"],typeof i=="function"?i:null)}var ae=Object.assign,V;function q(i){if(V===void 0)try{throw Error()}catch(l){var o=l.stack.trim().match(/\n( *(at )?)/);V=o&&o[1]||""}return`
`+V+i}var le=!1;function ke(i,o){if(!i||le)return"";le=!0;var l=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(o)if(o=function(){throw Error()},Object.defineProperty(o.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(o,[])}catch(z){var d=z}Reflect.construct(i,[],o)}else{try{o.call()}catch(z){d=z}i.call(o.prototype)}else{try{throw Error()}catch(z){d=z}i()}}catch(z){if(z&&d&&typeof z.stack=="string"){for(var m=z.stack.split(`
`),_=d.stack.split(`
`),E=m.length-1,k=_.length-1;1<=E&&0<=k&&m[E]!==_[k];)k--;for(;1<=E&&0<=k;E--,k--)if(m[E]!==_[k]){if(E!==1||k!==1)do if(E--,k--,0>k||m[E]!==_[k]){var x=`
`+m[E].replace(" at new "," at ");return i.displayName&&x.includes("<anonymous>")&&(x=x.replace("<anonymous>",i.displayName)),x}while(1<=E&&0<=k);break}}}finally{le=!1,Error.prepareStackTrace=l}return(i=i?i.displayName||i.name:"")?q(i):""}function Ae(i){switch(i.tag){case 5:return q(i.type);case 16:return q("Lazy");case 13:return q("Suspense");case 19:return q("SuspenseList");case 0:case 2:case 15:return i=ke(i.type,!1),i;case 11:return i=ke(i.type.render,!1),i;case 1:return i=ke(i.type,!0),i;default:return""}}function Ve(i){if(i==null)return null;if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i;switch(i){case O:return"Fragment";case we:return"Portal";case R:return"Profiler";case S:return"StrictMode";case P:return"Suspense";case ze:return"SuspenseList"}if(typeof i=="object")switch(i.$$typeof){case b:return(i.displayName||"Context")+".Consumer";case N:return(i._context.displayName||"Context")+".Provider";case F:var o=i.render;return i=i.displayName,i||(i=o.displayName||o.name||"",i=i!==""?"ForwardRef("+i+")":"ForwardRef"),i;case Xe:return o=i.displayName||null,o!==null?o:Ve(i.type)||"Memo";case Dt:o=i._payload,i=i._init;try{return Ve(i(o))}catch{}}return null}function $e(i){var o=i.type;switch(i.tag){case 24:return"Cache";case 9:return(o.displayName||"Context")+".Consumer";case 10:return(o._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return i=o.render,i=i.displayName||i.name||"",o.displayName||(i!==""?"ForwardRef("+i+")":"ForwardRef");case 7:return"Fragment";case 5:return o;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Ve(o);case 8:return o===S?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof o=="function")return o.displayName||o.name||null;if(typeof o=="string")return o}return null}function He(i){switch(typeof i){case"boolean":case"number":case"string":case"undefined":return i;case"object":return i;default:return""}}function Ze(i){var o=i.type;return(i=i.nodeName)&&i.toLowerCase()==="input"&&(o==="checkbox"||o==="radio")}function bt(i){var o=Ze(i)?"checked":"value",l=Object.getOwnPropertyDescriptor(i.constructor.prototype,o),d=""+i[o];if(!i.hasOwnProperty(o)&&typeof l<"u"&&typeof l.get=="function"&&typeof l.set=="function"){var m=l.get,_=l.set;return Object.defineProperty(i,o,{configurable:!0,get:function(){return m.call(this)},set:function(E){d=""+E,_.call(this,E)}}),Object.defineProperty(i,o,{enumerable:l.enumerable}),{getValue:function(){return d},setValue:function(E){d=""+E},stopTracking:function(){i._valueTracker=null,delete i[o]}}}}function Qr(i){i._valueTracker||(i._valueTracker=bt(i))}function Co(i){if(!i)return!1;var o=i._valueTracker;if(!o)return!0;var l=o.getValue(),d="";return i&&(d=Ze(i)?i.checked?"true":"false":i.value),i=d,i!==l?(o.setValue(i),!0):!1}function Di(i){if(i=i||(typeof document<"u"?document:void 0),typeof i>"u")return null;try{return i.activeElement||i.body}catch{return i.body}}function Ns(i,o){var l=o.checked;return ae({},o,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:l??i._wrapperState.initialChecked})}function Ro(i,o){var l=o.defaultValue==null?"":o.defaultValue,d=o.checked!=null?o.checked:o.defaultChecked;l=He(o.value!=null?o.value:l),i._wrapperState={initialChecked:d,initialValue:l,controlled:o.type==="checkbox"||o.type==="radio"?o.checked!=null:o.value!=null}}function ol(i,o){o=o.checked,o!=null&&K(i,"checked",o,!1)}function al(i,o){ol(i,o);var l=He(o.value),d=o.type;if(l!=null)d==="number"?(l===0&&i.value===""||i.value!=l)&&(i.value=""+l):i.value!==""+l&&(i.value=""+l);else if(d==="submit"||d==="reset"){i.removeAttribute("value");return}o.hasOwnProperty("value")?ko(i,o.type,l):o.hasOwnProperty("defaultValue")&&ko(i,o.type,He(o.defaultValue)),o.checked==null&&o.defaultChecked!=null&&(i.defaultChecked=!!o.defaultChecked)}function cc(i,o,l){if(o.hasOwnProperty("value")||o.hasOwnProperty("defaultValue")){var d=o.type;if(!(d!=="submit"&&d!=="reset"||o.value!==void 0&&o.value!==null))return;o=""+i._wrapperState.initialValue,l||o===i.value||(i.value=o),i.defaultValue=o}l=i.name,l!==""&&(i.name=""),i.defaultChecked=!!i._wrapperState.initialChecked,l!==""&&(i.name=l)}function ko(i,o,l){(o!=="number"||Di(i.ownerDocument)!==i)&&(l==null?i.defaultValue=""+i._wrapperState.initialValue:i.defaultValue!==""+l&&(i.defaultValue=""+l))}var Yr=Array.isArray;function Xr(i,o,l,d){if(i=i.options,o){o={};for(var m=0;m<l.length;m++)o["$"+l[m]]=!0;for(l=0;l<i.length;l++)m=o.hasOwnProperty("$"+i[l].value),i[l].selected!==m&&(i[l].selected=m),m&&d&&(i[l].defaultSelected=!0)}else{for(l=""+He(l),o=null,m=0;m<i.length;m++){if(i[m].value===l){i[m].selected=!0,d&&(i[m].defaultSelected=!0);return}o!==null||i[m].disabled||(o=i[m])}o!==null&&(o.selected=!0)}}function ll(i,o){if(o.dangerouslySetInnerHTML!=null)throw Error(t(91));return ae({},o,{value:void 0,defaultValue:void 0,children:""+i._wrapperState.initialValue})}function Ao(i,o){var l=o.value;if(l==null){if(l=o.children,o=o.defaultValue,l!=null){if(o!=null)throw Error(t(92));if(Yr(l)){if(1<l.length)throw Error(t(93));l=l[0]}o=l}o==null&&(o=""),l=o}i._wrapperState={initialValue:He(l)}}function Po(i,o){var l=He(o.value),d=He(o.defaultValue);l!=null&&(l=""+l,l!==i.value&&(i.value=l),o.defaultValue==null&&i.defaultValue!==l&&(i.defaultValue=l)),d!=null&&(i.defaultValue=""+d)}function ul(i){var o=i.textContent;o===i._wrapperState.initialValue&&o!==""&&o!==null&&(i.value=o)}function Rt(i){switch(i){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function kt(i,o){return i==null||i==="http://www.w3.org/1999/xhtml"?Rt(o):i==="http://www.w3.org/2000/svg"&&o==="foreignObject"?"http://www.w3.org/1999/xhtml":i}var Jr,cl=function(i){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(o,l,d,m){MSApp.execUnsafeLocalFunction(function(){return i(o,l,d,m)})}:i}(function(i,o){if(i.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in i)i.innerHTML=o;else{for(Jr=Jr||document.createElement("div"),Jr.innerHTML="<svg>"+o.valueOf().toString()+"</svg>",o=Jr.firstChild;i.firstChild;)i.removeChild(i.firstChild);for(;o.firstChild;)i.appendChild(o.firstChild)}});function bi(i,o){if(o){var l=i.firstChild;if(l&&l===i.lastChild&&l.nodeType===3){l.nodeValue=o;return}}i.textContent=o}var xs={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Os=["Webkit","ms","Moz","O"];Object.keys(xs).forEach(function(i){Os.forEach(function(o){o=o+i.charAt(0).toUpperCase()+i.substring(1),xs[o]=xs[i]})});function hl(i,o,l){return o==null||typeof o=="boolean"||o===""?"":l||typeof o!="number"||o===0||xs.hasOwnProperty(i)&&xs[i]?(""+o).trim():o+"px"}function dl(i,o){i=i.style;for(var l in o)if(o.hasOwnProperty(l)){var d=l.indexOf("--")===0,m=hl(l,o[l],d);l==="float"&&(l="cssFloat"),d?i.setProperty(l,m):i[l]=m}}var fl=ae({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function pl(i,o){if(o){if(fl[i]&&(o.children!=null||o.dangerouslySetInnerHTML!=null))throw Error(t(137,i));if(o.dangerouslySetInnerHTML!=null){if(o.children!=null)throw Error(t(60));if(typeof o.dangerouslySetInnerHTML!="object"||!("__html"in o.dangerouslySetInnerHTML))throw Error(t(61))}if(o.style!=null&&typeof o.style!="object")throw Error(t(62))}}function ml(i,o){if(i.indexOf("-")===-1)return typeof o.is=="string";switch(i){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ds=null;function No(i){return i=i.target||i.srcElement||window,i.correspondingUseElement&&(i=i.correspondingUseElement),i.nodeType===3?i.parentNode:i}var xo=null,jn=null,Sr=null;function Oo(i){if(i=Ul(i)){if(typeof xo!="function")throw Error(t(280));var o=i.stateNode;o&&(o=jc(o),xo(i.stateNode,i.type,o))}}function Cr(i){jn?Sr?Sr.push(i):Sr=[i]:jn=i}function gl(){if(jn){var i=jn,o=Sr;if(Sr=jn=null,Oo(i),o)for(i=0;i<o.length;i++)Oo(o[i])}}function bs(i,o){return i(o)}function _l(){}var Zr=!1;function yl(i,o,l){if(Zr)return i(o,l);Zr=!0;try{return bs(i,o,l)}finally{Zr=!1,(jn!==null||Sr!==null)&&(_l(),gl())}}function _t(i,o){var l=i.stateNode;if(l===null)return null;var d=jc(l);if(d===null)return null;l=d[o];e:switch(o){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(d=!d.disabled)||(i=i.type,d=!(i==="button"||i==="input"||i==="select"||i==="textarea")),i=!d;break e;default:i=!1}if(i)return null;if(l&&typeof l!="function")throw Error(t(231,o,typeof l));return l}var Do=!1;if(h)try{var er={};Object.defineProperty(er,"passive",{get:function(){Do=!0}}),window.addEventListener("test",er,er),window.removeEventListener("test",er,er)}catch{Do=!1}function Ls(i,o,l,d,m,_,E,k,x){var z=Array.prototype.slice.call(arguments,3);try{o.apply(l,z)}catch(J){this.onError(J)}}var Ms=!1,bo=null,tr=!1,vl=null,wf={onError:function(i){Ms=!0,bo=i}};function Lo(i,o,l,d,m,_,E,k,x){Ms=!1,bo=null,Ls.apply(wf,arguments)}function hc(i,o,l,d,m,_,E,k,x){if(Lo.apply(this,arguments),Ms){if(Ms){var z=bo;Ms=!1,bo=null}else throw Error(t(198));tr||(tr=!0,vl=z)}}function nr(i){var o=i,l=i;if(i.alternate)for(;o.return;)o=o.return;else{i=o;do o=i,(o.flags&4098)!==0&&(l=o.return),i=o.return;while(i)}return o.tag===3?l:null}function Vs(i){if(i.tag===13){var o=i.memoizedState;if(o===null&&(i=i.alternate,i!==null&&(o=i.memoizedState)),o!==null)return o.dehydrated}return null}function rr(i){if(nr(i)!==i)throw Error(t(188))}function dc(i){var o=i.alternate;if(!o){if(o=nr(i),o===null)throw Error(t(188));return o!==i?null:i}for(var l=i,d=o;;){var m=l.return;if(m===null)break;var _=m.alternate;if(_===null){if(d=m.return,d!==null){l=d;continue}break}if(m.child===_.child){for(_=m.child;_;){if(_===l)return rr(m),i;if(_===d)return rr(m),o;_=_.sibling}throw Error(t(188))}if(l.return!==d.return)l=m,d=_;else{for(var E=!1,k=m.child;k;){if(k===l){E=!0,l=m,d=_;break}if(k===d){E=!0,d=m,l=_;break}k=k.sibling}if(!E){for(k=_.child;k;){if(k===l){E=!0,l=_,d=m;break}if(k===d){E=!0,d=_,l=m;break}k=k.sibling}if(!E)throw Error(t(189))}}if(l.alternate!==d)throw Error(t(190))}if(l.tag!==3)throw Error(t(188));return l.stateNode.current===l?i:o}function wl(i){return i=dc(i),i!==null?Mo(i):null}function Mo(i){if(i.tag===5||i.tag===6)return i;for(i=i.child;i!==null;){var o=Mo(i);if(o!==null)return o;i=i.sibling}return null}var Vo=e.unstable_scheduleCallback,El=e.unstable_cancelCallback,fc=e.unstable_shouldYield,Ef=e.unstable_requestPaint,et=e.unstable_now,pc=e.unstable_getCurrentPriorityLevel,Fs=e.unstable_ImmediatePriority,Li=e.unstable_UserBlockingPriority,Bn=e.unstable_NormalPriority,Tl=e.unstable_LowPriority,mc=e.unstable_IdlePriority,Us=null,On=null;function gc(i){if(On&&typeof On.onCommitFiberRoot=="function")try{On.onCommitFiberRoot(Us,i,void 0,(i.current.flags&128)===128)}catch{}}var ln=Math.clz32?Math.clz32:yc,Il=Math.log,_c=Math.LN2;function yc(i){return i>>>=0,i===0?32:31-(Il(i)/_c|0)|0}var Fo=64,Uo=4194304;function Mi(i){switch(i&-i){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return i&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return i}}function js(i,o){var l=i.pendingLanes;if(l===0)return 0;var d=0,m=i.suspendedLanes,_=i.pingedLanes,E=l&268435455;if(E!==0){var k=E&~m;k!==0?d=Mi(k):(_&=E,_!==0&&(d=Mi(_)))}else E=l&~m,E!==0?d=Mi(E):_!==0&&(d=Mi(_));if(d===0)return 0;if(o!==0&&o!==d&&(o&m)===0&&(m=d&-d,_=o&-o,m>=_||m===16&&(_&4194240)!==0))return o;if((d&4)!==0&&(d|=l&16),o=i.entangledLanes,o!==0)for(i=i.entanglements,o&=d;0<o;)l=31-ln(o),m=1<<l,d|=i[l],o&=~m;return d}function Tf(i,o){switch(i){case 1:case 2:case 4:return o+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return o+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ei(i,o){for(var l=i.suspendedLanes,d=i.pingedLanes,m=i.expirationTimes,_=i.pendingLanes;0<_;){var E=31-ln(_),k=1<<E,x=m[E];x===-1?((k&l)===0||(k&d)!==0)&&(m[E]=Tf(k,o)):x<=o&&(i.expiredLanes|=k),_&=~k}}function Dn(i){return i=i.pendingLanes&-1073741825,i!==0?i:i&1073741824?1073741824:0}function Bs(){var i=Fo;return Fo<<=1,(Fo&4194240)===0&&(Fo=64),i}function Vi(i){for(var o=[],l=0;31>l;l++)o.push(i);return o}function Fi(i,o,l){i.pendingLanes|=o,o!==536870912&&(i.suspendedLanes=0,i.pingedLanes=0),i=i.eventTimes,o=31-ln(o),i[o]=l}function Je(i,o){var l=i.pendingLanes&~o;i.pendingLanes=o,i.suspendedLanes=0,i.pingedLanes=0,i.expiredLanes&=o,i.mutableReadLanes&=o,i.entangledLanes&=o,o=i.entanglements;var d=i.eventTimes;for(i=i.expirationTimes;0<l;){var m=31-ln(l),_=1<<m;o[m]=0,d[m]=-1,i[m]=-1,l&=~_}}function Ui(i,o){var l=i.entangledLanes|=o;for(i=i.entanglements;l;){var d=31-ln(l),m=1<<d;m&o|i[d]&o&&(i[d]|=o),l&=~m}}var Le=0;function ji(i){return i&=-i,1<i?4<i?(i&268435455)!==0?16:536870912:4:1}var vc,jo,wc,Ec,Tc,Sl=!1,Rr=[],Wt=null,ir=null,sr=null,Bi=new Map,zn=new Map,kr=[],If="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ic(i,o){switch(i){case"focusin":case"focusout":Wt=null;break;case"dragenter":case"dragleave":ir=null;break;case"mouseover":case"mouseout":sr=null;break;case"pointerover":case"pointerout":Bi.delete(o.pointerId);break;case"gotpointercapture":case"lostpointercapture":zn.delete(o.pointerId)}}function _n(i,o,l,d,m,_){return i===null||i.nativeEvent!==_?(i={blockedOn:o,domEventName:l,eventSystemFlags:d,nativeEvent:_,targetContainers:[m]},o!==null&&(o=Ul(o),o!==null&&jo(o)),i):(i.eventSystemFlags|=d,o=i.targetContainers,m!==null&&o.indexOf(m)===-1&&o.push(m),i)}function Sf(i,o,l,d,m){switch(o){case"focusin":return Wt=_n(Wt,i,o,l,d,m),!0;case"dragenter":return ir=_n(ir,i,o,l,d,m),!0;case"mouseover":return sr=_n(sr,i,o,l,d,m),!0;case"pointerover":var _=m.pointerId;return Bi.set(_,_n(Bi.get(_)||null,i,o,l,d,m)),!0;case"gotpointercapture":return _=m.pointerId,zn.set(_,_n(zn.get(_)||null,i,o,l,d,m)),!0}return!1}function Sc(i){var o=qs(i.target);if(o!==null){var l=nr(o);if(l!==null){if(o=l.tag,o===13){if(o=Vs(l),o!==null){i.blockedOn=o,Tc(i.priority,function(){wc(l)});return}}else if(o===3&&l.stateNode.current.memoizedState.isDehydrated){i.blockedOn=l.tag===3?l.stateNode.containerInfo:null;return}}}i.blockedOn=null}function ti(i){if(i.blockedOn!==null)return!1;for(var o=i.targetContainers;0<o.length;){var l=Bo(i.domEventName,i.eventSystemFlags,o[0],i.nativeEvent);if(l===null){l=i.nativeEvent;var d=new l.constructor(l.type,l);Ds=d,l.target.dispatchEvent(d),Ds=null}else return o=Ul(l),o!==null&&jo(o),i.blockedOn=l,!1;o.shift()}return!0}function zs(i,o,l){ti(i)&&l.delete(o)}function Cc(){Sl=!1,Wt!==null&&ti(Wt)&&(Wt=null),ir!==null&&ti(ir)&&(ir=null),sr!==null&&ti(sr)&&(sr=null),Bi.forEach(zs),zn.forEach(zs)}function or(i,o){i.blockedOn===o&&(i.blockedOn=null,Sl||(Sl=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,Cc)))}function ar(i){function o(m){return or(m,i)}if(0<Rr.length){or(Rr[0],i);for(var l=1;l<Rr.length;l++){var d=Rr[l];d.blockedOn===i&&(d.blockedOn=null)}}for(Wt!==null&&or(Wt,i),ir!==null&&or(ir,i),sr!==null&&or(sr,i),Bi.forEach(o),zn.forEach(o),l=0;l<kr.length;l++)d=kr[l],d.blockedOn===i&&(d.blockedOn=null);for(;0<kr.length&&(l=kr[0],l.blockedOn===null);)Sc(l),l.blockedOn===null&&kr.shift()}var ni=re.ReactCurrentBatchConfig,zi=!0;function lt(i,o,l,d){var m=Le,_=ni.transition;ni.transition=null;try{Le=1,Cl(i,o,l,d)}finally{Le=m,ni.transition=_}}function Cf(i,o,l,d){var m=Le,_=ni.transition;ni.transition=null;try{Le=4,Cl(i,o,l,d)}finally{Le=m,ni.transition=_}}function Cl(i,o,l,d){if(zi){var m=Bo(i,o,l,d);if(m===null)Mf(i,o,d,Ws,l),Ic(i,d);else if(Sf(m,i,o,l,d))d.stopPropagation();else if(Ic(i,d),o&4&&-1<If.indexOf(i)){for(;m!==null;){var _=Ul(m);if(_!==null&&vc(_),_=Bo(i,o,l,d),_===null&&Mf(i,o,d,Ws,l),_===m)break;m=_}m!==null&&d.stopPropagation()}else Mf(i,o,d,null,l)}}var Ws=null;function Bo(i,o,l,d){if(Ws=null,i=No(d),i=qs(i),i!==null)if(o=nr(i),o===null)i=null;else if(l=o.tag,l===13){if(i=Vs(o),i!==null)return i;i=null}else if(l===3){if(o.stateNode.current.memoizedState.isDehydrated)return o.tag===3?o.stateNode.containerInfo:null;i=null}else o!==i&&(i=null);return Ws=i,null}function Rl(i){switch(i){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(pc()){case Fs:return 1;case Li:return 4;case Bn:case Tl:return 16;case mc:return 536870912;default:return 16}default:return 16}}var bn=null,zo=null,yn=null;function kl(){if(yn)return yn;var i,o=zo,l=o.length,d,m="value"in bn?bn.value:bn.textContent,_=m.length;for(i=0;i<l&&o[i]===m[i];i++);var E=l-i;for(d=1;d<=E&&o[l-d]===m[_-d];d++);return yn=m.slice(i,1<d?1-d:void 0)}function Wo(i){var o=i.keyCode;return"charCode"in i?(i=i.charCode,i===0&&o===13&&(i=13)):i=o,i===10&&(i=13),32<=i||i===13?i:0}function Ar(){return!0}function Al(){return!1}function $t(i){function o(l,d,m,_,E){this._reactName=l,this._targetInst=m,this.type=d,this.nativeEvent=_,this.target=E,this.currentTarget=null;for(var k in i)i.hasOwnProperty(k)&&(l=i[k],this[k]=l?l(_):_[k]);return this.isDefaultPrevented=(_.defaultPrevented!=null?_.defaultPrevented:_.returnValue===!1)?Ar:Al,this.isPropagationStopped=Al,this}return ae(o.prototype,{preventDefault:function(){this.defaultPrevented=!0;var l=this.nativeEvent;l&&(l.preventDefault?l.preventDefault():typeof l.returnValue!="unknown"&&(l.returnValue=!1),this.isDefaultPrevented=Ar)},stopPropagation:function(){var l=this.nativeEvent;l&&(l.stopPropagation?l.stopPropagation():typeof l.cancelBubble!="unknown"&&(l.cancelBubble=!0),this.isPropagationStopped=Ar)},persist:function(){},isPersistent:Ar}),o}var lr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(i){return i.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},$o=$t(lr),Pr=ae({},lr,{view:0,detail:0}),Rf=$t(Pr),Ho,ri,Wi,$s=ae({},Pr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Nr,button:0,buttons:0,relatedTarget:function(i){return i.relatedTarget===void 0?i.fromElement===i.srcElement?i.toElement:i.fromElement:i.relatedTarget},movementX:function(i){return"movementX"in i?i.movementX:(i!==Wi&&(Wi&&i.type==="mousemove"?(Ho=i.screenX-Wi.screenX,ri=i.screenY-Wi.screenY):ri=Ho=0,Wi=i),Ho)},movementY:function(i){return"movementY"in i?i.movementY:ri}}),qo=$t($s),Pl=ae({},$s,{dataTransfer:0}),Rc=$t(Pl),Go=ae({},Pr,{relatedTarget:0}),Ko=$t(Go),kc=ae({},lr,{animationName:0,elapsedTime:0,pseudoElement:0}),ii=$t(kc),Ac=ae({},lr,{clipboardData:function(i){return"clipboardData"in i?i.clipboardData:window.clipboardData}}),Pc=$t(Ac),Nc=ae({},lr,{data:0}),Nl=$t(Nc),Qo={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},un={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},xc={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Oc(i){var o=this.nativeEvent;return o.getModifierState?o.getModifierState(i):(i=xc[i])?!!o[i]:!1}function Nr(){return Oc}var c=ae({},Pr,{key:function(i){if(i.key){var o=Qo[i.key]||i.key;if(o!=="Unidentified")return o}return i.type==="keypress"?(i=Wo(i),i===13?"Enter":String.fromCharCode(i)):i.type==="keydown"||i.type==="keyup"?un[i.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Nr,charCode:function(i){return i.type==="keypress"?Wo(i):0},keyCode:function(i){return i.type==="keydown"||i.type==="keyup"?i.keyCode:0},which:function(i){return i.type==="keypress"?Wo(i):i.type==="keydown"||i.type==="keyup"?i.keyCode:0}}),g=$t(c),v=ae({},$s,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),I=$t(v),U=ae({},Pr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Nr}),$=$t(U),ne=ae({},lr,{propertyName:0,elapsedTime:0,pseudoElement:0}),Qe=$t(ne),At=ae({},$s,{deltaX:function(i){return"deltaX"in i?i.deltaX:"wheelDeltaX"in i?-i.wheelDeltaX:0},deltaY:function(i){return"deltaY"in i?i.deltaY:"wheelDeltaY"in i?-i.wheelDeltaY:"wheelDelta"in i?-i.wheelDelta:0},deltaZ:0,deltaMode:0}),Fe=$t(At),Lt=[9,13,27,32],Et=h&&"CompositionEvent"in window,Wn=null;h&&"documentMode"in document&&(Wn=document.documentMode);var Ln=h&&"TextEvent"in window&&!Wn,Hs=h&&(!Et||Wn&&8<Wn&&11>=Wn),Yo=" ",dy=!1;function fy(i,o){switch(i){case"keyup":return Lt.indexOf(o.keyCode)!==-1;case"keydown":return o.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function py(i){return i=i.detail,typeof i=="object"&&"data"in i?i.data:null}var Xo=!1;function PS(i,o){switch(i){case"compositionend":return py(o);case"keypress":return o.which!==32?null:(dy=!0,Yo);case"textInput":return i=o.data,i===Yo&&dy?null:i;default:return null}}function NS(i,o){if(Xo)return i==="compositionend"||!Et&&fy(i,o)?(i=kl(),yn=zo=bn=null,Xo=!1,i):null;switch(i){case"paste":return null;case"keypress":if(!(o.ctrlKey||o.altKey||o.metaKey)||o.ctrlKey&&o.altKey){if(o.char&&1<o.char.length)return o.char;if(o.which)return String.fromCharCode(o.which)}return null;case"compositionend":return Hs&&o.locale!=="ko"?null:o.data;default:return null}}var xS={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function my(i){var o=i&&i.nodeName&&i.nodeName.toLowerCase();return o==="input"?!!xS[i.type]:o==="textarea"}function gy(i,o,l,d){Cr(d),o=Vc(o,"onChange"),0<o.length&&(l=new $o("onChange","change",null,l,d),i.push({event:l,listeners:o}))}var xl=null,Ol=null;function OS(i){by(i,0)}function Dc(i){var o=na(i);if(Co(o))return i}function DS(i,o){if(i==="change")return o}var _y=!1;if(h){var kf;if(h){var Af="oninput"in document;if(!Af){var yy=document.createElement("div");yy.setAttribute("oninput","return;"),Af=typeof yy.oninput=="function"}kf=Af}else kf=!1;_y=kf&&(!document.documentMode||9<document.documentMode)}function vy(){xl&&(xl.detachEvent("onpropertychange",wy),Ol=xl=null)}function wy(i){if(i.propertyName==="value"&&Dc(Ol)){var o=[];gy(o,Ol,i,No(i)),yl(OS,o)}}function bS(i,o,l){i==="focusin"?(vy(),xl=o,Ol=l,xl.attachEvent("onpropertychange",wy)):i==="focusout"&&vy()}function LS(i){if(i==="selectionchange"||i==="keyup"||i==="keydown")return Dc(Ol)}function MS(i,o){if(i==="click")return Dc(o)}function VS(i,o){if(i==="input"||i==="change")return Dc(o)}function FS(i,o){return i===o&&(i!==0||1/i===1/o)||i!==i&&o!==o}var ur=typeof Object.is=="function"?Object.is:FS;function Dl(i,o){if(ur(i,o))return!0;if(typeof i!="object"||i===null||typeof o!="object"||o===null)return!1;var l=Object.keys(i),d=Object.keys(o);if(l.length!==d.length)return!1;for(d=0;d<l.length;d++){var m=l[d];if(!f.call(o,m)||!ur(i[m],o[m]))return!1}return!0}function Ey(i){for(;i&&i.firstChild;)i=i.firstChild;return i}function Ty(i,o){var l=Ey(i);i=0;for(var d;l;){if(l.nodeType===3){if(d=i+l.textContent.length,i<=o&&d>=o)return{node:l,offset:o-i};i=d}e:{for(;l;){if(l.nextSibling){l=l.nextSibling;break e}l=l.parentNode}l=void 0}l=Ey(l)}}function Iy(i,o){return i&&o?i===o?!0:i&&i.nodeType===3?!1:o&&o.nodeType===3?Iy(i,o.parentNode):"contains"in i?i.contains(o):i.compareDocumentPosition?!!(i.compareDocumentPosition(o)&16):!1:!1}function Sy(){for(var i=window,o=Di();o instanceof i.HTMLIFrameElement;){try{var l=typeof o.contentWindow.location.href=="string"}catch{l=!1}if(l)i=o.contentWindow;else break;o=Di(i.document)}return o}function Pf(i){var o=i&&i.nodeName&&i.nodeName.toLowerCase();return o&&(o==="input"&&(i.type==="text"||i.type==="search"||i.type==="tel"||i.type==="url"||i.type==="password")||o==="textarea"||i.contentEditable==="true")}function US(i){var o=Sy(),l=i.focusedElem,d=i.selectionRange;if(o!==l&&l&&l.ownerDocument&&Iy(l.ownerDocument.documentElement,l)){if(d!==null&&Pf(l)){if(o=d.start,i=d.end,i===void 0&&(i=o),"selectionStart"in l)l.selectionStart=o,l.selectionEnd=Math.min(i,l.value.length);else if(i=(o=l.ownerDocument||document)&&o.defaultView||window,i.getSelection){i=i.getSelection();var m=l.textContent.length,_=Math.min(d.start,m);d=d.end===void 0?_:Math.min(d.end,m),!i.extend&&_>d&&(m=d,d=_,_=m),m=Ty(l,_);var E=Ty(l,d);m&&E&&(i.rangeCount!==1||i.anchorNode!==m.node||i.anchorOffset!==m.offset||i.focusNode!==E.node||i.focusOffset!==E.offset)&&(o=o.createRange(),o.setStart(m.node,m.offset),i.removeAllRanges(),_>d?(i.addRange(o),i.extend(E.node,E.offset)):(o.setEnd(E.node,E.offset),i.addRange(o)))}}for(o=[],i=l;i=i.parentNode;)i.nodeType===1&&o.push({element:i,left:i.scrollLeft,top:i.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<o.length;l++)i=o[l],i.element.scrollLeft=i.left,i.element.scrollTop=i.top}}var jS=h&&"documentMode"in document&&11>=document.documentMode,Jo=null,Nf=null,bl=null,xf=!1;function Cy(i,o,l){var d=l.window===l?l.document:l.nodeType===9?l:l.ownerDocument;xf||Jo==null||Jo!==Di(d)||(d=Jo,"selectionStart"in d&&Pf(d)?d={start:d.selectionStart,end:d.selectionEnd}:(d=(d.ownerDocument&&d.ownerDocument.defaultView||window).getSelection(),d={anchorNode:d.anchorNode,anchorOffset:d.anchorOffset,focusNode:d.focusNode,focusOffset:d.focusOffset}),bl&&Dl(bl,d)||(bl=d,d=Vc(Nf,"onSelect"),0<d.length&&(o=new $o("onSelect","select",null,o,l),i.push({event:o,listeners:d}),o.target=Jo)))}function bc(i,o){var l={};return l[i.toLowerCase()]=o.toLowerCase(),l["Webkit"+i]="webkit"+o,l["Moz"+i]="moz"+o,l}var Zo={animationend:bc("Animation","AnimationEnd"),animationiteration:bc("Animation","AnimationIteration"),animationstart:bc("Animation","AnimationStart"),transitionend:bc("Transition","TransitionEnd")},Of={},Ry={};h&&(Ry=document.createElement("div").style,"AnimationEvent"in window||(delete Zo.animationend.animation,delete Zo.animationiteration.animation,delete Zo.animationstart.animation),"TransitionEvent"in window||delete Zo.transitionend.transition);function Lc(i){if(Of[i])return Of[i];if(!Zo[i])return i;var o=Zo[i],l;for(l in o)if(o.hasOwnProperty(l)&&l in Ry)return Of[i]=o[l];return i}var ky=Lc("animationend"),Ay=Lc("animationiteration"),Py=Lc("animationstart"),Ny=Lc("transitionend"),xy=new Map,Oy="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function $i(i,o){xy.set(i,o),a(o,[i])}for(var Df=0;Df<Oy.length;Df++){var bf=Oy[Df],BS=bf.toLowerCase(),zS=bf[0].toUpperCase()+bf.slice(1);$i(BS,"on"+zS)}$i(ky,"onAnimationEnd"),$i(Ay,"onAnimationIteration"),$i(Py,"onAnimationStart"),$i("dblclick","onDoubleClick"),$i("focusin","onFocus"),$i("focusout","onBlur"),$i(Ny,"onTransitionEnd"),u("onMouseEnter",["mouseout","mouseover"]),u("onMouseLeave",["mouseout","mouseover"]),u("onPointerEnter",["pointerout","pointerover"]),u("onPointerLeave",["pointerout","pointerover"]),a("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),a("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),a("onBeforeInput",["compositionend","keypress","textInput","paste"]),a("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),a("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ll="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),WS=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ll));function Dy(i,o,l){var d=i.type||"unknown-event";i.currentTarget=l,hc(d,o,void 0,i),i.currentTarget=null}function by(i,o){o=(o&4)!==0;for(var l=0;l<i.length;l++){var d=i[l],m=d.event;d=d.listeners;e:{var _=void 0;if(o)for(var E=d.length-1;0<=E;E--){var k=d[E],x=k.instance,z=k.currentTarget;if(k=k.listener,x!==_&&m.isPropagationStopped())break e;Dy(m,k,z),_=x}else for(E=0;E<d.length;E++){if(k=d[E],x=k.instance,z=k.currentTarget,k=k.listener,x!==_&&m.isPropagationStopped())break e;Dy(m,k,z),_=x}}}if(tr)throw i=vl,tr=!1,vl=null,i}function st(i,o){var l=o[zf];l===void 0&&(l=o[zf]=new Set);var d=i+"__bubble";l.has(d)||(Ly(o,i,2,!1),l.add(d))}function Lf(i,o,l){var d=0;o&&(d|=4),Ly(l,i,d,o)}var Mc="_reactListening"+Math.random().toString(36).slice(2);function Ml(i){if(!i[Mc]){i[Mc]=!0,r.forEach(function(l){l!=="selectionchange"&&(WS.has(l)||Lf(l,!1,i),Lf(l,!0,i))});var o=i.nodeType===9?i:i.ownerDocument;o===null||o[Mc]||(o[Mc]=!0,Lf("selectionchange",!1,o))}}function Ly(i,o,l,d){switch(Rl(o)){case 1:var m=lt;break;case 4:m=Cf;break;default:m=Cl}l=m.bind(null,o,l,i),m=void 0,!Do||o!=="touchstart"&&o!=="touchmove"&&o!=="wheel"||(m=!0),d?m!==void 0?i.addEventListener(o,l,{capture:!0,passive:m}):i.addEventListener(o,l,!0):m!==void 0?i.addEventListener(o,l,{passive:m}):i.addEventListener(o,l,!1)}function Mf(i,o,l,d,m){var _=d;if((o&1)===0&&(o&2)===0&&d!==null)e:for(;;){if(d===null)return;var E=d.tag;if(E===3||E===4){var k=d.stateNode.containerInfo;if(k===m||k.nodeType===8&&k.parentNode===m)break;if(E===4)for(E=d.return;E!==null;){var x=E.tag;if((x===3||x===4)&&(x=E.stateNode.containerInfo,x===m||x.nodeType===8&&x.parentNode===m))return;E=E.return}for(;k!==null;){if(E=qs(k),E===null)return;if(x=E.tag,x===5||x===6){d=_=E;continue e}k=k.parentNode}}d=d.return}yl(function(){var z=_,J=No(l),ee=[];e:{var X=xy.get(i);if(X!==void 0){var ue=$o,fe=i;switch(i){case"keypress":if(Wo(l)===0)break e;case"keydown":case"keyup":ue=g;break;case"focusin":fe="focus",ue=Ko;break;case"focusout":fe="blur",ue=Ko;break;case"beforeblur":case"afterblur":ue=Ko;break;case"click":if(l.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ue=qo;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ue=Rc;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ue=$;break;case ky:case Ay:case Py:ue=ii;break;case Ny:ue=Qe;break;case"scroll":ue=Rf;break;case"wheel":ue=Fe;break;case"copy":case"cut":case"paste":ue=Pc;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ue=I}var pe=(o&4)!==0,yt=!pe&&i==="scroll",j=pe?X!==null?X+"Capture":null:X;pe=[];for(var L=z,B;L!==null;){B=L;var te=B.stateNode;if(B.tag===5&&te!==null&&(B=te,j!==null&&(te=_t(L,j),te!=null&&pe.push(Vl(L,te,B)))),yt)break;L=L.return}0<pe.length&&(X=new ue(X,fe,null,l,J),ee.push({event:X,listeners:pe}))}}if((o&7)===0){e:{if(X=i==="mouseover"||i==="pointerover",ue=i==="mouseout"||i==="pointerout",X&&l!==Ds&&(fe=l.relatedTarget||l.fromElement)&&(qs(fe)||fe[si]))break e;if((ue||X)&&(X=J.window===J?J:(X=J.ownerDocument)?X.defaultView||X.parentWindow:window,ue?(fe=l.relatedTarget||l.toElement,ue=z,fe=fe?qs(fe):null,fe!==null&&(yt=nr(fe),fe!==yt||fe.tag!==5&&fe.tag!==6)&&(fe=null)):(ue=null,fe=z),ue!==fe)){if(pe=qo,te="onMouseLeave",j="onMouseEnter",L="mouse",(i==="pointerout"||i==="pointerover")&&(pe=I,te="onPointerLeave",j="onPointerEnter",L="pointer"),yt=ue==null?X:na(ue),B=fe==null?X:na(fe),X=new pe(te,L+"leave",ue,l,J),X.target=yt,X.relatedTarget=B,te=null,qs(J)===z&&(pe=new pe(j,L+"enter",fe,l,J),pe.target=B,pe.relatedTarget=yt,te=pe),yt=te,ue&&fe)t:{for(pe=ue,j=fe,L=0,B=pe;B;B=ea(B))L++;for(B=0,te=j;te;te=ea(te))B++;for(;0<L-B;)pe=ea(pe),L--;for(;0<B-L;)j=ea(j),B--;for(;L--;){if(pe===j||j!==null&&pe===j.alternate)break t;pe=ea(pe),j=ea(j)}pe=null}else pe=null;ue!==null&&My(ee,X,ue,pe,!1),fe!==null&&yt!==null&&My(ee,yt,fe,pe,!0)}}e:{if(X=z?na(z):window,ue=X.nodeName&&X.nodeName.toLowerCase(),ue==="select"||ue==="input"&&X.type==="file")var me=DS;else if(my(X))if(_y)me=VS;else{me=LS;var ye=bS}else(ue=X.nodeName)&&ue.toLowerCase()==="input"&&(X.type==="checkbox"||X.type==="radio")&&(me=MS);if(me&&(me=me(i,z))){gy(ee,me,l,J);break e}ye&&ye(i,X,z),i==="focusout"&&(ye=X._wrapperState)&&ye.controlled&&X.type==="number"&&ko(X,"number",X.value)}switch(ye=z?na(z):window,i){case"focusin":(my(ye)||ye.contentEditable==="true")&&(Jo=ye,Nf=z,bl=null);break;case"focusout":bl=Nf=Jo=null;break;case"mousedown":xf=!0;break;case"contextmenu":case"mouseup":case"dragend":xf=!1,Cy(ee,l,J);break;case"selectionchange":if(jS)break;case"keydown":case"keyup":Cy(ee,l,J)}var ve;if(Et)e:{switch(i){case"compositionstart":var Se="onCompositionStart";break e;case"compositionend":Se="onCompositionEnd";break e;case"compositionupdate":Se="onCompositionUpdate";break e}Se=void 0}else Xo?fy(i,l)&&(Se="onCompositionEnd"):i==="keydown"&&l.keyCode===229&&(Se="onCompositionStart");Se&&(Hs&&l.locale!=="ko"&&(Xo||Se!=="onCompositionStart"?Se==="onCompositionEnd"&&Xo&&(ve=kl()):(bn=J,zo="value"in bn?bn.value:bn.textContent,Xo=!0)),ye=Vc(z,Se),0<ye.length&&(Se=new Nl(Se,i,null,l,J),ee.push({event:Se,listeners:ye}),ve?Se.data=ve:(ve=py(l),ve!==null&&(Se.data=ve)))),(ve=Ln?PS(i,l):NS(i,l))&&(z=Vc(z,"onBeforeInput"),0<z.length&&(J=new Nl("onBeforeInput","beforeinput",null,l,J),ee.push({event:J,listeners:z}),J.data=ve))}by(ee,o)})}function Vl(i,o,l){return{instance:i,listener:o,currentTarget:l}}function Vc(i,o){for(var l=o+"Capture",d=[];i!==null;){var m=i,_=m.stateNode;m.tag===5&&_!==null&&(m=_,_=_t(i,l),_!=null&&d.unshift(Vl(i,_,m)),_=_t(i,o),_!=null&&d.push(Vl(i,_,m))),i=i.return}return d}function ea(i){if(i===null)return null;do i=i.return;while(i&&i.tag!==5);return i||null}function My(i,o,l,d,m){for(var _=o._reactName,E=[];l!==null&&l!==d;){var k=l,x=k.alternate,z=k.stateNode;if(x!==null&&x===d)break;k.tag===5&&z!==null&&(k=z,m?(x=_t(l,_),x!=null&&E.unshift(Vl(l,x,k))):m||(x=_t(l,_),x!=null&&E.push(Vl(l,x,k)))),l=l.return}E.length!==0&&i.push({event:o,listeners:E})}var $S=/\r\n?/g,HS=/\u0000|\uFFFD/g;function Vy(i){return(typeof i=="string"?i:""+i).replace($S,`
`).replace(HS,"")}function Fc(i,o,l){if(o=Vy(o),Vy(i)!==o&&l)throw Error(t(425))}function Uc(){}var Vf=null,Ff=null;function Uf(i,o){return i==="textarea"||i==="noscript"||typeof o.children=="string"||typeof o.children=="number"||typeof o.dangerouslySetInnerHTML=="object"&&o.dangerouslySetInnerHTML!==null&&o.dangerouslySetInnerHTML.__html!=null}var jf=typeof setTimeout=="function"?setTimeout:void 0,qS=typeof clearTimeout=="function"?clearTimeout:void 0,Fy=typeof Promise=="function"?Promise:void 0,GS=typeof queueMicrotask=="function"?queueMicrotask:typeof Fy<"u"?function(i){return Fy.resolve(null).then(i).catch(KS)}:jf;function KS(i){setTimeout(function(){throw i})}function Bf(i,o){var l=o,d=0;do{var m=l.nextSibling;if(i.removeChild(l),m&&m.nodeType===8)if(l=m.data,l==="/$"){if(d===0){i.removeChild(m),ar(o);return}d--}else l!=="$"&&l!=="$?"&&l!=="$!"||d++;l=m}while(l);ar(o)}function Hi(i){for(;i!=null;i=i.nextSibling){var o=i.nodeType;if(o===1||o===3)break;if(o===8){if(o=i.data,o==="$"||o==="$!"||o==="$?")break;if(o==="/$")return null}}return i}function Uy(i){i=i.previousSibling;for(var o=0;i;){if(i.nodeType===8){var l=i.data;if(l==="$"||l==="$!"||l==="$?"){if(o===0)return i;o--}else l==="/$"&&o++}i=i.previousSibling}return null}var ta=Math.random().toString(36).slice(2),xr="__reactFiber$"+ta,Fl="__reactProps$"+ta,si="__reactContainer$"+ta,zf="__reactEvents$"+ta,QS="__reactListeners$"+ta,YS="__reactHandles$"+ta;function qs(i){var o=i[xr];if(o)return o;for(var l=i.parentNode;l;){if(o=l[si]||l[xr]){if(l=o.alternate,o.child!==null||l!==null&&l.child!==null)for(i=Uy(i);i!==null;){if(l=i[xr])return l;i=Uy(i)}return o}i=l,l=i.parentNode}return null}function Ul(i){return i=i[xr]||i[si],!i||i.tag!==5&&i.tag!==6&&i.tag!==13&&i.tag!==3?null:i}function na(i){if(i.tag===5||i.tag===6)return i.stateNode;throw Error(t(33))}function jc(i){return i[Fl]||null}var Wf=[],ra=-1;function qi(i){return{current:i}}function ot(i){0>ra||(i.current=Wf[ra],Wf[ra]=null,ra--)}function tt(i,o){ra++,Wf[ra]=i.current,i.current=o}var Gi={},Xt=qi(Gi),vn=qi(!1),Gs=Gi;function ia(i,o){var l=i.type.contextTypes;if(!l)return Gi;var d=i.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===o)return d.__reactInternalMemoizedMaskedChildContext;var m={},_;for(_ in l)m[_]=o[_];return d&&(i=i.stateNode,i.__reactInternalMemoizedUnmaskedChildContext=o,i.__reactInternalMemoizedMaskedChildContext=m),m}function wn(i){return i=i.childContextTypes,i!=null}function Bc(){ot(vn),ot(Xt)}function jy(i,o,l){if(Xt.current!==Gi)throw Error(t(168));tt(Xt,o),tt(vn,l)}function By(i,o,l){var d=i.stateNode;if(o=o.childContextTypes,typeof d.getChildContext!="function")return l;d=d.getChildContext();for(var m in d)if(!(m in o))throw Error(t(108,$e(i)||"Unknown",m));return ae({},l,d)}function zc(i){return i=(i=i.stateNode)&&i.__reactInternalMemoizedMergedChildContext||Gi,Gs=Xt.current,tt(Xt,i),tt(vn,vn.current),!0}function zy(i,o,l){var d=i.stateNode;if(!d)throw Error(t(169));l?(i=By(i,o,Gs),d.__reactInternalMemoizedMergedChildContext=i,ot(vn),ot(Xt),tt(Xt,i)):ot(vn),tt(vn,l)}var oi=null,Wc=!1,$f=!1;function Wy(i){oi===null?oi=[i]:oi.push(i)}function XS(i){Wc=!0,Wy(i)}function Ki(){if(!$f&&oi!==null){$f=!0;var i=0,o=Le;try{var l=oi;for(Le=1;i<l.length;i++){var d=l[i];do d=d(!0);while(d!==null)}oi=null,Wc=!1}catch(m){throw oi!==null&&(oi=oi.slice(i+1)),Vo(Fs,Ki),m}finally{Le=o,$f=!1}}return null}var sa=[],oa=0,$c=null,Hc=0,$n=[],Hn=0,Ks=null,ai=1,li="";function Qs(i,o){sa[oa++]=Hc,sa[oa++]=$c,$c=i,Hc=o}function $y(i,o,l){$n[Hn++]=ai,$n[Hn++]=li,$n[Hn++]=Ks,Ks=i;var d=ai;i=li;var m=32-ln(d)-1;d&=~(1<<m),l+=1;var _=32-ln(o)+m;if(30<_){var E=m-m%5;_=(d&(1<<E)-1).toString(32),d>>=E,m-=E,ai=1<<32-ln(o)+m|l<<m|d,li=_+i}else ai=1<<_|l<<m|d,li=i}function Hf(i){i.return!==null&&(Qs(i,1),$y(i,1,0))}function qf(i){for(;i===$c;)$c=sa[--oa],sa[oa]=null,Hc=sa[--oa],sa[oa]=null;for(;i===Ks;)Ks=$n[--Hn],$n[Hn]=null,li=$n[--Hn],$n[Hn]=null,ai=$n[--Hn],$n[Hn]=null}var Mn=null,Vn=null,ut=!1,cr=null;function Hy(i,o){var l=Qn(5,null,null,0);l.elementType="DELETED",l.stateNode=o,l.return=i,o=i.deletions,o===null?(i.deletions=[l],i.flags|=16):o.push(l)}function qy(i,o){switch(i.tag){case 5:var l=i.type;return o=o.nodeType!==1||l.toLowerCase()!==o.nodeName.toLowerCase()?null:o,o!==null?(i.stateNode=o,Mn=i,Vn=Hi(o.firstChild),!0):!1;case 6:return o=i.pendingProps===""||o.nodeType!==3?null:o,o!==null?(i.stateNode=o,Mn=i,Vn=null,!0):!1;case 13:return o=o.nodeType!==8?null:o,o!==null?(l=Ks!==null?{id:ai,overflow:li}:null,i.memoizedState={dehydrated:o,treeContext:l,retryLane:1073741824},l=Qn(18,null,null,0),l.stateNode=o,l.return=i,i.child=l,Mn=i,Vn=null,!0):!1;default:return!1}}function Gf(i){return(i.mode&1)!==0&&(i.flags&128)===0}function Kf(i){if(ut){var o=Vn;if(o){var l=o;if(!qy(i,o)){if(Gf(i))throw Error(t(418));o=Hi(l.nextSibling);var d=Mn;o&&qy(i,o)?Hy(d,l):(i.flags=i.flags&-4097|2,ut=!1,Mn=i)}}else{if(Gf(i))throw Error(t(418));i.flags=i.flags&-4097|2,ut=!1,Mn=i}}}function Gy(i){for(i=i.return;i!==null&&i.tag!==5&&i.tag!==3&&i.tag!==13;)i=i.return;Mn=i}function qc(i){if(i!==Mn)return!1;if(!ut)return Gy(i),ut=!0,!1;var o;if((o=i.tag!==3)&&!(o=i.tag!==5)&&(o=i.type,o=o!=="head"&&o!=="body"&&!Uf(i.type,i.memoizedProps)),o&&(o=Vn)){if(Gf(i))throw Ky(),Error(t(418));for(;o;)Hy(i,o),o=Hi(o.nextSibling)}if(Gy(i),i.tag===13){if(i=i.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(t(317));e:{for(i=i.nextSibling,o=0;i;){if(i.nodeType===8){var l=i.data;if(l==="/$"){if(o===0){Vn=Hi(i.nextSibling);break e}o--}else l!=="$"&&l!=="$!"&&l!=="$?"||o++}i=i.nextSibling}Vn=null}}else Vn=Mn?Hi(i.stateNode.nextSibling):null;return!0}function Ky(){for(var i=Vn;i;)i=Hi(i.nextSibling)}function aa(){Vn=Mn=null,ut=!1}function Qf(i){cr===null?cr=[i]:cr.push(i)}var JS=re.ReactCurrentBatchConfig;function jl(i,o,l){if(i=l.ref,i!==null&&typeof i!="function"&&typeof i!="object"){if(l._owner){if(l=l._owner,l){if(l.tag!==1)throw Error(t(309));var d=l.stateNode}if(!d)throw Error(t(147,i));var m=d,_=""+i;return o!==null&&o.ref!==null&&typeof o.ref=="function"&&o.ref._stringRef===_?o.ref:(o=function(E){var k=m.refs;E===null?delete k[_]:k[_]=E},o._stringRef=_,o)}if(typeof i!="string")throw Error(t(284));if(!l._owner)throw Error(t(290,i))}return i}function Gc(i,o){throw i=Object.prototype.toString.call(o),Error(t(31,i==="[object Object]"?"object with keys {"+Object.keys(o).join(", ")+"}":i))}function Qy(i){var o=i._init;return o(i._payload)}function Yy(i){function o(j,L){if(i){var B=j.deletions;B===null?(j.deletions=[L],j.flags|=16):B.push(L)}}function l(j,L){if(!i)return null;for(;L!==null;)o(j,L),L=L.sibling;return null}function d(j,L){for(j=new Map;L!==null;)L.key!==null?j.set(L.key,L):j.set(L.index,L),L=L.sibling;return j}function m(j,L){return j=ns(j,L),j.index=0,j.sibling=null,j}function _(j,L,B){return j.index=B,i?(B=j.alternate,B!==null?(B=B.index,B<L?(j.flags|=2,L):B):(j.flags|=2,L)):(j.flags|=1048576,L)}function E(j){return i&&j.alternate===null&&(j.flags|=2),j}function k(j,L,B,te){return L===null||L.tag!==6?(L=jp(B,j.mode,te),L.return=j,L):(L=m(L,B),L.return=j,L)}function x(j,L,B,te){var me=B.type;return me===O?J(j,L,B.props.children,te,B.key):L!==null&&(L.elementType===me||typeof me=="object"&&me!==null&&me.$$typeof===Dt&&Qy(me)===L.type)?(te=m(L,B.props),te.ref=jl(j,L,B),te.return=j,te):(te=_h(B.type,B.key,B.props,null,j.mode,te),te.ref=jl(j,L,B),te.return=j,te)}function z(j,L,B,te){return L===null||L.tag!==4||L.stateNode.containerInfo!==B.containerInfo||L.stateNode.implementation!==B.implementation?(L=Bp(B,j.mode,te),L.return=j,L):(L=m(L,B.children||[]),L.return=j,L)}function J(j,L,B,te,me){return L===null||L.tag!==7?(L=ro(B,j.mode,te,me),L.return=j,L):(L=m(L,B),L.return=j,L)}function ee(j,L,B){if(typeof L=="string"&&L!==""||typeof L=="number")return L=jp(""+L,j.mode,B),L.return=j,L;if(typeof L=="object"&&L!==null){switch(L.$$typeof){case Ie:return B=_h(L.type,L.key,L.props,null,j.mode,B),B.ref=jl(j,null,L),B.return=j,B;case we:return L=Bp(L,j.mode,B),L.return=j,L;case Dt:var te=L._init;return ee(j,te(L._payload),B)}if(Yr(L)||ge(L))return L=ro(L,j.mode,B,null),L.return=j,L;Gc(j,L)}return null}function X(j,L,B,te){var me=L!==null?L.key:null;if(typeof B=="string"&&B!==""||typeof B=="number")return me!==null?null:k(j,L,""+B,te);if(typeof B=="object"&&B!==null){switch(B.$$typeof){case Ie:return B.key===me?x(j,L,B,te):null;case we:return B.key===me?z(j,L,B,te):null;case Dt:return me=B._init,X(j,L,me(B._payload),te)}if(Yr(B)||ge(B))return me!==null?null:J(j,L,B,te,null);Gc(j,B)}return null}function ue(j,L,B,te,me){if(typeof te=="string"&&te!==""||typeof te=="number")return j=j.get(B)||null,k(L,j,""+te,me);if(typeof te=="object"&&te!==null){switch(te.$$typeof){case Ie:return j=j.get(te.key===null?B:te.key)||null,x(L,j,te,me);case we:return j=j.get(te.key===null?B:te.key)||null,z(L,j,te,me);case Dt:var ye=te._init;return ue(j,L,B,ye(te._payload),me)}if(Yr(te)||ge(te))return j=j.get(B)||null,J(L,j,te,me,null);Gc(L,te)}return null}function fe(j,L,B,te){for(var me=null,ye=null,ve=L,Se=L=0,Ft=null;ve!==null&&Se<B.length;Se++){ve.index>Se?(Ft=ve,ve=null):Ft=ve.sibling;var We=X(j,ve,B[Se],te);if(We===null){ve===null&&(ve=Ft);break}i&&ve&&We.alternate===null&&o(j,ve),L=_(We,L,Se),ye===null?me=We:ye.sibling=We,ye=We,ve=Ft}if(Se===B.length)return l(j,ve),ut&&Qs(j,Se),me;if(ve===null){for(;Se<B.length;Se++)ve=ee(j,B[Se],te),ve!==null&&(L=_(ve,L,Se),ye===null?me=ve:ye.sibling=ve,ye=ve);return ut&&Qs(j,Se),me}for(ve=d(j,ve);Se<B.length;Se++)Ft=ue(ve,j,Se,B[Se],te),Ft!==null&&(i&&Ft.alternate!==null&&ve.delete(Ft.key===null?Se:Ft.key),L=_(Ft,L,Se),ye===null?me=Ft:ye.sibling=Ft,ye=Ft);return i&&ve.forEach(function(rs){return o(j,rs)}),ut&&Qs(j,Se),me}function pe(j,L,B,te){var me=ge(B);if(typeof me!="function")throw Error(t(150));if(B=me.call(B),B==null)throw Error(t(151));for(var ye=me=null,ve=L,Se=L=0,Ft=null,We=B.next();ve!==null&&!We.done;Se++,We=B.next()){ve.index>Se?(Ft=ve,ve=null):Ft=ve.sibling;var rs=X(j,ve,We.value,te);if(rs===null){ve===null&&(ve=Ft);break}i&&ve&&rs.alternate===null&&o(j,ve),L=_(rs,L,Se),ye===null?me=rs:ye.sibling=rs,ye=rs,ve=Ft}if(We.done)return l(j,ve),ut&&Qs(j,Se),me;if(ve===null){for(;!We.done;Se++,We=B.next())We=ee(j,We.value,te),We!==null&&(L=_(We,L,Se),ye===null?me=We:ye.sibling=We,ye=We);return ut&&Qs(j,Se),me}for(ve=d(j,ve);!We.done;Se++,We=B.next())We=ue(ve,j,Se,We.value,te),We!==null&&(i&&We.alternate!==null&&ve.delete(We.key===null?Se:We.key),L=_(We,L,Se),ye===null?me=We:ye.sibling=We,ye=We);return i&&ve.forEach(function(xC){return o(j,xC)}),ut&&Qs(j,Se),me}function yt(j,L,B,te){if(typeof B=="object"&&B!==null&&B.type===O&&B.key===null&&(B=B.props.children),typeof B=="object"&&B!==null){switch(B.$$typeof){case Ie:e:{for(var me=B.key,ye=L;ye!==null;){if(ye.key===me){if(me=B.type,me===O){if(ye.tag===7){l(j,ye.sibling),L=m(ye,B.props.children),L.return=j,j=L;break e}}else if(ye.elementType===me||typeof me=="object"&&me!==null&&me.$$typeof===Dt&&Qy(me)===ye.type){l(j,ye.sibling),L=m(ye,B.props),L.ref=jl(j,ye,B),L.return=j,j=L;break e}l(j,ye);break}else o(j,ye);ye=ye.sibling}B.type===O?(L=ro(B.props.children,j.mode,te,B.key),L.return=j,j=L):(te=_h(B.type,B.key,B.props,null,j.mode,te),te.ref=jl(j,L,B),te.return=j,j=te)}return E(j);case we:e:{for(ye=B.key;L!==null;){if(L.key===ye)if(L.tag===4&&L.stateNode.containerInfo===B.containerInfo&&L.stateNode.implementation===B.implementation){l(j,L.sibling),L=m(L,B.children||[]),L.return=j,j=L;break e}else{l(j,L);break}else o(j,L);L=L.sibling}L=Bp(B,j.mode,te),L.return=j,j=L}return E(j);case Dt:return ye=B._init,yt(j,L,ye(B._payload),te)}if(Yr(B))return fe(j,L,B,te);if(ge(B))return pe(j,L,B,te);Gc(j,B)}return typeof B=="string"&&B!==""||typeof B=="number"?(B=""+B,L!==null&&L.tag===6?(l(j,L.sibling),L=m(L,B),L.return=j,j=L):(l(j,L),L=jp(B,j.mode,te),L.return=j,j=L),E(j)):l(j,L)}return yt}var la=Yy(!0),Xy=Yy(!1),Kc=qi(null),Qc=null,ua=null,Yf=null;function Xf(){Yf=ua=Qc=null}function Jf(i){var o=Kc.current;ot(Kc),i._currentValue=o}function Zf(i,o,l){for(;i!==null;){var d=i.alternate;if((i.childLanes&o)!==o?(i.childLanes|=o,d!==null&&(d.childLanes|=o)):d!==null&&(d.childLanes&o)!==o&&(d.childLanes|=o),i===l)break;i=i.return}}function ca(i,o){Qc=i,Yf=ua=null,i=i.dependencies,i!==null&&i.firstContext!==null&&((i.lanes&o)!==0&&(En=!0),i.firstContext=null)}function qn(i){var o=i._currentValue;if(Yf!==i)if(i={context:i,memoizedValue:o,next:null},ua===null){if(Qc===null)throw Error(t(308));ua=i,Qc.dependencies={lanes:0,firstContext:i}}else ua=ua.next=i;return o}var Ys=null;function ep(i){Ys===null?Ys=[i]:Ys.push(i)}function Jy(i,o,l,d){var m=o.interleaved;return m===null?(l.next=l,ep(o)):(l.next=m.next,m.next=l),o.interleaved=l,ui(i,d)}function ui(i,o){i.lanes|=o;var l=i.alternate;for(l!==null&&(l.lanes|=o),l=i,i=i.return;i!==null;)i.childLanes|=o,l=i.alternate,l!==null&&(l.childLanes|=o),l=i,i=i.return;return l.tag===3?l.stateNode:null}var Qi=!1;function tp(i){i.updateQueue={baseState:i.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Zy(i,o){i=i.updateQueue,o.updateQueue===i&&(o.updateQueue={baseState:i.baseState,firstBaseUpdate:i.firstBaseUpdate,lastBaseUpdate:i.lastBaseUpdate,shared:i.shared,effects:i.effects})}function ci(i,o){return{eventTime:i,lane:o,tag:0,payload:null,callback:null,next:null}}function Yi(i,o,l){var d=i.updateQueue;if(d===null)return null;if(d=d.shared,(Be&2)!==0){var m=d.pending;return m===null?o.next=o:(o.next=m.next,m.next=o),d.pending=o,ui(i,l)}return m=d.interleaved,m===null?(o.next=o,ep(d)):(o.next=m.next,m.next=o),d.interleaved=o,ui(i,l)}function Yc(i,o,l){if(o=o.updateQueue,o!==null&&(o=o.shared,(l&4194240)!==0)){var d=o.lanes;d&=i.pendingLanes,l|=d,o.lanes=l,Ui(i,l)}}function ev(i,o){var l=i.updateQueue,d=i.alternate;if(d!==null&&(d=d.updateQueue,l===d)){var m=null,_=null;if(l=l.firstBaseUpdate,l!==null){do{var E={eventTime:l.eventTime,lane:l.lane,tag:l.tag,payload:l.payload,callback:l.callback,next:null};_===null?m=_=E:_=_.next=E,l=l.next}while(l!==null);_===null?m=_=o:_=_.next=o}else m=_=o;l={baseState:d.baseState,firstBaseUpdate:m,lastBaseUpdate:_,shared:d.shared,effects:d.effects},i.updateQueue=l;return}i=l.lastBaseUpdate,i===null?l.firstBaseUpdate=o:i.next=o,l.lastBaseUpdate=o}function Xc(i,o,l,d){var m=i.updateQueue;Qi=!1;var _=m.firstBaseUpdate,E=m.lastBaseUpdate,k=m.shared.pending;if(k!==null){m.shared.pending=null;var x=k,z=x.next;x.next=null,E===null?_=z:E.next=z,E=x;var J=i.alternate;J!==null&&(J=J.updateQueue,k=J.lastBaseUpdate,k!==E&&(k===null?J.firstBaseUpdate=z:k.next=z,J.lastBaseUpdate=x))}if(_!==null){var ee=m.baseState;E=0,J=z=x=null,k=_;do{var X=k.lane,ue=k.eventTime;if((d&X)===X){J!==null&&(J=J.next={eventTime:ue,lane:0,tag:k.tag,payload:k.payload,callback:k.callback,next:null});e:{var fe=i,pe=k;switch(X=o,ue=l,pe.tag){case 1:if(fe=pe.payload,typeof fe=="function"){ee=fe.call(ue,ee,X);break e}ee=fe;break e;case 3:fe.flags=fe.flags&-65537|128;case 0:if(fe=pe.payload,X=typeof fe=="function"?fe.call(ue,ee,X):fe,X==null)break e;ee=ae({},ee,X);break e;case 2:Qi=!0}}k.callback!==null&&k.lane!==0&&(i.flags|=64,X=m.effects,X===null?m.effects=[k]:X.push(k))}else ue={eventTime:ue,lane:X,tag:k.tag,payload:k.payload,callback:k.callback,next:null},J===null?(z=J=ue,x=ee):J=J.next=ue,E|=X;if(k=k.next,k===null){if(k=m.shared.pending,k===null)break;X=k,k=X.next,X.next=null,m.lastBaseUpdate=X,m.shared.pending=null}}while(!0);if(J===null&&(x=ee),m.baseState=x,m.firstBaseUpdate=z,m.lastBaseUpdate=J,o=m.shared.interleaved,o!==null){m=o;do E|=m.lane,m=m.next;while(m!==o)}else _===null&&(m.shared.lanes=0);Zs|=E,i.lanes=E,i.memoizedState=ee}}function tv(i,o,l){if(i=o.effects,o.effects=null,i!==null)for(o=0;o<i.length;o++){var d=i[o],m=d.callback;if(m!==null){if(d.callback=null,d=l,typeof m!="function")throw Error(t(191,m));m.call(d)}}}var Bl={},Or=qi(Bl),zl=qi(Bl),Wl=qi(Bl);function Xs(i){if(i===Bl)throw Error(t(174));return i}function np(i,o){switch(tt(Wl,o),tt(zl,i),tt(Or,Bl),i=o.nodeType,i){case 9:case 11:o=(o=o.documentElement)?o.namespaceURI:kt(null,"");break;default:i=i===8?o.parentNode:o,o=i.namespaceURI||null,i=i.tagName,o=kt(o,i)}ot(Or),tt(Or,o)}function ha(){ot(Or),ot(zl),ot(Wl)}function nv(i){Xs(Wl.current);var o=Xs(Or.current),l=kt(o,i.type);o!==l&&(tt(zl,i),tt(Or,l))}function rp(i){zl.current===i&&(ot(Or),ot(zl))}var ht=qi(0);function Jc(i){for(var o=i;o!==null;){if(o.tag===13){var l=o.memoizedState;if(l!==null&&(l=l.dehydrated,l===null||l.data==="$?"||l.data==="$!"))return o}else if(o.tag===19&&o.memoizedProps.revealOrder!==void 0){if((o.flags&128)!==0)return o}else if(o.child!==null){o.child.return=o,o=o.child;continue}if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return null;o=o.return}o.sibling.return=o.return,o=o.sibling}return null}var ip=[];function sp(){for(var i=0;i<ip.length;i++)ip[i]._workInProgressVersionPrimary=null;ip.length=0}var Zc=re.ReactCurrentDispatcher,op=re.ReactCurrentBatchConfig,Js=0,dt=null,Pt=null,Mt=null,eh=!1,$l=!1,Hl=0,ZS=0;function Jt(){throw Error(t(321))}function ap(i,o){if(o===null)return!1;for(var l=0;l<o.length&&l<i.length;l++)if(!ur(i[l],o[l]))return!1;return!0}function lp(i,o,l,d,m,_){if(Js=_,dt=o,o.memoizedState=null,o.updateQueue=null,o.lanes=0,Zc.current=i===null||i.memoizedState===null?rC:iC,i=l(d,m),$l){_=0;do{if($l=!1,Hl=0,25<=_)throw Error(t(301));_+=1,Mt=Pt=null,o.updateQueue=null,Zc.current=sC,i=l(d,m)}while($l)}if(Zc.current=rh,o=Pt!==null&&Pt.next!==null,Js=0,Mt=Pt=dt=null,eh=!1,o)throw Error(t(300));return i}function up(){var i=Hl!==0;return Hl=0,i}function Dr(){var i={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Mt===null?dt.memoizedState=Mt=i:Mt=Mt.next=i,Mt}function Gn(){if(Pt===null){var i=dt.alternate;i=i!==null?i.memoizedState:null}else i=Pt.next;var o=Mt===null?dt.memoizedState:Mt.next;if(o!==null)Mt=o,Pt=i;else{if(i===null)throw Error(t(310));Pt=i,i={memoizedState:Pt.memoizedState,baseState:Pt.baseState,baseQueue:Pt.baseQueue,queue:Pt.queue,next:null},Mt===null?dt.memoizedState=Mt=i:Mt=Mt.next=i}return Mt}function ql(i,o){return typeof o=="function"?o(i):o}function cp(i){var o=Gn(),l=o.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=i;var d=Pt,m=d.baseQueue,_=l.pending;if(_!==null){if(m!==null){var E=m.next;m.next=_.next,_.next=E}d.baseQueue=m=_,l.pending=null}if(m!==null){_=m.next,d=d.baseState;var k=E=null,x=null,z=_;do{var J=z.lane;if((Js&J)===J)x!==null&&(x=x.next={lane:0,action:z.action,hasEagerState:z.hasEagerState,eagerState:z.eagerState,next:null}),d=z.hasEagerState?z.eagerState:i(d,z.action);else{var ee={lane:J,action:z.action,hasEagerState:z.hasEagerState,eagerState:z.eagerState,next:null};x===null?(k=x=ee,E=d):x=x.next=ee,dt.lanes|=J,Zs|=J}z=z.next}while(z!==null&&z!==_);x===null?E=d:x.next=k,ur(d,o.memoizedState)||(En=!0),o.memoizedState=d,o.baseState=E,o.baseQueue=x,l.lastRenderedState=d}if(i=l.interleaved,i!==null){m=i;do _=m.lane,dt.lanes|=_,Zs|=_,m=m.next;while(m!==i)}else m===null&&(l.lanes=0);return[o.memoizedState,l.dispatch]}function hp(i){var o=Gn(),l=o.queue;if(l===null)throw Error(t(311));l.lastRenderedReducer=i;var d=l.dispatch,m=l.pending,_=o.memoizedState;if(m!==null){l.pending=null;var E=m=m.next;do _=i(_,E.action),E=E.next;while(E!==m);ur(_,o.memoizedState)||(En=!0),o.memoizedState=_,o.baseQueue===null&&(o.baseState=_),l.lastRenderedState=_}return[_,d]}function rv(){}function iv(i,o){var l=dt,d=Gn(),m=o(),_=!ur(d.memoizedState,m);if(_&&(d.memoizedState=m,En=!0),d=d.queue,dp(av.bind(null,l,d,i),[i]),d.getSnapshot!==o||_||Mt!==null&&Mt.memoizedState.tag&1){if(l.flags|=2048,Gl(9,ov.bind(null,l,d,m,o),void 0,null),Vt===null)throw Error(t(349));(Js&30)!==0||sv(l,o,m)}return m}function sv(i,o,l){i.flags|=16384,i={getSnapshot:o,value:l},o=dt.updateQueue,o===null?(o={lastEffect:null,stores:null},dt.updateQueue=o,o.stores=[i]):(l=o.stores,l===null?o.stores=[i]:l.push(i))}function ov(i,o,l,d){o.value=l,o.getSnapshot=d,lv(o)&&uv(i)}function av(i,o,l){return l(function(){lv(o)&&uv(i)})}function lv(i){var o=i.getSnapshot;i=i.value;try{var l=o();return!ur(i,l)}catch{return!0}}function uv(i){var o=ui(i,1);o!==null&&pr(o,i,1,-1)}function cv(i){var o=Dr();return typeof i=="function"&&(i=i()),o.memoizedState=o.baseState=i,i={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ql,lastRenderedState:i},o.queue=i,i=i.dispatch=nC.bind(null,dt,i),[o.memoizedState,i]}function Gl(i,o,l,d){return i={tag:i,create:o,destroy:l,deps:d,next:null},o=dt.updateQueue,o===null?(o={lastEffect:null,stores:null},dt.updateQueue=o,o.lastEffect=i.next=i):(l=o.lastEffect,l===null?o.lastEffect=i.next=i:(d=l.next,l.next=i,i.next=d,o.lastEffect=i)),i}function hv(){return Gn().memoizedState}function th(i,o,l,d){var m=Dr();dt.flags|=i,m.memoizedState=Gl(1|o,l,void 0,d===void 0?null:d)}function nh(i,o,l,d){var m=Gn();d=d===void 0?null:d;var _=void 0;if(Pt!==null){var E=Pt.memoizedState;if(_=E.destroy,d!==null&&ap(d,E.deps)){m.memoizedState=Gl(o,l,_,d);return}}dt.flags|=i,m.memoizedState=Gl(1|o,l,_,d)}function dv(i,o){return th(8390656,8,i,o)}function dp(i,o){return nh(2048,8,i,o)}function fv(i,o){return nh(4,2,i,o)}function pv(i,o){return nh(4,4,i,o)}function mv(i,o){if(typeof o=="function")return i=i(),o(i),function(){o(null)};if(o!=null)return i=i(),o.current=i,function(){o.current=null}}function gv(i,o,l){return l=l!=null?l.concat([i]):null,nh(4,4,mv.bind(null,o,i),l)}function fp(){}function _v(i,o){var l=Gn();o=o===void 0?null:o;var d=l.memoizedState;return d!==null&&o!==null&&ap(o,d[1])?d[0]:(l.memoizedState=[i,o],i)}function yv(i,o){var l=Gn();o=o===void 0?null:o;var d=l.memoizedState;return d!==null&&o!==null&&ap(o,d[1])?d[0]:(i=i(),l.memoizedState=[i,o],i)}function vv(i,o,l){return(Js&21)===0?(i.baseState&&(i.baseState=!1,En=!0),i.memoizedState=l):(ur(l,o)||(l=Bs(),dt.lanes|=l,Zs|=l,i.baseState=!0),o)}function eC(i,o){var l=Le;Le=l!==0&&4>l?l:4,i(!0);var d=op.transition;op.transition={};try{i(!1),o()}finally{Le=l,op.transition=d}}function wv(){return Gn().memoizedState}function tC(i,o,l){var d=es(i);if(l={lane:d,action:l,hasEagerState:!1,eagerState:null,next:null},Ev(i))Tv(o,l);else if(l=Jy(i,o,l,d),l!==null){var m=hn();pr(l,i,d,m),Iv(l,o,d)}}function nC(i,o,l){var d=es(i),m={lane:d,action:l,hasEagerState:!1,eagerState:null,next:null};if(Ev(i))Tv(o,m);else{var _=i.alternate;if(i.lanes===0&&(_===null||_.lanes===0)&&(_=o.lastRenderedReducer,_!==null))try{var E=o.lastRenderedState,k=_(E,l);if(m.hasEagerState=!0,m.eagerState=k,ur(k,E)){var x=o.interleaved;x===null?(m.next=m,ep(o)):(m.next=x.next,x.next=m),o.interleaved=m;return}}catch{}finally{}l=Jy(i,o,m,d),l!==null&&(m=hn(),pr(l,i,d,m),Iv(l,o,d))}}function Ev(i){var o=i.alternate;return i===dt||o!==null&&o===dt}function Tv(i,o){$l=eh=!0;var l=i.pending;l===null?o.next=o:(o.next=l.next,l.next=o),i.pending=o}function Iv(i,o,l){if((l&4194240)!==0){var d=o.lanes;d&=i.pendingLanes,l|=d,o.lanes=l,Ui(i,l)}}var rh={readContext:qn,useCallback:Jt,useContext:Jt,useEffect:Jt,useImperativeHandle:Jt,useInsertionEffect:Jt,useLayoutEffect:Jt,useMemo:Jt,useReducer:Jt,useRef:Jt,useState:Jt,useDebugValue:Jt,useDeferredValue:Jt,useTransition:Jt,useMutableSource:Jt,useSyncExternalStore:Jt,useId:Jt,unstable_isNewReconciler:!1},rC={readContext:qn,useCallback:function(i,o){return Dr().memoizedState=[i,o===void 0?null:o],i},useContext:qn,useEffect:dv,useImperativeHandle:function(i,o,l){return l=l!=null?l.concat([i]):null,th(4194308,4,mv.bind(null,o,i),l)},useLayoutEffect:function(i,o){return th(4194308,4,i,o)},useInsertionEffect:function(i,o){return th(4,2,i,o)},useMemo:function(i,o){var l=Dr();return o=o===void 0?null:o,i=i(),l.memoizedState=[i,o],i},useReducer:function(i,o,l){var d=Dr();return o=l!==void 0?l(o):o,d.memoizedState=d.baseState=o,i={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:i,lastRenderedState:o},d.queue=i,i=i.dispatch=tC.bind(null,dt,i),[d.memoizedState,i]},useRef:function(i){var o=Dr();return i={current:i},o.memoizedState=i},useState:cv,useDebugValue:fp,useDeferredValue:function(i){return Dr().memoizedState=i},useTransition:function(){var i=cv(!1),o=i[0];return i=eC.bind(null,i[1]),Dr().memoizedState=i,[o,i]},useMutableSource:function(){},useSyncExternalStore:function(i,o,l){var d=dt,m=Dr();if(ut){if(l===void 0)throw Error(t(407));l=l()}else{if(l=o(),Vt===null)throw Error(t(349));(Js&30)!==0||sv(d,o,l)}m.memoizedState=l;var _={value:l,getSnapshot:o};return m.queue=_,dv(av.bind(null,d,_,i),[i]),d.flags|=2048,Gl(9,ov.bind(null,d,_,l,o),void 0,null),l},useId:function(){var i=Dr(),o=Vt.identifierPrefix;if(ut){var l=li,d=ai;l=(d&~(1<<32-ln(d)-1)).toString(32)+l,o=":"+o+"R"+l,l=Hl++,0<l&&(o+="H"+l.toString(32)),o+=":"}else l=ZS++,o=":"+o+"r"+l.toString(32)+":";return i.memoizedState=o},unstable_isNewReconciler:!1},iC={readContext:qn,useCallback:_v,useContext:qn,useEffect:dp,useImperativeHandle:gv,useInsertionEffect:fv,useLayoutEffect:pv,useMemo:yv,useReducer:cp,useRef:hv,useState:function(){return cp(ql)},useDebugValue:fp,useDeferredValue:function(i){var o=Gn();return vv(o,Pt.memoizedState,i)},useTransition:function(){var i=cp(ql)[0],o=Gn().memoizedState;return[i,o]},useMutableSource:rv,useSyncExternalStore:iv,useId:wv,unstable_isNewReconciler:!1},sC={readContext:qn,useCallback:_v,useContext:qn,useEffect:dp,useImperativeHandle:gv,useInsertionEffect:fv,useLayoutEffect:pv,useMemo:yv,useReducer:hp,useRef:hv,useState:function(){return hp(ql)},useDebugValue:fp,useDeferredValue:function(i){var o=Gn();return Pt===null?o.memoizedState=i:vv(o,Pt.memoizedState,i)},useTransition:function(){var i=hp(ql)[0],o=Gn().memoizedState;return[i,o]},useMutableSource:rv,useSyncExternalStore:iv,useId:wv,unstable_isNewReconciler:!1};function hr(i,o){if(i&&i.defaultProps){o=ae({},o),i=i.defaultProps;for(var l in i)o[l]===void 0&&(o[l]=i[l]);return o}return o}function pp(i,o,l,d){o=i.memoizedState,l=l(d,o),l=l==null?o:ae({},o,l),i.memoizedState=l,i.lanes===0&&(i.updateQueue.baseState=l)}var ih={isMounted:function(i){return(i=i._reactInternals)?nr(i)===i:!1},enqueueSetState:function(i,o,l){i=i._reactInternals;var d=hn(),m=es(i),_=ci(d,m);_.payload=o,l!=null&&(_.callback=l),o=Yi(i,_,m),o!==null&&(pr(o,i,m,d),Yc(o,i,m))},enqueueReplaceState:function(i,o,l){i=i._reactInternals;var d=hn(),m=es(i),_=ci(d,m);_.tag=1,_.payload=o,l!=null&&(_.callback=l),o=Yi(i,_,m),o!==null&&(pr(o,i,m,d),Yc(o,i,m))},enqueueForceUpdate:function(i,o){i=i._reactInternals;var l=hn(),d=es(i),m=ci(l,d);m.tag=2,o!=null&&(m.callback=o),o=Yi(i,m,d),o!==null&&(pr(o,i,d,l),Yc(o,i,d))}};function Sv(i,o,l,d,m,_,E){return i=i.stateNode,typeof i.shouldComponentUpdate=="function"?i.shouldComponentUpdate(d,_,E):o.prototype&&o.prototype.isPureReactComponent?!Dl(l,d)||!Dl(m,_):!0}function Cv(i,o,l){var d=!1,m=Gi,_=o.contextType;return typeof _=="object"&&_!==null?_=qn(_):(m=wn(o)?Gs:Xt.current,d=o.contextTypes,_=(d=d!=null)?ia(i,m):Gi),o=new o(l,_),i.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,o.updater=ih,i.stateNode=o,o._reactInternals=i,d&&(i=i.stateNode,i.__reactInternalMemoizedUnmaskedChildContext=m,i.__reactInternalMemoizedMaskedChildContext=_),o}function Rv(i,o,l,d){i=o.state,typeof o.componentWillReceiveProps=="function"&&o.componentWillReceiveProps(l,d),typeof o.UNSAFE_componentWillReceiveProps=="function"&&o.UNSAFE_componentWillReceiveProps(l,d),o.state!==i&&ih.enqueueReplaceState(o,o.state,null)}function mp(i,o,l,d){var m=i.stateNode;m.props=l,m.state=i.memoizedState,m.refs={},tp(i);var _=o.contextType;typeof _=="object"&&_!==null?m.context=qn(_):(_=wn(o)?Gs:Xt.current,m.context=ia(i,_)),m.state=i.memoizedState,_=o.getDerivedStateFromProps,typeof _=="function"&&(pp(i,o,_,l),m.state=i.memoizedState),typeof o.getDerivedStateFromProps=="function"||typeof m.getSnapshotBeforeUpdate=="function"||typeof m.UNSAFE_componentWillMount!="function"&&typeof m.componentWillMount!="function"||(o=m.state,typeof m.componentWillMount=="function"&&m.componentWillMount(),typeof m.UNSAFE_componentWillMount=="function"&&m.UNSAFE_componentWillMount(),o!==m.state&&ih.enqueueReplaceState(m,m.state,null),Xc(i,l,m,d),m.state=i.memoizedState),typeof m.componentDidMount=="function"&&(i.flags|=4194308)}function da(i,o){try{var l="",d=o;do l+=Ae(d),d=d.return;while(d);var m=l}catch(_){m=`
Error generating stack: `+_.message+`
`+_.stack}return{value:i,source:o,stack:m,digest:null}}function gp(i,o,l){return{value:i,source:null,stack:l??null,digest:o??null}}function _p(i,o){try{console.error(o.value)}catch(l){setTimeout(function(){throw l})}}var oC=typeof WeakMap=="function"?WeakMap:Map;function kv(i,o,l){l=ci(-1,l),l.tag=3,l.payload={element:null};var d=o.value;return l.callback=function(){hh||(hh=!0,Op=d),_p(i,o)},l}function Av(i,o,l){l=ci(-1,l),l.tag=3;var d=i.type.getDerivedStateFromError;if(typeof d=="function"){var m=o.value;l.payload=function(){return d(m)},l.callback=function(){_p(i,o)}}var _=i.stateNode;return _!==null&&typeof _.componentDidCatch=="function"&&(l.callback=function(){_p(i,o),typeof d!="function"&&(Ji===null?Ji=new Set([this]):Ji.add(this));var E=o.stack;this.componentDidCatch(o.value,{componentStack:E!==null?E:""})}),l}function Pv(i,o,l){var d=i.pingCache;if(d===null){d=i.pingCache=new oC;var m=new Set;d.set(o,m)}else m=d.get(o),m===void 0&&(m=new Set,d.set(o,m));m.has(l)||(m.add(l),i=wC.bind(null,i,o,l),o.then(i,i))}function Nv(i){do{var o;if((o=i.tag===13)&&(o=i.memoizedState,o=o!==null?o.dehydrated!==null:!0),o)return i;i=i.return}while(i!==null);return null}function xv(i,o,l,d,m){return(i.mode&1)===0?(i===o?i.flags|=65536:(i.flags|=128,l.flags|=131072,l.flags&=-52805,l.tag===1&&(l.alternate===null?l.tag=17:(o=ci(-1,1),o.tag=2,Yi(l,o,1))),l.lanes|=1),i):(i.flags|=65536,i.lanes=m,i)}var aC=re.ReactCurrentOwner,En=!1;function cn(i,o,l,d){o.child=i===null?Xy(o,null,l,d):la(o,i.child,l,d)}function Ov(i,o,l,d,m){l=l.render;var _=o.ref;return ca(o,m),d=lp(i,o,l,d,_,m),l=up(),i!==null&&!En?(o.updateQueue=i.updateQueue,o.flags&=-2053,i.lanes&=~m,hi(i,o,m)):(ut&&l&&Hf(o),o.flags|=1,cn(i,o,d,m),o.child)}function Dv(i,o,l,d,m){if(i===null){var _=l.type;return typeof _=="function"&&!Up(_)&&_.defaultProps===void 0&&l.compare===null&&l.defaultProps===void 0?(o.tag=15,o.type=_,bv(i,o,_,d,m)):(i=_h(l.type,null,d,o,o.mode,m),i.ref=o.ref,i.return=o,o.child=i)}if(_=i.child,(i.lanes&m)===0){var E=_.memoizedProps;if(l=l.compare,l=l!==null?l:Dl,l(E,d)&&i.ref===o.ref)return hi(i,o,m)}return o.flags|=1,i=ns(_,d),i.ref=o.ref,i.return=o,o.child=i}function bv(i,o,l,d,m){if(i!==null){var _=i.memoizedProps;if(Dl(_,d)&&i.ref===o.ref)if(En=!1,o.pendingProps=d=_,(i.lanes&m)!==0)(i.flags&131072)!==0&&(En=!0);else return o.lanes=i.lanes,hi(i,o,m)}return yp(i,o,l,d,m)}function Lv(i,o,l){var d=o.pendingProps,m=d.children,_=i!==null?i.memoizedState:null;if(d.mode==="hidden")if((o.mode&1)===0)o.memoizedState={baseLanes:0,cachePool:null,transitions:null},tt(pa,Fn),Fn|=l;else{if((l&1073741824)===0)return i=_!==null?_.baseLanes|l:l,o.lanes=o.childLanes=1073741824,o.memoizedState={baseLanes:i,cachePool:null,transitions:null},o.updateQueue=null,tt(pa,Fn),Fn|=i,null;o.memoizedState={baseLanes:0,cachePool:null,transitions:null},d=_!==null?_.baseLanes:l,tt(pa,Fn),Fn|=d}else _!==null?(d=_.baseLanes|l,o.memoizedState=null):d=l,tt(pa,Fn),Fn|=d;return cn(i,o,m,l),o.child}function Mv(i,o){var l=o.ref;(i===null&&l!==null||i!==null&&i.ref!==l)&&(o.flags|=512,o.flags|=2097152)}function yp(i,o,l,d,m){var _=wn(l)?Gs:Xt.current;return _=ia(o,_),ca(o,m),l=lp(i,o,l,d,_,m),d=up(),i!==null&&!En?(o.updateQueue=i.updateQueue,o.flags&=-2053,i.lanes&=~m,hi(i,o,m)):(ut&&d&&Hf(o),o.flags|=1,cn(i,o,l,m),o.child)}function Vv(i,o,l,d,m){if(wn(l)){var _=!0;zc(o)}else _=!1;if(ca(o,m),o.stateNode===null)oh(i,o),Cv(o,l,d),mp(o,l,d,m),d=!0;else if(i===null){var E=o.stateNode,k=o.memoizedProps;E.props=k;var x=E.context,z=l.contextType;typeof z=="object"&&z!==null?z=qn(z):(z=wn(l)?Gs:Xt.current,z=ia(o,z));var J=l.getDerivedStateFromProps,ee=typeof J=="function"||typeof E.getSnapshotBeforeUpdate=="function";ee||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(k!==d||x!==z)&&Rv(o,E,d,z),Qi=!1;var X=o.memoizedState;E.state=X,Xc(o,d,E,m),x=o.memoizedState,k!==d||X!==x||vn.current||Qi?(typeof J=="function"&&(pp(o,l,J,d),x=o.memoizedState),(k=Qi||Sv(o,l,k,d,X,x,z))?(ee||typeof E.UNSAFE_componentWillMount!="function"&&typeof E.componentWillMount!="function"||(typeof E.componentWillMount=="function"&&E.componentWillMount(),typeof E.UNSAFE_componentWillMount=="function"&&E.UNSAFE_componentWillMount()),typeof E.componentDidMount=="function"&&(o.flags|=4194308)):(typeof E.componentDidMount=="function"&&(o.flags|=4194308),o.memoizedProps=d,o.memoizedState=x),E.props=d,E.state=x,E.context=z,d=k):(typeof E.componentDidMount=="function"&&(o.flags|=4194308),d=!1)}else{E=o.stateNode,Zy(i,o),k=o.memoizedProps,z=o.type===o.elementType?k:hr(o.type,k),E.props=z,ee=o.pendingProps,X=E.context,x=l.contextType,typeof x=="object"&&x!==null?x=qn(x):(x=wn(l)?Gs:Xt.current,x=ia(o,x));var ue=l.getDerivedStateFromProps;(J=typeof ue=="function"||typeof E.getSnapshotBeforeUpdate=="function")||typeof E.UNSAFE_componentWillReceiveProps!="function"&&typeof E.componentWillReceiveProps!="function"||(k!==ee||X!==x)&&Rv(o,E,d,x),Qi=!1,X=o.memoizedState,E.state=X,Xc(o,d,E,m);var fe=o.memoizedState;k!==ee||X!==fe||vn.current||Qi?(typeof ue=="function"&&(pp(o,l,ue,d),fe=o.memoizedState),(z=Qi||Sv(o,l,z,d,X,fe,x)||!1)?(J||typeof E.UNSAFE_componentWillUpdate!="function"&&typeof E.componentWillUpdate!="function"||(typeof E.componentWillUpdate=="function"&&E.componentWillUpdate(d,fe,x),typeof E.UNSAFE_componentWillUpdate=="function"&&E.UNSAFE_componentWillUpdate(d,fe,x)),typeof E.componentDidUpdate=="function"&&(o.flags|=4),typeof E.getSnapshotBeforeUpdate=="function"&&(o.flags|=1024)):(typeof E.componentDidUpdate!="function"||k===i.memoizedProps&&X===i.memoizedState||(o.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||k===i.memoizedProps&&X===i.memoizedState||(o.flags|=1024),o.memoizedProps=d,o.memoizedState=fe),E.props=d,E.state=fe,E.context=x,d=z):(typeof E.componentDidUpdate!="function"||k===i.memoizedProps&&X===i.memoizedState||(o.flags|=4),typeof E.getSnapshotBeforeUpdate!="function"||k===i.memoizedProps&&X===i.memoizedState||(o.flags|=1024),d=!1)}return vp(i,o,l,d,_,m)}function vp(i,o,l,d,m,_){Mv(i,o);var E=(o.flags&128)!==0;if(!d&&!E)return m&&zy(o,l,!1),hi(i,o,_);d=o.stateNode,aC.current=o;var k=E&&typeof l.getDerivedStateFromError!="function"?null:d.render();return o.flags|=1,i!==null&&E?(o.child=la(o,i.child,null,_),o.child=la(o,null,k,_)):cn(i,o,k,_),o.memoizedState=d.state,m&&zy(o,l,!0),o.child}function Fv(i){var o=i.stateNode;o.pendingContext?jy(i,o.pendingContext,o.pendingContext!==o.context):o.context&&jy(i,o.context,!1),np(i,o.containerInfo)}function Uv(i,o,l,d,m){return aa(),Qf(m),o.flags|=256,cn(i,o,l,d),o.child}var wp={dehydrated:null,treeContext:null,retryLane:0};function Ep(i){return{baseLanes:i,cachePool:null,transitions:null}}function jv(i,o,l){var d=o.pendingProps,m=ht.current,_=!1,E=(o.flags&128)!==0,k;if((k=E)||(k=i!==null&&i.memoizedState===null?!1:(m&2)!==0),k?(_=!0,o.flags&=-129):(i===null||i.memoizedState!==null)&&(m|=1),tt(ht,m&1),i===null)return Kf(o),i=o.memoizedState,i!==null&&(i=i.dehydrated,i!==null)?((o.mode&1)===0?o.lanes=1:i.data==="$!"?o.lanes=8:o.lanes=1073741824,null):(E=d.children,i=d.fallback,_?(d=o.mode,_=o.child,E={mode:"hidden",children:E},(d&1)===0&&_!==null?(_.childLanes=0,_.pendingProps=E):_=yh(E,d,0,null),i=ro(i,d,l,null),_.return=o,i.return=o,_.sibling=i,o.child=_,o.child.memoizedState=Ep(l),o.memoizedState=wp,i):Tp(o,E));if(m=i.memoizedState,m!==null&&(k=m.dehydrated,k!==null))return lC(i,o,E,d,k,m,l);if(_){_=d.fallback,E=o.mode,m=i.child,k=m.sibling;var x={mode:"hidden",children:d.children};return(E&1)===0&&o.child!==m?(d=o.child,d.childLanes=0,d.pendingProps=x,o.deletions=null):(d=ns(m,x),d.subtreeFlags=m.subtreeFlags&14680064),k!==null?_=ns(k,_):(_=ro(_,E,l,null),_.flags|=2),_.return=o,d.return=o,d.sibling=_,o.child=d,d=_,_=o.child,E=i.child.memoizedState,E=E===null?Ep(l):{baseLanes:E.baseLanes|l,cachePool:null,transitions:E.transitions},_.memoizedState=E,_.childLanes=i.childLanes&~l,o.memoizedState=wp,d}return _=i.child,i=_.sibling,d=ns(_,{mode:"visible",children:d.children}),(o.mode&1)===0&&(d.lanes=l),d.return=o,d.sibling=null,i!==null&&(l=o.deletions,l===null?(o.deletions=[i],o.flags|=16):l.push(i)),o.child=d,o.memoizedState=null,d}function Tp(i,o){return o=yh({mode:"visible",children:o},i.mode,0,null),o.return=i,i.child=o}function sh(i,o,l,d){return d!==null&&Qf(d),la(o,i.child,null,l),i=Tp(o,o.pendingProps.children),i.flags|=2,o.memoizedState=null,i}function lC(i,o,l,d,m,_,E){if(l)return o.flags&256?(o.flags&=-257,d=gp(Error(t(422))),sh(i,o,E,d)):o.memoizedState!==null?(o.child=i.child,o.flags|=128,null):(_=d.fallback,m=o.mode,d=yh({mode:"visible",children:d.children},m,0,null),_=ro(_,m,E,null),_.flags|=2,d.return=o,_.return=o,d.sibling=_,o.child=d,(o.mode&1)!==0&&la(o,i.child,null,E),o.child.memoizedState=Ep(E),o.memoizedState=wp,_);if((o.mode&1)===0)return sh(i,o,E,null);if(m.data==="$!"){if(d=m.nextSibling&&m.nextSibling.dataset,d)var k=d.dgst;return d=k,_=Error(t(419)),d=gp(_,d,void 0),sh(i,o,E,d)}if(k=(E&i.childLanes)!==0,En||k){if(d=Vt,d!==null){switch(E&-E){case 4:m=2;break;case 16:m=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:m=32;break;case 536870912:m=268435456;break;default:m=0}m=(m&(d.suspendedLanes|E))!==0?0:m,m!==0&&m!==_.retryLane&&(_.retryLane=m,ui(i,m),pr(d,i,m,-1))}return Fp(),d=gp(Error(t(421))),sh(i,o,E,d)}return m.data==="$?"?(o.flags|=128,o.child=i.child,o=EC.bind(null,i),m._reactRetry=o,null):(i=_.treeContext,Vn=Hi(m.nextSibling),Mn=o,ut=!0,cr=null,i!==null&&($n[Hn++]=ai,$n[Hn++]=li,$n[Hn++]=Ks,ai=i.id,li=i.overflow,Ks=o),o=Tp(o,d.children),o.flags|=4096,o)}function Bv(i,o,l){i.lanes|=o;var d=i.alternate;d!==null&&(d.lanes|=o),Zf(i.return,o,l)}function Ip(i,o,l,d,m){var _=i.memoizedState;_===null?i.memoizedState={isBackwards:o,rendering:null,renderingStartTime:0,last:d,tail:l,tailMode:m}:(_.isBackwards=o,_.rendering=null,_.renderingStartTime=0,_.last=d,_.tail=l,_.tailMode=m)}function zv(i,o,l){var d=o.pendingProps,m=d.revealOrder,_=d.tail;if(cn(i,o,d.children,l),d=ht.current,(d&2)!==0)d=d&1|2,o.flags|=128;else{if(i!==null&&(i.flags&128)!==0)e:for(i=o.child;i!==null;){if(i.tag===13)i.memoizedState!==null&&Bv(i,l,o);else if(i.tag===19)Bv(i,l,o);else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===o)break e;for(;i.sibling===null;){if(i.return===null||i.return===o)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}d&=1}if(tt(ht,d),(o.mode&1)===0)o.memoizedState=null;else switch(m){case"forwards":for(l=o.child,m=null;l!==null;)i=l.alternate,i!==null&&Jc(i)===null&&(m=l),l=l.sibling;l=m,l===null?(m=o.child,o.child=null):(m=l.sibling,l.sibling=null),Ip(o,!1,m,l,_);break;case"backwards":for(l=null,m=o.child,o.child=null;m!==null;){if(i=m.alternate,i!==null&&Jc(i)===null){o.child=m;break}i=m.sibling,m.sibling=l,l=m,m=i}Ip(o,!0,l,null,_);break;case"together":Ip(o,!1,null,null,void 0);break;default:o.memoizedState=null}return o.child}function oh(i,o){(o.mode&1)===0&&i!==null&&(i.alternate=null,o.alternate=null,o.flags|=2)}function hi(i,o,l){if(i!==null&&(o.dependencies=i.dependencies),Zs|=o.lanes,(l&o.childLanes)===0)return null;if(i!==null&&o.child!==i.child)throw Error(t(153));if(o.child!==null){for(i=o.child,l=ns(i,i.pendingProps),o.child=l,l.return=o;i.sibling!==null;)i=i.sibling,l=l.sibling=ns(i,i.pendingProps),l.return=o;l.sibling=null}return o.child}function uC(i,o,l){switch(o.tag){case 3:Fv(o),aa();break;case 5:nv(o);break;case 1:wn(o.type)&&zc(o);break;case 4:np(o,o.stateNode.containerInfo);break;case 10:var d=o.type._context,m=o.memoizedProps.value;tt(Kc,d._currentValue),d._currentValue=m;break;case 13:if(d=o.memoizedState,d!==null)return d.dehydrated!==null?(tt(ht,ht.current&1),o.flags|=128,null):(l&o.child.childLanes)!==0?jv(i,o,l):(tt(ht,ht.current&1),i=hi(i,o,l),i!==null?i.sibling:null);tt(ht,ht.current&1);break;case 19:if(d=(l&o.childLanes)!==0,(i.flags&128)!==0){if(d)return zv(i,o,l);o.flags|=128}if(m=o.memoizedState,m!==null&&(m.rendering=null,m.tail=null,m.lastEffect=null),tt(ht,ht.current),d)break;return null;case 22:case 23:return o.lanes=0,Lv(i,o,l)}return hi(i,o,l)}var Wv,Sp,$v,Hv;Wv=function(i,o){for(var l=o.child;l!==null;){if(l.tag===5||l.tag===6)i.appendChild(l.stateNode);else if(l.tag!==4&&l.child!==null){l.child.return=l,l=l.child;continue}if(l===o)break;for(;l.sibling===null;){if(l.return===null||l.return===o)return;l=l.return}l.sibling.return=l.return,l=l.sibling}},Sp=function(){},$v=function(i,o,l,d){var m=i.memoizedProps;if(m!==d){i=o.stateNode,Xs(Or.current);var _=null;switch(l){case"input":m=Ns(i,m),d=Ns(i,d),_=[];break;case"select":m=ae({},m,{value:void 0}),d=ae({},d,{value:void 0}),_=[];break;case"textarea":m=ll(i,m),d=ll(i,d),_=[];break;default:typeof m.onClick!="function"&&typeof d.onClick=="function"&&(i.onclick=Uc)}pl(l,d);var E;l=null;for(z in m)if(!d.hasOwnProperty(z)&&m.hasOwnProperty(z)&&m[z]!=null)if(z==="style"){var k=m[z];for(E in k)k.hasOwnProperty(E)&&(l||(l={}),l[E]="")}else z!=="dangerouslySetInnerHTML"&&z!=="children"&&z!=="suppressContentEditableWarning"&&z!=="suppressHydrationWarning"&&z!=="autoFocus"&&(s.hasOwnProperty(z)?_||(_=[]):(_=_||[]).push(z,null));for(z in d){var x=d[z];if(k=m!=null?m[z]:void 0,d.hasOwnProperty(z)&&x!==k&&(x!=null||k!=null))if(z==="style")if(k){for(E in k)!k.hasOwnProperty(E)||x&&x.hasOwnProperty(E)||(l||(l={}),l[E]="");for(E in x)x.hasOwnProperty(E)&&k[E]!==x[E]&&(l||(l={}),l[E]=x[E])}else l||(_||(_=[]),_.push(z,l)),l=x;else z==="dangerouslySetInnerHTML"?(x=x?x.__html:void 0,k=k?k.__html:void 0,x!=null&&k!==x&&(_=_||[]).push(z,x)):z==="children"?typeof x!="string"&&typeof x!="number"||(_=_||[]).push(z,""+x):z!=="suppressContentEditableWarning"&&z!=="suppressHydrationWarning"&&(s.hasOwnProperty(z)?(x!=null&&z==="onScroll"&&st("scroll",i),_||k===x||(_=[])):(_=_||[]).push(z,x))}l&&(_=_||[]).push("style",l);var z=_;(o.updateQueue=z)&&(o.flags|=4)}},Hv=function(i,o,l,d){l!==d&&(o.flags|=4)};function Kl(i,o){if(!ut)switch(i.tailMode){case"hidden":o=i.tail;for(var l=null;o!==null;)o.alternate!==null&&(l=o),o=o.sibling;l===null?i.tail=null:l.sibling=null;break;case"collapsed":l=i.tail;for(var d=null;l!==null;)l.alternate!==null&&(d=l),l=l.sibling;d===null?o||i.tail===null?i.tail=null:i.tail.sibling=null:d.sibling=null}}function Zt(i){var o=i.alternate!==null&&i.alternate.child===i.child,l=0,d=0;if(o)for(var m=i.child;m!==null;)l|=m.lanes|m.childLanes,d|=m.subtreeFlags&14680064,d|=m.flags&14680064,m.return=i,m=m.sibling;else for(m=i.child;m!==null;)l|=m.lanes|m.childLanes,d|=m.subtreeFlags,d|=m.flags,m.return=i,m=m.sibling;return i.subtreeFlags|=d,i.childLanes=l,o}function cC(i,o,l){var d=o.pendingProps;switch(qf(o),o.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Zt(o),null;case 1:return wn(o.type)&&Bc(),Zt(o),null;case 3:return d=o.stateNode,ha(),ot(vn),ot(Xt),sp(),d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null),(i===null||i.child===null)&&(qc(o)?o.flags|=4:i===null||i.memoizedState.isDehydrated&&(o.flags&256)===0||(o.flags|=1024,cr!==null&&(Lp(cr),cr=null))),Sp(i,o),Zt(o),null;case 5:rp(o);var m=Xs(Wl.current);if(l=o.type,i!==null&&o.stateNode!=null)$v(i,o,l,d,m),i.ref!==o.ref&&(o.flags|=512,o.flags|=2097152);else{if(!d){if(o.stateNode===null)throw Error(t(166));return Zt(o),null}if(i=Xs(Or.current),qc(o)){d=o.stateNode,l=o.type;var _=o.memoizedProps;switch(d[xr]=o,d[Fl]=_,i=(o.mode&1)!==0,l){case"dialog":st("cancel",d),st("close",d);break;case"iframe":case"object":case"embed":st("load",d);break;case"video":case"audio":for(m=0;m<Ll.length;m++)st(Ll[m],d);break;case"source":st("error",d);break;case"img":case"image":case"link":st("error",d),st("load",d);break;case"details":st("toggle",d);break;case"input":Ro(d,_),st("invalid",d);break;case"select":d._wrapperState={wasMultiple:!!_.multiple},st("invalid",d);break;case"textarea":Ao(d,_),st("invalid",d)}pl(l,_),m=null;for(var E in _)if(_.hasOwnProperty(E)){var k=_[E];E==="children"?typeof k=="string"?d.textContent!==k&&(_.suppressHydrationWarning!==!0&&Fc(d.textContent,k,i),m=["children",k]):typeof k=="number"&&d.textContent!==""+k&&(_.suppressHydrationWarning!==!0&&Fc(d.textContent,k,i),m=["children",""+k]):s.hasOwnProperty(E)&&k!=null&&E==="onScroll"&&st("scroll",d)}switch(l){case"input":Qr(d),cc(d,_,!0);break;case"textarea":Qr(d),ul(d);break;case"select":case"option":break;default:typeof _.onClick=="function"&&(d.onclick=Uc)}d=m,o.updateQueue=d,d!==null&&(o.flags|=4)}else{E=m.nodeType===9?m:m.ownerDocument,i==="http://www.w3.org/1999/xhtml"&&(i=Rt(l)),i==="http://www.w3.org/1999/xhtml"?l==="script"?(i=E.createElement("div"),i.innerHTML="<script><\/script>",i=i.removeChild(i.firstChild)):typeof d.is=="string"?i=E.createElement(l,{is:d.is}):(i=E.createElement(l),l==="select"&&(E=i,d.multiple?E.multiple=!0:d.size&&(E.size=d.size))):i=E.createElementNS(i,l),i[xr]=o,i[Fl]=d,Wv(i,o,!1,!1),o.stateNode=i;e:{switch(E=ml(l,d),l){case"dialog":st("cancel",i),st("close",i),m=d;break;case"iframe":case"object":case"embed":st("load",i),m=d;break;case"video":case"audio":for(m=0;m<Ll.length;m++)st(Ll[m],i);m=d;break;case"source":st("error",i),m=d;break;case"img":case"image":case"link":st("error",i),st("load",i),m=d;break;case"details":st("toggle",i),m=d;break;case"input":Ro(i,d),m=Ns(i,d),st("invalid",i);break;case"option":m=d;break;case"select":i._wrapperState={wasMultiple:!!d.multiple},m=ae({},d,{value:void 0}),st("invalid",i);break;case"textarea":Ao(i,d),m=ll(i,d),st("invalid",i);break;default:m=d}pl(l,m),k=m;for(_ in k)if(k.hasOwnProperty(_)){var x=k[_];_==="style"?dl(i,x):_==="dangerouslySetInnerHTML"?(x=x?x.__html:void 0,x!=null&&cl(i,x)):_==="children"?typeof x=="string"?(l!=="textarea"||x!=="")&&bi(i,x):typeof x=="number"&&bi(i,""+x):_!=="suppressContentEditableWarning"&&_!=="suppressHydrationWarning"&&_!=="autoFocus"&&(s.hasOwnProperty(_)?x!=null&&_==="onScroll"&&st("scroll",i):x!=null&&K(i,_,x,E))}switch(l){case"input":Qr(i),cc(i,d,!1);break;case"textarea":Qr(i),ul(i);break;case"option":d.value!=null&&i.setAttribute("value",""+He(d.value));break;case"select":i.multiple=!!d.multiple,_=d.value,_!=null?Xr(i,!!d.multiple,_,!1):d.defaultValue!=null&&Xr(i,!!d.multiple,d.defaultValue,!0);break;default:typeof m.onClick=="function"&&(i.onclick=Uc)}switch(l){case"button":case"input":case"select":case"textarea":d=!!d.autoFocus;break e;case"img":d=!0;break e;default:d=!1}}d&&(o.flags|=4)}o.ref!==null&&(o.flags|=512,o.flags|=2097152)}return Zt(o),null;case 6:if(i&&o.stateNode!=null)Hv(i,o,i.memoizedProps,d);else{if(typeof d!="string"&&o.stateNode===null)throw Error(t(166));if(l=Xs(Wl.current),Xs(Or.current),qc(o)){if(d=o.stateNode,l=o.memoizedProps,d[xr]=o,(_=d.nodeValue!==l)&&(i=Mn,i!==null))switch(i.tag){case 3:Fc(d.nodeValue,l,(i.mode&1)!==0);break;case 5:i.memoizedProps.suppressHydrationWarning!==!0&&Fc(d.nodeValue,l,(i.mode&1)!==0)}_&&(o.flags|=4)}else d=(l.nodeType===9?l:l.ownerDocument).createTextNode(d),d[xr]=o,o.stateNode=d}return Zt(o),null;case 13:if(ot(ht),d=o.memoizedState,i===null||i.memoizedState!==null&&i.memoizedState.dehydrated!==null){if(ut&&Vn!==null&&(o.mode&1)!==0&&(o.flags&128)===0)Ky(),aa(),o.flags|=98560,_=!1;else if(_=qc(o),d!==null&&d.dehydrated!==null){if(i===null){if(!_)throw Error(t(318));if(_=o.memoizedState,_=_!==null?_.dehydrated:null,!_)throw Error(t(317));_[xr]=o}else aa(),(o.flags&128)===0&&(o.memoizedState=null),o.flags|=4;Zt(o),_=!1}else cr!==null&&(Lp(cr),cr=null),_=!0;if(!_)return o.flags&65536?o:null}return(o.flags&128)!==0?(o.lanes=l,o):(d=d!==null,d!==(i!==null&&i.memoizedState!==null)&&d&&(o.child.flags|=8192,(o.mode&1)!==0&&(i===null||(ht.current&1)!==0?Nt===0&&(Nt=3):Fp())),o.updateQueue!==null&&(o.flags|=4),Zt(o),null);case 4:return ha(),Sp(i,o),i===null&&Ml(o.stateNode.containerInfo),Zt(o),null;case 10:return Jf(o.type._context),Zt(o),null;case 17:return wn(o.type)&&Bc(),Zt(o),null;case 19:if(ot(ht),_=o.memoizedState,_===null)return Zt(o),null;if(d=(o.flags&128)!==0,E=_.rendering,E===null)if(d)Kl(_,!1);else{if(Nt!==0||i!==null&&(i.flags&128)!==0)for(i=o.child;i!==null;){if(E=Jc(i),E!==null){for(o.flags|=128,Kl(_,!1),d=E.updateQueue,d!==null&&(o.updateQueue=d,o.flags|=4),o.subtreeFlags=0,d=l,l=o.child;l!==null;)_=l,i=d,_.flags&=14680066,E=_.alternate,E===null?(_.childLanes=0,_.lanes=i,_.child=null,_.subtreeFlags=0,_.memoizedProps=null,_.memoizedState=null,_.updateQueue=null,_.dependencies=null,_.stateNode=null):(_.childLanes=E.childLanes,_.lanes=E.lanes,_.child=E.child,_.subtreeFlags=0,_.deletions=null,_.memoizedProps=E.memoizedProps,_.memoizedState=E.memoizedState,_.updateQueue=E.updateQueue,_.type=E.type,i=E.dependencies,_.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext}),l=l.sibling;return tt(ht,ht.current&1|2),o.child}i=i.sibling}_.tail!==null&&et()>ma&&(o.flags|=128,d=!0,Kl(_,!1),o.lanes=4194304)}else{if(!d)if(i=Jc(E),i!==null){if(o.flags|=128,d=!0,l=i.updateQueue,l!==null&&(o.updateQueue=l,o.flags|=4),Kl(_,!0),_.tail===null&&_.tailMode==="hidden"&&!E.alternate&&!ut)return Zt(o),null}else 2*et()-_.renderingStartTime>ma&&l!==1073741824&&(o.flags|=128,d=!0,Kl(_,!1),o.lanes=4194304);_.isBackwards?(E.sibling=o.child,o.child=E):(l=_.last,l!==null?l.sibling=E:o.child=E,_.last=E)}return _.tail!==null?(o=_.tail,_.rendering=o,_.tail=o.sibling,_.renderingStartTime=et(),o.sibling=null,l=ht.current,tt(ht,d?l&1|2:l&1),o):(Zt(o),null);case 22:case 23:return Vp(),d=o.memoizedState!==null,i!==null&&i.memoizedState!==null!==d&&(o.flags|=8192),d&&(o.mode&1)!==0?(Fn&1073741824)!==0&&(Zt(o),o.subtreeFlags&6&&(o.flags|=8192)):Zt(o),null;case 24:return null;case 25:return null}throw Error(t(156,o.tag))}function hC(i,o){switch(qf(o),o.tag){case 1:return wn(o.type)&&Bc(),i=o.flags,i&65536?(o.flags=i&-65537|128,o):null;case 3:return ha(),ot(vn),ot(Xt),sp(),i=o.flags,(i&65536)!==0&&(i&128)===0?(o.flags=i&-65537|128,o):null;case 5:return rp(o),null;case 13:if(ot(ht),i=o.memoizedState,i!==null&&i.dehydrated!==null){if(o.alternate===null)throw Error(t(340));aa()}return i=o.flags,i&65536?(o.flags=i&-65537|128,o):null;case 19:return ot(ht),null;case 4:return ha(),null;case 10:return Jf(o.type._context),null;case 22:case 23:return Vp(),null;case 24:return null;default:return null}}var ah=!1,en=!1,dC=typeof WeakSet=="function"?WeakSet:Set,he=null;function fa(i,o){var l=i.ref;if(l!==null)if(typeof l=="function")try{l(null)}catch(d){ft(i,o,d)}else l.current=null}function Cp(i,o,l){try{l()}catch(d){ft(i,o,d)}}var qv=!1;function fC(i,o){if(Vf=zi,i=Sy(),Pf(i)){if("selectionStart"in i)var l={start:i.selectionStart,end:i.selectionEnd};else e:{l=(l=i.ownerDocument)&&l.defaultView||window;var d=l.getSelection&&l.getSelection();if(d&&d.rangeCount!==0){l=d.anchorNode;var m=d.anchorOffset,_=d.focusNode;d=d.focusOffset;try{l.nodeType,_.nodeType}catch{l=null;break e}var E=0,k=-1,x=-1,z=0,J=0,ee=i,X=null;t:for(;;){for(var ue;ee!==l||m!==0&&ee.nodeType!==3||(k=E+m),ee!==_||d!==0&&ee.nodeType!==3||(x=E+d),ee.nodeType===3&&(E+=ee.nodeValue.length),(ue=ee.firstChild)!==null;)X=ee,ee=ue;for(;;){if(ee===i)break t;if(X===l&&++z===m&&(k=E),X===_&&++J===d&&(x=E),(ue=ee.nextSibling)!==null)break;ee=X,X=ee.parentNode}ee=ue}l=k===-1||x===-1?null:{start:k,end:x}}else l=null}l=l||{start:0,end:0}}else l=null;for(Ff={focusedElem:i,selectionRange:l},zi=!1,he=o;he!==null;)if(o=he,i=o.child,(o.subtreeFlags&1028)!==0&&i!==null)i.return=o,he=i;else for(;he!==null;){o=he;try{var fe=o.alternate;if((o.flags&1024)!==0)switch(o.tag){case 0:case 11:case 15:break;case 1:if(fe!==null){var pe=fe.memoizedProps,yt=fe.memoizedState,j=o.stateNode,L=j.getSnapshotBeforeUpdate(o.elementType===o.type?pe:hr(o.type,pe),yt);j.__reactInternalSnapshotBeforeUpdate=L}break;case 3:var B=o.stateNode.containerInfo;B.nodeType===1?B.textContent="":B.nodeType===9&&B.documentElement&&B.removeChild(B.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(te){ft(o,o.return,te)}if(i=o.sibling,i!==null){i.return=o.return,he=i;break}he=o.return}return fe=qv,qv=!1,fe}function Ql(i,o,l){var d=o.updateQueue;if(d=d!==null?d.lastEffect:null,d!==null){var m=d=d.next;do{if((m.tag&i)===i){var _=m.destroy;m.destroy=void 0,_!==void 0&&Cp(o,l,_)}m=m.next}while(m!==d)}}function lh(i,o){if(o=o.updateQueue,o=o!==null?o.lastEffect:null,o!==null){var l=o=o.next;do{if((l.tag&i)===i){var d=l.create;l.destroy=d()}l=l.next}while(l!==o)}}function Rp(i){var o=i.ref;if(o!==null){var l=i.stateNode;switch(i.tag){case 5:i=l;break;default:i=l}typeof o=="function"?o(i):o.current=i}}function Gv(i){var o=i.alternate;o!==null&&(i.alternate=null,Gv(o)),i.child=null,i.deletions=null,i.sibling=null,i.tag===5&&(o=i.stateNode,o!==null&&(delete o[xr],delete o[Fl],delete o[zf],delete o[QS],delete o[YS])),i.stateNode=null,i.return=null,i.dependencies=null,i.memoizedProps=null,i.memoizedState=null,i.pendingProps=null,i.stateNode=null,i.updateQueue=null}function Kv(i){return i.tag===5||i.tag===3||i.tag===4}function Qv(i){e:for(;;){for(;i.sibling===null;){if(i.return===null||Kv(i.return))return null;i=i.return}for(i.sibling.return=i.return,i=i.sibling;i.tag!==5&&i.tag!==6&&i.tag!==18;){if(i.flags&2||i.child===null||i.tag===4)continue e;i.child.return=i,i=i.child}if(!(i.flags&2))return i.stateNode}}function kp(i,o,l){var d=i.tag;if(d===5||d===6)i=i.stateNode,o?l.nodeType===8?l.parentNode.insertBefore(i,o):l.insertBefore(i,o):(l.nodeType===8?(o=l.parentNode,o.insertBefore(i,l)):(o=l,o.appendChild(i)),l=l._reactRootContainer,l!=null||o.onclick!==null||(o.onclick=Uc));else if(d!==4&&(i=i.child,i!==null))for(kp(i,o,l),i=i.sibling;i!==null;)kp(i,o,l),i=i.sibling}function Ap(i,o,l){var d=i.tag;if(d===5||d===6)i=i.stateNode,o?l.insertBefore(i,o):l.appendChild(i);else if(d!==4&&(i=i.child,i!==null))for(Ap(i,o,l),i=i.sibling;i!==null;)Ap(i,o,l),i=i.sibling}var Ht=null,dr=!1;function Xi(i,o,l){for(l=l.child;l!==null;)Yv(i,o,l),l=l.sibling}function Yv(i,o,l){if(On&&typeof On.onCommitFiberUnmount=="function")try{On.onCommitFiberUnmount(Us,l)}catch{}switch(l.tag){case 5:en||fa(l,o);case 6:var d=Ht,m=dr;Ht=null,Xi(i,o,l),Ht=d,dr=m,Ht!==null&&(dr?(i=Ht,l=l.stateNode,i.nodeType===8?i.parentNode.removeChild(l):i.removeChild(l)):Ht.removeChild(l.stateNode));break;case 18:Ht!==null&&(dr?(i=Ht,l=l.stateNode,i.nodeType===8?Bf(i.parentNode,l):i.nodeType===1&&Bf(i,l),ar(i)):Bf(Ht,l.stateNode));break;case 4:d=Ht,m=dr,Ht=l.stateNode.containerInfo,dr=!0,Xi(i,o,l),Ht=d,dr=m;break;case 0:case 11:case 14:case 15:if(!en&&(d=l.updateQueue,d!==null&&(d=d.lastEffect,d!==null))){m=d=d.next;do{var _=m,E=_.destroy;_=_.tag,E!==void 0&&((_&2)!==0||(_&4)!==0)&&Cp(l,o,E),m=m.next}while(m!==d)}Xi(i,o,l);break;case 1:if(!en&&(fa(l,o),d=l.stateNode,typeof d.componentWillUnmount=="function"))try{d.props=l.memoizedProps,d.state=l.memoizedState,d.componentWillUnmount()}catch(k){ft(l,o,k)}Xi(i,o,l);break;case 21:Xi(i,o,l);break;case 22:l.mode&1?(en=(d=en)||l.memoizedState!==null,Xi(i,o,l),en=d):Xi(i,o,l);break;default:Xi(i,o,l)}}function Xv(i){var o=i.updateQueue;if(o!==null){i.updateQueue=null;var l=i.stateNode;l===null&&(l=i.stateNode=new dC),o.forEach(function(d){var m=TC.bind(null,i,d);l.has(d)||(l.add(d),d.then(m,m))})}}function fr(i,o){var l=o.deletions;if(l!==null)for(var d=0;d<l.length;d++){var m=l[d];try{var _=i,E=o,k=E;e:for(;k!==null;){switch(k.tag){case 5:Ht=k.stateNode,dr=!1;break e;case 3:Ht=k.stateNode.containerInfo,dr=!0;break e;case 4:Ht=k.stateNode.containerInfo,dr=!0;break e}k=k.return}if(Ht===null)throw Error(t(160));Yv(_,E,m),Ht=null,dr=!1;var x=m.alternate;x!==null&&(x.return=null),m.return=null}catch(z){ft(m,o,z)}}if(o.subtreeFlags&12854)for(o=o.child;o!==null;)Jv(o,i),o=o.sibling}function Jv(i,o){var l=i.alternate,d=i.flags;switch(i.tag){case 0:case 11:case 14:case 15:if(fr(o,i),br(i),d&4){try{Ql(3,i,i.return),lh(3,i)}catch(pe){ft(i,i.return,pe)}try{Ql(5,i,i.return)}catch(pe){ft(i,i.return,pe)}}break;case 1:fr(o,i),br(i),d&512&&l!==null&&fa(l,l.return);break;case 5:if(fr(o,i),br(i),d&512&&l!==null&&fa(l,l.return),i.flags&32){var m=i.stateNode;try{bi(m,"")}catch(pe){ft(i,i.return,pe)}}if(d&4&&(m=i.stateNode,m!=null)){var _=i.memoizedProps,E=l!==null?l.memoizedProps:_,k=i.type,x=i.updateQueue;if(i.updateQueue=null,x!==null)try{k==="input"&&_.type==="radio"&&_.name!=null&&ol(m,_),ml(k,E);var z=ml(k,_);for(E=0;E<x.length;E+=2){var J=x[E],ee=x[E+1];J==="style"?dl(m,ee):J==="dangerouslySetInnerHTML"?cl(m,ee):J==="children"?bi(m,ee):K(m,J,ee,z)}switch(k){case"input":al(m,_);break;case"textarea":Po(m,_);break;case"select":var X=m._wrapperState.wasMultiple;m._wrapperState.wasMultiple=!!_.multiple;var ue=_.value;ue!=null?Xr(m,!!_.multiple,ue,!1):X!==!!_.multiple&&(_.defaultValue!=null?Xr(m,!!_.multiple,_.defaultValue,!0):Xr(m,!!_.multiple,_.multiple?[]:"",!1))}m[Fl]=_}catch(pe){ft(i,i.return,pe)}}break;case 6:if(fr(o,i),br(i),d&4){if(i.stateNode===null)throw Error(t(162));m=i.stateNode,_=i.memoizedProps;try{m.nodeValue=_}catch(pe){ft(i,i.return,pe)}}break;case 3:if(fr(o,i),br(i),d&4&&l!==null&&l.memoizedState.isDehydrated)try{ar(o.containerInfo)}catch(pe){ft(i,i.return,pe)}break;case 4:fr(o,i),br(i);break;case 13:fr(o,i),br(i),m=i.child,m.flags&8192&&(_=m.memoizedState!==null,m.stateNode.isHidden=_,!_||m.alternate!==null&&m.alternate.memoizedState!==null||(xp=et())),d&4&&Xv(i);break;case 22:if(J=l!==null&&l.memoizedState!==null,i.mode&1?(en=(z=en)||J,fr(o,i),en=z):fr(o,i),br(i),d&8192){if(z=i.memoizedState!==null,(i.stateNode.isHidden=z)&&!J&&(i.mode&1)!==0)for(he=i,J=i.child;J!==null;){for(ee=he=J;he!==null;){switch(X=he,ue=X.child,X.tag){case 0:case 11:case 14:case 15:Ql(4,X,X.return);break;case 1:fa(X,X.return);var fe=X.stateNode;if(typeof fe.componentWillUnmount=="function"){d=X,l=X.return;try{o=d,fe.props=o.memoizedProps,fe.state=o.memoizedState,fe.componentWillUnmount()}catch(pe){ft(d,l,pe)}}break;case 5:fa(X,X.return);break;case 22:if(X.memoizedState!==null){t0(ee);continue}}ue!==null?(ue.return=X,he=ue):t0(ee)}J=J.sibling}e:for(J=null,ee=i;;){if(ee.tag===5){if(J===null){J=ee;try{m=ee.stateNode,z?(_=m.style,typeof _.setProperty=="function"?_.setProperty("display","none","important"):_.display="none"):(k=ee.stateNode,x=ee.memoizedProps.style,E=x!=null&&x.hasOwnProperty("display")?x.display:null,k.style.display=hl("display",E))}catch(pe){ft(i,i.return,pe)}}}else if(ee.tag===6){if(J===null)try{ee.stateNode.nodeValue=z?"":ee.memoizedProps}catch(pe){ft(i,i.return,pe)}}else if((ee.tag!==22&&ee.tag!==23||ee.memoizedState===null||ee===i)&&ee.child!==null){ee.child.return=ee,ee=ee.child;continue}if(ee===i)break e;for(;ee.sibling===null;){if(ee.return===null||ee.return===i)break e;J===ee&&(J=null),ee=ee.return}J===ee&&(J=null),ee.sibling.return=ee.return,ee=ee.sibling}}break;case 19:fr(o,i),br(i),d&4&&Xv(i);break;case 21:break;default:fr(o,i),br(i)}}function br(i){var o=i.flags;if(o&2){try{e:{for(var l=i.return;l!==null;){if(Kv(l)){var d=l;break e}l=l.return}throw Error(t(160))}switch(d.tag){case 5:var m=d.stateNode;d.flags&32&&(bi(m,""),d.flags&=-33);var _=Qv(i);Ap(i,_,m);break;case 3:case 4:var E=d.stateNode.containerInfo,k=Qv(i);kp(i,k,E);break;default:throw Error(t(161))}}catch(x){ft(i,i.return,x)}i.flags&=-3}o&4096&&(i.flags&=-4097)}function pC(i,o,l){he=i,Zv(i)}function Zv(i,o,l){for(var d=(i.mode&1)!==0;he!==null;){var m=he,_=m.child;if(m.tag===22&&d){var E=m.memoizedState!==null||ah;if(!E){var k=m.alternate,x=k!==null&&k.memoizedState!==null||en;k=ah;var z=en;if(ah=E,(en=x)&&!z)for(he=m;he!==null;)E=he,x=E.child,E.tag===22&&E.memoizedState!==null?n0(m):x!==null?(x.return=E,he=x):n0(m);for(;_!==null;)he=_,Zv(_),_=_.sibling;he=m,ah=k,en=z}e0(i)}else(m.subtreeFlags&8772)!==0&&_!==null?(_.return=m,he=_):e0(i)}}function e0(i){for(;he!==null;){var o=he;if((o.flags&8772)!==0){var l=o.alternate;try{if((o.flags&8772)!==0)switch(o.tag){case 0:case 11:case 15:en||lh(5,o);break;case 1:var d=o.stateNode;if(o.flags&4&&!en)if(l===null)d.componentDidMount();else{var m=o.elementType===o.type?l.memoizedProps:hr(o.type,l.memoizedProps);d.componentDidUpdate(m,l.memoizedState,d.__reactInternalSnapshotBeforeUpdate)}var _=o.updateQueue;_!==null&&tv(o,_,d);break;case 3:var E=o.updateQueue;if(E!==null){if(l=null,o.child!==null)switch(o.child.tag){case 5:l=o.child.stateNode;break;case 1:l=o.child.stateNode}tv(o,E,l)}break;case 5:var k=o.stateNode;if(l===null&&o.flags&4){l=k;var x=o.memoizedProps;switch(o.type){case"button":case"input":case"select":case"textarea":x.autoFocus&&l.focus();break;case"img":x.src&&(l.src=x.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(o.memoizedState===null){var z=o.alternate;if(z!==null){var J=z.memoizedState;if(J!==null){var ee=J.dehydrated;ee!==null&&ar(ee)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}en||o.flags&512&&Rp(o)}catch(X){ft(o,o.return,X)}}if(o===i){he=null;break}if(l=o.sibling,l!==null){l.return=o.return,he=l;break}he=o.return}}function t0(i){for(;he!==null;){var o=he;if(o===i){he=null;break}var l=o.sibling;if(l!==null){l.return=o.return,he=l;break}he=o.return}}function n0(i){for(;he!==null;){var o=he;try{switch(o.tag){case 0:case 11:case 15:var l=o.return;try{lh(4,o)}catch(x){ft(o,l,x)}break;case 1:var d=o.stateNode;if(typeof d.componentDidMount=="function"){var m=o.return;try{d.componentDidMount()}catch(x){ft(o,m,x)}}var _=o.return;try{Rp(o)}catch(x){ft(o,_,x)}break;case 5:var E=o.return;try{Rp(o)}catch(x){ft(o,E,x)}}}catch(x){ft(o,o.return,x)}if(o===i){he=null;break}var k=o.sibling;if(k!==null){k.return=o.return,he=k;break}he=o.return}}var mC=Math.ceil,uh=re.ReactCurrentDispatcher,Pp=re.ReactCurrentOwner,Kn=re.ReactCurrentBatchConfig,Be=0,Vt=null,Tt=null,qt=0,Fn=0,pa=qi(0),Nt=0,Yl=null,Zs=0,ch=0,Np=0,Xl=null,Tn=null,xp=0,ma=1/0,di=null,hh=!1,Op=null,Ji=null,dh=!1,Zi=null,fh=0,Jl=0,Dp=null,ph=-1,mh=0;function hn(){return(Be&6)!==0?et():ph!==-1?ph:ph=et()}function es(i){return(i.mode&1)===0?1:(Be&2)!==0&&qt!==0?qt&-qt:JS.transition!==null?(mh===0&&(mh=Bs()),mh):(i=Le,i!==0||(i=window.event,i=i===void 0?16:Rl(i.type)),i)}function pr(i,o,l,d){if(50<Jl)throw Jl=0,Dp=null,Error(t(185));Fi(i,l,d),((Be&2)===0||i!==Vt)&&(i===Vt&&((Be&2)===0&&(ch|=l),Nt===4&&ts(i,qt)),In(i,d),l===1&&Be===0&&(o.mode&1)===0&&(ma=et()+500,Wc&&Ki()))}function In(i,o){var l=i.callbackNode;ei(i,o);var d=js(i,i===Vt?qt:0);if(d===0)l!==null&&El(l),i.callbackNode=null,i.callbackPriority=0;else if(o=d&-d,i.callbackPriority!==o){if(l!=null&&El(l),o===1)i.tag===0?XS(i0.bind(null,i)):Wy(i0.bind(null,i)),GS(function(){(Be&6)===0&&Ki()}),l=null;else{switch(ji(d)){case 1:l=Fs;break;case 4:l=Li;break;case 16:l=Bn;break;case 536870912:l=mc;break;default:l=Bn}l=d0(l,r0.bind(null,i))}i.callbackPriority=o,i.callbackNode=l}}function r0(i,o){if(ph=-1,mh=0,(Be&6)!==0)throw Error(t(327));var l=i.callbackNode;if(ga()&&i.callbackNode!==l)return null;var d=js(i,i===Vt?qt:0);if(d===0)return null;if((d&30)!==0||(d&i.expiredLanes)!==0||o)o=gh(i,d);else{o=d;var m=Be;Be|=2;var _=o0();(Vt!==i||qt!==o)&&(di=null,ma=et()+500,to(i,o));do try{yC();break}catch(k){s0(i,k)}while(!0);Xf(),uh.current=_,Be=m,Tt!==null?o=0:(Vt=null,qt=0,o=Nt)}if(o!==0){if(o===2&&(m=Dn(i),m!==0&&(d=m,o=bp(i,m))),o===1)throw l=Yl,to(i,0),ts(i,d),In(i,et()),l;if(o===6)ts(i,d);else{if(m=i.current.alternate,(d&30)===0&&!gC(m)&&(o=gh(i,d),o===2&&(_=Dn(i),_!==0&&(d=_,o=bp(i,_))),o===1))throw l=Yl,to(i,0),ts(i,d),In(i,et()),l;switch(i.finishedWork=m,i.finishedLanes=d,o){case 0:case 1:throw Error(t(345));case 2:no(i,Tn,di);break;case 3:if(ts(i,d),(d&130023424)===d&&(o=xp+500-et(),10<o)){if(js(i,0)!==0)break;if(m=i.suspendedLanes,(m&d)!==d){hn(),i.pingedLanes|=i.suspendedLanes&m;break}i.timeoutHandle=jf(no.bind(null,i,Tn,di),o);break}no(i,Tn,di);break;case 4:if(ts(i,d),(d&4194240)===d)break;for(o=i.eventTimes,m=-1;0<d;){var E=31-ln(d);_=1<<E,E=o[E],E>m&&(m=E),d&=~_}if(d=m,d=et()-d,d=(120>d?120:480>d?480:1080>d?1080:1920>d?1920:3e3>d?3e3:4320>d?4320:1960*mC(d/1960))-d,10<d){i.timeoutHandle=jf(no.bind(null,i,Tn,di),d);break}no(i,Tn,di);break;case 5:no(i,Tn,di);break;default:throw Error(t(329))}}}return In(i,et()),i.callbackNode===l?r0.bind(null,i):null}function bp(i,o){var l=Xl;return i.current.memoizedState.isDehydrated&&(to(i,o).flags|=256),i=gh(i,o),i!==2&&(o=Tn,Tn=l,o!==null&&Lp(o)),i}function Lp(i){Tn===null?Tn=i:Tn.push.apply(Tn,i)}function gC(i){for(var o=i;;){if(o.flags&16384){var l=o.updateQueue;if(l!==null&&(l=l.stores,l!==null))for(var d=0;d<l.length;d++){var m=l[d],_=m.getSnapshot;m=m.value;try{if(!ur(_(),m))return!1}catch{return!1}}}if(l=o.child,o.subtreeFlags&16384&&l!==null)l.return=o,o=l;else{if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return!0;o=o.return}o.sibling.return=o.return,o=o.sibling}}return!0}function ts(i,o){for(o&=~Np,o&=~ch,i.suspendedLanes|=o,i.pingedLanes&=~o,i=i.expirationTimes;0<o;){var l=31-ln(o),d=1<<l;i[l]=-1,o&=~d}}function i0(i){if((Be&6)!==0)throw Error(t(327));ga();var o=js(i,0);if((o&1)===0)return In(i,et()),null;var l=gh(i,o);if(i.tag!==0&&l===2){var d=Dn(i);d!==0&&(o=d,l=bp(i,d))}if(l===1)throw l=Yl,to(i,0),ts(i,o),In(i,et()),l;if(l===6)throw Error(t(345));return i.finishedWork=i.current.alternate,i.finishedLanes=o,no(i,Tn,di),In(i,et()),null}function Mp(i,o){var l=Be;Be|=1;try{return i(o)}finally{Be=l,Be===0&&(ma=et()+500,Wc&&Ki())}}function eo(i){Zi!==null&&Zi.tag===0&&(Be&6)===0&&ga();var o=Be;Be|=1;var l=Kn.transition,d=Le;try{if(Kn.transition=null,Le=1,i)return i()}finally{Le=d,Kn.transition=l,Be=o,(Be&6)===0&&Ki()}}function Vp(){Fn=pa.current,ot(pa)}function to(i,o){i.finishedWork=null,i.finishedLanes=0;var l=i.timeoutHandle;if(l!==-1&&(i.timeoutHandle=-1,qS(l)),Tt!==null)for(l=Tt.return;l!==null;){var d=l;switch(qf(d),d.tag){case 1:d=d.type.childContextTypes,d!=null&&Bc();break;case 3:ha(),ot(vn),ot(Xt),sp();break;case 5:rp(d);break;case 4:ha();break;case 13:ot(ht);break;case 19:ot(ht);break;case 10:Jf(d.type._context);break;case 22:case 23:Vp()}l=l.return}if(Vt=i,Tt=i=ns(i.current,null),qt=Fn=o,Nt=0,Yl=null,Np=ch=Zs=0,Tn=Xl=null,Ys!==null){for(o=0;o<Ys.length;o++)if(l=Ys[o],d=l.interleaved,d!==null){l.interleaved=null;var m=d.next,_=l.pending;if(_!==null){var E=_.next;_.next=m,d.next=E}l.pending=d}Ys=null}return i}function s0(i,o){do{var l=Tt;try{if(Xf(),Zc.current=rh,eh){for(var d=dt.memoizedState;d!==null;){var m=d.queue;m!==null&&(m.pending=null),d=d.next}eh=!1}if(Js=0,Mt=Pt=dt=null,$l=!1,Hl=0,Pp.current=null,l===null||l.return===null){Nt=1,Yl=o,Tt=null;break}e:{var _=i,E=l.return,k=l,x=o;if(o=qt,k.flags|=32768,x!==null&&typeof x=="object"&&typeof x.then=="function"){var z=x,J=k,ee=J.tag;if((J.mode&1)===0&&(ee===0||ee===11||ee===15)){var X=J.alternate;X?(J.updateQueue=X.updateQueue,J.memoizedState=X.memoizedState,J.lanes=X.lanes):(J.updateQueue=null,J.memoizedState=null)}var ue=Nv(E);if(ue!==null){ue.flags&=-257,xv(ue,E,k,_,o),ue.mode&1&&Pv(_,z,o),o=ue,x=z;var fe=o.updateQueue;if(fe===null){var pe=new Set;pe.add(x),o.updateQueue=pe}else fe.add(x);break e}else{if((o&1)===0){Pv(_,z,o),Fp();break e}x=Error(t(426))}}else if(ut&&k.mode&1){var yt=Nv(E);if(yt!==null){(yt.flags&65536)===0&&(yt.flags|=256),xv(yt,E,k,_,o),Qf(da(x,k));break e}}_=x=da(x,k),Nt!==4&&(Nt=2),Xl===null?Xl=[_]:Xl.push(_),_=E;do{switch(_.tag){case 3:_.flags|=65536,o&=-o,_.lanes|=o;var j=kv(_,x,o);ev(_,j);break e;case 1:k=x;var L=_.type,B=_.stateNode;if((_.flags&128)===0&&(typeof L.getDerivedStateFromError=="function"||B!==null&&typeof B.componentDidCatch=="function"&&(Ji===null||!Ji.has(B)))){_.flags|=65536,o&=-o,_.lanes|=o;var te=Av(_,k,o);ev(_,te);break e}}_=_.return}while(_!==null)}l0(l)}catch(me){o=me,Tt===l&&l!==null&&(Tt=l=l.return);continue}break}while(!0)}function o0(){var i=uh.current;return uh.current=rh,i===null?rh:i}function Fp(){(Nt===0||Nt===3||Nt===2)&&(Nt=4),Vt===null||(Zs&268435455)===0&&(ch&268435455)===0||ts(Vt,qt)}function gh(i,o){var l=Be;Be|=2;var d=o0();(Vt!==i||qt!==o)&&(di=null,to(i,o));do try{_C();break}catch(m){s0(i,m)}while(!0);if(Xf(),Be=l,uh.current=d,Tt!==null)throw Error(t(261));return Vt=null,qt=0,Nt}function _C(){for(;Tt!==null;)a0(Tt)}function yC(){for(;Tt!==null&&!fc();)a0(Tt)}function a0(i){var o=h0(i.alternate,i,Fn);i.memoizedProps=i.pendingProps,o===null?l0(i):Tt=o,Pp.current=null}function l0(i){var o=i;do{var l=o.alternate;if(i=o.return,(o.flags&32768)===0){if(l=cC(l,o,Fn),l!==null){Tt=l;return}}else{if(l=hC(l,o),l!==null){l.flags&=32767,Tt=l;return}if(i!==null)i.flags|=32768,i.subtreeFlags=0,i.deletions=null;else{Nt=6,Tt=null;return}}if(o=o.sibling,o!==null){Tt=o;return}Tt=o=i}while(o!==null);Nt===0&&(Nt=5)}function no(i,o,l){var d=Le,m=Kn.transition;try{Kn.transition=null,Le=1,vC(i,o,l,d)}finally{Kn.transition=m,Le=d}return null}function vC(i,o,l,d){do ga();while(Zi!==null);if((Be&6)!==0)throw Error(t(327));l=i.finishedWork;var m=i.finishedLanes;if(l===null)return null;if(i.finishedWork=null,i.finishedLanes=0,l===i.current)throw Error(t(177));i.callbackNode=null,i.callbackPriority=0;var _=l.lanes|l.childLanes;if(Je(i,_),i===Vt&&(Tt=Vt=null,qt=0),(l.subtreeFlags&2064)===0&&(l.flags&2064)===0||dh||(dh=!0,d0(Bn,function(){return ga(),null})),_=(l.flags&15990)!==0,(l.subtreeFlags&15990)!==0||_){_=Kn.transition,Kn.transition=null;var E=Le;Le=1;var k=Be;Be|=4,Pp.current=null,fC(i,l),Jv(l,i),US(Ff),zi=!!Vf,Ff=Vf=null,i.current=l,pC(l),Ef(),Be=k,Le=E,Kn.transition=_}else i.current=l;if(dh&&(dh=!1,Zi=i,fh=m),_=i.pendingLanes,_===0&&(Ji=null),gc(l.stateNode),In(i,et()),o!==null)for(d=i.onRecoverableError,l=0;l<o.length;l++)m=o[l],d(m.value,{componentStack:m.stack,digest:m.digest});if(hh)throw hh=!1,i=Op,Op=null,i;return(fh&1)!==0&&i.tag!==0&&ga(),_=i.pendingLanes,(_&1)!==0?i===Dp?Jl++:(Jl=0,Dp=i):Jl=0,Ki(),null}function ga(){if(Zi!==null){var i=ji(fh),o=Kn.transition,l=Le;try{if(Kn.transition=null,Le=16>i?16:i,Zi===null)var d=!1;else{if(i=Zi,Zi=null,fh=0,(Be&6)!==0)throw Error(t(331));var m=Be;for(Be|=4,he=i.current;he!==null;){var _=he,E=_.child;if((he.flags&16)!==0){var k=_.deletions;if(k!==null){for(var x=0;x<k.length;x++){var z=k[x];for(he=z;he!==null;){var J=he;switch(J.tag){case 0:case 11:case 15:Ql(8,J,_)}var ee=J.child;if(ee!==null)ee.return=J,he=ee;else for(;he!==null;){J=he;var X=J.sibling,ue=J.return;if(Gv(J),J===z){he=null;break}if(X!==null){X.return=ue,he=X;break}he=ue}}}var fe=_.alternate;if(fe!==null){var pe=fe.child;if(pe!==null){fe.child=null;do{var yt=pe.sibling;pe.sibling=null,pe=yt}while(pe!==null)}}he=_}}if((_.subtreeFlags&2064)!==0&&E!==null)E.return=_,he=E;else e:for(;he!==null;){if(_=he,(_.flags&2048)!==0)switch(_.tag){case 0:case 11:case 15:Ql(9,_,_.return)}var j=_.sibling;if(j!==null){j.return=_.return,he=j;break e}he=_.return}}var L=i.current;for(he=L;he!==null;){E=he;var B=E.child;if((E.subtreeFlags&2064)!==0&&B!==null)B.return=E,he=B;else e:for(E=L;he!==null;){if(k=he,(k.flags&2048)!==0)try{switch(k.tag){case 0:case 11:case 15:lh(9,k)}}catch(me){ft(k,k.return,me)}if(k===E){he=null;break e}var te=k.sibling;if(te!==null){te.return=k.return,he=te;break e}he=k.return}}if(Be=m,Ki(),On&&typeof On.onPostCommitFiberRoot=="function")try{On.onPostCommitFiberRoot(Us,i)}catch{}d=!0}return d}finally{Le=l,Kn.transition=o}}return!1}function u0(i,o,l){o=da(l,o),o=kv(i,o,1),i=Yi(i,o,1),o=hn(),i!==null&&(Fi(i,1,o),In(i,o))}function ft(i,o,l){if(i.tag===3)u0(i,i,l);else for(;o!==null;){if(o.tag===3){u0(o,i,l);break}else if(o.tag===1){var d=o.stateNode;if(typeof o.type.getDerivedStateFromError=="function"||typeof d.componentDidCatch=="function"&&(Ji===null||!Ji.has(d))){i=da(l,i),i=Av(o,i,1),o=Yi(o,i,1),i=hn(),o!==null&&(Fi(o,1,i),In(o,i));break}}o=o.return}}function wC(i,o,l){var d=i.pingCache;d!==null&&d.delete(o),o=hn(),i.pingedLanes|=i.suspendedLanes&l,Vt===i&&(qt&l)===l&&(Nt===4||Nt===3&&(qt&130023424)===qt&&500>et()-xp?to(i,0):Np|=l),In(i,o)}function c0(i,o){o===0&&((i.mode&1)===0?o=1:(o=Uo,Uo<<=1,(Uo&130023424)===0&&(Uo=4194304)));var l=hn();i=ui(i,o),i!==null&&(Fi(i,o,l),In(i,l))}function EC(i){var o=i.memoizedState,l=0;o!==null&&(l=o.retryLane),c0(i,l)}function TC(i,o){var l=0;switch(i.tag){case 13:var d=i.stateNode,m=i.memoizedState;m!==null&&(l=m.retryLane);break;case 19:d=i.stateNode;break;default:throw Error(t(314))}d!==null&&d.delete(o),c0(i,l)}var h0;h0=function(i,o,l){if(i!==null)if(i.memoizedProps!==o.pendingProps||vn.current)En=!0;else{if((i.lanes&l)===0&&(o.flags&128)===0)return En=!1,uC(i,o,l);En=(i.flags&131072)!==0}else En=!1,ut&&(o.flags&1048576)!==0&&$y(o,Hc,o.index);switch(o.lanes=0,o.tag){case 2:var d=o.type;oh(i,o),i=o.pendingProps;var m=ia(o,Xt.current);ca(o,l),m=lp(null,o,d,i,m,l);var _=up();return o.flags|=1,typeof m=="object"&&m!==null&&typeof m.render=="function"&&m.$$typeof===void 0?(o.tag=1,o.memoizedState=null,o.updateQueue=null,wn(d)?(_=!0,zc(o)):_=!1,o.memoizedState=m.state!==null&&m.state!==void 0?m.state:null,tp(o),m.updater=ih,o.stateNode=m,m._reactInternals=o,mp(o,d,i,l),o=vp(null,o,d,!0,_,l)):(o.tag=0,ut&&_&&Hf(o),cn(null,o,m,l),o=o.child),o;case 16:d=o.elementType;e:{switch(oh(i,o),i=o.pendingProps,m=d._init,d=m(d._payload),o.type=d,m=o.tag=SC(d),i=hr(d,i),m){case 0:o=yp(null,o,d,i,l);break e;case 1:o=Vv(null,o,d,i,l);break e;case 11:o=Ov(null,o,d,i,l);break e;case 14:o=Dv(null,o,d,hr(d.type,i),l);break e}throw Error(t(306,d,""))}return o;case 0:return d=o.type,m=o.pendingProps,m=o.elementType===d?m:hr(d,m),yp(i,o,d,m,l);case 1:return d=o.type,m=o.pendingProps,m=o.elementType===d?m:hr(d,m),Vv(i,o,d,m,l);case 3:e:{if(Fv(o),i===null)throw Error(t(387));d=o.pendingProps,_=o.memoizedState,m=_.element,Zy(i,o),Xc(o,d,null,l);var E=o.memoizedState;if(d=E.element,_.isDehydrated)if(_={element:d,isDehydrated:!1,cache:E.cache,pendingSuspenseBoundaries:E.pendingSuspenseBoundaries,transitions:E.transitions},o.updateQueue.baseState=_,o.memoizedState=_,o.flags&256){m=da(Error(t(423)),o),o=Uv(i,o,d,l,m);break e}else if(d!==m){m=da(Error(t(424)),o),o=Uv(i,o,d,l,m);break e}else for(Vn=Hi(o.stateNode.containerInfo.firstChild),Mn=o,ut=!0,cr=null,l=Xy(o,null,d,l),o.child=l;l;)l.flags=l.flags&-3|4096,l=l.sibling;else{if(aa(),d===m){o=hi(i,o,l);break e}cn(i,o,d,l)}o=o.child}return o;case 5:return nv(o),i===null&&Kf(o),d=o.type,m=o.pendingProps,_=i!==null?i.memoizedProps:null,E=m.children,Uf(d,m)?E=null:_!==null&&Uf(d,_)&&(o.flags|=32),Mv(i,o),cn(i,o,E,l),o.child;case 6:return i===null&&Kf(o),null;case 13:return jv(i,o,l);case 4:return np(o,o.stateNode.containerInfo),d=o.pendingProps,i===null?o.child=la(o,null,d,l):cn(i,o,d,l),o.child;case 11:return d=o.type,m=o.pendingProps,m=o.elementType===d?m:hr(d,m),Ov(i,o,d,m,l);case 7:return cn(i,o,o.pendingProps,l),o.child;case 8:return cn(i,o,o.pendingProps.children,l),o.child;case 12:return cn(i,o,o.pendingProps.children,l),o.child;case 10:e:{if(d=o.type._context,m=o.pendingProps,_=o.memoizedProps,E=m.value,tt(Kc,d._currentValue),d._currentValue=E,_!==null)if(ur(_.value,E)){if(_.children===m.children&&!vn.current){o=hi(i,o,l);break e}}else for(_=o.child,_!==null&&(_.return=o);_!==null;){var k=_.dependencies;if(k!==null){E=_.child;for(var x=k.firstContext;x!==null;){if(x.context===d){if(_.tag===1){x=ci(-1,l&-l),x.tag=2;var z=_.updateQueue;if(z!==null){z=z.shared;var J=z.pending;J===null?x.next=x:(x.next=J.next,J.next=x),z.pending=x}}_.lanes|=l,x=_.alternate,x!==null&&(x.lanes|=l),Zf(_.return,l,o),k.lanes|=l;break}x=x.next}}else if(_.tag===10)E=_.type===o.type?null:_.child;else if(_.tag===18){if(E=_.return,E===null)throw Error(t(341));E.lanes|=l,k=E.alternate,k!==null&&(k.lanes|=l),Zf(E,l,o),E=_.sibling}else E=_.child;if(E!==null)E.return=_;else for(E=_;E!==null;){if(E===o){E=null;break}if(_=E.sibling,_!==null){_.return=E.return,E=_;break}E=E.return}_=E}cn(i,o,m.children,l),o=o.child}return o;case 9:return m=o.type,d=o.pendingProps.children,ca(o,l),m=qn(m),d=d(m),o.flags|=1,cn(i,o,d,l),o.child;case 14:return d=o.type,m=hr(d,o.pendingProps),m=hr(d.type,m),Dv(i,o,d,m,l);case 15:return bv(i,o,o.type,o.pendingProps,l);case 17:return d=o.type,m=o.pendingProps,m=o.elementType===d?m:hr(d,m),oh(i,o),o.tag=1,wn(d)?(i=!0,zc(o)):i=!1,ca(o,l),Cv(o,d,m),mp(o,d,m,l),vp(null,o,d,!0,i,l);case 19:return zv(i,o,l);case 22:return Lv(i,o,l)}throw Error(t(156,o.tag))};function d0(i,o){return Vo(i,o)}function IC(i,o,l,d){this.tag=i,this.key=l,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=o,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=d,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Qn(i,o,l,d){return new IC(i,o,l,d)}function Up(i){return i=i.prototype,!(!i||!i.isReactComponent)}function SC(i){if(typeof i=="function")return Up(i)?1:0;if(i!=null){if(i=i.$$typeof,i===F)return 11;if(i===Xe)return 14}return 2}function ns(i,o){var l=i.alternate;return l===null?(l=Qn(i.tag,o,i.key,i.mode),l.elementType=i.elementType,l.type=i.type,l.stateNode=i.stateNode,l.alternate=i,i.alternate=l):(l.pendingProps=o,l.type=i.type,l.flags=0,l.subtreeFlags=0,l.deletions=null),l.flags=i.flags&14680064,l.childLanes=i.childLanes,l.lanes=i.lanes,l.child=i.child,l.memoizedProps=i.memoizedProps,l.memoizedState=i.memoizedState,l.updateQueue=i.updateQueue,o=i.dependencies,l.dependencies=o===null?null:{lanes:o.lanes,firstContext:o.firstContext},l.sibling=i.sibling,l.index=i.index,l.ref=i.ref,l}function _h(i,o,l,d,m,_){var E=2;if(d=i,typeof i=="function")Up(i)&&(E=1);else if(typeof i=="string")E=5;else e:switch(i){case O:return ro(l.children,m,_,o);case S:E=8,m|=8;break;case R:return i=Qn(12,l,o,m|2),i.elementType=R,i.lanes=_,i;case P:return i=Qn(13,l,o,m),i.elementType=P,i.lanes=_,i;case ze:return i=Qn(19,l,o,m),i.elementType=ze,i.lanes=_,i;case qe:return yh(l,m,_,o);default:if(typeof i=="object"&&i!==null)switch(i.$$typeof){case N:E=10;break e;case b:E=9;break e;case F:E=11;break e;case Xe:E=14;break e;case Dt:E=16,d=null;break e}throw Error(t(130,i==null?i:typeof i,""))}return o=Qn(E,l,o,m),o.elementType=i,o.type=d,o.lanes=_,o}function ro(i,o,l,d){return i=Qn(7,i,d,o),i.lanes=l,i}function yh(i,o,l,d){return i=Qn(22,i,d,o),i.elementType=qe,i.lanes=l,i.stateNode={isHidden:!1},i}function jp(i,o,l){return i=Qn(6,i,null,o),i.lanes=l,i}function Bp(i,o,l){return o=Qn(4,i.children!==null?i.children:[],i.key,o),o.lanes=l,o.stateNode={containerInfo:i.containerInfo,pendingChildren:null,implementation:i.implementation},o}function CC(i,o,l,d,m){this.tag=o,this.containerInfo=i,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Vi(0),this.expirationTimes=Vi(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Vi(0),this.identifierPrefix=d,this.onRecoverableError=m,this.mutableSourceEagerHydrationData=null}function zp(i,o,l,d,m,_,E,k,x){return i=new CC(i,o,l,k,x),o===1?(o=1,_===!0&&(o|=8)):o=0,_=Qn(3,null,null,o),i.current=_,_.stateNode=i,_.memoizedState={element:d,isDehydrated:l,cache:null,transitions:null,pendingSuspenseBoundaries:null},tp(_),i}function RC(i,o,l){var d=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:we,key:d==null?null:""+d,children:i,containerInfo:o,implementation:l}}function f0(i){if(!i)return Gi;i=i._reactInternals;e:{if(nr(i)!==i||i.tag!==1)throw Error(t(170));var o=i;do{switch(o.tag){case 3:o=o.stateNode.context;break e;case 1:if(wn(o.type)){o=o.stateNode.__reactInternalMemoizedMergedChildContext;break e}}o=o.return}while(o!==null);throw Error(t(171))}if(i.tag===1){var l=i.type;if(wn(l))return By(i,l,o)}return o}function p0(i,o,l,d,m,_,E,k,x){return i=zp(l,d,!0,i,m,_,E,k,x),i.context=f0(null),l=i.current,d=hn(),m=es(l),_=ci(d,m),_.callback=o??null,Yi(l,_,m),i.current.lanes=m,Fi(i,m,d),In(i,d),i}function vh(i,o,l,d){var m=o.current,_=hn(),E=es(m);return l=f0(l),o.context===null?o.context=l:o.pendingContext=l,o=ci(_,E),o.payload={element:i},d=d===void 0?null:d,d!==null&&(o.callback=d),i=Yi(m,o,E),i!==null&&(pr(i,m,E,_),Yc(i,m,E)),E}function wh(i){if(i=i.current,!i.child)return null;switch(i.child.tag){case 5:return i.child.stateNode;default:return i.child.stateNode}}function m0(i,o){if(i=i.memoizedState,i!==null&&i.dehydrated!==null){var l=i.retryLane;i.retryLane=l!==0&&l<o?l:o}}function Wp(i,o){m0(i,o),(i=i.alternate)&&m0(i,o)}function kC(){return null}var g0=typeof reportError=="function"?reportError:function(i){console.error(i)};function $p(i){this._internalRoot=i}Eh.prototype.render=$p.prototype.render=function(i){var o=this._internalRoot;if(o===null)throw Error(t(409));vh(i,o,null,null)},Eh.prototype.unmount=$p.prototype.unmount=function(){var i=this._internalRoot;if(i!==null){this._internalRoot=null;var o=i.containerInfo;eo(function(){vh(null,i,null,null)}),o[si]=null}};function Eh(i){this._internalRoot=i}Eh.prototype.unstable_scheduleHydration=function(i){if(i){var o=Ec();i={blockedOn:null,target:i,priority:o};for(var l=0;l<kr.length&&o!==0&&o<kr[l].priority;l++);kr.splice(l,0,i),l===0&&Sc(i)}};function Hp(i){return!(!i||i.nodeType!==1&&i.nodeType!==9&&i.nodeType!==11)}function Th(i){return!(!i||i.nodeType!==1&&i.nodeType!==9&&i.nodeType!==11&&(i.nodeType!==8||i.nodeValue!==" react-mount-point-unstable "))}function _0(){}function AC(i,o,l,d,m){if(m){if(typeof d=="function"){var _=d;d=function(){var z=wh(E);_.call(z)}}var E=p0(o,d,i,0,null,!1,!1,"",_0);return i._reactRootContainer=E,i[si]=E.current,Ml(i.nodeType===8?i.parentNode:i),eo(),E}for(;m=i.lastChild;)i.removeChild(m);if(typeof d=="function"){var k=d;d=function(){var z=wh(x);k.call(z)}}var x=zp(i,0,!1,null,null,!1,!1,"",_0);return i._reactRootContainer=x,i[si]=x.current,Ml(i.nodeType===8?i.parentNode:i),eo(function(){vh(o,x,l,d)}),x}function Ih(i,o,l,d,m){var _=l._reactRootContainer;if(_){var E=_;if(typeof m=="function"){var k=m;m=function(){var x=wh(E);k.call(x)}}vh(o,E,i,m)}else E=AC(l,o,i,m,d);return wh(E)}vc=function(i){switch(i.tag){case 3:var o=i.stateNode;if(o.current.memoizedState.isDehydrated){var l=Mi(o.pendingLanes);l!==0&&(Ui(o,l|1),In(o,et()),(Be&6)===0&&(ma=et()+500,Ki()))}break;case 13:eo(function(){var d=ui(i,1);if(d!==null){var m=hn();pr(d,i,1,m)}}),Wp(i,1)}},jo=function(i){if(i.tag===13){var o=ui(i,134217728);if(o!==null){var l=hn();pr(o,i,134217728,l)}Wp(i,134217728)}},wc=function(i){if(i.tag===13){var o=es(i),l=ui(i,o);if(l!==null){var d=hn();pr(l,i,o,d)}Wp(i,o)}},Ec=function(){return Le},Tc=function(i,o){var l=Le;try{return Le=i,o()}finally{Le=l}},xo=function(i,o,l){switch(o){case"input":if(al(i,l),o=l.name,l.type==="radio"&&o!=null){for(l=i;l.parentNode;)l=l.parentNode;for(l=l.querySelectorAll("input[name="+JSON.stringify(""+o)+'][type="radio"]'),o=0;o<l.length;o++){var d=l[o];if(d!==i&&d.form===i.form){var m=jc(d);if(!m)throw Error(t(90));Co(d),al(d,m)}}}break;case"textarea":Po(i,l);break;case"select":o=l.value,o!=null&&Xr(i,!!l.multiple,o,!1)}},bs=Mp,_l=eo;var PC={usingClientEntryPoint:!1,Events:[Ul,na,jc,Cr,gl,Mp]},Zl={findFiberByHostInstance:qs,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},NC={bundleType:Zl.bundleType,version:Zl.version,rendererPackageName:Zl.rendererPackageName,rendererConfig:Zl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:re.ReactCurrentDispatcher,findHostInstanceByFiber:function(i){return i=wl(i),i===null?null:i.stateNode},findFiberByHostInstance:Zl.findFiberByHostInstance||kC,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Sh=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Sh.isDisabled&&Sh.supportsFiber)try{Us=Sh.inject(NC),On=Sh}catch{}}return Sn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=PC,Sn.createPortal=function(i,o){var l=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Hp(o))throw Error(t(200));return RC(i,o,null,l)},Sn.createRoot=function(i,o){if(!Hp(i))throw Error(t(299));var l=!1,d="",m=g0;return o!=null&&(o.unstable_strictMode===!0&&(l=!0),o.identifierPrefix!==void 0&&(d=o.identifierPrefix),o.onRecoverableError!==void 0&&(m=o.onRecoverableError)),o=zp(i,1,!1,null,null,l,!1,d,m),i[si]=o.current,Ml(i.nodeType===8?i.parentNode:i),new $p(o)},Sn.findDOMNode=function(i){if(i==null)return null;if(i.nodeType===1)return i;var o=i._reactInternals;if(o===void 0)throw typeof i.render=="function"?Error(t(188)):(i=Object.keys(i).join(","),Error(t(268,i)));return i=wl(o),i=i===null?null:i.stateNode,i},Sn.flushSync=function(i){return eo(i)},Sn.hydrate=function(i,o,l){if(!Th(o))throw Error(t(200));return Ih(null,i,o,!0,l)},Sn.hydrateRoot=function(i,o,l){if(!Hp(i))throw Error(t(405));var d=l!=null&&l.hydratedSources||null,m=!1,_="",E=g0;if(l!=null&&(l.unstable_strictMode===!0&&(m=!0),l.identifierPrefix!==void 0&&(_=l.identifierPrefix),l.onRecoverableError!==void 0&&(E=l.onRecoverableError)),o=p0(o,null,i,1,l??null,m,!1,_,E),i[si]=o.current,Ml(i),d)for(i=0;i<d.length;i++)l=d[i],m=l._getVersion,m=m(l._source),o.mutableSourceEagerHydrationData==null?o.mutableSourceEagerHydrationData=[l,m]:o.mutableSourceEagerHydrationData.push(l,m);return new Eh(o)},Sn.render=function(i,o,l){if(!Th(o))throw Error(t(200));return Ih(null,i,o,!1,l)},Sn.unmountComponentAtNode=function(i){if(!Th(i))throw Error(t(40));return i._reactRootContainer?(eo(function(){Ih(null,null,i,!1,function(){i._reactRootContainer=null,i[si]=null})}),!0):!1},Sn.unstable_batchedUpdates=Mp,Sn.unstable_renderSubtreeIntoContainer=function(i,o,l,d){if(!Th(l))throw Error(t(200));if(i==null||i._reactInternals===void 0)throw Error(t(38));return Ih(i,o,l,!1,d)},Sn.version="18.3.1-next-f1338f8080-20240426",Sn}var R0;function jC(){if(R0)return Kp.exports;R0=1;function n(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(e){console.error(e)}}return n(),Kp.exports=UC(),Kp.exports}var k0;function BC(){if(k0)return Ch;k0=1;var n=jC();return Ch.createRoot=n.createRoot,Ch.hydrateRoot=n.hydrateRoot,Ch}var zC=BC();const WC="modulepreload",$C=function(n){return"/"+n},A0={},xi=function(e,t,r){let s=Promise.resolve();if(t&&t.length>0){let u=function(p){return Promise.all(p.map(y=>Promise.resolve(y).then(w=>({status:"fulfilled",value:w}),w=>({status:"rejected",reason:w}))))};document.getElementsByTagName("link");const h=document.querySelector("meta[property=csp-nonce]"),f=(h==null?void 0:h.nonce)||(h==null?void 0:h.getAttribute("nonce"));s=u(t.map(p=>{if(p=$C(p),p in A0)return;A0[p]=!0;const y=p.endsWith(".css"),w=y?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${w}`))return;const T=document.createElement("link");if(T.rel=y?"stylesheet":WC,y||(T.as="script"),T.crossOrigin="",T.href=p,f&&T.setAttribute("nonce",f),document.head.appendChild(T),y)return new Promise((C,A)=>{T.addEventListener("load",C),T.addEventListener("error",()=>A(new Error(`Unable to preload CSS for ${p}`)))})}))}function a(u){const h=new Event("vite:preloadError",{cancelable:!0});if(h.payload=u,window.dispatchEvent(h),!h.defaultPrevented)throw u}return s.then(u=>{for(const h of u||[])h.status==="rejected"&&a(h.reason);return e().catch(a)})};var Xp={exports:{}},Jp,P0;function HC(){if(P0)return Jp;P0=1;var n="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";return Jp=n,Jp}var Zp,N0;function qC(){if(N0)return Zp;N0=1;var n=HC();function e(){}function t(){}return t.resetWarningCache=e,Zp=function(){function r(u,h,f,p,y,w){if(w!==n){var T=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw T.name="Invariant Violation",T}}r.isRequired=r;function s(){return r}var a={array:r,bigint:r,bool:r,func:r,number:r,object:r,string:r,symbol:r,any:r,arrayOf:s,element:r,elementType:r,instanceOf:s,node:r,objectOf:s,oneOf:s,oneOfType:s,shape:s,exact:s,checkPropTypes:t,resetWarningCache:e};return a.PropTypes=a,a},Zp}var x0;function GC(){return x0||(x0=1,Xp.exports=qC()()),Xp.exports}var KC=GC();const yi=lE(KC);var tu={},O0;function QC(){if(O0)return tu;O0=1,Object.defineProperty(tu,"__esModule",{value:!0}),tu.parse=u,tu.serialize=p;const n=/^[\u0021-\u003A\u003C\u003E-\u007E]+$/,e=/^[\u0021-\u003A\u003C-\u007E]*$/,t=/^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i,r=/^[\u0020-\u003A\u003D-\u007E]*$/,s=Object.prototype.toString,a=(()=>{const T=function(){};return T.prototype=Object.create(null),T})();function u(T,C){const A=new a,M=T.length;if(M<2)return A;const D=(C==null?void 0:C.decode)||y;let H=0;do{const Z=T.indexOf("=",H);if(Z===-1)break;const K=T.indexOf(";",H),re=K===-1?M:K;if(Z>re){H=T.lastIndexOf(";",Z-1)+1;continue}const Ie=h(T,H,Z),we=f(T,Z,Ie),O=T.slice(Ie,we);if(A[O]===void 0){let S=h(T,Z+1,re),R=f(T,re,S);const N=D(T.slice(S,R));A[O]=N}H=re+1}while(H<M);return A}function h(T,C,A){do{const M=T.charCodeAt(C);if(M!==32&&M!==9)return C}while(++C<A);return A}function f(T,C,A){for(;C>A;){const M=T.charCodeAt(--C);if(M!==32&&M!==9)return C+1}return A}function p(T,C,A){const M=(A==null?void 0:A.encode)||encodeURIComponent;if(!n.test(T))throw new TypeError(`argument name is invalid: ${T}`);const D=M(C);if(!e.test(D))throw new TypeError(`argument val is invalid: ${C}`);let H=T+"="+D;if(!A)return H;if(A.maxAge!==void 0){if(!Number.isInteger(A.maxAge))throw new TypeError(`option maxAge is invalid: ${A.maxAge}`);H+="; Max-Age="+A.maxAge}if(A.domain){if(!t.test(A.domain))throw new TypeError(`option domain is invalid: ${A.domain}`);H+="; Domain="+A.domain}if(A.path){if(!r.test(A.path))throw new TypeError(`option path is invalid: ${A.path}`);H+="; Path="+A.path}if(A.expires){if(!w(A.expires)||!Number.isFinite(A.expires.valueOf()))throw new TypeError(`option expires is invalid: ${A.expires}`);H+="; Expires="+A.expires.toUTCString()}if(A.httpOnly&&(H+="; HttpOnly"),A.secure&&(H+="; Secure"),A.partitioned&&(H+="; Partitioned"),A.priority)switch(typeof A.priority=="string"?A.priority.toLowerCase():void 0){case"low":H+="; Priority=Low";break;case"medium":H+="; Priority=Medium";break;case"high":H+="; Priority=High";break;default:throw new TypeError(`option priority is invalid: ${A.priority}`)}if(A.sameSite)switch(typeof A.sameSite=="string"?A.sameSite.toLowerCase():A.sameSite){case!0:case"strict":H+="; SameSite=Strict";break;case"lax":H+="; SameSite=Lax";break;case"none":H+="; SameSite=None";break;default:throw new TypeError(`option sameSite is invalid: ${A.sameSite}`)}return H}function y(T){if(T.indexOf("%")===-1)return T;try{return decodeURIComponent(T)}catch{return T}}function w(T){return s.call(T)==="[object Date]"}return tu}QC();var D0="popstate";function YC(n={}){function e(r,s){let{pathname:a,search:u,hash:h}=r.location;return Im("",{pathname:a,search:u,hash:h},s.state&&s.state.usr||null,s.state&&s.state.key||"default")}function t(r,s){return typeof s=="string"?s:Su(s)}return JC(e,t,null,n)}function ct(n,e){if(n===!1||n===null||typeof n>"u")throw new Error(e)}function yr(n,e){if(!n){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function XC(){return Math.random().toString(36).substring(2,10)}function b0(n,e){return{usr:n.state,key:n.key,idx:e}}function Im(n,e,t=null,r){return{pathname:typeof n=="string"?n:n.pathname,search:"",hash:"",...typeof e=="string"?qa(e):e,state:t,key:e&&e.key||r||XC()}}function Su({pathname:n="/",search:e="",hash:t=""}){return e&&e!=="?"&&(n+=e.charAt(0)==="?"?e:"?"+e),t&&t!=="#"&&(n+=t.charAt(0)==="#"?t:"#"+t),n}function qa(n){let e={};if(n){let t=n.indexOf("#");t>=0&&(e.hash=n.substring(t),n=n.substring(0,t));let r=n.indexOf("?");r>=0&&(e.search=n.substring(r),n=n.substring(0,r)),n&&(e.pathname=n)}return e}function JC(n,e,t,r={}){let{window:s=document.defaultView,v5Compat:a=!1}=r,u=s.history,h="POP",f=null,p=y();p==null&&(p=0,u.replaceState({...u.state,idx:p},""));function y(){return(u.state||{idx:null}).idx}function w(){h="POP";let D=y(),H=D==null?null:D-p;p=D,f&&f({action:h,location:M.location,delta:H})}function T(D,H){h="PUSH";let Z=Im(M.location,D,H);p=y()+1;let K=b0(Z,p),re=M.createHref(Z);try{u.pushState(K,"",re)}catch(Ie){if(Ie instanceof DOMException&&Ie.name==="DataCloneError")throw Ie;s.location.assign(re)}a&&f&&f({action:h,location:M.location,delta:1})}function C(D,H){h="REPLACE";let Z=Im(M.location,D,H);p=y();let K=b0(Z,p),re=M.createHref(Z);u.replaceState(K,"",re),a&&f&&f({action:h,location:M.location,delta:0})}function A(D){let H=s.location.origin!=="null"?s.location.origin:s.location.href,Z=typeof D=="string"?D:Su(D);return Z=Z.replace(/ $/,"%20"),ct(H,`No window.location.(origin|href) available to create URL for href: ${Z}`),new URL(Z,H)}let M={get action(){return h},get location(){return n(s,u)},listen(D){if(f)throw new Error("A history only accepts one active listener");return s.addEventListener(D0,w),f=D,()=>{s.removeEventListener(D0,w),f=null}},createHref(D){return e(s,D)},createURL:A,encodeLocation(D){let H=A(D);return{pathname:H.pathname,search:H.search,hash:H.hash}},push:T,replace:C,go(D){return u.go(D)}};return M}function uE(n,e,t="/"){return ZC(n,e,t,!1)}function ZC(n,e,t,r){let s=typeof e=="string"?qa(e):e,a=Ii(s.pathname||"/",t);if(a==null)return null;let u=cE(n);eR(u);let h=null;for(let f=0;h==null&&f<u.length;++f){let p=hR(a);h=uR(u[f],p,r)}return h}function cE(n,e=[],t=[],r=""){let s=(a,u,h)=>{let f={relativePath:h===void 0?a.path||"":h,caseSensitive:a.caseSensitive===!0,childrenIndex:u,route:a};f.relativePath.startsWith("/")&&(ct(f.relativePath.startsWith(r),`Absolute route path "${f.relativePath}" nested under path "${r}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),f.relativePath=f.relativePath.slice(r.length));let p=vi([r,f.relativePath]),y=t.concat(f);a.children&&a.children.length>0&&(ct(a.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${p}".`),cE(a.children,e,y,p)),!(a.path==null&&!a.index)&&e.push({path:p,score:aR(p,a.index),routesMeta:y})};return n.forEach((a,u)=>{var h;if(a.path===""||!((h=a.path)!=null&&h.includes("?")))s(a,u);else for(let f of hE(a.path))s(a,u,f)}),e}function hE(n){let e=n.split("/");if(e.length===0)return[];let[t,...r]=e,s=t.endsWith("?"),a=t.replace(/\?$/,"");if(r.length===0)return s?[a,""]:[a];let u=hE(r.join("/")),h=[];return h.push(...u.map(f=>f===""?a:[a,f].join("/"))),s&&h.push(...u),h.map(f=>n.startsWith("/")&&f===""?"/":f)}function eR(n){n.sort((e,t)=>e.score!==t.score?t.score-e.score:lR(e.routesMeta.map(r=>r.childrenIndex),t.routesMeta.map(r=>r.childrenIndex)))}var tR=/^:[\w-]+$/,nR=3,rR=2,iR=1,sR=10,oR=-2,L0=n=>n==="*";function aR(n,e){let t=n.split("/"),r=t.length;return t.some(L0)&&(r+=oR),e&&(r+=rR),t.filter(s=>!L0(s)).reduce((s,a)=>s+(tR.test(a)?nR:a===""?iR:sR),r)}function lR(n,e){return n.length===e.length&&n.slice(0,-1).every((r,s)=>r===e[s])?n[n.length-1]-e[e.length-1]:0}function uR(n,e,t=!1){let{routesMeta:r}=n,s={},a="/",u=[];for(let h=0;h<r.length;++h){let f=r[h],p=h===r.length-1,y=a==="/"?e:e.slice(a.length)||"/",w=Yh({path:f.relativePath,caseSensitive:f.caseSensitive,end:p},y),T=f.route;if(!w&&p&&t&&!r[r.length-1].route.index&&(w=Yh({path:f.relativePath,caseSensitive:f.caseSensitive,end:!1},y)),!w)return null;Object.assign(s,w.params),u.push({params:s,pathname:vi([a,w.pathname]),pathnameBase:mR(vi([a,w.pathnameBase])),route:T}),w.pathnameBase!=="/"&&(a=vi([a,w.pathnameBase]))}return u}function Yh(n,e){typeof n=="string"&&(n={path:n,caseSensitive:!1,end:!0});let[t,r]=cR(n.path,n.caseSensitive,n.end),s=e.match(t);if(!s)return null;let a=s[0],u=a.replace(/(.)\/+$/,"$1"),h=s.slice(1);return{params:r.reduce((p,{paramName:y,isOptional:w},T)=>{if(y==="*"){let A=h[T]||"";u=a.slice(0,a.length-A.length).replace(/(.)\/+$/,"$1")}const C=h[T];return w&&!C?p[y]=void 0:p[y]=(C||"").replace(/%2F/g,"/"),p},{}),pathname:a,pathnameBase:u,pattern:n}}function cR(n,e=!1,t=!0){yr(n==="*"||!n.endsWith("*")||n.endsWith("/*"),`Route path "${n}" will be treated as if it were "${n.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${n.replace(/\*$/,"/*")}".`);let r=[],s="^"+n.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(u,h,f)=>(r.push({paramName:h,isOptional:f!=null}),f?"/?([^\\/]+)?":"/([^\\/]+)"));return n.endsWith("*")?(r.push({paramName:"*"}),s+=n==="*"||n==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):t?s+="\\/*$":n!==""&&n!=="/"&&(s+="(?:(?=\\/|$))"),[new RegExp(s,e?void 0:"i"),r]}function hR(n){try{return n.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return yr(!1,`The URL path "${n}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${e}).`),n}}function Ii(n,e){if(e==="/")return n;if(!n.toLowerCase().startsWith(e.toLowerCase()))return null;let t=e.endsWith("/")?e.length-1:e.length,r=n.charAt(t);return r&&r!=="/"?null:n.slice(t)||"/"}function dR(n,e="/"){let{pathname:t,search:r="",hash:s=""}=typeof n=="string"?qa(n):n;return{pathname:t?t.startsWith("/")?t:fR(t,e):e,search:gR(r),hash:_R(s)}}function fR(n,e){let t=e.replace(/\/+$/,"").split("/");return n.split("/").forEach(s=>{s===".."?t.length>1&&t.pop():s!=="."&&t.push(s)}),t.length>1?t.join("/"):"/"}function em(n,e,t,r){return`Cannot include a '${n}' character in a manually specified \`to.${e}\` field [${JSON.stringify(r)}].  Please separate it out to the \`to.${t}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function pR(n){return n.filter((e,t)=>t===0||e.route.path&&e.route.path.length>0)}function gg(n){let e=pR(n);return e.map((t,r)=>r===e.length-1?t.pathname:t.pathnameBase)}function _g(n,e,t,r=!1){let s;typeof n=="string"?s=qa(n):(s={...n},ct(!s.pathname||!s.pathname.includes("?"),em("?","pathname","search",s)),ct(!s.pathname||!s.pathname.includes("#"),em("#","pathname","hash",s)),ct(!s.search||!s.search.includes("#"),em("#","search","hash",s)));let a=n===""||s.pathname==="",u=a?"/":s.pathname,h;if(u==null)h=t;else{let w=e.length-1;if(!r&&u.startsWith("..")){let T=u.split("/");for(;T[0]==="..";)T.shift(),w-=1;s.pathname=T.join("/")}h=w>=0?e[w]:"/"}let f=dR(s,h),p=u&&u!=="/"&&u.endsWith("/"),y=(a||u===".")&&t.endsWith("/");return!f.pathname.endsWith("/")&&(p||y)&&(f.pathname+="/"),f}var vi=n=>n.join("/").replace(/\/\/+/g,"/"),mR=n=>n.replace(/\/+$/,"").replace(/^\/*/,"/"),gR=n=>!n||n==="?"?"":n.startsWith("?")?n:"?"+n,_R=n=>!n||n==="#"?"":n.startsWith("#")?n:"#"+n;function yR(n){return n!=null&&typeof n.status=="number"&&typeof n.statusText=="string"&&typeof n.internal=="boolean"&&"data"in n}var dE=["POST","PUT","PATCH","DELETE"];new Set(dE);var vR=["GET",...dE];new Set(vR);var Ga=W.createContext(null);Ga.displayName="DataRouter";var Od=W.createContext(null);Od.displayName="DataRouterState";var fE=W.createContext({isTransitioning:!1});fE.displayName="ViewTransition";var wR=W.createContext(new Map);wR.displayName="Fetchers";var ER=W.createContext(null);ER.displayName="Await";var Tr=W.createContext(null);Tr.displayName="Navigation";var Bu=W.createContext(null);Bu.displayName="Location";var $r=W.createContext({outlet:null,matches:[],isDataRoute:!1});$r.displayName="Route";var yg=W.createContext(null);yg.displayName="RouteError";function TR(n,{relative:e}={}){ct(Ka(),"useHref() may be used only in the context of a <Router> component.");let{basename:t,navigator:r}=W.useContext(Tr),{hash:s,pathname:a,search:u}=zu(n,{relative:e}),h=a;return t!=="/"&&(h=a==="/"?t:vi([t,a])),r.createHref({pathname:h,search:u,hash:s})}function Ka(){return W.useContext(Bu)!=null}function Hr(){return ct(Ka(),"useLocation() may be used only in the context of a <Router> component."),W.useContext(Bu).location}var pE="You should call navigate() in a React.useEffect(), not when your component is first rendered.";function mE(n){W.useContext(Tr).static||W.useLayoutEffect(n)}function vg(){let{isDataRoute:n}=W.useContext($r);return n?LR():IR()}function IR(){ct(Ka(),"useNavigate() may be used only in the context of a <Router> component.");let n=W.useContext(Ga),{basename:e,navigator:t}=W.useContext(Tr),{matches:r}=W.useContext($r),{pathname:s}=Hr(),a=JSON.stringify(gg(r)),u=W.useRef(!1);return mE(()=>{u.current=!0}),W.useCallback((f,p={})=>{if(yr(u.current,pE),!u.current)return;if(typeof f=="number"){t.go(f);return}let y=_g(f,JSON.parse(a),s,p.relative==="path");n==null&&e!=="/"&&(y.pathname=y.pathname==="/"?e:vi([e,y.pathname])),(p.replace?t.replace:t.push)(y,p.state,p)},[e,t,a,s,n])}W.createContext(null);function zu(n,{relative:e}={}){let{matches:t}=W.useContext($r),{pathname:r}=Hr(),s=JSON.stringify(gg(t));return W.useMemo(()=>_g(n,JSON.parse(s),r,e==="path"),[n,s,r,e])}function SR(n,e){return gE(n,e)}function gE(n,e,t,r){var Z;ct(Ka(),"useRoutes() may be used only in the context of a <Router> component.");let{navigator:s,static:a}=W.useContext(Tr),{matches:u}=W.useContext($r),h=u[u.length-1],f=h?h.params:{},p=h?h.pathname:"/",y=h?h.pathnameBase:"/",w=h&&h.route;{let K=w&&w.path||"";_E(p,!w||K.endsWith("*")||K.endsWith("*?"),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${p}" (under <Route path="${K}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${K}"> to <Route path="${K==="/"?"*":`${K}/*`}">.`)}let T=Hr(),C;if(e){let K=typeof e=="string"?qa(e):e;ct(y==="/"||((Z=K.pathname)==null?void 0:Z.startsWith(y)),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${y}" but pathname "${K.pathname}" was given in the \`location\` prop.`),C=K}else C=T;let A=C.pathname||"/",M=A;if(y!=="/"){let K=y.replace(/^\//,"").split("/");M="/"+A.replace(/^\//,"").split("/").slice(K.length).join("/")}let D=!a&&t&&t.matches&&t.matches.length>0?t.matches:uE(n,{pathname:M});yr(w||D!=null,`No routes matched location "${C.pathname}${C.search}${C.hash}" `),yr(D==null||D[D.length-1].route.element!==void 0||D[D.length-1].route.Component!==void 0||D[D.length-1].route.lazy!==void 0,`Matched leaf route at location "${C.pathname}${C.search}${C.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let H=PR(D&&D.map(K=>Object.assign({},K,{params:Object.assign({},f,K.params),pathname:vi([y,s.encodeLocation?s.encodeLocation(K.pathname).pathname:K.pathname]),pathnameBase:K.pathnameBase==="/"?y:vi([y,s.encodeLocation?s.encodeLocation(K.pathnameBase).pathname:K.pathnameBase])})),u,t,r);return e&&H?W.createElement(Bu.Provider,{value:{location:{pathname:"/",search:"",hash:"",state:null,key:"default",...C},navigationType:"POP"}},H):H}function CR(){let n=bR(),e=yR(n)?`${n.status} ${n.statusText}`:n instanceof Error?n.message:JSON.stringify(n),t=n instanceof Error?n.stack:null,r="rgba(200,200,200, 0.5)",s={padding:"0.5rem",backgroundColor:r},a={padding:"2px 4px",backgroundColor:r},u=null;return console.error("Error handled by React Router default ErrorBoundary:",n),u=W.createElement(W.Fragment,null,W.createElement("p",null,"💿 Hey developer 👋"),W.createElement("p",null,"You can provide a way better UX than this when your app throws errors by providing your own ",W.createElement("code",{style:a},"ErrorBoundary")," or"," ",W.createElement("code",{style:a},"errorElement")," prop on your route.")),W.createElement(W.Fragment,null,W.createElement("h2",null,"Unexpected Application Error!"),W.createElement("h3",{style:{fontStyle:"italic"}},e),t?W.createElement("pre",{style:s},t):null,u)}var RR=W.createElement(CR,null),kR=class extends W.Component{constructor(n){super(n),this.state={location:n.location,revalidation:n.revalidation,error:n.error}}static getDerivedStateFromError(n){return{error:n}}static getDerivedStateFromProps(n,e){return e.location!==n.location||e.revalidation!=="idle"&&n.revalidation==="idle"?{error:n.error,location:n.location,revalidation:n.revalidation}:{error:n.error!==void 0?n.error:e.error,location:e.location,revalidation:n.revalidation||e.revalidation}}componentDidCatch(n,e){console.error("React Router caught the following error during render",n,e)}render(){return this.state.error!==void 0?W.createElement($r.Provider,{value:this.props.routeContext},W.createElement(yg.Provider,{value:this.state.error,children:this.props.component})):this.props.children}};function AR({routeContext:n,match:e,children:t}){let r=W.useContext(Ga);return r&&r.static&&r.staticContext&&(e.route.errorElement||e.route.ErrorBoundary)&&(r.staticContext._deepestRenderedBoundaryId=e.route.id),W.createElement($r.Provider,{value:n},t)}function PR(n,e=[],t=null,r=null){if(n==null){if(!t)return null;if(t.errors)n=t.matches;else if(e.length===0&&!t.initialized&&t.matches.length>0)n=t.matches;else return null}let s=n,a=t==null?void 0:t.errors;if(a!=null){let f=s.findIndex(p=>p.route.id&&(a==null?void 0:a[p.route.id])!==void 0);ct(f>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(a).join(",")}`),s=s.slice(0,Math.min(s.length,f+1))}let u=!1,h=-1;if(t)for(let f=0;f<s.length;f++){let p=s[f];if((p.route.HydrateFallback||p.route.hydrateFallbackElement)&&(h=f),p.route.id){let{loaderData:y,errors:w}=t,T=p.route.loader&&!y.hasOwnProperty(p.route.id)&&(!w||w[p.route.id]===void 0);if(p.route.lazy||T){u=!0,h>=0?s=s.slice(0,h+1):s=[s[0]];break}}}return s.reduceRight((f,p,y)=>{let w,T=!1,C=null,A=null;t&&(w=a&&p.route.id?a[p.route.id]:void 0,C=p.route.errorElement||RR,u&&(h<0&&y===0?(_E("route-fallback",!1,"No `HydrateFallback` element provided to render during initial hydration"),T=!0,A=null):h===y&&(T=!0,A=p.route.hydrateFallbackElement||null)));let M=e.concat(s.slice(0,y+1)),D=()=>{let H;return w?H=C:T?H=A:p.route.Component?H=W.createElement(p.route.Component,null):p.route.element?H=p.route.element:H=f,W.createElement(AR,{match:p,routeContext:{outlet:f,matches:M,isDataRoute:t!=null},children:H})};return t&&(p.route.ErrorBoundary||p.route.errorElement||y===0)?W.createElement(kR,{location:t.location,revalidation:t.revalidation,component:C,error:w,children:D(),routeContext:{outlet:null,matches:M,isDataRoute:!0}}):D()},null)}function wg(n){return`${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function NR(n){let e=W.useContext(Ga);return ct(e,wg(n)),e}function xR(n){let e=W.useContext(Od);return ct(e,wg(n)),e}function OR(n){let e=W.useContext($r);return ct(e,wg(n)),e}function Eg(n){let e=OR(n),t=e.matches[e.matches.length-1];return ct(t.route.id,`${n} can only be used on routes that contain a unique "id"`),t.route.id}function DR(){return Eg("useRouteId")}function bR(){var r;let n=W.useContext(yg),e=xR("useRouteError"),t=Eg("useRouteError");return n!==void 0?n:(r=e.errors)==null?void 0:r[t]}function LR(){let{router:n}=NR("useNavigate"),e=Eg("useNavigate"),t=W.useRef(!1);return mE(()=>{t.current=!0}),W.useCallback(async(s,a={})=>{yr(t.current,pE),t.current&&(typeof s=="number"?n.navigate(s):await n.navigate(s,{fromRouteId:e,...a}))},[n,e])}var M0={};function _E(n,e,t){!e&&!M0[n]&&(M0[n]=!0,yr(!1,t))}W.memo(MR);function MR({routes:n,future:e,state:t}){return gE(n,void 0,t,e)}function tm({to:n,replace:e,state:t,relative:r}){ct(Ka(),"<Navigate> may be used only in the context of a <Router> component.");let{static:s}=W.useContext(Tr);yr(!s,"<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.");let{matches:a}=W.useContext($r),{pathname:u}=Hr(),h=vg(),f=_g(n,gg(a),u,r==="path"),p=JSON.stringify(f);return W.useEffect(()=>{h(JSON.parse(p),{replace:e,state:t,relative:r})},[h,p,r,e,t]),null}function Cn(n){ct(!1,"A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")}function VR({basename:n="/",children:e=null,location:t,navigationType:r="POP",navigator:s,static:a=!1}){ct(!Ka(),"You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");let u=n.replace(/^\/*/,"/"),h=W.useMemo(()=>({basename:u,navigator:s,static:a,future:{}}),[u,s,a]);typeof t=="string"&&(t=qa(t));let{pathname:f="/",search:p="",hash:y="",state:w=null,key:T="default"}=t,C=W.useMemo(()=>{let A=Ii(f,u);return A==null?null:{location:{pathname:A,search:p,hash:y,state:w,key:T},navigationType:r}},[u,f,p,y,w,T,r]);return yr(C!=null,`<Router basename="${u}"> is not able to match the URL "${f}${p}${y}" because it does not start with the basename, so the <Router> won't render anything.`),C==null?null:W.createElement(Tr.Provider,{value:h},W.createElement(Bu.Provider,{children:e,value:C}))}function FR({children:n,location:e}){return SR(Sm(n),e)}function Sm(n,e=[]){let t=[];return W.Children.forEach(n,(r,s)=>{if(!W.isValidElement(r))return;let a=[...e,s];if(r.type===W.Fragment){t.push.apply(t,Sm(r.props.children,a));return}ct(r.type===Cn,`[${typeof r.type=="string"?r.type:r.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),ct(!r.props.index||!r.props.children,"An index route cannot have child routes.");let u={id:r.props.id||a.join("-"),caseSensitive:r.props.caseSensitive,element:r.props.element,Component:r.props.Component,index:r.props.index,path:r.props.path,loader:r.props.loader,action:r.props.action,hydrateFallbackElement:r.props.hydrateFallbackElement,HydrateFallback:r.props.HydrateFallback,errorElement:r.props.errorElement,ErrorBoundary:r.props.ErrorBoundary,hasErrorBoundary:r.props.hasErrorBoundary===!0||r.props.ErrorBoundary!=null||r.props.errorElement!=null,shouldRevalidate:r.props.shouldRevalidate,handle:r.props.handle,lazy:r.props.lazy};r.props.children&&(u.children=Sm(r.props.children,a)),t.push(u)}),t}var Vh="get",Fh="application/x-www-form-urlencoded";function Dd(n){return n!=null&&typeof n.tagName=="string"}function UR(n){return Dd(n)&&n.tagName.toLowerCase()==="button"}function jR(n){return Dd(n)&&n.tagName.toLowerCase()==="form"}function BR(n){return Dd(n)&&n.tagName.toLowerCase()==="input"}function zR(n){return!!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)}function WR(n,e){return n.button===0&&(!e||e==="_self")&&!zR(n)}var Rh=null;function $R(){if(Rh===null)try{new FormData(document.createElement("form"),0),Rh=!1}catch{Rh=!0}return Rh}var HR=new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);function nm(n){return n!=null&&!HR.has(n)?(yr(!1,`"${n}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Fh}"`),null):n}function qR(n,e){let t,r,s,a,u;if(jR(n)){let h=n.getAttribute("action");r=h?Ii(h,e):null,t=n.getAttribute("method")||Vh,s=nm(n.getAttribute("enctype"))||Fh,a=new FormData(n)}else if(UR(n)||BR(n)&&(n.type==="submit"||n.type==="image")){let h=n.form;if(h==null)throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');let f=n.getAttribute("formaction")||h.getAttribute("action");if(r=f?Ii(f,e):null,t=n.getAttribute("formmethod")||h.getAttribute("method")||Vh,s=nm(n.getAttribute("formenctype"))||nm(h.getAttribute("enctype"))||Fh,a=new FormData(h,n),!$R()){let{name:p,type:y,value:w}=n;if(y==="image"){let T=p?`${p}.`:"";a.append(`${T}x`,"0"),a.append(`${T}y`,"0")}else p&&a.append(p,w)}}else{if(Dd(n))throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');t=Vh,r=null,s=Fh,u=n}return a&&s==="text/plain"&&(u=a,a=void 0),{action:r,method:t.toLowerCase(),encType:s,formData:a,body:u}}function Tg(n,e){if(n===!1||n===null||typeof n>"u")throw new Error(e)}async function GR(n,e){if(n.id in e)return e[n.id];try{let t=await import(n.module);return e[n.id]=t,t}catch(t){return console.error(`Error loading route module \`${n.module}\`, reloading page...`),console.error(t),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function KR(n){return n==null?!1:n.href==null?n.rel==="preload"&&typeof n.imageSrcSet=="string"&&typeof n.imageSizes=="string":typeof n.rel=="string"&&typeof n.href=="string"}async function QR(n,e,t){let r=await Promise.all(n.map(async s=>{let a=e.routes[s.route.id];if(a){let u=await GR(a,t);return u.links?u.links():[]}return[]}));return ZR(r.flat(1).filter(KR).filter(s=>s.rel==="stylesheet"||s.rel==="preload").map(s=>s.rel==="stylesheet"?{...s,rel:"prefetch",as:"style"}:{...s,rel:"prefetch"}))}function V0(n,e,t,r,s,a){let u=(f,p)=>t[p]?f.route.id!==t[p].route.id:!0,h=(f,p)=>{var y;return t[p].pathname!==f.pathname||((y=t[p].route.path)==null?void 0:y.endsWith("*"))&&t[p].params["*"]!==f.params["*"]};return a==="assets"?e.filter((f,p)=>u(f,p)||h(f,p)):a==="data"?e.filter((f,p)=>{var w;let y=r.routes[f.route.id];if(!y||!y.hasLoader)return!1;if(u(f,p)||h(f,p))return!0;if(f.route.shouldRevalidate){let T=f.route.shouldRevalidate({currentUrl:new URL(s.pathname+s.search+s.hash,window.origin),currentParams:((w=t[0])==null?void 0:w.params)||{},nextUrl:new URL(n,window.origin),nextParams:f.params,defaultShouldRevalidate:!0});if(typeof T=="boolean")return T}return!0}):[]}function YR(n,e,{includeHydrateFallback:t}={}){return XR(n.map(r=>{let s=e.routes[r.route.id];if(!s)return[];let a=[s.module];return s.clientActionModule&&(a=a.concat(s.clientActionModule)),s.clientLoaderModule&&(a=a.concat(s.clientLoaderModule)),t&&s.hydrateFallbackModule&&(a=a.concat(s.hydrateFallbackModule)),s.imports&&(a=a.concat(s.imports)),a}).flat(1))}function XR(n){return[...new Set(n)]}function JR(n){let e={},t=Object.keys(n).sort();for(let r of t)e[r]=n[r];return e}function ZR(n,e){let t=new Set;return new Set(e),n.reduce((r,s)=>{let a=JSON.stringify(JR(s));return t.has(a)||(t.add(a),r.push({key:a,link:s})),r},[])}var ek=new Set([100,101,204,205]);function tk(n,e){let t=typeof n=="string"?new URL(n,typeof window>"u"?"server://singlefetch/":window.location.origin):n;return t.pathname==="/"?t.pathname="_root.data":e&&Ii(t.pathname,e)==="/"?t.pathname=`${e.replace(/\/$/,"")}/_root.data`:t.pathname=`${t.pathname.replace(/\/$/,"")}.data`,t}function yE(){let n=W.useContext(Ga);return Tg(n,"You must render this element inside a <DataRouterContext.Provider> element"),n}function nk(){let n=W.useContext(Od);return Tg(n,"You must render this element inside a <DataRouterStateContext.Provider> element"),n}var Ig=W.createContext(void 0);Ig.displayName="FrameworkContext";function vE(){let n=W.useContext(Ig);return Tg(n,"You must render this element inside a <HydratedRouter> element"),n}function rk(n,e){let t=W.useContext(Ig),[r,s]=W.useState(!1),[a,u]=W.useState(!1),{onFocus:h,onBlur:f,onMouseEnter:p,onMouseLeave:y,onTouchStart:w}=e,T=W.useRef(null);W.useEffect(()=>{if(n==="render"&&u(!0),n==="viewport"){let M=H=>{H.forEach(Z=>{u(Z.isIntersecting)})},D=new IntersectionObserver(M,{threshold:.5});return T.current&&D.observe(T.current),()=>{D.disconnect()}}},[n]),W.useEffect(()=>{if(r){let M=setTimeout(()=>{u(!0)},100);return()=>{clearTimeout(M)}}},[r]);let C=()=>{s(!0)},A=()=>{s(!1),u(!1)};return t?n!=="intent"?[a,T,{}]:[a,T,{onFocus:nu(h,C),onBlur:nu(f,A),onMouseEnter:nu(p,C),onMouseLeave:nu(y,A),onTouchStart:nu(w,C)}]:[!1,T,{}]}function nu(n,e){return t=>{n&&n(t),t.defaultPrevented||e(t)}}function ik({page:n,...e}){let{router:t}=yE(),r=W.useMemo(()=>uE(t.routes,n,t.basename),[t.routes,n,t.basename]);return r?W.createElement(ok,{page:n,matches:r,...e}):null}function sk(n){let{manifest:e,routeModules:t}=vE(),[r,s]=W.useState([]);return W.useEffect(()=>{let a=!1;return QR(n,e,t).then(u=>{a||s(u)}),()=>{a=!0}},[n,e,t]),r}function ok({page:n,matches:e,...t}){let r=Hr(),{manifest:s,routeModules:a}=vE(),{basename:u}=yE(),{loaderData:h,matches:f}=nk(),p=W.useMemo(()=>V0(n,e,f,s,r,"data"),[n,e,f,s,r]),y=W.useMemo(()=>V0(n,e,f,s,r,"assets"),[n,e,f,s,r]),w=W.useMemo(()=>{if(n===r.pathname+r.search+r.hash)return[];let A=new Set,M=!1;if(e.forEach(H=>{var K;let Z=s.routes[H.route.id];!Z||!Z.hasLoader||(!p.some(re=>re.route.id===H.route.id)&&H.route.id in h&&((K=a[H.route.id])!=null&&K.shouldRevalidate)||Z.hasClientLoader?M=!0:A.add(H.route.id))}),A.size===0)return[];let D=tk(n,u);return M&&A.size>0&&D.searchParams.set("_routes",e.filter(H=>A.has(H.route.id)).map(H=>H.route.id).join(",")),[D.pathname+D.search]},[u,h,r,s,p,e,n,a]),T=W.useMemo(()=>YR(y,s),[y,s]),C=sk(y);return W.createElement(W.Fragment,null,w.map(A=>W.createElement("link",{key:A,rel:"prefetch",as:"fetch",href:A,...t})),T.map(A=>W.createElement("link",{key:A,rel:"modulepreload",href:A,...t})),C.map(({key:A,link:M})=>W.createElement("link",{key:A,...M})))}function ak(...n){return e=>{n.forEach(t=>{typeof t=="function"?t(e):t!=null&&(t.current=e)})}}var wE=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";try{wE&&(window.__reactRouterVersion="7.5.3")}catch{}function lk({basename:n,children:e,window:t}){let r=W.useRef();r.current==null&&(r.current=YC({window:t,v5Compat:!0}));let s=r.current,[a,u]=W.useState({action:s.action,location:s.location}),h=W.useCallback(f=>{W.startTransition(()=>u(f))},[u]);return W.useLayoutEffect(()=>s.listen(h),[s,h]),W.createElement(VR,{basename:n,children:e,location:a.location,navigationType:a.action,navigator:s})}var EE=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Sg=W.forwardRef(function({onClick:e,discover:t="render",prefetch:r="none",relative:s,reloadDocument:a,replace:u,state:h,target:f,to:p,preventScrollReset:y,viewTransition:w,...T},C){let{basename:A}=W.useContext(Tr),M=typeof p=="string"&&EE.test(p),D,H=!1;if(typeof p=="string"&&M&&(D=p,wE))try{let R=new URL(window.location.href),N=p.startsWith("//")?new URL(R.protocol+p):new URL(p),b=Ii(N.pathname,A);N.origin===R.origin&&b!=null?p=b+N.search+N.hash:H=!0}catch{yr(!1,`<Link to="${p}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}let Z=TR(p,{relative:s}),[K,re,Ie]=rk(r,T),we=dk(p,{replace:u,state:h,target:f,preventScrollReset:y,relative:s,viewTransition:w});function O(R){e&&e(R),R.defaultPrevented||we(R)}let S=W.createElement("a",{...T,...Ie,href:D||Z,onClick:H||a?e:O,ref:ak(C,re),target:f,"data-discover":!M&&t==="render"?"true":void 0});return K&&!M?W.createElement(W.Fragment,null,S,W.createElement(ik,{page:Z})):S});Sg.displayName="Link";var uk=W.forwardRef(function({"aria-current":e="page",caseSensitive:t=!1,className:r="",end:s=!1,style:a,to:u,viewTransition:h,children:f,...p},y){let w=zu(u,{relative:p.relative}),T=Hr(),C=W.useContext(Od),{navigator:A,basename:M}=W.useContext(Tr),D=C!=null&&_k(w)&&h===!0,H=A.encodeLocation?A.encodeLocation(w).pathname:w.pathname,Z=T.pathname,K=C&&C.navigation&&C.navigation.location?C.navigation.location.pathname:null;t||(Z=Z.toLowerCase(),K=K?K.toLowerCase():null,H=H.toLowerCase()),K&&M&&(K=Ii(K,M)||K);const re=H!=="/"&&H.endsWith("/")?H.length-1:H.length;let Ie=Z===H||!s&&Z.startsWith(H)&&Z.charAt(re)==="/",we=K!=null&&(K===H||!s&&K.startsWith(H)&&K.charAt(H.length)==="/"),O={isActive:Ie,isPending:we,isTransitioning:D},S=Ie?e:void 0,R;typeof r=="function"?R=r(O):R=[r,Ie?"active":null,we?"pending":null,D?"transitioning":null].filter(Boolean).join(" ");let N=typeof a=="function"?a(O):a;return W.createElement(Sg,{...p,"aria-current":S,className:R,ref:y,style:N,to:u,viewTransition:h},typeof f=="function"?f(O):f)});uk.displayName="NavLink";var ck=W.forwardRef(({discover:n="render",fetcherKey:e,navigate:t,reloadDocument:r,replace:s,state:a,method:u=Vh,action:h,onSubmit:f,relative:p,preventScrollReset:y,viewTransition:w,...T},C)=>{let A=mk(),M=gk(h,{relative:p}),D=u.toLowerCase()==="get"?"get":"post",H=typeof h=="string"&&EE.test(h),Z=K=>{if(f&&f(K),K.defaultPrevented)return;K.preventDefault();let re=K.nativeEvent.submitter,Ie=(re==null?void 0:re.getAttribute("formmethod"))||u;A(re||K.currentTarget,{fetcherKey:e,method:Ie,navigate:t,replace:s,state:a,relative:p,preventScrollReset:y,viewTransition:w})};return W.createElement("form",{ref:C,method:D,action:M,onSubmit:r?f:Z,...T,"data-discover":!H&&n==="render"?"true":void 0})});ck.displayName="Form";function hk(n){return`${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function TE(n){let e=W.useContext(Ga);return ct(e,hk(n)),e}function dk(n,{target:e,replace:t,state:r,preventScrollReset:s,relative:a,viewTransition:u}={}){let h=vg(),f=Hr(),p=zu(n,{relative:a});return W.useCallback(y=>{if(WR(y,e)){y.preventDefault();let w=t!==void 0?t:Su(f)===Su(p);h(n,{replace:w,state:r,preventScrollReset:s,relative:a,viewTransition:u})}},[f,h,p,t,r,e,n,s,a,u])}var fk=0,pk=()=>`__${String(++fk)}__`;function mk(){let{router:n}=TE("useSubmit"),{basename:e}=W.useContext(Tr),t=DR();return W.useCallback(async(r,s={})=>{let{action:a,method:u,encType:h,formData:f,body:p}=qR(r,e);if(s.navigate===!1){let y=s.fetcherKey||pk();await n.fetch(y,t,s.action||a,{preventScrollReset:s.preventScrollReset,formData:f,body:p,formMethod:s.method||u,formEncType:s.encType||h,flushSync:s.flushSync})}else await n.navigate(s.action||a,{preventScrollReset:s.preventScrollReset,formData:f,body:p,formMethod:s.method||u,formEncType:s.encType||h,replace:s.replace,state:s.state,fromRouteId:t,flushSync:s.flushSync,viewTransition:s.viewTransition})},[n,e,t])}function gk(n,{relative:e}={}){let{basename:t}=W.useContext(Tr),r=W.useContext($r);ct(r,"useFormAction must be used inside a RouteContext");let[s]=r.matches.slice(-1),a={...zu(n||".",{relative:e})},u=Hr();if(n==null){a.search=u.search;let h=new URLSearchParams(a.search),f=h.getAll("index");if(f.some(y=>y==="")){h.delete("index"),f.filter(w=>w).forEach(w=>h.append("index",w));let y=h.toString();a.search=y?`?${y}`:""}}return(!n||n===".")&&s.route.index&&(a.search=a.search?a.search.replace(/^\?/,"?index&"):"?index"),t!=="/"&&(a.pathname=a.pathname==="/"?t:vi([t,a.pathname])),Su(a)}function _k(n,e={}){let t=W.useContext(fE);ct(t!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:r}=TE("useViewTransitionState"),s=zu(n,{relative:e.relative});if(!t.isTransitioning)return!1;let a=Ii(t.currentLocation.pathname,r)||t.currentLocation.pathname,u=Ii(t.nextLocation.pathname,r)||t.nextLocation.pathname;return Yh(s.pathname,u)!=null||Yh(s.pathname,a)!=null}new TextEncoder;[...ek];var IE={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},F0=_i.createContext&&_i.createContext(IE),yk=["attr","size","title"];function vk(n,e){if(n==null)return{};var t=wk(n,e),r,s;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(n);for(s=0;s<a.length;s++)r=a[s],!(e.indexOf(r)>=0)&&Object.prototype.propertyIsEnumerable.call(n,r)&&(t[r]=n[r])}return t}function wk(n,e){if(n==null)return{};var t={};for(var r in n)if(Object.prototype.hasOwnProperty.call(n,r)){if(e.indexOf(r)>=0)continue;t[r]=n[r]}return t}function Xh(){return Xh=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(n[r]=t[r])}return n},Xh.apply(this,arguments)}function U0(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);e&&(r=r.filter(function(s){return Object.getOwnPropertyDescriptor(n,s).enumerable})),t.push.apply(t,r)}return t}function Jh(n){for(var e=1;e<arguments.length;e++){var t=arguments[e]!=null?arguments[e]:{};e%2?U0(Object(t),!0).forEach(function(r){Ek(n,r,t[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(t)):U0(Object(t)).forEach(function(r){Object.defineProperty(n,r,Object.getOwnPropertyDescriptor(t,r))})}return n}function Ek(n,e,t){return e=Tk(e),e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}function Tk(n){var e=Ik(n,"string");return typeof e=="symbol"?e:e+""}function Ik(n,e){if(typeof n!="object"||!n)return n;var t=n[Symbol.toPrimitive];if(t!==void 0){var r=t.call(n,e);if(typeof r!="object")return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(n)}function SE(n){return n&&n.map((e,t)=>_i.createElement(e.tag,Jh({key:t},e.attr),SE(e.child)))}function de(n){return e=>_i.createElement(Sk,Xh({attr:Jh({},n.attr)},e),SE(n.child))}function Sk(n){var e=t=>{var{attr:r,size:s,title:a}=n,u=vk(n,yk),h=s||t.size||"1em",f;return t.className&&(f=t.className),n.className&&(f=(f?f+" ":"")+n.className),_i.createElement("svg",Xh({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},t.attr,r,u,{className:f,style:Jh(Jh({color:n.color||t.color},t.style),n.style),height:h,width:h,xmlns:"http://www.w3.org/2000/svg"}),a&&_i.createElement("title",null,a),n.children)};return F0!==void 0?_i.createElement(F0.Consumer,null,t=>e(t)):e(IE)}function jM(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M487.976 0H24.028C2.71 0-8.047 25.866 7.058 40.971L192 225.941V432c0 7.831 3.821 15.17 10.237 19.662l80 55.98C298.02 518.69 320 507.493 320 487.98V225.941l184.947-184.97C520.021 25.896 509.338 0 487.976 0z"},child:[]}]})(n)}function Ck(n){return de({attr:{viewBox:"0 0 640 512"},child:[{tag:"path",attr:{d:"M634 471L36 3.51A16 16 0 0 0 13.51 6l-10 12.49A16 16 0 0 0 6 41l598 467.49a16 16 0 0 0 22.49-2.49l10-12.49A16 16 0 0 0 634 471zM296.79 146.47l134.79 105.38C429.36 191.91 380.48 144 320 144a112.26 112.26 0 0 0-23.21 2.47zm46.42 219.07L208.42 260.16C210.65 320.09 259.53 368 320 368a113 113 0 0 0 23.21-2.46zM320 112c98.65 0 189.09 55 237.93 144a285.53 285.53 0 0 1-44 60.2l37.74 29.5a333.7 333.7 0 0 0 52.9-75.11 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64c-36.7 0-71.71 7-104.63 18.81l46.41 36.29c18.94-4.3 38.34-7.1 58.22-7.1zm0 288c-98.65 0-189.08-55-237.93-144a285.47 285.47 0 0 1 44.05-60.19l-37.74-29.5a333.6 333.6 0 0 0-52.89 75.1 32.35 32.35 0 0 0 0 29.19C89.72 376.41 197.08 448 320 448c36.7 0 71.71-7.05 104.63-18.81l-46.41-36.28C359.28 397.2 339.89 400 320 400z"},child:[]}]})(n)}function Rk(n){return de({attr:{viewBox:"0 0 576 512"},child:[{tag:"path",attr:{d:"M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"},child:[]}]})(n)}const kk=()=>{};var j0={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CE={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oe=function(n,e){if(!n)throw Qa(e)},Qa=function(n){return new Error("Firebase Database ("+CE.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RE=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Ak=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const a=n[t++];e[r++]=String.fromCharCode((s&31)<<6|a&63)}else if(s>239&&s<365){const a=n[t++],u=n[t++],h=n[t++],f=((s&7)<<18|(a&63)<<12|(u&63)<<6|h&63)-65536;e[r++]=String.fromCharCode(55296+(f>>10)),e[r++]=String.fromCharCode(56320+(f&1023))}else{const a=n[t++],u=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(a&63)<<6|u&63)}}return e.join("")},Cg={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const a=n[s],u=s+1<n.length,h=u?n[s+1]:0,f=s+2<n.length,p=f?n[s+2]:0,y=a>>2,w=(a&3)<<4|h>>4;let T=(h&15)<<2|p>>6,C=p&63;f||(C=64,u||(T=64)),r.push(t[y],t[w],t[T],t[C])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(RE(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Ak(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const a=t[n.charAt(s++)],h=s<n.length?t[n.charAt(s)]:0;++s;const p=s<n.length?t[n.charAt(s)]:64;++s;const w=s<n.length?t[n.charAt(s)]:64;if(++s,a==null||h==null||p==null||w==null)throw new Pk;const T=a<<2|h>>4;if(r.push(T),p!==64){const C=h<<4&240|p>>2;if(r.push(C),w!==64){const A=p<<6&192|w;r.push(A)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Pk extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const kE=function(n){const e=RE(n);return Cg.encodeByteArray(e,!0)},Zh=function(n){return kE(n).replace(/\./g,"")},ed=function(n){try{return Cg.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nk(n){return AE(void 0,n)}function AE(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!xk(t)||(n[t]=AE(n[t],e[t]));return n}function xk(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ok(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dk=()=>Ok().__FIREBASE_DEFAULTS__,bk=()=>{if(typeof process>"u"||typeof j0>"u")return;const n=j0.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Lk=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&ed(n[1]);return e&&JSON.parse(e)},bd=()=>{try{return kk()||Dk()||bk()||Lk()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},PE=n=>{var e,t;return(t=(e=bd())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},Ld=n=>{const e=PE(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},NE=()=>{var n;return(n=bd())===null||n===void 0?void 0:n.config},xE=n=>{var e;return(e=bd())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wu{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rg(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,a=n.sub||n.user_id;if(!a)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const u=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:a,user_id:a,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Zh(JSON.stringify(t)),Zh(JSON.stringify(u)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function an(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function kg(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(an())}function Mk(){var n;const e=(n=bd())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Vk(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Fk(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function OE(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Uk(){const n=an();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function jk(){return CE.NODE_ADMIN===!0}function Bk(){return!Mk()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function zk(){try{return typeof indexedDB=="object"}catch{return!1}}function Wk(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var a;e(((a=s.error)===null||a===void 0?void 0:a.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $k="FirebaseError";class Ir extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=$k,Object.setPrototypeOf(this,Ir.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,$u.prototype.create)}}class $u{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,a=this.errors[e],u=a?Hk(a,r):"Error",h=`${this.serviceName}: ${u} (${s}).`;return new Ir(s,h,r)}}function Hk(n,e){return n.replace(qk,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const qk=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cu(n){return JSON.parse(n)}function Kt(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DE=function(n){let e={},t={},r={},s="";try{const a=n.split(".");e=Cu(ed(a[0])||""),t=Cu(ed(a[1])||""),s=a[2],r=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:r,signature:s}},Gk=function(n){const e=DE(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Kk=function(n){const e=DE(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qr(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function xa(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Cm(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function td(n,e,t){const r={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(r[s]=e.call(t,n[s],s,n));return r}function ys(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const a=n[s],u=e[s];if(B0(a)&&B0(u)){if(!ys(a,u))return!1}else if(a!==u)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function B0(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ya(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function lu(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,a]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(a)}}),e}function uu(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qk{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const r=this.W_;if(typeof e=="string")for(let w=0;w<16;w++)r[w]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let w=0;w<16;w++)r[w]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let w=16;w<80;w++){const T=r[w-3]^r[w-8]^r[w-14]^r[w-16];r[w]=(T<<1|T>>>31)&4294967295}let s=this.chain_[0],a=this.chain_[1],u=this.chain_[2],h=this.chain_[3],f=this.chain_[4],p,y;for(let w=0;w<80;w++){w<40?w<20?(p=h^a&(u^h),y=1518500249):(p=a^u^h,y=1859775393):w<60?(p=a&u|h&(a|u),y=2400959708):(p=a^u^h,y=3395469782);const T=(s<<5|s>>>27)+p+f+y+r[w]&4294967295;f=h,h=u,u=(a<<30|a>>>2)&4294967295,a=s,s=T}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+a&4294967295,this.chain_[2]=this.chain_[2]+u&4294967295,this.chain_[3]=this.chain_[3]+h&4294967295,this.chain_[4]=this.chain_[4]+f&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const r=t-this.blockSize;let s=0;const a=this.buf_;let u=this.inbuf_;for(;s<t;){if(u===0)for(;s<=r;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(a[u]=e.charCodeAt(s),++u,++s,u===this.blockSize){this.compress_(a),u=0;break}}else for(;s<t;)if(a[u]=e[s],++u,++s,u===this.blockSize){this.compress_(a),u=0;break}}this.inbuf_=u,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let r=0;for(let s=0;s<5;s++)for(let a=24;a>=0;a-=8)e[r]=this.chain_[s]>>a&255,++r;return e}}function Yk(n,e){const t=new Xk(n,e);return t.subscribe.bind(t)}class Xk{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Jk(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=rm),s.error===void 0&&(s.error=rm),s.complete===void 0&&(s.complete=rm);const a=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),a}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Jk(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function rm(){}function Md(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zk=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);if(s>=55296&&s<=56319){const a=s-55296;r++,oe(r<n.length,"Surrogate pair missing trail surrogate.");const u=n.charCodeAt(r)-56320;s=65536+(a<<10)+u}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Vd=function(n){let e=0;for(let t=0;t<n.length;t++){const r=n.charCodeAt(t);r<128?e++:r<2048?e+=2:r>=55296&&r<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oe(n){return n&&n._delegate?n._delegate:n}class zr{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const io="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eA{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Wu;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(a){if(s)return null;throw a}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(nA(e))try{this.getOrInitializeService({instanceIdentifier:io})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const a=this.getOrInitializeService({instanceIdentifier:s});r.resolve(a)}catch{}}}}clearInstance(e=io){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=io){return this.instances.has(e)}getOptions(e=io){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[a,u]of this.instancesDeferred.entries()){const h=this.normalizeInstanceIdentifier(a);r===h&&u.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),a=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;a.add(e),this.onInitCallbacks.set(s,a);const u=this.instances.get(s);return u&&e(u,s),()=>{a.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:tA(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=io){return this.component?this.component.multipleInstances?e:io:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function tA(n){return n===io?void 0:n}function nA(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rA{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new eA(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var xe;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(xe||(xe={}));const iA={debug:xe.DEBUG,verbose:xe.VERBOSE,info:xe.INFO,warn:xe.WARN,error:xe.ERROR,silent:xe.SILENT},sA=xe.INFO,oA={[xe.DEBUG]:"log",[xe.VERBOSE]:"log",[xe.INFO]:"info",[xe.WARN]:"warn",[xe.ERROR]:"error"},aA=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=oA[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Fd{constructor(e){this.name=e,this._logLevel=sA,this._logHandler=aA,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in xe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?iA[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,xe.DEBUG,...e),this._logHandler(this,xe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,xe.VERBOSE,...e),this._logHandler(this,xe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,xe.INFO,...e),this._logHandler(this,xe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,xe.WARN,...e),this._logHandler(this,xe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,xe.ERROR,...e),this._logHandler(this,xe.ERROR,...e)}}const lA=(n,e)=>e.some(t=>n instanceof t);let z0,W0;function uA(){return z0||(z0=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cA(){return W0||(W0=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const bE=new WeakMap,Rm=new WeakMap,LE=new WeakMap,im=new WeakMap,Ag=new WeakMap;function hA(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",a),n.removeEventListener("error",u)},a=()=>{t(ds(n.result)),s()},u=()=>{r(n.error),s()};n.addEventListener("success",a),n.addEventListener("error",u)});return e.then(t=>{t instanceof IDBCursor&&bE.set(t,n)}).catch(()=>{}),Ag.set(e,n),e}function dA(n){if(Rm.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",a),n.removeEventListener("error",u),n.removeEventListener("abort",u)},a=()=>{t(),s()},u=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",a),n.addEventListener("error",u),n.addEventListener("abort",u)});Rm.set(n,e)}let km={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Rm.get(n);if(e==="objectStoreNames")return n.objectStoreNames||LE.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return ds(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function fA(n){km=n(km)}function pA(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(sm(this),e,...t);return LE.set(r,e.sort?e.sort():[e]),ds(r)}:cA().includes(n)?function(...e){return n.apply(sm(this),e),ds(bE.get(this))}:function(...e){return ds(n.apply(sm(this),e))}}function mA(n){return typeof n=="function"?pA(n):(n instanceof IDBTransaction&&dA(n),lA(n,uA())?new Proxy(n,km):n)}function ds(n){if(n instanceof IDBRequest)return hA(n);if(im.has(n))return im.get(n);const e=mA(n);return e!==n&&(im.set(n,e),Ag.set(e,n)),e}const sm=n=>Ag.get(n);function gA(n,e,{blocked:t,upgrade:r,blocking:s,terminated:a}={}){const u=indexedDB.open(n,e),h=ds(u);return r&&u.addEventListener("upgradeneeded",f=>{r(ds(u.result),f.oldVersion,f.newVersion,ds(u.transaction),f)}),t&&u.addEventListener("blocked",f=>t(f.oldVersion,f.newVersion,f)),h.then(f=>{a&&f.addEventListener("close",()=>a()),s&&f.addEventListener("versionchange",p=>s(p.oldVersion,p.newVersion,p))}).catch(()=>{}),h}const _A=["get","getKey","getAll","getAllKeys","count"],yA=["put","add","delete","clear"],om=new Map;function $0(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(om.get(e))return om.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=yA.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||_A.includes(t)))return;const a=async function(u,...h){const f=this.transaction(u,s?"readwrite":"readonly");let p=f.store;return r&&(p=p.index(h.shift())),(await Promise.all([p[t](...h),s&&f.done]))[0]};return om.set(e,a),a}fA(n=>({...n,get:(e,t,r)=>$0(e,t)||n.get(e,t,r),has:(e,t)=>!!$0(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vA{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(wA(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function wA(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Am="@firebase/app",H0="0.11.5";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Si=new Fd("@firebase/app"),EA="@firebase/app-compat",TA="@firebase/analytics-compat",IA="@firebase/analytics",SA="@firebase/app-check-compat",CA="@firebase/app-check",RA="@firebase/auth",kA="@firebase/auth-compat",AA="@firebase/database",PA="@firebase/data-connect",NA="@firebase/database-compat",xA="@firebase/functions",OA="@firebase/functions-compat",DA="@firebase/installations",bA="@firebase/installations-compat",LA="@firebase/messaging",MA="@firebase/messaging-compat",VA="@firebase/performance",FA="@firebase/performance-compat",UA="@firebase/remote-config",jA="@firebase/remote-config-compat",BA="@firebase/storage",zA="@firebase/storage-compat",WA="@firebase/firestore",$A="@firebase/vertexai",HA="@firebase/firestore-compat",qA="firebase",GA="11.6.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pm="[DEFAULT]",KA={[Am]:"fire-core",[EA]:"fire-core-compat",[IA]:"fire-analytics",[TA]:"fire-analytics-compat",[CA]:"fire-app-check",[SA]:"fire-app-check-compat",[RA]:"fire-auth",[kA]:"fire-auth-compat",[AA]:"fire-rtdb",[PA]:"fire-data-connect",[NA]:"fire-rtdb-compat",[xA]:"fire-fn",[OA]:"fire-fn-compat",[DA]:"fire-iid",[bA]:"fire-iid-compat",[LA]:"fire-fcm",[MA]:"fire-fcm-compat",[VA]:"fire-perf",[FA]:"fire-perf-compat",[UA]:"fire-rc",[jA]:"fire-rc-compat",[BA]:"fire-gcs",[zA]:"fire-gcs-compat",[WA]:"fire-fst",[HA]:"fire-fst-compat",[$A]:"fire-vertex","fire-js":"fire-js",[qA]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nd=new Map,QA=new Map,Nm=new Map;function q0(n,e){try{n.container.addComponent(e)}catch(t){Si.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Ci(n){const e=n.name;if(Nm.has(e))return Si.debug(`There were multiple attempts to register component ${e}.`),!1;Nm.set(e,n);for(const t of nd.values())q0(t,n);for(const t of QA.values())q0(t,n);return!0}function Xa(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function fn(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YA={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},fs=new $u("app","Firebase",YA);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XA{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new zr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw fs.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rs=GA;function ME(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Pm,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw fs.create("bad-app-name",{appName:String(s)});if(t||(t=NE()),!t)throw fs.create("no-options");const a=nd.get(s);if(a){if(ys(t,a.options)&&ys(r,a.config))return a;throw fs.create("duplicate-app",{appName:s})}const u=new rA(s);for(const f of Nm.values())u.addComponent(f);const h=new XA(t,r,u);return nd.set(s,h),h}function Hu(n=Pm){const e=nd.get(n);if(!e&&n===Pm&&NE())return ME();if(!e)throw fs.create("no-app",{appName:n});return e}function Nn(n,e,t){var r;let s=(r=KA[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const a=s.match(/\s|\//),u=e.match(/\s|\//);if(a||u){const h=[`Unable to register library "${s}" with version "${e}":`];a&&h.push(`library name "${s}" contains illegal characters (whitespace or "/")`),a&&u&&h.push("and"),u&&h.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Si.warn(h.join(" "));return}Ci(new zr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JA="firebase-heartbeat-database",ZA=1,Ru="firebase-heartbeat-store";let am=null;function VE(){return am||(am=gA(JA,ZA,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ru)}catch(t){console.warn(t)}}}}).catch(n=>{throw fs.create("idb-open",{originalErrorMessage:n.message})})),am}async function eP(n){try{const t=(await VE()).transaction(Ru),r=await t.objectStore(Ru).get(FE(n));return await t.done,r}catch(e){if(e instanceof Ir)Si.warn(e.message);else{const t=fs.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Si.warn(t.message)}}}async function G0(n,e){try{const r=(await VE()).transaction(Ru,"readwrite");await r.objectStore(Ru).put(e,FE(n)),await r.done}catch(t){if(t instanceof Ir)Si.warn(t.message);else{const r=fs.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Si.warn(r.message)}}}function FE(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tP=1024,nP=30;class rP{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new sP(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=K0();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(u=>u.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:s}),this._heartbeatsCache.heartbeats.length>nP){const u=oP(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(u,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Si.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=K0(),{heartbeatsToSend:r,unsentEntries:s}=iP(this._heartbeatsCache.heartbeats),a=Zh(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(t){return Si.warn(t),""}}}function K0(){return new Date().toISOString().substring(0,10)}function iP(n,e=tP){const t=[];let r=n.slice();for(const s of n){const a=t.find(u=>u.agent===s.agent);if(a){if(a.dates.push(s.date),Q0(t)>e){a.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Q0(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class sP{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return zk()?Wk().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await eP(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return G0(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return G0(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Q0(n){return Zh(JSON.stringify({version:2,heartbeats:n})).length}function oP(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aP(n){Ci(new zr("platform-logger",e=>new vA(e),"PRIVATE")),Ci(new zr("heartbeat",e=>new rP(e),"PRIVATE")),Nn(Am,H0,n),Nn(Am,H0,"esm2017"),Nn("fire-js","")}aP("");var Y0=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ps,UE;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(O,S){function R(){}R.prototype=S.prototype,O.D=S.prototype,O.prototype=new R,O.prototype.constructor=O,O.C=function(N,b,F){for(var P=Array(arguments.length-2),ze=2;ze<arguments.length;ze++)P[ze-2]=arguments[ze];return S.prototype[b].apply(N,P)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(O,S,R){R||(R=0);var N=Array(16);if(typeof S=="string")for(var b=0;16>b;++b)N[b]=S.charCodeAt(R++)|S.charCodeAt(R++)<<8|S.charCodeAt(R++)<<16|S.charCodeAt(R++)<<24;else for(b=0;16>b;++b)N[b]=S[R++]|S[R++]<<8|S[R++]<<16|S[R++]<<24;S=O.g[0],R=O.g[1],b=O.g[2];var F=O.g[3],P=S+(F^R&(b^F))+N[0]+3614090360&4294967295;S=R+(P<<7&4294967295|P>>>25),P=F+(b^S&(R^b))+N[1]+3905402710&4294967295,F=S+(P<<12&4294967295|P>>>20),P=b+(R^F&(S^R))+N[2]+606105819&4294967295,b=F+(P<<17&4294967295|P>>>15),P=R+(S^b&(F^S))+N[3]+3250441966&4294967295,R=b+(P<<22&4294967295|P>>>10),P=S+(F^R&(b^F))+N[4]+4118548399&4294967295,S=R+(P<<7&4294967295|P>>>25),P=F+(b^S&(R^b))+N[5]+1200080426&4294967295,F=S+(P<<12&4294967295|P>>>20),P=b+(R^F&(S^R))+N[6]+2821735955&4294967295,b=F+(P<<17&4294967295|P>>>15),P=R+(S^b&(F^S))+N[7]+4249261313&4294967295,R=b+(P<<22&4294967295|P>>>10),P=S+(F^R&(b^F))+N[8]+1770035416&4294967295,S=R+(P<<7&4294967295|P>>>25),P=F+(b^S&(R^b))+N[9]+2336552879&4294967295,F=S+(P<<12&4294967295|P>>>20),P=b+(R^F&(S^R))+N[10]+4294925233&4294967295,b=F+(P<<17&4294967295|P>>>15),P=R+(S^b&(F^S))+N[11]+2304563134&4294967295,R=b+(P<<22&4294967295|P>>>10),P=S+(F^R&(b^F))+N[12]+1804603682&4294967295,S=R+(P<<7&4294967295|P>>>25),P=F+(b^S&(R^b))+N[13]+4254626195&4294967295,F=S+(P<<12&4294967295|P>>>20),P=b+(R^F&(S^R))+N[14]+2792965006&4294967295,b=F+(P<<17&4294967295|P>>>15),P=R+(S^b&(F^S))+N[15]+1236535329&4294967295,R=b+(P<<22&4294967295|P>>>10),P=S+(b^F&(R^b))+N[1]+4129170786&4294967295,S=R+(P<<5&4294967295|P>>>27),P=F+(R^b&(S^R))+N[6]+3225465664&4294967295,F=S+(P<<9&4294967295|P>>>23),P=b+(S^R&(F^S))+N[11]+643717713&4294967295,b=F+(P<<14&4294967295|P>>>18),P=R+(F^S&(b^F))+N[0]+3921069994&4294967295,R=b+(P<<20&4294967295|P>>>12),P=S+(b^F&(R^b))+N[5]+3593408605&4294967295,S=R+(P<<5&4294967295|P>>>27),P=F+(R^b&(S^R))+N[10]+38016083&4294967295,F=S+(P<<9&4294967295|P>>>23),P=b+(S^R&(F^S))+N[15]+3634488961&4294967295,b=F+(P<<14&4294967295|P>>>18),P=R+(F^S&(b^F))+N[4]+3889429448&4294967295,R=b+(P<<20&4294967295|P>>>12),P=S+(b^F&(R^b))+N[9]+568446438&4294967295,S=R+(P<<5&4294967295|P>>>27),P=F+(R^b&(S^R))+N[14]+3275163606&4294967295,F=S+(P<<9&4294967295|P>>>23),P=b+(S^R&(F^S))+N[3]+4107603335&4294967295,b=F+(P<<14&4294967295|P>>>18),P=R+(F^S&(b^F))+N[8]+1163531501&4294967295,R=b+(P<<20&4294967295|P>>>12),P=S+(b^F&(R^b))+N[13]+2850285829&4294967295,S=R+(P<<5&4294967295|P>>>27),P=F+(R^b&(S^R))+N[2]+4243563512&4294967295,F=S+(P<<9&4294967295|P>>>23),P=b+(S^R&(F^S))+N[7]+1735328473&4294967295,b=F+(P<<14&4294967295|P>>>18),P=R+(F^S&(b^F))+N[12]+2368359562&4294967295,R=b+(P<<20&4294967295|P>>>12),P=S+(R^b^F)+N[5]+4294588738&4294967295,S=R+(P<<4&4294967295|P>>>28),P=F+(S^R^b)+N[8]+2272392833&4294967295,F=S+(P<<11&4294967295|P>>>21),P=b+(F^S^R)+N[11]+1839030562&4294967295,b=F+(P<<16&4294967295|P>>>16),P=R+(b^F^S)+N[14]+4259657740&4294967295,R=b+(P<<23&4294967295|P>>>9),P=S+(R^b^F)+N[1]+2763975236&4294967295,S=R+(P<<4&4294967295|P>>>28),P=F+(S^R^b)+N[4]+1272893353&4294967295,F=S+(P<<11&4294967295|P>>>21),P=b+(F^S^R)+N[7]+4139469664&4294967295,b=F+(P<<16&4294967295|P>>>16),P=R+(b^F^S)+N[10]+3200236656&4294967295,R=b+(P<<23&4294967295|P>>>9),P=S+(R^b^F)+N[13]+681279174&4294967295,S=R+(P<<4&4294967295|P>>>28),P=F+(S^R^b)+N[0]+3936430074&4294967295,F=S+(P<<11&4294967295|P>>>21),P=b+(F^S^R)+N[3]+3572445317&4294967295,b=F+(P<<16&4294967295|P>>>16),P=R+(b^F^S)+N[6]+76029189&4294967295,R=b+(P<<23&4294967295|P>>>9),P=S+(R^b^F)+N[9]+3654602809&4294967295,S=R+(P<<4&4294967295|P>>>28),P=F+(S^R^b)+N[12]+3873151461&4294967295,F=S+(P<<11&4294967295|P>>>21),P=b+(F^S^R)+N[15]+530742520&4294967295,b=F+(P<<16&4294967295|P>>>16),P=R+(b^F^S)+N[2]+3299628645&4294967295,R=b+(P<<23&4294967295|P>>>9),P=S+(b^(R|~F))+N[0]+4096336452&4294967295,S=R+(P<<6&4294967295|P>>>26),P=F+(R^(S|~b))+N[7]+1126891415&4294967295,F=S+(P<<10&4294967295|P>>>22),P=b+(S^(F|~R))+N[14]+2878612391&4294967295,b=F+(P<<15&4294967295|P>>>17),P=R+(F^(b|~S))+N[5]+4237533241&4294967295,R=b+(P<<21&4294967295|P>>>11),P=S+(b^(R|~F))+N[12]+1700485571&4294967295,S=R+(P<<6&4294967295|P>>>26),P=F+(R^(S|~b))+N[3]+2399980690&4294967295,F=S+(P<<10&4294967295|P>>>22),P=b+(S^(F|~R))+N[10]+4293915773&4294967295,b=F+(P<<15&4294967295|P>>>17),P=R+(F^(b|~S))+N[1]+2240044497&4294967295,R=b+(P<<21&4294967295|P>>>11),P=S+(b^(R|~F))+N[8]+1873313359&4294967295,S=R+(P<<6&4294967295|P>>>26),P=F+(R^(S|~b))+N[15]+4264355552&4294967295,F=S+(P<<10&4294967295|P>>>22),P=b+(S^(F|~R))+N[6]+2734768916&4294967295,b=F+(P<<15&4294967295|P>>>17),P=R+(F^(b|~S))+N[13]+1309151649&4294967295,R=b+(P<<21&4294967295|P>>>11),P=S+(b^(R|~F))+N[4]+4149444226&4294967295,S=R+(P<<6&4294967295|P>>>26),P=F+(R^(S|~b))+N[11]+3174756917&4294967295,F=S+(P<<10&4294967295|P>>>22),P=b+(S^(F|~R))+N[2]+718787259&4294967295,b=F+(P<<15&4294967295|P>>>17),P=R+(F^(b|~S))+N[9]+3951481745&4294967295,O.g[0]=O.g[0]+S&4294967295,O.g[1]=O.g[1]+(b+(P<<21&4294967295|P>>>11))&4294967295,O.g[2]=O.g[2]+b&4294967295,O.g[3]=O.g[3]+F&4294967295}r.prototype.u=function(O,S){S===void 0&&(S=O.length);for(var R=S-this.blockSize,N=this.B,b=this.h,F=0;F<S;){if(b==0)for(;F<=R;)s(this,O,F),F+=this.blockSize;if(typeof O=="string"){for(;F<S;)if(N[b++]=O.charCodeAt(F++),b==this.blockSize){s(this,N),b=0;break}}else for(;F<S;)if(N[b++]=O[F++],b==this.blockSize){s(this,N),b=0;break}}this.h=b,this.o+=S},r.prototype.v=function(){var O=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);O[0]=128;for(var S=1;S<O.length-8;++S)O[S]=0;var R=8*this.o;for(S=O.length-8;S<O.length;++S)O[S]=R&255,R/=256;for(this.u(O),O=Array(16),S=R=0;4>S;++S)for(var N=0;32>N;N+=8)O[R++]=this.g[S]>>>N&255;return O};function a(O,S){var R=h;return Object.prototype.hasOwnProperty.call(R,O)?R[O]:R[O]=S(O)}function u(O,S){this.h=S;for(var R=[],N=!0,b=O.length-1;0<=b;b--){var F=O[b]|0;N&&F==S||(R[b]=F,N=!1)}this.g=R}var h={};function f(O){return-128<=O&&128>O?a(O,function(S){return new u([S|0],0>S?-1:0)}):new u([O|0],0>O?-1:0)}function p(O){if(isNaN(O)||!isFinite(O))return w;if(0>O)return D(p(-O));for(var S=[],R=1,N=0;O>=R;N++)S[N]=O/R|0,R*=4294967296;return new u(S,0)}function y(O,S){if(O.length==0)throw Error("number format error: empty string");if(S=S||10,2>S||36<S)throw Error("radix out of range: "+S);if(O.charAt(0)=="-")return D(y(O.substring(1),S));if(0<=O.indexOf("-"))throw Error('number format error: interior "-" character');for(var R=p(Math.pow(S,8)),N=w,b=0;b<O.length;b+=8){var F=Math.min(8,O.length-b),P=parseInt(O.substring(b,b+F),S);8>F?(F=p(Math.pow(S,F)),N=N.j(F).add(p(P))):(N=N.j(R),N=N.add(p(P)))}return N}var w=f(0),T=f(1),C=f(16777216);n=u.prototype,n.m=function(){if(M(this))return-D(this).m();for(var O=0,S=1,R=0;R<this.g.length;R++){var N=this.i(R);O+=(0<=N?N:4294967296+N)*S,S*=4294967296}return O},n.toString=function(O){if(O=O||10,2>O||36<O)throw Error("radix out of range: "+O);if(A(this))return"0";if(M(this))return"-"+D(this).toString(O);for(var S=p(Math.pow(O,6)),R=this,N="";;){var b=re(R,S).g;R=H(R,b.j(S));var F=((0<R.g.length?R.g[0]:R.h)>>>0).toString(O);if(R=b,A(R))return F+N;for(;6>F.length;)F="0"+F;N=F+N}},n.i=function(O){return 0>O?0:O<this.g.length?this.g[O]:this.h};function A(O){if(O.h!=0)return!1;for(var S=0;S<O.g.length;S++)if(O.g[S]!=0)return!1;return!0}function M(O){return O.h==-1}n.l=function(O){return O=H(this,O),M(O)?-1:A(O)?0:1};function D(O){for(var S=O.g.length,R=[],N=0;N<S;N++)R[N]=~O.g[N];return new u(R,~O.h).add(T)}n.abs=function(){return M(this)?D(this):this},n.add=function(O){for(var S=Math.max(this.g.length,O.g.length),R=[],N=0,b=0;b<=S;b++){var F=N+(this.i(b)&65535)+(O.i(b)&65535),P=(F>>>16)+(this.i(b)>>>16)+(O.i(b)>>>16);N=P>>>16,F&=65535,P&=65535,R[b]=P<<16|F}return new u(R,R[R.length-1]&-2147483648?-1:0)};function H(O,S){return O.add(D(S))}n.j=function(O){if(A(this)||A(O))return w;if(M(this))return M(O)?D(this).j(D(O)):D(D(this).j(O));if(M(O))return D(this.j(D(O)));if(0>this.l(C)&&0>O.l(C))return p(this.m()*O.m());for(var S=this.g.length+O.g.length,R=[],N=0;N<2*S;N++)R[N]=0;for(N=0;N<this.g.length;N++)for(var b=0;b<O.g.length;b++){var F=this.i(N)>>>16,P=this.i(N)&65535,ze=O.i(b)>>>16,Xe=O.i(b)&65535;R[2*N+2*b]+=P*Xe,Z(R,2*N+2*b),R[2*N+2*b+1]+=F*Xe,Z(R,2*N+2*b+1),R[2*N+2*b+1]+=P*ze,Z(R,2*N+2*b+1),R[2*N+2*b+2]+=F*ze,Z(R,2*N+2*b+2)}for(N=0;N<S;N++)R[N]=R[2*N+1]<<16|R[2*N];for(N=S;N<2*S;N++)R[N]=0;return new u(R,0)};function Z(O,S){for(;(O[S]&65535)!=O[S];)O[S+1]+=O[S]>>>16,O[S]&=65535,S++}function K(O,S){this.g=O,this.h=S}function re(O,S){if(A(S))throw Error("division by zero");if(A(O))return new K(w,w);if(M(O))return S=re(D(O),S),new K(D(S.g),D(S.h));if(M(S))return S=re(O,D(S)),new K(D(S.g),S.h);if(30<O.g.length){if(M(O)||M(S))throw Error("slowDivide_ only works with positive integers.");for(var R=T,N=S;0>=N.l(O);)R=Ie(R),N=Ie(N);var b=we(R,1),F=we(N,1);for(N=we(N,2),R=we(R,2);!A(N);){var P=F.add(N);0>=P.l(O)&&(b=b.add(R),F=P),N=we(N,1),R=we(R,1)}return S=H(O,b.j(S)),new K(b,S)}for(b=w;0<=O.l(S);){for(R=Math.max(1,Math.floor(O.m()/S.m())),N=Math.ceil(Math.log(R)/Math.LN2),N=48>=N?1:Math.pow(2,N-48),F=p(R),P=F.j(S);M(P)||0<P.l(O);)R-=N,F=p(R),P=F.j(S);A(F)&&(F=T),b=b.add(F),O=H(O,P)}return new K(b,O)}n.A=function(O){return re(this,O).h},n.and=function(O){for(var S=Math.max(this.g.length,O.g.length),R=[],N=0;N<S;N++)R[N]=this.i(N)&O.i(N);return new u(R,this.h&O.h)},n.or=function(O){for(var S=Math.max(this.g.length,O.g.length),R=[],N=0;N<S;N++)R[N]=this.i(N)|O.i(N);return new u(R,this.h|O.h)},n.xor=function(O){for(var S=Math.max(this.g.length,O.g.length),R=[],N=0;N<S;N++)R[N]=this.i(N)^O.i(N);return new u(R,this.h^O.h)};function Ie(O){for(var S=O.g.length+1,R=[],N=0;N<S;N++)R[N]=O.i(N)<<1|O.i(N-1)>>>31;return new u(R,O.h)}function we(O,S){var R=S>>5;S%=32;for(var N=O.g.length-R,b=[],F=0;F<N;F++)b[F]=0<S?O.i(F+R)>>>S|O.i(F+R+1)<<32-S:O.i(F+R);return new u(b,O.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,UE=r,u.prototype.add=u.prototype.add,u.prototype.multiply=u.prototype.j,u.prototype.modulo=u.prototype.A,u.prototype.compare=u.prototype.l,u.prototype.toNumber=u.prototype.m,u.prototype.toString=u.prototype.toString,u.prototype.getBits=u.prototype.i,u.fromNumber=p,u.fromString=y,ps=u}).apply(typeof Y0<"u"?Y0:typeof self<"u"?self:typeof window<"u"?window:{});var kh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var jE,cu,BE,Uh,xm,zE,WE,$E;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(c,g,v){return c==Array.prototype||c==Object.prototype||(c[g]=v.value),c};function t(c){c=[typeof globalThis=="object"&&globalThis,c,typeof window=="object"&&window,typeof self=="object"&&self,typeof kh=="object"&&kh];for(var g=0;g<c.length;++g){var v=c[g];if(v&&v.Math==Math)return v}throw Error("Cannot find global object")}var r=t(this);function s(c,g){if(g)e:{var v=r;c=c.split(".");for(var I=0;I<c.length-1;I++){var U=c[I];if(!(U in v))break e;v=v[U]}c=c[c.length-1],I=v[c],g=g(I),g!=I&&g!=null&&e(v,c,{configurable:!0,writable:!0,value:g})}}function a(c,g){c instanceof String&&(c+="");var v=0,I=!1,U={next:function(){if(!I&&v<c.length){var $=v++;return{value:g($,c[$]),done:!1}}return I=!0,{done:!0,value:void 0}}};return U[Symbol.iterator]=function(){return U},U}s("Array.prototype.values",function(c){return c||function(){return a(this,function(g,v){return v})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var u=u||{},h=this||self;function f(c){var g=typeof c;return g=g!="object"?g:c?Array.isArray(c)?"array":g:"null",g=="array"||g=="object"&&typeof c.length=="number"}function p(c){var g=typeof c;return g=="object"&&c!=null||g=="function"}function y(c,g,v){return c.call.apply(c.bind,arguments)}function w(c,g,v){if(!c)throw Error();if(2<arguments.length){var I=Array.prototype.slice.call(arguments,2);return function(){var U=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(U,I),c.apply(g,U)}}return function(){return c.apply(g,arguments)}}function T(c,g,v){return T=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?y:w,T.apply(null,arguments)}function C(c,g){var v=Array.prototype.slice.call(arguments,1);return function(){var I=v.slice();return I.push.apply(I,arguments),c.apply(this,I)}}function A(c,g){function v(){}v.prototype=g.prototype,c.aa=g.prototype,c.prototype=new v,c.prototype.constructor=c,c.Qb=function(I,U,$){for(var ne=Array(arguments.length-2),Qe=2;Qe<arguments.length;Qe++)ne[Qe-2]=arguments[Qe];return g.prototype[U].apply(I,ne)}}function M(c){const g=c.length;if(0<g){const v=Array(g);for(let I=0;I<g;I++)v[I]=c[I];return v}return[]}function D(c,g){for(let v=1;v<arguments.length;v++){const I=arguments[v];if(f(I)){const U=c.length||0,$=I.length||0;c.length=U+$;for(let ne=0;ne<$;ne++)c[U+ne]=I[ne]}else c.push(I)}}class H{constructor(g,v){this.i=g,this.j=v,this.h=0,this.g=null}get(){let g;return 0<this.h?(this.h--,g=this.g,this.g=g.next,g.next=null):g=this.i(),g}}function Z(c){return/^[\s\xa0]*$/.test(c)}function K(){var c=h.navigator;return c&&(c=c.userAgent)?c:""}function re(c){return re[" "](c),c}re[" "]=function(){};var Ie=K().indexOf("Gecko")!=-1&&!(K().toLowerCase().indexOf("webkit")!=-1&&K().indexOf("Edge")==-1)&&!(K().indexOf("Trident")!=-1||K().indexOf("MSIE")!=-1)&&K().indexOf("Edge")==-1;function we(c,g,v){for(const I in c)g.call(v,c[I],I,c)}function O(c,g){for(const v in c)g.call(void 0,c[v],v,c)}function S(c){const g={};for(const v in c)g[v]=c[v];return g}const R="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function N(c,g){let v,I;for(let U=1;U<arguments.length;U++){I=arguments[U];for(v in I)c[v]=I[v];for(let $=0;$<R.length;$++)v=R[$],Object.prototype.hasOwnProperty.call(I,v)&&(c[v]=I[v])}}function b(c){var g=1;c=c.split(":");const v=[];for(;0<g&&c.length;)v.push(c.shift()),g--;return c.length&&v.push(c.join(":")),v}function F(c){h.setTimeout(()=>{throw c},0)}function P(){var c=ge;let g=null;return c.g&&(g=c.g,c.g=c.g.next,c.g||(c.h=null),g.next=null),g}class ze{constructor(){this.h=this.g=null}add(g,v){const I=Xe.get();I.set(g,v),this.h?this.h.next=I:this.g=I,this.h=I}}var Xe=new H(()=>new Dt,c=>c.reset());class Dt{constructor(){this.next=this.g=this.h=null}set(g,v){this.h=g,this.g=v,this.next=null}reset(){this.next=this.g=this.h=null}}let qe,ie=!1,ge=new ze,ae=()=>{const c=h.Promise.resolve(void 0);qe=()=>{c.then(V)}};var V=()=>{for(var c;c=P();){try{c.h.call(c.g)}catch(v){F(v)}var g=Xe;g.j(c),100>g.h&&(g.h++,c.next=g.g,g.g=c)}ie=!1};function q(){this.s=this.s,this.C=this.C}q.prototype.s=!1,q.prototype.ma=function(){this.s||(this.s=!0,this.N())},q.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function le(c,g){this.type=c,this.g=this.target=g,this.defaultPrevented=!1}le.prototype.h=function(){this.defaultPrevented=!0};var ke=function(){if(!h.addEventListener||!Object.defineProperty)return!1;var c=!1,g=Object.defineProperty({},"passive",{get:function(){c=!0}});try{const v=()=>{};h.addEventListener("test",v,g),h.removeEventListener("test",v,g)}catch{}return c}();function Ae(c,g){if(le.call(this,c?c.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,c){var v=this.type=c.type,I=c.changedTouches&&c.changedTouches.length?c.changedTouches[0]:null;if(this.target=c.target||c.srcElement,this.g=g,g=c.relatedTarget){if(Ie){e:{try{re(g.nodeName);var U=!0;break e}catch{}U=!1}U||(g=null)}}else v=="mouseover"?g=c.fromElement:v=="mouseout"&&(g=c.toElement);this.relatedTarget=g,I?(this.clientX=I.clientX!==void 0?I.clientX:I.pageX,this.clientY=I.clientY!==void 0?I.clientY:I.pageY,this.screenX=I.screenX||0,this.screenY=I.screenY||0):(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0),this.button=c.button,this.key=c.key||"",this.ctrlKey=c.ctrlKey,this.altKey=c.altKey,this.shiftKey=c.shiftKey,this.metaKey=c.metaKey,this.pointerId=c.pointerId||0,this.pointerType=typeof c.pointerType=="string"?c.pointerType:Ve[c.pointerType]||"",this.state=c.state,this.i=c,c.defaultPrevented&&Ae.aa.h.call(this)}}A(Ae,le);var Ve={2:"touch",3:"pen",4:"mouse"};Ae.prototype.h=function(){Ae.aa.h.call(this);var c=this.i;c.preventDefault?c.preventDefault():c.returnValue=!1};var $e="closure_listenable_"+(1e6*Math.random()|0),He=0;function Ze(c,g,v,I,U){this.listener=c,this.proxy=null,this.src=g,this.type=v,this.capture=!!I,this.ha=U,this.key=++He,this.da=this.fa=!1}function bt(c){c.da=!0,c.listener=null,c.proxy=null,c.src=null,c.ha=null}function Qr(c){this.src=c,this.g={},this.h=0}Qr.prototype.add=function(c,g,v,I,U){var $=c.toString();c=this.g[$],c||(c=this.g[$]=[],this.h++);var ne=Di(c,g,I,U);return-1<ne?(g=c[ne],v||(g.fa=!1)):(g=new Ze(g,this.src,$,!!I,U),g.fa=v,c.push(g)),g};function Co(c,g){var v=g.type;if(v in c.g){var I=c.g[v],U=Array.prototype.indexOf.call(I,g,void 0),$;($=0<=U)&&Array.prototype.splice.call(I,U,1),$&&(bt(g),c.g[v].length==0&&(delete c.g[v],c.h--))}}function Di(c,g,v,I){for(var U=0;U<c.length;++U){var $=c[U];if(!$.da&&$.listener==g&&$.capture==!!v&&$.ha==I)return U}return-1}var Ns="closure_lm_"+(1e6*Math.random()|0),Ro={};function ol(c,g,v,I,U){if(Array.isArray(g)){for(var $=0;$<g.length;$++)ol(c,g[$],v,I,U);return null}return v=ul(v),c&&c[$e]?c.K(g,v,p(I)?!!I.capture:!1,U):al(c,g,v,!1,I,U)}function al(c,g,v,I,U,$){if(!g)throw Error("Invalid event type");var ne=p(U)?!!U.capture:!!U,Qe=Ao(c);if(Qe||(c[Ns]=Qe=new Qr(c)),v=Qe.add(g,v,I,ne,$),v.proxy)return v;if(I=cc(),v.proxy=I,I.src=c,I.listener=v,c.addEventListener)ke||(U=ne),U===void 0&&(U=!1),c.addEventListener(g.toString(),I,U);else if(c.attachEvent)c.attachEvent(Xr(g.toString()),I);else if(c.addListener&&c.removeListener)c.addListener(I);else throw Error("addEventListener and attachEvent are unavailable.");return v}function cc(){function c(v){return g.call(c.src,c.listener,v)}const g=ll;return c}function ko(c,g,v,I,U){if(Array.isArray(g))for(var $=0;$<g.length;$++)ko(c,g[$],v,I,U);else I=p(I)?!!I.capture:!!I,v=ul(v),c&&c[$e]?(c=c.i,g=String(g).toString(),g in c.g&&($=c.g[g],v=Di($,v,I,U),-1<v&&(bt($[v]),Array.prototype.splice.call($,v,1),$.length==0&&(delete c.g[g],c.h--)))):c&&(c=Ao(c))&&(g=c.g[g.toString()],c=-1,g&&(c=Di(g,v,I,U)),(v=-1<c?g[c]:null)&&Yr(v))}function Yr(c){if(typeof c!="number"&&c&&!c.da){var g=c.src;if(g&&g[$e])Co(g.i,c);else{var v=c.type,I=c.proxy;g.removeEventListener?g.removeEventListener(v,I,c.capture):g.detachEvent?g.detachEvent(Xr(v),I):g.addListener&&g.removeListener&&g.removeListener(I),(v=Ao(g))?(Co(v,c),v.h==0&&(v.src=null,g[Ns]=null)):bt(c)}}}function Xr(c){return c in Ro?Ro[c]:Ro[c]="on"+c}function ll(c,g){if(c.da)c=!0;else{g=new Ae(g,this);var v=c.listener,I=c.ha||c.src;c.fa&&Yr(c),c=v.call(I,g)}return c}function Ao(c){return c=c[Ns],c instanceof Qr?c:null}var Po="__closure_events_fn_"+(1e9*Math.random()>>>0);function ul(c){return typeof c=="function"?c:(c[Po]||(c[Po]=function(g){return c.handleEvent(g)}),c[Po])}function Rt(){q.call(this),this.i=new Qr(this),this.M=this,this.F=null}A(Rt,q),Rt.prototype[$e]=!0,Rt.prototype.removeEventListener=function(c,g,v,I){ko(this,c,g,v,I)};function kt(c,g){var v,I=c.F;if(I)for(v=[];I;I=I.F)v.push(I);if(c=c.M,I=g.type||g,typeof g=="string")g=new le(g,c);else if(g instanceof le)g.target=g.target||c;else{var U=g;g=new le(I,c),N(g,U)}if(U=!0,v)for(var $=v.length-1;0<=$;$--){var ne=g.g=v[$];U=Jr(ne,I,!0,g)&&U}if(ne=g.g=c,U=Jr(ne,I,!0,g)&&U,U=Jr(ne,I,!1,g)&&U,v)for($=0;$<v.length;$++)ne=g.g=v[$],U=Jr(ne,I,!1,g)&&U}Rt.prototype.N=function(){if(Rt.aa.N.call(this),this.i){var c=this.i,g;for(g in c.g){for(var v=c.g[g],I=0;I<v.length;I++)bt(v[I]);delete c.g[g],c.h--}}this.F=null},Rt.prototype.K=function(c,g,v,I){return this.i.add(String(c),g,!1,v,I)},Rt.prototype.L=function(c,g,v,I){return this.i.add(String(c),g,!0,v,I)};function Jr(c,g,v,I){if(g=c.i.g[String(g)],!g)return!0;g=g.concat();for(var U=!0,$=0;$<g.length;++$){var ne=g[$];if(ne&&!ne.da&&ne.capture==v){var Qe=ne.listener,At=ne.ha||ne.src;ne.fa&&Co(c.i,ne),U=Qe.call(At,I)!==!1&&U}}return U&&!I.defaultPrevented}function cl(c,g,v){if(typeof c=="function")v&&(c=T(c,v));else if(c&&typeof c.handleEvent=="function")c=T(c.handleEvent,c);else throw Error("Invalid listener argument");return 2147483647<Number(g)?-1:h.setTimeout(c,g||0)}function bi(c){c.g=cl(()=>{c.g=null,c.i&&(c.i=!1,bi(c))},c.l);const g=c.h;c.h=null,c.m.apply(null,g)}class xs extends q{constructor(g,v){super(),this.m=g,this.l=v,this.h=null,this.i=!1,this.g=null}j(g){this.h=arguments,this.g?this.i=!0:bi(this)}N(){super.N(),this.g&&(h.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Os(c){q.call(this),this.h=c,this.g={}}A(Os,q);var hl=[];function dl(c){we(c.g,function(g,v){this.g.hasOwnProperty(v)&&Yr(g)},c),c.g={}}Os.prototype.N=function(){Os.aa.N.call(this),dl(this)},Os.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var fl=h.JSON.stringify,pl=h.JSON.parse,ml=class{stringify(c){return h.JSON.stringify(c,void 0)}parse(c){return h.JSON.parse(c,void 0)}};function Ds(){}Ds.prototype.h=null;function No(c){return c.h||(c.h=c.i())}function xo(){}var jn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Sr(){le.call(this,"d")}A(Sr,le);function Oo(){le.call(this,"c")}A(Oo,le);var Cr={},gl=null;function bs(){return gl=gl||new Rt}Cr.La="serverreachability";function _l(c){le.call(this,Cr.La,c)}A(_l,le);function Zr(c){const g=bs();kt(g,new _l(g))}Cr.STAT_EVENT="statevent";function yl(c,g){le.call(this,Cr.STAT_EVENT,c),this.stat=g}A(yl,le);function _t(c){const g=bs();kt(g,new yl(g,c))}Cr.Ma="timingevent";function Do(c,g){le.call(this,Cr.Ma,c),this.size=g}A(Do,le);function er(c,g){if(typeof c!="function")throw Error("Fn must not be null and must be a function");return h.setTimeout(function(){c()},g)}function Ls(){this.g=!0}Ls.prototype.xa=function(){this.g=!1};function Ms(c,g,v,I,U,$){c.info(function(){if(c.g)if($)for(var ne="",Qe=$.split("&"),At=0;At<Qe.length;At++){var Fe=Qe[At].split("=");if(1<Fe.length){var Lt=Fe[0];Fe=Fe[1];var Et=Lt.split("_");ne=2<=Et.length&&Et[1]=="type"?ne+(Lt+"="+Fe+"&"):ne+(Lt+"=redacted&")}}else ne=null;else ne=$;return"XMLHTTP REQ ("+I+") [attempt "+U+"]: "+g+`
`+v+`
`+ne})}function bo(c,g,v,I,U,$,ne){c.info(function(){return"XMLHTTP RESP ("+I+") [ attempt "+U+"]: "+g+`
`+v+`
`+$+" "+ne})}function tr(c,g,v,I){c.info(function(){return"XMLHTTP TEXT ("+g+"): "+wf(c,v)+(I?" "+I:"")})}function vl(c,g){c.info(function(){return"TIMEOUT: "+g})}Ls.prototype.info=function(){};function wf(c,g){if(!c.g)return g;if(!g)return null;try{var v=JSON.parse(g);if(v){for(c=0;c<v.length;c++)if(Array.isArray(v[c])){var I=v[c];if(!(2>I.length)){var U=I[1];if(Array.isArray(U)&&!(1>U.length)){var $=U[0];if($!="noop"&&$!="stop"&&$!="close")for(var ne=1;ne<U.length;ne++)U[ne]=""}}}}return fl(v)}catch{return g}}var Lo={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},hc={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},nr;function Vs(){}A(Vs,Ds),Vs.prototype.g=function(){return new XMLHttpRequest},Vs.prototype.i=function(){return{}},nr=new Vs;function rr(c,g,v,I){this.j=c,this.i=g,this.l=v,this.R=I||1,this.U=new Os(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new dc}function dc(){this.i=null,this.g="",this.h=!1}var wl={},Mo={};function Vo(c,g,v){c.L=1,c.v=Ui(Dn(g)),c.m=v,c.P=!0,El(c,null)}function El(c,g){c.F=Date.now(),et(c),c.A=Dn(c.v);var v=c.A,I=c.R;Array.isArray(I)||(I=[String(I)]),Bi(v.i,"t",I),c.C=0,v=c.j.J,c.h=new dc,c.g=Nc(c.j,v?g:null,!c.m),0<c.O&&(c.M=new xs(T(c.Y,c,c.g),c.O)),g=c.U,v=c.g,I=c.ca;var U="readystatechange";Array.isArray(U)||(U&&(hl[0]=U.toString()),U=hl);for(var $=0;$<U.length;$++){var ne=ol(v,U[$],I||g.handleEvent,!1,g.h||g);if(!ne)break;g.g[ne.key]=ne}g=c.H?S(c.H):{},c.m?(c.u||(c.u="POST"),g["Content-Type"]="application/x-www-form-urlencoded",c.g.ea(c.A,c.u,c.m,g)):(c.u="GET",c.g.ea(c.A,c.u,null,g)),Zr(),Ms(c.i,c.u,c.A,c.l,c.R,c.m)}rr.prototype.ca=function(c){c=c.target;const g=this.M;g&&yn(c)==3?g.j():this.Y(c)},rr.prototype.Y=function(c){try{if(c==this.g)e:{const Et=yn(this.g);var g=this.g.Ba();const Wn=this.g.Z();if(!(3>Et)&&(Et!=3||this.g&&(this.h.h||this.g.oa()||kl(this.g)))){this.J||Et!=4||g==7||(g==8||0>=Wn?Zr(3):Zr(2)),Fs(this);var v=this.g.Z();this.X=v;t:if(fc(this)){var I=kl(this.g);c="";var U=I.length,$=yn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Bn(this),Li(this);var ne="";break t}this.h.i=new h.TextDecoder}for(g=0;g<U;g++)this.h.h=!0,c+=this.h.i.decode(I[g],{stream:!($&&g==U-1)});I.length=0,this.h.g+=c,this.C=0,ne=this.h.g}else ne=this.g.oa();if(this.o=v==200,bo(this.i,this.u,this.A,this.l,this.R,Et,v),this.o){if(this.T&&!this.K){t:{if(this.g){var Qe,At=this.g;if((Qe=At.g?At.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!Z(Qe)){var Fe=Qe;break t}}Fe=null}if(v=Fe)tr(this.i,this.l,v,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Tl(this,v);else{this.o=!1,this.s=3,_t(12),Bn(this),Li(this);break e}}if(this.P){v=!0;let Ln;for(;!this.J&&this.C<ne.length;)if(Ln=Ef(this,ne),Ln==Mo){Et==4&&(this.s=4,_t(14),v=!1),tr(this.i,this.l,null,"[Incomplete Response]");break}else if(Ln==wl){this.s=4,_t(15),tr(this.i,this.l,ne,"[Invalid Chunk]"),v=!1;break}else tr(this.i,this.l,Ln,null),Tl(this,Ln);if(fc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Et!=4||ne.length!=0||this.h.h||(this.s=1,_t(16),v=!1),this.o=this.o&&v,!v)tr(this.i,this.l,ne,"[Invalid Chunked Response]"),Bn(this),Li(this);else if(0<ne.length&&!this.W){this.W=!0;var Lt=this.j;Lt.g==this&&Lt.ba&&!Lt.M&&(Lt.j.info("Great, no buffering proxy detected. Bytes received: "+ne.length),Pl(Lt),Lt.M=!0,_t(11))}}else tr(this.i,this.l,ne,null),Tl(this,ne);Et==4&&Bn(this),this.o&&!this.J&&(Et==4?Ko(this.j,this):(this.o=!1,et(this)))}else Wo(this.g),v==400&&0<ne.indexOf("Unknown SID")?(this.s=3,_t(12)):(this.s=0,_t(13)),Bn(this),Li(this)}}}catch{}finally{}};function fc(c){return c.g?c.u=="GET"&&c.L!=2&&c.j.Ca:!1}function Ef(c,g){var v=c.C,I=g.indexOf(`
`,v);return I==-1?Mo:(v=Number(g.substring(v,I)),isNaN(v)?wl:(I+=1,I+v>g.length?Mo:(g=g.slice(I,I+v),c.C=I+v,g)))}rr.prototype.cancel=function(){this.J=!0,Bn(this)};function et(c){c.S=Date.now()+c.I,pc(c,c.I)}function pc(c,g){if(c.B!=null)throw Error("WatchDog timer not null");c.B=er(T(c.ba,c),g)}function Fs(c){c.B&&(h.clearTimeout(c.B),c.B=null)}rr.prototype.ba=function(){this.B=null;const c=Date.now();0<=c-this.S?(vl(this.i,this.A),this.L!=2&&(Zr(),_t(17)),Bn(this),this.s=2,Li(this)):pc(this,this.S-c)};function Li(c){c.j.G==0||c.J||Ko(c.j,c)}function Bn(c){Fs(c);var g=c.M;g&&typeof g.ma=="function"&&g.ma(),c.M=null,dl(c.U),c.g&&(g=c.g,c.g=null,g.abort(),g.ma())}function Tl(c,g){try{var v=c.j;if(v.G!=0&&(v.g==c||ln(v.h,c))){if(!c.K&&ln(v.h,c)&&v.G==3){try{var I=v.Da.g.parse(g)}catch{I=null}if(Array.isArray(I)&&I.length==3){var U=I;if(U[0]==0){e:if(!v.u){if(v.g)if(v.g.F+3e3<c.F)Go(v),lr(v);else break e;qo(v),_t(18)}}else v.za=U[1],0<v.za-v.T&&37500>U[2]&&v.F&&v.v==0&&!v.C&&(v.C=er(T(v.Za,v),6e3));if(1>=gc(v.h)&&v.ca){try{v.ca()}catch{}v.ca=void 0}}else ii(v,11)}else if((c.K||v.g==c)&&Go(v),!Z(g))for(U=v.Da.g.parse(g),g=0;g<U.length;g++){let Fe=U[g];if(v.T=Fe[0],Fe=Fe[1],v.G==2)if(Fe[0]=="c"){v.K=Fe[1],v.ia=Fe[2];const Lt=Fe[3];Lt!=null&&(v.la=Lt,v.j.info("VER="+v.la));const Et=Fe[4];Et!=null&&(v.Aa=Et,v.j.info("SVER="+v.Aa));const Wn=Fe[5];Wn!=null&&typeof Wn=="number"&&0<Wn&&(I=1.5*Wn,v.L=I,v.j.info("backChannelRequestTimeoutMs_="+I)),I=v;const Ln=c.g;if(Ln){const Hs=Ln.g?Ln.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Hs){var $=I.h;$.g||Hs.indexOf("spdy")==-1&&Hs.indexOf("quic")==-1&&Hs.indexOf("h2")==-1||($.j=$.l,$.g=new Set,$.h&&(Il($,$.h),$.h=null))}if(I.D){const Yo=Ln.g?Ln.g.getResponseHeader("X-HTTP-Session-Id"):null;Yo&&(I.ya=Yo,Je(I.I,I.D,Yo))}}v.G=3,v.l&&v.l.ua(),v.ba&&(v.R=Date.now()-c.F,v.j.info("Handshake RTT: "+v.R+"ms")),I=v;var ne=c;if(I.qa=Pc(I,I.J?I.ia:null,I.W),ne.K){_c(I.h,ne);var Qe=ne,At=I.L;At&&(Qe.I=At),Qe.B&&(Fs(Qe),et(Qe)),I.g=ne}else $s(I);0<v.i.length&&Pr(v)}else Fe[0]!="stop"&&Fe[0]!="close"||ii(v,7);else v.G==3&&(Fe[0]=="stop"||Fe[0]=="close"?Fe[0]=="stop"?ii(v,7):$t(v):Fe[0]!="noop"&&v.l&&v.l.ta(Fe),v.v=0)}}Zr(4)}catch{}}var mc=class{constructor(c,g){this.g=c,this.map=g}};function Us(c){this.l=c||10,h.PerformanceNavigationTiming?(c=h.performance.getEntriesByType("navigation"),c=0<c.length&&(c[0].nextHopProtocol=="hq"||c[0].nextHopProtocol=="h2")):c=!!(h.chrome&&h.chrome.loadTimes&&h.chrome.loadTimes()&&h.chrome.loadTimes().wasFetchedViaSpdy),this.j=c?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function On(c){return c.h?!0:c.g?c.g.size>=c.j:!1}function gc(c){return c.h?1:c.g?c.g.size:0}function ln(c,g){return c.h?c.h==g:c.g?c.g.has(g):!1}function Il(c,g){c.g?c.g.add(g):c.h=g}function _c(c,g){c.h&&c.h==g?c.h=null:c.g&&c.g.has(g)&&c.g.delete(g)}Us.prototype.cancel=function(){if(this.i=yc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const c of this.g.values())c.cancel();this.g.clear()}};function yc(c){if(c.h!=null)return c.i.concat(c.h.D);if(c.g!=null&&c.g.size!==0){let g=c.i;for(const v of c.g.values())g=g.concat(v.D);return g}return M(c.i)}function Fo(c){if(c.V&&typeof c.V=="function")return c.V();if(typeof Map<"u"&&c instanceof Map||typeof Set<"u"&&c instanceof Set)return Array.from(c.values());if(typeof c=="string")return c.split("");if(f(c)){for(var g=[],v=c.length,I=0;I<v;I++)g.push(c[I]);return g}g=[],v=0;for(I in c)g[v++]=c[I];return g}function Uo(c){if(c.na&&typeof c.na=="function")return c.na();if(!c.V||typeof c.V!="function"){if(typeof Map<"u"&&c instanceof Map)return Array.from(c.keys());if(!(typeof Set<"u"&&c instanceof Set)){if(f(c)||typeof c=="string"){var g=[];c=c.length;for(var v=0;v<c;v++)g.push(v);return g}g=[],v=0;for(const I in c)g[v++]=I;return g}}}function Mi(c,g){if(c.forEach&&typeof c.forEach=="function")c.forEach(g,void 0);else if(f(c)||typeof c=="string")Array.prototype.forEach.call(c,g,void 0);else for(var v=Uo(c),I=Fo(c),U=I.length,$=0;$<U;$++)g.call(void 0,I[$],v&&v[$],c)}var js=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Tf(c,g){if(c){c=c.split("&");for(var v=0;v<c.length;v++){var I=c[v].indexOf("="),U=null;if(0<=I){var $=c[v].substring(0,I);U=c[v].substring(I+1)}else $=c[v];g($,U?decodeURIComponent(U.replace(/\+/g," ")):"")}}}function ei(c){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,c instanceof ei){this.h=c.h,Bs(this,c.j),this.o=c.o,this.g=c.g,Vi(this,c.s),this.l=c.l;var g=c.i,v=new Rr;v.i=g.i,g.g&&(v.g=new Map(g.g),v.h=g.h),Fi(this,v),this.m=c.m}else c&&(g=String(c).match(js))?(this.h=!1,Bs(this,g[1]||"",!0),this.o=Le(g[2]||""),this.g=Le(g[3]||"",!0),Vi(this,g[4]),this.l=Le(g[5]||"",!0),Fi(this,g[6]||"",!0),this.m=Le(g[7]||"")):(this.h=!1,this.i=new Rr(null,this.h))}ei.prototype.toString=function(){var c=[],g=this.j;g&&c.push(ji(g,jo,!0),":");var v=this.g;return(v||g=="file")&&(c.push("//"),(g=this.o)&&c.push(ji(g,jo,!0),"@"),c.push(encodeURIComponent(String(v)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),v=this.s,v!=null&&c.push(":",String(v))),(v=this.l)&&(this.g&&v.charAt(0)!="/"&&c.push("/"),c.push(ji(v,v.charAt(0)=="/"?Ec:wc,!0))),(v=this.i.toString())&&c.push("?",v),(v=this.m)&&c.push("#",ji(v,Sl)),c.join("")};function Dn(c){return new ei(c)}function Bs(c,g,v){c.j=v?Le(g,!0):g,c.j&&(c.j=c.j.replace(/:$/,""))}function Vi(c,g){if(g){if(g=Number(g),isNaN(g)||0>g)throw Error("Bad port number "+g);c.s=g}else c.s=null}function Fi(c,g,v){g instanceof Rr?(c.i=g,kr(c.i,c.h)):(v||(g=ji(g,Tc)),c.i=new Rr(g,c.h))}function Je(c,g,v){c.i.set(g,v)}function Ui(c){return Je(c,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),c}function Le(c,g){return c?g?decodeURI(c.replace(/%25/g,"%2525")):decodeURIComponent(c):""}function ji(c,g,v){return typeof c=="string"?(c=encodeURI(c).replace(g,vc),v&&(c=c.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c):null}function vc(c){return c=c.charCodeAt(0),"%"+(c>>4&15).toString(16)+(c&15).toString(16)}var jo=/[#\/\?@]/g,wc=/[#\?:]/g,Ec=/[#\?]/g,Tc=/[#\?@]/g,Sl=/#/g;function Rr(c,g){this.h=this.g=null,this.i=c||null,this.j=!!g}function Wt(c){c.g||(c.g=new Map,c.h=0,c.i&&Tf(c.i,function(g,v){c.add(decodeURIComponent(g.replace(/\+/g," ")),v)}))}n=Rr.prototype,n.add=function(c,g){Wt(this),this.i=null,c=zn(this,c);var v=this.g.get(c);return v||this.g.set(c,v=[]),v.push(g),this.h+=1,this};function ir(c,g){Wt(c),g=zn(c,g),c.g.has(g)&&(c.i=null,c.h-=c.g.get(g).length,c.g.delete(g))}function sr(c,g){return Wt(c),g=zn(c,g),c.g.has(g)}n.forEach=function(c,g){Wt(this),this.g.forEach(function(v,I){v.forEach(function(U){c.call(g,U,I,this)},this)},this)},n.na=function(){Wt(this);const c=Array.from(this.g.values()),g=Array.from(this.g.keys()),v=[];for(let I=0;I<g.length;I++){const U=c[I];for(let $=0;$<U.length;$++)v.push(g[I])}return v},n.V=function(c){Wt(this);let g=[];if(typeof c=="string")sr(this,c)&&(g=g.concat(this.g.get(zn(this,c))));else{c=Array.from(this.g.values());for(let v=0;v<c.length;v++)g=g.concat(c[v])}return g},n.set=function(c,g){return Wt(this),this.i=null,c=zn(this,c),sr(this,c)&&(this.h-=this.g.get(c).length),this.g.set(c,[g]),this.h+=1,this},n.get=function(c,g){return c?(c=this.V(c),0<c.length?String(c[0]):g):g};function Bi(c,g,v){ir(c,g),0<v.length&&(c.i=null,c.g.set(zn(c,g),M(v)),c.h+=v.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const c=[],g=Array.from(this.g.keys());for(var v=0;v<g.length;v++){var I=g[v];const $=encodeURIComponent(String(I)),ne=this.V(I);for(I=0;I<ne.length;I++){var U=$;ne[I]!==""&&(U+="="+encodeURIComponent(String(ne[I]))),c.push(U)}}return this.i=c.join("&")};function zn(c,g){return g=String(g),c.j&&(g=g.toLowerCase()),g}function kr(c,g){g&&!c.j&&(Wt(c),c.i=null,c.g.forEach(function(v,I){var U=I.toLowerCase();I!=U&&(ir(this,I),Bi(this,U,v))},c)),c.j=g}function If(c,g){const v=new Ls;if(h.Image){const I=new Image;I.onload=C(_n,v,"TestLoadImage: loaded",!0,g,I),I.onerror=C(_n,v,"TestLoadImage: error",!1,g,I),I.onabort=C(_n,v,"TestLoadImage: abort",!1,g,I),I.ontimeout=C(_n,v,"TestLoadImage: timeout",!1,g,I),h.setTimeout(function(){I.ontimeout&&I.ontimeout()},1e4),I.src=c}else g(!1)}function Ic(c,g){const v=new Ls,I=new AbortController,U=setTimeout(()=>{I.abort(),_n(v,"TestPingServer: timeout",!1,g)},1e4);fetch(c,{signal:I.signal}).then($=>{clearTimeout(U),$.ok?_n(v,"TestPingServer: ok",!0,g):_n(v,"TestPingServer: server error",!1,g)}).catch(()=>{clearTimeout(U),_n(v,"TestPingServer: error",!1,g)})}function _n(c,g,v,I,U){try{U&&(U.onload=null,U.onerror=null,U.onabort=null,U.ontimeout=null),I(v)}catch{}}function Sf(){this.g=new ml}function Sc(c,g,v){const I=v||"";try{Mi(c,function(U,$){let ne=U;p(U)&&(ne=fl(U)),g.push(I+$+"="+encodeURIComponent(ne))})}catch(U){throw g.push(I+"type="+encodeURIComponent("_badmap")),U}}function ti(c){this.l=c.Ub||null,this.j=c.eb||!1}A(ti,Ds),ti.prototype.g=function(){return new zs(this.l,this.j)},ti.prototype.i=function(c){return function(){return c}}({});function zs(c,g){Rt.call(this),this.D=c,this.o=g,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}A(zs,Rt),n=zs.prototype,n.open=function(c,g){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=c,this.A=g,this.readyState=1,ar(this)},n.send=function(c){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const g={headers:this.u,method:this.B,credentials:this.m,cache:void 0};c&&(g.body=c),(this.D||h).fetch(new Request(this.A,g)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,or(this)),this.readyState=0},n.Sa=function(c){if(this.g&&(this.l=c,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=c.headers,this.readyState=2,ar(this)),this.g&&(this.readyState=3,ar(this),this.g)))if(this.responseType==="arraybuffer")c.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof h.ReadableStream<"u"&&"body"in c){if(this.j=c.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Cc(this)}else c.text().then(this.Ra.bind(this),this.ga.bind(this))};function Cc(c){c.j.read().then(c.Pa.bind(c)).catch(c.ga.bind(c))}n.Pa=function(c){if(this.g){if(this.o&&c.value)this.response.push(c.value);else if(!this.o){var g=c.value?c.value:new Uint8Array(0);(g=this.v.decode(g,{stream:!c.done}))&&(this.response=this.responseText+=g)}c.done?or(this):ar(this),this.readyState==3&&Cc(this)}},n.Ra=function(c){this.g&&(this.response=this.responseText=c,or(this))},n.Qa=function(c){this.g&&(this.response=c,or(this))},n.ga=function(){this.g&&or(this)};function or(c){c.readyState=4,c.l=null,c.j=null,c.v=null,ar(c)}n.setRequestHeader=function(c,g){this.u.append(c,g)},n.getResponseHeader=function(c){return this.h&&this.h.get(c.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const c=[],g=this.h.entries();for(var v=g.next();!v.done;)v=v.value,c.push(v[0]+": "+v[1]),v=g.next();return c.join(`\r
`)};function ar(c){c.onreadystatechange&&c.onreadystatechange.call(c)}Object.defineProperty(zs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(c){this.m=c?"include":"same-origin"}});function ni(c){let g="";return we(c,function(v,I){g+=I,g+=":",g+=v,g+=`\r
`}),g}function zi(c,g,v){e:{for(I in v){var I=!1;break e}I=!0}I||(v=ni(v),typeof c=="string"?v!=null&&encodeURIComponent(String(v)):Je(c,g,v))}function lt(c){Rt.call(this),this.headers=new Map,this.o=c||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}A(lt,Rt);var Cf=/^https?$/i,Cl=["POST","PUT"];n=lt.prototype,n.Ha=function(c){this.J=c},n.ea=function(c,g,v,I){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+c);g=g?g.toUpperCase():"GET",this.D=c,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():nr.g(),this.v=this.o?No(this.o):No(nr),this.g.onreadystatechange=T(this.Ea,this);try{this.B=!0,this.g.open(g,String(c),!0),this.B=!1}catch($){Ws(this,$);return}if(c=v||"",v=new Map(this.headers),I)if(Object.getPrototypeOf(I)===Object.prototype)for(var U in I)v.set(U,I[U]);else if(typeof I.keys=="function"&&typeof I.get=="function")for(const $ of I.keys())v.set($,I.get($));else throw Error("Unknown input type for opt_headers: "+String(I));I=Array.from(v.keys()).find($=>$.toLowerCase()=="content-type"),U=h.FormData&&c instanceof h.FormData,!(0<=Array.prototype.indexOf.call(Cl,g,void 0))||I||U||v.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[$,ne]of v)this.g.setRequestHeader($,ne);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{zo(this),this.u=!0,this.g.send(c),this.u=!1}catch($){Ws(this,$)}};function Ws(c,g){c.h=!1,c.g&&(c.j=!0,c.g.abort(),c.j=!1),c.l=g,c.m=5,Bo(c),bn(c)}function Bo(c){c.A||(c.A=!0,kt(c,"complete"),kt(c,"error"))}n.abort=function(c){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=c||7,kt(this,"complete"),kt(this,"abort"),bn(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),bn(this,!0)),lt.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Rl(this):this.bb())},n.bb=function(){Rl(this)};function Rl(c){if(c.h&&typeof u<"u"&&(!c.v[1]||yn(c)!=4||c.Z()!=2)){if(c.u&&yn(c)==4)cl(c.Ea,0,c);else if(kt(c,"readystatechange"),yn(c)==4){c.h=!1;try{const ne=c.Z();e:switch(ne){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var g=!0;break e;default:g=!1}var v;if(!(v=g)){var I;if(I=ne===0){var U=String(c.D).match(js)[1]||null;!U&&h.self&&h.self.location&&(U=h.self.location.protocol.slice(0,-1)),I=!Cf.test(U?U.toLowerCase():"")}v=I}if(v)kt(c,"complete"),kt(c,"success");else{c.m=6;try{var $=2<yn(c)?c.g.statusText:""}catch{$=""}c.l=$+" ["+c.Z()+"]",Bo(c)}}finally{bn(c)}}}}function bn(c,g){if(c.g){zo(c);const v=c.g,I=c.v[0]?()=>{}:null;c.g=null,c.v=null,g||kt(c,"ready");try{v.onreadystatechange=I}catch{}}}function zo(c){c.I&&(h.clearTimeout(c.I),c.I=null)}n.isActive=function(){return!!this.g};function yn(c){return c.g?c.g.readyState:0}n.Z=function(){try{return 2<yn(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(c){if(this.g){var g=this.g.responseText;return c&&g.indexOf(c)==0&&(g=g.substring(c.length)),pl(g)}};function kl(c){try{if(!c.g)return null;if("response"in c.g)return c.g.response;switch(c.H){case"":case"text":return c.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in c.g)return c.g.mozResponseArrayBuffer}return null}catch{return null}}function Wo(c){const g={};c=(c.g&&2<=yn(c)&&c.g.getAllResponseHeaders()||"").split(`\r
`);for(let I=0;I<c.length;I++){if(Z(c[I]))continue;var v=b(c[I]);const U=v[0];if(v=v[1],typeof v!="string")continue;v=v.trim();const $=g[U]||[];g[U]=$,$.push(v)}O(g,function(I){return I.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ar(c,g,v){return v&&v.internalChannelParams&&v.internalChannelParams[c]||g}function Al(c){this.Aa=0,this.i=[],this.j=new Ls,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ar("failFast",!1,c),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ar("baseRetryDelayMs",5e3,c),this.cb=Ar("retryDelaySeedMs",1e4,c),this.Wa=Ar("forwardChannelMaxRetries",2,c),this.wa=Ar("forwardChannelRequestTimeoutMs",2e4,c),this.pa=c&&c.xmlHttpFactory||void 0,this.Xa=c&&c.Tb||void 0,this.Ca=c&&c.useFetchStreams||!1,this.L=void 0,this.J=c&&c.supportsCrossDomainXhr||!1,this.K="",this.h=new Us(c&&c.concurrentRequestLimit),this.Da=new Sf,this.P=c&&c.fastHandshake||!1,this.O=c&&c.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=c&&c.Rb||!1,c&&c.xa&&this.j.xa(),c&&c.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&c&&c.detectBufferingProxy||!1,this.ja=void 0,c&&c.longPollingTimeout&&0<c.longPollingTimeout&&(this.ja=c.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Al.prototype,n.la=8,n.G=1,n.connect=function(c,g,v,I){_t(0),this.W=c,this.H=g||{},v&&I!==void 0&&(this.H.OSID=v,this.H.OAID=I),this.F=this.X,this.I=Pc(this,null,this.W),Pr(this)};function $t(c){if($o(c),c.G==3){var g=c.U++,v=Dn(c.I);if(Je(v,"SID",c.K),Je(v,"RID",g),Je(v,"TYPE","terminate"),ri(c,v),g=new rr(c,c.j,g),g.L=2,g.v=Ui(Dn(v)),v=!1,h.navigator&&h.navigator.sendBeacon)try{v=h.navigator.sendBeacon(g.v.toString(),"")}catch{}!v&&h.Image&&(new Image().src=g.v,v=!0),v||(g.g=Nc(g.j,null),g.g.ea(g.v)),g.F=Date.now(),et(g)}Ac(c)}function lr(c){c.g&&(Pl(c),c.g.cancel(),c.g=null)}function $o(c){lr(c),c.u&&(h.clearTimeout(c.u),c.u=null),Go(c),c.h.cancel(),c.s&&(typeof c.s=="number"&&h.clearTimeout(c.s),c.s=null)}function Pr(c){if(!On(c.h)&&!c.s){c.s=!0;var g=c.Ga;qe||ae(),ie||(qe(),ie=!0),ge.add(g,c),c.B=0}}function Rf(c,g){return gc(c.h)>=c.h.j-(c.s?1:0)?!1:c.s?(c.i=g.D.concat(c.i),!0):c.G==1||c.G==2||c.B>=(c.Va?0:c.Wa)?!1:(c.s=er(T(c.Ga,c,g),kc(c,c.B)),c.B++,!0)}n.Ga=function(c){if(this.s)if(this.s=null,this.G==1){if(!c){this.U=Math.floor(1e5*Math.random()),c=this.U++;const U=new rr(this,this.j,c);let $=this.o;if(this.S&&($?($=S($),N($,this.S)):$=this.S),this.m!==null||this.O||(U.H=$,$=null),this.P)e:{for(var g=0,v=0;v<this.i.length;v++){t:{var I=this.i[v];if("__data__"in I.map&&(I=I.map.__data__,typeof I=="string")){I=I.length;break t}I=void 0}if(I===void 0)break;if(g+=I,4096<g){g=v;break e}if(g===4096||v===this.i.length-1){g=v+1;break e}}g=1e3}else g=1e3;g=Wi(this,U,g),v=Dn(this.I),Je(v,"RID",c),Je(v,"CVER",22),this.D&&Je(v,"X-HTTP-Session-Id",this.D),ri(this,v),$&&(this.O?g="headers="+encodeURIComponent(String(ni($)))+"&"+g:this.m&&zi(v,this.m,$)),Il(this.h,U),this.Ua&&Je(v,"TYPE","init"),this.P?(Je(v,"$req",g),Je(v,"SID","null"),U.T=!0,Vo(U,v,null)):Vo(U,v,g),this.G=2}}else this.G==3&&(c?Ho(this,c):this.i.length==0||On(this.h)||Ho(this))};function Ho(c,g){var v;g?v=g.l:v=c.U++;const I=Dn(c.I);Je(I,"SID",c.K),Je(I,"RID",v),Je(I,"AID",c.T),ri(c,I),c.m&&c.o&&zi(I,c.m,c.o),v=new rr(c,c.j,v,c.B+1),c.m===null&&(v.H=c.o),g&&(c.i=g.D.concat(c.i)),g=Wi(c,v,1e3),v.I=Math.round(.5*c.wa)+Math.round(.5*c.wa*Math.random()),Il(c.h,v),Vo(v,I,g)}function ri(c,g){c.H&&we(c.H,function(v,I){Je(g,I,v)}),c.l&&Mi({},function(v,I){Je(g,I,v)})}function Wi(c,g,v){v=Math.min(c.i.length,v);var I=c.l?T(c.l.Na,c.l,c):null;e:{var U=c.i;let $=-1;for(;;){const ne=["count="+v];$==-1?0<v?($=U[0].g,ne.push("ofs="+$)):$=0:ne.push("ofs="+$);let Qe=!0;for(let At=0;At<v;At++){let Fe=U[At].g;const Lt=U[At].map;if(Fe-=$,0>Fe)$=Math.max(0,U[At].g-100),Qe=!1;else try{Sc(Lt,ne,"req"+Fe+"_")}catch{I&&I(Lt)}}if(Qe){I=ne.join("&");break e}}}return c=c.i.splice(0,v),g.D=c,I}function $s(c){if(!c.g&&!c.u){c.Y=1;var g=c.Fa;qe||ae(),ie||(qe(),ie=!0),ge.add(g,c),c.v=0}}function qo(c){return c.g||c.u||3<=c.v?!1:(c.Y++,c.u=er(T(c.Fa,c),kc(c,c.v)),c.v++,!0)}n.Fa=function(){if(this.u=null,Rc(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var c=2*this.R;this.j.info("BP detection timer enabled: "+c),this.A=er(T(this.ab,this),c)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,_t(10),lr(this),Rc(this))};function Pl(c){c.A!=null&&(h.clearTimeout(c.A),c.A=null)}function Rc(c){c.g=new rr(c,c.j,"rpc",c.Y),c.m===null&&(c.g.H=c.o),c.g.O=0;var g=Dn(c.qa);Je(g,"RID","rpc"),Je(g,"SID",c.K),Je(g,"AID",c.T),Je(g,"CI",c.F?"0":"1"),!c.F&&c.ja&&Je(g,"TO",c.ja),Je(g,"TYPE","xmlhttp"),ri(c,g),c.m&&c.o&&zi(g,c.m,c.o),c.L&&(c.g.I=c.L);var v=c.g;c=c.ia,v.L=1,v.v=Ui(Dn(g)),v.m=null,v.P=!0,El(v,c)}n.Za=function(){this.C!=null&&(this.C=null,lr(this),qo(this),_t(19))};function Go(c){c.C!=null&&(h.clearTimeout(c.C),c.C=null)}function Ko(c,g){var v=null;if(c.g==g){Go(c),Pl(c),c.g=null;var I=2}else if(ln(c.h,g))v=g.D,_c(c.h,g),I=1;else return;if(c.G!=0){if(g.o)if(I==1){v=g.m?g.m.length:0,g=Date.now()-g.F;var U=c.B;I=bs(),kt(I,new Do(I,v)),Pr(c)}else $s(c);else if(U=g.s,U==3||U==0&&0<g.X||!(I==1&&Rf(c,g)||I==2&&qo(c)))switch(v&&0<v.length&&(g=c.h,g.i=g.i.concat(v)),U){case 1:ii(c,5);break;case 4:ii(c,10);break;case 3:ii(c,6);break;default:ii(c,2)}}}function kc(c,g){let v=c.Ta+Math.floor(Math.random()*c.cb);return c.isActive()||(v*=2),v*g}function ii(c,g){if(c.j.info("Error code "+g),g==2){var v=T(c.fb,c),I=c.Xa;const U=!I;I=new ei(I||"//www.google.com/images/cleardot.gif"),h.location&&h.location.protocol=="http"||Bs(I,"https"),Ui(I),U?If(I.toString(),v):Ic(I.toString(),v)}else _t(2);c.G=0,c.l&&c.l.sa(g),Ac(c),$o(c)}n.fb=function(c){c?(this.j.info("Successfully pinged google.com"),_t(2)):(this.j.info("Failed to ping google.com"),_t(1))};function Ac(c){if(c.G=0,c.ka=[],c.l){const g=yc(c.h);(g.length!=0||c.i.length!=0)&&(D(c.ka,g),D(c.ka,c.i),c.h.i.length=0,M(c.i),c.i.length=0),c.l.ra()}}function Pc(c,g,v){var I=v instanceof ei?Dn(v):new ei(v);if(I.g!="")g&&(I.g=g+"."+I.g),Vi(I,I.s);else{var U=h.location;I=U.protocol,g=g?g+"."+U.hostname:U.hostname,U=+U.port;var $=new ei(null);I&&Bs($,I),g&&($.g=g),U&&Vi($,U),v&&($.l=v),I=$}return v=c.D,g=c.ya,v&&g&&Je(I,v,g),Je(I,"VER",c.la),ri(c,I),I}function Nc(c,g,v){if(g&&!c.J)throw Error("Can't create secondary domain capable XhrIo object.");return g=c.Ca&&!c.pa?new lt(new ti({eb:v})):new lt(c.pa),g.Ha(c.J),g}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Nl(){}n=Nl.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Qo(){}Qo.prototype.g=function(c,g){return new un(c,g)};function un(c,g){Rt.call(this),this.g=new Al(g),this.l=c,this.h=g&&g.messageUrlParams||null,c=g&&g.messageHeaders||null,g&&g.clientProtocolHeaderRequired&&(c?c["X-Client-Protocol"]="webchannel":c={"X-Client-Protocol":"webchannel"}),this.g.o=c,c=g&&g.initMessageHeaders||null,g&&g.messageContentType&&(c?c["X-WebChannel-Content-Type"]=g.messageContentType:c={"X-WebChannel-Content-Type":g.messageContentType}),g&&g.va&&(c?c["X-WebChannel-Client-Profile"]=g.va:c={"X-WebChannel-Client-Profile":g.va}),this.g.S=c,(c=g&&g.Sb)&&!Z(c)&&(this.g.m=c),this.v=g&&g.supportsCrossDomainXhr||!1,this.u=g&&g.sendRawJson||!1,(g=g&&g.httpSessionIdParam)&&!Z(g)&&(this.g.D=g,c=this.h,c!==null&&g in c&&(c=this.h,g in c&&delete c[g])),this.j=new Nr(this)}A(un,Rt),un.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},un.prototype.close=function(){$t(this.g)},un.prototype.o=function(c){var g=this.g;if(typeof c=="string"){var v={};v.__data__=c,c=v}else this.u&&(v={},v.__data__=fl(c),c=v);g.i.push(new mc(g.Ya++,c)),g.G==3&&Pr(g)},un.prototype.N=function(){this.g.l=null,delete this.j,$t(this.g),delete this.g,un.aa.N.call(this)};function xc(c){Sr.call(this),c.__headers__&&(this.headers=c.__headers__,this.statusCode=c.__status__,delete c.__headers__,delete c.__status__);var g=c.__sm__;if(g){e:{for(const v in g){c=v;break e}c=void 0}(this.i=c)&&(c=this.i,g=g!==null&&c in g?g[c]:void 0),this.data=g}else this.data=c}A(xc,Sr);function Oc(){Oo.call(this),this.status=1}A(Oc,Oo);function Nr(c){this.g=c}A(Nr,Nl),Nr.prototype.ua=function(){kt(this.g,"a")},Nr.prototype.ta=function(c){kt(this.g,new xc(c))},Nr.prototype.sa=function(c){kt(this.g,new Oc)},Nr.prototype.ra=function(){kt(this.g,"b")},Qo.prototype.createWebChannel=Qo.prototype.g,un.prototype.send=un.prototype.o,un.prototype.open=un.prototype.m,un.prototype.close=un.prototype.close,$E=function(){return new Qo},WE=function(){return bs()},zE=Cr,xm={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Lo.NO_ERROR=0,Lo.TIMEOUT=8,Lo.HTTP_ERROR=6,Uh=Lo,hc.COMPLETE="complete",BE=hc,xo.EventType=jn,jn.OPEN="a",jn.CLOSE="b",jn.ERROR="c",jn.MESSAGE="d",Rt.prototype.listen=Rt.prototype.K,cu=xo,lt.prototype.listenOnce=lt.prototype.L,lt.prototype.getLastError=lt.prototype.Ka,lt.prototype.getLastErrorCode=lt.prototype.Ba,lt.prototype.getStatus=lt.prototype.Z,lt.prototype.getResponseJson=lt.prototype.Oa,lt.prototype.getResponseText=lt.prototype.oa,lt.prototype.send=lt.prototype.ea,lt.prototype.setWithCredentials=lt.prototype.Ha,jE=lt}).apply(typeof kh<"u"?kh:typeof self<"u"?self:typeof window<"u"?window:{});const X0="@firebase/firestore",J0="4.7.11";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}nn.UNAUTHENTICATED=new nn(null),nn.GOOGLE_CREDENTIALS=new nn("google-credentials-uid"),nn.FIRST_PARTY=new nn("first-party-uid"),nn.MOCK_USER=new nn("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ja="11.6.1";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const co=new Fd("@firebase/firestore");function ya(){return co.logLevel}function ce(n,...e){if(co.logLevel<=xe.DEBUG){const t=e.map(Pg);co.debug(`Firestore (${Ja}): ${n}`,...t)}}function Ri(n,...e){if(co.logLevel<=xe.ERROR){const t=e.map(Pg);co.error(`Firestore (${Ja}): ${n}`,...t)}}function Oa(n,...e){if(co.logLevel<=xe.WARN){const t=e.map(Pg);co.warn(`Firestore (${Ja}): ${n}`,...t)}}function Pg(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Te(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,HE(n,r,t)}function HE(n,e,t){let r=`FIRESTORE (${Ja}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Ri(r),new Error(r)}function Ke(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||HE(e,s,r)}function Re(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class se extends Ir{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wi{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qE{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class lP{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(nn.UNAUTHENTICATED))}shutdown(){}}class uP{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class cP{constructor(e){this.t=e,this.currentUser=nn.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ke(this.o===void 0,42304);let r=this.i;const s=f=>this.i!==r?(r=this.i,t(f)):Promise.resolve();let a=new wi;this.o=()=>{this.i++,this.currentUser=this.u(),a.resolve(),a=new wi,e.enqueueRetryable(()=>s(this.currentUser))};const u=()=>{const f=a;e.enqueueRetryable(async()=>{await f.promise,await s(this.currentUser)})},h=f=>{ce("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=f,this.o&&(this.auth.addAuthTokenListener(this.o),u())};this.t.onInit(f=>h(f)),setTimeout(()=>{if(!this.auth){const f=this.t.getImmediate({optional:!0});f?h(f):(ce("FirebaseAuthCredentialsProvider","Auth not yet detected"),a.resolve(),a=new wi)}},0),u()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(ce("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Ke(typeof r.accessToken=="string",31837,{l:r}),new qE(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Ke(e===null||typeof e=="string",2055,{h:e}),new nn(e)}}class hP{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=nn.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class dP{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new hP(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable(()=>t(nn.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Z0{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class fP{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,fn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){Ke(this.o===void 0,3512);const r=a=>{a.error!=null&&ce("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${a.error.message}`);const u=a.token!==this.m;return this.m=a.token,ce("FirebaseAppCheckTokenProvider",`Received ${u?"new":"existing"} token.`),u?t(a.token):Promise.resolve()};this.o=a=>{e.enqueueRetryable(()=>r(a))};const s=a=>{ce("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=a,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(a=>s(a)),setTimeout(()=>{if(!this.appCheck){const a=this.V.getImmediate({optional:!0});a?s(a):ce("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Z0(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Ke(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Z0(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pP(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GE(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KE{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=pP(40);for(let a=0;a<s.length;++a)r.length<20&&s[a]<t&&(r+=e.charAt(s[a]%62))}return r}}function Pe(n,e){return n<e?-1:n>e?1:0}function Om(n,e){let t=0;for(;t<n.length&&t<e.length;){const r=n.codePointAt(t),s=e.codePointAt(t);if(r!==s){if(r<128&&s<128)return Pe(r,s);{const a=GE(),u=mP(a.encode(e1(n,t)),a.encode(e1(e,t)));return u!==0?u:Pe(r,s)}}t+=r>65535?2:1}return Pe(n.length,e.length)}function e1(n,e){return n.codePointAt(e)>65535?n.substring(e,e+2):n.substring(e,e+1)}function mP(n,e){for(let t=0;t<n.length&&t<e.length;++t)if(n[t]!==e[t])return Pe(n[t],e[t]);return Pe(n.length,e.length)}function Da(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const t1=-62135596800,n1=1e6;class xt{static now(){return xt.fromMillis(Date.now())}static fromDate(e){return xt.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*n1);return new xt(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new se(G.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new se(G.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<t1)throw new se(G.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new se(G.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/n1}_compareTo(e){return this.seconds===e.seconds?Pe(this.nanoseconds,e.nanoseconds):Pe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds-t1;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ce{static fromTimestamp(e){return new Ce(e)}static min(){return new Ce(new xt(0,0))}static max(){return new Ce(new xt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r1="__name__";class Lr{constructor(e,t,r){t===void 0?t=0:t>e.length&&Te(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&Te(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Lr.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Lr?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const a=Lr.compareSegments(e.get(s),t.get(s));if(a!==0)return a}return Pe(e.length,t.length)}static compareSegments(e,t){const r=Lr.isNumericId(e),s=Lr.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?Lr.extractNumericId(e).compare(Lr.extractNumericId(t)):Om(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return ps.fromString(e.substring(4,e.length-2))}}class rt extends Lr{construct(e,t,r){return new rt(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new se(G.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new rt(t)}static emptyPath(){return new rt([])}}const gP=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Qt extends Lr{construct(e,t,r){return new Qt(e,t,r)}static isValidIdentifier(e){return gP.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Qt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===r1}static keyField(){return new Qt([r1])}static fromServerFormat(e){const t=[];let r="",s=0;const a=()=>{if(r.length===0)throw new se(G.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let u=!1;for(;s<e.length;){const h=e[s];if(h==="\\"){if(s+1===e.length)throw new se(G.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const f=e[s+1];if(f!=="\\"&&f!=="."&&f!=="`")throw new se(G.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=f,s+=2}else h==="`"?(u=!u,s++):h!=="."||u?(r+=h,s++):(a(),s++)}if(a(),u)throw new se(G.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Qt(t)}static emptyPath(){return new Qt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _e{constructor(e){this.path=e}static fromPath(e){return new _e(rt.fromString(e))}static fromName(e){return new _e(rt.fromString(e).popFirst(5))}static empty(){return new _e(rt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&rt.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return rt.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new _e(new rt(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ku=-1;function _P(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=Ce.fromTimestamp(r===1e9?new xt(t+1,0):new xt(t,r));return new vs(s,_e.empty(),e)}function yP(n){return new vs(n.readTime,n.key,ku)}class vs{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new vs(Ce.min(),_e.empty(),ku)}static max(){return new vs(Ce.max(),_e.empty(),ku)}}function vP(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=_e.comparator(n.documentKey,e.documentKey),t!==0?t:Pe(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wP="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class EP{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Za(n){if(n.code!==G.FAILED_PRECONDITION||n.message!==wP)throw n;ce("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&Te(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new Y((r,s)=>{this.nextCallback=a=>{this.wrapSuccess(e,a).next(r,s)},this.catchCallback=a=>{this.wrapFailure(t,a).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof Y?t:Y.resolve(t)}catch(t){return Y.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):Y.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):Y.reject(t)}static resolve(e){return new Y((t,r)=>{t(e)})}static reject(e){return new Y((t,r)=>{r(e)})}static waitFor(e){return new Y((t,r)=>{let s=0,a=0,u=!1;e.forEach(h=>{++s,h.next(()=>{++a,u&&a===s&&t()},f=>r(f))}),u=!0,a===s&&t()})}static or(e){let t=Y.resolve(!1);for(const r of e)t=t.next(s=>s?Y.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,a)=>{r.push(t.call(this,s,a))}),this.waitFor(r)}static mapArray(e,t){return new Y((r,s)=>{const a=e.length,u=new Array(a);let h=0;for(let f=0;f<a;f++){const p=f;t(e[p]).next(y=>{u[p]=y,++h,h===a&&r(u)},y=>s(y))}})}static doWhile(e,t){return new Y((r,s)=>{const a=()=>{e()===!0?t().next(()=>{a()},s):r()};a()})}}function TP(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function el(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ud{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ue(r),this.ce=r=>t.writeSequenceNumber(r))}ue(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ce&&this.ce(e),e}}Ud.le=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ng=-1;function jd(n){return n==null}function rd(n){return n===0&&1/n==-1/0}function IP(n){return typeof n=="number"&&Number.isInteger(n)&&!rd(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QE="";function SP(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=i1(e)),e=CP(n.get(t),e);return i1(e)}function CP(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const a=n.charAt(s);switch(a){case"\0":t+="";break;case QE:t+="";break;default:t+=a}}return t}function i1(n){return n+QE+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function s1(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function ks(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function YE(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ct=class Dm{constructor(e,t){this.comparator=e,this.root=t||ms.EMPTY}insert(e,t){return new Dm(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,ms.BLACK,null,null))}remove(e){return new Dm(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ms.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ah(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ah(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ah(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ah(this.root,e,this.comparator,!0)}},Ah=class{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let a=1;for(;!e.isEmpty();)if(a=t?r(e.key,t):1,t&&s&&(a*=-1),a<0)e=this.isReverse?e.left:e.right;else{if(a===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},ms=class fi{constructor(e,t,r,s,a){this.key=e,this.value=t,this.color=r??fi.RED,this.left=s??fi.EMPTY,this.right=a??fi.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,a){return new fi(e??this.key,t??this.value,r??this.color,s??this.left,a??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const a=r(e,s.key);return s=a<0?s.copy(null,null,null,s.left.insert(e,t,r),null):a===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return fi.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return fi.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,fi.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,fi.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Te(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Te(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw Te(27949);return e+(this.isRed()?0:1)}};ms.EMPTY=null,ms.RED=!0,ms.BLACK=!1;ms.EMPTY=new class{constructor(){this.size=0}get key(){throw Te(57766)}get value(){throw Te(16141)}get color(){throw Te(16727)}get left(){throw Te(29726)}get right(){throw Te(36894)}copy(e,t,r,s,a){return this}insert(e,t,r){return new ms(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(e){this.comparator=e,this.data=new Ct(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new o1(this.data.getIterator())}getIteratorFrom(e){return new o1(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof Ot)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,a=r.getNext().key;if(this.comparator(s,a)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Ot(this.comparator);return t.data=e,t}}class o1{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Un{constructor(e){this.fields=e,e.sort(Qt.comparator)}static empty(){return new Un([])}unionWith(e){let t=new Ot(Qt.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Un(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Da(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XE extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(a){throw typeof DOMException<"u"&&a instanceof DOMException?new XE("Invalid base64 string: "+a):a}}(e);return new Yt(t)}static fromUint8Array(e){const t=function(s){let a="";for(let u=0;u<s.length;++u)a+=String.fromCharCode(s[u]);return a}(e);return new Yt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Pe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Yt.EMPTY_BYTE_STRING=new Yt("");const RP=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ws(n){if(Ke(!!n,39018),typeof n=="string"){let e=0;const t=RP.exec(n);if(Ke(!!t,46558,{timestamp:n}),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:wt(n.seconds),nanos:wt(n.nanos)}}function wt(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Es(n){return typeof n=="string"?Yt.fromBase64String(n):Yt.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JE="server_timestamp",ZE="__type__",eT="__previous_value__",tT="__local_write_time__";function Bd(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[ZE])===null||t===void 0?void 0:t.stringValue)===JE}function zd(n){const e=n.mapValue.fields[eT];return Bd(e)?zd(e):e}function Au(n){const e=ws(n.mapValue.fields[tT].timestampValue);return new xt(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kP{constructor(e,t,r,s,a,u,h,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=a,this.forceLongPolling=u,this.autoDetectLongPolling=h,this.longPollingOptions=f,this.useFetchStreams=p}}const id="(default)";class Pu{constructor(e,t){this.projectId=e,this.database=t||id}static empty(){return new Pu("","")}get isDefaultDatabase(){return this.database===id}isEqual(e){return e instanceof Pu&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nT="__type__",AP="__max__",Ph={mapValue:{}},rT="__vector__",sd="value";function Ts(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Bd(n)?4:NP(n)?9007199254740991:PP(n)?10:11:Te(28295,{value:n})}function Wr(n,e){if(n===e)return!0;const t=Ts(n);if(t!==Ts(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Au(n).isEqual(Au(e));case 3:return function(s,a){if(typeof s.timestampValue=="string"&&typeof a.timestampValue=="string"&&s.timestampValue.length===a.timestampValue.length)return s.timestampValue===a.timestampValue;const u=ws(s.timestampValue),h=ws(a.timestampValue);return u.seconds===h.seconds&&u.nanos===h.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,a){return Es(s.bytesValue).isEqual(Es(a.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,a){return wt(s.geoPointValue.latitude)===wt(a.geoPointValue.latitude)&&wt(s.geoPointValue.longitude)===wt(a.geoPointValue.longitude)}(n,e);case 2:return function(s,a){if("integerValue"in s&&"integerValue"in a)return wt(s.integerValue)===wt(a.integerValue);if("doubleValue"in s&&"doubleValue"in a){const u=wt(s.doubleValue),h=wt(a.doubleValue);return u===h?rd(u)===rd(h):isNaN(u)&&isNaN(h)}return!1}(n,e);case 9:return Da(n.arrayValue.values||[],e.arrayValue.values||[],Wr);case 10:case 11:return function(s,a){const u=s.mapValue.fields||{},h=a.mapValue.fields||{};if(s1(u)!==s1(h))return!1;for(const f in u)if(u.hasOwnProperty(f)&&(h[f]===void 0||!Wr(u[f],h[f])))return!1;return!0}(n,e);default:return Te(52216,{left:n})}}function Nu(n,e){return(n.values||[]).find(t=>Wr(t,e))!==void 0}function ba(n,e){if(n===e)return 0;const t=Ts(n),r=Ts(e);if(t!==r)return Pe(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Pe(n.booleanValue,e.booleanValue);case 2:return function(a,u){const h=wt(a.integerValue||a.doubleValue),f=wt(u.integerValue||u.doubleValue);return h<f?-1:h>f?1:h===f?0:isNaN(h)?isNaN(f)?0:-1:1}(n,e);case 3:return a1(n.timestampValue,e.timestampValue);case 4:return a1(Au(n),Au(e));case 5:return Om(n.stringValue,e.stringValue);case 6:return function(a,u){const h=Es(a),f=Es(u);return h.compareTo(f)}(n.bytesValue,e.bytesValue);case 7:return function(a,u){const h=a.split("/"),f=u.split("/");for(let p=0;p<h.length&&p<f.length;p++){const y=Pe(h[p],f[p]);if(y!==0)return y}return Pe(h.length,f.length)}(n.referenceValue,e.referenceValue);case 8:return function(a,u){const h=Pe(wt(a.latitude),wt(u.latitude));return h!==0?h:Pe(wt(a.longitude),wt(u.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return l1(n.arrayValue,e.arrayValue);case 10:return function(a,u){var h,f,p,y;const w=a.fields||{},T=u.fields||{},C=(h=w[sd])===null||h===void 0?void 0:h.arrayValue,A=(f=T[sd])===null||f===void 0?void 0:f.arrayValue,M=Pe(((p=C==null?void 0:C.values)===null||p===void 0?void 0:p.length)||0,((y=A==null?void 0:A.values)===null||y===void 0?void 0:y.length)||0);return M!==0?M:l1(C,A)}(n.mapValue,e.mapValue);case 11:return function(a,u){if(a===Ph.mapValue&&u===Ph.mapValue)return 0;if(a===Ph.mapValue)return 1;if(u===Ph.mapValue)return-1;const h=a.fields||{},f=Object.keys(h),p=u.fields||{},y=Object.keys(p);f.sort(),y.sort();for(let w=0;w<f.length&&w<y.length;++w){const T=Om(f[w],y[w]);if(T!==0)return T;const C=ba(h[f[w]],p[y[w]]);if(C!==0)return C}return Pe(f.length,y.length)}(n.mapValue,e.mapValue);default:throw Te(23264,{Pe:t})}}function a1(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Pe(n,e);const t=ws(n),r=ws(e),s=Pe(t.seconds,r.seconds);return s!==0?s:Pe(t.nanos,r.nanos)}function l1(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const a=ba(t[s],r[s]);if(a)return a}return Pe(t.length,r.length)}function La(n){return bm(n)}function bm(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=ws(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Es(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return _e.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const a of t.values||[])s?s=!1:r+=",",r+=bm(a);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",a=!0;for(const u of r)a?a=!1:s+=",",s+=`${u}:${bm(t.fields[u])}`;return s+"}"}(n.mapValue):Te(61005,{value:n})}function jh(n){switch(Ts(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=zd(n);return e?16+jh(e):16;case 5:return 2*n.stringValue.length;case 6:return Es(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,a)=>s+jh(a),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return ks(r.fields,(a,u)=>{s+=a.length+jh(u)}),s}(n.mapValue);default:throw Te(13486,{value:n})}}function od(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Lm(n){return!!n&&"integerValue"in n}function xg(n){return!!n&&"arrayValue"in n}function u1(n){return!!n&&"nullValue"in n}function c1(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Bh(n){return!!n&&"mapValue"in n}function PP(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{})[nT])===null||t===void 0?void 0:t.stringValue)===rT}function mu(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return ks(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=mu(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=mu(n.arrayValue.values[t]);return e}return Object.assign({},n)}function NP(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===AP}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn{constructor(e){this.value=e}static empty(){return new kn({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Bh(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=mu(t)}setAll(e){let t=Qt.emptyPath(),r={},s=[];e.forEach((u,h)=>{if(!t.isImmediateParentOf(h)){const f=this.getFieldsMap(t);this.applyChanges(f,r,s),r={},s=[],t=h.popLast()}u?r[h.lastSegment()]=mu(u):s.push(h.lastSegment())});const a=this.getFieldsMap(t);this.applyChanges(a,r,s)}delete(e){const t=this.field(e.popLast());Bh(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Wr(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Bh(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){ks(t,(s,a)=>e[s]=a);for(const s of r)delete e[s]}clone(){return new kn(mu(this.value))}}function iT(n){const e=[];return ks(n.fields,(t,r)=>{const s=new Qt([t]);if(Bh(r)){const a=iT(r.mapValue).fields;if(a.length===0)e.push(s);else for(const u of a)e.push(s.child(u))}else e.push(s)}),new Un(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rn{constructor(e,t,r,s,a,u,h){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=a,this.data=u,this.documentState=h}static newInvalidDocument(e){return new rn(e,0,Ce.min(),Ce.min(),Ce.min(),kn.empty(),0)}static newFoundDocument(e,t,r,s){return new rn(e,1,t,Ce.min(),r,s,0)}static newNoDocument(e,t){return new rn(e,2,t,Ce.min(),Ce.min(),kn.empty(),0)}static newUnknownDocument(e,t){return new rn(e,3,t,Ce.min(),Ce.min(),kn.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(Ce.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=kn.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=kn.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Ce.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof rn&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new rn(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ma{constructor(e,t){this.position=e,this.inclusive=t}}function h1(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const a=e[s],u=n.position[s];if(a.field.isKeyField()?r=_e.comparator(_e.fromName(u.referenceValue),t.key):r=ba(u,t.data.field(a.field)),a.dir==="desc"&&(r*=-1),r!==0)break}return r}function d1(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Wr(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xu{constructor(e,t="asc"){this.field=e,this.dir=t}}function xP(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sT{}class St extends sT{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new DP(e,t,r):t==="array-contains"?new MP(e,r):t==="in"?new VP(e,r):t==="not-in"?new FP(e,r):t==="array-contains-any"?new UP(e,r):new St(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new bP(e,r):new LP(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(ba(t,this.value)):t!==null&&Ts(this.value)===Ts(t)&&this.matchesComparison(ba(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return Te(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class vr extends sT{constructor(e,t){super(),this.filters=e,this.op=t,this.Te=null}static create(e,t){return new vr(e,t)}matches(e){return oT(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.Te!==null||(this.Te=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.Te}getFilters(){return Object.assign([],this.filters)}}function oT(n){return n.op==="and"}function aT(n){return OP(n)&&oT(n)}function OP(n){for(const e of n.filters)if(e instanceof vr)return!1;return!0}function Mm(n){if(n instanceof St)return n.field.canonicalString()+n.op.toString()+La(n.value);if(aT(n))return n.filters.map(e=>Mm(e)).join(",");{const e=n.filters.map(t=>Mm(t)).join(",");return`${n.op}(${e})`}}function lT(n,e){return n instanceof St?function(r,s){return s instanceof St&&r.op===s.op&&r.field.isEqual(s.field)&&Wr(r.value,s.value)}(n,e):n instanceof vr?function(r,s){return s instanceof vr&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((a,u,h)=>a&&lT(u,s.filters[h]),!0):!1}(n,e):void Te(19439)}function uT(n){return n instanceof St?function(t){return`${t.field.canonicalString()} ${t.op} ${La(t.value)}`}(n):n instanceof vr?function(t){return t.op.toString()+" {"+t.getFilters().map(uT).join(" ,")+"}"}(n):"Filter"}class DP extends St{constructor(e,t,r){super(e,t,r),this.key=_e.fromName(r.referenceValue)}matches(e){const t=_e.comparator(e.key,this.key);return this.matchesComparison(t)}}class bP extends St{constructor(e,t){super(e,"in",t),this.keys=cT("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class LP extends St{constructor(e,t){super(e,"not-in",t),this.keys=cT("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function cT(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>_e.fromName(r.referenceValue))}class MP extends St{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return xg(t)&&Nu(t.arrayValue,this.value)}}class VP extends St{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Nu(this.value.arrayValue,t)}}class FP extends St{constructor(e,t){super(e,"not-in",t)}matches(e){if(Nu(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!Nu(this.value.arrayValue,t)}}class UP extends St{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!xg(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Nu(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jP{constructor(e,t=null,r=[],s=[],a=null,u=null,h=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=a,this.startAt=u,this.endAt=h,this.Ie=null}}function f1(n,e=null,t=[],r=[],s=null,a=null,u=null){return new jP(n,e,t,r,s,a,u)}function Og(n){const e=Re(n);if(e.Ie===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Mm(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(a){return a.field.canonicalString()+a.dir}(r)).join(","),jd(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>La(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>La(r)).join(",")),e.Ie=t}return e.Ie}function Dg(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!xP(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!lT(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!d1(n.startAt,e.startAt)&&d1(n.endAt,e.endAt)}function Vm(n){return _e.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vo{constructor(e,t=null,r=[],s=[],a=null,u="F",h=null,f=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=a,this.limitType=u,this.startAt=h,this.endAt=f,this.Ee=null,this.de=null,this.Ae=null,this.startAt,this.endAt}}function BP(n,e,t,r,s,a,u,h){return new vo(n,e,t,r,s,a,u,h)}function Wd(n){return new vo(n)}function p1(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function bg(n){return n.collectionGroup!==null}function Sa(n){const e=Re(n);if(e.Ee===null){e.Ee=[];const t=new Set;for(const a of e.explicitOrderBy)e.Ee.push(a),t.add(a.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(u){let h=new Ot(Qt.comparator);return u.filters.forEach(f=>{f.getFlattenedFilters().forEach(p=>{p.isInequality()&&(h=h.add(p.field))})}),h})(e).forEach(a=>{t.has(a.canonicalString())||a.isKeyField()||e.Ee.push(new xu(a,r))}),t.has(Qt.keyField().canonicalString())||e.Ee.push(new xu(Qt.keyField(),r))}return e.Ee}function Fr(n){const e=Re(n);return e.de||(e.de=zP(e,Sa(n))),e.de}function zP(n,e){if(n.limitType==="F")return f1(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const a=s.dir==="desc"?"asc":"desc";return new xu(s.field,a)});const t=n.endAt?new Ma(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Ma(n.startAt.position,n.startAt.inclusive):null;return f1(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Fm(n,e){const t=n.filters.concat([e]);return new vo(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function ad(n,e,t){return new vo(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function $d(n,e){return Dg(Fr(n),Fr(e))&&n.limitType===e.limitType}function hT(n){return`${Og(Fr(n))}|lt:${n.limitType}`}function va(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>uT(s)).join(", ")}]`),jd(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(u){return`${u.field.canonicalString()} (${u.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>La(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>La(s)).join(",")),`Target(${r})`}(Fr(n))}; limitType=${n.limitType})`}function Hd(n,e){return e.isFoundDocument()&&function(r,s){const a=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(a):_e.isDocumentKey(r.path)?r.path.isEqual(a):r.path.isImmediateParentOf(a)}(n,e)&&function(r,s){for(const a of Sa(r))if(!a.field.isKeyField()&&s.data.field(a.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const a of r.filters)if(!a.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(u,h,f){const p=h1(u,h,f);return u.inclusive?p<=0:p<0}(r.startAt,Sa(r),s)||r.endAt&&!function(u,h,f){const p=h1(u,h,f);return u.inclusive?p>=0:p>0}(r.endAt,Sa(r),s))}(n,e)}function WP(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function dT(n){return(e,t)=>{let r=!1;for(const s of Sa(n)){const a=$P(s,e,t);if(a!==0)return a;r=r||s.field.isKeyField()}return 0}}function $P(n,e,t){const r=n.field.isKeyField()?_e.comparator(e.key,t.key):function(a,u,h){const f=u.data.field(a),p=h.data.field(a);return f!==null&&p!==null?ba(f,p):Te(42886)}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return Te(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wo{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,a]of r)if(this.equalsFn(s,e))return a}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let a=0;a<s.length;a++)if(this.equalsFn(s[a][0],e))return void(s[a]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){ks(this.inner,(t,r)=>{for(const[s,a]of r)e(s,a)})}isEmpty(){return YE(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HP=new Ct(_e.comparator);function ki(){return HP}const fT=new Ct(_e.comparator);function hu(...n){let e=fT;for(const t of n)e=e.insert(t.key,t);return e}function pT(n){let e=fT;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function oo(){return gu()}function mT(){return gu()}function gu(){return new wo(n=>n.toString(),(n,e)=>n.isEqual(e))}const qP=new Ct(_e.comparator),GP=new Ot(_e.comparator);function be(...n){let e=GP;for(const t of n)e=e.add(t);return e}const KP=new Ot(Pe);function QP(){return KP}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lg(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:rd(e)?"-0":e}}function gT(n){return{integerValue:""+n}}function YP(n,e){return IP(e)?gT(e):Lg(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qd{constructor(){this._=void 0}}function XP(n,e,t){return n instanceof Ou?function(s,a){const u={fields:{[ZE]:{stringValue:JE},[tT]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return a&&Bd(a)&&(a=zd(a)),a&&(u.fields[eT]=a),{mapValue:u}}(t,e):n instanceof Du?yT(n,e):n instanceof bu?vT(n,e):function(s,a){const u=_T(s,a),h=m1(u)+m1(s.Re);return Lm(u)&&Lm(s.Re)?gT(h):Lg(s.serializer,h)}(n,e)}function JP(n,e,t){return n instanceof Du?yT(n,e):n instanceof bu?vT(n,e):t}function _T(n,e){return n instanceof ld?function(r){return Lm(r)||function(a){return!!a&&"doubleValue"in a}(r)}(e)?e:{integerValue:0}:null}class Ou extends qd{}class Du extends qd{constructor(e){super(),this.elements=e}}function yT(n,e){const t=wT(e);for(const r of n.elements)t.some(s=>Wr(s,r))||t.push(r);return{arrayValue:{values:t}}}class bu extends qd{constructor(e){super(),this.elements=e}}function vT(n,e){let t=wT(e);for(const r of n.elements)t=t.filter(s=>!Wr(s,r));return{arrayValue:{values:t}}}class ld extends qd{constructor(e,t){super(),this.serializer=e,this.Re=t}}function m1(n){return wt(n.integerValue||n.doubleValue)}function wT(n){return xg(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZP{constructor(e,t){this.field=e,this.transform=t}}function e4(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Du&&s instanceof Du||r instanceof bu&&s instanceof bu?Da(r.elements,s.elements,Wr):r instanceof ld&&s instanceof ld?Wr(r.Re,s.Re):r instanceof Ou&&s instanceof Ou}(n.transform,e.transform)}class t4{constructor(e,t){this.version=e,this.transformResults=t}}class Zn{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Zn}static exists(e){return new Zn(void 0,e)}static updateTime(e){return new Zn(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function zh(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Gd{}function ET(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Mg(n.key,Zn.none()):new qu(n.key,n.data,Zn.none());{const t=n.data,r=kn.empty();let s=new Ot(Qt.comparator);for(let a of e.fields)if(!s.has(a)){let u=t.field(a);u===null&&a.length>1&&(a=a.popLast(),u=t.field(a)),u===null?r.delete(a):r.set(a,u),s=s.add(a)}return new As(n.key,r,new Un(s.toArray()),Zn.none())}}function n4(n,e,t){n instanceof qu?function(s,a,u){const h=s.value.clone(),f=_1(s.fieldTransforms,a,u.transformResults);h.setAll(f),a.convertToFoundDocument(u.version,h).setHasCommittedMutations()}(n,e,t):n instanceof As?function(s,a,u){if(!zh(s.precondition,a))return void a.convertToUnknownDocument(u.version);const h=_1(s.fieldTransforms,a,u.transformResults),f=a.data;f.setAll(TT(s)),f.setAll(h),a.convertToFoundDocument(u.version,f).setHasCommittedMutations()}(n,e,t):function(s,a,u){a.convertToNoDocument(u.version).setHasCommittedMutations()}(0,e,t)}function _u(n,e,t,r){return n instanceof qu?function(a,u,h,f){if(!zh(a.precondition,u))return h;const p=a.value.clone(),y=y1(a.fieldTransforms,f,u);return p.setAll(y),u.convertToFoundDocument(u.version,p).setHasLocalMutations(),null}(n,e,t,r):n instanceof As?function(a,u,h,f){if(!zh(a.precondition,u))return h;const p=y1(a.fieldTransforms,f,u),y=u.data;return y.setAll(TT(a)),y.setAll(p),u.convertToFoundDocument(u.version,y).setHasLocalMutations(),h===null?null:h.unionWith(a.fieldMask.fields).unionWith(a.fieldTransforms.map(w=>w.field))}(n,e,t,r):function(a,u,h){return zh(a.precondition,u)?(u.convertToNoDocument(u.version).setHasLocalMutations(),null):h}(n,e,t)}function r4(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),a=_T(r.transform,s||null);a!=null&&(t===null&&(t=kn.empty()),t.set(r.field,a))}return t||null}function g1(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Da(r,s,(a,u)=>e4(a,u))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class qu extends Gd{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class As extends Gd{constructor(e,t,r,s,a=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=a,this.type=1}getFieldMask(){return this.fieldMask}}function TT(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function _1(n,e,t){const r=new Map;Ke(n.length===t.length,32656,{Ve:t.length,me:n.length});for(let s=0;s<t.length;s++){const a=n[s],u=a.transform,h=e.data.field(a.field);r.set(a.field,JP(u,h,t[s]))}return r}function y1(n,e,t){const r=new Map;for(const s of n){const a=s.transform,u=t.data.field(s.field);r.set(s.field,XP(a,u,e))}return r}class Mg extends Gd{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class i4 extends Gd{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s4{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const a=this.mutations[s];a.key.isEqual(e.key)&&n4(a,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=_u(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=_u(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=mT();return this.mutations.forEach(s=>{const a=e.get(s.key),u=a.overlayedDocument;let h=this.applyToLocalView(u,a.mutatedFields);h=t.has(s.key)?null:h;const f=ET(u,h);f!==null&&r.set(s.key,f),u.isValidDocument()||u.convertToNoDocument(Ce.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),be())}isEqual(e){return this.batchId===e.batchId&&Da(this.mutations,e.mutations,(t,r)=>g1(t,r))&&Da(this.baseMutations,e.baseMutations,(t,r)=>g1(t,r))}}class Vg{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){Ke(e.mutations.length===r.length,58842,{fe:e.mutations.length,ge:r.length});let s=function(){return qP}();const a=e.mutations;for(let u=0;u<a.length;u++)s=s.insert(a[u].key,r[u].version);return new Vg(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o4{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a4{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var It,Ue;function l4(n){switch(n){case G.OK:return Te(64938);case G.CANCELLED:case G.UNKNOWN:case G.DEADLINE_EXCEEDED:case G.RESOURCE_EXHAUSTED:case G.INTERNAL:case G.UNAVAILABLE:case G.UNAUTHENTICATED:return!1;case G.INVALID_ARGUMENT:case G.NOT_FOUND:case G.ALREADY_EXISTS:case G.PERMISSION_DENIED:case G.FAILED_PRECONDITION:case G.ABORTED:case G.OUT_OF_RANGE:case G.UNIMPLEMENTED:case G.DATA_LOSS:return!0;default:return Te(15467,{code:n})}}function IT(n){if(n===void 0)return Ri("GRPC error has no .code"),G.UNKNOWN;switch(n){case It.OK:return G.OK;case It.CANCELLED:return G.CANCELLED;case It.UNKNOWN:return G.UNKNOWN;case It.DEADLINE_EXCEEDED:return G.DEADLINE_EXCEEDED;case It.RESOURCE_EXHAUSTED:return G.RESOURCE_EXHAUSTED;case It.INTERNAL:return G.INTERNAL;case It.UNAVAILABLE:return G.UNAVAILABLE;case It.UNAUTHENTICATED:return G.UNAUTHENTICATED;case It.INVALID_ARGUMENT:return G.INVALID_ARGUMENT;case It.NOT_FOUND:return G.NOT_FOUND;case It.ALREADY_EXISTS:return G.ALREADY_EXISTS;case It.PERMISSION_DENIED:return G.PERMISSION_DENIED;case It.FAILED_PRECONDITION:return G.FAILED_PRECONDITION;case It.ABORTED:return G.ABORTED;case It.OUT_OF_RANGE:return G.OUT_OF_RANGE;case It.UNIMPLEMENTED:return G.UNIMPLEMENTED;case It.DATA_LOSS:return G.DATA_LOSS;default:return Te(39323,{code:n})}}(Ue=It||(It={}))[Ue.OK=0]="OK",Ue[Ue.CANCELLED=1]="CANCELLED",Ue[Ue.UNKNOWN=2]="UNKNOWN",Ue[Ue.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ue[Ue.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ue[Ue.NOT_FOUND=5]="NOT_FOUND",Ue[Ue.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ue[Ue.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ue[Ue.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ue[Ue.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ue[Ue.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ue[Ue.ABORTED=10]="ABORTED",Ue[Ue.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ue[Ue.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ue[Ue.INTERNAL=13]="INTERNAL",Ue[Ue.UNAVAILABLE=14]="UNAVAILABLE",Ue[Ue.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const u4=new ps([4294967295,4294967295],0);function v1(n){const e=GE().encode(n),t=new UE;return t.update(e),new Uint8Array(t.digest())}function w1(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),a=e.getUint32(12,!0);return[new ps([t,r],0),new ps([s,a],0)]}class Fg{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new du(`Invalid padding: ${t}`);if(r<0)throw new du(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new du(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new du(`Invalid padding when bitmap length is 0: ${t}`);this.pe=8*e.length-t,this.ye=ps.fromNumber(this.pe)}we(e,t,r){let s=e.add(t.multiply(ps.fromNumber(r)));return s.compare(u4)===1&&(s=new ps([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ye).toNumber()}be(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.pe===0)return!1;const t=v1(e),[r,s]=w1(t);for(let a=0;a<this.hashCount;a++){const u=this.we(r,s,a);if(!this.be(u))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,a=new Uint8Array(Math.ceil(e/8)),u=new Fg(a,s,t);return r.forEach(h=>u.insert(h)),u}insert(e){if(this.pe===0)return;const t=v1(e),[r,s]=w1(t);for(let a=0;a<this.hashCount;a++){const u=this.we(r,s,a);this.Se(u)}}Se(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class du extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(e,t,r,s,a){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=a}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,Gu.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Kd(Ce.min(),s,new Ct(Pe),ki(),be())}}class Gu{constructor(e,t,r,s,a){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=a}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Gu(r,t,be(),be(),be())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wh{constructor(e,t,r,s){this.De=e,this.removedTargetIds=t,this.key=r,this.ve=s}}class ST{constructor(e,t){this.targetId=e,this.Ce=t}}class CT{constructor(e,t,r=Yt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class E1{constructor(){this.Fe=0,this.Me=T1(),this.xe=Yt.EMPTY_BYTE_STRING,this.Oe=!1,this.Ne=!0}get current(){return this.Oe}get resumeToken(){return this.xe}get Be(){return this.Fe!==0}get Le(){return this.Ne}ke(e){e.approximateByteSize()>0&&(this.Ne=!0,this.xe=e)}qe(){let e=be(),t=be(),r=be();return this.Me.forEach((s,a)=>{switch(a){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:Te(38017,{changeType:a})}}),new Gu(this.xe,this.Oe,e,t,r)}Qe(){this.Ne=!1,this.Me=T1()}$e(e,t){this.Ne=!0,this.Me=this.Me.insert(e,t)}Ue(e){this.Ne=!0,this.Me=this.Me.remove(e)}Ke(){this.Fe+=1}We(){this.Fe-=1,Ke(this.Fe>=0,3241,{Fe:this.Fe})}Ge(){this.Ne=!0,this.Oe=!0}}class c4{constructor(e){this.ze=e,this.je=new Map,this.He=ki(),this.Je=Nh(),this.Ye=Nh(),this.Ze=new Ct(Pe)}Xe(e){for(const t of e.De)e.ve&&e.ve.isFoundDocument()?this.et(t,e.ve):this.tt(t,e.key,e.ve);for(const t of e.removedTargetIds)this.tt(t,e.key,e.ve)}nt(e){this.forEachTarget(e,t=>{const r=this.rt(t);switch(e.state){case 0:this.it(t)&&r.ke(e.resumeToken);break;case 1:r.We(),r.Be||r.Qe(),r.ke(e.resumeToken);break;case 2:r.We(),r.Be||this.removeTarget(t);break;case 3:this.it(t)&&(r.Ge(),r.ke(e.resumeToken));break;case 4:this.it(t)&&(this.st(t),r.ke(e.resumeToken));break;default:Te(56790,{state:e.state})}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.je.forEach((r,s)=>{this.it(s)&&t(s)})}ot(e){const t=e.targetId,r=e.Ce.count,s=this._t(t);if(s){const a=s.target;if(Vm(a))if(r===0){const u=new _e(a.path);this.tt(t,u,rn.newNoDocument(u,Ce.min()))}else Ke(r===1,20013,{expectedCount:r});else{const u=this.ut(t);if(u!==r){const h=this.ct(e),f=h?this.lt(h,e,u):1;if(f!==0){this.st(t);const p=f===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,p)}}}}}ct(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:a=0}=t;let u,h;try{u=Es(r).toUint8Array()}catch(f){if(f instanceof XE)return Oa("Decoding the base64 bloom filter in existence filter failed ("+f.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw f}try{h=new Fg(u,s,a)}catch(f){return Oa(f instanceof du?"BloomFilter error: ":"Applying bloom filter failed: ",f),null}return h.pe===0?null:h}lt(e,t,r){return t.Ce.count===r-this.Tt(e,t.targetId)?0:2}Tt(e,t){const r=this.ze.getRemoteKeysForTarget(t);let s=0;return r.forEach(a=>{const u=this.ze.Pt(),h=`projects/${u.projectId}/databases/${u.database}/documents/${a.path.canonicalString()}`;e.mightContain(h)||(this.tt(t,a,null),s++)}),s}It(e){const t=new Map;this.je.forEach((a,u)=>{const h=this._t(u);if(h){if(a.current&&Vm(h.target)){const f=new _e(h.target.path);this.Et(f).has(u)||this.dt(u,f)||this.tt(u,f,rn.newNoDocument(f,e))}a.Le&&(t.set(u,a.qe()),a.Qe())}});let r=be();this.Ye.forEach((a,u)=>{let h=!0;u.forEachWhile(f=>{const p=this._t(f);return!p||p.purpose==="TargetPurposeLimboResolution"||(h=!1,!1)}),h&&(r=r.add(a))}),this.He.forEach((a,u)=>u.setReadTime(e));const s=new Kd(e,t,this.Ze,this.He,r);return this.He=ki(),this.Je=Nh(),this.Ye=Nh(),this.Ze=new Ct(Pe),s}et(e,t){if(!this.it(e))return;const r=this.dt(e,t.key)?2:0;this.rt(e).$e(t.key,r),this.He=this.He.insert(t.key,t),this.Je=this.Je.insert(t.key,this.Et(t.key).add(e)),this.Ye=this.Ye.insert(t.key,this.At(t.key).add(e))}tt(e,t,r){if(!this.it(e))return;const s=this.rt(e);this.dt(e,t)?s.$e(t,1):s.Ue(t),this.Ye=this.Ye.insert(t,this.At(t).delete(e)),this.Ye=this.Ye.insert(t,this.At(t).add(e)),r&&(this.He=this.He.insert(t,r))}removeTarget(e){this.je.delete(e)}ut(e){const t=this.rt(e).qe();return this.ze.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}Ke(e){this.rt(e).Ke()}rt(e){let t=this.je.get(e);return t||(t=new E1,this.je.set(e,t)),t}At(e){let t=this.Ye.get(e);return t||(t=new Ot(Pe),this.Ye=this.Ye.insert(e,t)),t}Et(e){let t=this.Je.get(e);return t||(t=new Ot(Pe),this.Je=this.Je.insert(e,t)),t}it(e){const t=this._t(e)!==null;return t||ce("WatchChangeAggregator","Detected inactive target",e),t}_t(e){const t=this.je.get(e);return t&&t.Be?null:this.ze.Rt(e)}st(e){this.je.set(e,new E1),this.ze.getRemoteKeysForTarget(e).forEach(t=>{this.tt(e,t,null)})}dt(e,t){return this.ze.getRemoteKeysForTarget(e).has(t)}}function Nh(){return new Ct(_e.comparator)}function T1(){return new Ct(_e.comparator)}const h4={asc:"ASCENDING",desc:"DESCENDING"},d4={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},f4={and:"AND",or:"OR"};class p4{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Um(n,e){return n.useProto3Json||jd(e)?e:{value:e}}function ud(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function RT(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function m4(n,e){return ud(n,e.toTimestamp())}function Ur(n){return Ke(!!n,49232),Ce.fromTimestamp(function(t){const r=ws(t);return new xt(r.seconds,r.nanos)}(n))}function Ug(n,e){return jm(n,e).canonicalString()}function jm(n,e){const t=function(s){return new rt(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function kT(n){const e=rt.fromString(n);return Ke(OT(e),10190,{key:e.toString()}),e}function Bm(n,e){return Ug(n.databaseId,e.path)}function lm(n,e){const t=kT(e);if(t.get(1)!==n.databaseId.projectId)throw new se(G.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new se(G.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new _e(PT(t))}function AT(n,e){return Ug(n.databaseId,e)}function g4(n){const e=kT(n);return e.length===4?rt.emptyPath():PT(e)}function zm(n){return new rt(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function PT(n){return Ke(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function I1(n,e,t){return{name:Bm(n,e),fields:t.value.mapValue.fields}}function _4(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(p){return p==="NO_CHANGE"?0:p==="ADD"?1:p==="REMOVE"?2:p==="CURRENT"?3:p==="RESET"?4:Te(39313,{state:p})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],a=function(p,y){return p.useProto3Json?(Ke(y===void 0||typeof y=="string",58123),Yt.fromBase64String(y||"")):(Ke(y===void 0||y instanceof Buffer||y instanceof Uint8Array,16193),Yt.fromUint8Array(y||new Uint8Array))}(n,e.targetChange.resumeToken),u=e.targetChange.cause,h=u&&function(p){const y=p.code===void 0?G.UNKNOWN:IT(p.code);return new se(y,p.message||"")}(u);t=new CT(r,s,a,h||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=lm(n,r.document.name),a=Ur(r.document.updateTime),u=r.document.createTime?Ur(r.document.createTime):Ce.min(),h=new kn({mapValue:{fields:r.document.fields}}),f=rn.newFoundDocument(s,a,u,h),p=r.targetIds||[],y=r.removedTargetIds||[];t=new Wh(p,y,f.key,f)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=lm(n,r.document),a=r.readTime?Ur(r.readTime):Ce.min(),u=rn.newNoDocument(s,a),h=r.removedTargetIds||[];t=new Wh([],h,u.key,u)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=lm(n,r.document),a=r.removedTargetIds||[];t=new Wh([],a,s,null)}else{if(!("filter"in e))return Te(11601,{Vt:e});{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:a}=r,u=new a4(s,a),h=r.targetId;t=new ST(h,u)}}return t}function y4(n,e){let t;if(e instanceof qu)t={update:I1(n,e.key,e.value)};else if(e instanceof Mg)t={delete:Bm(n,e.key)};else if(e instanceof As)t={update:I1(n,e.key,e.data),updateMask:k4(e.fieldMask)};else{if(!(e instanceof i4))return Te(16599,{ft:e.type});t={verify:Bm(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(a,u){const h=u.transform;if(h instanceof Ou)return{fieldPath:u.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(h instanceof Du)return{fieldPath:u.field.canonicalString(),appendMissingElements:{values:h.elements}};if(h instanceof bu)return{fieldPath:u.field.canonicalString(),removeAllFromArray:{values:h.elements}};if(h instanceof ld)return{fieldPath:u.field.canonicalString(),increment:h.Re};throw Te(20930,{transform:u.transform})}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,a){return a.updateTime!==void 0?{updateTime:m4(s,a.updateTime)}:a.exists!==void 0?{exists:a.exists}:Te(27497)}(n,e.precondition)),t}function v4(n,e){return n&&n.length>0?(Ke(e!==void 0,14353),n.map(t=>function(s,a){let u=s.updateTime?Ur(s.updateTime):Ur(a);return u.isEqual(Ce.min())&&(u=Ur(a)),new t4(u,s.transformResults||[])}(t,e))):[]}function w4(n,e){return{documents:[AT(n,e.path)]}}function E4(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=AT(n,s);const a=function(p){if(p.length!==0)return xT(vr.create(p,"and"))}(e.filters);a&&(t.structuredQuery.where=a);const u=function(p){if(p.length!==0)return p.map(y=>function(T){return{field:wa(T.field),direction:S4(T.dir)}}(y))}(e.orderBy);u&&(t.structuredQuery.orderBy=u);const h=Um(n,e.limit);return h!==null&&(t.structuredQuery.limit=h),e.startAt&&(t.structuredQuery.startAt=function(p){return{before:p.inclusive,values:p.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(p){return{before:!p.inclusive,values:p.position}}(e.endAt)),{gt:t,parent:s}}function T4(n){let e=g4(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){Ke(r===1,65062);const y=t.from[0];y.allDescendants?s=y.collectionId:e=e.child(y.collectionId)}let a=[];t.where&&(a=function(w){const T=NT(w);return T instanceof vr&&aT(T)?T.getFilters():[T]}(t.where));let u=[];t.orderBy&&(u=function(w){return w.map(T=>function(A){return new xu(Ea(A.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(A.direction))}(T))}(t.orderBy));let h=null;t.limit&&(h=function(w){let T;return T=typeof w=="object"?w.value:w,jd(T)?null:T}(t.limit));let f=null;t.startAt&&(f=function(w){const T=!!w.before,C=w.values||[];return new Ma(C,T)}(t.startAt));let p=null;return t.endAt&&(p=function(w){const T=!w.before,C=w.values||[];return new Ma(C,T)}(t.endAt)),BP(e,s,u,a,h,"F",f,p)}function I4(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Te(28987,{purpose:s})}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function NT(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Ea(t.unaryFilter.field);return St.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Ea(t.unaryFilter.field);return St.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const a=Ea(t.unaryFilter.field);return St.create(a,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const u=Ea(t.unaryFilter.field);return St.create(u,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Te(61313);default:return Te(60726)}}(n):n.fieldFilter!==void 0?function(t){return St.create(Ea(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Te(58110);default:return Te(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return vr.create(t.compositeFilter.filters.map(r=>NT(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return Te(1026)}}(t.compositeFilter.op))}(n):Te(30097,{filter:n})}function S4(n){return h4[n]}function C4(n){return d4[n]}function R4(n){return f4[n]}function wa(n){return{fieldPath:n.canonicalString()}}function Ea(n){return Qt.fromServerFormat(n.fieldPath)}function xT(n){return n instanceof St?function(t){if(t.op==="=="){if(c1(t.value))return{unaryFilter:{field:wa(t.field),op:"IS_NAN"}};if(u1(t.value))return{unaryFilter:{field:wa(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(c1(t.value))return{unaryFilter:{field:wa(t.field),op:"IS_NOT_NAN"}};if(u1(t.value))return{unaryFilter:{field:wa(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:wa(t.field),op:C4(t.op),value:t.value}}}(n):n instanceof vr?function(t){const r=t.getFilters().map(s=>xT(s));return r.length===1?r[0]:{compositeFilter:{op:R4(t.op),filters:r}}}(n):Te(54877,{filter:n})}function k4(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function OT(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(e,t,r,s,a=Ce.min(),u=Ce.min(),h=Yt.EMPTY_BYTE_STRING,f=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=a,this.lastLimboFreeSnapshotVersion=u,this.resumeToken=h,this.expectedCount=f}withSequenceNumber(e){return new cs(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new cs(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new cs(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new cs(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class A4{constructor(e){this.wt=e}}function P4(n){const e=T4({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ad(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N4{constructor(){this.yn=new x4}addToCollectionParentIndex(e,t){return this.yn.add(t),Y.resolve()}getCollectionParents(e,t){return Y.resolve(this.yn.getEntries(t))}addFieldIndex(e,t){return Y.resolve()}deleteFieldIndex(e,t){return Y.resolve()}deleteAllFieldIndexes(e){return Y.resolve()}createTargetIndexes(e,t){return Y.resolve()}getDocumentsMatchingTarget(e,t){return Y.resolve(null)}getIndexType(e,t){return Y.resolve(0)}getFieldIndexes(e,t){return Y.resolve([])}getNextCollectionGroupToUpdate(e){return Y.resolve(null)}getMinOffset(e,t){return Y.resolve(vs.min())}getMinOffsetFromCollectionGroup(e,t){return Y.resolve(vs.min())}updateCollectionGroup(e,t,r){return Y.resolve()}updateIndexEntries(e,t){return Y.resolve()}}class x4{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new Ot(rt.comparator),a=!s.has(r);return this.index[t]=s.add(r),a}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ot(rt.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S1={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},DT=41943040;class Rn{static withCacheSize(e){return new Rn(e,Rn.DEFAULT_COLLECTION_PERCENTILE,Rn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Rn.DEFAULT_COLLECTION_PERCENTILE=10,Rn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Rn.DEFAULT=new Rn(DT,Rn.DEFAULT_COLLECTION_PERCENTILE,Rn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Rn.DISABLED=new Rn(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Va{constructor(e){this.nr=e}next(){return this.nr+=2,this.nr}static rr(){return new Va(0)}static ir(){return new Va(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C1="LruGarbageCollector",O4=1048576;function R1([n,e],[t,r]){const s=Pe(n,t);return s===0?Pe(e,r):s}class D4{constructor(e){this.cr=e,this.buffer=new Ot(R1),this.lr=0}hr(){return++this.lr}Pr(e){const t=[e,this.hr()];if(this.buffer.size<this.cr)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();R1(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class b4{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.Tr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ir(6e4)}stop(){this.Tr&&(this.Tr.cancel(),this.Tr=null)}get started(){return this.Tr!==null}Ir(e){ce(C1,`Garbage collection scheduled in ${e}ms`),this.Tr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Tr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){el(t)?ce(C1,"Ignoring IndexedDB error during garbage collection: ",t):await Za(t)}await this.Ir(3e5)})}}class L4{constructor(e,t){this.Er=e,this.params=t}calculateTargetCount(e,t){return this.Er.dr(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return Y.resolve(Ud.le);const r=new D4(t);return this.Er.forEachTarget(e,s=>r.Pr(s.sequenceNumber)).next(()=>this.Er.Ar(e,s=>r.Pr(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Er.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Er.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(ce("LruGarbageCollector","Garbage collection skipped; disabled"),Y.resolve(S1)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(ce("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),S1):this.Rr(e,t))}getCacheSize(e){return this.Er.getCacheSize(e)}Rr(e,t){let r,s,a,u,h,f,p;const y=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(w=>(w>this.params.maximumSequenceNumbersToCollect?(ce("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${w}`),s=this.params.maximumSequenceNumbersToCollect):s=w,u=Date.now(),this.nthSequenceNumber(e,s))).next(w=>(r=w,h=Date.now(),this.removeTargets(e,r,t))).next(w=>(a=w,f=Date.now(),this.removeOrphanedDocuments(e,r))).next(w=>(p=Date.now(),ya()<=xe.DEBUG&&ce("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${u-y}ms
	Determined least recently used ${s} in `+(h-u)+`ms
	Removed ${a} targets in `+(f-h)+`ms
	Removed ${w} documents in `+(p-f)+`ms
Total Duration: ${p-y}ms`),Y.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:a,documentsRemoved:w})))}}function M4(n,e){return new L4(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V4{constructor(){this.changes=new wo(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,rn.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?Y.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class F4{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U4{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&_u(r.mutation,s,Un.empty(),xt.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,be()).next(()=>r))}getLocalViewOfDocuments(e,t,r=be()){const s=oo();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(a=>{let u=hu();return a.forEach((h,f)=>{u=u.insert(h,f.overlayedDocument)}),u}))}getOverlayedDocuments(e,t){const r=oo();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,be()))}populateOverlays(e,t,r){const s=[];return r.forEach(a=>{t.has(a)||s.push(a)}),this.documentOverlayCache.getOverlays(e,s).next(a=>{a.forEach((u,h)=>{t.set(u,h)})})}computeViews(e,t,r,s){let a=ki();const u=gu(),h=function(){return gu()}();return t.forEach((f,p)=>{const y=r.get(p.key);s.has(p.key)&&(y===void 0||y.mutation instanceof As)?a=a.insert(p.key,p):y!==void 0?(u.set(p.key,y.mutation.getFieldMask()),_u(y.mutation,p,y.mutation.getFieldMask(),xt.now())):u.set(p.key,Un.empty())}),this.recalculateAndSaveOverlays(e,a).next(f=>(f.forEach((p,y)=>u.set(p,y)),t.forEach((p,y)=>{var w;return h.set(p,new F4(y,(w=u.get(p))!==null&&w!==void 0?w:null))}),h))}recalculateAndSaveOverlays(e,t){const r=gu();let s=new Ct((u,h)=>u-h),a=be();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(u=>{for(const h of u)h.keys().forEach(f=>{const p=t.get(f);if(p===null)return;let y=r.get(f)||Un.empty();y=h.applyToLocalView(p,y),r.set(f,y);const w=(s.get(h.batchId)||be()).add(f);s=s.insert(h.batchId,w)})}).next(()=>{const u=[],h=s.getReverseIterator();for(;h.hasNext();){const f=h.getNext(),p=f.key,y=f.value,w=mT();y.forEach(T=>{if(!a.has(T)){const C=ET(t.get(T),r.get(T));C!==null&&w.set(T,C),a=a.add(T)}}),u.push(this.documentOverlayCache.saveOverlays(e,p,w))}return Y.waitFor(u)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(u){return _e.isDocumentKey(u.path)&&u.collectionGroup===null&&u.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):bg(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(a=>{const u=s-a.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-a.size):Y.resolve(oo());let h=ku,f=a;return u.next(p=>Y.forEach(p,(y,w)=>(h<w.largestBatchId&&(h=w.largestBatchId),a.get(y)?Y.resolve():this.remoteDocumentCache.getEntry(e,y).next(T=>{f=f.insert(y,T)}))).next(()=>this.populateOverlays(e,p,a)).next(()=>this.computeViews(e,f,p,be())).next(y=>({batchId:h,changes:pT(y)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new _e(t)).next(r=>{let s=hu();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const a=t.collectionGroup;let u=hu();return this.indexManager.getCollectionParents(e,a).next(h=>Y.forEach(h,f=>{const p=function(w,T){return new vo(T,null,w.explicitOrderBy.slice(),w.filters.slice(),w.limit,w.limitType,w.startAt,w.endAt)}(t,f.child(a));return this.getDocumentsMatchingCollectionQuery(e,p,r,s).next(y=>{y.forEach((w,T)=>{u=u.insert(w,T)})})}).next(()=>u))}getDocumentsMatchingCollectionQuery(e,t,r,s){let a;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(u=>(a=u,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,a,s))).next(u=>{a.forEach((f,p)=>{const y=p.getKey();u.get(y)===null&&(u=u.insert(y,rn.newInvalidDocument(y)))});let h=hu();return u.forEach((f,p)=>{const y=a.get(f);y!==void 0&&_u(y.mutation,p,Un.empty(),xt.now()),Hd(t,p)&&(h=h.insert(f,p))}),h})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j4{constructor(e){this.serializer=e,this.Fr=new Map,this.Mr=new Map}getBundleMetadata(e,t){return Y.resolve(this.Fr.get(t))}saveBundleMetadata(e,t){return this.Fr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:Ur(s.createTime)}}(t)),Y.resolve()}getNamedQuery(e,t){return Y.resolve(this.Mr.get(t))}saveNamedQuery(e,t){return this.Mr.set(t.name,function(s){return{name:s.name,query:P4(s.bundledQuery),readTime:Ur(s.readTime)}}(t)),Y.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B4{constructor(){this.overlays=new Ct(_e.comparator),this.Or=new Map}getOverlay(e,t){return Y.resolve(this.overlays.get(t))}getOverlays(e,t){const r=oo();return Y.forEach(t,s=>this.getOverlay(e,s).next(a=>{a!==null&&r.set(s,a)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,a)=>{this.St(e,t,a)}),Y.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Or.get(r);return s!==void 0&&(s.forEach(a=>this.overlays=this.overlays.remove(a)),this.Or.delete(r)),Y.resolve()}getOverlaysForCollection(e,t,r){const s=oo(),a=t.length+1,u=new _e(t.child("")),h=this.overlays.getIteratorFrom(u);for(;h.hasNext();){const f=h.getNext().value,p=f.getKey();if(!t.isPrefixOf(p.path))break;p.path.length===a&&f.largestBatchId>r&&s.set(f.getKey(),f)}return Y.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let a=new Ct((p,y)=>p-y);const u=this.overlays.getIterator();for(;u.hasNext();){const p=u.getNext().value;if(p.getKey().getCollectionGroup()===t&&p.largestBatchId>r){let y=a.get(p.largestBatchId);y===null&&(y=oo(),a=a.insert(p.largestBatchId,y)),y.set(p.getKey(),p)}}const h=oo(),f=a.getIterator();for(;f.hasNext()&&(f.getNext().value.forEach((p,y)=>h.set(p,y)),!(h.size()>=s)););return Y.resolve(h)}St(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const u=this.Or.get(s.largestBatchId).delete(r.key);this.Or.set(s.largestBatchId,u)}this.overlays=this.overlays.insert(r.key,new o4(t,r));let a=this.Or.get(t);a===void 0&&(a=be(),this.Or.set(t,a)),this.Or.set(t,a.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class z4{constructor(){this.sessionToken=Yt.EMPTY_BYTE_STRING}getSessionToken(e){return Y.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,Y.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jg{constructor(){this.Nr=new Ot(jt.Br),this.Lr=new Ot(jt.kr)}isEmpty(){return this.Nr.isEmpty()}addReference(e,t){const r=new jt(e,t);this.Nr=this.Nr.add(r),this.Lr=this.Lr.add(r)}qr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Qr(new jt(e,t))}$r(e,t){e.forEach(r=>this.removeReference(r,t))}Ur(e){const t=new _e(new rt([])),r=new jt(t,e),s=new jt(t,e+1),a=[];return this.Lr.forEachInRange([r,s],u=>{this.Qr(u),a.push(u.key)}),a}Kr(){this.Nr.forEach(e=>this.Qr(e))}Qr(e){this.Nr=this.Nr.delete(e),this.Lr=this.Lr.delete(e)}Wr(e){const t=new _e(new rt([])),r=new jt(t,e),s=new jt(t,e+1);let a=be();return this.Lr.forEachInRange([r,s],u=>{a=a.add(u.key)}),a}containsKey(e){const t=new jt(e,0),r=this.Nr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class jt{constructor(e,t){this.key=e,this.Gr=t}static Br(e,t){return _e.comparator(e.key,t.key)||Pe(e.Gr,t.Gr)}static kr(e,t){return Pe(e.Gr,t.Gr)||_e.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W4{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Jn=1,this.zr=new Ot(jt.Br)}checkEmpty(e){return Y.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const a=this.Jn;this.Jn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const u=new s4(a,t,r,s);this.mutationQueue.push(u);for(const h of s)this.zr=this.zr.add(new jt(h.key,a)),this.indexManager.addToCollectionParentIndex(e,h.key.path.popLast());return Y.resolve(u)}lookupMutationBatch(e,t){return Y.resolve(this.jr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.Hr(r),a=s<0?0:s;return Y.resolve(this.mutationQueue.length>a?this.mutationQueue[a]:null)}getHighestUnacknowledgedBatchId(){return Y.resolve(this.mutationQueue.length===0?Ng:this.Jn-1)}getAllMutationBatches(e){return Y.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new jt(t,0),s=new jt(t,Number.POSITIVE_INFINITY),a=[];return this.zr.forEachInRange([r,s],u=>{const h=this.jr(u.Gr);a.push(h)}),Y.resolve(a)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new Ot(Pe);return t.forEach(s=>{const a=new jt(s,0),u=new jt(s,Number.POSITIVE_INFINITY);this.zr.forEachInRange([a,u],h=>{r=r.add(h.Gr)})}),Y.resolve(this.Jr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let a=r;_e.isDocumentKey(a)||(a=a.child(""));const u=new jt(new _e(a),0);let h=new Ot(Pe);return this.zr.forEachWhile(f=>{const p=f.key.path;return!!r.isPrefixOf(p)&&(p.length===s&&(h=h.add(f.Gr)),!0)},u),Y.resolve(this.Jr(h))}Jr(e){const t=[];return e.forEach(r=>{const s=this.jr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){Ke(this.Yr(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.zr;return Y.forEach(t.mutations,s=>{const a=new jt(s.key,t.batchId);return r=r.delete(a),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.zr=r})}Xn(e){}containsKey(e,t){const r=new jt(t,0),s=this.zr.firstAfterOrEqual(r);return Y.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,Y.resolve()}Yr(e,t){return this.Hr(e)}Hr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}jr(e){const t=this.Hr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $4{constructor(e){this.Zr=e,this.docs=function(){return new Ct(_e.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),a=s?s.size:0,u=this.Zr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:u}),this.size+=u-a,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return Y.resolve(r?r.document.mutableCopy():rn.newInvalidDocument(t))}getEntries(e,t){let r=ki();return t.forEach(s=>{const a=this.docs.get(s);r=r.insert(s,a?a.document.mutableCopy():rn.newInvalidDocument(s))}),Y.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let a=ki();const u=t.path,h=new _e(u.child("__id-9223372036854775808__")),f=this.docs.getIteratorFrom(h);for(;f.hasNext();){const{key:p,value:{document:y}}=f.getNext();if(!u.isPrefixOf(p.path))break;p.path.length>u.length+1||vP(yP(y),r)<=0||(s.has(y.key)||Hd(t,y))&&(a=a.insert(y.key,y.mutableCopy()))}return Y.resolve(a)}getAllFromCollectionGroup(e,t,r,s){Te(9500)}Xr(e,t){return Y.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new H4(this)}getSize(e){return Y.resolve(this.size)}}class H4 extends V4{constructor(e){super(),this.vr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.vr.addEntry(e,s)):this.vr.removeEntry(r)}),Y.waitFor(t)}getFromCache(e,t){return this.vr.getEntry(e,t)}getAllFromCache(e,t){return this.vr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q4{constructor(e){this.persistence=e,this.ei=new wo(t=>Og(t),Dg),this.lastRemoteSnapshotVersion=Ce.min(),this.highestTargetId=0,this.ti=0,this.ni=new jg,this.targetCount=0,this.ri=Va.rr()}forEachTarget(e,t){return this.ei.forEach((r,s)=>t(s)),Y.resolve()}getLastRemoteSnapshotVersion(e){return Y.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return Y.resolve(this.ti)}allocateTargetId(e){return this.highestTargetId=this.ri.next(),Y.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.ti&&(this.ti=t),Y.resolve()}ar(e){this.ei.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.ri=new Va(t),this.highestTargetId=t),e.sequenceNumber>this.ti&&(this.ti=e.sequenceNumber)}addTargetData(e,t){return this.ar(t),this.targetCount+=1,Y.resolve()}updateTargetData(e,t){return this.ar(t),Y.resolve()}removeTargetData(e,t){return this.ei.delete(t.target),this.ni.Ur(t.targetId),this.targetCount-=1,Y.resolve()}removeTargets(e,t,r){let s=0;const a=[];return this.ei.forEach((u,h)=>{h.sequenceNumber<=t&&r.get(h.targetId)===null&&(this.ei.delete(u),a.push(this.removeMatchingKeysForTargetId(e,h.targetId)),s++)}),Y.waitFor(a).next(()=>s)}getTargetCount(e){return Y.resolve(this.targetCount)}getTargetData(e,t){const r=this.ei.get(t)||null;return Y.resolve(r)}addMatchingKeys(e,t,r){return this.ni.qr(t,r),Y.resolve()}removeMatchingKeys(e,t,r){this.ni.$r(t,r);const s=this.persistence.referenceDelegate,a=[];return s&&t.forEach(u=>{a.push(s.markPotentiallyOrphaned(e,u))}),Y.waitFor(a)}removeMatchingKeysForTargetId(e,t){return this.ni.Ur(t),Y.resolve()}getMatchingKeysForTargetId(e,t){const r=this.ni.Wr(t);return Y.resolve(r)}containsKey(e,t){return Y.resolve(this.ni.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bT{constructor(e,t){this.ii={},this.overlays={},this.si=new Ud(0),this.oi=!1,this.oi=!0,this._i=new z4,this.referenceDelegate=e(this),this.ai=new q4(this),this.indexManager=new N4,this.remoteDocumentCache=function(s){return new $4(s)}(r=>this.referenceDelegate.ui(r)),this.serializer=new A4(t),this.ci=new j4(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.oi=!1,Promise.resolve()}get started(){return this.oi}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new B4,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.ii[e.toKey()];return r||(r=new W4(t,this.referenceDelegate),this.ii[e.toKey()]=r),r}getGlobalsCache(){return this._i}getTargetCache(){return this.ai}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.ci}runTransaction(e,t,r){ce("MemoryPersistence","Starting transaction:",e);const s=new G4(this.si.next());return this.referenceDelegate.li(),r(s).next(a=>this.referenceDelegate.hi(s).next(()=>a)).toPromise().then(a=>(s.raiseOnCommittedEvent(),a))}Pi(e,t){return Y.or(Object.values(this.ii).map(r=>()=>r.containsKey(e,t)))}}class G4 extends EP{constructor(e){super(),this.currentSequenceNumber=e}}class Bg{constructor(e){this.persistence=e,this.Ti=new jg,this.Ii=null}static Ei(e){return new Bg(e)}get di(){if(this.Ii)return this.Ii;throw Te(60996)}addReference(e,t,r){return this.Ti.addReference(r,t),this.di.delete(r.toString()),Y.resolve()}removeReference(e,t,r){return this.Ti.removeReference(r,t),this.di.add(r.toString()),Y.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),Y.resolve()}removeTarget(e,t){this.Ti.Ur(t.targetId).forEach(s=>this.di.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(a=>this.di.add(a.toString()))}).next(()=>r.removeTargetData(e,t))}li(){this.Ii=new Set}hi(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return Y.forEach(this.di,r=>{const s=_e.fromPath(r);return this.Ai(e,s).next(a=>{a||t.removeEntry(s,Ce.min())})}).next(()=>(this.Ii=null,t.apply(e)))}updateLimboDocument(e,t){return this.Ai(e,t).next(r=>{r?this.di.delete(t.toString()):this.di.add(t.toString())})}ui(e){return 0}Ai(e,t){return Y.or([()=>Y.resolve(this.Ti.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Pi(e,t)])}}class cd{constructor(e,t){this.persistence=e,this.Ri=new wo(r=>SP(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=M4(this,t)}static Ei(e,t){return new cd(e,t)}li(){}hi(e){return Y.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.Vr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}Vr(e){let t=0;return this.Ar(e,r=>{t++}).next(()=>t)}Ar(e,t){return Y.forEach(this.Ri,(r,s)=>this.gr(e,r,s).next(a=>a?Y.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),a=s.newChangeBuffer();return s.Xr(e,u=>this.gr(e,u,t).next(h=>{h||(r++,a.removeEntry(u,Ce.min()))})).next(()=>a.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.Ri.set(t,e.currentSequenceNumber),Y.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.Ri.set(r,e.currentSequenceNumber),Y.resolve()}removeReference(e,t,r){return this.Ri.set(r,e.currentSequenceNumber),Y.resolve()}updateLimboDocument(e,t){return this.Ri.set(t,e.currentSequenceNumber),Y.resolve()}ui(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=jh(e.data.value)),t}gr(e,t,r){return Y.or([()=>this.persistence.Pi(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.Ri.get(t);return Y.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zg{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.ls=r,this.hs=s}static Ps(e,t){let r=be(),s=be();for(const a of t.docChanges)switch(a.type){case 0:r=r.add(a.doc.key);break;case 1:s=s.add(a.doc.key)}return new zg(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K4{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Q4{constructor(){this.Ts=!1,this.Is=!1,this.Es=100,this.ds=function(){return Bk()?8:TP(an())>0?6:4}()}initialize(e,t){this.As=e,this.indexManager=t,this.Ts=!0}getDocumentsMatchingQuery(e,t,r,s){const a={result:null};return this.Rs(e,t).next(u=>{a.result=u}).next(()=>{if(!a.result)return this.Vs(e,t,s,r).next(u=>{a.result=u})}).next(()=>{if(a.result)return;const u=new K4;return this.fs(e,t,u).next(h=>{if(a.result=h,this.Is)return this.gs(e,t,u,h.size)})}).next(()=>a.result)}gs(e,t,r,s){return r.documentReadCount<this.Es?(ya()<=xe.DEBUG&&ce("QueryEngine","SDK will not create cache indexes for query:",va(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Es,"documents"),Y.resolve()):(ya()<=xe.DEBUG&&ce("QueryEngine","Query:",va(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.ds*s?(ya()<=xe.DEBUG&&ce("QueryEngine","The SDK decides to create cache indexes for query:",va(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Fr(t))):Y.resolve())}Rs(e,t){if(p1(t))return Y.resolve(null);let r=Fr(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=ad(t,null,"F"),r=Fr(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(a=>{const u=be(...a);return this.As.getDocuments(e,u).next(h=>this.indexManager.getMinOffset(e,r).next(f=>{const p=this.ps(t,h);return this.ys(t,p,u,f.readTime)?this.Rs(e,ad(t,null,"F")):this.ws(e,p,t,f)}))})))}Vs(e,t,r,s){return p1(t)||s.isEqual(Ce.min())?Y.resolve(null):this.As.getDocuments(e,r).next(a=>{const u=this.ps(t,a);return this.ys(t,u,r,s)?Y.resolve(null):(ya()<=xe.DEBUG&&ce("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),va(t)),this.ws(e,u,t,_P(s,ku)).next(h=>h))})}ps(e,t){let r=new Ot(dT(e));return t.forEach((s,a)=>{Hd(e,a)&&(r=r.add(a))}),r}ys(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const a=e.limitType==="F"?t.last():t.first();return!!a&&(a.hasPendingWrites||a.version.compareTo(s)>0)}fs(e,t,r){return ya()<=xe.DEBUG&&ce("QueryEngine","Using full collection scan to execute query:",va(t)),this.As.getDocumentsMatchingQuery(e,t,vs.min(),r)}ws(e,t,r,s){return this.As.getDocumentsMatchingQuery(e,r,s).next(a=>(t.forEach(u=>{a=a.insert(u.key,u)}),a))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wg="LocalStore",Y4=3e8;class X4{constructor(e,t,r,s){this.persistence=e,this.bs=t,this.serializer=s,this.Ss=new Ct(Pe),this.Ds=new wo(a=>Og(a),Dg),this.vs=new Map,this.Cs=e.getRemoteDocumentCache(),this.ai=e.getTargetCache(),this.ci=e.getBundleCache(),this.Fs(r)}Fs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new U4(this.Cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Cs.setIndexManager(this.indexManager),this.bs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.Ss))}}function J4(n,e,t,r){return new X4(n,e,t,r)}async function LT(n,e){const t=Re(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(a=>(s=a,t.Fs(e),t.mutationQueue.getAllMutationBatches(r))).next(a=>{const u=[],h=[];let f=be();for(const p of s){u.push(p.batchId);for(const y of p.mutations)f=f.add(y.key)}for(const p of a){h.push(p.batchId);for(const y of p.mutations)f=f.add(y.key)}return t.localDocuments.getDocuments(r,f).next(p=>({Ms:p,removedBatchIds:u,addedBatchIds:h}))})})}function Z4(n,e){const t=Re(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),a=t.Cs.newChangeBuffer({trackRemovals:!0});return function(h,f,p,y){const w=p.batch,T=w.keys();let C=Y.resolve();return T.forEach(A=>{C=C.next(()=>y.getEntry(f,A)).next(M=>{const D=p.docVersions.get(A);Ke(D!==null,48541),M.version.compareTo(D)<0&&(w.applyToRemoteDocument(M,p),M.isValidDocument()&&(M.setReadTime(p.commitVersion),y.addEntry(M)))})}),C.next(()=>h.mutationQueue.removeMutationBatch(f,w))}(t,r,e,a).next(()=>a.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(h){let f=be();for(let p=0;p<h.mutationResults.length;++p)h.mutationResults[p].transformResults.length>0&&(f=f.add(h.batch.mutations[p].key));return f}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function MT(n){const e=Re(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.ai.getLastRemoteSnapshotVersion(t))}function eN(n,e){const t=Re(n),r=e.snapshotVersion;let s=t.Ss;return t.persistence.runTransaction("Apply remote event","readwrite-primary",a=>{const u=t.Cs.newChangeBuffer({trackRemovals:!0});s=t.Ss;const h=[];e.targetChanges.forEach((y,w)=>{const T=s.get(w);if(!T)return;h.push(t.ai.removeMatchingKeys(a,y.removedDocuments,w).next(()=>t.ai.addMatchingKeys(a,y.addedDocuments,w)));let C=T.withSequenceNumber(a.currentSequenceNumber);e.targetMismatches.get(w)!==null?C=C.withResumeToken(Yt.EMPTY_BYTE_STRING,Ce.min()).withLastLimboFreeSnapshotVersion(Ce.min()):y.resumeToken.approximateByteSize()>0&&(C=C.withResumeToken(y.resumeToken,r)),s=s.insert(w,C),function(M,D,H){return M.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-M.snapshotVersion.toMicroseconds()>=Y4?!0:H.addedDocuments.size+H.modifiedDocuments.size+H.removedDocuments.size>0}(T,C,y)&&h.push(t.ai.updateTargetData(a,C))});let f=ki(),p=be();if(e.documentUpdates.forEach(y=>{e.resolvedLimboDocuments.has(y)&&h.push(t.persistence.referenceDelegate.updateLimboDocument(a,y))}),h.push(tN(a,u,e.documentUpdates).next(y=>{f=y.xs,p=y.Os})),!r.isEqual(Ce.min())){const y=t.ai.getLastRemoteSnapshotVersion(a).next(w=>t.ai.setTargetsMetadata(a,a.currentSequenceNumber,r));h.push(y)}return Y.waitFor(h).next(()=>u.apply(a)).next(()=>t.localDocuments.getLocalViewOfDocuments(a,f,p)).next(()=>f)}).then(a=>(t.Ss=s,a))}function tN(n,e,t){let r=be(),s=be();return t.forEach(a=>r=r.add(a)),e.getEntries(n,r).next(a=>{let u=ki();return t.forEach((h,f)=>{const p=a.get(h);f.isFoundDocument()!==p.isFoundDocument()&&(s=s.add(h)),f.isNoDocument()&&f.version.isEqual(Ce.min())?(e.removeEntry(h,f.readTime),u=u.insert(h,f)):!p.isValidDocument()||f.version.compareTo(p.version)>0||f.version.compareTo(p.version)===0&&p.hasPendingWrites?(e.addEntry(f),u=u.insert(h,f)):ce(Wg,"Ignoring outdated watch update for ",h,". Current version:",p.version," Watch version:",f.version)}),{xs:u,Os:s}})}function nN(n,e){const t=Re(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Ng),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function rN(n,e){const t=Re(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.ai.getTargetData(r,e).next(a=>a?(s=a,Y.resolve(s)):t.ai.allocateTargetId(r).next(u=>(s=new cs(e,u,"TargetPurposeListen",r.currentSequenceNumber),t.ai.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.Ss.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.Ss=t.Ss.insert(r.targetId,r),t.Ds.set(e,r.targetId)),r})}async function Wm(n,e,t){const r=Re(n),s=r.Ss.get(e),a=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",a,u=>r.persistence.referenceDelegate.removeTarget(u,s))}catch(u){if(!el(u))throw u;ce(Wg,`Failed to update sequence numbers for target ${e}: ${u}`)}r.Ss=r.Ss.remove(e),r.Ds.delete(s.target)}function k1(n,e,t){const r=Re(n);let s=Ce.min(),a=be();return r.persistence.runTransaction("Execute query","readwrite",u=>function(f,p,y){const w=Re(f),T=w.Ds.get(y);return T!==void 0?Y.resolve(w.Ss.get(T)):w.ai.getTargetData(p,y)}(r,u,Fr(e)).next(h=>{if(h)return s=h.lastLimboFreeSnapshotVersion,r.ai.getMatchingKeysForTargetId(u,h.targetId).next(f=>{a=f})}).next(()=>r.bs.getDocumentsMatchingQuery(u,e,t?s:Ce.min(),t?a:be())).next(h=>(iN(r,WP(e),h),{documents:h,Ns:a})))}function iN(n,e,t){let r=n.vs.get(e)||Ce.min();t.forEach((s,a)=>{a.readTime.compareTo(r)>0&&(r=a.readTime)}),n.vs.set(e,r)}class A1{constructor(){this.activeTargetIds=QP()}$s(e){this.activeTargetIds=this.activeTargetIds.add(e)}Us(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Qs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class sN{constructor(){this.So=new A1,this.Do={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.So.$s(e),this.Do[e]||"not-current"}updateQueryState(e,t,r){this.Do[e]=t}removeLocalQueryTarget(e){this.So.Us(e)}isLocalQueryTarget(e){return this.So.activeTargetIds.has(e)}clearQueryState(e){delete this.Do[e]}getAllActiveQueryTargets(){return this.So.activeTargetIds}isActiveQueryTarget(e){return this.So.activeTargetIds.has(e)}start(){return this.So=new A1,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oN{vo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P1="ConnectivityMonitor";class N1{constructor(){this.Co=()=>this.Fo(),this.Mo=()=>this.xo(),this.Oo=[],this.No()}vo(e){this.Oo.push(e)}shutdown(){window.removeEventListener("online",this.Co),window.removeEventListener("offline",this.Mo)}No(){window.addEventListener("online",this.Co),window.addEventListener("offline",this.Mo)}Fo(){ce(P1,"Network connectivity changed: AVAILABLE");for(const e of this.Oo)e(0)}xo(){ce(P1,"Network connectivity changed: UNAVAILABLE");for(const e of this.Oo)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xh=null;function $m(){return xh===null?xh=function(){return 268435456+Math.round(2147483648*Math.random())}():xh++,"0x"+xh.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const um="RestConnection",aN={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class lN{get Bo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Lo=t+"://"+e.host,this.ko=`projects/${r}/databases/${s}`,this.qo=this.databaseId.database===id?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Qo(e,t,r,s,a){const u=$m(),h=this.$o(e,t.toUriEncodedString());ce(um,`Sending RPC '${e}' ${u}:`,h,r);const f={"google-cloud-resource-prefix":this.ko,"x-goog-request-params":this.qo};return this.Uo(f,s,a),this.Ko(e,h,f,r).then(p=>(ce(um,`Received RPC '${e}' ${u}: `,p),p),p=>{throw Oa(um,`RPC '${e}' ${u} failed with error: `,p,"url: ",h,"request:",r),p})}Wo(e,t,r,s,a,u){return this.Qo(e,t,r,s,a)}Uo(e,t,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Ja}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((s,a)=>e[a]=s),r&&r.headers.forEach((s,a)=>e[a]=s)}$o(e,t){const r=aN[e];return`${this.Lo}/v1/${t}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uN{constructor(e){this.Go=e.Go,this.zo=e.zo}jo(e){this.Ho=e}Jo(e){this.Yo=e}Zo(e){this.Xo=e}onMessage(e){this.e_=e}close(){this.zo()}send(e){this.Go(e)}t_(){this.Ho()}n_(){this.Yo()}r_(e){this.Xo(e)}i_(e){this.e_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tn="WebChannelConnection";class cN extends lN{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Ko(e,t,r,s){const a=$m();return new Promise((u,h)=>{const f=new jE;f.setWithCredentials(!0),f.listenOnce(BE.COMPLETE,()=>{try{switch(f.getLastErrorCode()){case Uh.NO_ERROR:const y=f.getResponseJson();ce(tn,`XHR for RPC '${e}' ${a} received:`,JSON.stringify(y)),u(y);break;case Uh.TIMEOUT:ce(tn,`RPC '${e}' ${a} timed out`),h(new se(G.DEADLINE_EXCEEDED,"Request time out"));break;case Uh.HTTP_ERROR:const w=f.getStatus();if(ce(tn,`RPC '${e}' ${a} failed with status:`,w,"response text:",f.getResponseText()),w>0){let T=f.getResponseJson();Array.isArray(T)&&(T=T[0]);const C=T==null?void 0:T.error;if(C&&C.status&&C.message){const A=function(D){const H=D.toLowerCase().replace(/_/g,"-");return Object.values(G).indexOf(H)>=0?H:G.UNKNOWN}(C.status);h(new se(A,C.message))}else h(new se(G.UNKNOWN,"Server responded with status "+f.getStatus()))}else h(new se(G.UNAVAILABLE,"Connection failed."));break;default:Te(9055,{s_:e,streamId:a,o_:f.getLastErrorCode(),__:f.getLastError()})}}finally{ce(tn,`RPC '${e}' ${a} completed.`)}});const p=JSON.stringify(s);ce(tn,`RPC '${e}' ${a} sending request:`,s),f.send(t,"POST",p,r,15)})}a_(e,t,r){const s=$m(),a=[this.Lo,"/","google.firestore.v1.Firestore","/",e,"/channel"],u=$E(),h=WE(),f={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},p=this.longPollingOptions.timeoutSeconds;p!==void 0&&(f.longPollingTimeout=Math.round(1e3*p)),this.useFetchStreams&&(f.useFetchStreams=!0),this.Uo(f.initMessageHeaders,t,r),f.encodeInitMessageHeaders=!0;const y=a.join("");ce(tn,`Creating RPC '${e}' stream ${s}: ${y}`,f);const w=u.createWebChannel(y,f);let T=!1,C=!1;const A=new uN({Go:D=>{C?ce(tn,`Not sending because RPC '${e}' stream ${s} is closed:`,D):(T||(ce(tn,`Opening RPC '${e}' stream ${s} transport.`),w.open(),T=!0),ce(tn,`RPC '${e}' stream ${s} sending:`,D),w.send(D))},zo:()=>w.close()}),M=(D,H,Z)=>{D.listen(H,K=>{try{Z(K)}catch(re){setTimeout(()=>{throw re},0)}})};return M(w,cu.EventType.OPEN,()=>{C||(ce(tn,`RPC '${e}' stream ${s} transport opened.`),A.t_())}),M(w,cu.EventType.CLOSE,()=>{C||(C=!0,ce(tn,`RPC '${e}' stream ${s} transport closed`),A.r_())}),M(w,cu.EventType.ERROR,D=>{C||(C=!0,Oa(tn,`RPC '${e}' stream ${s} transport errored. Name:`,D.name,"Message:",D.message),A.r_(new se(G.UNAVAILABLE,"The operation could not be completed")))}),M(w,cu.EventType.MESSAGE,D=>{var H;if(!C){const Z=D.data[0];Ke(!!Z,16349);const K=Z,re=(K==null?void 0:K.error)||((H=K[0])===null||H===void 0?void 0:H.error);if(re){ce(tn,`RPC '${e}' stream ${s} received error:`,re);const Ie=re.status;let we=function(R){const N=It[R];if(N!==void 0)return IT(N)}(Ie),O=re.message;we===void 0&&(we=G.INTERNAL,O="Unknown error status: "+Ie+" with message "+re.message),C=!0,A.r_(new se(we,O)),w.close()}else ce(tn,`RPC '${e}' stream ${s} received:`,Z),A.i_(Z)}}),M(h,zE.STAT_EVENT,D=>{D.stat===xm.PROXY?ce(tn,`RPC '${e}' stream ${s} detected buffering proxy`):D.stat===xm.NOPROXY&&ce(tn,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{A.n_()},0),A}}function cm(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qd(n){return new p4(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VT{constructor(e,t,r=1e3,s=1.5,a=6e4){this.bi=e,this.timerId=t,this.u_=r,this.c_=s,this.l_=a,this.h_=0,this.P_=null,this.T_=Date.now(),this.reset()}reset(){this.h_=0}I_(){this.h_=this.l_}E_(e){this.cancel();const t=Math.floor(this.h_+this.d_()),r=Math.max(0,Date.now()-this.T_),s=Math.max(0,t-r);s>0&&ce("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.h_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.P_=this.bi.enqueueAfterDelay(this.timerId,s,()=>(this.T_=Date.now(),e())),this.h_*=this.c_,this.h_<this.u_&&(this.h_=this.u_),this.h_>this.l_&&(this.h_=this.l_)}A_(){this.P_!==null&&(this.P_.skipDelay(),this.P_=null)}cancel(){this.P_!==null&&(this.P_.cancel(),this.P_=null)}d_(){return(Math.random()-.5)*this.h_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x1="PersistentStream";class FT{constructor(e,t,r,s,a,u,h,f){this.bi=e,this.R_=r,this.V_=s,this.connection=a,this.authCredentialsProvider=u,this.appCheckCredentialsProvider=h,this.listener=f,this.state=0,this.m_=0,this.f_=null,this.g_=null,this.stream=null,this.p_=0,this.y_=new VT(e,t)}w_(){return this.state===1||this.state===5||this.b_()}b_(){return this.state===2||this.state===3}start(){this.p_=0,this.state!==4?this.auth():this.S_()}async stop(){this.w_()&&await this.close(0)}D_(){this.state=0,this.y_.reset()}v_(){this.b_()&&this.f_===null&&(this.f_=this.bi.enqueueAfterDelay(this.R_,6e4,()=>this.C_()))}F_(e){this.M_(),this.stream.send(e)}async C_(){if(this.b_())return this.close(0)}M_(){this.f_&&(this.f_.cancel(),this.f_=null)}x_(){this.g_&&(this.g_.cancel(),this.g_=null)}async close(e,t){this.M_(),this.x_(),this.y_.cancel(),this.m_++,e!==4?this.y_.reset():t&&t.code===G.RESOURCE_EXHAUSTED?(Ri(t.toString()),Ri("Using maximum backoff delay to prevent overloading the backend."),this.y_.I_()):t&&t.code===G.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.O_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Zo(t)}O_(){}auth(){this.state=1;const e=this.N_(this.m_),t=this.m_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.m_===t&&this.B_(r,s)},r=>{e(()=>{const s=new se(G.UNKNOWN,"Fetching auth token failed: "+r.message);return this.L_(s)})})}B_(e,t){const r=this.N_(this.m_);this.stream=this.k_(e,t),this.stream.jo(()=>{r(()=>this.listener.jo())}),this.stream.Jo(()=>{r(()=>(this.state=2,this.g_=this.bi.enqueueAfterDelay(this.V_,1e4,()=>(this.b_()&&(this.state=3),Promise.resolve())),this.listener.Jo()))}),this.stream.Zo(s=>{r(()=>this.L_(s))}),this.stream.onMessage(s=>{r(()=>++this.p_==1?this.q_(s):this.onNext(s))})}S_(){this.state=5,this.y_.E_(async()=>{this.state=0,this.start()})}L_(e){return ce(x1,`close with error: ${e}`),this.stream=null,this.close(4,e)}N_(e){return t=>{this.bi.enqueueAndForget(()=>this.m_===e?t():(ce(x1,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class hN extends FT{constructor(e,t,r,s,a,u){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,u),this.serializer=a}k_(e,t){return this.connection.a_("Listen",e,t)}q_(e){return this.onNext(e)}onNext(e){this.y_.reset();const t=_4(this.serializer,e),r=function(a){if(!("targetChange"in a))return Ce.min();const u=a.targetChange;return u.targetIds&&u.targetIds.length?Ce.min():u.readTime?Ur(u.readTime):Ce.min()}(e);return this.listener.Q_(t,r)}U_(e){const t={};t.database=zm(this.serializer),t.addTarget=function(a,u){let h;const f=u.target;if(h=Vm(f)?{documents:w4(a,f)}:{query:E4(a,f).gt},h.targetId=u.targetId,u.resumeToken.approximateByteSize()>0){h.resumeToken=RT(a,u.resumeToken);const p=Um(a,u.expectedCount);p!==null&&(h.expectedCount=p)}else if(u.snapshotVersion.compareTo(Ce.min())>0){h.readTime=ud(a,u.snapshotVersion.toTimestamp());const p=Um(a,u.expectedCount);p!==null&&(h.expectedCount=p)}return h}(this.serializer,e);const r=I4(this.serializer,e);r&&(t.labels=r),this.F_(t)}K_(e){const t={};t.database=zm(this.serializer),t.removeTarget=e,this.F_(t)}}class dN extends FT{constructor(e,t,r,s,a,u){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,u),this.serializer=a}get W_(){return this.p_>0}start(){this.lastStreamToken=void 0,super.start()}O_(){this.W_&&this.G_([])}k_(e,t){return this.connection.a_("Write",e,t)}q_(e){return Ke(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Ke(!e.writeResults||e.writeResults.length===0,55816),this.listener.z_()}onNext(e){Ke(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.y_.reset();const t=v4(e.writeResults,e.commitTime),r=Ur(e.commitTime);return this.listener.j_(r,t)}H_(){const e={};e.database=zm(this.serializer),this.F_(e)}G_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>y4(this.serializer,r))};this.F_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fN{}class pN extends fN{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.J_=!1}Y_(){if(this.J_)throw new se(G.FAILED_PRECONDITION,"The client has already been terminated.")}Qo(e,t,r,s){return this.Y_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.Qo(e,jm(t,r),s,a,u)).catch(a=>{throw a.name==="FirebaseError"?(a.code===G.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new se(G.UNKNOWN,a.toString())})}Wo(e,t,r,s,a){return this.Y_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([u,h])=>this.connection.Wo(e,jm(t,r),s,u,h,a)).catch(u=>{throw u.name==="FirebaseError"?(u.code===G.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),u):new se(G.UNKNOWN,u.toString())})}terminate(){this.J_=!0,this.connection.terminate()}}class mN{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.Z_=0,this.X_=null,this.ea=!0}ta(){this.Z_===0&&(this.na("Unknown"),this.X_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.X_=null,this.ra("Backend didn't respond within 10 seconds."),this.na("Offline"),Promise.resolve())))}ia(e){this.state==="Online"?this.na("Unknown"):(this.Z_++,this.Z_>=1&&(this.sa(),this.ra(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.na("Offline")))}set(e){this.sa(),this.Z_=0,e==="Online"&&(this.ea=!1),this.na(e)}na(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ra(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.ea?(Ri(t),this.ea=!1):ce("OnlineStateTracker",t)}sa(){this.X_!==null&&(this.X_.cancel(),this.X_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ho="RemoteStore";class gN{constructor(e,t,r,s,a){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.oa=[],this._a=new Map,this.aa=new Set,this.ua=[],this.ca=a,this.ca.vo(u=>{r.enqueueAndForget(async()=>{Eo(this)&&(ce(ho,"Restarting streams for network reachability change."),await async function(f){const p=Re(f);p.aa.add(4),await Ku(p),p.la.set("Unknown"),p.aa.delete(4),await Yd(p)}(this))})}),this.la=new mN(r,s)}}async function Yd(n){if(Eo(n))for(const e of n.ua)await e(!0)}async function Ku(n){for(const e of n.ua)await e(!1)}function UT(n,e){const t=Re(n);t._a.has(e.targetId)||(t._a.set(e.targetId,e),Gg(t)?qg(t):tl(t).b_()&&Hg(t,e))}function $g(n,e){const t=Re(n),r=tl(t);t._a.delete(e),r.b_()&&jT(t,e),t._a.size===0&&(r.b_()?r.v_():Eo(t)&&t.la.set("Unknown"))}function Hg(n,e){if(n.ha.Ke(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Ce.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}tl(n).U_(e)}function jT(n,e){n.ha.Ke(e),tl(n).K_(e)}function qg(n){n.ha=new c4({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),Rt:e=>n._a.get(e)||null,Pt:()=>n.datastore.serializer.databaseId}),tl(n).start(),n.la.ta()}function Gg(n){return Eo(n)&&!tl(n).w_()&&n._a.size>0}function Eo(n){return Re(n).aa.size===0}function BT(n){n.ha=void 0}async function _N(n){n.la.set("Online")}async function yN(n){n._a.forEach((e,t)=>{Hg(n,e)})}async function vN(n,e){BT(n),Gg(n)?(n.la.ia(e),qg(n)):n.la.set("Unknown")}async function wN(n,e,t){if(n.la.set("Online"),e instanceof CT&&e.state===2&&e.cause)try{await async function(s,a){const u=a.cause;for(const h of a.targetIds)s._a.has(h)&&(await s.remoteSyncer.rejectListen(h,u),s._a.delete(h),s.ha.removeTarget(h))}(n,e)}catch(r){ce(ho,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await hd(n,r)}else if(e instanceof Wh?n.ha.Xe(e):e instanceof ST?n.ha.ot(e):n.ha.nt(e),!t.isEqual(Ce.min()))try{const r=await MT(n.localStore);t.compareTo(r)>=0&&await function(a,u){const h=a.ha.It(u);return h.targetChanges.forEach((f,p)=>{if(f.resumeToken.approximateByteSize()>0){const y=a._a.get(p);y&&a._a.set(p,y.withResumeToken(f.resumeToken,u))}}),h.targetMismatches.forEach((f,p)=>{const y=a._a.get(f);if(!y)return;a._a.set(f,y.withResumeToken(Yt.EMPTY_BYTE_STRING,y.snapshotVersion)),jT(a,f);const w=new cs(y.target,f,p,y.sequenceNumber);Hg(a,w)}),a.remoteSyncer.applyRemoteEvent(h)}(n,t)}catch(r){ce(ho,"Failed to raise snapshot:",r),await hd(n,r)}}async function hd(n,e,t){if(!el(e))throw e;n.aa.add(1),await Ku(n),n.la.set("Offline"),t||(t=()=>MT(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{ce(ho,"Retrying IndexedDB access"),await t(),n.aa.delete(1),await Yd(n)})}function zT(n,e){return e().catch(t=>hd(n,t,e))}async function Xd(n){const e=Re(n),t=Is(e);let r=e.oa.length>0?e.oa[e.oa.length-1].batchId:Ng;for(;EN(e);)try{const s=await nN(e.localStore,r);if(s===null){e.oa.length===0&&t.v_();break}r=s.batchId,TN(e,s)}catch(s){await hd(e,s)}WT(e)&&$T(e)}function EN(n){return Eo(n)&&n.oa.length<10}function TN(n,e){n.oa.push(e);const t=Is(n);t.b_()&&t.W_&&t.G_(e.mutations)}function WT(n){return Eo(n)&&!Is(n).w_()&&n.oa.length>0}function $T(n){Is(n).start()}async function IN(n){Is(n).H_()}async function SN(n){const e=Is(n);for(const t of n.oa)e.G_(t.mutations)}async function CN(n,e,t){const r=n.oa.shift(),s=Vg.from(r,e,t);await zT(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await Xd(n)}async function RN(n,e){e&&Is(n).W_&&await async function(r,s){if(function(u){return l4(u)&&u!==G.ABORTED}(s.code)){const a=r.oa.shift();Is(r).D_(),await zT(r,()=>r.remoteSyncer.rejectFailedWrite(a.batchId,s)),await Xd(r)}}(n,e),WT(n)&&$T(n)}async function O1(n,e){const t=Re(n);t.asyncQueue.verifyOperationInProgress(),ce(ho,"RemoteStore received new credentials");const r=Eo(t);t.aa.add(3),await Ku(t),r&&t.la.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.aa.delete(3),await Yd(t)}async function kN(n,e){const t=Re(n);e?(t.aa.delete(2),await Yd(t)):e||(t.aa.add(2),await Ku(t),t.la.set("Unknown"))}function tl(n){return n.Pa||(n.Pa=function(t,r,s){const a=Re(t);return a.Y_(),new hN(r,a.connection,a.authCredentials,a.appCheckCredentials,a.serializer,s)}(n.datastore,n.asyncQueue,{jo:_N.bind(null,n),Jo:yN.bind(null,n),Zo:vN.bind(null,n),Q_:wN.bind(null,n)}),n.ua.push(async e=>{e?(n.Pa.D_(),Gg(n)?qg(n):n.la.set("Unknown")):(await n.Pa.stop(),BT(n))})),n.Pa}function Is(n){return n.Ta||(n.Ta=function(t,r,s){const a=Re(t);return a.Y_(),new dN(r,a.connection,a.authCredentials,a.appCheckCredentials,a.serializer,s)}(n.datastore,n.asyncQueue,{jo:()=>Promise.resolve(),Jo:IN.bind(null,n),Zo:RN.bind(null,n),z_:SN.bind(null,n),j_:CN.bind(null,n)}),n.ua.push(async e=>{e?(n.Ta.D_(),await Xd(n)):(await n.Ta.stop(),n.oa.length>0&&(ce(ho,`Stopping write stream with ${n.oa.length} pending writes`),n.oa=[]))})),n.Ta}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(e,t,r,s,a){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=a,this.deferred=new wi,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(u=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,a){const u=Date.now()+r,h=new Kg(e,t,u,s,a);return h.start(r),h}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new se(G.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Qg(n,e){if(Ri("AsyncQueue",`${e}: ${n}`),el(n))return new se(G.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ca{static emptySet(e){return new Ca(e.comparator)}constructor(e){this.comparator=e?(t,r)=>e(t,r)||_e.comparator(t.key,r.key):(t,r)=>_e.comparator(t.key,r.key),this.keyedMap=hu(),this.sortedSet=new Ct(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ca)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,a=r.getNext().key;if(!s.isEqual(a))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Ca;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D1{constructor(){this.Ia=new Ct(_e.comparator)}track(e){const t=e.doc.key,r=this.Ia.get(t);r?e.type!==0&&r.type===3?this.Ia=this.Ia.insert(t,e):e.type===3&&r.type!==1?this.Ia=this.Ia.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.Ia=this.Ia.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.Ia=this.Ia.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.Ia=this.Ia.remove(t):e.type===1&&r.type===2?this.Ia=this.Ia.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.Ia=this.Ia.insert(t,{type:2,doc:e.doc}):Te(63341,{Vt:e,Ea:r}):this.Ia=this.Ia.insert(t,e)}da(){const e=[];return this.Ia.inorderTraversal((t,r)=>{e.push(r)}),e}}class Fa{constructor(e,t,r,s,a,u,h,f,p){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=a,this.fromCache=u,this.syncStateChanged=h,this.excludesMetadataChanges=f,this.hasCachedResults=p}static fromInitialDocuments(e,t,r,s,a){const u=[];return t.forEach(h=>{u.push({type:0,doc:h})}),new Fa(e,t,Ca.emptySet(t),u,r,s,!0,!1,a)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&$d(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AN{constructor(){this.Aa=void 0,this.Ra=[]}Va(){return this.Ra.some(e=>e.ma())}}class PN{constructor(){this.queries=b1(),this.onlineState="Unknown",this.fa=new Set}terminate(){(function(t,r){const s=Re(t),a=s.queries;s.queries=b1(),a.forEach((u,h)=>{for(const f of h.Ra)f.onError(r)})})(this,new se(G.ABORTED,"Firestore shutting down"))}}function b1(){return new wo(n=>hT(n),$d)}async function Yg(n,e){const t=Re(n);let r=3;const s=e.query;let a=t.queries.get(s);a?!a.Va()&&e.ma()&&(r=2):(a=new AN,r=e.ma()?0:1);try{switch(r){case 0:a.Aa=await t.onListen(s,!0);break;case 1:a.Aa=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(u){const h=Qg(u,`Initialization of query '${va(e.query)}' failed`);return void e.onError(h)}t.queries.set(s,a),a.Ra.push(e),e.ga(t.onlineState),a.Aa&&e.pa(a.Aa)&&Jg(t)}async function Xg(n,e){const t=Re(n),r=e.query;let s=3;const a=t.queries.get(r);if(a){const u=a.Ra.indexOf(e);u>=0&&(a.Ra.splice(u,1),a.Ra.length===0?s=e.ma()?0:1:!a.Va()&&e.ma()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function NN(n,e){const t=Re(n);let r=!1;for(const s of e){const a=s.query,u=t.queries.get(a);if(u){for(const h of u.Ra)h.pa(s)&&(r=!0);u.Aa=s}}r&&Jg(t)}function xN(n,e,t){const r=Re(n),s=r.queries.get(e);if(s)for(const a of s.Ra)a.onError(t);r.queries.delete(e)}function Jg(n){n.fa.forEach(e=>{e.next()})}var Hm,L1;(L1=Hm||(Hm={})).ya="default",L1.Cache="cache";class Zg{constructor(e,t,r){this.query=e,this.wa=t,this.ba=!1,this.Sa=null,this.onlineState="Unknown",this.options=r||{}}pa(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Fa(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.ba?this.Da(e)&&(this.wa.next(e),t=!0):this.va(e,this.onlineState)&&(this.Ca(e),t=!0),this.Sa=e,t}onError(e){this.wa.error(e)}ga(e){this.onlineState=e;let t=!1;return this.Sa&&!this.ba&&this.va(this.Sa,e)&&(this.Ca(this.Sa),t=!0),t}va(e,t){if(!e.fromCache||!this.ma())return!0;const r=t!=="Offline";return(!this.options.Fa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Da(e){if(e.docChanges.length>0)return!0;const t=this.Sa&&this.Sa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}Ca(e){e=Fa.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.ba=!0,this.wa.next(e)}ma(){return this.options.source!==Hm.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HT{constructor(e){this.key=e}}class qT{constructor(e){this.key=e}}class ON{constructor(e,t){this.query=e,this.qa=t,this.Qa=null,this.hasCachedResults=!1,this.current=!1,this.$a=be(),this.mutatedKeys=be(),this.Ua=dT(e),this.Ka=new Ca(this.Ua)}get Wa(){return this.qa}Ga(e,t){const r=t?t.za:new D1,s=t?t.Ka:this.Ka;let a=t?t.mutatedKeys:this.mutatedKeys,u=s,h=!1;const f=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,p=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((y,w)=>{const T=s.get(y),C=Hd(this.query,w)?w:null,A=!!T&&this.mutatedKeys.has(T.key),M=!!C&&(C.hasLocalMutations||this.mutatedKeys.has(C.key)&&C.hasCommittedMutations);let D=!1;T&&C?T.data.isEqual(C.data)?A!==M&&(r.track({type:3,doc:C}),D=!0):this.ja(T,C)||(r.track({type:2,doc:C}),D=!0,(f&&this.Ua(C,f)>0||p&&this.Ua(C,p)<0)&&(h=!0)):!T&&C?(r.track({type:0,doc:C}),D=!0):T&&!C&&(r.track({type:1,doc:T}),D=!0,(f||p)&&(h=!0)),D&&(C?(u=u.add(C),a=M?a.add(y):a.delete(y)):(u=u.delete(y),a=a.delete(y)))}),this.query.limit!==null)for(;u.size>this.query.limit;){const y=this.query.limitType==="F"?u.last():u.first();u=u.delete(y.key),a=a.delete(y.key),r.track({type:1,doc:y})}return{Ka:u,za:r,ys:h,mutatedKeys:a}}ja(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const a=this.Ka;this.Ka=e.Ka,this.mutatedKeys=e.mutatedKeys;const u=e.za.da();u.sort((y,w)=>function(C,A){const M=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Te(20277,{Vt:D})}};return M(C)-M(A)}(y.type,w.type)||this.Ua(y.doc,w.doc)),this.Ha(r),s=s!=null&&s;const h=t&&!s?this.Ja():[],f=this.$a.size===0&&this.current&&!s?1:0,p=f!==this.Qa;return this.Qa=f,u.length!==0||p?{snapshot:new Fa(this.query,e.Ka,a,u,e.mutatedKeys,f===0,p,!1,!!r&&r.resumeToken.approximateByteSize()>0),Ya:h}:{Ya:h}}ga(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ka:this.Ka,za:new D1,mutatedKeys:this.mutatedKeys,ys:!1},!1)):{Ya:[]}}Za(e){return!this.qa.has(e)&&!!this.Ka.has(e)&&!this.Ka.get(e).hasLocalMutations}Ha(e){e&&(e.addedDocuments.forEach(t=>this.qa=this.qa.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.qa=this.qa.delete(t)),this.current=e.current)}Ja(){if(!this.current)return[];const e=this.$a;this.$a=be(),this.Ka.forEach(r=>{this.Za(r.key)&&(this.$a=this.$a.add(r.key))});const t=[];return e.forEach(r=>{this.$a.has(r)||t.push(new qT(r))}),this.$a.forEach(r=>{e.has(r)||t.push(new HT(r))}),t}Xa(e){this.qa=e.Ns,this.$a=be();const t=this.Ga(e.documents);return this.applyChanges(t,!0)}eu(){return Fa.fromInitialDocuments(this.query,this.Ka,this.mutatedKeys,this.Qa===0,this.hasCachedResults)}}const e_="SyncEngine";class DN{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class bN{constructor(e){this.key=e,this.tu=!1}}class LN{constructor(e,t,r,s,a,u){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=a,this.maxConcurrentLimboResolutions=u,this.nu={},this.ru=new wo(h=>hT(h),$d),this.iu=new Map,this.su=new Set,this.ou=new Ct(_e.comparator),this._u=new Map,this.au=new jg,this.uu={},this.cu=new Map,this.lu=Va.ir(),this.onlineState="Unknown",this.hu=void 0}get isPrimaryClient(){return this.hu===!0}}async function MN(n,e,t=!0){const r=JT(n);let s;const a=r.ru.get(e);return a?(r.sharedClientState.addLocalQueryTarget(a.targetId),s=a.view.eu()):s=await GT(r,e,t,!0),s}async function VN(n,e){const t=JT(n);await GT(t,e,!0,!1)}async function GT(n,e,t,r){const s=await rN(n.localStore,Fr(e)),a=s.targetId,u=n.sharedClientState.addLocalQueryTarget(a,t);let h;return r&&(h=await FN(n,e,a,u==="current",s.resumeToken)),n.isPrimaryClient&&t&&UT(n.remoteStore,s),h}async function FN(n,e,t,r,s){n.Pu=(w,T,C)=>async function(M,D,H,Z){let K=D.view.Ga(H);K.ys&&(K=await k1(M.localStore,D.query,!1).then(({documents:O})=>D.view.Ga(O,K)));const re=Z&&Z.targetChanges.get(D.targetId),Ie=Z&&Z.targetMismatches.get(D.targetId)!=null,we=D.view.applyChanges(K,M.isPrimaryClient,re,Ie);return V1(M,D.targetId,we.Ya),we.snapshot}(n,w,T,C);const a=await k1(n.localStore,e,!0),u=new ON(e,a.Ns),h=u.Ga(a.documents),f=Gu.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),p=u.applyChanges(h,n.isPrimaryClient,f);V1(n,t,p.Ya);const y=new DN(e,t,u);return n.ru.set(e,y),n.iu.has(t)?n.iu.get(t).push(e):n.iu.set(t,[e]),p.snapshot}async function UN(n,e,t){const r=Re(n),s=r.ru.get(e),a=r.iu.get(s.targetId);if(a.length>1)return r.iu.set(s.targetId,a.filter(u=>!$d(u,e))),void r.ru.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Wm(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&$g(r.remoteStore,s.targetId),qm(r,s.targetId)}).catch(Za)):(qm(r,s.targetId),await Wm(r.localStore,s.targetId,!0))}async function jN(n,e){const t=Re(n),r=t.ru.get(e),s=t.iu.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),$g(t.remoteStore,r.targetId))}async function BN(n,e,t){const r=KN(n);try{const s=await function(u,h){const f=Re(u),p=xt.now(),y=h.reduce((C,A)=>C.add(A.key),be());let w,T;return f.persistence.runTransaction("Locally write mutations","readwrite",C=>{let A=ki(),M=be();return f.Cs.getEntries(C,y).next(D=>{A=D,A.forEach((H,Z)=>{Z.isValidDocument()||(M=M.add(H))})}).next(()=>f.localDocuments.getOverlayedDocuments(C,A)).next(D=>{w=D;const H=[];for(const Z of h){const K=r4(Z,w.get(Z.key).overlayedDocument);K!=null&&H.push(new As(Z.key,K,iT(K.value.mapValue),Zn.exists(!0)))}return f.mutationQueue.addMutationBatch(C,p,H,h)}).next(D=>{T=D;const H=D.applyToLocalDocumentSet(w,M);return f.documentOverlayCache.saveOverlays(C,D.batchId,H)})}).then(()=>({batchId:T.batchId,changes:pT(w)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(u,h,f){let p=u.uu[u.currentUser.toKey()];p||(p=new Ct(Pe)),p=p.insert(h,f),u.uu[u.currentUser.toKey()]=p}(r,s.batchId,t),await Qu(r,s.changes),await Xd(r.remoteStore)}catch(s){const a=Qg(s,"Failed to persist write");t.reject(a)}}async function KT(n,e){const t=Re(n);try{const r=await eN(t.localStore,e);e.targetChanges.forEach((s,a)=>{const u=t._u.get(a);u&&(Ke(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?u.tu=!0:s.modifiedDocuments.size>0?Ke(u.tu,14607):s.removedDocuments.size>0&&(Ke(u.tu,42227),u.tu=!1))}),await Qu(t,r,e)}catch(r){await Za(r)}}function M1(n,e,t){const r=Re(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.ru.forEach((a,u)=>{const h=u.view.ga(e);h.snapshot&&s.push(h.snapshot)}),function(u,h){const f=Re(u);f.onlineState=h;let p=!1;f.queries.forEach((y,w)=>{for(const T of w.Ra)T.ga(h)&&(p=!0)}),p&&Jg(f)}(r.eventManager,e),s.length&&r.nu.Q_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function zN(n,e,t){const r=Re(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r._u.get(e),a=s&&s.key;if(a){let u=new Ct(_e.comparator);u=u.insert(a,rn.newNoDocument(a,Ce.min()));const h=be().add(a),f=new Kd(Ce.min(),new Map,new Ct(Pe),u,h);await KT(r,f),r.ou=r.ou.remove(a),r._u.delete(e),t_(r)}else await Wm(r.localStore,e,!1).then(()=>qm(r,e,t)).catch(Za)}async function WN(n,e){const t=Re(n),r=e.batch.batchId;try{const s=await Z4(t.localStore,e);YT(t,r,null),QT(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Qu(t,s)}catch(s){await Za(s)}}async function $N(n,e,t){const r=Re(n);try{const s=await function(u,h){const f=Re(u);return f.persistence.runTransaction("Reject batch","readwrite-primary",p=>{let y;return f.mutationQueue.lookupMutationBatch(p,h).next(w=>(Ke(w!==null,37113),y=w.keys(),f.mutationQueue.removeMutationBatch(p,w))).next(()=>f.mutationQueue.performConsistencyCheck(p)).next(()=>f.documentOverlayCache.removeOverlaysForBatchId(p,y,h)).next(()=>f.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(p,y)).next(()=>f.localDocuments.getDocuments(p,y))})}(r.localStore,e);YT(r,e,t),QT(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Qu(r,s)}catch(s){await Za(s)}}function QT(n,e){(n.cu.get(e)||[]).forEach(t=>{t.resolve()}),n.cu.delete(e)}function YT(n,e,t){const r=Re(n);let s=r.uu[r.currentUser.toKey()];if(s){const a=s.get(e);a&&(t?a.reject(t):a.resolve(),s=s.remove(e)),r.uu[r.currentUser.toKey()]=s}}function qm(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.iu.get(e))n.ru.delete(r),t&&n.nu.Tu(r,t);n.iu.delete(e),n.isPrimaryClient&&n.au.Ur(e).forEach(r=>{n.au.containsKey(r)||XT(n,r)})}function XT(n,e){n.su.delete(e.path.canonicalString());const t=n.ou.get(e);t!==null&&($g(n.remoteStore,t),n.ou=n.ou.remove(e),n._u.delete(t),t_(n))}function V1(n,e,t){for(const r of t)r instanceof HT?(n.au.addReference(r.key,e),HN(n,r)):r instanceof qT?(ce(e_,"Document no longer in limbo: "+r.key),n.au.removeReference(r.key,e),n.au.containsKey(r.key)||XT(n,r.key)):Te(19791,{Iu:r})}function HN(n,e){const t=e.key,r=t.path.canonicalString();n.ou.get(t)||n.su.has(r)||(ce(e_,"New document in limbo: "+t),n.su.add(r),t_(n))}function t_(n){for(;n.su.size>0&&n.ou.size<n.maxConcurrentLimboResolutions;){const e=n.su.values().next().value;n.su.delete(e);const t=new _e(rt.fromString(e)),r=n.lu.next();n._u.set(r,new bN(t)),n.ou=n.ou.insert(t,r),UT(n.remoteStore,new cs(Fr(Wd(t.path)),r,"TargetPurposeLimboResolution",Ud.le))}}async function Qu(n,e,t){const r=Re(n),s=[],a=[],u=[];r.ru.isEmpty()||(r.ru.forEach((h,f)=>{u.push(r.Pu(f,e,t).then(p=>{var y;if((p||t)&&r.isPrimaryClient){const w=p?!p.fromCache:(y=t==null?void 0:t.targetChanges.get(f.targetId))===null||y===void 0?void 0:y.current;r.sharedClientState.updateQueryState(f.targetId,w?"current":"not-current")}if(p){s.push(p);const w=zg.Ps(f.targetId,p);a.push(w)}}))}),await Promise.all(u),r.nu.Q_(s),await async function(f,p){const y=Re(f);try{await y.persistence.runTransaction("notifyLocalViewChanges","readwrite",w=>Y.forEach(p,T=>Y.forEach(T.ls,C=>y.persistence.referenceDelegate.addReference(w,T.targetId,C)).next(()=>Y.forEach(T.hs,C=>y.persistence.referenceDelegate.removeReference(w,T.targetId,C)))))}catch(w){if(!el(w))throw w;ce(Wg,"Failed to update sequence numbers: "+w)}for(const w of p){const T=w.targetId;if(!w.fromCache){const C=y.Ss.get(T),A=C.snapshotVersion,M=C.withLastLimboFreeSnapshotVersion(A);y.Ss=y.Ss.insert(T,M)}}}(r.localStore,a))}async function qN(n,e){const t=Re(n);if(!t.currentUser.isEqual(e)){ce(e_,"User change. New user:",e.toKey());const r=await LT(t.localStore,e);t.currentUser=e,function(a,u){a.cu.forEach(h=>{h.forEach(f=>{f.reject(new se(G.CANCELLED,u))})}),a.cu.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Qu(t,r.Ms)}}function GN(n,e){const t=Re(n),r=t._u.get(e);if(r&&r.tu)return be().add(r.key);{let s=be();const a=t.iu.get(e);if(!a)return s;for(const u of a){const h=t.ru.get(u);s=s.unionWith(h.view.Wa)}return s}}function JT(n){const e=Re(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=KT.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=GN.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=zN.bind(null,e),e.nu.Q_=NN.bind(null,e.eventManager),e.nu.Tu=xN.bind(null,e.eventManager),e}function KN(n){const e=Re(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=WN.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=$N.bind(null,e),e}class dd{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Qd(e.databaseInfo.databaseId),this.sharedClientState=this.Au(e),this.persistence=this.Ru(e),await this.persistence.start(),this.localStore=this.Vu(e),this.gcScheduler=this.mu(e,this.localStore),this.indexBackfillerScheduler=this.fu(e,this.localStore)}mu(e,t){return null}fu(e,t){return null}Vu(e){return J4(this.persistence,new Q4,e.initialUser,this.serializer)}Ru(e){return new bT(Bg.Ei,this.serializer)}Au(e){return new sN}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}dd.provider={build:()=>new dd};class QN extends dd{constructor(e){super(),this.cacheSizeBytes=e}mu(e,t){Ke(this.persistence.referenceDelegate instanceof cd,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new b4(r,e.asyncQueue,t)}Ru(e){const t=this.cacheSizeBytes!==void 0?Rn.withCacheSize(this.cacheSizeBytes):Rn.DEFAULT;return new bT(r=>cd.Ei(r,t),this.serializer)}}class Gm{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>M1(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=qN.bind(null,this.syncEngine),await kN(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new PN}()}createDatastore(e){const t=Qd(e.databaseInfo.databaseId),r=function(a){return new cN(a)}(e.databaseInfo);return function(a,u,h,f){return new pN(a,u,h,f)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,a,u,h){return new gN(r,s,a,u,h)}(this.localStore,this.datastore,e.asyncQueue,t=>M1(this.syncEngine,t,0),function(){return N1.C()?new N1:new oN}())}createSyncEngine(e,t){return function(s,a,u,h,f,p,y){const w=new LN(s,a,u,h,f,p);return y&&(w.hu=!0),w}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const a=Re(s);ce(ho,"RemoteStore shutting down."),a.aa.add(5),await Ku(a),a.ca.shutdown(),a.la.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Gm.provider={build:()=>new Gm};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.pu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.pu(this.observer.error,e):Ri("Uncaught Error in snapshot listener:",e.toString()))}yu(){this.muted=!0}pu(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ss="FirestoreClient";class YN{constructor(e,t,r,s,a){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=nn.UNAUTHENTICATED,this.clientId=KE.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=a,this.authCredentials.start(r,async u=>{ce(Ss,"Received user=",u.uid),await this.authCredentialListener(u),this.user=u}),this.appCheckCredentials.start(r,u=>(ce(Ss,"Received new app check token=",u),this.appCheckCredentialListener(u,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new wi;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Qg(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function hm(n,e){n.asyncQueue.verifyOperationInProgress(),ce(Ss,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await LT(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function F1(n,e){n.asyncQueue.verifyOperationInProgress();const t=await XN(n);ce(Ss,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>O1(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>O1(e.remoteStore,s)),n._onlineComponents=e}async function XN(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){ce(Ss,"Using user provided OfflineComponentProvider");try{await hm(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===G.FAILED_PRECONDITION||s.code===G.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Oa("Error using user provided cache. Falling back to memory cache: "+t),await hm(n,new dd)}}else ce(Ss,"Using default OfflineComponentProvider"),await hm(n,new QN(void 0));return n._offlineComponents}async function ZT(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(ce(Ss,"Using user provided OnlineComponentProvider"),await F1(n,n._uninitializedComponentsProvider._online)):(ce(Ss,"Using default OnlineComponentProvider"),await F1(n,new Gm))),n._onlineComponents}function JN(n){return ZT(n).then(e=>e.syncEngine)}async function fd(n){const e=await ZT(n),t=e.eventManager;return t.onListen=MN.bind(null,e.syncEngine),t.onUnlisten=UN.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=VN.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=jN.bind(null,e.syncEngine),t}function ZN(n,e,t={}){const r=new wi;return n.asyncQueue.enqueueAndForget(async()=>function(a,u,h,f,p){const y=new n_({next:T=>{y.yu(),u.enqueueAndForget(()=>Xg(a,w));const C=T.docs.has(h);!C&&T.fromCache?p.reject(new se(G.UNAVAILABLE,"Failed to get document because the client is offline.")):C&&T.fromCache&&f&&f.source==="server"?p.reject(new se(G.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):p.resolve(T)},error:T=>p.reject(T)}),w=new Zg(Wd(h.path),y,{includeMetadataChanges:!0,Fa:!0});return Yg(a,w)}(await fd(n),n.asyncQueue,e,t,r)),r.promise}function ex(n,e,t={}){const r=new wi;return n.asyncQueue.enqueueAndForget(async()=>function(a,u,h,f,p){const y=new n_({next:T=>{y.yu(),u.enqueueAndForget(()=>Xg(a,w)),T.fromCache&&f.source==="server"?p.reject(new se(G.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):p.resolve(T)},error:T=>p.reject(T)}),w=new Zg(h,y,{includeMetadataChanges:!0,Fa:!0});return Yg(a,w)}(await fd(n),n.asyncQueue,e,t,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eI(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U1=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tI(n,e,t){if(!t)throw new se(G.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function tx(n,e,t,r){if(e===!0&&r===!0)throw new se(G.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function j1(n){if(!_e.isDocumentKey(n))throw new se(G.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function B1(n){if(_e.isDocumentKey(n))throw new se(G.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Jd(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":Te(12329,{type:typeof n})}function xn(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new se(G.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Jd(n);throw new se(G.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function nx(n,e){if(e<=0)throw new se(G.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nI="firestore.googleapis.com",z1=!0;class W1{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new se(G.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=nI,this.ssl=z1}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:z1;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=DT;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<O4)throw new se(G.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}tx("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=eI((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new se(G.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new se(G.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new se(G.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Zd{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new W1({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new se(G.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new se(G.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new W1(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new lP;switch(r.type){case"firstParty":return new dP(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new se(G.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=U1.get(t);r&&(ce("ComponentProvider","Removing Datastore"),U1.delete(t),r.terminate())}(this),Promise.resolve()}}function rx(n,e,t,r={}){var s;const a=(n=xn(n,Zd))._getSettings(),u=Object.assign(Object.assign({},a),{emulatorOptions:n._getEmulatorOptions()}),h=`${e}:${t}`;a.host!==nI&&a.host!==h&&Oa("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const f=Object.assign(Object.assign({},a),{host:h,ssl:!1,emulatorOptions:r});if(!ys(f,u)&&(n._setSettings(f),r.mockUserToken)){let p,y;if(typeof r.mockUserToken=="string")p=r.mockUserToken,y=nn.MOCK_USER;else{p=Rg(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const w=r.mockUserToken.sub||r.mockUserToken.user_id;if(!w)throw new se(G.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");y=new nn(w)}n._authCredentials=new uP(new qE(p,y))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gr{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Gr(this.firestore,e,this._query)}}class on{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gs(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new on(this.firestore,e,this._key)}}class gs extends Gr{constructor(e,t,r){super(e,t,Wd(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new on(this.firestore,null,new _e(e))}withConverter(e){return new gs(this.firestore,e,this._path)}}function ix(n,e,...t){if(n=Oe(n),tI("collection","path",e),n instanceof Zd){const r=rt.fromString(e,...t);return B1(r),new gs(n,null,r)}{if(!(n instanceof on||n instanceof gs))throw new se(G.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(rt.fromString(e,...t));return B1(r),new gs(n.firestore,null,r)}}function rI(n,e,...t){if(n=Oe(n),arguments.length===1&&(e=KE.newId()),tI("doc","path",e),n instanceof Zd){const r=rt.fromString(e,...t);return j1(r),new on(n,null,new _e(r))}{if(!(n instanceof on||n instanceof gs))throw new se(G.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(rt.fromString(e,...t));return j1(r),new on(n.firestore,n instanceof gs?n.converter:null,new _e(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $1="AsyncQueue";class H1{constructor(e=Promise.resolve()){this.Qu=[],this.$u=!1,this.Uu=[],this.Ku=null,this.Wu=!1,this.Gu=!1,this.zu=[],this.y_=new VT(this,"async_queue_retry"),this.ju=()=>{const r=cm();r&&ce($1,"Visibility state changed to "+r.visibilityState),this.y_.A_()},this.Hu=e;const t=cm();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.ju)}get isShuttingDown(){return this.$u}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Ju(),this.Yu(e)}enterRestrictedMode(e){if(!this.$u){this.$u=!0,this.Gu=e||!1;const t=cm();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.ju)}}enqueue(e){if(this.Ju(),this.$u)return new Promise(()=>{});const t=new wi;return this.Yu(()=>this.$u&&this.Gu?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Qu.push(e),this.Zu()))}async Zu(){if(this.Qu.length!==0){try{await this.Qu[0](),this.Qu.shift(),this.y_.reset()}catch(e){if(!el(e))throw e;ce($1,"Operation failed with retryable error: "+e)}this.Qu.length>0&&this.y_.E_(()=>this.Zu())}}Yu(e){const t=this.Hu.then(()=>(this.Wu=!0,e().catch(r=>{throw this.Ku=r,this.Wu=!1,Ri("INTERNAL UNHANDLED ERROR: ",q1(r)),r}).then(r=>(this.Wu=!1,r))));return this.Hu=t,t}enqueueAfterDelay(e,t,r){this.Ju(),this.zu.indexOf(e)>-1&&(t=0);const s=Kg.createAndSchedule(this,e,t,r,a=>this.Xu(a));return this.Uu.push(s),s}Ju(){this.Ku&&Te(47125,{ec:q1(this.Ku)})}verifyOperationInProgress(){}async tc(){let e;do e=this.Hu,await e;while(e!==this.Hu)}nc(e){for(const t of this.Uu)if(t.timerId===e)return!0;return!1}rc(e){return this.tc().then(()=>{this.Uu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Uu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.tc()})}sc(e){this.zu.push(e)}Xu(e){const t=this.Uu.indexOf(e);this.Uu.splice(t,1)}}function q1(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function G1(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const a of r)if(a in s&&typeof s[a]=="function")return!0;return!1}(n,["next","error","complete"])}class Ai extends Zd{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new H1,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new H1(e),this._firestoreClient=void 0,await e}}}function sx(n,e){const t=typeof n=="object"?n:Hu(),r=typeof n=="string"?n:id,s=Xa(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const a=Ld("firestore");a&&rx(s,...a)}return s}function ef(n){if(n._terminated)throw new se(G.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||ox(n),n._firestoreClient}function ox(n){var e,t,r;const s=n._freezeSettings(),a=function(h,f,p,y){return new kP(h,f,p,y.host,y.ssl,y.experimentalForceLongPolling,y.experimentalAutoDetectLongPolling,eI(y.experimentalLongPollingOptions),y.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new YN(n._authCredentials,n._appCheckCredentials,n._queue,a,n._componentsProvider&&function(h){const f=h==null?void 0:h._online.build();return{_offline:h==null?void 0:h._offline.build(f),_online:f}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ua{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ua(Yt.fromBase64String(e))}catch(t){throw new se(G.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Ua(Yt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tf{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new se(G.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Qt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nf{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r_{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new se(G.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new se(G.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Pe(this._lat,e._lat)||Pe(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class i_{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let a=0;a<r.length;++a)if(r[a]!==s[a])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ax=/^__.*__$/;class lx{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new As(e,this.data,this.fieldMask,t,this.fieldTransforms):new qu(e,this.data,t,this.fieldTransforms)}}class iI{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new As(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function sI(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Te(40011,{oc:n})}}class s_{constructor(e,t,r,s,a,u){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,a===void 0&&this._c(),this.fieldTransforms=a||[],this.fieldMask=u||[]}get path(){return this.settings.path}get oc(){return this.settings.oc}ac(e){return new s_(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}uc(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.ac({path:r,cc:!1});return s.lc(e),s}hc(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.ac({path:r,cc:!1});return s._c(),s}Pc(e){return this.ac({path:void 0,cc:!0})}Tc(e){return pd(e,this.settings.methodName,this.settings.Ic||!1,this.path,this.settings.Ec)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}_c(){if(this.path)for(let e=0;e<this.path.length;e++)this.lc(this.path.get(e))}lc(e){if(e.length===0)throw this.Tc("Document fields must not be empty");if(sI(this.oc)&&ax.test(e))throw this.Tc('Document fields cannot begin and end with "__"')}}class ux{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Qd(e)}dc(e,t,r,s=!1){return new s_({oc:e,methodName:t,Ec:r,path:Qt.emptyPath(),cc:!1,Ic:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Yu(n){const e=n._freezeSettings(),t=Qd(n._databaseId);return new ux(n._databaseId,!!e.ignoreUndefinedProperties,t)}function oI(n,e,t,r,s,a={}){const u=n.dc(a.merge||a.mergeFields?2:0,e,t,s);a_("Data must be an object, but it was:",u,r);const h=lI(r,u);let f,p;if(a.merge)f=new Un(u.fieldMask),p=u.fieldTransforms;else if(a.mergeFields){const y=[];for(const w of a.mergeFields){const T=Km(e,w,t);if(!u.contains(T))throw new se(G.INVALID_ARGUMENT,`Field '${T}' is specified in your field mask but missing from your input data.`);cI(y,T)||y.push(T)}f=new Un(y),p=u.fieldTransforms.filter(w=>f.covers(w.field))}else f=null,p=u.fieldTransforms;return new lx(new kn(h),f,p)}class rf extends nf{_toFieldTransform(e){if(e.oc!==2)throw e.oc===1?e.Tc(`${this._methodName}() can only appear at the top level of your update data`):e.Tc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof rf}}class o_ extends nf{_toFieldTransform(e){return new ZP(e.path,new Ou)}isEqual(e){return e instanceof o_}}function cx(n,e,t,r){const s=n.dc(1,e,t);a_("Data must be an object, but it was:",s,r);const a=[],u=kn.empty();ks(r,(f,p)=>{const y=l_(e,f,t);p=Oe(p);const w=s.hc(y);if(p instanceof rf)a.push(y);else{const T=Xu(p,w);T!=null&&(a.push(y),u.set(y,T))}});const h=new Un(a);return new iI(u,h,s.fieldTransforms)}function hx(n,e,t,r,s,a){const u=n.dc(1,e,t),h=[Km(e,r,t)],f=[s];if(a.length%2!=0)throw new se(G.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let T=0;T<a.length;T+=2)h.push(Km(e,a[T])),f.push(a[T+1]);const p=[],y=kn.empty();for(let T=h.length-1;T>=0;--T)if(!cI(p,h[T])){const C=h[T];let A=f[T];A=Oe(A);const M=u.hc(C);if(A instanceof rf)p.push(C);else{const D=Xu(A,M);D!=null&&(p.push(C),y.set(C,D))}}const w=new Un(p);return new iI(y,w,u.fieldTransforms)}function aI(n,e,t,r=!1){return Xu(t,n.dc(r?4:3,e))}function Xu(n,e){if(uI(n=Oe(n)))return a_("Unsupported field value:",e,n),lI(n,e);if(n instanceof nf)return function(r,s){if(!sI(s.oc))throw s.Tc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Tc(`${r._methodName}() is not currently supported inside arrays`);const a=r._toFieldTransform(s);a&&s.fieldTransforms.push(a)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.cc&&e.oc!==4)throw e.Tc("Nested arrays are not supported");return function(r,s){const a=[];let u=0;for(const h of r){let f=Xu(h,s.Pc(u));f==null&&(f={nullValue:"NULL_VALUE"}),a.push(f),u++}return{arrayValue:{values:a}}}(n,e)}return function(r,s){if((r=Oe(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return YP(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const a=xt.fromDate(r);return{timestampValue:ud(s.serializer,a)}}if(r instanceof xt){const a=new xt(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ud(s.serializer,a)}}if(r instanceof r_)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ua)return{bytesValue:RT(s.serializer,r._byteString)};if(r instanceof on){const a=s.databaseId,u=r.firestore._databaseId;if(!u.isEqual(a))throw s.Tc(`Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`);return{referenceValue:Ug(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof i_)return function(u,h){return{mapValue:{fields:{[nT]:{stringValue:rT},[sd]:{arrayValue:{values:u.toArray().map(p=>{if(typeof p!="number")throw h.Tc("VectorValues must only contain numeric values.");return Lg(h.serializer,p)})}}}}}}(r,s);throw s.Tc(`Unsupported field value: ${Jd(r)}`)}(n,e)}function lI(n,e){const t={};return YE(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):ks(n,(r,s)=>{const a=Xu(s,e.uc(r));a!=null&&(t[r]=a)}),{mapValue:{fields:t}}}function uI(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof xt||n instanceof r_||n instanceof Ua||n instanceof on||n instanceof nf||n instanceof i_)}function a_(n,e,t){if(!uI(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=Jd(t);throw r==="an object"?e.Tc(n+" a custom object"):e.Tc(n+" "+r)}}function Km(n,e,t){if((e=Oe(e))instanceof tf)return e._internalPath;if(typeof e=="string")return l_(n,e);throw pd("Field path arguments must be of type string or ",n,!1,void 0,t)}const dx=new RegExp("[~\\*/\\[\\]]");function l_(n,e,t){if(e.search(dx)>=0)throw pd(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new tf(...e.split("."))._internalPath}catch{throw pd(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function pd(n,e,t,r,s){const a=r&&!r.isEmpty(),u=s!==void 0;let h=`Function ${e}() called with invalid data`;t&&(h+=" (via `toFirestore()`)"),h+=". ";let f="";return(a||u)&&(f+=" (found",a&&(f+=` in field ${r}`),u&&(f+=` in document ${s}`),f+=")"),new se(G.INVALID_ARGUMENT,h+n+f)}function cI(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u_{constructor(e,t,r,s,a){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=a}get id(){return this._key.path.lastSegment()}get ref(){return new on(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new fx(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(sf("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class fx extends u_{data(){return super.data()}}function sf(n,e){return typeof e=="string"?l_(n,e):e instanceof tf?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new se(G.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class c_{}class of extends c_{}function px(n,e,...t){let r=[];e instanceof c_&&r.push(e),r=r.concat(t),function(a){const u=a.filter(f=>f instanceof h_).length,h=a.filter(f=>f instanceof af).length;if(u>1||u>0&&h>0)throw new se(G.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class af extends of{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new af(e,t,r)}_apply(e){const t=this._parse(e);return dI(e._query,t),new Gr(e.firestore,e.converter,Fm(e._query,t))}_parse(e){const t=Yu(e.firestore);return function(a,u,h,f,p,y,w){let T;if(p.isKeyField()){if(y==="array-contains"||y==="array-contains-any")throw new se(G.INVALID_ARGUMENT,`Invalid Query. You can't perform '${y}' queries on documentId().`);if(y==="in"||y==="not-in"){Q1(w,y);const A=[];for(const M of w)A.push(K1(f,a,M));T={arrayValue:{values:A}}}else T=K1(f,a,w)}else y!=="in"&&y!=="not-in"&&y!=="array-contains-any"||Q1(w,y),T=aI(h,u,w,y==="in"||y==="not-in");return St.create(p,y,T)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function mx(n,e,t){const r=e,s=sf("where",n);return af._create(s,r,t)}class h_ extends c_{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new h_(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:vr.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,a){let u=s;const h=a.getFlattenedFilters();for(const f of h)dI(u,f),u=Fm(u,f)}(e._query,t),new Gr(e.firestore,e.converter,Fm(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class d_ extends of{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new d_(e,t)}_apply(e){const t=function(s,a,u){if(s.startAt!==null)throw new se(G.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new se(G.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new xu(a,u)}(e._query,this._field,this._direction);return new Gr(e.firestore,e.converter,function(s,a){const u=s.explicitOrderBy.concat([a]);return new vo(s.path,s.collectionGroup,u,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function WM(n,e="asc"){const t=e,r=sf("orderBy",n);return d_._create(r,t)}class f_ extends of{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new f_(e,t,r)}_apply(e){return new Gr(e.firestore,e.converter,ad(e._query,this._limit,this._limitType))}}function $M(n){return nx("limit",n),f_._create("limit",n,"F")}class p_ extends of{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new p_(e,t,r)}_apply(e){const t=gx(e,this.type,this._docOrFields,this._inclusive);return new Gr(e.firestore,e.converter,function(s,a){return new vo(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,a,s.endAt)}(e._query,t))}}function HM(...n){return p_._create("startAfter",n,!1)}function gx(n,e,t,r){if(t[0]=Oe(t[0]),t[0]instanceof u_)return function(a,u,h,f,p){if(!f)throw new se(G.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${h}().`);const y=[];for(const w of Sa(a))if(w.field.isKeyField())y.push(od(u,f.key));else{const T=f.data.field(w.field);if(Bd(T))throw new se(G.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+w.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(T===null){const C=w.field.canonicalString();throw new se(G.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${C}' (used as the orderBy) does not exist.`)}y.push(T)}return new Ma(y,p)}(n._query,n.firestore._databaseId,e,t[0]._document,r);{const s=Yu(n.firestore);return function(u,h,f,p,y,w){const T=u.explicitOrderBy;if(y.length>T.length)throw new se(G.INVALID_ARGUMENT,`Too many arguments provided to ${p}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const C=[];for(let A=0;A<y.length;A++){const M=y[A];if(T[A].field.isKeyField()){if(typeof M!="string")throw new se(G.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${p}(), but got a ${typeof M}`);if(!bg(u)&&M.indexOf("/")!==-1)throw new se(G.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${p}() must be a plain document ID, but '${M}' contains a slash.`);const D=u.path.child(rt.fromString(M));if(!_e.isDocumentKey(D))throw new se(G.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${p}() must result in a valid document path, but '${D}' is not because it contains an odd number of segments.`);const H=new _e(D);C.push(od(h,H))}else{const D=aI(f,p,M);C.push(D)}}return new Ma(C,w)}(n._query,n.firestore._databaseId,s,e,t,r)}}function K1(n,e,t){if(typeof(t=Oe(t))=="string"){if(t==="")throw new se(G.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!bg(e)&&t.indexOf("/")!==-1)throw new se(G.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(rt.fromString(t));if(!_e.isDocumentKey(r))throw new se(G.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return od(n,new _e(r))}if(t instanceof on)return od(n,t._key);throw new se(G.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Jd(t)}.`)}function Q1(n,e){if(!Array.isArray(n)||n.length===0)throw new se(G.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function dI(n,e){const t=function(s,a){for(const u of s)for(const h of u.getFlattenedFilters())if(a.indexOf(h.op)>=0)return h.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new se(G.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new se(G.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class _x{convertValue(e,t="none"){switch(Ts(e)){case 0:return null;case 1:return e.booleanValue;case 2:return wt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Es(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw Te(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return ks(e,(s,a)=>{r[s]=this.convertValue(a,t)}),r}convertVectorValue(e){var t,r,s;const a=(s=(r=(t=e.fields)===null||t===void 0?void 0:t[sd].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(u=>wt(u.doubleValue));return new i_(a)}convertGeoPoint(e){return new r_(wt(e.latitude),wt(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=zd(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Au(e));default:return null}}convertTimestamp(e){const t=ws(e);return new xt(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=rt.fromString(e);Ke(OT(r),9688,{name:e});const s=new Pu(r.get(1),r.get(3)),a=new _e(r.popFirst(5));return s.isEqual(t)||Ri(`Document ${a} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),a}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fI(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fu{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class pI extends u_{constructor(e,t,r,s,a,u){super(e,t,r,s,u),this._firestore=e,this._firestoreImpl=e,this.metadata=a}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new $h(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(sf("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class $h extends pI{data(e={}){return super.data(e)}}class mI{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new fu(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new $h(this._firestore,this._userDataWriter,r.key,r,new fu(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new se(G.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,a){if(s._snapshot.oldDocs.isEmpty()){let u=0;return s._snapshot.docChanges.map(h=>{const f=new $h(s._firestore,s._userDataWriter,h.doc.key,h.doc,new fu(s._snapshot.mutatedKeys.has(h.doc.key),s._snapshot.fromCache),s.query.converter);return h.doc,{type:"added",doc:f,oldIndex:-1,newIndex:u++}})}{let u=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(h=>a||h.type!==3).map(h=>{const f=new $h(s._firestore,s._userDataWriter,h.doc.key,h.doc,new fu(s._snapshot.mutatedKeys.has(h.doc.key),s._snapshot.fromCache),s.query.converter);let p=-1,y=-1;return h.type!==0&&(p=u.indexOf(h.doc.key),u=u.delete(h.doc.key)),h.type!==1&&(u=u.add(h.doc),y=u.indexOf(h.doc.key)),{type:yx(h.type),doc:f,oldIndex:p,newIndex:y}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function yx(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Te(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qM(n){n=xn(n,on);const e=xn(n.firestore,Ai);return ZN(ef(e),n._key).then(t=>gI(e,n,t))}class m_ extends _x{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ua(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new on(this.firestore,null,t)}}function vx(n){n=xn(n,Gr);const e=xn(n.firestore,Ai),t=ef(e),r=new m_(e);return hI(n._query),ex(t,n._query).then(s=>new mI(e,r,n,s))}function wx(n,e,t){n=xn(n,on);const r=xn(n.firestore,Ai),s=fI(n.converter,e,t);return lf(r,[oI(Yu(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,Zn.none())])}function GM(n,e,t,...r){n=xn(n,on);const s=xn(n.firestore,Ai),a=Yu(s);let u;return u=typeof(e=Oe(e))=="string"||e instanceof tf?hx(a,"updateDoc",n._key,e,t,r):cx(a,"updateDoc",n._key,e),lf(s,[u.toMutation(n._key,Zn.exists(!0))])}function KM(n){return lf(xn(n.firestore,Ai),[new Mg(n._key,Zn.none())])}function QM(n,e){const t=xn(n.firestore,Ai),r=rI(n),s=fI(n.converter,e);return lf(t,[oI(Yu(n.firestore),"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Zn.exists(!1))]).then(()=>r)}function YM(n,...e){var t,r,s;n=Oe(n);let a={includeMetadataChanges:!1,source:"default"},u=0;typeof e[u]!="object"||G1(e[u])||(a=e[u],u++);const h={includeMetadataChanges:a.includeMetadataChanges,source:a.source};if(G1(e[u])){const w=e[u];e[u]=(t=w.next)===null||t===void 0?void 0:t.bind(w),e[u+1]=(r=w.error)===null||r===void 0?void 0:r.bind(w),e[u+2]=(s=w.complete)===null||s===void 0?void 0:s.bind(w)}let f,p,y;if(n instanceof on)p=xn(n.firestore,Ai),y=Wd(n._key.path),f={next:w=>{e[u]&&e[u](gI(p,n,w))},error:e[u+1],complete:e[u+2]};else{const w=xn(n,Gr);p=xn(w.firestore,Ai),y=w._query;const T=new m_(p);f={next:C=>{e[u]&&e[u](new mI(p,T,w,C))},error:e[u+1],complete:e[u+2]},hI(n._query)}return function(T,C,A,M){const D=new n_(M),H=new Zg(C,D,A);return T.asyncQueue.enqueueAndForget(async()=>Yg(await fd(T),H)),()=>{D.yu(),T.asyncQueue.enqueueAndForget(async()=>Xg(await fd(T),H))}}(ef(p),y,h,f)}function lf(n,e){return function(r,s){const a=new wi;return r.asyncQueue.enqueueAndForget(async()=>BN(await JN(r),s,a)),a.promise}(ef(n),e)}function gI(n,e,t){const r=t.docs.get(e._key),s=new m_(n);return new pI(n,s,e._key,r,new fu(t.hasPendingWrites,t.fromCache),e.converter)}function XM(){return new o_("serverTimestamp")}(function(e,t=!0){(function(s){Ja=s})(Rs),Ci(new zr("firestore",(r,{instanceIdentifier:s,options:a})=>{const u=r.getProvider("app").getImmediate(),h=new Ai(new cP(r.getProvider("auth-internal")),new fP(u,r.getProvider("app-check-internal")),function(p,y){if(!Object.prototype.hasOwnProperty.apply(p.options,["projectId"]))throw new se(G.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Pu(p.options.projectId,y)}(u,s),u);return a=Object.assign({useFetchStreams:t},a),h._setSettings(a),h},"PUBLIC").setMultipleInstances(!0)),Nn(X0,J0,e),Nn(X0,J0,"esm2017")})();var Ex="firebase",Tx="11.6.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Nn(Ex,Tx,"app");function g_(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function _I(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Ix=_I,yI=new $u("auth","Firebase",_I());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const md=new Fd("@firebase/auth");function Sx(n,...e){md.logLevel<=xe.WARN&&md.warn(`Auth (${Rs}): ${n}`,...e)}function Hh(n,...e){md.logLevel<=xe.ERROR&&md.error(`Auth (${Rs}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(n,...e){throw __(n,...e)}function jr(n,...e){return __(n,...e)}function vI(n,e,t){const r=Object.assign(Object.assign({},Ix()),{[e]:t});return new $u("auth","Firebase",r).create(e,{appName:n.name})}function Ei(n){return vI(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function __(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return yI.create(n,...e)}function Ee(n,e,...t){if(!n)throw __(e,...t)}function pi(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Hh(e),new Error(e)}function Pi(n,e){n||pi(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qm(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Cx(){return Y1()==="http:"||Y1()==="https:"}function Y1(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rx(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Cx()||Fk()||"connection"in navigator)?navigator.onLine:!0}function kx(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ju{constructor(e,t){this.shortDelay=e,this.longDelay=t,Pi(t>e,"Short delay should be less than long delay!"),this.isMobile=kg()||OE()}get(){return Rx()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y_(n,e){Pi(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wI{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;pi("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;pi("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;pi("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ax={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Px=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Nx=new Ju(3e4,6e4);function Oi(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Kr(n,e,t,r,s={}){return EI(n,s,async()=>{let a={},u={};r&&(e==="GET"?u=r:a={body:JSON.stringify(r)});const h=Ya(Object.assign({key:n.config.apiKey},u)).slice(1),f=await n._getAdditionalHeaders();f["Content-Type"]="application/json",n.languageCode&&(f["X-Firebase-Locale"]=n.languageCode);const p=Object.assign({method:e,headers:f},a);return Vk()||(p.referrerPolicy="no-referrer"),wI.fetch()(await TI(n,n.config.apiHost,t,h),p)})}async function EI(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},Ax),e);try{const s=new Ox(n),a=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const u=await a.json();if("needConfirmation"in u)throw Oh(n,"account-exists-with-different-credential",u);if(a.ok&&!("errorMessage"in u))return u;{const h=a.ok?u.errorMessage:u.error.message,[f,p]=h.split(" : ");if(f==="FEDERATED_USER_ID_ALREADY_LINKED")throw Oh(n,"credential-already-in-use",u);if(f==="EMAIL_EXISTS")throw Oh(n,"email-already-in-use",u);if(f==="USER_DISABLED")throw Oh(n,"user-disabled",u);const y=r[f]||f.toLowerCase().replace(/[_\s]+/g,"-");if(p)throw vI(n,y,p);wr(n,y)}}catch(s){if(s instanceof Ir)throw s;wr(n,"network-request-failed",{message:String(s)})}}async function Zu(n,e,t,r,s={}){const a=await Kr(n,e,t,r,s);return"mfaPendingCredential"in a&&wr(n,"multi-factor-auth-required",{_serverResponse:a}),a}async function TI(n,e,t,r){const s=`${e}${t}?${r}`,a=n,u=a.config.emulator?y_(n.config,s):`${n.config.apiScheme}://${s}`;return Px.includes(t)&&(await a._persistenceManagerAvailable,a._getPersistenceType()==="COOKIE")?a._getPersistence()._getFinalTarget(u).toString():u}function xx(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Ox{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(jr(this.auth,"network-request-failed")),Nx.get())})}}function Oh(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=jr(n,e,r);return s.customData._tokenResponse=t,s}function X1(n){return n!==void 0&&n.enterprise!==void 0}class Dx{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return xx(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function bx(n,e){return Kr(n,"GET","/v2/recaptchaConfig",Oi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Lx(n,e){return Kr(n,"POST","/v1/accounts:delete",e)}async function gd(n,e){return Kr(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yu(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Mx(n,e=!1){const t=Oe(n),r=await t.getIdToken(e),s=v_(r);Ee(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const a=typeof s.firebase=="object"?s.firebase:void 0,u=a==null?void 0:a.sign_in_provider;return{claims:s,token:r,authTime:yu(dm(s.auth_time)),issuedAtTime:yu(dm(s.iat)),expirationTime:yu(dm(s.exp)),signInProvider:u||null,signInSecondFactor:(a==null?void 0:a.sign_in_second_factor)||null}}function dm(n){return Number(n)*1e3}function v_(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Hh("JWT malformed, contained fewer than 3 sections"),null;try{const s=ed(t);return s?JSON.parse(s):(Hh("Failed to decode base64 JWT payload"),null)}catch(s){return Hh("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function J1(n){const e=v_(n);return Ee(e,"internal-error"),Ee(typeof e.exp<"u","internal-error"),Ee(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ja(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Ir&&Vx(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Vx({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fx{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ym{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=yu(this.lastLoginAt),this.creationTime=yu(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _d(n){var e;const t=n.auth,r=await n.getIdToken(),s=await ja(n,gd(t,{idToken:r}));Ee(s==null?void 0:s.users.length,t,"internal-error");const a=s.users[0];n._notifyReloadListener(a);const u=!((e=a.providerUserInfo)===null||e===void 0)&&e.length?II(a.providerUserInfo):[],h=jx(n.providerData,u),f=n.isAnonymous,p=!(n.email&&a.passwordHash)&&!(h!=null&&h.length),y=f?p:!1,w={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:h,metadata:new Ym(a.createdAt,a.lastLoginAt),isAnonymous:y};Object.assign(n,w)}async function Ux(n){const e=Oe(n);await _d(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function jx(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function II(n){return n.map(e=>{var{providerId:t}=e,r=g_(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bx(n,e){const t=await EI(n,{},async()=>{const r=Ya({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:a}=n.config,u=await TI(n,s,"/v1/token",`key=${a}`),h=await n._getAdditionalHeaders();return h["Content-Type"]="application/x-www-form-urlencoded",wI.fetch()(u,{method:"POST",headers:h,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function zx(n,e){return Kr(n,"POST","/v2/accounts:revokeToken",Oi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ra{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Ee(e.idToken,"internal-error"),Ee(typeof e.idToken<"u","internal-error"),Ee(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):J1(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){Ee(e.length!==0,"internal-error");const t=J1(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(Ee(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:a}=await Bx(e,t);this.updateTokensAndExpiration(r,s,Number(a))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:a}=t,u=new Ra;return r&&(Ee(typeof r=="string","internal-error",{appName:e}),u.refreshToken=r),s&&(Ee(typeof s=="string","internal-error",{appName:e}),u.accessToken=s),a&&(Ee(typeof a=="number","internal-error",{appName:e}),u.expirationTime=a),u}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Ra,this.toJSON())}_performRefresh(){return pi("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function is(n,e){Ee(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class gr{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,a=g_(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Fx(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=a.displayName||null,this.email=a.email||null,this.emailVerified=a.emailVerified||!1,this.phoneNumber=a.phoneNumber||null,this.photoURL=a.photoURL||null,this.isAnonymous=a.isAnonymous||!1,this.tenantId=a.tenantId||null,this.providerData=a.providerData?[...a.providerData]:[],this.metadata=new Ym(a.createdAt||void 0,a.lastLoginAt||void 0)}async getIdToken(e){const t=await ja(this,this.stsTokenManager.getToken(this.auth,e));return Ee(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Mx(this,e)}reload(){return Ux(this)}_assign(e){this!==e&&(Ee(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new gr(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){Ee(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await _d(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(fn(this.auth.app))return Promise.reject(Ei(this.auth));const e=await this.getIdToken();return await ja(this,Lx(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,a,u,h,f,p,y;const w=(r=t.displayName)!==null&&r!==void 0?r:void 0,T=(s=t.email)!==null&&s!==void 0?s:void 0,C=(a=t.phoneNumber)!==null&&a!==void 0?a:void 0,A=(u=t.photoURL)!==null&&u!==void 0?u:void 0,M=(h=t.tenantId)!==null&&h!==void 0?h:void 0,D=(f=t._redirectEventId)!==null&&f!==void 0?f:void 0,H=(p=t.createdAt)!==null&&p!==void 0?p:void 0,Z=(y=t.lastLoginAt)!==null&&y!==void 0?y:void 0,{uid:K,emailVerified:re,isAnonymous:Ie,providerData:we,stsTokenManager:O}=t;Ee(K&&O,e,"internal-error");const S=Ra.fromJSON(this.name,O);Ee(typeof K=="string",e,"internal-error"),is(w,e.name),is(T,e.name),Ee(typeof re=="boolean",e,"internal-error"),Ee(typeof Ie=="boolean",e,"internal-error"),is(C,e.name),is(A,e.name),is(M,e.name),is(D,e.name),is(H,e.name),is(Z,e.name);const R=new gr({uid:K,auth:e,email:T,emailVerified:re,displayName:w,isAnonymous:Ie,photoURL:A,phoneNumber:C,tenantId:M,stsTokenManager:S,createdAt:H,lastLoginAt:Z});return we&&Array.isArray(we)&&(R.providerData=we.map(N=>Object.assign({},N))),D&&(R._redirectEventId=D),R}static async _fromIdTokenResponse(e,t,r=!1){const s=new Ra;s.updateFromServerResponse(t);const a=new gr({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await _d(a),a}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];Ee(s.localId!==void 0,"internal-error");const a=s.providerUserInfo!==void 0?II(s.providerUserInfo):[],u=!(s.email&&s.passwordHash)&&!(a!=null&&a.length),h=new Ra;h.updateFromIdToken(r);const f=new gr({uid:s.localId,auth:e,stsTokenManager:h,isAnonymous:u}),p={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Ym(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(a!=null&&a.length)};return Object.assign(f,p),f}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z1=new Map;function mi(n){Pi(n instanceof Function,"Expected a class definition");let e=Z1.get(n);return e?(Pi(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Z1.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SI{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}SI.type="NONE";const ew=SI;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qh(n,e,t){return`firebase:${n}:${e}:${t}`}class ka{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:a}=this.auth;this.fullUserKey=qh(this.userKey,s.apiKey,a),this.fullPersistenceKey=qh("persistence",s.apiKey,a),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await gd(this.auth,{idToken:e}).catch(()=>{});return t?gr._fromGetAccountInfoResponse(this.auth,t,e):null}return gr._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new ka(mi(ew),e,r);const s=(await Promise.all(t.map(async p=>{if(await p._isAvailable())return p}))).filter(p=>p);let a=s[0]||mi(ew);const u=qh(r,e.config.apiKey,e.name);let h=null;for(const p of t)try{const y=await p._get(u);if(y){let w;if(typeof y=="string"){const T=await gd(e,{idToken:y}).catch(()=>{});if(!T)break;w=await gr._fromGetAccountInfoResponse(e,T,y)}else w=gr._fromJSON(e,y);p!==a&&(h=w),a=p;break}}catch{}const f=s.filter(p=>p._shouldAllowMigration);return!a._shouldAllowMigration||!f.length?new ka(a,e,r):(a=f[0],h&&await a._set(u,h.toJSON()),await Promise.all(t.map(async p=>{if(p!==a)try{await p._remove(u)}catch{}})),new ka(a,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tw(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(AI(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(CI(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(NI(e))return"Blackberry";if(xI(e))return"Webos";if(RI(e))return"Safari";if((e.includes("chrome/")||kI(e))&&!e.includes("edge/"))return"Chrome";if(PI(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function CI(n=an()){return/firefox\//i.test(n)}function RI(n=an()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function kI(n=an()){return/crios\//i.test(n)}function AI(n=an()){return/iemobile/i.test(n)}function PI(n=an()){return/android/i.test(n)}function NI(n=an()){return/blackberry/i.test(n)}function xI(n=an()){return/webos/i.test(n)}function w_(n=an()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Wx(n=an()){var e;return w_(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function $x(){return Uk()&&document.documentMode===10}function OI(n=an()){return w_(n)||PI(n)||xI(n)||NI(n)||/windows phone/i.test(n)||AI(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DI(n,e=[]){let t;switch(n){case"Browser":t=tw(an());break;case"Worker":t=`${tw(an())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Rs}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hx{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=a=>new Promise((u,h)=>{try{const f=e(a);u(f)}catch(f){h(f)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function qx(n,e={}){return Kr(n,"GET","/v2/passwordPolicy",Oi(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gx=6;class Kx{constructor(e){var t,r,s,a;const u=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=u.minPasswordLength)!==null&&t!==void 0?t:Gx,u.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=u.maxPasswordLength),u.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=u.containsLowercaseCharacter),u.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=u.containsUppercaseCharacter),u.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=u.containsNumericCharacter),u.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=u.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(a=e.forceUpgradeOnSignin)!==null&&a!==void 0?a:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,a,u,h;const f={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,f),this.validatePasswordCharacterOptions(e,f),f.isValid&&(f.isValid=(t=f.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),f.isValid&&(f.isValid=(r=f.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),f.isValid&&(f.isValid=(s=f.containsLowercaseLetter)!==null&&s!==void 0?s:!0),f.isValid&&(f.isValid=(a=f.containsUppercaseLetter)!==null&&a!==void 0?a:!0),f.isValid&&(f.isValid=(u=f.containsNumericCharacter)!==null&&u!==void 0?u:!0),f.isValid&&(f.isValid=(h=f.containsNonAlphanumericCharacter)!==null&&h!==void 0?h:!0),f}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,a){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=a))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qx{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new nw(this),this.idTokenSubscription=new nw(this),this.beforeStateQueue=new Hx(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=yI,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(a=>this._resolvePersistenceManagerAvailable=a)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=mi(t)),this._initializationPromise=this.queue(async()=>{var r,s,a;if(!this._deleted&&(this.persistenceManager=await ka.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((a=this.currentUser)===null||a===void 0?void 0:a.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await gd(this,{idToken:e}),r=await gr._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(fn(this.app)){const u=this.app.settings.authIdToken;return u?new Promise(h=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(u).then(h,h))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,a=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const u=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,h=s==null?void 0:s._redirectEventId,f=await this.tryRedirectSignIn(e);(!u||u===h)&&(f!=null&&f.user)&&(s=f.user,a=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(a)try{await this.beforeStateQueue.runMiddleware(s)}catch(u){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(u))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return Ee(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await _d(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=kx()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(fn(this.app))return Promise.reject(Ei(this));const t=e?Oe(e):null;return t&&Ee(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&Ee(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return fn(this.app)?Promise.reject(Ei(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return fn(this.app)?Promise.reject(Ei(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(mi(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await qx(this),t=new Kx(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new $u("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await zx(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&mi(e)||this._popupRedirectResolver;Ee(t,this,"argument-error"),this.redirectPersistenceManager=await ka.create(this,[mi(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const a=typeof t=="function"?t:t.next.bind(t);let u=!1;const h=this._isInitialized?Promise.resolve():this._initializationPromise;if(Ee(h,this,"internal-error"),h.then(()=>{u||a(this.currentUser)}),typeof t=="function"){const f=e.addObserver(t,r,s);return()=>{u=!0,f()}}else{const f=e.addObserver(t);return()=>{u=!0,f()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Ee(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=DI(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;if(fn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Sx(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Ps(n){return Oe(n)}class nw{constructor(e){this.auth=e,this.observer=null,this.addObserver=Yk(t=>this.observer=t)}get next(){return Ee(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let uf={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Yx(n){uf=n}function bI(n){return uf.loadJS(n)}function Xx(){return uf.recaptchaEnterpriseScript}function Jx(){return uf.gapiScript}function Zx(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class e3{constructor(){this.enterprise=new t3}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class t3{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const n3="recaptcha-enterprise",LI="NO_RECAPTCHA";class r3{constructor(e){this.type=n3,this.auth=Ps(e)}async verify(e="verify",t=!1){async function r(a){if(!t){if(a.tenantId==null&&a._agentRecaptchaConfig!=null)return a._agentRecaptchaConfig.siteKey;if(a.tenantId!=null&&a._tenantRecaptchaConfigs[a.tenantId]!==void 0)return a._tenantRecaptchaConfigs[a.tenantId].siteKey}return new Promise(async(u,h)=>{bx(a,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(f=>{if(f.recaptchaKey===void 0)h(new Error("recaptcha Enterprise site key undefined"));else{const p=new Dx(f);return a.tenantId==null?a._agentRecaptchaConfig=p:a._tenantRecaptchaConfigs[a.tenantId]=p,u(p.siteKey)}}).catch(f=>{h(f)})})}function s(a,u,h){const f=window.grecaptcha;X1(f)?f.enterprise.ready(()=>{f.enterprise.execute(a,{action:e}).then(p=>{u(p)}).catch(()=>{u(LI)})}):h(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new e3().execute("siteKey",{action:"verify"}):new Promise((a,u)=>{r(this.auth).then(h=>{if(!t&&X1(window.grecaptcha))s(h,a,u);else{if(typeof window>"u"){u(new Error("RecaptchaVerifier is only supported in browser"));return}let f=Xx();f.length!==0&&(f+=h),bI(f).then(()=>{s(h,a,u)}).catch(p=>{u(p)})}}).catch(h=>{u(h)})})}}async function rw(n,e,t,r=!1,s=!1){const a=new r3(n);let u;if(s)u=LI;else try{u=await a.verify(t)}catch{u=await a.verify(t,!0)}const h=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in h){const f=h.phoneEnrollmentInfo.phoneNumber,p=h.phoneEnrollmentInfo.recaptchaToken;Object.assign(h,{phoneEnrollmentInfo:{phoneNumber:f,recaptchaToken:p,captchaResponse:u,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in h){const f=h.phoneSignInInfo.recaptchaToken;Object.assign(h,{phoneSignInInfo:{recaptchaToken:f,captchaResponse:u,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return h}return r?Object.assign(h,{captchaResp:u}):Object.assign(h,{captchaResponse:u}),Object.assign(h,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(h,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),h}async function yd(n,e,t,r,s){var a;if(!((a=n._getRecaptchaConfig())===null||a===void 0)&&a.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const u=await rw(n,e,t,t==="getOobCode");return r(n,u)}else return r(n,e).catch(async u=>{if(u.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const h=await rw(n,e,t,t==="getOobCode");return r(n,h)}else return Promise.reject(u)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function i3(n,e){const t=Xa(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),a=t.getOptions();if(ys(a,e??{}))return s;wr(s,"already-initialized")}return t.initialize({options:e})}function s3(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(mi);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function o3(n,e,t){const r=Ps(n);Ee(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,a=MI(e),{host:u,port:h}=a3(e),f=h===null?"":`:${h}`,p={url:`${a}//${u}${f}/`},y=Object.freeze({host:u,port:h,protocol:a.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){Ee(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),Ee(ys(p,r.config.emulator)&&ys(y,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=p,r.emulatorConfig=y,r.settings.appVerificationDisabledForTesting=!0,l3()}function MI(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function a3(n){const e=MI(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const a=s[1];return{host:a,port:iw(r.substr(a.length+1))}}else{const[a,u]=r.split(":");return{host:a,port:iw(u)}}}function iw(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function l3(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E_{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return pi("not implemented")}_getIdTokenResponse(e){return pi("not implemented")}_linkToIdToken(e,t){return pi("not implemented")}_getReauthenticationResolver(e){return pi("not implemented")}}async function u3(n,e){return Kr(n,"POST","/v1/accounts:update",e)}async function c3(n,e){return Kr(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function h3(n,e){return Zu(n,"POST","/v1/accounts:signInWithPassword",Oi(n,e))}async function d3(n,e){return Kr(n,"POST","/v1/accounts:sendOobCode",Oi(n,e))}async function f3(n,e){return d3(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function p3(n,e){return Zu(n,"POST","/v1/accounts:signInWithEmailLink",Oi(n,e))}async function m3(n,e){return Zu(n,"POST","/v1/accounts:signInWithEmailLink",Oi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lu extends E_{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Lu(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Lu(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return yd(e,t,"signInWithPassword",h3);case"emailLink":return p3(e,{email:this._email,oobCode:this._password});default:wr(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return yd(e,r,"signUpPassword",c3);case"emailLink":return m3(e,{idToken:t,email:this._email,oobCode:this._password});default:wr(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Aa(n,e){return Zu(n,"POST","/v1/accounts:signInWithIdp",Oi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const g3="http://localhost";class fo extends E_{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new fo(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):wr("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,a=g_(t,["providerId","signInMethod"]);if(!r||!s)return null;const u=new fo(r,s);return u.idToken=a.idToken||void 0,u.accessToken=a.accessToken||void 0,u.secret=a.secret,u.nonce=a.nonce,u.pendingToken=a.pendingToken||null,u}_getIdTokenResponse(e){const t=this.buildRequest();return Aa(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Aa(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Aa(e,t)}buildRequest(){const e={requestUri:g3,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Ya(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _3(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function y3(n){const e=lu(uu(n)).link,t=e?lu(uu(e)).deep_link_id:null,r=lu(uu(n)).deep_link_id;return(r?lu(uu(r)).link:null)||r||t||e||n}class T_{constructor(e){var t,r,s,a,u,h;const f=lu(uu(e)),p=(t=f.apiKey)!==null&&t!==void 0?t:null,y=(r=f.oobCode)!==null&&r!==void 0?r:null,w=_3((s=f.mode)!==null&&s!==void 0?s:null);Ee(p&&y&&w,"argument-error"),this.apiKey=p,this.operation=w,this.code=y,this.continueUrl=(a=f.continueUrl)!==null&&a!==void 0?a:null,this.languageCode=(u=f.lang)!==null&&u!==void 0?u:null,this.tenantId=(h=f.tenantId)!==null&&h!==void 0?h:null}static parseLink(e){const t=y3(e);try{return new T_(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nl{constructor(){this.providerId=nl.PROVIDER_ID}static credential(e,t){return Lu._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=T_.parseLink(t);return Ee(r,"argument-error"),Lu._fromEmailAndCode(e,r.code,r.tenantId)}}nl.PROVIDER_ID="password";nl.EMAIL_PASSWORD_SIGN_IN_METHOD="password";nl.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VI{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec extends VI{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss extends ec{constructor(){super("facebook.com")}static credential(e){return fo._fromParams({providerId:ss.PROVIDER_ID,signInMethod:ss.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ss.credentialFromTaggedObject(e)}static credentialFromError(e){return ss.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ss.credential(e.oauthAccessToken)}catch{return null}}}ss.FACEBOOK_SIGN_IN_METHOD="facebook.com";ss.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class os extends ec{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return fo._fromParams({providerId:os.PROVIDER_ID,signInMethod:os.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return os.credentialFromTaggedObject(e)}static credentialFromError(e){return os.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return os.credential(t,r)}catch{return null}}}os.GOOGLE_SIGN_IN_METHOD="google.com";os.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as extends ec{constructor(){super("github.com")}static credential(e){return fo._fromParams({providerId:as.PROVIDER_ID,signInMethod:as.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return as.credentialFromTaggedObject(e)}static credentialFromError(e){return as.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return as.credential(e.oauthAccessToken)}catch{return null}}}as.GITHUB_SIGN_IN_METHOD="github.com";as.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ls extends ec{constructor(){super("twitter.com")}static credential(e,t){return fo._fromParams({providerId:ls.PROVIDER_ID,signInMethod:ls.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ls.credentialFromTaggedObject(e)}static credentialFromError(e){return ls.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ls.credential(t,r)}catch{return null}}}ls.TWITTER_SIGN_IN_METHOD="twitter.com";ls.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function v3(n,e){return Zu(n,"POST","/v1/accounts:signUp",Oi(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class po{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const a=await gr._fromIdTokenResponse(e,r,s),u=sw(r);return new po({user:a,providerId:u,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=sw(r);return new po({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function sw(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vd extends Ir{constructor(e,t,r,s){var a;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,vd.prototype),this.customData={appName:e.name,tenantId:(a=e.tenantId)!==null&&a!==void 0?a:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new vd(e,t,r,s)}}function FI(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(a=>{throw a.code==="auth/multi-factor-auth-required"?vd._fromErrorAndOperation(n,a,e,r):a})}async function w3(n,e,t=!1){const r=await ja(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return po._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function UI(n,e,t=!1){const{auth:r}=n;if(fn(r.app))return Promise.reject(Ei(r));const s="reauthenticate";try{const a=await ja(n,FI(r,s,e,n),t);Ee(a.idToken,r,"internal-error");const u=v_(a.idToken);Ee(u,r,"internal-error");const{sub:h}=u;return Ee(n.uid===h,r,"user-mismatch"),po._forOperation(n,s,a)}catch(a){throw(a==null?void 0:a.code)==="auth/user-not-found"&&wr(r,"user-mismatch"),a}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jI(n,e,t=!1){if(fn(n.app))return Promise.reject(Ei(n));const r="signIn",s=await FI(n,r,e),a=await po._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(a.user),a}async function E3(n,e){return jI(Ps(n),e)}async function JM(n,e){return UI(Oe(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function BI(n){const e=Ps(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function ZM(n,e,t){const r=Ps(n);await yd(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",f3)}async function e5(n,e,t){if(fn(n.app))return Promise.reject(Ei(n));const r=Ps(n),u=await yd(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",v3).catch(f=>{throw f.code==="auth/password-does-not-meet-requirements"&&BI(n),f}),h=await po._fromIdTokenResponse(r,"signIn",u);return await r._updateCurrentUser(h.user),h}function T3(n,e,t){return fn(n.app)?Promise.reject(Ei(n)):E3(Oe(n),nl.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&BI(n),r})}function t5(n,e){return I3(Oe(n),null,e)}async function I3(n,e,t){const{auth:r}=n,a={idToken:await n.getIdToken(),returnSecureToken:!0};t&&(a.password=t);const u=await ja(n,u3(r,a));await n._updateTokensIfNecessary(u,!0)}function S3(n,e,t,r){return Oe(n).onIdTokenChanged(e,t,r)}function C3(n,e,t){return Oe(n).beforeAuthStateChanged(e,t)}function R3(n,e,t,r){return Oe(n).onAuthStateChanged(e,t,r)}function zI(n){return Oe(n).signOut()}const wd="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WI{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(wd,"1"),this.storage.removeItem(wd),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k3=1e3,A3=10;class $I extends WI{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=OI(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((u,h,f)=>{this.notifyListeners(u,f)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const u=this.storage.getItem(r);!t&&this.localCache[r]===u||this.notifyListeners(r,u)},a=this.storage.getItem(r);$x()&&a!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,A3):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},k3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}$I.type="LOCAL";const P3=$I;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HI extends WI{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}HI.type="SESSION";const qI=HI;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function N3(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cf{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new cf(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:a}=t.data,u=this.handlersMap[s];if(!(u!=null&&u.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const h=Array.from(u).map(async p=>p(t.origin,a)),f=await N3(h);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:f})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}cf.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function I_(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x3{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let a,u;return new Promise((h,f)=>{const p=I_("",20);s.port1.start();const y=setTimeout(()=>{f(new Error("unsupported_event"))},r);u={messageChannel:s,onMessage(w){const T=w;if(T.data.eventId===p)switch(T.data.status){case"ack":clearTimeout(y),a=setTimeout(()=>{f(new Error("timeout"))},3e3);break;case"done":clearTimeout(a),h(T.data.response);break;default:clearTimeout(y),clearTimeout(a),f(new Error("invalid_response"));break}}},this.handlers.add(u),s.port1.addEventListener("message",u.onMessage),this.target.postMessage({eventType:e,eventId:p,data:t},[s.port2])}).finally(()=>{u&&this.removeMessageHandler(u)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Br(){return window}function O3(n){Br().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GI(){return typeof Br().WorkerGlobalScope<"u"&&typeof Br().importScripts=="function"}async function D3(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function b3(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function L3(){return GI()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KI="firebaseLocalStorageDb",M3=1,Ed="firebaseLocalStorage",QI="fbase_key";class tc{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function hf(n,e){return n.transaction([Ed],e?"readwrite":"readonly").objectStore(Ed)}function V3(){const n=indexedDB.deleteDatabase(KI);return new tc(n).toPromise()}function Xm(){const n=indexedDB.open(KI,M3);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ed,{keyPath:QI})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ed)?e(r):(r.close(),await V3(),e(await Xm()))})})}async function ow(n,e,t){const r=hf(n,!0).put({[QI]:e,value:t});return new tc(r).toPromise()}async function F3(n,e){const t=hf(n,!1).get(e),r=await new tc(t).toPromise();return r===void 0?null:r.value}function aw(n,e){const t=hf(n,!0).delete(e);return new tc(t).toPromise()}const U3=800,j3=3;class YI{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Xm(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>j3)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return GI()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=cf._getInstance(L3()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await D3(),!this.activeServiceWorker)return;this.sender=new x3(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||b3()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Xm();return await ow(e,wd,"1"),await aw(e,wd),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>ow(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>F3(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>aw(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const a=hf(s,!1).getAll();return new tc(a).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:a}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(a)&&(this.notifyListeners(s,a),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),U3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}YI.type="LOCAL";const B3=YI;new Ju(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z3(n,e){return e?mi(e):(Ee(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S_ extends E_{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Aa(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Aa(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Aa(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function W3(n){return jI(n.auth,new S_(n),n.bypassAuthState)}function $3(n){const{auth:e,user:t}=n;return Ee(t,e,"internal-error"),UI(t,new S_(n),n.bypassAuthState)}async function H3(n){const{auth:e,user:t}=n;return Ee(t,e,"internal-error"),w3(t,new S_(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XI{constructor(e,t,r,s,a=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=a,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:a,error:u,type:h}=e;if(u){this.reject(u);return}const f={auth:this.auth,requestUri:t,sessionId:r,tenantId:a||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(h)(f))}catch(p){this.reject(p)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return W3;case"linkViaPopup":case"linkViaRedirect":return H3;case"reauthViaPopup":case"reauthViaRedirect":return $3;default:wr(this.auth,"internal-error")}}resolve(e){Pi(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Pi(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q3=new Ju(2e3,1e4);class Ta extends XI{constructor(e,t,r,s,a){super(e,t,s,a),this.provider=r,this.authWindow=null,this.pollId=null,Ta.currentPopupAction&&Ta.currentPopupAction.cancel(),Ta.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return Ee(e,this.auth,"internal-error"),e}async onExecution(){Pi(this.filter.length===1,"Popup operations only handle one event");const e=I_();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(jr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(jr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ta.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(jr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,q3.get())};e()}}Ta.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G3="pendingRedirect",Gh=new Map;class K3 extends XI{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Gh.get(this.auth._key());if(!e){try{const r=await Q3(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Gh.set(this.auth._key(),e)}return this.bypassAuthState||Gh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Q3(n,e){const t=J3(e),r=X3(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function Y3(n,e){Gh.set(n._key(),e)}function X3(n){return mi(n._redirectPersistence)}function J3(n){return qh(G3,n.config.apiKey,n.name)}async function Z3(n,e,t=!1){if(fn(n.app))return Promise.reject(Ei(n));const r=Ps(n),s=z3(r,e),u=await new K3(r,s,t).execute();return u&&!t&&(delete u.user._redirectEventId,await r._persistUserIfCurrent(u.user),await r._setRedirectUser(null,e)),u}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eO=10*60*1e3;class tO{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!nO(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!JI(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(jr(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=eO&&this.cachedEventUids.clear(),this.cachedEventUids.has(lw(e))}saveEventToCache(e){this.cachedEventUids.add(lw(e)),this.lastProcessedEventTime=Date.now()}}function lw(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function JI({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function nO(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return JI(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rO(n,e={}){return Kr(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iO=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,sO=/^https?/;async function oO(n){if(n.config.emulator)return;const{authorizedDomains:e}=await rO(n);for(const t of e)try{if(aO(t))return}catch{}wr(n,"unauthorized-domain")}function aO(n){const e=Qm(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const u=new URL(n);return u.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&u.hostname===r}if(!sO.test(t))return!1;if(iO.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lO=new Ju(3e4,6e4);function uw(){const n=Br().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function uO(n){return new Promise((e,t)=>{var r,s,a;function u(){uw(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{uw(),t(jr(n,"network-request-failed"))},timeout:lO.get()})}if(!((s=(r=Br().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((a=Br().gapi)===null||a===void 0)&&a.load)u();else{const h=Zx("iframefcb");return Br()[h]=()=>{gapi.load?u():t(jr(n,"network-request-failed"))},bI(`${Jx()}?onload=${h}`).catch(f=>t(f))}}).catch(e=>{throw Kh=null,e})}let Kh=null;function cO(n){return Kh=Kh||uO(n),Kh}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hO=new Ju(5e3,15e3),dO="__/auth/iframe",fO="emulator/auth/iframe",pO={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},mO=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function gO(n){const e=n.config;Ee(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?y_(e,fO):`https://${n.config.authDomain}/${dO}`,r={apiKey:e.apiKey,appName:n.name,v:Rs},s=mO.get(n.config.apiHost);s&&(r.eid=s);const a=n._getFrameworks();return a.length&&(r.fw=a.join(",")),`${t}?${Ya(r).slice(1)}`}async function _O(n){const e=await cO(n),t=Br().gapi;return Ee(t,n,"internal-error"),e.open({where:document.body,url:gO(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:pO,dontclear:!0},r=>new Promise(async(s,a)=>{await r.restyle({setHideOnLeave:!1});const u=jr(n,"network-request-failed"),h=Br().setTimeout(()=>{a(u)},hO.get());function f(){Br().clearTimeout(h),s(r)}r.ping(f).then(f,()=>{a(u)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yO={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},vO=500,wO=600,EO="_blank",TO="http://localhost";class cw{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function IO(n,e,t,r=vO,s=wO){const a=Math.max((window.screen.availHeight-s)/2,0).toString(),u=Math.max((window.screen.availWidth-r)/2,0).toString();let h="";const f=Object.assign(Object.assign({},yO),{width:r.toString(),height:s.toString(),top:a,left:u}),p=an().toLowerCase();t&&(h=kI(p)?EO:t),CI(p)&&(e=e||TO,f.scrollbars="yes");const y=Object.entries(f).reduce((T,[C,A])=>`${T}${C}=${A},`,"");if(Wx(p)&&h!=="_self")return SO(e||"",h),new cw(null);const w=window.open(e||"",h,y);Ee(w,n,"popup-blocked");try{w.focus()}catch{}return new cw(w)}function SO(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CO="__/auth/handler",RO="emulator/auth/handler",kO=encodeURIComponent("fac");async function hw(n,e,t,r,s,a){Ee(n.config.authDomain,n,"auth-domain-config-required"),Ee(n.config.apiKey,n,"invalid-api-key");const u={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Rs,eventId:s};if(e instanceof VI){e.setDefaultLanguage(n.languageCode),u.providerId=e.providerId||"",Cm(e.getCustomParameters())||(u.customParameters=JSON.stringify(e.getCustomParameters()));for(const[y,w]of Object.entries({}))u[y]=w}if(e instanceof ec){const y=e.getScopes().filter(w=>w!=="");y.length>0&&(u.scopes=y.join(","))}n.tenantId&&(u.tid=n.tenantId);const h=u;for(const y of Object.keys(h))h[y]===void 0&&delete h[y];const f=await n._getAppCheckToken(),p=f?`#${kO}=${encodeURIComponent(f)}`:"";return`${AO(n)}?${Ya(h).slice(1)}${p}`}function AO({config:n}){return n.emulator?y_(n,RO):`https://${n.authDomain}/${CO}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fm="webStorageSupport";class PO{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=qI,this._completeRedirectFn=Z3,this._overrideRedirectResult=Y3}async _openPopup(e,t,r,s){var a;Pi((a=this.eventManagers[e._key()])===null||a===void 0?void 0:a.manager,"_initialize() not called before _openPopup()");const u=await hw(e,t,r,Qm(),s);return IO(e,u,I_())}async _openRedirect(e,t,r,s){await this._originValidation(e);const a=await hw(e,t,r,Qm(),s);return O3(a),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:a}=this.eventManagers[t];return s?Promise.resolve(s):(Pi(a,"If manager is not set, promise should be"),a)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await _O(e),r=new tO(e);return t.register("authEvent",s=>(Ee(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(fm,{type:fm},s=>{var a;const u=(a=s==null?void 0:s[0])===null||a===void 0?void 0:a[fm];u!==void 0&&t(!!u),wr(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=oO(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return OI()||RI()||w_()}}const NO=PO;var dw="@firebase/auth",fw="1.10.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xO{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){Ee(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OO(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function DO(n){Ci(new zr("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),a=e.getProvider("app-check-internal"),{apiKey:u,authDomain:h}=r.options;Ee(u&&!u.includes(":"),"invalid-api-key",{appName:r.name});const f={apiKey:u,authDomain:h,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:DI(n)},p=new Qx(r,s,a,f);return s3(p,t),p},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Ci(new zr("auth-internal",e=>{const t=Ps(e.getProvider("auth").getImmediate());return(r=>new xO(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Nn(dw,fw,OO(n)),Nn(dw,fw,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bO=5*60,LO=xE("authIdTokenMaxAge")||bO;let pw=null;const MO=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>LO)return;const s=t==null?void 0:t.token;pw!==s&&(pw=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function VO(n=Hu()){const e=Xa(n,"auth");if(e.isInitialized())return e.getImmediate();const t=i3(n,{popupRedirectResolver:NO,persistence:[B3,P3,qI]}),r=xE("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const a=new URL(r,location.origin);if(location.origin===a.origin){const u=MO(a.toString());C3(t,u,()=>u(t.currentUser)),S3(t,h=>u(h))}}const s=PE("auth");return s&&o3(t,`http://${s}`),t}function FO(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Yx({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const a=jr("internal-error");a.customData=s,t(a)},r.type="text/javascript",r.charset="UTF-8",FO().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});DO("Browser");var mw={};const gw="@firebase/database",_w="1.0.14";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ZI="";function UO(n){ZI=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jO{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Kt(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Cu(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BO{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return qr(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e2=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new jO(e)}}catch{}return new BO},ao=e2("localStorage"),zO=e2("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pa=new Fd("@firebase/database"),WO=function(){let n=1;return function(){return n++}}(),t2=function(n){const e=Zk(n),t=new Qk;t.update(e);const r=t.digest();return Cg.encodeByteArray(r)},nc=function(...n){let e="";for(let t=0;t<n.length;t++){const r=n[t];Array.isArray(r)||r&&typeof r=="object"&&typeof r.length=="number"?e+=nc.apply(null,r):typeof r=="object"?e+=Kt(r):e+=r,e+=" "}return e};let vu=null,yw=!0;const $O=function(n,e){oe(!0,"Can't turn on custom loggers persistently."),Pa.logLevel=xe.VERBOSE,vu=Pa.log.bind(Pa)},Gt=function(...n){if(yw===!0&&(yw=!1,vu===null&&zO.get("logging_enabled")===!0&&$O()),vu){const e=nc.apply(null,n);vu(e)}},rc=function(n){return function(...e){Gt(n,...e)}},Jm=function(...n){const e="FIREBASE INTERNAL ERROR: "+nc(...n);Pa.error(e)},Ni=function(...n){const e=`FIREBASE FATAL ERROR: ${nc(...n)}`;throw Pa.error(e),new Error(e)},mn=function(...n){const e="FIREBASE WARNING: "+nc(...n);Pa.warn(e)},HO=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&mn("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},C_=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},qO=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Ba="[MIN_NAME]",mo="[MAX_NAME]",To=function(n,e){if(n===e)return 0;if(n===Ba||e===mo)return-1;if(e===Ba||n===mo)return 1;{const t=vw(n),r=vw(e);return t!==null?r!==null?t-r===0?n.length-e.length:t-r:-1:r!==null?1:n<e?-1:1}},GO=function(n,e){return n===e?0:n<e?-1:1},ru=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Kt(e))},R_=function(n){if(typeof n!="object"||n===null)return Kt(n);const e=[];for(const r in n)e.push(r);e.sort();let t="{";for(let r=0;r<e.length;r++)r!==0&&(t+=","),t+=Kt(e[r]),t+=":",t+=R_(n[e[r]]);return t+="}",t},n2=function(n,e){const t=n.length;if(t<=e)return[n];const r=[];for(let s=0;s<t;s+=e)s+e>t?r.push(n.substring(s,t)):r.push(n.substring(s,s+e));return r};function gn(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const r2=function(n){oe(!C_(n),"Invalid JSON number");const e=11,t=52,r=(1<<e-1)-1;let s,a,u,h,f;n===0?(a=0,u=0,s=1/n===-1/0?1:0):(s=n<0,n=Math.abs(n),n>=Math.pow(2,1-r)?(h=Math.min(Math.floor(Math.log(n)/Math.LN2),r),a=h+r,u=Math.round(n*Math.pow(2,t-h)-Math.pow(2,t))):(a=0,u=Math.round(n/Math.pow(2,1-r-t))));const p=[];for(f=t;f;f-=1)p.push(u%2?1:0),u=Math.floor(u/2);for(f=e;f;f-=1)p.push(a%2?1:0),a=Math.floor(a/2);p.push(s?1:0),p.reverse();const y=p.join("");let w="";for(f=0;f<64;f+=8){let T=parseInt(y.substr(f,8),2).toString(16);T.length===1&&(T="0"+T),w=w+T}return w.toLowerCase()},KO=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},QO=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"},YO=new RegExp("^-?(0*)\\d{1,10}$"),XO=-2147483648,JO=2147483647,vw=function(n){if(YO.test(n)){const e=Number(n);if(e>=XO&&e<=JO)return e}return null},rl=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw mn("Exception was thrown by user callback.",t),e},Math.floor(0))}},ZO=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},wu=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eD{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,fn(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(r=>this.appCheck=r)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,r)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,r):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(r=>r.addTokenListener(e))}notifyForInvalidToken(){mn(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tD{constructor(e,t,r){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=r,this.auth_=null,this.auth_=r.getImmediate({optional:!0}),this.auth_||r.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(Gt("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,r)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,r):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',mn(e)}}class Qh{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Qh.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const k_="5",i2="v",s2="s",o2="r",a2="f",l2=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,u2="ls",c2="p",Zm="ac",h2="websocket",d2="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f2{constructor(e,t,r,s,a=!1,u="",h=!1,f=!1,p=null){this.secure=t,this.namespace=r,this.webSocketOnly=s,this.nodeAdmin=a,this.persistenceKey=u,this.includeNamespaceInQueryParams=h,this.isUsingEmulator=f,this.emulatorOptions=p,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=ao.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&ao.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function nD(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function p2(n,e,t){oe(typeof e=="string","typeof type must == string"),oe(typeof t=="object","typeof params must == object");let r;if(e===h2)r=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===d2)r=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);nD(n)&&(t.ns=n.namespace);const s=[];return gn(t,(a,u)=>{s.push(a+"="+u)}),r+s.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rD{constructor(){this.counters_={}}incrementCounter(e,t=1){qr(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return Nk(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pm={},mm={};function A_(n){const e=n.toString();return pm[e]||(pm[e]=new rD),pm[e]}function iD(n,e){const t=n.toString();return mm[t]||(mm[t]=e()),mm[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sD{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const r=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<r.length;++s)r[s]&&rl(()=>{this.onMessage_(r[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ww="start",oD="close",aD="pLPCommand",lD="pRTLPCB",m2="id",g2="pw",_2="ser",uD="cb",cD="seg",hD="ts",dD="d",fD="dframe",y2=1870,v2=30,pD=y2-v2,mD=25e3,gD=3e4;class Ia{constructor(e,t,r,s,a,u,h){this.connId=e,this.repoInfo=t,this.applicationId=r,this.appCheckToken=s,this.authToken=a,this.transportSessionId=u,this.lastSessionId=h,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=rc(e),this.stats_=A_(t),this.urlFn=f=>(this.appCheckToken&&(f[Zm]=this.appCheckToken),p2(t,d2,f))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new sD(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(gD)),qO(()=>{if(this.isClosed_)return;this.scriptTagHolder=new P_((...a)=>{const[u,h,f,p,y]=a;if(this.incrementIncomingBytes_(a),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,u===ww)this.id=h,this.password=f;else if(u===oD)h?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(h,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+u)},(...a)=>{const[u,h]=a;this.incrementIncomingBytes_(a),this.myPacketOrderer.handleResponse(u,h)},()=>{this.onClosed_()},this.urlFn);const r={};r[ww]="t",r[_2]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(r[uD]=this.scriptTagHolder.uniqueCallbackIdentifier),r[i2]=k_,this.transportSessionId&&(r[s2]=this.transportSessionId),this.lastSessionId&&(r[u2]=this.lastSessionId),this.applicationId&&(r[c2]=this.applicationId),this.appCheckToken&&(r[Zm]=this.appCheckToken),typeof location<"u"&&location.hostname&&l2.test(location.hostname)&&(r[o2]=a2);const s=this.urlFn(r);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Ia.forceAllow_=!0}static forceDisallow(){Ia.forceDisallow_=!0}static isAvailable(){return Ia.forceAllow_?!0:!Ia.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!KO()&&!QO()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Kt(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const r=kE(t),s=n2(r,pD);for(let a=0;a<s.length;a++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[a]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const r={};r[fD]="t",r[m2]=e,r[g2]=t,this.myDisconnFrame.src=this.urlFn(r),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Kt(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class P_{constructor(e,t,r,s){this.onDisconnect=r,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=WO(),window[aD+this.uniqueCallbackIdentifier]=e,window[lD+this.uniqueCallbackIdentifier]=t,this.myIFrame=P_.createIFrame_();let a="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(a='<script>document.domain="'+document.domain+'";<\/script>');const u="<html><body>"+a+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(u),this.myIFrame.doc.close()}catch(h){Gt("frame writing exception"),h.stack&&Gt(h.stack),Gt(h)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||Gt("No IE domain setting required")}catch{const r=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+r+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[m2]=this.myID,e[g2]=this.myPW,e[_2]=this.currentSerial;let t=this.urlFn(e),r="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+v2+r.length<=y2;){const u=this.pendingSegs.shift();r=r+"&"+cD+s+"="+u.seg+"&"+hD+s+"="+u.ts+"&"+dD+s+"="+u.d,s++}return t=t+r,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,r){this.pendingSegs.push({seg:e,ts:t,d:r}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const r=()=>{this.outstandingRequests.delete(t),this.newRequest_()},s=setTimeout(r,Math.floor(mD)),a=()=>{clearTimeout(s),r()};this.addTag(e,a)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const r=this.myIFrame.doc.createElement("script");r.type="text/javascript",r.async=!0,r.src=e,r.onload=r.onreadystatechange=function(){const s=r.readyState;(!s||s==="loaded"||s==="complete")&&(r.onload=r.onreadystatechange=null,r.parentNode&&r.parentNode.removeChild(r),t())},r.onerror=()=>{Gt("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(r)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _D=16384,yD=45e3;let Td=null;typeof MozWebSocket<"u"?Td=MozWebSocket:typeof WebSocket<"u"&&(Td=WebSocket);class mr{constructor(e,t,r,s,a,u,h){this.connId=e,this.applicationId=r,this.appCheckToken=s,this.authToken=a,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=rc(this.connId),this.stats_=A_(t),this.connURL=mr.connectionURL_(t,u,h,s,r),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,r,s,a){const u={};return u[i2]=k_,typeof location<"u"&&location.hostname&&l2.test(location.hostname)&&(u[o2]=a2),t&&(u[s2]=t),r&&(u[u2]=r),s&&(u[Zm]=s),a&&(u[c2]=a),p2(e,h2,u)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,ao.set("previous_websocket_failure",!0);try{let r;jk(),this.mySock=new Td(this.connURL,[],r)}catch(r){this.log_("Error instantiating WebSocket.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=r=>{this.handleIncomingFrame(r)},this.mySock.onerror=r=>{this.log_("WebSocket error.  Closing connection.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){mr.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,r=navigator.userAgent.match(t);r&&r.length>1&&parseFloat(r[1])<4.4&&(e=!0)}return!e&&Td!==null&&!mr.forceDisallow_}static previouslyFailed(){return ao.isInMemoryStorage||ao.get("previous_websocket_failure")===!0}markConnectionHealthy(){ao.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const r=Cu(t);this.onMessage(r)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(oe(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const r=this.extractFrameCount_(t);r!==null&&this.appendFrame_(r)}}send(e){this.resetKeepAlive();const t=Kt(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const r=n2(t,_D);r.length>1&&this.sendString_(String(r.length));for(let s=0;s<r.length;s++)this.sendString_(r[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(yD))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}mr.responsesRequiredToBeHealthy=2;mr.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mu{static get ALL_TRANSPORTS(){return[Ia,mr]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=mr&&mr.isAvailable();let r=t&&!mr.previouslyFailed();if(e.webSocketOnly&&(t||mn("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),r=!0),r)this.transports_=[mr];else{const s=this.transports_=[];for(const a of Mu.ALL_TRANSPORTS)a&&a.isAvailable()&&s.push(a);Mu.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Mu.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vD=6e4,wD=5e3,ED=10*1024,TD=100*1024,gm="t",Ew="d",ID="s",Tw="r",SD="e",Iw="o",Sw="a",Cw="n",Rw="p",CD="h";class RD{constructor(e,t,r,s,a,u,h,f,p,y){this.id=e,this.repoInfo_=t,this.applicationId_=r,this.appCheckToken_=s,this.authToken_=a,this.onMessage_=u,this.onReady_=h,this.onDisconnect_=f,this.onKill_=p,this.lastSessionId=y,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=rc("c:"+this.id+":"),this.transportManager_=new Mu(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),r=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,r)},Math.floor(0));const s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=wu(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>TD?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>ED?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(gm in e){const t=e[gm];t===Sw?this.upgradeIfSecondaryHealthy_():t===Tw?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Iw&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=ru("t",e),r=ru("d",e);if(t==="c")this.onSecondaryControl_(r);else if(t==="d")this.pendingDataMessages.push(r);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Rw,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Sw,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Cw,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=ru("t",e),r=ru("d",e);t==="c"?this.onControl_(r):t==="d"&&this.onDataMessage_(r)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=ru(gm,e);if(Ew in e){const r=e[Ew];if(t===CD){const s=Object.assign({},r);this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(t===Cw){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===ID?this.onConnectionShutdown_(r):t===Tw?this.onReset_(r):t===SD?Jm("Server Error: "+r):t===Iw?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Jm("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,r=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),k_!==r&&mn("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),r=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,r),wu(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(vD))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):wu(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(wD))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Rw,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(ao.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w2{put(e,t,r,s){}merge(e,t,r,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,r){}onDisconnectMerge(e,t,r){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E2{constructor(e){this.allowedEvents_=e,this.listeners_={},oe(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const r=[...this.listeners_[e]];for(let s=0;s<r.length;s++)r[s].callback.apply(r[s].context,t)}}on(e,t,r){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:r});const s=this.getInitialEvent(e);s&&t.apply(r,s)}off(e,t,r){this.validateEventType_(e);const s=this.listeners_[e]||[];for(let a=0;a<s.length;a++)if(s[a].callback===t&&(!r||r===s[a].context)){s.splice(a,1);return}}validateEventType_(e){oe(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Id extends E2{static getInstance(){return new Id}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!kg()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return oe(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kw=32,Aw=768;class it{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let r=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[r]=this.pieces_[s],r++);this.pieces_.length=r,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function Ye(){return new it("")}function De(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Cs(n){return n.pieces_.length-n.pieceNum_}function at(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new it(n.pieces_,e)}function N_(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function kD(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Vu(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function T2(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new it(e,0)}function pt(n,e){const t=[];for(let r=n.pieceNum_;r<n.pieces_.length;r++)t.push(n.pieces_[r]);if(e instanceof it)for(let r=e.pieceNum_;r<e.pieces_.length;r++)t.push(e.pieces_[r]);else{const r=e.split("/");for(let s=0;s<r.length;s++)r[s].length>0&&t.push(r[s])}return new it(t,0)}function Me(n){return n.pieceNum_>=n.pieces_.length}function Xn(n,e){const t=De(n),r=De(e);if(t===null)return e;if(t===r)return Xn(at(n),at(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function AD(n,e){const t=Vu(n,0),r=Vu(e,0);for(let s=0;s<t.length&&s<r.length;s++){const a=To(t[s],r[s]);if(a!==0)return a}return t.length===r.length?0:t.length<r.length?-1:1}function I2(n,e){if(Cs(n)!==Cs(e))return!1;for(let t=n.pieceNum_,r=e.pieceNum_;t<=n.pieces_.length;t++,r++)if(n.pieces_[t]!==e.pieces_[r])return!1;return!0}function Jn(n,e){let t=n.pieceNum_,r=e.pieceNum_;if(Cs(n)>Cs(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[r])return!1;++t,++r}return!0}class PD{constructor(e,t){this.errorPrefix_=t,this.parts_=Vu(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let r=0;r<this.parts_.length;r++)this.byteLength_+=Vd(this.parts_[r]);S2(this)}}function ND(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=Vd(e),S2(n)}function xD(n){const e=n.parts_.pop();n.byteLength_-=Vd(e),n.parts_.length>0&&(n.byteLength_-=1)}function S2(n){if(n.byteLength_>Aw)throw new Error(n.errorPrefix_+"has a key path longer than "+Aw+" bytes ("+n.byteLength_+").");if(n.parts_.length>kw)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+kw+") or object contains a cycle "+so(n))}function so(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x_ extends E2{static getInstance(){return new x_}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const r=!document[e];r!==this.visible_&&(this.visible_=r,this.trigger("visible",r))},!1)}getInitialEvent(e){return oe(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iu=1e3,OD=60*5*1e3,Pw=30*1e3,DD=1.3,bD=3e4,LD="server_kill",Nw=3;class Ti extends w2{constructor(e,t,r,s,a,u,h,f){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=r,this.onConnectStatus_=s,this.onServerInfoUpdate_=a,this.authTokenProvider_=u,this.appCheckTokenProvider_=h,this.authOverride_=f,this.id=Ti.nextPersistentConnectionId_++,this.log_=rc("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=iu,this.maxReconnectDelay_=OD,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,f)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");x_.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Id.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,r){const s=++this.requestNumber_,a={r:s,a:e,b:t};this.log_(Kt(a)),oe(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(a),r&&(this.requestCBHash_[s]=r)}get(e){this.initConnection_();const t=new Wu,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:u=>{const h=u.d;u.s==="ok"?t.resolve(h):t.reject(h)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;const a=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(a),t.promise}listen(e,t,r,s){this.initConnection_();const a=e._queryIdentifier,u=e._path.toString();this.log_("Listen called for "+u+" "+a),this.listens.has(u)||this.listens.set(u,new Map),oe(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),oe(!this.listens.get(u).has(a),"listen() called twice for same path/queryId.");const h={onComplete:s,hashFn:t,query:e,tag:r};this.listens.get(u).set(a,h),this.connected_&&this.sendListen_(h)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,r=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(r)})}sendListen_(e){const t=e.query,r=t._path.toString(),s=t._queryIdentifier;this.log_("Listen on "+r+" for "+s);const a={p:r},u="q";e.tag&&(a.q=t._queryObject,a.t=e.tag),a.h=e.hashFn(),this.sendRequest(u,a,h=>{const f=h.d,p=h.s;Ti.warnOnListenWarnings_(f,t),(this.listens.get(r)&&this.listens.get(r).get(s))===e&&(this.log_("listen response",h),p!=="ok"&&this.removeListen_(r,s),e.onComplete&&e.onComplete(p,f))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&qr(e,"w")){const r=xa(e,"w");if(Array.isArray(r)&&~r.indexOf("no_index")){const s='".indexOn": "'+t._queryParams.getIndex().toString()+'"',a=t._path.toString();mn(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${a} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Kk(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Pw)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Gk(e)?"auth":"gauth",r={cred:e};this.authOverride_===null?r.noauth=!0:typeof this.authOverride_=="object"&&(r.authvar=this.authOverride_),this.sendRequest(t,r,s=>{const a=s.s,u=s.d||"error";this.authToken_===e&&(a==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(a,u))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,r=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,r)})}unlisten(e,t){const r=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+r+" "+s),oe(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(r,s)&&this.connected_&&this.sendUnlisten_(r,s,e._queryObject,t)}sendUnlisten_(e,t,r,s){this.log_("Unlisten on "+e+" for "+t);const a={p:e},u="n";s&&(a.q=r,a.t=s),this.sendRequest(u,a)}onDisconnectPut(e,t,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:r})}onDisconnectMerge(e,t,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:r})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,r,s){const a={p:t,d:r};this.log_("onDisconnect "+e,a),this.sendRequest(e,a,u=>{s&&setTimeout(()=>{s(u.s,u.d)},Math.floor(0))})}put(e,t,r,s){this.putInternal("p",e,t,r,s)}merge(e,t,r,s){this.putInternal("m",e,t,r,s)}putInternal(e,t,r,s,a){this.initConnection_();const u={p:t,d:r};a!==void 0&&(u.h=a),this.outstandingPuts_.push({action:e,request:u,onComplete:s}),this.outstandingPutCount_++;const h=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(h):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,r=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,r,a=>{this.log_(t+" response",a),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(a.s,a.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,r=>{if(r.s!=="ok"){const a=r.d;this.log_("reportStats","Error sending stats: "+a)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Kt(e));const t=e.r,r=this.requestCBHash_[t];r&&(delete this.requestCBHash_[t],r(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Jm("Unrecognized action received from server: "+Kt(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){oe(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=iu,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=iu,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>bD&&(this.reconnectDelay_=iu),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*DD)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),r=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+Ti.nextConnectionId_++,a=this.lastSessionId;let u=!1,h=null;const f=function(){h?h.close():(u=!0,r())},p=function(w){oe(h,"sendRequest call when we're not connected not allowed."),h.sendRequest(w)};this.realtime_={close:f,sendRequest:p};const y=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[w,T]=await Promise.all([this.authTokenProvider_.getToken(y),this.appCheckTokenProvider_.getToken(y)]);u?Gt("getToken() completed but was canceled"):(Gt("getToken() completed. Creating connection."),this.authToken_=w&&w.accessToken,this.appCheckToken_=T&&T.token,h=new RD(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,r,C=>{mn(C+" ("+this.repoInfo_.toString()+")"),this.interrupt(LD)},a))}catch(w){this.log_("Failed to get token: "+w),u||(this.repoInfo_.nodeAdmin&&mn(w),f())}}}interrupt(e){Gt("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Gt("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Cm(this.interruptReasons_)&&(this.reconnectDelay_=iu,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let r;t?r=t.map(a=>R_(a)).join("$"):r="default";const s=this.removeListen_(e,r);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,t){const r=new it(e).toString();let s;if(this.listens.has(r)){const a=this.listens.get(r);s=a.get(t),a.delete(t),a.size===0&&this.listens.delete(r)}else s=void 0;return s}onAuthRevoked_(e,t){Gt("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Nw&&(this.reconnectDelay_=Pw,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Gt("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Nw&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+ZI.replace(/\./g,"-")]=1,kg()?e["framework.cordova"]=1:OE()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Id.getInstance().currentlyOnline();return Cm(this.interruptReasons_)&&e}}Ti.nextPersistentConnectionId_=0;Ti.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class je{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new je(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class df{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const r=new je(Ba,e),s=new je(Ba,t);return this.compare(r,s)!==0}minPost(){return je.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Dh;class C2 extends df{static get __EMPTY_NODE(){return Dh}static set __EMPTY_NODE(e){Dh=e}compare(e,t){return To(e.name,t.name)}isDefinedOn(e){throw Qa("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return je.MIN}maxPost(){return new je(mo,Dh)}makePost(e,t){return oe(typeof e=="string","KeyIndex indexValue must always be a string."),new je(e,Dh)}toString(){return".key"}}const Na=new C2;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bh{constructor(e,t,r,s,a=null){this.isReverse_=s,this.resultGenerator_=a,this.nodeStack_=[];let u=1;for(;!e.isEmpty();)if(e=e,u=t?r(e.key,t):1,s&&(u*=-1),u<0)this.isReverse_?e=e.left:e=e.right;else if(u===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class Bt{constructor(e,t,r,s,a){this.key=e,this.value=t,this.color=r??Bt.RED,this.left=s??An.EMPTY_NODE,this.right=a??An.EMPTY_NODE}copy(e,t,r,s,a){return new Bt(e??this.key,t??this.value,r??this.color,s??this.left,a??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const a=r(e,s.key);return a<0?s=s.copy(null,null,null,s.left.insert(e,t,r),null):a===0?s=s.copy(null,t,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return An.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let r,s;if(r=this,t(e,r.key)<0)!r.left.isEmpty()&&!r.left.isRed_()&&!r.left.left.isRed_()&&(r=r.moveRedLeft_()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed_()&&(r=r.rotateRight_()),!r.right.isEmpty()&&!r.right.isRed_()&&!r.right.left.isRed_()&&(r=r.moveRedRight_()),t(e,r.key)===0){if(r.right.isEmpty())return An.EMPTY_NODE;s=r.right.min_(),r=r.copy(s.key,s.value,null,null,r.right.removeMin_())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,Bt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,Bt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}Bt.RED=!0;Bt.BLACK=!1;class MD{copy(e,t,r,s,a){return this}insert(e,t,r){return new Bt(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class An{constructor(e,t=An.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new An(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,Bt.BLACK,null,null))}remove(e){return new An(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,Bt.BLACK,null,null))}get(e){let t,r=this.root_;for(;!r.isEmpty();){if(t=this.comparator_(e,r.key),t===0)return r.value;t<0?r=r.left:t>0&&(r=r.right)}return null}getPredecessorKey(e){let t,r=this.root_,s=null;for(;!r.isEmpty();)if(t=this.comparator_(e,r.key),t===0){if(r.left.isEmpty())return s?s.key:null;for(r=r.left;!r.right.isEmpty();)r=r.right;return r.key}else t<0?r=r.left:t>0&&(s=r,r=r.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new bh(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new bh(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new bh(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new bh(this.root_,null,this.comparator_,!0,e)}}An.EMPTY_NODE=new MD;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VD(n,e){return To(n.name,e.name)}function O_(n,e){return To(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let eg;function FD(n){eg=n}const R2=function(n){return typeof n=="number"?"number:"+r2(n):"string:"+n},k2=function(n){if(n.isLeafNode()){const e=n.val();oe(typeof e=="string"||typeof e=="number"||typeof e=="object"&&qr(e,".sv"),"Priority must be a string or number.")}else oe(n===eg||n.isEmpty(),"priority of unexpected type.");oe(n===eg||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xw;class Ut{static set __childrenNodeConstructor(e){xw=e}static get __childrenNodeConstructor(){return xw}constructor(e,t=Ut.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,oe(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),k2(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new Ut(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:Ut.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return Me(e)?this:De(e)===".priority"?this.priorityNode_:Ut.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:Ut.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const r=De(e);return r===null?t:t.isEmpty()&&r!==".priority"?this:(oe(r!==".priority"||Cs(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(r,Ut.__childrenNodeConstructor.EMPTY_NODE.updateChild(at(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+R2(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=r2(this.value_):e+=this.value_,this.lazyHash_=t2(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===Ut.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof Ut.__childrenNodeConstructor?-1:(oe(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,r=typeof this.value_,s=Ut.VALUE_TYPE_ORDER.indexOf(t),a=Ut.VALUE_TYPE_ORDER.indexOf(r);return oe(s>=0,"Unknown leaf type: "+t),oe(a>=0,"Unknown leaf type: "+r),s===a?r==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:a-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}Ut.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let A2,P2;function UD(n){A2=n}function jD(n){P2=n}class BD extends df{compare(e,t){const r=e.node.getPriority(),s=t.node.getPriority(),a=r.compareTo(s);return a===0?To(e.name,t.name):a}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return je.MIN}maxPost(){return new je(mo,new Ut("[PRIORITY-POST]",P2))}makePost(e,t){const r=A2(e);return new je(t,new Ut("[PRIORITY-POST]",r))}toString(){return".priority"}}const sn=new BD;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zD=Math.log(2);class WD{constructor(e){const t=a=>parseInt(Math.log(a)/zD,10),r=a=>parseInt(Array(a+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const s=r(this.count);this.bits_=e+1&s}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Sd=function(n,e,t,r){n.sort(e);const s=function(f,p){const y=p-f;let w,T;if(y===0)return null;if(y===1)return w=n[f],T=t?t(w):w,new Bt(T,w.node,Bt.BLACK,null,null);{const C=parseInt(y/2,10)+f,A=s(f,C),M=s(C+1,p);return w=n[C],T=t?t(w):w,new Bt(T,w.node,Bt.BLACK,A,M)}},a=function(f){let p=null,y=null,w=n.length;const T=function(A,M){const D=w-A,H=w;w-=A;const Z=s(D+1,H),K=n[D],re=t?t(K):K;C(new Bt(re,K.node,M,null,Z))},C=function(A){p?(p.left=A,p=A):(y=A,p=A)};for(let A=0;A<f.count;++A){const M=f.nextBitIsOne(),D=Math.pow(2,f.count-(A+1));M?T(D,Bt.BLACK):(T(D,Bt.BLACK),T(D,Bt.RED))}return y},u=new WD(n.length),h=a(u);return new An(r||e,h)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let _m;const _a={};class gi{static get Default(){return oe(_a&&sn,"ChildrenNode.ts has not been loaded"),_m=_m||new gi({".priority":_a},{".priority":sn}),_m}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=xa(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof An?t:null}hasIndex(e){return qr(this.indexSet_,e.toString())}addIndex(e,t){oe(e!==Na,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const r=[];let s=!1;const a=t.getIterator(je.Wrap);let u=a.getNext();for(;u;)s=s||e.isDefinedOn(u.node),r.push(u),u=a.getNext();let h;s?h=Sd(r,e.getCompare()):h=_a;const f=e.toString(),p=Object.assign({},this.indexSet_);p[f]=e;const y=Object.assign({},this.indexes_);return y[f]=h,new gi(y,p)}addToIndexes(e,t){const r=td(this.indexes_,(s,a)=>{const u=xa(this.indexSet_,a);if(oe(u,"Missing index implementation for "+a),s===_a)if(u.isDefinedOn(e.node)){const h=[],f=t.getIterator(je.Wrap);let p=f.getNext();for(;p;)p.name!==e.name&&h.push(p),p=f.getNext();return h.push(e),Sd(h,u.getCompare())}else return _a;else{const h=t.get(e.name);let f=s;return h&&(f=f.remove(new je(e.name,h))),f.insert(e,e.node)}});return new gi(r,this.indexSet_)}removeFromIndexes(e,t){const r=td(this.indexes_,s=>{if(s===_a)return s;{const a=t.get(e.name);return a?s.remove(new je(e.name,a)):s}});return new gi(r,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let su;class Ge{static get EMPTY_NODE(){return su||(su=new Ge(new An(O_),null,gi.Default))}constructor(e,t,r){this.children_=e,this.priorityNode_=t,this.indexMap_=r,this.lazyHash_=null,this.priorityNode_&&k2(this.priorityNode_),this.children_.isEmpty()&&oe(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||su}updatePriority(e){return this.children_.isEmpty()?this:new Ge(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?su:t}}getChild(e){const t=De(e);return t===null?this:this.getImmediateChild(t).getChild(at(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(oe(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const r=new je(e,t);let s,a;t.isEmpty()?(s=this.children_.remove(e),a=this.indexMap_.removeFromIndexes(r,this.children_)):(s=this.children_.insert(e,t),a=this.indexMap_.addToIndexes(r,this.children_));const u=s.isEmpty()?su:this.priorityNode_;return new Ge(s,u,a)}}updateChild(e,t){const r=De(e);if(r===null)return t;{oe(De(e)!==".priority"||Cs(e)===1,".priority must be the last token in a path");const s=this.getImmediateChild(r).updateChild(at(e),t);return this.updateImmediateChild(r,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let r=0,s=0,a=!0;if(this.forEachChild(sn,(u,h)=>{t[u]=h.val(e),r++,a&&Ge.INTEGER_REGEXP_.test(u)?s=Math.max(s,Number(u)):a=!1}),!e&&a&&s<2*r){const u=[];for(const h in t)u[h]=t[h];return u}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+R2(this.getPriority().val())+":"),this.forEachChild(sn,(t,r)=>{const s=r.hash();s!==""&&(e+=":"+t+":"+s)}),this.lazyHash_=e===""?"":t2(e)}return this.lazyHash_}getPredecessorChildName(e,t,r){const s=this.resolveIndex_(r);if(s){const a=s.getPredecessorKey(new je(e,t));return a?a.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const r=t.minKey();return r&&r.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new je(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const r=t.maxKey();return r&&r.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new je(t,this.children_.get(t)):null}forEachChild(e,t){const r=this.resolveIndex_(e);return r?r.inorderTraversal(s=>t(s.name,s.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const r=this.resolveIndex_(t);if(r)return r.getIteratorFrom(e,s=>s);{const s=this.children_.getIteratorFrom(e.name,je.Wrap);let a=s.peek();for(;a!=null&&t.compare(a,e)<0;)s.getNext(),a=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const r=this.resolveIndex_(t);if(r)return r.getReverseIteratorFrom(e,s=>s);{const s=this.children_.getReverseIteratorFrom(e.name,je.Wrap);let a=s.peek();for(;a!=null&&t.compare(a,e)>0;)s.getNext(),a=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===ic?-1:0}withIndex(e){if(e===Na||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new Ge(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Na||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const r=this.getIterator(sn),s=t.getIterator(sn);let a=r.getNext(),u=s.getNext();for(;a&&u;){if(a.name!==u.name||!a.node.equals(u.node))return!1;a=r.getNext(),u=s.getNext()}return a===null&&u===null}else return!1;else return!1}}resolveIndex_(e){return e===Na?null:this.indexMap_.get(e.toString())}}Ge.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class $D extends Ge{constructor(){super(new An(O_),Ge.EMPTY_NODE,gi.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return Ge.EMPTY_NODE}isEmpty(){return!1}}const ic=new $D;Object.defineProperties(je,{MIN:{value:new je(Ba,Ge.EMPTY_NODE)},MAX:{value:new je(mo,ic)}});C2.__EMPTY_NODE=Ge.EMPTY_NODE;Ut.__childrenNodeConstructor=Ge;FD(ic);jD(ic);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HD=!0;function zt(n,e=null){if(n===null)return Ge.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),oe(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new Ut(t,zt(e))}if(!(n instanceof Array)&&HD){const t=[];let r=!1;if(gn(n,(u,h)=>{if(u.substring(0,1)!=="."){const f=zt(h);f.isEmpty()||(r=r||!f.getPriority().isEmpty(),t.push(new je(u,f)))}}),t.length===0)return Ge.EMPTY_NODE;const a=Sd(t,VD,u=>u.name,O_);if(r){const u=Sd(t,sn.getCompare());return new Ge(a,zt(e),new gi({".priority":u},{".priority":sn}))}else return new Ge(a,zt(e),gi.Default)}else{let t=Ge.EMPTY_NODE;return gn(n,(r,s)=>{if(qr(n,r)&&r.substring(0,1)!=="."){const a=zt(s);(a.isLeafNode()||!a.isEmpty())&&(t=t.updateImmediateChild(r,a))}}),t.updatePriority(zt(e))}}UD(zt);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qD extends df{constructor(e){super(),this.indexPath_=e,oe(!Me(e)&&De(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const r=this.extractChild(e.node),s=this.extractChild(t.node),a=r.compareTo(s);return a===0?To(e.name,t.name):a}makePost(e,t){const r=zt(e),s=Ge.EMPTY_NODE.updateChild(this.indexPath_,r);return new je(t,s)}maxPost(){const e=Ge.EMPTY_NODE.updateChild(this.indexPath_,ic);return new je(mo,e)}toString(){return Vu(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GD extends df{compare(e,t){const r=e.node.compareTo(t.node);return r===0?To(e.name,t.name):r}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return je.MIN}maxPost(){return je.MAX}makePost(e,t){const r=zt(e);return new je(t,r)}toString(){return".value"}}const KD=new GD;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QD(n){return{type:"value",snapshotNode:n}}function YD(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function XD(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Ow(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function JD(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D_{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=sn}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return oe(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return oe(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Ba}hasEnd(){return this.endSet_}getIndexEndValue(){return oe(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return oe(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:mo}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return oe(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===sn}copy(){const e=new D_;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Dw(n){const e={};if(n.isDefault())return e;let t;if(n.index_===sn?t="$priority":n.index_===KD?t="$value":n.index_===Na?t="$key":(oe(n.index_ instanceof qD,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Kt(t),n.startSet_){const r=n.startAfterSet_?"startAfter":"startAt";e[r]=Kt(n.indexStartValue_),n.startNameSet_&&(e[r]+=","+Kt(n.indexStartName_))}if(n.endSet_){const r=n.endBeforeSet_?"endBefore":"endAt";e[r]=Kt(n.indexEndValue_),n.endNameSet_&&(e[r]+=","+Kt(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function bw(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==sn&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cd extends w2{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(oe(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,r,s){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=r,this.appCheckTokenProvider_=s,this.log_=rc("p:rest:"),this.listens_={}}listen(e,t,r,s){const a=e._path.toString();this.log_("Listen called for "+a+" "+e._queryIdentifier);const u=Cd.getListenId_(e,r),h={};this.listens_[u]=h;const f=Dw(e._queryParams);this.restRequest_(a+".json",f,(p,y)=>{let w=y;if(p===404&&(w=null,p=null),p===null&&this.onDataUpdate_(a,w,!1,r),xa(this.listens_,u)===h){let T;p?p===401?T="permission_denied":T="rest_error:"+p:T="ok",s(T,null)}})}unlisten(e,t){const r=Cd.getListenId_(e,t);delete this.listens_[r]}get(e){const t=Dw(e._queryParams),r=e._path.toString(),s=new Wu;return this.restRequest_(r+".json",t,(a,u)=>{let h=u;a===404&&(h=null,a=null),a===null?(this.onDataUpdate_(r,h,!1,null),s.resolve(h)):s.reject(new Error(h))}),s.promise}refreshAuthToken(e){}restRequest_(e,t={},r){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,a])=>{s&&s.accessToken&&(t.auth=s.accessToken),a&&a.token&&(t.ac=a.token);const u=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Ya(t);this.log_("Sending REST request for "+u);const h=new XMLHttpRequest;h.onreadystatechange=()=>{if(r&&h.readyState===4){this.log_("REST Response for "+u+" received. status:",h.status,"response:",h.responseText);let f=null;if(h.status>=200&&h.status<300){try{f=Cu(h.responseText)}catch{mn("Failed to parse JSON response for "+u+": "+h.responseText)}r(null,f)}else h.status!==401&&h.status!==404&&mn("Got unsuccessful REST response for "+u+" Status: "+h.status),r(h.status);r=null}},h.open("GET",u,!0),h.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZD{constructor(){this.rootNode_=Ge.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rd(){return{value:null,children:new Map}}function N2(n,e,t){if(Me(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const r=De(e);n.children.has(r)||n.children.set(r,Rd());const s=n.children.get(r);e=at(e),N2(s,e,t)}}function tg(n,e,t){n.value!==null?t(e,n.value):e6(n,(r,s)=>{const a=new it(e.toString()+"/"+r);tg(s,a,t)})}function e6(n,e){n.children.forEach((t,r)=>{e(r,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t6{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&gn(this.last_,(r,s)=>{t[r]=t[r]-s}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lw=10*1e3,n6=30*1e3,r6=5*60*1e3;class i6{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new t6(e);const r=Lw+(n6-Lw)*Math.random();wu(this.reportStats_.bind(this),Math.floor(r))}reportStats_(){const e=this.statsListener_.get(),t={};let r=!1;gn(e,(s,a)=>{a>0&&qr(this.statsToReport_,s)&&(t[s]=a,r=!0)}),r&&this.server_.reportStats(t),wu(this.reportStats_.bind(this),Math.floor(Math.random()*2*r6))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Mr;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(Mr||(Mr={}));function b_(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function x2(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function O2(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kd{constructor(e,t,r){this.path=e,this.affectedTree=t,this.revert=r,this.type=Mr.ACK_USER_WRITE,this.source=b_()}operationForChild(e){if(Me(this.path)){if(this.affectedTree.value!=null)return oe(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new it(e));return new kd(Ye(),t,this.revert)}}else return oe(De(this.path)===e,"operationForChild called for unrelated child."),new kd(at(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class go{constructor(e,t,r){this.source=e,this.path=t,this.snap=r,this.type=Mr.OVERWRITE}operationForChild(e){return Me(this.path)?new go(this.source,Ye(),this.snap.getImmediateChild(e)):new go(this.source,at(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class za{constructor(e,t,r){this.source=e,this.path=t,this.children=r,this.type=Mr.MERGE}operationForChild(e){if(Me(this.path)){const t=this.children.subtree(new it(e));return t.isEmpty()?null:t.value?new go(this.source,Ye(),t.value):new za(this.source,Ye(),t)}else return oe(De(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new za(this.source,at(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class L_{constructor(e,t,r){this.node_=e,this.fullyInitialized_=t,this.filtered_=r}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(Me(e))return this.isFullyInitialized()&&!this.filtered_;const t=De(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}function s6(n,e,t,r){const s=[],a=[];return e.forEach(u=>{u.type==="child_changed"&&n.index_.indexedValueChanged(u.oldSnap,u.snapshotNode)&&a.push(JD(u.childName,u.snapshotNode))}),ou(n,s,"child_removed",e,r,t),ou(n,s,"child_added",e,r,t),ou(n,s,"child_moved",a,r,t),ou(n,s,"child_changed",e,r,t),ou(n,s,"value",e,r,t),s}function ou(n,e,t,r,s,a){const u=r.filter(h=>h.type===t);u.sort((h,f)=>a6(n,h,f)),u.forEach(h=>{const f=o6(n,h,a);s.forEach(p=>{p.respondsTo(h.type)&&e.push(p.createEvent(f,n.query_))})})}function o6(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function a6(n,e,t){if(e.childName==null||t.childName==null)throw Qa("Should only compare child_ events.");const r=new je(e.childName,e.snapshotNode),s=new je(t.childName,t.snapshotNode);return n.index_.compare(r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D2(n,e){return{eventCache:n,serverCache:e}}function Eu(n,e,t,r){return D2(new L_(e,t,r),n.serverCache)}function b2(n,e,t,r){return D2(n.eventCache,new L_(e,t,r))}function ng(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function _o(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ym;const l6=()=>(ym||(ym=new An(GO)),ym);class nt{static fromObject(e){let t=new nt(null);return gn(e,(r,s)=>{t=t.set(new it(r),s)}),t}constructor(e,t=l6()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:Ye(),value:this.value};if(Me(e))return null;{const r=De(e),s=this.children.get(r);if(s!==null){const a=s.findRootMostMatchingPathAndValue(at(e),t);return a!=null?{path:pt(new it(r),a.path),value:a.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(Me(e))return this;{const t=De(e),r=this.children.get(t);return r!==null?r.subtree(at(e)):new nt(null)}}set(e,t){if(Me(e))return new nt(t,this.children);{const r=De(e),a=(this.children.get(r)||new nt(null)).set(at(e),t),u=this.children.insert(r,a);return new nt(this.value,u)}}remove(e){if(Me(e))return this.children.isEmpty()?new nt(null):new nt(null,this.children);{const t=De(e),r=this.children.get(t);if(r){const s=r.remove(at(e));let a;return s.isEmpty()?a=this.children.remove(t):a=this.children.insert(t,s),this.value===null&&a.isEmpty()?new nt(null):new nt(this.value,a)}else return this}}get(e){if(Me(e))return this.value;{const t=De(e),r=this.children.get(t);return r?r.get(at(e)):null}}setTree(e,t){if(Me(e))return t;{const r=De(e),a=(this.children.get(r)||new nt(null)).setTree(at(e),t);let u;return a.isEmpty()?u=this.children.remove(r):u=this.children.insert(r,a),new nt(this.value,u)}}fold(e){return this.fold_(Ye(),e)}fold_(e,t){const r={};return this.children.inorderTraversal((s,a)=>{r[s]=a.fold_(pt(e,s),t)}),t(e,this.value,r)}findOnPath(e,t){return this.findOnPath_(e,Ye(),t)}findOnPath_(e,t,r){const s=this.value?r(t,this.value):!1;if(s)return s;if(Me(e))return null;{const a=De(e),u=this.children.get(a);return u?u.findOnPath_(at(e),pt(t,a),r):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,Ye(),t)}foreachOnPath_(e,t,r){if(Me(e))return this;{this.value&&r(t,this.value);const s=De(e),a=this.children.get(s);return a?a.foreachOnPath_(at(e),pt(t,s),r):new nt(null)}}foreach(e){this.foreach_(Ye(),e)}foreach_(e,t){this.children.inorderTraversal((r,s)=>{s.foreach_(pt(e,r),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,r)=>{r.value&&e(t,r.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _r{constructor(e){this.writeTree_=e}static empty(){return new _r(new nt(null))}}function Tu(n,e,t){if(Me(e))return new _r(new nt(t));{const r=n.writeTree_.findRootMostValueAndPath(e);if(r!=null){const s=r.path;let a=r.value;const u=Xn(s,e);return a=a.updateChild(u,t),new _r(n.writeTree_.set(s,a))}else{const s=new nt(t),a=n.writeTree_.setTree(e,s);return new _r(a)}}}function rg(n,e,t){let r=n;return gn(t,(s,a)=>{r=Tu(r,pt(e,s),a)}),r}function Mw(n,e){if(Me(e))return _r.empty();{const t=n.writeTree_.setTree(e,new nt(null));return new _r(t)}}function ig(n,e){return Io(n,e)!=null}function Io(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(Xn(t.path,e)):null}function Vw(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(sn,(r,s)=>{e.push(new je(r,s))}):n.writeTree_.children.inorderTraversal((r,s)=>{s.value!=null&&e.push(new je(r,s.value))}),e}function _s(n,e){if(Me(e))return n;{const t=Io(n,e);return t!=null?new _r(new nt(t)):new _r(n.writeTree_.subtree(e))}}function sg(n){return n.writeTree_.isEmpty()}function Wa(n,e){return L2(Ye(),n.writeTree_,e)}function L2(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let r=null;return e.children.inorderTraversal((s,a)=>{s===".priority"?(oe(a.value!==null,"Priority writes must always be leaf nodes"),r=a.value):t=L2(pt(n,s),a,t)}),!t.getChild(n).isEmpty()&&r!==null&&(t=t.updateChild(pt(n,".priority"),r)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function M2(n,e){return B2(e,n)}function u6(n,e,t,r,s){oe(r>n.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),n.allWrites.push({path:e,snap:t,writeId:r,visible:s}),s&&(n.visibleWrites=Tu(n.visibleWrites,e,t)),n.lastWriteId=r}function c6(n,e,t,r){oe(r>n.lastWriteId,"Stacking an older merge on top of newer ones"),n.allWrites.push({path:e,children:t,writeId:r,visible:!0}),n.visibleWrites=rg(n.visibleWrites,e,t),n.lastWriteId=r}function h6(n,e){for(let t=0;t<n.allWrites.length;t++){const r=n.allWrites[t];if(r.writeId===e)return r}return null}function d6(n,e){const t=n.allWrites.findIndex(h=>h.writeId===e);oe(t>=0,"removeWrite called with nonexistent writeId.");const r=n.allWrites[t];n.allWrites.splice(t,1);let s=r.visible,a=!1,u=n.allWrites.length-1;for(;s&&u>=0;){const h=n.allWrites[u];h.visible&&(u>=t&&f6(h,r.path)?s=!1:Jn(r.path,h.path)&&(a=!0)),u--}if(s){if(a)return p6(n),!0;if(r.snap)n.visibleWrites=Mw(n.visibleWrites,r.path);else{const h=r.children;gn(h,f=>{n.visibleWrites=Mw(n.visibleWrites,pt(r.path,f))})}return!0}else return!1}function f6(n,e){if(n.snap)return Jn(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&Jn(pt(n.path,t),e))return!0;return!1}function p6(n){n.visibleWrites=V2(n.allWrites,m6,Ye()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function m6(n){return n.visible}function V2(n,e,t){let r=_r.empty();for(let s=0;s<n.length;++s){const a=n[s];if(e(a)){const u=a.path;let h;if(a.snap)Jn(t,u)?(h=Xn(t,u),r=Tu(r,h,a.snap)):Jn(u,t)&&(h=Xn(u,t),r=Tu(r,Ye(),a.snap.getChild(h)));else if(a.children){if(Jn(t,u))h=Xn(t,u),r=rg(r,h,a.children);else if(Jn(u,t))if(h=Xn(u,t),Me(h))r=rg(r,Ye(),a.children);else{const f=xa(a.children,De(h));if(f){const p=f.getChild(at(h));r=Tu(r,Ye(),p)}}}else throw Qa("WriteRecord should have .snap or .children")}}return r}function F2(n,e,t,r,s){if(!r&&!s){const a=Io(n.visibleWrites,e);if(a!=null)return a;{const u=_s(n.visibleWrites,e);if(sg(u))return t;if(t==null&&!ig(u,Ye()))return null;{const h=t||Ge.EMPTY_NODE;return Wa(u,h)}}}else{const a=_s(n.visibleWrites,e);if(!s&&sg(a))return t;if(!s&&t==null&&!ig(a,Ye()))return null;{const u=function(p){return(p.visible||s)&&(!r||!~r.indexOf(p.writeId))&&(Jn(p.path,e)||Jn(e,p.path))},h=V2(n.allWrites,u,e),f=t||Ge.EMPTY_NODE;return Wa(h,f)}}}function g6(n,e,t){let r=Ge.EMPTY_NODE;const s=Io(n.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(sn,(a,u)=>{r=r.updateImmediateChild(a,u)}),r;if(t){const a=_s(n.visibleWrites,e);return t.forEachChild(sn,(u,h)=>{const f=Wa(_s(a,new it(u)),h);r=r.updateImmediateChild(u,f)}),Vw(a).forEach(u=>{r=r.updateImmediateChild(u.name,u.node)}),r}else{const a=_s(n.visibleWrites,e);return Vw(a).forEach(u=>{r=r.updateImmediateChild(u.name,u.node)}),r}}function _6(n,e,t,r,s){oe(r||s,"Either existingEventSnap or existingServerSnap must exist");const a=pt(e,t);if(ig(n.visibleWrites,a))return null;{const u=_s(n.visibleWrites,a);return sg(u)?s.getChild(t):Wa(u,s.getChild(t))}}function y6(n,e,t,r){const s=pt(e,t),a=Io(n.visibleWrites,s);if(a!=null)return a;if(r.isCompleteForChild(t)){const u=_s(n.visibleWrites,s);return Wa(u,r.getNode().getImmediateChild(t))}else return null}function v6(n,e){return Io(n.visibleWrites,e)}function w6(n,e,t,r,s,a,u){let h;const f=_s(n.visibleWrites,e),p=Io(f,Ye());if(p!=null)h=p;else if(t!=null)h=Wa(f,t);else return[];if(h=h.withIndex(u),!h.isEmpty()&&!h.isLeafNode()){const y=[],w=u.getCompare(),T=a?h.getReverseIteratorFrom(r,u):h.getIteratorFrom(r,u);let C=T.getNext();for(;C&&y.length<s;)w(C,r)!==0&&y.push(C),C=T.getNext();return y}else return[]}function E6(){return{visibleWrites:_r.empty(),allWrites:[],lastWriteId:-1}}function og(n,e,t,r){return F2(n.writeTree,n.treePath,e,t,r)}function U2(n,e){return g6(n.writeTree,n.treePath,e)}function Fw(n,e,t,r){return _6(n.writeTree,n.treePath,e,t,r)}function Ad(n,e){return v6(n.writeTree,pt(n.treePath,e))}function T6(n,e,t,r,s,a){return w6(n.writeTree,n.treePath,e,t,r,s,a)}function M_(n,e,t){return y6(n.writeTree,n.treePath,e,t)}function j2(n,e){return B2(pt(n.treePath,e),n.writeTree)}function B2(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class I6{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,r=e.childName;oe(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),oe(r!==".priority","Only non-priority child changes can be tracked.");const s=this.changeMap.get(r);if(s){const a=s.type;if(t==="child_added"&&a==="child_removed")this.changeMap.set(r,Ow(r,e.snapshotNode,s.snapshotNode));else if(t==="child_removed"&&a==="child_added")this.changeMap.delete(r);else if(t==="child_removed"&&a==="child_changed")this.changeMap.set(r,XD(r,s.oldSnap));else if(t==="child_changed"&&a==="child_added")this.changeMap.set(r,YD(r,e.snapshotNode));else if(t==="child_changed"&&a==="child_changed")this.changeMap.set(r,Ow(r,e.snapshotNode,s.oldSnap));else throw Qa("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(r,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S6{getCompleteChild(e){return null}getChildAfterChild(e,t,r){return null}}const z2=new S6;class V_{constructor(e,t,r=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=r}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const r=this.optCompleteServerCache_!=null?new L_(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return M_(this.writes_,e,r)}}getChildAfterChild(e,t,r){const s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:_o(this.viewCache_),a=T6(this.writes_,s,t,1,r,e);return a.length===0?null:a[0]}}function C6(n,e){oe(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),oe(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function R6(n,e,t,r,s){const a=new I6;let u,h;if(t.type===Mr.OVERWRITE){const p=t;p.source.fromUser?u=ag(n,e,p.path,p.snap,r,s,a):(oe(p.source.fromServer,"Unknown source."),h=p.source.tagged||e.serverCache.isFiltered()&&!Me(p.path),u=Pd(n,e,p.path,p.snap,r,s,h,a))}else if(t.type===Mr.MERGE){const p=t;p.source.fromUser?u=A6(n,e,p.path,p.children,r,s,a):(oe(p.source.fromServer,"Unknown source."),h=p.source.tagged||e.serverCache.isFiltered(),u=lg(n,e,p.path,p.children,r,s,h,a))}else if(t.type===Mr.ACK_USER_WRITE){const p=t;p.revert?u=x6(n,e,p.path,r,s,a):u=P6(n,e,p.path,p.affectedTree,r,s,a)}else if(t.type===Mr.LISTEN_COMPLETE)u=N6(n,e,t.path,r,a);else throw Qa("Unknown operation type: "+t.type);const f=a.getChanges();return k6(e,u,f),{viewCache:u,changes:f}}function k6(n,e,t){const r=e.eventCache;if(r.isFullyInitialized()){const s=r.getNode().isLeafNode()||r.getNode().isEmpty(),a=ng(n);(t.length>0||!n.eventCache.isFullyInitialized()||s&&!r.getNode().equals(a)||!r.getNode().getPriority().equals(a.getPriority()))&&t.push(QD(ng(e)))}}function W2(n,e,t,r,s,a){const u=e.eventCache;if(Ad(r,t)!=null)return e;{let h,f;if(Me(t))if(oe(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const p=_o(e),y=p instanceof Ge?p:Ge.EMPTY_NODE,w=U2(r,y);h=n.filter.updateFullNode(e.eventCache.getNode(),w,a)}else{const p=og(r,_o(e));h=n.filter.updateFullNode(e.eventCache.getNode(),p,a)}else{const p=De(t);if(p===".priority"){oe(Cs(t)===1,"Can't have a priority with additional path components");const y=u.getNode();f=e.serverCache.getNode();const w=Fw(r,t,y,f);w!=null?h=n.filter.updatePriority(y,w):h=u.getNode()}else{const y=at(t);let w;if(u.isCompleteForChild(p)){f=e.serverCache.getNode();const T=Fw(r,t,u.getNode(),f);T!=null?w=u.getNode().getImmediateChild(p).updateChild(y,T):w=u.getNode().getImmediateChild(p)}else w=M_(r,p,e.serverCache);w!=null?h=n.filter.updateChild(u.getNode(),p,w,y,s,a):h=u.getNode()}}return Eu(e,h,u.isFullyInitialized()||Me(t),n.filter.filtersNodes())}}function Pd(n,e,t,r,s,a,u,h){const f=e.serverCache;let p;const y=u?n.filter:n.filter.getIndexedFilter();if(Me(t))p=y.updateFullNode(f.getNode(),r,null);else if(y.filtersNodes()&&!f.isFiltered()){const C=f.getNode().updateChild(t,r);p=y.updateFullNode(f.getNode(),C,null)}else{const C=De(t);if(!f.isCompleteForPath(t)&&Cs(t)>1)return e;const A=at(t),D=f.getNode().getImmediateChild(C).updateChild(A,r);C===".priority"?p=y.updatePriority(f.getNode(),D):p=y.updateChild(f.getNode(),C,D,A,z2,null)}const w=b2(e,p,f.isFullyInitialized()||Me(t),y.filtersNodes()),T=new V_(s,w,a);return W2(n,w,t,s,T,h)}function ag(n,e,t,r,s,a,u){const h=e.eventCache;let f,p;const y=new V_(s,e,a);if(Me(t))p=n.filter.updateFullNode(e.eventCache.getNode(),r,u),f=Eu(e,p,!0,n.filter.filtersNodes());else{const w=De(t);if(w===".priority")p=n.filter.updatePriority(e.eventCache.getNode(),r),f=Eu(e,p,h.isFullyInitialized(),h.isFiltered());else{const T=at(t),C=h.getNode().getImmediateChild(w);let A;if(Me(T))A=r;else{const M=y.getCompleteChild(w);M!=null?N_(T)===".priority"&&M.getChild(T2(T)).isEmpty()?A=M:A=M.updateChild(T,r):A=Ge.EMPTY_NODE}if(C.equals(A))f=e;else{const M=n.filter.updateChild(h.getNode(),w,A,T,y,u);f=Eu(e,M,h.isFullyInitialized(),n.filter.filtersNodes())}}}return f}function Uw(n,e){return n.eventCache.isCompleteForChild(e)}function A6(n,e,t,r,s,a,u){let h=e;return r.foreach((f,p)=>{const y=pt(t,f);Uw(e,De(y))&&(h=ag(n,h,y,p,s,a,u))}),r.foreach((f,p)=>{const y=pt(t,f);Uw(e,De(y))||(h=ag(n,h,y,p,s,a,u))}),h}function jw(n,e,t){return t.foreach((r,s)=>{e=e.updateChild(r,s)}),e}function lg(n,e,t,r,s,a,u,h){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let f=e,p;Me(t)?p=r:p=new nt(null).setTree(t,r);const y=e.serverCache.getNode();return p.children.inorderTraversal((w,T)=>{if(y.hasChild(w)){const C=e.serverCache.getNode().getImmediateChild(w),A=jw(n,C,T);f=Pd(n,f,new it(w),A,s,a,u,h)}}),p.children.inorderTraversal((w,T)=>{const C=!e.serverCache.isCompleteForChild(w)&&T.value===null;if(!y.hasChild(w)&&!C){const A=e.serverCache.getNode().getImmediateChild(w),M=jw(n,A,T);f=Pd(n,f,new it(w),M,s,a,u,h)}}),f}function P6(n,e,t,r,s,a,u){if(Ad(s,t)!=null)return e;const h=e.serverCache.isFiltered(),f=e.serverCache;if(r.value!=null){if(Me(t)&&f.isFullyInitialized()||f.isCompleteForPath(t))return Pd(n,e,t,f.getNode().getChild(t),s,a,h,u);if(Me(t)){let p=new nt(null);return f.getNode().forEachChild(Na,(y,w)=>{p=p.set(new it(y),w)}),lg(n,e,t,p,s,a,h,u)}else return e}else{let p=new nt(null);return r.foreach((y,w)=>{const T=pt(t,y);f.isCompleteForPath(T)&&(p=p.set(y,f.getNode().getChild(T)))}),lg(n,e,t,p,s,a,h,u)}}function N6(n,e,t,r,s){const a=e.serverCache,u=b2(e,a.getNode(),a.isFullyInitialized()||Me(t),a.isFiltered());return W2(n,u,t,r,z2,s)}function x6(n,e,t,r,s,a){let u;if(Ad(r,t)!=null)return e;{const h=new V_(r,e,s),f=e.eventCache.getNode();let p;if(Me(t)||De(t)===".priority"){let y;if(e.serverCache.isFullyInitialized())y=og(r,_o(e));else{const w=e.serverCache.getNode();oe(w instanceof Ge,"serverChildren would be complete if leaf node"),y=U2(r,w)}y=y,p=n.filter.updateFullNode(f,y,a)}else{const y=De(t);let w=M_(r,y,e.serverCache);w==null&&e.serverCache.isCompleteForChild(y)&&(w=f.getImmediateChild(y)),w!=null?p=n.filter.updateChild(f,y,w,at(t),h,a):e.eventCache.getNode().hasChild(y)?p=n.filter.updateChild(f,y,Ge.EMPTY_NODE,at(t),h,a):p=f,p.isEmpty()&&e.serverCache.isFullyInitialized()&&(u=og(r,_o(e)),u.isLeafNode()&&(p=n.filter.updateFullNode(p,u,a)))}return u=e.serverCache.isFullyInitialized()||Ad(r,Ye())!=null,Eu(e,p,u,n.filter.filtersNodes())}}function O6(n,e){const t=_o(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!Me(e)&&!t.getImmediateChild(De(e)).isEmpty())?t.getChild(e):null}function Bw(n,e,t,r){e.type===Mr.MERGE&&e.source.queryId!==null&&(oe(_o(n.viewCache_),"We should always have a full cache before handling merges"),oe(ng(n.viewCache_),"Missing event cache, even though we have a server cache"));const s=n.viewCache_,a=R6(n.processor_,s,e,t,r);return C6(n.processor_,a.viewCache),oe(a.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=a.viewCache,D6(n,a.changes,a.viewCache.eventCache.getNode())}function D6(n,e,t,r){const s=n.eventRegistrations_;return s6(n.eventGenerator_,e,t,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zw;function b6(n){oe(!zw,"__referenceConstructor has already been defined"),zw=n}function F_(n,e,t,r){const s=e.source.queryId;if(s!==null){const a=n.views.get(s);return oe(a!=null,"SyncTree gave us an op for an invalid query."),Bw(a,e,t,r)}else{let a=[];for(const u of n.views.values())a=a.concat(Bw(u,e,t,r));return a}}function U_(n,e){let t=null;for(const r of n.views.values())t=t||O6(r,e);return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ww;function L6(n){oe(!Ww,"__referenceConstructor has already been defined"),Ww=n}class $w{constructor(e){this.listenProvider_=e,this.syncPointTree_=new nt(null),this.pendingWriteTree_=E6(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function $2(n,e,t,r,s){return u6(n.pendingWriteTree_,e,t,r,s),s?sc(n,new go(b_(),e,t)):[]}function M6(n,e,t,r){c6(n.pendingWriteTree_,e,t,r);const s=nt.fromObject(t);return sc(n,new za(b_(),e,s))}function hs(n,e,t=!1){const r=h6(n.pendingWriteTree_,e);if(d6(n.pendingWriteTree_,e)){let a=new nt(null);return r.snap!=null?a=a.set(Ye(),!0):gn(r.children,u=>{a=a.set(new it(u),!0)}),sc(n,new kd(r.path,a,t))}else return[]}function ff(n,e,t){return sc(n,new go(x2(),e,t))}function V6(n,e,t){const r=nt.fromObject(t);return sc(n,new za(x2(),e,r))}function F6(n,e,t,r){const s=G2(n,r);if(s!=null){const a=K2(s),u=a.path,h=a.queryId,f=Xn(u,e),p=new go(O2(h),f,t);return Q2(n,u,p)}else return[]}function U6(n,e,t,r){const s=G2(n,r);if(s){const a=K2(s),u=a.path,h=a.queryId,f=Xn(u,e),p=nt.fromObject(t),y=new za(O2(h),f,p);return Q2(n,u,y)}else return[]}function j_(n,e,t){const s=n.pendingWriteTree_,a=n.syncPointTree_.findOnPath(e,(u,h)=>{const f=Xn(u,e),p=U_(h,f);if(p)return p});return F2(s,e,a,t,!0)}function sc(n,e){return H2(e,n.syncPointTree_,null,M2(n.pendingWriteTree_,Ye()))}function H2(n,e,t,r){if(Me(n.path))return q2(n,e,t,r);{const s=e.get(Ye());t==null&&s!=null&&(t=U_(s,Ye()));let a=[];const u=De(n.path),h=n.operationForChild(u),f=e.children.get(u);if(f&&h){const p=t?t.getImmediateChild(u):null,y=j2(r,u);a=a.concat(H2(h,f,p,y))}return s&&(a=a.concat(F_(s,n,r,t))),a}}function q2(n,e,t,r){const s=e.get(Ye());t==null&&s!=null&&(t=U_(s,Ye()));let a=[];return e.children.inorderTraversal((u,h)=>{const f=t?t.getImmediateChild(u):null,p=j2(r,u),y=n.operationForChild(u);y&&(a=a.concat(q2(y,h,f,p)))}),s&&(a=a.concat(F_(s,n,r,t))),a}function G2(n,e){return n.tagToQueryMap.get(e)}function K2(n){const e=n.indexOf("$");return oe(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new it(n.substr(0,e))}}function Q2(n,e,t){const r=n.syncPointTree_.get(e);oe(r,"Missing sync point for query tag that we're tracking");const s=M2(n.pendingWriteTree_,e);return F_(r,t,s,null)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B_{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new B_(t)}node(){return this.node_}}class z_{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=pt(this.path_,e);return new z_(this.syncTree_,t)}node(){return j_(this.syncTree_,this.path_)}}const j6=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},Hw=function(n,e,t){if(!n||typeof n!="object")return n;if(oe(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return B6(n[".sv"],e,t);if(typeof n[".sv"]=="object")return z6(n[".sv"],e);oe(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},B6=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:oe(!1,"Unexpected server value: "+n)}},z6=function(n,e,t){n.hasOwnProperty("increment")||oe(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const r=n.increment;typeof r!="number"&&oe(!1,"Unexpected increment value: "+r);const s=e.node();if(oe(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return r;const u=s.getValue();return typeof u!="number"?r:u+r},Y2=function(n,e,t,r){return W_(e,new z_(t,n),r)},X2=function(n,e,t){return W_(n,new B_(e),t)};function W_(n,e,t){const r=n.getPriority().val(),s=Hw(r,e.getImmediateChild(".priority"),t);let a;if(n.isLeafNode()){const u=n,h=Hw(u.getValue(),e,t);return h!==u.getValue()||s!==u.getPriority().val()?new Ut(h,zt(s)):n}else{const u=n;return a=u,s!==u.getPriority().val()&&(a=a.updatePriority(new Ut(s))),u.forEachChild(sn,(h,f)=>{const p=W_(f,e.getImmediateChild(h),t);p!==f&&(a=a.updateImmediateChild(h,p))}),a}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $_{constructor(e="",t=null,r={children:{},childCount:0}){this.name=e,this.parent=t,this.node=r}}function H_(n,e){let t=e instanceof it?e:new it(e),r=n,s=De(t);for(;s!==null;){const a=xa(r.node.children,s)||{children:{},childCount:0};r=new $_(s,r,a),t=at(t),s=De(t)}return r}function il(n){return n.node.value}function J2(n,e){n.node.value=e,ug(n)}function Z2(n){return n.node.childCount>0}function W6(n){return il(n)===void 0&&!Z2(n)}function pf(n,e){gn(n.node.children,(t,r)=>{e(new $_(t,n,r))})}function eS(n,e,t,r){t&&e(n),pf(n,s=>{eS(s,e,!0)})}function $6(n,e,t){let r=n.parent;for(;r!==null;){if(e(r))return!0;r=r.parent}return!1}function oc(n){return new it(n.parent===null?n.name:oc(n.parent)+"/"+n.name)}function ug(n){n.parent!==null&&H6(n.parent,n.name,n)}function H6(n,e,t){const r=W6(t),s=qr(n.node.children,e);r&&s?(delete n.node.children[e],n.node.childCount--,ug(n)):!r&&!s&&(n.node.children[e]=t.node,n.node.childCount++,ug(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q6=/[\[\].#$\/\u0000-\u001F\u007F]/,G6=/[\[\].#$\u0000-\u001F\u007F]/,vm=10*1024*1024,q_=function(n){return typeof n=="string"&&n.length!==0&&!q6.test(n)},tS=function(n){return typeof n=="string"&&n.length!==0&&!G6.test(n)},K6=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),tS(n)},Q6=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!C_(n)||n&&typeof n=="object"&&qr(n,".sv")},Y6=function(n,e,t,r){mf(Md(n,"value"),e,t)},mf=function(n,e,t){const r=t instanceof it?new PD(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+so(r));if(typeof e=="function")throw new Error(n+"contains a function "+so(r)+" with contents = "+e.toString());if(C_(e))throw new Error(n+"contains "+e.toString()+" "+so(r));if(typeof e=="string"&&e.length>vm/3&&Vd(e)>vm)throw new Error(n+"contains a string greater than "+vm+" utf8 bytes "+so(r)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,a=!1;if(gn(e,(u,h)=>{if(u===".value")s=!0;else if(u!==".priority"&&u!==".sv"&&(a=!0,!q_(u)))throw new Error(n+" contains an invalid key ("+u+") "+so(r)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);ND(r,u),mf(n,h,r),xD(r)}),s&&a)throw new Error(n+' contains ".value" child '+so(r)+" in addition to actual children.")}},X6=function(n,e){let t,r;for(t=0;t<e.length;t++){r=e[t];const a=Vu(r);for(let u=0;u<a.length;u++)if(!(a[u]===".priority"&&u===a.length-1)){if(!q_(a[u]))throw new Error(n+"contains an invalid key ("+a[u]+") in path "+r.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort(AD);let s=null;for(t=0;t<e.length;t++){if(r=e[t],s!==null&&Jn(s,r))throw new Error(n+"contains a path "+s.toString()+" that is ancestor of another path "+r.toString());s=r}},J6=function(n,e,t,r){const s=Md(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(s+" must be an object containing the children to replace.");const a=[];gn(e,(u,h)=>{const f=new it(u);if(mf(s,h,pt(t,f)),N_(f)===".priority"&&!Q6(h))throw new Error(s+"contains an invalid value for '"+f.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");a.push(f)}),X6(s,a)},nS=function(n,e,t,r){if(!tS(t))throw new Error(Md(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},Z6=function(n,e,t,r){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),nS(n,e,t)},rS=function(n,e){if(De(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},eb=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!q_(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!K6(t))throw new Error(Md(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tb{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function G_(n,e){let t=null;for(let r=0;r<e.length;r++){const s=e[r],a=s.getPath();t!==null&&!I2(a,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:a}),t.events.push(s)}t&&n.eventLists_.push(t)}function Er(n,e,t){G_(n,t),nb(n,r=>Jn(r,e)||Jn(e,r))}function nb(n,e){n.recursionDepth_++;let t=!0;for(let r=0;r<n.eventLists_.length;r++){const s=n.eventLists_[r];if(s){const a=s.path;e(a)?(rb(n.eventLists_[r]),n.eventLists_[r]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function rb(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const r=t.getEventRunner();vu&&Gt("event: "+t.toString()),rl(r)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ib="repo_interrupt",sb=25;class ob{constructor(e,t,r,s){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=r,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new tb,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Rd(),this.transactionQueueTree_=new $_,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function ab(n,e,t){if(n.stats_=A_(n.repoInfo_),n.forceRestClient_||ZO())n.server_=new Cd(n.repoInfo_,(r,s,a,u)=>{qw(n,r,s,a,u)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>Gw(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Kt(t)}catch(r){throw new Error("Invalid authOverride provided: "+r)}}n.persistentConnection_=new Ti(n.repoInfo_,e,(r,s,a,u)=>{qw(n,r,s,a,u)},r=>{Gw(n,r)},r=>{ub(n,r)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(r=>{n.server_.refreshAuthToken(r)}),n.appCheckProvider_.addTokenChangeListener(r=>{n.server_.refreshAppCheckToken(r.token)}),n.statsReporter_=iD(n.repoInfo_,()=>new i6(n.stats_,n.server_)),n.infoData_=new ZD,n.infoSyncTree_=new $w({startListening:(r,s,a,u)=>{let h=[];const f=n.infoData_.getNode(r._path);return f.isEmpty()||(h=ff(n.infoSyncTree_,r._path,f),setTimeout(()=>{u("ok")},0)),h},stopListening:()=>{}}),K_(n,"connected",!1),n.serverSyncTree_=new $w({startListening:(r,s,a,u)=>(n.server_.listen(r,a,s,(h,f)=>{const p=u(h,f);Er(n.eventQueue_,r._path,p)}),[]),stopListening:(r,s)=>{n.server_.unlisten(r,s)}})}function lb(n){const t=n.infoData_.getNode(new it(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function gf(n){return j6({timestamp:lb(n)})}function qw(n,e,t,r,s){n.dataUpdateCount++;const a=new it(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let u=[];if(s)if(r){const f=td(t,p=>zt(p));u=U6(n.serverSyncTree_,a,f,s)}else{const f=zt(t);u=F6(n.serverSyncTree_,a,f,s)}else if(r){const f=td(t,p=>zt(p));u=V6(n.serverSyncTree_,a,f)}else{const f=zt(t);u=ff(n.serverSyncTree_,a,f)}let h=a;u.length>0&&(h=$a(n,a)),Er(n.eventQueue_,h,u)}function Gw(n,e){K_(n,"connected",e),e===!1&&db(n)}function ub(n,e){gn(e,(t,r)=>{K_(n,t,r)})}function K_(n,e,t){const r=new it("/.info/"+e),s=zt(t);n.infoData_.updateSnapshot(r,s);const a=ff(n.infoSyncTree_,r,s);Er(n.eventQueue_,r,a)}function Q_(n){return n.nextWriteId_++}function cb(n,e,t,r,s){_f(n,"set",{path:e.toString(),value:t,priority:r});const a=gf(n),u=zt(t,r),h=j_(n.serverSyncTree_,e),f=X2(u,h,a),p=Q_(n),y=$2(n.serverSyncTree_,e,f,p,!0);G_(n.eventQueue_,y),n.server_.put(e.toString(),u.val(!0),(T,C)=>{const A=T==="ok";A||mn("set at "+e+" failed: "+T);const M=hs(n.serverSyncTree_,p,!A);Er(n.eventQueue_,e,M),cg(n,s,T,C)});const w=X_(n,e);$a(n,w),Er(n.eventQueue_,w,[])}function hb(n,e,t,r){_f(n,"update",{path:e.toString(),value:t});let s=!0;const a=gf(n),u={};if(gn(t,(h,f)=>{s=!1,u[h]=Y2(pt(e,h),zt(f),n.serverSyncTree_,a)}),s)Gt("update() called with empty data.  Don't do anything."),cg(n,r,"ok",void 0);else{const h=Q_(n),f=M6(n.serverSyncTree_,e,u,h);G_(n.eventQueue_,f),n.server_.merge(e.toString(),t,(p,y)=>{const w=p==="ok";w||mn("update at "+e+" failed: "+p);const T=hs(n.serverSyncTree_,h,!w),C=T.length>0?$a(n,e):e;Er(n.eventQueue_,C,T),cg(n,r,p,y)}),gn(t,p=>{const y=X_(n,pt(e,p));$a(n,y)}),Er(n.eventQueue_,e,[])}}function db(n){_f(n,"onDisconnectEvents");const e=gf(n),t=Rd();tg(n.onDisconnect_,Ye(),(s,a)=>{const u=Y2(s,a,n.serverSyncTree_,e);N2(t,s,u)});let r=[];tg(t,Ye(),(s,a)=>{r=r.concat(ff(n.serverSyncTree_,s,a));const u=X_(n,s);$a(n,u)}),n.onDisconnect_=Rd(),Er(n.eventQueue_,Ye(),r)}function fb(n){n.persistentConnection_&&n.persistentConnection_.interrupt(ib)}function _f(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),Gt(t,...e)}function cg(n,e,t,r){e&&rl(()=>{if(t==="ok")e(null);else{const s=(t||"error").toUpperCase();let a=s;r&&(a+=": "+r);const u=new Error(a);u.code=s,e(u)}})}function iS(n,e,t){return j_(n.serverSyncTree_,e,t)||Ge.EMPTY_NODE}function Y_(n,e=n.transactionQueueTree_){if(e||yf(n,e),il(e)){const t=oS(n,e);oe(t.length>0,"Sending zero length transaction queue"),t.every(s=>s.status===0)&&pb(n,oc(e),t)}else Z2(e)&&pf(e,t=>{Y_(n,t)})}function pb(n,e,t){const r=t.map(p=>p.currentWriteId),s=iS(n,e,r);let a=s;const u=s.hash();for(let p=0;p<t.length;p++){const y=t[p];oe(y.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),y.status=1,y.retryCount++;const w=Xn(e,y.path);a=a.updateChild(w,y.currentOutputSnapshotRaw)}const h=a.val(!0),f=e;n.server_.put(f.toString(),h,p=>{_f(n,"transaction put response",{path:f.toString(),status:p});let y=[];if(p==="ok"){const w=[];for(let T=0;T<t.length;T++)t[T].status=2,y=y.concat(hs(n.serverSyncTree_,t[T].currentWriteId)),t[T].onComplete&&w.push(()=>t[T].onComplete(null,!0,t[T].currentOutputSnapshotResolved)),t[T].unwatcher();yf(n,H_(n.transactionQueueTree_,e)),Y_(n,n.transactionQueueTree_),Er(n.eventQueue_,e,y);for(let T=0;T<w.length;T++)rl(w[T])}else{if(p==="datastale")for(let w=0;w<t.length;w++)t[w].status===3?t[w].status=4:t[w].status=0;else{mn("transaction at "+f.toString()+" failed: "+p);for(let w=0;w<t.length;w++)t[w].status=4,t[w].abortReason=p}$a(n,e)}},u)}function $a(n,e){const t=sS(n,e),r=oc(t),s=oS(n,t);return mb(n,s,r),r}function mb(n,e,t){if(e.length===0)return;const r=[];let s=[];const u=e.filter(h=>h.status===0).map(h=>h.currentWriteId);for(let h=0;h<e.length;h++){const f=e[h],p=Xn(t,f.path);let y=!1,w;if(oe(p!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),f.status===4)y=!0,w=f.abortReason,s=s.concat(hs(n.serverSyncTree_,f.currentWriteId,!0));else if(f.status===0)if(f.retryCount>=sb)y=!0,w="maxretry",s=s.concat(hs(n.serverSyncTree_,f.currentWriteId,!0));else{const T=iS(n,f.path,u);f.currentInputSnapshot=T;const C=e[h].update(T.val());if(C!==void 0){mf("transaction failed: Data returned ",C,f.path);let A=zt(C);typeof C=="object"&&C!=null&&qr(C,".priority")||(A=A.updatePriority(T.getPriority()));const D=f.currentWriteId,H=gf(n),Z=X2(A,T,H);f.currentOutputSnapshotRaw=A,f.currentOutputSnapshotResolved=Z,f.currentWriteId=Q_(n),u.splice(u.indexOf(D),1),s=s.concat($2(n.serverSyncTree_,f.path,Z,f.currentWriteId,f.applyLocally)),s=s.concat(hs(n.serverSyncTree_,D,!0))}else y=!0,w="nodata",s=s.concat(hs(n.serverSyncTree_,f.currentWriteId,!0))}Er(n.eventQueue_,t,s),s=[],y&&(e[h].status=2,function(T){setTimeout(T,Math.floor(0))}(e[h].unwatcher),e[h].onComplete&&(w==="nodata"?r.push(()=>e[h].onComplete(null,!1,e[h].currentInputSnapshot)):r.push(()=>e[h].onComplete(new Error(w),!1,null))))}yf(n,n.transactionQueueTree_);for(let h=0;h<r.length;h++)rl(r[h]);Y_(n,n.transactionQueueTree_)}function sS(n,e){let t,r=n.transactionQueueTree_;for(t=De(e);t!==null&&il(r)===void 0;)r=H_(r,t),e=at(e),t=De(e);return r}function oS(n,e){const t=[];return aS(n,e,t),t.sort((r,s)=>r.order-s.order),t}function aS(n,e,t){const r=il(e);if(r)for(let s=0;s<r.length;s++)t.push(r[s]);pf(e,s=>{aS(n,s,t)})}function yf(n,e){const t=il(e);if(t){let r=0;for(let s=0;s<t.length;s++)t[s].status!==2&&(t[r]=t[s],r++);t.length=r,J2(e,t.length>0?t:void 0)}pf(e,r=>{yf(n,r)})}function X_(n,e){const t=oc(sS(n,e)),r=H_(n.transactionQueueTree_,e);return $6(r,s=>{wm(n,s)}),wm(n,r),eS(r,s=>{wm(n,s)}),t}function wm(n,e){const t=il(e);if(t){const r=[];let s=[],a=-1;for(let u=0;u<t.length;u++)t[u].status===3||(t[u].status===1?(oe(a===u-1,"All SENT items should be at beginning of queue."),a=u,t[u].status=3,t[u].abortReason="set"):(oe(t[u].status===0,"Unexpected transaction status in abort"),t[u].unwatcher(),s=s.concat(hs(n.serverSyncTree_,t[u].currentWriteId,!0)),t[u].onComplete&&r.push(t[u].onComplete.bind(null,new Error("set"),!1,null))));a===-1?J2(e,void 0):t.length=a+1,Er(n.eventQueue_,oc(e),s);for(let u=0;u<r.length;u++)rl(r[u])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gb(n){let e="";const t=n.split("/");for(let r=0;r<t.length;r++)if(t[r].length>0){let s=t[r];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function _b(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const r=t.split("=");r.length===2?e[decodeURIComponent(r[0])]=decodeURIComponent(r[1]):mn(`Invalid query segment '${t}' in query '${n}'`)}return e}const Kw=function(n,e){const t=yb(n),r=t.namespace;t.domain==="firebase.com"&&Ni(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!r||r==="undefined")&&t.domain!=="localhost"&&Ni("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||HO();const s=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new f2(t.host,t.secure,r,s,e,"",r!==t.subdomain),path:new it(t.pathString)}},yb=function(n){let e="",t="",r="",s="",a="",u=!0,h="https",f=443;if(typeof n=="string"){let p=n.indexOf("//");p>=0&&(h=n.substring(0,p-1),n=n.substring(p+2));let y=n.indexOf("/");y===-1&&(y=n.length);let w=n.indexOf("?");w===-1&&(w=n.length),e=n.substring(0,Math.min(y,w)),y<w&&(s=gb(n.substring(y,w)));const T=_b(n.substring(Math.min(n.length,w)));p=e.indexOf(":"),p>=0?(u=h==="https"||h==="wss",f=parseInt(e.substring(p+1),10)):p=e.length;const C=e.slice(0,p);if(C.toLowerCase()==="localhost")t="localhost";else if(C.split(".").length<=2)t=C;else{const A=e.indexOf(".");r=e.substring(0,A).toLowerCase(),t=e.substring(A+1),a=r}"ns"in T&&(a=T.ns)}return{host:e,port:f,domain:t,subdomain:r,secure:u,scheme:h,pathString:s,namespace:a}};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class J_{constructor(e,t,r,s){this._repo=e,this._path=t,this._queryParams=r,this._orderByCalled=s}get key(){return Me(this._path)?null:N_(this._path)}get ref(){return new So(this._repo,this._path)}get _queryIdentifier(){const e=bw(this._queryParams),t=R_(e);return t==="{}"?"default":t}get _queryObject(){return bw(this._queryParams)}isEqual(e){if(e=Oe(e),!(e instanceof J_))return!1;const t=this._repo===e._repo,r=I2(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return t&&r&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+kD(this._path)}}class So extends J_{constructor(e,t){super(e,t,new D_,!1)}get parent(){const e=T2(this._path);return e===null?null:new So(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}function n5(n,e){return n=Oe(n),n._checkNotDeleted("ref"),e!==void 0?vb(n._root,e):n._root}function vb(n,e){return n=Oe(n),De(n._path)===null?Z6("child","path",e):nS("child","path",e),new So(n._repo,pt(n._path,e))}function r5(n){return rS("remove",n._path),wb(n,null)}function wb(n,e){n=Oe(n),rS("set",n._path),Y6("set",e,n._path);const t=new Wu;return cb(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function i5(n,e){J6("update",e,n._path);const t=new Wu;return hb(n._repo,n._path,e,t.wrapCallback(()=>{})),t.promise}b6(So);L6(So);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eb="FIREBASE_DATABASE_EMULATOR_HOST",hg={};let Tb=!1;function Ib(n,e,t,r){n.repoInfo_=new f2(e,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),r&&(n.authTokenProvider_=r)}function Sb(n,e,t,r,s){let a=r||n.options.databaseURL;a===void 0&&(n.options.projectId||Ni("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Gt("Using default host for project ",n.options.projectId),a=`${n.options.projectId}-default-rtdb.firebaseio.com`);let u=Kw(a,s),h=u.repoInfo,f;typeof process<"u"&&mw&&(f=mw[Eb]),f?(a=`http://${f}?ns=${h.namespace}`,u=Kw(a,s),h=u.repoInfo):u.repoInfo.secure;const p=new tD(n.name,n.options,e);eb("Invalid Firebase Database URL",u),Me(u.path)||Ni("Database URL must point to the root of a Firebase Database (not including a child path).");const y=Rb(h,n,p,new eD(n,t));return new kb(y,n)}function Cb(n,e){const t=hg[e];(!t||t[n.key]!==n)&&Ni(`Database ${e}(${n.repoInfo_}) has already been deleted.`),fb(n),delete t[n.key]}function Rb(n,e,t,r){let s=hg[e.name];s||(s={},hg[e.name]=s);let a=s[n.toURLString()];return a&&Ni("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),a=new ob(n,Tb,t,r),s[n.toURLString()]=a,a}class kb{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(ab(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new So(this._repo,Ye())),this._rootInternal}_delete(){return this._rootInternal!==null&&(Cb(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Ni("Cannot call "+e+" on a deleted database.")}}function Ab(n=Hu(),e){const t=Xa(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const r=Ld("database");r&&Pb(t,...r)}return t}function Pb(n,e,t,r={}){n=Oe(n),n._checkNotDeleted("useEmulator");const s=`${e}:${t}`,a=n._repoInternal;if(n._instanceStarted){if(s===n._repoInternal.repoInfo_.host&&ys(r,a.repoInfo_.emulatorOptions))return;Ni("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let u;if(a.repoInfo_.nodeAdmin)r.mockUserToken&&Ni('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),u=new Qh(Qh.OWNER);else if(r.mockUserToken){const h=typeof r.mockUserToken=="string"?r.mockUserToken:Rg(r.mockUserToken,n.app.options.projectId);u=new Qh(h)}Ib(a,s,r,u)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nb(n){UO(Rs),Ci(new zr("database",(e,{instanceIdentifier:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),a=e.getProvider("app-check-internal");return Sb(r,s,a,t)},"PUBLIC").setMultipleInstances(!0)),Nn(gw,_w,n),Nn(gw,_w,"esm2017")}Ti.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};Ti.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};Nb();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lS="firebasestorage.googleapis.com",uS="storageBucket",xb=2*60*1e3,Ob=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt extends Ir{constructor(e,t,r=0){super(Em(e),`Firebase Storage: ${t} (${Em(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,gt.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Em(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var mt;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(mt||(mt={}));function Em(n){return"storage/"+n}function Z_(){const n="An unknown error occurred, please check the error payload for server response.";return new gt(mt.UNKNOWN,n)}function Db(n){return new gt(mt.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function bb(n){return new gt(mt.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Lb(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new gt(mt.UNAUTHENTICATED,n)}function Mb(){return new gt(mt.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Vb(n){return new gt(mt.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function Fb(){return new gt(mt.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Ub(){return new gt(mt.CANCELED,"User canceled the upload/download.")}function jb(n){return new gt(mt.INVALID_URL,"Invalid URL '"+n+"'.")}function Bb(n){return new gt(mt.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function zb(){return new gt(mt.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+uS+"' property when initializing the app?")}function Wb(){return new gt(mt.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function $b(){return new gt(mt.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Hb(n){return new gt(mt.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function dg(n){return new gt(mt.INVALID_ARGUMENT,n)}function cS(){return new gt(mt.APP_DELETED,"The Firebase app was deleted.")}function qb(n){return new gt(mt.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Iu(n,e){return new gt(mt.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function au(n){throw new gt(mt.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pn{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=pn.makeFromUrl(e,t)}catch{return new pn(e,"")}if(r.path==="")return r;throw Bb(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function a(re){re.path.charAt(re.path.length-1)==="/"&&(re.path_=re.path_.slice(0,-1))}const u="(/(.*))?$",h=new RegExp("^gs://"+s+u,"i"),f={bucket:1,path:3};function p(re){re.path_=decodeURIComponent(re.path)}const y="v[A-Za-z0-9_]+",w=t.replace(/[.]/g,"\\."),T="(/([^?#]*).*)?$",C=new RegExp(`^https?://${w}/${y}/b/${s}/o${T}`,"i"),A={bucket:1,path:3},M=t===lS?"(?:storage.googleapis.com|storage.cloud.google.com)":t,D="([^?#]*)",H=new RegExp(`^https?://${M}/${s}/${D}`,"i"),K=[{regex:h,indices:f,postModify:a},{regex:C,indices:A,postModify:p},{regex:H,indices:{bucket:1,path:2},postModify:p}];for(let re=0;re<K.length;re++){const Ie=K[re],we=Ie.regex.exec(e);if(we){const O=we[Ie.indices.bucket];let S=we[Ie.indices.path];S||(S=""),r=new pn(O,S),Ie.postModify(r);break}}if(r==null)throw jb(e);return r}}class Gb{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kb(n,e,t){let r=1,s=null,a=null,u=!1,h=0;function f(){return h===2}let p=!1;function y(...D){p||(p=!0,e.apply(null,D))}function w(D){s=setTimeout(()=>{s=null,n(C,f())},D)}function T(){a&&clearTimeout(a)}function C(D,...H){if(p){T();return}if(D){T(),y.call(null,D,...H);return}if(f()||u){T(),y.call(null,D,...H);return}r<64&&(r*=2);let K;h===1?(h=2,K=0):K=(r+Math.random())*1e3,w(K)}let A=!1;function M(D){A||(A=!0,T(),!p&&(s!==null?(D||(h=2),clearTimeout(s),w(0)):D||(h=1)))}return w(0),a=setTimeout(()=>{u=!0,M(!0)},t),M}function Qb(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yb(n){return n!==void 0}function Xb(n){return typeof n=="object"&&!Array.isArray(n)}function ey(n){return typeof n=="string"||n instanceof String}function Qw(n){return ty()&&n instanceof Blob}function ty(){return typeof Blob<"u"}function fg(n,e,t,r){if(r<e)throw dg(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw dg(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sl(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function hS(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var uo;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(uo||(uo={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jb(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,a=e.indexOf(n)!==-1;return t||s||a}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zb{constructor(e,t,r,s,a,u,h,f,p,y,w,T=!0){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=a,this.additionalRetryCodes_=u,this.callback_=h,this.errorCallback_=f,this.timeout_=p,this.progressCallback_=y,this.connectionFactory_=w,this.retry=T,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((C,A)=>{this.resolve_=C,this.reject_=A,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new Lh(!1,null,!0));return}const a=this.connectionFactory_();this.pendingConnection_=a;const u=h=>{const f=h.loaded,p=h.lengthComputable?h.total:-1;this.progressCallback_!==null&&this.progressCallback_(f,p)};this.progressCallback_!==null&&a.addUploadProgressListener(u),a.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&a.removeUploadProgressListener(u),this.pendingConnection_=null;const h=a.getErrorCode()===uo.NO_ERROR,f=a.getStatus();if(!h||Jb(f,this.additionalRetryCodes_)&&this.retry){const y=a.getErrorCode()===uo.ABORT;r(!1,new Lh(!1,null,y));return}const p=this.successCodes_.indexOf(f)!==-1;r(!0,new Lh(p,a))})},t=(r,s)=>{const a=this.resolve_,u=this.reject_,h=s.connection;if(s.wasSuccessCode)try{const f=this.callback_(h,h.getResponse());Yb(f)?a(f):a()}catch(f){u(f)}else if(h!==null){const f=Z_();f.serverResponse=h.getErrorText(),this.errorCallback_?u(this.errorCallback_(h,f)):u(f)}else if(s.canceled){const f=this.appDelete_?cS():Ub();u(f)}else{const f=Fb();u(f)}};this.canceled_?t(!1,new Lh(!1,null,!0)):this.backoffId_=Kb(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Qb(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Lh{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function eL(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function tL(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function nL(n,e){e&&(n["X-Firebase-GMPID"]=e)}function rL(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function iL(n,e,t,r,s,a,u=!0){const h=hS(n.urlParams),f=n.url+h,p=Object.assign({},n.headers);return nL(p,e),eL(p,t),tL(p,a),rL(p,r),new Zb(f,n.method,p,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,u)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sL(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function oL(...n){const e=sL();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(ty())return new Blob(n);throw new gt(mt.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function aL(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lL(n){if(typeof atob>"u")throw Hb("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vr={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Tm{constructor(e,t){this.data=e,this.contentType=t||null}}function uL(n,e){switch(n){case Vr.RAW:return new Tm(dS(e));case Vr.BASE64:case Vr.BASE64URL:return new Tm(fS(n,e));case Vr.DATA_URL:return new Tm(hL(e),dL(e))}throw Z_()}function dS(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const a=r,u=n.charCodeAt(++t);r=65536|(a&1023)<<10|u&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function cL(n){let e;try{e=decodeURIComponent(n)}catch{throw Iu(Vr.DATA_URL,"Malformed data URL.")}return dS(e)}function fS(n,e){switch(n){case Vr.BASE64:{const s=e.indexOf("-")!==-1,a=e.indexOf("_")!==-1;if(s||a)throw Iu(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case Vr.BASE64URL:{const s=e.indexOf("+")!==-1,a=e.indexOf("/")!==-1;if(s||a)throw Iu(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=lL(e)}catch(s){throw s.message.includes("polyfill")?s:Iu(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}class pS{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Iu(Vr.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=fL(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function hL(n){const e=new pS(n);return e.base64?fS(Vr.BASE64,e.rest):cL(e.rest)}function dL(n){return new pS(n).contentType}function fL(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us{constructor(e,t){let r=0,s="";Qw(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(Qw(this.data_)){const r=this.data_,s=aL(r,e,t);return s===null?null:new us(s)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new us(r,!0)}}static getBlob(...e){if(ty()){const t=e.map(r=>r instanceof us?r.data_:r);return new us(oL.apply(null,t))}else{const t=e.map(u=>ey(u)?uL(Vr.RAW,u).data:u.data_);let r=0;t.forEach(u=>{r+=u.byteLength});const s=new Uint8Array(r);let a=0;return t.forEach(u=>{for(let h=0;h<u.length;h++)s[a++]=u[h]}),new us(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ny(n){let e;try{e=JSON.parse(n)}catch{return null}return Xb(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pL(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function mL(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function mS(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gL(n,e){return e}class dn{constructor(e,t,r,s){this.server=e,this.local=t||e,this.writable=!!r,this.xform=s||gL}}let Mh=null;function _L(n){return!ey(n)||n.length<2?n:mS(n)}function ry(){if(Mh)return Mh;const n=[];n.push(new dn("bucket")),n.push(new dn("generation")),n.push(new dn("metageneration")),n.push(new dn("name","fullPath",!0));function e(a,u){return _L(u)}const t=new dn("name");t.xform=e,n.push(t);function r(a,u){return u!==void 0?Number(u):u}const s=new dn("size");return s.xform=r,n.push(s),n.push(new dn("timeCreated")),n.push(new dn("updated")),n.push(new dn("md5Hash",null,!0)),n.push(new dn("cacheControl",null,!0)),n.push(new dn("contentDisposition",null,!0)),n.push(new dn("contentEncoding",null,!0)),n.push(new dn("contentLanguage",null,!0)),n.push(new dn("contentType",null,!0)),n.push(new dn("metadata","customMetadata",!0)),Mh=n,Mh}function yL(n,e){function t(){const r=n.bucket,s=n.fullPath,a=new pn(r,s);return e._makeStorageReference(a)}Object.defineProperty(n,"ref",{get:t})}function vL(n,e,t){const r={};r.type="file";const s=t.length;for(let a=0;a<s;a++){const u=t[a];r[u.local]=u.xform(r,e[u.server])}return yL(r,n),r}function gS(n,e,t){const r=ny(e);return r===null?null:vL(n,r,t)}function wL(n,e,t,r){const s=ny(e);if(s===null||!ey(s.downloadTokens))return null;const a=s.downloadTokens;if(a.length===0)return null;const u=encodeURIComponent;return a.split(",").map(p=>{const y=n.bucket,w=n.fullPath,T="/b/"+u(y)+"/o/"+u(w),C=sl(T,t,r),A=hS({alt:"media",token:p});return C+A})[0]}function EL(n,e){const t={},r=e.length;for(let s=0;s<r;s++){const a=e[s];a.writable&&(t[a.server]=n[a.local])}return JSON.stringify(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yw="prefixes",Xw="items";function TL(n,e,t){const r={prefixes:[],items:[],nextPageToken:t.nextPageToken};if(t[Yw])for(const s of t[Yw]){const a=s.replace(/\/$/,""),u=n._makeStorageReference(new pn(e,a));r.prefixes.push(u)}if(t[Xw])for(const s of t[Xw]){const a=n._makeStorageReference(new pn(e,s.name));r.items.push(a)}return r}function IL(n,e,t){const r=ny(t);return r===null?null:TL(n,e,r)}class ac{constructor(e,t,r,s){this.url=e,this.method=t,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iy(n){if(!n)throw Z_()}function _S(n,e){function t(r,s){const a=gS(n,s,e);return iy(a!==null),a}return t}function SL(n,e){function t(r,s){const a=IL(n,e,s);return iy(a!==null),a}return t}function CL(n,e){function t(r,s){const a=gS(n,s,e);return iy(a!==null),wL(a,s,n.host,n._protocol)}return t}function sy(n){function e(t,r){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=Mb():s=Lb():t.getStatus()===402?s=bb(n.bucket):t.getStatus()===403?s=Vb(n.path):s=r,s.status=t.getStatus(),s.serverResponse=r.serverResponse,s}return e}function oy(n){const e=sy(n);function t(r,s){let a=e(r,s);return r.getStatus()===404&&(a=Db(n.path)),a.serverResponse=s.serverResponse,a}return t}function RL(n,e,t){const r=e.fullServerUrl(),s=sl(r,n.host,n._protocol),a="GET",u=n.maxOperationRetryTime,h=new ac(s,a,_S(n,t),u);return h.errorHandler=oy(e),h}function kL(n,e,t,r,s){const a={};e.isRoot?a.prefix="":a.prefix=e.path+"/",t.length>0&&(a.delimiter=t),r&&(a.pageToken=r),s&&(a.maxResults=s);const u=e.bucketOnlyServerUrl(),h=sl(u,n.host,n._protocol),f="GET",p=n.maxOperationRetryTime,y=new ac(h,f,SL(n,e.bucket),p);return y.urlParams=a,y.errorHandler=sy(e),y}function AL(n,e,t){const r=e.fullServerUrl(),s=sl(r,n.host,n._protocol),a="GET",u=n.maxOperationRetryTime,h=new ac(s,a,CL(n,t),u);return h.errorHandler=oy(e),h}function PL(n,e){const t=e.fullServerUrl(),r=sl(t,n.host,n._protocol),s="DELETE",a=n.maxOperationRetryTime;function u(f,p){}const h=new ac(r,s,u,a);return h.successCodes=[200,204],h.errorHandler=oy(e),h}function NL(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function xL(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=NL(null,e)),r}function OL(n,e,t,r,s){const a=e.bucketOnlyServerUrl(),u={"X-Goog-Upload-Protocol":"multipart"};function h(){let K="";for(let re=0;re<2;re++)K=K+Math.random().toString().slice(2);return K}const f=h();u["Content-Type"]="multipart/related; boundary="+f;const p=xL(e,r,s),y=EL(p,t),w="--"+f+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+y+`\r
--`+f+`\r
Content-Type: `+p.contentType+`\r
\r
`,T=`\r
--`+f+"--",C=us.getBlob(w,r,T);if(C===null)throw Wb();const A={name:p.fullPath},M=sl(a,n.host,n._protocol),D="POST",H=n.maxUploadRetryTime,Z=new ac(M,D,_S(n,t),H);return Z.urlParams=A,Z.headers=u,Z.body=C.uploadData(),Z.errorHandler=sy(e),Z}class DL{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=uo.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=uo.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=uo.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,s){if(this.sent_)throw au("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(t,e,!0),s!==void 0)for(const a in s)s.hasOwnProperty(a)&&this.xhr_.setRequestHeader(a,s[a].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw au("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw au("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw au("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw au("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class bL extends DL{initXhr(){this.xhr_.responseType="text"}}function lc(){return new bL}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo{constructor(e,t){this._service=e,t instanceof pn?this._location=t:this._location=pn.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new yo(e,t)}get root(){const e=new pn(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return mS(this._location.path)}get storage(){return this._service}get parent(){const e=pL(this._location.path);if(e===null)return null;const t=new pn(this._location.bucket,e);return new yo(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw qb(e)}}function LL(n,e,t){n._throwIfRoot("uploadBytes");const r=OL(n.storage,n._location,ry(),new us(e,!0),t);return n.storage.makeRequestWithTokens(r,lc).then(s=>({metadata:s,ref:n}))}function ML(n){const e={prefixes:[],items:[]};return yS(n,e).then(()=>e)}async function yS(n,e,t){const s=await VL(n,{pageToken:t});e.prefixes.push(...s.prefixes),e.items.push(...s.items),s.nextPageToken!=null&&await yS(n,e,s.nextPageToken)}function VL(n,e){e!=null&&typeof e.maxResults=="number"&&fg("options.maxResults",1,1e3,e.maxResults);const t=e||{},r=kL(n.storage,n._location,"/",t.pageToken,t.maxResults);return n.storage.makeRequestWithTokens(r,lc)}function FL(n){n._throwIfRoot("getMetadata");const e=RL(n.storage,n._location,ry());return n.storage.makeRequestWithTokens(e,lc)}function UL(n){n._throwIfRoot("getDownloadURL");const e=AL(n.storage,n._location,ry());return n.storage.makeRequestWithTokens(e,lc).then(t=>{if(t===null)throw $b();return t})}function jL(n){n._throwIfRoot("deleteObject");const e=PL(n.storage,n._location);return n.storage.makeRequestWithTokens(e,lc)}function BL(n,e){const t=mL(n._location.path,e),r=new pn(n._location.bucket,t);return new yo(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zL(n){return/^[A-Za-z]+:\/\//.test(n)}function WL(n,e){return new yo(n,e)}function vS(n,e){if(n instanceof ay){const t=n;if(t._bucket==null)throw zb();const r=new yo(t,t._bucket);return e!=null?vS(r,e):r}else return e!==void 0?BL(n,e):n}function $L(n,e){if(e&&zL(e)){if(n instanceof ay)return WL(n,e);throw dg("To use ref(service, url), the first argument must be a Storage instance.")}else return vS(n,e)}function Jw(n,e){const t=e==null?void 0:e[uS];return t==null?null:pn.makeFromBucketSpec(t,n)}function HL(n,e,t,r={}){n.host=`${e}:${t}`,n._protocol="http";const{mockUserToken:s}=r;s&&(n._overrideAuthToken=typeof s=="string"?s:Rg(s,n.app.options.projectId))}class ay{constructor(e,t,r,s,a){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=a,this._bucket=null,this._host=lS,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=xb,this._maxUploadRetryTime=Ob,this._requests=new Set,s!=null?this._bucket=pn.makeFromBucketSpec(s,this._host):this._bucket=Jw(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=pn.makeFromBucketSpec(this._url,e):this._bucket=Jw(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){fg("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){fg("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(fn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new yo(this,e)}_makeRequest(e,t,r,s,a=!0){if(this._deleted)return new Gb(cS());{const u=iL(e,this._appId,r,s,t,this._firebaseVersion,a);return this._requests.add(u),u.getPromise().then(()=>this._requests.delete(u),()=>this._requests.delete(u)),u}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const Zw="@firebase/storage",eE="0.13.7";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wS="storage";function s5(n,e,t){return n=Oe(n),LL(n,e,t)}function o5(n){return n=Oe(n),FL(n)}function a5(n){return n=Oe(n),ML(n)}function l5(n){return n=Oe(n),UL(n)}function u5(n){return n=Oe(n),jL(n)}function c5(n,e){return n=Oe(n),$L(n,e)}function qL(n=Hu(),e){n=Oe(n);const r=Xa(n,wS).getImmediate({identifier:e}),s=Ld("storage");return s&&GL(r,...s),r}function GL(n,e,t,r={}){HL(n,e,t,r)}function KL(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new ay(t,r,s,e,Rs)}function QL(){Ci(new zr(wS,KL,"PUBLIC").setMultipleInstances(!0)),Nn(Zw,eE,""),Nn(Zw,eE,"esm2017")}QL();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YL="type.googleapis.com/google.protobuf.Int64Value",XL="type.googleapis.com/google.protobuf.UInt64Value";function ES(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function Nd(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>Nd(e));if(typeof n=="function"||typeof n=="object")return ES(n,e=>Nd(e));throw new Error("Data cannot be encoded in JSON: "+n)}function Ha(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case YL:case XL:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>Ha(e)):typeof n=="function"||typeof n=="object"?ES(n,e=>Ha(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ly="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tE={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Pn extends Ir{constructor(e,t,r){super(`${ly}/${e}`,t||""),this.details=r,Object.setPrototypeOf(this,Pn.prototype)}}function JL(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function xd(n,e){let t=JL(n),r=t,s;try{const a=e&&e.error;if(a){const u=a.status;if(typeof u=="string"){if(!tE[u])return new Pn("internal","internal");t=tE[u],r=u}const h=a.message;typeof h=="string"&&(r=h),s=a.details,s!==void 0&&(s=Ha(s))}}catch{}return t==="ok"?null:new Pn(t,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZL{constructor(e,t,r,s){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,fn(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=r.getImmediate({optional:!0}),this.auth||t.get().then(a=>this.auth=a,()=>{}),this.messaging||r.get().then(a=>this.messaging=a,()=>{}),this.appCheck||s==null||s.get().then(a=>this.appCheck=a,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pg="us-central1",eM=/^data: (.*?)(?:\n|$)/;function tM(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new Pn("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class nM{constructor(e,t,r,s,a=pg,u=(...h)=>fetch(...h)){this.app=e,this.fetchImpl=u,this.emulatorOrigin=null,this.contextProvider=new ZL(e,t,r,s),this.cancelAllRequests=new Promise(h=>{this.deleteService=()=>Promise.resolve(h())});try{const h=new URL(a);this.customDomain=h.origin+(h.pathname==="/"?"":h.pathname),this.region=pg}catch{this.customDomain=null,this.region=a}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function rM(n,e,t){n.emulatorOrigin=`http://${e}:${t}`}function iM(n,e,t){const r=s=>oM(n,e,s,{});return r.stream=(s,a)=>lM(n,e,s,a),r}async function sM(n,e,t,r){t["Content-Type"]="application/json";let s;try{s=await r(n,{method:"POST",body:JSON.stringify(e),headers:t})}catch{return{status:0,json:null}}let a=null;try{a=await s.json()}catch{}return{status:s.status,json:a}}async function TS(n,e){const t={},r=await n.contextProvider.getContext(e.limitedUseAppCheckTokens);return r.authToken&&(t.Authorization="Bearer "+r.authToken),r.messagingToken&&(t["Firebase-Instance-ID-Token"]=r.messagingToken),r.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=r.appCheckToken),t}function oM(n,e,t,r){const s=n._url(e);return aM(n,s,t,r)}async function aM(n,e,t,r){t=Nd(t);const s={data:t},a=await TS(n,r),u=r.timeout||7e4,h=tM(u),f=await Promise.race([sM(e,s,a,n.fetchImpl),h.promise,n.cancelAllRequests]);if(h.cancel(),!f)throw new Pn("cancelled","Firebase Functions instance was deleted.");const p=xd(f.status,f.json);if(p)throw p;if(!f.json)throw new Pn("internal","Response is not valid JSON object.");let y=f.json.data;if(typeof y>"u"&&(y=f.json.result),typeof y>"u")throw new Pn("internal","Response is missing data field.");return{data:Ha(y)}}function lM(n,e,t,r){const s=n._url(e);return uM(n,s,t,r||{})}async function uM(n,e,t,r){var s;t=Nd(t);const a={data:t},u=await TS(n,r);u["Content-Type"]="application/json",u.Accept="text/event-stream";let h;try{h=await n.fetchImpl(e,{method:"POST",body:JSON.stringify(a),headers:u,signal:r==null?void 0:r.signal})}catch(C){if(C instanceof Error&&C.name==="AbortError"){const M=new Pn("cancelled","Request was cancelled.");return{data:Promise.reject(M),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(M)}}}}}}const A=xd(0,null);return{data:Promise.reject(A),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(A)}}}}}}let f,p;const y=new Promise((C,A)=>{f=C,p=A});(s=r==null?void 0:r.signal)===null||s===void 0||s.addEventListener("abort",()=>{const C=new Pn("cancelled","Request was cancelled.");p(C)});const w=h.body.getReader(),T=cM(w,f,p,r==null?void 0:r.signal);return{stream:{[Symbol.asyncIterator](){const C=T.getReader();return{async next(){const{value:A,done:M}=await C.read();return{value:A,done:M}},async return(){return await C.cancel(),{done:!0,value:void 0}}}}},data:y}}function cM(n,e,t,r){const s=(u,h)=>{const f=u.match(eM);if(!f)return;const p=f[1];try{const y=JSON.parse(p);if("result"in y){e(Ha(y.result));return}if("message"in y){h.enqueue(Ha(y.message));return}if("error"in y){const w=xd(0,y);h.error(w),t(w);return}}catch(y){if(y instanceof Pn){h.error(y),t(y);return}}},a=new TextDecoder;return new ReadableStream({start(u){let h="";return f();async function f(){if(r!=null&&r.aborted){const p=new Pn("cancelled","Request was cancelled");return u.error(p),t(p),Promise.resolve()}try{const{value:p,done:y}=await n.read();if(y){h.trim()&&s(h.trim(),u),u.close();return}if(r!=null&&r.aborted){const T=new Pn("cancelled","Request was cancelled");u.error(T),t(T),await n.cancel();return}h+=a.decode(p,{stream:!0});const w=h.split(`
`);h=w.pop()||"";for(const T of w)T.trim()&&s(T.trim(),u);return f()}catch(p){const y=p instanceof Pn?p:xd(0,null);u.error(y),t(y)}}},cancel(){return n.cancel()}})}const nE="@firebase/functions",rE="0.12.3";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hM="auth-internal",dM="app-check-internal",fM="messaging-internal";function pM(n){const e=(t,{instanceIdentifier:r})=>{const s=t.getProvider("app").getImmediate(),a=t.getProvider(hM),u=t.getProvider(fM),h=t.getProvider(dM);return new nM(s,a,u,h,r)};Ci(new zr(ly,e,"PUBLIC").setMultipleInstances(!0)),Nn(nE,rE,n),Nn(nE,rE,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mM(n=Hu(),e=pg){const r=Xa(Oe(n),ly).getImmediate({identifier:e}),s=Ld("functions");return s&&gM(r,...s),r}function gM(n,e,t){rM(Oe(n),e,t)}function h5(n,e,t){return iM(Oe(n),e)}pM();const _M={apiKey:"AIzaSyCdc_SdyFRbNFIw3KqJcQQ19ALfW3pLIts",authDomain:"neuinternshipdb.firebaseapp.com",databaseURL:"https://neuinternshipdb-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"neuinternshipdb",storageBucket:"neuinternshipdb.firebasestorage.app",messagingSenderId:"918910739132",appId:"1:918910739132:web:bacbcd219ee7228542a6b9"},uc=ME(_M),lo=VO(uc),uy=sx(uc),yM=Ab(uc),vM=qL(uc),wM=mM(uc,"us-central1"),d5=Object.freeze(Object.defineProperty({__proto__:null,auth:lo,db:uy,functions:wM,realtimeDb:yM,storage:vM},Symbol.toStringTag,{value:"Module"})),EM="/assets/InternQuest_with_text_white-BwdXX65T.png",cy="internquest_admin_session",TM=1e3*60*60*12,hy=()=>typeof window<"u"&&typeof window.localStorage<"u",IS=(n={})=>{if(!hy())return;const e={...n,createdAt:Date.now(),expiresAt:Date.now()+TM};window.localStorage.setItem(cy,JSON.stringify(e))},Fu=()=>{hy()&&window.localStorage.removeItem(cy)},Uu=()=>{if(!hy())return null;const n=window.localStorage.getItem(cy);if(!n)return null;try{const e=JSON.parse(n);return!e.expiresAt||e.expiresAt<Date.now()?(Fu(),null):e}catch{return Fu(),null}},pu=()=>!!Uu(),ju=()=>{const n=Uu(),e=(n==null?void 0:n.role)||null;return e==="super_admin"?"admin":e},SS=n=>ju()===n,vf=n=>{const e=ju();return n.includes(e)},vt={SUPER_ADMIN:"admin",COORDINATOR:"coordinator",ADVISER:"adviser"},f5=()=>vf([vt.SUPER_ADMIN,vt.COORDINATOR]),p5=()=>SS(vt.SUPER_ADMIN),m5=()=>vf([vt.SUPER_ADMIN,vt.COORDINATOR]),g5=()=>SS(vt.ADVISER),_5=()=>vf([vt.SUPER_ADMIN,vt.COORDINATOR]),y5=()=>{const n=Uu();return(n==null?void 0:n.college_code)||null},CS=()=>{const n=vg(),e=Hr(),t=W.useRef(null),[r,s]=W.useState(!1),[a,u]=W.useState(!1),[h,f]=W.useState({username:"",password:""}),[p,y]=W.useState(""),[w,T]=W.useState(""),[C,A]=W.useState({username:"",password:""}),[M,D]=W.useState({username:!1,password:!1});W.useEffect(()=>{document.title="Login",t.current&&t.current.focus()},[]);const H=S=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S),Z=S=>S.trim()?"":"Username is required",K=S=>S.trim()?"":"Password is required",re=S=>{const{name:R,value:N}=S.target;p&&y(""),C[R]&&A(b=>({...b,[R]:""})),f(b=>({...b,[R]:N}))},Ie=S=>{const{name:R,value:N}=S.target;if(D(b=>({...b,[R]:!0})),R==="username"){const b=Z(N);A(F=>({...F,username:b}))}else if(R==="password"){const b=K(N);A(F=>({...F,password:b}))}},we=()=>{s(S=>!S)};W.useEffect(()=>{const S=e.state;S!=null&&S.passwordChanged&&(y(""),T(S.message||"Password changed successfully. Please log in with your new password."))},[e]),W.useEffect(()=>{if(pu()){const S=ju(),R=S==="super_admin"?"admin":S;R===vt.ADVISER||R==="adviser"?n("/StudentDashboard",{replace:!0}):n("/dashboard",{replace:!0})}},[n]);const O=async S=>{S.preventDefault();const R=h.username.trim(),N=h.password.trim(),b=Z(R),F=K(N);if(A({username:b,password:F}),D({username:!0,password:!0}),b||F){y("Please correct the errors above");return}u(!0),y(""),A({username:"",password:""});try{const P=ix(uy,"adminusers");let ze=null,Xe=null;const Dt=px(P,mx("username","==",R)),qe=vx(Dt),ie=new Promise((q,le)=>setTimeout(()=>le(new Error("Request timeout. Please check your connection and try again.")),3e4)),ge=await Promise.race([qe,ie]);if(ge.empty||(ze=ge.docs[0],Xe=ze.data()),!ze||!Xe){y("Invalid username or password"),A({username:"Invalid username or password",password:"Invalid username or password"}),u(!1);return}if(!Xe.firebaseEmail){y("Admin account not properly configured with Firebase authentication. Please contact administrator."),u(!1);return}const ae=Xe.firebaseEmail.trim();if(!ae||!H(ae)){y("Admin account has invalid Firebase email configuration. Please contact administrator."),u(!1);return}if(!N||N.length===0){y("Password cannot be empty."),u(!1);return}try{const q=T3(lo,ae,N),le=new Promise((ke,Ae)=>setTimeout(()=>Ae(new Error("Authentication timeout. Please check your connection and try again.")),3e4));await Promise.race([q,le])}catch(q){console.error("Firebase Auth sign-in error:",{code:q.code,message:q.message,email:ae});let le="";q.code==="auth/user-disabled"?le="This account has been disabled. Please contact administrator.":q.code==="auth/invalid-credential"||q.code==="auth/wrong-password"?le="Invalid username or password":q.code==="auth/invalid-email"?le="Invalid email format in Firebase Auth. Please contact administrator.":q.code==="auth/user-not-found"?le="Firebase Auth account not found. Please contact administrator to create your Firebase authentication account.":q.code==="auth/network-request-failed"?le="Network error. Please check your connection and try again.":q.code==="auth/invalid-password"?le="Invalid password format. Please contact administrator.":q.code==="auth/missing-password"?le="Password is required for authentication.":le=`Firebase authentication failed. ${q.message||q.code||"Unknown error"}. Please contact administrator.`,y(le),A({username:le==="Invalid username or password"?"Invalid username or password":"",password:le==="Invalid username or password"?"Invalid username or password":""}),u(!1);return}let V=Xe.role||"adviser";V==="super_admin"&&(V="admin"),IS({username:R,role:V,adminId:ze.id,college_code:Xe.college_code||null,sections:Xe.sections||(Xe.section?[Xe.section]:[]),mustChangePassword:Xe.mustChangePassword||!1}),V==="adviser"||V===vt.ADVISER?n("/StudentDashboard",{replace:!0}):n("/dashboard",{replace:!0})}catch(P){console.error("Login error:",P);const ze=P.message||"An unexpected error occurred. Please try again.";ze.includes("timeout")||ze.includes("Request timeout")||ze.includes("Authentication timeout")?y(ze):P.code==="auth/network-request-failed"?y("Network error. Please check your internet connection and try again."):y(`Login failed: ${ze}`),A({username:"",password:""})}finally{u(!1)}};return Q.jsxs("div",{className:"login-page",children:[Q.jsx("a",{href:"#login-form",className:"skip-link",style:{position:"absolute",top:"-40px",left:0,background:"#1976d2",color:"#fff",padding:"8px 16px",textDecoration:"none",zIndex:1e4,borderRadius:"0 0 4px 0",fontWeight:500,transition:"top 0.2s"},onFocus:S=>S.target.style.top="0",onBlur:S=>S.target.style.top="-40px",children:"Skip to login form"}),Q.jsxs("div",{className:"login-container",children:[Q.jsx("div",{className:"left-container",children:Q.jsx("img",{src:EM,alt:"InternQuest Logo",className:"brand-logo"})}),Q.jsx("div",{className:"right-container",children:Q.jsxs("div",{className:"login-card",children:[Q.jsx("h1",{children:"Management System"}),Q.jsxs("form",{id:"login-form",className:"login-form",onSubmit:O,autoComplete:"off","aria-label":"Admin login form",children:[p&&Q.jsx("div",{className:"error-message",role:"alert",children:p}),w&&Q.jsx("div",{className:"success-message",role:"alert",children:w}),Q.jsxs("div",{className:"form-group",children:[Q.jsx("label",{htmlFor:"username-input",children:"Username"}),Q.jsx("input",{ref:t,id:"username-input",type:"text",name:"username",placeholder:"Enter your username",className:`form-input ${M.username&&C.username?"error":""} ${M.username&&!C.username&&h.username?"success":""}`,value:h.username,onChange:re,onBlur:Ie,disabled:a,autoComplete:"username","aria-required":"true","aria-invalid":M.username&&C.username?"true":"false","aria-describedby":M.username&&C.username?"username-error":void 0}),M.username&&C.username&&Q.jsx("span",{id:"username-error",className:"field-error",role:"alert",children:C.username})]}),Q.jsxs("div",{className:"form-group",children:[Q.jsx("label",{htmlFor:"password-input",children:"Password"}),Q.jsxs("div",{className:"password-input-container",children:[Q.jsx("input",{id:"password-input",type:r?"text":"password",name:"password",placeholder:"Enter your password",className:`form-input ${M.password&&C.password?"error":""} ${M.password&&!C.password&&h.password?"success":""}`,value:h.password,onChange:re,onBlur:Ie,disabled:a,autoComplete:"current-password","aria-required":"true","aria-invalid":M.password&&C.password?"true":"false","aria-describedby":M.password&&C.password?"password-error":void 0}),Q.jsx("button",{type:"button",className:"password-toggle",onClick:we,tabIndex:0,"aria-label":r?"Hide password":"Show password",children:r?Q.jsx(Ck,{}):Q.jsx(Rk,{})})]}),M.password&&C.password&&Q.jsx("span",{id:"password-error",className:"field-error",role:"alert",children:C.password})]}),Q.jsxs("button",{type:"submit",className:`sign-in-button${a?" loading":""}`,disabled:a,"aria-busy":a,children:[Q.jsx("span",{className:"button-text",children:a?"Signing in...":"Sign in"}),a&&Q.jsx("span",{className:"button-spinner","aria-hidden":"true"})]}),Q.jsx("div",{className:"forgot-password-link",children:Q.jsx(Sg,{to:"/forgot-password",className:"forgot-password-text",children:"Forgot password?"})})]})]})})]})]})};CS.propTypes={};const IM=5*60*1e3,SM=(n=!0)=>{const e=W.useRef(null),t=()=>{n&&(e.current&&clearTimeout(e.current),e.current=setTimeout(async()=>{try{await zI(lo)}catch(r){console.error("Logout error during idle timeout:",r)}finally{Fu(),window.location.href="/"}},IM))};W.useEffect(()=>{if(!n){e.current&&(clearTimeout(e.current),e.current=null);return}const r=["mousedown","mousemove","keypress","scroll","touchstart","click"];return r.forEach(s=>{document.addEventListener(s,t,!0)}),t(),()=>{r.forEach(s=>{document.removeEventListener(s,t,!0)}),e.current&&(clearTimeout(e.current),e.current=null)}},[n])};function v5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 176v160m80-80H176"},child:[]}]})(n)}function w5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 112v288m144-144H112"},child:[]}]})(n)}function E5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 112v288m144-144H112"},child:[]}]})(n)}function T5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M250.26 166.05 256 288l5.73-121.95a5.74 5.74 0 0 0-5.79-6h0a5.74 5.74 0 0 0-5.68 6z"},child:[]},{tag:"path",attr:{d:"M256 367.91a20 20 0 1 1 20-20 20 20 0 0 1-20 20z"},child:[]}]})(n)}function CM(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm0 319.91a20 20 0 1 1 20-20 20 20 0 0 1-20 20zm21.72-201.15-5.74 122a16 16 0 0 1-32 0l-5.74-121.94v-.05a21.74 21.74 0 1 1 43.44 0z"},child:[]}]})(n)}function I5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"80",height:"80",x:"64",y:"64",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"216",y:"64",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"368",y:"64",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"64",y:"216",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"216",y:"216",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"368",y:"216",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"64",y:"368",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"216",y:"368",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"rect",attr:{width:"80",height:"80",x:"368",y:"368",fill:"none",strokeMiterlimit:"10",strokeWidth:"32",rx:"40",ry:"40"},child:[]}]})(n)}function S5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M80 152v256a40.12 40.12 0 0 0 40 40h272a40.12 40.12 0 0 0 40-40V152"},child:[]},{tag:"rect",attr:{width:"416",height:"80",x:"48",y:"64",fill:"none",strokeLinejoin:"round",strokeWidth:"32",rx:"28",ry:"28"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m320 304-64 64-64-64m64 41.89V224"},child:[]}]})(n)}function C5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M216.08 192v143.85a40.08 40.08 0 0 0 80.15 0l.13-188.55a67.94 67.94 0 1 0-135.87 0v189.82a95.51 95.51 0 1 0 191 0V159.74"},child:[]}]})(n)}function R5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"circle",attr:{cx:"256",cy:"256",r:"208",fill:"none",strokeMiterlimit:"10",strokeWidth:"32"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"m108.92 108.92 294.16 294.16"},child:[]}]})(n)}function k5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 160c16-63.16 76.43-95.41 208-96a15.94 15.94 0 0 1 16 16v288a16 16 0 0 1-16 16c-128 0-177.45 25.81-208 64-30.37-38-80-64-208-64-9.88 0-16-8.05-16-17.93V80a15.94 15.94 0 0 1 16-16c131.57.59 192 32.84 208 96zm0 0v288"},child:[]}]})(n)}function A5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"448",height:"320",x:"32",y:"128",fill:"none",strokeLinejoin:"round",strokeWidth:"32",rx:"48",ry:"48"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M144 128V96a32 32 0 0 1 32-32h160a32 32 0 0 1 32 32v32m112 112H32m288 0v24a8 8 0 0 1-8 8H200a8 8 0 0 1-8-8v-24"},child:[]}]})(n)}function P5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M176 416v64M80 32h192a32 32 0 0 1 32 32v412a4 4 0 0 1-4 4H48h0V64a32 32 0 0 1 32-32zm240 160h112a32 32 0 0 1 32 32v256h0-160 0V208a16 16 0 0 1 16-16z"},child:[]},{tag:"path",attr:{d:"M98.08 431.87a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm80 240a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm80 320a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zm0-80a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79z"},child:[]},{tag:"ellipse",attr:{cx:"256",cy:"176",rx:"15.95",ry:"16.03",transform:"rotate(-45 255.99 175.996)"},child:[]},{tag:"path",attr:{d:"M258.08 111.87a16 16 0 1 1 13.79-13.79 16 16 0 0 1-13.79 13.79zM400 400a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm0-80a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm0-80a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm-64 160a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm0-80a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm0-80a16 16 0 1 0 16 16 16 16 0 0 0-16-16z"},child:[]}]})(n)}function N5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"416",height:"384",x:"48",y:"80",fill:"none",strokeLinejoin:"round",strokeWidth:"32",rx:"48"},child:[]},{tag:"circle",attr:{cx:"296",cy:"232",r:"24"},child:[]},{tag:"circle",attr:{cx:"376",cy:"232",r:"24"},child:[]},{tag:"circle",attr:{cx:"296",cy:"312",r:"24"},child:[]},{tag:"circle",attr:{cx:"376",cy:"312",r:"24"},child:[]},{tag:"circle",attr:{cx:"136",cy:"312",r:"24"},child:[]},{tag:"circle",attr:{cx:"216",cy:"312",r:"24"},child:[]},{tag:"circle",attr:{cx:"136",cy:"392",r:"24"},child:[]},{tag:"circle",attr:{cx:"216",cy:"392",r:"24"},child:[]},{tag:"circle",attr:{cx:"296",cy:"392",r:"24"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M128 48v32m256-32v32"},child:[]},{tag:"path",attr:{fill:"none",strokeLinejoin:"round",strokeWidth:"32",d:"M464 160H48"},child:[]}]})(n)}function x5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M451 374c-15.88-16-54.34-39.35-73-48.76-24.3-12.24-26.3-13.24-45.4.95-12.74 9.47-21.21 17.93-36.12 14.75s-47.31-21.11-75.68-49.39-47.34-61.62-50.53-76.48 5.41-23.23 14.79-36c13.22-18 12.22-21 .92-45.3-8.81-18.9-32.84-57-48.9-72.8C119.9 44 119.9 47 108.83 51.6A160.15 160.15 0 0 0 83 65.37C67 76 58.12 84.83 51.91 98.1s-9 44.38 23.07 102.64 54.57 88.05 101.14 134.49S258.5 406.64 310.85 436c64.76 36.27 89.6 29.2 102.91 23s22.18-15 32.83-31a159.09 159.09 0 0 0 13.8-25.8C465 391.17 468 391.17 451 374z"},child:[]}]})(n)}function O5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M352 176 217.6 336 160 272"},child:[]}]})(n)}function D5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29-134.4 160a16 16 0 0 1-12 5.71h-.27a16 16 0 0 1-11.89-5.3l-57.6-64a16 16 0 1 1 23.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0 1 24.5 20.58z"},child:[]}]})(n)}function b5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"48",d:"m112 184 144 144 144-144"},child:[]}]})(n)}function L5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"48",d:"m112 328 144-144 144 144"},child:[]}]})(n)}function M5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 1 1-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 0 1-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0 1 22.62-22.62L256 233.37l52.69-52.68a16 16 0 0 1 22.62 22.62L278.63 256z"},child:[]}]})(n)}function V5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M368 368 144 144m224 0L144 368"},child:[]}]})(n)}function F5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"m289.94 256 95-95A24 24 0 0 0 351 127l-95 95-95-95a24 24 0 0 0-34 34l95 95-95 95a24 24 0 1 0 34 34l95-95 95 95a24 24 0 0 0 34-34z"},child:[]}]})(n)}function U5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M93.72 183.25C49.49 198.05 16 233.1 16 288c0 66 54 112 120 112h184.37m147.45-22.26C485.24 363.3 496 341.61 496 312c0-59.82-53-85.76-96-88-8.89-89.54-71-144-144-144-26.16 0-48.79 6.93-67.6 18.14"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 448 64 64"},child:[]}]})(n)}function j5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69 0-113.44 45.79-128 91.2-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m320 255.79-64-64-64 64m64 192.42V207.79"},child:[]}]})(n)}function B5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinejoin:"round",strokeWidth:"32",d:"M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 56v120a32 32 0 0 0 32 32h120"},child:[]}]})(n)}function z5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinejoin:"round",strokeWidth:"32",d:"M416 221.25V416a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V96a48 48 0 0 1 48-48h98.75a32 32 0 0 1 22.62 9.37l141.26 141.26a32 32 0 0 1 9.37 22.62z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 56v120a32 32 0 0 0 32 32h120m-232 80h160m-160 80h160"},child:[]}]})(n)}function W5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M336 176h40a40 40 0 0 1 40 40v208a40 40 0 0 1-40 40H136a40 40 0 0 1-40-40V216a40 40 0 0 1 40-40h40"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m176 272 80 80 80-80M256 48v288"},child:[]}]})(n)}function $5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"circle",attr:{cx:"256",cy:"256",r:"48"},child:[]},{tag:"circle",attr:{cx:"256",cy:"416",r:"48"},child:[]},{tag:"circle",attr:{cx:"256",cy:"96",r:"48"},child:[]}]})(n)}function H5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 0 0-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 0 0 0-17.47C428.89 172.28 347.8 112 255.66 112z"},child:[]},{tag:"circle",attr:{cx:"256",cy:"256",r:"80",fill:"none",strokeMiterlimit:"10",strokeWidth:"32"},child:[]}]})(n)}function q5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M32 144h448M112 256h288M208 368h96"},child:[]}]})(n)}function G5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M440 432H72a40 40 0 0 1-40-40V120a40 40 0 0 1 40-40h75.89a40 40 0 0 1 22.19 6.72l27.84 18.56a40 40 0 0 0 22.19 6.72H440a40 40 0 0 1 40 40v240a40 40 0 0 1-40 40zM32 192h448"},child:[]}]})(n)}function K5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 48C141.13 48 48 141.13 48 256s93.13 208 208 208 208-93.13 208-208S370.87 48 256 48z"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 48c-58.07 0-112.67 93.13-112.67 208S197.93 464 256 464s112.67-93.13 112.67-208S314.07 48 256 48z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M117.33 117.33c38.24 27.15 86.38 43.34 138.67 43.34s100.43-16.19 138.67-43.34m0 277.34c-38.24-27.15-86.38-43.34-138.67-43.34s-100.43 16.19-138.67 43.34"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 48v416m208-208H48"},child:[]}]})(n)}function Q5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M277.42 247a24.68 24.68 0 0 0-4.08-5.47L255 223.44a21.63 21.63 0 0 0-6.56-4.57 20.93 20.93 0 0 0-23.28 4.27c-6.36 6.26-18 17.68-39 38.43C146 301.3 71.43 367.89 37.71 396.29a16 16 0 0 0-1.09 23.54l39 39.43a16.13 16.13 0 0 0 23.67-.89c29.24-34.37 96.3-109 136-148.23 20.39-20.06 31.82-31.58 38.29-37.94a21.76 21.76 0 0 0 3.84-25.2zm201.01-46-34.31-34a5.44 5.44 0 0 0-4-1.59 5.59 5.59 0 0 0-4 1.59h0a11.41 11.41 0 0 1-9.55 3.27c-4.48-.49-9.25-1.88-12.33-4.86-7-6.86 1.09-20.36-5.07-29a242.88 242.88 0 0 0-23.08-26.72c-7.06-7-34.81-33.47-81.55-52.53a123.79 123.79 0 0 0-47-9.24c-26.35 0-46.61 11.76-54 18.51-5.88 5.32-12 13.77-12 13.77a91.29 91.29 0 0 1 10.81-3.2 79.53 79.53 0 0 1 23.28-1.49C241.19 76.8 259.94 84.1 270 92c16.21 13 23.18 30.39 24.27 52.83.8 16.69-15.23 37.76-30.44 54.94a7.85 7.85 0 0 0 .4 10.83l21.24 21.23a8 8 0 0 0 11.14.1c13.93-13.51 31.09-28.47 40.82-34.46s17.58-7.68 21.35-8.09a35.71 35.71 0 0 1 21.3 4.62 13.65 13.65 0 0 1 3.08 2.38c6.46 6.56 6.07 17.28-.5 23.74l-2 1.89a5.5 5.5 0 0 0 0 7.84l34.31 34a5.5 5.5 0 0 0 4 1.58 5.65 5.65 0 0 0 4-1.58L478.43 209a5.82 5.82 0 0 0 0-8z"},child:[]}]})(n)}function Y5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 80a176 176 0 1 0 176 176A176 176 0 0 0 256 80z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"28",d:"M200 202.29s.84-17.5 19.57-32.57C230.68 160.77 244 158.18 256 158c10.93-.14 20.69 1.67 26.53 4.45 10 4.76 29.47 16.38 29.47 41.09 0 26-17 37.81-36.37 50.8S251 281.43 251 296"},child:[]},{tag:"circle",attr:{cx:"250",cy:"348",r:"20"},child:[]}]})(n)}function X5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"416",height:"352",x:"48",y:"80",fill:"none",strokeLinejoin:"round",strokeWidth:"32",rx:"48",ry:"48"},child:[]},{tag:"circle",attr:{cx:"336",cy:"176",r:"32",fill:"none",strokeMiterlimit:"10",strokeWidth:"32"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m304 335.79-90.66-90.49a32 32 0 0 0-43.87-1.3L48 352m176 80 123.34-123.34a32 32 0 0 1 43.11-2L464 368"},child:[]}]})(n)}function J5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 1 1-26 26 26 26 0 0 1 26-26zm48 226h-88a16 16 0 0 1 0-32h28v-88h-16a16 16 0 0 1 0-32h32a16 16 0 0 1 16 16v104h28a16 16 0 0 1 0 32z"},child:[]}]})(n)}function Z5(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinejoin:"round",strokeWidth:"32",d:"M218.1 167.17c0 13 0 25.6 4.1 37.4-43.1 50.6-156.9 184.3-167.5 194.5a20.17 20.17 0 0 0-6.7 15c0 8.5 5.2 16.7 9.6 21.3 6.6 6.9 34.8 33 40 28 15.4-15 18.5-19 24.8-25.2 9.5-9.3-1-28.3 2.3-36s6.8-9.2 12.5-10.4 15.8 2.9 23.7 3c8.3.1 12.8-3.4 19-9.2 5-4.6 8.6-8.9 8.7-15.6.2-9-12.8-20.9-3.1-30.4s23.7 6.2 34 5 22.8-15.5 24.1-21.6-11.7-21.8-9.7-30.7c.7-3 6.8-10 11.4-11s25 6.9 29.6 5.9c5.6-1.2 12.1-7.1 17.4-10.4 15.5 6.7 29.6 9.4 47.7 9.4 68.5 0 124-53.4 124-119.2S408.5 48 340 48s-121.9 53.37-121.9 119.17zM400 144a32 32 0 1 1-32-32 32 32 0 0 1 32 32z"},child:[]}]})(n)}function e9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 48c-79.5 0-144 61.39-144 137 0 87 96 224.87 131.25 272.49a15.77 15.77 0 0 0 25.5 0C304 409.89 400 272.07 400 185c0-75.61-64.5-137-144-137z"},child:[]},{tag:"circle",attr:{cx:"256",cy:"192",r:"48",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32"},child:[]}]})(n)}function t9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M336 208v-95a80 80 0 0 0-160 0v95"},child:[]},{tag:"rect",attr:{width:"320",height:"272",x:"96",y:"208",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"48",ry:"48"},child:[]}]})(n)}function n9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40m64 160 80-80-80-80m-192 80h256"},child:[]}]})(n)}function r9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"416",height:"320",x:"48",y:"96",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"40",ry:"40"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m112 160 144 112 144-112"},child:[]}]})(n)}function i9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M80 160h352M80 256h352M80 352h352"},child:[]}]})(n)}function s9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M427.68 351.43C402 320 383.87 304 383.87 217.35 383.87 138 343.35 109.73 310 96c-4.43-1.82-8.6-6-9.95-10.55C294.2 65.54 277.8 48 256 48s-38.21 17.55-44 37.47c-1.35 4.6-5.52 8.71-9.95 10.53-33.39 13.75-73.87 41.92-73.87 121.35C128.13 304 110 320 84.32 351.43 73.68 364.45 83 384 101.61 384h308.88c18.51 0 27.77-19.61 17.19-32.57zM320 384v16a64 64 0 0 1-128 0v-16"},child:[]}]})(n)}function o9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M384 224v184a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V168a40 40 0 0 1 40-40h167.48M336 64h112v112M224 288 440 72"},child:[]}]})(n)}function a9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m53.12 199.94 400-151.39a8 8 0 0 1 10.33 10.33l-151.39 400a8 8 0 0 1-15-.34l-67.4-166.09a16 16 0 0 0-10.11-10.11L53.46 215a8 8 0 0 1-.34-15.06zM460 52 227 285"},child:[]}]})(n)}function l9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M364.13 125.25 87 403l-23 45 44.99-23 277.76-277.13-22.62-22.62zm56.56-56.56-22.62 22.62 22.62 22.63 22.62-22.63a16 16 0 0 0 0-22.62h0a16 16 0 0 0-22.62 0z"},child:[]}]})(n)}function u9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M256 464c-114.69 0-208-93.31-208-208S141.31 48 256 48s208 93.31 208 208-93.31 208-208 208zm0-384c-97 0-176 79-176 176s79 176 176 176 176-78.95 176-176S353.05 80 256 80z"},child:[]},{tag:"path",attr:{d:"M323.67 292c-17.4 0-34.21-7.72-47.34-21.73a83.76 83.76 0 0 1-22-51.32c-1.47-20.7 4.88-39.75 17.88-53.62S303.38 144 323.67 144c20.14 0 38.37 7.62 51.33 21.46s19.47 33 18 53.51a84 84 0 0 1-22 51.3C357.86 284.28 341.06 292 323.67 292zm55.81-74zm-215.66 77.36c-29.76 0-55.93-27.51-58.33-61.33-1.23-17.32 4.15-33.33 15.17-45.08s26.22-18 43.15-18 32.12 6.44 43.07 18.14 16.5 27.82 15.25 45c-2.44 33.77-28.6 61.27-58.31 61.27zm256.55 59.92c-1.59-4.7-5.46-9.71-13.22-14.46-23.46-14.33-52.32-21.91-83.48-21.91-30.57 0-60.23 7.9-83.53 22.25-26.25 16.17-43.89 39.75-51 68.18-1.68 6.69-4.13 19.14-1.51 26.11a192.18 192.18 0 0 0 232.75-80.17zm-256.74 46.09c7.07-28.21 22.12-51.73 45.47-70.75a8 8 0 0 0-2.59-13.77c-12-3.83-25.7-5.88-42.69-5.88-23.82 0-49.11 6.45-68.14 18.17-5.4 3.33-10.7 4.61-14.78 5.75a192.84 192.84 0 0 0 77.78 86.64l1.79-.14a102.82 102.82 0 0 1 3.16-20.02z"},child:[]}]})(n)}function c9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M402 168c-2.93 40.67-33.1 72-66 72s-63.12-31.32-66-72c-3-42.31 26.37-72 66-72s69 30.46 66 72z"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M336 304c-65.17 0-127.84 32.37-143.54 95.41-2.08 8.34 3.15 16.59 11.72 16.59h263.65c8.57 0 13.77-8.25 11.72-16.59C463.85 335.36 401.18 304 336 304z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M200 185.94c-2.34 32.48-26.72 58.06-53 58.06s-50.7-25.57-53-58.06C91.61 152.15 115.34 128 147 128s55.39 24.77 53 57.94z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M206 306c-18.05-8.27-37.93-11.45-59-11.45-52 0-102.1 25.85-114.65 76.2-1.65 6.66 2.53 13.25 9.37 13.25H154"},child:[]}]})(n)}function h9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M376 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M288 304c-87 0-175.3 48-191.64 138.6-2 10.92 4.21 21.4 15.65 21.4H464c11.44 0 17.62-10.48 15.65-21.4C463.3 352 375 304 288 304z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M88 176v112m56-56H32"},child:[]}]})(n)}function d9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z"},child:[]}]})(n)}function f9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M376 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z"},child:[]},{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M288 304c-87 0-175.3 48-191.64 138.6-2 10.92 4.21 21.4 15.65 21.4H464c11.44 0 17.62-10.48 15.65-21.4C463.3 352 375 304 288 304z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M144 232H32"},child:[]}]})(n)}function RM(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M320 146s24.36-12-64-12a160 160 0 1 0 160 160"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m256 58 80 80-80 80"},child:[]}]})(n)}function p9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M336 256H176"},child:[]}]})(n)}function m9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M96 256h320M96 176h320M96 336h320"},child:[]}]})(n)}function g9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M32 192 256 64l224 128-224 128L32 192z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M112 240v128l144 80 144-80V240m80 128V192M256 320v128"},child:[]}]})(n)}function _9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M338.29 338.29 448 448"},child:[]}]})(n)}function y9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"ellipse",attr:{cx:"256",cy:"128",fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",rx:"192",ry:"80"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M448 214c0 44.18-86 80-192 80S64 258.18 64 214m384 86c0 44.18-86 80-192 80S64 344.18 64 300"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M64 127.24v257.52C64 428.52 150 464 256 464s192-35.48 192-79.24V127.24"},child:[]}]})(n)}function v9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M262.29 192.31a64 64 0 1 0 57.4 57.4 64.13 64.13 0 0 0-57.4-57.4zM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22 155.3 155.3 0 0 1-21.46-12.57 16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22 155.3 155.3 0 0 1 21.46 12.57 16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47z"},child:[]}]})(n)}function w9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M336 176 225.2 304 176 255.8"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M463.1 112.37C373.68 96.33 336.71 84.45 256 48c-80.71 36.45-117.68 48.33-207.1 64.37C32.7 369.13 240.58 457.79 256 464c15.42-6.21 223.3-94.87 207.1-351.63z"},child:[]}]})(n)}function E9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"rect",attr:{width:"48",height:"160",x:"64",y:"320",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"8",ry:"8"},child:[]},{tag:"rect",attr:{width:"48",height:"256",x:"288",y:"224",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"8",ry:"8"},child:[]},{tag:"rect",attr:{width:"48",height:"368",x:"400",y:"112",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"8",ry:"8"},child:[]},{tag:"rect",attr:{width:"48",height:"448",x:"176",y:"32",fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",rx:"8",ry:"8"},child:[]}]})(n)}function kM(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeMiterlimit:"10",strokeWidth:"32",d:"M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M256 128v144h96"},child:[]}]})(n)}function T9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m112 112 20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"},child:[]},{tag:"path",attr:{strokeLinecap:"round",strokeMiterlimit:"10",strokeWidth:"32",d:"M80 112h352"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M192 112V72h0a23.93 23.93 0 0 1 24-24h80a23.93 23.93 0 0 1 24 24h0v40m-64 64v224m-72-224 8 224m136-224-8 224"},child:[]}]})(n)}function I9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"M85.57 446.25h340.86a32 32 0 0 0 28.17-47.17L284.18 82.58c-12.09-22.44-44.27-22.44-56.36 0L57.4 399.08a32 32 0 0 0 28.17 47.17z"},child:[]},{tag:"path",attr:{fill:"none",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"32",d:"m250.26 195.39 5.74 122 5.73-121.95a5.74 5.74 0 0 0-5.79-6h0a5.74 5.74 0 0 0-5.68 5.95z"},child:[]},{tag:"path",attr:{d:"M256 397.25a20 20 0 1 1 20-20 20 20 0 0 1-20 20z"},child:[]}]})(n)}function S9(n){return de({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M449.07 399.08 278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0 0 80 446.25h340.89a32 32 0 0 0 28.18-47.17zm-198.6-1.83a20 20 0 1 1 20-20 20 20 0 0 1-20 20zm21.72-201.15-5.74 122a16 16 0 0 1-32 0l-5.74-121.95a21.73 21.73 0 0 1 21.5-22.69h.21a21.74 21.74 0 0 1 21.73 22.7z"},child:[]}]})(n)}const iE=2*60*1e3,AM=30*60*1e3,RS=({onExtend:n,onLogout:e})=>{const[t,r]=W.useState(!1),[s,a]=W.useState("");W.useEffect(()=>{const f=()=>{const y=Uu();if(!(y!=null&&y.expiresAt))return;const w=y.expiresAt-Date.now();if(w>0&&w<=iE){const T=Math.floor(w/6e4),C=Math.floor(w%6e4/1e3);a(`${T}:${C.toString().padStart(2,"0")}`),r(!0)}else w>iE&&r(!1)};f();const p=setInterval(f,1e3);return()=>clearInterval(p)},[]);const u=()=>{const f=Uu();f&&(IS({...f,expiresAt:Date.now()+AM}),r(!1),n==null||n())},h=()=>{r(!1),e==null||e()};return t?Q.jsx("div",{className:"session-warning-overlay",children:Q.jsxs("div",{className:"session-warning-modal",children:[Q.jsx("div",{className:"session-warning-icon",children:Q.jsx(kM,{})}),Q.jsx("h3",{children:"Session Expiring Soon"}),Q.jsxs("p",{children:["Your session will expire in ",Q.jsx("strong",{children:s})]}),Q.jsx("p",{className:"session-warning-subtitle",children:"Would you like to extend your session?"}),Q.jsxs("div",{className:"session-warning-actions",children:[Q.jsxs("button",{className:"session-warning-btn session-warning-btn-extend",onClick:u,children:[Q.jsx(RM,{}),"Extend Session"]}),Q.jsx("button",{className:"session-warning-btn session-warning-btn-logout",onClick:h,children:"Logout Now"})]})]})}):null};RS.propTypes={onExtend:yi.func,onLogout:yi.func};const Yn=({children:n,allowedRoles:e=null})=>{const t=Hr(),[r,s]=W.useState(!1),[a,u]=W.useState(!1),[h,f]=W.useState(!1);if(W.useEffect(()=>{const w=R3(lo,T=>{f(!!T),u(!0)});return()=>w()},[]),W.useEffect(()=>{if(!h||!a||!pu()||!lo.currentUser)return;const w=ju();if(!w)return;const T=rI(uy,"admin_roles",lo.currentUser.uid);wx(T,{role:w},{merge:!0}).catch(C=>{console.warn("Could not sync admin_roles for rules:",C)})},[h,a]),SM(pu()),!a)return null;if(!pu()||!h)return!h&&pu()&&Fu(),Q.jsx(tm,{to:"/",replace:!0,state:{from:t}});if(e&&!vf(e))return ju()===vt.ADVISER?Q.jsx(tm,{to:"/StudentDashboard",replace:!0}):Q.jsx(tm,{to:"/dashboard",replace:!0});const p=()=>s(!1),y=async()=>{s(!1);try{await zI(lo)}catch(w){console.error("Logout error:",w)}finally{Fu(),window.location.href="/"}};return Q.jsxs(Q.Fragment,{children:[n,Q.jsx(RS,{onExtend:p,onLogout:y})]})};Yn.propTypes={children:yi.node.isRequired,allowedRoles:yi.arrayOf(yi.string)};class kS extends _i.Component{constructor(t){super(t);y0(this,"handleReset",()=>{this.setState({hasError:!1,error:null,errorInfo:null})});this.state={hasError:!1,error:null,errorInfo:null}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(t,r){this.setState({error:t,errorInfo:r})}render(){return this.state.hasError?Q.jsx("div",{className:"error-boundary",children:Q.jsxs("div",{className:"error-boundary-content",children:[Q.jsx(CM,{className:"error-boundary-icon"}),Q.jsx("h2",{children:"Something went wrong"}),Q.jsx("p",{children:"An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."}),!1,Q.jsxs("div",{className:"error-boundary-actions",children:[Q.jsx("button",{onClick:this.handleReset,className:"error-boundary-button",children:"Try Again"}),Q.jsx("button",{onClick:()=>window.location.reload(),className:"error-boundary-button error-boundary-button-primary",children:"Refresh Page"})]})]})}):this.props.children}}kS.propTypes={children:yi.node.isRequired};const PM="/assets/InternQuest_Logo-orUTIjP5.png",AS=({isLoading:n,message:e="Loading...",className:t=""})=>n?Q.jsx("div",{className:`loading-spinner-overlay ${t}`,role:"alert","aria-busy":"true",children:Q.jsxs("div",{className:"loading-spinner-container",children:[Q.jsxs("div",{className:"loading-logo-wrapper",children:[Q.jsx("img",{src:PM,alt:"InternQuest",className:"loading-logo"}),Q.jsx("div",{className:"loading-logo-ring"})]}),Q.jsxs("div",{className:"loading-dots",children:[Q.jsx("span",{className:"loading-dot"}),Q.jsx("span",{className:"loading-dot"}),Q.jsx("span",{className:"loading-dot"})]}),e&&Q.jsx("p",{className:"loading-message",children:e}),Q.jsx("div",{className:"loading-progress-bar",children:Q.jsx("div",{className:"loading-progress-fill"})})]})}):null;AS.propTypes={isLoading:yi.bool.isRequired,message:yi.string,className:yi.string};const NM=W.lazy(()=>xi(()=>import("./CompanyDashboard-B-vja6Gz.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]))),sE=W.lazy(()=>xi(()=>import("./StudentDashboard-Bf5LCagy.js"),__vite__mapDeps([16,3,4,5,6,7,8,1,2,11,12,13,14,17]))),oE=W.lazy(()=>xi(()=>import("./ResourceManagementDashboard-CEwgYQ9m.js"),__vite__mapDeps([18,3,4,11,12,19]))),xM=W.lazy(()=>xi(()=>import("./UserRoleManagement-DCkvEYiO.js"),__vite__mapDeps([20,3,4,1,2,6,21]))),aE=W.lazy(()=>xi(()=>import("./DeletedRecords-DPM5dGTo.js"),__vite__mapDeps([22,3,4,1,2,11,12,7,9,10,23]))),OM=W.lazy(()=>xi(()=>import("./ActivityLogViewer-B27hdhhb.js"),__vite__mapDeps([24,11,12,3,4,13,14,25]))),DM=W.lazy(()=>xi(()=>import("./ForgotPassword-DOLU0Du6.js"),__vite__mapDeps([26,27]))),bM=W.lazy(()=>xi(()=>import("./ChangePassword-BU4_kmkW.js"),__vite__mapDeps([28,3,4,29]))),LM=W.lazy(()=>xi(()=>import("./PlatformData-BqjtA3TV.js"),__vite__mapDeps([30,3,4,11,12,31]))),MM=()=>Q.jsx("div",{className:"page-loader",style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"var(--iq-bg, var(--background-color, #f7f9fb))",color:"var(--iq-text-main, var(--text-color, #213547))"},children:Q.jsx(AS,{isLoading:!0,message:"Loading page..."})});function VM(){return Q.jsx(kS,{children:Q.jsx(lk,{children:Q.jsx(W.Suspense,{fallback:Q.jsx(MM,{}),children:Q.jsxs(FR,{children:[Q.jsx(Cn,{path:"/",element:Q.jsx(CS,{})}),Q.jsx(Cn,{path:"/forgot-password",element:Q.jsx(DM,{})}),Q.jsx(Cn,{path:"/dashboard",element:Q.jsx(Yn,{children:Q.jsx(NM,{})})}),Q.jsx(Cn,{path:"/StudentDashboard",element:Q.jsx(Yn,{children:Q.jsx(sE,{})})}),Q.jsx(Cn,{path:"/students",element:Q.jsx(Yn,{children:Q.jsx(sE,{})})}),Q.jsx(Cn,{path:"/helpDesk",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN,vt.COORDINATOR],children:Q.jsx(oE,{})})}),Q.jsx(Cn,{path:"/resource-management",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN,vt.COORDINATOR],children:Q.jsx(oE,{})})}),Q.jsx(Cn,{path:"/adminManagement",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN,vt.COORDINATOR],children:Q.jsx(xM,{})})}),Q.jsx(Cn,{path:"/deleted",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN],children:Q.jsx(aE,{})})}),Q.jsx(Cn,{path:"/archive",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN],children:Q.jsx(aE,{})})}),Q.jsx(Cn,{path:"/activityLog",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN],children:Q.jsx(OM,{})})}),Q.jsx(Cn,{path:"/security-settings",element:Q.jsx(Yn,{children:Q.jsx(bM,{})})}),Q.jsx(Cn,{path:"/platform-data",element:Q.jsx(Yn,{allowedRoles:[vt.SUPER_ADMIN],children:Q.jsx(LM,{})})})]})})})})}const FM=console.error;console.error=(...n)=>{var t,r,s;const e=((t=n[0])==null?void 0:t.toString())||"";e.includes("401")||e.includes("Unauthorized")||(r=n[0])!=null&&r.code&&(n[0].code==="functions/unauthenticated"||n[0].code==="unauthenticated")||(s=n[0])!=null&&s.message&&(n[0].message.includes("401")||n[0].message.includes("Unauthorized")),FM.apply(console,n)};zC.createRoot(document.getElementById("root")).render(Q.jsx(_i.StrictMode,{children:Q.jsx(VM,{})}));export{JM as $,Fu as A,e5 as B,GM as C,KM as D,lE as E,Ck as F,jC as G,WM as H,c9 as I,$M as J,HM as K,AS as L,E9 as M,J5 as N,D5 as O,yi as P,M5 as Q,vt as R,_9 as S,kM as T,N5 as U,EM as V,Sg as W,ZM as X,t9 as Y,Z5 as Z,nl as _,QM as a,q5 as a$,t5 as a0,I5 as a1,V5 as a2,w5 as a3,Q5 as a4,wx as a5,CM as a6,S9 as a7,P5 as a8,RM as a9,A5 as aA,v9 as aB,Y5 as aC,y9 as aD,n9 as aE,YM as aF,f9 as aG,I9 as aH,j5 as aI,c5 as aJ,vM as aK,s5 as aL,l5 as aM,g5 as aN,_i as aO,p9 as aP,wM as aQ,h5 as aR,R5 as aS,a5 as aT,o5 as aU,u5 as aV,R3 as aW,G5 as aX,s9 as aY,h9 as aZ,a9 as a_,e9 as aa,r9 as ab,K5 as ac,x5 as ad,z5 as ae,o9 as af,W5 as ag,g9 as ah,S5 as ai,L5 as aj,b5 as ak,H5 as al,B5 as am,X5 as an,i5 as ao,n5 as ap,yM as aq,v5 as ar,U5 as as,O5 as at,T5 as au,F5 as av,Hr as aw,m5 as ax,i9 as ay,PM as az,ju as b,_5 as b0,C5 as b1,r5 as b2,jM as b3,$5 as b4,k5 as b5,E5 as b6,m9 as b7,xi as b8,gt as b9,mt as ba,Vr as bb,us as bc,pn as bd,uL as be,dg as bf,qb as bg,GL as bh,qL as bi,d5 as bj,ix as c,uy as d,p5 as e,f5 as f,Uu as g,y5 as h,lo as i,vx as j,vf as k,rI as l,qM as m,Q as n,w9 as o,u9 as p,px as q,W as r,XM as s,d9 as t,vg as u,Rk as v,mx as w,l9 as x,T9 as y,zI as z};
