package com.sdtech.website.controller;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.CaseSaveReq;
import com.sdtech.website.dto.vo.CaseDetailVO;
import com.sdtech.website.dto.vo.CaseVO;
import com.sdtech.website.dto.vo.IdVO;
import com.sdtech.website.service.CaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 后台案例接口（8 个）：列表、增删改、精选切换、图片增删。
 */
@RestController
@RequestMapping("/api/admin")
public class AdminCaseController {

    private final CaseService caseService;

    public AdminCaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    /** 案例列表（分页 + 分类 + 精选 + 关键字）。 */
    @GetMapping("/cases")
    public Result<PageVO<CaseVO>> page(@RequestParam(value = "page", defaultValue = "1") long page,
                                       @RequestParam(value = "size", defaultValue = "10") long size,
                                       @RequestParam(value = "category", required = false) String category,
                                       @RequestParam(value = "featured", required = false) Integer featured,
                                       @RequestParam(value = "keyword", required = false) String keyword) {
        return Result.ok(caseService.pageAdmin(page, size, category, featured, keyword));
    }

    /** 新增案例（含图片）。 */
    @PostMapping("/cases")
    public Result<IdVO> create(@Valid @RequestBody CaseSaveReq req) {
        return Result.ok(new IdVO(caseService.create(req)));
    }

    /** 案例详情含图。 */
    @GetMapping("/cases/{id}")
    public Result<CaseDetailVO> detail(@PathVariable("id") Long id) {
        return Result.ok(caseService.adminDetail(id));
    }

    /** 修改案例（图片全量覆盖）。 */
    @PutMapping("/cases/{id}")
    public Result<Boolean> update(@PathVariable("id") Long id, @Valid @RequestBody CaseSaveReq req) {
        caseService.update(id, req);
        return Result.ok(true);
    }

    /** 逻辑删除案例。 */
    @DeleteMapping("/cases/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        caseService.remove(id);
        return Result.ok(true);
    }

    /** 切换精选状态：{isFeatured:1}。 */
    @PatchMapping("/cases/{id}/featured")
    public Result<Boolean> toggleFeatured(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        caseService.toggleFeatured(id, toInt(body, "isFeatured"));
        return Result.ok(true);
    }

    /** 追加案例图片。 */
    @PostMapping("/cases/{id}/images")
    public Result<IdVO> addImage(@PathVariable("id") Long id, @Valid @RequestBody CaseSaveReq.ImageReq req) {
        return Result.ok(new IdVO(caseService.addImage(id, req)));
    }

    /** 删除单张案例图片。 */
    @DeleteMapping("/case-images/{id}")
    public Result<Boolean> removeImage(@PathVariable("id") Long id) {
        caseService.removeImage(id);
        return Result.ok(true);
    }

    /** 从 Map 中提取整型值。 */
    private Integer toInt(Map<String, Object> body, String key) {
        if (body == null || body.get(key) == null) {
            return null;
        }
        Object value = body.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(value.toString());
    }
}
