package com.sdtech.website.util;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * 内存滑动计数限流器（单实例部署，够用且零依赖）。
 * <p>
 * 登录：同 IP + 用户名 10 分钟内失败 5 次锁定 10 分钟；留言：同 IP 60 秒 3 条。
 */
@Component
public class RateLimiter {

    /** 计数窗口容器。 */
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    /** 过期清理周期：10 分钟。 */
    private static final long EVICT_TTL_MS = 30 * 60 * 1000L;

    /**
     * 尝试计数。
     *
     * @param key 限流键
     * @param max 窗口内允许的次数
     * @param windowMs 窗口长度（毫秒）
     * @return true 表示未超限（本次已计入）
     */
    public boolean check(String key, int max, long windowMs) {
        Window window = windows.computeIfAbsent(key, k -> new Window());
        synchronized (window) {
            long now = System.currentTimeMillis();
            if (now - window.firstHitAt >= windowMs) {
                window.firstHitAt = now;
                window.count = 0;
            }
            if (window.count >= max) {
                return false;
            }
            window.count++;
            return true;
        }
    }

    /** 清零（登录成功后调用）。 */
    public void clear(String key) {
        windows.remove(key);
    }

    /** 定期清理过期窗口，避免内存无限增长。 */
    @Scheduled(fixedDelay = 10 * 60 * 1000L, initialDelay = 10 * 60 * 1000L)
    public void evictExpired() {
        long now = System.currentTimeMillis();
        windows.entrySet().removeIf(entry -> {
            synchronized (entry.getValue()) {
                return now - entry.getValue().firstHitAt > EVICT_TTL_MS;
            }
        });
    }

    /** 单个限流窗口。 */
    private static class Window {
        /** 窗口内首次命中时间。 */
        private long firstHitAt = System.currentTimeMillis();
        /** 窗口内已计数次数。 */
        private int count;
    }
}
