# 六脉蜂群 - Agent通信协议规范

> 定义Agent之间的通信标准，实现去中心化的蜂群协同
> 这是实现AGI雏形的技术基础

---

## 一、协议设计原则

### 1.1 去中心化
```
❌ 中心化：所有通信经过Queen Agent
✅ 去中心化：Agent之间点对点通信
```

**为什么去中心化？**
- 减少单点故障
- 降低通信延迟
- 支持并行处理
- 更符合生物蜂群

---

### 1.2 异步优先
```
❌ 同步：Agent A等待Agent B响应
✅ 异步：Agent A发送消息后继续处理其他任务
```

**为什么异步？**
- 提高系统吞吐量
- 避免阻塞
- 支持流式输出

---

### 1.3 幂等性
```
同一消息发送多次 = 只执行一次
```

**为什么幂等？**
- 网络不稳定时重试安全
- 避免重复执行

---

## 二、消息格式

### 2.1 基础消息结构

```typescript
interface SwarmMessage {
  // 消息元数据
  id: string;                    // 唯一ID（UUID）
  timestamp: string;             // ISO 8601时间戳
  conversationId: string;        // 会话ID（关联同一任务）

  // 发送者信息
  from: {
    agentId: AgentType;          // 发送者Agent类型
    instanceId: string;          // 实例ID（支持同一Agent多实例）
  };

  // 接收者信息
  to: {
    agentId?: AgentType;         // 单个接收者
    agentIds?: AgentType[];      // 多个接收者（广播）
    broadcast?: boolean;         // 是否广播到所有Agent
  };

  // 消息内容
  type: MessageType;             // 消息类型
  payload: MessagePayload;       // 消息负载

  // 优先级与生命周期
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ttl?: number;                  // 生存时间（毫秒）

  // 可选：回复关联
  replyTo?: string;              // 回复的消息ID
  correlationId?: string;        // 关联ID（用于追踪跨Agent请求）
}

type MessageType =
  | 'query'           // 查询请求
  | 'inform'          // 信息通知
  | 'request'         // 协作请求
  | 'response'        // 响应
  | 'broadcast'       // 广播
  | 'error'           // 错误
  | 'heartbeat';      // 心跳

interface MessagePayload {
  context: Record<string, unknown>;  // 上下文数据
  task: string;                      // 任务描述
  data?: unknown;                    // 附加数据
  expectedResponse?: boolean;        // 是否期望响应
}
```

---

### 2.2 消息类型详解

#### Query（查询）
```typescript
{
  from: { agentId: "人道·流量", instanceId: "traffic-001" },
  to: { agentId: "天道·战略" },
  type: "query",
  payload: {
    context: { userQuery: "美业培训" },
    task: "获取目标用户画像",
    expectedResponse: true,
  },
  priority: "high",
  correlationId: "uuid-xxx",
}
```

#### Inform（信息通知）
```typescript
{
  from: { agentId: "天道·战略" },
  to: { broadcast: true },
  type: "inform",
  payload: {
    context: { niche: "美业培训" },
    task: "战略定位已确定",
    data: { positioning: "标准化服务流程" },
  },
  priority: "medium",
}
```

#### Request（协作请求）
```typescript
{
  from: { agentId: "财帛·转化" },
  to: { agentId: "法度·风险" },
  type: "request",
  payload: {
    context: { pricingStrategy: "阶梯定价" },
    task: "审查定价策略的合规性",
    expectedResponse: true,
  },
  priority: "high",
}
```

#### Error（错误）
```typescript
{
  from: { agentId: "法度·风险" },
  to: { agentId: "Queen" },
  type: "error",
  payload: {
    context: { originalMessage: "msg-123" },
    task: "错误报告",
    data: {
      errorCode: "COMPLIANCE_RISK",
      message: "定价策略违反价格法"
    },
  },
  priority: "urgent",
}
```

---

## 三、通信模式

### 3.1 点对点通信

```
Agent A → Agent B
```

```typescript
// lib/swarm/p2p-communication.ts
export class P2PCommunication {
  async send(
    fromAgent: SwarmAgent,
    toAgent: AgentType,
    payload: MessagePayload
  ): Promise<string> {
    const message: SwarmMessage = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      conversationId: fromAgent.currentConversationId,
      from: {
        agentId: fromAgent.type,
        instanceId: fromAgent.instanceId,
      },
      to: { agentId: toAgent },
      type: "query",
      payload,
      priority: "medium",
    };

    // 发送到消息总线
    await this.messageBus.publish(message);

    // 如果期望响应，等待
    if (payload.expectedResponse) {
      return await this.waitForResponse(message.id);
    }

    return message.id;
  }
}
```

---

### 3.2 广播通信

```
Agent A → 所有Agent
```

```typescript
export class BroadcastCommunication {
  async broadcast(
    fromAgent: SwarmAgent,
    payload: MessagePayload
  ): Promise<void> {
    const message: SwarmMessage = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      conversationId: fromAgent.currentConversationId,
      from: {
        agentId: fromAgent.type,
        instanceId: fromAgent.instanceId,
      },
      to: { broadcast: true },
      type: "inform",
      payload,
      priority: "medium",
    };

    await this.messageBus.publish(message);
  }
}
```

---

### 3.3 请求-响应模式

```typescript
export class RequestResponse {
  async request(
    fromAgent: SwarmAgent,
    toAgent: AgentType,
    payload: MessagePayload,
    timeout = 30000
  ): Promise<SwarmMessage> {
    // 1. 发送请求
    const requestId = await this.send(fromAgent, toAgent, {
      ...payload,
      expectedResponse: true,
    });

    // 2. 等待响应（带超时）
    const response = await this.waitForResponse(requestId, timeout);

    // 3. 处理响应
    if (response.type === "error") {
      throw new SwarmError(response.payload);
    }

    return response;
  }
}
```

---

## 四、消息总线

### 4.1 架构

```
┌─────────────────────────────────────────────────┐
│              Message Bus（消息总线）             │
│  - Redis Pub/Sub（生产环境）                    │
│  - EventEmitter（开发环境）                     │
└─────────────────────────────────────────────────┘
          ↑           ↑           ↑
    ┌─────┴─────┐ ┌───┴────┐ ┌───┴────┐
    │ 天道·战略 │ │ 神韵·内容│ │ 地道·产业│ ...
    └───────────┘ └─────────┘ └─────────┘
```

---

### 4.2 实现

```typescript
// lib/swarm/message-bus.ts
import { EventEmitter } from "events";

export interface MessageHandler {
  (message: SwarmMessage): Promise<void | SwarmMessage>;
}

export class MessageBus {
  private eventEmitter: EventEmitter;
  private subscriptions: Map<AgentType, Set<MessageHandler>>;
  private redis?: Redis; // 生产环境

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.subscriptions = new Map();
  }

  // 订阅消息
  subscribe(agentType: AgentType, handler: MessageHandler): () => void {
    if (!this.subscriptions.has(agentType)) {
      this.subscriptions.set(agentType, new Set());
    }
    this.subscriptions.get(agentType)!.add(handler);

    // 返回取消订阅函数
    return () => this.unsubscribe(agentType, handler);
  }

  // 发布消息
  async publish(message: SwarmMessage): Promise<void> {
    // 1. 持久化到数据库（用于调试和重放）
    await this.persistMessage(message);

    // 2. 发送到Redis（生产环境）
    if (this.redis) {
      await this.redis.publish("swarm:messages", JSON.stringify(message));
    }

    // 3. 本地EventEmitter（开发/测试）
    this.eventEmitter.emit("message", message);

    // 4. 路由到目标Agent
    await this.routeToAgents(message);
  }

  // 路由消息到Agent
  private async routeToAgents(message: SwarmMessage): Promise<void> {
    if (message.to.broadcast) {
      // 广播到所有Agent
      for (const [agentType, handlers] of this.subscriptions) {
        for (const handler of handlers) {
          await handler(message);
        }
      }
    } else if (message.to.agentId) {
      // 单播
      const handlers = this.subscriptions.get(message.to.agentId);
      if (handlers) {
        for (const handler of handlers) {
          await handler(message);
        }
      }
    } else if (message.to.agentIds) {
      // 多播
      for (const agentId of message.to.agentIds) {
        const handlers = this.subscriptions.get(agentId);
        if (handlers) {
          for (const handler of handlers) {
            await handler(message);
          }
        }
      }
    }
  }

  // 持久化消息（用于调试和学习）
  private async persistMessage(message: SwarmMessage): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      await supabase.from("swarm_messages").insert({
        message_id: message.id,
        conversation_id: message.conversationId,
        from_agent: message.from.agentId,
        to_agent: message.to.agentId || "broadcast",
        message_type: message.type,
        payload: message.payload,
        created_at: message.timestamp,
      });
    }
  }
}
```

---

## 五、Agent接口规范

### 5.1 基础Agent接口

```typescript
// lib/swarm/agent.ts
export interface SwarmAgent {
  // Agent身份
  readonly type: AgentType;
  readonly instanceId: string;

  // 当前会话
  currentConversationId: string;

  // 消息处理
  handleMessage(message: SwarmMessage): Promise<void | SwarmMessage>;

  // 能力声明
  capabilities: AgentCapability[];
}

export interface AgentCapability {
  name: string;                    // 能力名称
  description: string;             // 描述
  inputSchema: JSONSchema;          // 输入格式
  outputSchema: JSONSchema;         // 输出格式
}

export type AgentType =
  | "Queen"
  | "天道·战略"
  | "神韵·内容"
  | "地道·产业"
  | "人道·流量"
  | "财帛·转化"
  | "法度·风险";
```

---

### 5.2 Agent实现示例

```typescript
// lib/swarm/agents/strategy-agent.ts
export class StrategyAgent implements SwarmAgent {
  readonly type: AgentType = "天道·战略";
  readonly instanceId: string;
  currentConversationId: string = "";

  readonly capabilities: AgentCapability[] = [
    {
      name: "analyze_niche",
      description: "分析赛道定位",
      inputSchema: {
        type: "object",
        properties: {
          niche: { type: "string" },
          revenueGoal: { type: "string" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          positioning: { type: "string" },
          differentiation: { type: "string" },
        },
      },
    },
  ];

  constructor(
    private messageBus: MessageBus,
    private difyClient: DifyClient
  ) {
    this.instanceId = `strategy-${generateUUID()}`;

    // 订阅消息
    this.messageBus.subscribe(this.type, this.handleMessage.bind(this));
  }

  async handleMessage(message: SwarmMessage): Promise<void | SwarmMessage> {
    switch (message.type) {
      case "query":
        return await this.handleQuery(message);
      case "inform":
        return await this.handleInform(message);
      case "request":
        return await this.handleRequest(message);
      default:
        console.warn(`Unhandled message type: ${message.type}`);
    }
  }

  private async handleQuery(message: SwarmMessage): Promise<SwarmMessage> {
    const { task, context } = message.payload;

    // 调用Dify生成战略
    const result = await this.difyClient.createBlockingRequest({
      inputs: context,
      query: task,
      user: message.conversationId,
    });

    // 返回响应
    return {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      conversationId: message.conversationId,
      from: {
        agentId: this.type,
        instanceId: this.instanceId,
      },
      to: {
        agentId: message.from.agentId,
      },
      type: "response",
      payload: {
        context: result,
        task: `完成: ${task}`,
      },
      replyTo: message.id,
      correlationId: message.correlationId,
      priority: message.priority,
    };
  }

  // 向其他Agent发起协作
  async requestCollaboration(
    toAgent: AgentType,
    payload: MessagePayload
  ): Promise<SwarmMessage> {
    const message: SwarmMessage = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      conversationId: this.currentConversationId,
      from: {
        agentId: this.type,
        instanceId: this.instanceId,
      },
      to: { agentId: toAgent },
      type: "request",
      payload,
      priority: "high",
    };

    // 发送并等待响应
    await this.messageBus.publish(message);
    return await this.waitForResponse(message.id);
  }
}
```

---

## 六、Queen Agent规范

### 6.1 职责

```typescript
// lib/swarm/queen-agent.ts
export class QueenAgent implements SwarmAgent {
  readonly type: AgentType = "Queen";

  // 核心能力
  async decompose(userQuery: string): Promise<AgentTask[]> {
    // 理解用户意图
    const intent = await this.understandIntent(userQuery);

    // 分解任务
    const tasks: AgentTask[] = [];

    for (const domain of intent.involvedDomains) {
      const agent = this.selectAgent(domain);
      tasks.push({
        agent,
        task: this.generateTask(domain, intent),
        dependencies: this.analyzeDependencies(domain, intent),
      });
    }

    return tasks;
  }

  async coordinate(tasks: AgentTask[]): Promise<SwarmResult> {
    // 1. 构建任务依赖图
    const dag = this.buildDAG(tasks);

    // 2. 并行执行无依赖任务
    const parallel = this.findParallelTasks(dag);
    const parallelResults = await Promise.all(
      parallel.map(task => this.executeTask(task))
    );

    // 3. 串行执行有依赖任务
    const sequential = this.findSequentialTasks(dag);
    const sequentialResults: SwarmMessage[] = [];
    for (const task of sequential) {
      const result = await this.executeTask(task, sequentialResults);
      sequentialResults.push(result);
    }

    // 4. 整合结果
    return this.synthesizeResults([...parallelResults, ...sequentialResults]);
  }

  async synthesizeResults(results: SwarmMessage[]): Promise<SwarmResult> {
    // 检测冲突
    const conflicts = this.detectConflicts(results);

    // 协同解决
    const resolved = await this.resolveConflicts(conflicts);

    // 生成综合报告
    return {
      summary: this.generateSummary(results),
      details: results,
      recommendations: this.generateRecommendations(results),
      confidence: this.calculateConfidence(results),
    };
  }
}
```

---

## 七、容错与重试

### 7.1 超时处理

```typescript
export class MessageTimeout {
  async waitForResponse(
    messageId: string,
    timeout = 30000
  ): Promise<SwarmMessage> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Message timeout: ${messageId}`));
      }, timeout);

      this.responseHandlers.set(messageId, {
        resolve,
        reject,
        timer,
      });
    });
  }
}
```

---

### 7.2 重试策略

```typescript
export class MessageRetry {
  async sendWithRetry(
    message: SwarmMessage,
    maxRetries = 3,
    backoff = 1000
  ): Promise<void> {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.messageBus.publish(message);
        return; // 成功
      } catch (error) {
        lastError = error as Error;
        await this.sleep(backoff * Math.pow(2, attempt)); // 指数退避
      }
    }

    throw lastError!;
  }
}
```

---

## 八、监控与调试

### 8.1 消息追踪

```sql
-- 消息日志表
CREATE TABLE swarm_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    message_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 性能指标
    response_time_ms INTEGER,
    status TEXT, -- 'pending' | 'completed' | 'failed'

    -- 关联
    reply_to UUID,
    correlation_id UUID
);

CREATE INDEX idx_swarm_messages_conversation ON swarm_messages(conversation_id);
CREATE INDEX idx_swarm_messages_correlation ON swarm_messages(correlation_id);
```

---

### 8.2 调试面板

```typescript
// lib/swarm/debug-panel.ts
export class SwarmDebugPanel {
  // 获取会话的所有消息
  async getConversationMessages(conversationId: string): Promise<SwarmMessage[]> {
    const { data } = await supabase
      .from("swarm_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    return data;
  }

  // 可视化消息流
  visualizeMessages(messages: SwarmMessage[]): string {
    const lines: string[] = [];

    for (const msg of messages) {
      const arrow = msg.to.broadcast ? "→ *" : `→ ${msg.to.agentId}`;
      lines.push(`[${msg.timestamp}] ${msg.from.agentId} ${arrow} : ${msg.type}`);
    }

    return lines.join("\n");
  }
}
```

---

## 九、性能优化

### 9.1 消息批处理

```typescript
export class MessageBatcher {
  private batch: SwarmMessage[] = [];
  private batchTimer?: NodeJS.Timeout;

  async publish(message: SwarmMessage): Promise<void> {
    this.batch.push(message);

    // 批量发送（最多100ms延迟）
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flush();
      }, 100);
    }

    // 达到批次大小，立即发送
    if (this.batch.length >= 10) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    // 批量插入数据库
    await supabase.from("swarm_messages").insert(this.batch);

    // 批量发布到Redis
    await this.redis.publish("swarm:messages", JSON.stringify(this.batch));

    this.batch = [];
    this.batchTimer = undefined;
  }
}
```

---

### 9.2 消息压缩

```typescript
export class MessageCompressor {
  compress(message: SwarmMessage): SwarmMessage {
    // 压缩大型payload
    if (JSON.stringify(message.payload).length > 10000) {
      message.payload = {
        ...message.payload,
        _compressed: true,
        _data: compress(JSON.stringify(message.payload)),
      };
    }
    return message;
  }

  decompress(message: SwarmMessage): SwarmMessage {
    if (message.payload._compressed) {
      message.payload = JSON.parse(decompress(message.payload._data as string));
    }
    return message;
  }
}
```

---

## 十、安全与权限

### 10.1 消息加密

```typescript
export class MessageEncryption {
  async encrypt(message: SwarmMessage): Promise<SwarmMessage> {
    if (message.priority === "urgent" || message.payload.context?.sensitive) {
      message.payload = {
        ...message.payload,
        _encrypted: true,
        _data: await encrypt(JSON.stringify(message.payload)),
      };
    }
    return message;
  }

  async decrypt(message: SwarmMessage): Promise<SwarmMessage> {
    if (message.payload._encrypted) {
      message.payload = JSON.parse(await decrypt(message.payload._data as string));
    }
    return message;
  }
}
```

---

### 10.2 权限控制

```typescript
export class MessageAuthorization {
  canSend(from: SwarmAgent, to: AgentType): boolean {
    // 权限矩阵
    const permissions: Record<AgentType, AgentType[]> = {
      "天道·战略": ["所有Agent"],
      "神韵·内容": ["天道·战略", "人道·流量"],
      "地道·产业": ["天道·战略", "财帛·转化"],
      "人道·流量": ["所有Agent"],
      "财帛·转化": ["所有Agent"],
      "法度·风险": ["所有Agent"],
    };

    return permissions[from.type]?.includes(to) || false;
  }
}
```

---

## 十一、测试

### 11.1 单元测试

```typescript
describe("StrategyAgent", () => {
  it("should respond to query message", async () => {
    const agent = new StrategyAgent(messageBus, difyClient);
    const message: SwarmMessage = {
      // ... message setup
    };

    const response = await agent.handleMessage(message);

    expect(response.type).toBe("response");
    expect(response.payload).toBeDefined();
  });
});
```

---

### 11.2 集成测试

```typescript
describe("Swarm Communication", () => {
  it("should coordinate agents for complex task", async () => {
    const queen = new QueenAgent();
    const query = "我想做美业培训，如何从0到100万？";

    const result = await queen.process(query);

    expect(result.summary).toBeDefined();
    expect(result.details.length).toBeGreaterThan(1);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

---

## 十二、部署

### 12.1 Redis配置

```bash
# redis.conf
pub/sub notification channels
swarm:messages

# 消息TTL
swarm:message:ttl 3600
```

---

### 12.2 监控指标

```typescript
export class SwarmMetrics {
  async recordMessage(message: SwarmMessage): Promise<void> {
    await prometheus.histogramObserve({
      name: "swarm_message_duration_ms",
      labels: {
        from: message.from.agentId,
        to: message.to.agentId || "broadcast",
        type: message.type,
      },
      value: Date.now() - new Date(message.timestamp).getTime(),
    });
  }
}
```

---

## 总结

这套协议实现了：

1. **去中心化通信**：Agent之间点对点
2. **异步消息传递**：提高吞吐量
3. **容错与重试**：系统健壮性
4. **监控与调试**：可观测性
5. **安全与权限**：企业级安全

**这是实现AGI雏形的通信基础。**

---

> 版本：v1.0
> 日期：2026年3月2日
> 状态：Phase 3 实现目标
