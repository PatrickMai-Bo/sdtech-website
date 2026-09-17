/**
 * Tailwind 编译配置（仅本机编译期使用，不进镜像、不进运行时）
 * 编译命令（在仓库根执行）：
 *   npx --yes tailwindcss@3 -c tailwind.config.js \
 *     -i frontend/assets/css/tailwind.src.css \
 *     -o frontend/assets/css/tailwind.min.css --minify
 *
 * 注意：新增任何 Tailwind class 后必须重新执行上述命令，否则线上不生效。
 * JS 中拼接出来的 class 名必须写完整字符串（如 'bg-primary' 不要写成 'bg-' + x），
 * 否则 content 扫描不到。
 */
module.exports = {
  content: ['./frontend/**/*.html', './frontend/**/*.js', './README.md'],
  theme: {
    extend: {
      colors: {
        primary: '#3B6EA5',
        primaryDark: '#2E5A87',
        primarySoft: '#EAF0F7',
        ink: '#1F2328',
        inkDeep: '#3A3F45',
        inkMid: '#5A6169',
        inkWeak: '#8B929A',
        line: '#E2E6EA',
        surface: '#EDF0F3',
        surfaceSoft: '#F7F8FA',
        accent: '#B08D57',
        success: '#4A7C59'
      },
      borderRadius: { card: '12px', ctl: '8px', icon: '10px' },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'Inter', 'sans-serif']
      },
      transitionTimingFunction: { DEFAULT: 'cubic-bezier(.4,0,.2,1)' }
    }
  },
  plugins: []
};
