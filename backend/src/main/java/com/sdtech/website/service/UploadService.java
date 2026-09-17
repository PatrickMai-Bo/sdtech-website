package com.sdtech.website.service;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.dto.vo.UploadVO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 上传文件服务：落盘 yyyy/MM/UUID.ext，扩展名 + Content-Type 双白名单，≤5MB。
 */
public interface UploadService {

    /** 保存上传文件。 */
    UploadVO store(MultipartFile file, Long uploaderId);

    /** 素材库分页。 */
    PageVO<UploadVO> page(long page, long size);

    /** 删除记录与磁盘文件。 */
    void remove(Long id);
}
