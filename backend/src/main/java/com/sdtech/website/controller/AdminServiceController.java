package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.DeliverableSaveReq;
import com.sdtech.website.dto.req.ServiceItemSaveReq;
import com.sdtech.website.dto.req.ServiceSaveReq;
import com.sdtech.website.dto.req.SortReq;
import com.sdtech.website.dto.vo.DeliverableVO;
import com.sdtech.website.dto.vo.IdVO;
import com.sdtech.website.dto.vo.ServiceItemVO;
import com.sdtech.website.dto.vo.ServiceVO;
import com.sdtech.website.service.BizServiceService;
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
 * 后台业务 / 细分服务 / 交付物接口（13 个）。
 */
@RestController
@RequestMapping("/api/admin")
public class AdminServiceController {

    private final BizServiceService bizServiceService;

    public AdminServiceController(BizServiceService bizServiceService) {
        this.bizServiceService = bizServiceService;
    }

    /** 业务列表（含隐藏）。 */
    @GetMapping("/services")
    public Result<List<ServiceVO>> list() {
        return Result.ok(bizServiceService.listAdmin());
    }

    /** 新增业务。 */
    @PostMapping("/services")
    public Result<IdVO> create(@Valid @RequestBody ServiceSaveReq req) {
        return Result.ok(new IdVO(bizServiceService.create(req)));
    }

    /** 修改业务。 */
    @PutMapping("/services/{id}")
    public Result<Boolean> update(@PathVariable("id") Long id, @Valid @RequestBody ServiceSaveReq req) {
        bizServiceService.update(id, req);
        return Result.ok(true);
    }

    /** 删除业务（逻辑删除，级联下线细分项）。 */
    @DeleteMapping("/services/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        bizServiceService.remove(id);
        return Result.ok(true);
    }

    /** 业务上下移动。 */
    @PostMapping("/services/{id}/sort")
    public Result<Boolean> sort(@PathVariable("id") Long id, @Valid @RequestBody SortReq req) {
        bizServiceService.sort(id, req);
        return Result.ok(true);
    }

    /** 某业务的细分服务列表。 */
    @GetMapping("/services/{id}/items")
    public Result<List<ServiceItemVO>> items(@PathVariable("id") Long id) {
        return Result.ok(bizServiceService.adminItems(id));
    }

    /** 新增细分服务。 */
    @PostMapping("/service-items")
    public Result<IdVO> createItem(@Valid @RequestBody ServiceItemSaveReq req) {
        return Result.ok(new IdVO(bizServiceService.createItem(req)));
    }

    /** 修改细分服务。 */
    @PutMapping("/service-items/{id}")
    public Result<Boolean> updateItem(@PathVariable("id") Long id, @Valid @RequestBody ServiceItemSaveReq req) {
        bizServiceService.updateItem(id, req);
        return Result.ok(true);
    }

    /** 删除细分服务。 */
    @DeleteMapping("/service-items/{id}")
    public Result<Boolean> deleteItem(@PathVariable("id") Long id) {
        bizServiceService.deleteItem(id);
        return Result.ok(true);
    }

    /** 某业务的交付物列表。 */
    @GetMapping("/services/{id}/deliverables")
    public Result<List<DeliverableVO>> deliverables(@PathVariable("id") Long id) {
        return Result.ok(bizServiceService.deliverables(id));
    }

    /** 新增交付物。 */
    @PostMapping("/deliverables")
    public Result<IdVO> createDeliverable(@Valid @RequestBody DeliverableSaveReq req) {
        return Result.ok(new IdVO(bizServiceService.createDeliverable(req)));
    }

    /** 修改交付物。 */
    @PutMapping("/deliverables/{id}")
    public Result<Boolean> updateDeliverable(@PathVariable("id") Long id,
                                             @Valid @RequestBody DeliverableSaveReq req) {
        bizServiceService.updateDeliverable(id, req);
        return Result.ok(true);
    }

    /** 删除交付物。 */
    @DeleteMapping("/deliverables/{id}")
    public Result<Boolean> deleteDeliverable(@PathVariable("id") Long id) {
        bizServiceService.deleteDeliverable(id);
        return Result.ok(true);
    }
}
