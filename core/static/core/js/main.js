document.addEventListener("DOMContentLoaded", () => {
  // ====== utilitarios ======
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
  const money = v => Number(v||0).toLocaleString("es-MX",{style:"currency",currency:"MXN"});

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
  // ============ BOTONES DE CANTIDAD (GLOBAL) ================
  // ==========================================================
  // Este listener global funcionará para los modales Y la pág. de favoritos
  document.addEventListener("click", e => {
    // 1. Vemos si el clic fue en un botón de cantidad
    const qtyBtn = e.target.closest(".qty__btn");
    if (!qtyBtn) return;

    // 2. Encontramos el 'input' de cantidad más cercano
    const qtyContainer = e.target.closest(".qty");
    if (!qtyContainer) return;

    const qtyInput = qtyContainer.querySelector(".qty__input");
    if (!qtyInput) return;

    // 3. Obtenemos la cantidad a sumar/restar (del data-qty)
    const delta = parseInt(qtyBtn.dataset.qty || "0", 10);

    // 4. Actualizamos el valor, asegurando que sea mínimo 1
    qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) + delta);
  });

  // ==========================================================
  // =============== MODAL CHICO ===============
  // ==========================================================
  const cartModal = $("#cart-modal");
  const mImg   = $("#cartModalImg");
  const mTitle = $("#cartModalTitle");
  const mPrice = $("#cartModalPrice");
  const mQty   = $("#cartModalQty");
  const mAdd   = $("#cartModalAdd");
  const mMore  = $("#cartModalMore");

  function openCartModal(data) {
  if (!cartModal) return;

  mImg.src = data.image || "";
  mImg.alt = data.name || "Producto";
  mTitle.textContent = data.name || "";
  mQty.value = 1;

  // 🟢 Mostrar selector de tamaños si existen
  const sizeContainer = $("#cartModalSizeContainer");
  const sizeSelect = $("#cartModalSize");
  sizeSelect.innerHTML = "";

  if (data.sizes && data.sizes.length > 0) {
    sizeContainer.style.display = "block";

    data.sizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.size;
      opt.textContent = `${s.size.charAt(0).toUpperCase() + s.size.slice(1)} - $${s.price}`;
      opt.dataset.price = s.price;
      sizeSelect.appendChild(opt);
    });

    // precio inicial del primer tamaño
    mPrice.textContent = money(Number(data.sizes[0].price));
  } else {
    sizeContainer.style.display = "none";
    mPrice.textContent = money(data.price || 0);
  }

  // Cambiar precio cuando selecciona otro tamaño
  sizeSelect?.addEventListener("change", e => {
    const selected = e.target.selectedOptions[0];
    mPrice.textContent = money(Number(selected.dataset.price));
  });

  mMore.dataset.payload = JSON.stringify(data);
  cartModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

  // Cambiar precio al seleccionar tamaño
document.getElementById("cartModalSize")?.addEventListener("change", e => {
  const opt = e.target.selectedOptions[0];
  if (!opt) return;
  const text = opt.textContent;
  const price = parseFloat(text.split("$")[1]) || 0;
  mPrice.textContent = money(price);
});

  function closeCartModal(){ cartModal?.classList.remove("is-open"); document.body.style.overflow = ""; }
  cartModal?.addEventListener("click", e=>{ if(e.target.matches("[data-close-modal]")) closeCartModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeCartModal(); });

  // Abre modal chico desde la card
  $$(".btn-cart[data-action='add-to-cart']").forEach(btn => {
  btn.addEventListener("click", () => {
    let parsedSizes = [];
    try {
      // 🟢 Intentar convertir el JSON embebido
      parsedSizes = JSON.parse(btn.dataset.sizes || "[]");
    } catch (e) {
      console.warn("Error al parsear tamaños:", e);
      parsedSizes = [];
    }

    const data = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      image: btn.dataset.image,
      url: btn.dataset.url || "#",
      sizes: parsedSizes,
      // si no hay tamaños, toma el primer precio o 0
      price: parsedSizes.length ? parsedSizes[0].price : Number(btn.dataset.price || 0),
      desc: btn.dataset.desc,
      benefits: btn.dataset.benefits ? btn.dataset.benefits.split("|") : [],
      ingredients: btn.dataset.ingredients,
      howto: btn.dataset.howto,
      warnings: btn.dataset.warnings
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
  const dQty   = $("#detailsQty");
  const dAdd   = $("#detailsAdd");
  const dDesc  = $("#detailsDesc");
  const dBenefits = $("#detailsBenefits");
  const dIngr  = $("#detailsIngredients");
  const dHowTo = $("#detailsHowTo");
  const dWarn  = $("#detailsWarnings");

function openDetails(data) {
  if (!detModal) return;

  // === Datos básicos ===
  dImg.src = data.image || "";
  dImg.alt = data.name || "Producto";
  dTitle.textContent = data.name || "";
  dQty.value = 1;

  // === Selector de tamaño ===
  const sizeContainer = $("#detailsSizeContainer");
  const sizeSelect = $("#detailsSize");
  sizeSelect.innerHTML = "";

  if (data.sizes && data.sizes.length > 0) {
    sizeContainer.style.display = "block";
    data.sizes.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.size;
      opt.textContent = `${s.size.charAt(0).toUpperCase() + s.size.slice(1)} - $${s.price}`;
      opt.dataset.price = s.price;
      sizeSelect.appendChild(opt);
    });

    // Precio inicial = primer tamaño
    dPrice.textContent = money(Number(data.sizes[0].price));
  } else {
    sizeContainer.style.display = "none";
    dPrice.textContent = money(data.price || 0);
  }

  // === Actualizar precio al cambiar tamaño ===
  sizeSelect?.addEventListener("change", e => {
    const selected = e.target.selectedOptions[0];
    dPrice.textContent = money(Number(selected.dataset.price));
  });

  // === Info del producto ===
  dDesc.textContent = data.desc || "Sin descripción disponible.";
  dIngr.textContent = data.ingredients || "—";
  dHowTo.textContent = data.howto || "—";
  dWarn.textContent = data.warnings || "—";

  dBenefits.innerHTML = "";
  (data.benefits || []).forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    dBenefits.appendChild(li);
  });

  // === Mostrar modal ===
  detModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
  detModal.dataset.payload = JSON.stringify(data);
}

  function closeDetails(){ detModal?.classList.remove("is-open"); document.body.style.overflow = ""; }
  detModal?.addEventListener("click", e=>{ if(e.target.matches("[data-close-modal]")) closeDetails(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDetails(); });

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
  const btnOpenDrawer = $("#navbarCartButton");

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
  btnOpenDrawer?.addEventListener("click", (e) => {
    // 1. Prevenimos que el enlace '#' nos lleve al inicio de la página
    e.preventDefault();
    // 2. Llamamos a la función que ya existe para abrir el drawer
    openDrawer();
  });

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
          <div class="cartItem__name">${item.name} ${item.size ? `(${item.size})` : ""}</div>
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
    if (CART.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // 1. Obtenemos la URL de pago del atributo data-
    const paymentUrl = btnCheckout.dataset.paymentUrl;
    if (!paymentUrl) {
      console.error("No se encontró la URL de pago");
      return;
    }

    // 2. Convertimos el carrito (Array) en un JSON (String)
    const cartData = JSON.stringify(CART);

    // 3. Obtenemos el token CSRF (ya tenemos esta función)
    const csrfToken = getCSRFToken();

    // 4. Creamos un formulario oculto en la memoria
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.style.display = 'none';

    // 5. Creamos el input para el CSRF token
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // 6. Creamos el input para los datos del carrito
    const cartInput = document.createElement('input');
    cartInput.type = 'hidden';
    cartInput.name = 'cart_data';
    cartInput.value = cartData;
    form.appendChild(cartInput);

    // 7. Añadimos el formulario a la página y lo enviamos
    document.body.appendChild(form);
    form.submit();
  });

  // Conectar "Agregar al carrito" de los dos modales
 mAdd?.addEventListener("click", () => {
  const qty = Math.max(1, parseInt(mQty.value || "1", 10));
  const data = JSON.parse(mMore?.dataset.payload || "{}");

  let price = 0;
  let size = "";
  const sizeSelect = $("#cartModalSize");

  if (sizeSelect && sizeSelect.value) {
    size = sizeSelect.value;
    price = Number(sizeSelect.selectedOptions[0].dataset.price);
  } else if (data.sizes && data.sizes.length > 0) {
    price = Number(data.sizes[0].price);
  } else {
    price = Number(data.price || 0);
  }

  addToCart({
    id: data.id,
    name: data.name,
    image: data.image,
    price,
    size,
    qty
  });

  closeCartModal();
});


dAdd?.addEventListener("click", () => {
  const qty = Math.max(1, parseInt(dQty.value || "1", 10));
  const data = JSON.parse(detModal?.dataset.payload || "{}");

  let price = 0;
  let size = "";
  const sizeSelect = $("#detailsSize");

  if (sizeSelect && sizeSelect.value) {
    size = sizeSelect.value;
    price = Number(sizeSelect.selectedOptions[0].dataset.price);
  } else if (data.sizes && data.sizes.length > 0) {
    price = Number(data.sizes[0].price);
  } else {
    price = Number(data.price || 0);
  }

  addToCart({
    id: data.id,
    name: data.name,
    image: data.image,
    price,
    size,
    qty
  });

  closeDetails();
});

  // Función para obtener el token CSRF (necesario para POST)
  function getCSRFToken() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || "";
  }

  // Escuchamos clics en CUALQUIER parte del documento
  document.addEventListener("click", e => {
    // 1. Vemos si el clic fue en un botón .wish
    const wishBtn = e.target.closest(".wish");

    // Si no fue en un botón .wish, o el botón no tiene ID, no hacemos nada
    if (!wishBtn || !wishBtn.dataset.productId) {
      return;
    }

    // 2. Obtenemos el ID del producto
    const productId = wishBtn.dataset.productId;
    const url = `/toggle-favorite/${productId}/`;

    // 3. Enviamos la petición FETCH
    fetch(url, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCSRFToken(), // 4. Incluimos el token de seguridad
        "X-Requested-With": "XMLHttpRequest"
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'ok') {
        // 5. ¡Éxito! Actualizamos el botón
        //    'data.is_favorited' será true o false (viene del JsonResponse)
        wishBtn.classList.toggle("is-active", data.is_favorited);

        // (Opcional) Si estamos en la página de favoritos, podríamos
        // ocultar la tarjeta si 'is_favorited' es false.
        // Por ahora, solo cambiar el icono es suficiente.
      } else {
        console.error(data.message);
      }
    })
    .catch(error => {
      console.error("Error en la petición fetch:", error);
    });
  });
// ==========================================================
  // ======= AÑADIR AL CARRITO (DESDE FAVORITOS) ========
  // ==========================================================
  // Listener para los botones 'Agregar al carrito' en la pág. de favoritos
  document.addEventListener("click", e => {

    // 1. Ver si el clic fue en el botón .fav-card__add
    const addBtn = e.target.closest(".fav-card__add");
    if (!addBtn) return;

    // 2. Encontrar la tarjeta padre
    const card = e.target.closest(".fav-card");
    if (!card) return;

    // 3. Encontrar el input de cantidad DENTRO de esa tarjeta
    //    (Ya no buscamos 'sizeSelect')
    const qtyInput = card.querySelector(".fav-card__qty");

    // 4. (Ya no hay validación de tamaño)

    // 5. Recolectar todos los datos del botón y el input
    const item = {
      id:     addBtn.dataset.id,
      name:   addBtn.dataset.name,
      price:  Number(addBtn.dataset.price || 0),
      image:  addBtn.dataset.image,
      // (Ya no pasamos 'size')
      qty:    Math.max(1, parseInt(qtyInput.value || "1", 10))
    };

    // 6. ¡Llamar a la función addToCart()!
    addToCart(item);
  });
  // ==========================================================
  // ==== ABRIR MODAL DETALLES (DESDE FAVORITOS) ========
  // ==========================================================
  document.addEventListener("click", e => {

    const detailsLink = e.target.closest(".fav-card__details");
    if (!detailsLink) return;

    e.preventDefault();

    // No necesitamos "robar" del botón, leemos del enlace
    const data = {
      id:     detailsLink.dataset.id,
      name:   detailsLink.dataset.name,
      price:  Number(detailsLink.dataset.price||0),
      image:  detailsLink.dataset.image,
      sizes:  detailsLink.dataset.sizes ? detailsLink.dataset.sizes.split("|") : null,
      desc:   detailsLink.dataset.desc,
      benefits: detailsLink.dataset.benefits ? detailsLink.dataset.benefits.split("|") : [],
      ingredients: detailsLink.dataset.ingredients,
      howto:  detailsLink.dataset.howto,
      warnings: detailsLink.dataset.warnings
    };

    openDetails(data);
  });
});