package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.config.JacksonConfig;
import com.sdtech.website.dto.vo.AdvantageVO;
import com.sdtech.website.dto.vo.FaqVO;
import com.sdtech.website.dto.vo.ProcessStepVO;
import com.sdtech.website.dto.vo.SiteContentItem;
import com.sdtech.website.service.ContentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 公开站点接口：健康检查、全站 KV、FAQ、流程、优势。
 */
@RestController
@RequestMapping("/api/public")
public class PublicSiteController {

    private final ContentService contentService;

    public PublicSiteController(ContentService contentService) {
        this.contentService = contentService;
    }

    /** 健康检查。 */
    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("status", "UP");
        data.put("time", JacksonConfig.format(LocalDateTime.now()));
        return Result.ok(data);
    }

    /** 全站 KV 文案与图片，可按 group 过滤。 */
    @GetMapping("/site/content")
    public Result<List<SiteContentItem>> content(@RequestParam(value = "group", required = false) String group) {
        return Result.ok(contentService.publicContent(group));
    }

    /** FAQ 列表。 */
    @GetMapping("/faqs")
    public Result<List<FaqVO>> faqs() {
        return Result.ok(contentService.faqs());
    }

    /** 合作流程步骤。 */
    @GetMapping("/process-steps")
    public Result<List<ProcessStepVO>> processSteps() {
        return Result.ok(contentService.processSteps());
    }

    /** 优势条目。 */
    @GetMapping("/advantages")
    public Result<List<AdvantageVO>> advantages() {
        return Result.ok(contentService.advantages());
    }
}
