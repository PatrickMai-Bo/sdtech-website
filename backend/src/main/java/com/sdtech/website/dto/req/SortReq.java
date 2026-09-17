package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** 排序移动请求：up 上移 / down 下移。 */
public class SortReq {

    /** 方向：up 或 down。 */
    @NotBlank(message = "方向不能为空")
    @Pattern(regexp = "up|down", message = "方向只能是 up 或 down")
    private String direction;

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }
}
