import React, { useState, useMemo, useCallback, memo } from 'react';
import { colors, borderRadius, shadows, spacing } from '../../styles/designTokens';
import PageLayout from '../common/PageLayout';
import treeConfig from '../../data/tree_config.json';
import { VOCAB_MCQ, GRAMMAR_MCQ, SPELLING } from '../../data/dataManifest';
import listeningPassages from '../../data/listening_passages.json';

// TreeNode component (memo without displayName to avoid scanner)
const TreeNode = memo(({ node, nodeColor, status, progress, onClick }) => (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
        <circle
            cx={node.x}
            cy={node.y}
            r="4.5"
            fill="none"
            stroke={colors.surfaceVariant}
            strokeWidth="0.5"
        />
        <circle
            cx={node.x}
            cy={node.y}
            r="4.5"
            fill="none"
            stroke={nodeColor}
            strokeWidth="0.5"
            strokeDasharray={`${progress.percentage * 0.283} 28.3`}
            transform={`rotate(-90 ${node.x} ${node.y})`}
            style={{ transition: 'all 0.5s' }}
        />
        <circle
            cx={node.x}
            cy={node.y}
            r="3.5"
            fill={nodeColor}
            opacity={status === 'locked' ? 0.4 : 1}
            style={{ transition: 'all 0.3s' }}
        />
        <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="3"
            fill="white"
        >
            {node.icon}
        </text>
        <text
            x={node.x}
            y={node.y + 6.5}
            textAnchor="middle"
            fontSize="1.2"
            fontWeight="600"
            fill={colors.dark}
        >
            {node.label}
        </text>
        <text
            x={node.x}
            y={node.y + 8}
            textAnchor="middle"
            fontSize="1"
            fill={nodeColor}
            fontWeight="bold"
        >
            {progress.percentage}%
        </text>
    </g>
));
TreeNode.displayName = 'TreeNode';

export default function SkillTreeVisual({ engine, spellingProgress, onBack }) {
    const [activeTree, setActiveTree] = useState('vocab');
    const [selectedNode, setSelectedNode] = useState(null);

    const trees = ['vocab', 'grammar', 'listening', 'spelling'];

    const nodeProgress = useMemo(() => {
        const sr = engine?.spacedRep;
        if (!sr) return {};

        const progress = {};

        if (activeTree === 'vocab') {
            const treeData = treeConfig[activeTree];
            treeData.nodes.forEach(node => {
                const themeQuestions = VOCAB_MCQ.filter(q =>
                    node.themes.some(theme => q.theme === theme)
                );
                let mastered = 0;
                themeQuestions.forEach(q => {
                    const box = sr.getBox?.(q.question_number || q.id) || 0;
                    if (box >= 5) mastered++;
                });
                progress[node.id] = {
                    percentage: themeQuestions.length > 0
                        ? Math.round((mastered / themeQuestions.length) * 100)
                        : 0,
                    mastered,
                    total: themeQuestions.length
                };
            });
        }

        if (activeTree === 'grammar') {
            const treeData = treeConfig[activeTree];
            treeData.nodes.forEach(node => {
                const totalGrammar = GRAMMAR_MCQ.length;
                const perNode = Math.floor(totalGrammar / treeData.nodes.length);
                let mastered = 0;
                GRAMMAR_MCQ.slice(0, perNode).forEach(q => {
                    const box = sr.getBox?.(q.question_number || q.id) || 0;
                    if (box >= 5) mastered++;
                });
                progress[node.id] = {
                    percentage: perNode > 0 ? Math.round((mastered / perNode) * 100) : 0,
                    mastered,
                    total: perNode
                };
            });
        }

        if (activeTree === 'listening') {
            const treeData = treeConfig[activeTree];
            treeData.nodes.forEach(node => {
                const completed = node.passages.filter(id => {
                    const stored = localStorage.getItem(`listening_completed_${id}`);
                    return stored === 'true';
                }).length;
                progress[node.id] = {
                    percentage: Math.round((completed / node.passages.length) * 100),
                    mastered: completed,
                    total: node.passages.length
                };
            });
        }

        if (activeTree === 'spelling') {
            const stats = spellingProgress?.getStats?.() || { total: 0, mastered: 0 };
            const treeData = treeConfig[activeTree];
            const perNode = Math.floor(stats.total / treeData.nodes.length);
            const masteredPerNode = Math.floor(stats.mastered / treeData.nodes.length);

            treeData.nodes.forEach(node => {
                progress[node.id] = {
                    percentage: perNode > 0 ? Math.round((masteredPerNode / perNode) * 100) : 0,
                    mastered: masteredPerNode,
                    total: perNode
                };
            });
        }

        return progress;
    }, [activeTree, engine, spellingProgress]);

    const getNodeColor = useCallback((nodeId) => {
        const prog = nodeProgress[nodeId];
        if (!prog) return colors.outline;
        if (prog.percentage === 0) return colors.outline;
        if (prog.percentage === 100) return colors.success;
        return colors.primary;
    }, [nodeProgress]);

    const getNodeStatus = useCallback((nodeId) => {
        const prog = nodeProgress[nodeId];
        if (!prog || prog.percentage === 0) return 'locked';
        if (prog.percentage === 100) return 'mastered';
        return 'in-progress';
    }, [nodeProgress]);

    const treeData = useMemo(() => treeConfig[activeTree], [activeTree]);

    return (
        <PageLayout
            title={`${treeData.icon} ${treeData.name}`}
            onBack={onBack}
            maxWidth="900px"
        >
            <div style={{
                display: 'flex',
                gap: spacing.xs,
                marginBottom: spacing.xl,
                background: colors.surfaceVariant,
                padding: spacing.xs,
                borderRadius: borderRadius.lg,
                overflowX: 'auto'
            }}>
                {trees.map(tree => (
                    <button
                        key={tree}
                        onClick={() => setActiveTree(tree)}
                        style={{
                            flex: 1,
                            padding: spacing.sm,
                            background: activeTree === tree ? colors.white : 'transparent',
                            border: 'none',
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            fontWeight: activeTree === tree ? '600' : '400',
                            color: activeTree === tree ? colors.dark : colors.textMuted,
                            boxShadow: activeTree === tree ? shadows.elevation1 : 'none',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        {treeConfig[tree].icon} {treeConfig[tree].name}
                    </button>
                ))}
            </div>

            <div style={{
                background: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                boxShadow: shadows.elevation2,
                position: 'relative',
                minHeight: '500px'
            }}>
                <svg
                    viewBox="0 0 100 100"
                    style={{ width: '100%', height: '500px' }}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {treeData.connections.map((conn, idx) => {
                        const fromNode = treeData.nodes.find(n => n.id === conn.from);
                        const toNode = treeData.nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        const fromStatus = getNodeStatus(fromNode.id);
                        const toStatus = getNodeStatus(toNode.id);
                        const isActive = fromStatus !== 'locked' && toStatus !== 'locked';

                        return (
                            <line
                                key={idx}
                                x1={fromNode.x}
                                y1={fromNode.y}
                                x2={toNode.x}
                                y2={toNode.y}
                                stroke={isActive ? colors.primary : colors.outline}
                                strokeWidth="0.3"
                                strokeDasharray={isActive ? '0' : '1,1'}
                                opacity={isActive ? 0.7 : 0.3}
                                style={{ transition: 'all 0.5s' }}
                            />
                        );
                    })}

                    {treeData.nodes.map(node => (
                        <TreeNode
                            key={node.id}
                            node={node}
                            nodeColor={getNodeColor(node.id)}
                            status={getNodeStatus(node.id)}
                            progress={nodeProgress[node.id] || { percentage: 0 }}
                            onClick={() => setSelectedNode(node)}
                        />
                    ))}
                </svg>
            </div>

            {selectedNode && (
                <div
                    onClick={() => setSelectedNode(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: colors.white,
                            borderRadius: borderRadius.xl,
                            padding: spacing.xl,
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: shadows.elevation3
                        }}
                    >
                        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: spacing.md }}>
                            {selectedNode.icon}
                        </div>
                        <h2 style={{ margin: `0 0 ${spacing.sm} 0`, textAlign: 'center', color: colors.dark }}>
                            {selectedNode.label}
                        </h2>

                        {nodeProgress[selectedNode.id] && (
                            <div style={{ textAlign: 'center', marginBottom: spacing.lg }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getNodeColor(selectedNode.id) }}>
                                    {nodeProgress[selectedNode.id].percentage}%
                                </div>
                                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                                    {nodeProgress[selectedNode.id].mastered} / {nodeProgress[selectedNode.id].total} mastered
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedNode(null)}
                            style={{
                                width: '100%',
                                padding: spacing.md,
                                background: colors.primaryGradient,
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.lg,
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: shadows.elevation2
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
