import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from '@orpc/contract';
import { oc } from '@orpc/contract';
import { extractContract } from './extract';
import { ExtractLinksContract, getLinksContract } from './links';
import {
  exportResponseContract,
  getOneLogContract,
  listLogsContract,
} from './logs';
import { getMarkdownContract, readUrlContract } from './read';
import { screenshotContract } from './screenshot';

export const contract = oc.router({
  read: oc.prefix('/read').router({
    getMarkdown: getMarkdownContract,
    readUrl: readUrlContract,
  }),
  links: oc.prefix('/links').router({
    getLinks: getLinksContract,
    extractLinks: ExtractLinksContract,
  }),
  logs: oc.prefix('/logs').router({
    getOne: getOneLogContract,
    listLogs: listLogsContract,
    exportResponse: exportResponseContract,
  }),
  screenshot: oc.prefix('/screenshot').router({
    capture: screenshotContract,
  }),
  extract: oc.prefix('/extract').router({
    elements: extractContract,
  }),
});

export type Inputs = InferContractRouterInputs<typeof contract>;
export type Outputs = InferContractRouterOutputs<typeof contract>;

export * from './errors';
export * from './links';
export * from './logs';
export * from './read';
