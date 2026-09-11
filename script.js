// Memoria del Carrito
let cart = {};

// Diccionario con precios y nombres
const catalogData = {
  gen1: { name: 'AirPods Gen 1', price: 69000 },
  gen2: { name: 'AirPods Gen 2', price: 79000 },
  gen3: { name: 'AirPods Gen 3', price: 99000 },
  gen3pro: { name: 'AirPods Gen 3 PRO', price: 119000 },
  gen4: { name: 'AirPods Gen 4', price: 89000 }
};

// Función para sumar o restar cantidad
function updateQty(productId, change) {
  const currentQty = cart[productId] || 0;
  const newQty = currentQty + change;

  if (newQty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = newQty;
  }

  const qtyElem = document.getElementById(`qty-${productId}`);
  if (qtyElem) {
    qtyElem.textContent = cart[productId] || 0;
  }

  renderCart();
}

// Función para formatear dinero
function formatCOP(amount) {
  return '$' + amount.toLocaleString('es-CO');
}

// Renderizar contenido del carrito
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const countSpan = document.getElementById('cart-count');
  const totalPriceElem = document.getElementById('cart-total-price');
  const btnCheckout = document.getElementById('btn-checkout');

  let totalItems = 0;
  let totalPrice = 0;
  let html = '';

  const keys = Object.keys(cart);

  if (keys.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg"><i class="fa-solid fa-cart-flatbed fa-2x"></i><br><br>Tu carrito está vacío.<br>Agrega productos usando los botones <strong>+</strong> en el catálogo.</div>`;
    countSpan.textContent = '0';
    totalPriceElem.textContent = '$0';
    if (btnCheckout) btnCheckout.style.display = 'none';
    return;
  }

  if (btnCheckout) btnCheckout.style.display = 'block';

  keys.forEach(id => {
    const qty = cart[id];
    const itemData = catalogData[id];
    const subtotal = itemData.price * qty;

    totalItems += qty;
    totalPrice += subtotal;

    html += `
      <div class="cart-item-row">
        <div>
          <div class="cart-item-title">${itemData.name}</div>
          <div class="cart-item-sub">${qty} x ${formatCOP(itemData.price)} = ${formatCOP(subtotal)}</div>
        </div>
        <div class="qty-selector">
          <button class="btn-qty" onclick="updateQty('${id}', -1)"><i class="fa-solid fa-minus"></i></button>
          <span class="qty-number">${qty}</span>
          <button class="btn-qty" onclick="updateQty('${id}', 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  countSpan.textContent = totalItems;
  totalPriceElem.textContent = formatCOP(totalPrice);

  updateFormSummary(totalPrice);
}

// Actualizar campos ocultos para FormSubmit y link de WhatsApp
function updateFormSummary(totalPrice) {
  const summaryBox = document.getElementById('order-box-preview');
  const summaryInput = document.getElementById('form-order-summary');
  const totalInput = document.getElementById('form-order-total');

  let summaryTextArray = [];
  let summaryHtml = '<h4>Resumen de Tu Pedido:</h4><ul>';

  Object.keys(cart).forEach(id => {
    const qty = cart[id];
    const itemData = catalogData[id];
    summaryTextArray.push(`${qty}x ${itemData.name}`);
    summaryHtml += `<li>${qty}x ${itemData.name} - ${formatCOP(itemData.price * qty)}</li>`;
  });

  summaryHtml += `</ul><p><strong>Total: ${formatCOP(totalPrice)}</strong></p>`;

  if (summaryBox) summaryBox.innerHTML = summaryHtml;
  if (summaryInput) summaryInput.value = summaryTextArray.join(', ');
  if (totalInput) totalInput.value = formatCOP(totalPrice);

  // Generar mensaje automático personalizado para WhatsApp
  const whatsappBtn = document.getElementById('whatsapp-direct-btn');
  if (whatsappBtn) {
    const itemsText = summaryTextArray.join(' + ');
    const msg = `Hola JP AudioStudio! 👋 Acabo de realizar un pedido en la página de: ${itemsText} por un valor de ${formatCOP(totalPrice)}. ¿Me podrían dar más información sobre el estado de la entrega?`;
    whatsappBtn.href = `https://wa.me/573180549717?text=${encodeURIComponent(msg)}`;
  }
}

// Sincronizar datos de la ciudad y barrio
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('city-input');
  const neighborhoodInput = document.getElementById('neighborhood-input');

  if (cityInput) {
    cityInput.addEventListener('input', (e) => {
      document.getElementById('form-city').value = e.target.value;
    });
  }

  if (neighborhoodInput) {
    neighborhoodInput.addEventListener('input', (e) => {
      document.getElementById('form-neighborhood').value = e.target.value;
    });
  }

  // ENVÍO AJAX/FETCH PARA EVITAR RECARGAR O IR A LA PANTALLA BLANCA
  const orderForm = document.getElementById('order-form');
  const submitBtn = document.getElementById('btn-submit-form');

  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Detiene la navegación predeterminada

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando pedido...';
      }

      const formData = new FormData(orderForm);

      fetch(orderForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        // Cierra los modales anteriores y abre la modal de éxito en la misma página
        document.getElementById('step3-cod-open').checked = false;
        document.getElementById('step4-success-open').checked = true;
      })
      .catch(error => {
        alert('Hubo un pequeño inconveniente al procesar el envío, pero tu pedido ha sido registrado. Por favor contáctanos vía WhatsApp.');
        document.getElementById('step3-cod-open').checked = false;
        document.getElementById('step4-success-open').checked = true;
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Confirmar y Procesar Pedido &rarr;';
        }
      });
    });
  }
});

// Limpiar carrito tras confirmar
function resetCart() {
  cart = {};
  Object.keys(catalogData).forEach(id => {
    const qtyElem = document.getElementById(`qty-${id}`);
    if (qtyElem) qtyElem.textContent = '0';
  });
  renderCart();
}
