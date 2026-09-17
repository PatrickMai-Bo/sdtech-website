package com.sdtech.website.common;

import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis-Plus 自动填充：create_time / update_time 兜底填充。
 * <p>
 * 注意：实现接口使用全限定名，避免与本类同名产生导入冲突。
 */
@Component
public class MetaObjectHandler implements com.baomidou.mybatisplus.core.handlers.MetaObjectHandler {

    /** 创建时间字段名（实体驼峰）。 */
    private static final String FIELD_CREATE_TIME = "createTime";

    /** 更新时间字段名（实体驼峰）。 */
    private static final String FIELD_UPDATE_TIME = "updateTime";

    @Override
    public void insertFill(MetaObject metaObject) {
        LocalDateTime now = LocalDateTime.now();
        if (metaObject.hasSetter(FIELD_CREATE_TIME)) {
            this.strictInsertFill(metaObject, FIELD_CREATE_TIME, LocalDateTime.class, now);
        }
        if (metaObject.hasSetter(FIELD_UPDATE_TIME)) {
            this.strictInsertFill(metaObject, FIELD_UPDATE_TIME, LocalDateTime.class, now);
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        if (metaObject.hasSetter(FIELD_UPDATE_TIME)) {
            this.strictUpdateFill(metaObject, FIELD_UPDATE_TIME, LocalDateTime.class, LocalDateTime.now());
        }
    }
}
