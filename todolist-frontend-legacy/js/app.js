/**
 * Módulo principal de la aplicación de tareas
 * 
 * Este módulo maneja la lógica de la interfaz de usuario para la gestión de tareas,
 * incluyendo la visualización, creación, edición y eliminación de tareas.
 */

import { taskService, requireAuth, isAuthenticated } from './api.js';

// Estado global de la aplicación
const appState = {
    tasks: [],
    currentFilter: 'all', // 'all', 'completed', 'active'
    currentEditId: null,
    selectedTasks: new Set(), // Para track de tareas seleccionadas
    pagination: {
        currentPage: 1,
        tasksPerPage: 3,
        totalPages: 1,
        totalTasks: 0
    }
};

// Elementos del DOM
const elements = {
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskTitle'),
    taskDescription: document.getElementById('taskDescription'),
    taskDueDate: document.getElementById('taskDueDate'),
    taskList: document.getElementById('tasksList'),
    filterAll: document.querySelector('[data-filter="all"]'),
    filterActive: document.querySelector('[data-filter="false"]'),
    filterCompleted: document.querySelector('[data-filter="true"]'),
    editModal: new bootstrap.Modal(document.getElementById('editTaskModal')),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskTitle: document.getElementById('editTaskTitle'),
    editTaskDescription: document.getElementById('editTaskDescription'),
    editTaskDueDate: document.getElementById('editTaskDueDate'),
    editTaskCompleted: document.getElementById('editTaskCompleted'),
    deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
    selectedCount: document.getElementById('selectedCount'),
    clearTaskDueDateBtn: document.getElementById('clearTaskDueDateBtn'),
    clearEditTaskDueDateBtn: document.getElementById('clearEditTaskDueDateBtn')
};

/**
 * Inicializa la aplicación
 */
export async function initApp() {
    // Verificar autenticación
    if (!requireAuth()) return;
    
    // Cargar tareas
    await loadTasks();
    
    // Configurar manejadores de eventos
    setupEventListeners();
}

/**
 * Configura los manejadores de eventos
 */
function setupEventListeners() {
    // Formulario para agregar tarea
    if (elements.taskForm) {
        elements.taskForm.addEventListener('submit', handleAddTask);
    }
    
    // Filtros
    if (elements.filterAll) {
        elements.filterAll.addEventListener('click', () => setFilter('all'));
    }
    
    if (elements.filterActive) {
        elements.filterActive.addEventListener('click', () => setFilter('active'));
    }
    
    if (elements.filterCompleted) {
        elements.filterCompleted.addEventListener('click', () => setFilter('completed'));
    }
    
    
    // Formulario de edición
    if (elements.editTaskForm) {
        elements.editTaskForm.addEventListener('submit', handleUpdateTask);
    }
    
    // Botón de eliminar seleccionadas
    if (elements.deleteSelectedBtn) {
        elements.deleteSelectedBtn.addEventListener('click', handleDeleteSelected);
    }
    
    // Botones para limpiar fechas
    if (elements.clearTaskDueDateBtn) {
        elements.clearTaskDueDateBtn.addEventListener('click', () => {
            elements.taskDueDate.value = '';
            elements.taskDueDate.blur(); // Cerrar el calendario si está abierto
        });
    }
    
    if (elements.clearEditTaskDueDateBtn) {
        elements.clearEditTaskDueDateBtn.addEventListener('click', () => {
            elements.editTaskDueDate.value = '';
            elements.editTaskDueDate.blur(); // Cerrar el calendario si está abierto
        });
    }
    
}

/**
 * Carga las tareas desde el servidor
 */
async function loadTasks() {
    try {
        showLoading(true);
        
        // Obtener tareas según el filtro actual
        let tasks = [];
        
        if (appState.currentFilter === 'completed') {
            tasks = await taskService.getAllTasks(true);
        } else if (appState.currentFilter === 'active') {
            tasks = await taskService.getAllTasks(false);
        } else {
            tasks = await taskService.getAllTasks();
        }
        
        appState.tasks = tasks || [];
        
        if (!Array.isArray(tasks)) {
            throw new Error('La respuesta del servidor no es un arreglo de tareas');
        }
        
        renderTasks();
        updateTaskCount();
        
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        showError('Error al cargar las tareas. Por favor, intenta de nuevo.');
    } finally {
        showLoading(false);
    }
}

/**
 * Renderiza la lista de tareas en el DOM
 */
function renderTasks() {
    if (!elements.taskList) return;
    
    // Filtrar tareas según el filtro actual
    const filteredTasks = filterTasks(appState.tasks, appState.currentFilter);
    
    if (filteredTasks.length === 0) {
        const filterText = {
            'all': '',
            'completed': 'completadas',
            'active': 'pendientes'
        };
        
        elements.taskList.innerHTML = `
            <div class="text-center py-4" style="color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                <h5 class="mb-3">No hay tareas ${filterText[appState.currentFilter] || ''}.</h5>
                ${appState.currentFilter !== 'all' ? '<a href="#" onclick="setFilter(\'all\')" class="btn btn-warning btn-sm">Ver todas las tareas</a>' : '<p class="mb-0">¡Comienza agregando tu primera tarea!</p>'}
            </div>
        `;
        return;
    }
    
    // Configurar paginación
    const { currentPage, tasksPerPage } = appState.pagination;
    const startIndex = (currentPage - 1) * tasksPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, startIndex + tasksPerPage);
    appState.pagination.totalTasks = filteredTasks.length;
    appState.pagination.totalPages = Math.ceil(appState.pagination.totalTasks / tasksPerPage);
    
    // Generar el HTML de las tareas
    const tasksHtml = paginatedTasks.map(task => {
        const statusBadge = getTaskStatusBadge(task);
        
        return `
            <div class="card task-card mb-2 ${task.completed ? 'task-completed' : ''}" data-task-id="${task.id}">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <input class="form-check-input me-2 task-selector" type="checkbox" 
                               data-task-id="${task.id}" 
                               onchange="toggleTaskSelection(${task.id}, this.checked)">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 task-title ${task.completed ? 'text-decoration-line-through text-muted' : ''}">
                                ${escapeHtml(task.title)}
                            </h6>
                            ${task.description ? `<p class="mb-1 text-muted">${escapeHtml(task.description)}</p>` : ''}
                            <div class="d-flex flex-wrap gap-1 align-items-center">
                                ${statusBadge}
                                ${task.dueDate ? `<small class="text-muted"><i class="fas fa-calendar-alt me-1"></i>${formatDueDate(task.dueDate)}</small>` : ''}
                            </div>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})" title="Editar tarea">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})" title="Eliminar tarea">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.taskList.innerHTML = tasksHtml;

    updatePaginationUI(Math.min(startIndex + 1, appState.pagination.totalTasks), Math.min(startIndex + paginatedTasks.length, appState.pagination.totalTasks));
    updateSelectedTasksUI();
}

/**
 * Filtra las tareas según el estado
 */
function filterTasks(tasks, filter) {
    switch (filter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return [...tasks];
    }
}

/**
 * Actualiza la interfaz de usuario de la paginación
 */
function updatePaginationUI(startTask, endTask) {
    const paginationList = document.getElementById('paginationList');
    const { currentPage, totalPages } = appState.pagination;

    if (!paginationList) return;

    // Vaciar la lista de paginación actual
    paginationList.innerHTML = '';

    // Si solo hay una página, no mostrar paginación
    if (totalPages <= 1) {
        return;
    }

    // Construir elementos de paginación
    for (let i = 1; i <= totalPages; i++) {
        const listItem = document.createElement('li');
        listItem.className = `page-item ${i === currentPage ? 'active' : ''}`;

        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.onclick = (event) => {
            event.preventDefault();
            setCurrentPage(i);
        };

        listItem.appendChild(pageLink);
        paginationList.appendChild(listItem);
    }
}

/**
 * Cambia la página actual de la paginación
 */
function setCurrentPage(page) {
    appState.pagination.currentPage = page;
    renderTasks();
}

/**
 * Maneja el envío del formulario para agregar una tarea
 */
async function handleAddTask(event) {
    event.preventDefault();
    
    const title = elements.taskInput.value.trim();
    const description = elements.taskDescription ? elements.taskDescription.value.trim() : '';
    const dueDate = elements.taskDueDate.value ? elements.taskDueDate.value : null;
    
    if (!title) {
        showError('El título de la tarea es requerido.');
        return;
    }
    
    // Validar que la fecha no sea en el pasado
    if (dueDate && new Date(dueDate) <= new Date()) {
        showError('La fecha de vencimiento debe ser en el futuro.');
        return;
    }
    
    try {
        showLoading(true);
        
        const newTask = await taskService.createTask({
            title,
            description,
            dueDate
        });
        
        // Agregar la nueva tarea al estado y volver a renderizar
        appState.tasks.unshift(newTask);
        renderTasks();
        updateTaskCount();
        
        // Limpiar el formulario
        elements.taskForm.reset();
        elements.taskInput.focus();
        
        // Mostrar mensaje de éxito con SweetAlert
        showTaskCreatedSuccess(title);
        
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        
        // Verificar si el error es por fecha en el pasado
        if (error.message && error.message.includes('future')) {
            showError('La fecha de vencimiento debe ser en el futuro.');
        } else {
            showError('Error al crear la tarea. Inténtalo de nuevo.');
        }
    } finally {
        showLoading(false);
    }
}

/**
 * Maneja el cambio de estado de una tarea (completada/no completada)
 */
window.toggleTaskStatus = async function(taskId, completed) {
    try {
        await taskService.toggleTaskStatus(taskId, completed);
        
        // Actualizar el estado local
        const taskIndex = appState.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            appState.tasks[taskIndex].completed = completed;
            renderTasks();
            updateTaskCount();
        }
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        showError('Error al actualizar la tarea. Inténtalo de nuevo.');
    }
};

/**
 * Abre el modal para editar una tarea
 */
window.editTask = function(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    appState.currentEditId = taskId;
    elements.editTaskTitle.value = task.title;
    elements.editTaskDescription.value = task.description || '';
    elements.editTaskCompleted.checked = task.completed;
    elements.editTaskDueDate.value = task.dueDate ? task.dueDate.slice(0, 16) : '';
    
    elements.editModal.show();
};

/**
 * Maneja la actualización de una tarea
 */
async function handleUpdateTask(event) {
    event.preventDefault();
    
    const title = elements.editTaskTitle.value.trim();
    const description = elements.editTaskDescription.value.trim();
    const completed = elements.editTaskCompleted.checked;
    const dueDate = elements.editTaskDueDate.value ? elements.editTaskDueDate.value : null;
    
    if (!title) return;
    
    try {
        showLoading(true);
        
        const updatedTask = await taskService.updateTask(appState.currentEditId, {
            title,
            description,
            completed,
            dueDate
        });
        
        // Actualizar el estado local
        const taskIndex = appState.tasks.findIndex(t => t.id === appState.currentEditId);
        if (taskIndex !== -1) {
            appState.tasks[taskIndex] = updatedTask;
            renderTasks();
            updateTaskCount();
        }
        
        // Cerrar el modal
        elements.editModal.hide();
        
        // Mostrar mensaje de éxito con SweetAlert
        showTaskUpdatedSuccess(title);
        
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        showError('Error al actualizar la tarea. Inténtalo de nuevo.');
    } finally {
        showLoading(false);
    }
}

/**
 * Maneja la eliminación de una tarea
 */
window.deleteTask = async function(taskId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Sí, bórralo!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                showLoading(true);
                
                await taskService.deleteTask(taskId);
                
                appState.tasks = appState.tasks.filter(t => t.id !== taskId);
                renderTasks();
                updateTaskCount();
                showSuccess('¡La tarea ha sido eliminada!');
            } catch (error) {
                console.error('Error al eliminar la tarea:', error);
                showError('Error al eliminar la tarea. Inténtalo de nuevo.');
            } finally {
                showLoading(false);
            }
        }
    });
};

/**
 * Maneja la limpieza de tareas completadas
 */
async function handleClearCompleted() {
    try {
        showLoading(true);
        
        // Filtrar tareas completadas
        const completedTasks = appState.tasks.filter(task => task.completed);
        
        // Eliminar cada tarea completada
        for (const task of completedTasks) {
            await taskService.deleteTask(task.id);
        }
        
        // Actualizar el estado local
        appState.tasks = appState.tasks.filter(task => !task.completed);
        renderTasks();
        updateTaskCount();
        
    } catch (error) {
        console.error('Error al limpiar tareas completadas:', error);
        showError('Error al limpiar tareas completadas. Inténtalo de nuevo.');
    } finally {
        showLoading(false);
    }
}

/**
 * Establece el filtro actual y vuelve a cargar las tareas
 */
window.setFilter = function(filter) {
    if (appState.currentFilter === filter) return;
    
    appState.currentFilter = filter;
    
    // Limpiar selecciones al cambiar filtro
    appState.selectedTasks.clear();
    
    // Actualizar el estilo de los botones de filtro
    updateFilterButtonStyles(filter);
    
    // Volver a cargar las tareas con el nuevo filtro
    loadTasks();
};

/**
 * Actualiza los estilos de los botones de filtro
 */
function updateFilterButtonStyles(activeFilter) {
    const buttons = {
        all: elements.filterAll,
        active: elements.filterActive,
        completed: elements.filterCompleted
    };
    
    Object.keys(buttons).forEach(filterKey => {
        const button = buttons[filterKey];
        if (!button) return;
        
        if (filterKey === activeFilter) {
            // Botón activo: fondo blanco, texto oscuro, borde amarillo
            button.classList.add('active', 'fw-bold');
            button.style.backgroundColor = 'white';
            button.style.borderColor = '#ffc107';
            button.style.color = '#212529';
        } else {
            // Botón inactivo: fondo amarillo, texto oscuro
            button.classList.remove('active', 'fw-bold');
            button.style.backgroundColor = '#ffc107';
            button.style.borderColor = '#ffc107';
            button.style.color = '#212529';
        }
    });
}

/**
 * Actualiza el contador de tareas (función placeholder)
 */
function updateTaskCount() {
    // Esta función se mantiene para compatibilidad futura
    // pero no se usa actualmente en la interfaz
}

/**
 * Muestra u oculta el indicador de carga
 */
function showLoading(isLoading) {
    // Buscar el spinner de carga existente en el HTML
    const existingSpinner = document.querySelector('#tasksList .spinner-border');
    
    if (isLoading) {
        if (!existingSpinner && elements.taskList) {
            elements.taskList.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando tareas...</p>
                </div>
            `;
        }
    } else {
        // El loading se quita automáticamente cuando se renderizan las tareas
    }
}

/**
 * Muestra un mensaje de error con SweetAlert2
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: message,
    });
}

/**
 * Muestra un mensaje de éxito con SweetAlert2
 */
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: message,
        showConfirmButton: false,
        timer: 1500
    });
}

/**
 * Muestra un mensaje personalizado de tarea creada exitosamente
 */
function showTaskCreatedSuccess(taskTitle) {
    Swal.fire({
        icon: 'success',
        title: '¡Tarea creada exitosamente!',
        html: `La tarea <strong>"${escapeHtml(taskTitle)}"</strong> se ha agregado correctamente.`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
}

/**
 * Muestra un mensaje personalizado de tarea actualizada exitosamente
 */
function showTaskUpdatedSuccess(taskTitle) {
    Swal.fire({
        icon: 'success',
        title: '¡Tarea actualizada exitosamente!',
        html: `La tarea <strong>"${escapeHtml(taskTitle)}"</strong> se ha actualizado correctamente.`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        showClass: {
            popup: 'animate__animated animate__slideInRight'
        },
        hideClass: {
            popup: 'animate__animated animate__slideOutRight'
        }
    });
}

/**
 * Genera el badge de estado para una tarea
 */
function getTaskStatusBadge(task) {
    if (task.completed) {
        return '<span class="badge bg-success">Completada</span>';
    }
    
    if (task.dueDate) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const taskDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        if (taskDueDate < today) {
            // Tarea vencida
            return '<span class="badge bg-dark">Vencida</span>';
        } else if (taskDueDate.getTime() === today.getTime()) {
            // Vence hoy
            return '<span class="badge bg-danger">Vence hoy</span>';
        }
    }
    
    // Tarea pendiente (por defecto)
    return '<span class="badge bg-warning text-dark">Pendiente</span>';
}

/**
 * Formatea la fecha de vencimiento de manera legible
 */
function formatDueDate(dueDateString) {
    if (!dueDateString) return '';
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    if (taskDueDate.getTime() === today.getTime()) {
        return `Hoy a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (taskDueDate.getTime() === tomorrow.getTime()) {
        return `Mañana a las ${dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return dueDate.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Maneja la selección/deselección de tareas
 */
window.toggleTaskSelection = function(taskId, isSelected) {
    if (isSelected) {
        appState.selectedTasks.add(taskId);
    } else {
        appState.selectedTasks.delete(taskId);
    }
    updateSelectedTasksUI();
};

/**
 * Actualiza la UI de tareas seleccionadas
 */
function updateSelectedTasksUI() {
    const selectedCount = appState.selectedTasks.size;
    
    if (elements.selectedCount) {
        elements.selectedCount.textContent = selectedCount;
    }
    
    if (elements.deleteSelectedBtn) {
        if (selectedCount > 0) {
            elements.deleteSelectedBtn.classList.remove('d-none');
        } else {
            elements.deleteSelectedBtn.classList.add('d-none');
        }
    }
}

/**
 * Maneja la eliminación de tareas seleccionadas
 */
async function handleDeleteSelected() {
    const selectedTaskIds = Array.from(appState.selectedTasks);
    
    if (selectedTaskIds.length === 0) {
        showError('No hay tareas seleccionadas para eliminar.');
        return;
    }
    
    const taskTitles = selectedTaskIds.map(id => {
        const task = appState.tasks.find(t => t.id === id);
        return task ? task.title : 'Tarea desconocida';
    }).join(', ');
    
    Swal.fire({
        title: '¿Estás seguro?',
        html: `¿Quieres eliminar ${selectedTaskIds.length} tarea${selectedTaskIds.length > 1 ? 's' : ''}?<br><br><small class="text-muted">${taskTitles}</small>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '¡Sí, eliminar!',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                showLoading(true);
                
                // Eliminar todas las tareas seleccionadas
                for (const taskId of selectedTaskIds) {
                    await taskService.deleteTask(taskId);
                }
                
                // Actualizar el estado local
                appState.tasks = appState.tasks.filter(t => !selectedTaskIds.includes(t.id));
                appState.selectedTasks.clear();
                
                renderTasks();
                updateTaskCount();
                updateSelectedTasksUI(); // Asegurar que el botón desaparezca
                
                showSuccess(`¡${selectedTaskIds.length} tarea${selectedTaskIds.length > 1 ? 's han' : ' ha'} sido eliminada${selectedTaskIds.length > 1 ? 's' : ''}!`);
            } catch (error) {
                console.error('Error al eliminar tareas:', error);
                showError('Error al eliminar las tareas seleccionadas. Inténtalo de nuevo.');
            } finally {
                showLoading(false);
            }
        }
    });
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Hacer que las funciones estén disponibles globalmente para los manejadores de eventos en línea
// Esto es necesario para los manejadores de eventos en línea en el HTML
window.appModule = {
    toggleTaskStatus: (taskId, completed) => {
        toggleTaskStatus(taskId, completed).catch(console.error);
    },
    editTask: (taskId) => {
        editTask(taskId).catch(console.error);
    },
    deleteTask: (taskId) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            deleteTask(taskId).catch(console.error);
        }
    },
    setFilter: (filter) => {
        setFilter(filter).catch(console.error);
    }
};
