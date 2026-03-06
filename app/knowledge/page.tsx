/**
 * Knowledge Base Page
 * 企业知识库管理页面
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface KnowledgeFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  meridian_type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
  sync_status: "uploading" | "indexing" | "synced" | "failed";
  word_count: number | null;
  created_at: string;
}

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMeridian, setSelectedMeridian] = useState<string>("tian");

  // 模拟加载初始数据
  useState(() => {
    const mockFiles: KnowledgeFile[] = [
      {
        id: "1",
        file_name: "2024年Q3市场战略复盘报告.pdf",
        file_type: "application/pdf",
        file_size: 2048000,
        meridian_type: "tian",
        sync_status: "synced",
        word_count: 5000,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        file_name: "品牌视觉识别系统规范.docx",
        file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file_size: 1536000,
        meridian_type: "shen",
        sync_status: "synced",
        word_count: 3500,
        created_at: new Date().toISOString(),
      },
    ];
    setFiles(mockFiles);
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("meridian_type", selectedMeridian);

      // TODO: 上传到 API
      // const response = await fetch('/api/knowledge/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      setSelectedFile(null);
    } catch (error) {
      console.error("上传失败:", error);
    } finally {
      setUploading(false);
    }
  };

  const getMeridianLabel = (type: string) => {
    const labels: Record<string, string> = {
      tian: "天道·战略",
      di: "地利·产品",
      ren: "人和·模式",
      shen: "神韵·内容",
      cai: "财库·成交",
      fa: "法度·管理",
    };
    return labels[type] || type;
  };

  const getSyncStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      uploading: "bg-yellow-600",
      indexing: "bg-blue-600",
      synced: "bg-green-600",
      failed: "bg-red-600",
    };
    return colors[status] || "bg-gray-600";
  };

  const getSyncStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      uploading: "上传中",
      indexing: "索引中",
      synced: "已同步",
      failed: "失败",
    };
    return labels[status] || status;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* 顶部导航 */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">灵魂仓库</h1>
              <p className="text-sm text-gray-400 mt-1">企业私有知识库管理中心</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-blue-600">
                {files.length} 份文档
              </Badge>
              <Button variant="outline" size="sm">
                同步状态
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 灵魂快照 - 暂时使用静态展示 */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">灵魂快照</h2>
            <p className="text-gray-400 mb-4">
              企业大脑知识分布图谱（Mermaid 组件正在修复中...）
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">42</div>
                <div className="text-sm text-gray-400 mt-1">总文档数</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">8.5 万</div>
                <div className="text-sm text-gray-400 mt-1">总字数</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-lg font-bold text-purple-400">神韵·内容</div>
                <div className="text-sm text-gray-400 mt-1">最强脉络</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">☁️</span>
                  <span className="text-sm text-gray-300">天道·战略</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">8 份</div>
                  <div className="text-[10px] text-gray-500">19%</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏔️</span>
                  <span className="text-sm text-gray-300">地利·产品</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">6 份</div>
                  <div className="text-[10px] text-gray-500">14%</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  <span className="text-sm text-gray-300">人和·模式</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">5 份</div>
                  <div className="text-[10px] text-gray-500">12%</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <span className="text-sm text-gray-300">神韵·内容</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">12 份</div>
                  <div className="text-[10px] text-gray-500">29%</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <span className="text-sm text-gray-300">财库·成交</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">7 份</div>
                  <div className="text-[10px] text-gray-500">17%</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  <span className="text-sm text-gray-300">法度·管理</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-blue-400">4 份</div>
                  <div className="text-[10px] text-gray-500">9%</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 上传区域 */}
        <Card className="mb-8 bg-gray-900/50 border-gray-800">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">上传新文档</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-400">
                    已选择: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </div>
                )}
              </div>
              <select
                value={selectedMeridian}
                onChange={(e) => setSelectedMeridian(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tian">天道·战略</option>
                <option value="di">地利·产品</option>
                <option value="ren">人和·模式</option>
                <option value="shen">神韵·内容</option>
                <option value="cai">财库·成交</option>
                <option value="fa">法度·管理</option>
              </select>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? "上传中..." : "上传"}
              </Button>
            </div>
          </div>
        </Card>

        {/* 文件列表 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">已上传文档</h2>
            {files.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📂</div>
                <p className="text-lg mb-2">暂无文档</p>
                <p className="text-sm">点击上方上传按钮开始构建您的企业知识库</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-100">{file.file_name}</div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                          <span>{getMeridianLabel(file.meridian_type)}</span>
                          <span>{formatFileSize(file.file_size)}</span>
                          {file.word_count && <span>{file.word_count.toLocaleString()} 字</span>}
                          <span>{new Date(file.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className={getSyncStatusColor(file.sync_status)}>
                        {getSyncStatusLabel(file.sync_status)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getFileIcon(fileType: string) {
  const icons: Record<string, string> = {
    "application/pdf": "📕",
    "application/msword": "📘",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📘",
    "text/plain": "📄",
    "text/markdown": "📝",
  };
  return icons[fileType] || "📄";
}
