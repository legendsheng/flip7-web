# 🃏 Flip 7 — 完整部署与代码结构指南 (Deployment & Code Architecture)

本文档详细介绍了 **Flip 7** 的代码文件位置、架构设计、本地运行方式，以及在 Linux 服务器、Nginx 反向代理、Docker 容器和云平台上的完整部署步骤。

---

## 📁 一、项目代码目录结构

整个项目保存在当前工程目录（`/Users/shengluo/Study/flip7-web`）下，采用**极简架构，零第三方依赖**（无需 `pip install`，无需 Node.js / npm）：

```text
flip7-web/
├── server.py              # 后端服务核心 (Python 3 标准库)
│                          # 包含 HTTP 静态资源服务、RFC 6455 原生 WebSocket 服务器、
│                          # 房间管理、Flip 7 官方发牌与爆牌洗牌逻辑、AI 决策引擎
│
├── public/                # 前端资源目录 (纯原生 HTML5 / CSS3 / Vanilla JS)
│   ├── index.html         # 单页面应用入口：首页、本地对局设置、联机大厅、牌桌、规则弹窗
│   ├── style.css          # 全局样式：5套主题、3D拟真宝石牌面、全息光泽、动画粒子
│   ├── game.js            # 前端业务核心：UI渲染、WebSocket实时通信、本地对战状态机、音效合成
│   └── i18n.js            # 国际化语言包：中英双语词条字典与动态语言切换
│
├── Dockerfile             # 容器化构建文件 (基于精简 Alpine 镜像)
├── docker-compose.yml     # Docker Compose 一键启动配置
├── README.md              # 游戏玩法与规则说明
└── DEPLOY.md              # 本部署与代码指南文档
```

### 关键代码位置快速索引：
- **牌面外观与宝石配色修改**：[`public/style.css`](file:///Users/shengluo/Study/flip7-web/public/style.css)（搜索 `.game-card`、`.card-num-0` 至 `.card-num-12`、`.card-action-heart`）
- **牌面文字与渲染逻辑修改**：[`public/game.js`](file:///Users/shengluo/Study/flip7-web/public/game.js)（搜索 `CARD_META`、`renderCardHTML`、`renderCardLargeHTML`）
- **游戏规则与发牌逻辑修改**：[`server.py`](file:///Users/shengluo/Study/flip7-web/server.py)（搜索 `build_deck`、`handle_draw`、`check_round_over`）
- **中英文案翻译修改**：[`public/i18n.js`](file:///Users/shengluo/Study/flip7-web/public/i18n.js)（搜索 `zh:` 或 `en:`）

---

## 💻 二、本地启动与调试运行

### 1. 环境要求
- **Python 3.8+**（macOS 自带或通过官网安装）
- **现代浏览器**（Chrome / Safari / Edge / Firefox 等）

### 2. 本地运行命令
在终端进入项目根目录后执行：

```bash
# 默认 8000 端口启动
python3 server.py

# 或指定其他端口（例如 8080）
python3 server.py 8080
```

打开浏览器访问：
```text
http://localhost:8000
```

---

## 📱 三、局域网联机（朋友同一 WiFi / 热点畅玩）

如果想要朋友用手机或平板在同一个局域网（如家里路由器 WiFi 或手机热点）直接加入对局：

1. **查看本机局域网 IP**：
   - **macOS**：打开终端运行 `ipconfig getifaddr en0`（或在“系统设置 -> 网络 -> Wi-Fi”中查看 IP，例如 `192.168.1.100`）。
   - **Windows**：打开 cmd 运行 `ipconfig`，查看 `IPv4 地址`。
   - **Linux**：运行 `hostname -I`。

2. **启动服务**（`server.py` 默认已绑定 `0.0.0.0`，监听所有网卡）：
   ```bash
   python3 server.py 8000
   ```

3. **好友直接访问**：
   好友在手机/平板浏览器中输入：
   ```text
   http://192.168.1.100:8000
   ```
   *(将 `192.168.1.100` 替换为您电脑的实际 IP 即可)*。

---

## 🌐 四、公网 Linux 云服务器部署 (生产环境)

支持部署在任何云厂商的 VPS（如阿里云、腾讯云、华为云、AWS、DigitalOcean、Linode、轻量应用服务器等）。

### 方案 A：使用 Systemd 常驻后台运行（推荐，最轻量）

1. **将项目上传至服务器**（例如上传到 `/opt/flip7`）：
   ```bash
   mkdir -p /opt/flip7
   # 使用 scp 或 git clone 将代码放到 /opt/flip7
   ```

2. **创建 Systemd 服务配置文件**：
   ```bash
   sudo nano /etc/systemd/system/flip7.service
   ```
   粘贴以下内容：
   ```ini
   [Unit]
   Description=Flip 7 Card Game Server
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt/flip7
   ExecStart=/usr/bin/python3 /opt/flip7/server.py 8000
   Restart=always
   RestartSec=3
   Environment=PYTHONUNBUFFERED=1

   [Install]
   WantedBy=multi-user.target
   ```

3. **启动并设置开机自启**：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable flip7
   sudo systemctl start flip7
   ```

4. **管理服务命令**：
   ```bash
   # 查看运行状态
   sudo systemctl status flip7

   # 重启服务
   sudo systemctl restart flip7

   # 查看实时运行日志
   journalctl -u flip7 -f
   ```

---

### 方案 B：结合 Nginx 反向代理与 HTTPS / WSS 域名配置（推荐公网建站）

游戏使用了 WebSocket 实时通信，如果绑定了域名并启用了 HTTPS，浏览器要求 WebSocket 必须同时使用加密的 **`wss://`** 协议。通过 Nginx 转发只需简单配置：

1. **安装 Nginx 与 Certbot (SSL 证书工具)**：
   ```bash
   sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **配置 Nginx 站点配置**：
   ```bash
   sudo nano /etc/nginx/sites-available/flip7
   ```
   填入以下配置（将 `yourdomain.com` 替换为你的实际域名）：
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;

           # 支持 WebSocket 协议升级 (至关重要)
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";

           # 透传真实客户端 IP 与主机头
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # 保持长连接防超时
           proxy_read_timeout 86400s;
           proxy_send_timeout 86400s;
       }
   }
   ```

3. **启用站点并测试语法**：
   ```bash
   sudo ln -s /etc/nginx/sites-available/flip7 /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **一键签发免费 HTTPS 证书 (Let's Encrypt)**：
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```
   Certbot 会全自动为你配置好 HTTPS (443) 和自动续期。此时打开 `https://yourdomain.com` 即可直接游玩！

---

## 🐳 五、Docker & Docker Compose 一键容器化部署

本项目已提供优化后的精简 `Dockerfile` 与 `docker-compose.yml`。

### 1. 使用 Docker 构建并运行
```bash
# 1. 构建镜像 (基于 Python 3.11 Alpine，体积仅约 50MB)
docker build -t flip7-game .

# 2. 启动容器并在后台常驻
docker run -d --name flip7 -p 8000:8000 --restart always flip7-game
```

### 2. 使用 Docker Compose（更推荐）
```bash
# 一键后台启动
docker compose up -d

# 查看运行日志
docker compose logs -f

# 停止容器
docker compose down
```

---

## ☁️ 六、Serverless / 免费云托管平台一键部署

如果您不想自己维护 Linux VPS，可将代码推送到 GitHub 后使用以下现代云平台一键部署：

1. **Railway (推荐)**：
   - 登录 [railway.app](https://railway.app/)，点击 `New Project -> Deploy from GitHub repo`。
   - Railway 会自动检测项目并根据 `Dockerfile` 构建。
   - 在 Settings 中开启 Public Networking 生成免费公网域名。

2. **Render**：
   - 登录 [render.com](https://render.com/)，选择 `New -> Web Service`。
   - Environment 选择 `Docker` 或 `Python 3`（启动命令填写 `python3 server.py $PORT`）。

3. **Zeabur**：
   - 登录 [zeabur.com](https://zeabur.com/)，导入 GitHub 仓库，自动检测为 Docker 项目，点击部署即刻生成域名。

---

## ❓ 七、常见问题与排查 (Troubleshooting FAQ)

### Q1: 朋友在局域网内打不开页面？
- **检查防火墙**：
  - macOS：在“系统设置 -> 网络 -> 防火墙”中检查是否阻止了 Python 连入。
  - Linux 云服务器：在云服务商控制台（阿里云安全组 / 腾讯云防火墙）中**放行 8000 端口**（以及 80 / 443 端口）。

### Q2: 提示 WebSocket 连接断开或连不上？
- 检查控制台（F12 -> Console），如果网站是 `https://` 访问的，WebSocket 会自动尝试 `wss://`。请确保 Nginx 代理配置中包含了：
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  ```

### Q3: 游戏数据如何持久化？
- 本游戏房间为实时内存运行架构，房内所有玩家离开或房间解散后内存自动释放。
- 玩家的昵称、头像与主题风格选择自动保存在客户端本地存储（`localStorage`）中，下次进入游戏无需重新设置。
