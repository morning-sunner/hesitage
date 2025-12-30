<template>
  <div class="support-settings">
    <div class="panel">
      <!-- Row 1: FAQ -->
      <div class="row row-help">
        <div class="left">
          <div class="left-title">
            <span class="ico" aria-hidden="true" />
            帮助与常见问题
          </div>
          <div class="left-sub">先看 FAQ，解决不了再反馈</div>
        </div>

        <div class="right">
          <!-- ✅ FAQ 加载状态 -->
          <div v-if="faqLoading" class="hint-text">FAQ 加载中…</div>

          <div v-else-if="faqLoadError" class="hint-text error">
            FAQ 加载失败：{{ faqLoadError }}
            <button class="link" type="button" @click="loadFaqs">重试</button>
          </div>

          <!-- ✅ FAQ 列表 -->
          <div v-else class="faq">
            <details v-for="(item, idx) in displayedFaq" :key="item.id ?? idx" class="faq-item">
              <summary class="faq-q">
                <span class="q">Q</span>
                <span class="qt">{{ item.q }}</span>
                <span class="chev" aria-hidden="true">›</span>
              </summary>
              <div class="faq-a">{{ item.a }}</div>
            </details>
          </div>

          <!-- ✅ 展开/收起：只有 FAQ > 2 条才显示 -->
          <div v-if="!faqLoading && !faqLoadError && faq.length > 2" class="faq-actions">
            <button class="link" type="button" @click="toggleAllFaq">
              {{ showAllFaq ? '收起' : '展开全部' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Row 2: Type -->
      <div class="row row-type">
        <div class="left">
          <div class="left-title">
            <span class="ico" aria-hidden="true" />
            反馈类型
          </div>
        </div>

        <div class="right">
          <select class="control" v-model="form.type">
            <option value="功能异常">功能异常</option>
            <option value="页面显示">页面显示</option>
            <option value="数据问题">数据问题</option>
            <option value="体验建议">体验建议</option>
            <option value="其他">其他</option>
          </select>
        </div>
      </div>

      <!-- Row 3: Desc -->
      <div class="row">
        <div class="left">
          <div class="left-title">
            <span class="ico" aria-hidden="true" />
            问题描述
          </div>
          <div class="left-sub">越具体越好（可附截图）</div>
        </div>

        <div class="right">
          <textarea
            class="control textarea"
            v-model="form.desc"
            placeholder="建议按这个格式写：&#10;1) 发生页面：&#10;2) 操作步骤：&#10;3) 实际结果：&#10;4) 期望结果：&#10;（可附截图）"
          />
          <div class="mini">
            邮箱：<span class="mono">{{ currentEmail }}</span>
            <span class="dot">•</span>
            页面：<span class="mono">{{ route.fullPath }}</span>
          </div>
        </div>
      </div>

      <!-- Row 4: Contact -->
      <div class="row">
        <div class="left">
          <div class="left-title">
            <span class="ico" aria-hidden="true" />
            联系方式
          </div>
          <div class="left-sub">可选，方便回访</div>
        </div>

        <div class="right">
          <input class="control" v-model="form.contact" placeholder="QQ / 邮箱 / 微信（任意一种即可）" />
        </div>
      </div>

      <!-- Row 5: Actions -->
      <div class="row row-actions">
        <div class="left">
          <div class="left-title">
            <span class="ico" aria-hidden="true" />
            操作
          </div>
          <div class="left-sub">推荐：复制反馈包</div>
        </div>

        <div class="right">
          <div class="actions">
            <button class="btn secondary" type="button" @click="copyPackage">
              <span class="btn-ico i-copy" aria-hidden="true" />
              复制反馈包
            </button>

            <button class="btn secondary" type="button" @click="downloadPackage">
              <span class="btn-ico i-download" aria-hidden="true" />
              下载反馈包
            </button>

            <button class="btn primary" type="button" :disabled="submitting" @click="submitFeedback">
              <span class="btn-ico i-send" aria-hidden="true" />
              {{ submitting ? '提交中…' : '提交反馈' }}
            </button>
          </div>


          <!-- ✅ 提交成功后在按钮下显示一行（防止你没看到又点） -->
          <div v-if="lastSubmitId" class="submit-status">
            ✅ 已提交：#{{ lastSubmitId }}（{{ lastSubmitAt }}）
          </div>

          <div class="meta">
            <span class="muted">草稿自动保存</span>
            <span class="sep">|</span>
            <button v-if="hasDraft" class="link" type="button" @click="loadDraft">恢复草稿</button>
            <span v-if="hasDraft" class="sep">|</span>
            <button class="link" type="button" @click="clearForm">清空</button>
          </div>

          <div class="tip">建议：写清楚发生页面 + 操作步骤 + 现象/期望（可附截图）</div>
        </div>
      </div>
    </div>

    <!-- ✅ 提示改成“居中弹窗”，非常明显 -->
    <div v-if="toast.show" class="toast-mask" @click="toast.show = false">
      <div class="toast-card" :class="toast.type" @click.stop>
        <div class="toast-title">
          <span v-if="toast.type === 'success'">✅</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else>ℹ️</span>
          {{ toast.type === 'success' ? '提交成功' : toast.type === 'error' ? '出错了' : '提示' }}
        </div>
        <div class="toast-text">{{ toast.text }}</div>
        <button class="toast-btn" type="button" @click="toast.show = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/** ✅ FAQ：从数据库拉取 */
type FaqItem = { id?: string | number; q: string; a: string; sort?: number }

const faq = ref<FaqItem[]>([])
const faqLoading = ref(false)
const faqLoadError = ref('')

async function loadFaqs() {
  faqLoading.value = true
  faqLoadError.value = ''
  try {
    const resp = await fetch('/api/support/faqs')
    const data = await resp.json().catch(() => null)

    if (!resp.ok || !data?.success) {
      throw new Error(data?.error || data?.message || `HTTP ${resp.status}`)
    }

    const list: FaqItem[] = Array.isArray(data.data) ? data.data : []

    // 保险：前端再排一次序 + 以 q 去重（避免数据库误插重复）
    const seen = new Set<string>()
    faq.value = list
      .slice()
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .filter((it) => {
        const key = (it.q || '').trim()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
  } catch (e: any) {
    faqLoadError.value = e?.message || String(e)
    faq.value = []
  } finally {
    faqLoading.value = false
  }
}

/** 默认显示 2 条更清爽 */
const showAllFaq = ref(false)
const displayedFaq = computed(() => {
  const list = faq.value
  return showAllFaq.value ? list : list.slice(0, 2)
})
function toggleAllFaq() {
  showAllFaq.value = !showAllFaq.value
}

type FeedbackForm = { type: string; desc: string; contact: string }
const DRAFT_KEY = 'support_feedback_draft_v1'
const currentEmail = computed(() => localStorage.getItem('userEmail') || '(未填写)')

const form = ref<FeedbackForm>({
  type: '功能异常',
  desc: '',
  contact: ''
})

/** ✅ 草稿：自动保存（内容全空就删除草稿） */
const hasDraft = ref(false)
let saveTimer: number | undefined
watch(
  form,
  () => {
    if (saveTimer) window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      const empty = !form.value.desc.trim() && !form.value.contact.trim()
      if (empty) {
        localStorage.removeItem(DRAFT_KEY)
        hasDraft.value = false
      } else {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form.value))
        hasDraft.value = true
      }
    }, 450)
  },
  { deep: true }
)

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function nowText() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`
}

function detectOS(ua: string) {
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os x/i.test(ua)) return 'macOS'
  if (/android/i.test(ua)) return 'Android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/linux/i.test(ua)) return 'Linux'
  return '未知系统'
}
function detectBrowser(ua: string) {
  if (/edg/i.test(ua)) return 'Edge'
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  if (/firefox/i.test(ua)) return 'Firefox'
  return '未知浏览器'
}

const diagnosticsBasic = ref('')
const diagnosticsFull = ref('')

function buildDiagnostics() {
  const ua = navigator.userAgent || ''
  const lang = navigator.language || 'Unknown'
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
  const screenInfo = `${window.screen.width}x${window.screen.height}`
  const viewport = `${window.innerWidth}x${window.innerHeight}`

  const os = detectOS(ua)
  const browser = detectBrowser(ua)

  const basic = [
    `【时间】${nowText()}`,
    `【页面】${route.fullPath}`,
    `【当前邮箱】${currentEmail.value}`,
    `【系统/浏览器】${os} / ${browser}`,
    `【语言/时区】${lang} / ${tz}`,
    `【屏幕/视口】${screenInfo} / ${viewport}`
  ].join('\n')

  const full = [basic, '', '【高级信息】', `【浏览器 UA】${ua}`].join('\n')

  diagnosticsBasic.value = basic
  diagnosticsFull.value = full
}

function feedbackOnlyText() {
  return [
    `【当前邮箱】${currentEmail.value}`,
    `【反馈类型】${form.value.type}`,
    `【问题描述】`,
    form.value.desc || '(未填写)',
    ``,
    `【联系方式】${form.value.contact || '(未填写)'}`,
    `【时间】${nowText()}`,
    `【页面】${route.fullPath}`
  ].join('\n')
}

function fullPackageText() {
  return [
    `======== 反馈内容 ========`,
    feedbackOnlyText(),
    ``,
    `======== 诊断信息（基础） ========`,
    diagnosticsBasic.value
  ].join('\n')
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板', 'success')
  } catch {
    showToast('复制失败：请手动选中文本复制（Ctrl/Cmd + A，然后 Ctrl/Cmd + C）', 'error')
  }
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showToast('已开始下载文件', 'success')
}

function copyPackage() {
  if (!form.value.desc?.trim()) showToast('建议先填写“问题描述”，再复制反馈包', 'info')
  copyText(fullPackageText())
}
function downloadPackage() {
  downloadTextFile(`feedback_package_${Date.now()}.txt`, fullPackageText())
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return showToast('没有找到草稿', 'info')
  try {
    form.value = JSON.parse(raw)
    showToast('草稿已恢复', 'success')
  } catch {
    showToast('草稿解析失败（格式错误）', 'error')
  }
}

function clearForm() {
  if (!confirm('确认清空当前输入吗？')) return
  form.value = { type: '功能异常', desc: '', contact: '' }
  localStorage.removeItem(DRAFT_KEY)
  hasDraft.value = false
  showToast('已清空', 'success')
}

/** ✅ Toast（居中弹窗） */
const toast = ref<{ show: boolean; text: string; type: 'success' | 'error' | 'info' }>({
  show: false,
  text: '',
  type: 'info'
})
let toastTimer: number | undefined
function showToast(text: string, type: 'success' | 'error' | 'info' = 'info') {
  toast.value = { show: true, text, type }
  if (toastTimer) window.clearTimeout(toastTimer)
  const ms = type === 'success' ? 3200 : 4200
  toastTimer = window.setTimeout(() => (toast.value.show = false), ms)
}

/** resize 更新诊断 */
let raf = 0
function onResize() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => buildDiagnostics())
}

onMounted(() => {
  buildDiagnostics()
  hasDraft.value = !!localStorage.getItem(DRAFT_KEY)
  window.addEventListener('resize', onResize)

  loadFaqs() // ✅ 页面进入就拉取 FAQ
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(raf)
  if (saveTimer) window.clearTimeout(saveTimer)
  if (toastTimer) window.clearTimeout(toastTimer)
})

/** ✅ 提交反馈（防重复提交 + 成功后清空） */
const submitting = ref(false)
const lastSubmitId = ref<number | null>(null)
const lastSubmitAt = ref('')

watch(
  () => form.value.desc,
  () => {
    if (lastSubmitId.value) {
      lastSubmitId.value = null
      lastSubmitAt.value = ''
    }
  }
)

async function submitFeedback() {
  if (submitting.value) return

  if (!form.value.desc?.trim()) {
    showToast('请先填写“问题描述”再提交', 'info')
    return
  }

  buildDiagnostics()

  const userIdRaw = localStorage.getItem('userId')
  const user_id = userIdRaw && !Number.isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null

  // ✅ 没填写邮箱就传 null（不要传 "(未填写)"）
  const email = currentEmail.value && currentEmail.value !== '(未填写)' ? currentEmail.value : null

  const payload = {
    user_id,
    email,
    type: form.value.type,
    desc: form.value.desc,
    contact: form.value.contact || null,
    page: route.fullPath || null,
    diagnostics_basic: diagnosticsBasic.value || null,
    diagnostics_full: diagnosticsFull.value || null,

    // 兼容你之前的字段（后端如果没用也没关系）
    diagnostics: diagnosticsBasic.value || null,
    user_agent: navigator.userAgent || null
  }

  submitting.value = true
  try {
    const resp = await fetch('/api/support/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await resp.json().catch(() => null)

    if (!resp.ok || !data?.success) {
      showToast(`提交失败：${data?.error || data?.message || resp.status}`, 'error')
      return
    }

    const idNum = Number(data.data?.id)
    lastSubmitId.value = Number.isFinite(idNum) ? idNum : null
    lastSubmitAt.value = nowText()

    showToast(`已保存到数据库（#${data.data.id}）`, 'success')

    // ✅ 成功后清空输入，避免你没看到提示又点一次
    form.value = { ...form.value, desc: '', contact: '' }
    localStorage.removeItem(DRAFT_KEY)
    hasDraft.value = false
  } catch (e: any) {
    showToast(`网络错误：${e?.message || e}`, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.support-settings,
.support-settings * {
  box-sizing: border-box;
}
.support-settings {
  width: 100%;
}

/* 不画外框，避免多余边线 */
.panel {
  max-width: 1220px;
  margin: 0 auto;
  padding: 6px 0;
  border: none;
  background: transparent;
}

/* 通用行 */
.row {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  padding: 18px 14px;
}
.row + .row {
  margin-top: 18px;
}

.row-type {
  align-items: center;
}

/* 左侧标题 */
.left {
  padding-left: 8px;
}
.left-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 900;
  color: #3a2618;
  line-height: 1.2;
}
.left-sub {
  margin-top: 10px;
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.5);
}

/* 左侧图标 */
.ico {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: rgba(139, 69, 19, 0.18);
  position: relative;
  flex: 0 0 auto;
}
.ico::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 4px;
  background: rgba(139, 69, 19, 0.55);
}

.right {
  min-width: 0;
}

.row-help .right {
  padding-top: 2px;
}

.faq-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* ✅ FAQ 加载提示 */
.hint-text {
  font-size: 13px;
  line-height: 1.8;
  color: rgba(0, 0, 0, 0.55);
  padding: 10px 0;
}
.hint-text.error {
  color: rgba(200, 60, 60, 0.9);
}

/* FAQ */
.faq {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.faq-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.faq-q {
  list-style: none;
  display: flex;
  gap: 12px;
  cursor: pointer;
  align-items: flex-start;
}
.faq-q::-webkit-details-marker {
  display: none;
}
.q {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  background: rgba(139, 69, 19, 0.88);
  flex: 0 0 auto;
  margin-top: 1px;
}
.qt {
  flex: 1;
  font-size: 14px;
  font-weight: 900;
  color: rgba(58, 38, 24, 0.9);
  line-height: 1.65;
}
.chev {
  color: rgba(139, 69, 19, 0.8);
  font-weight: 900;
  transform: rotate(0deg);
  transition: transform 0.15s ease;
  margin-top: 2px;
}
.faq-item[open] .chev {
  transform: rotate(90deg);
}
.faq-a {
  margin-top: 8px;
  padding-left: 34px;
  font-size: 13px;
  line-height: 1.85;
  color: rgba(0, 0, 0, 0.62);
}

/* 输入框 */
.control {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  padding: 0 16px;
  border: 1px solid rgba(224, 208, 184, 0.95);
  background: rgba(252, 248, 242, 0.92);
  outline: none;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.78);
}
.textarea {
  min-height: 220px;
  height: auto;
  padding: 14px 16px;
  line-height: 1.9;
  resize: vertical;
}
.control:focus {
  border-color: rgba(194, 158, 109, 0.95);
  box-shadow: 0 0 0 3px rgba(194, 158, 109, 0.16);
}

.mini {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.6;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
.dot {
  margin: 0 10px;
  opacity: 0.6;
}

/* 按钮区 */
.actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 50px;
  padding: 0 26px;
  min-width: 150px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  border: 1px solid transparent;
  user-select: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
.btn.primary {
  background: rgba(139, 69, 19, 0.88);
  color: #fff;
  border-color: rgba(139, 69, 19, 0.88);
  box-shadow: 0 14px 22px rgba(139, 69, 19, 0.18);
}
.btn.primary:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}
.btn.primary:active {
  transform: translateY(0px);
  box-shadow: 0 10px 18px rgba(139, 69, 19, 0.16);
}
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  filter: none !important;
}

/* 提交成功状态行 */
.submit-status {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 900;
  color: rgba(58, 38, 24, 0.9);
  background: rgba(139, 69, 19, 0.08);
  border: 1px solid rgba(139, 69, 19, 0.16);
  padding: 10px 12px;
  border-radius: 14px;
}

/* 文字链接 */
.link {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  color: rgba(139, 69, 19, 0.88);
}
.link:hover {
  text-decoration: underline;
}

.meta {
  margin-top: 14px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.muted {
  color: rgba(0, 0, 0, 0.5);
}
.sep {
  opacity: 0.45;
}

.tip {
  margin-top: 14px;
  font-size: 12.5px;
  line-height: 1.8;
  color: rgba(139, 69, 19, 0.72);
}

/* 小图标 */
.btn-ico {
  width: 18px;
  height: 18px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.btn-ico.i-copy {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm4 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h12v14z'/%3E%3C/svg%3E");
}
.btn-ico.i-download {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M5 20h14v-2H5v2zM12 2v12l4-4 1.41 1.41L12 17.83l-5.41-5.42L8 10l4 4V2h0z'/%3E%3C/svg%3E");
}
.btn-ico.i-send {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M2 21l21-9L2 3v7l15 2-15 2v7z'/%3E%3C/svg%3E");
}

/* ✅ 居中弹窗 Toast */
.toast-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.16);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
  z-index: 9999;
}
.toast-card {
  width: min(520px, calc(100vw - 28px));
  border-radius: 18px;
  padding: 16px 16px 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
}
.toast-title {
  font-size: 15px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast-text {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(0, 0, 0, 0.72);
}
.toast-btn {
  margin-top: 14px;
  width: 100%;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(139, 69, 19, 0.28);
  background: rgba(139, 69, 19, 0.1);
  font-weight: 900;
  cursor: pointer;
}
.toast-card.success {
  border-color: rgba(60, 160, 110, 0.22);
}
.toast-card.error {
  border-color: rgba(200, 60, 60, 0.22);
}
.toast-card.info {
  border-color: rgba(194, 158, 109, 0.28);
}

/* 响应式 */
@media (max-width: 980px) {
  .row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px 10px;
  }
  .row + .row {
    margin-top: 14px;
  }
  .left {
    padding-left: 2px;
  }
  .left-title {
    font-size: 16px;
  }
  .btn {
    min-width: 0;
    width: auto;
  }
}

/* =========================
   ✅ Support 页面美化 v2（粘到 style 最底部）
   目标：不贴边、不挤、不扎眼、排版更像“系统设置”
   ========================= */

.support-settings {
  --accent: rgba(139, 69, 19, 0.9);
  --accent-weak: rgba(139, 69, 19, 0.10);

  --text: rgba(45, 28, 18, 0.92);
  --muted: rgba(0, 0, 0, 0.55);

  --card: rgba(255, 255, 255, 0.86);
  --soft: rgba(0, 0, 0, 0.035);

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 面板别“裸奔”：给一点内边距但不画外框 */
.panel {
  max-width: 1220px;
  margin: 0 auto;
  padding: 8px 0 2px;
}

/* ✅ 每一行做成“柔和卡片” */
.row {
  background: var(--card) !important;
  border: 0 !important;
  border-radius: 20px !important;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.06) !important;

  padding: 22px 20px !important;
  gap: 26px !important;
  align-items: start !important;
}
.row + .row {
  margin-top: 14px !important;
}

/* 左侧标题：别太粗暴，做成稳定层级 */
.left-title {
  font-size: 16px !important;
  font-weight: 850 !important;
  color: var(--text) !important;
  letter-spacing: 0.2px;
}
.left-sub {
  margin-top: 6px !important;
  font-size: 12.5px !important;
  line-height: 1.6 !important;
  color: var(--muted) !important;
}

/* 标题图标：别用“方块里再方块”，改成圆点（更像设置页） */
.ico {
  width: 12px !important;
  height: 12px !important;
  border-radius: 999px !important;
  background: rgba(139, 69, 19, 0.18) !important;
  box-shadow: inset 0 0 0 2px rgba(139, 69, 19, 0.26) !important;
}
.ico::after {
  content: none !important;
}

/* ✅ FAQ：别用上下横线堆叠，改成“条目卡片” */
.faq {
  border-top: 0 !important;
  display: grid !important;
  gap: 10px !important;
}
.faq-item {
  border: 0 !important;
  background: var(--soft) !important;
  border-radius: 16px !important;
  padding: 0 !important;
  overflow: hidden;
}
.faq-q {
  padding: 12px 14px !important;
  align-items: center !important;
}
.q {
  width: 20px !important;
  height: 20px !important;
  font-size: 11px !important;
  margin-top: 0 !important;
  background: rgba(139, 69, 19, 0.82) !important;
}
.qt {
  font-size: 14px !important;
  font-weight: 850 !important;
  line-height: 1.55 !important;
}
.chev {
  margin-top: 0 !important;
}
.faq-a {
  margin-top: 0 !important;
  padding: 0 14px 12px 46px !important;
  color: rgba(0, 0, 0, 0.62) !important;
}

/* ✅ 输入控件：更“干净”，别硬边框 */
.control {
  border: 1px solid rgba(0, 0, 0, 0.07) !important;
  background: rgba(255, 255, 255, 0.92) !important;
  height: 50px !important;
  border-radius: 16px !important;
  padding: 0 16px !important;
}
.textarea {
  min-height: 240px !important;
  padding: 16px 16px !important;
  line-height: 1.85 !important;
}
.control::placeholder {
  color: rgba(0, 0, 0, 0.34) !important;
}

/* ✅ textarea 下方 mini：做成信息块，别用“点+分隔符” */
.mini {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;

  margin-top: 10px !important;
  padding: 10px 12px !important;
  border-radius: 14px !important;
  background: var(--soft) !important;

  font-size: 12px !important;
  color: rgba(0, 0, 0, 0.56) !important;
}
.dot {
  display: none !important;
}

/* ✅ 三按钮：用网格对齐（你截图里最需要这个） */
.actions {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 12px !important;
  align-items: stretch !important;
}

/* 按钮整体：小一点、阴影轻一点 */
.btn {
  width: 100% !important;
  min-width: 0 !important;

  height: 48px !important;
  border-radius: 14px !important;
  padding: 0 16px !important;

  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06) !important;
  transform: none !important;
}

/* 二级按钮：复制/下载（浅色，不扎眼） */
.btn.secondary {
  background: rgba(139, 69, 19, 0.08) !important;
  color: rgba(109, 56, 17, 0.95) !important;
  border: 1px solid rgba(139, 69, 19, 0.18) !important;
}
.btn.secondary:hover {
  background: rgba(139, 69, 19, 0.12) !important;
  transform: translateY(-1px) !important;
}

/* 主按钮：提交（保留主色，但别像广告） */
.btn.primary {
  background: rgba(139, 69, 19, 0.86) !important;
  border-color: rgba(139, 69, 19, 0.28) !important;
  box-shadow: 0 12px 22px rgba(139, 69, 19, 0.14) !important;
}
.btn.primary:hover {
  filter: brightness(0.98) !important;
  transform: translateY(-1px) !important;
}

/* ✅ 二级按钮图标换成棕色（你原来是白色，会“发虚”） */
.btn-ico { width: 16px !important; height: 16px !important; }

.btn.secondary .btn-ico.i-copy {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%236d3811'%3E%3Cpath d='M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm4 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h12v14z'/%3E%3C/svg%3E") !important;
}
.btn.secondary .btn-ico.i-download {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%236d3811'%3E%3Cpath d='M5 20h14v-2H5v2zM12 2v12l4-4 1.41 1.41L12 17.83l-5.41-5.42L8 10l4 4V2h0z'/%3E%3C/svg%3E") !important;
}

/* meta / tip：都做成信息块，别散落小字 */
.meta {
  margin-top: 12px !important;
  padding: 10px 12px !important;
  border-radius: 14px !important;
  background: var(--soft) !important;
  gap: 10px !important;
}
.sep { display: none !important; }

.tip {
  margin-top: 10px !important;
  padding: 10px 12px !important;
  border-radius: 14px !important;
  background: rgba(139, 69, 19, 0.06) !important;
  color: rgba(109, 56, 17, 0.78) !important;
}

/* 提交成功提示：也别硬边框，走信息块风格 */
.submit-status {
  border: 0 !important;
  background: rgba(60, 160, 110, 0.10) !important;
  color: rgba(25, 110, 70, 0.92) !important;
  box-shadow: none !important;
}

/* 小屏：按钮变一列 */
@media (max-width: 720px) {
  .actions {
    grid-template-columns: 1fr !important;
  }
}


/* =========================
   ✅ Toast 弹窗美化（覆盖版）
   直接放到 <style scoped> 最底部
   ========================= */

/* 遮罩：居中 + 轻模糊 */
.toast-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;          /* ✅ 居中 */
  justify-content: center;
  padding: 24px;

  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  animation: toastMaskIn 0.16s ease-out;
}

@keyframes toastMaskIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* 卡片：更“系统设置”风格 */
.toast-card {
  width: min(520px, calc(100vw - 32px));
  border-radius: 22px;
  padding: 16px 16px 14px;

  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.06);

  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.20),
    0 10px 22px rgba(0, 0, 0, 0.08);

  transform-origin: center;
  animation: toastCardIn 0.18s ease-out;
}

@keyframes toastCardIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}


.toast-title {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 16px;
  font-weight: 900;
  color: rgba(45, 28, 18, 0.92);
  letter-spacing: 0.2px;

  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.toast-title > span:first-child {
  width: 30px;
  height: 30px;
  border-radius: 12px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 16px;
  line-height: 1;
  background: rgba(139, 69, 19, 0.10);
  border: 1px solid rgba(139, 69, 19, 0.16);
}

.toast-text {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;

  font-size: 14px;
  line-height: 1.75;
  color: rgba(0, 0, 0, 0.70);

  background: rgba(0, 0, 0, 0.035);
}


.toast-btn {
  margin-top: 14px;
  margin-left: auto;        /* ✅ 靠右 */
  width: auto;              /* ✅ 不再 100% */
  height: 40px;
  padding: 0 18px;
  border-radius: 14px;

  border: 1px solid rgba(139, 69, 19, 0.20);
  background: rgba(139, 69, 19, 0.10);
  color: rgba(109, 56, 17, 0.95);

  font-weight: 900;
  cursor: pointer;

  transition: transform 0.12s ease, background 0.12s ease, box-shadow 0.12s ease;
}
.toast-btn:hover {
  background: rgba(139, 69, 19, 0.14);
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}
.toast-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.toast-card.success {
  border-color: rgba(60, 160, 110, 0.18);
}
.toast-card.success .toast-title > span:first-child {
  background: rgba(60, 160, 110, 0.12);
  border-color: rgba(60, 160, 110, 0.20);
}

.toast-card.error {
  border-color: rgba(200, 60, 60, 0.18);
}
.toast-card.error .toast-title > span:first-child {
  background: rgba(200, 60, 60, 0.12);
  border-color: rgba(200, 60, 60, 0.20);
}

.toast-card.info {
  border-color: rgba(139, 69, 19, 0.16);
}

@media (max-width: 480px) {
  .toast-card { padding: 14px 14px 12px; border-radius: 20px; }
  .toast-title { font-size: 15px; }
  .toast-title > span:first-child { width: 28px; height: 28px; border-radius: 10px; }
}

</style>
