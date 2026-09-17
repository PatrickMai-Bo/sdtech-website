package com.sdtech.website.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

/**
 * Jackson 配置：时间统一 {@code yyyy-MM-dd HH:mm:ss}，时区 Asia/Shanghai（D12）。
 */
@Configuration
public class JacksonConfig {

    /** 全站时间格式。 */
    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /** 全站时区。 */
    public static final String TIME_ZONE = "Asia/Shanghai";

    /** 供业务代码复用。 */
    public static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer sdtechJacksonCustomizer() {
        return builder -> builder
                .timeZone(TimeZone.getTimeZone(TIME_ZONE))
                .simpleDateFormat(DATE_TIME_PATTERN)
                .serializers(new LocalDateTimeSerializer(FORMATTER))
                .deserializers(new LocalDateTimeDeserializer(FORMATTER))
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /** 按统一格式格式化 LocalDateTime。 */
    public static String format(LocalDateTime dateTime) {
        return dateTime == null ? "" : FORMATTER.format(dateTime);
    }
}
