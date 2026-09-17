# =====================================================================
# 官网后端镜像：多阶段构建（服务器无法访问 github.com，依赖走腾讯 Maven 镜像）
# 阶段 1：maven:3.9-eclipse-temurin-17 编译打包
# 阶段 2：eclipse-temurin:17-jre-jammy 运行（拉取失败可降级 17-jre）
# =====================================================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# 使用腾讯 Maven 镜像
COPY docker/maven-settings.xml /root/.m2/settings.xml

# 先只拷 pom，利用 Docker 缓存层加速依赖下载
COPY backend/pom.xml ./pom.xml
RUN mvn -B -s /root/.m2/settings.xml -q dependency:go-offline || true

COPY backend/src ./src
RUN mvn -B -s /root/.m2/settings.xml -DskipTests package

# ---------------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod
ENV TZ=Asia/Shanghai
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# 上传目录与日志目录（上传目录同时是命名卷挂载点）
RUN mkdir -p /app/uploads /app/logs

COPY --from=builder /build/target/app.jar /app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app.jar"]
