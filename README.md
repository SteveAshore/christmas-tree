# 🎄 Grand Luxury Interactive Christmas Tree

An immersive, high-fidelity 3D Christmas tree experience featuring hand gesture control, dynamic chaos-to-order assembly, and luxurious emerald and gold aesthetics.

## 📝 Prompt

Gemini 3 in Google AI Studio and Claude 4.5 Sonnet in Cursor:

```
角色设定： 你是一位精通 React 19、TypeScript 和 Three.js (R3F) 的 3D 创意开发专家。 任务目标： 构建一个名为“豪华互动圣诞树 (Grand Luxury Interactive Christmas Tree)”的高保真 3D Web 应用。视觉风格需呈现“特朗普式”的奢华感，主色调为深祖母绿和高光金色，并伴有电影级的辉光效果。 技术栈： React 19, TypeScript, React Three Fiber, Drei, Postprocessing, Tailwind CSS。
核心逻辑与架构： 状态机： 包含 CHAOS（混沌散落）和 FORMED（聚合成树）两种状态，并在两者间动态变形。 双坐标系统 (Dual-Position System)： 所有元素（针叶、装饰物）初始化时需分配两个坐标： ChaosPosition：球形空间内的随机坐标。 TargetPosition：构成树木圆锥形状的目标坐标。
TargetPosition：构成树木圆锥形状的目标坐标。 在 useFrame 中根据进度 在两者间进行插值 (Lerp)。具体实现细节： 针叶系统 (Foliage)： 使用 THREE.Points 和自定义 ShaderMaterial 渲染大量粒子。 装饰物 (Ornaments)： 使用 InstancedMesh 优化渲染。分为各种颜色的礼物盒（重）、各种颜色的彩球（轻）、各种点缀灯光（极轻），赋予不同的物理推力权重。使用 Lerp 实现丝滑的归位动画。 后期处理： 启用 Bloom 效果（阈值 0.8，强度 1.2），营造“金色光晕”。
场景配置： 摄像机位置 [0, 4, 20]，使用 Lobby HDRI 环境光。
在里面加上很多拍立得样式的照片的装饰。
使用摄像头图像检测手势，手势张开代表 unleash，闭上就变回圣诞树。通过手的移动可以调整视角。
```

## 🛠️ Installation

### (Windows)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SteveAshore/christmas-tree.git
   cd christmas-tree
   ```

2. **Install dependencies:**\
首先需要确认安装了`node.js`，具体的安装教程在文末给出。检查`node`和`npm`安装好的命令如下，如果输出版本号，则安装成功：
   ```bash
   node --version
   npm --version
   ```
   然后进行安装，命令如下：
   ```bash
   npm install
   ```
   如果遇到权限不足的情况，需要先以管理员身份打开cmd，切换到该项目的根目录，重新执行安装。
3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:3010`
   - Allow camera access for gesture control
   - Click "上传照片" to upload your photos

### (MacOS)
#### Part I : Git零基础安装
旨在帮助 macOS 用户从零开始安装和配置 Git，并成功克隆（git clone）该远程仓库到本地。

1. 环境准备：安装 Git
   
   在 macOS 上，使用 Homebrew 安装 Git。

   a. 安装 Homebrew（如果尚未安装）： 打开 终端 (Terminal) 并运行以下命令：
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   b. 使用 Homebrew 安装 Git： Homebrew 安装完成后，在终端中运行：
   ```bash
   brew install git
   ```
   c. 验证安装： 安装完成后，运行以下命令确认 Git 是否可用：
   ```bash
   git --version
   ```
   预期输出示例: `git version 2.44.0` 或更高版本。
2. 首次配置：设置身份信息
   
   在进行任何提交（Commit）操作之前，您需要告诉 Git 您的身份，这些信息将永久记录在您的提交历史中。

   使用 `--global` 标志将配置应用于您的所有 Git 仓库。

   a. 设置用户名
   ```bash
   git config --global user.name "Your Name"
   ```
   例如想设置名称为 `Mia`，指令为 `git config --global user.name "Mia"`。

   b. 设置电子邮箱
   ```bash
   git config --global user.email "youremail@example.com"
   ```
   同理，将双引号内的内容修改为想要设置的邮箱即可。

3. 核心操作：执行 git clone

   `git clone` 是将远程仓库（如 GitHub 上的项目）完整复制到本地计算机的命令。

   a. 选择克隆位置

   使用 `cd` 命令导航到您希望存放项目的本地文件夹。例如切换到“文档”文件夹：
   ```bash
   cd ~/Documents/
   ```
   
   b. 克隆本仓库
   ```bash
   git clone https://github.com/SteveAshore/christmas-tree.git
   ```

   c. 进入仓库目录
   ```bash
   cd christmas-tree
   ```
#### Part II : Node.js 安装
1. 使用 Homebrew 安装 Node.js
   ```bash
   brew install node
   ```
2. 验证安装
   ```bash
   node --version
   npm --version
   ```

#### Part III: 使用`nmp`安装
   ```bash
   npm install
   ```
#### Part IV：运行服务器
   ```bash
   npm run dev
   ```
#### Part V：浏览器操作
   - 打开Safari浏览器，在搜索栏输入 `http://localhost:3010`
   - 允许相机权限以便手势控制
   - 点击 "上传照片" 来上传照片

## 🎯 Usage

### Gesture Controls

1. **Position your hand** in front of the webcam (visible in top-right preview)
2. **Move your hand** to control the camera angle:
   - Left/Right: Horizontal rotation
   - Up/Down: Vertical tilt
3. **Open your hand** (spread all fingers): Unleash chaos mode
4. **Close your fist**: Restore tree to formed mode

### Mouse Controls

When no hand is detected, you can:
- **Click and drag** to rotate the view
- **Scroll** to zoom in/out
- **Right-click and drag** to pan (disabled by default)

## 🎅 Happy Holidays!

May your code be merry and bright! 🎄✨

## Appendix
`node.js`的安装教程：