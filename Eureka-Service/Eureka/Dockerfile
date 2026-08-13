# ==========================================
# Build Stage
# ==========================================
FROM eclipse-temurin:24-jdk AS build

WORKDIR /workspace

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY src ./src

RUN ./mvnw -B -ntp clean package -DskipTests

# ==========================================
# Runtime Stage
# ==========================================
FROM eclipse-temurin:24-jre

RUN useradd --create-home --shell /usr/sbin/nologin spring

USER spring

WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-jar","app.jar"]