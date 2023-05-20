import { RedisClientOptions, createClient } from "redis";
import Queue from "./classes/Queue";

// Interfaces

interface ILogMethod {
  (message: string, meta?: any): any;
}

export interface ILogger {
  debug: ILogMethod;
  error: ILogMethod;
  warn: ILogMethod;
  info: ILogMethod;
  verbose: ILogMethod;
}

// Aliases

export type RedisClient = ReturnType<typeof createClient>;

export type FlowId = string;

export type AnyObject = { [key: string]: any };

export type QueueName = "preparation" | "access-check" | "update-membership";

// Jobs and Results

export type BaseJob = {
  flowId: FlowId;
  userId: number;
  roleIds: number[];
};

export type BaseResult = {
  nextQueue?: QueueName;
};

export type PreparationJob = BaseJob & { recheckAccess: boolean };

export type PreparationResult = BaseResult & {
  nextQueue: "access-check" | "update-membership";
};

export type AccessCheckJob = BaseJob & {
  updateMemberships: boolean;
};

export type AccessCheckResult = BaseResult & {
  accessCheckResult: {
    roleId: number;
    access: boolean;
    requirements: {
      requirementId: number;
      access: true;
      amount: number;
    }[];
  }[];
};

export type UpdateMembershipJob = AccessCheckResult;

export type UpdateMembershipResult = number[];

export type ManageRewardJob = number[];

export type CreateAccessFlowOptions = {
  userId: number;
  roleIds: number[];
  guildId: number;
  priority: number;
  recheckAccess: boolean;
  updateMemberships: boolean;
  manageRewards: boolean;
  forceRewardActions: boolean;
  onlyForThisPlatform?: string;
};

export type AccessFlowData = CreateAccessFlowOptions & {
  status: "waiting" | "preparation done" | "access check done";
  accessCheckResult?: AccessCheckResult;
  updateMembershipResult?: UpdateMembershipResult;
};

// Functions

export type WorkerFunction<Job extends BaseJob, Result> = (
  job: Job
) => Promise<Result>;

// Options

export type AccessFlowOptions = {
  redisClientOptions: RedisClientOptions;
  logger?: ILogger;
};

export type QueueOptions = {
  queueName: QueueName;
  nextQueueName?: QueueName;
  attributesToGet: string[];
};

export type WorkerOptions<Job extends BaseJob, Result> = {
  queue: Queue;
  workerFunction: WorkerFunction<Job, Result>;
  logger?: ILogger;
  lockTime?: number;
  waitTimeout?: number;
  redisClientOptions: RedisClientOptions;
};
