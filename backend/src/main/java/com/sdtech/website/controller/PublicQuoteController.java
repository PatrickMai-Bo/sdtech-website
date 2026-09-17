package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.vo.QuoteVO;
import com.sdtech.website.service.QuoteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公开报价接口。
 */
@RestController
@RequestMapping("/api/public/quotes")
public class PublicQuoteController {

    private final QuoteService quoteService;

    public PublicQuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    /** 全部报价。 */
    @GetMapping
    public Result<List<QuoteVO>> list() {
        return Result.ok(quoteService.listPublic());
    }

    /** 某业务下的报价。 */
    @GetMapping("/{serviceSlug}")
    public Result<List<QuoteVO>> listByService(@PathVariable("serviceSlug") String serviceSlug) {
        return Result.ok(quoteService.listByServiceSlug(serviceSlug));
    }
}
