import { AgentInterface, AgentConfig, AgentType, AgentRegistry } from '@nova/types';
import { NovaLogger } from '../logger';

class NovaAgentRegistry implements AgentRegistry {
  private agents: Map<string, AgentInterface> = new Map();
  private logger: NovaLogger;

  constructor() {
    this.logger = new NovaLogger('AgentRegistry');
  }

  register(agent: AgentInterface): void {
    const config = agent.getConfig();
    this.agents.set(config.id, agent);
    this.logger.info(`Agent registered: ${config.name}`, { type: config.type });
  }

  unregister(agentId: string): void {
    const removed = this.agents.delete(agentId);
    if (removed) {
      this.logger.info(`Agent unregistered: ${agentId}`);
    }
  }

  get(agentId: string): AgentInterface | undefined {
    return this.agents.get(agentId);
  }

  getAll(): Map<string, AgentInterface> {
    return new Map(this.agents);
  }

  getByType(type: AgentType): AgentInterface[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.getConfig().type === type
    );
  }

  getByCapability(capability: string): AgentInterface[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.getCapabilities().some((c) => c.name === capability)
    );
  }
}

export { NovaAgentRegistry };
