package com.sdtech.website.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.sdtech.website.common.BusinessException;
import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.ResultCode;
import com.sdtech.website.dto.vo.UploadVO;
import com.sdtech.website.entity.UploadFile;
import com.sdtech.website.mapper.UploadFileMapper;
import com.sdtech.website.service.UploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 上传实现：扩展名 + Content-Type 双白名单，UUID 重命名，落盘 yyyy/MM/。
 */
@Service
public class UploadServiceImpl implements UploadService {

    private static final Logger log = LoggerFactory.getLogger(UploadServiceImpl.class);

    /** 允许的扩展名。 */
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "webp", "gif", "svg");

    /** 允许的 Content-Type。 */
    private static final Set<String> ALLOWED_MIME_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml");

    /** 格式错误提示。 */
    private static final String FORMAT_MESSAGE = "不支持的图片格式，仅支持 jpg/png/webp/gif/svg";

    /** 单页最大条数。 */
    private static final long MAX_PAGE_SIZE = 50L;

    /** 上传根目录。 */
    @Value("${sdtech.upload.dir}")
    private String uploadDir;

    /** 单文件最大字节数。 */
    @Value("${sdtech.upload.max-size}")
    private long maxSize;

    private final UploadFileMapper uploadFileMapper;

    public UploadServiceImpl(UploadFileMapper uploadFileMapper) {
        this.uploadFileMapper = uploadFileMapper;
    }

    @Override
    public UploadVO store(MultipartFile file, Long uploaderId) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请选择要上传的文件");
        }
        if (file.getSize() > maxSize) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "文件大小超出限制，最大 5MB");
        }
        String originalName = safeOriginalName(file.getOriginalFilename());
        String extension = extractExtension(originalName);
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(ResultCode.BAD_REQUEST, FORMAT_MESSAGE);
        }
        LocalDateTime now = LocalDateTime.now();
        String datePath = String.format("%d/%02d", now.getYear(), now.getMonthValue());
        Path directory = Paths.get(uploadDir, datePath);
        try {
            Files.createDirectories(directory);
        } catch (IOException e) {
            log.error("[sdtech] 创建上传目录失败：{}", directory, e);
            throw new BusinessException(ResultCode.INTERNAL_ERROR, "上传失败，请稍后重试");
        }
        String storeName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path target = directory.resolve(storeName);
        try {
            file.transferTo(target);
        } catch (IOException e) {
            log.error("[sdtech] 写入上传文件失败：{}", target, e);
            throw new BusinessException(ResultCode.INTERNAL_ERROR, "上传失败，请稍后重试");
        }
        UploadFile entity = new UploadFile();
        entity.setFileName(originalName);
        entity.setStoreName(storeName);
        entity.setFilePath(target.toAbsolutePath().toString());
        entity.setFileUrl("/uploads/" + datePath + "/" + storeName);
        entity.setFileSize(file.getSize());
        entity.setMimeType(mimeType);
        entity.setUploaderId(uploaderId);
        uploadFileMapper.insert(entity);
        return toVO(entity);
    }

    @Override
    public PageVO<UploadVO> page(long page, long size) {
        long current = page < 1 ? 1 : page;
        long pageSize = size < 1 ? 20 : Math.min(size, MAX_PAGE_SIZE);
        Page<UploadFile> pageResult = uploadFileMapper.selectPage(new Page<>(current, pageSize),
                new LambdaQueryWrapper<UploadFile>().orderByDesc(UploadFile::getCreateTime));
        List<UploadVO> records = new ArrayList<>();
        for (UploadFile entity : pageResult.getRecords()) {
            records.add(toVO(entity));
        }
        return PageVO.of(pageResult, records);
    }

    @Override
    public void remove(Long id) {
        UploadFile entity = uploadFileMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "文件不存在");
        }
        uploadFileMapper.deleteById(id);
        // 磁盘文件删除失败仅记录日志，不影响接口返回
        try {
            Files.deleteIfExists(Paths.get(entity.getFilePath()));
        } catch (IOException e) {
            log.warn("[sdtech] 删除磁盘文件失败：{}", entity.getFilePath(), e);
        }
    }

    /** 只保留文件名部分，杜绝路径穿越。 */
    private String safeOriginalName(String original) {
        if (original == null || original.isBlank()) {
            return "image";
        }
        String name = Paths.get(original).getFileName().toString();
        return name.isBlank() ? "image" : name;
    }

    /** 提取并校验扩展名。 */
    private String extractExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot >= fileName.length() - 1) {
            throw new BusinessException(ResultCode.BAD_REQUEST, FORMAT_MESSAGE);
        }
        String extension = fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, FORMAT_MESSAGE);
        }
        return extension;
    }

    /** 实体转 VO。 */
    private UploadVO toVO(UploadFile entity) {
        UploadVO vo = new UploadVO();
        vo.setId(entity.getId());
        vo.setFileName(entity.getFileName());
        vo.setFileUrl(entity.getFileUrl());
        vo.setFileSize(entity.getFileSize());
        vo.setMimeType(entity.getMimeType());
        vo.setCreateTime(entity.getCreateTime());
        return vo;
    }
}
