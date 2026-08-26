import { defineField, defineType } from "sanity";
import { DEPLOYMENT_TYPE } from "../lib/constants";

export const deploymentSchema = defineType({
  name: DEPLOYMENT_TYPE,
  title: "Cloudflare Deployment",
  type: "document",
  fields: [
    defineField({
      name: "environment",
      title: "Environment",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Triggering", value: "triggering" },
          { title: "Triggered", value: "triggered" },
          { title: "Building", value: "building" },
          { title: "Success", value: "success" },
          { title: "Failure", value: "failure" },
          { title: "Canceled", value: "canceled" },
          { title: "Unknown", value: "unknown" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "trigger",
      title: "Trigger",
      type: "string",
      options: {
        list: [
          { title: "Manual", value: "manual" },
          { title: "Webhook", value: "webhook" },
        ],
      },
      initialValue: "manual",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startedAt",
      title: "Started At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "completedAt",
      title: "Completed At",
      type: "datetime",
    }),
    defineField({
      name: "triggeredBy",
      title: "Triggered By",
      type: "object",
      fields: [
        defineField({ name: "id", title: "User ID", type: "string" }),
        defineField({ name: "name", title: "Name", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({ name: "imageUrl", title: "Image URL", type: "url" }),
      ],
    }),
    defineField({
      name: "deploymentId",
      title: "Cloudflare Deployment ID",
      type: "string",
    }),
    defineField({
      name: "deploymentUrl",
      title: "Deployment URL",
      type: "url",
    }),
    defineField({
      name: "error",
      title: "Error Message",
      type: "text",
    }),
    defineField({
      name: "logs",
      title: "Deployment Logs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
            }),
            defineField({ name: "message", title: "Message", type: "string" }),
            defineField({ name: "type", title: "Type", type: "string" }),
          ],
        },
      ],
    }),
  ],
});
