package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.vo.ServiceDetailVO;
import com.sdtech.website.dto.vo.ServiceItemVO;
import com.sdtech.website.dto.vo.ServiceVO;
import com.sdtech.website.service.BizServiceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公开业务接口：业务卡、业务详情、细分服务。
 */
@RestController
@RequestMapping("/api/public/services")
public class PublicServiceController {

    private final BizServiceService bizServiceService;

    public PublicServiceController(BizServiceService bizServiceService) {
        this.bizServiceService = bizServiceService;
    }

    /** 8 项业务卡。 */
    @GetMapping
    public Result<List<ServiceVO>> list() {
        return Result.ok(bizServiceService.listPublic());
    }

    /** 业务详情（含细分项与交付物）。 */
    @GetMapping("/{slug}")
    public Result<ServiceDetailVO> detail(@PathVariable("slug") String slug) {
        return Result.ok(bizServiceService.detailBySlug(slug));
    }

    /** 细分服务列表。 */
    @GetMapping("/{slug}/items")
    public Result<List<ServiceItemVO>> items(@PathVariable("slug") String slug) {
        return Result.ok(bizServiceService.itemsBySlug(slug));
    }
}
