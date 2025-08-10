# Usar imagen oficial de OpenJDK 21
FROM openjdk:21-jdk-slim

# Directorio de trabajo
WORKDIR /app

# Copiar archivo pom.xml
COPY pom.xml .

# Copiar archivo mvnw y mvnw.cmd
COPY mvnw .
COPY mvnw.cmd .

# Copiar directorio .mvn
COPY .mvn .mvn

# Copiar código fuente
COPY src src

# Dar permisos de ejecución a mvnw
RUN chmod +x mvnw

# Compilar la aplicación
RUN ./mvnw clean package -DskipTests

# Exponer puerto 8080
EXPOSE 8080

# Comando para ejecutar la aplicación
CMD ["java", "-jar", "target/ToDoListApi-0.0.1-SNAPSHOT.jar"]
