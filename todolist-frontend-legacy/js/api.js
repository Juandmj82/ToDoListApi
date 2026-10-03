/**
 * Módulo para manejar las llamadas a la API del backend
 */

// Configuración dinámica de API
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080' 
    : 'https://todolist-juan-api-e3dkfgd3cxbpgaaf.canadacentral-01.azurewebsites.net';

/**
 * Realiza una petición HTTP al backend
 */
async function fetchWithAuth(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        mode: 'cors'
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Si la respuesta es 204 No Content, devolvemos null
        if (response.status === 204) {
            return null;
        }
        
        // Si hay un error en la respuesta, lanzamos una excepción
        if (!response.ok) {
            // Para login/register, no redirigir automáticamente
            if (response.status === 401 || response.status === 403) {
                if (!endpoint.includes('/auth/')) {
                    localStorage.removeItem('token');
                    if (!window.location.pathname.endsWith('login.html')) {
                        window.location.href = 'login.html';
                    }
                }
            }
            
            // Intentar obtener el mensaje de error del servidor
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Si no se puede parsear el JSON, usar el mensaje por defecto
            }
            
            throw new Error(errorMessage);
        }
        
        // Parsear la respuesta JSON
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// Servicios de autenticación
export const authService = {
    login: async (username, password) => {
        return fetchWithAuth('/api/auth/login', 'POST', { username, password });
    },

    register: async (username, email, password) => {
        return fetchWithAuth('/api/auth/register', 'POST', { username, email, password });
    },

    getProfile: async () => {
        return fetchWithAuth('/api/users/me');
    },

    logout: () => {
        localStorage.removeItem('token');
        window.location.href = 'bienvenida.html';
    }
};

// Servicios de tareas
export const taskService = {
    getAllTasks: async (completed = null) => {
        let url = '/api/tasks';
        if (completed !== null) {
            url += `?completed=${completed}`;
        }
        return fetchWithAuth(url);
    },

    getTaskById: async (id) => {
        return fetchWithAuth(`/api/tasks/${id}`);
    },

    createTask: async (taskData) => {
        return fetchWithAuth('/api/tasks', 'POST', {
            title: taskData.title,
            description: taskData.description || '',
            completed: taskData.completed || false,
            dueDate: taskData.dueDate
        });
    },

    updateTask: async (id, updates) => {
        return fetchWithAuth(`/api/tasks/${id}`, 'PUT', updates);
    },

    deleteTask: async (id) => {
        return fetchWithAuth(`/api/tasks/${id}`, 'DELETE');
    },

    toggleTaskStatus: async (id, completed) => {
        return fetchWithAuth(`/api/tasks/${id}/status`, 'PATCH', { completed });
    }
};

// Utilidades
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
};
