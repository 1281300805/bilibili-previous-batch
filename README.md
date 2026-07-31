# B站推荐上一批

![B站「换一换」终于能撤回了](promo/cover-xiaoheihe.png)

手快多点了一次“换一换”，刚才想看的视频却找不回来了？

这个轻量 Chrome / Edge 扩展会在 B 站首页“换一换”下方增加“上一批”，保存最近 10 批推荐，并拦住过快的连续点击。

## 功能

- **上一批推荐**：连续返回最近 10 批首页推荐；
- **防止误触**：为“换一换”增加 650 毫秒防连点；
- **即装即用**：不需要账号配置；
- **本地运行**：不收集账号信息，不上传浏览数据，不请求外部服务器。

## 下载与安装

### Chrome 安装

1. 下载 [Chrome v0.1.1 安装包](https://github.com/1281300805/bilibili-previous-batch/releases/latest/download/bilibili-previous-batch-v0.1.1.zip)；
2. 将 ZIP 解压到一个固定文件夹；
3. 在 Chrome 地址栏打开 `chrome://extensions/`；
4. 开启右上角“开发者模式”；
5. 点击“加载已解压的扩展程序”；
6. 选择刚才解压得到的文件夹；
7. 打开或刷新 [B站首页](https://www.bilibili.com/)。

### Microsoft Edge 安装

Edge 和 Chrome 都基于 Chromium，本项目使用同一套扩展代码：

> 注意：部分新版 Edge 稳定版可能不显示“开发人员模式”和“加载解压缩的扩展”。遇到这种情况并不是压缩包有问题。开发测试可改用 Microsoft Edge Dev/Canary；面向普通用户分发时，应发布到 Microsoft Edge 加载项商店。

1. 下载 [Edge v0.1.1 安装包](https://github.com/1281300805/bilibili-previous-batch/releases/latest/download/bilibili-previous-batch-edge-v0.1.1.zip)，并解压到一个固定文件夹；
2. 在 Edge 地址栏打开 `edge://extensions/`；
3. 开启左侧的“开发人员模式”；
4. 点击“加载解压缩的扩展”；
5. 选择刚才解压得到的文件夹；
6. 打开或刷新 [B站首页](https://www.bilibili.com/)。

更详细的说明见 [Edge 安装指南](EDGE-INSTALL.md)。

### 从源码安装

```bash
git clone https://github.com/1281300805/bilibili-previous-batch.git
```

然后在 Chrome 的 `chrome://extensions/` 或 Edge 的 `edge://extensions/` 中加载仓库目录。

## 使用方法

正常点击一次“换一换”后，“上一批”按钮会亮起。按钮右上角的数字表示目前还可以返回多少批。

历史保存在当前 B 站标签页的内存中，刷新或关闭标签页后会自动清空。

## 工作原理

扩展在每次正常刷新推荐前保存当前推荐卡片的页面快照。点击“上一批”时，快照会临时覆盖在 B 站原推荐区上方，而 B 站自己的实时推荐区仍然保留，因此不会直接篡改账号推荐数据。

## 已知限制

- 返回批次中的封面、标题和作者链接可以正常点击；
- B 站依赖内部脚本的少量悬停动画可能不会完全恢复；
- B 站更新首页结构后，扩展可能需要同步适配。

## 隐私

本扩展没有后台服务，不读取 Cookie，不访问浏览历史，不发送网络请求。历史推荐仅存在当前页面内存中。

## 反馈

如果按钮没有出现或恢复结果异常，请在 [Issues](https://github.com/1281300805/bilibili-previous-batch/issues) 中附上浏览器名称、版本和页面截图。
