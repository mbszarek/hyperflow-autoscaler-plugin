/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'cross-fetch';
import { getBaseLogger } from '@hyperflow/logger';

const Logger = getBaseLogger();

type HealthCheckResponse = {
  status: string;
};

export default class AutoscalerClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  public async checkConnection(): Promise<boolean> {
    Logger.debug('[HTTP] Checking hyperflow-standalone-autoscaler connection');
    const healthStatusRequest = await fetch(`${this.url}/health`);
    if (healthStatusRequest.status === 200) {
      const responseStatus =
        (await healthStatusRequest.json()) as HealthCheckResponse;
      if (responseStatus.status === 'healthy') {
        Logger.debug(
          '[HTTP] Connection with hyperflow-standalone-autoscaler established successfully'
        );
        return true;
      } else {
        Logger.error(
          `[HTTP] Connection unsuccessful, status: ${responseStatus.status}`
        );
        return false;
      }
    } else {
      Logger.error(
        `[HTTP] Error response from hyperflow-standalone-autoscaler, status: ${healthStatusRequest.status}`
      );
      return false;
    }
  }

  public async sendWorkflowDetails(wfId: string, wfJson: any): Promise<void> {
    Logger.debug(
      `[HTTP] Sending workflow (${wfId}) details to standalone autoscaler: ${JSON.stringify(
        wfJson
      )}`
    );
    const payload = {
      workflow: wfJson
    };
    await fetch(`${this.url}/workflow?wfId=${wfId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return;
  }

  public async markWorkflowFinished(wfId: string): Promise<void> {
    Logger.debug(`[HTTP] Marking workflow (${wfId}) as finished`);
    await fetch(`${this.url}/workflow/finish?wfId=${wfId}`, { method: 'POST' });
    return;
  }

  public async sendEvent(
    wfId: string,
    fnName: string,
    args: Array<any>
  ): Promise<void> {
    Logger.debug(`[HTTP] Calling ${fnName}`);
    const payload = {
      args: args
    };
    await fetch(`${this.url}/call/${fnName}?wfId=${wfId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return;
  }
}
