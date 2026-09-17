package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.SiteContentSaveReq;
import com.sdtech.website.dto.vo.SiteContentItem;
import com.sdtech.website.service.SiteContentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台站点内容接口：原始 KV 查询与按组整组替换。
 */
@RestController
@RequestMapping("/api/admin/site")
public class AdminContentController {

    private final SiteContentService siteContentService;

    public AdminContentController(SiteContentService siteContentService) {
        this.siteContentService = siteContentService;
    }

    /** 原始 KV（不派生）。 */
    @GetMapping("/content")
    public Result<List<SiteContentItem>> content(@RequestParam(value = "group", required = false) String group) {
        return Result.ok(siteContentService.listAdmin(group));
    }

    /** 按组整组替换：前端回传该组完整条目。 */
    @PutMapping("/content")
    public Result<Map<String, Object>> save(@Valid @RequestBody List<SiteContentSaveReq> payloads) {
        int updated = siteContentService.replaceGroups(payloads);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("updated", updated);
        return Result.ok(data);
    }
}
