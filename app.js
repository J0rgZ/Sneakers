// Variable global del carrito
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Variables del Coverflow
let currentIndex = 0;
let isAnimating = false;
let autoplayInterval = null;
let isPlaying = true;

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        contador.textContent = carrito.length;
    }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(productoId) {
    // Buscar el producto en el array productos
    const producto = productos.find(p => p.id === productoId);
    
    if (producto) {
        // Añadir el producto al carrito
        carrito.push(producto);
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar el contador
        actualizarContadorCarrito();
        
        // Mostrar notificación moderna
        mostrarNotificacion('✅ Producto añadido al carrito');
    }
}

// Función para agregar el producto actual del coverflow
function agregarProductoActual() {
    if (productos[currentIndex]) {
        agregarAlCarrito(productos[currentIndex].id);
    }
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    
    const colores = {
        success: { bg: 'linear-gradient(135deg, #4ecdc4, #44a08d)', shadow: 'rgba(78, 205, 196, 0.4)' },
        warning: { bg: 'linear-gradient(135deg, #ffc107, #ff9800)', shadow: 'rgba(255, 193, 7, 0.4)' },
        error: { bg: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)', shadow: 'rgba(255, 107, 107, 0.4)' },
        info: { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102, 126, 234, 0.4)' }
    };
    
    const color = colores[tipo] || colores.success;
    
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${color.bg};
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 10px 30px ${color.shadow};
        z-index: 10000;
        font-weight: 700;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Inicializar Coverflow 3D
function inicializarCoverflow() {
    const coverflow = document.getElementById('coverflow');
    const dotsContainer = document.getElementById('dots');
    const currentTitle = document.getElementById('current-title');
    const currentDescription = document.getElementById('current-description');
    const currentPrice = document.getElementById('current-price');
    const btnAddCurrent = document.getElementById('btn-add-current');
    
    if (!coverflow) return;
    
    // Limpiar coverflow
    coverflow.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    // Crear items del coverflow
    productos.forEach((producto, index) => {
        const item = document.createElement('div');
        item.className = 'coverflow-item';
        item.setAttribute('data-index', index);
        item.innerHTML = `
            <div class="cover image-loading">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
            </div>
            <div class="reflection"></div>
        `;
        coverflow.appendChild(item);
        
        // Crear dots
        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.onclick = () => goToIndex(index);
            dotsContainer.appendChild(dot);
        }
    });
    
    // Inicializar imágenes y reflejos
    const items = document.querySelectorAll('.coverflow-item');
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        const reflection = item.querySelector('.reflection');
        
        img.onload = function() {
            this.parentElement.classList.remove('image-loading');
            if (reflection) {
                reflection.style.backgroundImage = `url(${this.src})`;
                reflection.style.backgroundSize = 'cover';
                reflection.style.backgroundPosition = 'center';
            }
        };
        
        img.onerror = function() {
            this.parentElement.classList.add('image-loading');
        };
        
        // Click en item para seleccionar
        item.addEventListener('click', () => goToIndex(index));
    });
    
    // Actualizar coverflow
    updateCoverflow();
    
    // Focus en el contenedor para navegación con teclado
    const container = document.querySelector('.coverflow-container');
    if (container) {
        container.focus();
    }
}

// Actualizar posición del coverflow
function updateCoverflow() {
    if (isAnimating) return;
    isAnimating = true;
    
    const items = document.querySelectorAll('.coverflow-item');
    const dots = document.querySelectorAll('.dot');
    const currentTitle = document.getElementById('current-title');
    const currentDescription = document.getElementById('current-description');
    const currentPrice = document.getElementById('current-price');
    
    if (items.length === 0) return;
    
    items.forEach((item, index) => {
        let offset = index - currentIndex;
        
        // Manejar wrap circular
        if (offset > productos.length / 2) {
            offset = offset - productos.length;
        } else if (offset < -productos.length / 2) {
            offset = offset + productos.length;
        }
        
        const absOffset = Math.abs(offset);
        const sign = Math.sign(offset);
        
        let translateX = offset * 280;
        let translateZ = -absOffset * 200;
        let rotateY = -sign * Math.min(absOffset * 60, 60);
        let opacity = 1 - (absOffset * 0.2);
        let scale = 1 - (absOffset * 0.1);
        
        if (absOffset > 3) {
            opacity = 0;
            translateX = sign * 800;
        }
        
        item.style.transform = `
            translateX(${translateX}px) 
            translateZ(${translateZ}px) 
            rotateY(${rotateY}deg)
            scale(${scale})
        `;
        item.style.opacity = opacity;
        item.style.zIndex = 100 - absOffset;
        
        item.classList.toggle('active', index === currentIndex);
    });
    
    // Actualizar dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
    
    // Actualizar información del producto actual
    if (productos[currentIndex]) {
        const producto = productos[currentIndex];
        if (currentTitle) {
            currentTitle.textContent = producto.nombre;
            currentTitle.style.animation = 'none';
            setTimeout(() => {
                currentTitle.style.animation = 'fadeIn 0.6s forwards';
            }, 10);
        }
        if (currentDescription) {
            currentDescription.textContent = 'Estilo y comodidad en cada paso';
            currentDescription.style.animation = 'none';
            setTimeout(() => {
                currentDescription.style.animation = 'fadeIn 0.6s forwards';
            }, 10);
        }
        if (currentPrice) {
            currentPrice.textContent = `S/ ${producto.precio.toFixed(2)}`;
        }
        if (document.getElementById('btn-add-current')) {
            document.getElementById('btn-add-current').setAttribute('onclick', `agregarAlCarrito(${producto.id})`);
        }
    }
    
    setTimeout(() => {
        isAnimating = false;
    }, 600);
}

// Navegar coverflow
function navigateCoverflow(direction) {
    if (isAnimating) return;
    
    currentIndex = currentIndex + direction;
    
    if (currentIndex < 0) {
        currentIndex = productos.length - 1;
    } else if (currentIndex >= productos.length) {
        currentIndex = 0;
    }
    
    updateCoverflow();
    handleUserInteraction();
}

// Ir a índice específico
function goToIndex(index) {
    if (isAnimating || index === currentIndex) return;
    currentIndex = index;
    updateCoverflow();
    handleUserInteraction();
}

// Autoplay
function startAutoplay() {
    if (autoplayInterval) return;
    autoplayInterval = setInterval(() => {
        if (!isAnimating) {
            currentIndex = (currentIndex + 1) % productos.length;
            updateCoverflow();
        }
    }, 4000);
    isPlaying = true;
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    if (playIcon) playIcon.style.display = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    isPlaying = false;
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
}

function toggleAutoplay() {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
}

function handleUserInteraction() {
    stopAutoplay();
}

// Navegación con teclado
function setupKeyboardNavigation() {
    const container = document.querySelector('.coverflow-container');
    if (!container) return;
    
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            navigateCoverflow(-1);
        } else if (e.key === 'ArrowRight') {
            navigateCoverflow(1);
        }
    });
}

// Touch/Swipe support
function setupTouchNavigation() {
    const container = document.querySelector('.coverflow-container');
    if (!container) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isSwiping = false;
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        
        if (Math.abs(diffX) > swipeThreshold) {
            handleUserInteraction();
            if (diffX > 0) {
                navigateCoverflow(1);
            } else {
                navigateCoverflow(-1);
            }
        }
    }
}

// Función para cargar productos en el catálogo
function cargarProductos() {
    const catalogoProductos = document.getElementById('catalogo-productos');
    const productosDestacados = document.getElementById('productos-destacados');
    
    // Cargar productos en el catálogo completo
    if (catalogoProductos) {
        catalogoProductos.innerHTML = '';
        
        productos.forEach(producto => {
            const productoHTML = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 250px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text fw-bold fs-4">S/ ${producto.precio.toFixed(2)}</p>
                            <button class="btn btn-primary mt-auto" onclick="agregarAlCarrito(${producto.id})">
                                <i class="bi bi-cart-plus"></i> Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
            catalogoProductos.innerHTML += productoHTML;
        });
    }
    
    // Cargar productos destacados en la página principal (solo los primeros 3)
    if (productosDestacados) {
        productosDestacados.innerHTML = '';
        
        const destacados = productos.slice(0, 3);
        destacados.forEach(producto => {
            const productoHTML = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 250px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text fw-bold fs-4">S/ ${producto.precio.toFixed(2)}</p>
                            <button class="btn btn-primary mt-auto" onclick="agregarAlCarrito(${producto.id})">
                                <i class="bi bi-cart-plus"></i> Añadir al Carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productosDestacados.innerHTML += productoHTML;
        });
    }
}

// Función para cargar el resumen del checkout
function cargarResumenCheckout() {
    const resumenPedido = document.getElementById('resumen-pedido');
    const checkoutContent = document.getElementById('checkout-content');
    const carritoVacio = document.getElementById('carrito-vacio');
    
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        if (checkoutContent) checkoutContent.style.display = 'none';
        if (carritoVacio) carritoVacio.style.display = 'block';
        if (resumenPedido) {
            resumenPedido.innerHTML = '<p class="text-muted text-center py-4">No hay productos en el carrito.</p>';
        }
        return;
    }
    
    // Mostrar contenido del checkout
    if (checkoutContent) checkoutContent.style.display = 'block';
    if (carritoVacio) carritoVacio.style.display = 'none';
    
    if (resumenPedido) {
        let subtotal = 0;
        let html = '<div class="checkout-items">';
        
        // Agrupar productos por nombre y contar cantidad
        const productosAgrupados = {};
        carrito.forEach(producto => {
            if (productosAgrupados[producto.id]) {
                productosAgrupados[producto.id].cantidad++;
            } else {
                productosAgrupados[producto.id] = {
                    ...producto,
                    cantidad: 1
                };
            }
        });
        
        // Mostrar productos agrupados
        Object.values(productosAgrupados).forEach((producto, index) => {
            const totalProducto = producto.precio * producto.cantidad;
            subtotal += totalProducto;
            
            html += `
                <div class="checkout-item">
                    <div class="item-image">
                        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='https://via.placeholder.com/80'">
                    </div>
                    <div class="item-details">
                        <h6 class="item-name">${producto.nombre}</h6>
                        <div class="item-meta">
                            <span class="item-quantity">Cantidad: ${producto.cantidad}</span>
                            <span class="item-price">S/ ${producto.precio.toFixed(2)} c/u</span>
                        </div>
                    </div>
                    <div class="item-total">
                        <strong>S/ ${totalProducto.toFixed(2)}</strong>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Calcular envío (gratis si es mayor a 100)
        const costoEnvio = subtotal >= 100 ? 0 : 15.00;
        const total = subtotal + costoEnvio;
        
        // Resumen de totales
        html += `
            <div class="checkout-totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>S/ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Envío:</span>
                    <span>${costoEnvio === 0 ? '<span class="text-success">GRATIS</span>' : 'S/ ' + costoEnvio.toFixed(2)}</span>
                </div>
                ${subtotal < 100 ? '<div class="total-row text-success"><small><i class="bi bi-info-circle"></i> Agrega S/ ' + (100 - subtotal).toFixed(2) + ' más para envío gratis</small></div>' : ''}
                <div class="total-row total-final">
                    <span><strong>Total:</strong></span>
                    <span><strong class="total-amount">S/ ${total.toFixed(2)}</strong></span>
                </div>
            </div>
        `;
        
        resumenPedido.innerHTML = html;
    }
}

// Validar formulario
function validarFormulario() {
    const form = document.getElementById('form-pago');
    if (!form) return false;
    
    let esValido = true;
    const campos = {
        nombre: {
            elemento: document.getElementById('nombre'),
            mensaje: 'Por favor ingresa tu nombre completo'
        },
        telefono: {
            elemento: document.getElementById('telefono'),
            mensaje: 'Por favor ingresa un número de teléfono válido',
            validacion: (valor) => /^[0-9]{9,12}$/.test(valor.replace(/\s/g, ''))
        },
        email: {
            elemento: document.getElementById('email'),
            mensaje: 'Por favor ingresa un correo electrónico válido',
            validacion: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
        },
        direccion: {
            elemento: document.getElementById('direccion'),
            mensaje: 'Por favor ingresa tu dirección completa'
        },
        ciudad: {
            elemento: document.getElementById('ciudad'),
            mensaje: 'Por favor ingresa tu ciudad'
        },
        tarjeta: {
            elemento: document.getElementById('tarjeta'),
            mensaje: 'Por favor ingresa un número de tarjeta válido',
            validacion: (valor) => valor.replace(/\s/g, '').length >= 13
        },
        terminos: {
            elemento: document.getElementById('terminos'),
            mensaje: 'Debes aceptar los términos y condiciones'
        }
    };
    
    // Limpiar validaciones previas
    Object.values(campos).forEach(campo => {
        if (campo.elemento) {
            campo.elemento.classList.remove('is-invalid', 'is-valid');
            const feedback = campo.elemento.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = '';
            }
        }
    });
    
    // Validar cada campo
    Object.entries(campos).forEach(([key, campo]) => {
        if (!campo.elemento) return;
        
        const valor = campo.elemento.type === 'checkbox' ? campo.elemento.checked : campo.elemento.value.trim();
        let campoValido = true;
        
        if (campo.elemento.hasAttribute('required') && !valor) {
            campoValido = false;
        } else if (valor && campo.validacion && !campo.validacion(valor)) {
            campoValido = false;
        }
        
        if (!campoValido) {
            esValido = false;
            campo.elemento.classList.add('is-invalid');
            const feedback = campo.elemento.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = campo.mensaje;
            }
        } else if (valor) {
            campo.elemento.classList.add('is-valid');
        }
    });
    
    return esValido;
}

// Formatear número de tarjeta
function formatearTarjeta(input) {
    let valor = input.value.replace(/\s/g, '');
    let valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
    input.value = valorFormateado;
}

// Formatear fecha de vencimiento
function formatearFechaVencimiento(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    input.value = valor;
}

// Mostrar modal de confirmación
function mostrarConfirmacion(datosFormulario) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const modalBody = document.getElementById('confirm-modal-body');
    
    if (!modalBody) return;
    
    // Calcular totales
    let subtotal = 0;
    carrito.forEach(p => subtotal += p.precio);
    const costoEnvio = subtotal >= 100 ? 0 : 15.00;
    const total = subtotal + costoEnvio;
    
    modalBody.innerHTML = `
        <div class="confirm-content">
            <div class="confirm-icon">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
            </div>
            <h5 class="text-center mb-4">Revisa tu pedido antes de confirmar</h5>
            
            <div class="confirm-section">
                <h6><i class="bi bi-person"></i> Datos de Contacto</h6>
                <p><strong>Nombre:</strong> ${datosFormulario.nombre}</p>
                <p><strong>Email:</strong> ${datosFormulario.email}</p>
                <p><strong>Teléfono:</strong> ${datosFormulario.telefono}</p>
            </div>
            
            <div class="confirm-section">
                <h6><i class="bi bi-geo-alt"></i> Dirección de Envío</h6>
                <p>${datosFormulario.direccion}</p>
                <p>${datosFormulario.ciudad}${datosFormulario.codigoPostal ? ', CP: ' + datosFormulario.codigoPostal : ''}</p>
            </div>
            
            <div class="confirm-section">
                <h6><i class="bi bi-bag"></i> Resumen del Pedido</h6>
                <p><strong>Productos:</strong> ${carrito.length} artículo(s)</p>
                <p><strong>Subtotal:</strong> S/ ${subtotal.toFixed(2)}</p>
                <p><strong>Envío:</strong> ${costoEnvio === 0 ? 'GRATIS' : 'S/ ' + costoEnvio.toFixed(2)}</p>
                <p class="total-confirm"><strong>Total a Pagar:</strong> S/ ${total.toFixed(2)}</p>
            </div>
            
            <div class="alert alert-info mt-3" style="background: rgba(78, 205, 196, 0.2); border-color: rgba(78, 205, 196, 0.5);">
                <i class="bi bi-info-circle"></i> <small>Esta es una simulación. No se procesará ningún pago real.</small>
            </div>
        </div>
    `;
    
    modal.show();
}

// Función para simular el pago
function simularPago(event) {
    event.preventDefault();
    
    // Validar formulario
    if (!validarFormulario()) {
        mostrarNotificacion('⚠️ Por favor completa todos los campos requeridos correctamente', 'warning');
        document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Obtener datos del formulario
    const datosFormulario = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        ciudad: document.getElementById('ciudad').value.trim(),
        codigoPostal: document.getElementById('codigo-postal').value.trim(),
        tarjeta: document.getElementById('tarjeta').value.trim(),
        fechaVencimiento: document.getElementById('fecha-vencimiento').value.trim(),
        cvv: document.getElementById('cvv').value.trim()
    };
    
    // Avanzar al paso 2 (datos)
    avanzarPaso(2);
    
    // Mostrar modal de confirmación
    mostrarConfirmacion(datosFormulario);
    
    // Configurar botón de confirmación
    const btnConfirmar = document.getElementById('btn-confirmar-pago');
    if (btnConfirmar) {
        btnConfirmar.onclick = () => {
            avanzarPaso(3);
            procesarPago(datosFormulario);
        };
    }
}

// Procesar el pago después de confirmación
function procesarPago(datosFormulario) {
    const btnConfirmar = document.getElementById('btn-confirmar-pago');
    if (btnConfirmar) {
        btnConfirmar.disabled = true;
        btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    }
    
    // Simular procesamiento
    setTimeout(() => {
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
        if (modal) modal.hide();
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito(datosFormulario);
        
        // Limpiar el carrito
        localStorage.removeItem('carrito');
        carrito = [];
        actualizarContadorCarrito();
        
        // Redirigir después de 5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    }, 2000);
}

// Mostrar mensaje de éxito
function mostrarMensajeExito(datosFormulario) {
    const checkoutSection = document.getElementById('checkout-section');
    if (!checkoutSection) return;
    
    // Calcular totales
    let subtotal = 0;
    carrito.forEach(p => subtotal += p.precio);
    const costoEnvio = subtotal >= 100 ? 0 : 15.00;
    const total = subtotal + costoEnvio;
    
    checkoutSection.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <h1 class="success-title">¡Compra Exitosa!</h1>
            <p class="success-subtitle">Gracias por tu compra, ${datosFormulario.nombre.split(' ')[0]}</p>
            
            <div class="success-details">
                <div class="success-card">
                    <h5><i class="bi bi-receipt"></i> Resumen de tu Pedido</h5>
                    <p><strong>Número de Pedido:</strong> #${Math.floor(Math.random() * 1000000)}</p>
                    <p><strong>Total Pagado:</strong> S/ ${total.toFixed(2)}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
                
                <div class="success-card">
                    <h5><i class="bi bi-envelope"></i> Confirmación Enviada</h5>
                    <p>Hemos enviado un correo de confirmación a:</p>
                    <p class="email-confirm"><strong>${datosFormulario.email}</strong></p>
                </div>
                
                <div class="success-card">
                    <h5><i class="bi bi-truck"></i> Información de Envío</h5>
                    <p>Tu pedido será enviado a:</p>
                    <p><strong>${datosFormulario.direccion}</strong></p>
                    <p>${datosFormulario.ciudad}</p>
                    <p class="shipping-time"><i class="bi bi-clock"></i> Tiempo estimado: 3-5 días hábiles</p>
                </div>
            </div>
            
            <div class="success-actions">
                <a href="index.html" class="btn btn-primary btn-lg">
                    <i class="bi bi-house"></i> Volver al Inicio
                </a>
                <a href="productos.html" class="btn btn-outline-primary btn-lg">
                    <i class="bi bi-bag"></i> Seguir Comprando
                </a>
            </div>
            
            <p class="success-note">
                <i class="bi bi-info-circle"></i> Recuerda que esta es una simulación. No se procesó ningún pago real.
            </p>
        </div>
    `;
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll to top
function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Header scroll effect
function setupHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Actualizar progreso del checkout
function actualizarProgresoCheckout() {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    if (step1 && step2 && step3) {
        // Por defecto, estamos en el paso 1 (resumen)
        step1.classList.add('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
    }
}

// Avanzar al siguiente paso
function avanzarPaso(paso) {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    if (paso === 2 && step2) {
        step1?.classList.add('completed');
        step2.classList.add('active');
    } else if (paso === 3 && step3) {
        step1?.classList.add('completed');
        step2?.classList.add('completed');
        step3.classList.add('active');
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mainMenu = document.getElementById('mainMenu');
    
    if (!menuToggle || !mainMenu) return;
    
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer click en un item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainMenu.classList.remove('active');
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar coverflow
    inicializarCoverflow();
    
    // Cargar productos
    cargarProductos();
    
    // Cargar resumen del checkout
    cargarResumenCheckout();
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
    
    // Setup navegación
    setupKeyboardNavigation();
    setupTouchNavigation();
    
    // Setup UI
    setupScrollToTop();
    setupHeaderScroll();
    setupMobileMenu();
    
    // Iniciar autoplay
    startAutoplay();
    
    // Listener para el formulario de pago
    const formPago = document.getElementById('form-pago');
    if (formPago) {
        formPago.addEventListener('submit', simularPago);
        
        // Formatear tarjeta mientras se escribe
        const tarjetaInput = document.getElementById('tarjeta');
        if (tarjetaInput) {
            tarjetaInput.addEventListener('input', () => formatearTarjeta(tarjetaInput));
        }
        
        // Formatear fecha de vencimiento
        const fechaInput = document.getElementById('fecha-vencimiento');
        if (fechaInput) {
            fechaInput.addEventListener('input', () => formatearFechaVencimiento(fechaInput));
        }
        
        // Validación en tiempo real
        const inputs = formPago.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    validarFormulario();
                }
            });
        });
    }
    
    // Actualizar paso del progreso
    actualizarProgresoCheckout();
});

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
