import"./hoisted.BxdQffjq.js";const p="modulepreload",f=function(c){return"/"+c},d={},v=function(e,t,i){let a=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),s=o?.nonce||o?.getAttribute("nonce");a=Promise.allSettled(t.map(n=>{if(n=f(n),n in d)return;d[n]=!0;const l=n.endsWith(".css"),u=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${u}`))return;const r=document.createElement("link");if(r.rel=l?"stylesheet":p,l||(r.as="script"),r.crossOrigin="",r.href=n,s&&r.setAttribute("nonce",s),document.head.appendChild(r),l)return new Promise((m,g)=>{r.addEventListener("load",m),r.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${n}`)))})}))}function h(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return a.then(o=>{for(const s of o||[])s.status==="rejected"&&h(s.reason);return e().catch(h)})};class y{constructor(){this.posts=JSON.parse(document.querySelector(".search-component")?.getAttribute("data-search-posts")||"[]"),this.searchInput=document.getElementById("search-input"),this.clearButton=document.getElementById("clear-search"),this.suggestions=document.getElementById("suggestions"),this.searchResults=document.getElementById("search-results"),this.resultsList=document.getElementById("results-list"),this.noResults=document.getElementById("no-results"),this.searchTerm=document.getElementById("search-term"),this.init()}init(){this.searchInput&&(this.searchInput.addEventListener("input",this.handleInput.bind(this)),this.searchInput.addEventListener("focus",this.showSuggestions.bind(this)),this.searchInput.addEventListener("blur",()=>{setTimeout(()=>this.hideSuggestions(),150)}),this.clearButton?.addEventListener("click",this.clearSearch.bind(this)),this.suggestions?.addEventListener("click",this.handleSuggestionClick.bind(this)),document.addEventListener("click",e=>{e.target.closest(".search-container")||this.hideSuggestions()}))}handleInput(e){const t=e.target.value.trim();t.length>0?(this.clearButton?.classList.remove("opacity-0","invisible"),this.clearButton?.classList.add("opacity-100","visible")):(this.clearButton?.classList.add("opacity-0","invisible"),this.clearButton?.classList.remove("opacity-100","visible")),t.length>=2?(this.performSearch(t),this.hideSuggestions()):t.length===0&&(this.hideResults(),this.showSuggestions())}performSearch(e){v(async()=>{const{simpleSearch:t}=await import("./search.DMnYewFG.js");return{simpleSearch:t}},[]).then(({simpleSearch:t})=>{const i=t(this.posts,e);this.displayResults(i,e)})}displayResults(e,t){if(!(!this.searchTerm||!this.resultsList)){if(this.searchTerm.textContent=t,this.resultsList.innerHTML="",e.length===0){this.showNoResults();return}this.searchResults?.classList.remove("hidden"),this.noResults?.classList.add("hidden"),e.forEach(i=>{const a=this.createResultItem(i);this.resultsList.appendChild(a)})}}createResultItem(e){const t=document.createElement("article");return t.className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200",t.innerHTML=`
        <h3 class="text-xl font-semibold text-foreground mb-2">
          <a href="/post/${e.slug}" class="hover:text-primary transition-colors">
            ${e.title}
          </a>
        </h3>
        
        <p class="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          ${e.excerpt||e.body?.substring(0,150)+"..."||""}
        </p>
        
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          ${e.publishedAt?`<time class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            ${new Date(e.publishedAt).toLocaleDateString("th-TH")}
          </time>`:""}
          
          ${e.category?`<span class="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            ${e.category.title||e.category}
          </span>`:""}
          
          ${e.readingTime?`<span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            ${e.readingTime} นาที
          </span>`:""}
        </div>
      `,t}showSuggestions(){this.searchInput?.value.trim()===""&&this.suggestions?.classList.remove("hidden")}hideSuggestions(){this.suggestions?.classList.add("hidden")}hideResults(){this.searchResults?.classList.add("hidden"),this.noResults?.classList.add("hidden")}showNoResults(){this.searchResults?.classList.add("hidden"),this.noResults?.classList.remove("hidden")}handleSuggestionClick(e){const t=e.target.closest(".suggestion-item");if(!t)return;const i=t.getAttribute("data-value");i&&this.searchInput&&(this.searchInput.value=i,this.performSearch(i),this.hideSuggestions())}clearSearch(){this.searchInput&&(this.searchInput.value="",this.searchInput.focus()),this.clearButton?.classList.add("opacity-0","invisible"),this.hideResults(),this.showSuggestions()}}document.addEventListener("DOMContentLoaded",()=>{new y});
