import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext } from "./context";
import typeDefs from "./schema.graphql";
import { Datapoint, User } from "@prisma/client";
import { APP_SECRET } from "./auth";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { PubSubChannels } from "./pubsub";
import { argsToArgsConfig } from "graphql/type/definition";

const resolvers = {
  User: {
    datapoints: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).datapoints(),
  },
  Metadata: {
    datapoints: (parent: User, args: {}, context: GraphQLContext) =>
      context.prisma.user.findUnique({ where: { id: parent.id } }).datapoints(),
  },
  Query: {
    me: (parent: unknown, args: {}, context: GraphQLContext) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }

      return context.currentUser;
    },
    info: () => `This is the API of a Hackernews Clone`,
    timeseries: async (
      parent: unknown,
      args: { start?: string; end?: string; country?: string; type?: string },
      context: GraphQLContext
    ) => {
      const where =
        args.start && args.end
          ? {
              AND: [
                {
                  timestamp: {
                    gte: new Date(args.start),
                    lte: new Date(args.end),
                  },
                },
                { country: args.country },
                {metainfo: {type: args.type}}
              ],
            }
          : {};

      return context.prisma.datapoint.findMany({ where });
    },
    timeseriesc: async (
      parent: unknown,
      args: { country?: string; },
      context: GraphQLContext
    ) => {
      const where =
        args.country
          ? {
              AND: [
                { country: args.country },
              ],
            }
          : {};

      return context.prisma.datapoint.findMany({ where });
    },
  },
  Datapoint: {
    id: (parent: Datapoint) => parent.id,
    value: (parent: Datapoint) => parent.value,
    timestamp: (parent: Datapoint) => parent.timestamp,
    postedBy: async (parent: Datapoint, args: {}, context: GraphQLContext) => {
      if (!parent.postedById) {
        return null;
      }

      return context.prisma.datapoint
        .findUnique({ where: { id: parent.id } })
        .postedBy();
    },
    metainfo: async (parent: Datapoint, args: {}, context: GraphQLContext) => {
      if (!parent.metadataid) {
        return null;
      }

      return context.prisma.datapoint
        .findUnique({ where: { id: parent.id } })
        .metainfo();
    },
  },
  Mutation: {
    login: async (
      parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) => {
      // 1
      const user = await context.prisma.user.findUnique({
        where: { email: args.email },
      });
      if (!user) {
        throw new Error("No such user found");
      }

      // 2
      const valid = await compare(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = sign({ userId: user.id }, APP_SECRET);

      // 3
      return {
        token,
        user,
      };
    },
    signup: async (
      parent: unknown,
      args: { email: string; password: string; name: string },
      context: GraphQLContext
    ) => {
      // 1
      const password = await hash(args.password, 10);

      // 2
      const user = await context.prisma.user.create({
        data: { ...args, password },
      });

      // 3
      const token = sign({ userId: user.id }, APP_SECRET);

      // 4
      return {
        token,
        user,
      };
    },
    post: async (
      parent: unknown,
      args: { value: number; timestamp: string, country: string},
      context: GraphQLContext
    ) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }
      const newDatapoint = await context.prisma.datapoint.create({
        data: {
          value: args.value,
          timestamp: args.timestamp,
          postedBy: { connect: { id: context.currentUser.id } },
          country: args.country
        },
      });
      context.pubSub.publish("newDatapoint", {
        createdDatapoint: newDatapoint,
      });
      return newDatapoint;
    },
  },
  Subscription: {
    newDatapoint: {
      subscribe: (parent: unknown, args: {}, context: GraphQLContext) => {
        return context.pubSub.asyncIterator("newDatapoint");
      },
      resolve: (payload: PubSubChannels["newDatapoint"][0]) => {
        return payload.createdDatapoint;
      },
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
