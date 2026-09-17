package com.sdtech.website.dto.req;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

/** 批量标记已读请求。 */
public class BatchReadReq {

    /** 留言 ID 列表。 */
    @NotEmpty(message = "请选择要操作的留言")
    @Size(max = 200, message = "单次最多处理 200 条")
    private List<Long> ids = new ArrayList<>();

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }
}
