import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { GeneratedImage, GeneratedVideo } from "@/types";

interface ImageDB extends DBSchema {
  images: {
    key: string;
    value: {
      id: string;
      url?: string;
      b64_json?: string;
      original_prompt?: string;
      revised_prompt?: string;
      createdAt: number;
    };
    indexes: { "by-created": number };
  };
  videos: {
    key: string;
    value: {
      id: string;
      task_id: string;
      video_url?: string;
      original_prompt?: string;
      original_image_url?: string;
      status: "pending" | "processing" | "completed" | "failed";
      progress?: number;
      error_message?: string;
      created_at: number;
    };
    indexes: { "by-created": number; "by-task-id": string };
  };
}

class DatabaseService {
  private db: IDBPDatabase<ImageDB> | null = null;
  private readonly dbName = "ai-image-generator";
  private readonly version = 3;

  async init(): Promise<void> {
    try {
      this.db = await openDB<ImageDB>(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(
            `IndexedDB: Upgrading database from version ${oldVersion} to ${newVersion}`
          );

          // 创建图片存储
          if (!db.objectStoreNames.contains("images")) {
            const store = db.createObjectStore("images", {
              keyPath: "id",
            });
            // 创建按创建时间排序的索引
            store.createIndex("by-created", "createdAt");
            console.log("IndexedDB: Created images store");
          }

          // 版本2：添加 original_prompt 字段支持
          if (oldVersion < 2) {
            console.log(
              "IndexedDB: Upgrading to version 2 - adding original_prompt support"
            );
            // 数据结构兼容，不需要迁移现有数据
            // 旧数据的 original_prompt 字段将为 undefined，这是可以接受的
          }

          // 版本3：添加视频存储支持
          if (oldVersion < 3) {
            console.log(
              "IndexedDB: Upgrading to version 3 - adding video storage support"
            );
            if (!db.objectStoreNames.contains("videos")) {
              const videoStore = db.createObjectStore("videos", {
                keyPath: "id",
              });
              // 创建按创建时间排序的索引
              videoStore.createIndex("by-created", "created_at");
              // 创建按任务ID查找的索引
              videoStore.createIndex("by-task-id", "task_id");
              console.log("IndexedDB: Created videos store");
            }
          }
        },
      });
      console.log("IndexedDB: Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  async saveImage(image: GeneratedImage): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const imageData = {
      id,
      url: image.url,
      b64_json: image.b64_json,
      original_prompt: image.original_prompt,
      revised_prompt: image.revised_prompt,
      createdAt: Date.now(),
    };

    try {
      await this.db!.add("images", imageData);
      console.log(`IndexedDB: Saved image with id: ${id}`);
      return id;
    } catch (error) {
      console.error("Failed to save image:", error);
      throw error;
    }
  }

  async getAllImages(): Promise<GeneratedImage[]> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("images", "readonly");
      const index = tx.store.index("by-created");

      // 按创建时间倒序获取所有图片
      const images = await index.getAll();
      images.reverse(); // 最新的在前面

      console.log(`IndexedDB: Loaded ${images.length} images from database`);

      return images.map((img) => ({
        url: img.url,
        b64_json: img.b64_json,
        original_prompt: img.original_prompt,
        revised_prompt: img.revised_prompt,
      }));
    } catch (error) {
      console.error("Failed to get images:", error);
      return [];
    }
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      await this.db!.delete("images", id);
    } catch (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  }

  async clearAllImages(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("images", "readwrite");
      await tx.store.clear();
      console.log("IndexedDB: Cleared all images from database");
    } catch (error) {
      console.error("Failed to clear images:", error);
      throw error;
    }
  }

  async getImageCount(): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    try {
      return await this.db!.count("images");
    } catch (error) {
      console.error("Failed to get image count:", error);
      return 0;
    }
  }

  // 清理旧数据（可选：保留最近的 N 张图片）
  async cleanupOldImages(keepCount: number = 100): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("images", "readwrite");
      const index = tx.store.index("by-created");
      const allKeys = await index.getAllKeys();

      if (allKeys.length > keepCount) {
        // 删除最旧的图片，保留最新的 keepCount 张
        const keysToDelete = allKeys.slice(0, allKeys.length - keepCount);
        for (const key of keysToDelete) {
          await tx.store.delete(key);
        }
      }

      await tx.done;
    } catch (error) {
      console.error("Failed to cleanup old images:", error);
    }
  }

  // ===== 视频相关方法 =====

  async saveVideo(video: GeneratedVideo): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const videoData = {
      id,
      task_id: video.task_id,
      video_url: video.video_url,
      original_prompt: video.original_prompt,
      original_image_url: video.original_image_url,
      status: video.status,
      progress: video.progress,
      error_message: video.error_message,
      created_at: video.created_at,
    };

    try {
      await this.db!.add("videos", videoData);
      console.log(
        `IndexedDB: Saved video with id: ${id}, task_id: ${video.task_id}`
      );
      return id;
    } catch (error) {
      console.error("Failed to save video:", error);
      throw error;
    }
  }

  async updateVideoByTaskId(
    taskId: string,
    updates: Partial<GeneratedVideo>
  ): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("videos", "readwrite");
      const index = tx.store.index("by-task-id");
      const video = await index.get(taskId);

      if (video) {
        const updatedVideo = { ...video, ...updates };
        await tx.store.put(updatedVideo);
        console.log(`IndexedDB: Updated video with task_id: ${taskId}`);
      }

      await tx.done;
    } catch (error) {
      console.error("Failed to update video:", error);
      throw error;
    }
  }

  async getAllVideos(): Promise<GeneratedVideo[]> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("videos", "readonly");
      const index = tx.store.index("by-created");

      // 按创建时间倒序获取所有视频
      const videos = await index.getAll();
      videos.reverse(); // 最新的在前面

      console.log(`IndexedDB: Loaded ${videos.length} videos from database`);

      return videos.map((video) => ({
        task_id: video.task_id,
        video_url: video.video_url,
        original_prompt: video.original_prompt,
        original_image_url: video.original_image_url,
        status: video.status,
        progress: video.progress,
        error_message: video.error_message,
        created_at: video.created_at,
      }));
    } catch (error) {
      console.error("Failed to get videos:", error);
      return [];
    }
  }

  async deleteVideo(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      await this.db!.delete("videos", id);
    } catch (error) {
      console.error("Failed to delete video:", error);
      throw error;
    }
  }

  async clearAllVideos(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("videos", "readwrite");
      await tx.store.clear();
      console.log("IndexedDB: Cleared all videos from database");
    } catch (error) {
      console.error("Failed to clear videos:", error);
      throw error;
    }
  }

  async getVideoCount(): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    try {
      return await this.db!.count("videos");
    } catch (error) {
      console.error("Failed to get video count:", error);
      return 0;
    }
  }

  // 清理旧视频（可选：保留最近的 N 个视频）
  async cleanupOldVideos(keepCount: number = 50): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    try {
      const tx = this.db!.transaction("videos", "readwrite");
      const index = tx.store.index("by-created");
      const allKeys = await index.getAllKeys();

      if (allKeys.length > keepCount) {
        // 删除最旧的视频，保留最新的 keepCount 个
        const keysToDelete = allKeys.slice(0, allKeys.length - keepCount);
        for (const key of keysToDelete) {
          await tx.store.delete(key);
        }
      }

      await tx.done;
    } catch (error) {
      console.error("Failed to cleanup old videos:", error);
    }
  }
}

// 创建单例实例
export const dbService = new DatabaseService();
