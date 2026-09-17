package com.sdtech.website.controller;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.Result;
import com.sdtech.website.dto.vo.UploadVO;
import com.sdtech.website.service.AuthService;
import com.sdtech.website.service.UploadService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 后台上传接口（3 个）：上传、素材库、删除。
 */
@RestController
@RequestMapping("/api/admin/upload")
public class AdminUploadController {

    private final UploadService uploadService;

    private final AuthService authService;

    public AdminUploadController(UploadService uploadService, AuthService authService) {
        this.uploadService = uploadService;
        this.authService = authService;
    }

    /** 上传图片：≤5MB、白名单、UUID 重命名。 */
    @PostMapping
    public Result<UploadVO> upload(@RequestParam("file") MultipartFile file) {
        Long uploaderId = authService.requireCurrentAdmin().getId();
        return Result.ok(uploadService.store(file, uploaderId));
    }

    /** 素材库分页。 */
    @GetMapping("/files")
    public Result<PageVO<UploadVO>> files(@RequestParam(value = "page", defaultValue = "1") long page,
                                          @RequestParam(value = "size", defaultValue = "20") long size) {
        return Result.ok(uploadService.page(page, size));
    }

    /** 删除记录与磁盘文件。 */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        uploadService.remove(id);
        return Result.ok(true);
    }
}
