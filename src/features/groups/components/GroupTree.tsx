import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, FolderTree, Folder } from 'lucide-react'
import { cn } from '@/common/utils/cn'
import type { Group } from '@/features/groups/group.types'

interface TreeNode extends Group {
  childNodes: TreeNode[]
}

function buildTree(groups: Group[]): TreeNode[] {
  const nodeById = new Map<string, TreeNode>(groups.map((g) => [g.groupId, { ...g, childNodes: [] }]))
  const roots: TreeNode[] = []

  for (const node of nodeById.values()) {
    if (node.parentId && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId)!.childNodes.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function TreeRow({ node, depth, realmId }: { node: TreeNode; depth: number; realmId: string }) {
  const [expanded, setExpanded] = useState(true)
  const navigate = useNavigate()
  const hasChildren = node.childNodes.length > 0

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm hover:bg-surface-alt"
        style={{ paddingLeft: depth * 20 + 8 }}
        onClick={() => navigate(`/r/${realmId}/groups/${node.groupId}`)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            className="rounded p-0.5 text-text-secondary hover:bg-surface-alt"
          >
            {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
        ) : (
          <span className="w-4.5" />
        )}
        {hasChildren ? (
          <FolderTree className="size-4 text-primary" />
        ) : (
          <Folder className="size-4 text-text-secondary" />
        )}
        <span className="text-text">{node.name}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.childNodes.map((child) => (
            <TreeRow key={child.groupId} node={child} depth={depth + 1} realmId={realmId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function GroupTree({ groups, realmId }: { groups: Group[]; realmId: string }) {
  const tree = useMemo(() => buildTree(groups), [groups])

  return (
    <div className={cn('rounded-2xl border border-border bg-surface p-2')}>
      {tree.map((root) => (
        <TreeRow key={root.groupId} node={root} depth={0} realmId={realmId} />
      ))}
    </div>
  )
}
