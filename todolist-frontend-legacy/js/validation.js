/**
 * Módulo de validación en tiempo real
 * 
 * Este módulo proporciona validación de campos en tiempo real
 * utilizando los endpoints de validación del backend.
 * 
 * Conectado a API de Render: https://todolist-api-ycg7.onrender.com
 */

import { authService } from './api.js';

// Importar la URL base de la API
// Configuración dinámica de API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080' 
    : 'https://todolist-juan-api-e3dkfgd3cxbpgaaf.canadacentral-01.azurewebsites.net';

/**
 * Debounce function para evitar demasiadas llamadas al API
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Verifica si un username está disponible
 */
async function checkUsernameAvailability(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/check-username?username=${encodeURIComponent(username)}`);
        const isAvailable = await response.json();
        return isAvailable;
    } catch (error) {
        console.error('Error verificando username:', error);
        return null; // En caso de error, no mostramos validación
    }
}

/**
 * Verifica si un email está disponible
 */
async function checkEmailAvailability(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/check-email?email=${encodeURIComponent(email)}`);
        const isAvailable = await response.json();
        return isAvailable;
    } catch (error) {
        console.error('Error verificando email:', error);
        return null; // En caso de error, no mostramos validación
    }
}

/**
 * Muestra feedback visual para un campo
 */
function showFieldFeedback(field, isValid, message) {
    // Remover clases previas
    field.classList.remove('is-valid', 'is-invalid');
    
    // Buscar o crear elemento de feedback
    let feedbackElement = field.parentNode.querySelector('.validation-feedback');
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'validation-feedback small mt-1';
        field.parentNode.appendChild(feedbackElement);
    }
    
    if (isValid === null) {
        // No hay validación (error de red, etc.)
        feedbackElement.textContent = '';
        feedbackElement.className = 'validation-feedback small mt-1';
        return;
    }
    
    if (isValid) {
        field.classList.add('is-valid');
        feedbackElement.textContent = '✓ ' + message;
        feedbackElement.className = 'validation-feedback small mt-1 text-success';
    } else {
        field.classList.add('is-invalid');
        feedbackElement.textContent = '✗ ' + message;
        feedbackElement.className = 'validation-feedback small mt-1 text-danger';
    }
}

/**
 * Valida un campo de username
 */
const validateUsername = debounce(async (field) => {
    const username = field.value.trim();
    
    if (!username) {
        showFieldFeedback(field, null, '');
        return;
    }
    
    if (username.length < 3) {
        showFieldFeedback(field, false, 'El username debe tener al menos 3 caracteres');
        return;
    }
    
    if (username.length > 20) {
        showFieldFeedback(field, false, 'El username no puede tener más de 20 caracteres');
        return;
    }
    
    // Verificar disponibilidad en el servidor
    const isAvailable = await checkUsernameAvailability(username);
    if (isAvailable === true) {
        showFieldFeedback(field, true, 'Username disponible');
    } else if (isAvailable === false) {
        showFieldFeedback(field, false, 'Este username ya está en uso');
    }
}, 500);

/**
 * Valida un campo de email
 */
const validateEmail = debounce(async (field) => {
    const email = field.value.trim();
    
    if (!email) {
        showFieldFeedback(field, null, '');
        return;
    }
    
    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldFeedback(field, false, 'Formato de email inválido');
        return;
    }
    
    // Verificar disponibilidad en el servidor
    const isAvailable = await checkEmailAvailability(email);
    if (isAvailable === true) {
        showFieldFeedback(field, true, 'Email disponible');
    } else if (isAvailable === false) {
        showFieldFeedback(field, false, 'Este email ya está en uso');
    }
}, 500);

/**
 * Valida fortaleza de contraseña
 */
function validatePassword(field) {
    const password = field.value;
    
    if (!password) {
        showFieldFeedback(field, null, '');
        return;
    }
    
    const requirements = [
        { regex: /.{6,}/, message: 'al menos 6 caracteres' },
        { regex: /[0-9]/, message: 'al menos 1 número' },
        { regex: /[a-z]/, message: 'al menos 1 letra minúscula' },
        { regex: /[A-Z]/, message: 'al menos 1 letra mayúscula' },
        { regex: /[@#$%^&+=]/, message: 'al menos 1 carácter especial (@#$%^&+=)' }
    ];
    
    const failedRequirements = requirements.filter(req => !req.regex.test(password));
    
    if (failedRequirements.length === 0) {
        showFieldFeedback(field, true, 'Contraseña segura');
    } else {
        const missingReqs = failedRequirements.map(req => req.message).join(', ');
        showFieldFeedback(field, false, `Falta: ${missingReqs}`);
    }
}

/**
 * Inicializa la validación en tiempo real para un formulario
 */
export function initRealTimeValidation() {
    // Validación para campo de username
    const usernameFields = document.querySelectorAll('input[type="text"]#username');
    usernameFields.forEach(field => {
        field.addEventListener('input', () => validateUsername(field));
        field.addEventListener('blur', () => validateUsername(field));
    });
    
    // Validación para campo de email
    const emailFields = document.querySelectorAll('input[type="email"]#email');
    emailFields.forEach(field => {
        field.addEventListener('input', () => validateEmail(field));
        field.addEventListener('blur', () => validateEmail(field));
    });
    
    // Validación para campo de password
    const passwordFields = document.querySelectorAll('input[type="password"]#password');
    passwordFields.forEach(field => {
        field.addEventListener('input', () => validatePassword(field));
    });
    
    // Validación para confirmación de contraseña
    const confirmPasswordField = document.getElementById('confirmPassword');
    const passwordField = document.getElementById('password');
    
    if (confirmPasswordField && passwordField) {
        function validatePasswordMatch() {
            const password = passwordField.value;
            const confirmPassword = confirmPasswordField.value;
            
            if (!confirmPassword) {
                confirmPasswordField.classList.remove('is-valid', 'is-invalid');
                return;
            }
            
            if (password === confirmPassword) {
                confirmPasswordField.classList.remove('is-invalid');
                confirmPasswordField.classList.add('is-valid');
                confirmPasswordField.setCustomValidity('');
            } else {
                confirmPasswordField.classList.remove('is-valid');
                confirmPasswordField.classList.add('is-invalid');
                confirmPasswordField.setCustomValidity('Las contraseñas no coinciden');
            }
        }
        
        passwordField.addEventListener('input', validatePasswordMatch);
        confirmPasswordField.addEventListener('input', validatePasswordMatch);
        confirmPasswordField.addEventListener('blur', validatePasswordMatch);
    }
}

/**
 * Verifica si un formulario es válido antes del envío
 */
export function isFormValid(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const invalidFields = form.querySelectorAll('.is-invalid');
    const emptyRequiredFields = form.querySelectorAll('input[required]').length;
    const filledRequiredFields = Array.from(form.querySelectorAll('input[required]'))
        .filter(field => field.value.trim() !== '').length;
    
    return invalidFields.length === 0 && emptyRequiredFields === filledRequiredFields;
}

// Inicializar validaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página de registro
    if (document.getElementById('registerForm')) {
        initRealTimeValidation();
    }
});
// FORZAR DEPLOY - Tue Aug  5 22:51:28 -05 2025
// Test webhook - Wed Aug  6 05:38:42 -05 2025
// Test deploy hook - Wed Aug  6 05:42:29 -05 2025
