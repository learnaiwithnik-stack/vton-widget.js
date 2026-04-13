(function() {
    // ***********************************************
    //  ADMIN SETTINGS
    // ***********************************************
    const CLIENT_ID = window.AIFL_CLIENT_ID || "demo_store"; // <--- FREE MODE
    const WORKER_URL = "https://tryon-api.learnaiwithnik.workers.dev"; 
    
    // FALLBACK: If we find NOTHING, show this Unsplash Model
    const FALLBACK_IMG = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop";
    const GUIDE_IMG = "https://raw.githubusercontent.com/nikhjoshi123/vton-engine/main/AIFittingLabs-Assest.jpeg";
    // ***********************************************

    // 1. STYLES
    const injectStyles = () => {
        if (document.getElementById("vton-styles")) return;
        const s = document.createElement("style");
        s.id = "vton-styles";
        s.innerHTML = `
            .v-spin { width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; display:inline-block; animation: v-rot 0.8s linear infinite; vertical-align:middle; margin-right:10px; flex-shrink: 0; }
            @keyframes v-rot { to {transform:rotate(360deg)} }
            @keyframes rainbow { to { background-position: 200% center; } }
            .v-ov { position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.85); z-index:2147483647; display:flex; align-items:center; justify-content:center; padding: 15px; font-family: -apple-system, system-ui, sans-serif; }
            .v-con { background:#fff; width:100%; max-width:900px; border-radius:20px; overflow:hidden; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 20px 50px rgba(0,0,0,0.5); position: relative; }
            @media (max-width: 768px) { 
                .v-con { overflow-y: auto; -webkit-overflow-scrolling: touch; } 
                .v-left { width: 100%; min-height: auto; } 
                .v-left img { width: 100%; height: auto; display: block; } 
                .v-right { padding: 25px; } 
                #vton-float { padding: 10px 18px !important; font-size: 12px !important; bottom: 15px !important; right: 15px !important; }
            }
            @media (min-width: 769px) { .v-con { flex-direction: row; height: 550px; overflow: hidden; } .v-left { width: 50%; height: 100%; background:#f8f9fa; } .v-left img { width: 100%; height: 100%; object-fit: contain; } .v-right { width: 50%; height: 100%; overflow-y: auto; padding: 40px; } }
            .v-left { position:relative; display:flex; align-items:center; justify-content:center; }
            .v-right { display:flex; flex-direction:column; justify-content:center; background:#fff; }
            .v-brand-logo { font-size:11px; font-weight:900; letter-spacing:2px; margin-bottom:15px; text-transform:uppercase; background: linear-gradient(to right, #ef5350, #f48fb1, #7e57c2, #2196f3, #26c6da, #43a047, #eeff41, #f9a825, #ff5722); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; animation: rainbow 3s linear infinite; background-size: 200% auto; }
            .v-title { font-size: 24px; font-weight: 800; margin: 0 0 10px 0; color: #000; line-height: 1.2; }
            .v-sub { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 20px; }
            .v-list { margin:0 0 25px 0; padding:0; list-style:none; font-size:13px; color:#555; line-height: 1.8; text-align:left; }
            .v-list li { margin-bottom: 6px; display: flex; align-items: center; }
            .v-garment-preview { display:flex; align-items:center; gap:12px; background:#f5f5f7; padding:10px; border-radius:12px; margin-bottom:20px; border:1px solid #eee; }
            .v-garment-thumb { width:45px; height:45px; border-radius:8px; object-fit:cover; background:#fff; border:1px solid #ddd; }
            .v-badge { position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.95); color: #000; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 10; }
            .v-btn-blk { background:#000; color:#fff; border:none; padding:18px; border-radius:12px; font-weight:800; cursor:pointer; font-size:13px; width:100%; transition: 0.3s; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
            .v-btn-blk:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.2); }
            .v-btn-blk:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
            
            #vton-float { position:fixed; bottom:25px; right:25px; z-index:2147483646; background:#000; color:#fff; border:none; padding:15px 28px; border-radius:100px; font-weight:700; cursor:pointer; box-shadow:0 15px 35px rgba(0,0,0,0.3); font-size:14px; transition: all 0.3s ease; display:flex; align-items:center; white-space: nowrap; }
            #vton-float.confirm-mode { background: #2563eb; transform: scale(1.05); }
            #vton-float.processing { padding-right: 50px; background: #222; cursor: wait; min-width: 220px; }
        `;
        document.head.appendChild(s);
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const getProductName = () => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.innerText : "this item";
    };

    // ************************************************************
    //  2. THE "STRICT VERTICAL" SCANNER (Your Logic)
    // ************************************************************
    const getGarmentImage = () => {
        // 1. Scan EVERY image on the current page
        let candidates = [];
        
        document.querySelectorAll('img').forEach(img => {
            const rect = img.getBoundingClientRect();
            const src = (img.src || "").toLowerCase();
            
            // Filter 1: It must be visible and decent size
            if (rect.width > 150 && rect.height > 150) {
                
                // Filter 2: THE GOLDEN RULE
                // Height MUST be bigger than Width (Portrait Mode)
                // This deletes Banners (Wide) and Website Screenshots (Wide)
                if (rect.height > rect.width) { 
                    
                    // Filter 3: No Logos or Icons
                    if (!src.includes('logo') && !src.includes('icon') && !src.includes('avatar')) {
                        // Save it!
                        candidates.push({ src: img.src, height: rect.height });
                    }
                }
            }
        });

        // 2. Pick the TALLEST one (Likely the main product)
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.height - a.height); 
            return candidates[0].src;
        }

        // 3. If nothing found, use safe fallback
        return FALLBACK_IMG;
    };

    // 3. VISIBILITY (URL Check)
    const checkPage = () => {
        // FIX: Use 'pathname' instead of 'href' so the domain name doesn't trigger the button!
        const path = window.location.pathname.toLowerCase();
        
        // Show only exactly when these words are in the URL path
        const isProductUrl = path.includes('product') || path.includes('item') || path.includes('category');
        
        if (isProductUrl || (window.VTON_CONFIG && window.VTON_CONFIG.force)) {
            showButton();
        } else {
            removeButton();
        }
    };

    const showButton = () => {
        if (document.getElementById("vton-float")) return;
        injectStyles();
        const b = document.createElement("button");
        b.id = "vton-float";
        b.innerHTML = "✨ SEE IT ON YOU";
        b.dataset.state = "idle";

        b.onclick = () => {
            if (b.dataset.state === "idle") {
                // FIRST CLICK: Just change text
                b.innerHTML = "🧐 TRY THIS ITEM?";
                b.classList.add("confirm-mode");
                b.dataset.state = "confirm";
            } else {
                // SECOND CLICK: RUN SCANNER NOW
                b.innerHTML = "✨ SEE IT ON YOU";
                b.classList.remove("confirm-mode");
                b.dataset.state = "idle";
                showGuide(); 
            }
        };
        document.body.appendChild(b);
    };

    const removeButton = () => {
        const btn = document.getElementById("vton-float");
        if (btn) btn.remove();
    };

    // 4. UI FLOW
    function showGuide() {
        // EXECUTE SCANNER HERE (User Requested Moment)
        const detectedGarment = getGarmentImage();
        let trials = localStorage.getItem("vton_trials") || 5;

        const ov = document.createElement("div");
        ov.className = "v-ov";
        ov.id = "v-modal";
        
        ov.innerHTML = `
            <div class="v-con">
                <div class="v-left">
                    <img src="${GUIDE_IMG}" style="object-fit:cover; width:100%; height:100%;">
                    <div class="v-badge">⚡ ${trials} TRIALS LEFT</div>
                </div>
                <div class="v-right">
                    <div class="v-brand-logo">AI FITTING LABS</div>
                    
                    <div class="v-garment-preview">
                        <img src="${detectedGarment}" class="v-garment-thumb">
                        <div style="text-align:left;">
                            <div style="font-size:10px; font-weight:bold; color:#000;">SELECTED ITEM</div>
                            <div style="font-size:10px; color:#666;">Ready to try on</div>
                        </div>
                    </div>

                    <h2 class="v-title">Fitting Guide</h2>
                    <ul class="v-list">
                        <li>✅ Stand straight facing camera</li>
                        <li>✅ HD Photo (Good Lighting)</li>
                        <li>✅ Wear tight/fitted clothes</li>
                        <li>✅ Hands visible (Not in pockets)</li>
                    </ul>
                    <button class="v-btn-blk" id="v-proceed">UPLOAD PHOTO & START</button>
                    <button style="background:transparent; border:none; color:#999; margin-top:15px; cursor:pointer; font-size:11px;" onclick="document.getElementById('v-modal').remove()">CANCEL</button>
                </div>
            </div>
        `;
        document.body.appendChild(ov);

        const input = document.createElement("input");
        input.type = "file"; input.accept = "image/*";
        document.getElementById("v-proceed").onclick = () => input.click();

        input.onchange = async (e) => {
            if (!e.target.files[0]) return;
            ov.remove(); 
            localStorage.setItem("vton_trials", Math.max(0, trials - 1));
            await startPipeline(e.target.files[0], detectedGarment);
        };
    }

    // 5. ENGINE (FREE TEST MODE)
    async function startPipeline(userFile, garmentUrl) {
        const btn = document.getElementById("vton-float");
        let interval = null;
        let attempts = 0; 

        try {
            btn.innerHTML = '<span class="v-spin"></span> ANALYZING... (DO NOT CLOSE)';
            btn.classList.add("processing");
            btn.disabled = true;

            const userBase64 = await toBase64(userFile);
            
            const startReq = await fetch(`${WORKER_URL}/start?client=${CLIENT_ID}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userImage: userBase64, garmentImage: garmentUrl })
            });

            const startData = await startReq.json();
            
            if (startData.error) throw new Error(startData.message || startData.error);
            if (!startData.id) throw new Error("API Error: No Job ID.");

            const jobId = startData.id;
            btn.innerHTML = '<span class="v-spin"></span> DESIGNING... (DO NOT CLOSE)';

            interval = setInterval(async () => {
                attempts++;
                if (attempts > 120) { 
                    clearInterval(interval);
                    alert("⚠️ Timeout.");
                    btn.innerHTML = "TRY AGAIN";
                    btn.classList.remove("processing");
                    btn.disabled = false;
                    return;
                }

                try {
                    const cacheBuster = new Date().getTime();
                    const statusReq = await fetch(`${WORKER_URL}/status?id=${jobId}&client=${CLIENT_ID}&t=${cacheBuster}`);
                    const statusData = await statusReq.json();
                    
                    let finalImage = null;
                    if (statusData.output) {
                        if (Array.isArray(statusData.output) && statusData.output.length > 0) finalImage = statusData.output[0];
                        else if (typeof statusData.output === "string") finalImage = statusData.output;
                    }

                    if (finalImage) {
                        clearInterval(interval);
                        btn.innerHTML = "✨ SEE IT ON YOU";
                        btn.classList.remove("processing");
                        btn.disabled = false;
                        showFinal(finalImage);
                    } else if (statusData.status === "failed") {
                        clearInterval(interval);
                        alert("❌ Generation Failed.");
                        btn.innerHTML = "TRY AGAIN";
                        btn.classList.remove("processing");
                        btn.disabled = false;
                    }

                } catch (e) { console.error("Poll Error:", e); }
            }, 3000);

        } catch (err) {
            if (interval) clearInterval(interval);
            alert("⚠️ " + err.message);
            btn.innerHTML = "TRY AGAIN";
            btn.classList.remove("processing");
            btn.disabled = false;
        }
    }

    function showFinal(url) {
        const productName = getProductName();
        let trials = localStorage.getItem("vton_trials") || 5;
        
        const ov = document.createElement("div");
        ov.className = "v-ov";
        ov.innerHTML = `
            <div class="v-con">
                <div class="v-left">
                    <img src="${url}">
                    <div class="v-badge">⚡ ${trials} TRIALS LEFT</div>
                </div>
                <div class="v-right">
                    <div class="v-brand-logo">AI FITTING LABS</div>
                    <h2 class="v-title">It Fits Perfectly!</h2>
                    <p class="v-sub">We think <b>${productName}</b> looks good on you! ❤️</p>
                    
                    <div style="background:#fff3cd; color:#856404; padding:10px; border-radius:8px; font-size:11px; font-weight:bold; margin-bottom:15px; text-align:center; border:1px solid #ffeeba;">
                        🔥 Buy this product fast before you can't visualize yourself!
                    </div>

                    <a href="${url}" download="my-look.png" style="width:100%"><button class="v-btn-blk">DOWNLOAD LOOK</button></a>
                    <button style="background:none; border:none; color:#999; margin-top:15px; cursor:pointer; font-size:11px;" onclick="this.closest('.v-ov').remove()">CLOSE</button>
                    
                    <div style="font-size:10px; color:#999; margin-top:20px; text-align:center; line-height: 1.4;">
                        🛡️ Privacy Note: Images are processed in real-time and never stored by AI Fitting Labs.
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(ov);
    }

    setInterval(checkPage, 1000);
})();
