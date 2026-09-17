package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.ShopLinkSaveReq;
import com.sdtech.website.dto.vo.IdVO;
import com.sdtech.website.dto.vo.ShopLinkVO;
import com.sdtech.website.service.ShopLinkService;
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
 * 后台店铺链接接口（4 个）。
 */
@RestController
@RequestMapping("/api/admin/shop-links")
public class AdminShopController {

    private final ShopLinkService shopLinkService;

    public AdminShopController(ShopLinkService shopLinkService) {
        this.shopLinkService = shopLinkService;
    }

    /** 全部链接。 */
    @GetMapping
    public Result<List<ShopLinkVO>> list() {
        return Result.ok(shopLinkService.listAdmin());
    }

    /** 新增链接。 */
    @PostMapping
    public Result<IdVO> create(@Valid @RequestBody ShopLinkSaveReq req) {
        return Result.ok(new IdVO(shopLinkService.create(req)));
    }

    /** 修改链接。 */
    @PutMapping("/{id}")
    public Result<Boolean> update(@PathVariable("id") Long id, @Valid @RequestBody ShopLinkSaveReq req) {
        shopLinkService.update(id, req);
        return Result.ok(true);
    }

    /** 删除链接。 */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        shopLinkService.remove(id);
        return Result.ok(true);
    }
}
