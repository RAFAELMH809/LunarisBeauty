document.addEventListener("DOMContentLoaded", () => {
  // ====== utilitarios ======
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
  const money = v => Number(v||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});

  // ====== HERO (como ya lo tenías) ======
  const img = $("#hero-img");
  const slides = (window.HERO_SLIDES || []).slice();
  let hi=0;
  const left = $(".hero-arrow.left");
  const right = $(".hero-arrow.right");
  function showHero(idx){ if(!slides.length || !img) return; hi=(idx+slides.length)%slides.length; img.src=slides[hi]; }
  if (left && right){
    if (slides.length <= 1){ left.style.display="none"; right.style.display="none"; }
    else { left.addEventListener("click", ()=>showHero(hi-1)); right.addEventListener("click", ()=>showHero(hi+1)); }
  }
  showHero(hi);

  // ==========================================================
  // =============== MODAL CHICO (ya existente) ===============
  // ==========================================================
  const cartModal = $("#cart-modal");
  const mImg   = $("#cartModalImg");
  const mTitle = $("#cartModalTitle");
  const mPrice = $("#cartModalPrice");
  const mSize  = $("#cartModalSize");
  const mQty   = $("#cartModalQty");
  const mAdd   = $("#cartModalAdd");
  const mMore  = $("#cartModalMore");

  function openCartModal(data){
    if(!cartModal) return;
    mImg.src = data.image || ""; mImg.alt = data.name || "Producto";
    mTitle.textContent = data.name || "";
    mPrice.textContent = money(data.price || 0);
    mQty.value = 1;
    mSize.innerHTML = '<option value="" selected>Elegir</option>';
    (data.sizes || ["Chico","Mediano","Grande"]).forEach(s=>{
      const opt=document.createElement("option"); opt.textContent=s; opt.value=s; mSize.appendChild(opt);
    });
    mMore.dataset.payload = JSON.stringify(data);
    cartModal.classList.add("is-open"); document.body.style.overflow = "hidden";
  }
  function closeCartModal(){ cartModal?.classList.remove("is-open"); document.body.style.overflow = ""; }
  cartModal?.addEventListener("click", e=>{ if(e.target.matches("[data-close-modal]")) closeCartModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeCartModal(); });
  cartModal?.addEventListener("click", e=>{
    const b=e.target.closest(".qty__btn"); if(!b) return;
    mQty.value = Math.max(1, parseInt(mQty.value||"1",10) + parseInt(b.dataset.qty||"0",10));
  });

  // Abre modal chico desde la card
  $$(".btn-cart[data-action='add-to-cart']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const data = {
        id:   (btn.dataset.id || (btn.dataset.name||"").toLowerCase().replace(/\s+/g,'-')),
        name: btn.dataset.name,
        price: Number(btn.dataset.price||0),
        image: btn.dataset.image,
        url:   btn.dataset.url || "#",
        sizes: btn.dataset.sizes ? btn.dataset.sizes.split("|") : null,
        desc:  btn.dataset.desc  || "Producto de alta calidad.",
        benefits: btn.dataset.benefits ? btn.dataset.benefits.split("|") : ["Beneficio 1","Beneficio 2"],
        ingredients: btn.dataset.ingredients || "Ingredientes del producto.",
        howto: btn.dataset.howto || "Aplicar según indicaciones.",
        warnings: btn.dataset.warnings || "Uso externo."
      };
      openCartModal(data);
    });
  });

  // ==========================================================
  // ============== MODAL DETALLES (grande) ===================
  // ==========================================================
  const detModal = $("#details-modal");
  const dImg   = $("#detailsImg");
  const dTitle = $("#detailsTitle");
  const dPrice = $("#detailsPrice");
  const dSize  = $("#detailsSize");
  const dQty   = $("#detailsQty");
  const dAdd   = $("#detailsAdd");
  const dDesc  = $("#detailsDesc");
  const dBenefits = $("#detailsBenefits");
  const dIngr  = $("#detailsIngredients");
  const dHowTo = $("#detailsHowTo");
  const dWarn  = $("#detailsWarnings");

  function openDetails(data){
    if(!detModal) return;
    dImg.src = data.image || ""; dImg.alt = data.name || "Producto";
    dTitle.textContent = data.name || "";
    dPrice.textContent = money(data.price || 0);
    dQty.value = 1;
    dSize.innerHTML = '<option value="" selected>Elegir</option>';
    (data.sizes || ["Chico","Mediano","Grande"]).forEach(s=>{
      const opt=document.createElement("option"); opt.textContent=s; opt.value=s; dSize.appendChild(opt);
    });
    dDesc.textContent = data.desc || "";
    dIngr.textContent = data.ingredients || "";
    dHowTo.textContent = data.howto || "";
    dWarn.textContent  = data.warnings || "";
    dBenefits.innerHTML = "";
    (data.benefits || []).forEach(b=>{ const li=document.createElement("li"); li.textContent=b; dBenefits.appendChild(li); });
    detModal.classList.add("is-open"); document.body.style.overflow = "hidden";
    detModal.dataset.payload = JSON.stringify(data); // guardamos para add
  }
  function closeDetails(){ detModal?.classList.remove("is-open"); document.body.style.overflow = ""; }
  detModal?.addEventListener("click", e=>{ if(e.target.matches("[data-close-modal]")) closeDetails(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDetails(); });
  detModal?.addEventListener("click", e=>{
    const b=e.target.closest(".qty__btn"); if(!b) return;
    dQty.value = Math.max(1, parseInt(dQty.value||"1",10) + parseInt(b.dataset.qty||"0",10));
  });

  // Abrir detalles desde el modal chico
  mMore?.addEventListener("click", (e)=>{
    e.preventDefault();
    try{
      const payload = JSON.parse(mMore.dataset.payload || "{}");
      closeCartModal();
      openDetails(payload);
    }catch(_){}
  });

  // ==========================================================
  // ================== CART DRAWER ============================
  // ==========================================================
  const drawer = $("#cart-drawer");
  const backdrop = $("#cart-backdrop");
  const cartList = $("#cartItems");
  const cartCount = $("#cartCount");
  const cartTotal = $("#cartTotal");
  const btnCloseDrawer = $("[data-cart-close]");
  const btnCheckout = $("#cartCheckout");

  let CART = []; // {key, id, name, image, price, size, qty}

  function openDrawer(){
    drawer.classList.add("is-open");
    backdrop.style.opacity = 1; backdrop.style.pointerEvents = "auto";
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer(){
    drawer.classList.remove("is-open");
    backdrop.style.opacity = 0; backdrop.style.pointerEvents = "none";
    drawer.setAttribute("aria-hidden", "true");
  }
  btnCloseDrawer?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  function cartKey(id,size){ return `${id || "prod"}::${size || ""}`; }

  function addToCart(item){
    const key = cartKey(item.id, item.size);
    const found = CART.find(i=>i.key===key);
    if(found){ found.qty += item.qty; }
    else{
      CART.push({...item, key});
    }
    renderCart();
    openDrawer();
  }

  function removeFromCart(key){
    CART = CART.filter(i=>i.key!==key);
    renderCart();
    if(!CART.length) closeDrawer();
  }

  function updateQty(key, delta){
    const it = CART.find(i=>i.key===key);
    if(!it) return;
    it.qty = Math.max(1, it.qty + delta);
    renderCart();
  }

  function renderCart(){
    cartList.innerHTML = "";
    let total = 0, count=0;

    CART.forEach(item=>{
      total += item.price * item.qty;
      count += item.qty;

      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <img class="cartItem__img" src="${item.image}" alt="${item.name}">
        <div>
          <div class="cartItem__name">${item.name}</div>
          <div class="cartItem__meta">Tamaño: ${item.size || "-"}</div>
          <div class="cartItem__qty">
            <button class="btn-qty" data-act="dec" data-key="${item.key}">−</button>
            <input type="number" min="1" value="${item.qty}" data-key="${item.key}">
            <button class="btn-qty" data-act="inc" data-key="${item.key}">+</button>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px">
          <div class="cartItem__price">${money(item.price * item.qty)}</div>
          <button class="cartItem__remove" title="Eliminar" data-act="rm" data-key="${item.key}">🗑</button>
        </div>
      `;
      cartList.appendChild(row);
    });

    cartCount.textContent = `(${count} ${count===1?'Producto':'Productos'})`;
    cartTotal.textContent = money(total);
  }

  // Delegación de eventos dentro del drawer
  cartList.addEventListener("click", e=>{
    const btn = e.target.closest("[data-act]");
    if(!btn) return;
    const key = btn.dataset.key;
    const act = btn.dataset.act;
    if(act==="inc") updateQty(key, +1);
    if(act==="dec") updateQty(key, -1);
    if(act==="rm")  removeFromCart(key);
  });
  cartList.addEventListener("change", e=>{
    const inp = e.target;
    if(inp.matches("input[type='number'][data-key]")){
      const key = inp.dataset.key;
      const it = CART.find(i=>i.key===key);
      if(!it) return;
      const v = Math.max(1, parseInt(inp.value||"1",10));
      it.qty = v; renderCart();
    }
  });

  btnCheckout?.addEventListener("click", ()=>{
    alert("Aquí iría el flujo de pago / checkout.");
  });

  // Conectar "Agregar al carrito" de los dos modales
  mAdd?.addEventListener("click", ()=>{
    if(!mSize.value){ alert("Elige un tamaño."); return; }
    const qty = Math.max(1, parseInt(mQty.value||"1",10));
    const data = JSON.parse(mMore?.dataset.payload || "{}");
    addToCart({
      id: data.id || (data.name||"").toLowerCase().replace(/\s+/g,'-'),
      name: data.name, image: data.image, price: Number(data.price||0),
      size: mSize.value, qty
    });
    closeCartModal();
  });

  dAdd?.addEventListener("click", ()=>{
    if(!dSize.value){ alert("Elige un tamaño."); return; }
    const qty = Math.max(1, parseInt(dQty.value||"1",10));
    const data = JSON.parse(detModal?.dataset.payload || "{}");
    addToCart({
      id: data.id || (data.name||"").toLowerCase().replace(/\s+/g,'-'),
      name: data.name, image: data.image, price: Number(data.price||0),
      size: dSize.value, qty
    });
    closeDetails();
  });
});
