# 五角色三维宠物调研（2026-10-06）

## 事实

- 晴小团由本项目 `src/PetCompanion.tsx` 的 SVG 定义：圆团身体、两耳、双叶、淡紫/青色渐变、短四肢、眼和腮红。它是本项目原创角色，三维造型应以该现有设计为基准。
- 奶龙官网 https://www.nailoong.com/ 将其描述为 3D 动画中的黄色异星幼龙，强调大肚子；现有 `docs/current/pet-space-customization/research_characters.md` 记录了用户参考图所见的凸出圆嘴、圆眼、白肚皮、短肢。官网还明确列有品牌授权业务，公开介绍不构成产品模型的再分发许可。
- https://www.chiikawaofficial.com/characters/ 核对吉伊、ハチワレ（小八）、うさぎ（乌萨奇）的身份与性格。项目现有 SVG 取舍见 `src/PetCharacters.tsx` 与旧 `research_characters.md`：吉伊白色短圆耳；小八蓝耳、蓝色头纹及尾；乌萨奇米黄身体和长耳。三角色的具体三维背面、官方绑定和动画关键帧未取得，不能把推测称作官方设定。
- 当前画像统一由 `PetPortrait` 出口复用到浮层、伙伴大展示、多个小缩略图和记录时光。`petBehavior.ts` 控制失焦、休息、拖动、关闭动态等政策。Three.js 已在依赖中；宠物没有 WebGL canvas。直接让所有缩略图各建一个 WebGL 上下文会增加成本。
- Blender 官方下载页当前提供 Windows x64 5.2.2 LTS 便携 ZIP；官方 glTF 文档支持打包 `.glb` 与动作导出；Three.js 官方 `GLTFLoader` 与 `AnimationMixer` 可加载及播放它们。

## 建模设计取舍

统一采用柔和低面数、圆润轮廓、哑光材质、正面可读的比例；每个角色独立网格与动作，不靠换色冒充不同造型。先做正面和侧面灰模评审，再细化脸部、材质及动作，避免仅按一张正面图推断背部。

| 角色 | 三维辨识重点 | 待机 / 招呼方向 |
| --- | --- | --- |
| 晴小团 | 圆团、双耳、双叶、渐变色、短肢 | 呼吸眨眼 / 轻摆招手 |
| 奶龙 | 大头、凸嘴、白色大肚皮、短臂足和尾 | 肚皮起伏 / 跺脚欢呼 |
| 吉伊 | 白色圆身、短圆耳、粉脸颊 | 轻晃 / 害羞挥手 |
| 小八 | 蓝耳与头顶蓝色分叉纹、尾 | 探头摆尾 / 摇爪 |
| 乌萨奇 | 米黄身体、长耳、粉脸颊 | 轻弹 / 跳跃雀跃 |

这些动作是晴笺自己的产品设计，非官方动画复刻。模型只使用自行建立的网格和材质，不下载并内嵌网上的角色文件。

## 技术与授权结论

采用 Blender 原生 `.blend` 保留可编辑源，导出各角色 `.glb`。应用内仅对浮层和伙伴大展示按需挂载一个三维画布；缩略图和记录时光先保持 SVG，避免多画布与布局回归。必须保留 SVG 作为 WebGL/模型加载失败回退，并在停止动态时保持静态姿态。五角色本机原型可以验证造型；第三方四角色未取得可再分发许可，发布包需排除它们，授权后再纳入。

来源：Blender https://www.blender.org/download/ ；Blender glTF https://docs.blender.org/manual/en/4.2/addons/import_export/scene_gltf2.html ；Three.js https://threejs.org/docs/pages/GLTFLoader.html 、https://threejs.org/docs/pages/AnimationMixer.html 。
