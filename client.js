window.__ModuleLoader__.load({
  id: 'dsh-interactive-beats',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useRef, useState } = React

    const NS = 'beatFoundation'
    const API = '/interactive-beats/api'

    // ── copy ──────────────────────────────────────────────────────────────────

    const zh = {
      'panel.title': '十五拍定稿台',
      'panel.subtitle': '十五拍定稿，分集再开工。素材 → 十五拍 → 锁定 → 导出。',
      'head.eyebrow': '15 BEATS · 结构地基',
      'head.stat.written': '{n} 已写',
      'head.stat.final': '{n} 定稿',
      'head.stat.locked': '{n} 锁定',
      'head.stat.writtenLabel': '已写',
      'head.stat.finalLabel': '已定稿',
      'head.stat.lockedLabel': '已锁定',
      'head.settings': '模型设置',
      'head.export': '导出',
      'head.newProject': '新建项目',
      'head.renameProject': '重命名',
      'project.select': '项目',
      'project.untitled': '未命名项目',
      'project.createPrompt': '新项目叫什么？',
      'project.defaultTitle': '新项目',
      'project.renamePrompt': '项目新名字',
      'project.delete': '删除项目',
      'project.deleteConfirm': '删除这个项目？15 拍和素材都会一起删掉。',
      'project.deleteLast': '至少保留一个项目。',
      'project.unsavedConfirm': '当前项目有未保存修改，仍要切换？',
      'tabs.material': '素材池',
      'tabs.beats': '十五拍',
      'material.title': '素材池',
      'material.subtitle': '世界观、故事、人物、想法，想到什么丢什么。生成时模型会自己取舍。',
      'material.placeholder': '把整份底稿、人物小传、零散灵感都丢进来……\n\n建议至少写清：主角是谁、她想要什么、她怕什么、失败会失去什么、结局是什么。',
      'material.chars': '{n} 字',
      'material.save': '保存素材',
      'material.saving': '保存中…',
      'material.dirty': '有未保存修改',
      'material.saved': '素材已保存',
      'material.generate': '生成 15 拍',
      'material.generating': '正在生成 15 拍…',
      'material.generateHint': '会读完整份素材，通常 30-90 秒。',
      'material.lockedHint': '还有拍是锁定的，先全部解锁再生成。',
      'material.confirmOverwrite': '生成会覆盖全部 15 拍（包括已写的草稿）。继续？',
      'material.lastGeneration': '上次生成',
      'material.missing': '素材缺口',
      'material.noMissing': '模型没有列出明显缺口。',
      'material.warnings': '生成警告',
      'material.briefTitle': '项目底稿',
      'material.briefHint': '生成后会自动填；也可以自己改，下一次生成会参考这里。',
      'material.logline': '一句话故事',
      'material.theme': '主题',
      'material.format': '体量 / 形态',
      'material.notes': '结构笔记',
      'material.notesPlaceholder': '这一版改了什么、砍了什么、为什么……',
      'material.saveBrief': '保存底稿',
      'material.howTo': '怎么用',
      'material.howTo1': '把大底和零散想法都丢进素材池。',
      'material.howTo2': '点「生成 15 拍」，让模型先给一版结构。',
      'material.howTo3': '去「十五拍」逐拍改：发生什么、改变了什么、留下什么钩子。',
      'material.howTo4': '每拍点「体检」，看功能、因果、人物、主题、钩子五个维度。',
      'material.howTo5': '定稿 → 锁定 → 导出。锁定的 15 拍就是整部剧不再动的地基。',
      'material.dangerTitle': '项目',
      'material.delete': '删除这个项目',
      'material.empty': '这个项目还没有素材。先把你手上的大底贴进来。',
      'beats.title': '十五拍',
      'beats.subtitle': '左边是地基，右边是当前这一拍。先定结构，再谈文笔。',
      'beats.act1': '第一幕 · 建置',
      'beats.act2': '第二幕 · 对抗',
      'beats.act3': '第三幕 · 解决',
      'beats.act1Range': 'p1-25',
      'beats.act2Range': 'p25-85',
      'beats.act3Range': 'p85-110',
      'beats.sheetReview': '全剧体检',
      'beats.lockAll': '全部锁定',
      'beats.unlockAll': '全部解锁',
      'beats.lockAllConfirm': '把 15 拍全部锁定？锁定后要解锁才能改。',
      'beats.unlockAllConfirm': '解锁全部 15 拍？',
      'beats.locked': '已锁定 {n}/15',
      'beats.written': '已写 {n}/15',
      'beats.listHint': '点一拍打开；页码偏差 > 3 会标黄，> 6 会标红。',
      'view.list': '列表',
      'view.table': '表格',
      'table.hint': '页码、一句话、内容和钩子直接改，离开格子自动保存；转变在「详情」里改。批量改写一次最多勾 6 拍。',
      'table.beat': '节拍',
      'table.total': '共 {n} 拍',
      'table.select': '选择',
      'table.selectAll': '全选',
      'table.page': '页码',
      'table.oneLine': '一句话',
      'table.content': '发生什么',
      'table.turn': '转变',
      'table.hook': '钩子',
      'table.status': '状态',
      'table.history': '历史',
      'table.detail': '详情',
      'table.saving': '保存中…',
      'table.locked': '已锁定',
      'table.max': '一次最多选 6 拍。',
      'batch.title': '批量修改预览',
      'batch.subtitle': '确认模型给这几拍改了什么，再决定是否应用。',
      'batch.selected': '已选 {n} 拍',
      'batch.model': '模型',
      'batch.op': '功能',
      'batch.target': '改哪些字段',
      'batch.instruction': '修改指令',
      'batch.instructionPlaceholder': '例如：把这三拍的钩子改得更狠，保留原有信息，不要加新人物。',
      'batch.preview': '生成修改预览',
      'batch.previewing': '正在生成…',
      'batch.apply': '应用到 {n} 拍',
      'batch.applying': '正在应用…',
      'batch.current': '现在',
      'batch.proposed': '改成',
      'batch.note': '模型说明',
      'batch.clear': '清空选择',
      'batch.modelPrimary': '主模型',
      'batch.modelSecondary': '副模型',
      'batch.secondaryMissing': '未配置副模型',
      'batch.op.rewrite': '按指令改写',
      'batch.op.tighten': '收紧',
      'batch.op.conflict': '补冲突',
      'batch.op.hook': '钩子更抓人',
      'batch.target.all': '全部四个字段',
      'batch.target.oneLine': '只改一句话',
      'batch.target.content': '只改内容',
      'batch.target.turn': '只改变转',
      'batch.target.hook': '只改钩子',
      'batch.max': '一次最多选 6 拍。',
      'history.button': '历史',
      'history.title': '版本历史',
      'history.subtitle': '每次保存都会留下一个版本；可以恢复旧版本。',
      'history.empty': '还没有历史版本。保存一次这一拍就会生成。',
      'history.loading': '正在读取版本…',
      'history.latest': '当前保存版本',
      'history.restore': '恢复这个版本',
      'history.restoring': '正在恢复…',
      'history.source.manual': '手动保存',
      'history.source.ai-batch': 'AI 批量',
      'history.source.restore': '恢复版本',
      'history.note': '说明',
      'history.close': '关闭',
      'history.count': '{n} 个版本',
      'history.starredCount': '{n} 个星标',
      'version.star': '星标',
      'version.unstar': '取消星标',
      'version.onlyStarred': '只看星标',
      'version.all': '全部版本',
      'version.noStarred': '还没有星标版本。',
      'version.stampHint': '版本号 = 月日时分（如 11051727）；同分钟重复时自动 +1 分钟',
      'batch.selectedChanges': '已选 {n} 处',
      'batch.selectAll': '全选',
      'batch.selectNone': '全不选',
      'batch.applySelected': '应用 {n} 处改动',
      'batch.applyOne': '应用这一格',
      'batch.applyingOne': '应用中…',
      'batch.diffNow': '现在',
      'batch.diffNew': '改成',
      'toast.batchAppliedFields': '已应用 {n} 处改动。',
      'toast.batchOneApplied': '已应用这一格。',
      'toast.starred': '已加星标。',
      'toast.unstarred': '已取消星标。',
      'toast.tableSaved': '已保存这一格。',
      'toast.batchApplied': '已应用 {n} 拍的修改。',
      'toast.versionRestored': '已恢复这个版本。',
      'toast.batchPreview': '预览已生成，确认后应用。',
      'toast.maxSelected': '一次最多选 6 拍。',
      'status.empty': '空白',
      'status.draft': '草稿',
      'status.final': '已定稿',
      'status.locked': '已锁定',
      'beat.eyebrow': '第 {no} 拍 · 第 {act} 幕 · 目标 p{target}',
      'beat.final': '定稿',
      'beat.unfinal': '取消定稿',
      'beat.lock': '锁定',
      'beat.unlock': '解锁',
      'beat.lockedBanner': '这一拍已锁定，只能看，不能改。要改先解锁。',
      'beat.task': '这一拍的任务',
      'beat.oneLine': '一句话作用',
      'beat.oneLinePlaceholder': '这一拍在整部剧里干什么？',
      'beat.content': '这一拍发生什么',
      'beat.contentPlaceholder': '具体事件、场景、人物动作。不要写“主角成长了”这种概括。',
      'beat.turn': '价值转变',
      'beat.turnPlaceholder': '从 X 到 Y：她失去了什么 / 知道了什么 / 关系变了什么',
      'beat.hook': '钩子',
      'beat.hookPlaceholder': '这一拍结束时，观众最想知道什么？',
      'beat.page': '当前页码',
      'beat.episodeHint': '对应集数',
      'beat.episodeHintPlaceholder': '第 1-2 集',
      'beat.pageTarget': '目标 p{target}',
      'beat.pageDrift': '偏差 {drift}',
      'beat.sourceNote': '素材来源 / 改编说明',
      'beat.sourceNotePlaceholder': '用了原素材的什么？删/并/前移/后移了什么？为什么？',
      'beat.notes': '修改备注',
      'beat.notesPlaceholder': '给自己或编剧的备注：这场戏要小心什么、下一版改哪里……',
      'beat.checks': '写完检查',
      'beat.checkProgress': '{done}/{total}',
      'beat.save': '保存这一拍',
      'beat.saving': '保存中…',
      'beat.saved': '已保存',
      'beat.dirty': '有未保存修改',
      'beat.review': '体检这一拍',
      'beat.reviewing': '正在体检…',
      'beat.reviewDual': '双模型体检',
      'beat.noReview': '还没有体检。点「体检这一拍」，让模型从功能、因果、人物、主题、钩子五个维度看一遍。',
      'beat.reviewHint': '评分为模型自评，用来比较不同版本，不是绝对分数。',
      'beat.score': '综合',
      'beat.dim.function': '功能',
      'beat.dim.causality': '因果',
      'beat.dim.character': '人物',
      'beat.dim.theme': '主题',
      'beat.dim.hook': '钩子',
      'beat.verdict': '判断',
      'beat.issues': '问题',
      'beat.fix': '一个改法',
      'beat.alternatives': '替代方向',
      'beat.model': '评审模型',
      'beat.disagreement': '两个模型分差 {n} 分，建议重点看它们都指出的问题。',
      'beat.finalFirst': '先写内容，再定稿。',
      'beat.lockFirst': '先定稿，再锁定。',
      'beat.lockedToast': '已锁定。',
      'beat.unlockedToast': '已解锁。',
      'beat.confirmUnlock': '解锁这一拍？',
      'beat.unsavedConfirm': '这一拍有未保存修改，仍要切换？',
      'beat.reviewWarnings': '体检有警告',
      'sheet.title': '全剧体检',
      'sheet.subtitle': '让模型看 15 拍的整体：三幕、赌注、B 故事、中点、一无所有、第三幕衔接点。',
      'sheet.run': '开始体检',
      'sheet.rerun': '重新体检',
      'sheet.running': '正在看全剧…',
      'sheet.overall': '总评',
      'sheet.act1': '第一幕',
      'sheet.act2': '第二幕',
      'sheet.act3': '第三幕',
      'sheet.verdict': '总判断',
      'sheet.issues': '关键问题',
      'sheet.topFixes': '优先修改',
      'sheet.empty': '还没有全剧体检。',
      'sheet.close': '关闭',
      'sheet.warning': '全剧体检会读 15 拍，通常 30-60 秒。',
      'settings.title': '模型设置',
      'settings.subtitle': '主模型和副模型都来自 DSH 模型列表；双模型体检让两个模型各评一次，并排看分歧。',
      'settings.mode': '体检模式',
      'settings.mode.single': '单模型',
      'settings.mode.dual': '双模型',
      'settings.mode.singleHint': '只用主模型。',
      'settings.mode.dualHint': '主模型 + 副模型各评一次，并排显示。',
      'settings.primary': '主模型',
      'settings.primaryHint': '生成 15 拍和单模型体检都用它。',
      'settings.secondary': '副模型（双模型体检用）',
      'settings.secondaryHint': '建议选一个和主模型不同的模型，才能看出分歧。',
      'settings.followDefault': '跟随 DSH 默认',
      'settings.none': '不用第二个模型',
      'settings.externalOption': '外部兼容接口（高级）',
      'settings.currentDefault': '当前 DSH 默认：{label}',
      'settings.refresh': '刷新列表',
      'settings.modelsLoading': '正在读取 DSH 模型列表…',
      'settings.modelsEmpty': '没有读到 DSH 模型，请检查 DSH 的模型设置。',
      'settings.modelsUnsupported': '当前 DSH 没有可用的 LLM 服务。',
      'settings.modelsError': '部分 provider 读取失败',
      'settings.testPrimary': '测试主模型',
      'settings.testSecondary': '测试副模型',
      'settings.test': '测试外部模型',
      'settings.testDsh': '测试 DSH',
      'settings.testing': '测试中…',
      'settings.testOk': '连接成功',
      'settings.testFail': '连接失败',
      'settings.needSecondary': '双模型体检需要选第二个模型。',
      'settings.sameModel': '主模型和副模型是同一个，分数可能几乎一样。',
      'settings.external': '外部兼容接口',
      'settings.externalHint': '任何 OpenAI Chat Completions 兼容端点：自建网关、代理，或云厂商提供的兼容地址。默认留空，填了才会把素材发出去。',
      'settings.baseURL': '接口地址',
      'settings.model': '模型名称',
      'settings.apiKey': 'API Key',
      'settings.keySaved': '已保存 Key',
      'settings.keyPlaceholder': '留空不修改',
      'settings.clearKey': '清除已保存的 Key',
      'settings.save': '保存设置',
      'settings.saving': '保存中…',
      'settings.close': '关闭',
      'settings.needKey': '外部接口需要先填接口地址、模型名称，并保存 Key。',
      'export.title': '导出十五拍',
      'export.subtitle': '可以直接交给编剧当结构 brief，也可以粘进你自己的分集或大纲工具。',
      'export.warning': '还有 {n} 拍没锁定，导出的是草稿。',
      'export.dirty': '有未保存的修改；导出的是上一次保存的版本。',
      'export.copy': '复制 Markdown',
      'export.copied': '已复制',
      'export.download': '下载 .md',
      'export.close': '关闭',
      'common.retry': '重试',
      'common.loading': '正在打开十五拍定稿台…',
      'common.error': '打不开十五拍定稿台。',
      'common.close': '关闭',
      'common.cancel': '取消',
      'common.ok': '确定',
      'common.save': '保存',
      'common.delete': '删除',
      'common.rename': '重命名',
      'common.copy': '复制',
      'common.download': '下载',
      'common.of': '/',
      'dialog.confirmTitle': '确认操作',
      'dialog.continue': '继续',
      'toast.saved': '已保存。',
      'toast.generated': '15 拍已生成。素材缺口 {n} 项。',
      'toast.reviewed': '体检完成。',
      'toast.settingsSaved': '模型设置已保存。',
      'toast.projectCreated': '项目已创建。',
      'toast.projectDeleted': '项目已删除。',
      'toast.materialSaved': '素材已保存。',
      'toast.briefSaved': '底稿已保存。',
      'toast.lockedAll': '15 拍已全部锁定。',
      'toast.unlockedAll': '15 拍已全部解锁。',
      'toast.copyOk': 'Markdown 已复制。',
      'toast.copyFail': '复制失败，请手动选择文本。',
      'toast.needKey': '先保存外部模型 Key。',
    }

    // English covers the main shell: header, project switching, the material
    // pool, the beat list and the table view. Deeper panels fall back to the
    // Chinese copy on purpose rather than shipping a half-invented translation;
    // see README "Known Limitations".
    const en = {
      'panel.title': '15-Beat Foundation',
      'panel.subtitle': 'Finalize the 15 beats, then write the episodes. Material → beats → lock → export.',
      'head.eyebrow': '15-BEAT STRUCTURE',
      'head.stat.written': '{n} written',
      'head.stat.final': '{n} final',
      'head.stat.locked': '{n} locked',
      'head.stat.writtenLabel': 'Written',
      'head.stat.finalLabel': 'Final',
      'head.stat.lockedLabel': 'Locked',
      'head.settings': 'Model settings',
      'head.export': 'Export',
      'head.newProject': 'New project',
      'head.renameProject': 'Rename',
      'project.select': 'Project',
      'project.untitled': 'Untitled project',
      'project.createPrompt': 'Name this project',
      'project.defaultTitle': 'New project',
      'project.renamePrompt': 'New name for this project',
      'project.delete': 'Delete project',
      'project.deleteConfirm': 'Delete this project? Its material, beats and versions go with it.',
      'project.deleteLast': 'Keep at least one project.',
      'project.unsavedConfirm': 'This project has unsaved changes. Switch anyway?',
      'tabs.material': 'Material',
      'tabs.beats': '15 Beats',
      'material.title': 'Material pool',
      'material.subtitle': 'World, story, characters, loose ideas — dump it all in. The model decides what to keep at generation time.',
      'material.placeholder': 'Paste the whole draft, character notes, stray ideas…\n\nAt minimum: who the protagonist is, what she wants, what she fears, what she loses if she fails, and how it ends.',
      'material.chars': '{n} chars',
      'material.save': 'Save material',
      'material.saving': 'Saving…',
      'material.dirty': 'Unsaved changes',
      'material.saved': 'Material saved',
      'material.generate': 'Generate 15 beats',
      'material.generating': 'Generating 15 beats…',
      'material.generateHint': 'Reads the whole pool. Usually 30–90 seconds.',
      'material.lockedHint': 'Some beats are locked. Unlock everything before generating.',
      'material.confirmOverwrite': 'Generating overwrites all 15 beats, including drafts you already wrote. Continue?',
      'material.lastGeneration': 'Last generation',
      'material.missing': 'Missing material',
      'material.noMissing': 'The model did not list an obvious gap.',
      'material.warnings': 'Generation warnings',
      'material.briefTitle': 'Project brief',
      'material.briefHint': 'Filled in after a generation; edit it yourself and the next run reads from here.',
      'material.logline': 'Logline',
      'material.theme': 'Theme',
      'material.format': 'Format / length',
      'material.notes': 'Structure notes',
      'material.notesPlaceholder': 'What changed in this pass, what got cut, and why…',
      'material.saveBrief': 'Save brief',
      'material.howTo': 'How to use it',
      'material.howTo1': 'Put the whole draft and every loose idea into the pool.',
      'material.howTo2': 'Press “Generate 15 beats” and let the model propose a structure.',
      'material.howTo3': 'Go to “15 Beats” and fix them one by one: what happens, what turns, what hooks.',
      'material.howTo4': 'Review each beat on five axes: function, causality, character, theme, hook.',
      'material.howTo5': 'Finalize → lock → export. The locked 15 are the floor this series stands on.',
      'material.dangerTitle': 'Project',
      'material.delete': 'Delete this project',
      'material.empty': 'No material yet. Paste your draft in first.',
      'beats.title': '15 Beats',
      'beats.subtitle': 'The floor on the left, the current beat on the right. Structure first, prose later.',
      'beats.act1': 'Act I · Setup',
      'beats.act2': 'Act II · Confrontation',
      'beats.act3': 'Act III · Resolution',
      'beats.act1Range': 'p1-25',
      'beats.act2Range': 'p25-85',
      'beats.act3Range': 'p85-110',
      'beats.sheetReview': 'Review the sheet',
      'beats.lockAll': 'Lock all',
      'beats.unlockAll': 'Unlock all',
      'beats.lockAllConfirm': 'Lock all 15 beats? You will have to unlock them to edit.',
      'beats.unlockAllConfirm': 'Unlock all 15 beats?',
      'beats.locked': '{n}/15 locked',
      'beats.written': '{n}/15 written',
      'beats.listHint': 'Click a beat to open it. Page drift over 3 shows amber, over 6 shows red.',
      'view.list': 'List',
      'view.table': 'Table',
      'table.hint': 'Page, one-liner, content and hook are editable in place and save on blur; the value turn lives in the detail panel. Batch rewrite selects up to 6 beats.',
      'table.beat': 'Beat',
      'table.total': '{n} beats',
      'table.select': 'Select',
      'table.selectAll': 'Select all',
      'table.page': 'Page',
      'table.oneLine': 'One line',
      'table.content': 'What happens',
      'table.turn': 'Value turn',
      'table.hook': 'Hook',
      'table.status': 'Status',
      'table.history': 'History',
      'table.detail': 'Detail',
      'table.saving': 'Saving…',
      'table.locked': 'Locked',
      'table.max': 'Up to 6 beats at a time.',
      'batch.title': 'Batch rewrite preview',
      'batch.subtitle': 'Check what the model changed on these beats before you apply anything.',
      'batch.selected': '{n} selected',
      'batch.model': 'Model',
      'batch.op': 'Operation',
      'batch.target': 'Fields',
      'batch.instruction': 'Instruction',
      'batch.instructionPlaceholder': 'e.g. Make the hook on these three beats harder, keep the existing information, add no new characters.',
      'batch.preview': 'Generate preview',
      'batch.previewing': 'Generating…',
      'batch.apply': 'Apply to {n} beats',
      'batch.applying': 'Applying…',
      'batch.current': 'Now',
      'batch.proposed': 'Proposed',
      'batch.note': 'Model note',
      'batch.clear': 'Clear selection',
      'batch.modelPrimary': 'Primary model',
      'batch.modelSecondary': 'Secondary model',
      'batch.secondaryMissing': 'No secondary model',
      'batch.op.rewrite': 'Rewrite as instructed',
      'batch.op.tighten': 'Tighten',
      'batch.op.conflict': 'Add conflict',
      'batch.op.hook': 'Sharper hook',
      'batch.target.all': 'All four fields',
      'batch.target.oneLine': 'One-liner only',
      'batch.target.content': 'Content only',
      'batch.target.turn': 'Value turn only',
      'batch.target.hook': 'Hook only',
      'batch.max': 'Up to 6 beats at a time.',
      'history.button': 'History',
      'history.title': 'Version history',
      'history.subtitle': 'Every save leaves a version behind; old ones can be restored.',
      'history.empty': 'No versions yet. Save this beat once and one appears.',
      'history.loading': 'Loading versions…',
      'history.latest': 'Currently saved',
      'history.restore': 'Restore this version',
      'history.restoring': 'Restoring…',
      'history.source.manual': 'Manual save',
      'history.source.ai-batch': 'AI batch',
      'history.source.restore': 'Restore',
      'history.note': 'Note',
      'history.close': 'Close',
      'history.count': '{n} versions',
      'history.starredCount': '{n} starred',
      'version.star': 'Star',
      'version.unstar': 'Unstar',
      'version.onlyStarred': 'Starred only',
      'version.all': 'All versions',
      'version.noStarred': 'Nothing starred yet.',
      'version.stampHint': 'Version id = month-day-hour-minute (e.g. 11051727); a repeat in the same minute shifts one minute on',
      'batch.selectedChanges': '{n} selected',
      'batch.selectAll': 'Select all',
      'batch.selectNone': 'Select none',
      'batch.applySelected': 'Apply {n} changes',
      'batch.applyOne': 'Apply this cell',
      'batch.applyingOne': 'Applying…',
      'batch.diffNow': 'Now',
      'batch.diffNew': 'To',
      'toast.batchAppliedFields': '{n} changes applied.',
      'toast.batchOneApplied': 'Cell applied.',
      'toast.starred': 'Starred.',
      'toast.unstarred': 'Star removed.',
      'toast.tableSaved': 'Cell saved.',
      'toast.batchApplied': '{n} beats updated.',
      'toast.versionRestored': 'Version restored.',
      'toast.batchPreview': 'Preview ready. Apply what you want.',
      'toast.maxSelected': 'Up to 6 beats at a time.',
      'status.empty': 'Empty',
      'status.draft': 'Draft',
      'status.final': 'Final',
      'status.locked': 'Locked',
      'beat.eyebrow': 'Beat {no} · Act {act} · target p{target}',
      'beat.final': 'Finalize',
      'beat.unfinal': 'Unfinalize',
      'beat.lock': 'Lock',
      'beat.unlock': 'Unlock',
      'beat.lockedBanner': 'This beat is locked: read only. Unlock it to edit.',
      'beat.task': 'What this beat has to do',
      'beat.oneLine': 'One-line job',
      'beat.oneLinePlaceholder': 'What does this beat do for the whole series?',
      'beat.content': 'What happens',
      'beat.contentPlaceholder': 'Concrete events, settings, physical action. Not “she grows as a person”.',
      'beat.turn': 'Value turn',
      'beat.turnPlaceholder': 'From X to Y: what she lost, what she learned, how the relationship changed',
      'beat.hook': 'Hook',
      'beat.hookPlaceholder': 'When this beat ends, what does the audience need to know next?',
      'beat.page': 'Current page',
      'beat.episodeHint': 'Episode span',
      'beat.episodeHintPlaceholder': 'Ep. 1–2',
      'beat.pageTarget': 'Target p{target}',
      'beat.pageDrift': 'Drift {drift}',
      'beat.sourceNote': 'Source / adaptation note',
      'beat.sourceNotePlaceholder': 'What did you take from the material? What did you cut, merge or move, and why?',
      'beat.notes': 'Notes to self',
      'beat.notesPlaceholder': 'What to watch out for in this scene, what to fix next pass…',
      'beat.checks': 'Done checklist',
      'beat.checkProgress': '{done}/{total}',
      'beat.save': 'Save beat',
      'beat.saving': 'Saving…',
      'beat.saved': 'Saved',
      'beat.dirty': 'Unsaved changes',
      'beat.review': 'Review this beat',
      'beat.reviewing': 'Reviewing…',
      'beat.reviewDual': 'Dual-model review',
      'beat.noReview': 'No review yet. Hit “Review this beat” and let a model read it on function, causality, character, theme and hook.',
      'beat.reviewHint': 'Scores are the model\'s own, useful for comparing versions, not an absolute grade.',
      'beat.score': 'Overall',
      'beat.dim.function': 'Function',
      'beat.dim.causality': 'Causality',
      'beat.dim.character': 'Character',
      'beat.dim.theme': 'Theme',
      'beat.dim.hook': 'Hook',
      'beat.verdict': 'Verdict',
      'beat.issues': 'Issues',
      'beat.fix': 'One fix',
      'beat.alternatives': 'Alternatives',
      'beat.model': 'Reviewing model',
      'beat.disagreement': '{n} points apart, read the issues both models raise.',
      'beat.finalFirst': 'Write the content before finalizing.',
      'beat.lockFirst': 'Finalize before locking.',
      'beat.lockedToast': 'Locked.',
      'beat.unlockedToast': 'Unlocked.',
      'beat.confirmUnlock': 'Unlock this beat?',
      'beat.unsavedConfirm': 'This beat has unsaved changes. Switch anyway?',
      'beat.reviewWarnings': 'Review warnings',
      'sheet.title': 'Whole-sheet review',
      'sheet.subtitle': 'Have a model read all 15 beats as one structure: three acts, stakes, B story, midpoint, all-is-lost, act-three turn.',
      'sheet.run': 'Run the review',
      'sheet.rerun': 'Run it again',
      'sheet.running': 'Reading the whole sheet…',
      'sheet.overall': 'Overall',
      'sheet.act1': 'Act I',
      'sheet.act2': 'Act II',
      'sheet.act3': 'Act III',
      'sheet.verdict': 'Verdict',
      'sheet.issues': 'Key issues',
      'sheet.topFixes': 'Fix first',
      'sheet.empty': 'No whole-sheet review yet.',
      'sheet.close': 'Close',
      'sheet.warning': 'This reads all 15 beats. Usually 30–60 seconds.',
      'settings.title': 'Model settings',
      'settings.subtitle': 'Both models come from the DSH model list. Dual review runs the same question through both and shows the two cards side by side.',
      'settings.mode': 'Review mode',
      'settings.mode.single': 'Single model',
      'settings.mode.dual': 'Dual model',
      'settings.mode.singleHint': 'Primary model only.',
      'settings.mode.dualHint': 'Primary plus secondary, each reviewing once, side by side.',
      'settings.primary': 'Primary model',
      'settings.primaryHint': 'Used to generate the 15 beats and for single-model review.',
      'settings.secondary': 'Secondary model (dual review)',
      'settings.secondaryHint': 'Pick a model different from the primary, or the two cards will agree on everything.',
      'settings.followDefault': 'Follow the DSH default',
      'settings.none': 'No second model',
      'settings.externalOption': 'External compatible endpoint (advanced)',
      'settings.currentDefault': 'Current DSH default: {label}',
      'settings.refresh': 'Refresh list',
      'settings.modelsLoading': 'Reading the DSH model list…',
      'settings.modelsEmpty': 'No DSH models found. Check the model settings in DSH.',
      'settings.modelsUnsupported': 'This DSH has no usable LLM service.',
      'settings.modelsError': 'Some providers failed to load',
      'settings.testPrimary': 'Test primary',
      'settings.testSecondary': 'Test secondary',
      'settings.test': 'Test external model',
      'settings.testDsh': 'Test DSH',
      'settings.testing': 'Testing…',
      'settings.testOk': 'Connected',
      'settings.testFail': 'Connection failed',
      'settings.needSecondary': 'Dual review needs a second model.',
      'settings.sameModel': 'Primary and secondary are the same model; the scores will look nearly identical.',
      'settings.external': 'External compatible endpoint',
      'settings.externalHint': 'Any OpenAI Chat Completions endpoint: your own gateway, a proxy, or a vendor\'s compatible URL. Empty by default; material leaves this machine only after you fill it in.',
      'settings.baseURL': 'Endpoint URL',
      'settings.model': 'Model name',
      'settings.apiKey': 'API key',
      'settings.keySaved': 'Key saved',
      'settings.keyPlaceholder': 'Leave blank to keep it',
      'settings.clearKey': 'Clear the saved key',
      'settings.save': 'Save settings',
      'settings.saving': 'Saving…',
      'settings.close': 'Close',
      'settings.needKey': 'Fill in the endpoint and the model name, and save a key first.',
      'export.title': 'Export 15 beats',
      'export.subtitle': 'Hand it to a writer as a structure brief, or paste it into your own outlining tool.',
      'export.warning': '{n} beats are not locked yet, so this export is a draft.',
      'export.dirty': 'Unsaved edits; this exports the last saved version.',
      'export.copy': 'Copy Markdown',
      'export.copied': 'Copied',
      'export.download': 'Download .md',
      'export.close': 'Close',
      'common.retry': 'Retry',
      'common.loading': 'Opening 15-Beat Foundation…',
      'common.error': '15-Beat Foundation failed to open.',
      'common.close': 'Close',
      'common.cancel': 'Cancel',
      'common.ok': 'OK',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.rename': 'Rename',
      'common.copy': 'Copy',
      'common.download': 'Download',
      'common.of': '/',
      'dialog.confirmTitle': 'Please confirm',
      'dialog.continue': 'Continue',
      'toast.saved': 'Saved.',
      'toast.generated': '15 beats generated. {n} gaps in the material.',
      'toast.reviewed': 'Review done.',
      'toast.settingsSaved': 'Model settings saved.',
      'toast.projectCreated': 'Project created.',
      'toast.projectDeleted': 'Project deleted.',
      'toast.materialSaved': 'Material saved.',
      'toast.briefSaved': 'Brief saved.',
      'toast.lockedAll': 'All 15 beats locked.',
      'toast.unlockedAll': 'All 15 beats unlocked.',
      'toast.copyOk': 'Markdown copied.',
      'toast.copyFail': 'Copy failed; select the text by hand.',
      'toast.needKey': 'Save the external model key first.',
    }

    function format(template, values) {
      if (values === undefined) return template
      return String(template).replace(/\{(\w+)\}/g, (match, key) =>
        values[key] === undefined || values[key] === null ? match : String(values[key]),
      )
    }

    function makeTr(t) {
      return (key, values) => {
        let value = t(key)
        if (value === key || value === undefined || value === null) value = zh[key] ?? key
        return format(value, values)
      }
    }

    // ── model refs ────────────────────────────────────────────────────────────

    function modelRefValue(ref) {
      if (!ref || ref.mode === 'default') return 'default'
      if (ref.mode === 'none') return 'none'
      if (ref.mode === 'external') return 'external'
      if (ref.mode === 'dsh' && typeof ref.provider === 'string' && typeof ref.model === 'string') {
        return `dsh:${encodeURIComponent(ref.provider)}:${encodeURIComponent(ref.model)}`
      }
      return 'default'
    }

    function parseModelRefValue(value) {
      if (value === 'none') return { mode: 'none' }
      if (value === 'external') return { mode: 'external' }
      if (value === 'default') return { mode: 'default' }
      if (value.startsWith('dsh:')) {
        const parts = value.split(':')
        if (parts.length >= 3) {
          try {
            return { mode: 'dsh', provider: decodeURIComponent(parts[1]), model: decodeURIComponent(parts.slice(2).join(':')) }
          } catch {
            return { mode: 'default' }
          }
        }
      }
      return { mode: 'default' }
    }

    function catalogModels(models) {
      if (!models || !Array.isArray(models.providers)) return []
      const list = []
      for (const provider of models.providers) {
        for (const model of provider.models ?? []) {
          list.push({
            provider: provider.id,
            providerName: provider.name || provider.id,
            id: model.id,
            name: model.name || model.id,
            description: model.description || '',
          })
        }
      }
      return list
    }

    function pickSecondaryRef(primaryValue, models) {
      const list = catalogModels(models)
      if (list.length === 0) return 'none'
      const primary = parseModelRefValue(primaryValue)
      const current = models?.current
      let primaryProvider = null
      let primaryDsh = null
      if (primary.mode === 'dsh') {
        primaryProvider = primary.provider
        primaryDsh = modelRefValue(primary)
      } else if (primary.mode === 'default' && current?.provider && current?.model) {
        primaryProvider = current.provider
        primaryDsh = modelRefValue({ mode: 'dsh', provider: current.provider, model: current.model })
      }
      const enc = (item) => modelRefValue({ mode: 'dsh', provider: item.provider, model: item.id })
      const sameProvider = list.filter((item) => item.provider === primaryProvider && enc(item) !== primaryDsh)
      const candidate = sameProvider[0] ?? list.find((item) => enc(item) !== primaryDsh)
      return candidate === undefined ? 'none' : enc(candidate)
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    function emptyBrief() {
      return { logline: '', theme: '', format: '', structureNotes: '' }
    }

    function cloneBeatDraft(beat) {
      return {
        key: beat.key,
        oneLine: beat.oneLine,
        content: beat.content,
        turn: beat.turn,
        hook: beat.hook,
        page: beat.page,
        episodeHint: beat.episodeHint,
        sourceNote: beat.sourceNote,
        notes: beat.notes,
        checks: { ...beat.checks },
        status: beat.status,
        locked: beat.locked,
      }
    }

    function statusOf(beat) {
      if (beat.locked) return 'locked'
      if (beat.status === 'final') return 'final'
      if (beat.content.trim() !== '') return 'draft'
      return 'empty'
    }

    function driftClass(drift) {
      if (Math.abs(drift) > 6) return 'bad'
      if (Math.abs(drift) > 3) return 'warn'
      return 'ok'
    }

    function pageAnchor(template) {
      return template.pageRange ? `p${template.pageRange}` : `p${template.targetPage}`
    }

    function pageDriftOf(page, template) {
      const value = Number(page)
      if (!Number.isFinite(value)) return 0
      if (!template.pageRange) return value - template.targetPage
      const [start, end] = template.pageRange.split('-').map(Number)
      if (!Number.isFinite(start) || !Number.isFinite(end)) return value - template.targetPage
      if (value < start) return value - start
      if (value > end) return value - end
      return 0
    }

    function scoreColor(score) {
      if (score >= 8) return 'var(--dsw-alias-state-success-primary)'
      if (score >= 6) return 'var(--dsw-alias-state-warn-primary)'
      return 'var(--dsw-alias-state-error-primary)'
    }

    function timeLabel(value, tr) {
      if (!Number.isFinite(value)) return ''
      try {
        return new Date(value).toLocaleString()
      } catch {
        return ''
      }
    }

    function versionStamp(value) {
      if (!Number.isFinite(value)) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      const pad = (number) => String(number).padStart(2, '0')
      return `${pad(date.getMonth() + 1)}${pad(date.getDate())} ${pad(date.getHours())}${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    function versionStampMinute(value) {
      if (!Number.isFinite(value)) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      const pad = (number) => String(number).padStart(2, '0')
      return `${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`
    }

    function diffChars(oldText, newText) {
      const a = Array.from(oldText ?? '')
      const b = Array.from(newText ?? '')
      let prefix = 0
      while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1
      let suffix = 0
      while (
        suffix < a.length - prefix &&
        suffix < b.length - prefix &&
        a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
      ) {
        suffix += 1
      }
      const middleA = a.slice(prefix, a.length - suffix)
      const middleB = b.slice(prefix, b.length - suffix)
      const segments = []
      const push = (type, text) => {
        if (text === '') return
        const last = segments[segments.length - 1]
        if (last !== undefined && last.type === type) last.text += text
        else segments.push({ type, text })
      }
      if (prefix > 0) push('same', a.slice(0, prefix).join(''))
      if (middleA.length * middleB.length <= 250000) {
        const n = middleA.length
        const m = middleB.length
        const table = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1))
        for (let i = n - 1; i >= 0; i -= 1) {
          for (let j = m - 1; j >= 0; j -= 1) {
            table[i][j] =
              middleA[i] === middleB[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
          }
        }
        let i = 0
        let j = 0
        while (i < n && j < m) {
          if (middleA[i] === middleB[j]) {
            push('same', middleA[i])
            i += 1
            j += 1
          } else if (table[i + 1][j] >= table[i][j + 1]) {
            push('remove', middleA[i])
            i += 1
          } else {
            push('add', middleB[j])
            j += 1
          }
        }
        while (i < n) {
          push('remove', middleA[i])
          i += 1
        }
        while (j < m) {
          push('add', middleB[j])
          j += 1
        }
      } else {
        push('remove', middleA.join(''))
        push('add', middleB.join(''))
      }
      if (suffix > 0) push('same', a.slice(a.length - suffix).join(''))
      return segments
    }

    function DiffText({ oldText, newText, side }) {
      const segments = useMemo(() => diffChars(oldText ?? '', newText ?? ''), [oldText, newText])
      const visible = segments.filter((segment) => (side === 'old' ? segment.type !== 'add' : segment.type !== 'remove'))
      return h(
        'p',
        { className: 'bf-diff-text' },
        ...visible.map((segment, index) =>
          h(
            'span',
            {
              key: index,
              className: segment.type === 'same' ? undefined : `bf-diff-${segment.type}`,
            },
            segment.text,
          ),
        ),
      )
    }

    function AutoTextarea({ value, className, ...rest }) {
      const ref = useRef(null)
      useEffect(() => {
        const node = ref.current
        if (node === null) return
        node.style.height = 'auto'
        node.style.height = `${node.scrollHeight}px`
      }, [value])
      return h('textarea', { ref, className, value, ...rest })
    }

    function projectStats(project) {
      const beats = project?.beats ?? []
      return {
        written: beats.filter((beat) => beat.content.trim() !== '').length,
        final: beats.filter((beat) => beat.status === 'final').length,
        locked: beats.filter((beat) => beat.locked).length,
      }
    }

    function markdownFor(state, project) {
      const templates = state.templates
      const stats = projectStats(project)
      const lines = []
      lines.push(`# ${project.title} · 十五拍定稿`)
      lines.push('')
      if (project.brief.logline) lines.push(`> **一句话故事**：${project.brief.logline}`)
      if (project.brief.theme) lines.push(`> **主题**：${project.brief.theme}`)
      if (project.brief.format) lines.push(`> **体量**：${project.brief.format}`)
      lines.push(`> **结构状态**：${stats.final}/15 定稿 · ${stats.locked}/15 锁定`)
      lines.push('')
      const actLabels = ['', '第一幕 · 建置', '第二幕 · 对抗', '第三幕 · 解决']
      let act = 0
      for (const template of templates) {
        if (template.act !== act) {
          act = template.act
          lines.push(`## ${actLabels[act]}`)
          lines.push('')
        }
        const beat = project.beats.find((item) => item.key === template.key)
        lines.push(`### ${template.no}. ${template.title} / ${template.en}`)
        lines.push('')
        lines.push(`- **目标页码**：${pageAnchor(template)}`)
        lines.push(`- **当前页码**：p${beat?.page ?? '—'}${beat?.episodeHint ? ` · ${beat.episodeHint}` : ''}`)
        lines.push(`- **状态**：${beat?.locked ? '已锁定' : beat?.status === 'final' ? '已定稿' : '草稿'}`)
        if (beat?.oneLine) lines.push(`- **一句话作用**：${beat.oneLine}`)
        lines.push('')
        if (beat?.content) {
          lines.push(`**这一拍发生什么**：${beat.content}`)
          lines.push('')
        }
        if (beat?.turn) {
          lines.push(`**价值转变**：${beat.turn}`)
          lines.push('')
        }
        if (beat?.hook) {
          lines.push(`**钩子**：${beat.hook}`)
          lines.push('')
        }
        if (beat?.sourceNote) {
          lines.push(`**素材来源 / 改编说明**：${beat.sourceNote}`)
          lines.push('')
        }
        if (beat?.notes) {
          lines.push(`**修改备注**：${beat.notes}`)
          lines.push('')
        }
        if (beat?.review?.primary) {
          lines.push(
            `**AI 体检**：${beat.review.primary.score} 分 · ${beat.review.primary.model || '模型'}`,
          )
          if (beat.review.primary.verdict) lines.push(`  - 判断：${beat.review.primary.verdict}`)
          if (beat.review.primary.fix) lines.push(`  - 改法：${beat.review.primary.fix}`)
          lines.push('')
        }
      }
      if (project.brief.structureNotes) {
        lines.push('## 结构笔记')
        lines.push('')
        lines.push(project.brief.structureNotes)
        lines.push('')
      }
      if (project.generation?.missingMaterial?.length) {
        lines.push('## 素材缺口')
        lines.push('')
        for (const item of project.generation.missingMaterial) lines.push(`- ${item}`)
        lines.push('')
      }
      lines.push('---')
      lines.push('')
      lines.push('由十五拍定稿台导出。')
      return lines.join('\n')
    }

    function downloadText(filename, text) {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.rel = 'noopener'
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    // ── icons ─────────────────────────────────────────────────────────────────

    function glyph(size, ...children) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        ...children,
      )
    }

    function LanternGlyph({ size = 18 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 18 18',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('path', { key: 'top', d: 'M6 3h6' }),
        h('path', { key: 'left', d: 'M6.6 3c0 2-1.3 2.8-1.3 5.5S6.6 13 6.6 15' }),
        h('path', { key: 'right', d: 'M11.4 3c0 2 1.3 2.8 1.3 5.5S11.4 13 11.4 15' }),
        h('path', { key: 'bottom', d: 'M7 15h4' }),
        h('path', { key: 'flame', d: 'M9 6.2c1.5 1.5 2.2 2.6 2.2 3.7a2.2 2.2 0 0 1-4.4 0c0-1.1.7-2.2 2.2-3.7z' }),
      )
    }

    function GearIcon() {
      return glyph(
        14,
        h('circle', { key: 'c', cx: 8, cy: 8, r: 2.2 }),
        h('path', {
          key: 'g',
          d: 'M8 1.8v1.4M8 12.8v1.4M1.8 8h1.4M12.8 8h1.4M3.6 3.6l1 1M11.4 11.4l1 1M12.4 3.6l-1 1M4.6 11.4l-1 1',
        }),
      )
    }

    function DownloadIcon() {
      return glyph(
        14,
        h('path', { key: 'a', d: 'M8 2.2v7.2' }),
        h('path', { key: 'b', d: 'm5.2 6.8 2.8 2.8 2.8-2.8' }),
        h('path', { key: 'c', d: 'M2.8 12.6h10.4' }),
      )
    }

    function PlusIcon() {
      return glyph(14, h('path', { key: 'a', d: 'M8 2.6v10.8M2.6 8h10.8' }))
    }

    function PencilIcon() {
      return glyph(13, h('path', { key: 'a', d: 'M3 12.6 3.4 10 10.8 2.6l2.6 2.6L6 12.6z' }), h('path', { key: 'b', d: 'm9.8 3.6 2.6 2.6' }))
    }

    function TrashIcon() {
      return glyph(13, h('path', { key: 'a', d: 'M3 4.4h10M6 4.4V2.8h4v1.6M4.2 4.4l.6 9h6.4l.6-9' }))
    }

    function LockIcon() {
      return glyph(13, h('rect', { key: 'a', x: 3.2, y: 6.8, width: 9.6, height: 6.4, rx: 1.5 }), h('path', { key: 'b', d: 'M5.4 6.8V5.1a2.6 2.6 0 0 1 5.2 0v1.7' }))
    }

    function UnlockIcon() {
      return glyph(13, h('rect', { key: 'a', x: 3.2, y: 6.8, width: 9.6, height: 6.4, rx: 1.5 }), h('path', { key: 'b', d: 'M5.4 6.8V5.1a2.6 2.6 0 0 1 4.6-1.8' }))
    }

    function SparkIcon() {
      return glyph(
        14,
        h('path', { key: 'a', d: 'M8 2.2 9.1 6 13 7.1 9.1 8.2 8 12 6.9 8.2 3 7.1 6.9 6z' }),
        h('path', { key: 'b', d: 'M12.6 10.8 13 12l1.2.4-1.2.4-.4 1.2-.4-1.2-1.2-.4 1.2-.4z' }),
      )
    }

    function CloseIcon() {
      return glyph(14, h('path', { key: 'a', d: 'm3.2 3.2 9.6 9.6M12.8 3.2l-9.6 9.6' }))
    }

    function CheckIcon() {
      return glyph(13, h('path', { key: 'a', d: 'M3 8.4 6.4 11.8 13 5' }))
    }

    function CopyIcon() {
      return glyph(
        13,
        h('rect', { key: 'a', x: 5.2, y: 5.2, width: 8, height: 8, rx: 1.4 }),
        h('path', { key: 'b', d: 'M10.8 5.2V3.6A1.4 1.4 0 0 0 9.4 2.2H3.6A1.4 1.4 0 0 0 2.2 3.6v5.8a1.4 1.4 0 0 0 1.4 1.4h1.6' }),
      )
    }

    function InfoIcon() {
      return glyph(13, h('circle', { key: 'a', cx: 8, cy: 8, r: 5.8 }), h('path', { key: 'b', d: 'M8 7.2v4M8 5.1v.1' }))
    }

    function HistoryIcon() {
      return glyph(
        13,
        h('path', { key: 'a', d: 'M2.8 8a5.2 5.2 0 1 0 1.5-3.7' }),
        h('path', { key: 'b', d: 'M2.5 2.6v2.6h2.6' }),
        h('path', { key: 'c', d: 'M8 5.2V8l2 1.3' }),
      )
    }

    function StarIcon({ filled = false, size = 13 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: filled ? 'currentColor' : 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('path', { d: 'M8 1.9l1.85 3.75 4.15.6-3 2.9.7 4.15L8 11.3 4.3 13.3l.7-4.15-3-2.9 4.15-.6z' }),
      )
    }

    // ── small building blocks ─────────────────────────────────────────────────

    function Button({ children, onClick, variant, disabled, title, icon, type = 'button' }) {
      const className = ['bf-btn', variant === 'primary' ? 'bf-btn-primary' : '', variant === 'danger' ? 'bf-btn-danger' : '', variant === 'ghost' ? 'bf-btn-ghost' : '']
        .filter(Boolean)
        .join(' ')
      return h(
        'button',
        { type, className, onClick, disabled, title, 'aria-label': title },
        icon ?? null,
        children ? h('span', null, children) : null,
      )
    }

    function Pill({ children, tone }) {
      return h('span', { className: 'bf-pill', 'data-tone': tone ?? 'neutral' }, children)
    }

    function Field({ label, hint, children }) {
      return h(
        'div',
        { className: 'bf-field' },
        h('div', { className: 'bf-label' }, h('span', null, label), hint ? h('span', { className: 'bf-label-hint' }, hint) : null),
        children,
      )
    }

    function Bar({ value, max = 10, color }) {
      const width = Math.max(0, Math.min(100, (value / max) * 100))
      return h(
        'div',
        { className: 'bf-bar', role: 'presentation' },
        h('i', { style: { width: `${width}%`, background: color ?? 'var(--dsw-alias-brand-primary)' } }),
      )
    }

    function ScoreRing({ score }) {
      return h(
        'div',
        { className: 'bf-score-ring', style: { '--bf-score': `${Math.max(0, Math.min(100, score)) * 3.6}deg` } },
        h(
          'div',
          { className: 'bf-score-inner' },
          h('strong', null, String(score)),
          h('span', null, '分'),
        ),
      )
    }

    // ── loading / error ───────────────────────────────────────────────────────

    function Loading({ tr }) {
      return h(
        'div',
        { className: 'bf-center' },
        h('div', { className: 'bf-center-mark' }, h(LanternGlyph, { size: 28 })),
        h('p', null, tr('common.loading')),
      )
    }

    function ErrorState({ tr, message, onRetry }) {
      return h(
        'div',
        { className: 'bf-center' },
        h('div', { className: 'bf-center-mark' }, h(LanternGlyph, { size: 28 })),
        h('h2', null, tr('common.error')),
        h('p', { className: 'bf-error-text' }, message),
        h(Button, { onClick: onRetry, variant: 'primary' }, tr('common.retry')),
      )
    }

    // ── modal ─────────────────────────────────────────────────────────────────

    function Modal({ title, subtitle, onClose, children, footer, wide }) {
      const ref = useRef(null)
      // Keep the latest close handler without re-running the mount effect. A
      // changing onClose used to re-focus the container on every keystroke,
      // which pulled the caret out of the dialog's input after one character.
      const closeRef = useRef(onClose)
      closeRef.current = onClose
      useEffect(() => {
        const node = ref.current
        if (node !== null) node.focus()
        const onKey = (event) => {
          if (event.key === 'Escape') closeRef.current()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [])
      return h(
        'div',
        {
          className: 'bf-modal-backdrop',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            ref,
            className: `bf-modal${wide ? ' bf-modal-wide' : ''}`,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': title,
            tabIndex: -1,
          },
          h(
            'header',
            { className: 'bf-modal-head' },
            h(
              'div',
              null,
              h('h2', null, title),
              subtitle ? h('p', null, subtitle) : null,
            ),
            h('button', { type: 'button', className: 'bf-icon-btn', onClick: onClose, 'aria-label': '关闭' }, h(CloseIcon, null)),
          ),
          h('div', { className: 'bf-modal-body' }, children),
          footer ? h('footer', { className: 'bf-modal-foot' }, footer) : null,
        ),
      )
    }

    // An in-panel replacement for window.prompt / window.confirm. The desktop
    // shell stubs window.prompt to throw, and the throw happens inside a React
    // handler, so the click looks like it did nothing at all. Native dialogs
    // also block the renderer and do not exist in TUI or headless shells.
    function AskDialog({ request, tr, onSettle }) {
      const isText = request.kind === 'text'
      const [value, setValue] = useState(isText ? (request.initial ?? '') : '')
      const inputRef = useRef(null)
      const dismiss = () => onSettle(isText ? null : false)

      useEffect(() => {
        if (!isText) return undefined
        // Modal focuses its own container on mount; take the caret back after it.
        const timer = setTimeout(() => {
          const node = inputRef.current
          if (node === null) return
          node.focus()
          node.select()
        }, 0)
        return () => clearTimeout(timer)
      }, [isText])

      const submit = () => {
        if (isText && value.trim() === '') return
        onSettle(isText ? value.trim() : true)
      }

      return h(
        Modal,
        {
          title: request.title,
          subtitle: request.subtitle,
          onClose: dismiss,
          footer: [
            h(Button, { key: 'cancel', variant: 'ghost', onClick: dismiss }, tr('common.cancel')),
            h(
              Button,
              { key: 'ok', variant: request.danger ? 'danger' : 'primary', onClick: submit, disabled: isText && value.trim() === '' },
              request.confirmLabel ?? tr('common.ok'),
            ),
          ],
        },
        isText
          ? h('input', {
              ref: inputRef,
              className: 'bf-input bf-dialog-input',
              value,
              maxLength: 120,
              placeholder: request.placeholder ?? '',
              'aria-label': request.title,
              onChange: (event) => setValue(event.target.value),
              onKeyDown: (event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                submit()
              },
            })
          : h('p', { className: 'bf-dialog-text' }, request.message),
      )
    }

    // ── settings ──────────────────────────────────────────────────────────────

    function SettingsModal({ state, tr, models, modelsBusy, onRefreshModels, onClose, onSave, onTest, busy }) {
      const info = state.modelInfo
      const [mode, setMode] = useState(state.settings.reviewMode)
      const [primaryValue, setPrimaryValue] = useState(modelRefValue(state.settings.primary))
      const [secondaryValue, setSecondaryValue] = useState(modelRefValue(state.settings.secondary))
      const [baseURL, setBaseURL] = useState(info.externalBaseURL)
      const [externalModel, setExternalModel] = useState(info.externalModel)
      const [apiKey, setApiKey] = useState('')
      const [clearKey, setClearKey] = useState(false)
      const [testNote, setTestNote] = useState(null)
      const [localBusy, setLocalBusy] = useState(null)
      const [localError, setLocalError] = useState(null)

      const catalog = catalogModels(models)
      const primaryRef = parseModelRefValue(primaryValue)
      const secondaryRef = parseModelRefValue(secondaryValue)
      const showExternal = primaryRef.mode === 'external' || secondaryRef.mode === 'external'
      const sameModel = primaryValue === secondaryValue
      const currentLabel = info.dshSelection
        ? catalog.find(
            (item) => item.provider === info.dshSelection.provider && item.id === info.dshSelection.model,
          )?.name ?? `${info.dshSelection.provider} · ${info.dshSelection.model}`
        : '未选择'
      const loading = models === null || modelsBusy
      const unsupported = models !== null && models.supported === false
      const providers = models?.providers ?? []
      const providerErrors = providers.filter((provider) => provider.error)

      useEffect(() => {
        if (mode === 'dual' && secondaryValue === 'none' && catalog.length > 0) {
          setSecondaryValue(pickSecondaryRef(primaryValue, models))
        }
      }, [models])

      const changeMode = (next) => {
        setMode(next)
        if (next === 'dual' && secondaryValue === 'none') {
          setSecondaryValue(pickSecondaryRef(primaryValue, models))
        }
      }

      const changePrimary = (value) => {
        setPrimaryValue(value)
        if (mode === 'dual' && (secondaryValue === 'none' || secondaryValue === value)) {
          setSecondaryValue(pickSecondaryRef(value, models))
        }
      }

      const testRef = async (ref, key) => {
        setLocalBusy(key)
        setTestNote(null)
        setLocalError(null)
        let payload
        if (ref.mode === 'external') {
          const typed = apiKey.trim()
          payload = {
            mode: 'external',
            externalBaseURL: baseURL,
            externalModel,
            apiKey: typed !== '' ? typed : undefined,
          }
        } else if (ref.mode === 'dsh') {
          payload = { mode: 'dsh', provider: ref.provider, model: ref.model }
        } else {
          payload = { mode: 'default' }
        }
        const result = await onTest(payload)
        setLocalBusy(null)
        if (result !== null) setTestNote({ kind: 'ok', text: result })
      }

      const save = () => {
        if (mode === 'dual' && secondaryValue === 'none') {
          setLocalError(tr('settings.needSecondary'))
          return
        }
        setLocalError(null)
        const typed = apiKey.trim()
        onSave({
          reviewMode: mode,
          primary: primaryRef,
          secondary: secondaryRef,
          externalBaseURL: baseURL,
          externalModel,
          apiKey: typed !== '' ? typed : undefined,
          clearKey,
        })
      }

      const options = (includeDefault, includeNone) => [
        includeDefault
          ? h(
              'option',
              { value: 'default', key: 'default' },
              `${tr('settings.followDefault')}${info.dshSelection ? `（${currentLabel}）` : ''}`,
            )
          : null,
        includeNone ? h('option', { value: 'none', key: 'none' }, tr('settings.none')) : null,
        ...providers
          .map((provider) => {
            if (!Array.isArray(provider.models) || provider.models.length === 0) return null
            return h(
              'optgroup',
              { label: provider.name, key: provider.id },
              ...provider.models.map((model) =>
                h(
                  'option',
                  {
                    value: modelRefValue({ mode: 'dsh', provider: provider.id, model: model.id }),
                    key: model.id,
                  },
                  model.name || model.id,
                ),
              ),
            )
          })
          .filter(Boolean),
        h('option', { value: 'external', key: 'external' }, tr('settings.externalOption')),
      ]

      return h(
        Modal,
        {
          title: tr('settings.title'),
          subtitle: tr('settings.subtitle'),
          onClose,
          footer: h(
            React.Fragment,
            null,
            h(Button, { onClick: onClose, variant: 'ghost' }, tr('common.cancel')),
            h(Button, { onClick: save, variant: 'primary', disabled: busy }, tr('settings.save')),
          ),
        },
        h(
          'div',
          { className: 'bf-form' },
          h(
            Field,
            { label: tr('settings.mode') },
            h(
              'div',
              { className: 'bf-mode-grid' },
              h(
                'label',
                { className: 'bf-mode-card', 'data-active': mode === 'single' },
                h('input', { type: 'radio', name: 'bf-review-mode', checked: mode === 'single', onChange: () => changeMode('single') }),
                h('strong', null, tr('settings.mode.single')),
                h('span', null, tr('settings.mode.singleHint')),
              ),
              h(
                'label',
                { className: 'bf-mode-card', 'data-active': mode === 'dual' },
                h('input', { type: 'radio', name: 'bf-review-mode', checked: mode === 'dual', onChange: () => changeMode('dual') }),
                h('strong', null, tr('settings.mode.dual')),
                h('span', null, tr('settings.mode.dualHint')),
              ),
            ),
          ),
          h(
            Field,
            { label: tr('settings.primary'), hint: tr('settings.primaryHint') },
            h(
              'div',
              { className: 'bf-model-row' },
              h(
                'select',
                {
                  className: 'bf-select bf-model-select',
                  value: primaryValue,
                  onChange: (event) => changePrimary(event.target.value),
                  'aria-label': tr('settings.primary'),
                },
                ...options(true, false),
              ),
              h(
                Button,
                { onClick: () => testRef(primaryRef, 'primary'), disabled: localBusy !== null, icon: h(SparkIcon, null) },
                localBusy === 'primary' ? tr('settings.testing') : tr('settings.testPrimary'),
              ),
            ),
            h(
              'p',
              { className: 'bf-muted bf-small' },
              loading
                ? tr('settings.modelsLoading')
                : unsupported
                  ? tr('settings.modelsUnsupported')
                  : catalog.length === 0
                    ? tr('settings.modelsEmpty')
                    : format(tr('settings.currentDefault'), { label: currentLabel }),
            ),
            h(
              'div',
              { className: 'bf-inline' },
              h(Button, { onClick: onRefreshModels, disabled: modelsBusy, variant: 'ghost' }, tr('settings.refresh')),
              providerErrors.length > 0
                ? h(
                    'span',
                    { className: 'bf-muted bf-small' },
                    `${tr('settings.modelsError')}：${providerErrors.map((provider) => provider.name).join('、')}`,
                  )
                : null,
            ),
          ),
          h(
            Field,
            { label: tr('settings.secondary'), hint: tr('settings.secondaryHint') },
            h(
              'div',
              { className: 'bf-model-row' },
              h(
                'select',
                {
                  className: 'bf-select bf-model-select',
                  value: secondaryValue,
                  disabled: mode !== 'dual',
                  onChange: (event) => setSecondaryValue(event.target.value),
                  'aria-label': tr('settings.secondary'),
                },
                ...options(false, true),
              ),
              h(
                Button,
                {
                  onClick: () => testRef(secondaryRef, 'secondary'),
                  disabled: localBusy !== null || secondaryValue === 'none',
                  icon: h(SparkIcon, null),
                },
                localBusy === 'secondary' ? tr('settings.testing') : tr('settings.testSecondary'),
              ),
            ),
            mode === 'dual' && sameModel && secondaryValue !== 'none'
              ? h('p', { className: 'bf-muted bf-small' }, tr('settings.sameModel'))
              : null,
          ),
          showExternal
            ? h(
                'section',
                { className: 'bf-settings-section' },
                h('h3', null, tr('settings.external')),
                h('p', { className: 'bf-muted' }, tr('settings.externalHint')),
                h(
                  Field,
                  { label: tr('settings.baseURL') },
                  h('input', {
                    className: 'bf-input',
                    value: baseURL,
                    onChange: (event) => setBaseURL(event.target.value),
                    spellCheck: false,
                  }),
                ),
                h(
                  Field,
                  { label: tr('settings.model') },
                  h('input', {
                    className: 'bf-input',
                    value: externalModel,
                    onChange: (event) => setExternalModel(event.target.value),
                    spellCheck: false,
                  }),
                ),
                h(
                  Field,
                  { label: tr('settings.apiKey'), hint: info.hasExternalKey ? tr('settings.keySaved') : '' },
                  h('input', {
                    className: 'bf-input',
                    type: 'password',
                    value: apiKey,
                    placeholder: info.hasExternalKey ? tr('settings.keyPlaceholder') : '',
                    onChange: (event) => setApiKey(event.target.value),
                    spellCheck: false,
                    autoComplete: 'off',
                  }),
                ),
                h(
                  'label',
                  { className: 'bf-check' },
                  h('input', { type: 'checkbox', checked: clearKey, onChange: (event) => setClearKey(event.target.checked) }),
                  h('span', null, tr('settings.clearKey')),
                ),
                h('p', { className: 'bf-fineprint' }, tr('settings.needKey')),
              )
            : null,
          testNote !== null ? h('div', { className: 'bf-test-note', 'data-kind': testNote.kind }, testNote.text) : null,
          localError !== null ? h('div', { className: 'bf-banner bf-banner-warn' }, localError) : null,
        ),
      )
    }

    // ── export ────────────────────────────────────────────────────────────────

    function ExportModal({ state, project, tr, onClose, onToast, dirty }) {
      const markdown = useMemo(() => markdownFor(state, project), [state, project])
      const stats = projectStats(project)
      const copy = async () => {
        try {
          await navigator.clipboard.writeText(markdown)
          onToast('ok', tr('toast.copyOk'))
        } catch {
          onToast('error', tr('toast.copyFail'))
        }
      }
      const filename = `${project.title.replace(/[\\/:*?"<>|《》\s]/g, '') || '十五拍'}-十五拍.md`
      return h(
        Modal,
        {
          title: tr('export.title'),
          subtitle: tr('export.subtitle'),
          onClose,
          wide: true,
          footer: h(
            React.Fragment,
            null,
            h(Button, { onClick: copy, icon: h(CopyIcon, null) }, tr('export.copy')),
            h(Button, { onClick: () => downloadText(filename, markdown), variant: 'primary', icon: h(DownloadIcon, null) }, tr('export.download')),
          ),
        },
        stats.locked < 15 ? h('div', { className: 'bf-banner bf-banner-warn' }, format(tr('export.warning'), { n: 15 - stats.locked })) : null,
        dirty ? h('div', { className: 'bf-banner bf-banner-warn' }, tr('export.dirty')) : null,
        h('pre', { className: 'bf-export-pre' }, markdown),
      )
    }

    // ── sheet review ──────────────────────────────────────────────────────────

    function SheetReviewModal({ project, settings, tr, onClose, onRun, busy }) {
      const review = project.sheetReview
      const mode = settings.reviewMode
      return h(
        Modal,
        {
          title: tr('sheet.title'),
          subtitle: tr('sheet.subtitle'),
          onClose,
          wide: true,
          footer: h(
            React.Fragment,
            null,
            h(Button, { onClick: onClose, variant: 'ghost' }, tr('sheet.close')),
            h(
              Button,
              { onClick: () => onRun(mode), variant: 'primary', disabled: busy, icon: h(SparkIcon, null) },
              busy ? tr('sheet.running') : review ? tr('sheet.rerun') : tr('sheet.run'),
            ),
          ),
        },
        busy
          ? h('div', { className: 'bf-center bf-center-inline' }, h('p', null, tr('sheet.running')), h('p', { className: 'bf-muted' }, tr('sheet.warning')))
          : review === null
            ? h('div', { className: 'bf-empty' }, h('p', null, tr('sheet.empty')), h('p', { className: 'bf-muted' }, tr('sheet.warning')))
            : h(
                'div',
                { className: 'bf-sheet-review' },
                h(SheetReviewCard, { review: review.primary, tr }),
                review.secondary ? h(SheetReviewCard, { review: review.secondary, tr }) : null,
              ),
      )
    }

    function SheetReviewCard({ review, tr }) {
      if (review === null) return null
      return h(
        'section',
        { className: 'bf-review-card' },
        h(
          'header',
          { className: 'bf-review-head' },
          h(
            'div',
            null,
            h('div', { className: 'bf-review-model' }, review.model || tr('beat.model')),
            h('div', { className: 'bf-review-time' }, timeLabel(review.at, tr)),
          ),
          h(ScoreRing, { score: review.overall }),
        ),
        h(
          'div',
          { className: 'bf-act-scores' },
          h('div', null, h('span', null, tr('sheet.act1')), h('strong', null, String(review.acts.act1 ?? '—'))),
          h('div', null, h('span', null, tr('sheet.act2')), h('strong', null, String(review.acts.act2 ?? '—'))),
          h('div', null, h('span', null, tr('sheet.act3')), h('strong', null, String(review.acts.act3 ?? '—'))),
        ),
        review.verdict ? h('p', { className: 'bf-review-verdict' }, review.verdict) : null,
        review.issues.length > 0
          ? h(
              'div',
              { className: 'bf-review-block' },
              h('h4', null, tr('sheet.issues')),
              h('ul', null, ...review.issues.map((item, index) => h('li', { key: index }, item))),
            )
          : null,
        review.topFixes.length > 0
          ? h(
              'div',
              { className: 'bf-review-block' },
              h('h4', null, tr('sheet.topFixes')),
              h('ol', null, ...review.topFixes.map((item, index) => h('li', { key: index }, item))),
            )
          : null,
      )
    }

    // ── review card ───────────────────────────────────────────────────────────

    const DIMENSION_KEYS = ['function', 'causality', 'character', 'theme', 'hook']

    function ReviewCard({ review, tr, secondary }) {
      return h(
        'section',
        { className: 'bf-review-card', 'data-secondary': secondary === true },
        h(
          'header',
          { className: 'bf-review-head' },
          h(
            'div',
            null,
            h('div', { className: 'bf-review-kicker' }, secondary ? 'MODEL B' : 'MODEL A'),
            h('div', { className: 'bf-review-model' }, review.model || tr('beat.model')),
            h('div', { className: 'bf-review-time' }, timeLabel(review.at, tr)),
          ),
          h(ScoreRing, { score: review.score }),
        ),
        h(
          'div',
          { className: 'bf-dim-list' },
          ...DIMENSION_KEYS.map((key) =>
            h(
              'div',
              { className: 'bf-dim', key },
              h('span', null, tr(`beat.dim.${key}`)),
              h(Bar, { value: review.dimensions[key], max: 10, color: scoreColor(review.dimensions[key]) }),
              h('strong', null, String(review.dimensions[key])),
            ),
          ),
        ),
        review.verdict ? h('p', { className: 'bf-review-verdict' }, review.verdict) : null,
        review.issues.length > 0
          ? h(
              'div',
              { className: 'bf-review-block' },
              h('h4', null, tr('beat.issues')),
              h('ul', null, ...review.issues.map((item, index) => h('li', { key: index }, item))),
            )
          : null,
        review.fix ? h('div', { className: 'bf-review-fix' }, h('h4', null, tr('beat.fix')), h('p', null, review.fix)) : null,
        review.alternatives.length > 0
          ? h(
              'div',
              { className: 'bf-review-block' },
              h('h4', null, tr('beat.alternatives')),
              h('ul', null, ...review.alternatives.map((item, index) => h('li', { key: index }, item))),
            )
          : null,
      )
    }

    function ReviewPanel({ review, tr, reviewing, disabled, onReview, dualAvailable }) {
      return h(
        'section',
        { className: 'bf-review' },
        h(
          'div',
          { className: 'bf-section-head' },
          h(
            'div',
            null,
            h('h3', null, 'AI 体检'),
            h('p', null, tr('beat.reviewHint')),
          ),
          h(
            'div',
            { className: 'bf-actions' },
            h(Button, { onClick: () => onReview('single'), disabled, icon: h(SparkIcon, null) }, reviewing ? tr('beat.reviewing') : tr('beat.review')),
            dualAvailable ? h(Button, { onClick: () => onReview('dual'), disabled, variant: 'ghost' }, reviewing ? tr('beat.reviewing') : tr('beat.reviewDual')) : null,
          ),
        ),
        review === null
          ? h('div', { className: 'bf-empty bf-empty-small' }, h('p', null, tr('beat.noReview')))
          : h(
              'div',
              { className: 'bf-review-grid' },
              h(ReviewCard, { review: review.primary, tr }),
              review.secondary ? h(ReviewCard, { review: review.secondary, tr, secondary: true }) : null,
            ),
        review !== null && review.secondary !== null && Math.abs(review.primary.score - review.secondary.score) >= 10
          ? h('div', { className: 'bf-banner bf-banner-warn' }, format(tr('beat.disagreement'), { n: Math.abs(review.primary.score - review.secondary.score) }))
          : null,
      )
    }

    // ── batch preview / versions ──────────────────────────────────────────────

    function BatchPreviewModal({ preview, project, state, tr, onClose, onApply, onApplyOne, busy }) {
      const fieldLabels = {
        oneLine: tr('table.oneLine'),
        content: tr('table.content'),
        turn: tr('table.turn'),
        hook: tr('table.hook'),
      }
      const keys = preview.keys.filter((key) => preview.proposals[key] !== undefined)
      const allChanges = []
      for (const key of keys) {
        for (const field of Object.keys(preview.proposals[key])) allChanges.push(`${key}|${field}`)
      }
      const [selected, setSelected] = useState(() => new Set(allChanges))
      const selectedChanges = allChanges.filter((id) => selected.has(id))

      const toggle = (id) => {
        setSelected((previous) => {
          const next = new Set(previous)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
      const toggleAll = (on) => setSelected(on ? new Set(allChanges) : new Set())
      const buildSelected = () => {
        const proposals = {}
        for (const id of selectedChanges) {
          const [key, field] = id.split('|')
          proposals[key] = { ...(proposals[key] ?? {}), [field]: preview.proposals[key][field] }
        }
        return proposals
      }

      return h(
        Modal,
        {
          title: tr('batch.title'),
          subtitle: `${preview.model} · ${tr(`batch.op.${preview.op}`)} · ${keys.length} 拍 · ${allChanges.length} 处`,
          onClose,
          wide: true,
          footer: h(
            React.Fragment,
            null,
            h('span', { className: 'bf-batch-selected' }, format(tr('batch.selectedChanges'), { n: selectedChanges.length })),
            h(Button, { onClick: () => toggleAll(true), variant: 'ghost', disabled: busy }, tr('batch.selectAll')),
            h(Button, { onClick: () => toggleAll(false), variant: 'ghost', disabled: busy }, tr('batch.selectNone')),
            h(Button, { onClick: onClose, variant: 'ghost' }, tr('common.cancel')),
            h(
              Button,
              {
                onClick: () => onApply(buildSelected()),
                variant: 'primary',
                disabled: busy || selectedChanges.length === 0,
              },
              busy ? tr('batch.applying') : format(tr('batch.applySelected'), { n: selectedChanges.length }),
            ),
          ),
        },
        preview.instruction
          ? h(
              'div',
              { className: 'bf-batch-instruction-note' },
              h('span', null, tr('batch.instruction')),
              h('p', null, preview.instruction),
            )
          : null,
        ...keys.map((key) => {
          const template = state.templates.find((item) => item.key === key)
          const beat = project.beats.find((item) => item.key === key)
          const patch = preview.proposals[key]
          return h(
            'section',
            { className: 'bf-batch-card', key },
            h(
              'header',
              { className: 'bf-batch-card-head' },
              h('strong', null, `${template.no}. ${template.title}`),
              h('span', { className: 'bf-muted' }, template.en),
            ),
            ...['oneLine', 'content', 'turn', 'hook']
              .filter((field) => typeof patch[field] === 'string')
              .map((field) => {
                const id = `${key}|${field}`
                const oldText = beat?.[field] ?? ''
                const newText = patch[field]
                return h(
                  'div',
                  { className: 'bf-batch-diff', key: field },
                  h(
                    'div',
                    { className: 'bf-batch-diff-head' },
                    h(
                      'label',
                      { className: 'bf-batch-diff-check' },
                      h('input', {
                        type: 'checkbox',
                        checked: selected.has(id),
                        disabled: busy,
                        onChange: () => toggle(id),
                      }),
                      h('span', null, fieldLabels[field]),
                    ),
                    h(
                      Button,
                      { onClick: () => onApplyOne(key, field, newText), variant: 'ghost', disabled: busy },
                      busy ? tr('batch.applyingOne') : tr('batch.applyOne'),
                    ),
                  ),
                  h(
                    'div',
                    { className: 'bf-batch-diff-grid' },
                    h(
                      'div',
                      { className: 'bf-batch-diff-side' },
                      h('span', null, tr('batch.diffNow')),
                      h(DiffText, { oldText, newText, side: 'old' }),
                    ),
                    h(
                      'div',
                      { className: 'bf-batch-diff-side bf-batch-diff-new' },
                      h('span', null, tr('batch.diffNew')),
                      h(DiffText, { oldText, newText, side: 'new' }),
                    ),
                  ),
                )
              }),
          )
        }),
        preview.note
          ? h(
              'div',
              { className: 'bf-batch-note' },
              h('span', null, tr('batch.note')),
              h('p', null, preview.note),
            )
          : null,
      )
    }

    function VersionModal({ state, project, beatKey, data, tr, onClose, onRestore, onStar, busy }) {
      const template = state.templates.find((item) => item.key === beatKey)
      const beat = project.beats.find((item) => item.key === beatKey)
      const locked = beat?.locked === true
      const [starredOnly, setStarredOnly] = useState(false)
      const versions =
        data === null
          ? []
          : data.versions
              .slice()
              .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.at - a.at)
      const starred = versions.filter((version) => version.starred === true)
      const visible = starredOnly ? starred : versions
      return h(
        Modal,
        {
          title: tr('history.title'),
          subtitle: `${template ? `${template.no}. ${template.title}` : ''}${data ? ` · ${format(tr('history.count'), { n: data.versions.length })}${starred.length > 0 ? ` · ${format(tr('history.starredCount'), { n: starred.length })}` : ''}` : ''}`,
          onClose,
          wide: true,
          footer: h(Button, { onClick: onClose, variant: 'ghost' }, tr('history.close')),
        },
        h('p', { className: 'bf-version-stamp-hint' }, tr('version.stampHint')),
        locked ? h('div', { className: 'bf-banner bf-banner-warn' }, tr('beat.lockedBanner')) : null,
        data === null
          ? h('p', { className: 'bf-muted' }, tr('history.loading'))
          : data.versions.length === 0
            ? h('div', { className: 'bf-empty' }, h('p', null, tr('history.empty')))
            : h(
                React.Fragment,
                null,
                h(
                  'div',
                  { className: 'bf-version-toolbar' },
                  h(
                    Button,
                    { onClick: () => setStarredOnly(false), variant: starredOnly ? 'ghost' : 'primary' },
                    tr('version.all'),
                  ),
                  h(
                    Button,
                    { onClick: () => setStarredOnly(true), variant: starredOnly ? 'primary' : 'ghost', disabled: starred.length === 0 },
                    tr('version.onlyStarred'),
                  ),
                ),
                visible.length === 0
                  ? h('div', { className: 'bf-empty' }, h('p', null, tr('version.noStarred')))
                  : h(
                      'div',
                      { className: 'bf-version-list' },
                      ...visible.map((version) =>
                        h(
                          'article',
                          { className: 'bf-version-item', key: version.id, 'data-latest': version.isLatest ? 'true' : 'false' },
                          h(
                            'header',
                            { className: 'bf-version-head' },
                            h(
                              'div',
                              null,
                              h('strong', { className: 'bf-version-stamp' }, version.label || versionStampMinute(version.at)),
                              h(
                                'div',
                                { className: 'bf-version-source' },
                                h(
                                  Pill,
                                  { tone: version.isLatest ? 'final' : 'neutral' },
                                  version.isLatest ? tr('history.latest') : tr(`history.source.${version.source}`),
                                ),
                                version.starred ? h(Pill, { tone: 'warn' }, tr('version.star')) : null,
                              ),
                            ),
                            h(
                              'div',
                              { className: 'bf-version-actions' },
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'bf-star-btn',
                                  'aria-pressed': version.starred ? 'true' : 'false',
                                  title: version.starred ? tr('version.unstar') : tr('version.star'),
                                  disabled: busy,
                                  onClick: () => onStar(version.id, !version.starred),
                                },
                                h(StarIcon, { filled: version.starred }),
                              ),
                              h(
                                Button,
                                {
                                  onClick: () => onRestore(version.id),
                                  disabled: busy || version.isLatest || locked,
                                  variant: 'ghost',
                                },
                                version.isLatest ? tr('history.latest') : busy ? tr('history.restoring') : tr('history.restore'),
                              ),
                            ),
                          ),
                          version.note ? h('p', { className: 'bf-version-note' }, version.note) : null,
                          h(
                            'div',
                            { className: 'bf-version-preview' },
                            version.preview.oneLine ? h('strong', null, version.preview.oneLine) : null,
                            version.preview.content ? h('p', null, version.preview.content) : null,
                          ),
                        ),
                      ),
                    ),
              ),
      )
    }

    // ── material view ─────────────────────────────────────────────────────────

    function CompareBeatsModal({ data, state, project, tr, onClose, onApply, busy }) {
      const loading = data?.loading === true
      const [elapsed, setElapsed] = useState(0)
      useEffect(() => {
        if (!loading) return
        const started = data.startedAt ?? Date.now()
        const tick = () => setElapsed(Math.max(0, Math.round((Date.now() - started) / 1000)))
        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
      }, [loading, data?.startedAt])
      const templates = state.templates
      const candidates = data.candidates ?? []
      return h(
        Modal,
        {
          title: '对比生成 15 拍',
          subtitle: loading
            ? '同一份素材、同一套提示词，主模型和副模型各跑一遍。先看结构，再决定采用哪一版。'
            : `同一份素材，${candidates.length} 个模型各出一版。比较一句话、主题和每一拍的功能，再采用其中一版。`,
          onClose,
          wide: true,
          footer: h(Button, { onClick: onClose, variant: 'ghost' }, '关闭'),
        },
        loading
          ? h(
              'div',
              { className: 'bf-compare-loading' },
              h('div', { className: 'bf-compare-spinner' }, h(SparkIcon, null)),
              h('p', null, '两个模型正在并行生成 15 拍。Gemini 深结构版本通常需要 1—3 分钟，DeepSeek 通常更快。'),
              h('p', { className: 'bf-muted' }, `已用时 ${elapsed} 秒`),
              h('p', { className: 'bf-fineprint' }, '关闭窗口不会取消请求；完成后可以再次点「对比生成」。'),
            )
          : h(
              'div',
              { className: 'bf-compare-grid' },
              ...candidates.map((candidate, index) =>
                h(
                  'section',
                  { className: 'bf-compare-col', key: candidate.id },
                  h(
                    'header',
                    { className: 'bf-compare-head' },
                    h('div', { className: 'bf-compare-kicker' }, index === 0 ? 'MODEL A' : 'MODEL B'),
                    h('strong', null, candidate.label),
                    h(
                      'span',
                      { className: 'bf-muted bf-small' },
                      `${Math.max(1, Math.round(candidate.elapsedMs / 1000))} 秒 · ${candidate.missingMaterial.length} 项素材缺口`,
                    ),
                  ),
                  h('p', { className: 'bf-compare-logline' }, candidate.brief.logline || '（模型没有给一句话）'),
                  candidate.brief.theme
                    ? h('p', { className: 'bf-compare-theme' }, `主题：${candidate.brief.theme}`)
                    : null,
                  h(
                    'div',
                    { className: 'bf-compare-beats' },
                    ...candidate.beats.map((beat) => {
                      const template = templates.find((item) => item.key === beat.key)
                      return h(
                        'div',
                        { className: 'bf-compare-beat', key: beat.key },
                        h(
                          'div',
                          { className: 'bf-compare-beat-head' },
                          h('span', null, `${template?.no ?? ''}. ${template?.title ?? beat.key}`),
                          h('em', null, `p${beat.page}`),
                        ),
                        h('p', { className: 'bf-compare-oneline' }, beat.oneLine || '（未写一句话作用）'),
                        h('p', { className: 'bf-compare-content' }, beat.content || '（空）'),
                      )
                    }),
                  ),
                  candidate.warnings.length > 0
                    ? h('p', { className: 'bf-fineprint' }, candidate.warnings.join('；'))
                    : null,
                  h(
                    Button,
                    { onClick: () => onApply(candidate.id), variant: 'primary', disabled: busy },
                    busy ? '采用中…' : '采用这一版',
                  ),
                ),
              ),
              data.warnings?.length > 0
                ? h('div', { className: 'bf-banner bf-banner-warn' }, data.warnings.join('；'))
                : null,
            ),
      )
    }

    function MaterialView({
      project,
      tr,
      materialDraft,
      setMaterialDraft,
      briefDraft,
      setBriefDraft,
      materialDirty,
      busy,
      onSaveMaterial,
      onGenerate,
      onCompare,
      secondaryLabel,
      secondaryReady,
      onDeleteProject,
      onRenameProject,
      stats,
    }) {
      const locked = stats.locked > 0
      const generating = busy === 'generate'
      const comparing = busy === 'compare'
      const generation = project.generation
      return h(
        'div',
        { className: 'bf-material-grid' },
        h(
          'section',
          { className: 'bf-card bf-material-card' },
          h(
            'div',
            { className: 'bf-section-head' },
            h(
              'div',
              null,
              h('h2', null, tr('material.title')),
              h('p', null, tr('material.subtitle')),
            ),
            h(
              'div',
              { className: 'bf-actions' },
              h('span', { className: 'bf-muted' }, format(tr('material.chars'), { n: materialDraft.length })),
              materialDirty ? h(Pill, { tone: 'warn' }, tr('material.dirty')) : null,
              h(Button, { onClick: onSaveMaterial, disabled: busy !== null }, tr('material.save')),
            ),
          ),
          h('textarea', {
            className: 'bf-textarea bf-material-area',
            value: materialDraft,
            placeholder: tr('material.placeholder'),
            spellCheck: false,
            onChange: (event) => setMaterialDraft(event.target.value),
          }),
          h(
            'div',
            { className: 'bf-material-foot' },
            h(
              'div',
              { className: 'bf-muted bf-small' },
              locked ? tr('material.lockedHint') : tr('material.generateHint'),
            ),
            h(
              'div',
              { className: 'bf-material-actions' },
              h(
                Button,
                {
                  onClick: onCompare,
                  variant: 'ghost',
                  disabled: busy !== null || locked || materialDraft.trim() === '' || secondaryReady !== true,
                  title:
                    secondaryReady === true
                      ? `同一份素材，主模型与副模型（${secondaryLabel || '未命名'}）各出一版 15 拍`
                      : '先在模型设置里选第二个模型',
                },
                comparing ? '正在对比生成…' : '对比生成',
              ),
              h(
                Button,
                {
                  onClick: onGenerate,
                  variant: 'primary',
                  disabled: busy !== null || locked || materialDraft.trim() === '',
                  icon: h(SparkIcon, null),
                },
                generating ? tr('material.generating') : tr('material.generate'),
              ),
            ),
          ),
          generation !== null
            ? h(
                'div',
                { className: 'bf-generation' },
                h(
                  'div',
                  { className: 'bf-generation-head' },
                  h('strong', null, tr('material.lastGeneration')),
                  h('span', { className: 'bf-muted' }, `${generation.model || '模型'} · ${timeLabel(generation.at, tr)}`),
                ),
                h(
                  'div',
                  { className: 'bf-generation-body' },
                  h('div', { className: 'bf-generation-label' }, tr('material.missing')),
                  generation.missingMaterial.length === 0
                    ? h('p', { className: 'bf-muted' }, tr('material.noMissing'))
                    : h('ul', null, ...generation.missingMaterial.map((item, index) => h('li', { key: index }, item))),
                  generation.warnings.length > 0
                    ? h(
                        React.Fragment,
                        null,
                        h('div', { className: 'bf-generation-label' }, tr('material.warnings')),
                        h('ul', null, ...generation.warnings.map((item, index) => h('li', { key: `w${index}` }, item))),
                      )
                    : null,
                ),
              )
            : null,
        ),
        h(
          'aside',
          { className: 'bf-side' },
          h(
            'section',
            { className: 'bf-card' },
            h(
              'div',
              { className: 'bf-section-head' },
              h(
                'div',
                null,
                h('h3', null, tr('material.briefTitle')),
                h('p', null, tr('material.briefHint')),
              ),
            ),
            h(
              'div',
              { className: 'bf-form bf-form-tight' },
              h(Field, { label: tr('material.logline') }, h('textarea', { className: 'bf-textarea', rows: 2, value: briefDraft.logline, onChange: (event) => setBriefDraft({ ...briefDraft, logline: event.target.value }) })),
              h(Field, { label: tr('material.theme') }, h('textarea', { className: 'bf-textarea', rows: 2, value: briefDraft.theme, onChange: (event) => setBriefDraft({ ...briefDraft, theme: event.target.value }) })),
              h(Field, { label: tr('material.format') }, h('input', { className: 'bf-input', value: briefDraft.format, onChange: (event) => setBriefDraft({ ...briefDraft, format: event.target.value }) })),
              h(Field, { label: tr('material.notes') }, h('textarea', { className: 'bf-textarea', rows: 7, value: briefDraft.structureNotes, placeholder: tr('material.notesPlaceholder'), onChange: (event) => setBriefDraft({ ...briefDraft, structureNotes: event.target.value }) })),
              h(Button, { onClick: onSaveMaterial, disabled: busy !== null }, tr('material.saveBrief')),
            ),
          ),
          h(
            'section',
            { className: 'bf-card' },
            h('h3', null, tr('material.howTo')),
            h(
              'ol',
              { className: 'bf-howto' },
              h('li', null, tr('material.howTo1')),
              h('li', null, tr('material.howTo2')),
              h('li', null, tr('material.howTo3')),
              h('li', null, tr('material.howTo4')),
              h('li', null, tr('material.howTo5')),
            ),
          ),
          h(
            'section',
            { className: 'bf-card' },
            h('h3', null, tr('material.dangerTitle')),
            h('p', { className: 'bf-muted' }, project.title),
            h(
              'div',
              { className: 'bf-actions' },
              h(Button, { onClick: onRenameProject, icon: h(PencilIcon, null) }, tr('common.rename')),
              h(Button, { onClick: onDeleteProject, variant: 'danger', icon: h(TrashIcon, null) }, tr('material.delete')),
            ),
          ),
        ),
      )
    }

    // ── beat list ─────────────────────────────────────────────────────────────

    function BeatRow({ beat, template, selected, tr, onSelect }) {
      const status = statusOf(beat)
      const drift = pageDriftOf(beat.page, template)
      const oneLine = beat.oneLine || tr('status.empty')
      return h(
        'button',
        {
          type: 'button',
          className: 'bf-beat-row',
          'data-selected': selected ? 'true' : 'false',
          'data-status': status,
          onClick: onSelect,
        },
        h('span', { className: 'bf-beat-no' }, String(template.no).padStart(2, '0')),
        h(
          'span',
          { className: 'bf-beat-row-main' },
          h(
            'span',
            { className: 'bf-beat-row-title' },
            template.title,
            beat.locked ? h('span', { className: 'bf-lock-mark' }, h(LockIcon, null)) : null,
          ),
          h('span', { className: 'bf-beat-row-line' }, oneLine),
        ),
        h(
          'span',
          { className: 'bf-beat-row-meta' },
          h('span', { className: 'bf-page-chip' }, `p${beat.page}`),
          drift !== 0 ? h('span', { className: 'bf-drift', 'data-level': driftClass(drift) }, `${drift > 0 ? '+' : ''}${drift}`) : null,
          h('span', { className: 'bf-status', 'data-status': status }, tr(`status.${status}`)),
        ),
      )
    }

    function BeatList({ state, project, selectedKey, onSelect, tr, stats, onLockAll, busy }) {
      const templates = state.templates
      const acts = [
        { no: 1, label: tr('beats.act1'), range: tr('beats.act1Range') },
        { no: 2, label: tr('beats.act2'), range: tr('beats.act2Range') },
        { no: 3, label: tr('beats.act3'), range: tr('beats.act3Range') },
      ]
      return h(
        'aside',
        { className: 'bf-beat-list' },
        h(
          'div',
          { className: 'bf-list-head' },
          h(
            'div',
            null,
            h('h2', null, tr('beats.title')),
            h(
              'p',
              null,
              format(tr('beats.written'), { n: stats.written }),
              ' · ',
              format(tr('beats.locked'), { n: stats.locked }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'bf-progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 15, 'aria-valuenow': stats.locked },
          h('i', { style: { width: `${(stats.locked / 15) * 100}%` } }),
        ),
        ...acts.map((act) =>
          h(
            'div',
            { className: 'bf-act', key: act.no },
            h(
              'div',
              { className: 'bf-act-head' },
              h('span', null, act.label),
              h('span', null, act.range),
            ),
            ...templates
              .filter((template) => template.act === act.no)
              .map((template) => {
                const beat = project.beats.find((item) => item.key === template.key)
                if (beat === undefined) return null
                return h(BeatRow, {
                  key: template.key,
                  beat,
                  template,
                  selected: template.key === selectedKey,
                  tr,
                  onSelect: () => onSelect(template.key),
                })
              }),
          ),
        ),
        h(
          'div',
          { className: 'bf-list-foot' },
          h(Button, { onClick: () => onLockAll(true), disabled: busy || stats.locked === 15 }, tr('beats.lockAll')),
          h(Button, { onClick: () => onLockAll(false), disabled: busy || stats.locked === 0, variant: 'ghost' }, tr('beats.unlockAll')),
          h('p', { className: 'bf-muted bf-small' }, tr('beats.listHint')),
        ),
      )
    }

    // ── table view ────────────────────────────────────────────────────────────

    function BeatTable({ state, project, tr, busy, resetToken, onSaveRow, onPreview, onOpenVersions, onOpenDetail }) {
      const [selected, setSelected] = useState([])
      const [edits, setEdits] = useState({})
      const editsRef = useRef({})
      const [savingKey, setSavingKey] = useState(null)
      const [instruction, setInstruction] = useState('')
      const [op, setOp] = useState('rewrite')
      const [target, setTarget] = useState('all')
      const [model, setModel] = useState('primary')
      const secondary = state.modelInfo.secondary
      const secondaryAvailable = secondary !== null && secondary !== undefined && secondary.mode !== 'none'
      const unlockedKeys = project.beats.filter((beat) => !beat.locked).map((beat) => beat.key)

      useEffect(() => {
        setSelected([])
        setEdits({})
        editsRef.current = {}
      }, [resetToken, project.id])

      const setCell = (key, field, value) => {
        const next = { ...editsRef.current, [key]: { ...(editsRef.current[key] ?? {}), [field]: value } }
        editsRef.current = next
        setEdits(next)
      }

      const saveRow = async (key) => {
        const patch = editsRef.current[key]
        if (patch === undefined) return true
        const beat = project.beats.find((item) => item.key === key)
        if (beat === undefined || beat.locked) return false
        setSavingKey(key)
        const saved = await onSaveRow(key, patch)
        setSavingKey(null)
        if (saved === null) return false
        const next = { ...editsRef.current }
        delete next[key]
        editsRef.current = next
        setEdits(next)
        return true
      }

      const toggleSelect = (key) => {
        if (selected.includes(key)) {
          setSelected(selected.filter((item) => item !== key))
          return
        }
        if (selected.length >= 6) return
        setSelected([...selected, key])
      }

      const toggleAll = () => {
        if (selected.length > 0) setSelected([])
        else setSelected(unlockedKeys.slice(0, 6))
      }

      const valueOf = (beat, field) => (edits[beat.key]?.[field] !== undefined ? edits[beat.key][field] : beat[field])
      const previewing = busy === 'batch-preview'
      const canPreview = selected.length > 0 && instruction.trim() !== '' && !busy
      const flushAll = async () => {
        const keys = Object.keys(editsRef.current)
        for (const key of keys) {
          const ok = await saveRow(key)
          if (!ok) return false
        }
        return true
      }
      const preview = async () => {
        if (!canPreview) return
        const flushed = await flushAll()
        if (!flushed) return
        onPreview({ keys: selected, instruction: instruction.trim(), op, target, model })
      }
      const openDetail = async (key) => {
        const ok = await saveRow(key)
        if (ok) onOpenDetail(key)
      }
      const openHistory = async (key) => {
        const ok = await saveRow(key)
        if (ok) onOpenVersions(key)
      }

      const textCell = (beat, field, rows, className) =>
        h(AutoTextarea, {
          className: `bf-cell-textarea ${className ?? ''}`,
          rows,
          value: valueOf(beat, field),
          disabled: beat.locked || savingKey === beat.key || busy !== null,
          onChange: (event) => setCell(beat.key, field, event.target.value),
          onBlur: () => saveRow(beat.key),
        })

      const pageCell = (beat) => {
        const value = valueOf(beat, 'page')
        const template = state.templates.find((item) => item.key === beat.key)
        const drift = pageDriftOf(value, template)
        return h(
          'div',
          { className: 'bf-cell-page-wrap' },
          h('input', {
            className: 'bf-cell-input bf-cell-page',
            type: 'number',
            min: 1,
            max: 300,
            value,
            disabled: beat.locked || savingKey === beat.key || busy !== null,
            onChange: (event) => setCell(beat.key, 'page', event.target.value),
            onBlur: () => saveRow(beat.key),
          }),
          drift !== 0
            ? h('span', { className: 'bf-drift', 'data-level': driftClass(drift) }, `${drift > 0 ? '+' : ''}${drift}`)
            : null,
        )
      }

      const rows = project.beats.map((beat) => {
        const template = state.templates.find((item) => item.key === beat.key)
        const status = statusOf(beat)
        return h(
          'tr',
          {
            key: beat.key,
            'data-selected': selected.includes(beat.key) ? 'true' : 'false',
            'data-locked': beat.locked ? 'true' : 'false',
          },
          h(
            'td',
            { className: 'bf-table-check' },
            h('input', {
              type: 'checkbox',
              checked: selected.includes(beat.key),
              disabled: beat.locked || busy !== null || (selected.length >= 6 && !selected.includes(beat.key)),
              onChange: () => toggleSelect(beat.key),
              'aria-label': `${tr('table.select')} ${template.title}`,
            }),
          ),
          h('td', { className: 'bf-table-no-cell' }, h('span', { className: 'bf-table-no' }, String(template.no).padStart(2, '0'))),
          h(
            'td',
            { className: 'bf-table-beat' },
            h('div', { className: 'bf-table-title' }, template.title, beat.locked ? h('span', { className: 'bf-lock-mark' }, h(LockIcon, null)) : null),
            h('div', { className: 'bf-table-sub' }, template.en),
          ),
          h('td', null, pageCell(beat)),
          h('td', null, textCell(beat, 'oneLine', 2, 'bf-cell-one-line')),
          h('td', null, textCell(beat, 'content', 4, 'bf-cell-content')),
          h('td', null, textCell(beat, 'hook', 3)),
          h(
            'td',
            { className: 'bf-table-status' },
            savingKey === beat.key ? h('span', { className: 'bf-muted' }, tr('table.saving')) : h(Pill, { tone: status }, tr(`status.${status}`)),
          ),
          h(
            'td',
            { className: 'bf-table-actions' },
            h('div', { className: 'bf-table-actions-inner' },
              h(
                'div',
                { className: 'bf-table-history' },
                h(Button, { onClick: () => openHistory(beat.key), variant: 'ghost', icon: h(HistoryIcon, null), title: tr('history.title') }, tr('table.history')),
                beat.latestVersionAt
                  ? h('span', { className: 'bf-table-stamp' }, `${beat.latestVersionLabel || versionStampMinute(beat.latestVersionAt)}${beat.starredCount ? ' ★' : ''}`)
                  : null,
              ),
              h(Button, { onClick: () => openDetail(beat.key), variant: 'ghost' }, tr('table.detail')),
            ),
          ),
        )
      })

      return h(
        'div',
        { className: 'bf-table-wrap' },
        h(
          'div',
          { className: 'bf-section-head' },
          h(
            'div',
            null,
            h('h2', null, tr('beats.title')),
            h('p', null, tr('table.hint')),
          ),
          h('span', { className: 'bf-muted' }, format(tr('table.total'), { n: project.beats.length })),
        ),
        selected.length > 0
          ? h(
              'div',
              { className: 'bf-batchbar' },
              h('div', { className: 'bf-batchbar-top' },
                h('strong', null, format(tr('batch.selected'), { n: selected.length })),
                h('span', { className: 'bf-muted bf-small' }, tr('batch.max')),
                h(Button, { onClick: () => setSelected([]), variant: 'ghost' }, tr('batch.clear')),
              ),
              h(
                'div',
                { className: 'bf-batchbar-controls' },
                h('label', { className: 'bf-batch-field' },
                  h('span', null, tr('batch.model')),
                  h('select', { className: 'bf-select', value: model, onChange: (event) => setModel(event.target.value) },
                    h('option', { value: 'primary', title: state.modelInfo.primaryLabel }, tr('batch.modelPrimary')),
                    secondaryAvailable
                      ? h('option', { value: 'secondary', title: state.modelInfo.secondaryLabel }, tr('batch.modelSecondary'))
                      : h('option', { value: 'secondary', disabled: true }, tr('batch.secondaryMissing')),
                  ),
                ),
                h('label', { className: 'bf-batch-field' },
                  h('span', null, tr('batch.op')),
                  h('select', { className: 'bf-select', value: op, onChange: (event) => setOp(event.target.value) },
                    h('option', { value: 'rewrite' }, tr('batch.op.rewrite')),
                    h('option', { value: 'tighten' }, tr('batch.op.tighten')),
                    h('option', { value: 'conflict' }, tr('batch.op.conflict')),
                    h('option', { value: 'hook' }, tr('batch.op.hook')),
                  ),
                ),
                h('label', { className: 'bf-batch-field' },
                  h('span', null, tr('batch.target')),
                  h('select', { className: 'bf-select', value: target, onChange: (event) => setTarget(event.target.value) },
                    h('option', { value: 'all' }, tr('batch.target.all')),
                    h('option', { value: 'oneLine' }, tr('batch.target.oneLine')),
                    h('option', { value: 'content' }, tr('batch.target.content')),
                    h('option', { value: 'turn' }, tr('batch.target.turn')),
                    h('option', { value: 'hook' }, tr('batch.target.hook')),
                  ),
                ),
                h('label', { className: 'bf-batch-field bf-batch-instruction' },
                  h('span', null, tr('batch.instruction')),
                  h('input', {
                    className: 'bf-input',
                    value: instruction,
                    placeholder: tr('batch.instructionPlaceholder'),
                    onChange: (event) => setInstruction(event.target.value),
                    onKeyDown: (event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        event.preventDefault()
                        preview()
                      }
                    },
                  }),
                ),
                h('div', { className: 'bf-batchbar-actions' },
                  h(Button, { onClick: preview, variant: 'primary', icon: h(SparkIcon, null), disabled: !canPreview }, previewing ? tr('batch.previewing') : tr('batch.preview')),
                ),
              ),
            )
          : null,
        h(
          'div',
          { className: 'bf-table-scroll' },
          h(
            'table',
            { className: 'bf-table' },
            h(
              'thead',
              null,
              h(
                'tr',
                null,
                h('th', { className: 'bf-table-check' },
                  h('input', {
                    type: 'checkbox',
                    checked: selected.length > 0,
                    onChange: toggleAll,
                    disabled: busy !== null || unlockedKeys.length === 0,
                    'aria-label': tr('table.selectAll'),
                  }),
                ),
                h('th', { className: 'bf-table-no-cell' }, '#'),
                h('th', { className: 'bf-table-beat' }, tr('table.beat')),
                h('th', null, tr('table.page')),
                h('th', null, tr('table.oneLine')),
                h('th', null, tr('table.content')),
                h('th', null, tr('table.hook')),
                h('th', { className: 'bf-table-status' }, tr('table.status')),
                h('th', { className: 'bf-table-actions' }, ''),
              ),
            ),
            h('tbody', null, ...rows),
          ),
        ),
      )
    }

    // ── beat detail ───────────────────────────────────────────────────────────

    function BeatDetail({
      state,
      project,
      beat,
      template,
      beatDraft,
      setBeatDraft,
      beatDirty,
      tr,
      busy,
      onSave,
      onFinal,
      onLock,
      onReview,
      onToggleCheck,
      onOpenVersions,
      settings,
    }) {
      const locked = beat.locked
      const status = statusOf(beat)
      const drift = pageDriftOf(beatDraft.page, template)
      const totalChecks = template.questions.length
      const doneChecks = Object.values(beatDraft.checks).filter(Boolean).length
      const secondary = state.modelInfo.secondary
      const dualAvailable =
        settings.reviewMode === 'dual' &&
        secondary !== null &&
        secondary !== undefined &&
        secondary.mode !== 'none' &&
        (secondary.mode !== 'external' || state.modelInfo.hasExternalKey)
      const disabled = locked || busy !== null
      const review = beat.review
      const saving = busy === 'save-beat'
      const reviewing = busy === 'review'
      const canLock = locked || (!beatDirty && beatDraft.status === 'final')
      return h(
        'section',
        { className: 'bf-detail' },
        h(
          'header',
          { className: 'bf-detail-head' },
          h(
            'div',
            null,
            h('div', { className: 'bf-detail-eyebrow' }, format(tr('beat.eyebrow'), { no: String(template.no).padStart(2, '0'), act: template.act, target: template.pageRange ?? template.targetPage })),
            h(
              'h2',
              { className: 'bf-detail-title' },
              template.title,
              h('small', null, template.en),
            ),
            h(
              'div',
              { className: 'bf-detail-meta' },
              h(Pill, { tone: status }, tr(`status.${status}`)),
              h('span', { className: 'bf-muted' }, format(tr('beat.pageTarget'), { target: template.pageRange ?? template.targetPage })),
              drift !== 0 ? h('span', { className: 'bf-drift', 'data-level': driftClass(drift) }, format(tr('beat.pageDrift'), { drift: `${drift > 0 ? '+' : ''}${drift}` })) : null,
            ),
          ),
          h(
            'div',
            { className: 'bf-actions' },
            h(
              Button,
              {
                onClick: async () => {
                  if (beatDirty) {
                    const saved = await onSave()
                    if (saved === null) return
                  }
                  onOpenVersions(beat.key)
                },
                variant: 'ghost',
                icon: h(HistoryIcon, null),
                disabled: busy !== null,
              },
              `${tr('history.button')}${beat.latestVersionLabel ? ` · ${beat.latestVersionLabel}` : ''}${beat.starredCount ? ' ★' : ''}`,
            ),
            h(
              Button,
              { onClick: onFinal, disabled: locked || busy, variant: beat.status === 'final' ? 'ghost' : 'primary', icon: beat.status === 'final' ? h(CheckIcon, null) : null },
              beat.status === 'final' ? tr('beat.unfinal') : tr('beat.final'),
            ),
            h(
              Button,
              { onClick: onLock, disabled: busy !== null || (!locked && !canLock), icon: locked ? h(UnlockIcon, null) : h(LockIcon, null) },
              locked ? tr('beat.unlock') : tr('beat.lock'),
            ),
          ),
        ),
        locked ? h('div', { className: 'bf-banner bf-banner-lock' }, h(LockIcon, null), h('span', null, tr('beat.lockedBanner'))) : null,
        h(
          'div',
          { className: 'bf-task' },
          h('div', { className: 'bf-task-label' }, tr('beat.task')),
          h('p', null, template.job),
          h(
            'ul',
            { className: 'bf-task-questions' },
            ...template.questions.map((question, index) => h('li', { key: index }, question)),
          ),
        ),
        h(
          'div',
          { className: 'bf-form' },
          h(
            Field,
            { label: tr('beat.oneLine') },
            h('input', {
              className: 'bf-input',
              value: beatDraft.oneLine,
              placeholder: tr('beat.oneLinePlaceholder'),
              disabled,
              onChange: (event) => setBeatDraft({ ...beatDraft, oneLine: event.target.value }),
            }),
          ),
          h(
            Field,
            { label: tr('beat.content') },
            h('textarea', {
              className: 'bf-textarea bf-content-area',
              value: beatDraft.content,
              placeholder: tr('beat.contentPlaceholder'),
              disabled,
              onChange: (event) => setBeatDraft({ ...beatDraft, content: event.target.value }),
            }),
          ),
          h(
            'div',
            { className: 'bf-grid-2' },
            h(
              Field,
              { label: tr('beat.turn') },
              h('textarea', {
                className: 'bf-textarea',
                rows: 3,
                value: beatDraft.turn,
                placeholder: tr('beat.turnPlaceholder'),
                disabled,
                onChange: (event) => setBeatDraft({ ...beatDraft, turn: event.target.value }),
              }),
            ),
            h(
              Field,
              { label: tr('beat.hook') },
              h('textarea', {
                className: 'bf-textarea',
                rows: 3,
                value: beatDraft.hook,
                placeholder: tr('beat.hookPlaceholder'),
                disabled,
                onChange: (event) => setBeatDraft({ ...beatDraft, hook: event.target.value }),
              }),
            ),
          ),
          h(
            'div',
            { className: 'bf-grid-3' },
            h(
              Field,
              { label: tr('beat.page') },
              h('input', {
                className: 'bf-input',
                type: 'number',
                min: 1,
                max: 300,
                value: beatDraft.page,
                disabled,
                onChange: (event) => setBeatDraft({ ...beatDraft, page: event.target.value === '' ? '' : Number(event.target.value) }),
              }),
            ),
            h(
              Field,
              { label: tr('beat.episodeHint') },
              h('input', {
                className: 'bf-input',
                value: beatDraft.episodeHint,
                placeholder: tr('beat.episodeHintPlaceholder'),
                disabled,
                onChange: (event) => setBeatDraft({ ...beatDraft, episodeHint: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'bf-page-note' },
              h('span', { className: 'bf-muted' }, format(tr('beat.pageTarget'), { target: template.pageRange ?? template.targetPage })),
              h('span', { className: 'bf-drift', 'data-level': driftClass(drift) }, format(tr('beat.pageDrift'), { drift: `${drift > 0 ? '+' : ''}${drift}` })),
            ),
          ),
          h(
            Field,
            { label: tr('beat.sourceNote') },
            h('textarea', {
              className: 'bf-textarea',
              rows: 3,
              value: beatDraft.sourceNote,
              placeholder: tr('beat.sourceNotePlaceholder'),
              disabled,
              onChange: (event) => setBeatDraft({ ...beatDraft, sourceNote: event.target.value }),
            }),
          ),
          h(
            Field,
            { label: tr('beat.notes') },
            h('textarea', {
              className: 'bf-textarea',
              rows: 3,
              value: beatDraft.notes,
              placeholder: tr('beat.notesPlaceholder'),
              disabled,
              onChange: (event) => setBeatDraft({ ...beatDraft, notes: event.target.value }),
            }),
          ),
        ),
        h(
          'section',
          { className: 'bf-checks' },
          h(
            'div',
            { className: 'bf-section-head' },
            h('h3', null, tr('beat.checks')),
            h('span', { className: 'bf-muted' }, format(tr('beat.checkProgress'), { done: doneChecks, total: totalChecks })),
          ),
          ...template.questions.map((question, index) =>
            h(
              'label',
              { className: 'bf-check', key: index },
              h('input', {
                type: 'checkbox',
                checked: beatDraft.checks[String(index)] === true,
                disabled,
                onChange: (event) => onToggleCheck(index, event.target.checked),
              }),
              h('span', null, question),
            ),
          ),
        ),
        h(
          'div',
          { className: 'bf-savebar' },
          h('span', { className: 'bf-save-state' }, beatDirty ? tr('beat.dirty') : tr('beat.saved')),
          h(Button, { onClick: onSave, disabled: locked || busy !== null || !beatDirty, variant: 'primary' }, saving ? tr('beat.saving') : tr('beat.save')),
        ),
        h(ReviewPanel, {
          review,
          tr,
          reviewing,
          disabled: busy !== null,
          onReview,
          dualAvailable,
        }),
      )
    }

    // ── beats view ────────────────────────────────────────────────────────────

    function BeatsView({
      state,
      project,
      selectedKey,
      onSelect,
      tr,
      stats,
      beatDraft,
      setBeatDraft,
      beatDirty,
      busy,
      onSave,
      onFinal,
      onLock,
      onReview,
      onToggleCheck,
      onSheet,
      onLockAll,
      viewMode,
      onViewMode,
      onSaveRow,
      onPreview,
      onOpenVersions,
      onOpenDetail,
      tableReset,
    }) {
      const template = state.templates.find((item) => item.key === selectedKey) ?? state.templates[0]
      const beat = project.beats.find((item) => item.key === template.key)
      return h(
        'div',
        { className: 'bf-beats-wrap' },
        h(
          'div',
          { className: 'bf-viewbar' },
          h(
            'div',
            { className: 'bf-view-toggle', role: 'group', 'aria-label': tr('beats.title') },
            h(Button, { onClick: () => onViewMode('list'), variant: viewMode === 'list' ? 'primary' : 'ghost' }, tr('view.list')),
            h(Button, { onClick: () => onViewMode('table'), variant: viewMode === 'table' ? 'primary' : 'ghost' }, tr('view.table')),
          ),
          h(Button, { onClick: onSheet, icon: h(SparkIcon, null), disabled: busy !== null }, tr('beats.sheetReview')),
        ),
        viewMode === 'table'
          ? h(BeatTable, {
              state,
              project,
              tr,
              busy,
              resetToken: tableReset,
              onSaveRow,
              onPreview,
              onOpenVersions,
              onOpenDetail,
            })
          : h(
              'div',
              { className: 'bf-beats-grid' },
              h(BeatList, {
                state,
                project,
                selectedKey: template.key,
                onSelect,
                tr,
                stats,
                onLockAll,
                busy,
              }),
              beat !== undefined && beatDraft !== null
                ? h(BeatDetail, {
                    state,
                    project,
                    beat,
                    template,
                    beatDraft,
                    setBeatDraft,
                    beatDirty,
                    tr,
                    busy,
                    onSave,
                    onFinal,
                    onLock,
                    onReview,
                    onToggleCheck,
                    onOpenVersions,
                    settings: state.settings,
                  })
                : h('div', { className: 'bf-empty' }, h('p', null, tr('status.empty'))),
            ),
      )
    }

    // ── header ────────────────────────────────────────────────────────────────

    function Header({ state, project, stats, tr, busy, onSelectProject, onNewProject, onRenameProject, onOpenSettings, onOpenExport }) {
      return h(
        'header',
        { className: 'bf-head' },
        h(
          'div',
          { className: 'bf-head-main' },
          h('div', { className: 'bf-eyebrow' }, tr('head.eyebrow')),
          h('h1', { className: 'bf-title' }, tr('panel.title')),
          h('p', { className: 'bf-subtitle' }, tr('panel.subtitle')),
          h(
            'div',
            { className: 'bf-project-row' },
            h('span', { className: 'bf-project-label' }, tr('project.select')),
            h(
              'select',
              {
                className: 'bf-select bf-project-select',
                value: state.activeProjectId ?? '',
                onChange: (event) => onSelectProject(event.target.value),
                'aria-label': tr('project.select'),
              },
              ...state.projects.map((item) => h('option', { value: item.id, key: item.id }, item.title)),
            ),
            h(Button, { onClick: onNewProject, icon: h(PlusIcon, null), title: tr('head.newProject') }, tr('head.newProject')),
            h(Button, { onClick: onRenameProject, icon: h(PencilIcon, null), title: tr('head.renameProject') }, tr('head.renameProject')),
          ),
        ),
        h(
          'div',
          { className: 'bf-head-right' },
          h(
            'div',
            { className: 'bf-stats' },
            h('div', { className: 'bf-stat' }, h('strong', null, String(stats.written)), h('span', null, tr('head.stat.writtenLabel'))),
            h('div', { className: 'bf-stat' }, h('strong', null, String(stats.final)), h('span', null, tr('head.stat.finalLabel'))),
            h('div', { className: 'bf-stat' }, h('strong', null, String(stats.locked)), h('span', null, tr('head.stat.lockedLabel'))),
          ),
          h(
            'div',
            { className: 'bf-actions' },
            h(Button, { onClick: onOpenSettings, icon: h(GearIcon, null) }, tr('head.settings')),
            h(Button, { onClick: onOpenExport, icon: h(DownloadIcon, null), variant: 'primary' }, tr('head.export')),
          ),
        ),
      )
    }

    // ── app ───────────────────────────────────────────────────────────────────

    function Panel({ t }) {
      const tr = makeTr(t)
      const [state, setState] = useState(null)
      const [error, setError] = useState(null)
      const [busy, setBusy] = useState(null)
      const [toast, setToast] = useState(null)
      const [tab, setTab] = useState('beats')
      const [selectedKey, setSelectedKey] = useState('opening-image')
      const [materialDraft, setMaterialDraft] = useState('')
      const [briefDraft, setBriefDraft] = useState(emptyBrief())
      const [beatDraft, setBeatDraft] = useState(null)
      const [settingsOpen, setSettingsOpen] = useState(false)
      const [exportOpen, setExportOpen] = useState(false)
      const [sheetOpen, setSheetOpen] = useState(false)
      const [viewMode, setViewMode] = useState('list')
      const [tableReset, setTableReset] = useState(0)
      const [batchPreview, setBatchPreview] = useState(null)
      const [versionKey, setVersionKey] = useState(null)
      const [versionData, setVersionData] = useState(null)
      const [versionsOpen, setVersionsOpen] = useState(false)
      const [compare, setCompare] = useState(null)
      const [models, setModels] = useState(null)
      const [modelsBusy, setModelsBusy] = useState(false)
      const projectRef = useRef(null)
      const compareToken = useRef(0)
      const [ask, setAsk] = useState(null)
      const askResolve = useRef(null)

      // One dialog at a time, resolved through a promise so call sites keep
      // reading like the old window.prompt / window.confirm code.
      function openAsk(request) {
        return new Promise((resolve) => {
          const pending = askResolve.current
          askResolve.current = resolve
          setAsk(request)
          if (pending !== null) pending(request.kind === 'text' ? null : false)
        })
      }

      const askText = (title, initial) => openAsk({ kind: 'text', title, initial: initial ?? '' })

      const askConfirm = (message, options) =>
        openAsk({
          kind: 'confirm',
          title: options?.title ?? tr('dialog.confirmTitle'),
          message,
          confirmLabel: options?.confirmLabel,
          danger: options?.danger === true,
        })

      function settleAsk(value) {
        const resolve = askResolve.current
        askResolve.current = null
        setAsk(null)
        if (resolve !== null) resolve(value)
      }

      const closeCompare = () => {
        compareToken.current += 1
        setCompare(null)
      }

      const project = useMemo(
        () => (state === null ? null : state.projects.find((item) => item.id === state.activeProjectId) ?? state.projects[0] ?? null),
        [state],
      )
      const stats = useMemo(() => projectStats(project), [project])
      const selectedBeat = useMemo(
        () => (project === null ? null : project.beats.find((item) => item.key === selectedKey) ?? project.beats[0] ?? null),
        [project, selectedKey],
      )
      const beatDirty = useMemo(() => {
        if (beatDraft === null || selectedBeat === null) return false
        return JSON.stringify(beatDraft) !== JSON.stringify(cloneBeatDraft(selectedBeat))
      }, [beatDraft, selectedBeat])
      const materialDirty = useMemo(() => {
        if (project === null) return false
        return materialDraft !== project.material || JSON.stringify(briefDraft) !== JSON.stringify(project.brief)
      }, [materialDraft, briefDraft, project])

      async function api(action, payload) {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action, ...(payload ?? {}) }),
        })
        let data = {}
        try {
          data = await response.json()
        } catch {
          // Keep the HTTP status message below.
        }
        if (!response.ok) throw new Error(data.error || `请求失败（HTTP ${response.status}）`)
        return data
      }

      async function load() {
        setError(null)
        try {
          const response = await fetch(API, { cache: 'no-store' })
          let data = {}
          try {
            data = await response.json()
          } catch {
            // Keep the HTTP status message below.
          }
          if (!response.ok) throw new Error(data.error || `请求失败（HTTP ${response.status}）`)
          setState(data.state)
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }

      async function loadModels() {
        setModelsBusy(true)
        try {
          const data = await api('listModels')
          setModels(data)
        } catch (err) {
          setModels({ providers: [], current: null, supported: false, error: err instanceof Error ? err.message : String(err) })
        } finally {
          setModelsBusy(false)
        }
      }

      useEffect(() => {
        load()
        loadModels()
      }, [])

      useEffect(() => {
        if (project === null) return
        if (projectRef.current === project.id) return
        projectRef.current = project.id
        setMaterialDraft(project.material)
        setBriefDraft({ ...project.brief })
        const key = project.beats.some((beat) => beat.key === selectedKey) ? selectedKey : project.beats[0]?.key
        if (key !== undefined) setSelectedKey(key)
        const beat = project.beats.find((item) => item.key === key) ?? project.beats[0]
        if (beat !== undefined) setBeatDraft(cloneBeatDraft(beat))
      }, [project])

      useEffect(() => {
        if (project === null) return
        const beat = project.beats.find((item) => item.key === selectedKey)
        if (beat !== undefined) setBeatDraft(cloneBeatDraft(beat))
      }, [selectedKey, project?.id])

      useEffect(() => {
        if (toast === null) return
        const timer = setTimeout(() => setToast(null), 4600)
        return () => clearTimeout(timer)
      }, [toast])

      const notify = (kind, text) => setToast({ kind, text, id: Date.now() })

      async function selectProject(id) {
        if (id === state.activeProjectId) return
        if ((materialDirty || beatDirty) && !(await askConfirm(tr('project.unsavedConfirm'), { confirmLabel: tr('dialog.continue') }))) return
        setBatchPreview(null)
        setVersionsOpen(false)
        setBusy('project')
        try {
          const data = await api('selectProject', { id })
          setState(data.state)
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function createProject() {
        const title = await askText(tr('project.createPrompt'), tr('project.defaultTitle'))
        if (title === null) return
        setBatchPreview(null)
        setVersionsOpen(false)
        setBusy('project')
        try {
          const data = await api('createProject', { title })
          setState(data.state)
          notify('ok', tr('toast.projectCreated'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function renameProject() {
        if (project === null) return
        const title = await askText(tr('project.renamePrompt'), project.title)
        if (title === null || title.trim() === '') return
        setBusy('project')
        try {
          const data = await api('renameProject', { id: project.id, title })
          setState(data.state)
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function deleteProject() {
        if (project === null) return
        if (!(await askConfirm(tr('project.deleteConfirm'), { title: tr('project.delete'), confirmLabel: tr('common.delete'), danger: true }))) return
        setBatchPreview(null)
        setVersionsOpen(false)
        setBusy('project')
        try {
          const data = await api('deleteProject', { id: project.id })
          setState(data.state)
          notify('ok', tr('toast.projectDeleted'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function saveMaterial() {
        if (project === null) return
        setBusy('material')
        try {
          const data = await api('saveMaterial', { id: project.id, material: materialDraft, brief: briefDraft })
          setState(data.state)
          notify('ok', tr('toast.materialSaved'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function generate() {
        if (project === null) return
        if (stats.locked > 0) {
          notify('error', tr('material.lockedHint'))
          return
        }
        if (project.beats.some((beat) => beat.content.trim() !== '') && !(await askConfirm(tr('material.confirmOverwrite')))) return
        setBusy('generate')
        try {
          const data = await api('generateBeats', { id: project.id, material: materialDraft, brief: briefDraft })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          if (nextProject !== undefined) {
            setMaterialDraft(nextProject.material)
            setBriefDraft({ ...nextProject.brief })
            const nextBeat = nextProject.beats.find((beat) => beat.key === selectedKey) ?? nextProject.beats[0]
            if (nextBeat !== undefined) setBeatDraft(cloneBeatDraft(nextBeat))
          }
          setTab('beats')
          notify('ok', format(tr('toast.generated'), { n: data.generation?.missingMaterial?.length ?? 0 }))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function compareGenerate() {
        if (project === null) return
        const settings = state.settings
        if (settings.secondary?.mode === 'none' || settings.secondary === undefined) {
          notify('error', '对比生成需要先在模型设置里选第二个模型。')
          setSettingsOpen(true)
          return
        }
        if (stats.locked > 0) {
          notify('error', tr('material.lockedHint'))
          return
        }
        if (project.beats.some((beat) => beat.content.trim() !== '') && !(await askConfirm(tr('material.confirmOverwrite')))) return
        const started = Date.now()
        const token = ++compareToken.current
        setBusy('compare')
        setCompare({ loading: true, startedAt: started, candidates: [], warnings: [] })
        try {
          const data = await api('compareBeats', { id: project.id, material: materialDraft, brief: briefDraft })
          if (compareToken.current !== token) return
          setCompare({ loading: false, startedAt: started, ...data })
          if (data.warnings?.length > 0) notify('warn', data.warnings.join('；'))
          else notify('ok', `两个模型各出一版，用时 ${Math.round((Date.now() - started) / 1000)} 秒`)
        } catch (err) {
          if (compareToken.current === token) setCompare(null)
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function applyCandidate(candidateId) {
        if (project === null) return
        setBusy('compare-apply')
        try {
          const data = await api('applyBeatsCandidate', { id: project.id, candidateId })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === project.id)
          if (nextProject !== undefined) {
            setMaterialDraft(nextProject.material)
            setBriefDraft({ ...nextProject.brief })
            const nextBeat = nextProject.beats.find((beat) => beat.key === selectedKey) ?? nextProject.beats[0]
            if (nextBeat !== undefined) setBeatDraft(cloneBeatDraft(nextBeat))
          }
          setCompare(null)
          setTab('beats')
          notify('ok', `已采用「${data.generation?.model || '模型'}」这一版 15 拍。`)
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function saveBeat(patchOverride) {
        if (project === null || beatDraft === null) return null
        const patch = { ...beatDraft, ...(patchOverride ?? {}) }
        patch.page = Number(patch.page) || (state.templates.find((item) => item.key === beatDraft.key)?.targetPage ?? 1)
        delete patch.key
        delete patch.locked
        setBusy('save-beat')
        try {
          const data = await api('saveBeat', { id: project.id, key: beatDraft.key, patch })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === beatDraft.key)
          if (saved !== undefined) setBeatDraft(cloneBeatDraft(saved))
          notify('ok', tr('toast.saved'))
          return data
        } catch (err) {
          notify('error', err.message)
          return null
        } finally {
          setBusy(null)
        }
      }

      async function toggleFinal() {
        if (selectedBeat === null) return
        if (selectedBeat.locked) {
          notify('error', tr('beat.lockedBanner'))
          return
        }
        if (selectedBeat.status === 'final') {
          await saveBeat({ status: 'draft' })
          return
        }
        if (beatDraft === null || beatDraft.content.trim() === '') {
          notify('error', tr('beat.finalFirst'))
          return
        }
        await saveBeat({ status: 'final' })
      }

      async function toggleLock() {
        if (project === null || selectedBeat === null) return
        if (!selectedBeat.locked && selectedBeat.status !== 'final') {
          notify('error', tr('beat.lockFirst'))
          return
        }
        if (selectedBeat.locked && !(await askConfirm(tr('beat.confirmUnlock')))) return
        setBusy('lock')
        try {
          const data = await api('lockBeat', { id: project.id, key: selectedBeat.key, locked: !selectedBeat.locked })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === selectedBeat.key)
          if (saved !== undefined) setBeatDraft(cloneBeatDraft(saved))
          notify('ok', selectedBeat.locked ? tr('beat.unlockedToast') : tr('beat.lockedToast'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function lockAll(locked) {
        if (project === null) return
        if (locked && !(await askConfirm(tr('beats.lockAllConfirm')))) return
        if (!locked && !(await askConfirm(tr('beats.unlockAllConfirm')))) return
        setBusy('lock-all')
        try {
          const data = await api('lockAll', { id: project.id, locked })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === selectedBeat?.key)
          if (saved !== undefined) setBeatDraft(cloneBeatDraft(saved))
          notify('ok', locked ? tr('toast.lockedAll') : tr('toast.unlockedAll'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function reviewBeat(mode) {
        if (project === null || selectedBeat === null || beatDraft === null) return
        if (beatDraft.content.trim() === '') {
          notify('error', tr('beat.finalFirst'))
          return
        }
        if (beatDirty) {
          const saved = await saveBeat()
          if (saved === null) return
        }
        setBusy('review')
        try {
          const data = await api('reviewBeat', { id: project.id, key: selectedBeat.key, mode })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === selectedBeat.key)
          if (saved !== undefined) setBeatDraft(cloneBeatDraft(saved))
          if (data.warnings?.length) notify('warn', `${tr('beat.reviewWarnings')}：${data.warnings.join('；')}`)
          else notify('ok', tr('toast.reviewed'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function reviewSheet(mode) {
        if (project === null) return
        setBusy('sheet')
        try {
          const data = await api('reviewSheet', { id: project.id, mode })
          setState(data.state)
          if (data.warnings?.length) notify('warn', data.warnings.join('；'))
          else notify('ok', tr('toast.reviewed'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function saveBeatPatch(key, patch) {
        if (project === null) return null
        const template = state.templates.find((item) => item.key === key)
        const nextPatch = { ...patch }
        if (nextPatch.page !== undefined) {
          nextPatch.page = Number(nextPatch.page) || template?.targetPage || 1
        }
        try {
          const data = await api('saveBeat', { id: project.id, key, patch: nextPatch, source: 'manual' })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === key)
          if (saved !== undefined && key === selectedKey) setBeatDraft(cloneBeatDraft(saved))
          return saved ?? null
        } catch (err) {
          notify('error', err.message)
          return null
        }
      }

      async function previewBatch(payload) {
        if (project === null) return
        setBusy('batch-preview')
        try {
          const data = await api('batchUpdate', { id: project.id, ...payload })
          setBatchPreview({ ...data, instruction: payload.instruction })
          notify('ok', tr('toast.batchPreview'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      function countChanges(proposals) {
        let count = 0
        for (const patch of Object.values(proposals)) count += Object.keys(patch).length
        return count
      }

      async function applyBatch(proposals) {
        if (project === null || batchPreview === null) return
        const count = countChanges(proposals)
        if (count === 0) return
        setBusy('batch-apply')
        try {
          const note = ['AI 批量', batchPreview.model, tr(`batch.op.${batchPreview.op}`), batchPreview.instruction]
            .filter(Boolean)
            .join(' · ')
            .slice(0, 500)
          const data = await api('batchApply', { id: project.id, proposals, note })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const selected = nextProject?.beats.find((beat) => beat.key === selectedKey)
          if (selected !== undefined && proposals[selectedKey] !== undefined) {
            setBeatDraft(cloneBeatDraft(selected))
          }
          setBatchPreview(null)
          setTableReset((value) => value + 1)
          notify('ok', format(tr('toast.batchAppliedFields'), { n: count }))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function applyBatchOne(key, field, value) {
        if (project === null || batchPreview === null) return
        const remainingBefore = countChanges(batchPreview.proposals)
        setBusy('batch-apply-one')
        try {
          const note = ['AI 单格', batchPreview.model, tr(`batch.op.${batchPreview.op}`), tr(`table.${field}`), batchPreview.instruction]
            .filter(Boolean)
            .join(' · ')
            .slice(0, 500)
          const proposals = { [key]: { [field]: value } }
          const data = await api('batchApply', { id: project.id, proposals, note })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === key)
          if (saved !== undefined && key === selectedKey) setBeatDraft(cloneBeatDraft(saved))
          setBatchPreview((previous) => {
            if (previous === null) return previous
            const nextProposals = { ...previous.proposals }
            const patch = { ...(nextProposals[key] ?? {}) }
            delete patch[field]
            if (Object.keys(patch).length === 0) delete nextProposals[key]
            else nextProposals[key] = patch
            const keys = previous.keys.filter((item) => nextProposals[item] !== undefined)
            if (keys.length === 0) return null
            return { ...previous, proposals: nextProposals, keys }
          })
          if (remainingBefore <= 1) setTableReset((value2) => value2 + 1)
          notify('ok', tr('toast.batchOneApplied'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function starVersion(versionId, starred) {
        if (project === null || versionKey === null) return
        setBusy('star')
        try {
          const data = await api('starVersion', { id: project.id, key: versionKey, versionId, starred })
          setState(data.state)
          setVersionData(data.versions)
          notify('ok', starred ? tr('toast.starred') : tr('toast.unstarred'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function openVersions(key) {
        if (project === null) return
        setVersionKey(key)
        setVersionData(null)
        setVersionsOpen(true)
        setBusy('versions')
        try {
          const data = await api('getVersions', { id: project.id, key })
          setVersionData(data)
        } catch (err) {
          notify('error', err.message)
          setVersionsOpen(false)
        } finally {
          setBusy(null)
        }
      }

      async function restoreVersion(versionId) {
        if (project === null || versionKey === null) return
        const key = versionKey
        setBusy('restore')
        try {
          const data = await api('restoreVersion', { id: project.id, key, versionId })
          setState(data.state)
          const nextProject = data.state.projects.find((item) => item.id === data.state.activeProjectId)
          const saved = nextProject?.beats.find((beat) => beat.key === key)
          if (saved !== undefined && key === selectedKey) setBeatDraft(cloneBeatDraft(saved))
          setVersionsOpen(false)
          setTableReset((value) => value + 1)
          notify('ok', tr('toast.versionRestored'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      function openDetail(key) {
        setSelectedKey(key)
        setViewMode('list')
      }

      async function saveSettings(payload) {
        setBusy('settings')
        try {
          const data = await api('saveSettings', payload)
          setState(data.state)
          setSettingsOpen(false)
          notify('ok', tr('toast.settingsSaved'))
        } catch (err) {
          notify('error', err.message)
        } finally {
          setBusy(null)
        }
      }

      async function testModel(payload) {
        try {
          const data = await api('testModel', payload)
          notify('ok', `${tr('settings.testOk')} · ${data.reply}`)
          return data.reply
        } catch (err) {
          notify('error', `${tr('settings.testFail')} · ${err.message}`)
          return null
        }
      }

      async function selectBeat(key) {
        if (key === selectedKey) return
        if (beatDirty && !(await askConfirm(tr('beat.unsavedConfirm'), { confirmLabel: tr('dialog.continue') }))) return
        setSelectedKey(key)
      }

      function toggleCheck(index, checked) {
        setBeatDraft((previous) => {
          if (previous === null) return previous
          const checks = { ...previous.checks }
          if (checked) checks[String(index)] = true
          else delete checks[String(index)]
          return { ...previous, checks }
        })
      }

      if (state === null) {
        return h('div', { className: 'bf-root' }, h('style', null, CSS), error === null ? h(Loading, { tr }) : h(ErrorState, { tr, message: error, onRetry: load }))
      }

      if (project === null) {
        return h(
          'div',
          { className: 'bf-root' },
          h('style', null, CSS),
          h(
            'div',
            { className: 'bf-center' },
            h('div', { className: 'bf-center-mark' }, h(LanternGlyph, { size: 28 })),
            h('h2', null, tr('panel.title')),
            h('p', null, tr('material.empty')),
            h(Button, { onClick: createProject, variant: 'primary', icon: h(PlusIcon, null) }, tr('head.newProject')),
          ),
          ask === null ? null : h(AskDialog, { request: ask, tr, onSettle: settleAsk }),
        )
      }

      return h(
        'div',
        { className: 'bf-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'bf-shell' },
          h(Header, {
            state,
            project,
            stats,
            tr,
            busy,
            onSelectProject: selectProject,
            onNewProject: createProject,
            onRenameProject: renameProject,
            onOpenSettings: () => setSettingsOpen(true),
            onOpenExport: () => setExportOpen(true),
          }),
          h(
            'div',
            { className: 'bf-tabs-row' },
            h(
              'div',
              { className: 'bf-tabs', role: 'tablist', 'aria-label': tr('panel.title') },
              h(
                'button',
                {
                  type: 'button',
                  role: 'tab',
                  'aria-selected': tab === 'material' ? 'true' : 'false',
                  className: 'bf-tab',
                  onClick: () => setTab('material'),
                },
                tr('tabs.material'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  role: 'tab',
                  'aria-selected': tab === 'beats' ? 'true' : 'false',
                  className: 'bf-tab',
                  onClick: () => setTab('beats'),
                },
                tr('tabs.beats'),
              ),
            ),
          ),
          tab === 'material'
            ? h(MaterialView, {
                project,
                tr,
                materialDraft,
                setMaterialDraft,
                briefDraft,
                setBriefDraft,
                materialDirty,
                busy,
                onSaveMaterial: saveMaterial,
                onGenerate: generate,
                onCompare: compareGenerate,
                secondaryLabel: state.modelInfo.secondaryLabel,
                secondaryReady: state.settings.secondary?.mode !== 'none',
                onDeleteProject: deleteProject,
                onRenameProject: renameProject,
                stats,
              })
            : h(BeatsView, {
                state,
                project,
                selectedKey,
                onSelect: selectBeat,
                tr,
                stats,
                beatDraft,
                setBeatDraft,
                beatDirty,
                busy,
                onSave: saveBeat,
                onFinal: toggleFinal,
                onLock: toggleLock,
                onReview: reviewBeat,
                onToggleCheck: toggleCheck,
                onSheet: () => {
                  setSheetOpen(true)
                  if (project.sheetReview === null) reviewSheet(state.settings.reviewMode)
                },
                onLockAll: lockAll,
                viewMode,
                onViewMode: setViewMode,
                onSaveRow: saveBeatPatch,
                onPreview: previewBatch,
                onOpenVersions: openVersions,
                onOpenDetail: openDetail,
                tableReset,
              }),
        ),
        compare !== null
          ? h(CompareBeatsModal, {
              data: compare,
              state,
              project,
              tr,
              onClose: closeCompare,
              onApply: applyCandidate,
              busy: busy === 'compare-apply',
            })
          : null,
        settingsOpen
          ? h(SettingsModal, {
              state,
              tr,
              models,
              modelsBusy,
              onRefreshModels: loadModels,
              onClose: () => setSettingsOpen(false),
              onSave: saveSettings,
              onTest: testModel,
              busy: busy === 'settings',
            })
          : null,
        exportOpen ? h(ExportModal, { state, project, tr, onClose: () => setExportOpen(false), onToast: notify, dirty: materialDirty || beatDirty }) : null,
        sheetOpen
          ? h(SheetReviewModal, {
              project,
              settings: state.settings,
              tr,
              onClose: () => setSheetOpen(false),
              onRun: reviewSheet,
              busy: busy === 'sheet',
            })
          : null,
        batchPreview !== null
          ? h(BatchPreviewModal, {
              preview: batchPreview,
              project,
              state,
              tr,
              onClose: () => setBatchPreview(null),
              onApply: applyBatch,
              onApplyOne: applyBatchOne,
              busy: busy === 'batch-apply' || busy === 'batch-apply-one',
            })
          : null,
        versionsOpen
          ? h(VersionModal, {
              state,
              project,
              beatKey: versionKey,
              data: versionData,
              tr,
              onClose: () => setVersionsOpen(false),
              onRestore: restoreVersion,
              onStar: starVersion,
              busy: busy === 'restore' || busy === 'star',
            })
          : null,
        ask === null ? null : h(AskDialog, { request: ask, tr, onSettle: settleAsk }),
        toast !== null
          ? h(
              'div',
              { className: 'bf-toast', 'data-kind': toast.kind, role: 'status' },
              toast.kind === 'ok' ? h(CheckIcon, null) : h(InfoIcon, null),
              h('span', null, toast.text),
            )
          : null,
      )
    }

    // ── styles ────────────────────────────────────────────────────────────────

    const CSS = `
.bf-root { height: 100%; overflow: auto; box-sizing: border-box; padding: 26px 30px 72px; color: var(--dsw-alias-label-primary); font: inherit; }
.bf-root * { box-sizing: border-box; }
.bf-shell { width: 100%; max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
.bf-head { display: flex; align-items: flex-start; gap: 22px; flex-wrap: wrap; }
.bf-head-main { flex: 1 1 420px; min-width: 0; }
.bf-eyebrow { font-size: 10px; letter-spacing: .18em; color: var(--dsw-alias-label-secondary); text-transform: uppercase; }
.bf-title { margin: 5px 0 0; font-size: 24px; line-height: 1.2; font-weight: 600; letter-spacing: -.02em; }
.bf-subtitle { margin: 7px 0 0; font-size: 12.5px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.bf-project-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 12px; }
.bf-project-label { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.bf-project-select { width: auto; min-width: 150px; max-width: 260px; height: 30px; padding: 0 8px; }
.bf-head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.bf-stats { display: flex; align-items: flex-end; gap: 18px; }
.bf-stat { display: flex; flex-direction: column; gap: 1px; align-items: flex-end; }
.bf-stat strong { font-size: 19px; line-height: 1; font-weight: 600; font-variant-numeric: tabular-nums; }
.bf-stat span { font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.bf-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.bf-tabs-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.bf-tabs { display: flex; gap: 2px; width: fit-content; padding: 3px; border-radius: 10px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 6%, transparent); }
.bf-tab { height: 29px; padding: 0 15px; border: none; border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12.5px; cursor: pointer; }
.bf-tab[aria-selected="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px color-mix(in oklab, var(--dsw-alias-label-primary) 12%, transparent); }
.bf-tab:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.bf-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; padding: 0 11px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; line-height: 1; cursor: pointer; white-space: nowrap; transition: background .12s ease, border-color .12s ease, opacity .12s ease; }
.bf-btn:hover { background: color-mix(in oklab, var(--dsw-alias-label-primary) 7%, var(--dsw-alias-bg-layer-1)); }
.bf-btn:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.bf-btn[disabled] { opacity: .45; cursor: default; }
.bf-btn-primary { border-color: transparent; background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.bf-btn-primary:hover { background: color-mix(in oklab, var(--dsw-alias-brand-primary) 88%, var(--dsw-alias-label-primary)); }
.bf-btn-danger { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in oklab, var(--dsw-alias-state-error-primary) 38%, var(--dsw-alias-border-l1)); }
.bf-btn-ghost { background: transparent; }
.bf-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: none; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.bf-icon-btn:hover { background: color-mix(in oklab, var(--dsw-alias-label-primary) 8%, transparent); color: var(--dsw-alias-label-primary); }
.bf-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; background: var(--dsw-alias-bg-layer-1); padding: 16px 18px; }
.bf-section-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.bf-section-head h2, .bf-section-head h3 { margin: 0; font-size: 15px; font-weight: 600; }
.bf-section-head p { margin: 5px 0 0; font-size: 11.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.bf-muted { color: var(--dsw-alias-label-secondary); font-size: 11.5px; line-height: 1.55; }
.bf-small { font-size: 11px; }
.bf-fineprint { margin: 10px 0 0; font-size: 10.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.bf-input, .bf-textarea, .bf-select { width: 100%; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; padding: 8px 10px; outline: none; }
.bf-input, .bf-select { height: 32px; }
.bf-textarea { min-height: 64px; line-height: 1.65; resize: vertical; }
.bf-input:focus, .bf-textarea:focus, .bf-select:focus { border-color: var(--dsw-alias-brand-primary); }
.bf-input:disabled, .bf-textarea:disabled, .bf-select:disabled { opacity: .62; cursor: default; }
.bf-form { display: flex; flex-direction: column; gap: 12px; }
.bf-form-tight { gap: 9px; }
.bf-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.bf-label { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.bf-label-hint { font-size: 10.5px; color: var(--dsw-alias-label-secondary); opacity: .8; }
.bf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bf-grid-3 { display: grid; grid-template-columns: 110px minmax(0, 1fr) 150px; gap: 12px; align-items: end; }
.bf-page-note { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; padding-bottom: 8px; font-size: 11px; }
.bf-pill { display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 999px; font-size: 10.5px; line-height: 1; white-space: nowrap; background: color-mix(in oklab, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-secondary); }
.bf-pill[data-tone="draft"] { background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 13%, transparent); color: var(--dsw-alias-state-warn-primary); }
.bf-pill[data-tone="final"] { background: color-mix(in oklab, var(--dsw-alias-state-success-primary) 13%, transparent); color: var(--dsw-alias-state-success-primary); }
.bf-pill[data-tone="locked"] { background: color-mix(in oklab, var(--dsw-alias-brand-primary) 14%, transparent); color: var(--dsw-alias-brand-primary); }
.bf-pill[data-tone="empty"] { background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); color: var(--dsw-alias-label-secondary); }
.bf-pill[data-tone="warn"] { background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 13%, transparent); color: var(--dsw-alias-state-warn-primary); }
.bf-banner { display: flex; align-items: center; gap: 7px; padding: 9px 11px; border-radius: 9px; font-size: 11.5px; line-height: 1.5; }
.bf-banner-warn { border: 1px solid color-mix(in oklab, var(--dsw-alias-state-warn-primary) 32%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 8%, transparent); color: var(--dsw-alias-state-warn-primary); }
.bf-banner-lock { border: 1px solid color-mix(in oklab, var(--dsw-alias-brand-primary) 26%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-brand-primary) 7%, transparent); color: var(--dsw-alias-label-primary); }
.bf-material-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; align-items: start; }
.bf-material-card { min-width: 0; }
.bf-material-area { min-height: 400px; margin-top: 14px; font-size: 13.5px; line-height: 1.75; }
.bf-material-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-top: 12px; }
.bf-material-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bf-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.bf-compare-col { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-height: 62vh; overflow: auto; padding: 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.bf-compare-head { display: flex; flex-direction: column; gap: 3px; }
.bf-compare-kicker { font-size: 9.5px; letter-spacing: .12em; color: var(--dsw-alias-label-secondary); }
.bf-compare-head strong { font-size: 13px; font-weight: 600; }
.bf-compare-logline { margin: 0; font-size: 12px; line-height: 1.65; }
.bf-compare-theme { margin: 0; font-size: 11px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.bf-compare-beats { display: flex; flex-direction: column; gap: 6px; }
.bf-compare-beat { padding: 7px 8px; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); }
.bf-compare-beat-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 11.5px; font-weight: 500; }
.bf-compare-beat-head em { font-style: normal; font-size: 10px; color: var(--dsw-alias-label-secondary); }
.bf-compare-oneline { margin: 2px 0 0; font-size: 11px; line-height: 1.5; }
.bf-compare-content { margin: 2px 0 0; font-size: 10.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.bf-compare-loading { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 34px 18px; text-align: center; }
.bf-compare-loading p { margin: 0; font-size: 12px; line-height: 1.6; }
.bf-compare-spinner { width: 30px; height: 30px; color: var(--dsw-alias-brand-primary); animation: bf-spin 1.3s linear infinite; }
@keyframes bf-spin { to { transform: rotate(360deg); } }
.bf-generation { margin-top: 16px; padding-top: 13px; border-top: 1px solid var(--dsw-alias-border-l1); }
.bf-generation-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; font-size: 12px; }
.bf-generation-head strong { font-weight: 500; }
.bf-generation-body { margin-top: 8px; font-size: 11.5px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.bf-generation-body ul { margin: 4px 0 0; padding-left: 18px; }
.bf-generation-label { margin-top: 7px; font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-side { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 12px; }
.bf-side h3 { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
.bf-howto { margin: 8px 0 0; padding-left: 18px; font-size: 11.5px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
.bf-beats-grid { display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 16px; align-items: start; }
.bf-beat-list { position: sticky; top: 12px; max-height: calc(100vh - 130px); overflow: auto; padding: 2px 4px 2px 2px; }
.bf-list-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 0 4px 10px; }
.bf-list-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
.bf-list-head p { margin: 4px 0 0; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.bf-progress { height: 4px; margin: 0 4px 8px; border-radius: 999px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 8%, transparent); overflow: hidden; }
.bf-progress > i { display: block; height: 100%; border-radius: inherit; background: var(--dsw-alias-brand-primary); transition: width .2s ease; }
.bf-act { margin-top: 5px; }
.bf-act-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding: 9px 6px 5px; font-size: 10px; letter-spacing: .12em; color: var(--dsw-alias-label-secondary); text-transform: uppercase; }
.bf-act-head span:last-child { letter-spacing: 0; opacity: .7; }
.bf-beat-row { display: flex; align-items: flex-start; gap: 9px; width: 100%; box-sizing: border-box; padding: 8px 8px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: inherit; text-align: left; cursor: pointer; }
.bf-beat-row:hover { background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); }
.bf-beat-row[data-selected="true"] { border-color: color-mix(in oklab, var(--dsw-alias-brand-primary) 30%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-brand-primary) 8%, transparent); }
.bf-beat-row:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.bf-beat-no { display: inline-flex; align-items: center; justify-content: center; width: 27px; height: 27px; flex: none; border-radius: 7px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 7%, transparent); font-size: 10.5px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary); }
.bf-beat-row[data-selected="true"] .bf-beat-no { background: var(--dsw-alias-brand-primary); color: var(--dsw-alias-bg-base); }
.bf-beat-row-main { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.bf-beat-row-title { display: flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 500; line-height: 1.35; }
.bf-lock-mark { display: inline-flex; color: var(--dsw-alias-brand-primary); }
.bf-beat-row-line { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10.8px; line-height: 1.4; color: var(--dsw-alias-label-secondary); }
.bf-beat-row-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex: none; }
.bf-page-chip { font-size: 10px; font-variant-numeric: tabular-nums; color: var(--dsw-alias-label-secondary); }
.bf-status { font-size: 9.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.bf-status[data-status="draft"] { color: var(--dsw-alias-state-warn-primary); }
.bf-status[data-status="final"] { color: var(--dsw-alias-state-success-primary); }
.bf-status[data-status="locked"] { color: var(--dsw-alias-brand-primary); }
.bf-drift { display: inline-flex; align-items: center; height: 16px; padding: 0 4px; border-radius: 4px; font-size: 9.5px; font-variant-numeric: tabular-nums; background: color-mix(in oklab, var(--dsw-alias-label-primary) 7%, transparent); color: var(--dsw-alias-label-secondary); }
.bf-drift[data-level="warn"] { background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 13%, transparent); color: var(--dsw-alias-state-warn-primary); }
.bf-drift[data-level="bad"] { background: color-mix(in oklab, var(--dsw-alias-state-error-primary) 13%, transparent); color: var(--dsw-alias-state-error-primary); }
.bf-list-foot { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; padding: 12px 4px 4px; border-top: 1px solid var(--dsw-alias-border-l1); margin-top: 10px; }
.bf-list-foot p { flex-basis: 100%; margin: 3px 0 0; }
.bf-detail { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.bf-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.bf-detail-eyebrow { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-detail-title { margin: 4px 0 0; font-size: 23px; line-height: 1.2; font-weight: 600; letter-spacing: -.02em; }
.bf-detail-title small { margin-left: 7px; font-size: 12px; font-weight: 400; letter-spacing: .02em; color: var(--dsw-alias-label-secondary); }
.bf-detail-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
.bf-task { padding: 12px 14px; border: 1px solid color-mix(in oklab, var(--dsw-alias-brand-primary) 18%, var(--dsw-alias-border-l1)); border-radius: 12px; background: color-mix(in oklab, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1)); }
.bf-task-label { font-size: 9.5px; letter-spacing: .13em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-task p { margin: 6px 0 0; font-size: 12.5px; line-height: 1.65; }
.bf-task-questions { margin: 8px 0 0; padding-left: 17px; font-size: 11px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.bf-content-area { min-height: 142px; }
.bf-checks { padding: 13px 15px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.bf-checks .bf-section-head { align-items: baseline; margin-bottom: 4px; }
.bf-checks h3 { margin: 0; font-size: 13px; font-weight: 600; }
.bf-check { display: flex; align-items: flex-start; gap: 8px; padding: 5px 0; font-size: 12px; line-height: 1.55; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.bf-check input { flex: none; margin-top: 2px; accent-color: var(--dsw-alias-brand-primary); }
.bf-savebar { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; padding: 10px 0; border-top: 1px solid var(--dsw-alias-border-l1); border-bottom: 1px solid var(--dsw-alias-border-l1); }
.bf-save-state { flex: 1; min-width: 120px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.bf-review { display: flex; flex-direction: column; gap: 12px; }
.bf-review .bf-section-head { align-items: flex-start; }
.bf-review .bf-section-head h3 { margin: 0; font-size: 14px; }
.bf-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bf-review-card { padding: 14px 15px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 13px; background: var(--dsw-alias-bg-layer-1); }
.bf-review-card[data-secondary="true"] { border-style: dashed; background: var(--dsw-alias-bg-layer-2); }
.bf-review-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.bf-review-kicker { font-size: 8.5px; letter-spacing: .16em; color: var(--dsw-alias-label-secondary); }
.bf-review-model { margin-top: 2px; font-size: 11px; color: var(--dsw-alias-label-secondary); word-break: break-word; }
.bf-review-time { margin-top: 2px; font-size: 9.5px; color: var(--dsw-alias-label-secondary); opacity: .7; }
.bf-score-ring { width: 68px; height: 68px; flex: none; border-radius: 50%; background: conic-gradient(var(--dsw-alias-brand-primary) var(--bf-score), color-mix(in oklab, var(--dsw-alias-label-primary) 9%, transparent) 0); display: grid; place-items: center; }
.bf-score-inner { width: 54px; height: 54px; border-radius: 50%; background: var(--dsw-alias-bg-layer-1); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
.bf-score-inner strong { font-size: 18px; line-height: 1; font-weight: 600; font-variant-numeric: tabular-nums; }
.bf-score-inner span { font-size: 8.5px; color: var(--dsw-alias-label-secondary); }
.bf-dim-list { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
.bf-dim { display: grid; grid-template-columns: 40px minmax(0, 1fr) 20px; gap: 7px; align-items: center; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.bf-dim strong { font-size: 10.5px; font-weight: 500; text-align: right; color: var(--dsw-alias-label-primary); font-variant-numeric: tabular-nums; }
.bf-bar { height: 5px; border-radius: 999px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 8%, transparent); overflow: hidden; }
.bf-bar > i { display: block; height: 100%; border-radius: inherit; }
.bf-review-verdict { margin: 11px 0 0; font-size: 12px; line-height: 1.6; }
.bf-review-block { margin-top: 11px; }
.bf-review-block h4 { margin: 0 0 4px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-review-block ul, .bf-review-block ol { margin: 0; padding-left: 17px; font-size: 11.5px; line-height: 1.6; }
.bf-review-block li + li { margin-top: 3px; }
.bf-review-fix { margin-top: 11px; padding: 9px 10px; border-radius: 8px; background: color-mix(in oklab, var(--dsw-alias-brand-primary) 7%, transparent); }
.bf-review-fix h4 { margin: 0 0 3px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-brand-primary); }
.bf-review-fix p { margin: 0; font-size: 11.5px; line-height: 1.6; }
.bf-act-scores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 12px; }
.bf-act-scores > div { padding: 7px 8px; border-radius: 8px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); display: flex; flex-direction: column; gap: 2px; }
.bf-act-scores span { font-size: 9.5px; color: var(--dsw-alias-label-secondary); }
.bf-act-scores strong { font-size: 18px; font-weight: 600; font-variant-numeric: tabular-nums; }
.bf-center { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 80px 20px; text-align: center; }
.bf-center-inline { padding: 26px 20px; }
.bf-center-mark { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 50%; background: color-mix(in oklab, var(--dsw-alias-brand-primary) 12%, transparent); color: var(--dsw-alias-brand-primary); }
.bf-center h2 { margin: 0; font-size: 16px; font-weight: 600; }
.bf-center p { margin: 0; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.bf-error-text { max-width: 520px; font-size: 11.5px; line-height: 1.6; color: var(--dsw-alias-state-error-primary); }
.bf-empty { padding: 22px 16px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 12px; text-align: center; }
.bf-empty-small { padding: 15px 12px; }
.bf-empty p { margin: 0; font-size: 11.5px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.bf-sheet-review { display: flex; flex-direction: column; gap: 12px; }
.bf-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.bf-mode-card { display: flex; flex-direction: column; gap: 4px; padding: 10px 11px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); cursor: pointer; }
.bf-mode-card[data-active="true"] { border-color: color-mix(in oklab, var(--dsw-alias-brand-primary) 50%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-brand-primary) 6%, var(--dsw-alias-bg-layer-1)); }
.bf-mode-card input { margin: 0; accent-color: var(--dsw-alias-brand-primary); }
.bf-mode-card strong { font-size: 12px; font-weight: 500; }
.bf-mode-card span { font-size: 10.5px; line-height: 1.45; color: var(--dsw-alias-label-secondary); }
.bf-settings-section { margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--dsw-alias-border-l1); display: flex; flex-direction: column; gap: 9px; }
.bf-settings-section h3 { margin: 0; font-size: 13px; font-weight: 600; }
.bf-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bf-code { display: inline-flex; align-items: center; height: 28px; padding: 0 8px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2); font-size: 11px; color: var(--dsw-alias-label-secondary); }
.bf-test-note { padding: 8px 10px; border-radius: 8px; font-size: 11px; line-height: 1.5; background: color-mix(in oklab, var(--dsw-alias-state-success-primary) 9%, transparent); color: var(--dsw-alias-state-success-primary); }
.bf-modal-backdrop { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 20px; background: color-mix(in oklab, #000 46%, transparent); }
.bf-modal { width: min(760px, 100%); max-height: 88vh; display: flex; flex-direction: column; border: 1px solid var(--dsw-alias-border-l1); border-radius: 16px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 24px 80px color-mix(in oklab, #000 38%, transparent); outline: none; }
.bf-modal-wide { width: min(980px, 100%); }
.bf-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px 18px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.bf-modal-head h2 { margin: 0; font-size: 16px; font-weight: 600; }
.bf-modal-head p { margin: 5px 0 0; font-size: 11.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.bf-modal-body { padding: 16px 18px; overflow: auto; display: flex; flex-direction: column; gap: 12px; }
.bf-modal-foot { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; padding: 12px 18px; border-top: 1px solid var(--dsw-alias-border-l1); }
.bf-dialog-text { margin: 0; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-secondary); }
.bf-dialog-input { height: 36px; font-size: 14px; }
.bf-model-row { display: flex; align-items: center; gap: 7px; }
.bf-model-select { flex: 1; min-width: 0; }
.bf-export-pre { margin: 0; padding: 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font: 11.5px/1.7 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; white-space: pre-wrap; word-break: break-word; max-height: 58vh; overflow: auto; }
.bf-toast { position: fixed; right: 24px; bottom: 24px; z-index: 80; display: flex; align-items: flex-start; gap: 7px; max-width: min(460px, calc(100vw - 32px)); padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-overlay); box-shadow: 0 12px 36px color-mix(in oklab, #000 26%, transparent); font-size: 11.5px; line-height: 1.5; }
.bf-toast[data-kind="ok"] { border-color: color-mix(in oklab, var(--dsw-alias-state-success-primary) 32%, var(--dsw-alias-border-l1)); }
.bf-toast[data-kind="error"] { border-color: color-mix(in oklab, var(--dsw-alias-state-error-primary) 38%, var(--dsw-alias-border-l1)); }
.bf-toast[data-kind="warn"] { border-color: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 38%, var(--dsw-alias-border-l1)); }
.bf-toast svg { margin-top: 1px; flex: none; }
.bf-beats-wrap { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.bf-viewbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.bf-view-toggle { display: inline-flex; gap: 2px; padding: 3px; border-radius: 10px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 6%, transparent); }
.bf-view-toggle .bf-btn { height: 28px; border-color: transparent; background: transparent; font-size: 11.5px; }
.bf-view-toggle .bf-btn-primary { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: 0 1px 2px color-mix(in oklab, var(--dsw-alias-label-primary) 12%, transparent); }
.bf-table-wrap { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.bf-table-scroll { overflow: auto; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.bf-table { width: 100%; min-width: 1332px; table-layout: fixed; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.bf-table th, .bf-table td { padding: 10px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); vertical-align: top; text-align: left; }
.bf-table tbody tr:nth-child(even) td { background: color-mix(in oklab, var(--dsw-alias-label-primary) 2.5%, transparent); }
.bf-table tbody tr[data-selected="true"] td { background: color-mix(in oklab, var(--dsw-alias-brand-primary) 6%, transparent); }
.bf-table th { position: sticky; top: 0; z-index: 2; background: var(--dsw-alias-bg-layer-1); font-size: 10.5px; font-weight: 500; color: var(--dsw-alias-label-secondary); letter-spacing: .04em; white-space: nowrap; }
.bf-table tbody tr:last-child td { border-bottom: none; }
.bf-table tbody tr[data-selected="true"] td { background: color-mix(in oklab, var(--dsw-alias-brand-primary) 5%, transparent); }
.bf-table tbody tr[data-locked="true"] td { opacity: .72; }
.bf-table-check { text-align: center; }
.bf-table-check input { accent-color: var(--dsw-alias-brand-primary); }
.bf-table-no-cell { text-align: center; }
.bf-table-no { display: inline-flex; align-items: center; justify-content: center; width: 25px; height: 25px; border-radius: 6px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 7%, transparent); font-size: 10px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.bf-table-beat { min-width: 0; }
.bf-table-title { display: flex; align-items: center; gap: 4px; font-weight: 500; font-size: 12px; line-height: 1.35; }
.bf-table-sub { margin-top: 2px; font-size: 9.5px; color: var(--dsw-alias-label-secondary); }
.bf-table-status { min-width: 0; }
.bf-table-versions { margin-top: 3px; font-size: 9.5px; color: var(--dsw-alias-label-secondary); }
.bf-table-actions { min-width: 0; }
.bf-table-actions-inner { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.bf-table-history { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
.bf-table-stamp { font-size: 9.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.bf-cell-input, .bf-cell-textarea { width: 100%; box-sizing: border-box; border: 1px solid transparent; border-radius: 7px; background: transparent; color: inherit; font: inherit; font-size: 12px; line-height: 1.6; padding: 7px 8px; outline: none; }
.bf-cell-textarea { display: block; overflow: hidden; resize: none; }
.bf-cell-input:hover, .bf-cell-textarea:hover { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); }
.bf-cell-input:focus, .bf-cell-textarea:focus { border-color: var(--dsw-alias-brand-primary); background: var(--dsw-alias-bg-layer-1); }
.bf-cell-input:disabled, .bf-cell-textarea:disabled { opacity: .7; }
.bf-cell-page-wrap { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
.bf-cell-page { width: 58px; }
.bf-cell-content { min-height: 86px; }
.bf-cell-one-line { min-height: 44px; }
.bf-batchbar { display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid color-mix(in oklab, var(--dsw-alias-brand-primary) 20%, var(--dsw-alias-border-l1)); border-radius: 14px; background: color-mix(in oklab, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1)); }
.bf-batchbar-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.bf-batchbar-top strong { font-size: 12px; font-weight: 500; }
.bf-batchbar-top .bf-btn { margin-left: auto; }
.bf-batchbar-controls { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }
.bf-batch-field { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bf-batch-field > span { font-size: 10px; color: var(--dsw-alias-label-secondary); }
.bf-batch-field:not(.bf-batch-instruction) { min-width: 104px; }
.bf-batch-field .bf-select, .bf-batch-field .bf-input { height: 30px; font-size: 11.5px; }
.bf-batch-field .bf-select { width: auto; min-width: 104px; }
.bf-batch-instruction { flex: 1 1 300px; min-width: 240px; }
.bf-batchbar-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.bf-batch-instruction-note { padding: 9px 11px; border-radius: 9px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); font-size: 11.5px; }
.bf-batch-instruction-note span { font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-batch-instruction-note p { margin: 4px 0 0; line-height: 1.55; }
.bf-batch-card { padding: 12px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); }
.bf-batch-card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.bf-batch-card-head strong { font-size: 13px; font-weight: 600; }
.bf-batch-diff { margin-top: 10px; }
.bf-batch-diff-label { margin-bottom: 4px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-batch-diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.bf-batch-diff-side { padding: 8px 9px; border-radius: 8px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); }
.bf-batch-diff-side > span { font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-batch-diff-side p { margin: 4px 0 0; font-size: 11.5px; line-height: 1.55; white-space: pre-wrap; }
.bf-batch-diff-new { background: color-mix(in oklab, var(--dsw-alias-brand-primary) 8%, transparent); }
.bf-batch-note { padding: 9px 11px; border-radius: 9px; background: color-mix(in oklab, var(--dsw-alias-label-primary) 5%, transparent); font-size: 11.5px; }
.bf-batch-note span { font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
.bf-batch-note p { margin: 4px 0 0; line-height: 1.55; }
.bf-version-list { display: flex; flex-direction: column; gap: 8px; }
.bf-version-item { padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
.bf-version-item[data-latest="true"] { border-color: color-mix(in oklab, var(--dsw-alias-brand-primary) 32%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1)); }
.bf-version-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.bf-version-head strong { font-size: 11.5px; font-weight: 500; }
.bf-version-source { margin-top: 3px; }
.bf-version-note { margin: 6px 0 0; font-size: 10.5px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
.bf-version-preview { margin: 6px 0 0; font-size: 11.5px; line-height: 1.55; white-space: pre-wrap; }
.bf-batch-diff-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 5px; }
.bf-batch-diff-check { display: flex; align-items: center; gap: 6px; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); cursor: pointer; }
.bf-batch-diff-check input { accent-color: var(--dsw-alias-brand-primary); }
.bf-diff-text { margin: 4px 0 0; font-size: 11.5px; line-height: 1.7; white-space: pre-wrap; }
.bf-diff-add { background: color-mix(in oklab, var(--dsw-alias-state-success-primary) 22%, transparent); color: var(--dsw-alias-state-success-primary); border-radius: 3px; }
.bf-diff-remove { background: color-mix(in oklab, var(--dsw-alias-state-error-primary) 18%, transparent); color: var(--dsw-alias-state-error-primary); text-decoration: line-through; border-radius: 3px; }
.bf-batch-selected { margin-right: auto; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.bf-version-toolbar { display: flex; align-items: center; gap: 6px; }
.bf-version-stamp-hint { margin: 0; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.bf-version-stamp { font-size: 12px; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.bf-version-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.bf-star-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); cursor: pointer; }
.bf-star-btn:hover { background: color-mix(in oklab, var(--dsw-alias-label-primary) 8%, var(--dsw-alias-bg-layer-1)); }
.bf-star-btn[aria-pressed="true"] { color: var(--dsw-alias-state-warn-primary); border-color: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 40%, var(--dsw-alias-border-l1)); background: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 10%, transparent); }
.bf-version-preview { margin: 6px 0 0; font-size: 11.5px; line-height: 1.55; }
.bf-version-preview strong { display: block; font-weight: 500; }
.bf-version-preview p { margin: 3px 0 0; color: var(--dsw-alias-label-secondary); white-space: pre-wrap; }
@media (max-width: 1040px) {
  .bf-review-grid { grid-template-columns: 1fr; }
  .bf-material-grid { grid-template-columns: minmax(0, 1fr) 300px; }
}
@media (max-width: 900px) {
  .bf-root { padding: 20px 16px 60px; }
  .bf-head-right { width: 100%; align-items: flex-start; }
  .bf-material-grid, .bf-beats-grid { grid-template-columns: 1fr; }
  .bf-side, .bf-beat-list { position: static; max-height: none; }
  .bf-beat-list { max-height: 46vh; }
  .bf-grid-2, .bf-grid-3, .bf-mode-grid { grid-template-columns: 1fr; }
  .bf-compare-grid { grid-template-columns: 1fr; }
  .bf-project-select { max-width: none; flex: 1 1 160px; }
}
@media (max-width: 720px) {
  .bf-batch-diff-grid { grid-template-columns: 1fr; }
  .bf-batchbar-top .bf-btn { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bf-btn, .bf-progress > i, .bf-tab, .bf-beat-row { transition: none; }
}
`

    // ── registration ──────────────────────────────────────────────────────────

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'interactive-beats: zh dictionary')
      ctx.effect(() => ctx.locale.register(NS, 'en', en), 'interactive-beats: en dictionary')
      const t = ctx.locale.bind(NS)

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'interactive-beats',
            order: 7,
            label: () => t('panel.title'),
          },
          LanternGlyph,
        ),
      )

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: 'interactive-beats',
            locale: NS,
          },
          Panel,
        ),
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
