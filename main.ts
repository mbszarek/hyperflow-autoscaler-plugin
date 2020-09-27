import API from './api';
import Loggers from './logger';
import RPCParent from "./rpcParent";

import { RedisClient } from 'redis';
import * as child_process from 'child_process';

function runAutoscaler(providerName: string, rcl: RedisClient, wflib: object, plugins: any[]) {
  /* Skip autoscaler if specified 'none'. */
  if (providerName == "none") {
    Loggers.base.debug("[main] Not running autoscaler process, because 'none' provider is specified.");
    return;
  }

  /* Create API, engine process and bind it via RPC. */
  let api = new API(rcl, wflib, plugins);
  Loggers.base.debug("[main] Running process with engine.js");
  let engineProcess = child_process.fork(__dirname + '/engine.js', [providerName], { detached: false });
  let rpc = new RPCParent(engineProcess, api);
  rpc.init();
  return;
}

export default {
  run: runAutoscaler,
};
