# ToDoListApi

## Descripción

Este es el backend para la aplicación ToDoList, diseñado para gestionar tareas, usuarios y autenticación.

## Requisitos

- Java 11 (o superior)
- Maven
- Docker y Docker Compose

## Configuración

1. **Clona el repositorio**
   ```bash
   git clone <url_del_repositorio>
   ```

2. **Inicia la base de datos con Docker**
   ```bash
   docker-compose up -d
   ```

3. **Configura la aplicación**

   Verifica la configuración de la base de datos en `src/main/resources/application.properties`.

4. **Ejecuta el proyecto**
   ```bash
   mvn spring-boot:run
   ```

## Integración con Azure DevOps

El proyecto está configurado para seguimiento y despliegue continuo utilizando Azure DevOps.

## Generar Clave

La clase `KeyGenerator` se puede usar para generar claves secretas de 256 bits.

## Pruebas

Archivos de prueba REST se encuentran en la carpeta `pruebas/`.

## Contribuir

Envía un pull request con tus mejoras.
