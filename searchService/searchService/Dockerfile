# ==========================================
# Build Stage
# ==========================================
FROM eclipse-temurin:24-jdk AS build

WORKDIR /workspace

# Copy Maven Wrapper and project files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw -B -ntp clean package -DskipTests

# ==========================================
# Runtime Stage
# ==========================================
FROM eclipse-temurin:24-jre

# Create non-root user
RUN useradd --create-home --shell /usr/sbin/nologin spring

USER spring

WORKDIR /app

# Copy generated JAR
COPY --from=build /workspace/target/*.jar app.jar

# Search Service Port
EXPOSE 8083

# Run application
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]