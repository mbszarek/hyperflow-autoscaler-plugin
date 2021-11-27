import { RedisClient } from 'redis';
import { HFWflib, HFEngine, WFConfig } from '@hyperflow/types';

export interface HyperFlowPlugin {
  pgType: string;

  init(
    rcl: RedisClient,
    wflib: HFWflib,
    engine: HFEngine,
    config: WFConfig
  ): Promise<void>;

  markWorkflowFinished(wfId: string): Promise<void>;
}
