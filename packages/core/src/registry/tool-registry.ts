import { ToolInterface, ToolCategory, ToolRegistry } from '@nova/types';
import { NovaLogger } from '../logger';

class NovaToolRegistry implements ToolRegistry {
  private tools: Map<string, ToolInterface> = new Map();
  private logger: NovaLogger;

  constructor() {
    this.logger = new NovaLogger('ToolRegistry');
  }

  register(tool: ToolInterface): void {
    const config = tool.getConfig();
    this.tools.set(config.id, tool);
    this.logger.info(`Tool registered: ${config.name}`, { category: config.category });
  }

  unregister(toolId: string): void {
    const removed = this.tools.delete(toolId);
    if (removed) {
      this.logger.info(`Tool unregistered: ${toolId}`);
    }
  }

  get(toolId: string): ToolInterface | undefined {
    return this.tools.get(toolId);
  }

  getAll(): Map<string, ToolInterface> {
    return new Map(this.tools);
  }

  getByCategory(category: ToolCategory): ToolInterface[] {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.getConfig().category === category
    );
  }

  search(query: string): ToolInterface[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter((tool) => {
      const config = tool.getConfig();
      return (
        config.name.toLowerCase().includes(lowerQuery) ||
        config.description.toLowerCase().includes(lowerQuery)
      );
    });
  }
}

export { NovaToolRegistry };
