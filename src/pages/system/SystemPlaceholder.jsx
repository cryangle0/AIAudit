// 系统设置 - 角色/权限/备份占位页
import { Construction } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { PAGE_META } from '../../core/menuStructure.js'

const TIPS = {
  'sys-roles': '角色管理：财务/运营/管理员等角色，与「权限管理」配合使用。需后端支持，前端先占位。',
  'sys-perms': '权限管理：基于角色的功能/数据权限控制（菜单可见性、按钮权限、行级权限）。需后端支持。',
  'sys-backup': '数据备份：当前所有数据存于浏览器 localStorage。生产环境建议导出 JSON 定期归档。可一键导出全部数据。'
}

export default function SystemPlaceholder({ pageId, onExportAllData }) {
  const meta = PAGE_META[pageId]
  return (
    <div className="rec-page">
      <PageHeader title={meta?.label || '系统设置'} subtitle={meta?.desc}/>
      <EmptyState
        icon="build"
        title="功能建设中"
        desc={TIPS[pageId] || '该模块需要服务端配套，前端已预留入口。'}
        action={pageId === 'sys-backup' && onExportAllData ? (
          <button className="rec-btn primary" onClick={onExportAllData}>
            一键导出全部本地数据 (JSON)
          </button>
        ) : null}/>
    </div>
  )
}
