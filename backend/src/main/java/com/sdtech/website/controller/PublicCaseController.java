package com.sdtech.website.controller;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.Result;
import com.sdtech.website.dto.vo.CaseDetailVO;
import com.sdtech.website.dto.vo.CaseVO;
import com.sdtech.website.dto.vo.CategoryVO;
import com.sdtech.website.service.CaseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公开案例接口：分页、精选、分类、详情。
 */
@RestController
@RequestMapping("/api/public/cases")
public class PublicCaseController {

    private final CaseService caseService;

    public PublicCaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    /** 案例分页。 */
    @GetMapping
    public Result<PageVO<CaseVO>> page(@RequestParam(value = "category", required = false) String category,
                                       @RequestParam(value = "page", defaultValue = "1") long page,
                                       @RequestParam(value = "size", defaultValue = "9") long size,
                                       @RequestParam(value = "keyword", required = false) String keyword) {
        return Result.ok(caseService.pagePublic(category, page, size, keyword));
    }

    /** 精选案例。 */
    @GetMapping("/featured")
    public Result<List<CaseVO>> featured(@RequestParam(value = "limit", defaultValue = "4") int limit) {
        return Result.ok(caseService.featured(limit));
    }

    /** 案例分类。 */
    @GetMapping("/categories")
    public Result<List<CategoryVO>> categories() {
        return Result.ok(caseService.categories());
    }

    /** 案例详情含多图。 */
    @GetMapping("/{id}")
    public Result<CaseDetailVO> detail(@PathVariable("id") Long id) {
        return Result.ok(caseService.detail(id));
    }
}
