/**
 * Módulo para manejar la autenticación en el frontend
 * 
 * Este módulo proporciona funciones para manejar el inicio de sesión, registro,
 * cierre de sesión y verificación del estado de autenticación.
 */

import { authService, isAuthenticated, requireAuth } from './api.js';

/**
 * Inicializa la autenticación en la aplicación
 * Verifica si el usuario está autenticado y actualiza la UI en consecuencia
 */
export function initAuth() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'register.html', ''];
    
    // Si el usuario no está autenticado y no está en una página pública, redirigir al login
    if (!token && !publicPages.includes(currentPath)) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Si el usuario está autenticado y está en una página de autenticación, redirigir al inicio
    if (token && (currentPath === 'login.html' || currentPath === 'register.html')) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Si hay un token, intentar cargar el perfil del usuario
    if (token) {
        loadUserProfile();
    }
    
    return true;
}

/**
 * Carga el perfil del usuario actual y actualiza la UI
 */
async function loadUserProfile() {
    try {
        const userProfile = await authService.getProfile();
        updateUIForAuthenticatedUser(userProfile);
    } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
        // Si hay un error de autenticación, limpiar el token y redirigir al login
        if (error.status === 401) {
            authService.logout();
        }
    }
}

/**
 * Actualiza la UI para un usuario autenticado
 * @param {Object} user - Datos del usuario
 */
function updateUIForAuthenticatedUser(user) {
    // Actualizar el email del usuario en la barra de navegación
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
        userEmailElement.textContent = user.email || user.username;
    }
    
    // Mostrar/ocultar elementos según la autenticación
    const authElements = document.querySelectorAll('.auth-only');
    authElements.forEach(element => {
        element.style.display = 'block';
    });
    
    const guestElements = document.querySelectorAll('.guest-only');
    guestElements.forEach(element => {
        element.style.display = 'none';
    });
}

/**
 * Maneja el envío del formulario de inicio de sesión
 * @param {Event} event - Evento de envío del formulario
 */
export async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = form.querySelector('.spinner-border');
    const errorAlert = document.getElementById('errorAlert');
    
    // Mostrar spinner y deshabilitar botón
    submitButton.disabled = true;
    if (spinner) spinner.classList.remove('d-none');
    if (errorAlert) errorAlert.classList.add('d-none');
    
    try {
        const response = await authService.login(username, password);
        
        if (!response || !response.token) {
            throw new Error('No se recibió un token de autenticación válido');
        }
        
        console.log('Token recibido:', response.token.substring(0, 20) + '...');
        
        // Guardar el token y redirigir
        localStorage.setItem('token', response.token);
        console.log('Token guardado en localStorage');
        
        // Redirigir después de un breve retraso para asegurar que el token se guarde
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
        
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        
        // Mostrar mensaje de error detallado
        if (errorAlert) {
            let errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
            
            if (error.message.includes('403')) {
                errorMessage = 'Usuario o contraseña incorrectos';
            } else if (error.message.includes('network')) {
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            errorAlert.textContent = errorMessage;
            errorAlert.classList.remove('d-none');
        }
        
    } finally {
        // Restaurar el estado del formulario
        submitButton.disabled = false;
        if (spinner) spinner.classList.add('d-none');
    }
}

/**
 * Maneja el envío del formulario de registro
 * @param {Event} event - Evento de envío del formulario
 */
export async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.querySelector('#username').value.trim();
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = document.getElementById('registerSpinner');
    const errorAlert = document.getElementById('errorAlert');
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        if (errorAlert) {
            errorAlert.textContent = 'Las contraseñas no coinciden';
            errorAlert.classList.remove('alert-success');
            errorAlert.classList.add('alert-danger');
            errorAlert.classList.remove('d-none');
        }
        return;
    }
    
    // Validar campos vacíos
    if (!username || !email || !password) {
        if (errorAlert) {
            errorAlert.textContent = 'Todos los campos son obligatorios';
            errorAlert.classList.remove('alert-success');
            errorAlert.classList.add('alert-danger');
            errorAlert.classList.remove('d-none');
        }
        return;
    }
    
    // Mostrar spinner y deshabilitar botón
    submitButton.disabled = true;
    if (spinner) spinner.classList.remove('d-none');
    if (errorAlert) errorAlert.classList.add('d-none');
    
    try {
        await authService.register(username, email, password);
        
        // Mostrar mensaje de éxito y redirigir al login
        if (errorAlert) {
            errorAlert.textContent = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
            errorAlert.classList.remove('alert-danger');
            errorAlert.classList.add('alert-success');
            errorAlert.classList.remove('d-none');
        }
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error en el registro:', error);
        
        // Mostrar mensaje de error
        if (errorAlert) {
            errorAlert.textContent = error.message || 'Error al registrar el usuario. Inténtalo de nuevo.';
            errorAlert.classList.remove('alert-success');
            errorAlert.classList.add('alert-danger');
            errorAlert.classList.remove('d-none');
        }
        
    } finally {
        // Restaurar el estado del formulario
        submitButton.disabled = false;
        if (spinner) spinner.classList.add('d-none');
    }
}

/**
 * Maneja el cierre de sesión
 */
export function handleLogout() {
    authService.logout();
}

// Inicializar la autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Módulo auth.js cargado - DOM listo');
    
    initAuth();
    
    // Asignar manejadores de eventos si los elementos existen
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Formulario de login encontrado, asignando evento');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('❌ Formulario de login NO encontrado');
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('✅ Formulario de registro encontrado, asignando evento');
        registerForm.addEventListener('submit', handleRegister);
    } else {
        console.log('ℹ️ Formulario de registro NO encontrado (normal si no estamos en register.html)');
    }
    
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        console.log('✅ Botón de logout encontrado, asignando evento');
        logoutButton.addEventListener('click', handleLogout);
    } else {
        console.log('ℹ️ Botón de logout NO encontrado (normal si no estamos logueados)');
    }
});

// Exportar funciones para uso global (necesario para los manejadores en línea en HTML)
window.authModule = {
    handleLogin,
    handleRegister,
    handleLogout
};