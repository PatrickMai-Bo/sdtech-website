package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.QuoteSaveReq;
import com.sdtech.website.dto.vo.IdVO;
import com.sdtech.website.dto.vo.QuoteVO;
import com.sdtech.website.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 后台报价接口（4 个）。
 */
@RestController
@RequestMapping("/api/admin/quotes")
public class AdminQuoteController {

    private final QuoteService quoteService;

    public AdminQuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    /** 全部报价（含隐藏）。 */
    @GetMapping
    public Result<List<QuoteVO>> list() {
        return Result.ok(quoteService.listAdmin());
    }

    /** 新增报价。 */
    @PostMapping
    public Result<IdVO> create(@Valid @RequestBody QuoteSaveReq req) {
        return Result.ok(new IdVO(quoteService.create(req)));
    }

    /** 修改报价。 */
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable("id") Long id, @Valid @RequestBody QuoteSaveReq req) {
        quoteService.update(id, req);
        return Result.ok(true);
    }

    /** 删除报价。 */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        quoteService.remove(id);
        return Result.ok(true);
    }
}
