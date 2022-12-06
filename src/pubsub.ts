import { PubSub } from "graphql-subscriptions";
import { Datapoint } from "@prisma/client";
import { TypedPubSub } from "typed-graphql-subscriptions";

// 1
export type PubSubChannels = {
  newDatapoint: [{ createdDatapoint: Datapoint }];
};

// 2
export const pubSub = new TypedPubSub<PubSubChannels>(new PubSub());
