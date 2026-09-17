package com.sdtech.website.controller;

import com.sdtech.website.common.PageVO;
import com.sdtech.website.common.Result;
import com.sdtech.website.dto.req.BatchReadReq;
import com.sdtech.website.dto.vo.ContactMessageVO;
import com.sdtech.website.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 后台留言接口（5 个）：列表、未读数、标记、批量、删除。
 */
@RestController
@RequestMapping("/api/admin/messages")
public class AdminMessageController {

    private final MessageService messageService;

    public AdminMessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /** 留言列表（时间倒序，可按已读过滤）。 */
    @GetMapping
    public Result<PageVO<ContactMessageVO>> page(@RequestParam(value = "page", defaultValue = "1") long page,
                                                 @RequestParam(value = "size", defaultValue = "10") long size,
                                                 @RequestParam(value = "isRead", required = false) Integer isRead) {
        return Result.ok(messageService.pageAdmin(page, size, isRead));
    }

    /** 未读数量（侧栏角标）。 */
    @GetMapping("/unread-count")
    public Result<Map<String, Object>> unreadCount() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("count", messageService.countUnread());
        return Result.ok(data);
    }

    /** 标记已读/未读：{isRead:1}。 */
    @PatchMapping("/{id}/read")
    public Result<Boolean> markRead(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        Integer isRead = null;
        if (body != null && body.get("isRead") != null) {
            Object value = body.get("isRead");
            isRead = value instanceof Number number ? number.intValue() : Integer.valueOf(value.toString());
        }
        messageService.markRead(id, isRead);
        return Result.ok(true);
    }

    /** 批量标记已读。 */
    @PostMapping("/batch-read")
    public Result<Map<String, Object>> batchRead(@Valid @RequestBody BatchReadReq req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("updated", messageService.batchRead(req));
        return Result.ok(data);
    }

    /** 删除留言。 */
    @DeleteMapping("/{id}")
    public Result<Boolean> remove(@PathVariable("id") Long id) {
        messageService.remove(id);
        return Result.ok(true);
    }
}
