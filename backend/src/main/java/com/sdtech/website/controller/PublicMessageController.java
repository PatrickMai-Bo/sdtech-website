package com.sdtech.website.controller;

import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.MessageReq;
import com.sdtech.website.service.MessageService;
import com.sdtech.website.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 公开留言接口：提交访客留言（含限流与服务端二次校验）。
 */
@RestController
@RequestMapping("/api/public/messages")
public class PublicMessageController {

    private final MessageService messageService;

    public PublicMessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /** 提交留言。 */
    @PostMapping
    public Result<Map<String, Object>> create(@Valid @RequestBody MessageReq req, HttpServletRequest request) {
        String ip = IpUtil.getClientIp(request);
        Long id = messageService.create(req, ip);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", id);
        return Result.ok(data);
    }
}
