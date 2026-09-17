package com.sdtech.website.service;

import com.sdtech.website.dto.req.SiteContentSaveReq;
import com.sdtech.website.dto.vo.SiteContentItem;
import com.sdtech.website.entity.SiteContent;

import java.util.List;

/**
 * site_content 表读写服务：原始 KV 查询与「整组替换」保存。
 */
public interface SiteContentService {

    /**
     * 查询原始行（供派生解析使用）。
     *
     * @param group 分组，为空表示全部分组
     * @return 按 group、sort_order、id 升序排列的记录
     */
    List<SiteContent> raw(String group);

    /** 公开 KV 列表（前端一次性取全站文案）。 */
    List<SiteContentItem> listPublic(String group);

    /** 后台 KV 列表（不派生，含隐藏）。 */
    List<SiteContentItem> listAdmin(String group);

    /**
     * 按组整组替换：先删该组全部行，再插入新行（事务内完成）。
     *
     * @param payloads 分组负载
     * @return 影响的总条数
     */
    int replaceGroups(List<SiteContentSaveReq> payloads);
}
