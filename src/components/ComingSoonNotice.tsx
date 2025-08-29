import React from "react";
import { Construction, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ComingSoonNotice() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Construction className="h-16 w-16 text-orange-500" />
              <Clock className="h-6 w-6 text-orange-400 absolute -top-1 -right-1 bg-white rounded-full p-1" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-orange-800">
              🎨 图像编辑功能开发中
            </h2>
            <p className="text-orange-700 leading-relaxed">
              豆包 SeedEdit 图像编辑功能目前还在测试阶段，API 暂未对外开放。
              <br />
              我们已经准备好了完整的代码架构，一旦官方 API 发布，立即可用！
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">
              🚀 即将支持的功能：
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-orange-700">
              <div>• 对话式图像编辑</div>
              <div>• 风格转换</div>
              <div>• 局部修改</div>
              <div>• 元素添加/删除</div>
              <div>• 版本历史管理</div>
              <div>• 多轮编辑优化</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://team.doubao.com/", "_blank")}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              关注官方动态
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              返回文生图
            </Button>
          </div>

          <p className="text-xs text-orange-600">
            💡 目前可以体验文生图功能，生成高质量图像
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
