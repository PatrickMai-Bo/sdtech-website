package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.vo.ShopLinkVO;
import com.sdtech.website.service.ShopLinkService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 公开店铺链接接口：按展示位置过滤。
 */
@RestController
@RequestMapping("/api/public/shop-links")
public class PublicShopController {

    private final ShopLinkService shopLinkService;

    public PublicShopController(ShopLinkService shopLinkService) {
        this.shopLinkService = shopLinkService;
    }

    /** 店铺链接列表，zone 为空时返回全部启用项。 */
    @GetMapping
    public Result<List<ShopLinkVO>> list(@RequestParam(value = "zone", required = false) String zone) {
        return Result.ok(shopLinkService.listPublic(zone));
    }
}
