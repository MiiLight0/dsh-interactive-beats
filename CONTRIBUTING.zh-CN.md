# 参与这个仓库

**一句话：代码开源，更新我们自己做。issue 和 PR 都会看，但外部 PR 不合并。**

[English →](./CONTRIBUTING.md)

## issue 是正门

这个插件是从真实剧组里长出来的，所以**带着项目来的反馈最值钱**：哪一拍生成得不对、哪个 diff
看漏了、哪次锁定之后流程卡住了。这些比一句“支持一下”有用一百倍。

开 issue 时顺手带上这几样，能少一轮来回：

- 插件版本（`{"action":"pingVersion"}` 会直接报出来）
- Harness 版本、系统、Node 版本
- 怎么装的：GitHub / tag / tarball / npm / 本地目录
- 你点了哪个按钮，或者调了哪个 action，期望是什么，实际是什么
- 报错原文。面板会原样显示，Host 终端里有 `[interactive-beats]` 开头的日志

功能请求也走 issue。**说清楚生产上的问题，比说清楚你想要哪个按钮更有用** —— 这是系列插件，
你觉得该长在这儿的按钮，可能下一弹才归它管。

安全漏洞不要开公开 issue，看 [SECURITY.md](./SECURITY.md)。

## PR：我们会看，但不合并

不是嫌外面的代码不好。这条生产线跟着剧组排期走，插件没法挂在别人的 review 队列后面等；
一个团队、一个口径，改完就发，这是我们能保证更新速度的方式。

所以：

- PR 可能被直接关掉，哪怕里面的想法我们采用了 —— 这是流程，不是对你那版代码的评价。
- 真觉得某个 PR 解决了问题，我们会自己实现一遍，然后在 `CHANGELOG.md` 里署上提出者的名字。
- MIT 在这儿摆着：等不及的话，fork 出去自己发，完全没问题，不用问。

如果你已经写好了补丁，最省事的方式是**先开 issue 说清楚问题和你改了什么**，别急着开 PR。

## 想在本地跑一份

不用装依赖，不用构建：

```sh
git clone https://github.com/MiiLight0/dsh-interactive-beats.git
cd dsh-interactive-beats
npm test          # Host + Client 两段冒烟测试，不需要 Harness
npm run check     # 发布闸门：manifest、身份、语法、隐私
```

想在真 Harness 里试装本地目录：

```sh
dsh plugin --profile test add "$PWD"
dsh --profile test --dump-config | grep interactive-beats
```

## 代码里的几条硬规矩

1. **ESM，具名导出。** Host 入口导出 `name`、`inject`、`apply`。换成 default export 会丢掉
   `inject` 元数据，Loader 挂载时就没有 `webServer` 了。
2. **一切可回收。** 路由、插槽、语言词典都注册在 `ctx.effect()` 里，卸载组合包时能干净移除。
3. **提示词只放 Host。** 浏览器不能改模型提示词。
4. **没有遥测，没有启动请求。** 唯一的出网是人手动触发的模型调用。
5. **在边界上校验。** 每个 action 都按 store 的同一套常量收敛输入，出错抛
   `HttpError(status, message)` —— 这句话会直接给用户看，写成给人看的。
6. **身份是一个字符串。** 包名、patch 行 `name`、客户端模块 id、`PLUGIN_VERSION`、仓库 owner
   必须一致，`npm run check` 会替你核对。
7. **文案也是产品。** 界面中文优先，语气和面板其余部分一致：短、具体、不端着。

## 品牌素材

仓库里有两个不同的标，别混用：

- `icon.svg` 是**插件**图标，出现在 Harness 插件列表里。它属于这个产品，可以随面板一起改。
- `docs/miilight-logo.png` 是**团队**标志，不在 MIT 覆盖范围内：不要改色、重画、裁圆。

横幅和社交卡把 PNG 以 data URI 内嵌进 SVG，所以两个 SVG 都是自包含的。换标是两步活：

```sh
cp <new-mark>.png docs/miilight-logo.png      # 正方形，圆外透明，192 px
node scripts/embed-logo.mjs                   # 重写两个 SVG 里的 data URI
rsvg-convert -w 1280 docs/banner.svg -o docs/banner.png
rsvg-convert -w 1280 docs/social-preview.svg -o docs/social-preview.png
optipng -o2 docs/*.png
npm run check
```

## 安全问题

见 [SECURITY.md](./SECURITY.md)。走 GitHub 的私密漏洞上报，不要开公开 issue。
