/* eslint-disable @typescript-eslint/no-explicit-any */
import { RedisClient } from 'redis';
import { HFEngine, HFWflib, WFConfig } from '@hyperflow/types';
import { getBaseLogger } from '@hyperflow/logger';
import AutoscalerClient from './http/autoscalerClient';
import { HyperFlowPlugin } from '@hyperflow/plugin';

const Logger = getBaseLogger();

class StandaloneAutoscalerPlugin implements HyperFlowPlugin {
  private autoscalerClient!: AutoscalerClient;
  private constructorSuccess = false;
  private wfId!: string;

  public readonly pgType = 'scheduler';

  constructor() {
    Logger.debug(
      '[StandaloneAutoscalerPlugin] Creating standalone autoscaler plugin'
    );
    const autoscalerUrl = process.env['HF_VAR_autoscalerAddress'];
    if (autoscalerUrl === undefined) {
      Logger.error(
        '[StandaloneAutoscalerPlugin] No valid address specified. Hint: use env var HF_VAR_autoscalerAddress'
      );
      return;
    }
    this.autoscalerClient = new AutoscalerClient(autoscalerUrl);
    this.constructorSuccess = true;
  }

  async init(
    rcl: RedisClient,
    wflib: HFWflib,
    engine: HFEngine,
    config: WFConfig
  ): Promise<void> {
    if (this.constructorSuccess === false) {
      Logger.error(
        '[StandaloneAutoscalerPlugin] Constructor has failed, so we reject init() call'
      );
      return;
    }
    this.wfId = config.wfId;
    Logger.debug('[StandaloneAutoscalerPlugin] Initializing');
    const connectionStatus = await this.autoscalerClient.checkConnection();

    if (!connectionStatus) {
      Logger.warn(
        '[StandaloneAutoscalerPlugin] Autoscaler is not healthy, so we reject init() call'
      );
    } else {
      await this.autoscalerClient.sendWorkflowDetails(
        config.wfId,
        config.wfJson
      );

      ['persist', 'input', 'read', 'prov'].forEach((name) => {
        engine.eventServer.on(name, this.cbBuilder(name));
      });
    }
  }

  async markWorkflowFinished(wfId: string): Promise<void> {
    Logger.warn(
      `[StandaloneAutoscalerPlugin] Marking workflow (${wfId}) as finished`
    );
    await this.autoscalerClient.markWorkflowFinished(wfId);
  }

  private cbBuilder(name: string) {
    return async (...values: any) => {
      Logger.debug(
        '[StandaloneAutoscalerPlugin] Captured event from engine ' +
          name.toString() +
          ': ' +
          JSON.stringify(values)
      );
      await this.autoscalerClient.sendEvent(this.wfId, 'onHFEngineEvent', [
        name,
        values
      ]);
    };
  }
}

export = StandaloneAutoscalerPlugin;
