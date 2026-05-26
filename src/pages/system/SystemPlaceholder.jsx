// 系统设置 - 角色/权限/备份占位页（含演示数据）
import { Sparkles, Shield, Users, Database, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { PAGE_META } from '../../core/menuStructure.js'
import './system.css'
import '../pages.css'

const DEMO_ROLES = [
  { id: 'r1', name: '超级管理员', desc: '系统全部权限',     userCount: 1, perms: ['全部'] },
  { id: 'r2', name: '财务主管',   desc: '审核所有报表与变更', userCount: 2, perms: ['对账', '报表查看', '审核', '导出'] },
  { id: 'r3', name: '财务',       desc: '日常对账与录入',     userCount: 5, perms: ['对账', '商品成本', '数据归集', '导出'] },
  { id: 'r4', name: '运营',       desc: '查看店铺利润',       userCount: 8, perms: ['店铺利润查看', '商品利润查看'] },
  { id: 'r5', name: '只读',       desc: '只允许查看，不可修改', userCount: 12, perms: ['查看'] }
]

const DEMO_PERMS = [
  { module: '商品管理', resources: '商品资料/商品成本/成本修改记录', actions: '增删改查/导入/导出',
    rules: '财务可改成本，运营只读' },
  { module: '订单管理', resources: '账单/聚水潭', actions: '上传/解析/对账',
    rules: '财务/运营都可上传，仅财务可对账' },
  { module: '汇率管理', resources: '汇率维护', actions: '增删改查',
    rules: '仅财务主管可改' },
  { module: '数据中心', resources: '7 张报表', actions: '查看/导出',
    rules: '按店铺数据权限控制' },
  { module: '系统设置', resources: '角色/权限/备份', actions: '增删改查',
    rules: '仅超级管理员' }
]

const DEMO_BACKUPS = [
  { id: 'b1', name: '2026-01 月度归档', type: '自动', size: '2.3 MB', createdAt: '2026-02-01 00:05',
    status: '成功', tables: '商品/成本/账单/汇率' },
  { id: 'b2', name: '2025-12 月度归档', type: '自动', size: '2.1 MB', createdAt: '2026-01-01 00:05',
    status: '成功', tables: '商品/成本/账单/汇率' },
  { id: 'b3', name: '手动备份-成本调整前', type: '手动', size: '1.8 MB', createdAt: '2026-01-15 14:32',
    status: '成功', tables: '商品/成本' },
  { id: 'b4', name: '2025-11 月度归档', type: '自动', size: '1.9 MB', createdAt: '2025-12-01 00:05',
    status: '成功', tables: '商品/成本/账单/汇率' }
]

export default function SystemPlaceholder({ pageId, onExportAllData }) {
  const meta = PAGE_META[pageId]
  return (
    <div className="rec-page">
      <PageHeader title={meta?.label || '系统设置'} subtitle={meta?.desc}/>

      <div className="rec-demo-banner">
        <Sparkles size={14}/>
        <span>当前显示演示数据。本模块需后端配套支持完整功能（如真实用户/权限校验/定时备份）。</span>
      </div>

      {pageId === 'sys-roles' && <RolesView/>}
      {pageId === 'sys-perms' && <PermsView/>}
      {pageId === 'sys-backup' && <BackupView onExportAllData={onExportAllData}/>}
    </div>
  )
}

function RolesView() {
  return (
    <>
      <div className="rec-toolbar">
        <span className="rec-spacer"/>
        <button className="rec-btn" disabled><Users size={14}/> 新增角色</button>
      </div>
      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr><th>角色名称</th><th>说明</th><th>关联用户数</th><th>权限范围</th></tr>
          </thead>
          <tbody>
            {DEMO_ROLES.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td className="rec-muted">{r.desc}</td>
                <td>{r.userCount} 人</td>
                <td>{r.perms.map(p => <span key={p} className="rec-tag-fee">{p}</span>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function PermsView() {
  return (
    <div className="rec-table-card">
      <table className="rec-data-table">
        <thead>
          <tr>
            <th>模块</th><th>资源</th><th>动作</th><th>权限规则</th>
          </tr>
        </thead>
        <tbody>
          {DEMO_PERMS.map(p => (
            <tr key={p.module}>
              <td><strong>{p.module}</strong></td>
              <td className="rec-muted">{p.resources}</td>
              <td>{p.actions}</td>
              <td>{p.rules}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BackupView({ onExportAllData }) {
  return (
    <>
      <div className="rec-toolbar">
        <span className="rec-spacer"/>
        {onExportAllData && (
          <button className="rec-btn primary" onClick={onExportAllData}>
            <Download size={14}/> 立即备份当前数据
          </button>
        )}
      </div>
      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>备份名称</th><th>类型</th><th>大小</th>
              <th>包含表</th><th>状态</th><th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_BACKUPS.map(b => (
              <tr key={b.id}>
                <td><strong>{b.name}</strong></td>
                <td>{b.type === '自动'
                  ? <span className="rec-tag-pos">自动</span>
                  : <span className="rec-tag-fee">手动</span>}</td>
                <td>{b.size}</td>
                <td className="rec-muted">{b.tables}</td>
                <td><span className="rec-tag-pos">{b.status}</span></td>
                <td className="rec-muted">{b.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
